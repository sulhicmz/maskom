import { formatPercentage, calculatePercentage, formatAsPercentage } from '../formatPercentage'

describe('formatPercentage', () => {
  it('should format a simple percentage', () => {
    expect(formatPercentage(50)).toBe('50.0%')
    expect(formatPercentage(25)).toBe('25.0%')
    expect(formatPercentage(75)).toBe('75.0%')
  })

  it('should format with custom precision', () => {
    expect(formatPercentage(50.123, 2)).toBe('50.12%')
    expect(formatPercentage(50.123, 0)).toBe('50%')
    expect(formatPercentage(50.123, 3)).toBe('50.123%')
  })

  it('should handle decimal values', () => {
    expect(formatPercentage(0.5)).toBe('0.5%')
    expect(formatPercentage(0.05)).toBe('0.1%')
    expect(formatPercentage(0.005)).toBe('0.0%')
  })

  it('should handle negative values', () => {
    expect(formatPercentage(-10)).toBe('-10.0%')
    expect(formatPercentage(-25.5)).toBe('-25.5%')
  })

  it('should handle zero', () => {
    expect(formatPercentage(0)).toBe('0.0%')
  })

  it('should handle NaN', () => {
    expect(formatPercentage(NaN)).toBe('0.0%')
  })

  it('should handle very large values', () => {
    expect(formatPercentage(100)).toBe('100.0%')
    expect(formatPercentage(150)).toBe('150.0%')
    expect(formatPercentage(999.99)).toBe('1000.0%')
  })
})

describe('calculatePercentage', () => {
  it('should calculate simple percentages', () => {
    expect(calculatePercentage(50, 100)).toBe(50)
    expect(calculatePercentage(25, 100)).toBe(25)
    expect(calculatePercentage(75, 100)).toBe(75)
  })

  it('should calculate decimal percentages', () => {
    expect(calculatePercentage(1, 2)).toBe(50)
    expect(calculatePercentage(1, 3)).toBe(33.33333333333333)
    expect(calculatePercentage(1, 4)).toBe(25)
  })

  it('should handle zero denominator', () => {
    expect(calculatePercentage(50, 0)).toBe(0)
    expect(calculatePercentage(0, 0)).toBe(0)
    expect(calculatePercentage(100, 0)).toBe(0)
  })

  it('should handle NaN denominator', () => {
    expect(calculatePercentage(50, NaN)).toBe(0)
  })

  it('should handle zero numerator', () => {
    expect(calculatePercentage(0, 100)).toBe(0)
    expect(calculatePercentage(0, 1)).toBe(0)
  })

  it('should handle negative values', () => {
    expect(calculatePercentage(-50, 100)).toBe(-50)
    expect(calculatePercentage(50, -100)).toBe(-50)
  })

  it('should handle values greater than 100%', () => {
    expect(calculatePercentage(150, 100)).toBe(150)
    expect(calculatePercentage(200, 100)).toBe(200)
  })

  it('should handle very small values', () => {
    expect(calculatePercentage(0.1, 100)).toBe(0.1)
    expect(calculatePercentage(1, 1000)).toBe(0.1)
  })
})

describe('formatAsPercentage', () => {
  it('should calculate and format percentage', () => {
    expect(formatAsPercentage(50, 100)).toBe('50.0%')
    expect(formatAsPercentage(25, 100)).toBe('25.0%')
    expect(formatAsPercentage(75, 100)).toBe('75.0%')
  })

  it('should use custom precision', () => {
    expect(formatAsPercentage(1, 3, 2)).toBe('33.33%')
    expect(formatAsPercentage(1, 3, 0)).toBe('33%')
    expect(formatAsPercentage(1, 3, 4)).toBe('33.3333%')
  })

  it('should handle zero denominator', () => {
    expect(formatAsPercentage(50, 0)).toBe('0.0%')
    expect(formatAsPercentage(0, 0)).toBe('0.0%')
  })

  it('should handle NaN denominator', () => {
    expect(formatAsPercentage(50, NaN)).toBe('0.0%')
  })

  it('should handle zero numerator', () => {
    expect(formatAsPercentage(0, 100)).toBe('0.0%')
  })

  it('should handle negative values', () => {
    expect(formatAsPercentage(-50, 100)).toBe('-50.0%')
    expect(formatAsPercentage(50, -100)).toBe('-50.0%')
  })

  it('should handle decimal calculations', () => {
    expect(formatAsPercentage(1, 2)).toBe('50.0%')
    expect(formatAsPercentage(1, 4)).toBe('25.0%')
    expect(formatAsPercentage(1, 8)).toBe('12.5%')
  })

  it('should handle values greater than 100%', () => {
    expect(formatAsPercentage(150, 100)).toBe('150.0%')
    expect(formatAsPercentage(200, 100)).toBe('200.0%')
  })

  it('should handle very small values', () => {
    expect(formatAsPercentage(0.1, 100)).toBe('0.1%')
    expect(formatAsPercentage(1, 1000)).toBe('0.1%')
  })

  it('should handle rounding correctly', () => {
    expect(formatAsPercentage(1, 3)).toBe('33.3%')
    expect(formatAsPercentage(2, 3)).toBe('66.7%')
    expect(formatAsPercentage(1, 6)).toBe('16.7%')
  })
})
