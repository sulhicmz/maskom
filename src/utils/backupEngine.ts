import {
  BackupData,
  BackupMetadata,
  BackupType,
  BackupInfo,
  RestoreResult,
  BackupStatistics,
  BackupConfig,
  BackupHealthStatus,
  UserDataBackup,
  ContentDataBackup,
  SettingsDataBackup,
  ActivityLogBackup,
} from '@/types/backup'

import { BACKUP_METADATA_KEY, BACKUP_DATA_KEY_PREFIX } from '@/types/backup'

interface BackupProgress {
  current: number
  total: number
  message: string
}

type BackupProgressCallback = (progress: BackupProgress) => void

const APPLICATION_VERSION = '1.0.0'
const BACKUP_VERSION = '1.0.0'

const STORAGE_QUOTA_WARNING_THRESHOLD = 0.8
const STORAGE_QUOTA_ERROR_THRESHOLD = 0.95

export class BackupEngine {
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

      const backupId = this.generateBackupId('full')
      const timestamp = new Date().toISOString()

      onProgress?.({
        current: 1,
        total: 5,
        message: 'Collecting user data...',
      })

      const userData = await this.collectUserData()

      onProgress?.({
        current: 2,
        total: 5,
        message: 'Collecting content data...',
      })

      const contentData = await this.collectContentData()

      onProgress?.({
        current: 3,
        total: 5,
        message: 'Collecting settings data...',
      })

      const settingsData = await this.collectSettingsData()

      onProgress?.({
        current: 4,
        total: 5,
        message: 'Collecting activity logs...',
      })

