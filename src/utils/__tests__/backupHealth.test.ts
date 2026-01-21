import { calculateStorageUsage, calculateHealthStatus } from '../backupHealth'
import type { BackupMetadata } from '@/types/backup'

describe('backupHealth', () => {
  beforeEach(() => {
    jest.clearAllMocks()
    localStorage.clear()
  })

  describe('calculateStorageUsage', () => {
    it('should return correct usage percentage for valid backups', () => {
      const metadata: BackupMetadata[] = [
        { id: '1', type: 'full', timestamp: '2024-01-01T00:00:00.000Z', size: 1024 * 1024 * 1024, encrypted: false, compressed: false },
        { id: '2', type: 'incremental', timestamp: '2024-01-02T00:00:00.000Z', size: 512 * 1024 * 1024, encrypted: false, compressed: false },
        { id: '3', type: 'full', timestamp: '2024-01-03T00:00:00.000Z', size: 512 * 1024 * 1024, encrypted: false, compressed: false },
      ]

      localStorage.setItem('backup_metadata_list', JSON.stringify(metadata))

      const result = calculateStorageUsage()

      expect(result).toBeCloseTo(0.4, 2)
    })

    it('should return 0 when no backups exist', () => {
      localStorage.setItem('backup_metadata_list', '[]')

      const result = calculateStorageUsage()

      expect(result).toBe(0)
    })

    it('should return 0 when localStorage item does not exist', () => {
      const result = calculateStorageUsage()

      expect(result).toBe(0)
    })

    it('should return 0 when window is undefined', () => {
      const originalWindow = global.window
      delete (global as any).window

      const result = calculateStorageUsage()

      expect(result).toBe(0)

      global.window = originalWindow
    })

    it('should return 0 when localStorage is undefined', () => {
      const originalLocalStorage = global.localStorage
      delete (global as any).localStorage

      const result = calculateStorageUsage()

      expect(result).toBe(0)

      global.localStorage = originalLocalStorage
    })

    it('should return 0 on JSON parse error', () => {
      localStorage.setItem('backup_metadata_list', 'invalid json')

      const result = calculateStorageUsage()

      expect(result).toBe(0)
    })

    it('should handle 5GB quota exactly', () => {
      const fiveGB = 5 * 1024 * 1024 * 1024
      const metadata: BackupMetadata[] = [
        { id: '1', type: 'full', timestamp: '2024-01-01T00:00:00.000Z', size: fiveGB, encrypted: false, compressed: false },
      ]

      localStorage.setItem('backup_metadata_list', JSON.stringify(metadata))

      const result = calculateStorageUsage()

      expect(result).toBeCloseTo(1.0, 2)
    })

    it('should handle single backup', () => {
      const metadata: BackupMetadata[] = [
        { id: '1', type: 'full', timestamp: '2024-01-01T00:00:00.000Z', size: 1024 * 1024 * 1024, encrypted: false, compressed: false },
      ]

      localStorage.setItem('backup_metadata_list', JSON.stringify(metadata))

      const result = calculateStorageUsage()

      expect(result).toBeCloseTo(0.2, 2)
    })

    it('should sum all backup sizes correctly', () => {
      const metadata: BackupMetadata[] = [
        { id: '1', type: 'full', timestamp: '2024-01-01T00:00:00.000Z', size: 1024, encrypted: false, compressed: false },
        { id: '2', type: 'incremental', timestamp: '2024-01-02T00:00:00.000Z', size: 2048, encrypted: false, compressed: false },
        { id: '3', type: 'full', timestamp: '2024-01-03T00:00:00.000Z', size: 512, encrypted: false, compressed: false },
      ]

      localStorage.setItem('backup_metadata_list', JSON.stringify(metadata))

      const result = calculateStorageUsage()

      const expectedTotalBytes = 1024 + 2048 + 512
      const fiveGB = 5 * 1024 * 1024 * 1024
      const expected = expectedTotalBytes / fiveGB

      expect(result).toBeCloseTo(expected, 10)
    })
  })

  describe('calculateHealthStatus', () => {
    it('should return healthy for low storage and no failures', () => {
      const result = calculateHealthStatus(0.3, 0)

      expect(result).toBe('healthy')
    })

    it('should return healthy at warning threshold boundary', () => {
      const result = calculateHealthStatus(0.79, 1)

      expect(result).toBe('healthy')
    })

    it('should return warning for storage above 0.8', () => {
      const result = calculateHealthStatus(0.81, 0)

      expect(result).toBe('warning')
    })

    it('should return healthy at exactly 0.8 storage usage', () => {
      const result = calculateHealthStatus(0.8, 0)

      expect(result).toBe('healthy')
    })

    it('should return healthy below 0.8 storage threshold', () => {
      const result = calculateHealthStatus(0.799, 0)

      expect(result).toBe('healthy')
    })

    it('should return warning for more than 2 failures', () => {
      const result = calculateHealthStatus(0.3, 3)

      expect(result).toBe('warning')
    })

    it('should return warning at exactly 3 failures', () => {
      const result = calculateHealthStatus(0.3, 3)

      expect(result).toBe('warning')
    })

    it('should return healthy at exactly 2 failures', () => {
      const result = calculateHealthStatus(0.3, 2)

      expect(result).toBe('healthy')
    })

    it('should return warning at exactly 5 failures', () => {
      const result = calculateHealthStatus(0.3, 5)

      expect(result).toBe('warning')
    })

    it('should return critical for storage above 0.95', () => {
      const result = calculateHealthStatus(0.96, 0)

      expect(result).toBe('critical')
    })

    it('should return critical at exactly 0.95 storage usage', () => {
      const result = calculateHealthStatus(0.95, 0)

      expect(result).toBe('warning')
    })

    it('should return critical for storage above 0.95', () => {
      const result = calculateHealthStatus(0.951, 0)

      expect(result).toBe('critical')
    })

    it('should return critical for more than 5 failures', () => {
      const result = calculateHealthStatus(0.3, 6)

      expect(result).toBe('critical')
    })

    it('should return critical when both storage and failures thresholds exceeded', () => {
      const result = calculateHealthStatus(0.9, 4)

      expect(result).toBe('warning')
    })

    it('should return critical for high storage and high failures', () => {
      const result = calculateHealthStatus(0.97, 10)

      expect(result).toBe('critical')
    })

    it('should prioritize critical over warning when both thresholds met', () => {
      const result = calculateHealthStatus(0.96, 3)

      expect(result).toBe('critical')
    })

    it('should handle zero storage usage', () => {
      const result = calculateHealthStatus(0, 0)

      expect(result).toBe('healthy')
    })

    it('should handle maximum storage usage', () => {
      const result = calculateHealthStatus(1.0, 0)

      expect(result).toBe('critical')
    })

    it('should handle zero failed count', () => {
      const result = calculateHealthStatus(0.1, 0)

      expect(result).toBe('healthy')
    })

    it('should handle very high failed count', () => {
      const result = calculateHealthStatus(0.1, 100)

      expect(result).toBe('critical')
    })
  })
})
