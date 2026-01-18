import {
  BackupConfig,
  BackupSchedule,
  BackupMetadata,
  BackupType,
  BackupStatus,
} from '@/types/backup'

import {
  createFullBackup,
  createIncrementalBackup,
  getBackupStatistics,
} from './backupEngine'

import { BACKUP_STORAGE_KEY, BACKUP_METADATA_KEY } from '@/types/backup'

import { BACKUP_DATA_KEY_PREFIX } from '@/types/backup'

const BACKUP_SCHEDULER_KEY = 'maskom_backup_scheduler'
const BACKUP_SCHEDULER_INTERVAL_KEY = 'maskom_backup_scheduler_interval'
const BACKUP_SCHEDULER_LAST_RUN_KEY = 'maskom_backup_scheduler_last_run'

interface ScheduledBackup {
  id: string
  schedule: BackupSchedule
  time: string
  enabled: boolean
  lastRun?: string
  nextRun?: string
  config: BackupConfig
}

interface SchedulerConfig {
  schedule: BackupSchedule
  time: string
  enabled: boolean
  config: BackupConfig
}

type BackupNotification = {
  type: 'success' | 'error' | 'warning'
  message: string
  backupId?: string
  timestamp: string
}

type BackupNotificationCallback = (notification: BackupNotification) => void

class BackupScheduler {
  private static instance: BackupScheduler

  private intervalId: NodeJS.Timeout | null = null
  private notificationCallbacks: BackupNotificationCallback[] = []

  private constructor() {}

  static getInstance(): BackupScheduler {
    if (!BackupScheduler.instance) {
      BackupScheduler.instance = new BackupScheduler()
    }
    return BackupScheduler.instance
  }

  async initializeScheduler(): Promise<void> {
    try {
      if (typeof window === 'undefined') {
        return
      }

      const schedulerConfig = this.loadSchedulerConfig()

      if (schedulerConfig?.enabled) {
        await this.scheduleBackup(
          schedulerConfig.schedule,
          schedulerConfig.time,
          schedulerConfig.config,
        )
      }
    } catch (error) {
      console.error('Failed to initialize backup scheduler:', error)
    }
  }

  async scheduleBackup(
    schedule: BackupSchedule,
    time: string,
    config: BackupConfig,
  ): Promise<boolean> {
    try {
      if (typeof window === 'undefined') {
        return false
      }

      const nextRun = this.calculateNextRun(schedule, time)

      const scheduledBackup: ScheduledBackup = {
        id: this.generateSchedulerId(),
        schedule,
        time,
        enabled: true,
        nextRun,
        config,
      }

      localStorage.setItem(
        BACKUP_SCHEDULER_KEY,
        JSON.stringify(scheduledBackup),
      )

      await this.startScheduler(scheduledBackup)

      return true
    } catch (error) {
      console.error('Failed to schedule backup:', error)
      return false
    }
  }

  async cancelScheduledBackup(): Promise<boolean> {
    try {
      if (typeof window === 'undefined') {
        return false
      }

      if (this.intervalId) {
        clearInterval(this.intervalId)
        this.intervalId = null
      }

      localStorage.removeItem(BACKUP_SCHEDULER_KEY)
      localStorage.removeItem(BACKUP_SCHEDULER_INTERVAL_KEY)
      localStorage.removeItem(BACKUP_SCHEDULER_LAST_RUN_KEY)

      return true
    } catch (error) {
      console.error('Failed to cancel scheduled backup:', error)
      return false
    }
  }

  onNotification(callback: BackupNotificationCallback): void {
    this.notificationCallbacks.push(callback)
  }

  offNotification(callback: BackupNotificationCallback): void {
    this.notificationCallbacks = this.notificationCallbacks.filter(
      (cb) => cb !== callback,
    )
  }

  getScheduledBackup(): ScheduledBackup | null {
    try {
      if (typeof window === 'undefined') {
        return null
      }

      const scheduledBackup = localStorage.getItem(BACKUP_SCHEDULER_KEY)

      if (!scheduledBackup) {
        return null
      }

      return JSON.parse(scheduledBackup) as ScheduledBackup
    } catch {
      return null
    }
  }

