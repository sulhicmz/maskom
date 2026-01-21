import {
  BackupData,
  BackupMetadata,
  BackupInfo,
  RestoreResult,
  BackupStatistics,
  BackupConfig,
  IBackupEngine,
  BackupProgressCallback,
} from '@/types/backup'

import {
  generateBackupId,
  calculateChecksum,
  getBackupMetadataById as getBackupMetadataByIdUtil,
  calculateRetentionCompliance,
} from './backupMetadata'

import {
  collectUserData,
  collectContentData,
  collectSettingsData,
  collectActivityLogs,
  calculateChangesSinceBackup,
} from './backupDataCollector'

import {
  restoreUserData,
  restoreContentData,
  restoreSettingsData,
  restoreActivityLogs,
} from './backupRestorer'

import {
  saveBackupToStorage,
  loadBackupFromStorage,
  getBackupMetadataList as getBackupMetadataListUtil,
  updateBackupMetadataList,
  deleteBackupFromStorage,
  exportBackupToFile as exportBackupToFileUtil,
} from './backupStorage'

import {
  encryptData,
} from './backupCrypto'

import {
  compressData,
} from './backupCompression'

import {
  calculateStorageUsage,
  calculateHealthStatus,
} from './backupHealth'

const APPLICATION_VERSION = '1.0.0'
const BACKUP_VERSION = '1.0.0'

export class BackupEngine implements IBackupEngine {
  private static instance: BackupEngine

  private constructor() {}

  static getInstance(): BackupEngine {
    if (!BackupEngine.instance) {
      BackupEngine.instance = new BackupEngine()
    }
    return BackupEngine.instance
  }

  async createFullBackup(
    config: BackupConfig,
    onProgress?: BackupProgressCallback,
  ): Promise<BackupMetadata> {
    try {
      if (typeof window === 'undefined') {
        throw new Error('Backup operations require browser environment')
      }

      const backupId = generateBackupId('full')
      const timestamp = new Date().toISOString()

      onProgress?.({
        current: 1,
        total: 5,
        message: 'Collecting user data...',
      })

      const userData = await collectUserData()

      onProgress?.({
        current: 2,
        total: 5,
        message: 'Collecting content data...',
      })

      const contentData = await collectContentData()

      onProgress?.({
        current: 3,
        total: 5,
        message: 'Collecting settings data...',
      })

      const settingsData = await collectSettingsData()

      onProgress?.({
        current: 4,
        total: 5,
        message: 'Collecting activity logs...',
      })

      const activityLogs = await collectActivityLogs()

      const backupInfo: BackupInfo = {
        backupId,
        backupType: 'full',
        backupDate: timestamp,
        backupVersion: BACKUP_VERSION,
        applicationVersion: APPLICATION_VERSION,
        backupSize: 0,
        checksum: '',
        encrypted: config.encryptionEnabled,
        compressed: config.compressionEnabled,
      }

      const backupData: BackupData = {
        userData,
        contentData,
        settingsData,
        activityLogs,
        backupInfo,
      }

      onProgress?.({
        current: 5,
        total: 5,
        message: 'Finalizing backup...',
      })

      let serializedData = JSON.stringify(backupData)

      if (config.compressionEnabled) {
        serializedData = await compressData(serializedData)
      }

      let checksum = calculateChecksum(serializedData)

      if (config.encryptionEnabled) {
        const encrypted = await encryptData(serializedData)
        serializedData = encrypted
        checksum = calculateChecksum(serializedData)
      }

      const backupSize = new Blob([serializedData]).size

      backupInfo.backupSize = backupSize
      backupInfo.checksum = checksum

      const metadata: BackupMetadata = {
        id: backupId,
        timestamp,
        type: 'full',
        size: backupSize,
        checksum,
        encryption: config.encryptionEnabled ? 'AES-256' : 'none',
        retention: `${config.retentionDays} days`,
        status: 'completed',
        version: BACKUP_VERSION,
      }

      await saveBackupToStorage(backupId, serializedData)
      await updateBackupMetadataList(metadata)

      return metadata
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error'
      const failedMetadata: BackupMetadata = {
        id: generateBackupId('full'),
        timestamp: new Date().toISOString(),
        type: 'full',
        size: 0,
        checksum: '',
        encryption: config.encryptionEnabled ? 'AES-256' : 'none',
        retention: `${config.retentionDays} days`,
        status: 'failed',
        errorMessage,
        version: BACKUP_VERSION,
      }

      await updateBackupMetadataList(failedMetadata)

      throw error
    }
  }

