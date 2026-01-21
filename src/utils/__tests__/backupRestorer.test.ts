import {
  restoreUserData,
  restoreContentData,
  restoreSettingsData,
  restoreActivityLogs,
} from '../backupRestorer'
import type {
  UserDataBackup,
  ContentDataBackup,
  SettingsDataBackup,
  ActivityLogBackup,
} from '@/types/backup'

describe('backupRestorer', () => {
  beforeEach(() => {
    jest.clearAllMocks()
    jest.restoreAllMocks()
    localStorage.clear()
  })

  describe('restoreUserData', () => {
    it('should restore all user data fields', async () => {
      const userData: UserDataBackup = {
        authState: [{ userId: 'user1' }],
        preferences: { theme: 'dark' },
        mfaSettings: { enabled: true },
      }
      const errors: string[] = []

      await restoreUserData(userData, errors)

      expect(localStorage.getItem('authState')).toBe(JSON.stringify(userData.authState))
      expect(localStorage.getItem('userPreferences')).toBe(JSON.stringify(userData.preferences))
      expect(localStorage.getItem('mfaSettings')).toBe(JSON.stringify(userData.mfaSettings))
      expect(errors).toHaveLength(0)
    })

    it('should restore authState when present', async () => {
      const userData: UserDataBackup = {
        authState: [{ userId: 'user1' }],
        preferences: [],
        mfaSettings: [],
      }
      const errors: string[] = []

      await restoreUserData(userData, errors)

      expect(localStorage.getItem('authState')).toBe(JSON.stringify(userData.authState))
      expect(errors).toHaveLength(0)
    })

    it('should restore preferences when present', async () => {
      const userData: UserDataBackup = {
        authState: [],
        preferences: { theme: 'dark' },
        mfaSettings: [],
      }
      const errors: string[] = []

      await restoreUserData(userData, errors)

      expect(localStorage.getItem('userPreferences')).toBe(JSON.stringify(userData.preferences))
      expect(errors).toHaveLength(0)
    })

    it('should restore mfaSettings when present', async () => {
      const userData: UserDataBackup = {
        authState: [],
        preferences: [],
        mfaSettings: { enabled: true },
      }
      const errors: string[] = []

      await restoreUserData(userData, errors)

      expect(localStorage.getItem('mfaSettings')).toBe(JSON.stringify(userData.mfaSettings))
      expect(errors).toHaveLength(0)
    })

    it('should handle localStorage error and add to errors array', async () => {
      const userData: UserDataBackup = {
        authState: [{ userId: 'user1' }],
        preferences: { theme: 'dark' },
        mfaSettings: { enabled: true },
      }
      const errors: string[] = []

      jest.spyOn(Storage.prototype, 'setItem').mockImplementation(() => {
        throw new Error('Storage quota exceeded')
      })

      await restoreUserData(userData, errors)

      expect(errors).toHaveLength(1)
      expect(errors[0]).toContain('Failed to restore user data')
      expect(errors[0]).toContain('Storage quota exceeded')
    })

    it('should handle null fields gracefully', async () => {
      const userData = {
        authState: null,
        preferences: null,
        mfaSettings: null,
      } as unknown as UserDataBackup
      const errors: string[] = []

      await restoreUserData(userData, errors)

      expect(localStorage.getItem('authState')).toBeNull()
      expect(localStorage.getItem('userPreferences')).toBeNull()
      expect(localStorage.getItem('mfaSettings')).toBeNull()
    })

    it('should handle undefined fields gracefully', async () => {
      const userData = {} as UserDataBackup
      const errors: string[] = []

      await restoreUserData(userData, errors)

      expect(localStorage.getItem('authState')).toBeNull()
      expect(localStorage.getItem('userPreferences')).toBeNull()
      expect(localStorage.getItem('mfaSettings')).toBeNull()
      expect(errors).toHaveLength(0)
    })

    it('should handle empty arrays', async () => {
      const userData: UserDataBackup = {
        authState: [],
        preferences: [],
        mfaSettings: [],
      }
      const errors: string[] = []

      await restoreUserData(userData, errors)

      expect(localStorage.getItem('authState')).toBe('[]')
      expect(localStorage.getItem('userPreferences')).toBe('[]')
      expect(localStorage.getItem('mfaSettings')).toBe('[]')
      expect(errors).toHaveLength(0)
    })

    it('should handle multiple restore operations', async () => {
      const userData: UserDataBackup = {
        authState: [{ userId: 'user1' }],
        preferences: { theme: 'dark' },
        mfaSettings: { enabled: true },
      }
      const errors: string[] = []

      await restoreUserData(userData, errors)

      const userData2: UserDataBackup = {
        authState: [{ userId: 'user2' }],
        preferences: { theme: 'light' },
        mfaSettings: { enabled: false },
      }

      await restoreUserData(userData2, errors)

      expect(localStorage.getItem('authState')).toBe(JSON.stringify(userData2.authState))
      expect(localStorage.getItem('userPreferences')).toBe(JSON.stringify(userData2.preferences))
      expect(localStorage.getItem('mfaSettings')).toBe(JSON.stringify(userData2.mfaSettings))
    })
  })

  describe('restoreContentData', () => {
    it('should restore all content data fields', async () => {
      const contentData: ContentDataBackup = {
        bookmarks: [{ id: 1 }],
        readingHistory: [{ postId: 1 }],
        blogPosts: [{ id: 1 }],
        blogComments: [{ id: 1 }],
      }
      const errors: string[] = []

      await restoreContentData(contentData, errors)

      expect(localStorage.getItem('bookmarks')).toBe(JSON.stringify(contentData.bookmarks))
      expect(localStorage.getItem('readingHistory')).toBe(JSON.stringify(contentData.readingHistory))
      expect(localStorage.getItem('blogPosts')).toBe(JSON.stringify(contentData.blogPosts))
      expect(localStorage.getItem('blogComments')).toBe(JSON.stringify(contentData.blogComments))
      expect(errors).toHaveLength(0)
    })

    it('should restore bookmarks when present', async () => {
      const contentData: ContentDataBackup = {
        bookmarks: [{ id: 1 }],
        readingHistory: [],
        blogPosts: [],
        blogComments: [],
      }
      const errors: string[] = []

      await restoreContentData(contentData, errors)

      expect(localStorage.getItem('bookmarks')).toBe(JSON.stringify(contentData.bookmarks))
      expect(errors).toHaveLength(0)
    })

    it('should restore readingHistory when present', async () => {
      const contentData: ContentDataBackup = {
        bookmarks: [],
        readingHistory: [{ postId: 1 }],
        blogPosts: [],
        blogComments: [],
      }
      const errors: string[] = []

      await restoreContentData(contentData, errors)

      expect(localStorage.getItem('readingHistory')).toBe(JSON.stringify(contentData.readingHistory))
      expect(errors).toHaveLength(0)
    })

    it('should restore blogPosts when present', async () => {
      const contentData: ContentDataBackup = {
        bookmarks: [],
        readingHistory: [],
        blogPosts: [{ id: 1 }],
        blogComments: [],
      }
      const errors: string[] = []

      await restoreContentData(contentData, errors)

      expect(localStorage.getItem('blogPosts')).toBe(JSON.stringify(contentData.blogPosts))
      expect(errors).toHaveLength(0)
    })

    it('should restore blogComments when present', async () => {
      const contentData: ContentDataBackup = {
        bookmarks: [],
        readingHistory: [],
        blogPosts: [],
        blogComments: [{ id: 1 }],
      }
      const errors: string[] = []

      await restoreContentData(contentData, errors)

      expect(localStorage.getItem('blogComments')).toBe(JSON.stringify(contentData.blogComments))
      expect(errors).toHaveLength(0)
    })

    it('should handle localStorage error and add to errors array', async () => {
      const contentData: ContentDataBackup = {
        bookmarks: [{ id: 1 }],
        readingHistory: [],
        blogPosts: [],
        blogComments: [],
      }
      const errors: string[] = []

      jest.spyOn(Storage.prototype, 'setItem').mockImplementation(() => {
        throw new Error('Storage quota exceeded')
      })

      await restoreContentData(contentData, errors)

      expect(errors).toHaveLength(1)
      expect(errors[0]).toContain('Failed to restore content data')
      expect(errors[0]).toContain('Storage quota exceeded')
    })

    it('should handle empty arrays', async () => {
      const contentData: ContentDataBackup = {
        bookmarks: [],
        readingHistory: [],
        blogPosts: [],
        blogComments: [],
      }
      const errors: string[] = []

      await restoreContentData(contentData, errors)

      expect(localStorage.getItem('bookmarks')).toBe('[]')
      expect(localStorage.getItem('readingHistory')).toBe('[]')
      expect(localStorage.getItem('blogPosts')).toBe('[]')
      expect(localStorage.getItem('blogComments')).toBe('[]')
      expect(errors).toHaveLength(0)
    })
  })

  describe('restoreSettingsData', () => {
    it('should restore all settings data fields', async () => {
      const settingsData: SettingsDataBackup = {
        appSettings: { language: 'en' },
        uiSettings: { sidebar: true },
        themeSettings: { theme: 'dark' },
        notificationSettings: { enabled: true },
      }
      const errors: string[] = []

      await restoreSettingsData(settingsData, errors)

      expect(localStorage.getItem('appSettings')).toBe(JSON.stringify(settingsData.appSettings))
      expect(localStorage.getItem('uiSettings')).toBe(JSON.stringify(settingsData.uiSettings))
      expect(localStorage.getItem('themeSettings')).toBe(JSON.stringify(settingsData.themeSettings))
      expect(localStorage.getItem('notificationSettings')).toBe(JSON.stringify(settingsData.notificationSettings))
      expect(errors).toHaveLength(0)
    })

    it('should restore appSettings when present', async () => {
      const settingsData: SettingsDataBackup = {
        appSettings: { language: 'en' },
        uiSettings: [],
        themeSettings: [],
        notificationSettings: [],
      }
      const errors: string[] = []

      await restoreSettingsData(settingsData, errors)

      expect(localStorage.getItem('appSettings')).toBe(JSON.stringify(settingsData.appSettings))
      expect(errors).toHaveLength(0)
    })

    it('should restore uiSettings when present', async () => {
      const settingsData: SettingsDataBackup = {
        appSettings: [],
        uiSettings: { sidebar: true },
        themeSettings: [],
        notificationSettings: [],
      }
      const errors: string[] = []

      await restoreSettingsData(settingsData, errors)

      expect(localStorage.getItem('uiSettings')).toBe(JSON.stringify(settingsData.uiSettings))
      expect(errors).toHaveLength(0)
    })

    it('should restore themeSettings when present', async () => {
      const settingsData: SettingsDataBackup = {
        appSettings: [],
        uiSettings: [],
        themeSettings: { theme: 'dark' },
        notificationSettings: [],
      }
      const errors: string[] = []

      await restoreSettingsData(settingsData, errors)

      expect(localStorage.getItem('themeSettings')).toBe(JSON.stringify(settingsData.themeSettings))
      expect(errors).toHaveLength(0)
    })

    it('should restore notificationSettings when present', async () => {
      const settingsData: SettingsDataBackup = {
        appSettings: [],
        uiSettings: [],
        themeSettings: [],
        notificationSettings: { enabled: true },
      }
      const errors: string[] = []

      await restoreSettingsData(settingsData, errors)

      expect(localStorage.getItem('notificationSettings')).toBe(JSON.stringify(settingsData.notificationSettings))
      expect(errors).toHaveLength(0)
    })

    it('should handle localStorage error and add to errors array', async () => {
      const settingsData: SettingsDataBackup = {
        appSettings: { language: 'en' },
        uiSettings: [],
        themeSettings: [],
        notificationSettings: [],
      }
      const errors: string[] = []

      jest.spyOn(Storage.prototype, 'setItem').mockImplementation(() => {
        throw new Error('Storage quota exceeded')
      })

      await restoreSettingsData(settingsData, errors)

      expect(errors).toHaveLength(1)
      expect(errors[0]).toContain('Failed to restore settings data')
      expect(errors[0]).toContain('Storage quota exceeded')
    })

    it('should handle empty arrays', async () => {
      const settingsData: SettingsDataBackup = {
        appSettings: [],
        uiSettings: [],
        themeSettings: [],
        notificationSettings: [],
      }
      const errors: string[] = []

      await restoreSettingsData(settingsData, errors)

      expect(localStorage.getItem('appSettings')).toBe('[]')
      expect(localStorage.getItem('uiSettings')).toBe('[]')
      expect(localStorage.getItem('themeSettings')).toBe('[]')
      expect(localStorage.getItem('notificationSettings')).toBe('[]')
      expect(errors).toHaveLength(0)
    })
  })

  describe('restoreActivityLogs', () => {
    it('should restore activity logs', async () => {
      const activityLogs: ActivityLogBackup[] = [
        { id: 1, timestamp: '2024-01-01', action: 'login' },
        { id: 2, timestamp: '2024-01-02', action: 'logout' },
      ]
      const errors: string[] = []

      await restoreActivityLogs(activityLogs, errors)

      expect(localStorage.getItem('activityLogs')).toBe(JSON.stringify(activityLogs))
      expect(errors).toHaveLength(0)
    })

    it('should restore empty activity logs array', async () => {
      const activityLogs: ActivityLogBackup[] = []
      const errors: string[] = []

      await restoreActivityLogs(activityLogs, errors)

      expect(localStorage.getItem('activityLogs')).toBe('[]')
      expect(errors).toHaveLength(0)
    })

    it('should handle localStorage error and add to errors array', async () => {
      const activityLogs: ActivityLogBackup[] = [
        { id: 1, timestamp: '2024-01-01', action: 'login' },
      ]
      const errors: string[] = []

      jest.spyOn(Storage.prototype, 'setItem').mockImplementation(() => {
        throw new Error('Storage quota exceeded')
      })

      await restoreActivityLogs(activityLogs, errors)

      expect(errors).toHaveLength(1)
      expect(errors[0]).toContain('Failed to restore activity logs')
      expect(errors[0]).toContain('Storage quota exceeded')
    })

    it('should handle single activity log', async () => {
      const activityLogs: ActivityLogBackup[] = [
        { id: 1, timestamp: '2024-01-01', action: 'login' },
      ]
      const errors: string[] = []

      await restoreActivityLogs(activityLogs, errors)

      expect(localStorage.getItem('activityLogs')).toBe(JSON.stringify(activityLogs))
      expect(errors).toHaveLength(0)
    })

    it('should handle large activity logs array', async () => {
      const activityLogs: ActivityLogBackup[] = Array.from({ length: 1000 }, (_, i) => ({
        id: i,
        timestamp: `2024-01-01`,
        action: `action-${i}`,
      }))
      const errors: string[] = []

      await restoreActivityLogs(activityLogs, errors)

      expect(localStorage.getItem('activityLogs')).toBe(JSON.stringify(activityLogs))
      expect(errors).toHaveLength(0)
    })
  })
})
