import {
  collectUserData,
  collectContentData,
  collectSettingsData,
  collectActivityLogs,
  calculateChangesSinceBackup,
} from '../backupDataCollector'
import type { ActivityLogBackup } from '@/types/backup'

describe('backupDataCollector', () => {
  beforeEach(() => {
    jest.clearAllMocks()
    localStorage.clear()
  })

  describe('collectUserData', () => {
    it('should collect all user data fields', async () => {
      const authState = [{ userId: 'user1', email: 'test@example.com' }]
      const preferences = { theme: 'dark' }
      const mfaSettings = { enabled: true }

      localStorage.setItem('authState', JSON.stringify(authState))
      localStorage.setItem('userPreferences', JSON.stringify(preferences))
      localStorage.setItem('mfaSettings', JSON.stringify(mfaSettings))

      const result = await collectUserData()

      expect(result.authState).toEqual(authState)
      expect(result.preferences).toEqual(preferences)
      expect(result.mfaSettings).toEqual(mfaSettings)
    })

    it('should return empty arrays when localStorage has empty arrays', async () => {
      localStorage.setItem('authState', '[]')
      localStorage.setItem('userPreferences', '[]')
      localStorage.setItem('mfaSettings', '[]')

      const result = await collectUserData()

      expect(result.authState).toEqual([])
      expect(result.preferences).toEqual([])
      expect(result.mfaSettings).toEqual([])
    })

    it('should return empty arrays when localStorage keys do not exist', async () => {
      const result = await collectUserData()

      expect(result.authState).toEqual([])
      expect(result.preferences).toEqual([])
      expect(result.mfaSettings).toEqual([])
    })

    it('should handle JSON parse errors and return empty arrays', async () => {
      localStorage.setItem('authState', 'invalid json')
      localStorage.setItem('userPreferences', 'invalid json')
      localStorage.setItem('mfaSettings', 'invalid json')

      const result = await collectUserData()

      expect(result.authState).toEqual([])
      expect(result.preferences).toEqual([])
      expect(result.mfaSettings).toEqual([])
    })

    it('should handle window undefined and return empty arrays', async () => {
      const originalWindow = global.window
      delete (global as any).window

      const result = await collectUserData()

      expect(result.authState).toEqual([])
      expect(result.preferences).toEqual([])
      expect(result.mfaSettings).toEqual([])

      global.window = originalWindow
    })

    it('should handle localStorage undefined and return empty arrays', async () => {
      const originalLocalStorage = global.localStorage
      delete (global as any).localStorage

      const result = await collectUserData()

      expect(result.authState).toEqual([])
      expect(result.preferences).toEqual([])
      expect(result.mfaSettings).toEqual([])

      global.localStorage = originalLocalStorage
    })

    it('should collect authState with multiple users', async () => {
      const authState = [
        { userId: 'user1', email: 'user1@example.com' },
        { userId: 'user2', email: 'user2@example.com' },
      ]

      localStorage.setItem('authState', JSON.stringify(authState))
      localStorage.setItem('userPreferences', '[]')
      localStorage.setItem('mfaSettings', '[]')

      const result = await collectUserData()

      expect(result.authState).toEqual(authState)
      expect(result.authState).toHaveLength(2)
    })

    it('should handle partial data - some fields present', async () => {
      const authState = [{ userId: 'user1' }]

      localStorage.setItem('authState', JSON.stringify(authState))

      const result = await collectUserData()

      expect(result.authState).toEqual(authState)
      expect(result.preferences).toEqual([])
      expect(result.mfaSettings).toEqual([])
    })
  })

  describe('collectContentData', () => {
    it('should collect all content data fields', async () => {
      const bookmarks = [{ id: 1, postId: 1 }]
      const readingHistory = [{ postId: 1, readAt: '2024-01-01' }]
      const blogPosts = [{ id: 1, title: 'Test Post' }]
      const blogComments = [{ id: 1, content: 'Test comment' }]

      localStorage.setItem('bookmarks', JSON.stringify(bookmarks))
      localStorage.setItem('readingHistory', JSON.stringify(readingHistory))
      localStorage.setItem('blogPosts', JSON.stringify(blogPosts))
      localStorage.setItem('blogComments', JSON.stringify(blogComments))

      const result = await collectContentData()

      expect(result.bookmarks).toEqual(bookmarks)
      expect(result.readingHistory).toEqual(readingHistory)
      expect(result.blogPosts).toEqual(blogPosts)
      expect(result.blogComments).toEqual(blogComments)
    })

    it('should return empty arrays when localStorage has empty arrays', async () => {
      localStorage.setItem('bookmarks', '[]')
      localStorage.setItem('readingHistory', '[]')
      localStorage.setItem('blogPosts', '[]')
      localStorage.setItem('blogComments', '[]')

      const result = await collectContentData()

      expect(result.bookmarks).toEqual([])
      expect(result.readingHistory).toEqual([])
      expect(result.blogPosts).toEqual([])
      expect(result.blogComments).toEqual([])
    })

    it('should return empty arrays when localStorage keys do not exist', async () => {
      const result = await collectContentData()

      expect(result.bookmarks).toEqual([])
      expect(result.readingHistory).toEqual([])
      expect(result.blogPosts).toEqual([])
      expect(result.blogComments).toEqual([])
    })

    it('should handle JSON parse errors and return empty arrays', async () => {
      localStorage.setItem('bookmarks', 'invalid json')
      localStorage.setItem('readingHistory', 'invalid json')
      localStorage.setItem('blogPosts', 'invalid json')
      localStorage.setItem('blogComments', 'invalid json')

      const result = await collectContentData()

      expect(result.bookmarks).toEqual([])
      expect(result.readingHistory).toEqual([])
      expect(result.blogPosts).toEqual([])
      expect(result.blogComments).toEqual([])
    })

    it('should handle window undefined and return empty arrays', async () => {
      const originalWindow = global.window
      delete (global as any).window

      const result = await collectContentData()

      expect(result.bookmarks).toEqual([])
      expect(result.readingHistory).toEqual([])
      expect(result.blogPosts).toEqual([])
      expect(result.blogComments).toEqual([])

      global.window = originalWindow
    })

    it('should handle localStorage undefined and return empty arrays', async () => {
      const originalLocalStorage = global.localStorage
      delete (global as any).localStorage

      const result = await collectContentData()

      expect(result.bookmarks).toEqual([])
      expect(result.readingHistory).toEqual([])
      expect(result.blogPosts).toEqual([])
      expect(result.blogComments).toEqual([])

      global.localStorage = originalLocalStorage
    })

    it('should handle partial data - some fields present', async () => {
      const bookmarks = [{ id: 1, postId: 1 }]

      localStorage.setItem('bookmarks', JSON.stringify(bookmarks))

      const result = await collectContentData()

      expect(result.bookmarks).toEqual(bookmarks)
      expect(result.readingHistory).toEqual([])
      expect(result.blogPosts).toEqual([])
      expect(result.blogComments).toEqual([])
    })
  })

  describe('collectSettingsData', () => {
    it('should collect all settings data fields', async () => {
      const appSettings = { language: 'en', timezone: 'UTC' }
      const uiSettings = { sidebar: true, fontSize: 16 }
      const themeSettings = { theme: 'dark' }
      const notificationSettings = { enabled: true, emailAlerts: true }

      localStorage.setItem('appSettings', JSON.stringify(appSettings))
      localStorage.setItem('uiSettings', JSON.stringify(uiSettings))
      localStorage.setItem('themeSettings', JSON.stringify(themeSettings))
      localStorage.setItem('notificationSettings', JSON.stringify(notificationSettings))

      const result = await collectSettingsData()

      expect(result.appSettings).toEqual(appSettings)
      expect(result.uiSettings).toEqual(uiSettings)
      expect(result.themeSettings).toEqual(themeSettings)
      expect(result.notificationSettings).toEqual(notificationSettings)
    })

    it('should return empty arrays when localStorage has empty arrays', async () => {
      localStorage.setItem('appSettings', '[]')
      localStorage.setItem('uiSettings', '[]')
      localStorage.setItem('themeSettings', '[]')
      localStorage.setItem('notificationSettings', '[]')

      const result = await collectSettingsData()

      expect(result.appSettings).toEqual([])
      expect(result.uiSettings).toEqual([])
      expect(result.themeSettings).toEqual([])
      expect(result.notificationSettings).toEqual([])
    })

    it('should return empty arrays when localStorage keys do not exist', async () => {
      const result = await collectSettingsData()

      expect(result.appSettings).toEqual([])
      expect(result.uiSettings).toEqual([])
      expect(result.themeSettings).toEqual([])
      expect(result.notificationSettings).toEqual([])
    })

    it('should handle JSON parse errors and return empty arrays', async () => {
      localStorage.setItem('appSettings', 'invalid json')
      localStorage.setItem('uiSettings', 'invalid json')
      localStorage.setItem('themeSettings', 'invalid json')
      localStorage.setItem('notificationSettings', 'invalid json')

      const result = await collectSettingsData()

      expect(result.appSettings).toEqual([])
      expect(result.uiSettings).toEqual([])
      expect(result.themeSettings).toEqual([])
      expect(result.notificationSettings).toEqual([])
    })

    it('should handle window undefined and return empty arrays', async () => {
      const originalWindow = global.window
      delete (global as any).window

      const result = await collectSettingsData()

      expect(result.appSettings).toEqual([])
      expect(result.uiSettings).toEqual([])
      expect(result.themeSettings).toEqual([])
      expect(result.notificationSettings).toEqual([])

      global.window = originalWindow
    })

    it('should handle localStorage undefined and return empty arrays', async () => {
      const originalLocalStorage = global.localStorage
      delete (global as any).localStorage

      const result = await collectSettingsData()

      expect(result.appSettings).toEqual([])
      expect(result.uiSettings).toEqual([])
      expect(result.themeSettings).toEqual([])
      expect(result.notificationSettings).toEqual([])

      global.localStorage = originalLocalStorage
    })

    it('should handle partial data - some fields present', async () => {
      const appSettings = { language: 'en' }

      localStorage.setItem('appSettings', JSON.stringify(appSettings))

      const result = await collectSettingsData()

      expect(result.appSettings).toEqual(appSettings)
      expect(result.uiSettings).toEqual([])
      expect(result.themeSettings).toEqual([])
      expect(result.notificationSettings).toEqual([])
    })
  })

  describe('collectActivityLogs', () => {
    it('should collect activity logs', async () => {
      const activityLogs: ActivityLogBackup[] = [
        { id: 1, timestamp: '2024-01-01T00:00:00.000Z', action: 'login' },
        { id: 2, timestamp: '2024-01-02T00:00:00.000Z', action: 'logout' },
      ]

      localStorage.setItem('activityLogs', JSON.stringify(activityLogs))

      const result = await collectActivityLogs()

      expect(result).toEqual(activityLogs)
      expect(result).toHaveLength(2)
    })

    it('should return empty array when localStorage has empty array', async () => {
      localStorage.setItem('activityLogs', '[]')

      const result = await collectActivityLogs()

      expect(result).toEqual([])
    })

    it('should return empty array when localStorage key does not exist', async () => {
      const result = await collectActivityLogs()

      expect(result).toEqual([])
    })

    it('should handle JSON parse error and return empty array', async () => {
      localStorage.setItem('activityLogs', 'invalid json')

      const result = await collectActivityLogs()

      expect(result).toEqual([])
    })

    it('should handle window undefined and return empty array', async () => {
      const originalWindow = global.window
      delete (global as any).window

      const result = await collectActivityLogs()

      expect(result).toEqual([])

      global.window = originalWindow
    })

    it('should handle localStorage undefined and return empty array', async () => {
      const originalLocalStorage = global.localStorage
      delete (global as any).localStorage

      const result = await collectActivityLogs()

      expect(result).toEqual([])

      global.localStorage = originalLocalStorage
    })

    it('should handle single activity log', async () => {
      const activityLogs: ActivityLogBackup[] = [
        { id: 1, timestamp: '2024-01-01T00:00:00.000Z', action: 'login' },
      ]

      localStorage.setItem('activityLogs', JSON.stringify(activityLogs))

      const result = await collectActivityLogs()

      expect(result).toEqual(activityLogs)
      expect(result).toHaveLength(1)
    })

    it('should handle large number of activity logs', async () => {
      const activityLogs: ActivityLogBackup[] = Array.from({ length: 1000 }, (_, i) => ({
        id: i,
        timestamp: '2024-01-01T00:00:00.000Z',
        action: `action-${i}`,
      }))

      localStorage.setItem('activityLogs', JSON.stringify(activityLogs))

      const result = await collectActivityLogs()

      expect(result).toHaveLength(1000)
    })
  })

  describe('calculateChangesSinceBackup', () => {
    it('should calculate changes for all data types', async () => {
      const authState = [{ userId: 'user1' }]
      const bookmarks = [{ id: 1 }]
      const appSettings = { language: 'en' }
      const activityLogs: ActivityLogBackup[] = [{ id: 1, timestamp: '2024-01-01', action: 'login' }]

      localStorage.setItem('authState', JSON.stringify(authState))
      localStorage.setItem('bookmarks', JSON.stringify(bookmarks))
      localStorage.setItem('appSettings', JSON.stringify(appSettings))
      localStorage.setItem('activityLogs', JSON.stringify(activityLogs))

      const result = await calculateChangesSinceBackup()

      expect(result.userData.authState).toEqual(authState)
      expect(result.contentData.bookmarks).toEqual(bookmarks)
      expect(result.settingsData.appSettings).toEqual(appSettings)
      expect(result.activityLogs).toEqual(activityLogs)
    })

    it('should return empty data when no data exists in localStorage', async () => {
      const result = await calculateChangesSinceBackup()

      expect(result.userData.authState).toEqual([])
      expect(result.userData.preferences).toEqual([])
      expect(result.userData.mfaSettings).toEqual([])
      expect(result.contentData.bookmarks).toEqual([])
      expect(result.contentData.readingHistory).toEqual([])
      expect(result.contentData.blogPosts).toEqual([])
      expect(result.contentData.blogComments).toEqual([])
      expect(result.settingsData.appSettings).toEqual([])
      expect(result.settingsData.uiSettings).toEqual([])
      expect(result.settingsData.themeSettings).toEqual([])
      expect(result.settingsData.notificationSettings).toEqual([])
      expect(result.activityLogs).toEqual([])
    })
  })
})
