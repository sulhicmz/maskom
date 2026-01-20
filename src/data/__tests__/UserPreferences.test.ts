import {
  getUserPreferences,
  saveUserPreferences,
  addPreferredCategory,
  removePreferredCategory,
  addPreferredTag,
  removePreferredTag,
  clearUserPreferences,
  updatePreference,
  isCategoryPreferred,
  isTagPreferred,
  togglePersonalizedRecs,
  setMaxRecommendations,
  setRecencyWeight,
  setPopularityWeight,
  resetToDefaults,
  getDefaultPreferences,
  type UserPreference
} from '../../data/UserPreferences'

describe('UserPreferences', () => {
  beforeEach(() => {
    localStorage.clear()
  })

  afterEach(() => {
    localStorage.clear()
  })

  describe('getDefaultPreferences', () => {
    it('should return default preferences', () => {
      const defaults = getDefaultPreferences()

      expect(defaults.preferredCategories).toEqual([])
      expect(defaults.preferredTags).toEqual([])
      expect(defaults.maxRecommendations).toBe(10)
      expect(defaults.enablePersonalizedRecs).toBe(true)
      expect(defaults.recencyWeight).toBe(0.3)
      expect(defaults.popularityWeight).toBe(0.7)
    })
  })

  describe('getUserPreferences', () => {
    it('should return default preferences when none exist', () => {
      const preferences = getUserPreferences()

      expect(preferences).toEqual(getDefaultPreferences())
    })

    it('should return stored preferences', () => {
      const stored: UserPreference = {
        preferredCategories: [1, 2],
        preferredTags: [3, 4],
        maxRecommendations: 15,
        enablePersonalizedRecs: false,
        recencyWeight: 0.5,
        popularityWeight: 0.5
      }

      localStorage.setItem('user_preferences', JSON.stringify(stored))

      const preferences = getUserPreferences()

      expect(preferences.preferredCategories).toEqual([1, 2])
      expect(preferences.preferredTags).toEqual([3, 4])
      expect(preferences.maxRecommendations).toBe(15)
      expect(preferences.enablePersonalizedRecs).toBe(false)
      expect(preferences.recencyWeight).toBe(0.5)
      expect(preferences.popularityWeight).toBe(0.5)
    })

    it('should merge with defaults for missing fields', () => {
      const stored: Partial<UserPreference> = {
        preferredCategories: [1, 2]
      }

      localStorage.setItem('user_preferences', JSON.stringify(stored))

      const preferences = getUserPreferences()

      expect(preferences.preferredCategories).toEqual([1, 2])
      expect(preferences.preferredTags).toEqual([])
      expect(preferences.maxRecommendations).toBe(10)
    })

    it('should handle JSON parsing errors gracefully', () => {
      localStorage.setItem('user_preferences', 'invalid json')

      const preferences = getUserPreferences()

      expect(preferences).toEqual(getDefaultPreferences())
    })

    it('should handle missing localStorage gracefully', () => {
      const originalLocalStorage = global.localStorage
      delete (global as any).localStorage

      const preferences = getUserPreferences()

      expect(preferences).toEqual(getDefaultPreferences())

      global.localStorage = originalLocalStorage
    })
  })

  describe('saveUserPreferences', () => {
    it('should save preferences to localStorage', () => {
      const preferences: UserPreference = {
        preferredCategories: [1, 2],
        preferredTags: [3],
        maxRecommendations: 20
      }

      const result = saveUserPreferences(preferences)

      expect(result).toBe(true)

      const stored = localStorage.getItem('user_preferences')
      expect(stored).toBeDefined()

      const parsed = JSON.parse(stored!)
      expect(parsed.preferredCategories).toEqual([1, 2])
      expect(parsed.preferredTags).toEqual([3])
      expect(parsed.maxRecommendations).toBe(20)
    })

    it('should merge preferences with defaults', () => {
      const preferences: Partial<UserPreference> = {
        preferredCategories: [1, 2]
      }

      saveUserPreferences(preferences)

      const stored = JSON.parse(localStorage.getItem('user_preferences')!)

      expect(stored.preferredCategories).toEqual([1, 2])
      expect(stored.preferredTags).toEqual([])
      expect(stored.maxRecommendations).toBe(10)
    })

    it('should handle storage errors gracefully', () => {
      const originalLocalStorage = global.localStorage

      Object.defineProperty(window, 'localStorage', {
        value: {
          setItem: () => {
            throw new Error('Storage quota exceeded')
          }
        },
        writable: true,
        configurable: true
      })

      const preferences: UserPreference = {
        preferredCategories: [1]
      }

      const result = saveUserPreferences(preferences)

      expect(result).toBe(false)

      global.localStorage = originalLocalStorage as any
    })

    it('should handle missing localStorage gracefully', () => {
      const originalLocalStorage = global.localStorage
      delete (global as any).localStorage

      const preferences: UserPreference = {
        preferredCategories: [1]
      }

      const result = saveUserPreferences(preferences)

      expect(result).toBe(false)

      global.localStorage = originalLocalStorage
    })
  })

  describe('addPreferredCategory', () => {
    it('should add a category to preferences', () => {
      const result = addPreferredCategory(1)

      expect(result).toBe(true)

      const preferences = getUserPreferences()
      expect(preferences.preferredCategories).toContain(1)
    })

    it('should not add duplicate categories', () => {
      addPreferredCategory(1)
      const result = addPreferredCategory(1)

      expect(result).toBe(false)

      const preferences = getUserPreferences()
      expect(preferences.preferredCategories).toEqual([1])
    })

    it('should add multiple categories', () => {
      addPreferredCategory(1)
      addPreferredCategory(2)
      addPreferredCategory(3)

      const preferences = getUserPreferences()

      expect(preferences.preferredCategories).toEqual([1, 2, 3])
    })
  })

  describe('removePreferredCategory', () => {
    it('should remove a category from preferences', () => {
      addPreferredCategory(1)
      const result = removePreferredCategory(1)

      expect(result).toBe(true)

      const preferences = getUserPreferences()
      expect(preferences.preferredCategories).not.toContain(1)
    })

    it('should handle removing non-existent category', () => {
      const result = removePreferredCategory(999)

      expect(result).toBe(false)
    })

    it('should remove only the specified category', () => {
      addPreferredCategory(1)
      addPreferredCategory(2)

      removePreferredCategory(1)

      const preferences = getUserPreferences()
      expect(preferences.preferredCategories).toEqual([2])
    })
  })

  describe('addPreferredTag', () => {
    it('should add a tag to preferences', () => {
      const result = addPreferredTag(1)

      expect(result).toBe(true)

      const preferences = getUserPreferences()
      expect(preferences.preferredTags).toContain(1)
    })

    it('should not add duplicate tags', () => {
      addPreferredTag(1)
      const result = addPreferredTag(1)

      expect(result).toBe(false)

      const preferences = getUserPreferences()
      expect(preferences.preferredTags).toEqual([1])
    })

    it('should add multiple tags', () => {
      addPreferredTag(1)
      addPreferredTag(2)
      addPreferredTag(3)

      const preferences = getUserPreferences()

      expect(preferences.preferredTags).toEqual([1, 2, 3])
    })
  })

  describe('removePreferredTag', () => {
    it('should remove a tag from preferences', () => {
      addPreferredTag(1)
      const result = removePreferredTag(1)

      expect(result).toBe(true)

      const preferences = getUserPreferences()
      expect(preferences.preferredTags).not.toContain(1)
    })

    it('should handle removing non-existent tag', () => {
      const result = removePreferredTag(999)

      expect(result).toBe(false)
    })

    it('should remove only the specified tag', () => {
      addPreferredTag(1)
      addPreferredTag(2)

      removePreferredTag(1)

      const preferences = getUserPreferences()
      expect(preferences.preferredTags).toEqual([2])
    })
  })

  describe('clearUserPreferences', () => {
    it('should clear all preferences', () => {
      addPreferredCategory(1)
      addPreferredTag(2)

      clearUserPreferences()

      const preferences = getUserPreferences()
      expect(preferences).toEqual(getDefaultPreferences())
    })

    it('should handle storage errors gracefully', () => {
      const originalRemoveItem = localStorage.removeItem
      localStorage.removeItem = jest.fn(() => {
        throw new Error('Storage error')
      })

      expect(() => clearUserPreferences()).not.toThrow()

      localStorage.removeItem = originalRemoveItem
    })

    it('should handle missing localStorage gracefully', () => {
      const originalLocalStorage = global.localStorage
      delete (global as any).localStorage

      expect(() => clearUserPreferences()).not.toThrow()

      global.localStorage = originalLocalStorage
    })
  })

  describe('updatePreference', () => {
    it('should add a category preference', () => {
      const result = updatePreference({ categoryId: 1, action: 'add' })

      expect(result).toBe(true)

      const preferences = getUserPreferences()
      expect(preferences.preferredCategories).toContain(1)
    })

    it('should remove a category preference', () => {
      addPreferredCategory(1)

      const result = updatePreference({ categoryId: 1, action: 'remove' })

      expect(result).toBe(true)

      const preferences = getUserPreferences()
      expect(preferences.preferredCategories).not.toContain(1)
    })

    it('should add a tag preference', () => {
      const result = updatePreference({ tagId: 1, action: 'add' })

      expect(result).toBe(true)

      const preferences = getUserPreferences()
      expect(preferences.preferredTags).toContain(1)
    })

    it('should remove a tag preference', () => {
      addPreferredTag(1)

      const result = updatePreference({ tagId: 1, action: 'remove' })

      expect(result).toBe(true)

      const preferences = getUserPreferences()
      expect(preferences.preferredTags).not.toContain(1)
    })

    it('should handle both category and tag in single update', () => {
      const result = updatePreference({ categoryId: 1, tagId: 2, action: 'add' })

      expect(result).toBe(true)

      const preferences = getUserPreferences()
      expect(preferences.preferredCategories).toContain(1)
      expect(preferences.preferredTags).toContain(2)
    })
  })

  describe('isCategoryPreferred', () => {
    it('should return true for preferred category', () => {
      addPreferredCategory(1)

      const result = isCategoryPreferred(1)

      expect(result).toBe(true)
    })

    it('should return false for non-preferred category', () => {
      const result = isCategoryPreferred(1)

      expect(result).toBe(false)
    })
  })

  describe('isTagPreferred', () => {
    it('should return true for preferred tag', () => {
      addPreferredTag(1)

      const result = isTagPreferred(1)

      expect(result).toBe(true)
    })

    it('should return false for non-preferred tag', () => {
      const result = isTagPreferred(1)

      expect(result).toBe(false)
    })
  })

  describe('togglePersonalizedRecs', () => {
    it('should enable personalized recommendations', () => {
      const result = togglePersonalizedRecs(true)

      expect(result).toBe(true)

      const preferences = getUserPreferences()
      expect(preferences.enablePersonalizedRecs).toBe(true)
    })

    it('should disable personalized recommendations', () => {
      const result = togglePersonalizedRecs(false)

      expect(result).toBe(true)

      const preferences = getUserPreferences()
      expect(preferences.enablePersonalizedRecs).toBe(false)
    })
  })

  describe('setMaxRecommendations', () => {
    it('should set max recommendations', () => {
      const result = setMaxRecommendations(20)

      expect(result).toBe(true)

      const preferences = getUserPreferences()
      expect(preferences.maxRecommendations).toBe(20)
    })

    it('should clamp value to minimum of 1', () => {
      const result = setMaxRecommendations(-5)

      expect(result).toBe(true)

      const preferences = getUserPreferences()
      expect(preferences.maxRecommendations).toBe(1)
    })

    it('should clamp value to maximum of 50', () => {
      const result = setMaxRecommendations(100)

      expect(result).toBe(true)

      const preferences = getUserPreferences()
      expect(preferences.maxRecommendations).toBe(50)
    })
  })

  describe('setRecencyWeight', () => {
    it('should set recency weight', () => {
      const result = setRecencyWeight(0.5)

      expect(result).toBe(true)

      const preferences = getUserPreferences()
      expect(preferences.recencyWeight).toBe(0.5)
    })

    it('should clamp value to minimum of 0', () => {
      const result = setRecencyWeight(-0.5)

      expect(result).toBe(true)

      const preferences = getUserPreferences()
      expect(preferences.recencyWeight).toBe(0)
    })

    it('should clamp value to maximum of 1', () => {
      const result = setRecencyWeight(1.5)

      expect(result).toBe(true)

      const preferences = getUserPreferences()
      expect(preferences.recencyWeight).toBe(1)
    })
  })

  describe('setPopularityWeight', () => {
    it('should set popularity weight', () => {
      const result = setPopularityWeight(0.6)

      expect(result).toBe(true)

      const preferences = getUserPreferences()
      expect(preferences.popularityWeight).toBe(0.6)
    })

    it('should clamp value to minimum of 0', () => {
      const result = setPopularityWeight(-0.5)

      expect(result).toBe(true)

      const preferences = getUserPreferences()
      expect(preferences.popularityWeight).toBe(0)
    })

    it('should clamp value to maximum of 1', () => {
      const result = setPopularityWeight(1.5)

      expect(result).toBe(true)

      const preferences = getUserPreferences()
      expect(preferences.popularityWeight).toBe(1)
    })
  })

  describe('resetToDefaults', () => {
    it('should reset preferences to defaults', () => {
      addPreferredCategory(1)
      addPreferredTag(2)
      setMaxRecommendations(20)

      const result = resetToDefaults()

      expect(result).toBe(true)

      const preferences = getUserPreferences()
      expect(preferences).toEqual(getDefaultPreferences())
    })
  })
})
