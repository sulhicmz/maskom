import { ActivityLog, AlertRule, SuspiciousActivityAlert } from '@/types/audit';
import { ActivityAction } from '@/types/audit';
import {
    clearCache,
    getLogs,
    saveLogs,
    clearLogs,
    getAlertRules,
    saveAlertRules,
    getSuspiciousAlerts,
    saveSuspiciousAlerts,
    clearAlertRules,
    clearSuspiciousAlerts,
} from '../logStorage';

describe('logStorage', () => {
    beforeEach(() => {
        jest.clearAllMocks();
        clearCache();
        localStorage.clear();
    });

    describe('clearCache', () => {
        it('should clear the logs cache', () => {
            const mockLogs: ActivityLog[] = [
                {
                    id: '1',
                    userId: 'user1',
                    action: ActivityAction.LOGIN,
                    resource: 'auth',
                    details: {},
                    timestamp: '2024-01-21T10:00:00Z',
                    ipAddress: '127.0.0.1',
                    userAgent: 'test',
                    success: true,
                },
            ];

            saveLogs(mockLogs);
            getLogs();
            
            clearCache();
            
            const logsAfterCacheClear = getLogs();
            expect(logsAfterCacheClear).toEqual(mockLogs);
        });

        it('should allow fresh reads after cache clear', () => {
            const mockLogs: ActivityLog[] = [
                {
                    id: '1',
                    userId: 'user1',
                    action: ActivityAction.LOGIN,
                    resource: 'auth',
                    details: {},
                    timestamp: '2024-01-21T10:00:00Z',
                    ipAddress: '127.0.0.1',
                    userAgent: 'test',
                    success: true,
                },
            ];

            saveLogs(mockLogs);
            getLogs();
            
            localStorage.setItem('activity_logs', JSON.stringify([
                {
                    id: '2',
                    userId: 'user2',
                    action: ActivityAction.LOGOUT,
                    resource: 'auth',
                    details: {},
                    timestamp: '2024-01-21T11:00:00Z',
                    ipAddress: '127.0.0.2',
                    userAgent: 'test',
                    success: true,
                },
            ]));
            
            clearCache();
            const freshLogs = getLogs();
            
            expect(freshLogs).toHaveLength(1);
            expect(freshLogs[0].id).toBe('2');
        });
    });

    describe('getLogs', () => {
        it('should return empty array when window is undefined', () => {
            const originalWindow = global.window;
            delete (global as any).window;

            const logs = getLogs();

            expect(logs).toEqual([]);

            global.window = originalWindow;
        });

        it('should return empty array when no logs are stored', () => {
            const logs = getLogs();

            expect(logs).toEqual([]);
        });

        it('should return cached logs if cache exists', () => {
            const mockLogs: ActivityLog[] = [
                {
                    id: '1',
                    userId: 'user1',
                    action: ActivityAction.LOGIN,
                    resource: 'auth',
                    details: {},
                    timestamp: '2024-01-21T10:00:00Z',
                    ipAddress: '127.0.0.1',
                    userAgent: 'test',
                    success: true,
                },
            ];

            saveLogs(mockLogs);
            const logs1 = getLogs();
            
            localStorage.removeItem('activity_logs');
            const logs2 = getLogs();

            expect(logs2).toEqual(logs1);
        });

        it('should return logs from localStorage', () => {
            const mockLogs: ActivityLog[] = [
                {
                    id: '1',
                    userId: 'user1',
                    action: ActivityAction.LOGIN,
                    resource: 'auth',
                    details: {},
                    timestamp: '2024-01-21T10:00:00Z',
                    ipAddress: '127.0.0.1',
                    userAgent: 'test',
                    success: true,
                },
            ];

            localStorage.setItem('activity_logs', JSON.stringify(mockLogs));
            const logs = getLogs();

            expect(logs).toEqual(mockLogs);
        });

        it('should handle corrupted localStorage data gracefully', () => {
            localStorage.setItem('activity_logs', 'invalid json');
            const consoleErrorSpy = jest.spyOn(console, 'error').mockImplementation();

            const logs = getLogs();

            expect(logs).toEqual([]);
            expect(consoleErrorSpy).toHaveBeenCalledWith('Failed to retrieve activity logs:', expect.any(Error));

            consoleErrorSpy.mockRestore();
        });
    });

    describe('saveLogs', () => {
        it('should save logs to localStorage', () => {
            const mockLogs: ActivityLog[] = [
                {
                    id: '1',
                    userId: 'user1',
                    action: ActivityAction.LOGIN,
                    resource: 'auth',
                    details: {},
                    timestamp: '2024-01-21T10:00:00Z',
                    ipAddress: '127.0.0.1',
                    userAgent: 'test',
                    success: true,
                },
            ];

            saveLogs(mockLogs);

            const stored = localStorage.getItem('activity_logs');
            expect(stored).toBe(JSON.stringify(mockLogs));
        });

        it('should limit logs to MAX_LOGS (10000)', () => {
            const logs: ActivityLog[] = [];
            for (let i = 1; i <= 10001; i++) {
                logs.push({
                    id: String(i),
                    userId: 'user1',
                    action: ActivityAction.LOGIN,
                    resource: 'auth',
                    details: {},
                    timestamp: '2024-01-21T10:00:00Z',
                    ipAddress: '127.0.0.1',
                    userAgent: 'test',
                    success: true,
                });
            }

            saveLogs(logs);

            const stored = JSON.parse(localStorage.getItem('activity_logs') || '[]') as ActivityLog[];
            expect(stored).toHaveLength(10000);
            expect(stored[0].id).toBe('1');
            expect(stored[9999].id).toBe('10000');
        });

        it('should update cache when saving logs', () => {
            const mockLogs: ActivityLog[] = [
                {
                    id: '1',
                    userId: 'user1',
                    action: ActivityAction.LOGIN,
                    resource: 'auth',
                    details: {},
                    timestamp: '2024-01-21T10:00:00Z',
                    ipAddress: '127.0.0.1',
                    userAgent: 'test',
                    success: true,
                },
            ];

            saveLogs(mockLogs);
            const logsFromCache = getLogs();

            expect(logsFromCache).toEqual(mockLogs);
        });

        it('should handle localStorage errors gracefully', () => {
            const mockLogs: ActivityLog[] = [
                {
                    id: '1',
                    userId: 'user1',
                    action: ActivityAction.LOGIN,
                    resource: 'auth',
                    details: {},
                    timestamp: '2024-01-21T10:00:00Z',
                    ipAddress: '127.0.0.1',
                    userAgent: 'test',
                    success: true,
                },
            ];

            const localStorageSetSpy = jest.spyOn(Storage.prototype, 'setItem').mockImplementation(() => {
                throw new Error('Quota exceeded');
            });
            const consoleErrorSpy = jest.spyOn(console, 'error').mockImplementation();

            saveLogs(mockLogs);

            expect(consoleErrorSpy).toHaveBeenCalledWith('Failed to save activity logs:', expect.any(Error));

            localStorageSetSpy.mockRestore();
            consoleErrorSpy.mockRestore();
        });

        it('should save empty logs array', () => {
            saveLogs([]);

            const stored = localStorage.getItem('activity_logs');
            expect(stored).toBe('[]');
        });
    });

    describe('clearLogs', () => {
        it('should clear all logs and return count', () => {
            const mockLogs: ActivityLog[] = [
                {
                    id: '1',
                    userId: 'user1',
                    action: ActivityAction.LOGIN,
                    resource: 'auth',
                    details: {},
                    timestamp: '2024-01-21T10:00:00Z',
                    ipAddress: '127.0.0.1',
                    userAgent: 'test',
                    success: true,
                },
                {
                    id: '2',
                    userId: 'user1',
                    action: ActivityAction.LOGOUT,
                    resource: 'auth',
                    details: {},
                    timestamp: '2024-01-21T11:00:00Z',
                    ipAddress: '127.0.0.1',
                    userAgent: 'test',
                    success: true,
                },
            ];

            saveLogs(mockLogs);
            const count = clearLogs();

            expect(count).toBe(2);
            expect(getLogs()).toHaveLength(0);
            expect(localStorage.getItem('activity_logs')).toBe('[]');
        });

        it('should clear logs before a specific date and return deleted count', () => {
            const mockLogs: ActivityLog[] = [
                {
                    id: '1',
                    userId: 'user1',
                    action: ActivityAction.LOGIN,
                    resource: 'auth',
                    details: {},
                    timestamp: '2024-01-20T10:00:00Z',
                    ipAddress: '127.0.0.1',
                    userAgent: 'test',
                    success: true,
                },
                {
                    id: '2',
                    userId: 'user1',
                    action: ActivityAction.LOGOUT,
                    resource: 'auth',
                    details: {},
                    timestamp: '2024-01-21T10:00:00Z',
                    ipAddress: '127.0.0.1',
                    userAgent: 'test',
                    success: true,
                },
            ];

            saveLogs(mockLogs);
            const beforeDate = new Date('2024-01-21T00:00:00Z');
            const count = clearLogs(beforeDate);

            expect(count).toBe(1);
            const remainingLogs = getLogs();
            expect(remainingLogs).toHaveLength(1);
            expect(remainingLogs[0].id).toBe('2');
        });

        it('should return 0 when clearing empty logs', () => {
            const count = clearLogs();

            expect(count).toBe(0);
        });

        it('should handle localStorage errors gracefully when clearing', () => {
            const mockLogs: ActivityLog[] = [
                {
                    id: '1',
                    userId: 'user1',
                    action: ActivityAction.LOGIN,
                    resource: 'auth',
                    details: {},
                    timestamp: '2024-01-21T10:00:00Z',
                    ipAddress: '127.0.0.1',
                    userAgent: 'test',
                    success: true,
                },
            ];

            saveLogs(mockLogs);

            const localStorageSetSpy = jest.spyOn(Storage.prototype, 'setItem').mockImplementation(() => {
                throw new Error('Quota exceeded');
            });
            const consoleErrorSpy = jest.spyOn(console, 'error').mockImplementation();

            const count = clearLogs();

            expect(count).toBe(0);
            expect(consoleErrorSpy).toHaveBeenCalledWith('Failed to clear activity logs:', expect.any(Error));

            localStorageSetSpy.mockRestore();
            consoleErrorSpy.mockRestore();
        });
    });

    describe('getAlertRules', () => {
        it('should return empty array when window is undefined', () => {
            const originalWindow = global.window;
            delete (global as any).window;

            const rules = getAlertRules();

            expect(rules).toEqual([]);

            global.window = originalWindow;
        });

        it('should return empty array when no rules are stored', () => {
            const rules = getAlertRules();

            expect(rules).toEqual([]);
        });

        it('should return alert rules from localStorage', () => {
            const mockRules: AlertRule[] = [
                {
                    id: '1',
                    name: 'Rule 1',
                    description: 'Test rule',
                    action: ActivityAction.LOGIN,
                    threshold: 5,
                    timeWindow: 60,
                    enabled: true,
                },
            ];

            localStorage.setItem('alert_rules', JSON.stringify(mockRules));
            const rules = getAlertRules();

            expect(rules).toEqual(mockRules);
        });

        it('should handle corrupted localStorage data gracefully', () => {
            localStorage.setItem('alert_rules', 'invalid json');
            const consoleErrorSpy = jest.spyOn(console, 'error').mockImplementation();

            const rules = getAlertRules();

            expect(rules).toEqual([]);
            expect(consoleErrorSpy).toHaveBeenCalledWith('Failed to retrieve alert rules:', expect.any(Error));

            consoleErrorSpy.mockRestore();
        });
    });

    describe('saveAlertRules', () => {
        it('should save alert rules to localStorage', () => {
            const mockRules: AlertRule[] = [
                {
                    id: '1',
                    name: 'Rule 1',
                    description: 'Test rule',
                    action: ActivityAction.LOGIN,
                    threshold: 5,
                    timeWindow: 60,
                    enabled: true,
                },
            ];

            saveAlertRules(mockRules);

            const stored = localStorage.getItem('alert_rules');
            expect(stored).toBe(JSON.stringify(mockRules));
        });

        it('should save empty alert rules array', () => {
            saveAlertRules([]);

            const stored = localStorage.getItem('alert_rules');
            expect(stored).toBe('[]');
        });

        it('should handle localStorage errors gracefully', () => {
            const mockRules: AlertRule[] = [
                {
                    id: '1',
                    name: 'Rule 1',
                    description: 'Test rule',
                    action: ActivityAction.LOGIN,
                    threshold: 5,
                    timeWindow: 60,
                    enabled: true,
                },
            ];

            const localStorageSetSpy = jest.spyOn(Storage.prototype, 'setItem').mockImplementation(() => {
                throw new Error('Quota exceeded');
            });
            const consoleErrorSpy = jest.spyOn(console, 'error').mockImplementation();

            saveAlertRules(mockRules);

            expect(consoleErrorSpy).toHaveBeenCalledWith('Failed to save alert rules:', expect.any(Error));

            localStorageSetSpy.mockRestore();
            consoleErrorSpy.mockRestore();
        });
    });

    describe('getSuspiciousAlerts', () => {
        it('should return empty array when window is undefined', () => {
            const originalWindow = global.window;
            delete (global as any).window;

            const alerts = getSuspiciousAlerts();

            expect(alerts).toEqual([]);

            global.window = originalWindow;
        });

        it('should return empty array when no alerts are stored', () => {
            const alerts = getSuspiciousAlerts();

            expect(alerts).toEqual([]);
        });

        it('should return suspicious alerts from localStorage', () => {
            const mockAlerts: SuspiciousActivityAlert[] = [
                {
                    id: '1',
                    ruleId: 'rule1',
                    ruleName: 'Test Rule',
                    triggeredAt: '2024-01-21T10:00:00Z',
                    userId: 'user1',
                    action: ActivityAction.LOGIN,
                    count: 10,
                    threshold: 5,
                    timeWindow: 60,
                    activities: [],
                    resolved: false,
                },
            ];

            localStorage.setItem('suspicious_alerts', JSON.stringify(mockAlerts));
            const alerts = getSuspiciousAlerts();

            expect(alerts).toEqual(mockAlerts);
        });

        it('should handle corrupted localStorage data gracefully', () => {
            localStorage.setItem('suspicious_alerts', 'invalid json');
            const consoleErrorSpy = jest.spyOn(console, 'error').mockImplementation();

            const alerts = getSuspiciousAlerts();

            expect(alerts).toEqual([]);
            expect(consoleErrorSpy).toHaveBeenCalledWith('Failed to retrieve suspicious alerts:', expect.any(Error));

            consoleErrorSpy.mockRestore();
        });
    });

    describe('saveSuspiciousAlerts', () => {
        it('should save suspicious alerts to localStorage', () => {
            const mockAlerts: SuspiciousActivityAlert[] = [
                {
                    id: '1',
                    ruleId: 'rule1',
                    ruleName: 'Test Rule',
                    triggeredAt: '2024-01-21T10:00:00Z',
                    userId: 'user1',
                    action: ActivityAction.LOGIN,
                    count: 10,
                    threshold: 5,
                    timeWindow: 60,
                    activities: [],
                    resolved: false,
                },
            ];

            saveSuspiciousAlerts(mockAlerts);

            const stored = localStorage.getItem('suspicious_alerts');
            expect(stored).toBe(JSON.stringify(mockAlerts));
        });

        it('should save empty suspicious alerts array', () => {
            saveSuspiciousAlerts([]);

            const stored = localStorage.getItem('suspicious_alerts');
            expect(stored).toBe('[]');
        });

        it('should handle localStorage errors gracefully', () => {
            const mockAlerts: SuspiciousActivityAlert[] = [
                {
                    id: '1',
                    ruleId: 'rule1',
                    ruleName: 'Test Rule',
                    triggeredAt: '2024-01-21T10:00:00Z',
                    userId: 'user1',
                    action: ActivityAction.LOGIN,
                    count: 10,
                    threshold: 5,
                    timeWindow: 60,
                    activities: [],
                    resolved: false,
                },
            ];

            const localStorageSetSpy = jest.spyOn(Storage.prototype, 'setItem').mockImplementation(() => {
                throw new Error('Quota exceeded');
            });
            const consoleErrorSpy = jest.spyOn(console, 'error').mockImplementation();

            saveSuspiciousAlerts(mockAlerts);

            expect(consoleErrorSpy).toHaveBeenCalledWith('Failed to save suspicious alerts:', expect.any(Error));

            localStorageSetSpy.mockRestore();
            consoleErrorSpy.mockRestore();
        });
    });

    describe('clearAlertRules', () => {
        it('should clear alert rules from localStorage', () => {
            const mockRules: AlertRule[] = [
                {
                    id: '1',
                    name: 'Rule 1',
                    description: 'Test rule',
                    action: ActivityAction.LOGIN,
                    threshold: 5,
                    timeWindow: 60,
                    enabled: true,
                },
            ];

            saveAlertRules(mockRules);
            clearAlertRules();

            expect(localStorage.getItem('alert_rules')).toBeNull();
            expect(getAlertRules()).toEqual([]);
        });

        it('should handle localStorage errors gracefully', () => {
            const localStorageRemoveSpy = jest.spyOn(Storage.prototype, 'removeItem').mockImplementation(() => {
                throw new Error('Storage error');
            });
            const consoleErrorSpy = jest.spyOn(console, 'error').mockImplementation();

            clearAlertRules();

            expect(consoleErrorSpy).toHaveBeenCalledWith('Failed to clear alert rules:', expect.any(Error));

            localStorageRemoveSpy.mockRestore();
            consoleErrorSpy.mockRestore();
        });
    });

    describe('clearSuspiciousAlerts', () => {
        it('should clear suspicious alerts from localStorage', () => {
            const mockAlerts: SuspiciousActivityAlert[] = [
                {
                    id: '1',
                    ruleId: 'rule1',
                    ruleName: 'Test Rule',
                    triggeredAt: '2024-01-21T10:00:00Z',
                    userId: 'user1',
                    action: ActivityAction.LOGIN,
                    count: 10,
                    threshold: 5,
                    timeWindow: 60,
                    activities: [],
                    resolved: false,
                },
            ];

            saveSuspiciousAlerts(mockAlerts);
            clearSuspiciousAlerts();

            expect(localStorage.getItem('suspicious_alerts')).toBeNull();
            expect(getSuspiciousAlerts()).toEqual([]);
        });

        it('should handle localStorage errors gracefully', () => {
            const localStorageRemoveSpy = jest.spyOn(Storage.prototype, 'removeItem').mockImplementation(() => {
                throw new Error('Storage error');
            });
            const consoleErrorSpy = jest.spyOn(console, 'error').mockImplementation();

            clearSuspiciousAlerts();

            expect(consoleErrorSpy).toHaveBeenCalledWith('Failed to clear suspicious alerts:', expect.any(Error));

            localStorageRemoveSpy.mockRestore();
            consoleErrorSpy.mockRestore();
        });
    });
});
