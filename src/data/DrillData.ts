import {
  BackupDrill,
  DrillType,
  DrillStatus,
  DrillResults,
  DrillScheduleDetails
} from '@/types/drill'

const drillData: BackupDrill[] = [
  {
    id: 'drill-001',
    backupId: 'backup-full-20250119',
    drillType: DrillType.FULL_RESTORE,
    status: DrillStatus.PASSED,
    timestamp: '2025-01-19T02:00:00.000Z',
    duration: 145,
    results: {
      restoreDuration: 138,
      integrityCheckPassed: true,
      dataLossDetected: false,
      itemsRestored: 1247,
      checksumValid: true,
      warnings: [
        'Some user preferences could not be fully validated',
        'Performance metrics indicate slower-than-expected restore'
      ]
    },
    remediationAttempted: false,
    notificationSent: true,
    completedAt: '2025-01-19T02:02:25.000Z'
  },
  {
    id: 'drill-002',
    backupId: 'backup-full-20250118',
    drillType: DrillType.INTEGRITY_CHECK,
    status: DrillStatus.PASSED,
    timestamp: '2025-01-18T02:00:00.000Z',
    duration: 23,
    results: {
      restoreDuration: 0,
      integrityCheckPassed: true,
      dataLossDetected: false,
      itemsRestored: 0,
      checksumValid: true
    },
    remediationAttempted: false,
    notificationSent: true,
    completedAt: '2025-01-18T02:00:23.000Z'
  },
  {
    id: 'drill-003',
    backupId: 'backup-incremental-20250117',
    drillType: DrillType.PARTIAL_RESTORE,
    status: DrillStatus.PASSED,
    timestamp: '2025-01-17T02:00:00.000Z',
    duration: 67,
    results: {
      restoreDuration: 62,
      integrityCheckPassed: true,
      dataLossDetected: false,
      itemsRestored: 156,
      checksumValid: true
    },
    remediationAttempted: false,
    notificationSent: true,
    completedAt: '2025-01-17T02:01:07.000Z'
  },
  {
    id: 'drill-004',
    backupId: 'backup-full-20250116',
    drillType: DrillType.FULL_RESTORE,
    status: DrillStatus.FAILED,
    timestamp: '2025-01-16T02:00:00.000Z',
    duration: 89,
    errors: [
      'Checksum validation failed',
      'Backup file appears corrupted',
      'Unable to decrypt backup data'
    ],
    remediationAttempted: true,
    notificationSent: true,
    completedAt: '2025-01-16T02:01:29.000Z'
  },
  {
    id: 'drill-005',
    backupId: 'backup-full-20250115',
    drillType: DrillType.INTEGRITY_CHECK,
    status: DrillStatus.PASSED,
    timestamp: '2025-01-15T02:00:00.000Z',
    duration: 18,
    results: {
      restoreDuration: 0,
      integrityCheckPassed: true,
      dataLossDetected: false,
      itemsRestored: 0,
      checksumValid: true
    },
    remediationAttempted: false,
    notificationSent: true,
    completedAt: '2025-01-15T02:00:18.000Z'
  },
  {
    id: 'drill-006',
    backupId: 'backup-incremental-20250114',
    drillType: DrillType.PARTIAL_RESTORE,
    status: DrillStatus.CANCELLED,
    timestamp: '2025-01-14T02:00:00.000Z',
    duration: 5,
    remediationAttempted: false,
    notificationSent: false,
    completedAt: '2025-01-14T02:00:05.000Z'
  },
  {
    id: 'drill-007',
    backupId: 'backup-full-20250113',
    drillType: DrillType.INTEGRITY_CHECK,
    status: DrillStatus.PASSED,
    timestamp: '2025-01-13T02:00:00.000Z',
    duration: 21,
    results: {
      restoreDuration: 0,
      integrityCheckPassed: true,
      dataLossDetected: false,
      itemsRestored: 0,
      checksumValid: true
    },
    remediationAttempted: false,
    notificationSent: true,
    completedAt: '2025-01-13T02:00:21.000Z'
  },
  {
    id: 'drill-008',
    backupId: 'backup-full-20250112',
    drillType: DrillType.FULL_RESTORE,
    status: DrillStatus.PASSED,
    timestamp: '2025-01-12T02:00:00.000Z',
    duration: 152,
    results: {
      restoreDuration: 147,
      integrityCheckPassed: true,
      dataLossDetected: false,
      itemsRestored: 1253,
      checksumValid: true
    },
    remediationAttempted: false,
    notificationSent: true,
    completedAt: '2025-01-12T02:02:32.000Z'
  },
  {
    id: 'drill-009',
    backupId: 'backup-incremental-20250111',
    drillType: DrillType.PARTIAL_RESTORE,
    status: DrillStatus.FAILED,
    timestamp: '2025-01-11T02:00:00.000Z',
    duration: 34,
    errors: [
      'Missing expected blog posts in backup',
      'Content data appears incomplete'
    ],
    results: {
      restoreDuration: 31,
      integrityCheckPassed: false,
      dataLossDetected: true,
      itemsRestored: 89,
      checksumValid: true
    },
    remediationAttempted: true,
    notificationSent: true,
    completedAt: '2025-01-11T02:00:34.000Z'
  },
  {
    id: 'drill-010',
    backupId: 'backup-full-20250110',
    drillType: DrillType.INTEGRITY_CHECK,
    status: DrillStatus.PASSED,
    timestamp: '2025-01-10T02:00:00.000Z',
    duration: 19,
    results: {
      restoreDuration: 0,
      integrityCheckPassed: true,
      dataLossDetected: false,
      itemsRestored: 0,
      checksumValid: true
    },
    remediationAttempted: false,
    notificationSent: true,
    completedAt: '2025-01-10T02:00:19.000Z'
  }
]

const drillScheduleData: DrillScheduleDetails[] = [
  {
    drillId: 'drill-sched-001',
    drillType: DrillType.INTEGRITY_CHECK,
    backupId: 'auto-backup',
    scheduledFor: '2025-01-20T02:00:00.000Z',
    recurrence: DrillSchedule.DAILY,
    enabled: true
  },
  {
    drillId: 'drill-sched-002',
    drillType: DrillType.PARTIAL_RESTORE,
    backupId: 'auto-backup',
    scheduledFor: '2025-01-19T03:00:00.000Z',
    recurrence: DrillSchedule.WEEKLY,
    enabled: true
  },
  {
    drillId: 'drill-sched-003',
    drillType: DrillType.FULL_RESTORE,
    backupId: 'auto-backup',
    scheduledFor: '2025-01-26T02:00:00.000Z',
    recurrence: DrillSchedule.MONTHLY,
    enabled: true
  }
]

export default drillData
export { drillScheduleData }
