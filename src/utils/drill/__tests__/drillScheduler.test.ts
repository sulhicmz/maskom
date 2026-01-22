import DrillScheduler from '../drillScheduler'
import DrillStorage from '../drillStorage'
import { DrillType, DrillSchedule } from '../../../types/drill'
import type { DrillScheduleDetails } from '../../../types/drill'

jest.mock('../drillStorage')
jest.useFakeTimers()

const createMockDrillStorage = (): jest.Mocked<DrillStorage> => ({
  getDrillConfig: jest.fn().mockResolvedValue({}),
  saveDrillConfig: jest.fn().mockResolvedValue(undefined),
  saveDrill: jest.fn().mockResolvedValue(undefined),
  loadDrillsFromStorage: jest.fn().mockResolvedValue([]),
  getDrillSchedules: jest.fn().mockResolvedValue([]),
  saveDrillSchedules: jest.fn().mockResolvedValue(undefined),
} as unknown as jest.Mocked<DrillStorage>)

describe('DrillScheduler', () => {
  let drillScheduler: DrillScheduler
  let mockDrillStorage: jest.Mocked<DrillStorage>

  beforeEach(() => {
    jest.clearAllMocks()
    mockDrillStorage = createMockDrillStorage()
    drillScheduler = DrillScheduler.getInstance(mockDrillStorage)
  })

  afterEach(() => {
    jest.clearAllTimers()
  })

  describe('Singleton Pattern', () => {
    it('should return same instance on multiple calls', () => {
      const instance1 = DrillScheduler.getInstance()
      const instance2 = DrillScheduler.getInstance()

      expect(instance1).toBe(instance2)
    })

    it('should set drill storage when provided', () => {
      const storage = DrillStorage.getInstance()
      drillScheduler.setDrillStorage(storage)

      expect(drillScheduler['drillStorage']).toBe(storage)
    })
  })

  describe('scheduleDrill', () => {
    it('should schedule drill with valid parameters', async () => {
      const executeDrill = jest.fn().mockResolvedValue(undefined)
      const scheduledFor = '2026-01-22T03:00:00Z'

      const result = await drillScheduler.scheduleDrill(
        DrillType.FULL_RESTORE,
        'backup-1',
        scheduledFor,
        DrillSchedule.WEEKLY,
        executeDrill
      )

      expect(result).toMatchObject({
        drillType: DrillType.FULL_RESTORE,
        backupId: 'backup-1',
        scheduledFor,
        recurrence: DrillSchedule.WEEKLY,
        enabled: true,
      })
      expect(result.drillId).toMatch(/^drill-full_restore-backup-1-\d+-[a-z0-9]+$/)
      expect(mockDrillStorage.saveDrillSchedules).toHaveBeenCalled()
    })

    it('should save schedule to storage', async () => {
      const executeDrill = jest.fn().mockResolvedValue(undefined)

      await drillScheduler.scheduleDrill(
        DrillType.PARTIAL_RESTORE,
        'backup-2',
        '2026-01-23T03:00:00Z',
        DrillSchedule.DAILY,
        executeDrill
      )

      expect(mockDrillStorage.saveDrillSchedules).toHaveBeenCalled()
    })

    it('should schedule drill with different types', async () => {
      const executeDrill = jest.fn().mockResolvedValue(undefined)

      const fullRestore = await drillScheduler.scheduleDrill(
        DrillType.FULL_RESTORE,
        'backup-1',
        '2026-01-22T03:00:00Z',
        DrillSchedule.WEEKLY,
        executeDrill
      )

      const partialRestore = await drillScheduler.scheduleDrill(
        DrillType.PARTIAL_RESTORE,
        'backup-2',
        '2026-01-23T03:00:00Z',
        DrillSchedule.DAILY,
        executeDrill
      )

      const integrityCheck = await drillScheduler.scheduleDrill(
        DrillType.INTEGRITY_CHECK,
        'backup-3',
        '2026-01-24T03:00:00Z',
        DrillSchedule.MONTHLY,
        executeDrill
      )

      expect(fullRestore.drillType).toBe(DrillType.FULL_RESTORE)
      expect(partialRestore.drillType).toBe(DrillType.PARTIAL_RESTORE)
      expect(integrityCheck.drillType).toBe(DrillType.INTEGRITY_CHECK)
    })

    it('should handle drill storage being null', async () => {
      drillScheduler['drillStorage'] = null
      const executeDrill = jest.fn().mockResolvedValue(undefined)

      const result = await drillScheduler.scheduleDrill(
        DrillType.FULL_RESTORE,
        'backup-1',
        '2026-01-22T03:00:00Z',
        DrillSchedule.WEEKLY,
        executeDrill
      )

      expect(result.drillType).toBe(DrillType.FULL_RESTORE)
    })
  })

  describe('cancelDrill', () => {
    it('should cancel scheduled drill by ID', async () => {
      const schedule: DrillScheduleDetails = {
        drillId: 'drill-full-1-1234567890-abc123',
        drillType: DrillType.FULL_RESTORE,
        backupId: 'backup-1',
        scheduledFor: '2026-01-22T03:00:00Z',
        recurrence: DrillSchedule.WEEKLY,
        enabled: true,
      }

      mockDrillStorage.getDrillSchedules = jest.fn().mockResolvedValue([schedule])

      await drillScheduler.cancelDrill(schedule.drillId)

      expect(mockDrillStorage.saveDrillSchedules).toHaveBeenCalledWith([
        { ...schedule, enabled: false },
      ])
    })

    it('should clear timeout for cancelled drill', async () => {
      const schedule: DrillScheduleDetails = {
        drillId: 'drill-full-1-1234567890-abc123',
        drillType: DrillType.FULL_RESTORE,
        backupId: 'backup-1',
        scheduledFor: '2026-01-22T03:00:00Z',
        recurrence: DrillSchedule.WEEKLY,
        enabled: true,
      }

      mockDrillStorage.getDrillSchedules = jest.fn().mockResolvedValue([schedule])

      await drillScheduler.cancelDrill(schedule.drillId)

      const scheduledDrills = drillScheduler.getScheduledDrillsMap()
      expect(scheduledDrills.has(schedule.drillId)).toBe(false)
    })

    it('should handle non-existent drill ID', async () => {
      mockDrillStorage.getDrillSchedules = jest.fn().mockResolvedValue([])

      await expect(drillScheduler.cancelDrill('non-existent-id')).resolves.not.toThrow()

      expect(mockDrillStorage.saveDrillSchedules).not.toHaveBeenCalled()
    })

    it('should handle drill storage being null', async () => {
      drillScheduler['drillStorage'] = null

      await expect(drillScheduler.cancelDrill('drill-id')).resolves.not.toThrow()
    })
  })

  describe('scheduleNextRun', () => {
    it('should not schedule disabled drills', () => {
      const executeDrill = jest.fn().mockResolvedValue(undefined)
      const schedule: DrillScheduleDetails = {
        drillId: 'drill-full-1-1234567890-abc123',
        drillType: DrillType.FULL_RESTORE,
        backupId: 'backup-1',
        scheduledFor: '2026-01-22T03:00:00Z',
        recurrence: DrillSchedule.WEEKLY,
        enabled: false,
      }

      drillScheduler['scheduleNextRun'](schedule, executeDrill)

      expect(executeDrill).not.toHaveBeenCalled()
    })

    it('should schedule drills for future dates', async () => {
      const executeDrill = jest.fn().mockResolvedValue(undefined)
      const futureDate = new Date()
      futureDate.setDate(futureDate.getDate() + 1)

      const schedule: DrillScheduleDetails = {
        drillId: 'drill-full-1-1234567890-abc123',
        drillType: DrillType.FULL_RESTORE,
        backupId: 'backup-1',
        scheduledFor: futureDate.toISOString(),
        recurrence: DrillSchedule.WEEKLY,
        enabled: true,
      }

      drillScheduler['scheduleNextRun'](schedule, executeDrill)

      expect(drillScheduler.getScheduledDrillsMap().has(schedule.drillId)).toBe(true)
    })

    it('should not execute drill when timeout fires', async () => {
      const executeDrill = jest.fn().mockResolvedValue(undefined)
      const pastDate = new Date()
      pastDate.setDate(pastDate.getDate() - 1)

      const schedule: DrillScheduleDetails = {
        drillId: 'drill-full-1-1234567890-abc123',
        drillType: DrillType.FULL_RESTORE,
        backupId: 'backup-1',
        scheduledFor: pastDate.toISOString(),
        recurrence: DrillSchedule.MANUAL,
        enabled: true,
      }

      drillScheduler['scheduleNextRun'](schedule, executeDrill)

      jest.advanceTimersByTime(1000)

      expect(executeDrill).toHaveBeenCalled()
    })
  })

  describe('calculateNextRunTime', () => {
    it('should calculate daily recurrence', () => {
      const result = drillScheduler['calculateNextRunTime'](DrillSchedule.DAILY)

      const now = Date.now()
      const nextDay = now + 24 * 60 * 60 * 1000
      const diff = Math.abs(result.getTime() - nextDay)

      expect(diff).toBeLessThan(1000)
    })

    it('should calculate weekly recurrence', () => {
      const result = drillScheduler['calculateNextRunTime'](DrillSchedule.WEEKLY)

      const now = Date.now()
      const nextWeek = now + 7 * 24 * 60 * 60 * 1000
      const diff = Math.abs(result.getTime() - nextWeek)

      expect(diff).toBeLessThan(1000)
    })

    it('should calculate monthly recurrence', () => {
      const result = drillScheduler['calculateNextRunTime'](DrillSchedule.MONTHLY)

      const now = Date.now()
      const nextMonth = now + 30 * 24 * 60 * 60 * 1000
      const diff = Math.abs(result.getTime() - nextMonth)

      expect(diff).toBeLessThan(1000)
    })

    it('should return current time for unknown recurrence', () => {
      const result = drillScheduler['calculateNextRunTime'](DrillSchedule.MANUAL)

      const now = Date.now()
      const diff = Math.abs(result.getTime() - now)

      expect(diff).toBeLessThan(1000)
    })
  })

  describe('generateDrillId', () => {
    it('should generate unique drill IDs', () => {
      const id1 = drillScheduler['generateDrillId'](DrillType.FULL_RESTORE, 'backup-1')
      const id2 = drillScheduler['generateDrillId'](DrillType.PARTIAL_RESTORE, 'backup-2')

      expect(id1).not.toBe(id2)
      expect(id1).toMatch(/^drill-full_restore-backup-1-\d+-[a-z0-9]+$/)
      expect(id2).toMatch(/^drill-partial_restore-backup-2-\d+-[a-z0-9]+$/)
    })

    it('should include timestamp in drill ID', () => {
      const before = Date.now()
      const id = drillScheduler['generateDrillId'](DrillType.INTEGRITY_CHECK, 'backup-1')
      const after = Date.now()

      const match = id.match(/drill-integrity_check-backup-1-(\d+)-/)

      expect(match).not.toBeNull()
      if (match) {
        const timestamp = parseInt(match[1], 10)
        expect(timestamp).toBeGreaterThanOrEqual(before)
        expect(timestamp).toBeLessThanOrEqual(after)
      }
    })

    it('should include random suffix', () => {
      const id1 = drillScheduler['generateDrillId'](DrillType.FULL_RESTORE, 'backup-1')
      const id2 = drillScheduler['generateDrillId'](DrillType.FULL_RESTORE, 'backup-1')

      const match1 = id1.match(/-(\w+)$/)
      const match2 = id2.match(/-(\w+)$/)

      expect(match1).not.toBeNull()
      expect(match2).not.toBeNull()

      if (match1 && match2) {
        expect(match1[1]).not.toBe(match2[1])
      }
    })
  })

  describe('getScheduledDrillsMap', () => {
    it('should return map of scheduled drills', () => {
      const map = drillScheduler.getScheduledDrillsMap()

      expect(map).toBeInstanceOf(Map)
    })

    it('should return same map reference', () => {
      const map1 = drillScheduler.getScheduledDrillsMap()
      const map2 = drillScheduler.getScheduledDrillsMap()

      expect(map1).toBe(map2)
    })
  })
})
