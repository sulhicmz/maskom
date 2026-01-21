import { BackupDrill, DrillStatus, DrillType, DrillHealthStatus, DrillTypeStats, DrillStatistics, DrillConfig } from '@/types/drill'

class DrillStatisticsCalculator {
  calculateDrillStatistics(drills: BackupDrill[], config: DrillConfig): DrillStatistics {
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

export default DrillStatisticsCalculator
