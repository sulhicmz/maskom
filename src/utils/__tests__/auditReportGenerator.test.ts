import { 
    generateAuditReportId, 
    generatePermissionAuditReport, 
    mapLogToPermissionChange, 
    calculateDiffFields, 
    calculateAuditSummary, 
    detectSuspiciousChanges,
    exportAuditReportToCSV,
    exportAuditReportToJSON,
    generatePermissionDiff
} from '../auditReportGenerator';
import { ActivityLog, ActivityAction } from '@/types/audit';
import { filterLogs } from '@/utils/activityLogger';

// Mock filterLogs from activityLogger
jest.mock('@/utils/activityLogger', () => ({
    filterLogs: jest.fn(),
}));

describe('auditReportGenerator', () => {
    const mockLog: ActivityLog = {
        id: 'log-1',
        userId: 'user-123',
        action: ActivityAction.ROLE_CHANGE,
        resource: 'user',
        resourceId: 'user-456',
        details: {
            beforeValues: { role: 'user', permissions: ['read'] },
            afterValues: { role: 'admin', permissions: ['read', 'write'] },
            changeReason: 'Promotion to admin role',
            approvedBy: 'admin-user'
        },
        timestamp: '2024-01-15T10:30:00Z',
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

    describe('generateAuditReportId', () => {
        it('should generate unique audit report IDs', () => {
            const id1 = generateAuditReportId();
            const id2 = generateAuditReportId();

            expect(id1).toMatch(/^AUDIT-\d+-[a-z0-9]{7}$/);
            expect(id2).toMatch(/^AUDIT-\d+-[a-z0-9]{7}$/);
            expect(id1).not.toBe(id2);
        });

        it('should include timestamp in generated ID', () => {
            const id = generateAuditReportId();
            const timestamp = id.match(/AUDIT-(\d+)/)?.[1];

            expect(parseInt(timestamp!)).toBeGreaterThan(0);
        });

        it('should include random alphanumeric suffix', () => {
            const id = generateAuditReportId();
            const suffix = id.match(/AUDIT-\d+-([a-z0-9]{7})$/)?.[1];

            expect(suffix).toBeDefined();
            expect(suffix!.length).toBe(7);
        });
    });

    describe('calculateDiffFields', () => {
        it('should return empty array when values are identical', () => {
            const before = { role: 'user', permissions: ['read'] };
            const after = { role: 'user', permissions: ['read'] };

            const result = calculateDiffFields(before, after);

            expect(result).toEqual([]);
        });

        it('should detect single field change', () => {
            const before = { role: 'user', permissions: ['read'] };
            const after = { role: 'admin', permissions: ['read'] };

            const result = calculateDiffFields(before, after);

            expect(result).toEqual(['role']);
        });

        it('should detect multiple field changes', () => {
            const before = { role: 'user', permissions: ['read'], status: 'active' };
            const after = { role: 'admin', permissions: ['read', 'write'], status: 'inactive' };

            const result = calculateDiffFields(before, after);

            expect(result).toEqual(['role', 'permissions', 'status']);
        });

        it('should detect added fields', () => {
            const before = { role: 'user' };
            const after = { role: 'user', department: 'Engineering' };

            const result = calculateDiffFields(before, after);

            expect(result).toContain('department');
        });

        it('should detect removed fields', () => {
            const before = { role: 'user', department: 'Engineering' };
            const after = { role: 'user' };

            const result = calculateDiffFields(before, after);

            expect(result).toContain('department');
        });

        it('should handle empty objects', () => {
            const before = {};
            const after = {};

            const result = calculateDiffFields(before, after);

            expect(result).toEqual([]);
        });

        it('should handle null values', () => {
            const before = { role: null };
            const after = { role: 'user' };

            const result = calculateDiffFields(before, after);

            expect(result).toContain('role');
        });

        it('should handle undefined values', () => {
            const before = { role: undefined };
            const after = { role: 'user' };

            const result = calculateDiffFields(before, after);

            expect(result).toContain('role');
        });

        it('should handle array differences', () => {
            const before = { permissions: ['read'] };
            const after = { permissions: ['read', 'write'] };

            const result = calculateDiffFields(before, after);

            expect(result).toContain('permissions');
        });

        it('should handle number value changes', () => {
            const before = { limit: 10 };
            const after = { limit: 20 };

            const result = calculateDiffFields(before, after);

            expect(result).toContain('limit');
        });

        it('should handle boolean value changes', () => {
            const before = { active: true };
            const after = { active: false };

            const result = calculateDiffFields(before, after);

            expect(result).toContain('active');
        });
    });

    describe('generatePermissionDiff', () => {
        it('should identify added fields', () => {
            const before = {};
            const after = { role: 'admin' };

            const result = generatePermissionDiff(before, after);

            expect(result).toEqual([
                { field: 'role', before: null, after: 'admin', status: 'added' }
            ]);
        });

        it('should identify removed fields', () => {
            const before = { role: 'admin' };
            const after = {};

            const result = generatePermissionDiff(before, after);

            expect(result).toEqual([
                { field: 'role', before: 'admin', after: null, status: 'removed' }
            ]);
        });

        it('should identify changed fields', () => {
            const before = { role: 'user' };
            const after = { role: 'admin' };

            const result = generatePermissionDiff(before, after);

            expect(result).toEqual([
                { field: 'role', before: 'user', after: 'admin', status: 'changed' }
            ]);
        });

        it('should handle multiple field changes with different statuses', () => {
            const before = { role: 'user', department: 'Engineering', status: 'active' };
            const after = { role: 'admin', level: 'senior', status: 'inactive' };

            const result = generatePermissionDiff(before, after);

            expect(result).toEqual([
                { field: 'role', before: 'user', after: 'admin', status: 'changed' },
                { field: 'department', before: 'Engineering', after: null, status: 'removed' },
                { field: 'status', before: 'active', after: 'inactive', status: 'changed' },
                { field: 'level', before: null, after: 'senior', status: 'added' }
            ]);
        });

        it('should return empty array when no changes', () => {
            const before = { role: 'user' };
            const after = { role: 'user' };

            const result = generatePermissionDiff(before, after);

            expect(result).toEqual([]);
        });

        it('should handle complex nested values', () => {
            const before = { permissions: ['read'] };
            const after = { permissions: ['read', 'write', 'delete'] };

            const result = generatePermissionDiff(before, after);

            expect(result).toEqual([
                { field: 'permissions', before: ['read'], after: ['read', 'write', 'delete'], status: 'changed' }
            ]);
        });
    });

    describe('detectSuspiciousChanges', () => {
        it('should detect suspicious changes from single user making many changes', () => {
            const changes = Array(6).fill(null).map((_, i) => ({
                activityLogId: `log-${i}`,
                timestamp: '2024-01-15T10:30:00Z',
                userId: 'user-123',
                action: ActivityAction.PERMISSION_GRANTED,
                resource: 'user',
                resourceId: 'user-456',
                beforeValues: {},
                afterValues: {},
                diffFields: []
            }));

            const result = detectSuspiciousChanges(changes);

            expect(result).toBeGreaterThan(0);
        });

        it('should not flag normal number of changes as suspicious', () => {
            const changes = Array(3).fill(null).map((_, i) => ({
                activityLogId: `log-${i}`,
                timestamp: '2024-01-15T10:30:00Z',
                userId: 'user-123',
                action: ActivityAction.PERMISSION_GRANTED,
                resource: 'user',
                resourceId: 'user-456',
                beforeValues: {},
                afterValues: {},
                diffFields: []
            }));

            const result = detectSuspiciousChanges(changes);

            expect(result).toBe(0);
        });

        it('should detect suspicious role escalation to admin', () => {
            const changes = [
                {
                    activityLogId: 'log-1',
                    timestamp: '2024-01-15T10:30:00Z',
                    userId: 'user-123',
                    action: ActivityAction.ROLE_CHANGE,
                    resource: 'user',
                    resourceId: 'user-456',
                    beforeValues: { role: 'user' },
                    afterValues: { role: 'admin' },
                    diffFields: ['role']
                }
            ];

            const result = detectSuspiciousChanges(changes);

            expect(result).toBe(1);
        });

        it('should not flag admin to admin role change as suspicious', () => {
            const changes = [
                {
                    activityLogId: 'log-1',
                    timestamp: '2024-01-15T10:30:00Z',
                    userId: 'user-123',
                    action: ActivityAction.ROLE_CHANGE,
                    resource: 'user',
                    resourceId: 'user-456',
                    beforeValues: { role: 'admin' },
                    afterValues: { role: 'admin' },
                    diffFields: []
                }
            ];

            const result = detectSuspiciousChanges(changes);

            expect(result).toBe(0);
        });

        it('should detect suspicious bulk permission grants', () => {
            const changes = [
                {
                    activityLogId: 'log-1',
                    timestamp: '2024-01-15T10:30:00Z',
                    userId: 'user-123',
                    action: ActivityAction.PERMISSION_GRANTED,
                    resource: 'user',
                    resourceId: 'user-456',
                    beforeValues: {},
                    afterValues: { perm1: 'val1', perm2: 'val2', perm3: 'val3', perm4: 'val4', perm5: 'val5', perm6: 'val6' },
                    diffFields: []
                }
            ];

            const result = detectSuspiciousChanges(changes);

            expect(result).toBe(1);
        });

        it('should handle empty changes array', () => {
            const result = detectSuspiciousChanges([]);

            expect(result).toBe(0);
        });

        it('should aggregate suspicious counts from multiple users', () => {
            const changes = [
                ...Array(6).fill(null).map((_, i) => ({
                    activityLogId: `log-${i}`,
                    timestamp: '2024-01-15T10:30:00Z',
                    userId: 'user-123',
                    action: ActivityAction.PERMISSION_GRANTED,
                    resource: 'user',
                    resourceId: 'user-456',
                    beforeValues: {},
                    afterValues: {},
                    diffFields: []
                })),
                {
                    activityLogId: 'log-7',
                    timestamp: '2024-01-15T10:30:00Z',
                    userId: 'user-456',
                    action: ActivityAction.ROLE_CHANGE,
                    resource: 'user',
                    resourceId: 'user-789',
                    beforeValues: { role: 'user' },
                    afterValues: { role: 'admin' },
                    diffFields: ['role']
                }
            ];

            const result = detectSuspiciousChanges(changes);

            expect(result).toBeGreaterThan(1);
        });
    });

    describe('calculateAuditSummary', () => {
        const mockChanges = [
            {
                activityLogId: 'log-1',
                timestamp: '2024-01-15T10:30:00Z',
                userId: 'user-123',
                action: ActivityAction.ROLE_CHANGE,
                resource: 'user',
                resourceId: 'user-456',
                beforeValues: {},
                afterValues: {},
                diffFields: [],
                approvedBy: 'admin-user'
            },
            {
                activityLogId: 'log-2',
                timestamp: '2024-01-15T10:30:00Z',
                userId: 'user-456',
                action: ActivityAction.PERMISSION_GRANTED,
                resource: 'user',
                resourceId: 'user-789',
                beforeValues: {},
                afterValues: {},
                diffFields: []
            }
        ];

        it('should calculate total changes', () => {
            const result = calculateAuditSummary(mockChanges);

            expect(result.totalChanges).toBe(2);
        });

        it('should group changes by action', () => {
            const result = calculateAuditSummary(mockChanges);

            expect(result.changesByAction[ActivityAction.ROLE_CHANGE]).toBe(1);
            expect(result.changesByAction[ActivityAction.PERMISSION_GRANTED]).toBe(1);
        });

        it('should group changes by user', () => {
            const result = calculateAuditSummary(mockChanges);

            expect(result.changesByUser['user-123']).toBe(1);
            expect(result.changesByUser['user-456']).toBe(1);
        });

        it('should group changes by resource', () => {
            const result = calculateAuditSummary(mockChanges);

            expect(result.changesByResource['user']).toBe(2);
        });

        it('should count approved and pending changes', () => {
            const result = calculateAuditSummary(mockChanges);

            expect(result.approvedChanges).toBe(1);
            expect(result.pendingApproval).toBe(1);
        });

        it('should call detectSuspiciousChanges for suspicious count', () => {
            const result = calculateAuditSummary(mockChanges);

            expect(typeof result.suspiciousChanges).toBe('number');
        });

        it('should handle empty changes array', () => {
            const result = calculateAuditSummary([]);

            expect(result).toEqual({
                totalChanges: 0,
                changesByAction: {},
                changesByUser: {},
                changesByResource: {},
                suspiciousChanges: 0,
                approvedChanges: 0,
                pendingApproval: 0
            });
        });

        it('should handle changes without approvedBy field', () => {
            const changesWithoutApproval = [
                {
                    activityLogId: 'log-1',
                    timestamp: '2024-01-15T10:30:00Z',
                    userId: 'user-123',
                    action: ActivityAction.ROLE_CHANGE,
                    resource: 'user',
                    resourceId: 'user-456',
                    beforeValues: {},
                    afterValues: {},
                    diffFields: []
                }
            ];

            const result = calculateAuditSummary(changesWithoutApproval);

            expect(result.pendingApproval).toBe(1);
            expect(result.approvedChanges).toBe(0);
        });
    });

    describe('mapLogToPermissionChange', () => {
        it('should map activity log to permission change', () => {
            const result = mapLogToPermissionChange(mockLog);

            expect(result).toEqual({
                activityLogId: mockLog.id,
                timestamp: mockLog.timestamp,
                userId: mockLog.userId,
                action: mockLog.action,
                resource: mockLog.resource,
                resourceId: mockLog.resourceId,
                beforeValues: mockLog.details.beforeValues,
                afterValues: mockLog.details.afterValues,
                diffFields: ['role', 'permissions'],
                changeReason: mockLog.details.changeReason,
                approvedBy: mockLog.details.approvedBy
            });
        });

        it('should handle log without details', () => {
            const logWithoutDetails = { ...mockLog, details: undefined };
            const result = mapLogToPermissionChange(logWithoutDetails);

            expect(result.beforeValues).toEqual({});
            expect(result.afterValues).toEqual({});
            expect(result.changeReason).toBeUndefined();
            expect(result.approvedBy).toBeUndefined();
        });

        it('should handle log with empty details', () => {
            const logWithEmptyDetails = { ...mockLog, details: {} };
            const result = mapLogToPermissionChange(logWithEmptyDetails);

            expect(result.beforeValues).toEqual({});
            expect(result.afterValues).toEqual({});
        });

        it('should handle log without resourceId', () => {
            const logWithoutResourceId = { ...mockLog, resourceId: undefined };
            const result = mapLogToPermissionChange(logWithoutResourceId);

            expect(result.resourceId).toBe('');
        });

        it('should calculate diff fields correctly', () => {
            const logWithChanges = {
                ...mockLog,
                details: {
                    beforeValues: { role: 'user' },
                    afterValues: { role: 'admin' }
                }
            };
            const result = mapLogToPermissionChange(logWithChanges);

            expect(result.diffFields).toEqual(['role']);
        });
    });

    describe('exportAuditReportToCSV', () => {
        const mockReport = {
            id: 'AUDIT-1',
            dateRange: { startDate: '2024-01-01', endDate: '2024-01-31' },
            filters: {},
            summary: {
                totalChanges: 1,
                changesByAction: {},
                changesByUser: {},
                changesByResource: {},
                suspiciousChanges: 0,
                approvedChanges: 1,
                pendingApproval: 0
            },
            changes: [
                {
                    activityLogId: 'log-1',
                    timestamp: '2024-01-15T10:30:00Z',
                    userId: 'user-123',
                    action: ActivityAction.ROLE_CHANGE,
                    resource: 'user',
                    resourceId: 'user-456',
                    beforeValues: { role: 'user' },
                    afterValues: { role: 'admin' },
                    diffFields: ['role'],
                    changeReason: 'Promotion',
                    approvedBy: 'admin-user'
                }
            ],
            generatedAt: '2024-01-20T12:00:00Z',
            generatedBy: 'admin-user'
        };

        it('should export report to CSV format', () => {
            const result = exportAuditReportToCSV(mockReport);

            expect(result).toContain('Timestamp,User ID,Action,Resource,Resource ID,Changed Fields,Change Reason,Approved By');
            expect(result).toContain('"2024-01-15T10:30:00Z","user-123","role_change","user","user-456","role","Promotion","admin-user"');
        });

        it('should escape commas in field values', () => {
            const reportWithCommas = {
                ...mockReport,
                changes: [
                    {
                        ...mockReport.changes[0],
                        changeReason: 'Promoted to, admin role'
                    }
                ]
            };
            const result = exportAuditReportToCSV(reportWithCommas);

            expect(result).toContain('"Promoted to, admin role"');
        });

        it('should escape quotes in field values', () => {
            const reportWithQuotes = {
                ...mockReport,
                changes: [
                    {
                        ...mockReport.changes[0],
                        changeReason: 'Promoted to "admin" role'
                    }
                ]
            };
            const result = exportAuditReportToCSV(reportWithQuotes);

            expect(result).toContain('"Promoted to ""admin"" role"');
        });

        it('should handle empty change reason', () => {
            const reportWithEmptyReason = {
                ...mockReport,
                changes: [
                    {
                        ...mockReport.changes[0],
                        changeReason: undefined
                    }
                ]
            };
            const result = exportAuditReportToCSV(reportWithEmptyReason);

            const lines = result.split('\n');
            // Empty string field is represented as "" in CSV
            expect(lines[1]).toMatch(/"","admin-user"$/);
        });

        it('should handle missing approvedBy', () => {
            const reportWithoutApproval = {
                ...mockReport,
                changes: [
                    {
                        ...mockReport.changes[0],
                        approvedBy: undefined
                    }
                ]
            };
            const result = exportAuditReportToCSV(reportWithoutApproval);

            const lines = result.split('\n');
            // Empty string field is represented as "" in CSV
            expect(lines[1]).toMatch(/"Promotion",""$/);
        });

        it('should join multiple diff fields with comma', () => {
            const reportWithMultipleDiffs = {
                ...mockReport,
                changes: [
                    {
                        ...mockReport.changes[0],
                        diffFields: ['role', 'permissions', 'status']
                    }
                ]
            };
            const result = exportAuditReportToCSV(reportWithMultipleDiffs);

            expect(result).toContain('role, permissions, status');
        });

        it('should handle empty changes array', () => {
            const reportWithNoChanges = {
                ...mockReport,
                changes: []
            };
            const result = exportAuditReportToCSV(reportWithNoChanges);

            expect(result).toContain('Timestamp,User ID,Action,Resource,Resource ID,Changed Fields,Change Reason,Approved By');
            const lines = result.split('\n');
            expect(lines).toHaveLength(1);
        });
    });

    describe('exportAuditReportToJSON', () => {
        const mockReport = {
            id: 'AUDIT-1',
            dateRange: { startDate: '2024-01-01', endDate: '2024-01-31' },
            filters: {},
            summary: {
                totalChanges: 1,
                changesByAction: {},
                changesByUser: {},
                changesByResource: {},
                suspiciousChanges: 0,
                approvedChanges: 1,
                pendingApproval: 0
            },
            changes: [mockLog as any],
            generatedAt: '2024-01-20T12:00:00Z',
            generatedBy: 'admin-user'
        };

        it('should export report to JSON format', () => {
            const result = exportAuditReportToJSON(mockReport);

            const parsed = JSON.parse(result);
            expect(parsed).toEqual(mockReport);
        });

        it('should format JSON with indentation', () => {
            const result = exportAuditReportToJSON(mockReport);

            expect(result).toContain('  ');
        });

        it('should handle complex nested structures', () => {
            const reportWithComplexData = {
                ...mockReport,
                summary: {
                    ...mockReport.summary,
                    changesByAction: { [ActivityAction.ROLE_CHANGE]: 5 }
                }
            };
            const result = exportAuditReportToJSON(reportWithComplexData);

            const parsed = JSON.parse(result);
            expect(parsed.summary.changesByAction[ActivityAction.ROLE_CHANGE]).toBe(5);
        });
    });

    describe('generatePermissionAuditReport', () => {

        it('should generate permission audit report', () => {
            (filterLogs as jest.Mock).mockReturnValue([mockLog]);

            const dateRange = {
                startDate: '2024-01-01',
                endDate: '2024-01-31'
            };

            const result = generatePermissionAuditReport(dateRange, {}, 'admin-user');

            expect(result.id).toMatch(/^AUDIT-/);
            expect(result.dateRange).toEqual(dateRange);
            expect(result.generatedBy).toBe('admin-user');
            expect(result.changes).toHaveLength(1);
            expect(result.summary.totalChanges).toBe(1);
        });

        it('should apply custom filters', () => {
            (filterLogs as jest.Mock).mockReturnValue([mockLog]);

            const dateRange = {
                startDate: '2024-01-01',
                endDate: '2024-01-31'
            };

            const customFilters = {
                userId: 'user-123',
                resource: 'user'
            };

            generatePermissionAuditReport(dateRange, customFilters, 'admin-user');

            expect(filterLogs).toHaveBeenCalledWith({
                action: expect.arrayContaining([
                    ActivityAction.ROLE_CHANGE,
                    ActivityAction.ROLE_ASSIGNED,
                    ActivityAction.ROLE_REMOVED,
                    ActivityAction.PERMISSION_GRANTED,
                    ActivityAction.PERMISSION_REVOKED,
                    ActivityAction.SETTINGS_CHANGE
                ]),
                startDate: dateRange.startDate,
                endDate: dateRange.endDate,
                ...customFilters
            });
        });

        it('should set generatedAt timestamp', () => {
            (filterLogs as jest.Mock).mockReturnValue([mockLog]);

            const result = generatePermissionAuditReport(
                { startDate: '2024-01-01', endDate: '2024-01-31' },
                {},
                'admin-user'
            );

            expect(result.generatedAt).toBe('2024-01-20T12:00:00.000Z');
        });

        it('should handle empty logs', () => {
            (filterLogs as jest.Mock).mockReturnValue([]);

            const result = generatePermissionAuditReport(
                { startDate: '2024-01-01', endDate: '2024-01-31' },
                {},
                'admin-user'
            );

            expect(result.changes).toHaveLength(0);
            expect(result.summary.totalChanges).toBe(0);
        });

        it('should combine filters correctly', () => {
            (filterLogs as jest.Mock).mockReturnValue([]);

            const dateRange = {
                startDate: '2024-01-01',
                endDate: '2024-01-31'
            };

            const customFilters = {
                action: [ActivityAction.ROLE_CHANGE]
            };

            generatePermissionAuditReport(dateRange, customFilters, 'admin-user');

            expect(filterLogs).toHaveBeenCalledWith({
                ...customFilters,
                startDate: dateRange.startDate,
                endDate: dateRange.endDate
            });
        });
    });
});
