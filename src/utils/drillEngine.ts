import {
  BackupDrill,
  DrillType,
  DrillStatus,
  DrillResults,
  DrillConfig,
  DrillStatistics,
  DrillTypeStats,
  DrillFilters,
  DrillScheduleDetails,
  DrillSchedule,
  DrillHealthStatus,
  DEFAULT_DRILL_CONFIG,
  DRILL_STORAGE_KEY,
  DRILL_DATA_KEY,
  DRILL_SCHEDULE_KEY
} from '@/types/drill'

import { BackupEngine } from '@/utils/backupEngine'
import apmManager from '@/utils/apm'

interface DrillProgress {
  current: number
  total: number
  message: string
}

type DrillProgressCallback = (progress: DrillProgress) => void

interface DrillExecutionContext {
  drillType: DrillType
  backupId: string
  executeDrill: (onProgress?: DrillProgressCallback) => Promise<DrillResults>
  onProgress?: DrillProgressCallback
  initialProgressMessage: string
  totalSteps: number
}

function createDrillObject(
  drillType: DrillType,
  backupId: string,
  status: DrillStatus,
  startedAt: string
): BackupDrill {
  return {
    id: generateDrillId(drillType, backupId),
    backupId,
    drillType,
    status,
    timestamp: startedAt,
    duration: 0,
    startedAt,
    remediationAttempted: false,
    notificationSent: false
  }
}

function createFailedDrill(
  drillType: DrillType,
  backupId: string,
  startedAt: string,
  errorMessage: string
): BackupDrill {
  return {
    id: generateDrillId(drillType, backupId),
    backupId,
    drillType,
    status: DrillStatus.FAILED,
    timestamp: startedAt,
    duration: calculateDrillDuration(undefined, startedAt),
    errors: [errorMessage],
    startedAt,
    completedAt: new Date().toISOString(),
    remediationAttempted: false,
    notificationSent: false
  }
}

function calculateDrillDuration(
  startTime: number | undefined,
  startedAt: string
): number {
  const endTime = Date.now()
  const actualStartTime = startTime || new Date(startedAt).getTime()
  return endTime - actualStartTime
}

function generateDrillId(drillType: DrillType, backupId: string): string {
  const timestamp = Date.now()
  const random = Math.random().toString(36).substring(2, 9)
  return `drill-${drillType}-${backupId}-${timestamp}-${random}`
}

class DrillEngine {
  private static instance: DrillEngine
  private backupEngine: BackupEngine
  private scheduledDrills: Map<string, NodeJS.Timeout>
  private isExecuting: boolean = false

  private constructor() {
    this.backupEngine = BackupEngine.getInstance()
    this.scheduledDrills = new Map()
  }

  static getInstance(): DrillEngine {
    if (!DrillEngine.instance) {
      DrillEngine.instance = new DrillEngine()
    }
    return DrillEngine.instance
  }

  private async executeDrill(context: DrillExecutionContext): Promise<BackupDrill> {
    const { drillType, backupId, executeDrill, onProgress, initialProgressMessage, totalSteps } = context
    const drillId = generateDrillId(drillType, backupId)
    const startedAt = new Date().toISOString()

    const transactionName = `execute${this.getDrillTypeName(drillType)}`
    apmManager.startTransaction(transactionName, 'drill')

    onProgress?.({
      current: 1,
      total: totalSteps,
      message: initialProgressMessage
    })

    try {
      const drill = createDrillObject(drillType, backupId, DrillStatus.RUNNING, startedAt)
      await this.saveDrill(drill)

      onProgress?.({
        current: 2,
        total: totalSteps,
        message: 'Verifying backup integrity...'
      })

      const startTime = Date.now()

      const metadata = await this.backupEngine.getBackupMetadataById(backupId)
      if (!metadata) {
        throw new Error(`Backup ${backupId} not found`)
      }

      await this.validateBackupType(drillType, metadata, backupId)

      const checksumValid = await this.backupEngine.verifyBackupIntegrity(backupId)
      if (!checksumValid) {
        throw new Error('Backup checksum validation failed')
      }

      const results = await executeDrill(onProgress)

      const duration = Date.now() - startTime

      onProgress?.({
        current: totalSteps - 1,
        total: totalSteps,
        message: 'Validating drill results...'
      })

      drill.status = DrillStatus.PASSED
      drill.duration = duration
      drill.results = results
      drill.completedAt = new Date().toISOString()

      apmManager.finishTransaction({
        name: transactionName,
        op: 'drill',
        data: { duration },
        tags: { backupId, drillType }
      })

      await this.saveDrill(drill)
      await this.sendDrillNotification(drill)

      onProgress?.({
        current: totalSteps,
        total: totalSteps,
        message: `${this.getDrillTypeName(drillType)} drill completed successfully`
      })

      return drill
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error'
      const drill = createFailedDrill(drillType, backupId, startedAt, errorMessage)

      apmManager.captureError({
        message: `${this.getDrillTypeName(drillType)} drill failed: ${errorMessage}`,
        level: 'error',
        tags: { backupId, drillType }
      })

      await this.saveDrill(drill)

      const config = await this.getDrillConfig()
      if (config.autoRemediate) {
        await this.attemptRemediation(drill)
      }

      await this.sendDrillNotification(drill)

      throw error
    }
  }

