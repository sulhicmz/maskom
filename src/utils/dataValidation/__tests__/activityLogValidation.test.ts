import {
  validateActivityAction,
  validateActivityDetails,
  validateActivityLog,
  validateActivityLogs,
  validateActivityLogFilter,
  validateActivityStatistics,
  validateAlertRule,
  validateSuspiciousActivityAlert,
} from '../activityLogValidation';
import {
  ActivityAction,
  ActivityLog,
  ActivityStatistics,
  AlertRule,
  SuspiciousActivityAlert,
} from '@/types/audit';

describe('activityLogValidation - validateActivityAction', () => {
  describe('happy path', () => {
    it('should accept valid ActivityAction.LOGIN', () => {
      const result = validateActivityAction(ActivityAction.LOGIN);
      expect(result.isValid).toBe(true);
      expect(result.errors).toEqual([]);
    });

    it('should accept valid ActivityAction.CONTENT_PUBLISH', () => {
      const result = validateActivityAction(ActivityAction.CONTENT_PUBLISH);
      expect(result.isValid).toBe(true);
      expect(result.errors).toEqual([]);
    });

    it('should accept valid ActivityAction.PERMISSION_GRANTED', () => {
      const result = validateActivityAction(ActivityAction.PERMISSION_GRANTED);
      expect(result.isValid).toBe(true);
      expect(result.errors).toEqual([]);
    });

    it('should accept valid ActivityAction.BACKUP_CREATE', () => {
      const result = validateActivityAction(ActivityAction.BACKUP_CREATE);
      expect(result.isValid).toBe(true);
      expect(result.errors).toEqual([]);
    });
  });

  describe('sad path', () => {
    it('should reject invalid activity action', () => {
      const result = validateActivityAction('invalid_action' as ActivityAction);
      expect(result.isValid).toBe(false);
      expect(result.errors).toHaveLength(1);
      expect(result.errors[0]).toContain('Invalid activity action');
    });

    it('should reject empty string', () => {
      const result = validateActivityAction('' as ActivityAction);
      expect(result.isValid).toBe(false);
      expect(result.errors).toHaveLength(1);
    });
  });
});

describe('activityLogValidation - validateActivityDetails', () => {
  describe('happy path', () => {
    it('should accept valid details with string values', () => {
      const details = { method: 'password', ipCountry: 'ID' };
      const result = validateActivityDetails(details);
      expect(result.isValid).toBe(true);
      expect(result.errors).toEqual([]);
    });

    it('should accept valid details with number values', () => {
      const details = { attempts: 3, duration: 5000 };
      const result = validateActivityDetails(details);
      expect(result.isValid).toBe(true);
      expect(result.errors).toEqual([]);
    });

    it('should accept valid details with boolean values', () => {
      const details = { successful: true, encrypted: false };
      const result = validateActivityDetails(details);
      expect(result.isValid).toBe(true);
      expect(result.errors).toEqual([]);
    });

    it('should accept valid details with null values', () => {
      const details = { previousValue: null, nextValue: 'new' };
      const result = validateActivityDetails(details);
      expect(result.isValid).toBe(true);
      expect(result.errors).toEqual([]);
    });

    it('should accept valid details with undefined values', () => {
      const details = { optionalField: undefined };
      const result = validateActivityDetails(details);
      expect(result.isValid).toBe(true);
      expect(result.errors).toEqual([]);
    });

    it('should accept valid details with string arrays', () => {
      const details = { tags: ['tag1', 'tag2'], permissions: ['read', 'write'] };
      const result = validateActivityDetails(details);
      expect(result.isValid).toBe(true);
      expect(result.errors).toEqual([]);
    });

    it('should accept valid details with number arrays', () => {
      const details = { ids: [1, 2, 3], scores: [100, 200, 300] };
      const result = validateActivityDetails(details);
      expect(result.isValid).toBe(true);
      expect(result.errors).toEqual([]);
    });

    it('should accept valid details with boolean arrays', () => {
      const details = { flags: [true, false, true] };
      const result = validateActivityDetails(details);
      expect(result.isValid).toBe(true);
      expect(result.errors).toEqual([]);
    });

    it('should accept valid details with mixed values', () => {
      const details = {
        method: 'password',
        attempts: 3,
        successful: true,
        tags: ['auth', 'login'],
        timestamp: null,
      };
      const result = validateActivityDetails(details);
      expect(result.isValid).toBe(true);
      expect(result.errors).toEqual([]);
    });

    it('should accept empty details object', () => {
      const details = {};
      const result = validateActivityDetails(details);
      expect(result.isValid).toBe(true);
      expect(result.errors).toEqual([]);
    });
  });

  describe('sad path', () => {
    it('should reject null details', () => {
      const result = validateActivityDetails(null as any);
      expect(result.isValid).toBe(false);
      expect(result.errors).toHaveLength(1);
      expect(result.errors[0]).toContain('must be a non-null object');
    });

    it('should reject undefined details', () => {
      const result = validateActivityDetails(undefined as any);
      expect(result.isValid).toBe(false);
      expect(result.errors).toHaveLength(1);
      expect(result.errors[0]).toContain('must be a non-null object');
    });

    it('should reject array instead of object', () => {
      const result = validateActivityDetails([] as any);
      expect(result.isValid).toBe(false);
      expect(result.errors).toHaveLength(1);
      expect(result.errors[0]).toContain('must be a non-null object');
    });

    it('should reject invalid primitive type in details', () => {
      const details = { invalidField: { nested: 'object' } };
      const result = validateActivityDetails(details);
      expect(result.isValid).toBe(false);
      expect(result.errors).toHaveLength(1);
      expect(result.errors[0]).toContain('invalidField has invalid type');
    });

    it('should reject invalid array item type', () => {
      const details = { invalidArray: [1, 2, { invalid: 'object' }] };
      const result = validateActivityDetails(details);
      expect(result.isValid).toBe(false);
      expect(result.errors).toHaveLength(1);
      expect(result.errors[0]).toContain('invalidArray[2] has invalid type');
    });
  });
});

