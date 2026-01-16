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

export interface AnalyticsSummary {
  totalFormSubmissions: number
  formSuccessRate: number
  totalPageViews: number
  avgSessionDuration: number
  conversionRate: number
  engagementScore: number
}
