import type { BlogFilterCriteria } from './blogFilters'
import { tagsById } from '@/data/BlogTagData'
import { blogCategoryById } from '@/data/BlogCategoryData'

export interface ExportConfig {
  format: 'pdf' | 'csv'
  filename?: string
  includeFilters?: boolean
}

export interface ExportMetadata {
  exportDate: string
  filterCount: number
  filters: Partial<BlogFilterCriteria>
  resultCount: number
}

export function formatExportDate(date: Date): string {
  return date.toISOString().split('T')[0]
}

export function generateExportMetadata(
  filteredPosts: unknown[],
  filterCriteria: BlogFilterCriteria
): ExportMetadata {
  return {
    exportDate: formatExportDate(new Date()),
    filterCount: Number(!!filterCriteria.searchQuery) +
                  Number(!!filterCriteria.categoryId) +
                  Number(!!filterCriteria.tagId) +
                  Number(!!filterCriteria.status),
    filters: filterCriteria,
    resultCount: filteredPosts.length
  }
}

export function getFilterMetadataText(filters: Partial<BlogFilterCriteria>): string[] {
  const metadataLines: string[] = []

  if (filters.searchQuery) {
    metadataLines.push(`Search: "${filters.searchQuery}"`)
  }
  if (filters.categoryId) {
    const categoryName = blogCategoryById.get(filters.categoryId)?.name
    if (categoryName) {
      metadataLines.push(`Category: ${categoryName}`)
    }
  }
  if (filters.tagId) {
    const tagName = tagsById.get(filters.tagId)?.name
    if (tagName) {
      metadataLines.push(`Tag: ${tagName}`)
    }
  }
  if (filters.status) {
    metadataLines.push(`Status: ${filters.status}`)
  }

  return metadataLines
}
