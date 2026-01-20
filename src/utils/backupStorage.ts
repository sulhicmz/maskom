import {
  BackupMetadata,
  BACKUP_DATA_KEY_PREFIX,
  BACKUP_METADATA_KEY,
} from '@/types/backup'

export async function saveBackupToStorage(
  backupId: string,
  data: string,
): Promise<void> {
  try {
    if (typeof window === 'undefined' || typeof localStorage === 'undefined') {
      return
    }

    const storageKey = `${BACKUP_DATA_KEY_PREFIX}${backupId}`
    localStorage.setItem(storageKey, data)
  } catch (error) {
    console.error('Failed to save backup to storage:', error)
    throw new Error('Storage quota exceeded or error saving backup')
  }
}

export async function loadBackupFromStorage(
  backupId: string,
): Promise<string | null> {
  try {
    if (typeof window === 'undefined' || typeof localStorage === 'undefined') {
      return null
    }

    const storageKey = `${BACKUP_DATA_KEY_PREFIX}${backupId}`
    return localStorage.getItem(storageKey)
  } catch {
    return null
  }
}

export async function getBackupMetadataList(): Promise<BackupMetadata[]> {
  try {
    if (typeof window === 'undefined' || typeof localStorage === 'undefined') {
      return []
    }

    const metadataList = localStorage.getItem(BACKUP_METADATA_KEY)

    if (!metadataList) {
      return []
    }

    const parsed: BackupMetadata[] = JSON.parse(metadataList)
    return parsed
  } catch {
    return []
  }
}

export function getBackupMetadataListSync(): BackupMetadata[] {
  try {
    if (typeof window === 'undefined' || typeof localStorage === 'undefined') {
      return []
    }

    const metadataList = localStorage.getItem(BACKUP_METADATA_KEY)

    if (!metadataList) {
      return []
    }

    const parsed: BackupMetadata[] = JSON.parse(metadataList)
    return parsed
  } catch {
    return []
  }
}

export async function updateBackupMetadataList(
  metadata: BackupMetadata,
): Promise<void> {
  try {
    if (typeof window === 'undefined' || typeof localStorage === 'undefined') {
      return
    }

    const currentList = await getBackupMetadataList()
    const updatedList = [metadata, ...currentList]
    localStorage.setItem(BACKUP_METADATA_KEY, JSON.stringify(updatedList))
  } catch (error) {
    console.error('Failed to update backup metadata list:', error)
  }
}

export async function removeBackupFromMetadataList(
  backupId: string,
): Promise<void> {
  try {
    if (typeof window === 'undefined' || typeof localStorage === 'undefined') {
      return
    }

    const currentList = await getBackupMetadataList()
    const updatedList = currentList.filter((m) => m.id !== backupId)
    localStorage.setItem(BACKUP_METADATA_KEY, JSON.stringify(updatedList))
  } catch (error) {
    console.error('Failed to remove backup from metadata list:', error)
  }
}

export async function deleteBackupFromStorage(
  backupId: string,
): Promise<boolean> {
  try {
    if (typeof window === 'undefined' || typeof localStorage === 'undefined') {
      return false
    }

    const storageKey = `${BACKUP_DATA_KEY_PREFIX}${backupId}`
    localStorage.removeItem(storageKey)
    await removeBackupFromMetadataList(backupId)
    return true
  } catch (error) {
    console.error('Failed to delete backup:', error)
    return false
  }
}

export async function exportBackupToFile(
  backupId: string,
): Promise<Blob | null> {
  try {
    if (typeof window === 'undefined' || typeof localStorage === 'undefined') {
      return null
    }

    const backupData = await loadBackupFromStorage(backupId)

    if (!backupData) {
      return null
    }

    const blob = new Blob([backupData], { type: 'application/json' })
    return blob
  } catch (error) {
    console.error('Failed to export backup:', error)
    return null
  }
}
