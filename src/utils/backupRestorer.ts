import {
  UserDataBackup,
  ContentDataBackup,
  SettingsDataBackup,
  ActivityLogBackup,
} from '@/types/backup'

export async function restoreUserData(
  userData: UserDataBackup,
  errors: string[],
): Promise<void> {
  try {
    if (typeof window === 'undefined') {
      return
    }

    if (userData.authState) {
      localStorage.setItem('authState', JSON.stringify(userData.authState))
    }

    if (userData.preferences) {
      localStorage.setItem('userPreferences', JSON.stringify(userData.preferences))
    }

    if (userData.mfaSettings) {
      localStorage.setItem('mfaSettings', JSON.stringify(userData.mfaSettings))
    }
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error'
    errors.push(`Failed to restore user data: ${errorMessage}`)
  }
}

export async function restoreContentData(
  contentData: ContentDataBackup,
  errors: string[],
): Promise<void> {
  try {
    if (typeof window === 'undefined') {
      return
    }

    if (contentData.bookmarks) {
      localStorage.setItem('bookmarks', JSON.stringify(contentData.bookmarks))
    }

    if (contentData.readingHistory) {
      localStorage.setItem('readingHistory', JSON.stringify(contentData.readingHistory))
    }

    if (contentData.blogPosts) {
      localStorage.setItem('blogPosts', JSON.stringify(contentData.blogPosts))
    }

    if (contentData.blogComments) {
      localStorage.setItem('blogComments', JSON.stringify(contentData.blogComments))
    }
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error'
    errors.push(`Failed to restore content data: ${errorMessage}`)
  }
}

export async function restoreSettingsData(
  settingsData: SettingsDataBackup,
  errors: string[],
): Promise<void> {
  try {
    if (typeof window === 'undefined') {
      return
    }

    if (settingsData.appSettings) {
      localStorage.setItem('appSettings', JSON.stringify(settingsData.appSettings))
    }

    if (settingsData.uiSettings) {
      localStorage.setItem('uiSettings', JSON.stringify(settingsData.uiSettings))
    }

    if (settingsData.themeSettings) {
      localStorage.setItem('themeSettings', JSON.stringify(settingsData.themeSettings))
    }

    if (settingsData.notificationSettings) {
      localStorage.setItem('notificationSettings', JSON.stringify(settingsData.notificationSettings))
    }
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error'
    errors.push(`Failed to restore settings data: ${errorMessage}`)
  }
}

export async function restoreActivityLogs(
  activityLogs: ActivityLogBackup[],
  errors: string[],
): Promise<void> {
  try {
    if (typeof window === 'undefined') {
      return
    }

    localStorage.setItem('activityLogs', JSON.stringify(activityLogs))
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error'
    errors.push(`Failed to restore activity logs: ${errorMessage}`)
  }
}
