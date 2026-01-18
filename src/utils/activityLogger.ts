import { ActivityLog, ActivityAction, ActivityLogFilter, ActivityStatistics, AlertRule, SuspiciousActivityAlert, ActivityDetails } from '@/types/audit';

const LOG_STORAGE_KEY = 'activity_logs';
const ALERT_RULES_STORAGE_KEY = 'alert_rules';
const ALERT_STORAGE_KEY = 'suspicious_alerts';
const MAX_LOGS = 10000;
const CACHE_VERSION_KEY = 'activity_logs_version';

let logsCache: ActivityLog[] | null = null;
let localCacheVersion = 0;

export const generateLogId = (): string => {
    return `LOG-${Date.now()}-${Math.random().toString(36).substring(2, 9)}`;
};

export const initializeCacheVersion = (): void => {
    if (typeof window !== 'undefined') {
        const version = localStorage.getItem(CACHE_VERSION_KEY);
        if (!version) {
            localStorage.setItem(CACHE_VERSION_KEY, '0');
        }
        localCacheVersion = parseInt(version || '0');
    }
};

export const getClientIP = (): string => {
    return '192.168.1.100';
};

export const getUserAgent = (): string => {
    if (typeof window !== 'undefined') {
        return navigator.userAgent;
    }
    return 'Unknown';
};

export const logActivity = (
    userId: string,
    action: ActivityAction,
    resource: string,
    resourceId?: string,
    details: ActivityDetails = {},
    success: boolean = true,
    errorMessage?: string
): ActivityLog => {
    const log: ActivityLog = {
        id: generateLogId(),
        userId,
        action,
        resource,
        resourceId,
        details,
        timestamp: new Date().toISOString(),
        ipAddress: getClientIP(),
        userAgent: getUserAgent(),
        success,
        errorMessage,
    };

    const existingLogs = getLogs();
    const updatedLogs = [log, ...existingLogs].slice(0, MAX_LOGS);

    localCacheVersion++
    logsCache = updatedLogs;
    localCacheVersion++;

    try {
        localStorage.setItem(LOG_STORAGE_KEY, JSON.stringify(updatedLogs));
    } catch (error) {
        console.error('Failed to save activity log:', error);
    }

    checkForSuspiciousActivity(log);

    return log;
};

export const getLogs = (): ActivityLog[] => {
    if (typeof window === 'undefined') return [];

    if (logsCache !== null) {
        return logsCache;
    }

    try {
        const stored = localStorage.getItem(LOG_STORAGE_KEY);
        if (stored) {
            const parsed = JSON.parse(stored);
            localCacheVersion++
            logsCache = parsed as ActivityLog[];
            return logsCache;
        }
    } catch (error) {
        console.error('Failed to retrieve activity logs:', error);
    }

    return [];
};

export const filterLogs = (filter: ActivityLogFilter): ActivityLog[] => {
    let logs = getLogs();

    if (filter.userId) {
        logs = logs.filter(log => log.userId === filter.userId);
    }

    if (filter.action && filter.action.length > 0) {
        logs = logs.filter(log => filter.action!.includes(log.action));
    }

    if (filter.resource) {
        logs = logs.filter(log => log.resource === filter.resource);
    }

    if (filter.resourceId) {
        logs = logs.filter(log => log.resourceId === filter.resourceId);
    }

    if (filter.startDate) {
        logs = logs.filter(log => new Date(log.timestamp) >= new Date(filter.startDate!));
    }

    if (filter.endDate) {
        logs = logs.filter(log => new Date(log.timestamp) <= new Date(filter.endDate!));
    }

    if (typeof filter.success !== 'undefined') {
        logs = logs.filter(log => log.success === filter.success);
    }

    logs.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());

    const offset = filter.offset || 0;
    const limit = filter.limit || logs.length;
    logs = logs.slice(offset, offset + limit);

    return logs;
};

export const getLogsByUser = (userId: string): ActivityLog[] => {
    return filterLogs({ userId });
};

export const getLogsByAction = (action: ActivityAction): ActivityLog[] => {
    return filterLogs({ action: [action] });
};

export const getLogsByDateRange = (startDate: string, endDate: string): ActivityLog[] => {
    return filterLogs({ startDate, endDate });
};

