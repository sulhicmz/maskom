import { ActivityLog, ActivityAction, ActivityLogFilter, ActivityDetails } from '@/types/audit';
import {
    getLogs,
    saveLogs,
    clearLogs as clearLogsStorage,
    getAlertRules,
    getSuspiciousAlerts,
    clearCache
} from './logStorage';
import {
    saveAlertRule,
    updateAlertRule,
    deleteAlertRule,
    checkForSuspiciousActivity,
    resolveAlert as resolveAlertSecurity
} from './logSecurity';
import { calculateActivityStatistics } from './logStatistics';
import { exportLogsToCSV, exportLogsToJSON, downloadLogs as downloadLogsExporter } from './logExporter';

const MAX_LOGS = 10000;

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

    saveLogs(updatedLogs);

    checkForSuspiciousActivity(log);

    return log;
};

export const filterLogs = (filter: ActivityLogFilter): ActivityLog[] => {
    let logs = getLogs();

    if (filter.userId) {
        logs = logs.filter(log => log.userId === filter.userId);
    }

    if (filter.resource) {
        logs = logs.filter(log => log.resource === filter.resource);
    }

    if (filter.resourceId) {
        logs = logs.filter(log => log.resourceId === filter.resourceId);
    }

    if (filter.action && filter.action.length > 0) {
        logs = logs.filter(log => filter.action!.includes(log.action));
    }

    if (filter.success !== undefined) {
        logs = logs.filter(log => log.success === filter.success);
    }

    if (filter.startDate !== undefined) {
        logs = logs.filter(log => new Date(log.timestamp) >= new Date(filter.startDate!));
    }

    if (filter.endDate !== undefined) {
        logs = logs.filter(log => new Date(log.timestamp) <= new Date(filter.endDate!));
    }

    if (filter.limit) {
        logs = logs.slice(0, filter.limit);
    }

    if (filter.offset) {
        logs = logs.slice(filter.offset);
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

export const resolveAlert = (alertId: string, resolvedBy?: string): boolean => {
    return resolveAlertSecurity(alertId, resolvedBy || 'system');
};

export {
    saveLogs,
    saveAlertRule,
    updateAlertRule,
    deleteAlertRule,
    calculateActivityStatistics,
    exportLogsToCSV,
    exportLogsToJSON,
    downloadLogsExporter as downloadLogs,
    clearLogsStorage as clearLogs,
    getLogs,
    getAlertRules,
    getSuspiciousAlerts,
    checkForSuspiciousActivity,
    clearCache,
};
