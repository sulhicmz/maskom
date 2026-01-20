import {
  trackContentView,
  getReadingHistory,
  clearReadingHistory,
  getReadingHistoryStats,
  getRecentlyViewedPosts,
  removeHistoryEntry,
  getReadingHistoryByCategory,
  getReadingHistoryByTag,
  isHistoryExpired,
  type ReadingHistoryEntry
} from '../readingHistory'

describe('readingHistory', () => {
  let mockPost: any

  beforeEach(() => {
    localStorage.clear()
    mockPost = {
      id: 1,
      title: 'Test Post',
      tagId: 1,
      categoryId: 1,
      category: 'Test Category'
    }
  })

  describe('trackContentView', () => {
    it('should add a new entry to reading history', () => {
      trackContentView(mockPost)

      const history = getReadingHistory()

      expect(history).toHaveLength(1)
      expect(history[0].postId).toBe(1)
      expect(history[0].title).toBe('Test Post')
    })

    it('should update existing entry instead of duplicating', () => {
      trackContentView(mockPost)

      jest.advanceTimersByTime(1000)

      const updatedPost = { ...mockPost, title: 'Updated Title' }
      trackContentView(updatedPost)

      const history = getReadingHistory()

      expect(history).toHaveLength(1)
      expect(history[0].title).toBe('Updated Title')
    })

    it('should add new entries to the beginning of the array', () => {
      trackContentView({ ...mockPost, id: 1 })
      jest.advanceTimersByTime(1000)
      trackContentView({ ...mockPost, id: 2 })
      jest.advanceTimersByTime(1000)
      trackContentView({ ...mockPost, id: 3 })

      const history = getReadingHistory()

      expect(history[0].postId).toBe(3)
      expect(history[1].postId).toBe(2)
      expect(history[2].postId).toBe(1)
    })

    it('should handle errors gracefully', () => {
      const originalSetItem = localStorage.setItem
      localStorage.setItem = jest.fn(() => {
        throw new Error('Storage quota exceeded')
      })

      expect(() => trackContentView(mockPost)).not.toThrow()

      localStorage.setItem = originalSetItem
    })

    it('should do nothing if window is undefined', () => {
      const originalWindow = (global as any).window
      delete (global as any).window

      expect(() => trackContentView(mockPost)).not.toThrow()

      ;(global as any).window = originalWindow
    })
  })

  describe('getReadingHistory', () => {
    it('should return empty array when no history exists', () => {
      const history = getReadingHistory()

      expect(history).toEqual([])
    })

    it('should return stored reading history', () => {
      localStorage.setItem('reading_history', JSON.stringify([
        {
          postId: 1,
          title: 'Test Post',
          tagId: 1,
          categoryId: 1,
          category: 'Test Category',
          timestamp: new Date().toISOString()
        }
      ]))

      const history = getReadingHistory()

      expect(history).toHaveLength(1)
      expect(history[0].postId).toBe(1)
    })

    it('should handle JSON parsing errors', () => {
      localStorage.setItem('reading_history', 'invalid json')

      const history = getReadingHistory()

      expect(history).toEqual([])
    })

    it('should filter out expired entries', () => {
      const expiredEntry: ReadingHistoryEntry = {
        postId: 1,
        title: 'Expired Post',
        tagId: 1,
        categoryId: 1,
        timestamp: new Date(Date.now() - 31 * 24 * 60 * 60 * 1000).toISOString()
      }

      const validEntry: ReadingHistoryEntry = {
        postId: 2,
        title: 'Valid Post',
        tagId: 2,
        categoryId: 2,
        timestamp: new Date().toISOString()
      }

      localStorage.setItem('reading_history', JSON.stringify([expiredEntry, validEntry]))

      const history = getReadingHistory()

      expect(history).toHaveLength(1)
      expect(history[0].postId).toBe(2)
    })

    it('should do nothing if window is undefined', () => {
      const originalWindow = (global as any).window
      delete (global as any).window

      const history = getReadingHistory()

      expect(history).toEqual([])

      ;(global as any).window = originalWindow
    })
  })

  describe('clearReadingHistory', () => {
    it('should clear all reading history', () => {
      trackContentView(mockPost)

      clearReadingHistory()

      const history = getReadingHistory()

      expect(history).toEqual([])
    })

    it('should handle errors gracefully', () => {
      const originalRemoveItem = localStorage.removeItem
      localStorage.removeItem = jest.fn(() => {
        throw new Error('Storage error')
      })

      expect(() => clearReadingHistory()).not.toThrow()

      localStorage.removeItem = originalRemoveItem
    })

    it('should do nothing if window is undefined', () => {
      const originalWindow = (global as any).window
      delete (global as any).window

      expect(() => clearReadingHistory()).not.toThrow()

      ;(global as any).window = originalWindow
    })
  })

  describe('isHistoryExpired', () => {
    it('should return true for entries older than 30 days', () => {
      const oldEntry: ReadingHistoryEntry = {
        postId: 1,
        title: 'Old Post',
        tagId: 1,
        categoryId: 1,
        timestamp: new Date(Date.now() - 31 * 24 * 60 * 60 * 1000).toISOString()
      }

      expect(isHistoryExpired(oldEntry)).toBe(true)
    })

    it('should return false for entries within 30 days', () => {
      const recentEntry: ReadingHistoryEntry = {
        postId: 1,
        title: 'Recent Post',
        tagId: 1,
        categoryId: 1,
        timestamp: new Date().toISOString()
      }

      expect(isHistoryExpired(recentEntry)).toBe(false)
    })

    it('should return true for entries exactly at 30 days', () => {
      const thirtyDaysEntry: ReadingHistoryEntry = {
        postId: 1,
        title: '30 Days Post',
        tagId: 1,
        categoryId: 1,
        timestamp: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString()
      }

      expect(isHistoryExpired(thirtyDaysEntry)).toBe(true)
    })
  })

  describe('getReadingHistoryStats', () => {
    it('should return zero stats when no history exists', () => {
      const stats = getReadingHistoryStats()

      expect(stats.totalPostsRead).toBe(0)
      expect(stats.uniquePosts).toBe(0)
      expect(stats.mostReadCategory).toBe('0')
      expect(stats.mostReadTag).toBe('0')
      expect(stats.recentReads).toBe(0)
    })

    it('should calculate stats correctly', () => {
      trackContentView({ ...mockPost, id: 1, categoryId: 1, tagId: 1 })
      jest.advanceTimersByTime(1000)
      trackContentView({ ...mockPost, id: 2, categoryId: 1, tagId: 2 })
      jest.advanceTimersByTime(1000)
      trackContentView({ ...mockPost, id: 3, categoryId: 1, tagId: 1 })

      const stats = getReadingHistoryStats()

      expect(stats.totalPostsRead).toBe(3)
      expect(stats.uniquePosts).toBe(3)
      expect(stats.mostReadCategory).toBe('1')
      expect(stats.mostReadTag).toBe('1')
      expect(stats.recentReads).toBe(3)
    })

    it('should identify most read category and tag correctly', () => {
      trackContentView({ ...mockPost, id: 1, categoryId: 1, tagId: 1 })
      jest.advanceTimersByTime(1000)
      trackContentView({ ...mockPost, id: 2, categoryId: 1, tagId: 2 })
      jest.advanceTimersByTime(1000)
      trackContentView({ ...mockPost, id: 3, categoryId: 2, tagId: 2 })

      const stats = getReadingHistoryStats()

      expect(stats.mostReadCategory).toBe('1')
      expect(stats.mostReadTag).toBe('2')
    })

    it('should calculate recent reads correctly (last 7 days)', () => {
      const recentEntry: ReadingHistoryEntry = {
        postId: 1,
        title: 'Recent Post',
        tagId: 1,
        categoryId: 1,
        timestamp: new Date().toISOString()
      }

      const oldEntry: ReadingHistoryEntry = {
        postId: 2,
        title: 'Old Post',
        tagId: 2,
        categoryId: 2,
        timestamp: new Date(Date.now() - 8 * 24 * 60 * 60 * 1000).toISOString()
      }

      localStorage.setItem('reading_history', JSON.stringify([recentEntry, oldEntry]))

      const stats = getReadingHistoryStats()

      expect(stats.recentReads).toBe(1)
    })
  })

  describe('getRecentlyViewedPosts', () => {
    it('should return empty array when no history exists', () => {
      const recentPosts = getRecentlyViewedPosts()

      expect(recentPosts).toEqual([])
    })

    it('should return recent post IDs with default limit', () => {
      for (let i = 1; i <= 15; i++) {
        trackContentView({ ...mockPost, id: i })
        jest.advanceTimersByTime(1000)
      }

      const recentPosts = getRecentlyViewedPosts()

      expect(recentPosts).toHaveLength(10)
      expect(recentPosts[0]).toBe(15)
    })

    it('should return recent post IDs with custom limit', () => {
      for (let i = 1; i <= 15; i++) {
        trackContentView({ ...mockPost, id: i })
        jest.advanceTimersByTime(1000)
      }

      const recentPosts = getRecentlyViewedPosts(5)

      expect(recentPosts).toHaveLength(5)
      expect(recentPosts[0]).toBe(15)
    })

    it('should return fewer posts than limit if history is short', () => {
      trackContentView({ ...mockPost, id: 1 })
      jest.advanceTimersByTime(1000)
      trackContentView({ ...mockPost, id: 2 })

      const recentPosts = getRecentlyViewedPosts(10)

      expect(recentPosts).toHaveLength(2)
    })
  })

  describe('removeHistoryEntry', () => {
    it('should remove specific entry from history', () => {
      trackContentView({ ...mockPost, id: 1 })
      jest.advanceTimersByTime(1000)
      trackContentView({ ...mockPost, id: 2 })

      removeHistoryEntry(1)

      const history = getReadingHistory()

      expect(history).toHaveLength(1)
      expect(history[0].postId).toBe(2)
    })

    it('should handle removing non-existent entry gracefully', () => {
      trackContentView({ ...mockPost, id: 1 })

      expect(() => removeHistoryEntry(999)).not.toThrow()

      const history = getReadingHistory()

      expect(history).toHaveLength(1)
    })

    it('should handle errors gracefully', () => {
      const originalSetItem = localStorage.setItem
      localStorage.setItem = jest.fn(() => {
        throw new Error('Storage error')
      })

      trackContentView(mockPost)

      expect(() => removeHistoryEntry(1)).not.toThrow()

      localStorage.setItem = originalSetItem
    })

    it('should do nothing if window is undefined', () => {
      const originalWindow = (global as any).window
      delete (global as any).window

      expect(() => removeHistoryEntry(1)).not.toThrow()

      ;(global as any).window = originalWindow
    })
  })

  describe('getReadingHistoryByCategory', () => {
    it('should return empty array when no history exists', () => {
      const categoryHistory = getReadingHistoryByCategory(1)

      expect(categoryHistory).toEqual([])
    })

    it('should return entries filtered by category', () => {
      trackContentView({ ...mockPost, id: 1, categoryId: 1 })
      jest.advanceTimersByTime(1000)
      trackContentView({ ...mockPost, id: 2, categoryId: 2 })
      jest.advanceTimersByTime(1000)
      trackContentView({ ...mockPost, id: 3, categoryId: 1 })

      const categoryHistory = getReadingHistoryByCategory(1)

      expect(categoryHistory).toHaveLength(2)
      expect(categoryHistory.every(h => h.categoryId === 1)).toBe(true)
    })

    it('should return all entries when category matches all', () => {
      trackContentView({ ...mockPost, id: 1, categoryId: 1 })
      jest.advanceTimersByTime(1000)
      trackContentView({ ...mockPost, id: 2, categoryId: 1 })

      const categoryHistory = getReadingHistoryByCategory(1)

      expect(categoryHistory).toHaveLength(2)
    })
  })

  describe('getReadingHistoryByTag', () => {
    it('should return empty array when no history exists', () => {
      const tagHistory = getReadingHistoryByTag(1)

      expect(tagHistory).toEqual([])
    })

    it('should return entries filtered by tag', () => {
      trackContentView({ ...mockPost, id: 1, tagId: 1 })
      jest.advanceTimersByTime(1000)
      trackContentView({ ...mockPost, id: 2, tagId: 2 })
      jest.advanceTimersByTime(1000)
      trackContentView({ ...mockPost, id: 3, tagId: 1 })

      const tagHistory = getReadingHistoryByTag(1)

      expect(tagHistory).toHaveLength(2)
      expect(tagHistory.every(h => h.tagId === 1)).toBe(true)
    })

    it('should return all entries when tag matches all', () => {
      trackContentView({ ...mockPost, id: 1, tagId: 1 })
      jest.advanceTimersByTime(1000)
      trackContentView({ ...mockPost, id: 2, tagId: 1 })

      const tagHistory = getReadingHistoryByTag(1)

      expect(tagHistory).toHaveLength(2)
    })
  })
})
