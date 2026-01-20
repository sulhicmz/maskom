import type { InnerBlogPost } from '@/types/data'
import type { ExportConfig, ExportMetadata } from './exportTypes'
import { getFilterMetadataText } from './exportTypes'
import { tagsById } from '@/data/BlogTagData'

export async function exportToPDF(
  posts: InnerBlogPost[],
  config: ExportConfig,
  metadata: ExportMetadata
): Promise<void> {
  const jsPDF = (await import('jspdf')).default
  const doc = new jsPDF()
  const pageWidth = (doc.internal.pageSize as unknown as { getWidth: () => number }).getWidth()

  const { yPosition: startY, margin, contentWidth } = setupPDFDocument(doc, metadata, pageWidth)
  let yPosition = renderPDFMetadata(doc, metadata, margin, startY)

  posts.forEach((post, index) => {
    if (yPosition > 270) {
      doc.addPage()
      yPosition = 20
    }

    yPosition = renderPDFPost(doc, post, index, margin, contentWidth, yPosition)
  })

  const filename = config.filename || `blog-export-${metadata.exportDate}.pdf`
  doc.save(filename)
}

function setupPDFDocument(
  doc: unknown,
  metadata: ExportMetadata,
  pageWidth: number
): { yPosition: number; margin: number; contentWidth: number } {
  const typedDoc = doc as { setFontSize: (size: number) => void; setFont: (font: string, style: string) => void; text: (text: string, x: number, y: number, options?: { align?: string }) => void }
  const margin = 20
  const contentWidth = pageWidth - (margin * 2)
  let yPosition = 30

  typedDoc.setFontSize(16)
  typedDoc.setFont('helvetica', 'bold')
  typedDoc.text('Blog Posts Export', pageWidth / 2, yPosition, { align: 'center' })
  yPosition += 10

  typedDoc.setFontSize(10)
  typedDoc.setFont('helvetica', 'normal')
  typedDoc.text(`Export Date: ${metadata.exportDate}`, margin, yPosition)
  yPosition += 7

  typedDoc.text(`Total Posts: ${metadata.resultCount}`, margin, yPosition)
  yPosition += 7

  return { yPosition, margin, contentWidth }
}

function renderPDFMetadata(
  doc: unknown,
  metadata: ExportMetadata,
  margin: number,
  yPosition: number
): number {
  const typedDoc = doc as {
    setFontSize: (size: number) => void
    setFont: (font: string, style: string) => void
    text: (text: string, x: number, y: number) => void
    line: (x1: number, y1: number, x2: number, y2: number) => void
    internal: { pageSize: { getWidth: () => number } }
  }

  if (metadata.filterCount > 0) {
    typedDoc.text('Active Filters:', margin, yPosition)
    yPosition += 5
    typedDoc.setFontSize(9)

    const filterText = getFilterMetadataText(metadata.filters)
    filterText.forEach((text: string) => {
      typedDoc.text(`  - ${text}`, margin, yPosition)
      yPosition += 5
    })

    typedDoc.setFontSize(10)
    yPosition += 5
  }

  typedDoc.line(margin, yPosition, typedDoc.internal.pageSize.getWidth() - margin, yPosition)
  yPosition += 10

  return yPosition
}

function renderPDFPost(
  doc: unknown,
  post: InnerBlogPost,
  index: number,
  margin: number,
  contentWidth: number,
  yPosition: number
): number {
  const typedDoc = doc as {
    setFontSize: (size: number) => void
    setFont: (font: string, style: string) => void
    setTextColor: (r: number, g: number, b: number) => void
    text: (text: string, x: number, y: number) => void
    splitTextToSize: (text: string, width: number) => string[]
    addPage: () => void
  }

  typedDoc.setFontSize(12)
  typedDoc.setFont('helvetica', 'bold')
  typedDoc.text(`${index + 1}. ${post.title}`, margin, yPosition)
  yPosition += 8

  typedDoc.setFontSize(10)
  typedDoc.setFont('helvetica', 'normal')

  const lines = typedDoc.splitTextToSize(post.desc, contentWidth)
  lines.forEach((line: string) => {
    typedDoc.text(line, margin, yPosition)
    yPosition += 5
  })

  yPosition += 5
  typedDoc.setFontSize(9)
  typedDoc.setTextColor(100, 100, 100)
  typedDoc.text(`Author: ${post.user} | Date: ${post.date}`, margin, yPosition)
  yPosition += 5

  if (post.tagId) {
    const tagName = tagsById.get(post.tagId)?.name
    if (tagName) {
      typedDoc.text(`Tag: ${tagName}`, margin, yPosition)
      yPosition += 5
    }
  }

  if (post.category) {
    typedDoc.text(`Category: ${post.category}`, margin, yPosition)
    yPosition += 5
  }

  typedDoc.setTextColor(0, 0, 0)
  yPosition += 8

  return yPosition
}
