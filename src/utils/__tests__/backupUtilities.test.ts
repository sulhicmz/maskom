import {
  collectUserData,
  collectContentData,
  collectSettingsData,
  collectActivityLogs,
  calculateChangesSinceBackup,
} from '@/utils/backupDataCollector'

import {
  calculateStorageUsage,
  calculateHealthStatus,
} from '@/utils/backupHealth'

import { BACKUP_METADATA_KEY } from '@/types/backup'

import {
  restoreUserData,
  restoreContentData,
  restoreSettingsData,
  restoreActivityLogs,
} from '@/utils/backupRestorer'

describe('backupDataCollector', () => {
  beforeEach(() => {
    localStorage.clear()
  })

  describe('collectUserData', () => {
    it('should collect user data from localStorage', async () => {
      localStorage.setItem('authState', '["test-auth"]')
      localStorage.setItem('userPreferences', '{"theme":"dark"}')
      localStorage.setItem('mfaSettings', '{"enabled":true}')

      const result = await collectUserData()

      expect(result).toEqual({
        authState: ['test-auth'],
        preferences: { theme: 'dark' },
        mfaSettings: { enabled: true },
      })
    })

    it('should return empty arrays when localStorage is empty', async () => {
      const result = await collectUserData()

      expect(result).toEqual({
        authState: [],
        preferences: [],
        mfaSettings: [],
      })
    })

    it('should handle JSON parse errors gracefully', async () => {
      localStorage.setItem('authState', 'invalid-json')

      const result = await collectUserData()

      expect(result).toEqual({
        authState: [],
        preferences: [],
        mfaSettings: [],
      })
    })

    it('should handle localStorage unavailable', async () => {
      const originalLocalStorage = global.localStorage
      delete (global as any).localStorage

      const result = await collectUserData()

      expect(result).toEqual({
        authState: [],
        preferences: [],
        mfaSettings: [],
      })

      global.localStorage = originalLocalStorage
    })
  })

  describe('collectContentData', () => {
    it('should collect content data from localStorage', async () => {
      localStorage.setItem('bookmarks', '[{"id":1}]')
      localStorage.setItem('readingHistory', '[{"postId":2}]')
      localStorage.setItem('blogPosts', '[{"id":3}]')
      localStorage.setItem('blogComments', '[{"id":4}]')

      const result = await collectContentData()

      expect(result).toEqual({
        bookmarks: [{ id: 1 }],
        readingHistory: [{ postId: 2 }],
        blogPosts: [{ id: 3 }],
        blogComments: [{ id: 4 }],
      })
    })

    it('should return empty arrays when localStorage is empty', async () => {
      const result = await collectContentData()

      expect(result).toEqual({
        bookmarks: [],
        readingHistory: [],
        blogPosts: [],
        blogComments: [],
      })
    })

    it('should handle JSON parse errors gracefully', async () => {
      localStorage.setItem('bookmarks', 'invalid-json')

      const result = await collectContentData()

      expect(result).toEqual({
        bookmarks: [],
        readingHistory: [],
        blogPosts: [],
        blogComments: [],
      })
    })

    it('should handle localStorage unavailable', async () => {
      const originalLocalStorage = global.localStorage
      delete (global as any).localStorage

      const result = await collectContentData()

      expect(result).toEqual({
        bookmarks: [],
        readingHistory: [],
        blogPosts: [],
        blogComments: [],
      })

      global.localStorage = originalLocalStorage
    })
  })

  describe('collectSettingsData', () => {
    it('should collect settings data from localStorage', async () => {
      localStorage.setItem('appSettings', '{"language":"en"}')
      localStorage.setItem('uiSettings', '{"compact":true}')
      localStorage.setItem('themeSettings', '{"mode":"dark"}')
      localStorage.setItem('notificationSettings', '{"email":true}')

      const result = await collectSettingsData()

      expect(result).toEqual({
        appSettings: { language: 'en' },
        uiSettings: { compact: true },
        themeSettings: { mode: 'dark' },
        notificationSettings: { email: true },
      })
    })

    it('should return empty arrays when localStorage is empty', async () => {
      const result = await collectSettingsData()

      expect(result).toEqual({
        appSettings: [],
        uiSettings: [],
        themeSettings: [],
        notificationSettings: [],
      })
    })

    it('should handle JSON parse errors gracefully', async () => {
      localStorage.setItem('appSettings', 'invalid-json')

      const result = await collectSettingsData()

      expect(result).toEqual({
        appSettings: [],
        uiSettings: [],
        themeSettings: [],
        notificationSettings: [],
      })
    })

    it('should handle localStorage unavailable', async () => {
      const originalLocalStorage = global.localStorage
      delete (global as any).localStorage

      const result = await collectSettingsData()

      expect(result).toEqual({
        appSettings: [],
        uiSettings: [],
        themeSettings: [],
        notificationSettings: [],
      })

      global.localStorage = originalLocalStorage
    })
  })

  describe('collectActivityLogs', () => {
    it('should collect activity logs from localStorage', async () => {
      const logs = [
        { action: 'login', timestamp: Date.now() },
        { action: 'logout', timestamp: Date.now() },
      ]
      localStorage.setItem('activityLogs', JSON.stringify(logs))

      const result = await collectActivityLogs()

      expect(result).toEqual(logs)
    })

    it('should return empty array when localStorage is empty', async () => {
      const result = await collectActivityLogs()

      expect(result).toEqual([])
    })

    it('should handle JSON parse errors gracefully', async () => {
      localStorage.setItem('activityLogs', 'invalid-json')

      const result = await collectActivityLogs()

      expect(result).toEqual([])
    })

    it('should handle localStorage unavailable', async () => {
      const originalLocalStorage = global.localStorage
      delete (global as any).localStorage

      const result = await collectActivityLogs()

      expect(result).toEqual([])

      global.localStorage = originalLocalStorage
    })
  })

  describe('calculateChangesSinceBackup', () => {
    it('should calculate changes since backup from all sources', async () => {
      localStorage.setItem('authState', '["test"]')
      localStorage.setItem('bookmarks', '[{"id":1}]')
      localStorage.setItem('appSettings', '{"language":"en"}')
      localStorage.setItem('activityLogs', '[{"action":"login"}]')

      const result = await calculateChangesSinceBackup()

      expect(result).toHaveProperty('userData')
      expect(result).toHaveProperty('contentData')
      expect(result).toHaveProperty('settingsData')
      expect(result).toHaveProperty('activityLogs')
      expect(result.userData.authState).toEqual(['test'])
      expect(result.contentData.bookmarks).toEqual([{ id: 1 }])
      expect(result.settingsData.appSettings).toEqual({ language: 'en' })
      expect(result.activityLogs).toEqual([{ action: 'login' }])
    })

    it('should handle edge case just below warning threshold', () => {
      const result = calculateHealthStatus(0.8, 2)

      expect(result).toBe('healthy')
    })

    it('should return warning just above warning threshold', () => {
      const result = calculateHealthStatus(0.801, 2)

      expect(result).toBe('warning')
    })

    it('should handle empty localStorage gracefully', async () => {
      const result = await calculateChangesSinceBackup()

      expect(result.userData.authState).toEqual([])
      expect(result.userData.preferences).toEqual([])
      expect(result.userData.mfaSettings).toEqual([])
    })
  })
})

