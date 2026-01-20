import {
  getHistory,
  addToHistory,
  clearHistory,
  rollbackToVersion,
  getHistoryStats,
  formatHistoryTime,
  formatHistoryDate
} from '@/utils/collaboration/collaborativeHistory'
import { DraftContent } from '@/types/collaboration'

describe('collaborativeHistory', () => {
  const postId = 123
  const mockContent: DraftContent = {
    title: 'Test Post',
    description: 'Test Description',
    content: 'Test content',
    tags: [1, 2],
    categoryId: 1,
    imageUrl: 'https://example.com/image.jpg'
  }

  beforeEach(() => {
    jest.clearAllMocks()
    clearHistory(postId)
  })

  afterEach(() => {
    clearHistory(postId)
  })

  describe('getHistory', () => {
    it('should return empty array when no history exists', () => {
      const history = getHistory(postId)
      expect(history).toEqual([])
    })

    it('should return history entries sorted by timestamp (newest first)', () => {
      const entry1 = addToHistory(postId, mockContent, 1, 'User1')
      jest.advanceTimersByTime(1000)
      const entry2 = addToHistory(postId, { ...mockContent, title: 'Updated' }, 2, 'User2')

      const history = getHistory(postId)

      expect(history.length).toBe(2)
      expect(history[0].id).toBe(entry2.id)
      expect(history[1].id).toBe(entry1.id)
    })

    it('should handle invalid stored data gracefully', () => {
      localStorage.setItem(`collaborative_history_${postId}`, 'invalid json')

      const history = getHistory(postId)

      expect(history).toEqual([])
    })
  })

  describe('addToHistory', () => {
    it('should create history entry with correct structure', () => {
      const entry = addToHistory(postId, mockContent, 1, 'User1', 'Initial draft')

      expect(entry).toMatchObject({
        postId,
        content: expect.objectContaining({
          title: mockContent.title
        }),
        authorId: 1,
        authorName: 'User1',
        description: 'Initial draft'
      })
      expect(entry.id).toMatch(/^history_\d+_[a-z0-9]+$/)
      expect(entry.timestamp).toBeGreaterThan(0)
    })

    it('should add entry to history', () => {
      addToHistory(postId, mockContent, 1, 'User1')

      const history = getHistory(postId)

      expect(history.length).toBe(1)
      expect(history[0].authorId).toBe(1)
    })

    it('should limit history to MAX_HISTORY_ENTRIES', () => {
      for (let i = 0; i < 55; i++) {
        addToHistory(postId, { ...mockContent, title: `Post ${i}` }, i, `User${i}`)
      }

      const history = getHistory(postId)

      expect(history.length).toBe(50)
    })

    it('should copy content object to avoid reference issues', () => {
      const entry = addToHistory(postId, mockContent, 1, 'User1')

      expect(entry.content).not.toBe(mockContent)
      expect(entry.content).toEqual(mockContent)
    })

    it('should create unique IDs for each entry', () => {
      const entry1 = addToHistory(postId, mockContent, 1, 'User1')
      jest.advanceTimersByTime(100)
      const entry2 = addToHistory(postId, mockContent, 2, 'User2')

      expect(entry1.id).not.toBe(entry2.id)
    })

    it('should handle description parameter as optional', () => {
      const entry = addToHistory(postId, mockContent, 1, 'User1')

      expect(entry.description).toBeUndefined()
    })
  })

  describe('clearHistory', () => {
    it('should remove all history entries for post', () => {
      addToHistory(postId, mockContent, 1, 'User1')
      addToHistory(postId, mockContent, 2, 'User2')

      expect(getHistory(postId).length).toBe(2)

      clearHistory(postId)

      expect(getHistory(postId).length).toBe(0)
    })

    it('should not affect history for other posts', () => {
      const otherPostId = 456

      addToHistory(postId, mockContent, 1, 'User1')
      addToHistory(otherPostId, mockContent, 2, 'User2')

      clearHistory(postId)

      expect(getHistory(postId).length).toBe(0)
      expect(getHistory(otherPostId).length).toBe(1)
    })
  })

  describe('rollbackToVersion', () => {
    it('should return content for valid history ID', () => {
      const entry = addToHistory(postId, mockContent, 1, 'User1')

      const content = rollbackToVersion(postId, entry.id)

      expect(content).toEqual(mockContent)
    })

    it('should return null for invalid history ID', () => {
      const content = rollbackToVersion(postId, 'invalid_id')

      expect(content).toBeNull()
    })

    it('should return null when history is empty', () => {
      const content = rollbackToVersion(postId, 'any_id')

      expect(content).toBeNull()
    })

    it('should copy content object to avoid reference issues', () => {
      const entry = addToHistory(postId, mockContent, 1, 'User1')

      const content = rollbackToVersion(postId, entry.id)

      expect(content).not.toBe(entry.content)
      expect(content).toEqual(entry.content)
    })
  })

  describe('getHistoryStats', () => {
    beforeEach(() => {
      jest.useFakeTimers()
      jest.setSystemTime(new Date('2026-01-20T12:00:00Z').getTime())
    })

    afterEach(() => {
      jest.useRealTimers()
    })

    it('should return zero stats for empty history', () => {
      const stats = getHistoryStats(postId)

      expect(stats).toMatchObject({
        totalEntries: 0,
        authorCounts: [],
        last24Hours: 0,
        last7Days: 0,
        oldestEntry: null,
        newestEntry: null
      })
    })

    it('should count total entries correctly', () => {
      for (let i = 0; i < 10; i++) {
        addToHistory(postId, mockContent, i, `User${i}`)
      }

      const stats = getHistoryStats(postId)

      expect(stats.totalEntries).toBe(10)
    })

    it('should count entries by author', () => {
      addToHistory(postId, mockContent, 1, 'User1')
      addToHistory(postId, mockContent, 1, 'User1')
      addToHistory(postId, mockContent, 2, 'User2')
      addToHistory(postId, mockContent, 3, 'User3')

      const stats = getHistoryStats(postId)

      expect(stats.authorCounts).toHaveLength(3)
      expect(stats.authorCounts).toContainEqual({
        authorId: 1,
        authorName: 'User1',
        count: 2
      })
      expect(stats.authorCounts).toContainEqual({
        authorId: 2,
        authorName: 'User2',
        count: 1
      })
      expect(stats.authorCounts).toContainEqual({
        authorId: 3,
        authorName: 'User3',
        count: 1
      })
    })

    it('should count entries in last 24 hours', () => {
      addToHistory(postId, mockContent, 1, 'User1')

      jest.setSystemTime(new Date('2026-01-20T12:00:00Z').getTime())
      addToHistory(postId, mockContent, 2, 'User2')

      jest.setSystemTime(new Date('2026-01-19T12:00:00Z').getTime())
      addToHistory(postId, mockContent, 3, 'User3')

      const stats = getHistoryStats(postId)

      expect(stats.last24Hours).toBe(2)
    })

    it('should count entries in last 7 days', () => {
      addToHistory(postId, mockContent, 1, 'User1')

      jest.setSystemTime(new Date('2026-01-20T12:00:00Z').getTime())
      addToHistory(postId, mockContent, 2, 'User2')

      jest.setSystemTime(new Date('2026-01-15T12:00:00Z').getTime())
      addToHistory(postId, mockContent, 3, 'User3')

      const stats = getHistoryStats(postId)

      expect(stats.last7Days).toBe(3)
    })

    it('should return oldest and newest entry timestamps', () => {
      const entry1 = addToHistory(postId, mockContent, 1, 'User1')
      jest.advanceTimersByTime(1000)
      addToHistory(postId, { ...mockContent }, 2, 'User2')
      jest.advanceTimersByTime(1000)
      const entry3 = addToHistory(postId, { ...mockContent }, 3, 'User3')

      const stats = getHistoryStats(postId)

      expect(stats.oldestEntry).toBe(entry1.timestamp)
      expect(stats.newestEntry).toBe(entry3.timestamp)
    })
  })

  describe('formatHistoryTime', () => {
    beforeEach(() => {
      jest.useFakeTimers()
      jest.setSystemTime(new Date('2026-01-20T12:00:00Z').getTime())
    })

    afterEach(() => {
      jest.useRealTimers()
    })

    it('should format time in seconds for recent events', () => {
      const timestamp = new Date('2026-01-20T11:59:50Z').getTime()
      const formatted = formatHistoryTime(timestamp)

      expect(formatted).toBe('10 detik yang lalu')
    })

    it('should format time in minutes for events under 1 hour', () => {
      const timestamp = new Date('2026-01-20T11:45:00Z').getTime()
      const formatted = formatHistoryTime(timestamp)

      expect(formatted).toBe('15 menit yang lalu')
    })

    it('should format time in hours for events under 24 hours', () => {
      const timestamp = new Date('2026-01-20T08:00:00Z').getTime()
      const formatted = formatHistoryTime(timestamp)

      expect(formatted).toBe('4 jam yang lalu')
    })

    it('should format time in days for older events', () => {
      const timestamp = new Date('2026-01-15T12:00:00Z').getTime()
      const formatted = formatHistoryTime(timestamp)

      expect(formatted).toBe('5 hari yang lalu')
    })
  })

  describe('formatHistoryDate', () => {
    it('should format date in Indonesian locale', () => {
      const timestamp = new Date('2026-01-20T15:30:45Z').getTime()
      const formatted = formatHistoryDate(timestamp)

      expect(formatted).toMatch(/20 Jan 2026/)
      expect(formatted).toContain('15:30')
    })

    it('should format date correctly for different months', () => {
      const timestamp = new Date('2026-12-15T10:20:30Z').getTime()
      const formatted = formatHistoryDate(timestamp)

      expect(formatted).toContain('15 Des 2026')
      expect(formatted).toContain('10:20')
    })
  })
})