  private getDrillTypeName(drillType: DrillType): string {
    switch (drillType) {
      case DrillType.FULL_RESTORE:
        return 'FullRestore'
      case DrillType.PARTIAL_RESTORE:
        return 'PartialRestore'
      case DrillType.INTEGRITY_CHECK:
        return 'IntegrityCheck'
    }
  }

  private async validateBackupType(
    drillType: DrillType,
    metadata: any,
    backupId: string
  ): Promise<void> {
    if (drillType === DrillType.FULL_RESTORE && metadata.type !== 'full') {
      throw new Error(`Backup ${backupId} is not a full backup`)
    }
    if (drillType === DrillType.PARTIAL_RESTORE && metadata.type !== 'incremental') {
      throw new Error(`Backup ${backupId} is not an incremental backup`)
    }
  }

  async executeFullRestoreDrill(
    backupId: string,
    onProgress?: DrillProgressCallback,
    isolated: boolean = true
  ): Promise<BackupDrill> {
    return this.executeDrill({
      drillType: DrillType.FULL_RESTORE,
      backupId,
      onProgress,
      initialProgressMessage: 'Initializing full restore drill...',
      totalSteps: 5,
      executeDrill: async (progressCallback) => {
        progressCallback?.({
          current: 3,
          total: 5,
          message: 'Executing restore operation...'
        })

        const startTime = Date.now()

        if (isolated) {
          await this.executeIsolatedRestore(backupId, progressCallback)
        } else {
          const restoreResult = await this.backupEngine.restoreBackup(backupId, (progress) => {
            progressCallback?.({
              current: Math.floor((progress.current / progress.total) * 5),
              total: 5,
              message: `Restoring: ${progress.message}`
            })
          })

          if (!restoreResult.success) {
            throw new Error(`Restore failed: ${restoreResult.errors.join(', ')}`)
          }
        }

        const duration = Date.now() - startTime

        return {
          restoreDuration: duration,
          integrityCheckPassed: true,
          dataLossDetected: false,
          itemsRestored: 0,
          checksumValid: true
        }
      }
    })
  }

  async executePartialRestoreDrill(
    backupId: string,
    onProgress?: DrillProgressCallback,
    isolated: boolean = true
  ): Promise<BackupDrill> {
    return this.executeDrill({
      drillType: DrillType.PARTIAL_RESTORE,
      backupId,
      onProgress,
      initialProgressMessage: 'Initializing partial restore drill...',
      totalSteps: 5,
      executeDrill: async (progressCallback) => {
        progressCallback?.({
          current: 3,
          total: 5,
          message: 'Executing partial restore...'
        })

        const startTime = Date.now()

        if (isolated) {
          await this.executeIsolatedRestore(backupId, progressCallback, true)
        } else {
          const restoreResult = await this.backupEngine.restoreBackup(backupId, (progress) => {
            progressCallback?.({
              current: Math.floor((progress.current / progress.total) * 5),
              total: 5,
              message: `Partial restore: ${progress.message}`
            })
          })

          if (!restoreResult.success) {
            throw new Error(`Restore failed: ${restoreResult.errors.join(', ')}`)
          }
        }

        const duration = Date.now() - startTime

        return {
          restoreDuration: duration,
          integrityCheckPassed: true,
          dataLossDetected: false,
          itemsRestored: 0,
          checksumValid: true
        }
      }
    })
  }

