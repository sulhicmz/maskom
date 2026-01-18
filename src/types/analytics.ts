export interface FormSubmissionMetrics {
  formType: 'contact' | 'login' | 'signup' | 'blog'
  totalSubmissions: number
  successfulSubmissions: number
  failedSubmissions: number
  avgCompletionTime: number
  submissionsByDate: DateSubmission[]
}

export interface DateSubmission {
  date: string
  count: number
  successful: number
  failed: number
}

export interface PageViewMetrics {
  pagePath: string
  pageTitle: string
  totalViews: number
  uniqueViews: number
  avgTimeOnPage: number
  bounceRate: number
  viewsByDate: DatePageView[]
}

export interface DatePageView {
  date: string
  views: number
  unique: number
}

export interface UserEngagementMetrics {
  totalSessions: number
  avgSessionDuration: number
  pagesPerSession: number
  returnVisitorRate: number
  engagedSessions: number
}

export interface AnalyticsData {
  formSubmissions: FormSubmissionMetrics[]
  pageViews: PageViewMetrics[]
  userEngagement: UserEngagementMetrics
  lastUpdated: string
}

export interface WebVitalsMetrics {
  lcp: number
  fid: number
  cls: number
  fcp: number
  ttfb: number
}

export interface WebVitalsEntry {
  metric: 'LCP' | 'FID' | 'CLS' | 'FCP' | 'TTFB'
  value: number
  rating: 'good' | 'needs-improvement' | 'poor'
  timestamp: string
}

export type WebVitalMetric = 'LCP' | 'FID' | 'CLS' | 'FCP' | 'TTFB' | 'INP'

export interface PerformanceMetrics {
  metrics: WebVitalsMetrics
  entries: WebVitalsEntry[]
  averageRating: 'good' | 'needs-improvement' | 'poor'
  lastUpdated: string
}

export interface AnalyticsSummary {
  totalFormSubmissions: number
  formSuccessRate: number
  totalPageViews: number
  avgSessionDuration: number
  conversionRate: number
  engagementScore: number
}

export interface AnalyticsData {
  formSubmissions: FormSubmissionMetrics[]
  pageViews: PageViewMetrics[]
  userEngagement: UserEngagementMetrics
  performance?: PerformanceMetrics
  lastUpdated: string
}