describe('activityLogValidation - validateActivityLog', () => {
  const createValidLog = (): ActivityLog => ({
    id: 'LOG-1234567890-abcdef',
    userId: 'user-001',
    action: ActivityAction.LOGIN,
    resource: 'auth',
    resourceId: 'user-001',
    details: { method: 'password', ipCountry: 'ID' },
    timestamp: '2024-01-15T10:30:00.000Z',
    ipAddress: '192.168.1.100',
    userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
    success: true,
  });

  describe('happy path', () => {
    it('should accept valid activity log with all fields', () => {
      const log = createValidLog();
      const result = validateActivityLog(log);
      expect(result.isValid).toBe(true);
      expect(result.errors).toEqual([]);
    });

    it('should accept valid activity log without optional fields', () => {
      const log: ActivityLog = {
        id: 'LOG-1234567890-abcdef',
        userId: 'user-001',
        action: ActivityAction.LOGOUT,
        resource: 'auth',
        details: {},
        timestamp: '2024-01-15T10:30:00Z',
        ipAddress: '192.168.1.100',
        userAgent: 'Mozilla/5.0',
        success: true,
      };
      const result = validateActivityLog(log);
      expect(result.isValid).toBe(true);
      expect(result.errors).toEqual([]);
    });

    it('should accept valid activity log with errorMessage (failed action)', () => {
      const log = { ...createValidLog(), success: false, errorMessage: 'Invalid password' };
      const result = validateActivityLog(log);
      expect(result.isValid).toBe(true);
      expect(result.errors).toEqual([]);
    });

    it('should accept valid activity log with empty details', () => {
      const log = { ...createValidLog(), details: {} };
      const result = validateActivityLog(log);
      expect(result.isValid).toBe(true);
      expect(result.errors).toEqual([]);
    });
  });

  describe('sad path', () => {
    it('should reject log with missing id', () => {
      const log = { ...createValidLog(), id: '' };
      const result = validateActivityLog(log);
      expect(result.isValid).toBe(false);
      expect(result.errors).toContain('id must be a non-empty string');
    });

    it('should reject log with non-string id', () => {
      const log = { ...createValidLog(), id: 123 as any };
      const result = validateActivityLog(log);
      expect(result.isValid).toBe(false);
      expect(result.errors).toContain('id must be a non-empty string');
    });

    it('should reject log with missing userId', () => {
      const log = { ...createValidLog(), userId: '' };
      const result = validateActivityLog(log);
      expect(result.isValid).toBe(false);
      expect(result.errors).toContain('userId must be a non-empty string');
    });

    it('should reject log with invalid action', () => {
      const log = { ...createValidLog(), action: 'invalid' as ActivityAction };
      const result = validateActivityLog(log);
      expect(result.isValid).toBe(false);
      expect(result.errors.some(e => e.includes('Invalid activity action'))).toBe(true);
    });

    it('should reject log with missing resource', () => {
      const log = { ...createValidLog(), resource: '' };
      const result = validateActivityLog(log);
      expect(result.isValid).toBe(false);
      expect(result.errors).toContain('resource must be a non-empty string');
    });

    it('should reject log with empty resourceId when provided', () => {
      const log = { ...createValidLog(), resourceId: '' };
      const result = validateActivityLog(log);
      expect(result.isValid).toBe(false);
      expect(result.errors).toContain('resourceId must be a non-empty string if provided');
    });

    it('should reject log with invalid timestamp format', () => {
      const log = { ...createValidLog(), timestamp: '2024-01-15' };
      const result = validateActivityLog(log);
      expect(result.isValid).toBe(false);
      expect(result.errors).toContain('timestamp must be in ISO 8601 format (e.g., 2024-01-15T10:30:00.000Z)');
    });

    it('should reject log with invalid IP address', () => {
      const log = { ...createValidLog(), ipAddress: 'invalid-ip' };
      const result = validateActivityLog(log);
      expect(result.isValid).toBe(false);
      expect(result.errors).toContain('ipAddress must be a valid IPv4 address');
    });

    it('should reject log with missing userAgent', () => {
      const log = { ...createValidLog(), userAgent: '' };
      const result = validateActivityLog(log);
      expect(result.isValid).toBe(false);
      expect(result.errors).toContain('userAgent must be a non-empty string');
    });

    it('should reject log with non-boolean success', () => {
      const log = { ...createValidLog(), success: 'true' as any };
      const result = validateActivityLog(log);
      expect(result.isValid).toBe(false);
      expect(result.errors).toContain('success must be a boolean');
    });

    it('should reject log with non-string errorMessage', () => {
      const log = { ...createValidLog(), success: false, errorMessage: 123 as any };
      const result = validateActivityLog(log);
      expect(result.isValid).toBe(false);
      expect(result.errors).toContain('errorMessage must be a string if provided');
    });

    it('should reject log with invalid details', () => {
      const log = { ...createValidLog(), details: { invalid: { nested: 'object' } } };
      const result = validateActivityLog(log);
      expect(result.isValid).toBe(false);
      expect(result.errors.some(e => e.includes('details'))).toBe(true);
    });
  });
});

