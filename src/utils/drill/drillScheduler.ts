import { DrillScheduleDetails, DrillSchedule, DrillType } from '@/types/drill'
import type DrillStorage from './drillStorage'

type ExecuteDrillFunction = (drillType: DrillType, backupId: string) => Promise<void>

class DrillScheduler {
  private static instance: DrillScheduler
  private scheduledDrills: Map<string, NodeJS.Timeout>
  private drillStorage: DrillStorage

  private constructor() {
    this.scheduledDrills = new Map()
    this.drillStorage = null as any
  }

  static getInstance(drillStorage?: DrillStorage): DrillScheduler {
    if (!DrillScheduler.instance) {
      DrillScheduler.instance = new DrillScheduler()
    }
    if (drillStorage) {
      DrillScheduler.instance.drillStorage = drillStorage
    }
    return DrillScheduler.instance
  }

  async scheduleDrill(
    drillType: DrillType,
    backupId: string,
    scheduledFor: string,
    recurrence: DrillSchedule,
    executeDrill: ExecuteDrillFunction
  ): Promise<DrillScheduleDetails> {
    const drillSchedule: DrillScheduleDetails = {
      drillId: this.generateDrillId(drillType, backupId),
      drillType,
      backupId,
      scheduledFor,
      recurrence,
      enabled: true
    }

    const schedules = await this.drillStorage.getDrillSchedules()
    schedules.push(drillSchedule)
    await this.drillStorage.saveDrillSchedules(schedules)

    this.scheduleNextRun(drillSchedule, executeDrill)

    return drillSchedule
  }

  async cancelDrill(drillId: string): Promise<void> {
    const schedules = await this.drillStorage.getDrillSchedules()
    const index = schedules.findIndex((s) => s.drillId === drillId)

    if (index !== -1) {
      schedules[index].enabled = false
      await this.drillStorage.saveDrillSchedules(schedules)

      const timeout = this.scheduledDrills.get(drillId)

      if (timeout) {
        clearTimeout(timeout)
        this.scheduledDrills.delete(drillId)
      }
    }
  }

  private scheduleNextRun(schedule: DrillScheduleDetails, executeDrill: ExecuteDrillFunction): void {
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
        await executeDrill(schedule.drillType, schedule.backupId)

        if (schedule.recurrence !== DrillSchedule.MANUAL) {
          this.scheduleNextRun(schedule, executeDrill)
        }
      } catch (error) {
        console.error(`Scheduled drill failed: ${error}`)
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

  private generateDrillId(drillType: DrillType, backupId: string): string {
    const timestamp = Date.now()
    const random = Math.random().toString(36).substring(2, 9)
    return `drill-${drillType}-${backupId}-${timestamp}-${random}`
  }
}

export default DrillScheduler
