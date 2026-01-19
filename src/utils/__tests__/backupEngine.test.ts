import backupEngine, {
  createFullBackup,
  createIncrementalBackup,
  restoreBackup,
  verifyBackupIntegrity,
  getBackupStatistics,
  deleteBackup,
  exportBackupToFile,
} from '../backupEngine'

import {
  BackupConfig,
  BackupMetadata,
  BackupType,
} from '@/types/backup'

describe('BackupEngine', () => {
  const mockLocalStorage = {
    storage: {} as Record<string, string>,
    clear() {
      this.storage = {}
    },
    getItem(key: string) {
      return this.storage[key] || null
    },
    setItem(key: string, value: string) {
      this.storage[key] = String(value)
    },
    removeItem(key: string) {
      delete this.storage[key]
    },
  }

  beforeEach(() => {
    mockLocalStorage.clear()
    
    global.window = {
      localStorage: mockLocalStorage as any,
      navigator: { userAgent: 'Test Agent' }
    } as any
    
    jest.clearAllMocks()
    jest.resetModules()
    
    jest.resetModules()
  })

  afterEach(() => {
    jest.restoreAllMocks()
  })

  const createMockBackupConfig = (overrides: Partial<BackupConfig> = {}): BackupConfig => ({
    enabled: true,
    schedule: 'daily',
    time: '00:00',
    retentionDays: 7,
    storageType: 'localStorage',
    encryptionEnabled: false,
    compressionEnabled: false,
    retentionPolicy: {
      keepLastCount: 5,
      keepDailyFor: 7,
      keepWeeklyFor: 4,
      keepMonthlyFor: 3,
      maxSizeGB: 10,
    },
    ...overrides,
  })

  describe('createFullBackup', () => {
    it('should create a full backup with valid metadata', async () => {
      const config = createMockBackupConfig()

      const result = await createFullBackup(config)

      expect(result).toBeDefined()
      expect(result.id).toMatch(/^backup-\d{4}-\d{2}-\d{2}-full-[a-z0-9]{6}$/)
      expect(result.type).toBe('full')
      expect(result.status).toBe('completed')
      expect(result.encryption).toBe('none')
      expect(result.version).toBe('1.0.0')
      expect(result.retention).toBe('7 days')
    })

    it('should call progress callback during backup creation', async () => {
      const config = createMockBackupConfig()
      const progressCallback = jest.fn()

      await createFullBackup(config, progressCallback)

      expect(progressCallback).toHaveBeenCalledTimes(5)
      expect(progressCallback).toHaveBeenCalledWith({
        current: 1,
        total: 5,
        message: 'Collecting user data...',
      })
      expect(progressCallback).toHaveBeenCalledWith({
        current: 2,
        total: 5,
        message: 'Collecting content data...',
      })
      expect(progressCallback).toHaveBeenCalledWith({
        current: 3,
        total: 5,
        message: 'Collecting settings data...',
      })
      expect(progressCallback).toHaveBeenCalledWith({
        current: 4,
        total: 5,
        message: 'Collecting activity logs...',
      })
      expect(progressCallback).toHaveBeenCalledWith({
        current: 5,
        total: 5,
        message: 'Finalizing backup...',
      })
    })

    it('should throw error when called in server environment', async () => {
      const originalWindow = global.window
      delete (global as any).window

      const config = createMockBackupConfig()

      await expect(createFullBackup(config)).rejects.toThrow(
        'Backup operations require browser environment',
      )

      global.window = originalWindow
    })

    it('should store backup metadata in localStorage', async () => {
      mockLocalStorage.clear()
      const config = createMockBackupConfig()

      await createFullBackup(config)

      const metadataList = JSON.parse(
        mockLocalStorage.getItem('maskom_backup_metadata') || '[]',
      )

      expect(metadataList).toHaveLength(1)
      expect(metadataList[0].type).toBe('full')
    })

    it('should generate unique backup IDs', async () => {
      const config = createMockBackupConfig()

      const backup1 = await createFullBackup(config)
      const backup2 = await createFullBackup(config)

      expect(backup1.id).not.toBe(backup2.id)
    })

    it('should handle backup errors and store failed metadata', async () => {
      mockLocalStorage.clear()
      const config = createMockBackupConfig()

      const backupId = 'backup-test-failed'
      jest.spyOn(backupEngine as any, 'generateBackupId').mockReturnValue(backupId)
      jest.spyOn(backupEngine as any, 'saveBackupToStorage').mockRejectedValue(
        new Error('Storage error'),
      )

      await expect(createFullBackup(config)).rejects.toThrow()

      const metadataList = JSON.parse(
        mockLocalStorage.getItem('maskom_backup_metadata') || '[]',
      )

      expect(metadataList[0]).toBeDefined()
      expect(metadataList[0].status).toBe('failed')
      expect(metadataList[0].errorMessage).toBe('Storage error')
    })

    it('should calculate checksum for backup data', async () => {
      const config = createMockBackupConfig()

      const result = await createFullBackup(config)

      expect(result.checksum).toBeDefined()
      expect(result.checksum).toMatch(/^[0-9a-f]{32}$/)
    })

    it('should set backup size correctly', async () => {
      const config = createMockBackupConfig()

      const result = await createFullBackup(config)

      expect(result.size).toBeGreaterThan(0)
    })
  })

  describe('createIncrementalBackup', () => {
    const createMockBackupMetadata = (
      type: BackupType = 'full',
    ): BackupMetadata => ({
      id: `backup-2026-01-18-${type}-test`,
      timestamp: new Date().toISOString(),
      type,
      size: 1024,
      checksum: 'test-checksum',
      encryption: 'none',
      retention: '7 days',
      status: 'completed',
      version: '1.0.0',
    })

    it('should create incremental backup with last full backup', async () => {
      const config = createMockBackupConfig()
      const lastBackup = createMockBackupMetadata('full')

      const result = await createIncrementalBackup(config, lastBackup)

      expect(result).toBeDefined()
      expect(result.type).toBe('incremental')
      expect(result.status).toBe('completed')
    })

    it('should throw error when no last full backup provided', async () => {
      const config = createMockBackupConfig()

      await expect(
        createIncrementalBackup(config, null),
      ).rejects.toThrow('Cannot create incremental backup without a full backup')
    })

    it('should call progress callback during incremental backup', async () => {
      const config = createMockBackupConfig()
      const lastBackup = createMockBackupMetadata('full')
      const progressCallback = jest.fn()

      await createIncrementalBackup(config, lastBackup, progressCallback)

      expect(progressCallback).toHaveBeenCalled()
      expect(progressCallback).toHaveBeenCalledWith({
        current: 1,
        total: 4,
        message: 'Calculating changes since last backup...',
      })
    })

    it('should set retention to 7 days for incremental backups', async () => {
      const config = createMockBackupConfig()
      const lastBackup = createMockBackupMetadata('full')

      const result = await createIncrementalBackup(config, lastBackup)

      expect(result.retention).toBe('7 days')
    })

    it('should handle incremental backup errors', async () => {
      const config = createMockBackupConfig()
      const lastBackup = createMockBackupMetadata('full')

      jest.spyOn(backupEngine as any, 'calculateChangesSinceBackup').mockRejectedValue(
        new Error('Calculation error'),
      )

      await expect(
        createIncrementalBackup(config, lastBackup),
      ).rejects.toThrow('Calculation error')
    })
  })

  describe('restoreBackup', () => {
    it('should restore backup successfully', async () => {
      const config = createMockBackupConfig()
      const backup = await createFullBackup(config)

      const result = await restoreBackup(backup.id)

      expect(result).toBeDefined()
      expect(result.backupId).toBe(backup.id)
      expect(result.restoreTime).toBeGreaterThan(0)
      expect(result.itemsRestored).toBe(0)
    })

    it('should return error result for non-existent backup', async () => {
      const result = await restoreBackup('non-existent-id')

      expect(result.success).toBe(false)
      expect(result.errors).toContain('Backup non-existent-id not found')
    })

    it('should call progress callback during restore', async () => {
      const config = createMockBackupConfig()
      const backup = await createFullBackup(config)
      const progressCallback = jest.fn()

      await restoreBackup(backup.id, progressCallback)

      expect(progressCallback).toHaveBeenCalled()
      expect(progressCallback).toHaveBeenCalledWith({
        current: 1,
        total: 5,
        message: 'Loading backup metadata...',
      })
    })
  })

  describe('verifyBackupIntegrity', () => {
    it('should verify valid backup integrity', async () => {
      const config = createMockBackupConfig()
      const backup = await createFullBackup(config)

      const result = await verifyBackupIntegrity(backup.id)

      expect(result).toBe(true)
    })

    it('should return false for non-existent backup', async () => {
      const result = await verifyBackupIntegrity('non-existent-id')

      expect(result).toBe(false)
    })

    it('should return false for backup with mismatched checksum', async () => {
      const config = createMockBackupConfig()
      const backup = await createFullBackup(config)

      jest.spyOn(backupEngine as any, 'calculateChecksum').mockReturnValue(
        'different-checksum',
      )

      const result = await verifyBackupIntegrity(backup.id)

      expect(result).toBe(false)
    })

    it('should return false in server environment', async () => {
      const originalWindow = global.window
      delete (global as any).window

      const result = await verifyBackupIntegrity('any-id')

      expect(result).toBe(false)

      global.window = originalWindow
    })
  })

  describe('getBackupStatistics', () => {
    it('should calculate backup statistics correctly', async () => {
      const config = createMockBackupConfig()

      await createFullBackup(config)
      await createFullBackup(config)

      const stats = await getBackupStatistics()

      expect(stats).toBeDefined()
      expect(stats.totalBackups).toBeGreaterThanOrEqual(2)
      expect(stats.successfulBackups).toBeGreaterThanOrEqual(2)
      expect(stats.lastBackupDate).not.toBeNull()
      expect(stats.healthStatus).toBe('healthy')
    })

    it('should return default statistics on error', async () => {
      jest.spyOn(localStorage, 'getItem').mockImplementation(() => {
        throw new Error('Storage error')
      })

      const stats = await getBackupStatistics()

      expect(stats.totalBackups).toBe(0)
      expect(stats.successfulBackups).toBe(0)
      expect(stats.lastBackupDate).toBeNull()
    })

    it('should calculate retention compliance correctly', async () => {
      const config = createMockBackupConfig()

      await createFullBackup(config)

      const stats = await getBackupStatistics()

      expect(stats.retentionCompliance).toBe(100)
    })

    it('should detect warning health status with failed backups', async () => {
      const config = createMockBackupConfig()

      await createFullBackup(config)

      const failedMetadata: BackupMetadata = {
        id: 'backup-failed',
        timestamp: new Date().toISOString(),
        type: 'full',
        size: 0,
        checksum: '',
        encryption: 'none',
        retention: '7 days',
        status: 'failed',
        errorMessage: 'Test error',
        version: '1.0.0',
      }

      const metadataList = JSON.parse(
        mockLocalStorage.getItem('maskom_backup_metadata') || '[]',
      )
      metadataList.push(failedMetadata)
      mockLocalStorage.setItem(
        'maskom_backup_metadata',
        JSON.stringify(metadataList),
      )

      const stats = await getBackupStatistics()

      expect(stats.healthStatus).toBe('warning')
    })

    it('should detect critical health status with many failed backups', async () => {
      const config = createMockBackupConfig()

      await createFullBackup(config)

      const metadataList = JSON.parse(
        mockLocalStorage.getItem('maskom_backup_metadata') || '[]',
      )

      for (let i = 0; i < 6; i++) {
        const failedMetadata: BackupMetadata = {
          id: `backup-failed-${i}`,
          timestamp: new Date().toISOString(),
          type: 'full',
          size: 0,
          checksum: '',
          encryption: 'none',
          retention: '7 days',
          status: 'failed',
          errorMessage: 'Test error',
          version: '1.0.0',
        }
        metadataList.push(failedMetadata)
      }

      mockLocalStorage.setItem(
        'maskom_backup_metadata',
        JSON.stringify(metadataList),
      )

      const stats = await getBackupStatistics()

      expect(stats.healthStatus).toBe('critical')
    })
  })

  describe('deleteBackup', () => {
    it('should delete backup successfully', async () => {
      const config = createMockBackupConfig()
      const backup = await createFullBackup(config)

      const result = await deleteBackup(backup.id)

      expect(result).toBe(true)

      const metadataList = JSON.parse(
        mockLocalStorage.getItem('maskom_backup_metadata') || '[]',
      )

      expect(metadataList.find((m: BackupMetadata) => m.id === backup.id)).toBeUndefined()
    })

    it('should return false for non-existent backup', async () => {
      const result = await deleteBackup('non-existent-id')

      expect(result).toBe(false)
    })

    it('should return false in server environment', async () => {
      const originalWindow = global.window
      delete (global as any).window

      const result = await deleteBackup('any-id')

      expect(result).toBe(false)

      global.window = originalWindow
    })
  })

  describe('exportBackupToFile', () => {
    it('should export backup to blob', async () => {
      const config = createMockBackupConfig()
      const backup = await createFullBackup(config)

      const blob = await exportBackupToFile(backup.id)

      expect(blob).not.toBeNull()
      expect(blob!.type).toBe('application/json')
    })

    it('should return null for non-existent backup', async () => {
      const blob = await exportBackupToFile('non-existent-id')

      expect(blob).toBeNull()
    })

    it('should return null in server environment', async () => {
      const originalWindow = global.window
      delete (global as any).window

      const blob = await exportBackupToFile('any-id')

      expect(blob).toBeNull()

      global.window = originalWindow
    })
  })

  describe('utility functions', () => {
    it('should generate unique backup IDs', () => {
      const id1 = (backupEngine as any).generateBackupId('full')
      const id2 = (backupEngine as any).generateBackupId('full')

      expect(id1).toMatch(/^backup-\d{4}-\d{2}-\d{2}-full-[a-z0-9]{6}$/)
      expect(id1).not.toBe(id2)
    })

    it('should calculate checksum consistently', () => {
      const testData = 'test data'

      const checksum1 = (backupEngine as any).calculateChecksum(testData)
      const checksum2 = (backupEngine as any).calculateChecksum(testData)

      expect(checksum1).toBe(checksum2)
      expect(checksum1).toMatch(/^[0-9a-f]{32}$/)
    })

    it('should calculate different checksums for different data', () => {
      const checksum1 = (backupEngine as any).calculateChecksum('data1')
      const checksum2 = (backupEngine as any).calculateChecksum('data2')

      expect(checksum1).not.toBe(checksum2)
    })

    it('should calculate storage usage correctly', () => {
      const metadataList: BackupMetadata[] = [
        {
          id: 'backup-1',
          timestamp: new Date().toISOString(),
          type: 'full',
          size: 1024,
          checksum: 'test',
          encryption: 'none',
          retention: '7 days',
          status: 'completed',
          version: '1.0.0',
        },
      ]

      mockLocalStorage.setItem(
        'maskom_backup_metadata',
        JSON.stringify(metadataList),
      )

      const usage = (backupEngine as any).calculateStorageUsage()

      expect(usage).toBeGreaterThan(0)
      expect(usage).toBeLessThan(1)
    })
  })

  describe('edge cases', () => {
    it('should handle empty localStorage gracefully', () => {
      mockLocalStorage.clear()

      const logs = (backupEngine as any).getBackupMetadataListSync()

      expect(logs).toEqual([])
    })

    it('should handle malformed localStorage data', () => {
      mockLocalStorage.clear()
      mockLocalStorage.setItem('maskom_backup_metadata', 'invalid json')

      const logs = (backupEngine as any).getBackupMetadataListSync()

      expect(logs).toEqual([])
    })

    it('should handle backup with empty data', async () => {
      const config = createMockBackupConfig()

      const result = await createFullBackup(config)

      expect(result.status).toBe('completed')
      expect(result.size).toBeGreaterThan(0)
    })

    it('should handle backup with zero retention days', async () => {
      const config = createMockBackupConfig({ retentionDays: 0 })

      const result = await createFullBackup(config)

      expect(result.status).toBe('completed')
      expect(result.retention).toBe('0 days')
    })

    it('should handle getBackupMetadataList when key does not exist', async () => {
      mockLocalStorage.clear()

      const list = await (backupEngine as any).getBackupMetadataList()

      expect(list).toEqual([])
    })

    it('should handle large number of backups', async () => {
      const config = createMockBackupConfig()

      for (let i = 0; i < 10; i++) {
        await createFullBackup(config)
      }

      const stats = await getBackupStatistics()

      expect(stats.totalBackups).toBeGreaterThanOrEqual(10)
    })
  })
})