describe('activityLogValidation - validateActivityLogs', () => {
  const createValidLog = (id: string): ActivityLog => ({
    id,
    userId: 'user-001',
    action: ActivityAction.LOGIN,
    resource: 'auth',
    details: {},
    timestamp: '2024-01-15T10:30:00.000Z',
    ipAddress: '192.168.1.100',
    userAgent: 'Mozilla/5.0',
    success: true,
  });

  describe('happy path', () => {
    it('should accept valid array of activity logs', () => {
      const logs = [
        createValidLog('LOG-001'),
        createValidLog('LOG-002'),
        createValidLog('LOG-003'),
      ];
      const result = validateActivityLogs(logs);
      expect(result.isValid).toBe(true);
      expect(result.errors).toEqual([]);
    });

    it('should accept empty array of activity logs', () => {
      const result = validateActivityLogs([]);
      expect(result.isValid).toBe(true);
      expect(result.errors).toEqual([]);
    });

    it('should accept single valid activity log', () => {
      const logs = [createValidLog('LOG-001')];
      const result = validateActivityLogs(logs);
      expect(result.isValid).toBe(true);
      expect(result.errors).toEqual([]);
    });
  });

  describe('sad path', () => {
    it('should reject non-array input', () => {
      const result = validateActivityLogs(null as any);
      expect(result.isValid).toBe(false);
      expect(result.errors).toContain('Activity logs must be an array');
    });

    it('should reject array with invalid log', () => {
      const logs = [
        createValidLog('LOG-001'),
        { ...createValidLog('LOG-002'), userId: '' } as ActivityLog,
      ];
      const result = validateActivityLogs(logs);
      expect(result.isValid).toBe(false);
      expect(result.errors.some(e => e.includes('ActivityLog[1]'))).toBe(true);
    });

    it('should detect duplicate log IDs', () => {
      const logs = [
        createValidLog('LOG-001'),
        createValidLog('LOG-001'),
      ];
      const result = validateActivityLogs(logs);
      expect(result.isValid).toBe(false);
      expect(result.errors).toContain('ActivityLog[1]: Duplicate id LOG-001 found');
    });
  });
});