  async createIncrementalBackup(
    config: BackupConfig,
    lastFullBackup: BackupMetadata | null,
    onProgress?: BackupProgressCallback,
  ): Promise<BackupMetadata> {
    try {
      if (typeof window === 'undefined') {
        throw new Error('Backup operations require browser environment')
      }

      if (!lastFullBackup) {
        throw new Error('Cannot create incremental backup without a full backup')
      }

      const backupId = generateBackupId('incremental')
      const timestamp = new Date().toISOString()

      onProgress?.({
        current: 1,
        total: 4,
        message: 'Calculating changes since last backup...',
      })

      const changes = await calculateChangesSinceBackup()

      onProgress?.({
        current: 2,
        total: 4,
        message: 'Collecting changed data...',
      })

      const { userData, contentData, settingsData, activityLogs } = changes

      const backupInfo: BackupInfo = {
        backupId,
        backupType: 'incremental',
        backupDate: timestamp,
        backupVersion: BACKUP_VERSION,
        applicationVersion: APPLICATION_VERSION,
        backupSize: 0,
        checksum: '',
        encrypted: config.encryptionEnabled,
        compressed: config.compressionEnabled,
      }

      const backupData: BackupData = {
        userData,
        contentData,
        settingsData,
        activityLogs,
        backupInfo,
      }

      onProgress?.({
        current: 3,
        total: 4,
        message: 'Processing backup data...',
      })

      let serializedData = JSON.stringify(backupData)

      if (config.compressionEnabled) {
        serializedData = await compressData(serializedData)
      }

      let checksum = calculateChecksum(serializedData)

      if (config.encryptionEnabled) {
        const encrypted = await encryptData(serializedData)
        serializedData = encrypted
        checksum = calculateChecksum(serializedData)
      }

      const backupSize = new Blob([serializedData]).size

      backupInfo.backupSize = backupSize
      backupInfo.checksum = checksum

      const metadata: BackupMetadata = {
        id: backupId,
        timestamp,
        type: 'incremental',
        size: backupSize,
        checksum,
        encryption: config.encryptionEnabled ? 'AES-256' : 'none',
        retention: '7 days',
        status: 'completed',
        version: BACKUP_VERSION,
      }

      await saveBackupToStorage(backupId, serializedData)
      await updateBackupMetadataList(metadata)

      onProgress?.({
        current: 4,
        total: 4,
        message: 'Incremental backup completed',
      })

      return metadata
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error'
      const failedMetadata: BackupMetadata = {
        id: generateBackupId('incremental'),
        timestamp: new Date().toISOString(),
        type: 'incremental',
        size: 0,
        checksum: '',
        encryption: config.encryptionEnabled ? 'AES-256' : 'none',
        retention: '7 days',
        status: 'failed',
        errorMessage,
        version: BACKUP_VERSION,
      }

      await updateBackupMetadataList(failedMetadata)

      throw error
    }
  }

  async restoreBackup(
    backupId: string,
    onProgress?: BackupProgressCallback,
  ): Promise<RestoreResult> {
    try {
      if (typeof window === 'undefined') {
        throw new Error('Restore operations require browser environment')
      }

      onProgress?.({
        current: 1,
        total: 5,
        message: 'Loading backup metadata...',
      })

      const metadata = await getBackupMetadataByIdUtil(backupId)

      if (!metadata) {
        throw new Error(`Backup ${backupId} not found`)
      }

      if (metadata.status !== 'completed') {
        throw new Error(`Backup ${backupId} is not completed`)
      }

      onProgress?.({
        current: 2,
        total: 5,
        message: 'Loading backup data...',
      })

      const backupDataString = await loadBackupFromStorage(backupId)

      if (!backupDataString) {
        throw new Error(`Backup data for ${backupId} not found`)
      }

      onProgress?.({
        current: 3,
        total: 5,
        message: 'Verifying backup integrity...',
      })

      const isValid = await this.verifyBackupIntegrity(backupId)

      if (!isValid) {
        throw new Error(`Backup ${backupId} integrity check failed`)
      }

      onProgress?.({
        current: 4,
        total: 5,
        message: 'Restoring data...',
      })

      const startTime = Date.now()
      const errors: string[] = []
      const warnings: string[] = []

      const backupData: BackupData = JSON.parse(backupDataString)

      try {
        await restoreUserData(backupData.userData, errors)
      } catch (error) {
        errors.push(`Failed to restore user data: ${error}`)
      }

      try {
        await restoreContentData(backupData.contentData, errors)
      } catch (error) {
        errors.push(`Failed to restore content data: ${error}`)
      }

      try {
        await restoreSettingsData(backupData.settingsData, errors)
      } catch (error) {
        errors.push(`Failed to restore settings data: ${error}`)
      }

      try {
        await restoreActivityLogs(backupData.activityLogs, errors)
      } catch (error) {
        errors.push(`Failed to restore activity logs: ${error}`)
      }

      const restoreTime = Date.now() - startTime
      const itemsRestored =
        backupData.userData.authState.length +
        backupData.userData.preferences.length +
        (backupData.contentData.blogPosts?.length || 0) +
        (backupData.contentData.blogComments?.length || 0)

      onProgress?.({
        current: 5,
        total: 5,
        message: 'Restore completed',
      })

      const result: RestoreResult = {
        success: errors.length === 0,
        backupId,
        restoreDate: new Date().toISOString(),
        restoreTime,
        itemsRestored,
        errors,
        warnings,
      }

      return result
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error'

      return {
        success: false,
        backupId,
        restoreDate: new Date().toISOString(),
        restoreTime: 0,
        itemsRestored: 0,
        errors: [errorMessage],
        warnings: [],
      }
    }
  }

