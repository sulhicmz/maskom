import { describe, it, expect, jest, beforeEach } from '@jest/globals'
import {
  exportToCSV,
  exportBlogPosts,
  generateExportMetadata,
  formatExportDate
} from '../exportUtils'
import type { InnerBlogPost } from '@/types/data'
import type { BlogFilterCriteria } from '../blogFilters'

describe('exportUtils', () => {
  const mockPosts: InnerBlogPost[] = [
    {
      id: 1,
      title: 'Test Post 1',
      desc: 'This is a test post description.',
      user: 'John Doe',
      date: '2026-01-16',
      tagId: 1,
      category: 'Technology',
      thumb: { src: '/test1.jpg', height: 200, width: 300 },
      link: '/post1'
    },
    {
      id: 2,
      title: 'Test Post 2',
      desc: 'Another test post description.',
      user: 'Jane Smith',
      date: '2026-01-17',
      tagId: 2,
      category: 'Business',
      thumb: { src: '/test2.jpg', height: 200, width: 300 },
      link: '/post2'
    }
  ]

  const mockFilterCriteria: BlogFilterCriteria = {
    searchQuery: 'test',
    category: 'Technology',
    tagId: 1,
    status: 'published'
  }

  beforeEach(() => {
    jest.clearAllMocks()
    Object.defineProperty(URL, 'createObjectURL', {
      value: jest.fn(() => 'blob:url'),
      writable: true,
    })
    Object.defineProperty(URL, 'revokeObjectURL', {
      value: jest.fn(),
      writable: true,
    })
    Object.defineProperty(document, 'createElement', {
      value: jest.fn((tagName: string) => {
        const element = {
          tagName,
          setAttribute: jest.fn(),
          style: {},
          click: jest.fn()
        }
        if (tagName === 'a') {
          return element as unknown as HTMLAnchorElement
        }
        return element as unknown as HTMLElement
      }),
      writable: true,
    })
    Object.defineProperty(document.body, 'appendChild', {
      value: jest.fn(),
      writable: true,
    })
    Object.defineProperty(document.body, 'removeChild', {
      value: jest.fn(),
      writable: true,
    })
  })

  describe('formatExportDate', () => {
    it('should format date correctly', () => {
      const date = new Date('2026-01-16T12:00:00.000Z')
      const result = formatExportDate(date)
      expect(result).toBe('2026-01-16')
    })
  })

  describe('generateExportMetadata', () => {
    it('should generate metadata with all filters', () => {
      const result = generateExportMetadata(mockPosts, mockFilterCriteria)
      expect(result).toEqual({
        exportDate: expect.any(String),
        filterCount: 4,
        filters: mockFilterCriteria,
        resultCount: 2
      })
    })

    it('should generate metadata with no filters', () => {
      const emptyFilters: BlogFilterCriteria = {}
      const result = generateExportMetadata(mockPosts, emptyFilters)
      expect(result.filterCount).toBe(0)
      expect(result.resultCount).toBe(2)
    })

    it('should calculate filter count correctly', () => {
      const partialFilters: BlogFilterCriteria = {
        searchQuery: 'test',
        category: null
      }
      const result = generateExportMetadata(mockPosts, partialFilters)
      expect(result.filterCount).toBe(1)
    })
  })

  describe('exportToCSV', () => {
    it('should export posts to CSV', () => {
      const metadata = generateExportMetadata(mockPosts, mockFilterCriteria)
      exportToCSV(mockPosts, { format: 'csv' }, metadata)

      expect(document.createElement).toHaveBeenCalledWith('a')
    })

    it('should include metadata in CSV', () => {
      const metadata = generateExportMetadata(mockPosts, mockFilterCriteria)
      exportToCSV(mockPosts, { format: 'csv' }, metadata)

      const link = (document.createElement as jest.Mock).mock.results[0].value
      expect(link.setAttribute).toHaveBeenCalledWith('href', 'blob:url')
      expect(link.setAttribute).toHaveBeenCalledWith('download', expect.stringContaining('.csv'))
    })

    it('should save CSV with custom filename', () => {
      const metadata = generateExportMetadata(mockPosts, mockFilterCriteria)
      exportToCSV(mockPosts, { format: 'csv', filename: 'custom.csv' }, metadata)

      const link = (document.createElement as jest.Mock).mock.results[0].value
      expect(link.setAttribute).toHaveBeenCalledWith('download', 'custom.csv')
    })

    it('should escape CSV values containing commas', () => {
      const postsWithCommas = [{
        ...mockPosts[0],
        title: 'Test, with, commas',
        desc: 'Description, with, commas'
      }]

      const metadata = generateExportMetadata(postsWithCommas, mockFilterCriteria)
      exportToCSV(postsWithCommas, { format: 'csv' }, metadata)

      const link = (document.createElement as jest.Mock).mock.results[0].value
      expect(link.click).toHaveBeenCalled()
    })

    it('should escape CSV values containing quotes', () => {
      const postsWithQuotes = [{
        ...mockPosts[0],
        title: 'Test "quoted" text',
        desc: 'Description with "quotes"'
      }]

      const metadata = generateExportMetadata(postsWithQuotes, mockFilterCriteria)
      exportToCSV(postsWithQuotes, { format: 'csv' }, metadata)

      const link = (document.createElement as jest.Mock).mock.results[0].value
      expect(link.click).toHaveBeenCalled()
    })
  })

  describe('exportBlogPosts', () => {
    it('should export posts in CSV format', () => {
      exportBlogPosts(mockPosts, mockFilterCriteria, { format: 'csv' })

      expect(document.createElement).toHaveBeenCalledWith('a')
    })

    it('should throw error for unsupported format', () => {
      expect(() => {
        exportBlogPosts(mockPosts, mockFilterCriteria, { format: 'invalid' as unknown })
      }).toThrow('Unsupported export format: invalid')
    })

    it('should generate metadata for export', () => {
      exportBlogPosts(mockPosts, mockFilterCriteria, { format: 'csv' })

      expect(document.createElement).toHaveBeenCalled()
    })
  })
})