describe('backupHealth', () => {
  beforeEach(() => {
    localStorage.clear()
  })

  describe('calculateStorageUsage', () => {
    it('should calculate storage usage percentage', () => {
      const metadataList = [
        { id: '1', size: 1024 * 1024, created: '', type: 'full' },
        { id: '2', size: 2048 * 1024, created: '', type: 'full' },
      ]
      localStorage.setItem(BACKUP_METADATA_KEY, JSON.stringify(metadataList))

      const result = calculateStorageUsage()

      const expectedUsage = (1024 * 1024 + 2048 * 1024) / (5 * 1024 * 1024 * 1024)
      expect(result).toBeCloseTo(expectedUsage)
    })

    it('should return 0 when no backups exist', () => {
      localStorage.setItem(BACKUP_METADATA_KEY, '[]')

      const result = calculateStorageUsage()

      expect(result).toBe(0)
    })

    it('should return 0 when localStorage is unavailable', () => {
      const originalLocalStorage = global.localStorage
      delete (global as any).localStorage

      const result = calculateStorageUsage()

      expect(result).toBe(0)

      global.localStorage = originalLocalStorage
    })

    it('should handle JSON parse errors gracefully', () => {
      localStorage.setItem(BACKUP_METADATA_KEY, 'invalid-json')

      const result = calculateStorageUsage()

      expect(result).toBe(0)
    })

    it('should calculate accurate usage for large backup sizes', () => {
      const metadataList = [
        { id: '1', size: 2 * 1024 * 1024 * 1024, created: '', type: 'full' },
        { id: '2', size: 2 * 1024 * 1024 * 1024, created: '', type: 'full' },
      ]
      localStorage.setItem(BACKUP_METADATA_KEY, JSON.stringify(metadataList))

      const result = calculateStorageUsage()

      expect(result).toBeCloseTo(0.8)
    })
  })

  describe('calculateHealthStatus', () => {
    it('should return healthy when storage and failures are within limits', () => {
      const result = calculateHealthStatus(0.5, 0)

      expect(result).toBe('healthy')
    })

    it('should return warning when storage exceeds warning threshold', () => {
      const result = calculateHealthStatus(0.85, 0)

      expect(result).toBe('warning')
    })

    it('should return warning when failed count exceeds warning threshold', () => {
      const result = calculateHealthStatus(0.5, 3)

      expect(result).toBe('warning')
    })

    it('should return critical when storage exceeds error threshold', () => {
      const result = calculateHealthStatus(0.96, 0)

      expect(result).toBe('critical')
    })

    it('should return critical when failed count exceeds error threshold', () => {
      const result = calculateHealthStatus(0.5, 6)

      expect(result).toBe('critical')
    })

    it('should return critical when both storage and failures exceed thresholds', () => {
      const result = calculateHealthStatus(0.96, 6)

      expect(result).toBe('critical')
    })

    it('should handle edge case just below warning threshold', () => {
      const result = calculateHealthStatus(0.8, 2)

      expect(result).toBe('healthy')
    })

    it('should return warning just above warning threshold', () => {
      const result = calculateHealthStatus(0.801, 2)

      expect(result).toBe('warning')
    })

    it('should handle edge case just below error threshold', () => {
      const result = calculateHealthStatus(0.95, 5)

      expect(result).toBe('warning')
    })

    it('should return critical just above error threshold', () => {
      const result = calculateHealthStatus(0.951, 5)

      expect(result).toBe('critical')
    })
  })
})

