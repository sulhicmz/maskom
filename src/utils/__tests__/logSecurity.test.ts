import {
    checkForSuspiciousActivity,
    saveAlertRule,
    updateAlertRule,
    deleteAlertRule,
    resolveAlert
} from '../logSecurity';
import { ActivityLog, ActivityAction, AlertRule, SuspiciousActivityAlert } from '@/types/audit';
import { getLogs, getAlertRules, saveAlertRules, getSuspiciousAlerts, saveSuspiciousAlerts } from '../logStorage';

// Mock logStorage dependencies
jest.mock('../logStorage', () => ({
    getLogs: jest.fn(),
    getAlertRules: jest.fn(),
    saveAlertRules: jest.fn(),
    getSuspiciousAlerts: jest.fn(),
    saveSuspiciousAlerts: jest.fn(),
}));

describe('logSecurity', () => {
    const mockAlertRule: AlertRule = {
        id: 'RULE-123',
        name: 'Multiple Failed Logins',
        description: 'Detects multiple failed login attempts',
        action: ActivityAction.LOGIN,
        threshold: 5,
        timeWindow: 10,
        enabled: true
    };

    const mockLog: ActivityLog = {
        id: 'log-1',
        userId: 'user-123',
        action: ActivityAction.LOGIN,
        resource: 'auth',
        details: {},
        timestamp: new Date('2024-01-20T12:00:00Z').toISOString(),
        ipAddress: '192.168.1.1',
        userAgent: 'Mozilla/5.0',
        success: true
    };

    beforeEach(() => {
        jest.clearAllMocks();
        jest.useFakeTimers().setSystemTime(new Date('2024-01-20T12:00:00Z'));
    });

    afterEach(() => {
        jest.useRealTimers();
    });

    describe('checkForSuspiciousActivity', () => {
        it('should create alert when threshold is exceeded', () => {
            const recentLogs: ActivityLog[] = Array(5).fill(mockLog);
            (getAlertRules as jest.Mock).mockReturnValue([mockAlertRule]);
            (getLogs as jest.Mock).mockReturnValue(recentLogs);
            (getSuspiciousAlerts as jest.Mock).mockReturnValue([]);
            (saveSuspiciousAlerts as jest.Mock).mockImplementation();

            checkForSuspiciousActivity(mockLog);

            expect(saveSuspiciousAlerts).toHaveBeenCalledWith(
                expect.arrayContaining([
                    expect.objectContaining({
                        ruleId: mockAlertRule.id,
                        ruleName: mockAlertRule.name,
                        userId: mockLog.userId,
                        action: mockLog.action,
                        count: 5,
                        threshold: mockAlertRule.threshold,
                        timeWindow: mockAlertRule.timeWindow,
                        resolved: false
                    })
                ])
            );
        });

        it('should not create alert when threshold is not exceeded', () => {
            const recentLogs: ActivityLog[] = Array(3).fill(mockLog);
            (getAlertRules as jest.Mock).mockReturnValue([mockAlertRule]);
            (getLogs as jest.Mock).mockReturnValue(recentLogs);
            (getSuspiciousAlerts as jest.Mock).mockReturnValue([]);
            (saveSuspiciousAlerts as jest.Mock).mockImplementation();

            checkForSuspiciousActivity(mockLog);

            expect(saveSuspiciousAlerts).not.toHaveBeenCalled();
        });

        it('should not create alert for disabled rules', () => {
            const disabledRule: AlertRule = { ...mockAlertRule, enabled: false };
            const recentLogs: ActivityLog[] = Array(5).fill(mockLog);
            (getAlertRules as jest.Mock).mockReturnValue([disabledRule]);
            (getLogs as jest.Mock).mockReturnValue(recentLogs);

            checkForSuspiciousActivity(mockLog);

            expect(saveSuspiciousAlerts).not.toHaveBeenCalled();
        });

        it('should not create alert when rule action does not match log action', () => {
            const passwordRule: AlertRule = {
                ...mockAlertRule,
                action: ActivityAction.PASSWORD_CHANGE
            };
            const recentLogs: ActivityLog[] = Array(5).fill(mockLog);
            (getAlertRules as jest.Mock).mockReturnValue([passwordRule]);
            (getLogs as jest.Mock).mockReturnValue(recentLogs);

            checkForSuspiciousActivity(mockLog);

            expect(saveSuspiciousAlerts).not.toHaveBeenCalled();
        });

        it('should filter logs by action and user ID', () => {
            const passwordChangeLog: ActivityLog = {
                ...mockLog,
                id: 'log-2',
                action: ActivityAction.PASSWORD_CHANGE
            };
            const otherUserLog: ActivityLog = {
                ...mockLog,
                id: 'log-3',
                userId: 'user-456'
            };
            const recentLogs: ActivityLog[] = Array(5).fill(mockLog);
            (getAlertRules as jest.Mock).mockReturnValue([mockAlertRule]);
            (getLogs as jest.Mock).mockReturnValue([...recentLogs, passwordChangeLog, otherUserLog]);
            (getSuspiciousAlerts as jest.Mock).mockReturnValue([]);
            (saveSuspiciousAlerts as jest.Mock).mockImplementation();

            checkForSuspiciousActivity(mockLog);

            const alertCall = (saveSuspiciousAlerts as jest.Mock).mock.calls[0][0];
            const alert = alertCall[0];
            expect(alert.activities).toHaveLength(5);
            expect(alert.activities.every((log: ActivityLog) => 
                log.action === mockAlertRule.action && log.userId === mockLog.userId
            )).toBe(true);
        });

        it('should filter logs within time window', () => {
            const oldLog: ActivityLog = {
                ...mockLog,
                timestamp: new Date('2024-01-20T11:45:00Z').toISOString()
            };
            const recentLogs: ActivityLog[] = [...Array(5).fill(mockLog), oldLog];
            (getAlertRules as jest.Mock).mockReturnValue([mockAlertRule]);
            (getLogs as jest.Mock).mockReturnValue(recentLogs);
            (getSuspiciousAlerts as jest.Mock).mockReturnValue([]);
            (saveSuspiciousAlerts as jest.Mock).mockImplementation();

            checkForSuspiciousActivity(mockLog);

            const alertCall = (saveSuspiciousAlerts as jest.Mock).mock.calls[0][0];
            const alert = alertCall[0];
            expect(alert.activities).toHaveLength(5);
            expect(alert.activities).not.toContainEqual(oldLog);
        });

        it('should handle empty logs array', () => {
            (getAlertRules as jest.Mock).mockReturnValue([mockAlertRule]);
            (getLogs as jest.Mock).mockReturnValue([]);

            expect(() => checkForSuspiciousActivity(mockLog)).not.toThrow();
        });

        it('should handle empty alert rules array', () => {
            (getAlertRules as jest.Mock).mockReturnValue([]);

            expect(() => checkForSuspiciousActivity(mockLog)).not.toThrow();
        });

        it('should generate unique alert IDs', () => {
            const recentLogs: ActivityLog[] = Array(5).fill(mockLog);
            (getAlertRules as jest.Mock).mockReturnValue([mockAlertRule]);
            (getLogs as jest.Mock).mockReturnValue(recentLogs);
            (getSuspiciousAlerts as jest.Mock).mockReturnValue([]);
            (saveSuspiciousAlerts as jest.Mock).mockImplementation();

            checkForSuspiciousActivity(mockLog);
            checkForSuspiciousActivity(mockLog);

            const alerts = (saveSuspiciousAlerts as jest.Mock).mock.calls.map(
                call => call[0][0]
            );
            expect(alerts[0].id).not.toBe(alerts[1].id);
            expect(alerts[0].id).toMatch(/^ALERT-\d+-[a-z0-9]{7}$/);
        });
    });

    describe('saveAlertRule', () => {
        it('should save alert rule with generated ID', () => {
            const ruleWithoutId: Omit<AlertRule, 'id'> = {
                name: 'Test Rule',
                description: 'Test Description',
                action: ActivityAction.LOGIN,
                threshold: 10,
                timeWindow: 15,
                enabled: true
            };
            (getAlertRules as jest.Mock).mockReturnValue([]);
            (saveAlertRules as jest.Mock).mockImplementation();

            const savedRule = saveAlertRule(ruleWithoutId);

            expect(saveAlertRules).toHaveBeenCalledWith(
                expect.arrayContaining([
                    expect.objectContaining({
                        id: expect.stringMatching(/^RULE-\d+-[a-z0-9]{7}$/),
                        ...ruleWithoutId
                    })
                ])
            );
            expect(savedRule.id).toBeDefined();
            expect(savedRule.id).toMatch(/^RULE-\d+-[a-z0-9]{7}$/);
        });

        it('should add rule to existing rules', () => {
            const ruleWithoutId: Omit<AlertRule, 'id'> = {
                name: 'New Rule',
                description: 'New Description',
                action: ActivityAction.PASSWORD_CHANGE,
                threshold: 3,
                timeWindow: 5,
                enabled: true
            };
            (getAlertRules as jest.Mock).mockReturnValue([mockAlertRule]);
            (saveAlertRules as jest.Mock).mockImplementation();

            saveAlertRule(ruleWithoutId);

            const savedRules = (saveAlertRules as jest.Mock).mock.calls[0][0];
            expect(savedRules).toHaveLength(2);
            expect(savedRules[0]).toEqual(mockAlertRule);
            expect(savedRules[1].name).toBe('New Rule');
        });

        it('should generate unique rule IDs', () => {
            const ruleWithoutId: Omit<AlertRule, 'id'> = {
                name: 'Test Rule',
                description: 'Test Description',
                action: ActivityAction.LOGIN,
                threshold: 10,
                timeWindow: 15,
                enabled: true
            };
            (getAlertRules as jest.Mock).mockReturnValue([]);
            (saveAlertRules as jest.Mock).mockImplementation();

            const rule1 = saveAlertRule(ruleWithoutId);
            const rule2 = saveAlertRule(ruleWithoutId);

            expect(rule1.id).not.toBe(rule2.id);
        });

        it('should handle all alert rule fields', () => {
            const ruleWithoutId: Omit<AlertRule, 'id'> = {
                name: 'Complete Rule',
                description: 'Complete Description',
                action: ActivityAction.ROLE_CHANGE,
                threshold: 5,
                timeWindow: 30,
                enabled: false,
                alertEmail: 'admin@example.com'
            };
            (getAlertRules as jest.Mock).mockReturnValue([]);
            (saveAlertRules as jest.Mock).mockImplementation();

            const savedRule = saveAlertRule(ruleWithoutId);

            expect(savedRule.alertEmail).toBe('admin@example.com');
        });
    });

    describe('updateAlertRule', () => {
        it('should update existing alert rule', () => {
            const updates = {
                name: 'Updated Rule Name',
                threshold: 20,
                enabled: false
            };
            (getAlertRules as jest.Mock).mockReturnValue([mockAlertRule]);
            (saveAlertRules as jest.Mock).mockImplementation();

            const updatedRule = updateAlertRule(mockAlertRule.id, updates);

            expect(updatedRule).toEqual({
                ...mockAlertRule,
                ...updates
            });
            expect(saveAlertRules).toHaveBeenCalledWith(
                expect.arrayContaining([
                    expect.objectContaining(updates)
                ])
            );
        });

        it('should return null when rule not found', () => {
            const updates = { name: 'Updated Name' };
            (getAlertRules as jest.Mock).mockReturnValue([mockAlertRule]);

            const result = updateAlertRule('non-existent-id', updates);

            expect(result).toBeNull();
            expect(saveAlertRules).not.toHaveBeenCalled();
        });

        it('should handle partial updates', () => {
            const updates = { threshold: 15 };
            (getAlertRules as jest.Mock).mockReturnValue([mockAlertRule]);
            (saveAlertRules as jest.Mock).mockImplementation();

            const updatedRule = updateAlertRule(mockAlertRule.id, updates);

            expect(updatedRule?.threshold).toBe(15);
            expect(updatedRule?.name).toBe(mockAlertRule.name);
        });

        it('should handle multiple rules', () => {
            const rule2: AlertRule = {
                ...mockAlertRule,
                id: 'RULE-456',
                name: 'Second Rule'
            };
            const updates = { enabled: false };
            (getAlertRules as jest.Mock).mockReturnValue([mockAlertRule, rule2]);
            (saveAlertRules as jest.Mock).mockImplementation();

            updateAlertRule(mockAlertRule.id, updates);

            const savedRules = (saveAlertRules as jest.Mock).mock.calls[0][0];
            expect(savedRules[0].enabled).toBe(false);
            expect(savedRules[1].enabled).toBe(true);
        });
    });

    describe('deleteAlertRule', () => {
        it('should delete existing alert rule', () => {
            (getAlertRules as jest.Mock).mockReturnValue([mockAlertRule]);
            (saveAlertRules as jest.Mock).mockImplementation();

            const result = deleteAlertRule(mockAlertRule.id);

            expect(result).toBe(true);
            expect(saveAlertRules).toHaveBeenCalledWith([]);
        });

        it('should return false when rule not found', () => {
            (getAlertRules as jest.Mock).mockReturnValue([mockAlertRule]);

            const result = deleteAlertRule('non-existent-id');

            expect(result).toBe(false);
            expect(saveAlertRules).not.toHaveBeenCalled();
        });

        it('should keep other rules when deleting one', () => {
            const rule2: AlertRule = {
                ...mockAlertRule,
                id: 'RULE-456'
            };
            (getAlertRules as jest.Mock).mockReturnValue([mockAlertRule, rule2]);
            (saveAlertRules as jest.Mock).mockImplementation();

            deleteAlertRule(mockAlertRule.id);

            const savedRules = (saveAlertRules as jest.Mock).mock.calls[0][0];
            expect(savedRules).toHaveLength(1);
            expect(savedRules[0].id).toBe('RULE-456');
        });

        it('should handle empty rules array', () => {
            (getAlertRules as jest.Mock).mockReturnValue([]);

            const result = deleteAlertRule(mockAlertRule.id);

            expect(result).toBe(false);
        });
    });

    describe('resolveAlert', () => {
        const mockAlert: SuspiciousActivityAlert = {
            id: 'ALERT-123',
            ruleId: 'RULE-123',
            ruleName: 'Test Rule',
            triggeredAt: new Date('2024-01-20T12:00:00Z').toISOString(),
            userId: 'user-123',
            action: ActivityAction.LOGIN,
            count: 5,
            threshold: 5,
            timeWindow: 10,
            activities: [mockLog],
            resolved: false
        };

        it('should mark alert as resolved', () => {
            const resolvedBy = 'admin-user';
            (getSuspiciousAlerts as jest.Mock).mockReturnValue([mockAlert]);
            (saveSuspiciousAlerts as jest.Mock).mockImplementation();

            const result = resolveAlert(mockAlert.id, resolvedBy);

            expect(result).toBe(true);
            expect(saveSuspiciousAlerts).toHaveBeenCalledWith(
                expect.arrayContaining([
                    expect.objectContaining({
                        id: mockAlert.id,
                        resolved: true,
                        resolvedBy: resolvedBy,
                        resolvedAt: new Date('2024-01-20T12:00:00Z').toISOString()
                    })
                ])
            );
        });

        it('should return false when alert not found', () => {
            const resolvedBy = 'admin-user';
            (getSuspiciousAlerts as jest.Mock).mockReturnValue([mockAlert]);

            const result = resolveAlert('non-existent-id', resolvedBy);

            expect(result).toBe(false);
            expect(saveSuspiciousAlerts).not.toHaveBeenCalled();
        });

        it('should preserve original alert fields', () => {
            const resolvedBy = 'admin-user';
            (getSuspiciousAlerts as jest.Mock).mockReturnValue([mockAlert]);
            (saveSuspiciousAlerts as jest.Mock).mockImplementation();

            resolveAlert(mockAlert.id, resolvedBy);

            const savedAlerts = (saveSuspiciousAlerts as jest.Mock).mock.calls[0][0];
            const resolvedAlert = savedAlerts[0];
            expect(resolvedAlert.ruleId).toBe(mockAlert.ruleId);
            expect(resolvedAlert.ruleName).toBe(mockAlert.ruleName);
            expect(resolvedAlert.userId).toBe(mockAlert.userId);
            expect(resolvedAlert.action).toBe(mockAlert.action);
            expect(resolvedAlert.count).toBe(mockAlert.count);
        });

        it('should handle multiple alerts', () => {
            const alert2: SuspiciousActivityAlert = {
                ...mockAlert,
                id: 'ALERT-456'
            };
            const resolvedBy = 'admin-user';
            (getSuspiciousAlerts as jest.Mock).mockReturnValue([mockAlert, alert2]);
            (saveSuspiciousAlerts as jest.Mock).mockImplementation();

            resolveAlert(mockAlert.id, resolvedBy);

            const savedAlerts = (saveSuspiciousAlerts as jest.Mock).mock.calls[0][0];
            expect(savedAlerts[0].resolved).toBe(true);
            expect(savedAlerts[1].resolved).toBe(false);
        });

        it('should handle empty alerts array', () => {
            (getSuspiciousAlerts as jest.Mock).mockReturnValue([]);

            const result = resolveAlert('non-existent-id', 'admin-user');

            expect(result).toBe(false);
        });
    });
});
