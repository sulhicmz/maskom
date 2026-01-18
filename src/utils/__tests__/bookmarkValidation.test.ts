import { validateBookmark, validatePostId } from '../bookmarkValidation'

interface Bookmark {
  id: string
  postId: string
  postTitle: string
  postSlug?: string
  postCategory?: string
  postTags?: string[]
  createdAt: string
}

describe('bookmarkValidation', () => {
  describe('validateBookmark', () => {
    it('should return valid for a complete bookmark with all fields', () => {
      const bookmark: Bookmark = {
        id: 'test-post-123-1705512345678',
        postId: 'test-post-123',
        postTitle: 'Test Post Title',
        postSlug: 'test-post-slug',
        postCategory: 'Technology',
        postTags: ['tag1', 'tag2', 'tag3'],
        createdAt: '2026-01-17T12:30:00.000Z'
      }

      const result = validateBookmark(bookmark)

      expect(result.valid).toBe(true)
      expect(result.errors).toEqual([])
    })

    it('should return valid for a minimal bookmark with only required fields', () => {
      const bookmark: Bookmark = {
        id: 'test-post-123-1705512345678',
        postId: 'test-post-123',
        postTitle: 'Test Post Title',
        createdAt: '2026-01-17T12:30:00.000Z'
      }

      const result = validateBookmark(bookmark)

      expect(result.valid).toBe(true)
      expect(result.errors).toEqual([])
    })

    it('should return invalid when id is missing', () => {
      const bookmark = {
        postId: 'test-post-123',
        postTitle: 'Test Post Title',
        createdAt: '2026-01-17T12:30:00.000Z'
      } as unknown as Bookmark

      const result = validateBookmark(bookmark)

      expect(result.valid).toBe(false)
      expect(result.errors).toContain('Bookmark must have a valid id')
    })

    it('should return invalid when id is empty string', () => {
      const bookmark = {
        id: '',
        postId: 'test-post-123',
        postTitle: 'Test Post Title',
        createdAt: '2026-01-17T12:30:00.000Z'
      } as unknown as Bookmark

      const result = validateBookmark(bookmark)

      expect(result.valid).toBe(false)
      expect(result.errors).toContain('Bookmark must have a valid id')
    })

    it('should return invalid when id is not a string', () => {
      const bookmark = {
        id: 123 as unknown as string,
        postId: 'test-post-123',
        postTitle: 'Test Post Title',
        createdAt: '2026-01-17T12:30:00.000Z'
      } as unknown as Bookmark

      const result = validateBookmark(bookmark)

      expect(result.valid).toBe(false)
      expect(result.errors).toContain('Bookmark must have a valid id')
    })

    it('should return invalid when postId is missing', () => {
      const bookmark = {
        id: 'test-post-123-1705512345678',
        postTitle: 'Test Post Title',
        createdAt: '2026-01-17T12:30:00.000Z'
      } as unknown as Bookmark

      const result = validateBookmark(bookmark)

      expect(result.valid).toBe(false)
      expect(result.errors).toContain('Bookmark must have a valid postId')
    })

    it('should return invalid when postId is empty string', () => {
      const bookmark = {
        id: 'test-post-123-1705512345678',
        postId: '',
        postTitle: 'Test Post Title',
        createdAt: '2026-01-17T12:30:00.000Z'
      } as unknown as Bookmark

      const result = validateBookmark(bookmark)

      expect(result.valid).toBe(false)
      expect(result.errors).toContain('Bookmark must have a valid postId')
    })

    it('should return invalid when postId is not a string', () => {
      const bookmark = {
        id: 'test-post-123-1705512345678',
        postId: 123 as unknown as string,
        postTitle: 'Test Post Title',
        createdAt: '2026-01-17T12:30:00.000Z'
      } as unknown as Bookmark

      const result = validateBookmark(bookmark)

      expect(result.valid).toBe(false)
      expect(result.errors).toContain('Bookmark must have a valid postId')
    })

    it('should return invalid when postTitle is missing', () => {
      const bookmark = {
        id: 'test-post-123-1705512345678',
        postId: 'test-post-123',
        createdAt: '2026-01-17T12:30:00.000Z'
      } as unknown as Bookmark

      const result = validateBookmark(bookmark)

      expect(result.valid).toBe(false)
      expect(result.errors).toContain('Bookmark must have a valid postTitle')
    })

    it('should return invalid when postTitle is empty string', () => {
      const bookmark = {
        id: 'test-post-123-1705512345678',
        postId: 'test-post-123',
        postTitle: '',
        createdAt: '2026-01-17T12:30:00.000Z'
      } as unknown as Bookmark

      const result = validateBookmark(bookmark)

      expect(result.valid).toBe(false)
      expect(result.errors).toContain('Bookmark must have a valid postTitle')
    })

    it('should return invalid when postTitle is not a string', () => {
      const bookmark = {
        id: 'test-post-123-1705512345678',
        postId: 'test-post-123',
        postTitle: 123 as unknown as string,
        createdAt: '2026-01-17T12:30:00.000Z'
      } as unknown as Bookmark

      const result = validateBookmark(bookmark)

      expect(result.valid).toBe(false)
      expect(result.errors).toContain('Bookmark must have a valid postTitle')
    })

    it('should return invalid when postSlug is not a string', () => {
      const bookmark = {
        id: 'test-post-123-1705512345678',
        postId: 'test-post-123',
        postTitle: 'Test Post Title',
        postSlug: 123 as unknown as string,
        createdAt: '2026-01-17T12:30:00.000Z'
      } as unknown as Bookmark

      const result = validateBookmark(bookmark)

      expect(result.valid).toBe(false)
      expect(result.errors).toContain('postSlug must be a string if provided')
    })

    it('should return valid when postSlug is valid string', () => {
      const bookmark: Bookmark = {
        id: 'test-post-123-1705512345678',
        postId: 'test-post-123',
        postTitle: 'Test Post Title',
        postSlug: 'test-post-slug',
        createdAt: '2026-01-17T12:30:00.000Z'
      }

      const result = validateBookmark(bookmark)

      expect(result.valid).toBe(true)
      expect(result.errors).toEqual([])
    })

    it('should return invalid when postCategory is not a string', () => {
      const bookmark = {
        id: 'test-post-123-1705512345678',
        postId: 'test-post-123',
        postTitle: 'Test Post Title',
        postCategory: 123 as unknown as string,
        createdAt: '2026-01-17T12:30:00.000Z'
      } as unknown as Bookmark

      const result = validateBookmark(bookmark)

      expect(result.valid).toBe(false)
      expect(result.errors).toContain('postCategory must be a string if provided')
    })

    it('should return valid when postCategory is valid string', () => {
      const bookmark: Bookmark = {
        id: 'test-post-123-1705512345678',
        postId: 'test-post-123',
        postTitle: 'Test Post Title',
        postCategory: 'Technology',
        createdAt: '2026-01-17T12:30:00.000Z'
      }

      const result = validateBookmark(bookmark)

      expect(result.valid).toBe(true)
      expect(result.errors).toEqual([])
    })

    it('should return invalid when postTags is not an array', () => {
      const bookmark = {
        id: 'test-post-123-1705512345678',
        postId: 'test-post-123',
        postTitle: 'Test Post Title',
        postTags: 'tag1' as unknown as string[],
        createdAt: '2026-01-17T12:30:00.000Z'
      } as unknown as Bookmark

      const result = validateBookmark(bookmark)

      expect(result.valid).toBe(false)
      expect(result.errors).toContain('postTags must be an array if provided')
    })

    it('should return valid when postTags is valid array', () => {
      const bookmark: Bookmark = {
        id: 'test-post-123-1705512345678',
        postId: 'test-post-123',
        postTitle: 'Test Post Title',
        postTags: ['tag1', 'tag2', 'tag3'],
        createdAt: '2026-01-17T12:30:00.000Z'
      }

      const result = validateBookmark(bookmark)

      expect(result.valid).toBe(true)
      expect(result.errors).toEqual([])
    })

    it('should return valid when postTags is empty array', () => {
      const bookmark: Bookmark = {
        id: 'test-post-123-1705512345678',
        postId: 'test-post-123',
        postTitle: 'Test Post Title',
        postTags: [],
        createdAt: '2026-01-17T12:30:00.000Z'
      }

      const result = validateBookmark(bookmark)

      expect(result.valid).toBe(true)
      expect(result.errors).toEqual([])
    })

    it('should return invalid when createdAt is missing', () => {
      const bookmark = {
        id: 'test-post-123-1705512345678',
        postId: 'test-post-123',
        postTitle: 'Test Post Title'
      } as unknown as Bookmark

      const result = validateBookmark(bookmark)

      expect(result.valid).toBe(false)
      expect(result.errors).toContain('Bookmark must have a valid createdAt timestamp')
    })

    it('should return invalid when createdAt is not a string', () => {
      const bookmark = {
        id: 'test-post-123-1705512345678',
        postId: 'test-post-123',
        postTitle: 'Test Post Title',
        createdAt: 123 as unknown as string
      } as unknown as Bookmark

      const result = validateBookmark(bookmark)

      expect(result.valid).toBe(false)
      expect(result.errors).toContain('Bookmark must have a valid createdAt timestamp')
    })

    it('should return invalid when createdAt is invalid ISO date', () => {
      const bookmark = {
        id: 'test-post-123-1705512345678',
        postId: 'test-post-123',
        postTitle: 'Test Post Title',
        createdAt: 'not-a-valid-date'
      } as unknown as Bookmark

      const result = validateBookmark(bookmark)

      expect(result.valid).toBe(false)
      expect(result.errors).toContain('createdAt must be a valid ISO date string')
    })

    it('should return valid when createdAt is valid ISO date with timezone', () => {
      const bookmark: Bookmark = {
        id: 'test-post-123-1705512345678',
        postId: 'test-post-123',
        postTitle: 'Test Post Title',
        createdAt: '2026-01-17T12:30:00+07:00'
      }

      const result = validateBookmark(bookmark)

      expect(result.valid).toBe(true)
      expect(result.errors).toEqual([])
    })

    it('should return valid when createdAt is valid ISO date with milliseconds', () => {
      const bookmark: Bookmark = {
        id: 'test-post-123-1705512345678',
        postId: 'test-post-123',
        postTitle: 'Test Post Title',
        createdAt: '2026-01-17T12:30:00.123Z'
      }

      const result = validateBookmark(bookmark)

      expect(result.valid).toBe(true)
      expect(result.errors).toEqual([])
    })

    it('should return multiple errors when multiple fields are invalid', () => {
      const bookmark = {
        id: '',
        postId: '',
        postTitle: '',
        createdAt: 'invalid-date'
      } as unknown as Bookmark

      const result = validateBookmark(bookmark)

      expect(result.valid).toBe(false)
      expect(result.errors.length).toBeGreaterThan(1)
      expect(result.errors).toContain('Bookmark must have a valid id')
      expect(result.errors).toContain('Bookmark must have a valid postId')
      expect(result.errors).toContain('Bookmark must have a valid postTitle')
      expect(result.errors).toContain('createdAt must be a valid ISO date string')
    })
  })

  describe('validatePostId', () => {
    it('should return true for valid post ID', () => {
      expect(validatePostId('test-post-123')).toBe(true)
    })

    it('should return true for post ID with numbers', () => {
      expect(validatePostId('123')).toBe(true)
    })

    it('should return true for post ID with special characters', () => {
      expect(validatePostId('post_with-underscores')).toBe(true)
    })

    it('should return false for empty string', () => {
      expect(validatePostId('')).toBe(false)
    })

    it('should return false for whitespace only', () => {
      expect(validatePostId('   ')).toBe(false)
    })

    it('should return true for post ID with surrounding whitespace (trimmed)', () => {
      expect(validatePostId('  test-post-123  ')).toBe(true)
    })

    it('should return false for null', () => {
      expect(validatePostId(null as unknown as string)).toBe(false)
    })

    it('should return false for undefined', () => {
      expect(validatePostId(undefined as unknown as string)).toBe(false)
    })

    it('should return false for non-string type', () => {
      expect(validatePostId(123 as unknown as string)).toBe(false)
    })
  })
})