  async getLastScheduledBackupRun(): Promise<Date | null> {
    try {
      if (typeof window === 'undefined') {
        return null
      }

      const lastRun = localStorage.getItem(BACKUP_SCHEDULER_LAST_RUN_KEY)

      if (!lastRun) {
        return null
      }

      return new Date(lastRun)
    } catch {
      return null
    }
  }

  private async startScheduler(
    scheduledBackup: ScheduledBackup,
  ): Promise<void> {
    try {
      if (this.intervalId) {
        clearInterval(this.intervalId)
      }

      const checkIntervalMs = 60000

      this.intervalId = setInterval(async () => {
        await this.checkAndRunBackup(scheduledBackup)
      }, checkIntervalMs) as unknown as NodeJS.Timeout

      localStorage.setItem(
        BACKUP_SCHEDULER_INTERVAL_KEY,
        checkIntervalMs.toString(),
      )

      this.notify({
        type: 'success',
        message: 'Backup scheduler started',
        timestamp: new Date().toISOString(),
      })
    } catch (error) {
      console.error('Failed to start scheduler:', error)
      this.notify({
        type: 'error',
        message: 'Failed to start backup scheduler',
        timestamp: new Date().toISOString(),
      })
    }
  }

  private async checkAndRunBackup(
    scheduledBackup: ScheduledBackup,
  ): Promise<void> {
    try {
      const now = new Date()
      const nextRun = new Date(scheduledBackup.nextRun || '')

      if (now < nextRun) {
        return
      }

      const lastRun = await this.getLastScheduledBackupRun()

      if (lastRun) {
        const hoursSinceLastRun =
          (now.getTime() - lastRun.getTime()) / (1000 * 60 * 60)

        const minHoursBetweenRuns = this.getMinHoursBetweenRuns(
          scheduledBackup.schedule,
        )

        if (hoursSinceLastRun < minHoursBetweenRuns) {
          return
        }
      }

      await this.runBackup(scheduledBackup)
    } catch (error) {
      console.error('Error in backup scheduler check:', error)
    }
  }

  private async runBackup(
    scheduledBackup: ScheduledBackup,
  ): Promise<void> {
    try {
      const lastFullBackup = await this.getLastFullBackup()

      let metadata: BackupMetadata

      if (scheduledBackup.schedule === 'manual') {
        metadata = await createFullBackup(
          scheduledBackup.config,
          (progress) => {
            console.log('Backup progress:', progress)
          },
        )
      } else {
        const daysSinceLastFull = this.getDaysSinceLastBackup(lastFullBackup)

        if (daysSinceLastFull >= 7 || !lastFullBackup) {
          metadata = await createFullBackup(
            scheduledBackup.config,
            (progress) => {
              console.log('Backup progress:', progress)
            },
          )
        } else {
          metadata = await createIncrementalBackup(
            scheduledBackup.config,
            lastFullBackup,
            (progress) => {
              console.log('Backup progress:', progress)
            },
          )
        }
      }

      if (metadata.status === 'completed') {
        localStorage.setItem(
          BACKUP_SCHEDULER_LAST_RUN_KEY,
          new Date().toISOString(),
        )

        const updatedScheduledBackup = this.getScheduledBackup()

        if (updatedScheduledBackup) {
          updatedScheduledBackup.lastRun = new Date().toISOString()
          updatedScheduledBackup.nextRun = this.calculateNextRun(
            updatedScheduledBackup.schedule,
            updatedScheduledBackup.time,
          )

          localStorage.setItem(
            BACKUP_SCHEDULER_KEY,
            JSON.stringify(updatedScheduledBackup),
          )
        }

        this.notify({
          type: 'success',
          message: `Backup completed successfully: ${metadata.id}`,
          backupId: metadata.id,
          timestamp: new Date().toISOString(),
        })
      } else {
        this.notify({
          type: 'error',
          message: `Backup failed: ${metadata.errorMessage || 'Unknown error'}`,
          backupId: metadata.id,
          timestamp: new Date().toISOString(),
        })
      }
    } catch (error) {
      console.error('Failed to run backup:', error)
      this.notify({
        type: 'error',
        message: `Backup failed: ${error instanceof Error ? error.message : 'Unknown error'}`,
        timestamp: new Date().toISOString(),
      })
    }
  }

