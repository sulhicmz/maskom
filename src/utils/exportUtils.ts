import type { InnerBlogPost } from '@/types/data'
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
  filteredPosts: InnerBlogPost[],
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

export function getFilterMetadataText(filters: BlogFilterCriteria): string[] {
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

export async function exportToPDF(
  posts: InnerBlogPost[],
  config: ExportConfig,
  metadata: ExportMetadata
): Promise<void> {
  const { exportToPDF } = await import('./exportPDF')
  await exportToPDF(posts, config, metadata)
}

export function exportToCSV(
  posts: InnerBlogPost[],
  config: ExportConfig,
  metadata: ExportMetadata
): void {
  const headers = [
    '#',
    'Title',
    'Description',
    'Author',
    'Date',
    'Category',
    'Tag'
  ]

  const metadataLines = [
    `# Blog Posts Export`,
    `# Export Date: ${metadata.exportDate}`,
    `# Total Posts: ${metadata.resultCount}`,
    `# Active Filters: ${metadata.filterCount}`
  ]

  if (metadata.filterCount > 0) {
    metadataLines.push('# Filters Applied:')

    const filterText = getFilterMetadataText(metadata.filters)
    filterText.forEach((text: string) => {
      metadataLines.push(`#   - ${text}`)
    })
  }

  metadataLines.push('')

  const escapeCSV = (value: string): string => {
    if (!value) return ''
    const strValue = value.toString()
    if (strValue.includes(',') || strValue.includes('"') || strValue.includes('\n')) {
      return `"${strValue.replace(/"/g, '""')}"`
    }
    return strValue
  }

  const rows = posts.map((post, index) => [
    index + 1,
    post.title,
    post.desc,
    post.user,
    post.date,
    post.category || '',
    post.tagId ? (tagsById.get(post.tagId)?.name || '') : ''
  ].map(item => escapeCSV(String(item))).join(','))

  const csvContent = [
    ...metadataLines,
    headers.join(','),
    ...rows
  ].join('\n')

  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' })
  const link = document.createElement('a')
  const url = URL.createObjectURL(blob)

  link.setAttribute('href', url)
  const filename = config.filename || `blog-export-${metadata.exportDate}.csv`
  link.setAttribute('download', filename)
  link.style.visibility = 'hidden'
  document.body.appendChild(link)
  link.click()
  document.body.removeChild(link)
  URL.revokeObjectURL(url)
}

export async function exportBlogPosts(
  posts: InnerBlogPost[],
  filterCriteria: BlogFilterCriteria,
  config: ExportConfig
): Promise<void> {
  const metadata = generateExportMetadata(posts, filterCriteria)

  switch (config.format) {
    case 'pdf':
      await exportToPDF(posts, config, metadata)
      break
    case 'csv':
      exportToCSV(posts, config, metadata)
      break
    default:
      throw new Error(`Unsupported export format: ${config.format}`)
  }
}