  async verifyBackupIntegrity(backupId: string): Promise<boolean> {
    try {
      if (typeof window === 'undefined') {
        return false
      }

      const metadata = await getBackupMetadataByIdUtil(backupId)

      if (!metadata) {
        return false
      }

      const backupData = await loadBackupFromStorage(backupId)

      if (!backupData) {
        return false
      }

      const checksum = calculateChecksum(backupData)

      return checksum === metadata.checksum
    } catch {
      return false
    }
  }

  async getBackupStatistics(): Promise<BackupStatistics> {
    try {
      const metadataList = await getBackupMetadataListUtil()

      const totalBackups = metadataList.length
      const completedBackups = metadataList.filter(
        (m) => m.status === 'completed',
      )
      const failedBackups = metadataList.filter((m) => m.status === 'failed')

      const totalBackupSize = completedBackups.reduce(
        (sum, backup) => sum + backup.size,
        0,
      )

      const lastBackup =
        completedBackups.length > 0
          ? completedBackups.sort(
              (a, b) =>
                new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime(),
            )[0]
          : null

      const storageUsage = calculateStorageUsage()
      const healthStatus = calculateHealthStatus(
        storageUsage,
        failedBackups.length,
      )

      return {
        totalBackups,
        successfulBackups: completedBackups.length,
        failedBackups: failedBackups.length,
        totalBackupSize,
        lastBackupDate: lastBackup ? lastBackup.timestamp : null,
        lastBackupStatus: lastBackup ? lastBackup.status : 'pending',
        retentionCompliance: calculateRetentionCompliance(completedBackups),
        healthStatus,
      }
    } catch (error) {
      console.error('Failed to get backup statistics:', error)
      return {
        totalBackups: 0,
        successfulBackups: 0,
        failedBackups: 0,
        totalBackupSize: 0,
        lastBackupDate: null,
        lastBackupStatus: 'pending',
        retentionCompliance: 100,
        healthStatus: 'healthy',
      }
    }
  }

  async deleteBackup(backupId: string): Promise<boolean> {
    return deleteBackupFromStorage(backupId)
  }

  async exportBackupToFile(
    backupId: string,
  ): Promise<Blob | null> {
    return exportBackupToFileUtil(backupId)
  }

  public async getBackupMetadataList(): Promise<BackupMetadata[]> {
    return getBackupMetadataListUtil()
  }

  public async getBackupMetadataById(
    backupId: string,
  ): Promise<BackupMetadata | null> {
    return getBackupMetadataByIdUtil(backupId)
  }
}

const backupEngine = BackupEngine.getInstance()

export default backupEngine

export const createFullBackup = backupEngine.createFullBackup.bind(backupEngine)
export const createIncrementalBackup = backupEngine.createIncrementalBackup.bind(backupEngine)
export const restoreBackup = backupEngine.restoreBackup.bind(backupEngine)
export const verifyBackupIntegrity = backupEngine.verifyBackupIntegrity.bind(backupEngine)
export const getBackupStatistics = backupEngine.getBackupStatistics.bind(backupEngine)
export const deleteBackup = backupEngine.deleteBackup.bind(backupEngine)
export const exportBackupToFile = backupEngine.exportBackupToFile.bind(backupEngine)
export const getBackupMetadataList = backupEngine.getBackupMetadataList.bind(backupEngine)
export const getBackupMetadataById = backupEngine.getBackupMetadataById.bind(backupEngine)
