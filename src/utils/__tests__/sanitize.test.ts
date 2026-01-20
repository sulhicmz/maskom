import { describe, it, expect } from '@jest/globals'
import {
  sanitizeHTML,
  sanitizeString,
  sanitizeURL,
  sanitizeInput
} from '../sanitize'

describe('sanitizeHTML', () => {
  it('should allow safe HTML', () => {
    const input = '<p>Hello World</p>'
    const result = sanitizeHTML(input)

    expect(result).toBe('<p>Hello World</p>')
  })

  it('should remove script tags', () => {
    const input = '<p>Hello<script>alert("xss")</script>World</p>'
    const result = sanitizeHTML(input)

    expect(result).not.toContain('<script>')
    expect(result).not.toContain('alert("xss")')
  })

  it('should remove onclick handlers', () => {
    const input = '<p onclick="alert(1)">Click me</p>'
    const result = sanitizeHTML(input)

    expect(result).not.toContain('onclick')
  })

  it('should remove img onerror handlers', () => {
    const input = '<img src="x.jpg" onerror="alert(1)">'
    const result = sanitizeHTML(input)

    expect(result).not.toContain('onerror')
  })

  it('should preserve safe attributes', () => {
    const input = '<a href="https://example.com" class="link">Link</a>'
    const result = sanitizeHTML(input)

    expect(result).toContain('href="https://example.com"')
    expect(result).toContain('class="link"')
  })

  it('should handle empty string', () => {
    const input = ''
    const result = sanitizeHTML(input)

    expect(result).toBe('')
  })

  it('should handle null', () => {
    const input = null as any
    const result = sanitizeHTML(input)

    expect(result).toBe('')
  })

  it('should handle undefined', () => {
    const input = undefined as any
    const result = sanitizeHTML(input)

    expect(result).toBe('')
  })
})

describe('sanitizeString', () => {
  it('should remove angle brackets', () => {
    const input = '<script>alert(1)</script>'
    const result = sanitizeString(input)

    expect(result).not.toContain('<')
    expect(result).not.toContain('>')
  })

  it('should preserve text content', () => {
    const input = 'Hello World'
    const result = sanitizeString(input)

    expect(result).toBe('Hello World')
  })

  it('should trim whitespace', () => {
    const input = '  Hello World  '
    const result = sanitizeString(input)

    expect(result).toBe('Hello World')
  })

  it('should handle empty string', () => {
    const input = ''
    const result = sanitizeString(input)

    expect(result).toBe('')
  })

  it('should handle string with only whitespace', () => {
    const input = '   '
    const result = sanitizeString(input)

    expect(result).toBe('')
  })
})

describe('sanitizeURL', () => {
  it('should allow valid HTTP URLs', () => {
    const input = 'http://example.com/path'
    const result = sanitizeURL(input)

    expect(result).toBe('http://example.com/path')
  })

  it('should allow valid HTTPS URLs', () => {
    const input = 'https://example.com/path?query=1'
    const result = sanitizeURL(input)

    expect(result).toBe('https://example.com/path?query=1')
  })

  it('should block javascript: URLs', () => {
    const input = 'javascript:alert(1)'
    const result = sanitizeURL(input)

    expect(result).toBe('#')
  })

  it('should block data: URLs', () => {
    const input = 'data:text/html,<script>alert(1)</script>'
    const result = sanitizeURL(input)

    expect(result).toBe('#')
  })

  it('should handle invalid URLs', () => {
    const input = 'not-a-url'
    const result = sanitizeURL(input)

    expect(result).toBe('#')
  })

  it('should handle empty string', () => {
    const input = ''
    const result = sanitizeURL(input)

    expect(result).toBe('#')
  })
})

describe('sanitizeInput', () => {
  it('should sanitize string input', () => {
    const input = '<script>alert(1)</script>'
    const result = sanitizeInput(input)

    expect(result).not.toContain('<')
    expect(result).not.toContain('>')
  })

  it('should convert number to string', () => {
    const input = 123
    const result = sanitizeInput(input)

    expect(result).toBe('123')
  })

  it('should return empty string for boolean', () => {
    const input = true
    const result = sanitizeInput(input)

    expect(result).toBe('')
  })

  it('should return empty string for null', () => {
    const input = null
    const result = sanitizeInput(input)

    expect(result).toBe('')
  })

  it('should return empty string for undefined', () => {
    const input = undefined
    const result = sanitizeInput(input)

    expect(result).toBe('')
  })

  it('should return empty string for object', () => {
    const input = { key: 'value' }
    const result = sanitizeInput(input)

    expect(result).toBe('')
  })

  it('should return empty string for array', () => {
    const input = ['a', 'b', 'c']
    const result = sanitizeInput(input)

    expect(result).toBe('')
  })
})