describe('activityLogValidation - validateActivityLogFilter', () => {
  describe('happy path', () => {
    it('should accept empty filter', () => {
      const filter = {};
      const result = validateActivityLogFilter(filter);
      expect(result.isValid).toBe(true);
      expect(result.errors).toEqual([]);
    });

    it('should accept valid filter with userId', () => {
      const filter = { userId: 'user-001' };
      const result = validateActivityLogFilter(filter);
      expect(result.isValid).toBe(true);
      expect(result.errors).toEqual([]);
    });

    it('should accept valid filter with action array', () => {
      const filter = { action: [ActivityAction.LOGIN, ActivityAction.LOGOUT] };
      const result = validateActivityLogFilter(filter);
      expect(result.isValid).toBe(true);
      expect(result.errors).toEqual([]);
    });

    it('should accept valid filter with date range', () => {
      const filter = {
        startDate: '2024-01-01T00:00:00.000Z',
        endDate: '2024-01-31T23:59:59.999Z',
      };
      const result = validateActivityLogFilter(filter);
      expect(result.isValid).toBe(true);
      expect(result.errors).toEqual([]);
    });

    it('should accept valid filter with pagination', () => {
      const filter = { limit: 10, offset: 20 };
      const result = validateActivityLogFilter(filter);
      expect(result.isValid).toBe(true);
      expect(result.errors).toEqual([]);
    });

    it('should accept valid filter with success flag', () => {
      const filter = { success: true };
      const result = validateActivityLogFilter(filter);
      expect(result.isValid).toBe(true);
      expect(result.errors).toEqual([]);
    });

    it('should accept valid filter with all fields', () => {
      const filter = {
        userId: 'user-001',
        action: [ActivityAction.LOGIN],
        resource: 'auth',
        resourceId: 'user-001',
        startDate: '2024-01-01T00:00:00.000Z',
        endDate: '2024-01-31T23:59:59.999Z',
        success: true,
        limit: 10,
        offset: 0,
      };
      const result = validateActivityLogFilter(filter);
      expect(result.isValid).toBe(true);
      expect(result.errors).toEqual([]);
    });
  });

  describe('sad path', () => {
    it('should reject invalid userId (empty string)', () => {
      const filter = { userId: '' };
      const result = validateActivityLogFilter(filter);
      expect(result.isValid).toBe(false);
      expect(result.errors).toContain('userId must be a non-empty string if provided');
    });

    it('should reject invalid action (not array)', () => {
      const filter = { action: ActivityAction.LOGIN as any };
      const result = validateActivityLogFilter(filter);
      expect(result.isValid).toBe(false);
      expect(result.errors).toContain('action must be an array if provided');
    });

    it('should reject invalid action in array', () => {
      const filter = { action: ['invalid' as ActivityAction] };
      const result = validateActivityLogFilter(filter);
      expect(result.isValid).toBe(false);
      expect(result.errors).toContain('action[0]: Invalid activity action: invalid');
    });

    it('should reject invalid startDate format', () => {
      const filter = { startDate: '2024-01-01' };
      const result = validateActivityLogFilter(filter);
      expect(result.isValid).toBe(false);
      expect(result.errors).toContain('startDate must be in ISO 8601 format if provided');
    });

    it('should reject invalid endDate format', () => {
      const filter = { endDate: '2024-01-31' };
      const result = validateActivityLogFilter(filter);
      expect(result.isValid).toBe(false);
      expect(result.errors).toContain('endDate must be in ISO 8601 format if provided');
    });

    it('should reject startDate after endDate', () => {
      const filter = {
        startDate: '2024-01-31T00:00:00.000Z',
        endDate: '2024-01-01T00:00:00.000Z',
      };
      const result = validateActivityLogFilter(filter);
      expect(result.isValid).toBe(false);
      expect(result.errors).toContain('startDate must be before or equal to endDate');
    });

    it('should reject invalid success type', () => {
      const filter = { success: 'true' as any };
      const result = validateActivityLogFilter(filter);
      expect(result.isValid).toBe(false);
      expect(result.errors).toContain('success must be a boolean if provided');
    });

    it('should reject invalid limit (zero)', () => {
      const filter = { limit: 0 };
      const result = validateActivityLogFilter(filter);
      expect(result.isValid).toBe(false);
      expect(result.errors).toContain('limit must be a positive number if provided');
    });

    it('should reject invalid limit (negative)', () => {
      const filter = { limit: -10 };
      const result = validateActivityLogFilter(filter);
      expect(result.isValid).toBe(false);
      expect(result.errors).toContain('limit must be a positive number if provided');
    });

    it('should reject invalid offset (negative)', () => {
      const filter = { offset: -5 };
      const result = validateActivityLogFilter(filter);
      expect(result.isValid).toBe(false);
      expect(result.errors).toContain('offset must be a non-negative number if provided');
    });
  });
});

