import { WebVitalsMetrics, WebVitalsEntry } from '@/types/analytics'

const WEB_VITAL_THRESHOLDS = {
  LCP: { good: 2500, poor: 4000 },
  FID: { good: 100, poor: 300 },
  CLS: { good: 0.1, poor: 0.25 },
  FCP: { good: 1800, poor: 3000 },
  TTFB: { good: 800, poor: 1800 }
}

let metrics: WebVitalsMetrics = {
  lcp: 0,
  fid: 0,
  cls: 0,
  fcp: 0,
  ttfb: 0
}

let entries: WebVitalsEntry[] = []

export function getRating(metric: string, value: number): 'good' | 'needs-improvement' | 'poor' {
  const thresholds = WEB_VITAL_THRESHOLDS[metric as keyof typeof WEB_VITAL_THRESHOLDS]
  if (!thresholds) return 'good'

  if (value < thresholds.good) return 'good'
  if (value <= thresholds.poor) return 'needs-improvement'
  return 'poor'
}

export function recordMetric(
  metric: 'LCP' | 'FID' | 'CLS' | 'FCP' | 'TTFB',
  value: number
): void {
  const rating = getRating(metric, value)
  
  const entry: WebVitalsEntry = {
    metric,
    value,
    rating,
    timestamp: new Date().toISOString()
  }
  
  entries.push(entry)
  
  switch (metric) {
    case 'LCP':
      metrics.lcp = value
      break
    case 'FID':
      metrics.fid = value
      break
    case 'CLS':
      metrics.cls = value
      break
    case 'FCP':
      metrics.fcp = value
      break
    case 'TTFB':
      metrics.ttfb = value
      break
  }
}

export function getWebVitalsMetrics(): WebVitalsMetrics {
  return { ...metrics }
}

export function getWebVitalsEntries(): WebVitalsEntry[] {
  return [...entries]
}

export function resetWebVitals(): void {
  metrics = {
    lcp: 0,
    fid: 0,
    cls: 0,
    fcp: 0,
    ttfb: 0
  }
  entries = []
}

export function calculateAverageRating(): 'good' | 'needs-improvement' | 'poor' {
  if (entries.length === 0) return 'good'

  const ratings = entries.map(e => e.rating === 'good' ? 2 : e.rating === 'needs-improvement' ? 1 : 0)
  const sum = ratings.reduce((sum, r) => sum + r, 0 as number)
  const averageRating = sum / ratings.length

  if (averageRating >= 1.8) return 'good'
  if (averageRating >= 0.8) return 'needs-improvement'
  return 'poor'
}

export function getPerformanceMetrics() {
  return {
    metrics: getWebVitalsMetrics(),
    entries: getWebVitalsEntries(),
    averageRating: calculateAverageRating(),
    lastUpdated: new Date().toISOString()
  }
}

export function hasPerformanceAlerts(): boolean {
  return entries.some(entry => entry.rating === 'poor')
}

export function getPerformanceAlerts(): WebVitalsEntry[] {
  return entries.filter(entry => entry.rating === 'poor')
}
