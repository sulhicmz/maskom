import { BackupDrill, DrillConfig, DrillScheduleDetails, DEFAULT_DRILL_CONFIG } from '@/types/drill'
import { DRILL_STORAGE_KEY, DRILL_DATA_KEY, DRILL_SCHEDULE_KEY } from '@/types/drill'

class DrillStorage {
  private static instance: DrillStorage

  private constructor() {}

  static getInstance(): DrillStorage {
    if (!DrillStorage.instance) {
      DrillStorage.instance = new DrillStorage()
    }
    return DrillStorage.instance
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

  async saveDrill(drill: BackupDrill): Promise<void> {
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

  async loadDrillsFromStorage(): Promise<BackupDrill[]> {
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

  async getDrillSchedules(): Promise<DrillScheduleDetails[]> {
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

  async saveDrillSchedules(schedules: DrillScheduleDetails[]): Promise<void> {
    if (typeof window === 'undefined') {
      return
    }

    global.localStorage?.setItem(DRILL_SCHEDULE_KEY, JSON.stringify(schedules))
  }
}

export default DrillStorage
