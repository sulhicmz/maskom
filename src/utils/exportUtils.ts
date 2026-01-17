import type { InnerBlogPost } from '@/types/data'
import type { BlogFilterCriteria } from './blogFilters'
import { tagsById } from '@/data/BlogTagData'
import { blogCategoryById } from '@/data/BlogCategoryData'

interface JsPDFType {
  setFontSize: (...args: unknown[]) => void
  setFont: (...args: unknown[]) => void
  text: (...args: unknown[]) => void
  line: (...args: unknown[]) => void
  splitTextToSize: (...args: unknown[]) => string[]
  internal: {
    pageSize: {
      getWidth: (...args: unknown[]) => number
    }
  }
  addPage: (...args: unknown[]) => void
  save: (...args: unknown[]) => void
  setTextColor: (...args: unknown[]) => void
}

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

export async function exportToPDF(
  posts: InnerBlogPost[],
  config: ExportConfig,
  metadata: ExportMetadata
): Promise<void> {
  const jsPDF = (await import('jspdf')).default as unknown as new (...args: unknown[]) => JsPDFType
  const doc = new jsPDF()
  const pageWidth = doc.internal.pageSize.getWidth()
  const margin = 20
  const contentWidth = pageWidth - (margin * 2)
  let yPosition = 30

  doc.setFontSize(16)
  doc.setFont('helvetica', 'bold')
  doc.text('Blog Posts Export', pageWidth / 2, yPosition, { align: 'center' })
  yPosition += 10

  doc.setFontSize(10)
  doc.setFont('helvetica', 'normal')
  doc.text(`Export Date: ${metadata.exportDate}`, margin, yPosition)
  yPosition += 7

  doc.text(`Total Posts: ${metadata.resultCount}`, margin, yPosition)
  yPosition += 7

  if (metadata.filterCount > 0) {
    doc.text('Active Filters:', margin, yPosition)
    yPosition += 5
    doc.setFontSize(9)
    if (metadata.filters.searchQuery) {
      doc.text(`  - Search: "${metadata.filters.searchQuery}"`, margin, yPosition)
      yPosition += 5
    }
    if (metadata.filters.categoryId) {
      const categoryName = blogCategoryById.get(metadata.filters.categoryId)?.name
      if (categoryName) {
        doc.text(`  - Category: ${categoryName}`, margin, yPosition)
        yPosition += 5
      }
    }
    if (metadata.filters.tagId) {
      const tagName = tagsById.get(metadata.filters.tagId)?.name
      if (tagName) {
        doc.text(`  - Tag: ${tagName}`, margin, yPosition)
        yPosition += 5
      }
    }
    if (metadata.filters.status) {
      doc.text(`  - Status: ${metadata.filters.status}`, margin, yPosition)
      yPosition += 5
    }
    doc.setFontSize(10)
    yPosition += 5
  }

  doc.line(margin, yPosition, pageWidth - margin, yPosition)
  yPosition += 10

  posts.forEach((post, index) => {
    if (yPosition > 270) {
      doc.addPage()
      yPosition = 20
    }

    doc.setFontSize(12)
    doc.setFont('helvetica', 'bold')
    doc.text(`${index + 1}. ${post.title}`, margin, yPosition)
    yPosition += 8

    doc.setFontSize(10)
    doc.setFont('helvetica', 'normal')

    const lines = doc.splitTextToSize(post.desc, contentWidth)
    lines.forEach((line: string) => {
      doc.text(line, margin, yPosition)
      yPosition += 5
    })

    yPosition += 5
    doc.setFontSize(9)
    doc.setTextColor(100, 100, 100)
    doc.text(`Author: ${post.user} | Date: ${post.date}`, margin, yPosition)
    yPosition += 5

    if (post.tagId) {
      const tagName = tagsById.get(post.tagId)?.name
      if (tagName) {
        doc.text(`Tag: ${tagName}`, margin, yPosition)
        yPosition += 5
      }
    }

    if (post.category) {
      doc.text(`Category: ${post.category}`, margin, yPosition)
      yPosition += 5
    }

    doc.setTextColor(0, 0, 0)
    yPosition += 8
  })

  const filename = config.filename || `blog-export-${metadata.exportDate}.pdf`
  doc.save(filename)
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
    if (metadata.filters.searchQuery) {
      metadataLines.push(`#   - Search: "${metadata.filters.searchQuery}"`)
    }
    if (metadata.filters.categoryId) {
      const categoryName = blogCategoryById.get(metadata.filters.categoryId)?.name
      if (categoryName) {
        metadataLines.push(`#   - Category: ${categoryName}`)
      }
    }
    if (metadata.filters.tagId) {
      const tagName = tagsById.get(metadata.filters.tagId)?.name
      if (tagName) {
        metadataLines.push(`#   - Tag: ${tagName}`)
      }
    }
    if (metadata.filters.status) {
      metadataLines.push(`#   - Status: ${metadata.filters.status}`)
    }
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