describe('activityLogValidation - validateActivityStatistics', () => {
  const createValidLog = (id: string): ActivityLog => ({
    id,
    userId: 'user-001',
    action: ActivityAction.LOGIN,
    resource: 'auth',
    details: {},
    timestamp: '2024-01-15T10:30:00.000Z',
    ipAddress: '192.168.1.100',
    userAgent: 'Mozilla/5.0',
    success: true,
  });

  const createValidStats = (): ActivityStatistics => ({
    totalLogs: 100,
    successfulLogs: 95,
    failedLogs: 5,
    logsByAction: { [ActivityAction.LOGIN]: 50, [ActivityAction.LOGOUT]: 50 },
    logsByUser: { 'user-001': 50, 'user-002': 50 },
    logsByResource: { auth: 50, content: 50 },
    recentActivity: [createValidLog('LOG-001')],
    todayActivity: 10,
    last24hActivity: 25,
    last7DaysActivity: 50,
    last30DaysActivity: 100,
  });

  describe('happy path', () => {
    it('should accept valid activity statistics', () => {
      const stats = createValidStats();
      const result = validateActivityStatistics(stats);
      expect(result.isValid).toBe(true);
      expect(result.errors).toEqual([]);
    });

    it('should accept valid statistics with zero values', () => {
      const stats: ActivityStatistics = {
        totalLogs: 0,
        successfulLogs: 0,
        failedLogs: 0,
        logsByAction: {
          [ActivityAction.LOGIN]: 0,
          [ActivityAction.LOGOUT]: 0,
          [ActivityAction.PASSWORD_CHANGE]: 0,
          [ActivityAction.MFA_ENABLED]: 0,
          [ActivityAction.MFA_DISABLED]: 0,
          [ActivityAction.BACKUP_CODES_GENERATED]: 0,
          [ActivityAction.ROLE_CHANGE]: 0,
          [ActivityAction.ROLE_ASSIGNED]: 0,
          [ActivityAction.ROLE_REMOVED]: 0,
          [ActivityAction.PERMISSION_GRANTED]: 0,
          [ActivityAction.PERMISSION_REVOKED]: 0,
          [ActivityAction.CONTENT_PUBLISH]: 0,
          [ActivityAction.CONTENT_UPDATE]: 0,
          [ActivityAction.CONTENT_DELETE]: 0,
          [ActivityAction.CONTENT_SCHEDULE]: 0,
          [ActivityAction.SETTINGS_CHANGE]: 0,
          [ActivityAction.BACKUP_CREATE]: 0,
          [ActivityAction.BACKUP_RESTORE]: 0,
          [ActivityAction.BACKUP_DELETE]: 0,
          [ActivityAction.CACHE_CLEAR]: 0,
          [ActivityAction.APM_CONFIG_CHANGE]: 0,
          [ActivityAction.USER_REGISTER]: 0,
          [ActivityAction.USER_DELETE]: 0,
          [ActivityAction.API_ACCESS]: 0,
          [ActivityAction.COMMENT_CREATE]: 0,
          [ActivityAction.COMMENT_DELETE]: 0,
          [ActivityAction.COMMENT_MODERATE]: 0,
        },
        logsByUser: {},
        logsByResource: {},
        recentActivity: [],
        todayActivity: 0,
        last24hActivity: 0,
        last7DaysActivity: 0,
        last30DaysActivity: 0,
      };
      const result = validateActivityStatistics(stats);
      expect(result.isValid).toBe(true);
      expect(result.errors).toEqual([]);
    });

    it('should accept valid statistics with multiple recent activities', () => {
      const stats = {
        ...createValidStats(),
        recentActivity: [
          createValidLog('LOG-001'),
          createValidLog('LOG-002'),
          createValidLog('LOG-003'),
        ],
      };
      const result = validateActivityStatistics(stats);
      expect(result.isValid).toBe(true);
      expect(result.errors).toEqual([]);
    });
  });

  describe('sad path', () => {
    it('should reject negative totalLogs', () => {
      const stats = { ...createValidStats(), totalLogs: -1 };
      const result = validateActivityStatistics(stats);
      expect(result.isValid).toBe(false);
      expect(result.errors).toContain('totalLogs must be a non-negative number');
    });

    it('should reject successfulLogs + failedLogs mismatch', () => {
      const stats = { ...createValidStats(), successfulLogs: 90, failedLogs: 5 };
      const result = validateActivityStatistics(stats);
      expect(result.isValid).toBe(false);
      expect(result.errors).toContain('successfulLogs + failedLogs must equal totalLogs');
    });

    it('should reject invalid logsByAction action', () => {
      const stats = { ...createValidStats(), logsByAction: { invalid: 10 } as any };
      const result = validateActivityStatistics(stats);
      expect(result.isValid).toBe(false);
      expect(result.errors).toContain('logsByAction: Invalid action invalid');
    });

    it('should reject invalid logsByUser userId', () => {
      const stats = { ...createValidStats(), logsByUser: { '': 10 } };
      const result = validateActivityStatistics(stats);
      expect(result.isValid).toBe(false);
      expect(result.errors).toContain('logsByUser: userId must be a non-empty string');
    });

    it('should reject invalid logsByResource resource', () => {
      const stats = { ...createValidStats(), logsByResource: { '': 10 } };
      const result = validateActivityStatistics(stats);
      expect(result.isValid).toBe(false);
      expect(result.errors).toContain('logsByResource: resource must be a non-empty string');
    });

    it('should reject invalid recentActivity (not array)', () => {
      const stats = { ...createValidStats(), recentActivity: null as any };
      const result = validateActivityStatistics(stats);
      expect(result.isValid).toBe(false);
      expect(result.errors).toContain('recentActivity must be an array');
    });

    it('should reject invalid log in recentActivity', () => {
      const stats = { ...createValidStats(), recentActivity: [{ userId: '' } as ActivityLog] };
      const result = validateActivityStatistics(stats);
      expect(result.isValid).toBe(false);
      expect(result.errors.some(e => e.includes('recentActivity[0]'))).toBe(true);
    });

    it('should reject negative todayActivity', () => {
      const stats = { ...createValidStats(), todayActivity: -1 };
      const result = validateActivityStatistics(stats);
      expect(result.isValid).toBe(false);
      expect(result.errors).toContain('todayActivity must be a non-negative number');
    });

    it('should reject negative last24hActivity', () => {
      const stats = { ...createValidStats(), last24hActivity: -1 };
      const result = validateActivityStatistics(stats);
      expect(result.isValid).toBe(false);
      expect(result.errors).toContain('last24hActivity must be a non-negative number');
    });

    it('should reject negative last7DaysActivity', () => {
      const stats = { ...createValidStats(), last7DaysActivity: -1 };
      const result = validateActivityStatistics(stats);
      expect(result.isValid).toBe(false);
      expect(result.errors).toContain('last7DaysActivity must be a non-negative number');
    });

    it('should reject negative last30DaysActivity', () => {
      const stats = { ...createValidStats(), last30DaysActivity: -1 };
      const result = validateActivityStatistics(stats);
      expect(result.isValid).toBe(false);
      expect(result.errors).toContain('last30DaysActivity must be a non-negative number');
    });
  });
});