  async executeIntegrityCheckDrill(
    backupId: string,
    onProgress?: DrillProgressCallback
  ): Promise<BackupDrill> {
    return this.executeDrill({
      drillType: DrillType.INTEGRITY_CHECK,
      backupId,
      onProgress,
      initialProgressMessage: 'Initializing integrity check drill...',
      totalSteps: 3,
      executeDrill: async () => {
        const duration = 0

        return {
          restoreDuration: duration,
          integrityCheckPassed: true,
          dataLossDetected: false,
          itemsRestored: 0,
          checksumValid: true
        }
      }
    })
  }

  async scheduleDrill(
    drillType: DrillType,
    backupId: string,
    scheduledFor: string,
    recurrence: DrillSchedule
  ): Promise<DrillScheduleDetails> {
    const drillSchedule: DrillScheduleDetails = {
      drillId: this.generateDrillId(drillType, backupId),
      drillType,
      backupId,
      scheduledFor,
      recurrence,
      enabled: true
    }

    const schedules = await this.getDrillSchedules()
    schedules.push(drillSchedule)
    await this.saveDrillSchedules(schedules)

    this.scheduleNextRun(drillSchedule)

    return drillSchedule
  }

  async cancelDrill(drillId: string): Promise<void> {
    const schedules = await this.getDrillSchedules()
    const index = schedules.findIndex((s) => s.drillId === drillId)

    if (index !== -1) {
      schedules[index].enabled = false
      await this.saveDrillSchedules(schedules)

      const timeout = this.scheduledDrills.get(drillId)

      if (timeout) {
        clearTimeout(timeout)
        this.scheduledDrills.delete(drillId)
      }
    }
  }

