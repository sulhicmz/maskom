import { BackupStatistics, BackupMetadata, BackupHealthStatus } from '@/types/backup'

export function calculateStorageUsage(): number {
  try {
    if (typeof window === 'undefined' || typeof localStorage === 'undefined') {
      return 0
    }

    const metadataList = JSON.parse(
      localStorage.getItem('backup_metadata_list') || '[]',
    ) as BackupMetadata[]
    const totalSize = metadataList.reduce((sum, backup) => sum + backup.size, 0)

    const quotaEstimate = 5 * 1024 * 1024 * 1024

    return totalSize / quotaEstimate
  } catch {
    return 0
  }
}

export function calculateHealthStatus(
  storageUsage: number,
  failedCount: number,
): BackupHealthStatus {
  const STORAGE_QUOTA_WARNING_THRESHOLD = 0.8
  const STORAGE_QUOTA_ERROR_THRESHOLD = 0.95

  if (storageUsage > STORAGE_QUOTA_ERROR_THRESHOLD || failedCount > 5) {
    return 'critical'
  }

  if (storageUsage > STORAGE_QUOTA_WARNING_THRESHOLD || failedCount > 2) {
    return 'warning'
  }

  return 'healthy'
}