describe('activityLogValidation - validateAlertRule', () => {
  const createValidRule = (): AlertRule => ({
    id: 'rule-001',
    name: 'Failed Login Alert',
    description: 'Alert on multiple failed login attempts',
    action: ActivityAction.LOGIN,
    threshold: 5,
    timeWindow: 15,
    enabled: true,
    alertEmail: 'admin@example.com',
  });

  describe('happy path', () => {
    it('should accept valid alert rule with all fields', () => {
      const rule = createValidRule();
      const result = validateAlertRule(rule);
      expect(result.isValid).toBe(true);
      expect(result.errors).toEqual([]);
    });

    it('should accept valid alert rule without optional fields', () => {
      const rule: AlertRule = {
        id: 'rule-001',
        name: 'Failed Login Alert',
        description: 'Alert on multiple failed login attempts',
        action: ActivityAction.LOGIN,
        threshold: 5,
        timeWindow: 15,
        enabled: true,
      };
      const result = validateAlertRule(rule);
      expect(result.isValid).toBe(true);
      expect(result.errors).toEqual([]);
    });

    it('should accept valid alert rule with disabled status', () => {
      const rule = { ...createValidRule(), enabled: false };
      const result = validateAlertRule(rule);
      expect(result.isValid).toBe(true);
      expect(result.errors).toEqual([]);
    });
  });

  describe('sad path', () => {
    it('should reject rule with missing id', () => {
      const rule = { ...createValidRule(), id: '' };
      const result = validateAlertRule(rule);
      expect(result.isValid).toBe(false);
      expect(result.errors).toContain('id must be a non-empty string');
    });

    it('should reject rule with missing name', () => {
      const rule = { ...createValidRule(), name: '' };
      const result = validateAlertRule(rule);
      expect(result.isValid).toBe(false);
      expect(result.errors).toContain('name must be a non-empty string');
    });

    it('should reject rule with missing description', () => {
      const rule = { ...createValidRule(), description: '' };
      const result = validateAlertRule(rule);
      expect(result.isValid).toBe(false);
      expect(result.errors).toContain('description must be a non-empty string');
    });

    it('should reject rule with invalid action', () => {
      const rule = { ...createValidRule(), action: 'invalid' as ActivityAction };
      const result = validateAlertRule(rule);
      expect(result.isValid).toBe(false);
      expect(result.errors.some(e => e.includes('Invalid activity action'))).toBe(true);
    });

    it('should reject rule with zero threshold', () => {
      const rule = { ...createValidRule(), threshold: 0 };
      const result = validateAlertRule(rule);
      expect(result.isValid).toBe(false);
      expect(result.errors).toContain('threshold must be a positive number');
    });

    it('should reject rule with negative timeWindow', () => {
      const rule = { ...createValidRule(), timeWindow: -5 };
      const result = validateAlertRule(rule);
      expect(result.isValid).toBe(false);
      expect(result.errors).toContain('timeWindow must be a positive number (in minutes)');
    });

    it('should reject rule with non-boolean enabled', () => {
      const rule = { ...createValidRule(), enabled: 'true' as any };
      const result = validateAlertRule(rule);
      expect(result.isValid).toBe(false);
      expect(result.errors).toContain('enabled must be a boolean');
    });

    it('should reject rule with invalid email format', () => {
      const rule = { ...createValidRule(), alertEmail: 'invalid-email' };
      const result = validateAlertRule(rule);
      expect(result.isValid).toBe(false);
      expect(result.errors).toContain('alertEmail must be a valid email address');
    });
  });
});

