import { ActivityLog, AlertRule, SuspiciousActivityAlert } from '@/types/audit';

const LOG_STORAGE_KEY = 'activity_logs';
const ALERT_RULES_STORAGE_KEY = 'alert_rules';
const ALERT_STORAGE_KEY = 'suspicious_alerts';
const MAX_LOGS = 10000;

let logsCache: ActivityLog[] | null = null;

export const clearCache = (): void => {
    logsCache = null;
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

export const saveLogs = (logs: ActivityLog[]): void => {
    const updatedLogs = logs.slice(0, MAX_LOGS);

    logsCache = updatedLogs;

    try {
        localStorage.setItem(LOG_STORAGE_KEY, JSON.stringify(updatedLogs));
    } catch (error) {
        console.error('Failed to save activity logs:', error);
    }
};

export const clearLogs = (beforeDate?: Date): number => {
    if (beforeDate) {
        let logs = getLogs();

        logs = logs.filter(log => new Date(log.timestamp) >= beforeDate);

        saveLogs(logs);

        return logs.length;
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

export const saveAlertRules = (rules: AlertRule[]): void => {
    try {
        localStorage.setItem(ALERT_RULES_STORAGE_KEY, JSON.stringify(rules));
    } catch (error) {
        console.error('Failed to save alert rules:', error);
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
}
