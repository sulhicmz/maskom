import {
  generateLogId,
  getClientIP,
  getUserAgent,
  logActivity,
  getLogs,
  filterLogs,
  getLogsByUser,
  getLogsByAction,
  getLogsByDateRange,
  calculateActivityStatistics,
  exportLogsToCSV,
  exportLogsToJSON,
  downloadLogs,
  clearLogs,
  getAlertRules,
  saveAlertRule,
  updateAlertRule,
  deleteAlertRule,
  getSuspiciousAlerts,
  resolveAlert,
} from '../activityLogger'

import {
  ActivityLog,
  ActivityAction,
  ActivityLogFilter,
  AlertRule,
} from '@/types/audit'

describe('ActivityLogger', () => {
  const mockLocalStorage = {
    storage: {} as Record<string, string>,
    clear() {
      this.storage = {}
    },
    getItem(key: string) {
      return this.storage[key] || null
    },
    setItem(key: string, value: string) {
      this.storage[key] = String(value)
    },
    removeItem(key: string) {
      delete this.storage[key]
    },
  }

  const mockDocument = {
    createElement: jest.fn(() => ({
      href: '',
      click: jest.fn(),
      download: '',
    })),
    body: {
      appendChild: jest.fn(),
      removeChild: jest.fn(),
    },
  }

  beforeEach(() => {
    jest.resetModules()
    mockLocalStorage.clear()
    global.localStorage = mockLocalStorage as any

    mockDocument.createElement.mockClear()
    global.document = mockDocument as any

    jest.clearAllMocks()
    jest.useFakeTimers()
  })

  afterEach(() => {
    jest.useRealTimers()
    jest.restoreAllMocks()
  })

  describe('generateLogId', () => {
    it('should generate unique log IDs', () => {
      const id1 = generateLogId()
      const id2 = generateLogId()

      expect(id1).toMatch(/^LOG-\d+-[a-z0-9]{7}$/)
      expect(id2).toMatch(/^LOG-\d+-[a-z0-9]{7}$/)
      expect(id1).not.toBe(id2)
    })

    it('should generate IDs with correct format', () => {
      const id = generateLogId()

      expect(id).toMatch(/^LOG-\d{13}-[a-z0-9]{7}$/)
    })
  })

  describe('getClientIP', () => {
    it('should return mock IP address', () => {
      const ip = getClientIP()

      expect(ip).toBe('192.168.1.100')
    })
  })

  describe('getUserAgent', () => {
    it('should return user agent when window exists', () => {
      global.window = { navigator: { userAgent: 'Test Agent' } } as any

      const userAgent = getUserAgent()

      expect(userAgent).toBe('Test Agent')
    })

    it('should return "Unknown" when window does not exist', () => {
      delete (global as any).window

      const userAgent = getUserAgent()

      expect(userAgent).toBe('Unknown')
    })
  })

  describe('logActivity', () => {
    it('should log activity with minimal parameters', () => {
      const log = logActivity('user-1', ActivityAction.LOGIN, 'auth')

      expect(log).toBeDefined()
      expect(log.id).toMatch(/^LOG-\d+-[a-z0-9]{7}$/)
      expect(log.userId).toBe('user-1')
      expect(log.action).toBe(ActivityAction.LOGIN)
      expect(log.resource).toBe('auth')
      expect(log.success).toBe(true)
      expect(log.timestamp).toBeDefined()
      expect(log.ipAddress).toBeDefined()
      expect(log.userAgent).toBeDefined()
    })

    it('should log activity with all parameters', () => {
      const details = { page: '/dashboard', referrer: '/login' }
      const log = logActivity(
        'user-1',
        ActivityAction.CONTENT_PUBLISH,
        'blog',
        'post-1',
        details,
        true,
      )

      expect(log.details).toEqual(details)
    })

    it('should log failed activity with error message', () => {
      const log = logActivity(
        'user-1',
        ActivityAction.LOGIN,
        'auth',
        undefined,
        {},
        false,
        'Invalid credentials',
      )

      expect(log.success).toBe(false)
      expect(log.errorMessage).toBe('Invalid credentials')
    })

    it('should save log to localStorage', () => {
      logActivity('user-1', ActivityAction.LOGIN, 'auth')

      const logs = getLogs()

      expect(logs).toHaveLength(1)
      expect(logs[0].userId).toBe('user-1')
    })

    it('should limit log storage to MAX_LOGS', () => {
      for (let i = 0; i < 10050; i++) {
        logActivity(`user-${i}`, ActivityAction.LOGIN, 'auth')
      }

      const logs = getLogs()

      expect(logs.length).toBeLessThanOrEqual(10000)
    })
  })

  describe('getLogs', () => {
    it('should return empty array when no logs exist', () => {
      const logs = getLogs()

      expect(logs).toEqual([])
    })

    it('should return all logs from localStorage', () => {
      logActivity('user-1', ActivityAction.LOGIN, 'auth')
      logActivity('user-2', ActivityAction.LOGOUT, 'auth')

      const logs = getLogs()

      expect(logs).toHaveLength(2)
    })

    it('should return empty array in server environment', () => {
      const originalWindow = global.window
      delete (global as any).window

      const logs = getLogs()

      expect(logs).toEqual([])

      global.window = originalWindow
    })

    it('should handle malformed localStorage data', () => {
      mockLocalStorage.setItem('activity_logs', 'invalid json')
      
      const logs = getLogs()
      
      expect(logs).toEqual([])
    })

    it('should cache logs to avoid repeated localStorage reads', () => {
      clearLogs()

      logActivity('user-1', ActivityAction.LOGIN, 'auth')

      const logs1 = getLogs()
      const logs2 = getLogs()
      const logs3 = getLogs()

      expect(logs1).toBe(logs2)
      expect(logs2).toBe(logs3)
      expect(logs1).toHaveLength(1)
      expect(logs1[0].userId).toBe('user-1')
    })

    it('should invalidate cache when new log is added', () => {
      clearLogs()

      logActivity('user-1', ActivityAction.LOGIN, 'auth')

      const logs1 = getLogs()
      expect(logs1).toHaveLength(1)

      logActivity('user-2', ActivityAction.LOGOUT, 'auth')

      const logs2 = getLogs()
      expect(logs2).toHaveLength(2)
      expect(logs2.length).toBeGreaterThan(logs1.length)
    })
  })

  describe('filterLogs', () => {
    beforeEach(() => {
      logActivity('user-1', ActivityAction.LOGIN, 'auth')
      logActivity('user-1', ActivityAction.CONTENT_PUBLISH, 'blog', 'post-1')
      logActivity('user-2', ActivityAction.LOGIN, 'auth')
      logActivity('user-1', ActivityAction.LOGOUT, 'auth')
    })

    it('should filter logs by userId', () => {
      const filter: ActivityLogFilter = { userId: 'user-1' }
      const logs = filterLogs(filter)

      expect(logs).toHaveLength(3)
      expect(logs.every((log) => log.userId === 'user-1')).toBe(true)
    })

    it('should filter logs by action', () => {
      const filter: ActivityLogFilter = { action: [ActivityAction.LOGIN] }
      const logs = filterLogs(filter)

      expect(logs).toHaveLength(2)
      expect(logs.every((log) => log.action === ActivityAction.LOGIN)).toBe(true)
    })

    it('should filter logs by multiple actions', () => {
      const filter: ActivityLogFilter = {
        action: [ActivityAction.LOGIN, ActivityAction.LOGOUT],
      }
      const logs = filterLogs(filter)

      expect(logs).toHaveLength(3)
    })

    it('should filter logs by resource', () => {
      const filter: ActivityLogFilter = { resource: 'auth' }
      const logs = filterLogs(filter)

      expect(logs).toHaveLength(3)
      expect(logs.every((log) => log.resource === 'auth')).toBe(true)
    })

    it('should filter logs by resourceId', () => {
      const filter: ActivityLogFilter = { resourceId: 'post-1' }
      const logs = filterLogs(filter)

      expect(logs).toHaveLength(1)
      expect(logs[0].resourceId).toBe('post-1')
    })

    it('should filter logs by date range', () => {
      const now = new Date()
      const yesterday = new Date(now.getTime() - 24 * 60 * 60 * 1000)
      const tomorrow = new Date(now.getTime() + 24 * 60 * 60 * 1000)

      const filter: ActivityLogFilter = {
        startDate: yesterday.toISOString(),
        endDate: tomorrow.toISOString(),
      }
      const logs = filterLogs(filter)

      expect(logs.length).toBeGreaterThan(0)
    })

    it('should filter logs by success status', () => {
      const filter: ActivityLogFilter = { success: true }
      const logs = filterLogs(filter)

      expect(logs).toHaveLength(4)
      expect(logs.every((log) => log.success === true)).toBe(true)
    })

    it('should filter logs by failure status', () => {
      logActivity('user-3', ActivityAction.LOGIN, 'auth', undefined, {}, false, 'Error')
      const filter: ActivityLogFilter = { success: false }
      const logs = filterLogs(filter)

      expect(logs.length).toBeGreaterThan(0)
      expect(logs.every((log) => log.success === false)).toBe(true)
    })

    it('should apply offset and limit', () => {
      const filter: ActivityLogFilter = { offset: 1, limit: 2 }
      const logs = filterLogs(filter)

      expect(logs).toHaveLength(2)
    })

    it('should sort logs by timestamp descending', () => {
      const logs = filterLogs({})

      for (let i = 0; i < logs.length - 1; i++) {
        expect(new Date(logs[i].timestamp).getTime()).toBeGreaterThanOrEqual(
          new Date(logs[i + 1].timestamp).getTime(),
        )
      }
    })
  })

  describe('getLogsByUser', () => {
    beforeEach(() => {
      logActivity('user-1', ActivityAction.LOGIN, 'auth')
      logActivity('user-2', ActivityAction.LOGIN, 'auth')
      logActivity('user-1', ActivityAction.LOGOUT, 'auth')
    })

    it('should return logs for specific user', () => {
      const logs = getLogsByUser('user-1')

      expect(logs).toHaveLength(2)
      expect(logs.every((log) => log.userId === 'user-1')).toBe(true)
    })

    it('should return empty array for non-existent user', () => {
      const logs = getLogsByUser('user-999')

      expect(logs).toEqual([])
    })
  })

  describe('getLogsByAction', () => {
    beforeEach(() => {
      logActivity('user-1', ActivityAction.LOGIN, 'auth')
      logActivity('user-1', ActivityAction.LOGOUT, 'auth')
      logActivity('user-2', ActivityAction.LOGIN, 'auth')
    })

    it('should return logs for specific action', () => {
      const logs = getLogsByAction(ActivityAction.LOGIN)

      expect(logs).toHaveLength(2)
      expect(logs.every((log) => log.action === ActivityAction.LOGIN)).toBe(true)
    })

    it('should return empty array for action with no logs', () => {
      const logs = getLogsByAction(ActivityAction.SETTINGS_CHANGE)

      expect(logs).toEqual([])
    })
  })

  describe('getLogsByDateRange', () => {
    beforeEach(() => {
      jest.setSystemTime(new Date('2026-01-18T12:00:00Z'))
      logActivity('user-1', ActivityAction.LOGIN, 'auth')
      logActivity('user-1', ActivityAction.LOGOUT, 'auth')
    })

    it('should return logs within date range', () => {
      const startDate = new Date('2026-01-17T00:00:00Z')
      const endDate = new Date('2026-01-19T00:00:00Z')

      const logs = getLogsByDateRange(startDate.toISOString(), endDate.toISOString())

      expect(logs.length).toBeGreaterThan(0)
    })

    it('should return empty array for date range with no logs', () => {
      const startDate = new Date('2026-01-01T00:00:00Z')
      const endDate = new Date('2026-01-02T00:00:00Z')

      const logs = getLogsByDateRange(startDate.toISOString(), endDate.toISOString())

      expect(logs).toEqual([])
    })
  })

  describe('calculateActivityStatistics', () => {
    beforeEach(() => {
      jest.setSystemTime(new Date('2026-01-18T12:00:00Z'))
      logActivity('user-1', ActivityAction.LOGIN, 'auth')
      logActivity('user-1', ActivityAction.LOGOUT, 'auth', undefined, {}, false)
      logActivity('user-2', ActivityAction.LOGIN, 'auth')
      logActivity('user-1', ActivityAction.CONTENT_PUBLISH, 'blog')
    })

    it('should calculate total logs', () => {
      const stats = calculateActivityStatistics()

      expect(stats.totalLogs).toBe(4)
    })

    it('should calculate successful logs', () => {
      const stats = calculateActivityStatistics()

      expect(stats.successfulLogs).toBe(3)
    })

    it('should calculate failed logs', () => {
      const stats = calculateActivityStatistics()

      expect(stats.failedLogs).toBe(1)
    })

    it('should calculate logs by action', () => {
      const stats = calculateActivityStatistics()

      expect(stats.logsByAction[ActivityAction.LOGIN]).toBe(2)
      expect(stats.logsByAction[ActivityAction.LOGOUT]).toBe(1)
      expect(stats.logsByAction[ActivityAction.CONTENT_PUBLISH]).toBe(1)
    })

    it('should calculate logs by user', () => {
      const stats = calculateActivityStatistics()

      expect(stats.logsByUser['user-1']).toBe(3)
      expect(stats.logsByUser['user-2']).toBe(1)
    })

    it('should calculate logs by resource', () => {
      const stats = calculateActivityStatistics()

      expect(stats.logsByResource['auth']).toBe(3)
      expect(stats.logsByResource['blog']).toBe(1)
    })

    it('should calculate today activity', () => {
      const stats = calculateActivityStatistics()

      expect(stats.todayActivity).toBe(4)
    })

    it('should calculate last 24h activity', () => {
      const stats = calculateActivityStatistics()

      expect(stats.last24hActivity).toBe(4)
    })

    it('should return recent activity logs', () => {
      const stats = calculateActivityStatistics()

      expect(stats.recentActivity).toHaveLength(4)
    })

    it('should return zero statistics when no logs exist', () => {
      mockLocalStorage.clear()

      const stats = calculateActivityStatistics()

      expect(stats.totalLogs).toBe(0)
      expect(stats.successfulLogs).toBe(0)
      expect(stats.failedLogs).toBe(0)
    })
  })

  describe('exportLogsToCSV', () => {
    it('should return empty string for no logs', () => {
      const csv = exportLogsToCSV([])

      expect(csv).toBe('')
    })

    it('should export logs to CSV format', () => {
      const logs: ActivityLog[] = [
        {
          id: 'LOG-1',
          userId: 'user-1',
          action: ActivityAction.LOGIN,
          resource: 'auth',
          timestamp: '2026-01-18T12:00:00Z',
          ipAddress: '192.168.1.1',
          userAgent: 'Test Agent',
          success: true,
          details: {},
        },
      ]

      const csv = exportLogsToCSV(logs)

      expect(csv).toContain('ID,User ID,Action,Resource')
      expect(csv).toContain('LOG-1')
      expect(csv).toContain('user-1')
      expect(csv).toContain('login')
    })

    it('should handle quotes in CSV data', () => {
      const logs: ActivityLog[] = [
        {
          id: 'LOG-1',
          userId: 'user-1',
          action: ActivityAction.LOGIN,
          resource: 'auth',
          timestamp: '2026-01-18T12:00:00Z',
          ipAddress: '192.168.1.1',
          userAgent: 'Test "Agent"',
          success: true,
          details: {},
        },
      ]

      const csv = exportLogsToCSV(logs)

      expect(csv).toContain('""Test ""Agent""')
    })
  })

  describe('exportLogsToJSON', () => {
    it('should export logs to JSON format', () => {
      const logs: ActivityLog[] = [
        {
          id: 'LOG-1',
          userId: 'user-1',
          action: ActivityAction.LOGIN,
          resource: 'auth',
          timestamp: '2026-01-18T12:00:00Z',
          ipAddress: '192.168.1.1',
          userAgent: 'Test Agent',
          success: true,
          details: {},
        },
      ]

      const json = exportLogsToJSON(logs)

      expect(json).toContain('LOG-1')
      expect(json).toContain('user-1')
      expect(json).toContain('login')
    })
  })

  describe('downloadLogs', () => {
    it('should download logs as CSV', () => {
      const logs: ActivityLog[] = [
        {
          id: 'LOG-1',
          userId: 'user-1',
          action: ActivityAction.LOGIN,
          resource: 'auth',
          timestamp: '2026-01-18T12:00:00Z',
          ipAddress: '192.168.1.1',
          userAgent: 'Test Agent',
          success: true,
          details: {},
        },
      ]

      downloadLogs(logs, 'csv', 'test_logs')

      expect(mockDocument.createElement).toHaveBeenCalledWith('a')
    })

    it('should download logs as JSON', () => {
      const logs: ActivityLog[] = [
        {
          id: 'LOG-1',
          userId: 'user-1',
          action: ActivityAction.LOGIN,
          resource: 'auth',
          timestamp: '2026-01-18T12:00:00Z',
          ipAddress: '192.168.1.1',
          userAgent: 'Test Agent',
          success: true,
          details: {},
        },
      ]

      downloadLogs(logs, 'json', 'test_logs')

      expect(mockDocument.createElement).toHaveBeenCalledWith('a')
    })
  })

  describe('clearLogs', () => {
    beforeEach(() => {
      logActivity('user-1', ActivityAction.LOGIN, 'auth')
      logActivity('user-2', ActivityAction.LOGIN, 'auth')
    })

    it('should clear all logs when no date specified', () => {
      const count = clearLogs()

      expect(count).toBe(2)
      expect(getLogs()).toHaveLength(0)
    })

    it('should clear logs before specified date', () => {
      const yesterday = new Date(Date.now() - 24 * 60 * 60 * 1000)

      const count = clearLogs(yesterday)

      expect(count).toBe(0)
      expect(getLogs()).toHaveLength(2)
    })
  })

  describe('alert rules management', () => {
    it('should get empty alert rules when none exist', () => {
      const rules = getAlertRules()

      expect(rules).toEqual([])
    })

    it('should save alert rule', () => {
      const rule: Omit<AlertRule, 'id'> = {
        name: 'Test Rule',
        action: ActivityAction.LOGIN,
        threshold: 5,
        timeWindow: 10,
        enabled: true,
        description: 'Test description',
      }

      const savedRule = saveAlertRule(rule)

      expect(savedRule).toBeDefined()
      expect(savedRule.id).toMatch(/^RULE-\d+-[a-z0-9]{7}$/)
      expect(savedRule.name).toBe('Test Rule')
    })

    it('should update alert rule', () => {
      const rule: Omit<AlertRule, 'id'> = {
        name: 'Test Rule',
        action: ActivityAction.LOGIN,
        threshold: 5,
        timeWindow: 10,
        enabled: true,
        description: 'Test description',
      }

      const savedRule = saveAlertRule(rule)
      const updatedRule = updateAlertRule(savedRule.id, { enabled: false })

      expect(updatedRule).toBeDefined()
      expect(updatedRule?.enabled).toBe(false)
    })

    it('should return null when updating non-existent rule', () => {
      const result = updateAlertRule('RULE-NONEXISTENT', { enabled: false })

      expect(result).toBeNull()
    })

    it('should delete alert rule', () => {
      const rule: Omit<AlertRule, 'id'> = {
        name: 'Test Rule',
        action: ActivityAction.LOGIN,
        threshold: 5,
        timeWindow: 10,
        enabled: true,
        description: 'Test description',
      }

      const savedRule = saveAlertRule(rule)
      const result = deleteAlertRule(savedRule.id)

      expect(result).toBe(true)
      expect(getAlertRules()).toHaveLength(0)
    })

    it('should return false when deleting non-existent rule', () => {
      const result = deleteAlertRule('RULE-NONEXISTENT')

      expect(result).toBe(false)
    })
  })

  describe('suspicious activity detection', () => {
    it('should detect suspicious activity based on alert rules', () => {
      const rule: Omit<AlertRule, 'id'> = {
        name: 'Multiple Login Attempts',
        action: ActivityAction.LOGIN,
        threshold: 3,
        timeWindow: 10,
        enabled: true,
        description: 'Detects multiple login attempts',
      }

      saveAlertRule(rule)

      for (let i = 0; i < 3; i++) {
        logActivity('user-1', ActivityAction.LOGIN, 'auth')
      }

      const alerts = getSuspiciousAlerts()

      expect(alerts.length).toBeGreaterThan(0)
      expect(alerts[0].ruleId).toMatch(/^RULE-\d+-[a-z0-9]{7}$/)
      expect(alerts[0].userId).toBe('user-1')
      expect(alerts[0].action).toBe(ActivityAction.LOGIN)
      expect(alerts[0].count).toBeGreaterThanOrEqual(3)
    })

    it('should not detect activity below threshold', () => {
      const rule: Omit<AlertRule, 'id'> = {
        name: 'Multiple Login Attempts',
        action: ActivityAction.LOGIN,
        threshold: 5,
        timeWindow: 10,
        enabled: true,
        description: 'Detects multiple login attempts',
      }

      saveAlertRule(rule)

      for (let i = 0; i < 3; i++) {
        logActivity('user-1', ActivityAction.LOGIN, 'auth')
      }

      const alerts = getSuspiciousAlerts()

      expect(alerts).toHaveLength(0)
    })

    it('should not check disabled alert rules', () => {
      const rule: Omit<AlertRule, 'id'> = {
        name: 'Multiple Login Attempts',
        action: ActivityAction.LOGIN,
        threshold: 1,
        timeWindow: 10,
        enabled: false,
        description: 'Detects multiple login attempts',
      }

      saveAlertRule(rule)

      logActivity('user-1', ActivityAction.LOGIN, 'auth')

      const alerts = getSuspiciousAlerts()

      expect(alerts).toHaveLength(0)
    })

    it('should resolve suspicious alert', () => {
      const rule: Omit<AlertRule, 'id'> = {
        name: 'Multiple Login Attempts',
        action: ActivityAction.LOGIN,
        threshold: 1,
        timeWindow: 10,
        enabled: true,
        description: 'Detects multiple login attempts',
      }

      saveAlertRule(rule)
      logActivity('user-1', ActivityAction.LOGIN, 'auth')

      const alerts = getSuspiciousAlerts()
      const result = resolveAlert(alerts[0].id, 'admin-1')

      expect(result).toBe(true)

      const updatedAlerts = getSuspiciousAlerts()
      expect(updatedAlerts[0].resolved).toBe(true)
      expect(updatedAlerts[0].resolvedBy).toBe('admin-1')
      expect(updatedAlerts[0].resolvedAt).toBeDefined()
    })

    it('should return false when resolving non-existent alert', () => {
      const result = resolveAlert('ALERT-NONEXISTENT', 'admin-1')

      expect(result).toBe(false)
    })
  })

  describe('getSuspiciousAlerts', () => {
    it('should return empty array when no alerts exist', () => {
      const alerts = getSuspiciousAlerts()

      expect(alerts).toEqual([])
    })

    it('should return alerts when they exist', () => {
      const rule: Omit<AlertRule, 'id'> = {
        name: 'Test Rule',
        action: ActivityAction.LOGIN,
        threshold: 1,
        timeWindow: 10,
        enabled: true,
        description: 'Test description',
      }

      saveAlertRule(rule)
      logActivity('user-1', ActivityAction.LOGIN, 'auth')

      const alerts = getSuspiciousAlerts()

      expect(alerts.length).toBeGreaterThan(0)
      expect(alerts[0].resolved).toBe(false)
    })
  })

  describe('edge cases', () => {
    it('should handle empty details object', () => {
      const log = logActivity('user-1', ActivityAction.LOGIN, 'auth', undefined, {})

      expect(log.details).toEqual({})
    })

    it('should handle null details', () => {
      const log = logActivity(
        'user-1',
        ActivityAction.LOGIN,
        'auth',
        undefined,
        null as any,
      )

      expect(log.details).toBeNull()
    })

    it('should handle max logs limit', () => {
      for (let i = 0; i < 20000; i++) {
        logActivity(`user-${i}`, ActivityAction.LOGIN, 'auth')
      }

      const logs = getLogs()

      expect(logs.length).toBeLessThanOrEqual(10000)
    })

    it('should handle localStorage quota exceeded', () => {
      jest.spyOn(localStorage, 'setItem').mockImplementation(() => {
        throw new Error('Quota exceeded')
      })

      const log = logActivity('user-1', ActivityAction.LOGIN, 'auth')

      expect(log).toBeDefined()
      expect(getLogs()).toEqual([])
    })

    it('should handle concurrent log operations', () => {
      const promises = []

      for (let i = 0; i < 100; i++) {
        promises.push(logActivity(`user-${i}`, ActivityAction.LOGIN, 'auth'))
      }

      Promise.all(promises)

      const logs = getLogs()

      expect(logs.length).toBeGreaterThan(0)
    })
  })
})
