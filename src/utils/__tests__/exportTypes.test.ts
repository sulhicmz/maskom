import { describe, it, expect } from '@jest/globals'
import { getFilterMetadataText } from '../exportTypes'
import type { BlogFilterCriteria } from '../blogFilters'

describe('getFilterMetadataText', () => {
  describe('Happy Path', () => {
    it('should return search query when searchQuery filter is provided', () => {
      const filters: Partial<BlogFilterCriteria> = { searchQuery: 'test search' }
      const result = getFilterMetadataText(filters)
      
      expect(result).toEqual(['Search: "test search"'])
    })

    it('should return category name when categoryId filter is provided', () => {
      const filters: Partial<BlogFilterCriteria> = { categoryId: 1 }
      const result = getFilterMetadataText(filters)
      
      expect(result).toHaveLength(1)
      expect(result[0]).toContain('Category:')
    })

    it('should return tag name when tagId filter is provided', () => {
      const filters: Partial<BlogFilterCriteria> = { tagId: 1 }
      const result = getFilterMetadataText(filters)
      
      expect(result).toHaveLength(1)
      expect(result[0]).toContain('Tag:')
    })

    it('should return status when status filter is provided', () => {
      const filters: Partial<BlogFilterCriteria> = { status: 'published' }
      const result = getFilterMetadataText(filters)
      
      expect(result).toEqual(['Status: published'])
    })

    it('should return multiple filters when multiple criteria are provided', () => {
      const filters: Partial<BlogFilterCriteria> = {
        searchQuery: 'keyword',
        categoryId: 1,
        tagId: 1,
        status: 'published'
      }
      const result = getFilterMetadataText(filters)
      
      expect(result).toHaveLength(4)
      expect(result).toContain('Search: "keyword"')
      expect(result).toContain('Status: published')
    })

    it('should preserve filter order in returned array', () => {
      const filters: Partial<BlogFilterCriteria> = {
        searchQuery: 'first',
        categoryId: 1,
        tagId: 2,
        status: 'published'
      }
      const result = getFilterMetadataText(filters)
      
      expect(result[0]).toContain('Search:')
      expect(result[1]).toContain('Category:')
      expect(result[2]).toContain('Tag:')
      expect(result[3]).toContain('Status:')
    })
  })

  describe('Sad Path', () => {
    it('should return empty array when no filters provided', () => {
      const filters: Partial<BlogFilterCriteria> = {}
      const result = getFilterMetadataText(filters)
      
      expect(result).toEqual([])
    })

    it('should skip undefined categoryId', () => {
      const filters: Partial<BlogFilterCriteria> = { categoryId: undefined }
      const result = getFilterMetadataText(filters)
      
      expect(result).toEqual([])
    })

    it('should skip undefined tagId', () => {
      const filters: Partial<BlogFilterCriteria> = { tagId: undefined }
      const result = getFilterMetadataText(filters)
      
      expect(result).toEqual([])
    })

    it('should skip undefined searchQuery', () => {
      const filters: Partial<BlogFilterCriteria> = { searchQuery: undefined }
      const result = getFilterMetadataText(filters)
      
      expect(result).toEqual([])
    })

    it('should skip undefined status', () => {
      const filters: Partial<BlogFilterCriteria> = { status: undefined }
      const result = getFilterMetadataText(filters)
      
      expect(result).toEqual([])
    })

    it('should handle invalid categoryId (non-existent category)', () => {
      const filters: Partial<BlogFilterCriteria> = { categoryId: 99999 }
      const result = getFilterMetadataText(filters)
      
      expect(result).toHaveLength(0)
    })

    it('should handle invalid tagId (non-existent tag)', () => {
      const filters: Partial<BlogFilterCriteria> = { tagId: 99999 }
      const result = getFilterMetadataText(filters)
      
      expect(result).toHaveLength(0)
    })
  })

  describe('Edge Cases', () => {
    it('should handle empty string searchQuery', () => {
      const filters: Partial<BlogFilterCriteria> = { searchQuery: '' }
      const result = getFilterMetadataText(filters)
      
      expect(result).toEqual([])
    })

    it('should handle special characters in searchQuery', () => {
      const filters: Partial<BlogFilterCriteria> = { searchQuery: 'test <script>alert("xss")</script>' }
      const result = getFilterMetadataText(filters)
      
      expect(result).toEqual(['Search: "test <script>alert("xss")</script>"'])
    })

    it('should handle unicode characters in searchQuery', () => {
      const filters: Partial<BlogFilterCriteria> = { searchQuery: 'test 你好 العربية 🎉' }
      const result = getFilterMetadataText(filters)
      
      expect(result).toEqual(['Search: "test 你好 العربية 🎉"'])
    })

    it('should handle very long searchQuery', () => {
      const longQuery = 'a'.repeat(1000)
      const filters: Partial<BlogFilterCriteria> = { searchQuery: longQuery }
      const result = getFilterMetadataText(filters)
      
      expect(result).toHaveLength(1)
      expect(result[0]).toContain('Search:')
    })

    it('should handle whitespace-only searchQuery', () => {
      const filters: Partial<BlogFilterCriteria> = { searchQuery: '   ' }
      const result = getFilterMetadataText(filters)
      
      expect(result).toEqual(['Search: "   "'])
    })

    it('should handle numeric string status', () => {
      const filters: Partial<BlogFilterCriteria> = { status: 'draft' as any }
      const result = getFilterMetadataText(filters)
      
      expect(result).toEqual(['Status: draft'])
    })
  })

  describe('Boundary Conditions', () => {
    it('should handle categoryId of 0', () => {
      const filters: Partial<BlogFilterCriteria> = { categoryId: 0 }
      const result = getFilterMetadataText(filters)
      
      expect(result).toHaveLength(0)
    })

    it('should handle tagId of 0', () => {
      const filters: Partial<BlogFilterCriteria> = { tagId: 0 }
      const result = getFilterMetadataText(filters)
      
      expect(result).toHaveLength(0)
    })

    it('should handle negative categoryId', () => {
      const filters: Partial<BlogFilterCriteria> = { categoryId: -1 }
      const result = getFilterMetadataText(filters)
      
      expect(result).toHaveLength(0)
    })

    it('should handle negative tagId', () => {
      const filters: Partial<BlogFilterCriteria> = { tagId: -1 }
      const result = getFilterMetadataText(filters)
      
      expect(result).toHaveLength(0)
    })
  })
})
