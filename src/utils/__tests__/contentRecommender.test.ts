import {
  calculateContentSimilarity,
  calculateJaccardSimilarity,
  generateRecommendations,
  extractPreferences,
  getTrendingPosts,
  calculateRecencyScore,
  updateRecommendations,
  getRecommendedPosts,
  getPersonalizedRecommendations,
  getCategoryRecommendations,
  getTagRecommendations,
  type RecommendationScore
} from '../contentRecommender'
import { blog_data } from '@/data/InnerBlogData'

describe('contentRecommender', () => {
  const mockPosts = [
    {
      id: 1,
      thumb: '',
      title: 'Post 1',
      desc: 'Description 1',
      date: '2024-01-01',
      user: 'Author 1',
      tagId: 1,
      categoryId: 1,
      category: 'Category 1',
      status: 'published' as const,
      viewCount: 1000,
      engagementScore: 80,
      shareCount: 50
    },
    {
      id: 2,
      thumb: '',
      title: 'Post 2',
      desc: 'Description 2',
      date: '2024-01-02',
      user: 'Author 2',
      tagId: 1,
      categoryId: 1,
      category: 'Category 1',
      status: 'published' as const,
      viewCount: 800,
      engagementScore: 70,
      shareCount: 40
    },
    {
      id: 3,
      thumb: '',
      title: 'Post 3',
      desc: 'Description 3',
      date: '2024-01-03',
      user: 'Author 3',
      tagId: 2,
      categoryId: 2,
      category: 'Category 2',
      status: 'published' as const,
      viewCount: 600,
      engagementScore: 60,
      shareCount: 30
    }
  ]

  describe('calculateContentSimilarity', () => {
    it('should return 0 for same post', () => {
      const similarity = calculateContentSimilarity(mockPosts[0], mockPosts[0])

      expect(similarity).toBe(0)
    })

    it('should return 0.5 for matching category only', () => {
      const postA = { ...mockPosts[0], categoryId: 1, tagId: 1 }
      const postB = { ...mockPosts[1], categoryId: 1, tagId: 2 }

      const similarity = calculateContentSimilarity(postA, postB)

      expect(similarity).toBe(0.5)
    })

    it('should return 0.5 for matching tag only', () => {
      const postA = { ...mockPosts[0], categoryId: 1, tagId: 1 }
      const postB = { ...mockPosts[1], categoryId: 2, tagId: 1 }

      const similarity = calculateContentSimilarity(postA, postB)

      expect(similarity).toBe(0.5)
    })

    it('should return 1.0 for matching both category and tag', () => {
      const postA = { ...mockPosts[0], categoryId: 1, tagId: 1 }
      const postB = { ...mockPosts[1], categoryId: 1, tagId: 1 }

      const similarity = calculateContentSimilarity(postA, postB)

      expect(similarity).toBe(1)
    })

    it('should return 0 for no matches', () => {
      const postA = { ...mockPosts[0], categoryId: 1, tagId: 1 }
      const postB = { ...mockPosts[1], categoryId: 2, tagId: 2 }

      const similarity = calculateContentSimilarity(postA, postB)

      expect(similarity).toBe(0)
    })
  })

  describe('calculateJaccardSimilarity', () => {
    it('should return 0 for empty sets', () => {
      const similarity = calculateJaccardSimilarity(new Set(), new Set())

      expect(similarity).toBe(0)
    })

    it('should return 1 for identical sets', () => {
      const setA = new Set([1, 2, 3])
      const setB = new Set([1, 2, 3])

      const similarity = calculateJaccardSimilarity(setA, setB)

      expect(similarity).toBe(1)
    })

    it('should return 0.5 for sets with 50% overlap', () => {
      const setA = new Set([1, 2, 3, 4])
      const setB = new Set([3, 4, 5, 6])

      const similarity = calculateJaccardSimilarity(setA, setB)

      expect(similarity).toBe(0.5)
    })

    it('should return 0 for disjoint sets', () => {
      const setA = new Set([1, 2, 3])
      const setB = new Set([4, 5, 6])

      const similarity = calculateJaccardSimilarity(setA, setB)

      expect(similarity).toBe(0)
    })

    it('should handle single-element sets', () => {
      const setA = new Set([1])
      const setB = new Set([1, 2])

      const similarity = calculateJaccardSimilarity(setA, setB)

      expect(similarity).toBe(0.5)
    })
  })

  describe('extractPreferences', () => {
    it('should extract categories and tags from history', () => {
      const history = [
        { postId: 1, title: 'Post 1', tagId: 1, categoryId: 1, timestamp: '2024-01-01' },
        { postId: 2, title: 'Post 2', tagId: 2, categoryId: 2, timestamp: '2024-01-02' },
        { postId: 3, title: 'Post 3', tagId: 1, categoryId: 1, timestamp: '2024-01-03' }
      ]

      const preferences = extractPreferences(history)

      expect(preferences.categories).toEqual(new Set([1, 2]))
      expect(preferences.tags).toEqual(new Set([1, 2]))
    })

    it('should handle empty history', () => {
      const preferences = extractPreferences([])

      expect(preferences.categories).toEqual(new Set())
      expect(preferences.tags).toEqual(new Set())
    })

    it('should deduplicate categories and tags', () => {
      const history = [
        { postId: 1, title: 'Post 1', tagId: 1, categoryId: 1, timestamp: '2024-01-01' },
        { postId: 2, title: 'Post 2', tagId: 1, categoryId: 1, timestamp: '2024-01-02' },
        { postId: 3, title: 'Post 3', tagId: 1, categoryId: 1, timestamp: '2024-01-03' }
      ]

      const preferences = extractPreferences(history)

      expect(preferences.categories).toEqual(new Set([1]))
      expect(preferences.tags).toEqual(new Set([1]))
    })
  })

  describe('generateRecommendations', () => {
    it('should return trending posts when history is empty', () => {
      const recommendations = generateRecommendations([])

      expect(recommendations.length).toBeGreaterThan(0)
    })

    it('should exclude viewed posts when excludeViewed is true', () => {
      const history = [
        { postId: 1, title: 'Post 1', tagId: 1, categoryId: 1, timestamp: '2024-01-01' }
      ]

      const recommendations = generateRecommendations(history, { excludeViewed: true })

      expect(recommendations.every(rec => rec.postId !== 1)).toBe(true)
    })

    it('should include viewed posts when excludeViewed is false', () => {
      const history = [
        { postId: 1, title: 'Post 1', tagId: 1, categoryId: 1, timestamp: '2024-01-01' }
      ]

      const recommendations = generateRecommendations(history, { excludeViewed: false })

      expect(recommendations.some(rec => rec.postId === 1)).toBe(true)
    })

    it('should filter out draft posts', () => {
      const history = [
        { postId: 1, title: 'Post 1', tagId: 1, categoryId: 1, timestamp: '2024-01-01' }
      ]

      const recommendations = generateRecommendations(history)

      expect(recommendations.every(rec => {
        const post = blog_data.find(p => p.id === rec.postId)
        return post?.status !== 'draft'
      })).toBe(true)
    })

    it('should return recommendations sorted by score', () => {
      const history = [
        { postId: 1, title: 'Post 1', tagId: 1, categoryId: 1, timestamp: '2024-01-01' },
        { postId: 2, title: 'Post 2', tagId: 2, categoryId: 2, timestamp: '2024-01-02' }
      ]

      const recommendations = generateRecommendations(history)

      for (let i = 1; i < recommendations.length; i++) {
        expect(recommendations[i - 1].score).toBeGreaterThanOrEqual(recommendations[i].score)
      }
    })

    it('should respect maxResults limit', () => {
      const history = [
        { postId: 1, title: 'Post 1', tagId: 1, categoryId: 1, timestamp: '2024-01-01' }
      ]

      const recommendations = generateRecommendations(history, { maxResults: 5 })

      expect(recommendations.length).toBeLessThanOrEqual(5)
    })

    it('should filter by minScore', () => {
      const history = [
        { postId: 1, title: 'Post 1', tagId: 1, categoryId: 1, timestamp: '2024-01-01' }
      ]

      const recommendations = generateRecommendations(history, { minScore: 0.5 })

      expect(recommendations.every(rec => rec.score >= 0.5)).toBe(true)
    })

    it('should include reasons for recommendations', () => {
      const history = [
        { postId: 1, title: 'Post 1', tagId: 1, categoryId: 1, timestamp: '2024-01-01' }
      ]

      const recommendations = generateRecommendations(history)

      recommendations.forEach(rec => {
        expect(rec.reasons).toBeDefined()
        expect(Array.isArray(rec.reasons)).toBe(true)
      })
    })
  })

  describe('getTrendingPosts', () => {
    it('should return trending posts sorted by score', () => {
      const trending = getTrendingPosts(5)

      expect(trending.length).toBeGreaterThan(0)
      expect(trending.length).toBeLessThanOrEqual(5)

      for (let i = 1; i < trending.length; i++) {
        expect(trending[i - 1].score).toBeGreaterThanOrEqual(trending[i].score)
      }
    })

    it('should only include published posts', () => {
      const trending = getTrendingPosts()

      expect(trending.every(rec => {
        const post = blog_data.find(p => p.id === rec.postId)
        return post?.status === 'published'
      })).toBe(true)
    })

    it('should include reasons for trending posts', () => {
      const trending = getTrendingPosts()

      trending.forEach(rec => {
        expect(rec.reasons).toBeDefined()
        expect(Array.isArray(rec.reasons)).toBe(true)
      })
    })

    it('should respect limit parameter', () => {
      const trending = getTrendingPosts(3)

      expect(trending.length).toBeLessThanOrEqual(3)
    })
  })

  describe('calculateRecencyScore', () => {
    it('should return high score for recent posts (less than 7 days)', () => {
      const recentPost = { ...mockPosts[0], date: new Date().toISOString() }

      const score = calculateRecencyScore(recentPost)

      expect(score).toBe(0.3)
    })

    it('should return medium score for posts from 7-14 days ago', () => {
      const post = {
        ...mockPosts[0],
        date: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000).toISOString()
      }

      const score = calculateRecencyScore(post)

      expect(score).toBe(0.2)
    })

    it('should return low score for posts from 14-30 days ago', () => {
      const post = {
        ...mockPosts[0],
        date: new Date(Date.now() - 20 * 24 * 60 * 60 * 1000).toISOString()
      }

      const score = calculateRecencyScore(post)

      expect(score).toBe(0.1)
    })

    it('should return 0 for posts older than 30 days', () => {
      const oldPost = {
        ...mockPosts[0],
        date: new Date(Date.now() - 40 * 24 * 60 * 60 * 1000).toISOString()
      }

      const score = calculateRecencyScore(oldPost)

      expect(score).toBe(0)
    })
  })

  describe('updateRecommendations', () => {
    it('should exclude current post from recommendations', () => {
      const history = [
        { postId: 1, title: 'Post 1', tagId: 1, categoryId: 1, timestamp: '2024-01-01' },
        { postId: 2, title: 'Post 2', tagId: 2, categoryId: 2, timestamp: '2024-01-02' }
      ]

      const recommendations = updateRecommendations(history, 1)

      expect(recommendations.every(rec => rec.postId !== 1)).toBe(true)
    })

    it('should use filtered history for recommendations', () => {
      const history = [
        { postId: 1, title: 'Post 1', tagId: 1, categoryId: 1, timestamp: '2024-01-01' },
        { postId: 2, title: 'Post 2', tagId: 2, categoryId: 2, timestamp: '2024-01-02' },
        { postId: 3, title: 'Post 3', tagId: 1, categoryId: 1, timestamp: '2024-01-03' }
      ]

      const originalRecs = generateRecommendations(history)
      const updatedRecs = updateRecommendations(history, 1)

      expect(updatedRecs).not.toEqual(originalRecs)
    })
  })

  describe('getRecommendedPosts', () => {
    it('should return blog posts for recommendation scores', () => {
      const recommendations: RecommendationScore[] = [
        { postId: 1, score: 0.8, reasons: ['Category match'] },
        { postId: 2, score: 0.6, reasons: ['Tag match'] }
      ]

      const posts = getRecommendedPosts(recommendations)

      expect(posts).toHaveLength(2)
      expect(posts.every(p => p.id !== undefined)).toBe(true)
    })

    it('should filter out undefined posts', () => {
      const recommendations: RecommendationScore[] = [
        { postId: 1, score: 0.8, reasons: ['Category match'] },
        { postId: 999, score: 0.6, reasons: ['Tag match'] }
      ]

      const posts = getRecommendedPosts(recommendations)

      expect(posts.length).toBeLessThanOrEqual(recommendations.length)
    })

    it('should return empty array for empty recommendations', () => {
      const posts = getRecommendedPosts([])

      expect(posts).toEqual([])
    })
  })

  describe('getPersonalizedRecommendations', () => {
    it('should return posts and scores for reading history', () => {
      const history = [
        { postId: 1, title: 'Post 1', tagId: 1, categoryId: 1, timestamp: '2024-01-01' }
      ]

      const { posts, scores } = getPersonalizedRecommendations(history)

      expect(posts.length).toBeGreaterThan(0)
      expect(scores.length).toBeGreaterThan(0)
      expect(posts.length).toBe(scores.length)
    })

    it('should return trending posts for empty history', () => {
      const { posts, scores } = getPersonalizedRecommendations([])

      expect(posts.length).toBeGreaterThan(0)
      expect(scores.length).toBeGreaterThan(0)
    })

    it('should include config parameter', () => {
      const history = [
        { postId: 1, title: 'Post 1', tagId: 1, categoryId: 1, timestamp: '2024-01-01' }
      ]

      const { scores } = getPersonalizedRecommendations(history, { maxResults: 5 })

      expect(scores.length).toBeLessThanOrEqual(5)
    })
  })

  describe('getCategoryRecommendations', () => {
    it('should return posts from specified category', () => {
      const posts = getCategoryRecommendations(1, 5)

      expect(posts.every(post => post.categoryId === 1)).toBe(true)
      expect(posts.length).toBeLessThanOrEqual(5)
    })

    it('should return posts sorted by view count', () => {
      const posts = getCategoryRecommendations(1, 10)

      for (let i = 1; i < posts.length; i++) {
        expect((posts[i - 1].viewCount || 0)).toBeGreaterThanOrEqual(posts[i].viewCount || 0)
      }
    })

    it('should only return published posts', () => {
      const posts = getCategoryRecommendations(1)

      expect(posts.every(post => post.status === 'published')).toBe(true)
    })

    it('should return empty array for non-existent category', () => {
      const posts = getCategoryRecommendations(999)

      expect(posts).toEqual([])
    })

    it('should respect limit parameter', () => {
      const posts = getCategoryRecommendations(1, 3)

      expect(posts.length).toBeLessThanOrEqual(3)
    })
  })

  describe('getTagRecommendations', () => {
    it('should return posts with specified tag', () => {
      const posts = getTagRecommendations(1, 5)

      expect(posts.every(post => post.tagId === 1)).toBe(true)
      expect(posts.length).toBeLessThanOrEqual(5)
    })

    it('should return posts sorted by view count', () => {
      const posts = getTagRecommendations(1, 10)

      for (let i = 1; i < posts.length; i++) {
        expect((posts[i - 1].viewCount || 0)).toBeGreaterThanOrEqual(posts[i].viewCount || 0)
      }
    })

    it('should only return published posts', () => {
      const posts = getTagRecommendations(1)

      expect(posts.every(post => post.status === 'published')).toBe(true)
    })

    it('should return empty array for non-existent tag', () => {
      const posts = getTagRecommendations(999)

      expect(posts).toEqual([])
    })

    it('should respect limit parameter', () => {
      const posts = getTagRecommendations(1, 3)

      expect(posts.length).toBeLessThanOrEqual(3)
    })
  })
})