export const calculateActivityStatistics = (): ActivityStatistics => {
    const logs = getLogs();
    const now = new Date();
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const yesterday = new Date(today.getTime() - 86400000);
    const last7Days = new Date(now.getTime() - 604800000);
    const last30Days = new Date(now.getTime() - 2592000000);

    const todayActivity = logs.filter(log => new Date(log.timestamp) >= today).length;
    const last24hActivity = logs.filter(log => new Date(log.timestamp) >= yesterday).length;
    const last7DaysActivity = logs.filter(log => new Date(log.timestamp) >= last7Days).length;
    const last30DaysActivity = logs.filter(log => new Date(log.timestamp) >= last30Days).length;

    const successfulLogs = logs.filter(log => log.success).length;
    const failedLogs = logs.filter(log => !log.success).length;

    const logsByAction = Object.values(ActivityAction).reduce<Record<ActivityAction, number>>((acc, action) => {
        acc[action] = logs.filter(log => log.action === action).length;
        return acc;
    }, {} as Record<ActivityAction, number>);

    const logsByUser: Record<string, number> = {};
    logs.forEach(log => {
        logsByUser[log.userId] = (logsByUser[log.userId] || 0) + 1;
    });

    const logsByResource: Record<string, number> = {};
    logs.forEach(log => {
        logsByResource[log.resource] = (logsByResource[log.resource] || 0) + 1;
    });

    const recentActivity = logs.slice(0, 10);

    return {
        totalLogs: logs.length,
        successfulLogs,
        failedLogs,
        logsByAction,
        logsByUser,
        logsByResource,
        recentActivity,
        todayActivity,
        last24hActivity,
        last7DaysActivity,
        last30DaysActivity,
    };
};

export const exportLogsToCSV = (logs: ActivityLog[]): string => {
    if (logs.length === 0) return '';

    const headers = ['ID', 'User ID', 'Action', 'Resource', 'Resource ID', 'Details', 'Timestamp', 'IP Address', 'User Agent', 'Success', 'Error Message'];
    const rows = logs.map(log => [
        log.id,
        log.userId,
        log.action,
        log.resource,
        log.resourceId || '',
        JSON.stringify(log.details),
        log.timestamp,
        log.ipAddress,
        log.userAgent,
        log.success,
        log.errorMessage || '',
    ]);

    const csvContent = [
        headers.join(','),
        ...rows.map(row => row.map(cell => `"${String(cell).replace(/"/g, '""')}"`).join(',')),
    ].join('\n');

    return csvContent;
};

export const exportLogsToJSON = (logs: ActivityLog[]): string => {
    return JSON.stringify(logs, null, 2);
};

export const downloadLogs = (logs: ActivityLog[], format: 'csv' | 'json', filename: string = 'activity_logs') => {
    let content: string;
    let mimeType: string;
    let extension: string;

    if (format === 'csv') {
        content = exportLogsToCSV(logs);
        mimeType = 'text/csv';
        extension = 'csv';
    } else {
        content = exportLogsToJSON(logs);
        mimeType = 'application/json';
        extension = 'json';
    }

    const blob = new Blob([content], { type: mimeType });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `${filename}.${extension}`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
};

export const clearLogs = (beforeDate?: Date): number => {
    if (beforeDate) {
        let logs = getLogs();

        logs = logs.filter(log => new Date(log.timestamp) >= beforeDate);

        logsCache = logs;
        localCacheVersion++;

        try {
            localStorage.setItem(LOG_STORAGE_KEY, JSON.stringify(logs));
            return logs.length;
        } catch (error) {
            console.error('Failed to clear activity logs:', error);
            return 0;
        }
    }

    logsCache = [];
    localCacheVersion++;

    try {
        localStorage.setItem(LOG_STORAGE_KEY, '[]');
        return 0;
    } catch (error) {
        console.error('Failed to clear activity logs:', error);
        return 0;
    }
};

export const getAlertRules = (): AlertRule[] => {
    if (typeof window === 'undefined') return [];

    try {
        const stored = localStorage.getItem(ALERT_RULES_STORAGE_KEY);
        if (stored) {
            return JSON.parse(stored) as AlertRule[];
        }
    } catch (error) {
        console.error('Failed to retrieve alert rules:', error);
    }

    return [];
};

