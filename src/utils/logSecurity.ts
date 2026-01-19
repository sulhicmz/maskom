import { ActivityLog, AlertRule, SuspiciousActivityAlert } from '@/types/audit';
import { getLogs, getSuspiciousAlerts, saveSuspiciousAlerts, getAlertRules } from './logStorage';

export const checkForSuspiciousActivity = (log: ActivityLog): void => {
    const alertRules = getAlertRules();

    for (const rule of alertRules) {
        if (rule.action === log.action && rule.enabled) {
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

export const saveAlertRule = (rule: Omit<AlertRule, 'id'>): AlertRule => {
    const existingRules = getAlertRules();
    const newRule: AlertRule = {
        ...rule,
        id: `RULE-${Date.now()}-${Math.random().toString(36).substring(2, 9)}`,
    };

    const updatedRules = [...existingRules, newRule];
    saveAlertRules(updatedRules);

    return newRule;
};

export const updateAlertRule = (ruleId: string, updates: Partial<AlertRule>): AlertRule | null => {
    const existingRules = getAlertRules();
    const ruleIndex = existingRules.findIndex(rule => rule.id === ruleId);

    if (ruleIndex === -1) return null;

    const updatedRules = [...existingRules];
    updatedRules[ruleIndex] = { ...updatedRules[ruleIndex], ...updates };

    saveAlertRules(updatedRules);

    return updatedRules[ruleIndex];
};

export const deleteAlertRule = (ruleId: string): boolean => {
    const existingRules = getAlertRules();
    const filteredRules = existingRules.filter((rule: AlertRule) => rule.id !== ruleId);

    if (filteredRules.length === existingRules.length) return false;

    saveAlertRules(filteredRules);
    return true;
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
    saveSuspiciousAlerts(updatedAlerts);

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

    saveSuspiciousAlerts(updatedAlerts);
    return true;
};
