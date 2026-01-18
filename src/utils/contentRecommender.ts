import type { InnerBlogPost } from '@/types/data'
import { blog_data, innerBlogById } from '@/data/InnerBlogData'
import type { ReadingHistoryEntry } from './readingHistory'

export interface RecommendationScore {
  postId: number
  score: number
  reasons: string[]
}

export interface RecommendationConfig {
  minScore?: number
  maxResults?: number
  excludeViewed?: boolean
  boostPublished?: boolean
}

const DEFAULT_CONFIG: RecommendationConfig = {
  minScore: 0.2,
  maxResults: 10,
  excludeViewed: true,
  boostPublished: true
}

export function calculateContentSimilarity(
  postA: InnerBlogPost,
  postB: InnerBlogPost
): number {
  if (postA.id === postB.id) return 0

  let score = 0

  const categoryWeight = 0.5
  const tagWeight = 0.5

  if (postA.categoryId === postB.categoryId) {
    score += categoryWeight
  }

  if (postA.tagId === postB.tagId) {
    score += tagWeight
  }

  return Math.min(score, 1)
}

export function calculateJaccardSimilarity(
  setA: Set<number>,
  setB: Set<number>
): number {
  if (setA.size === 0 && setB.size === 0) return 0
  
  const intersection = new Set<number>()
  const union = new Set<number>()
  
  for (const item of setA) {
    union.add(item)
    if (setB.has(item)) {
      intersection.add(item)
    }
  }
  
  for (const item of setB) {
    union.add(item)
  }
  
  return intersection.size / union.size
}

export function generateRecommendations(
  readingHistory: ReadingHistoryEntry[],
  config: RecommendationConfig = DEFAULT_CONFIG
): RecommendationScore[] {
  const mergedConfig = { ...DEFAULT_CONFIG, ...config }

  if (readingHistory.length === 0) {
    return getTrendingPosts(mergedConfig.maxResults || 10)
  }

  const viewedPostIds = new Set(readingHistory.map(h => h.postId))

  const preferences = extractPreferences(readingHistory)
  const postsToScore = blog_data.filter(post => {
    if (mergedConfig.excludeViewed && viewedPostIds.has(post.id)) {
      return false
    }

    if (post.status === 'draft') {
      return false
    }

    if (mergedConfig.boostPublished && post.status !== 'published') {
      return false
    }

    return true
  })

  const scores: RecommendationScore[] = postsToScore.map(post => {
    let score = 0
    const reasons: string[] = []

    if (preferences.categories.has(post.categoryId)) {
      score += 0.4
      reasons.push('Matching category')
    }

    if (preferences.tags.has(post.tagId)) {
      score += 0.4
      reasons.push('Matching tag')
    }

    const viewCountBonus = Math.min((post.viewCount || 0) / 1000, 0.2)
    score += viewCountBonus

    if (viewCountBonus > 0.1) {
      reasons.push('Popular post')
    }

    const engagementBonus = Math.min((post.engagementScore || 0) / 100, 0.2)
    score += engagementBonus

    if (engagementBonus > 0.1) {
      reasons.push('High engagement')
    }

    return {
      postId: post.id,
      score: Math.min(score, 1),
      reasons
    }
  })

  const filteredScores = scores.filter(
    score => score.score >= (mergedConfig.minScore || 0)
  )

  return filteredScores
    .sort((a, b) => b.score - a.score)
    .slice(0, mergedConfig.maxResults || 10)
}

export function extractPreferences(
  readingHistory: ReadingHistoryEntry[]
): { categories: Set<number>; tags: Set<number> } {
  const categories = new Set<number>()
  const tags = new Set<number>()

  readingHistory.forEach(entry => {
    categories.add(entry.categoryId)
    tags.add(entry.tagId)
  })

  return { categories, tags }
}

export function getTrendingPosts(limit: number = 10): RecommendationScore[] {
  const publishedPosts = blog_data.filter(post => post.status === 'published')

  const scores = publishedPosts.map(post => {
    let score = 0
    const reasons: string[] = []

    const viewScore = (post.viewCount || 0) / 2000
    score += Math.min(viewScore, 0.4)
    if (viewScore > 0.2) reasons.push('High views')

    const engagementScore = (post.engagementScore || 0) / 100
    score += Math.min(engagementScore, 0.3)
    if (engagementScore > 0.2) reasons.push('High engagement')

    const shareScore = (post.shareCount || 0) / 100
    score += Math.min(shareScore, 0.2)
    if (shareScore > 0.1) reasons.push('Popular shares')

    const recencyScore = calculateRecencyScore(post)
    score += recencyScore
    if (recencyScore > 0.1) reasons.push('Recently published')

    return {
      postId: post.id,
      score: Math.min(score, 1),
      reasons
    }
  })

  return scores
    .sort((a, b) => b.score - a.score)
    .slice(0, limit)
}

export function calculateRecencyScore(post: InnerBlogPost): number {
  const postDate = new Date(post.date).getTime()
  const now = Date.now()
  const daysSincePublish = (now - postDate) / (1000 * 60 * 60 * 24)

  if (daysSincePublish < 7) return 0.3
  if (daysSincePublish < 14) return 0.2
  if (daysSincePublish < 30) return 0.1

  return 0
}

export function updateRecommendations(
  readingHistory: ReadingHistoryEntry[],
  currentPostId: number,
  config: RecommendationConfig = DEFAULT_CONFIG
): RecommendationScore[] {
  const mergedConfig = { ...DEFAULT_CONFIG, ...config }

  const updatedHistory = readingHistory.filter(h => h.postId !== currentPostId)

  const recommendations = generateRecommendations(updatedHistory, mergedConfig)

  return recommendations.filter(rec => rec.postId !== currentPostId)
}

export function getRecommendedPosts(
  recommendations: RecommendationScore[]
): InnerBlogPost[] {
  return recommendations
    .map(rec => innerBlogById.get(rec.postId))
    .filter((post): post is InnerBlogPost => post !== undefined)
}

export function getPersonalizedRecommendations(
  readingHistory: ReadingHistoryEntry[],
  config: RecommendationConfig = DEFAULT_CONFIG
): {
  posts: InnerBlogPost[]
  scores: RecommendationScore[]
} {
  const scores = generateRecommendations(readingHistory, config)
  const posts = getRecommendedPosts(scores)

  return { posts, scores }
}

export function getCategoryRecommendations(
  categoryId: number,
  limit: number = 5
): InnerBlogPost[] {
  const categoryPosts = blog_data
    .filter(post => post.categoryId === categoryId && post.status === 'published')
    .sort((a, b) => (b.viewCount || 0) - (a.viewCount || 0))

  return categoryPosts.slice(0, limit)
}

export function getTagRecommendations(
  tagId: number,
  limit: number = 5
): InnerBlogPost[] {
  const tagPosts = blog_data
    .filter(post => post.tagId === tagId && post.status === 'published')
    .sort((a, b) => (b.viewCount || 0) - (a.viewCount || 0))

  return tagPosts.slice(0, limit)
}
