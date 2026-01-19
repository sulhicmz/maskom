import { ActivityLog, ActivityAction, ActivityLogFilter, ActivityStatistics, AlertRule, SuspiciousActivityAlert, ActivityDetails } from '@/types/audit';

const LOG_STORAGE_KEY = 'activity_logs';
const ALERT_RULES_STORAGE_KEY = 'alert_rules';
const ALERT_STORAGE_KEY = 'suspicious_alerts';
const MAX_LOGS = 10000;

let logsCache: ActivityLog[] | null = null;

export const generateLogId = (): string => {
    return `LOG-${Date.now()}-${Math.random().toString(36).substring(2, 9)}`;
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

    logsCache = updatedLogs;

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

    if (filter.action) {
        logs = logs.filter(log => log.action === filter.action);
    }

    if (filter.resource) {
        logs = logs.filter(log => log.resource === filter.resource);
    }

    if (filter.success !== undefined) {
        logs = logs.filter(log => log.success === filter.success);
    }

    if (filter.startDate) {
        logs = logs.filter(log => new Date(log.timestamp) >= new Date(filter.startDate));
    }

    if (filter.endDate) {
        logs = logs.filter(log => new Date(log.timestamp) <= new Date(filter.endDate));
    }

    return logs;
};

export const getLogsByUser = (userId: string): ActivityLog[] => {
    return getLogs().filter(log => log.userId === userId);
};

export const getLogsByAction = (action: ActivityAction): ActivityLog[] => {
    return getLogs().filter(log => log.action === action);
};

export const getLogsByDateRange = (startDate: Date, endDate: Date): ActivityLog[] => {
    return getLogs().filter(
        log => new Date(log.timestamp) >= startDate && new Date(log.timestamp) <= endDate
    );
};

export const calculateActivityStatistics = (): ActivityStatistics => {
    const logs = getLogs();
    const now = new Date();
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const yesterday = new Date(today.getTime() - 86400000);
    const last7Days = new Date(now.getTime() - 604800000);
    const last30Days = new Date(now.getTime() - 2592000000);

    return {
        totalLogs: logs.length,
        successfulLogs: logs.filter(log => log.success).length,
        failedLogs: logs.filter(log => !log.success).length,
        todayActivity: logs.filter(log => new Date(log.timestamp) >= today).length,
        last24hActivity: logs.filter(log => new Date(log.timestamp) >= yesterday).length,
        last7DaysActivity: logs.filter(log => new Date(log.timestamp) >= last7Days).length,
        last30DaysActivity: logs.filter(log => new Date(log.timestamp) >= last30Days).length,
        logsByAction: logs.reduce<Record<ActivityAction, number>>((acc, log) => {
            acc[log.action] = (acc[log.action] || 0) + 1;
            return acc;
        }, {} as Record<ActivityAction, number>),
        logsByUser: logs.reduce<Record<string, number>>((acc, log) => {
            acc[log.userId] = (acc[log.userId] || 0) + 1;
            return acc;
        }, {}),
        logsByResource: logs.reduce<Record<string, number>>((acc, log) => {
            acc[log.resource] = (acc[log.resource] || 0) + 1;
            return acc;
        }, {}),
    };
};

export const exportLogsToCSV = (logs: ActivityLog[]): string => {
    const headers = ['ID', 'User ID', 'Action', 'Resource', 'Resource ID', 'Details', 'Timestamp', 'IP Address', 'Success', 'Error Message'];
    const rows = logs.map(log => [
        log.id,
        log.userId,
        log.action,
        log.resource,
        log.resourceId || '',
        JSON.stringify(log.details),
        log.timestamp,
        log.ipAddress,
        log.success ? 'Yes' : 'No',
        log.errorMessage || '',
    ]);

    return [headers, ...rows].map(row => row.join(',')).join('\n');
};

export const exportLogsToJSON = (logs: ActivityLog[]): string => {
    return JSON.stringify(logs, null, 2);
};

export const downloadLogs = (logs: ActivityLog[], format: 'csv' | 'json', filename: string): void => {
    const content = format === 'csv' ? exportLogsToCSV(logs) : exportLogsToJSON(logs);
    const blob = new Blob([content], { type: format === 'csv' ? 'text/csv' : 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${filename}.${format}`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
};

export const clearLogs = (beforeDate?: Date): number => {
    if (beforeDate) {
        let logs = getLogs();

        logs = logs.filter(log => new Date(log.timestamp) >= beforeDate);

        logsCache = logs;

        try {
            localStorage.setItem(LOG_STORAGE_KEY, JSON.stringify(logs));
            return logs.length;
        } catch (error) {
            console.error('Failed to clear activity logs:', error);
            return 0;
        }
    }

    logsCache = [];

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

export const saveAlertRule = (rule: AlertRule): void => {
    try {
        const rules = getAlertRules();
        const index = rules.findIndex(r => r.id === rule.id);

        if (index >= 0) {
            rules[index] = rule;
        } else {
            rules.push(rule);
        }

        localStorage.setItem(ALERT_RULES_STORAGE_KEY, JSON.stringify(rules));
    } catch (error) {
        console.error('Failed to save alert rule:', error);
    }
};

export const updateAlertRule = (rule: AlertRule): void => {
    saveAlertRule(rule);
};

export const deleteAlertRule = (ruleId: string): void => {
    try {
        const rules = getAlertRules();
        const filtered = rules.filter(r => r.id !== ruleId);

        localStorage.setItem(ALERT_RULES_STORAGE_KEY, JSON.stringify(filtered));
    } catch (error) {
        console.error('Failed to delete alert rule:', error);
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

export const saveSuspiciousAlerts = (alerts: SuspiciousActivityAlert[]): void => {
    try {
        localStorage.setItem(ALERT_STORAGE_KEY, JSON.stringify(alerts));
    } catch (error) {
        console.error('Failed to save suspicious alerts:', error);
    }
};

const checkForSuspiciousActivity = (log: ActivityLog): void => {
    const alertRules = getAlertRules();

    for (const rule of alertRules) {
        if (rule.action === log.action && rule.enabled) {
            const timeWindow = rule.timeWindow * 60000;
            const cutoffTime = new Date(new Date(log.timestamp).getTime() - timeWindow);

            const recentLogs = getLogsByDateRange(cutoffTime, new Date(log.timestamp));
            const matchingLogs = recentLogs.filter(
                recentLog =>
                    recentLog.userId === log.userId &&
                    recentLog.action === log.action
            );

            if (matchingLogs.length >= rule.threshold) {
                const alert: SuspiciousActivityAlert = {
                    id: `ALERT-${Date.now()}`,
                    ruleId: rule.id,
                    logId: log.id,
                    userId: log.userId,
                    action: log.action,
                    detectionTime: new Date().toISOString(),
                    description: `${rule.description} - ${matchingLogs.length} occurrences detected in ${rule.timeWindow} minutes`,
                };

                const alerts = getSuspiciousAlerts();
                alerts.push(alert);
                saveSuspiciousAlerts(alerts);
            }
        }
    }
};

export const resolveAlert = (alertId: string): void => {
    try {
        const alerts = getSuspiciousAlerts();
        const updated = alerts.filter(alert => alert.id !== alertId);

        localStorage.setItem(ALERT_STORAGE_KEY, JSON.stringify(updated));
    } catch (error) {
        console.error('Failed to resolve alert:', error);
    }
};
