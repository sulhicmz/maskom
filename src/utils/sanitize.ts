import DOMPurify from 'dompurify'

export function sanitizeHTML(html: string): string {
  return DOMPurify.sanitize(html)
}

export function sanitizeString(input: string): string {
  return input
    .replace(/[<>]/g, '')
    .trim()
}

export function sanitizeURL(url: string): string {
  try {
    const parsed = new URL(url)

    if (!['http:', 'https:'].includes(parsed.protocol)) {
      return '#'
    }

    return parsed.href
  } catch {
    return '#'
  }
}

export function sanitizeInput(input: unknown): string {
  if (typeof input === 'string') {
    return sanitizeString(input)
  }

  if (typeof input === 'number') {
    return input.toString()
  }

  return ''
}
