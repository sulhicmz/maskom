import { AnalyticsData, FormSubmissionMetrics, PageViewMetrics, AnalyticsSummary } from '@/types/analytics'

let pageViews: Record<string, { count: number; unique: Set<string> }> = {}
let formSubmissions: Record<string, { count: number; successful: number; failed: number }> = {}

export function trackPageView(path: string, sessionId?: string): void {
  if (!pageViews[path]) {
    pageViews[path] = { count: 0, unique: new Set() }
  }
  pageViews[path].count++
  if (sessionId) {
    pageViews[path].unique.add(sessionId)
  }
}

export function getPageViews(path: string): { count: number; unique: number } {
  const data = pageViews[path]
  return data ? { count: data.count, unique: data.unique.size } : { count: 0, unique: 0 }
}

export function resetPageViews(): void {
  pageViews = {}
}

export function trackFormSubmission(formType: string, success: boolean): void {
  if (!formSubmissions[formType]) {
    formSubmissions[formType] = { count: 0, successful: 0, failed: 0 }
  }
  formSubmissions[formType].count++
  if (success) {
    formSubmissions[formType].successful++
  } else {
    formSubmissions[formType].failed++
  }
}

export function getFormSubmissions(formType: string): { count: number; successful: number; failed: number } {
  return formSubmissions[formType] || { count: 0, successful: 0, failed: 0 }
}

export function resetFormSubmissions(): void {
  formSubmissions = {}
}

export function calculateConversionRate(formType: string, totalViews: number): number {
  const submissions = getFormSubmissions(formType)
  if (totalViews === 0) return 0
  return (submissions.successful / totalViews) * 100
}

export function calculateEngagementScore(data: AnalyticsData): number {
  const avgSessionDuration = data.userEngagement.avgSessionDuration
  const pagesPerSession = data.userEngagement.pagesPerSession
  const returnVisitorRate = data.userEngagement.returnVisitorRate
  const engagedSessionRate = data.userEngagement.engagedSessions / data.userEngagement.totalSessions

  const durationScore = Math.min(avgSessionDuration / 300, 1)
  const pageScore = Math.min(pagesPerSession / 5, 1)
  const returnScore = returnVisitorRate
  const engagementScore = engagedSessionRate

  return Math.round((durationScore * 0.3 + pageScore * 0.3 + returnScore * 0.2 + engagementScore * 0.2) * 100)
}

export function calculateFormSuccessRate(metrics: FormSubmissionMetrics): number {
  if (metrics.totalSubmissions === 0) return 0
  return (metrics.successfulSubmissions / metrics.totalSubmissions) * 100
}

export function calculateAnalyticsSummary(data: AnalyticsData): AnalyticsSummary {
  const totalFormSubmissions = data.formSubmissions.reduce((sum, form) => sum + form.totalSubmissions, 0)
  const totalSuccessfulSubmissions = data.formSubmissions.reduce((sum, form) => sum + form.successfulSubmissions, 0)
  const totalPageViews = data.pageViews.reduce((sum, page) => sum + page.totalViews, 0)

  const formSuccessRate = totalFormSubmissions > 0 ? (totalSuccessfulSubmissions / totalFormSubmissions) * 100 : 0
  const avgSessionDuration = data.userEngagement.avgSessionDuration
  const conversionRate = totalPageViews > 0 ? (totalSuccessfulSubmissions / totalPageViews) * 100 : 0
  const engagementScore = calculateEngagementScore(data)

  return {
    totalFormSubmissions,
    formSuccessRate,
    totalPageViews,
    avgSessionDuration,
    conversionRate,
    engagementScore
  }
}

export function formatNumber(num: number): string {
  return new Intl.NumberFormat('id-ID').format(num)
}

export function formatPercentage(value: number): string {
  return `${value.toFixed(1)}%`
}

export function formatDuration(seconds: number): string {
  const minutes = Math.floor(seconds / 60)
  const remainingSeconds = Math.floor(seconds % 60)
  if (minutes === 0) {
    return `${remainingSeconds}s`
  }
  return `${minutes}m ${remainingSeconds}s`
}
