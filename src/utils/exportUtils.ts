import type { InnerBlogPost } from '@/types/data'
import type { BlogFilterCriteria } from './blogFilters'
import type { ExportConfig, ExportMetadata } from './exportTypes'
import { generateExportMetadata, getFilterMetadataText, formatExportDate } from './exportTypes'
import { tagsById } from '@/data/BlogTagData'

export type { ExportConfig, ExportMetadata }
export { generateExportMetadata, getFilterMetadataText, formatExportDate }

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
  const metadata = generateExportMetadata(posts as unknown[], filterCriteria)

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
