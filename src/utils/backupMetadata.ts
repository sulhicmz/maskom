import {
  BackupMetadata,
  BACKUP_METADATA_KEY,
} from '@/types/backup'

export function generateBackupId(type: string): string {
  const date = new Date().toISOString().split('T')[0]
  const random = Math.random().toString(36).substring(2, 8)
  return `backup-${date}-${type}-${random}`
}

export function calculateChecksum(data: string): string {
  let hash = 0

  for (let i = 0; i < data.length; i++) {
    const char = data.charCodeAt(i)
    hash = (hash << 5) - hash + char
    hash = hash & hash
  }

  return Math.abs(hash).toString(16).padStart(32, '0')
}

export async function getBackupMetadataById(
  backupId: string,
): Promise<BackupMetadata | null> {
  try {
    if (typeof window === 'undefined') {
      return null
    }

    const metadataList = localStorage.getItem(BACKUP_METADATA_KEY)

    if (!metadataList) {
      return null
    }

    const parsed: BackupMetadata[] = JSON.parse(metadataList)
    return parsed.find((m) => m.id === backupId) || null
  } catch {
    return null
  }
}

export function calculateRetentionCompliance(
  backups: BackupMetadata[],
): number {
  if (backups.length === 0) {
    return 100
  }

  const now = new Date()
  const expiredCount = backups.filter((backup) => {
    const backupDate = new Date(backup.timestamp)
    const retentionDays = parseInt(backup.retention.split(' ')[0])
    const expiryDate = new Date(
      backupDate.getTime() + retentionDays * 24 * 60 * 60 * 1000,
    )
    return now > expiryDate
  }).length

  return ((backups.length - expiredCount) / backups.length) * 100
}
