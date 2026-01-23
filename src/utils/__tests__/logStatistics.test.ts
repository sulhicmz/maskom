import { ActivityAction, ActivityLog } from '@/types/audit';
import { calculateActivityStatistics } from '../logStatistics';
import { saveLogs, clearCache } from '../logStorage';

describe('logStatistics', () => {
    beforeEach(() => {
        jest.clearAllMocks();
        localStorage.clear();
        clearCache();
    });

    const createMockLog = (overrides: Partial<ActivityLog> = {}): ActivityLog => ({
        id: '1',
        userId: 'user1',
        action: ActivityAction.LOGIN,
        resource: 'auth',
        details: {},
        timestamp: '2024-01-21T10:00:00Z',
        ipAddress: '127.0.0.1',
        userAgent: 'test',
        success: true,
        ...overrides,
    });

    describe('calculateActivityStatistics', () => {
        it('should return zero statistics when no logs exist', () => {
            const stats = calculateActivityStatistics();

            expect(stats.totalLogs).toBe(0);
            expect(stats.successfulLogs).toBe(0);
            expect(stats.failedLogs).toBe(0);
            expect(stats.todayActivity).toBe(0);
            expect(stats.last24hActivity).toBe(0);
            expect(stats.last7DaysActivity).toBe(0);
            expect(stats.last30DaysActivity).toBe(0);
            expect(stats.recentActivity).toEqual([]);
            expect(stats.logsByUser).toEqual({});
            expect(stats.logsByResource).toEqual({});

            Object.values(ActivityAction).forEach(action => {
                expect(stats.logsByAction[action]).toBe(0);
            });
        });

        it('should count total logs correctly', () => {
            const now = new Date();
            const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());

            const logs = [
                createMockLog({
                    id: '1',
                    timestamp: new Date(today.getTime() + 3600000).toISOString(),
                }),
                createMockLog({
                    id: '2',
                    timestamp: new Date(today.getTime() + 7200000).toISOString(),
                }),
                createMockLog({
                    id: '3',
                    timestamp: new Date(today.getTime() + 10800000).toISOString(),
                }),
            ];

            saveLogs(logs);
            const stats = calculateActivityStatistics();

            expect(stats.totalLogs).toBe(3);
        });

        it('should count successful and failed logs correctly', () => {
            const now = new Date();
            const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());

            const logs = [
                createMockLog({
                    id: '1',
                    success: true,
                    timestamp: new Date(today.getTime() + 3600000).toISOString(),
                }),
                createMockLog({
                    id: '2',
                    success: false,
                    timestamp: new Date(today.getTime() + 7200000).toISOString(),
                }),
                createMockLog({
                    id: '3',
                    success: true,
                    timestamp: new Date(today.getTime() + 10800000).toISOString(),
                }),
            ];

            saveLogs(logs);
            const stats = calculateActivityStatistics();

            expect(stats.successfulLogs).toBe(2);
            expect(stats.failedLogs).toBe(1);
        });

        it('should group logs by action correctly', () => {
            const now = new Date();
            const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());

            const logs = [
                createMockLog({
                    id: '1',
                    action: ActivityAction.LOGIN,
                    timestamp: new Date(today.getTime() + 3600000).toISOString(),
                }),
                createMockLog({
                    id: '2',
                    action: ActivityAction.LOGIN,
                    timestamp: new Date(today.getTime() + 7200000).toISOString(),
                }),
                createMockLog({
                    id: '3',
                    action: ActivityAction.LOGOUT,
                    timestamp: new Date(today.getTime() + 10800000).toISOString(),
                }),
            ];

            saveLogs(logs);
            const stats = calculateActivityStatistics();

            expect(stats.logsByAction[ActivityAction.LOGIN]).toBe(2);
            expect(stats.logsByAction[ActivityAction.LOGOUT]).toBe(1);
        });

        it('should group logs by user correctly', () => {
            const now = new Date();
            const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());

            const logs = [
                createMockLog({
                    id: '1',
                    userId: 'user1',
                    timestamp: new Date(today.getTime() + 3600000).toISOString(),
                }),
                createMockLog({
                    id: '2',
                    userId: 'user1',
                    timestamp: new Date(today.getTime() + 7200000).toISOString(),
                }),
                createMockLog({
                    id: '3',
                    userId: 'user2',
                    timestamp: new Date(today.getTime() + 10800000).toISOString(),
                }),
            ];

            saveLogs(logs);
            const stats = calculateActivityStatistics();

            expect(stats.logsByUser['user1']).toBe(2);
            expect(stats.logsByUser['user2']).toBe(1);
        });

        it('should group logs by resource correctly', () => {
            const now = new Date();
            const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());

            const logs = [
                createMockLog({
                    id: '1',
                    resource: 'auth',
                    timestamp: new Date(today.getTime() + 3600000).toISOString(),
                }),
                createMockLog({
                    id: '2',
                    resource: 'auth',
                    timestamp: new Date(today.getTime() + 7200000).toISOString(),
                }),
                createMockLog({
                    id: '3',
                    resource: 'content',
                    timestamp: new Date(today.getTime() + 10800000).toISOString(),
                }),
            ];

            saveLogs(logs);
            const stats = calculateActivityStatistics();

            expect(stats.logsByResource['auth']).toBe(2);
            expect(stats.logsByResource['content']).toBe(1);
        });

        it('should return recent activity (last 10 logs)', () => {
            const now = new Date();
            const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());

            const logs: ActivityLog[] = [];
            for (let i = 1; i <= 15; i++) {
                logs.push(
                    createMockLog({
                        id: String(i),
                        timestamp: new Date(today.getTime() + i * 3600000).toISOString(),
                    })
                );
            }

            saveLogs(logs);
            const stats = calculateActivityStatistics();

            expect(stats.recentActivity).toHaveLength(10);
            expect(stats.recentActivity[0].id).toBe('1');
            expect(stats.recentActivity[9].id).toBe('10');
        });

        it('should calculate today activity correctly', () => {
            const now = new Date();
            const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());

            const logs = [
                createMockLog({
                    id: '1',
                    timestamp: new Date(today.getTime() + 3600000).toISOString(),
                }),
                createMockLog({
                    id: '2',
                    timestamp: new Date(today.getTime() + 7200000).toISOString(),
                }),
                createMockLog({
                    id: '3',
                    timestamp: new Date(today.getTime() + 10800000).toISOString(),
                }),
            ];

            saveLogs(logs);
            const stats = calculateActivityStatistics();

            expect(stats.todayActivity).toBe(3);
        });

        it('should exclude logs before today from today activity', () => {
            const now = new Date();
            const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
            const yesterday = new Date(today.getTime() - 86400000);

            const logs = [
                createMockLog({
                    id: '1',
                    timestamp: new Date(today.getTime() + 3600000).toISOString(),
                }),
                createMockLog({
                    id: '2',
                    timestamp: yesterday.toISOString(),
                }),
            ];

            saveLogs(logs);
            const stats = calculateActivityStatistics();

            expect(stats.todayActivity).toBe(1);
        });

        it('should calculate last 24h activity correctly', () => {
            const now = new Date();
            const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
            const yesterday = new Date(today.getTime() - 86400000);

            const logs = [
                createMockLog({
                    id: '1',
                    timestamp: now.toISOString(),
                }),
                createMockLog({
                    id: '2',
                    timestamp: yesterday.toISOString(),
                }),
                createMockLog({
                    id: '3',
                    timestamp: new Date(yesterday.getTime() - 3600000).toISOString(),
                }),
            ];

            saveLogs(logs);
            const stats = calculateActivityStatistics();

            expect(stats.last24hActivity).toBe(2);
        });

        it('should calculate last 7 days activity correctly', () => {
            const now = new Date();
            const sixDaysAgo = new Date(now.getTime() - 518400000);
            const eightDaysAgo = new Date(now.getTime() - 691200000);

            const logs = [
                createMockLog({
                    id: '1',
                    timestamp: now.toISOString(),
                }),
                createMockLog({
                    id: '2',
                    timestamp: sixDaysAgo.toISOString(),
                }),
                createMockLog({
                    id: '3',
                    timestamp: eightDaysAgo.toISOString(),
                }),
            ];

            saveLogs(logs);
            const stats = calculateActivityStatistics();

            expect(stats.last7DaysActivity).toBe(2);
        });

        it('should calculate last 30 days activity correctly', () => {
            const now = new Date();
            const twentyNineDaysAgo = new Date(now.getTime() - 2505600000);
            const thirtyOneDaysAgo = new Date(now.getTime() - 2678400000);

            const logs = [
                createMockLog({
                    id: '1',
                    timestamp: now.toISOString(),
                }),
                createMockLog({
                    id: '2',
                    timestamp: twentyNineDaysAgo.toISOString(),
                }),
                createMockLog({
                    id: '3',
                    timestamp: thirtyOneDaysAgo.toISOString(),
                }),
            ];

            saveLogs(logs);
            const stats = calculateActivityStatistics();

            expect(stats.last30DaysActivity).toBe(2);
        });

        it('should handle logs with various ActivityAction types', () => {
            const now = new Date();
            const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());

            const logs = [
                createMockLog({
                    id: '1',
                    action: ActivityAction.LOGIN,
                    timestamp: new Date(today.getTime() + 3600000).toISOString(),
                }),
                createMockLog({
                    id: '2',
                    action: ActivityAction.LOGOUT,
                    timestamp: new Date(today.getTime() + 7200000).toISOString(),
                }),
                createMockLog({
                    id: '3',
                    action: ActivityAction.PASSWORD_CHANGE,
                    timestamp: new Date(today.getTime() + 10800000).toISOString(),
                }),
                createMockLog({
                    id: '4',
                    action: ActivityAction.MFA_ENABLED,
                    timestamp: new Date(today.getTime() + 14400000).toISOString(),
                }),
            ];

            saveLogs(logs);
            const stats = calculateActivityStatistics();

            expect(stats.logsByAction[ActivityAction.LOGIN]).toBe(1);
            expect(stats.logsByAction[ActivityAction.LOGOUT]).toBe(1);
            expect(stats.logsByAction[ActivityAction.PASSWORD_CHANGE]).toBe(1);
            expect(stats.logsByAction[ActivityAction.MFA_ENABLED]).toBe(1);
        });

        it('should handle empty logsByAction for actions with no logs', () => {
            const now = new Date();
            const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());

            const logs = [
                createMockLog({
                    id: '1',
                    action: ActivityAction.LOGIN,
                    timestamp: new Date(today.getTime() + 3600000).toISOString(),
                }),
            ];

            saveLogs(logs);
            const stats = calculateActivityStatistics();

            expect(stats.logsByAction[ActivityAction.LOGIN]).toBe(1);
            expect(stats.logsByAction[ActivityAction.LOGOUT]).toBe(0);
        });

        it('should handle multiple logs from the same user', () => {
            const now = new Date();
            const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());

            const logs = [
                createMockLog({
                    id: '1',
                    userId: 'user1',
                    timestamp: new Date(today.getTime() + 3600000).toISOString(),
                }),
                createMockLog({
                    id: '2',
                    userId: 'user1',
                    timestamp: new Date(today.getTime() + 7200000).toISOString(),
                }),
                createMockLog({
                    id: '3',
                    userId: 'user1',
                    timestamp: new Date(today.getTime() + 10800000).toISOString(),
                }),
            ];

            saveLogs(logs);
            const stats = calculateActivityStatistics();

            expect(stats.logsByUser['user1']).toBe(3);
        });

        it('should handle logs from different resources', () => {
            const now = new Date();
            const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());

            const logs = [
                createMockLog({
                    id: '1',
                    resource: 'auth',
                    timestamp: new Date(today.getTime() + 3600000).toISOString(),
                }),
                createMockLog({
                    id: '2',
                    resource: 'content',
                    timestamp: new Date(today.getTime() + 7200000).toISOString(),
                }),
                createMockLog({
                    id: '3',
                    resource: 'settings',
                    timestamp: new Date(today.getTime() + 10800000).toISOString(),
                }),
            ];

            saveLogs(logs);
            const stats = calculateActivityStatistics();

            expect(stats.logsByResource['auth']).toBe(1);
            expect(stats.logsByResource['content']).toBe(1);
            expect(stats.logsByResource['settings']).toBe(1);
        });

        it('should handle recent activity with less than 10 logs', () => {
            const now = new Date();
            const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());

            const logs = [
                createMockLog({
                    id: '1',
                    timestamp: new Date(today.getTime() + 3600000).toISOString(),
                }),
                createMockLog({
                    id: '2',
                    timestamp: new Date(today.getTime() + 7200000).toISOString(),
                }),
            ];

            saveLogs(logs);
            const stats = calculateActivityStatistics();

            expect(stats.recentActivity).toHaveLength(2);
            expect(stats.recentActivity[0].id).toBe('1');
            expect(stats.recentActivity[1].id).toBe('2');
        });

        it('should handle logs with different success statuses', () => {
            const now = new Date();
            const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());

            const logs = [
                createMockLog({
                    id: '1',
                    success: true,
                    timestamp: new Date(today.getTime() + 3600000).toISOString(),
                }),
                createMockLog({
                    id: '2',
                    success: false,
                    errorMessage: 'Invalid password',
                    timestamp: new Date(today.getTime() + 7200000).toISOString(),
                }),
                createMockLog({
                    id: '3',
                    success: false,
                    errorMessage: 'Account locked',
                    timestamp: new Date(today.getTime() + 10800000).toISOString(),
                }),
            ];

            saveLogs(logs);
            const stats = calculateActivityStatistics();

            expect(stats.successfulLogs).toBe(1);
            expect(stats.failedLogs).toBe(2);
        });

        it('should return correct ActivityStatistics type', () => {
            const stats = calculateActivityStatistics();

            expect(stats).toHaveProperty('totalLogs');
            expect(stats).toHaveProperty('successfulLogs');
            expect(stats).toHaveProperty('failedLogs');
            expect(stats).toHaveProperty('logsByAction');
            expect(stats).toHaveProperty('logsByUser');
            expect(stats).toHaveProperty('logsByResource');
            expect(stats).toHaveProperty('recentActivity');
            expect(stats).toHaveProperty('todayActivity');
            expect(stats).toHaveProperty('last24hActivity');
            expect(stats).toHaveProperty('last7DaysActivity');
            expect(stats).toHaveProperty('last30DaysActivity');
        });
    });
});
