/* eslint-disable @typescript-eslint/no-explicit-any, @typescript-eslint/no-require-imports */

export async function exportToPDF(
  posts: any,
  config: any,
  metadata: any
): Promise<void> {
  const jsPDF = (await import('jspdf')).default as any
  const doc = new jsPDF()
  const pageWidth = (doc.internal.pageSize as any).getWidth()

  const { yPosition: startY, margin, contentWidth } = setupPDFDocument(doc, metadata, pageWidth)
  let yPosition = renderPDFMetadata(doc, metadata, margin, startY)

  posts.forEach((post: any, index: number) => {
    if (yPosition > 270) {
      doc.addPage()
      yPosition = 20
    }

    yPosition = renderPDFPost(doc, post, index, margin, contentWidth, yPosition)
  })

  const filename = config.filename || `blog-export-${metadata.exportDate}.pdf`
  doc.save(filename)
}

function setupPDFDocument(doc: any, metadata: any, pageWidth: number) {
  doc.setFontSize(16)
  doc.setFont('helvetica', 'bold')
  const margin = 20
  const contentWidth = pageWidth - (margin * 2)
  let yPosition = 30

  doc.text('Blog Posts Export', pageWidth / 2, yPosition, { align: 'center' })
  yPosition += 10

  doc.setFontSize(10)
  doc.setFont('helvetica', 'normal')
  doc.text(`Export Date: ${metadata.exportDate}`, margin, yPosition)
  yPosition += 7

  doc.text(`Total Posts: ${metadata.resultCount}`, margin, yPosition)
  yPosition += 7

  return { yPosition, margin, contentWidth }
}

function renderPDFMetadata(doc: any, metadata: any, margin: number, yPosition: number) {
  if (metadata.filterCount > 0) {
    doc.text('Active Filters:', margin, yPosition)
    yPosition += 5
    doc.setFontSize(9)

    const filterText = getFilterMetadataText(metadata.filters)
    filterText.forEach((text: string) => {
      doc.text(`  - ${text}`, margin, yPosition)
      yPosition += 5
    })

    doc.setFontSize(10)
    yPosition += 5
  }

  doc.line(margin, yPosition, (doc.internal.pageSize as any).getWidth() - margin, yPosition)
  yPosition += 10

  return yPosition
}

function renderPDFPost(doc: any, post: any, index: number, margin: number, contentWidth: number, yPosition: number) {
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
    const tagsById = require('@/data/BlogTagData').tagsById
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

  return yPosition
}

function getFilterMetadataText(filters: any): string[] {
  const metadataLines: string[] = []

  if (filters.searchQuery) {
    metadataLines.push(`Search: "${filters.searchQuery}"`)
  }
  if (filters.categoryId) {
    const blogCategoryById = require('@/data/BlogCategoryData').blogCategoryById
    const categoryName = blogCategoryById.get(filters.categoryId)?.name
    if (categoryName) {
      metadataLines.push(`Category: ${categoryName}`)
    }
  }
  if (filters.tagId) {
    const tagsById = require('@/data/BlogTagData').tagsById
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
