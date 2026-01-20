import {
  saveBackupToStorage,
  loadBackupFromStorage,
  getBackupMetadataList,
  getBackupMetadataListSync,
  updateBackupMetadataList,
  removeBackupFromMetadataList,
  deleteBackupFromStorage,
  exportBackupToFile,
} from '../backupStorage'

interface BackupMetadata {
  id: string
  timestamp?: string
  size?: number
  type?: string
  checksum?: string
  encryption?: string
  retention?: string
  status?: string
  errorMessage?: string
  version?: string
}

describe('backupStorage', () => {
  const mockLocalStorage: { [key: string]: string } = {}

  beforeEach(() => {
    mockLocalStorage['maskom_backup_metadata'] = JSON.stringify([])
    Object.defineProperty(window, 'localStorage', {
      value: {
        getItem: jest.fn((key: string) => mockLocalStorage[key] || null),
        setItem: jest.fn((key: string, value: string) => {
          mockLocalStorage[key] = value
        }),
        removeItem: jest.fn((key: string) => {
          delete mockLocalStorage[key]
        }),
      },
      writable: true,
    })
  })

  afterEach(() => {
    Object.keys(mockLocalStorage).forEach(key => delete mockLocalStorage[key])
    mockLocalStorage['maskom_backup_metadata'] = JSON.stringify([])
  })

  describe('saveBackupToStorage', () => {
    it('should save backup data to localStorage', async () => {
      const backupId = 'backup_1'
      const data = '{"test": "data"}'

      await saveBackupToStorage(backupId, data)

      expect(window.localStorage.setItem).toHaveBeenCalledWith('maskom_backup_data_backup_1', data)
    })

    it('should handle saving empty string', async () => {
      const backupId = 'backup_empty'
      const data = ''

      await saveBackupToStorage(backupId, data)

      expect(window.localStorage.setItem).toHaveBeenCalledWith('maskom_backup_data_backup_empty', data)
    })

    it('should handle saving large data', async () => {
      const backupId = 'backup_large'
      const data = JSON.stringify({ data: 'A'.repeat(10000) })

      await saveBackupToStorage(backupId, data)

      expect(window.localStorage.setItem).toHaveBeenCalledWith('maskom_backup_data_backup_large', data)
    })

    it('should throw error when localStorage is full', async () => {
      const backupId = 'backup_full'
      const data = '{"test": "data"}'

      ;(window.localStorage.setItem as jest.Mock).mockImplementationOnce(() => {
        throw new Error('QuotaExceededError')
      })

      await expect(saveBackupToStorage(backupId, data)).rejects.toThrow('Storage quota exceeded or error saving backup')
    })

    it('should throw error on storage failure', async () => {
      const backupId = 'backup_error'
      const data = '{"test": "data"}'

      ;(window.localStorage.setItem as jest.Mock).mockImplementationOnce(() => {
        throw new Error('Storage error')
      })

      await expect(saveBackupToStorage(backupId, data)).rejects.toThrow('Storage quota exceeded or error saving backup')
    })
  })

  describe('loadBackupFromStorage', () => {
    it('should load backup data from localStorage', async () => {
      const backupId = 'backup_1'
      const data = '{"test": "data"}'
      mockLocalStorage['maskom_backup_data_backup_1'] = data

      const loaded = await loadBackupFromStorage(backupId)

      expect(loaded).toBe(data)
      expect(window.localStorage.getItem).toHaveBeenCalledWith('maskom_backup_data_backup_1')
    })

    it('should return null for non-existent backup', async () => {
      const backupId = 'backup_nonexistent'

      const loaded = await loadBackupFromStorage(backupId)

      expect(loaded).toBeNull()
    })

    it('should return null when localStorage is not available', async () => {
      const originalLocalStorage = window.localStorage
      Object.defineProperty(window, 'localStorage', { value: undefined, writable: true })

      const loaded = await loadBackupFromStorage('backup_1')

      expect(loaded).toBeNull()

      Object.defineProperty(window, 'localStorage', { value: originalLocalStorage, writable: true })
    })

    it('should handle corrupted data gracefully', async () => {
      const backupId = 'backup_corrupt'
      mockLocalStorage['backup_data_backup_corrupt'] = 'invalid'

      ;(window.localStorage.getItem as jest.Mock).mockImplementationOnce(() => {
        throw new Error('Corrupted data')
      })

      const loaded = await loadBackupFromStorage(backupId)

      expect(loaded).toBeNull()
    })
  })

  describe('getBackupMetadataList', () => {
    it('should load empty metadata list', async () => {
      mockLocalStorage['maskom_backup_metadata'] = JSON.stringify([])

      const list = await getBackupMetadataList()

      expect(list).toEqual([])
      expect(window.localStorage.getItem).toHaveBeenCalledWith('maskom_backup_metadata')
    })

    it('should load metadata list with items', async () => {
      const metadata: BackupMetadata[] = [
        { id: '1', timestamp: Date.now().toString(), size: 100 },
        { id: '2', timestamp: Date.now().toString(), size: 200 },
      ]
      mockLocalStorage['maskom_backup_metadata'] = JSON.stringify(metadata)

      const list = await getBackupMetadataList()

      expect(list).toEqual(metadata)
    })

    it('should return empty array when metadata not found', async () => {
      delete mockLocalStorage['maskom_backup_metadata']

      const list = await getBackupMetadataList()

      expect(list).toEqual([])
    })

    it('should return empty array on error', async () => {
      ;(window.localStorage.getItem as jest.Mock).mockImplementationOnce(() => {
        throw new Error('Parse error')
      })

      const list = await getBackupMetadataList()

      expect(list).toEqual([])
    })

    it('should return empty array for invalid JSON', async () => {
      mockLocalStorage['maskom_backup_metadata'] = 'invalid json'

      const list = await getBackupMetadataList()

      expect(list).toEqual([])
    })
  })

  describe('getBackupMetadataListSync', () => {
    it('should load empty metadata list synchronously', () => {
      mockLocalStorage['maskom_backup_metadata'] = JSON.stringify([])

      const list = getBackupMetadataListSync()

      expect(list).toEqual([])
      expect(window.localStorage.getItem).toHaveBeenCalledWith('maskom_backup_metadata')
    })

    it('should load metadata list with items synchronously', () => {
      const metadata: BackupMetadata[] = [
        { id: '1', timestamp: Date.now().toString(), size: 100 },
        { id: '2', timestamp: Date.now().toString(), size: 200 },
      ]
      mockLocalStorage['maskom_backup_metadata'] = JSON.stringify(metadata)

      const list = getBackupMetadataListSync()

      expect(list).toEqual(metadata)
    })

    it('should return empty array when metadata not found', () => {
      delete mockLocalStorage['maskom_backup_metadata']

      const list = getBackupMetadataListSync()

      expect(list).toEqual([])
    })

    it('should return empty array on error', () => {
      ;(window.localStorage.getItem as jest.Mock).mockImplementationOnce(() => {
        throw new Error('Error')
      })

      const list = getBackupMetadataListSync()

      expect(list).toEqual([])
    })
  })

  describe('updateBackupMetadataList', () => {
    it('should add new metadata to list', async () => {
      const metadata: BackupMetadata = { id: '1', timestamp: Date.now().toString(), size: 100 }
      mockLocalStorage['maskom_backup_metadata'] = JSON.stringify([])

      await updateBackupMetadataList(metadata)

      const expected = JSON.stringify([metadata])
      expect(window.localStorage.setItem).toHaveBeenCalledWith('maskom_backup_metadata', expected)
    })

    it('should prepend new metadata to existing list', async () => {
      const existingMetadata: BackupMetadata[] = [
        { id: '1', timestamp: Date.now().toString(), size: 100 },
      ]
      mockLocalStorage['maskom_backup_metadata'] = JSON.stringify(existingMetadata)

      const newMetadata: BackupMetadata = { id: '2', timestamp: Date.now().toString(), size: 200 }
      await updateBackupMetadataList(newMetadata)

      const calls = (window.localStorage.setItem as jest.Mock).mock.calls
      const lastCall = calls[calls.length - 1]
      const savedData: BackupMetadata[] = JSON.parse(lastCall[1])

      expect(savedData[0]?.id).toBe('2')
      expect(savedData[1]?.id).toBe('1')
    })

    it('should handle empty metadata', async () => {
      const metadata: BackupMetadata = { id: '', timestamp: Date.now().toString(), size: 0 }
      mockLocalStorage['maskom_backup_metadata'] = JSON.stringify([])

      await updateBackupMetadataList(metadata)

      expect(window.localStorage.setItem).toHaveBeenCalled()
    })

    it('should handle error when updating', async () => {
      const metadata: BackupMetadata = { id: '1', timestamp: Date.now().toString(), size: 100 }

      ;(window.localStorage.setItem as jest.Mock).mockImplementationOnce(() => {
        throw new Error('Storage error')
      })

      await expect(updateBackupMetadataList(metadata)).resolves.not.toThrow()
    })
  })

  describe('removeBackupFromMetadataList', () => {
    it('should remove metadata from list by id', async () => {
      const metadata: BackupMetadata[] = [
        { id: '1', timestamp: Date.now().toString(), size: 100 },
        { id: '2', timestamp: Date.now().toString(), size: 200 },
      ]
      mockLocalStorage['maskom_backup_metadata'] = JSON.stringify(metadata)

      await removeBackupFromMetadataList('1')

      const calls = (window.localStorage.setItem as jest.Mock).mock.calls
      const lastCall = calls[calls.length - 1]
      const savedData: BackupMetadata[] = JSON.parse(lastCall[1])

      expect(savedData).toHaveLength(1)
      expect(savedData[0]?.id).toBe('2')
    })

    it('should handle removing non-existent id', async () => {
      const metadata: BackupMetadata[] = [
        { id: '1', timestamp: Date.now().toString(), size: 100 },
      ]
      mockLocalStorage['maskom_backup_metadata'] = JSON.stringify(metadata)

      await removeBackupFromMetadataList('999')

      const calls = (window.localStorage.setItem as jest.Mock).mock.calls
      const lastCall = calls[calls.length - 1]
      const savedData: BackupMetadata[] = JSON.parse(lastCall[1])

      expect(savedData).toHaveLength(1)
    })

    it('should handle removing from empty list', async () => {
      mockLocalStorage['maskom_backup_metadata'] = JSON.stringify([])

      await removeBackupFromMetadataList('1')

      const calls = (window.localStorage.setItem as jest.Mock).mock.calls
      const lastCall = calls[calls.length - 1]
      const savedData: BackupMetadata[] = JSON.parse(lastCall[1])

      expect(savedData).toHaveLength(0)
    })

    it('should handle error when removing', async () => {
      const metadata: BackupMetadata[] = [{ id: '1', timestamp: Date.now().toString(), size: 100 }]
      mockLocalStorage['maskom_backup_metadata'] = JSON.stringify(metadata)

      ;(window.localStorage.setItem as jest.Mock).mockImplementationOnce(() => {
        throw new Error('Storage error')
      })

      await expect(removeBackupFromMetadataList('1')).resolves.not.toThrow()
    })
  })

  describe('deleteBackupFromStorage', () => {
    it('should delete backup from storage', async () => {
      const backupId = 'backup_1'
      mockLocalStorage['maskom_backup_data_backup_1'] = 'data'
      mockLocalStorage['maskom_backup_metadata'] = JSON.stringify([{ id: '1', timestamp: Date.now().toString(), size: 100 }])

      const result = await deleteBackupFromStorage(backupId)

      expect(result).toBe(true)
      expect(window.localStorage.removeItem).toHaveBeenCalledWith('maskom_backup_data_backup_1')
    })

    it('should return false for non-existent backup', async () => {
      const backupId = 'backup_nonexistent'

      const result = await deleteBackupFromStorage(backupId)

      expect(result).toBe(true)
    })

    it('should return true even if metadata removal fails', async () => {
      const backupId = 'backup_1'
      mockLocalStorage['maskom_backup_data_backup_1'] = 'data'
      mockLocalStorage['maskom_backup_metadata'] = JSON.stringify([])

      const result = await deleteBackupFromStorage(backupId)

      expect(result).toBe(true)
    })

    it('should throw error on deletion failure', async () => {
      const backupId = 'backup_error'
      mockLocalStorage['maskom_backup_data_backup_error'] = 'data'
      mockLocalStorage['maskom_backup_metadata'] = JSON.stringify([{ id: 'error', timestamp: Date.now().toString(), size: 100 }])

      ;(window.localStorage.removeItem as jest.Mock).mockImplementationOnce(() => {
        throw new Error('Delete error')
      })

      const result = await deleteBackupFromStorage(backupId)

      expect(result).toBe(false)
    })
  })

  describe('exportBackupToFile', () => {
    it('should export backup to blob when Blob available', async () => {
      const backupId = 'backup_1'
      const data = '{"test": "data"}'
      mockLocalStorage['maskom_backup_data_backup_1'] = data

      const result = await exportBackupToFile(backupId)

      if (typeof Blob === 'undefined') {
        expect(result).toBeNull()
      } else {
        expect(result).toBeInstanceOf(Blob)
        expect(result?.type).toBe('application/json')
      }
    })

    it('should return null for non-existent backup', async () => {
      const backupId = 'backup_nonexistent'

      const result = await exportBackupToFile(backupId)

      expect(result).toBeNull()
    })

    it('should return null when localStorage is not available', async () => {
      const originalLocalStorage = window.localStorage
      Object.defineProperty(window, 'localStorage', { value: undefined, writable: true })

      const result = await exportBackupToFile('backup_1')

      expect(result).toBeNull()

      Object.defineProperty(window, 'localStorage', { value: originalLocalStorage, writable: true })
    })

    it('should handle export error', async () => {
      const backupId = 'backup_error'
      mockLocalStorage['maskom_backup_data_backup_error'] = 'data'

      ;(window.localStorage.getItem as jest.Mock).mockImplementationOnce(() => {
        throw new Error('Export error')
      })

      const result = await exportBackupToFile(backupId)

      expect(result).toBeNull()
    })
  })
})
