import DrillStorage from '../drillStorage'
import type { BackupDrill, DrillConfig, DrillScheduleDetails } from '../../../types/drill'
import { DrillStatus, DrillType, DrillSchedule, DEFAULT_DRILL_CONFIG } from '../../../types/drill'

const mockLocalStorage = {
  getItem: jest.fn(),
  setItem: jest.fn(),
  removeItem: jest.fn(),
  clear: jest.fn(),
}

describe('DrillStorage', () => {
  let drillStorage: DrillStorage

  beforeEach(() => {
    Object.defineProperty(global, 'localStorage', {
      value: mockLocalStorage,
      writable: true,
      configurable: true,
    })
    drillStorage = DrillStorage.getInstance()
    jest.clearAllMocks()
  })

  afterEach(() => {
    jest.clearAllMocks()
  })

  describe('Singleton Pattern', () => {
    it('should return same instance on multiple calls', () => {
      const instance1 = DrillStorage.getInstance()
      const instance2 = DrillStorage.getInstance()

      expect(instance1).toBe(instance2)
    })
  })

  describe('getDrillConfig', () => {
    it('should return default config when localStorage is empty', async () => {
      mockLocalStorage.getItem.mockReturnValue(null)

      const config = await drillStorage.getDrillConfig()

      expect(config).toEqual(DEFAULT_DRILL_CONFIG)
      expect(config.enabled).toBe(true)
      expect(config.schedule).toBe(DrillSchedule.WEEKLY)
    })

    it('should return saved config from localStorage', async () => {
      const customConfig: DrillConfig = {
        ...DEFAULT_DRILL_CONFIG,
        enabled: false,
        schedule: DrillSchedule.DAILY,
        maxConsecutiveFailures: 5,
      }

      mockLocalStorage.getItem.mockReturnValue(JSON.stringify(customConfig))

      const config = await drillStorage.getDrillConfig()

      expect(config).toEqual(customConfig)
      expect(config.enabled).toBe(false)
      expect(config.schedule).toBe(DrillSchedule.DAILY)
      expect(config.maxConsecutiveFailures).toBe(5)
    })

    it('should handle JSON parse errors gracefully', async () => {
      mockLocalStorage.getItem.mockReturnValue('invalid json')

      const config = await drillStorage.getDrillConfig()

      expect(config).toEqual(DEFAULT_DRILL_CONFIG)
    })
  })

  describe('saveDrillConfig', () => {
    it('should save config to localStorage', async () => {
      const customConfig: DrillConfig = {
        ...DEFAULT_DRILL_CONFIG,
        enabled: false,
        maxConsecutiveFailures: 5,
      }

      await drillStorage.saveDrillConfig(customConfig)

      expect(mockLocalStorage.setItem).toHaveBeenCalledWith('maskom_drill_config', JSON.stringify(customConfig))
    })
  })

  describe('saveDrill', () => {
    it('should add new drill to storage', async () => {
      const drill: BackupDrill = {
        id: 'drill-1',
        backupId: 'backup-1',
        drillType: DrillType.FULL_RESTORE,
        status: DrillStatus.SCHEDULED,
        timestamp: '2026-01-21T00:00:00Z',
        duration: 0,
        remediationAttempted: false,
        notificationSent: false,
      }

      mockLocalStorage.getItem.mockReturnValue('[]')

      await drillStorage.saveDrill(drill)

      expect(mockLocalStorage.setItem).toHaveBeenCalledWith(
        'maskom_drill_data',
        JSON.stringify([drill])
      )
    })

    it('should update existing drill in storage', async () => {
      const existingDrill: BackupDrill = {
        id: 'drill-1',
        backupId: 'backup-1',
        drillType: DrillType.FULL_RESTORE,
        status: DrillStatus.SCHEDULED,
        timestamp: '2026-01-21T00:00:00Z',
        duration: 0,
        remediationAttempted: false,
        notificationSent: false,
      }

      const updatedDrill: BackupDrill = {
        ...existingDrill,
        status: DrillStatus.PASSED,
        duration: 120,
      }

      mockLocalStorage.getItem.mockReturnValue(JSON.stringify([existingDrill]))

      await drillStorage.saveDrill(updatedDrill)

      expect(mockLocalStorage.setItem).toHaveBeenCalledWith(
        'maskom_drill_data',
        JSON.stringify([updatedDrill])
      )
    })

    it('should handle empty drills array', async () => {
      const drill: BackupDrill = {
        id: 'drill-1',
        backupId: 'backup-1',
        drillType: DrillType.FULL_RESTORE,
        status: DrillStatus.SCHEDULED,
        timestamp: '2026-01-21T00:00:00Z',
        duration: 0,
        remediationAttempted: false,
        notificationSent: false,
      }

      mockLocalStorage.getItem.mockReturnValue(null)

      await drillStorage.saveDrill(drill)

      expect(mockLocalStorage.setItem).toHaveBeenCalledWith(
        'maskom_drill_data',
        JSON.stringify([drill])
      )
    })
  })

  describe('loadDrillsFromStorage', () => {
    it('should return empty array when no drills in storage', async () => {
      mockLocalStorage.getItem.mockReturnValue(null)

      const drills = await drillStorage.loadDrillsFromStorage()

      expect(drills).toEqual([])
    })

    it('should return drills from localStorage', async () => {
      const drills: BackupDrill[] = [
        {
          id: 'drill-1',
          backupId: 'backup-1',
          drillType: DrillType.FULL_RESTORE,
          status: DrillStatus.PASSED,
          timestamp: '2026-01-21T00:00:00Z',
          duration: 120,
          remediationAttempted: false,
          notificationSent: false,
        },
        {
          id: 'drill-2',
          backupId: 'backup-2',
          drillType: DrillType.PARTIAL_RESTORE,
          status: DrillStatus.FAILED,
          timestamp: '2026-01-20T00:00:00Z',
          duration: 90,
          remediationAttempted: false,
          notificationSent: false,
        },
      ]

      mockLocalStorage.getItem.mockReturnValue(JSON.stringify(drills))

      const loadedDrills = await drillStorage.loadDrillsFromStorage()

      expect(loadedDrills).toEqual(drills)
      expect(loadedDrills.length).toBe(2)
    })

    it('should handle JSON parse errors gracefully', async () => {
      mockLocalStorage.getItem.mockReturnValue('invalid json')

      const drills = await drillStorage.loadDrillsFromStorage()

      expect(drills).toEqual([])
    })
  })

  describe('getDrillSchedules', () => {
    it('should return empty array when no schedules in storage', async () => {
      mockLocalStorage.getItem.mockReturnValue(null)

      const schedules = await drillStorage.getDrillSchedules()

      expect(schedules).toEqual([])
    })

    it('should return schedules from localStorage', async () => {
      const schedules: DrillScheduleDetails[] = [
        {
          drillId: 'drill-full-1-1234567890-abc123',
          drillType: DrillType.FULL_RESTORE,
          backupId: 'backup-1',
          scheduledFor: '2026-01-22T03:00:00Z',
          recurrence: DrillSchedule.WEEKLY,
          enabled: true,
        },
        {
          drillId: 'drill-partial-1-1234567891-def456',
          drillType: DrillType.PARTIAL_RESTORE,
          backupId: 'backup-1',
          scheduledFor: '2026-01-23T03:00:00Z',
          recurrence: DrillSchedule.DAILY,
          enabled: true,
        },
      ]

      mockLocalStorage.getItem.mockReturnValue(JSON.stringify(schedules))

      const loadedSchedules = await drillStorage.getDrillSchedules()

      expect(loadedSchedules).toEqual(schedules)
      expect(loadedSchedules.length).toBe(2)
    })

    it('should handle JSON parse errors gracefully', async () => {
      mockLocalStorage.getItem.mockReturnValue('invalid json')

      const schedules = await drillStorage.getDrillSchedules()

      expect(schedules).toEqual([])
    })
  })

  describe('saveDrillSchedules', () => {
    it('should save schedules to localStorage', async () => {
      const schedules: DrillScheduleDetails[] = [
        {
          drillId: 'drill-full-1-1234567890-abc123',
          drillType: DrillType.FULL_RESTORE,
          backupId: 'backup-1',
          scheduledFor: '2026-01-22T03:00:00Z',
          recurrence: DrillSchedule.WEEKLY,
          enabled: true,
        },
      ]

      await drillStorage.saveDrillSchedules(schedules)

      expect(mockLocalStorage.setItem).toHaveBeenCalledWith(
        'maskom_drill_schedule',
        JSON.stringify(schedules)
      )
    })

    it('should handle empty schedules array', async () => {
      await drillStorage.saveDrillSchedules([])

      expect(mockLocalStorage.setItem).toHaveBeenCalledWith('maskom_drill_schedule', JSON.stringify([]))
    })
  })
})
