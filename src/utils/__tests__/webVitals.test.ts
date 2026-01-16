import {
  getRating,
  recordMetric,
  getWebVitalsMetrics,
  getWebVitalsEntries,
  resetWebVitals,
  calculateAverageRating,
  getPerformanceMetrics,
  hasPerformanceAlerts,
  getPerformanceAlerts
} from '../webVitals'

describe('Web Vitals Utilities', () => {
  beforeEach(() => {
    resetWebVitals()
  })

  describe('getRating', () => {
    it('should return "good" for LCP values under 2500ms', () => {
      expect(getRating('LCP', 1800)).toBe('good')
      expect(getRating('LCP', 2499)).toBe('good')
    })

    it('should return "needs-improvement" for LCP values between 2500ms and 4000ms', () => {
      expect(getRating('LCP', 2500)).toBe('needs-improvement')
      expect(getRating('LCP', 3000)).toBe('needs-improvement')
      expect(getRating('LCP', 3999)).toBe('needs-improvement')
    })

    it('should return "poor" for LCP values over 4000ms', () => {
      expect(getRating('LCP', 4000)).toBe('needs-improvement')
      expect(getRating('LCP', 4001)).toBe('poor')
      expect(getRating('LCP', 5000)).toBe('poor')
    })

    it('should return "good" for FID values under 100ms', () => {
      expect(getRating('FID', 50)).toBe('good')
      expect(getRating('FID', 99)).toBe('good')
    })

    it('should return "needs-improvement" for FID values between 100ms and 300ms', () => {
      expect(getRating('FID', 100)).toBe('needs-improvement')
      expect(getRating('FID', 200)).toBe('needs-improvement')
      expect(getRating('FID', 299)).toBe('needs-improvement')
    })

    it('should return "poor" for FID values over 300ms', () => {
      expect(getRating('FID', 300)).toBe('needs-improvement')
      expect(getRating('FID', 301)).toBe('poor')
      expect(getRating('FID', 500)).toBe('poor')
    })

    it('should return "good" for CLS values under 0.1', () => {
      expect(getRating('CLS', 0.05)).toBe('good')
      expect(getRating('CLS', 0.099)).toBe('good')
    })

    it('should return "needs-improvement" for CLS values between 0.1 and 0.25', () => {
      expect(getRating('CLS', 0.1)).toBe('needs-improvement')
      expect(getRating('CLS', 0.15)).toBe('needs-improvement')
      expect(getRating('CLS', 0.249)).toBe('needs-improvement')
    })

    it('should return "poor" for CLS values over 0.25', () => {
      expect(getRating('CLS', 0.25)).toBe('needs-improvement')
      expect(getRating('CLS', 0.251)).toBe('poor')
      expect(getRating('CLS', 0.5)).toBe('poor')
    })

    it('should return "good" for FCP values under 1800ms', () => {
      expect(getRating('FCP', 1000)).toBe('good')
      expect(getRating('FCP', 1799)).toBe('good')
    })

    it('should return "needs-improvement" for FCP values between 1800ms and 3000ms', () => {
      expect(getRating('FCP', 1800)).toBe('needs-improvement')
      expect(getRating('FCP', 2400)).toBe('needs-improvement')
      expect(getRating('FCP', 2999)).toBe('needs-improvement')
    })

    it('should return "poor" for FCP values over 3000ms', () => {
      expect(getRating('FCP', 3000)).toBe('needs-improvement')
      expect(getRating('FCP', 3001)).toBe('poor')
      expect(getRating('FCP', 4000)).toBe('poor')
    })

    it('should return "good" for TTFB values under 800ms', () => {
      expect(getRating('TTFB', 500)).toBe('good')
      expect(getRating('TTFB', 799)).toBe('good')
    })

    it('should return "needs-improvement" for TTFB values between 800ms and 1800ms', () => {
      expect(getRating('TTFB', 800)).toBe('needs-improvement')
      expect(getRating('TTFB', 1200)).toBe('needs-improvement')
      expect(getRating('TTFB', 1799)).toBe('needs-improvement')
    })

    it('should return "poor" for TTFB values over 1800ms', () => {
      expect(getRating('TTFB', 1800)).toBe('needs-improvement')
      expect(getRating('TTFB', 1801)).toBe('poor')
      expect(getRating('TTFB', 2000)).toBe('poor')
    })

    it('should return "good" for unknown metrics', () => {
      expect(getRating('UNKNOWN', 5000)).toBe('good')
    })
  })

  describe('recordMetric', () => {
    it('should record LCP metric', () => {
      recordMetric('LCP', 1800)
      const metrics = getWebVitalsMetrics()
      expect(metrics.lcp).toBe(1800)
    })

    it('should record FID metric', () => {
      recordMetric('FID', 75)
      const metrics = getWebVitalsMetrics()
      expect(metrics.fid).toBe(75)
    })

    it('should record CLS metric', () => {
      recordMetric('CLS', 0.08)
      const metrics = getWebVitalsMetrics()
      expect(metrics.cls).toBe(0.08)
    })

    it('should record FCP metric', () => {
      recordMetric('FCP', 1200)
      const metrics = getWebVitalsMetrics()
      expect(metrics.fcp).toBe(1200)
    })

    it('should record TTFB metric', () => {
      recordMetric('TTFB', 450)
      const metrics = getWebVitalsMetrics()
      expect(metrics.ttfb).toBe(450)
    })

    it('should add entry to entries array', () => {
      recordMetric('LCP', 1800)
      const entries = getWebVitalsEntries()
      expect(entries).toHaveLength(1)
      expect(entries[0].metric).toBe('LCP')
      expect(entries[0].value).toBe(1800)
      expect(entries[0].rating).toBe('good')
    })

    it('should record multiple metrics', () => {
      recordMetric('LCP', 1800)
      recordMetric('FID', 75)
      recordMetric('CLS', 0.08)

      const metrics = getWebVitalsMetrics()
      expect(metrics.lcp).toBe(1800)
      expect(metrics.fid).toBe(75)
      expect(metrics.cls).toBe(0.08)

      const entries = getWebVitalsEntries()
      expect(entries).toHaveLength(3)
    })

    it('should include timestamp in entry', () => {
      const beforeTime = Date.now()
      recordMetric('LCP', 1800)
      const afterTime = Date.now()

      const entries = getWebVitalsEntries()
      const entryDate = new Date(entries[0].timestamp).getTime()
      expect(entryDate).toBeGreaterThanOrEqual(beforeTime)
      expect(entryDate).toBeLessThanOrEqual(afterTime)
    })
  })

  describe('getWebVitalsMetrics', () => {
    it('should return initial metrics with zeros', () => {
      const metrics = getWebVitalsMetrics()
      expect(metrics.lcp).toBe(0)
      expect(metrics.fid).toBe(0)
      expect(metrics.cls).toBe(0)
      expect(metrics.fcp).toBe(0)
      expect(metrics.ttfb).toBe(0)
    })

    it('should return updated metrics after recording', () => {
      recordMetric('LCP', 1800)
      recordMetric('FID', 75)

      const metrics = getWebVitalsMetrics()
      expect(metrics.lcp).toBe(1800)
      expect(metrics.fid).toBe(75)
    })

    it('should return a copy of metrics (not reference)', () => {
      recordMetric('LCP', 1800)
      const metrics1 = getWebVitalsMetrics()
      const metrics2 = getWebVitalsMetrics()

      metrics1.lcp = 9999

      expect(metrics2.lcp).toBe(1800)
    })
  })

  describe('getWebVitalsEntries', () => {
    it('should return empty array initially', () => {
      const entries = getWebVitalsEntries()
      expect(entries).toEqual([])
    })

    it('should return all recorded entries', () => {
      recordMetric('LCP', 1800)
      recordMetric('FID', 75)
      recordMetric('CLS', 0.08)

      const entries = getWebVitalsEntries()
      expect(entries).toHaveLength(3)
    })

    it('should return entries in order of recording', () => {
      recordMetric('LCP', 1800)
      recordMetric('FID', 75)

      const entries = getWebVitalsEntries()
      expect(entries[0].metric).toBe('LCP')
      expect(entries[1].metric).toBe('FID')
    })

    it('should return a copy of entries (not reference)', () => {
      recordMetric('LCP', 1800)
      const entries1 = getWebVitalsEntries()
      const entries2 = getWebVitalsEntries()

      entries1.push({ metric: 'LCP', value: 9999, rating: 'good', timestamp: new Date().toISOString() })

      expect(entries2).toHaveLength(1)
    })
  })

  describe('resetWebVitals', () => {
    it('should reset all metrics to zero', () => {
      recordMetric('LCP', 1800)
      recordMetric('FID', 75)

      resetWebVitals()

      const metrics = getWebVitalsMetrics()
      expect(metrics.lcp).toBe(0)
      expect(metrics.fid).toBe(0)
      expect(metrics.cls).toBe(0)
      expect(metrics.fcp).toBe(0)
      expect(metrics.ttfb).toBe(0)
    })

    it('should clear all entries', () => {
      recordMetric('LCP', 1800)
      recordMetric('FID', 75)

      resetWebVitals()

      const entries = getWebVitalsEntries()
      expect(entries).toEqual([])
    })
  })

  describe('calculateAverageRating', () => {
    it('should return "good" when all entries are good', () => {
      recordMetric('LCP', 1800)
      recordMetric('FID', 75)
      recordMetric('CLS', 0.08)

      expect(calculateAverageRating()).toBe('good')
    })

    it('should return "needs-improvement" when average is between good and poor', () => {
      recordMetric('LCP', 3500)
      recordMetric('FID', 75)
      recordMetric('CLS', 0.08)

      expect(calculateAverageRating()).toBe('needs-improvement')
    })

    it('should return "poor" when all entries are poor', () => {
      recordMetric('LCP', 5000)
      recordMetric('FID', 500)
      recordMetric('CLS', 0.5)

      expect(calculateAverageRating()).toBe('poor')
    })

    it('should return "good" when no entries exist', () => {
      expect(calculateAverageRating()).toBe('good')
    })
  })

  describe('getPerformanceMetrics', () => {
    it('should return performance metrics object', () => {
      recordMetric('LCP', 1800)
      recordMetric('FID', 75)

      const perf = getPerformanceMetrics()

      expect(perf).toHaveProperty('metrics')
      expect(perf).toHaveProperty('entries')
      expect(perf).toHaveProperty('averageRating')
      expect(perf).toHaveProperty('lastUpdated')
    })

    it('should include all recorded metrics', () => {
      recordMetric('LCP', 1800)
      recordMetric('FID', 75)

      const perf = getPerformanceMetrics()

      expect(perf.metrics.lcp).toBe(1800)
      expect(perf.metrics.fid).toBe(75)
    })

    it('should include all recorded entries', () => {
      recordMetric('LCP', 1800)
      recordMetric('FID', 75)

      const perf = getPerformanceMetrics()

      expect(perf.entries).toHaveLength(2)
    })

    it('should include average rating', () => {
      recordMetric('LCP', 1800)
      recordMetric('FID', 75)

      const perf = getPerformanceMetrics()

      expect(['good', 'needs-improvement', 'poor']).toContain(perf.averageRating)
    })

    it('should include last updated timestamp', () => {
      const beforeTime = Date.now()
      const perf = getPerformanceMetrics()
      const afterTime = Date.now()

      const lastUpdated = new Date(perf.lastUpdated).getTime()
      expect(lastUpdated).toBeGreaterThanOrEqual(beforeTime)
      expect(lastUpdated).toBeLessThanOrEqual(afterTime)
    })
  })

  describe('hasPerformanceAlerts', () => {
    it('should return false when no entries exist', () => {
      expect(hasPerformanceAlerts()).toBe(false)
    })

    it('should return false when all entries are good', () => {
      recordMetric('LCP', 1800)
      recordMetric('FID', 75)
      recordMetric('CLS', 0.08)

      expect(hasPerformanceAlerts()).toBe(false)
    })

    it('should return true when any entry is poor', () => {
      recordMetric('LCP', 5000)
      recordMetric('FID', 75)

      expect(hasPerformanceAlerts()).toBe(true)
    })

    it('should return false when entries are only needs-improvement', () => {
      recordMetric('LCP', 3000)
      recordMetric('FID', 75)

      expect(hasPerformanceAlerts()).toBe(false)
    })
  })

  describe('getPerformanceAlerts', () => {
    it('should return empty array when no entries exist', () => {
      const alerts = getPerformanceAlerts()
      expect(alerts).toEqual([])
    })

    it('should return empty array when all entries are good', () => {
      recordMetric('LCP', 1800)
      recordMetric('FID', 75)

      const alerts = getPerformanceAlerts()
      expect(alerts).toEqual([])
    })

    it('should return entries with poor rating', () => {
      recordMetric('LCP', 5000)
      recordMetric('FID', 75)
      recordMetric('CLS', 0.5)

      const alerts = getPerformanceAlerts()
      expect(alerts).toHaveLength(2)
      expect(alerts.every(alert => alert.rating === 'poor')).toBe(true)
    })

    it('should exclude needs-improvement entries', () => {
      recordMetric('LCP', 3000)
      recordMetric('FID', 200)

      const alerts = getPerformanceAlerts()
      expect(alerts).toHaveLength(0)
    })

    it('should return copy of alerts (not reference)', () => {
      recordMetric('LCP', 5000)
      const alerts1 = getPerformanceAlerts()
      const alerts2 = getPerformanceAlerts()

      alerts1.push({ metric: 'LCP', value: 9999, rating: 'poor', timestamp: new Date().toISOString() })

      expect(alerts2).toHaveLength(1)
    })
  })
})
