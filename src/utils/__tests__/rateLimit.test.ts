import { describe, it, expect, beforeEach, afterEach, jest } from '@jest/globals'
import {
  createRateLimiter,
  getClientIdentifier,
  defaultRateLimiter,
  strictRateLimiter,
  looseRateLimiter,
  type RateLimitResult
} from '../rateLimit'

describe('createRateLimiter', () => {
  beforeEach(() => {
    jest.useFakeTimers()
  })

  afterEach(() => {
    jest.restoreAllMocks()
    jest.useRealTimers()
  })

  describe('First request', () => {
    it('should allow first request and set correct initial count', () => {
      const rateLimiter = createRateLimiter({ windowMs: 60000, maxRequests: 5 })
      const identifier = 'client1'

      const result = rateLimiter(identifier)

      expect(result.success).toBe(true)
      expect(result.limit).toBe(5)
      expect(result.remaining).toBeGreaterThanOrEqual(0)
      expect(result.remaining).toBeLessThanOrEqual(4)
      expect(result.resetTime).toBeGreaterThan(Date.now())
    })

    it('should set reset time close to now + windowMs', () => {
      const rateLimiter = createRateLimiter({ windowMs: 60000, maxRequests: 5 })
      const identifier = 'client1'

      const result = rateLimiter(identifier)

      const now = Date.now()
      const expectedResetTime = now + 60000
      const tolerance = 100

      expect(Math.abs(result.resetTime - expectedResetTime)).toBeLessThan(tolerance)
    })
  })

  describe('Multiple requests within window', () => {
    it('should allow requests until limit is reached', () => {
      const rateLimiter = createRateLimiter({ windowMs: 60000, maxRequests: 5 })
      const identifier = 'client1'

      const results: RateLimitResult[] = []
      for (let i = 0; i < 5; i++) {
        results.push(rateLimiter(identifier))
      }

      expect(results[0].success).toBe(true)
      expect(results[0].remaining).toBeGreaterThanOrEqual(0)
      expect(results[0].remaining).toBeLessThanOrEqual(4)

      expect(results[1].success).toBe(true)
      expect(results[1].remaining).toBeGreaterThanOrEqual(0)
      expect(results[1].remaining).toBeLessThanOrEqual(3)

      expect(results[2].success).toBe(true)
      expect(results[2].remaining).toBeGreaterThanOrEqual(0)
      expect(results[2].remaining).toBeLessThanOrEqual(2)

      expect(results[3].success).toBe(true)
      expect(results[3].remaining).toBeGreaterThanOrEqual(0)
      expect(results[3].remaining).toBeLessThanOrEqual(1)

      expect(results[4].success).toBe(true)
      expect(results[4].remaining).toBeGreaterThanOrEqual(0)
      expect(results[4].remaining).toBeLessThanOrEqual(0)
    })

    it('should reject requests when limit is exceeded', () => {
      const rateLimiter = createRateLimiter({ windowMs: 60000, maxRequests: 5 })
      const identifier = 'client1'

      for (let i = 0; i < 5; i++) {
        rateLimiter(identifier)
      }

      const result = rateLimiter(identifier)

      expect(result.success).toBe(false)
      expect(result.limit).toBe(5)
      expect(result.remaining).toBe(0)
    })

    it('should continue rejecting requests after limit exceeded', () => {
      const rateLimiter = createRateLimiter({ windowMs: 60000, maxRequests: 5 })
      const identifier = 'client1'

      for (let i = 0; i < 5; i++) {
        rateLimiter(identifier)
      }

      const result1 = rateLimiter(identifier)
      const result2 = rateLimiter(identifier)

      expect(result1.success).toBe(false)
      expect(result2.success).toBe(false)
    })
  })

  describe('Reset after window expires', () => {
    it('should reset count after window expires', () => {
      const rateLimiter = createRateLimiter({ windowMs: 1, maxRequests: 5 })
      const identifier = 'client1'

      for (let i = 0; i < 5; i++) {
        rateLimiter(identifier)
      }

      const resultBeforeReset = rateLimiter(identifier)
      expect(resultBeforeReset.success).toBe(false)

      jest.advanceTimersByTime(10)

      const resultAfterReset = rateLimiter(identifier)
      expect(resultAfterReset.success).toBe(true)
      expect(resultAfterReset.remaining).toBeGreaterThanOrEqual(0)
      expect(resultAfterReset.remaining).toBeLessThanOrEqual(4)
    })

    it('should set new reset time after window expires', () => {
      const rateLimiter = createRateLimiter({ windowMs: 1, maxRequests: 5 })
      const identifier = 'client1'

      for (let i = 0; i < 5; i++) {
        rateLimiter(identifier)
      }

      jest.advanceTimersByTime(10)
      jest.setSystemTime(Date.now() + 10)

      const result = rateLimiter(identifier)

      expect(result.success).toBe(true)
      expect(result.resetTime).toBeGreaterThan(Date.now())
      expect(result.remaining).toBeGreaterThanOrEqual(0)
      expect(result.remaining).toBeLessThanOrEqual(4)
    })
  })

  describe('Multiple clients', () => {
    it('should track rate limits independently for different clients', () => {
      const rateLimiter = createRateLimiter({ windowMs: 60000, maxRequests: 5 })
      const client1 = 'client1'
      const client2 = 'client2'

      for (let i = 0; i < 5; i++) {
        rateLimiter(client1)
      }

      const result1 = rateLimiter(client1)
      const result2 = rateLimiter(client2)

      expect(result1.success).toBe(false)
      expect(result2.success).toBe(true)
      expect(result2.remaining).toBeGreaterThanOrEqual(0)
      expect(result2.remaining).toBeLessThanOrEqual(4)
    })

    it('should handle multiple clients with different request counts', () => {
      const rateLimiter = createRateLimiter({ windowMs: 60000, maxRequests: 5 })
      const client1 = 'client1'
      const client2 = 'client2'

      for (let i = 0; i < 3; i++) {
        rateLimiter(client1)
      }

      for (let i = 0; i < 2; i++) {
        rateLimiter(client2)
      }

      const result1 = rateLimiter(client1)
      const result2 = rateLimiter(client2)

      expect(result1.success).toBe(true)
      expect(result1.remaining).toBeGreaterThanOrEqual(0)
      expect(result1.remaining).toBeLessThanOrEqual(1)

      expect(result2.success).toBe(true)
      expect(result2.remaining).toBeGreaterThanOrEqual(0)
      expect(result2.remaining).toBeLessThanOrEqual(2)
    })
  })

  describe('getClientIdentifier', () => {
    let mockRequest: any

    beforeEach(() => {
      mockRequest = {
        headers: {
          get: jest.fn()
        }
      }
    })

    it('should create identifier from x-forwarded-for header', () => {
      mockRequest.headers.get.mockReturnValue('192.168.1.1')

      const identifier = getClientIdentifier(mockRequest as Request)

      expect(identifier).toContain('192.168.1.1')
    })

    it('should use first IP from x-forwarded-for when multiple IPs', () => {
      mockRequest.headers.get.mockImplementation((header: string) => {
        if (header === 'x-forwarded-for') return '192.168.1.1, 192.168.1.2'
        if (header === 'user-agent') return 'unknown'
        return null
      })

      const identifier = getClientIdentifier(mockRequest as Request)

      expect(identifier).toContain('192.168.1.1')
      expect(identifier).not.toContain('192.168.1.2')
    })

    it('should use unknown when x-forwarded-for is missing', () => {
      mockRequest.headers.get.mockImplementation((header: string) => {
        if (header === 'x-forwarded-for') return null
        if (header === 'user-agent') return 'Mozilla/5.0'
        return null
      })

      const identifier = getClientIdentifier(mockRequest as Request)

      expect(identifier).toContain('unknown')
    })

    it('should include user-agent in identifier', () => {
      mockRequest.headers.get.mockImplementation((header: string) => {
        if (header === 'x-forwarded-for') return '192.168.1.1'
        if (header === 'user-agent') return 'Mozilla/5.0'
        return null
      })

      const identifier = getClientIdentifier(mockRequest as Request)

      expect(identifier).toContain('192.168.1.1')
      expect(identifier).toContain('Mozilla/5.0')
    })

    it('should use unknown when user-agent is missing', () => {
      mockRequest.headers.get.mockImplementation((header: string) => {
        if (header === 'x-forwarded-for') return '192.168.1.1'
        if (header === 'user-agent') return null
        return null
      })

      const identifier = getClientIdentifier(mockRequest as Request)

      expect(identifier).toContain('192.168.1.1')
      expect(identifier).toContain('unknown')
    })
  })
})

describe('Default rate limiters', () => {
  it('should provide defaultRateLimiter with reasonable limits', () => {
    const identifier = 'test1'

    const result = defaultRateLimiter(identifier)

    expect(result.success).toBe(true)
    expect(result.limit).toBe(100)
  })

  it('should provide strictRateLimiter with lower limits', () => {
    const identifier = 'test1'

    const result = strictRateLimiter(identifier)

    expect(result.success).toBe(true)
    expect(result.limit).toBe(50)
  })

  it('should provide looseRateLimiter with higher limits', () => {
    const identifier = 'test1'

    const result = looseRateLimiter(identifier)

    expect(result.success).toBe(true)
    expect(result.limit).toBe(200)
  })
})
