import DrillStatisticsCalculator from '../drillStatistics'
import { DrillType, DrillStatus, DEFAULT_DRILL_CONFIG } from '../../../types/drill'
import type { BackupDrill, DrillStatistics } from '../../../types/drill'

describe('DrillStatisticsCalculator', () => {
  let calculator: DrillStatisticsCalculator

  beforeEach(() => {
    calculator = new DrillStatisticsCalculator()
  })

  describe('calculateDrillStatistics', () => {
    const mockDrills: BackupDrill[] = [
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
        status: DrillStatus.PASSED,
        timestamp: '2026-01-20T00:00:00Z',
        duration: 90,
        remediationAttempted: false,
        notificationSent: false,
      },
      {
        id: 'drill-3',
        backupId: 'backup-1',
        drillType: DrillType.INTEGRITY_CHECK,
        status: DrillStatus.PASSED,
        timestamp: '2026-01-19T00:00:00Z',
        duration: 60,
        remediationAttempted: false,
        notificationSent: false,
      },
      {
        id: 'drill-4',
        backupId: 'backup-2',
        drillType: DrillType.PARTIAL_RESTORE,
        status: DrillStatus.CANCELLED,
        timestamp: '2026-01-18T00:00:00Z',
        duration: 0,
        remediationAttempted: false,
        notificationSent: false,
      },
    ]

    it('should calculate total drill count', () => {
      const stats = calculator.calculateDrillStatistics(mockDrills, DEFAULT_DRILL_CONFIG)

      expect(stats.totalDrills).toBe(4)
    })

    it('should count successful drills', () => {
      const stats = calculator.calculateDrillStatistics(mockDrills, DEFAULT_DRILL_CONFIG)

      expect(stats.successfulDrills).toBe(3)
    })

    it('should count failed drills', () => {
      const stats = calculator.calculateDrillStatistics(mockDrills, DEFAULT_DRILL_CONFIG)

      expect(stats.failedDrills).toBe(0)
    })

    it('should count cancelled drills', () => {
      const stats = calculator.calculateDrillStatistics(mockDrills, DEFAULT_DRILL_CONFIG)

      expect(stats.cancelledDrills).toBe(1)
    })

    it('should calculate average duration', () => {
      const stats = calculator.calculateDrillStatistics(mockDrills, DEFAULT_DRILL_CONFIG)

      const expectedAverage = Math.round((120 + 90 + 60) / 3)
      expect(stats.averageDuration).toBe(expectedAverage)
    })

    it('should calculate average duration with failed drill', () => {
      const drillsWithFailure: BackupDrill[] = [
        ...mockDrills,
        {
          id: 'drill-5',
          backupId: 'backup-1',
          drillType: DrillType.FULL_RESTORE,
          status: DrillStatus.FAILED,
          timestamp: '2026-01-17T00:00:00Z',
          duration: 100,
          remediationAttempted: false,
          notificationSent: false,
        },
      ]

      const stats = calculator.calculateDrillStatistics(drillsWithFailure, DEFAULT_DRILL_CONFIG)

      expect(stats.failedDrills).toBe(1)
      expect(stats.averageDuration).toBe(Math.round((120 + 90 + 60 + 100) / 4))
    })

    it('should return critical health status for >=20% failure rate', () => {
      const highFailureDrills: BackupDrill[] = Array.from({ length: 10 }, (_, i) => ({
        id: `drill-${i}`,
        backupId: 'backup-1',
        drillType: DrillType.FULL_RESTORE,
        status: i < 3 ? DrillStatus.FAILED : DrillStatus.PASSED,
        timestamp: `2026-01-${10 - i}T00:00:00Z`,
        duration: 100,
        remediationAttempted: false,
        notificationSent: false,
      }))

      const stats = calculator.calculateDrillStatistics(highFailureDrills, DEFAULT_DRILL_CONFIG)

      expect(stats.failedDrills).toBe(3)
      expect(stats.totalDrills).toBe(10)
      expect(stats.healthStatus).toBe('critical')
    })

    it('should return zero average duration when no completed drills', () => {
      const incompleteDrills: BackupDrill[] = [
        {
          id: 'drill-1',
          backupId: 'backup-1',
          drillType: DrillType.FULL_RESTORE,
          status: DrillStatus.SCHEDULED,
          timestamp: '2026-01-21T00:00:00Z',
          duration: 0,
          remediationAttempted: false,
          notificationSent: false,
        },
      ]

      const stats = calculator.calculateDrillStatistics(incompleteDrills, DEFAULT_DRILL_CONFIG)

      expect(stats.averageDuration).toBe(0)
    })

    it('should return last drill date', () => {
      const stats = calculator.calculateDrillStatistics(mockDrills, DEFAULT_DRILL_CONFIG)

      expect(stats.lastDrillDate).toBe('2026-01-21T00:00:00Z')
    })

    it('should return last drill status', () => {
      const stats = calculator.calculateDrillStatistics(mockDrills, DEFAULT_DRILL_CONFIG)

      expect(stats.lastDrillStatus).toBe(DrillStatus.PASSED)
    })

    it('should return null for last drill date when no drills', () => {
      const stats = calculator.calculateDrillStatistics([], DEFAULT_DRILL_CONFIG)

      expect(stats.lastDrillDate).toBe(null)
    })

    it('should return SCHEDULED for last drill status when no drills', () => {
      const stats = calculator.calculateDrillStatistics([], DEFAULT_DRILL_CONFIG)

      expect(stats.lastDrillStatus).toBe(DrillStatus.SCHEDULED)
    })

    it('should calculate consecutive failures from most recent', () => {
      const recentFailures: BackupDrill[] = [
        {
          id: 'drill-1',
          backupId: 'backup-1',
          drillType: DrillType.FULL_RESTORE,
          status: DrillStatus.FAILED,
          timestamp: '2026-01-21T00:00:00Z',
          duration: 90,
          remediationAttempted: false,
          notificationSent: false,
        },
        {
          id: 'drill-2',
          backupId: 'backup-2',
          drillType: DrillType.PARTIAL_RESTORE,
          status: DrillStatus.FAILED,
          timestamp: '2026-01-20T00:00:00Z',
          duration: 80,
          remediationAttempted: false,
          notificationSent: false,
        },
        {
          id: 'drill-3',
          backupId: 'backup-1',
          drillType: DrillType.INTEGRITY_CHECK,
          status: DrillStatus.PASSED,
          timestamp: '2026-01-19T00:00:00Z',
          duration: 60,
          remediationAttempted: false,
          notificationSent: false,
        },
      ]

      const stats = calculator.calculateDrillStatistics(recentFailures, DEFAULT_DRILL_CONFIG)

      expect(stats.consecutiveFailures).toBe(2)
    })

    it('should return zero consecutive failures when most recent passed', () => {
      const stats = calculator.calculateDrillStatistics(mockDrills, DEFAULT_DRILL_CONFIG)

      expect(stats.consecutiveFailures).toBe(0)
    })

    it('should return healthy health status when no failures', () => {
      const stats = calculator.calculateDrillStatistics(mockDrills, DEFAULT_DRILL_CONFIG)

      expect(stats.healthStatus).toBe('healthy')
    })

    it('should return warning health status for >10% failure rate', () => {
      const mixedDrills: BackupDrill[] = Array.from({ length: 10 }, (_, i) => ({
        id: `drill-${i}`,
        backupId: 'backup-1',
        drillType: DrillType.FULL_RESTORE,
        status: i < 2 ? DrillStatus.FAILED : DrillStatus.PASSED,
        timestamp: `2026-01-${10 - i}T00:00:00Z`,
        duration: 100,
        remediationAttempted: false,
        notificationSent: false,
      }))

      const stats = calculator.calculateDrillStatistics(mixedDrills, DEFAULT_DRILL_CONFIG)

      expect(stats.failedDrills).toBe(2)
      expect(stats.totalDrills).toBe(10)
      expect(stats.healthStatus).toBe('warning')
    })

    it('should return critical health status for >=20% failure rate', () => {
      const highFailureDrills: BackupDrill[] = Array.from({ length: 10 }, (_, i) => ({
        id: `drill-${i}`,
        backupId: 'backup-1',
        drillType: DrillType.FULL_RESTORE,
        status: i < 3 ? DrillStatus.FAILED : DrillStatus.PASSED,
        timestamp: `2026-01-${10 - i}T00:00:00Z`,
        duration: 100,
        remediationAttempted: false,
        notificationSent: false,
      }))

      const stats = calculator.calculateDrillStatistics(highFailureDrills, DEFAULT_DRILL_CONFIG)

      expect(stats.healthStatus).toBe('critical')
    })

    it('should return critical health status for max consecutive failures', () => {
      const consecutiveFailures: BackupDrill[] = Array.from({ length: 5 }, (_, i) => ({
        id: `drill-${i}`,
        backupId: 'backup-1',
        drillType: DrillType.FULL_RESTORE,
        status: DrillStatus.FAILED,
        timestamp: `2026-01-${5 - i}T00:00:00Z`,
        duration: 90,
        remediationAttempted: false,
        notificationSent: false,
      }))

      const stats = calculator.calculateDrillStatistics(consecutiveFailures, DEFAULT_DRILL_CONFIG)

      expect(stats.healthStatus).toBe('critical')
    })

    it('should calculate drill type breakdown', () => {
      const stats = calculator.calculateDrillStatistics(mockDrills, DEFAULT_DRILL_CONFIG)

      expect(stats.drillTypeBreakdown).toHaveProperty(DrillType.FULL_RESTORE)
      expect(stats.drillTypeBreakdown).toHaveProperty(DrillType.PARTIAL_RESTORE)
      expect(stats.drillTypeBreakdown).toHaveProperty(DrillType.INTEGRITY_CHECK)

      expect(stats.drillTypeBreakdown[DrillType.FULL_RESTORE].total).toBe(1)
      expect(stats.drillTypeBreakdown[DrillType.PARTIAL_RESTORE].total).toBe(2)
      expect(stats.drillTypeBreakdown[DrillType.INTEGRITY_CHECK].total).toBe(1)
    })

    it('should calculate drill type stats correctly', () => {
      const stats = calculator.calculateDrillStatistics(mockDrills, DEFAULT_DRILL_CONFIG)

      expect(stats.drillTypeBreakdown[DrillType.FULL_RESTORE].total).toBe(1)
      expect(stats.drillTypeBreakdown[DrillType.FULL_RESTORE].passed).toBe(1)
      expect(stats.drillTypeBreakdown[DrillType.FULL_RESTORE].failed).toBe(0)
      expect(stats.drillTypeBreakdown[DrillType.FULL_RESTORE].averageDuration).toBe(120)
    })

    it('should handle empty drill array', () => {
      const stats: DrillStatistics = calculator.calculateDrillStatistics([], DEFAULT_DRILL_CONFIG)

      expect(stats.totalDrills).toBe(0)
      expect(stats.successfulDrills).toBe(0)
      expect(stats.failedDrills).toBe(0)
      expect(stats.cancelledDrills).toBe(0)
      expect(stats.averageDuration).toBe(0)
      expect(stats.lastDrillDate).toBe(null)
      expect(stats.lastDrillStatus).toBe(DrillStatus.SCHEDULED)
      expect(stats.consecutiveFailures).toBe(0)
      expect(stats.healthStatus).toBe('healthy')
    })

    it('should handle drills with only cancelled status', () => {
      const cancelledDrills: BackupDrill[] = [
        {
          id: 'drill-1',
          backupId: 'backup-1',
          drillType: DrillType.FULL_RESTORE,
          status: DrillStatus.CANCELLED,
          timestamp: '2026-01-21T00:00:00Z',
          duration: 0,
          remediationAttempted: false,
          notificationSent: false,
        },
        {
          id: 'drill-2',
          backupId: 'backup-2',
          drillType: DrillType.PARTIAL_RESTORE,
          status: DrillStatus.CANCELLED,
          timestamp: '2026-01-20T00:00:00Z',
          duration: 0,
          remediationAttempted: false,
          notificationSent: false,
        },
      ]

      const stats = calculator.calculateDrillStatistics(cancelledDrills, DEFAULT_DRILL_CONFIG)

      expect(stats.totalDrills).toBe(2)
      expect(stats.successfulDrills).toBe(0)
      expect(stats.failedDrills).toBe(0)
      expect(stats.cancelledDrills).toBe(2)
      expect(stats.averageDuration).toBe(0)
    })
  })

  describe('calculateDrillTypeStats', () => {
    it('should calculate stats for specific drill type', () => {
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
          drillType: DrillType.FULL_RESTORE,
          status: DrillStatus.FAILED,
          timestamp: '2026-01-20T00:00:00Z',
          duration: 90,
          remediationAttempted: false,
          notificationSent: false,
        },
        {
          id: 'drill-3',
          backupId: 'backup-3',
          drillType: DrillType.FULL_RESTORE,
          status: DrillStatus.PASSED,
          timestamp: '2026-01-19T00:00:00Z',
          duration: 110,
          remediationAttempted: false,
          notificationSent: false,
        },
      ]

      const stats = calculator['calculateDrillTypeStats'](drills, DrillType.FULL_RESTORE)

      expect(stats.total).toBe(3)
      expect(stats.passed).toBe(2)
      expect(stats.failed).toBe(1)
      expect(stats.averageDuration).toBe(Math.round((120 + 90 + 110) / 3))
    })

    it('should handle empty drill array for type stats', () => {
      const stats = calculator['calculateDrillTypeStats']([], DrillType.FULL_RESTORE)

      expect(stats.total).toBe(0)
      expect(stats.passed).toBe(0)
      expect(stats.failed).toBe(0)
      expect(stats.averageDuration).toBe(0)
    })

    it('should handle drills with no completed status', () => {
      const incompleteDrills: BackupDrill[] = [
        {
          id: 'drill-1',
          backupId: 'backup-1',
          drillType: DrillType.INTEGRITY_CHECK,
          status: DrillStatus.SCHEDULED,
          timestamp: '2026-01-21T00:00:00Z',
          duration: 0,
          remediationAttempted: false,
          notificationSent: false,
        },
        {
          id: 'drill-2',
          backupId: 'backup-2',
          drillType: DrillType.INTEGRITY_CHECK,
          status: DrillStatus.RUNNING,
          timestamp: '2026-01-20T00:00:00Z',
          duration: 0,
          remediationAttempted: false,
          notificationSent: false,
        },
      ]

      const stats = calculator['calculateDrillTypeStats'](incompleteDrills, DrillType.INTEGRITY_CHECK)

      expect(stats.total).toBe(2)
      expect(stats.passed).toBe(0)
      expect(stats.failed).toBe(0)
      expect(stats.averageDuration).toBe(0)
    })
  })

  describe('calculateHealthStatus', () => {
    it('should return healthy when no failures', () => {
      const status = calculator['calculateHealthStatus'](0, 0, 10, 3)

      expect(status).toBe('healthy')
    })

    it('should return warning for >10% failure rate', () => {
      const status = calculator['calculateHealthStatus'](0, 2, 10, 3)

      expect(status).toBe('warning')
    })

    it('should return critical for >=20% failure rate', () => {
      const status = calculator['calculateHealthStatus'](0, 3, 10, 3)

      expect(status).toBe('critical')
    })

    it('should return critical for max consecutive failures', () => {
      const status = calculator['calculateHealthStatus'](3, 1, 10, 3)

      expect(status).toBe('critical')
    })

    it('should handle zero total drills', () => {
      const status = calculator['calculateHealthStatus'](0, 0, 0, 3)

      expect(status).toBe('healthy')
    })
  })
})
