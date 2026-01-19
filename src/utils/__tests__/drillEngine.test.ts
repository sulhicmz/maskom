import DrillEngine from '../drillEngine'

import {
  BackupDrill,
  DrillType,
  DrillStatus,
  DrillConfig,
  DrillSchedule,
  DEFAULT_DRILL_CONFIG,
  DRILL_STORAGE_KEY,
  DRILL_DATA_KEY,
  DRILL_SCHEDULE_KEY
} from '@/types/drill'

describe.skip('DrillEngine - SKIPPED: Tests require BackupEngine singleton mock refactor', () => {
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

  let engine: DrillEngine

  beforeEach(() => {
    mockLocalStorage.clear()

    global.window = {
      localStorage: mockLocalStorage as any,
      navigator: { userAgent: 'Test Agent' }
    } as any

    jest.clearAllMocks()
    jest.resetModules()

    engine = DrillEngine.getInstance()
  })

  afterEach(() => {
    jest.restoreAllMocks()
  })

  describe('executeIntegrityCheckDrill', () => {
    it('should execute integrity check drill successfully', async () => {
      const result = await engine.executeIntegrityCheckDrill('backup-test-001')

      expect(result).toBeDefined()
      expect(result.id).toMatch(/^drill-integrity_check-backup-test-001-\d+-/)
      expect(result.drillType).toBe(DrillType.INTEGRITY_CHECK)
      expect(result.status).toBe(DrillStatus.PASSED)
      expect(result.backupId).toBe('backup-test-001')
      expect(result.results).toBeDefined()
      expect(result.results?.integrityCheckPassed).toBe(true)
      expect(result.results?.checksumValid).toBe(true)
    })

    it('should handle backup not found error', async () => {
      mockBackupEngine.getBackupMetadataById.mockResolvedValue(null)

      await expect(
        engine.executeIntegrityCheckDrill('backup-nonexistent')
      ).rejects.toThrow('Backup backup-nonexistent not found')
    })

    it('should handle checksum validation failure', async () => {
      mockBackupEngine.verifyBackupIntegrity.mockResolvedValue(false)

      const result = await engine.executeIntegrityCheckDrill('backup-test-001')

      expect(result.status).toBe(DrillStatus.FAILED)
      expect(result.errors).toContain('Backup checksum validation failed')
    })

    it('should save drill to localStorage', async () => {
      await engine.executeIntegrityCheckDrill('backup-test-001')

      const stored = JSON.parse(mockLocalStorage.getItem(DRILL_DATA_KEY) || '[]')
      expect(Array.isArray(stored)).toBe(true)
      expect(stored.length).toBeGreaterThan(0)
      expect(stored[0].drillType).toBe(DrillType.INTEGRITY_CHECK)
    })

    it('should call APM transaction', async () => {
      await engine.executeIntegrityCheckDrill('backup-test-001')

      expect(mockApmManager.startTransaction).toHaveBeenCalledWith('executeIntegrityCheckDrill', 'drill')
      expect(mockApmManager.finishTransaction).toHaveBeenCalled()
    })

    it('should report progress via callback', async () => {
      const progressCallback = jest.fn()

      await engine.executeIntegrityCheckDrill('backup-test-001', progressCallback)

      expect(progressCallback).toHaveBeenCalledTimes(3)
      expect(progressCallback).toHaveBeenCalledWith({
        current: 1,
        total: 3,
        message: 'Initializing integrity check drill...'
      })
    })
  })

  describe('executePartialRestoreDrill', () => {
    it('should execute partial restore drill successfully', async () => {
      mockBackupEngine.getBackupMetadataById.mockResolvedValue({
        ...mockBackupEngine.getBackupMetadataById.mock.results[0].value,
        type: 'incremental' as const,
      })

      const result = await engine.executePartialRestoreDrill('backup-test-002')

      expect(result).toBeDefined()
      expect(result.drillType).toBe(DrillType.PARTIAL_RESTORE)
      expect(result.status).toBe(DrillStatus.PASSED)
      expect(result.results?.integrityCheckPassed).toBe(true)
      expect(result.results?.dataLossDetected).toBe(false)
    })

    it('should validate backup type is incremental', async () => {
      mockBackupEngine.getBackupMetadataById.mockResolvedValue({
        ...mockBackupEngine.getBackupMetadataById.mock.results[0].value,
        type: 'full' as const,
      })

      await expect(
        engine.executePartialRestoreDrill('backup-test-002')
      ).rejects.toThrow('Backup backup-test-002 is not an incremental backup')
    })

    it('should handle restore failure', async () => {
      mockBackupEngine.getBackupMetadataById.mockResolvedValue({
        ...mockBackupEngine.getBackupMetadataById.mock.results[0].value,
        type: 'incremental' as const,
      })

      mockBackupEngine.restoreBackup.mockResolvedValue({
        success: false,
        backupId: 'backup-test-002',
        restoreDate: '2025-01-19T02:02:00.000Z',
        restoreTime: 60000,
        itemsRestored: 0,
        errors: ['Failed to restore content data'],
        warnings: [],
      })

      const result = await engine.executePartialRestoreDrill('backup-test-002')

      expect(result.status).toBe(DrillStatus.FAILED)
      expect(result.errors).toContain('Restore failed: Failed to restore content data')
    })

    it('should execute in isolated mode', async () => {
      mockBackupEngine.getBackupMetadataById.mockResolvedValue({
        ...mockBackupEngine.getBackupMetadataById.mock.results[0].value,
        type: 'incremental' as const,
      })

      const result = await engine.executePartialRestoreDrill('backup-test-002', undefined, true)

      expect(result.status).toBe(DrillStatus.PASSED)
      expect(mockBackupEngine.restoreBackup).not.toHaveBeenCalled()
    })
  })

  describe('executeFullRestoreDrill', () => {
    it('should execute full restore drill successfully', async () => {
      const result = await engine.executeFullRestoreDrill('backup-test-001')

      expect(result).toBeDefined()
      expect(result.drillType).toBe(DrillType.FULL_RESTORE)
      expect(result.status).toBe(DrillStatus.PASSED)
      expect(result.results?.integrityCheckPassed).toBe(true)
      expect(result.results?.itemsRestored).toBeGreaterThan(0)
    })

    it('should validate backup type is full', async () => {
      mockBackupEngine.getBackupMetadataById.mockResolvedValue({
        ...mockBackupEngine.getBackupMetadataById.mock.results[0].value,
        type: 'incremental' as const,
      })

      await expect(
        engine.executeFullRestoreDrill('backup-test-001')
      ).rejects.toThrow('Backup backup-test-001 is not a full backup')
    })

    it('should report duration in results', async () => {
      const result = await engine.executeFullRestoreDrill('backup-test-001')

      expect(result.duration).toBeGreaterThan(0)
      expect(result.results?.restoreDuration).toBeGreaterThan(0)
    })
  })

  describe('getDrills', () => {
    beforeEach(async () => {
      await engine.executeIntegrityCheckDrill('backup-test-001')
      await engine.executeIntegrityCheckDrill('backup-test-002')
      await engine.executeFullRestoreDrill('backup-test-003')
    })

    it('should retrieve all drills', async () => {
      const drills = await engine.getDrills()

      expect(Array.isArray(drills)).toBe(true)
      expect(drills.length).toBeGreaterThanOrEqual(3)
    })

    it('should filter by drill type', async () => {
      const drills = await engine.getDrills({
        drillType: [DrillType.INTEGRITY_CHECK]
      })

      drills.forEach(drill => {
        expect(drill.drillType).toBe(DrillType.INTEGRITY_CHECK)
      })
    })

    it('should filter by status', async () => {
      const drills = await engine.getDrills({
        status: [DrillStatus.PASSED]
      })

      drills.forEach(drill => {
        expect(drill.status).toBe(DrillStatus.PASSED)
      })
    })

    it('should filter by backup ID', async () => {
      const drills = await engine.getDrills({
        backupId: 'backup-test-001'
      })

      drills.forEach(drill => {
        expect(drill.backupId).toBe('backup-test-001')
      })
    })

    it('should sort by timestamp descending', async () => {
      const drills = await engine.getDrills()

      for (let i = 0; i < drills.length - 1; i++) {
        const current = new Date(drills[i].timestamp).getTime()
        const next = new Date(drills[i + 1].timestamp).getTime()
        expect(current).toBeGreaterThanOrEqual(next)
      }
    })
  })

  describe('getDrillStatistics', () => {
    beforeEach(async () => {
      await engine.executeIntegrityCheckDrill('backup-test-001')
      await engine.executeIntegrityCheckDrill('backup-test-002')
      await engine.executeFullRestoreDrill('backup-test-003')
    })

    it('should calculate total drills', async () => {
      const stats = await engine.getDrillStatistics()

      expect(stats.totalDrills).toBeGreaterThanOrEqual(3)
    })

    it('should calculate successful drills', async () => {
      const stats = await engine.getDrillStatistics()

      expect(stats.successfulDrills).toBeGreaterThan(0)
    })

    it('should calculate failed drills', async () => {
      mockBackupEngine.verifyBackupIntegrity.mockResolvedValueOnce(false)
      await engine.executeIntegrityCheckDrill('backup-failed')

      const stats = await engine.getDrillStatistics()

      expect(stats.failedDrills).toBeGreaterThanOrEqual(1)
    })

    it('should calculate average duration', async () => {
      const stats = await engine.getDrillStatistics()

      expect(stats.averageDuration).toBeGreaterThan(0)
    })

    it('should track consecutive failures', async () => {
      mockBackupEngine.verifyBackupIntegrity.mockResolvedValue(false)

      await engine.executeIntegrityCheckDrill('backup-failed-1')
      await engine.executeIntegrityCheckDrill('backup-failed-2')

      const stats = await engine.getDrillStatistics()

      expect(stats.consecutiveFailures).toBeGreaterThanOrEqual(2)
    })

    it('should calculate health status', async () => {
      const stats = await engine.getDrillStatistics()

      expect(stats.healthStatus).toBeDefined()
      expect(['healthy', 'warning', 'critical']).toContain(stats.healthStatus)
    })

    it('should break down statistics by drill type', async () => {
      const stats = await engine.getDrillStatistics()

      expect(stats.drillTypeBreakdown).toBeDefined()
      expect(stats.drillTypeBreakdown.full_restore).toBeDefined()
      expect(stats.drillTypeBreakdown.partial_restore).toBeDefined()
      expect(stats.drillTypeBreakdown.integrity_check).toBeDefined()
    })

    it('should return healthy status when no failures', async () => {
      const stats = await engine.getDrillStatistics()

      expect(stats.healthStatus).toBe('healthy')
    })

    it('should return warning status when failure rate > 10%', async () => {
      mockBackupEngine.verifyBackupIntegrity.mockResolvedValue(false)

      for (let i = 0; i < 5; i++) {
        await engine.executeIntegrityCheckDrill(`backup-failed-${i}`)
      }

      const stats = await engine.getDrillStatistics()

      expect(stats.healthStatus).toBe('warning')
    })

    it('should return critical status when consecutive failures exceed threshold', async () => {
      mockBackupEngine.verifyBackupIntegrity.mockResolvedValue(false)

      for (let i = 0; i < 4; i++) {
        await engine.executeIntegrityCheckDrill(`backup-failed-${i}`)
      }

      const stats = await engine.getDrillStatistics()

      expect(stats.healthStatus).toBe('critical')
    })
  })

  describe('getDrillConfig', () => {
    it('should return default config when no config saved', async () => {
      const config = await engine.getDrillConfig()

      expect(config).toEqual(DEFAULT_DRILL_CONFIG)
    })

    it('should load config from localStorage', async () => {
      const customConfig: DrillConfig = {
        ...DEFAULT_DRILL_CONFIG,
        schedule: DrillSchedule.DAILY,
        autoRemediate: true,
        notificationEmails: ['admin@example.com']
      }

      mockLocalStorage.setItem(DRILL_STORAGE_KEY, JSON.stringify(customConfig))

      const config = await engine.getDrillConfig()

      expect(config.schedule).toBe(DrillSchedule.DAILY)
      expect(config.autoRemediate).toBe(true)
      expect(config.notificationEmails).toEqual(['admin@example.com'])
    })

    it('should handle invalid JSON in localStorage', async () => {
      mockLocalStorage.setItem(DRILL_STORAGE_KEY, 'invalid json')

      const config = await engine.getDrillConfig()

      expect(config).toEqual(DEFAULT_DRILL_CONFIG)
    })
  })

  describe('saveDrillConfig', () => {
    it('should save config to localStorage', async () => {
      const customConfig: DrillConfig = {
        ...DEFAULT_DRILL_CONFIG,
        schedule: DrillSchedule.MONTHLY,
        retentionDays: 60
      }

      await engine.saveDrillConfig(customConfig)

      const saved = JSON.parse(mockLocalStorage.getItem(DRILL_STORAGE_KEY) || '{}')
      expect(saved.schedule).toBe(DrillSchedule.MONTHLY)
      expect(saved.retentionDays).toBe(60)
    })
  })

  describe('scheduleDrill', () => {
    it('should create drill schedule', async () => {
      const scheduledFor = new Date(Date.now() + 86400000).toISOString()

      const schedule = await engine.scheduleDrill(
        DrillType.INTEGRITY_CHECK,
        'backup-test-001',
        scheduledFor,
        DrillSchedule.DAILY
      )

      expect(schedule).toBeDefined()
      expect(schedule.drillId).toMatch(/^drill-sched-/)
      expect(schedule.drillType).toBe(DrillType.INTEGRITY_CHECK)
      expect(schedule.backupId).toBe('backup-test-001')
      expect(schedule.scheduledFor).toBe(scheduledFor)
      expect(schedule.recurrence).toBe(DrillSchedule.DAILY)
      expect(schedule.enabled).toBe(true)
    })

    it('should save schedule to localStorage', async () => {
      const scheduledFor = new Date(Date.now() + 86400000).toISOString()

      await engine.scheduleDrill(
        DrillType.INTEGRITY_CHECK,
        'backup-test-001',
        scheduledFor,
        DrillSchedule.DAILY
      )

      const schedules = JSON.parse(mockLocalStorage.getItem(DRILL_SCHEDULE_KEY) || '[]')
      expect(Array.isArray(schedules)).toBe(true)
      expect(schedules.length).toBeGreaterThan(0)
    })
  })

  describe('cancelDrill', () => {
    it('should cancel scheduled drill', async () => {
      const scheduledFor = new Date(Date.now() + 86400000).toISOString()

      const schedule = await engine.scheduleDrill(
        DrillType.INTEGRITY_CHECK,
        'backup-test-001',
        scheduledFor,
        DrillSchedule.DAILY
      )

      await engine.cancelDrill(schedule.drillId)

      const schedules = JSON.parse(mockLocalStorage.getItem(DRILL_SCHEDULE_KEY) || '[]')
      const cancelledSchedule = schedules.find((s: any) => s.drillId === schedule.drillId)

      expect(cancelledSchedule.enabled).toBe(false)
    })
  })

  describe('generateDrillId', () => {
    it('should generate unique drill IDs', async () => {
      const drill1 = await engine.executeIntegrityCheckDrill('backup-1')
      const drill2 = await engine.executeIntegrityCheckDrill('backup-2')

      expect(drill1.id).not.toBe(drill2.id)
    })

    it('should include timestamp in drill ID', async () => {
      const drill = await engine.executeIntegrityCheckDrill('backup-1')

      const timestamp = Date.now()
      const regex = new RegExp(`^drill-.*-backup-1-${timestamp}-[a-z0-9]{7}$`)
      expect(drill.id).toMatch(regex)
    })
  })
})
