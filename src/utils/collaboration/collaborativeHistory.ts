import { DraftContent } from '@/types/collaboration'

export interface CollaborativeHistoryEntry {
  id: string
  postId: number
  content: DraftContent
  authorId: number
  authorName: string
  timestamp: number
  description?: string
}

const STORAGE_KEY_PREFIX = 'collaborative_history_'
const MAX_HISTORY_ENTRIES = 50

export function getHistory(postId: number): CollaborativeHistoryEntry[] {
  if (typeof window === 'undefined') {
    return []
  }

  try {
    const key = `${STORAGE_KEY_PREFIX}${postId}`
    const stored = localStorage.getItem(key)

    if (!stored) {
      return []
    }

    const history = JSON.parse(stored) as CollaborativeHistoryEntry[]
    return history.sort((a, b) => b.timestamp - a.timestamp)
  } catch (error) {
    console.error('Error loading collaborative history:', error)
    return []
  }
}

export function addToHistory(
  postId: number,
  content: DraftContent,
  authorId: number,
  authorName: string,
  description?: string
): CollaborativeHistoryEntry {
  const entry: CollaborativeHistoryEntry = {
    id: `history_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
    postId,
    content: { ...content },
    authorId,
    authorName,
    timestamp: Date.now(),
    description
  }

  const history = getHistory(postId)
  const updatedHistory = [entry, ...history].slice(0, MAX_HISTORY_ENTRIES)

  if (typeof window !== 'undefined') {
    try {
      const key = `${STORAGE_KEY_PREFIX}${postId}`
      localStorage.setItem(key, JSON.stringify(updatedHistory))
    } catch (error) {
      console.error('Error saving collaborative history:', error)
    }
  }

  return entry
}

export function clearHistory(postId: number): void {
  if (typeof window !== 'undefined') {
    try {
      const key = `${STORAGE_KEY_PREFIX}${postId}`
      localStorage.removeItem(key)
    } catch (error) {
      console.error('Error clearing collaborative history:', error)
    }
  }
}

export function rollbackToVersion(
  postId: number,
  historyId: string
): DraftContent | null {
  const history = getHistory(postId)
  const targetEntry = history.find(entry => entry.id === historyId)

  if (!targetEntry) {
    return null
  }

  return { ...targetEntry.content }
}

export function getHistoryStats(postId: number) {
  const history = getHistory(postId)

  const authorCounts = new Map<number, { name: string; count: number }>()

  for (const entry of history) {
    const existing = authorCounts.get(entry.authorId)
    if (existing) {
      existing.count++
    } else {
      authorCounts.set(entry.authorId, { name: entry.authorName, count: 1 })
    }
  }

  const now = Date.now()
  const last24Hours = history.filter(e => now - e.timestamp < 86400000).length
  const last7Days = history.filter(e => now - e.timestamp < 604800000).length

  return {
    totalEntries: history.length,
    authorCounts: Array.from(authorCounts.entries()).map(([id, data]) => ({
      authorId: id,
      authorName: data.name,
      count: data.count
    })),
    last24Hours,
    last7Days,
    oldestEntry: history.length > 0 ? history[history.length - 1].timestamp : null,
    newestEntry: history.length > 0 ? history[0].timestamp : null
  }
}

export function formatHistoryTime(timestamp: number): string {
  const now = Date.now()
  const diff = now - timestamp

  const seconds = Math.floor(diff / 1000)
  const minutes = Math.floor(diff / 60000)
  const hours = Math.floor(diff / 3600000)
  const days = Math.floor(diff / 86400000)

  if (seconds < 60) return `${seconds} detik yang lalu`
  if (minutes < 60) return `${minutes} menit yang lalu`
  if (hours < 24) return `${hours} jam yang lalu`
  return `${days} hari yang lalu`
}

export function formatHistoryDate(timestamp: number): string {
  const date = new Date(timestamp)
  const options: Intl.DateTimeFormatOptions = {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  }
  const datePart = date.toLocaleDateString('id-ID', options)
  const timePart = date.toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' })
  return `${datePart}, ${timePart}`
}
