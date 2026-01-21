import {
  BackupDrill,
  DrillType,
  DrillStatus,
  DrillResults,
  DrillConfig,
  DrillStatistics,
  DrillFilters,
  DrillScheduleDetails,
  DrillSchedule
} from '@/types/drill'

import { BackupEngine } from '@/utils/backupEngine'
import { BackupMetadata } from '@/types/backup'
import apmManager from '@/utils/apm'
import { logServiceInfo } from '@/services/common/logger'
import DrillStorage from '@/utils/drill/drillStorage'
import DrillScheduler from '@/utils/drill/drillScheduler'
import DrillStatisticsCalculator from '@/utils/drill/drillStatistics'
import DrillExecutor from '@/utils/drill/drillExecutor'

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
  private drillStorage: DrillStorage
  private drillScheduler: DrillScheduler
  private drillStatisticsCalculator: DrillStatisticsCalculator

  private constructor() {
    this.backupEngine = BackupEngine.getInstance()
    this.drillStorage = DrillStorage.getInstance()
    this.drillScheduler = DrillScheduler.getInstance()
    this.drillScheduler.setDrillStorage(this.drillStorage)
    this.drillStatisticsCalculator = new DrillStatisticsCalculator()
  }

  static getInstance(): DrillEngine {
    if (!DrillEngine.instance) {
      DrillEngine.instance = new DrillEngine()
    }
    return DrillEngine.instance
  }

  private async executeDrill(context: DrillExecutionContext): Promise<BackupDrill> {
    const { drillType, backupId, executeDrill, onProgress, initialProgressMessage, totalSteps } = context
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
    metadata: BackupMetadata,
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
        return await DrillExecutor.executeFullRestore(backupId, progressCallback, isolated)
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
        return await DrillExecutor.executePartialRestore(backupId, progressCallback, isolated)
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
        return await DrillExecutor.executeIntegrityCheck(backupId, onProgress)
      }
    })
  }

  async scheduleDrill(
    drillType: DrillType,
    backupId: string,
    scheduledFor: string,
    recurrence: DrillSchedule
  ): Promise<DrillScheduleDetails> {
    return await this.drillScheduler.scheduleDrill(
      drillType,
      backupId,
      scheduledFor,
      recurrence,
      async () => {
        switch (drillType) {
          case DrillType.FULL_RESTORE:
            await this.executeFullRestoreDrill(backupId)
            break
          case DrillType.PARTIAL_RESTORE:
            await this.executePartialRestoreDrill(backupId)
            break
          case DrillType.INTEGRITY_CHECK:
            await this.executeIntegrityCheckDrill(backupId)
            break
        }
      }
    )
  }

  async cancelDrill(drillId: string): Promise<void> {
    await this.drillScheduler.cancelDrill(drillId)
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
    const config = await this.getDrillConfig()
    return this.drillStatisticsCalculator.calculateDrillStatistics(drills, config)
  }

  async getDrillConfig(): Promise<DrillConfig> {
    return await this.drillStorage.getDrillConfig()
  }

  async saveDrillConfig(config: DrillConfig): Promise<void> {
    await this.drillStorage.saveDrillConfig(config)
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
      logServiceInfo('DrillEngine', 'sendDrillNotification', `Sending drill ${drill.id} status ${drill.status} to: ${config.notificationEmails.join(', ')}`)
    }

    drill.notificationSent = true
    await this.saveDrill(drill)
  }

  private async saveDrill(drill: BackupDrill): Promise<void> {
    await this.drillStorage.saveDrill(drill)
  }

  private async loadDrillsFromStorage(): Promise<BackupDrill[]> {
    return await this.drillStorage.loadDrillsFromStorage()
  }

}

export default DrillEngine
