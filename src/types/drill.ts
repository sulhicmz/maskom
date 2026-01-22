export enum DrillType {
  FULL_RESTORE = 'full_restore',
  PARTIAL_RESTORE = 'partial_restore',
  INTEGRITY_CHECK = 'integrity_check'
}

export enum DrillStatus {
  SCHEDULED = 'scheduled',
  RUNNING = 'running',
  PASSED = 'passed',
  FAILED = 'failed',
  CANCELLED = 'cancelled'
}

export enum DrillSchedule {
  DAILY = 'daily',
  WEEKLY = 'weekly',
  MONTHLY = 'monthly',
  MANUAL = 'manual'
}

export interface DrillResults {
  restoreDuration: number
  integrityCheckPassed: boolean
  dataLossDetected: boolean
  itemsRestored: number
  checksumValid: boolean
  errors?: string[]
  warnings?: string[]
}

export interface BackupDrill {
  id: string
  backupId: string
  drillType: DrillType
  status: DrillStatus
  timestamp: string
  duration: number
  results?: DrillResults
  errors?: string[]
  scheduledFor?: string
  startedAt?: string
  completedAt?: string
  remediationAttempted: boolean
  notificationSent: boolean
}

export interface DrillConfig {
  enabled: boolean
  schedule: DrillSchedule
  drillTypes: DrillType[]
  autoRemediate: boolean
  notificationEnabled: boolean
  retentionDays: number
  maxConsecutiveFailures: number
  notificationEmails: string[]
  time: string
}

export interface DrillStatistics {
  totalDrills: number
  successfulDrills: number
  failedDrills: number
  cancelledDrills: number
  averageDuration: number
  lastDrillDate: string | null
  lastDrillStatus: DrillStatus
  consecutiveFailures: number
  healthStatus: DrillHealthStatus
  drillTypeBreakdown: Record<DrillType, DrillTypeStats>
}

export interface DrillTypeStats {
  total: number
  passed: number
  failed: number
  averageDuration: number
}

export type DrillHealthStatus = 'healthy' | 'warning' | 'critical'

export interface DrillFilters {
  drillType?: DrillType[]
  status?: DrillStatus[]
  dateRange?: {
    startDate: string
    endDate: string
  }
  backupId?: string
}

export interface DrillScheduleDetails {
  drillId: string
  drillType: DrillType
  backupId: string
  scheduledFor: string
  recurrence: DrillSchedule
  enabled: boolean
}

export interface DrillProgress {
  current: number
  total: number
  message: string
}

export type DrillProgressCallback = (progress: DrillProgress) => void

export interface DrillExecutionContext {
  drillType: DrillType
  backupId: string
  executeDrill: (onProgress?: DrillProgressCallback) => Promise<DrillResults>
  onProgress?: DrillProgressCallback
  initialProgressMessage: string
  totalSteps: number
}

export interface IDrillStorage {
  getDrillConfig(): Promise<DrillConfig>
  saveDrillConfig(config: DrillConfig): Promise<void>
  saveDrill(drill: BackupDrill): Promise<void>
  loadDrillsFromStorage(): Promise<BackupDrill[]>
  getDrillSchedules(): Promise<DrillScheduleDetails[]>
  saveDrillSchedules(schedules: DrillScheduleDetails[]): Promise<void>
}

export interface IDrillEngine {
  executeFullRestoreDrill(backupId: string, onProgress?: DrillProgressCallback, isolated?: boolean): Promise<BackupDrill>
  executePartialRestoreDrill(backupId: string, onProgress?: DrillProgressCallback, isolated?: boolean): Promise<BackupDrill>
  executeIntegrityCheckDrill(backupId: string, onProgress?: DrillProgressCallback): Promise<BackupDrill>
  scheduleDrill(drillType: DrillType, backupId: string, scheduledFor: string, recurrence: DrillSchedule): Promise<DrillScheduleDetails>
  cancelDrill(drillId: string): Promise<void>
  getDrills(filters?: DrillFilters): Promise<BackupDrill[]>
  getDrillStatistics(): Promise<DrillStatistics>
  getDrillConfig(): Promise<DrillConfig>
  saveDrillConfig(config: DrillConfig): Promise<void>
}

export const DEFAULT_DRILL_CONFIG: DrillConfig = {
  enabled: true,
  schedule: DrillSchedule.WEEKLY,
  drillTypes: [DrillType.INTEGRITY_CHECK, DrillType.PARTIAL_RESTORE],
  autoRemediate: false,
  notificationEnabled: true,
  retentionDays: 90,
  maxConsecutiveFailures:3,
  notificationEmails: [],
  time: '03:00'
}

export const DRILL_STORAGE_KEY = 'maskom_drill_config'
export const DRILL_DATA_KEY = 'maskom_drill_data'
export const DRILL_SCHEDULE_KEY = 'maskom_drill_schedule'
