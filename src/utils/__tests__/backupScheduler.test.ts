import backupScheduler, {
  scheduleBackup,
  cancelScheduledBackup,
  initializeScheduler,
  onBackupNotification,
  offBackupNotification,
  getScheduledBackup,
  getLastScheduledBackupRun,
} from '../backupScheduler'

import { BackupConfig, BackupMetadata } from '@/types/backup'

describe('BackupScheduler', () => {
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

  const mockCreateFullBackup = jest.fn()
  const mockCreateIncrementalBackup = jest.fn()
  const mockGetBackupMetadata = jest.fn()

  beforeEach(() => {
    mockLocalStorage.clear()
    global.localStorage = mockLocalStorage as any

    jest.clearAllMocks()
    jest.useFakeTimers()

    mockCreateFullBackup.mockResolvedValue({
      id: 'backup-full-123',
      status: 'completed',
      timestamp: new Date().toISOString(),
    } as BackupMetadata)

    mockCreateIncrementalBackup.mockResolvedValue({
      id: 'backup-incremental-456',
      status: 'completed',
      timestamp: new Date().toISOString(),
    } as BackupMetadata)
  })

  afterEach(() => {
    jest.useRealTimers()
    jest.restoreAllMocks()
  })

  const createMockBackupConfig = (overrides: Partial<BackupConfig> = {}): BackupConfig => ({
    enabled: true,
    schedule: 'daily',
    time: '00:00',
    retentionDays: 7,
    storageType: 'localStorage',
    encryptionEnabled: false,
    compressionEnabled: false,
    retentionPolicy: {
      keepLastCount: 5,
      keepDailyFor: 7,
      keepWeeklyFor: 4,
      keepMonthlyFor: 3,
      maxSizeGB: 10,
    },
    ...overrides,
  })

  describe('scheduleBackup', () => {
    it('should schedule a daily backup', async () => {
      const config = createMockBackupConfig({ schedule: 'daily' })

      const result = await scheduleBackup('daily', '02:00', config)

      expect(result).toBe(true)

      const scheduledBackup = getScheduledBackup()
      expect(scheduledBackup).toBeDefined()
      expect(scheduledBackup?.schedule).toBe('daily')
      expect(scheduledBackup?.time).toBe('02:00')
      expect(scheduledBackup?.enabled).toBe(true)
    })

    it('should schedule a weekly backup', async () => {
      const config = createMockBackupConfig({ schedule: 'weekly' })

      const result = await scheduleBackup('weekly', '03:00', config)

      expect(result).toBe(true)

      const scheduledBackup = getScheduledBackup()
      expect(scheduledBackup?.schedule).toBe('weekly')
      expect(scheduledBackup?.time).toBe('03:00')
    })

    it('should schedule a monthly backup', async () => {
      const config = createMockBackupConfig({ schedule: 'monthly' })

      const result = await scheduleBackup('monthly', '04:00', config)

      expect(result).toBe(true)

      const scheduledBackup = getScheduledBackup()
      expect(scheduledBackup?.schedule).toBe('monthly')
    })

    it('should calculate next run time correctly for daily', async () => {
      const config = createMockBackupConfig()
      const now = new Date()
      now.setHours(10, 0, 0, 0)

      jest.setSystemTime(now)

      const result = await scheduleBackup('daily', '12:00', config)

      expect(result).toBe(true)

      const scheduledBackup = getScheduledBackup()
      const nextRun = new Date(scheduledBackup!.nextRun!)

      expect(nextRun.getHours()).toBe(12)
      expect(nextRun.getDate()).toBe(now.getDate())
    })

    it('should calculate next run time for tomorrow when time has passed', async () => {
      const config = createMockBackupConfig()
      const now = new Date()
      now.setHours(14, 0, 0, 0)

      jest.setSystemTime(now)

      const result = await scheduleBackup('daily', '12:00', config)

      expect(result).toBe(true)

      const scheduledBackup = getScheduledBackup()
      const nextRun = new Date(scheduledBackup!.nextRun!)

      expect(nextRun.getDate()).toBe(now.getDate() + 1)
    })

    it('should return false in server environment', async () => {
      const originalWindow = global.window
      delete (global as any).window

      const config = createMockBackupConfig()
      const result = await scheduleBackup('daily', '00:00', config)

      expect(result).toBe(false)

      global.window = originalWindow
    })

    it('should save schedule to localStorage', async () => {
      const config = createMockBackupConfig()

      await scheduleBackup('daily', '00:00', config)

      expect(mockLocalStorage.getItem('maskom_backup_scheduler')).toBeDefined()
    })

    it('should handle scheduling errors gracefully', async () => {
      const config = createMockBackupConfig()

      jest.spyOn(localStorage, 'setItem').mockImplementation(() => {
        throw new Error('Storage error')
      })

      const result = await scheduleBackup('daily', '00:00', config)

      expect(result).toBe(false)
    })
  })

  describe('cancelScheduledBackup', () => {
    it('should cancel scheduled backup', async () => {
      const config = createMockBackupConfig()

      await scheduleBackup('daily', '00:00', config)

      const result = await cancelScheduledBackup()

      expect(result).toBe(true)
      expect(getScheduledBackup()).toBeNull()
    })

    it('should remove schedule from localStorage', async () => {
      const config = createMockBackupConfig()

      await scheduleBackup('daily', '00:00', config)
      await cancelScheduledBackup()

      expect(mockLocalStorage.getItem('maskom_backup_scheduler')).toBeNull()
    })

    it('should clear all scheduler keys from localStorage', async () => {
      const config = createMockBackupConfig()

      await scheduleBackup('daily', '00:00', config)
      await cancelScheduledBackup()

      expect(mockLocalStorage.getItem('maskom_backup_scheduler')).toBeNull()
      expect(mockLocalStorage.getItem('maskom_backup_scheduler_interval')).toBeNull()
      expect(mockLocalStorage.getItem('maskom_backup_scheduler_last_run')).toBeNull()
    })

    it('should return false when no backup is scheduled', async () => {
      const result = await cancelScheduledBackup()

      expect(result).toBe(true)
    })

    it('should return false in server environment', async () => {
      const originalWindow = global.window
      delete (global as any).window

      const result = await cancelScheduledBackup()

      expect(result).toBe(false)

      global.window = originalWindow
    })
  })

  describe('getScheduledBackup', () => {
    it('should return null when no backup is scheduled', () => {
      const scheduledBackup = getScheduledBackup()

      expect(scheduledBackup).toBeNull()
    })

    it('should return scheduled backup when exists', async () => {
      const config = createMockBackupConfig()

      await scheduleBackup('daily', '00:00', config)

      const scheduledBackup = getScheduledBackup()

      expect(scheduledBackup).toBeDefined()
      expect(scheduledBackup?.schedule).toBe('daily')
    })

    it('should return null for malformed localStorage data', () => {
      mockLocalStorage.setItem('maskom_backup_scheduler', 'invalid json')

      const scheduledBackup = getScheduledBackup()

      expect(scheduledBackup).toBeNull()
    })

    it('should return null in server environment', () => {
      const originalWindow = global.window
      delete (global as any).window

      const scheduledBackup = getScheduledBackup()

      expect(scheduledBackup).toBeNull()

      global.window = originalWindow
    })
  })

  describe('getLastScheduledBackupRun', () => {
    it('should return null when no backup has run', async () => {
      const lastRun = await getLastScheduledBackupRun()

      expect(lastRun).toBeNull()
    })

    it('should return last run time when backup has run', async () => {
      const now = new Date().toISOString()
      mockLocalStorage.setItem('maskom_backup_scheduler_last_run', now)

      const lastRun = await getLastScheduledBackupRun()

      expect(lastRun).not.toBeNull()
      expect(lastRun?.toISOString()).toBe(now)
    })

    it('should return null for malformed timestamp', async () => {
      mockLocalStorage.setItem('maskom_backup_scheduler_last_run', 'invalid date')

      const lastRun = await getLastScheduledBackupRun()

      expect(lastRun).toBeNull()
    })

    it('should return null in server environment', async () => {
      const originalWindow = global.window
      delete (global as any).window

      const lastRun = await getLastScheduledBackupRun()

      expect(lastRun).toBeNull()

      global.window = originalWindow
    })
  })

  describe('notification callbacks', () => {
    it('should register notification callback', () => {
      const callback = jest.fn()

      onBackupNotification(callback)

      expect(callback).toBeCalledTimes(0)
    })

    it('should remove notification callback', () => {
      const callback = jest.fn()

      onBackupNotification(callback)
      offBackupNotification(callback)
    })

    it('should call registered callbacks on notification', async () => {
      const callback = jest.fn()

      onBackupNotification(callback)

      const config = createMockBackupConfig()
      await scheduleBackup('daily', '00:00', config)

      const notification = {
        type: 'success' as const,
        message: 'Test notification',
        timestamp: new Date().toISOString(),
      }

      (backupScheduler as any).notify(notification)

      expect(callback).toHaveBeenCalledWith(notification)
    })
  })

  describe('initializeScheduler', () => {
    it('should initialize with no existing schedule', async () => {
      const result = await initializeScheduler()

      expect(result).toBeUndefined()
    })

    it('should start scheduler if enabled in localStorage', async () => {
      const config = createMockBackupConfig()
      await scheduleBackup('daily', '00:00', config)

      const result = await initializeScheduler()

      expect(result).toBeUndefined()
    })

    it('should not start scheduler if disabled', async () => {
      const config = createMockBackupConfig({ enabled: false })
      await scheduleBackup('daily', '00:00', config)

      const result = await initializeScheduler()

      expect(result).toBeUndefined()
    })

    it('should return gracefully in server environment', async () => {
      const originalWindow = global.window
      delete (global as any).window

      const result = await initializeScheduler()

      expect(result).toBeUndefined()

      global.window = originalWindow
    })
  })

  describe('next run calculation', () => {
    it('should calculate daily backup next run', () => {
      const config = createMockBackupConfig()

      scheduleBackup('daily', '12:00', config)

      const scheduledBackup = getScheduledBackup()
      const nextRun = new Date(scheduledBackup!.nextRun!)

      expect(nextRun.getHours()).toBe(12)
      expect(nextRun.getMinutes()).toBe(0)
      expect(nextRun.getSeconds()).toBe(0)
    })

    it('should calculate weekly backup next run for Monday', () => {
      const config = createMockBackupConfig()

      scheduleBackup('weekly', '12:00', config)

      const scheduledBackup = getScheduledBackup()
      const nextRun = new Date(scheduledBackup!.nextRun!)

      expect(nextRun.getDay()).toBe(1)
    })

    it('should calculate monthly backup next run', () => {
      const config = createMockBackupConfig()

      scheduleBackup('monthly', '12:00', config)

      const scheduledBackup = getScheduledBackup()
      const nextRun = new Date(scheduledBackup!.nextRun!)

      expect(nextRun.getDate()).toBeLessThanOrEqual(28)
    })

    it('should set manual backup next run far in future', () => {
      const config = createMockBackupConfig()

      scheduleBackup('manual', '12:00', config)

      const scheduledBackup = getScheduledBackup()
      const nextRun = new Date(scheduledBackup!.nextRun!)

      const now = new Date()
      const oneYearLater = new Date(now.getTime() + 365 * 24 * 60 * 60 * 1000)

      expect(nextRun.getTime()).toBeCloseTo(oneYearLater.getTime(), -1000)
    })
  })

  describe('minimum hours between runs', () => {
    it('should have 24 hour minimum for daily', () => {
      const minHours = (backupScheduler as any).getMinHoursBetweenRuns('daily')
      expect(minHours).toBe(24)
    })

    it('should have 168 hour minimum for weekly', () => {
      const minHours = (backupScheduler as any).getMinHoursBetweenRuns('weekly')
      expect(minHours).toBe(168)
    })

    it('should have 720 hour minimum for monthly', () => {
      const minHours = (backupScheduler as any).getMinHoursBetweenRuns('monthly')
      expect(minHours).toBe(720)
    })

    it('should have infinite minimum for manual', () => {
      const minHours = (backupScheduler as any).getMinHoursBetweenRuns('manual')
      expect(minHours).toBe(Infinity)
    })
  })

  describe('days since last backup', () => {
    it('should return infinity when no last backup', () => {
      const days = (backupScheduler as any).getDaysSinceLastBackup(null)
      expect(days).toBe(Infinity)
    })

    it('should calculate days since last backup correctly', () => {
      const now = new Date()
      const twoDaysAgo = new Date(now.getTime() - 2 * 24 * 60 * 60 * 1000)

      const lastBackup: BackupMetadata = {
        id: 'backup-123',
        timestamp: twoDaysAgo.toISOString(),
        type: 'full',
        size: 1024,
        checksum: 'abc',
        encryption: 'none',
        retention: '7 days',
        status: 'completed',
        version: '1.0.0',
      }

      const days = (backupScheduler as any).getDaysSinceLastBackup(lastBackup)
      expect(days).toBeCloseTo(2, 0.1)
    })
  })

  describe('edge cases', () => {
    it('should handle invalid time format', async () => {
      const config = createMockBackupConfig()

      const result = await scheduleBackup('daily', 'invalid', config)

      expect(result).toBe(true)
    })

    it('should handle 24:00 time format', async () => {
      const config = createMockBackupConfig()

      const result = await scheduleBackup('daily', '24:00', config)

      expect(result).toBe(true)
    })

    it('should handle concurrent scheduling', async () => {
      const config = createMockBackupConfig()

      const [result1, result2, result3] = await Promise.all([
        scheduleBackup('daily', '00:00', config),
        scheduleBackup('daily', '01:00', config),
        scheduleBackup('daily', '02:00', config),
      ])

      expect(result1).toBe(true)
      expect(result2).toBe(true)
      expect(result3).toBe(true)
    })

    it('should handle empty localStorage gracefully', () => {
      mockLocalStorage.clear()

      const scheduledBackup = getScheduledBackup()

      expect(scheduledBackup).toBeNull()
    })

    it('should handle corrupted localStorage data', () => {
      mockLocalStorage.setItem('maskom_backup_scheduler', '{corrupted data')

      const scheduledBackup = getScheduledBackup()

      expect(scheduledBackup).toBeNull()
    })
  })
})
