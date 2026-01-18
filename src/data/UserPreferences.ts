export interface UserPreference {
  preferredCategories: number[]
  preferredTags: number[]
  maxRecommendations?: number
  enablePersonalizedRecs?: boolean
  recencyWeight?: number
  popularityWeight?: number
}

export interface PreferenceUpdate {
  categoryId?: number
  tagId?: number
  action: 'add' | 'remove'
}

const STORAGE_KEY = 'user_preferences'
const DEFAULT_MAX_RECS = 10
const DEFAULT_RECENCY_WEIGHT = 0.3
const DEFAULT_POPULARITY_WEIGHT = 0.7

function getStorageKey(): string {
  return STORAGE_KEY
}

export function getDefaultPreferences(): UserPreference {
  return {
    preferredCategories: [],
    preferredTags: [],
    maxRecommendations: DEFAULT_MAX_RECS,
    enablePersonalizedRecs: true,
    recencyWeight: DEFAULT_RECENCY_WEIGHT,
    popularityWeight: DEFAULT_POPULARITY_WEIGHT
  }
}

export function getUserPreferences(): UserPreference {
  if (typeof window === 'undefined') {
    return getDefaultPreferences()
  }

  try {
    const stored = localStorage.getItem(getStorageKey())
    if (!stored) {
      return getDefaultPreferences()
    }

    const preferences: UserPreference = JSON.parse(stored)

    return {
      ...getDefaultPreferences(),
      ...preferences
    }
  } catch (error) {
    console.error('Failed to retrieve user preferences:', error)
    return getDefaultPreferences()
  }
}

export function saveUserPreferences(
  preferences: UserPreference
): boolean {
  if (typeof window === 'undefined') return false

  try {
    const mergedPreferences = {
      ...getDefaultPreferences(),
      ...preferences
    }

    localStorage.setItem(
      getStorageKey(),
      JSON.stringify(mergedPreferences)
    )

    return true
  } catch (error) {
    console.error('Failed to save user preferences:', error)
    return false
  }
}

export function addPreferredCategory(categoryId: number): boolean {
  const preferences = getUserPreferences()

  if (!preferences.preferredCategories.includes(categoryId)) {
    preferences.preferredCategories.push(categoryId)

    return saveUserPreferences(preferences)
  }

  return false
}

export function removePreferredCategory(categoryId: number): boolean {
  const preferences = getUserPreferences()

  const index = preferences.preferredCategories.indexOf(categoryId)
  if (index !== -1) {
    preferences.preferredCategories.splice(index, 1)

    return saveUserPreferences(preferences)
  }

  return false
}

export function addPreferredTag(tagId: number): boolean {
  const preferences = getUserPreferences()

  if (!preferences.preferredTags.includes(tagId)) {
    preferences.preferredTags.push(tagId)

    return saveUserPreferences(preferences)
  }

  return false
}

export function removePreferredTag(tagId: number): boolean {
  const preferences = getUserPreferences()

  const index = preferences.preferredTags.indexOf(tagId)
  if (index !== -1) {
    preferences.preferredTags.splice(index, 1)

    return saveUserPreferences(preferences)
  }

  return false
}

export function clearUserPreferences(): void {
  if (typeof window === 'undefined') return

  try {
    localStorage.removeItem(getStorageKey())
  } catch (error) {
    console.error('Failed to clear user preferences:', error)
  }
}

export function updatePreference(update: PreferenceUpdate): boolean {
  const preferences = getUserPreferences()

  if (update.categoryId !== undefined) {
    const { categoryId, action } = update

    if (action === 'add') {
      if (!preferences.preferredCategories.includes(categoryId)) {
        preferences.preferredCategories.push(categoryId)
      }
    } else if (action === 'remove') {
      const index = preferences.preferredCategories.indexOf(categoryId)
      if (index !== -1) {
        preferences.preferredCategories.splice(index, 1)
      }
    }
  }

  if (update.tagId !== undefined) {
    const { tagId, action } = update

    if (action === 'add') {
      if (!preferences.preferredTags.includes(tagId)) {
        preferences.preferredTags.push(tagId)
      }
    } else if (action === 'remove') {
      const index = preferences.preferredTags.indexOf(tagId)
      if (index !== -1) {
        preferences.preferredTags.splice(index, 1)
      }
    }
  }

  return saveUserPreferences(preferences)
}

export function isCategoryPreferred(categoryId: number): boolean {
  const preferences = getUserPreferences()
  return preferences.preferredCategories.includes(categoryId)
}

export function isTagPreferred(tagId: number): boolean {
  const preferences = getUserPreferences()
  return preferences.preferredTags.includes(tagId)
}

export function togglePersonalizedRecs(enabled: boolean): boolean {
  const preferences = getUserPreferences()
  preferences.enablePersonalizedRecs = enabled

  return saveUserPreferences(preferences)
}

export function setMaxRecommendations(max: number): boolean {
  const preferences = getUserPreferences()
  preferences.maxRecommendations = Math.max(1, Math.min(50, max))

  return saveUserPreferences(preferences)
}

export function setRecencyWeight(weight: number): boolean {
  const preferences = getUserPreferences()
  preferences.recencyWeight = Math.max(0, Math.min(1, weight))

  return saveUserPreferences(preferences)
}

export function setPopularityWeight(weight: number): boolean {
  const preferences = getUserPreferences()
  preferences.popularityWeight = Math.max(0, Math.min(1, weight))

  return saveUserPreferences(preferences)
}

export function resetToDefaults(): boolean {
  return saveUserPreferences(getDefaultPreferences())
}