describe('backupRestorer', () => {
  beforeEach(() => {
    localStorage.clear()
  })

  describe('restoreUserData', () => {
    it('should restore user data to localStorage', async () => {
      const userData = {
        authState: ['test-auth'],
        preferences: { theme: 'dark' },
        mfaSettings: { enabled: true },
      }
      const errors: string[] = []

      await restoreUserData(userData, errors)

      expect(JSON.parse(localStorage.getItem('authState') || '')).toEqual([
        'test-auth',
      ])
      expect(JSON.parse(localStorage.getItem('userPreferences') || '')).toEqual({
        theme: 'dark',
      })
      expect(JSON.parse(localStorage.getItem('mfaSettings') || '')).toEqual({
        enabled: true,
      })
      expect(errors).toEqual([])
    })

    it('should skip undefined fields', async () => {
      const userData = {
        authState: ['test-auth'],
        preferences: undefined,
        mfaSettings: { enabled: true },
      }
      const errors: string[] = []

      await restoreUserData(userData, errors)

      expect(localStorage.getItem('userPreferences')).toBeNull()
      expect(errors).toEqual([])
    })

    it('should handle localStorage errors', async () => {
      const userData = {
        authState: ['test-auth'],
        preferences: { theme: 'dark' },
        mfaSettings: { enabled: true },
      }
      const errors: string[] = []

      const originalSetItem = Storage.prototype.setItem
      Storage.prototype.setItem = jest.fn(() => {
        throw new Error('Quota exceeded')
      })

      await restoreUserData(userData, errors)

      expect(errors).toHaveLength(1)
      expect(errors[0]).toContain('Failed to restore user data')

      Storage.prototype.setItem = originalSetItem
    })

    it('should handle window undefined', async () => {
      const userData = {
        authState: ['test-auth'],
        preferences: { theme: 'dark' },
        mfaSettings: { enabled: true },
      }
      const errors: string[] = []

      const originalWindow = global.window
      delete (global as any).window

      await restoreUserData(userData, errors)

      expect(errors).toEqual([])

      global.window = originalWindow
    })
  })

  describe('restoreContentData', () => {
    it('should restore content data to localStorage', async () => {
      const contentData = {
        bookmarks: [{ id: 1 }],
        readingHistory: [{ postId: 2 }],
        blogPosts: [{ id: 3 }],
        blogComments: [{ id: 4 }],
      }
      const errors: string[] = []

      await restoreContentData(contentData, errors)

      expect(JSON.parse(localStorage.getItem('bookmarks') || '')).toEqual([
        { id: 1 },
      ])
      expect(JSON.parse(localStorage.getItem('readingHistory') || '')).toEqual([
        { postId: 2 },
      ])
      expect(JSON.parse(localStorage.getItem('blogPosts') || '')).toEqual([
        { id: 3 },
      ])
      expect(JSON.parse(localStorage.getItem('blogComments') || '')).toEqual([
        { id: 4 },
      ])
      expect(errors).toEqual([])
    })

    it('should skip undefined fields', async () => {
      const contentData = {
        bookmarks: [{ id: 1 }],
        readingHistory: undefined,
        blogPosts: [{ id: 3 }],
        blogComments: [{ id: 4 }],
      }
      const errors: string[] = []

      await restoreContentData(contentData, errors)

      expect(localStorage.getItem('readingHistory')).toBeNull()
      expect(errors).toEqual([])
    })

    it('should handle localStorage errors', async () => {
      const contentData = {
        bookmarks: [{ id: 1 }],
        readingHistory: [{ postId: 2 }],
        blogPosts: [{ id: 3 }],
        blogComments: [{ id: 4 }],
      }
      const errors: string[] = []

      const originalSetItem = Storage.prototype.setItem
      Storage.prototype.setItem = jest.fn(() => {
        throw new Error('Quota exceeded')
      })

      await restoreContentData(contentData, errors)

      expect(errors).toHaveLength(1)
      expect(errors[0]).toContain('Failed to restore content data')

      Storage.prototype.setItem = originalSetItem
    })

    it('should handle window undefined', async () => {
      const contentData = {
        bookmarks: [{ id: 1 }],
        readingHistory: [{ postId: 2 }],
        blogPosts: [{ id: 3 }],
        blogComments: [{ id: 4 }],
      }
      const errors: string[] = []

      const originalWindow = global.window
      delete (global as any).window

      await restoreContentData(contentData, errors)

      expect(errors).toEqual([])

      global.window = originalWindow
    })
  })

  describe('restoreSettingsData', () => {
    it('should restore settings data to localStorage', async () => {
      const settingsData = {
        appSettings: { language: 'en' },
        uiSettings: { compact: true },
        themeSettings: { mode: 'dark' },
        notificationSettings: { email: true },
      }
      const errors: string[] = []

      await restoreSettingsData(settingsData, errors)

      expect(JSON.parse(localStorage.getItem('appSettings') || '')).toEqual({
        language: 'en',
      })
      expect(JSON.parse(localStorage.getItem('uiSettings') || '')).toEqual({
        compact: true,
      })
      expect(JSON.parse(localStorage.getItem('themeSettings') || '')).toEqual({
        mode: 'dark',
      })
      expect(JSON.parse(localStorage.getItem('notificationSettings') || '')).toEqual({
        email: true,
      })
      expect(errors).toEqual([])
    })

    it('should skip undefined fields', async () => {
      const settingsData = {
        appSettings: { language: 'en' },
        uiSettings: undefined,
        themeSettings: { mode: 'dark' },
        notificationSettings: { email: true },
      }
      const errors: string[] = []

      await restoreSettingsData(settingsData, errors)

      expect(localStorage.getItem('uiSettings')).toBeNull()
      expect(errors).toEqual([])
    })

    it('should handle localStorage errors', async () => {
      const settingsData = {
        appSettings: { language: 'en' },
        uiSettings: { compact: true },
        themeSettings: { mode: 'dark' },
        notificationSettings: { email: true },
      }
      const errors: string[] = []

      const originalSetItem = Storage.prototype.setItem
      Storage.prototype.setItem = jest.fn(() => {
        throw new Error('Quota exceeded')
      })

      await restoreSettingsData(settingsData, errors)

      expect(errors).toHaveLength(1)
      expect(errors[0]).toContain('Failed to restore settings data')

      Storage.prototype.setItem = originalSetItem
    })

    it('should handle window undefined', async () => {
      const settingsData = {
        appSettings: { language: 'en' },
        uiSettings: { compact: true },
        themeSettings: { mode: 'dark' },
        notificationSettings: { email: true },
      }
      const errors: string[] = []

      const originalWindow = global.window
      delete (global as any).window

      await restoreSettingsData(settingsData, errors)

      expect(errors).toEqual([])

      global.window = originalWindow
    })
  })

  describe('restoreActivityLogs', () => {
    it('should restore activity logs to localStorage', async () => {
      const activityLogs = [
        { action: 'login', timestamp: Date.now() },
        { action: 'logout', timestamp: Date.now() },
      ]
      const errors: string[] = []

      await restoreActivityLogs(activityLogs, errors)

      expect(JSON.parse(localStorage.getItem('activityLogs') || '')).toEqual(
        activityLogs,
      )
      expect(errors).toEqual([])
    })

    it('should restore empty activity logs array', async () => {
      const activityLogs: any[] = []
      const errors: string[] = []

      await restoreActivityLogs(activityLogs, errors)

      expect(JSON.parse(localStorage.getItem('activityLogs') || '')).toEqual([])
      expect(errors).toEqual([])
    })

    it('should handle localStorage errors', async () => {
      const activityLogs = [{ action: 'login', timestamp: Date.now() }]
      const errors: string[] = []

      const originalSetItem = Storage.prototype.setItem
      Storage.prototype.setItem = jest.fn(() => {
        throw new Error('Quota exceeded')
      })

      await restoreActivityLogs(activityLogs, errors)

      expect(errors).toHaveLength(1)
      expect(errors[0]).toContain('Failed to restore activity logs')

      Storage.prototype.setItem = originalSetItem
    })

    it('should handle window undefined', async () => {
      const activityLogs = [{ action: 'login', timestamp: Date.now() }]
      const errors: string[] = []

      const originalWindow = global.window
      delete (global as any).window

      await restoreActivityLogs(activityLogs, errors)

      expect(errors).toEqual([])

      global.window = originalWindow
    })
  })
})
