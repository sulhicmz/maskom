interface RateLimitEntry {
  count: number
  resetTime: number
}

interface RateLimitOptions {
  windowMs: number
  maxRequests: number
}

export interface RateLimitResult {
  success: boolean
  limit: number
  remaining: number
  resetTime: number
}

export function createRateLimiter(options: RateLimitOptions) {
  const { windowMs, maxRequests } = options
  const store = new Map<string, RateLimitEntry>()

  return function checkRateLimit(identifier: string): RateLimitResult {
    const now = Date.now()
    const entry = store.get(identifier)

    if (!entry || now > entry.resetTime) {
      const newEntry: RateLimitEntry = {
        count: 1,
        resetTime: now + windowMs
      }
      store.set(identifier, newEntry)

      return {
        success: true,
        limit: maxRequests,
        remaining: maxRequests - 1,
        resetTime: newEntry.resetTime
      }
    }

    if (entry.count >= maxRequests) {
      return {
        success: false,
        limit: maxRequests,
        remaining: 0,
        resetTime: entry.resetTime
      }
    }

    entry.count++
    store.set(identifier, entry)

    return {
      success: true,
      limit: maxRequests,
      remaining: maxRequests - entry.count,
      resetTime: entry.resetTime
    }
  }
}

export function getClientIdentifier(request: Request): string {
  const forwarded = request.headers.get('x-forwarded-for')
  const ip = forwarded ? forwarded.split(',')[0] : 'unknown'

  const userAgent = request.headers.get('user-agent') || 'unknown'

  return `${ip}:${userAgent}`
}

export const defaultRateLimiter = createRateLimiter({
  windowMs: 15 * 60 * 1000,
  maxRequests: 100
})

export const strictRateLimiter = createRateLimiter({
  windowMs: 15 * 60 * 1000,
  maxRequests: 50
})

export const looseRateLimiter = createRateLimiter({
  windowMs: 15 * 60 * 1000,
  maxRequests: 200
})