describe('activityLogValidation - validateSuspiciousActivityAlert', () => {
  const createValidAlert = (): SuspiciousActivityAlert => ({
    id: 'alert-001',
    ruleId: 'rule-001',
    ruleName: 'Failed Login Alert',
    triggeredAt: '2024-01-15T10:30:00.000Z',
    userId: 'user-001',
    action: ActivityAction.LOGIN,
    count: 6,
    threshold: 5,
    timeWindow: 15,
    activities: [
      {
        id: 'LOG-001',
        userId: 'user-001',
        action: ActivityAction.LOGIN,
        resource: 'auth',
        details: {},
        timestamp: '2024-01-15T10:25:00.000Z',
        ipAddress: '192.168.1.100',
        userAgent: 'Mozilla/5.0',
        success: false,
        errorMessage: 'Invalid password',
      },
    ],
    resolved: false,
  });

  describe('happy path', () => {
    it('should accept valid suspicious activity alert (unresolved)', () => {
      const alert = createValidAlert();
      const result = validateSuspiciousActivityAlert(alert);
      expect(result.isValid).toBe(true);
      expect(result.errors).toEqual([]);
    });

    it('should accept valid suspicious activity alert (resolved)', () => {
      const alert = {
        ...createValidAlert(),
        resolved: true,
        resolvedAt: '2024-01-15T11:00:00.000Z',
        resolvedBy: 'admin-001',
      };
      const result = validateSuspiciousActivityAlert(alert);
      expect(result.isValid).toBe(true);
      expect(result.errors).toEqual([]);
    });

    it('should accept alert without optional userId', () => {
      const alert = { ...createValidAlert(), userId: undefined };
      const result = validateSuspiciousActivityAlert(alert);
      expect(result.isValid).toBe(true);
      expect(result.errors).toEqual([]);
    });
  });

  describe('sad path', () => {
    it('should reject alert with missing id', () => {
      const alert = { ...createValidAlert(), id: '' };
      const result = validateSuspiciousActivityAlert(alert);
      expect(result.isValid).toBe(false);
      expect(result.errors).toContain('id must be a non-empty string');
    });

    it('should reject alert with missing ruleId', () => {
      const alert = { ...createValidAlert(), ruleId: '' };
      const result = validateSuspiciousActivityAlert(alert);
      expect(result.isValid).toBe(false);
      expect(result.errors).toContain('ruleId must be a non-empty string');
    });

    it('should reject alert with invalid triggeredAt format', () => {
      const alert = { ...createValidAlert(), triggeredAt: '2024-01-15' };
      const result = validateSuspiciousActivityAlert(alert);
      expect(result.isValid).toBe(false);
      expect(result.errors).toContain('triggeredAt must be in ISO 8601 format');
    });

    it('should reject alert with invalid userId (empty)', () => {
      const alert = { ...createValidAlert(), userId: '' };
      const result = validateSuspiciousActivityAlert(alert);
      expect(result.isValid).toBe(false);
      expect(result.errors).toContain('userId must be a non-empty string if provided');
    });

    it('should reject alert with invalid action', () => {
      const alert = { ...createValidAlert(), action: 'invalid' as ActivityAction };
      const result = validateSuspiciousActivityAlert(alert);
      expect(result.isValid).toBe(false);
      expect(result.errors.some(e => e.includes('Invalid activity action'))).toBe(true);
    });

    it('should reject alert with zero count', () => {
      const alert = { ...createValidAlert(), count: 0 };
      const result = validateSuspiciousActivityAlert(alert);
      expect(result.isValid).toBe(false);
      expect(result.errors).toContain('count must be a positive number');
    });

    it('should reject alert with zero threshold', () => {
      const alert = { ...createValidAlert(), threshold: 0 };
      const result = validateSuspiciousActivityAlert(alert);
      expect(result.isValid).toBe(false);
      expect(result.errors).toContain('threshold must be a positive number');
    });

    it('should reject alert with zero timeWindow', () => {
      const alert = { ...createValidAlert(), timeWindow: 0 };
      const result = validateSuspiciousActivityAlert(alert);
      expect(result.isValid).toBe(false);
      expect(result.errors).toContain('timeWindow must be a positive number (in minutes)');
    });

    it('should reject alert with empty activities array', () => {
      const alert = { ...createValidAlert(), activities: [] };
      const result = validateSuspiciousActivityAlert(alert);
      expect(result.isValid).toBe(false);
      expect(result.errors).toContain('activities must not be empty');
    });

    it('should reject alert with invalid activity in activities', () => {
      const alert = { ...createValidAlert(), activities: [{ userId: '' } as ActivityLog] };
      const result = validateSuspiciousActivityAlert(alert);
      expect(result.isValid).toBe(false);
      expect(result.errors.some(e => e.includes('activities[0]'))).toBe(true);
    });

    it('should reject resolved alert without resolvedAt', () => {
      const alert = { ...createValidAlert(), resolved: true };
      const result = validateSuspiciousActivityAlert(alert);
      expect(result.isValid).toBe(false);
      expect(result.errors).toContain('resolvedAt must be a string when resolved is true');
    });

    it('should reject resolved alert without resolvedBy', () => {
      const alert = {
        ...createValidAlert(),
        resolved: true,
        resolvedAt: '2024-01-15T11:00:00.000Z',
      };
      const result = validateSuspiciousActivityAlert(alert);
      expect(result.isValid).toBe(false);
      expect(result.errors).toContain('resolvedBy must be a non-empty string when resolved is true');
    });

    it('should reject resolved alert with invalid resolvedAt format', () => {
      const alert = {
        ...createValidAlert(),
        resolved: true,
        resolvedAt: '2024-01-15',
        resolvedBy: 'admin-001',
      };
      const result = validateSuspiciousActivityAlert(alert);
      expect(result.isValid).toBe(false);
      expect(result.errors).toContain('resolvedAt must be in ISO 8601 format');
    });
  });
});
