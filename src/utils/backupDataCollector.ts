import {
  BackupData,
  UserDataBackup,
  ContentDataBackup,
  SettingsDataBackup,
  ActivityLogBackup,
} from '@/types/backup'

export async function collectUserData(): Promise<UserDataBackup> {
  try {
    const authState = typeof localStorage !== 'undefined'
      ? localStorage.getItem('authState') || '[]'
      : '[]'
    const preferences = typeof localStorage !== 'undefined'
      ? localStorage.getItem('userPreferences') || '[]'
      : '[]'
    const mfaSettings = typeof localStorage !== 'undefined'
      ? localStorage.getItem('mfaSettings') || '[]'
      : '[]'

    return {
      authState: JSON.parse(authState),
      preferences: JSON.parse(preferences),
      mfaSettings: JSON.parse(mfaSettings),
    }
  } catch (error) {
    console.error('Failed to collect user data:', error)
    return {
      authState: [],
      preferences: [],
      mfaSettings: [],
    }
  }
}

export async function collectContentData(): Promise<ContentDataBackup> {
  try {
    const bookmarks = typeof localStorage !== 'undefined'
      ? localStorage.getItem('bookmarks') || '[]'
      : '[]'
    const readingHistory = typeof localStorage !== 'undefined'
      ? localStorage.getItem('readingHistory') || '[]'
      : '[]'
    const blogPosts = typeof localStorage !== 'undefined'
      ? localStorage.getItem('blogPosts') || '[]'
      : '[]'
    const blogComments = typeof localStorage !== 'undefined'
      ? localStorage.getItem('blogComments') || '[]'
      : '[]'

    return {
      bookmarks: JSON.parse(bookmarks),
      readingHistory: JSON.parse(readingHistory),
      blogPosts: JSON.parse(blogPosts),
      blogComments: JSON.parse(blogComments),
    }
  } catch (error) {
    console.error('Failed to collect content data:', error)
    return {
      bookmarks: [],
      readingHistory: [],
      blogPosts: [],
      blogComments: [],
    }
  }
}

export async function collectSettingsData(): Promise<SettingsDataBackup> {
  try {
    const appSettings = typeof localStorage !== 'undefined'
      ? localStorage.getItem('appSettings') || '[]'
      : '[]'
    const uiSettings = typeof localStorage !== 'undefined'
      ? localStorage.getItem('uiSettings') || '[]'
      : '[]'
    const themeSettings = typeof localStorage !== 'undefined'
      ? localStorage.getItem('themeSettings') || '[]'
      : '[]'
    const notificationSettings = typeof localStorage !== 'undefined'
      ? localStorage.getItem('notificationSettings') || '[]'
      : '[]'

    return {
      appSettings: JSON.parse(appSettings),
      uiSettings: JSON.parse(uiSettings),
      themeSettings: JSON.parse(themeSettings),
      notificationSettings: JSON.parse(notificationSettings),
    }
  } catch (error) {
    console.error('Failed to collect settings data:', error)
    return {
      appSettings: [],
      uiSettings: [],
      themeSettings: [],
      notificationSettings: [],
    }
  }
}

export async function collectActivityLogs(): Promise<ActivityLogBackup[]> {
  try {
    const activityLogs = typeof localStorage !== 'undefined'
      ? localStorage.getItem('activityLogs') || '[]'
      : '[]'

    return JSON.parse(activityLogs)
  } catch (error) {
    console.error('Failed to collect activity logs:', error)
    return []
  }
}

export async function calculateChangesSinceBackup(): Promise<Omit<BackupData, 'backupInfo'>> {
  try {
    const userData = await collectUserData()
    const contentData = await collectContentData()
    const settingsData = await collectSettingsData()
    const activityLogs = await collectActivityLogs()

    return {
      userData,
      contentData,
      settingsData,
      activityLogs,
    }
  } catch (error) {
    console.error('Failed to calculate changes since backup:', error)
    throw new Error('Failed to calculate changes since backup')
  }
}