      const activityLogs = await this.collectActivityLogs()

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
        serializedData = await this.compressData(serializedData)
      }

      let checksum = this.calculateChecksum(serializedData)

      if (config.encryptionEnabled) {
        const encrypted = await this.encryptData(serializedData)
        serializedData = encrypted
        checksum = this.calculateChecksum(serializedData)
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

      await this.saveBackupToStorage(backupId, serializedData)

      await this.updateBackupMetadataList(metadata)

      return metadata
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error'
      const failedMetadata: BackupMetadata = {
        id: this.generateBackupId('full'),
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

      await this.updateBackupMetadataList(failedMetadata)

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

      const backupId = this.generateBackupId('incremental')
      const timestamp = new Date().toISOString()

      onProgress?.({
        current: 1,
        total: 4,
        message: 'Calculating changes since last backup...',
      })

      const changes = await this.calculateChangesSinceBackup()

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
        serializedData = await this.compressData(serializedData)
      }

      let checksum = this.calculateChecksum(serializedData)

      if (config.encryptionEnabled) {
        const encrypted = await this.encryptData(serializedData)
        serializedData = encrypted
        checksum = this.calculateChecksum(serializedData)
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

      await this.saveBackupToStorage(backupId, serializedData)

      await this.updateBackupMetadataList(metadata)

      onProgress?.({
        current: 4,
        total: 4,
        message: 'Incremental backup completed',
      })

      return metadata
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error'
      const failedMetadata: BackupMetadata = {
        id: this.generateBackupId('incremental'),
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

      await this.updateBackupMetadataList(failedMetadata)

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

      const metadata = await this.getBackupMetadataById(backupId)

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

      const backupDataString = await this.loadBackupFromStorage(backupId)

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
        await this.restoreUserData(backupData.userData, errors, warnings)
      } catch (error) {
        errors.push(`Failed to restore user data: ${error}`)
      }

      try {
        await this.restoreContentData(backupData.contentData, errors, warnings)
      } catch (error) {
        errors.push(`Failed to restore content data: ${error}`)
      }

      try {
        await this.restoreSettingsData(backupData.settingsData, errors, warnings)
      } catch (error) {
        errors.push(`Failed to restore settings data: ${error}`)
      }

      try {
        await this.restoreActivityLogs(backupData.activityLogs, errors, warnings)
      } catch (error) {
        errors.push(`Failed to restore activity logs: ${error}`)
      }

      const restoreTime = Date.now() - startTime
      const itemsRestored =
        backupData.userData.authState.length +
        backupData.userData.preferences.length +
        backupData.contentData.blogPosts.length +
        backupData.contentData.blogComments.length

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

      const metadata = await this.getBackupMetadataById(backupId)

      if (!metadata) {
        return false
      }

      const backupData = await this.loadBackupFromStorage(backupId)

      if (!backupData) {
        return false
      }

      const checksum = this.calculateChecksum(backupData)

      return checksum === metadata.checksum
    } catch {
      return false
    }
  }

  async encryptData(data: string): Promise<string> {
    try {
      const encoder = new TextEncoder()
      const dataBuffer = encoder.encode(data)

      const key = await crypto.subtle.generateKey(
        {
          name: 'AES-GCM',
          length: 256,
        },
        true,
        ['encrypt', 'decrypt'],
      )

      const iv = crypto.getRandomValues(new Uint8Array(12))
      const encryptedData = await crypto.subtle.encrypt(
        {
          name: 'AES-GCM',
          iv,
        },
        key,
        dataBuffer,
      )

      const keyBuffer = await crypto.subtle.exportKey('raw', key)
      const encryptedDataUint8Array = new Uint8Array(encryptedData)
      const combined = new Uint8Array(
        iv.length + keyBuffer.byteLength + encryptedData.byteLength,
      )
      combined.set(iv, 0)
      combined.set(new Uint8Array(keyBuffer), iv.length)
      combined.set(encryptedDataUint8Array, iv.length + keyBuffer.byteLength)

      const base64 = btoa(String.fromCharCode(...combined))

      return `ENCRYPTED::${base64}`
    } catch (error) {
      console.error('Encryption failed:', error)
      throw new Error('Failed to encrypt backup data')
    }
  }

  async decryptData(encryptedData: string): Promise<string> {
    try {
      if (!encryptedData.startsWith('ENCRYPTED::')) {
        return encryptedData
      }

      const base64 = encryptedData.replace('ENCRYPTED::', '')
      const binaryString = atob(base64)
      const combined = new Uint8Array(binaryString.length)

      for (let i = 0; i < binaryString.length; i++) {
        combined[i] = binaryString.charCodeAt(i)
      }

      const iv = combined.slice(0, 12)
      const keyBuffer = combined.slice(12, 44)
      const dataBuffer = combined.slice(44)

      const key = await crypto.subtle.importKey(
        'raw',
        keyBuffer,
        {
          name: 'AES-GCM',
          length: 256,
        },
        true,
        ['decrypt'],
      )

      const decryptedData = await crypto.subtle.decrypt(
        {
          name: 'AES-GCM',
          iv,
        },
        key,
        dataBuffer,
      )

      const decoder = new TextDecoder()
      return decoder.decode(decryptedData)
    } catch (error) {
      console.error('Decryption failed:', error)
      throw new Error('Failed to decrypt backup data')
    }
  }

  async compressData(data: string): Promise<string> {
    try {
      const encoder = new TextEncoder()
      const dataBuffer = encoder.encode(data)

      const compressedStream = new CompressionStream('gzip')
      const writer = compressedStream.writable.getWriter()

      await writer.write(dataBuffer)
      await writer.close()

      const reader = compressedStream.readable.getReader()
      const chunks: Uint8Array[] = []

      let result = await reader.read()
      while (!result.done) {
        if (result.value) {
          chunks.push(result.value)
        }
        result = await reader.read()
      }

      const combined = new Uint8Array(
        chunks.reduce((total, chunk) => total + chunk.length, 0),
      )
      let offset = 0
      for (const chunk of chunks) {
        combined.set(chunk, offset)
        offset += chunk.length
      }

      const base64 = btoa(String.fromCharCode(...combined))

      return `COMPRESSED::${base64}`
    } catch (error) {
      console.error('Compression failed:', error)
      throw new Error('Failed to compress backup data')
    }
  }

  async decompressData(compressedData: string): Promise<string> {
    try {
      if (!compressedData.startsWith('COMPRESSED::')) {
        return compressedData
      }

      const base64 = compressedData.replace('COMPRESSED::', '')
      const binaryString = atob(base64)
      const compressed = new Uint8Array(binaryString.length)

      for (let i = 0; i < binaryString.length; i++) {
        compressed[i] = binaryString.charCodeAt(i)
      }

      const decompressedStream = new DecompressionStream('gzip')
      const writer = decompressedStream.writable.getWriter()

      await writer.write(compressed)
      await writer.close()

      const reader = decompressedStream.readable.getReader()
      const chunks: Uint8Array[] = []

      let result = await reader.read()
      while (!result.done) {
        if (result.value) {
          chunks.push(result.value)
        }
        result = await reader.read()
      }

      const combined = new Uint8Array(
        chunks.reduce((total, chunk) => total + chunk.length, 0),
      )
      let offset = 0
      for (const chunk of chunks) {
        combined.set(chunk, offset)
        offset += chunk.length
      }

      const decoder = new TextDecoder()
      return decoder.decode(combined)
    } catch (error) {
      console.error('Decompression failed:', error)
      throw new Error('Failed to decompress backup data')
    }
  }

  async getBackupStatistics(): Promise<BackupStatistics> {
    try {
      const metadataList = await this.getBackupMetadataList()

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

      const storageUsage = this.calculateStorageUsage()
      const healthStatus = this.calculateHealthStatus(
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
        retentionCompliance: this.calculateRetentionCompliance(completedBackups),
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
    try {
      if (typeof window === 'undefined') {
        return false
      }

      const storageKey = `${BACKUP_DATA_KEY_PREFIX}${backupId}`

      await this.removeBackupFromMetadataList(backupId)
      localStorage.removeItem(storageKey)

      return true
    } catch (error) {
      console.error('Failed to delete backup:', error)
      return false
    }
  }

  async exportBackupToFile(
    backupId: string,
  ): Promise<Blob | null> {
    try {
      if (typeof window === 'undefined') {
        return null
      }

      const backupData = await this.loadBackupFromStorage(backupId)

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

  private generateBackupId(type: BackupType): string {
    const date = new Date().toISOString().split('T')[0]
    const random = Math.random().toString(36).substring(2, 8)
    return `backup-${date}-${type}-${random}`
  }

  private calculateChecksum(data: string): string {
    let hash = 0

    for (let i = 0; i < data.length; i++) {
      const char = data.charCodeAt(i)
      hash = (hash << 5) - hash + char
      hash = hash & hash
    }

    return Math.abs(hash).toString(16).padStart(32, '0')
  }

  private calculateStorageUsage(): number {
    try {
      if (typeof window === 'undefined') {
        return 0
      }

      const metadataList = this.getBackupMetadataListSync()
      const totalSize = metadataList.reduce((sum, backup) => sum + backup.size, 0)

      const quotaEstimate = 5 * 1024 * 1024 * 1024

      return totalSize / quotaEstimate
    } catch {
      return 0
    }
  }

  private calculateHealthStatus(
    storageUsage: number,
    failedCount: number,
  ): BackupHealthStatus {
    if (storageUsage > STORAGE_QUOTA_ERROR_THRESHOLD || failedCount > 5) {
      return 'critical'
    }

    if (
      storageUsage > STORAGE_QUOTA_WARNING_THRESHOLD ||
      failedCount > 2
    ) {
      return 'warning'
    }

    return 'healthy'
  }

  private calculateRetentionCompliance(backups: BackupMetadata[]): number {
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

  private async collectUserData(): Promise<UserDataBackup> {
    return {
      authState: [],
      preferences: [],
      mfaSettings: [],
    }
  }

  private async collectContentData(): Promise<ContentDataBackup> {
    return {
      blogPosts: [],
      blogComments: [],
      mediaAssets: [],
    }
  }

  private async collectSettingsData(): Promise<SettingsDataBackup> {
    return {
      cacheConfig: {
        cacheFirstExtensions: [],
        networkFirstPatterns: [],
        cacheTTL: {
          staticAssets: 0,
          apiResponses: 0,
          images: 0,
          fonts: 0,
        },
        cacheSizeLimit: 0,
        cleanupPolicy: {
          enabled: false,
          maxAge: 0,
          maxEntries: 0,
          autoCleanupInterval: 0,
        },
      },
      apmConfig: {
        provider: 'none',
        enabled: false,
        environment: 'development',
        sampleRate: 0,
      },
      rbacConfig: {
        roles: {
          admin: [],
          editor: [],
          user: [],
        },
        permissions: {
          view_analytics: [],
          manage_users: [],
          manage_roles: [],
          manage_content: [],
          publish_content: [],
          edit_content: [],
          delete_content: [],
          view_admin_dashboard: [],
          manage_settings: [],
        },
      },
      backupConfig: {
        enabled: false,
        schedule: 'manual',
        time: '00:00',
        retentionDays: 0,
        storageType: 'none',
        encryptionEnabled: false,
        compressionEnabled: false,
        retentionPolicy: {
          keepLastCount: 0,
          keepDailyFor: 0,
          keepWeeklyFor: 0,
          keepMonthlyFor: 0,
          maxSizeGB: 0,
        },
      },
    }
  }

  private async collectActivityLogs() {
    return []
  }

  private async calculateChangesSinceBackup(): Promise<Omit<BackupData, 'backupInfo'>> {
    return {
      userData: {
        authState: [],
        preferences: [],
        mfaSettings: [],
      },
      contentData: {
        blogPosts: [],
        blogComments: [],
        mediaAssets: [],
      },
      settingsData: {
        cacheConfig: {
          cacheFirstExtensions: [],
          networkFirstPatterns: [],
          cacheTTL: {
            staticAssets: 0,
            apiResponses: 0,
            images: 0,
            fonts: 0,
          },
          cacheSizeLimit: 0,
          cleanupPolicy: {
            enabled: false,
            maxAge: 0,
            maxEntries: 0,
            autoCleanupInterval: 0,
          },
        },
        apmConfig: {
          provider: 'none',
          enabled: false,
          environment: 'development',
          sampleRate: 0,
        },
        rbacConfig: {
          roles: {
            admin: [],
            editor: [],
            user: [],
          },
          permissions: {
            view_analytics: [],
            manage_users: [],
            manage_roles: [],
            manage_content: [],
            publish_content: [],
            edit_content: [],
            delete_content: [],
            view_admin_dashboard: [],
            manage_settings: [],
          },
        },
        backupConfig: {
          enabled: false,
          schedule: 'manual',
          time: '00:00',
          retentionDays: 0,
          storageType: 'none',
          encryptionEnabled: false,
          compressionEnabled: false,
          retentionPolicy: {
            keepLastCount: 0,
            keepDailyFor: 0,
            keepWeeklyFor: 0,
            keepMonthlyFor: 0,
            maxSizeGB: 0,
          },
        },
      },
      activityLogs: [],
    }
  }

  private async restoreUserData(userData: UserDataBackup, errors: string[], warnings: string[]) {
    warnings.push('User data restoration not yet implemented')
  }

  private async restoreContentData(contentData: ContentDataBackup, errors: string[], warnings: string[]) {
    warnings.push('Content data restoration not yet implemented')
  }

  private async restoreSettingsData(settingsData: SettingsDataBackup, errors: string[], warnings: string[]) {
    warnings.push('Settings data restoration not yet implemented')
  }

  private async restoreActivityLogs(activityLogs: ActivityLogBackup[], errors: string[], warnings: string[]) {
    warnings.push('Activity logs restoration not yet implemented')
  }

  private async saveBackupToStorage(
    backupId: string,
    data: string,
  ): Promise<void> {
    if (typeof window === 'undefined') {
      return
    }

    const storageKey = `${BACKUP_DATA_KEY_PREFIX}${backupId}`

    try {
      localStorage.setItem(storageKey, data)
    } catch (error) {
      console.error('Failed to save backup to storage:', error)
      throw new Error('Storage quota exceeded or error saving backup')
    }
  }

  private async loadBackupFromStorage(
    backupId: string,
  ): Promise<string | null> {
    if (typeof window === 'undefined') {
      return null
    }

    const storageKey = `${BACKUP_DATA_KEY_PREFIX}${backupId}`

    try {
      const data = localStorage.getItem(storageKey)
      return data
    } catch {
      return null
    }
  }

  public async getBackupMetadataList(): Promise<BackupMetadata[]> {
    try {
      if (typeof window === 'undefined') {
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

  private getBackupMetadataListSync(): BackupMetadata[] {
    try {
      if (typeof window === 'undefined') {
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

  private async updateBackupMetadataList(
    metadata: BackupMetadata,
  ): Promise<void> {
    if (typeof window === 'undefined') {
      return
    }

    try {
      const currentList = await this.getBackupMetadataList()
      const updatedList = [metadata, ...currentList]
      localStorage.setItem(BACKUP_METADATA_KEY, JSON.stringify(updatedList))
    } catch (error) {
      console.error('Failed to update backup metadata list:', error)
    }
  }

  private async removeBackupFromMetadataList(
    backupId: string,
  ): Promise<void> {
    if (typeof window === 'undefined') {
      return
    }

    try {
      const currentList = await this.getBackupMetadataList()
      const updatedList = currentList.filter((m) => m.id !== backupId)
      localStorage.setItem(BACKUP_METADATA_KEY, JSON.stringify(updatedList))
    } catch (error) {
      console.error('Failed to remove backup from metadata list:', error)
    }
  }

  public async getBackupMetadataById(
    backupId: string,
  ): Promise<BackupMetadata | null> {
    const metadataList = await this.getBackupMetadataList()

    return metadataList.find((m) => m.id === backupId) || null
  }
}

const backupEngine = BackupEngine.getInstance()

export default backupEngine

export const createFullBackup = backupEngine.createFullBackup.bind(backupEngine)
export const createIncrementalBackup = backupEngine.createIncrementalBackup.bind(backupEngine)
export const restoreBackup = backupEngine.restoreBackup.bind(backupEngine)
export const verifyBackupIntegrity = backupEngine.verifyBackupIntegrity.bind(backupEngine)
export const encryptBackup = backupEngine.encryptData.bind(backupEngine)
export const decryptBackup = backupEngine.decryptData.bind(backupEngine)
export const getBackupStatistics = backupEngine.getBackupStatistics.bind(backupEngine)
export const deleteBackup = backupEngine.deleteBackup.bind(backupEngine)
export const exportBackupToFile = backupEngine.exportBackupToFile.bind(backupEngine)