export const saveAlertRule = (rule: Omit<AlertRule, 'id'>): AlertRule => {
    const existingRules = getAlertRules();
    const newRule: AlertRule = {
        ...rule,
        id: `RULE-${Date.now()}-${Math.random().toString(36).substring(2, 9)}`,
    };

    const updatedRules = [...existingRules, newRule];

    try {
        localStorage.setItem(ALERT_RULES_STORAGE_KEY, JSON.stringify(updatedRules));
    } catch (error) {
        console.error('Failed to save alert rule:', error);
    }

    return newRule;
};

export const updateAlertRule = (ruleId: string, updates: Partial<AlertRule>): AlertRule | null => {
    const existingRules = getAlertRules();
    const ruleIndex = existingRules.findIndex(rule => rule.id === ruleId);

    if (ruleIndex === -1) return null;

    const updatedRules = [...existingRules];
    updatedRules[ruleIndex] = { ...updatedRules[ruleIndex], ...updates };

    try {
        localStorage.setItem(ALERT_RULES_STORAGE_KEY, JSON.stringify(updatedRules));
        return updatedRules[ruleIndex];
    } catch (error) {
        console.error('Failed to update alert rule:', error);
        return null;
    }
};

export const deleteAlertRule = (ruleId: string): boolean => {
    const existingRules = getAlertRules();
    const filteredRules = existingRules.filter(rule => rule.id !== ruleId);

    if (filteredRules.length === existingRules.length) return false;

    try {
        localStorage.setItem(ALERT_RULES_STORAGE_KEY, JSON.stringify(filteredRules));
        return true;
    } catch (error) {
        console.error('Failed to delete alert rule:', error);
        return false;
    }
};

export const getSuspiciousAlerts = (): SuspiciousActivityAlert[] => {
    if (typeof window === 'undefined') return [];

    try {
        const stored = localStorage.getItem(ALERT_STORAGE_KEY);
        if (stored) {
            return JSON.parse(stored) as SuspiciousActivityAlert[];
        }
    } catch (error) {
        console.error('Failed to retrieve suspicious alerts:', error);
    }

    return [];
};

export const checkForSuspiciousActivity = (log: ActivityLog): void => {
    const alertRules = getAlertRules().filter(rule => rule.enabled);

    for (const rule of alertRules) {
        if (rule.action === log.action) {
            const timeWindow = rule.timeWindow * 60000;
            const cutoffTime = new Date(new Date(log.timestamp).getTime() - timeWindow);
            const recentLogs = getLogs().filter(
                l => l.action === log.action && l.userId === log.userId && new Date(l.timestamp) >= cutoffTime
            );

            if (recentLogs.length >= rule.threshold) {
                createSuspiciousAlert(rule, log, recentLogs);
            }
        }
    }
};

const createSuspiciousAlert = (
    rule: AlertRule,
    triggeringLog: ActivityLog,
    relatedLogs: ActivityLog[]
): SuspiciousActivityAlert => {
    const existingAlerts = getSuspiciousAlerts();

    const alert: SuspiciousActivityAlert = {
        id: `ALERT-${Date.now()}-${Math.random().toString(36).substring(2, 9)}`,
        ruleId: rule.id,
        ruleName: rule.name,
        triggeredAt: new Date().toISOString(),
        userId: triggeringLog.userId,
        action: triggeringLog.action,
        count: relatedLogs.length,
        threshold: rule.threshold,
        activities: relatedLogs,
        resolved: false,
    };

    const updatedAlerts = [alert, ...existingAlerts];

    try {
        localStorage.setItem(ALERT_STORAGE_KEY, JSON.stringify(updatedAlerts));
    } catch (error) {
        console.error('Failed to save suspicious alert:', error);
    }

    return alert;
};

export const resolveAlert = (alertId: string, resolvedBy: string): boolean => {
    const existingAlerts = getSuspiciousAlerts();
    const alertIndex = existingAlerts.findIndex(alert => alert.id === alertId);

    if (alertIndex === -1) return false;

    const updatedAlerts = [...existingAlerts];
    updatedAlerts[alertIndex] = {
        ...updatedAlerts[alertIndex],
        resolved: true,
        resolvedAt: new Date().toISOString(),
        resolvedBy,
    };

    try {
        localStorage.setItem(ALERT_STORAGE_KEY, JSON.stringify(updatedAlerts));
        return true;
    } catch (error) {
        console.error('Failed to resolve alert:', error);
        return false;
    }
};