  private async getLastFullBackup(): Promise<BackupMetadata | null> {
    try {
      if (typeof window === 'undefined') {
        return null
      }

      const metadataList = localStorage.getItem(BACKUP_METADATA_KEY)

      if (!metadataList) {
        return null
      }

      const backups: BackupMetadata[] = JSON.parse(metadataList)
      const fullBackups = backups
        .filter((b) => b.type === 'full' && b.status === 'completed')
        .sort(
          (a, b) =>
            new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime(),
        )

      return fullBackups[0] || null
    } catch {
      return null
    }
  }

  private calculateNextRun(
    schedule: BackupSchedule,
    time: string,
  ): string {
    const now = new Date()
    const timeParts = time.split(':').map(Number)
    const hours = timeParts[0]
    const minutes = timeParts[1]

    if (isNaN(hours) || isNaN(minutes) || hours < 0 || hours > 24 || minutes < 0 || minutes > 59) {
      throw new Error(`Invalid time format: ${time}`)
    }

    let nextRun = new Date(now)
    nextRun.setHours(hours, minutes, 0, 0)

    switch (schedule) {
      case 'daily':
        if (nextRun <= now) {
          nextRun.setDate(nextRun.getDate() + 1)
        }
        break

      case 'weekly':
        const dayOfWeek = nextRun.getDay()

        if (dayOfWeek === 0) {
          nextRun.setDate(nextRun.getDate() + 7)
        } else if (dayOfWeek < 1) {
          nextRun.setDate(nextRun.getDate() + (1 - dayOfWeek))
        } else if (nextRun <= now) {
          nextRun.setDate(nextRun.getDate() + 8 - dayOfWeek)
        }
        break

      case 'monthly':
        const dayOfMonth = nextRun.getDate()

        if (nextRun <= now) {
          nextRun.setMonth(nextRun.getMonth() + 1)
          nextRun.setDate(Math.min(dayOfMonth, 28))
        }
        break

      case 'manual':
        nextRun = new Date(now.getTime() + 365 * 24 * 60 * 60 * 1000)
        break
    }

    return nextRun.toISOString()
  }

  private getMinHoursBetweenRuns(schedule: BackupSchedule): number {
    switch (schedule) {
      case 'daily':
        return 24
      case 'weekly':
        return 24 * 7
      case 'monthly':
        return 24 * 30
      case 'manual':
        return Infinity
      default:
        return 24
    }
  }

  private getDaysSinceLastBackup(
    lastBackup: BackupMetadata | null,
  ): number {
    if (!lastBackup) {
      return Infinity
    }

    const now = new Date()
    const backupDate = new Date(lastBackup.timestamp)

    const diffMs = now.getTime() - backupDate.getTime()
    const diffDays = diffMs / (1000 * 60 * 60 * 24)

    return diffDays
  }

  private loadSchedulerConfig(): SchedulerConfig | null {
    try {
      if (typeof window === 'undefined') {
        return null
      }

      const scheduledBackup = this.getScheduledBackup()

      if (!scheduledBackup || !scheduledBackup.enabled) {
        return null
      }

      return {
        schedule: scheduledBackup.schedule,
        time: scheduledBackup.time,
        enabled: scheduledBackup.enabled,
        config: scheduledBackup.config,
      }
    } catch {
      return null
    }
  }

  private generateSchedulerId(): string {
    const timestamp = Date.now()
    const random = Math.random().toString(36).substring(2, 8)
    return `scheduler-${timestamp}-${random}`
  }

  private notify(notification: BackupNotification): void {
    this.notificationCallbacks.forEach((callback) => {
      try {
        callback(notification)
      } catch (error) {
        console.error('Error in notification callback:', error)
      }
    })
  }
}

const backupScheduler = BackupScheduler.getInstance()

export default backupScheduler

export const scheduleBackup = backupScheduler.scheduleBackup.bind(backupScheduler)
export const cancelScheduledBackup = backupScheduler.cancelScheduledBackup.bind(backupScheduler)
export const initializeScheduler = backupScheduler.initializeScheduler.bind(backupScheduler)
export const onBackupNotification = backupScheduler.onNotification.bind(backupScheduler)
export const offBackupNotification = backupScheduler.offNotification.bind(backupScheduler)
export const getScheduledBackup = backupScheduler.getScheduledBackup.bind(backupScheduler)
export const getLastScheduledBackupRun = backupScheduler.getLastScheduledBackupRun.bind(backupScheduler)
