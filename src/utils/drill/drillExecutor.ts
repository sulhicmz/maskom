import {
  BackupDrill,
  DrillType,
  DrillStatus,
  DrillResults
} from '@/types/drill'

type DrillProgressCallback = (progress: { current: number; total: number; message: string }) => void

export interface IDrillExecutor {
  executeFullRestoreDrill(
    backupId: string,
    onProgress?: DrillProgressCallback,
    isolated?: boolean
  ): Promise<BackupDrill>

  executePartialRestoreDrill(
    backupId: string,
    onProgress?: DrillProgressCallback,
    isolated?: boolean
  ): Promise<BackupDrill>

  executeIntegrityCheckDrill(
    backupId: string,
    onProgress?: DrillProgressCallback
  ): Promise<BackupDrill>
}

const DrillExecutor: IDrillExecutor = {
  executeFullRestoreDrill: async () => {
    throw new Error('Not implemented: DrillExecutor.executeFullRestoreDrill')
  },
  executePartialRestoreDrill: async () => {
    throw new Error('Not implemented: DrillExecutor.executePartialRestoreDrill')
  },
  executeIntegrityCheckDrill: async () => {
    throw new Error('Not implemented: DrillExecutor.executeIntegrityCheckDrill')
  }
}

export default DrillExecutor
export type { DrillProgressCallback }

