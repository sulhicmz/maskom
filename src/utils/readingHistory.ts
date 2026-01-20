import type { InnerBlogPost } from '@/types/data'

export interface ReadingHistoryEntry {
  postId: number
  title: string
  tagId: number
  categoryId: number
  category?: string
  timestamp: string
}

export interface ReadingHistoryStats {
  totalPostsRead: number
  uniquePosts: number
  mostReadCategory: string
  mostReadTag: string
  recentReads: number
}

const STORAGE_KEY = 'reading_history'
const EXPIRY_DAYS = 30
const EXPIRY_MS = EXPIRY_DAYS * 24 * 60 * 60 * 1000

function getStorageKey(): string {
  return STORAGE_KEY
}

export function isHistoryExpired(entry: ReadingHistoryEntry): boolean {
  const entryTime = new Date(entry.timestamp).getTime()
  const currentTime = Date.now()
  return currentTime - entryTime >= EXPIRY_MS
}

export function trackContentView(post: InnerBlogPost): void {
  if (typeof window === 'undefined') return

  try {
    const history = getReadingHistory()
    const entry: ReadingHistoryEntry = {
      postId: post.id,
      title: post.title,
      tagId: post.tagId,
      categoryId: post.categoryId,
      category: post.category,
      timestamp: new Date().toISOString()
    }

    const existingIndex = history.findIndex(h => h.postId === post.id)
    if (existingIndex !== -1) {
      history[existingIndex] = entry
    } else {
      history.unshift(entry)
    }

    const filteredHistory = history.filter(h => !isHistoryExpired(h))
    localStorage.setItem(getStorageKey(), JSON.stringify(filteredHistory))
  } catch (error) {
    console.error('Failed to track content view:', error)
  }
}

export function getReadingHistory(): ReadingHistoryEntry[] {
  if (typeof window === 'undefined') return []

  try {
    const stored = localStorage.getItem(getStorageKey())
    if (!stored) return []

    const history: ReadingHistoryEntry[] = JSON.parse(stored)
    return history.filter(h => !isHistoryExpired(h))
  } catch (error) {
    console.error('Failed to retrieve reading history:', error)
    return []
  }
}

export function clearReadingHistory(): void {
  if (typeof window === 'undefined') return

  try {
    localStorage.removeItem(getStorageKey())
  } catch (error) {
    console.error('Failed to clear reading history:', error)
  }
}

export function getReadingHistoryStats(): ReadingHistoryStats {
  const history = getReadingHistory()
  const uniquePostIds = new Set(history.map(h => h.postId))

  const categoryCounts = new Map<number, number>()
  const tagCounts = new Map<number, number>()
  const recentTimestamp = Date.now() - (7 * 24 * 60 * 60 * 1000)

  let recentReads = 0
  history.forEach(entry => {
    categoryCounts.set(
      entry.categoryId,
      (categoryCounts.get(entry.categoryId) || 0) + 1
    )
    tagCounts.set(
      entry.tagId,
      (tagCounts.get(entry.tagId) || 0) + 1
    )

    if (new Date(entry.timestamp).getTime() > recentTimestamp) {
      recentReads++
    }
  })

  const mostReadCategory = Array.from(categoryCounts.entries()).sort(
    (a, b) => b[1] - a[1]
  )[0]?.[0] || 0

  const mostReadTag = Array.from(tagCounts.entries()).sort(
    (a, b) => b[1] - a[1]
  )[0]?.[0] || 0

  return {
    totalPostsRead: history.length,
    uniquePosts: uniquePostIds.size,
    mostReadCategory: String(mostReadCategory),
    mostReadTag: String(mostReadTag),
    recentReads
  }
}

export function getRecentlyViewedPosts(limit: number = 10): number[] {
  const history = getReadingHistory()
  const recentHistory = history
    .filter(h => !isHistoryExpired(h))
    .slice(0, limit)
  return recentHistory.map(h => h.postId)
}

export function removeHistoryEntry(postId: number): void {
  if (typeof window === 'undefined') return

  try {
    const history = getReadingHistory()
    const filteredHistory = history.filter(h => h.postId !== postId)
    localStorage.setItem(getStorageKey(), JSON.stringify(filteredHistory))
  } catch (error) {
    console.error('Failed to remove history entry:', error)
  }
}

export function getReadingHistoryByCategory(categoryId: number): ReadingHistoryEntry[] {
  const history = getReadingHistory()
  return history.filter(h => h.categoryId === categoryId)
}

export function getReadingHistoryByTag(tagId: number): ReadingHistoryEntry[] {
  const history = getReadingHistory()
  return history.filter(h => h.tagId === tagId)
}