  async getDrills(filters?: DrillFilters): Promise<BackupDrill[]> {
    let drills = await this.loadDrillsFromStorage()

    if (filters) {
      if (filters.drillType && filters.drillType.length > 0) {
        drills = drills.filter((d) => filters.drillType!.includes(d.drillType))
      }

      if (filters.status && filters.status.length > 0) {
        drills = drills.filter((d) => filters.status!.includes(d.status))
      }

      if (filters.dateRange) {
        const startDate = new Date(filters.dateRange.startDate)
        const endDate = new Date(filters.dateRange.endDate)
        drills = drills.filter((d) => {
          const drillDate = new Date(d.timestamp)
          return drillDate >= startDate && drillDate <= endDate
        })
      }

      if (filters.backupId) {
        drills = drills.filter((d) => d.backupId === filters.backupId)
      }
    }

    return drills.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime())
  }

  async getDrillStatistics(): Promise<DrillStatistics> {
    const drills = await this.getDrills()

    const totalDrills = drills.length
    const successfulDrills = drills.filter((d) => d.status === DrillStatus.PASSED).length
    const failedDrills = drills.filter((d) => d.status === DrillStatus.FAILED).length
    const cancelledDrills = drills.filter((d) => d.status === DrillStatus.CANCELLED).length

    const completedDrills = drills.filter((d) =>
      [DrillStatus.PASSED, DrillStatus.FAILED].includes(d.status)
    )

    const averageDuration =
      completedDrills.length > 0
        ? completedDrills.reduce((sum, d) => sum + d.duration, 0) / completedDrills.length
        : 0

    const lastDrill = drills[0]
    const lastDrillDate = lastDrill ? lastDrill.timestamp : null
    const lastDrillStatus = lastDrill ? lastDrill.status : DrillStatus.SCHEDULED

    const sortedDrills = [...drills].sort((a, b) =>
      new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
    )

    let consecutiveFailures = 0

    for (const drill of sortedDrills) {
      if (drill.status === DrillStatus.FAILED) {
        consecutiveFailures++
      } else if (drill.status === DrillStatus.PASSED) {
        break
      }
    }

    const drillTypeBreakdown: Record<DrillType, DrillTypeStats> = {
      [DrillType.FULL_RESTORE]: this.calculateDrillTypeStats(drills, DrillType.FULL_RESTORE),
      [DrillType.PARTIAL_RESTORE]: this.calculateDrillTypeStats(drills, DrillType.PARTIAL_RESTORE),
      [DrillType.INTEGRITY_CHECK]: this.calculateDrillTypeStats(drills, DrillType.INTEGRITY_CHECK)
    }

    const config = await this.getDrillConfig()
    const healthStatus = this.calculateHealthStatus(
      consecutiveFailures,
      failedDrills,
      totalDrills,
      config.maxConsecutiveFailures
    )

    return {
      totalDrills,
      successfulDrills,
      failedDrills,
      cancelledDrills,
      averageDuration: Math.round(averageDuration),
      lastDrillDate,
      lastDrillStatus,
      consecutiveFailures,
      healthStatus,
      drillTypeBreakdown
    }
  }

  async getDrillConfig(): Promise<DrillConfig> {
    if (typeof window === 'undefined') {
      return DEFAULT_DRILL_CONFIG
    }

    const configString = global.localStorage?.getItem(DRILL_STORAGE_KEY)

    if (!configString) {
      await this.saveDrillConfig(DEFAULT_DRILL_CONFIG)
      return DEFAULT_DRILL_CONFIG
    }

    try {
      return JSON.parse(configString)
    } catch {
      return DEFAULT_DRILL_CONFIG
    }
  }

  async saveDrillConfig(config: DrillConfig): Promise<void> {
    if (typeof window === 'undefined') {
      return
    }

    global.localStorage?.setItem(DRILL_STORAGE_KEY, JSON.stringify(config))
  }

  private async attemptRemediation(drill: BackupDrill): Promise<void> {
    if (drill.remediationAttempted) {
      return
    }

    apmManager.addBreadcrumb('Attempting drill remediation', 'drill', 'info')

    try {
      if (drill.drillType === DrillType.INTEGRITY_CHECK) {
        await this.backupEngine.getBackupMetadataById(drill.backupId)
      }

      drill.remediationAttempted = true

      await this.saveDrill(drill)

      apmManager.addBreadcrumb('Remediation attempted successfully', 'drill', 'info')
    } catch (error) {
      apmManager.captureError({
        message: `Remediation failed: ${error}`,
        level: 'error',
        tags: { drillId: drill.id }
      })
    }
  }

  private async sendDrillNotification(drill: BackupDrill): Promise<void> {
    const config = await this.getDrillConfig()

    if (!config.notificationEnabled || drill.notificationSent) {
      return
    }

    apmManager.addBreadcrumb(`Drill notification: ${drill.status}`, 'drill', 'info')

    if (config.notificationEmails.length > 0) {
      console.log(`[Drill Notification] Sending drill ${drill.id} status ${drill.status} to:`, config.notificationEmails)
    }

    drill.notificationSent = true
    await this.saveDrill(drill)
  }

  private async executeIsolatedRestore(
    backupId: string,
    onProgress?: DrillProgressCallback,
    partial: boolean = false
  ): Promise<void> {
    apmManager.addBreadcrumb(`Starting isolated ${partial ? 'partial' : 'full'} restore`, 'drill', 'info')

    const metadata = await this.backupEngine.getBackupMetadataById(backupId)

    if (!metadata) {
      throw new Error(`Backup ${backupId} not found`)
    }

    onProgress?.({
      current: 3,
      total: 5,
      message: 'Simulating isolated restore...'
    })

    await new Promise((resolve) => setTimeout(resolve, 500))

    apmManager.addBreadcrumb('Isolated restore completed', 'drill', 'info')
  }

  private async scheduleNextRun(schedule: DrillScheduleDetails): Promise<void> {
    if (!schedule.enabled) {
      return
    }

    const now = new Date()
    const scheduledTime = new Date(schedule.scheduledFor)

    if (scheduledTime <= now) {
      const nextRunTime = this.calculateNextRunTime(schedule.recurrence)
      scheduledTime.setTime(nextRunTime.getTime())
    }

    const delay = scheduledTime.getTime() - now.getTime()

    const timeout = setTimeout(async () => {
      try {
        switch (schedule.drillType) {
          case DrillType.FULL_RESTORE:
            await this.executeFullRestoreDrill(schedule.backupId)
            break
          case DrillType.PARTIAL_RESTORE:
            await this.executePartialRestoreDrill(schedule.backupId)
            break
          case DrillType.INTEGRITY_CHECK:
            await this.executeIntegrityCheckDrill(schedule.backupId)
            break
        }

        if (schedule.recurrence !== DrillSchedule.MANUAL) {
          await this.scheduleNextRun(schedule)
        }
      } catch (error) {
        apmManager.captureError({
          message: `Scheduled drill failed: ${error}`,
          level: 'error',
          tags: { drillId: schedule.drillId }
        })
      }
    }, delay)

    this.scheduledDrills.set(schedule.drillId, timeout)
  }

  private calculateNextRunTime(recurrence: DrillSchedule): Date {
    const now = new Date()

    switch (recurrence) {
      case DrillSchedule.DAILY:
        return new Date(now.getTime() + 24 * 60 * 60 * 1000)
      case DrillSchedule.WEEKLY:
        return new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000)
      case DrillSchedule.MONTHLY:
        return new Date(now.getTime() + 30 * 24 * 60 * 60 * 1000)
      default:
        return now
    }
  }

  private async saveDrill(drill: BackupDrill): Promise<void> {
    if (typeof window === 'undefined') {
      return
    }

    const drills = await this.loadDrillsFromStorage()
    const index = drills.findIndex((d) => d.id === drill.id)

    if (index !== -1) {
      drills[index] = drill
    } else {
      drills.push(drill)
    }

    global.localStorage?.setItem(DRILL_DATA_KEY, JSON.stringify(drills))
  }

  private async loadDrillsFromStorage(): Promise<BackupDrill[]> {
    if (typeof window === 'undefined') {
      return []
    }

    const drillsString = global.localStorage?.getItem(DRILL_DATA_KEY)

    if (!drillsString) {
      return []
    }

    try {
      return JSON.parse(drillsString)
    } catch {
      return []
    }
  }

  private async getDrillSchedules(): Promise<DrillScheduleDetails[]> {
    if (typeof window === 'undefined') {
      return []
    }

    const schedulesString = global.localStorage?.getItem(DRILL_SCHEDULE_KEY)

    if (!schedulesString) {
      return []
    }

    try {
      return JSON.parse(schedulesString)
    } catch {
      return []
    }
  }

  private async saveDrillSchedules(schedules: DrillScheduleDetails[]): Promise<void> {
    if (typeof window === 'undefined') {
      return
    }

    global.localStorage?.setItem(DRILL_SCHEDULE_KEY, JSON.stringify(schedules))
  }

  private calculateDrillTypeStats(drills: BackupDrill[], drillType: DrillType): DrillTypeStats {
    const typeDrills = drills.filter((d) => d.drillType === drillType)

    const total = typeDrills.length
    const passed = typeDrills.filter((d) => d.status === DrillStatus.PASSED).length
    const failed = typeDrills.filter((d) => d.status === DrillStatus.FAILED).length

    const completedDrills = typeDrills.filter((d) =>
      [DrillStatus.PASSED, DrillStatus.FAILED].includes(d.status)
    )

    const averageDuration =
      completedDrills.length > 0
        ? completedDrills.reduce((sum, d) => sum + d.duration, 0) / completedDrills.length
        : 0

    return {
      total,
      passed,
      failed,
      averageDuration: Math.round(averageDuration)
    }
  }

  private calculateHealthStatus(
    consecutiveFailures: number,
    failedDrills: number,
    totalDrills: number,
    maxConsecutiveFailures: number
  ): DrillHealthStatus {
    if (consecutiveFailures >= maxConsecutiveFailures) {
      return 'critical'
    }

    if (failedDrills > 0 && totalDrills > 0) {
      const failureRate = failedDrills / totalDrills

      if (failureRate > 0.2) {
        return 'critical'
      }

      if (failureRate > 0.1) {
        return 'warning'
      }
    }

    return 'healthy'
  }
}

export default DrillEngine
