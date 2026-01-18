import {
  getWebVitalsMetrics,
  getWebVitalsEntries,
  resetWebVitals,
  loadFromLocalStorage,
  clearLocalStorage,
  reportWebVitals
} from '../webVitals'
import type { Metric } from 'web-vitals'

describe('Web Vitals Utilities - localStorage functions', () => {
  beforeEach(() => {
    resetWebVitals()
    clearLocalStorage()
  })

  afterEach(() => {
    clearLocalStorage()
  })

  describe('loadFromLocalStorage', () => {
    it('should return empty array when localStorage is empty', () => {
      const loaded = loadFromLocalStorage()
      expect(loaded).toEqual([])
    })

    it('should return empty array when no data in localStorage', () => {
      localStorage.removeItem('web_vitals_history')
      const loaded = loadFromLocalStorage()
      expect(loaded).toEqual([])
    })

    it('should handle invalid JSON in localStorage', () => {
      localStorage.setItem('web_vitals_history', 'invalid-json')
      const loaded = loadFromLocalStorage()
      expect(loaded).toEqual([])
    })

    it('should handle localStorage error gracefully', () => {
      const originalGetItem = localStorage.getItem
      localStorage.getItem = jest.fn(() => {
        throw new Error('localStorage error')
      })

      const loaded = loadFromLocalStorage()
      expect(loaded).toEqual([])

      localStorage.getItem = originalGetItem
    })

    it('should load valid WebVitalsEntry array from localStorage', () => {
      const testData = [
        {
          metric: 'LCP' as const,
          value: 1800,
          rating: 'good' as const,
          timestamp: '2026-01-17T12:00:00.000Z'
        },
        {
          metric: 'FID' as const,
          value: 75,
          rating: 'good' as const,
          timestamp: '2026-01-17T12:00:01.000Z'
        }
      ]

      localStorage.setItem('web_vitals_history', JSON.stringify(testData))
      const loaded = loadFromLocalStorage()

      expect(loaded).toHaveLength(2)
      expect(loaded[0].metric).toBe('LCP')
      expect(loaded[0].value).toBe(1800)
      expect(loaded[1].metric).toBe('FID')
      expect(loaded[1].value).toBe(75)
    })
  })

  describe('clearLocalStorage', () => {
    it('should remove web_vitals_history from localStorage', () => {
      const testData = [
        {
          metric: 'LCP' as const,
          value: 1800,
          rating: 'good' as const,
          timestamp: '2026-01-17T12:00:00.000Z'
        }
      ]

      localStorage.setItem('web_vitals_history', JSON.stringify(testData))
      clearLocalStorage()

      const loaded = localStorage.getItem('web_vitals_history')
      expect(loaded).toBeNull()
    })

    it('should handle localStorage error gracefully', () => {
      const originalRemoveItem = localStorage.removeItem
      localStorage.removeItem = jest.fn(() => {
        throw new Error('localStorage error')
      })

      expect(() => clearLocalStorage()).not.toThrow()

      localStorage.removeItem = originalRemoveItem
    })
  })

  describe('reportWebVitals', () => {
    it('should record LCP metric', () => {
      const metric: Metric = {
        id: 'test-lcp',
        name: 'LCP',
        value: 1800,
        rating: 'good',
        delta: 1800,
        entries: [],
        navigationType: 'navigate'
      }

      reportWebVitals(metric)
      const metrics = getWebVitalsMetrics()

      expect(metrics.lcp).toBe(1800)
    })

    it('should record CLS metric', () => {
      const metric: Metric = {
        id: 'test-cls',
        name: 'CLS',
        value: 0.08,
        rating: 'good',
        delta: 0.08,
        entries: [],
        navigationType: 'navigate'
      }

      reportWebVitals(metric)
      const metrics = getWebVitalsMetrics()

      expect(metrics.cls).toBe(0.08)
    })

    it('should record INP metric as FID', () => {
      const metric = {
        id: 'test-inp',
        name: 'INP',
        value: 150,
        rating: 'good',
        delta: 150,
        entries: [],
        navigationType: 'navigate'
      } as Metric

      reportWebVitals(metric)
      const metrics = getWebVitalsMetrics()

      expect(metrics.fid).toBe(150)
    })

    it('should record FCP metric', () => {
      const metric = {
        id: 'test-fcp',
        name: 'FCP',
        value: 1200,
        rating: 'good',
        delta: 1200,
        entries: [],
        navigationType: 'navigate'
      } as Metric

      reportWebVitals(metric)
      const metrics = getWebVitalsMetrics()

      expect(metrics.fcp).toBe(1200)
    })

    it('should record TTFB metric', () => {
      const metric: Metric = {
        id: 'test-ttfb',
        name: 'TTFB',
        value: 450,
        rating: 'good',
        delta: 450,
        entries: [],
        navigationType: 'navigate'
      }

      reportWebVitals(metric)
      const metrics = getWebVitalsMetrics()

      expect(metrics.ttfb).toBe(450)
    })

    it('should add entry to entries array', () => {
      const metric: Metric = {
        id: 'test-lcp',
        name: 'LCP',
        value: 1800,
        rating: 'good',
        delta: 1800,
        entries: [],
        navigationType: 'navigate'
      }

      reportWebVitals(metric)
      const entries = getWebVitalsEntries()

      expect(entries).toHaveLength(1)
      expect(entries[0].metric).toBe('LCP')
      expect(entries[0].value).toBe(1800)
      expect(entries[0].rating).toBe('good')
    })

    it('should save metric to localStorage', () => {
      const metric: Metric = {
        id: 'test-lcp',
        name: 'LCP',
        value: 1800,
        rating: 'good',
        delta: 1800,
        entries: [],
        navigationType: 'navigate'
      }

      reportWebVitals(metric)
      const loaded = loadFromLocalStorage()

      expect(loaded).toHaveLength(1)
      expect(loaded[0].metric).toBe('LCP')
      expect(loaded[0].value).toBe(1800)
    })

    it('should ignore unknown metric names', () => {
      const metric = {
        id: 'test-unknown',
        name: 'UNKNOWN' as 'LCP',
        value: 1000,
        rating: 'good',
        delta: 1000,
        entries: [],
        navigationType: 'navigate'
      } as Metric

      expect(() => reportWebVitals(metric)).not.toThrow()

      const entries = getWebVitalsEntries()
      expect(entries).toHaveLength(0)
    })

    it('should handle multiple metrics', () => {
      const metrics = [
        {
          id: 'test-lcp',
          name: 'LCP',
          value: 1800,
          rating: 'good',
          delta: 1800,
          entries: [],
          navigationType: 'navigate'
        },
        {
          id: 'test-cls',
          name: 'CLS',
          value: 0.08,
          rating: 'good',
          delta: 0.08,
          entries: [],
          navigationType: 'navigate'
        }
      ] as Metric[]

      metrics.forEach(metric => reportWebVitals(metric))

      const loaded = loadFromLocalStorage()
      expect(loaded).toHaveLength(2)
    })
  })

  describe('localStorage limit', () => {
    it('should limit stored entries to MAX_STORED_ENTRIES (50)', () => {
      const metric: Metric = {
        id: 'test-lcp',
        name: 'LCP',
        value: 1800,
        rating: 'good',
        delta: 1800,
        entries: [],
        navigationType: 'navigate'
      }

      for (let i = 0; i < 55; i++) {
        reportWebVitals(metric)
      }

      const loaded = loadFromLocalStorage()
      expect(loaded.length).toBeLessThanOrEqual(50)
    })
  })
})
