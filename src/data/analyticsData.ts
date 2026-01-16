import { AnalyticsData, FormSubmissionMetrics, PageViewMetrics, UserEngagementMetrics, PerformanceMetrics } from '@/types/analytics'

const formSubmissions: FormSubmissionMetrics[] = [
  {
    formType: 'contact',
    totalSubmissions: 245,
    successfulSubmissions: 220,
    failedSubmissions: 25,
    avgCompletionTime: 180,
    submissionsByDate: [
      { date: '2025-12-01', count: 15, successful: 14, failed: 1 },
      { date: '2025-12-02', count: 18, successful: 16, failed: 2 },
      { date: '2025-12-03', count: 20, successful: 19, failed: 1 },
      { date: '2025-12-04', count: 22, successful: 20, failed: 2 },
      { date: '2025-12-05', count: 17, successful: 15, failed: 2 },
      { date: '2025-12-06', count: 25, successful: 23, failed: 2 },
      { date: '2025-12-07', count: 21, successful: 19, failed: 2 },
      { date: '2025-12-08', count: 19, successful: 17, failed: 2 },
      { date: '2025-12-09', count: 23, successful: 21, failed: 2 },
      { date: '2025-12-10', count: 20, successful: 18, failed: 2 },
      { date: '2025-12-11', count: 18, successful: 16, failed: 2 },
      { date: '2025-12-12', count: 16, successful: 15, failed: 1 },
      { date: '2025-12-13', count: 14, successful: 13, failed: 1 },
      { date: '2025-12-14', count: 17, successful: 16, failed: 1 },
    ]
  },
  {
    formType: 'login',
    totalSubmissions: 542,
    successfulSubmissions: 520,
    failedSubmissions: 22,
    avgCompletionTime: 45,
    submissionsByDate: [
      { date: '2025-12-01', count: 35, successful: 34, failed: 1 },
      { date: '2025-12-02', count: 42, successful: 40, failed: 2 },
      { date: '2025-12-03', count: 38, successful: 36, failed: 2 },
      { date: '2025-12-04', count: 45, successful: 43, failed: 2 },
      { date: '2025-12-05', count: 40, successful: 38, failed: 2 },
      { date: '2025-12-06', count: 48, successful: 46, failed: 2 },
      { date: '2025-12-07', count: 44, successful: 42, failed: 2 },
      { date: '2025-12-08', count: 36, successful: 34, failed: 2 },
      { date: '2025-12-09', count: 42, successful: 40, failed: 2 },
      { date: '2025-12-10', count: 39, successful: 37, failed: 2 },
      { date: '2025-12-11', count: 35, successful: 34, failed: 1 },
      { date: '2025-12-12', count: 32, successful: 31, failed: 1 },
      { date: '2025-12-13', count: 30, successful: 29, failed: 1 },
      { date: '2025-12-14', count: 36, successful: 35, failed: 1 },
    ]
  },
  {
    formType: 'signup',
    totalSubmissions: 328,
    successfulSubmissions: 300,
    failedSubmissions: 28,
    avgCompletionTime: 210,
    submissionsByDate: [
      { date: '2025-12-01', count: 22, successful: 20, failed: 2 },
      { date: '2025-12-02', count: 25, successful: 23, failed: 2 },
      { date: '2025-12-03', count: 28, successful: 26, failed: 2 },
      { date: '2025-12-04', count: 30, successful: 27, failed: 3 },
      { date: '2025-12-05', count: 24, successful: 22, failed: 2 },
      { date: '2025-12-06', count: 32, successful: 29, failed: 3 },
      { date: '2025-12-07', count: 29, successful: 26, failed: 3 },
      { date: '2025-12-08', count: 26, successful: 24, failed: 2 },
      { date: '2025-12-09', count: 27, successful: 25, failed: 2 },
      { date: '2025-12-10', count: 23, successful: 21, failed: 2 },
      { date: '2025-12-11', count: 21, successful: 20, failed: 1 },
      { date: '2025-12-12', count: 19, successful: 18, failed: 1 },
      { date: '2025-12-13', count: 17, successful: 16, failed: 1 },
      { date: '2025-12-14', count: 25, successful: 23, failed: 2 },
    ]
  },
  {
    formType: 'blog',
    totalSubmissions: 156,
    successfulSubmissions: 145,
    failedSubmissions: 11,
    avgCompletionTime: 300,
    submissionsByDate: [
      { date: '2025-12-01', count: 12, successful: 11, failed: 1 },
      { date: '2025-12-02', count: 10, successful: 9, failed: 1 },
      { date: '2025-12-03', count: 14, successful: 13, failed: 1 },
      { date: '2025-12-04', count: 11, successful: 10, failed: 1 },
      { date: '2025-12-05', count: 13, successful: 12, failed: 1 },
      { date: '2025-12-06', count: 15, successful: 14, failed: 1 },
      { date: '2025-12-07', count: 12, successful: 11, failed: 1 },
      { date: '2025-12-08', count: 9, successful: 8, failed: 1 },
      { date: '2025-12-09', count: 11, successful: 10, failed: 1 },
      { date: '2025-12-10', count: 10, successful: 9, failed: 1 },
      { date: '2025-12-11', count: 8, successful: 8, failed: 0 },
      { date: '2025-12-12', count: 9, successful: 9, failed: 0 },
      { date: '2025-12-13', count: 7, successful: 7, failed: 0 },
      { date: '2025-12-14', count: 15, successful: 14, failed: 1 },
    ]
  }
]

const pageViews: PageViewMetrics[] = [
  {
    pagePath: '/',
    pageTitle: 'Home',
    totalViews: 2450,
    uniqueViews: 1820,
    avgTimeOnPage: 95,
    bounceRate: 0.32,
    viewsByDate: [
      { date: '2025-12-01', views: 180, unique: 135 },
      { date: '2025-12-02', views: 165, unique: 120 },
      { date: '2025-12-03', views: 190, unique: 145 },
      { date: '2025-12-04', views: 175, unique: 130 },
      { date: '2025-12-05', views: 170, unique: 125 },
      { date: '2025-12-06', views: 200, unique: 150 },
      { date: '2025-12-07', views: 185, unique: 140 },
      { date: '2025-12-08', views: 160, unique: 115 },
      { date: '2025-12-09', views: 175, unique: 130 },
      { date: '2025-12-10', views: 165, unique: 120 },
      { date: '2025-12-11', views: 155, unique: 115 },
      { date: '2025-12-12', views: 150, unique: 110 },
      { date: '2025-12-13', views: 145, unique: 105 },
      { date: '2025-12-14', views: 185, unique: 140 },
    ]
  },
  {
    pagePath: '/about',
    pageTitle: 'About',
    totalViews: 890,
    uniqueViews: 750,
    avgTimeOnPage: 120,
    bounceRate: 0.28,
    viewsByDate: [
      { date: '2025-12-01', views: 65, unique: 55 },
      { date: '2025-12-02', views: 60, unique: 50 },
      { date: '2025-12-03', views: 70, unique: 60 },
      { date: '2025-12-04', views: 68, unique: 58 },
      { date: '2025-12-05', views: 62, unique: 52 },
      { date: '2025-12-06', views: 75, unique: 65 },
      { date: '2025-12-07', views: 70, unique: 60 },
      { date: '2025-12-08', views: 55, unique: 45 },
      { date: '2025-12-09', views: 62, unique: 52 },
      { date: '2025-12-10', views: 58, unique: 48 },
      { date: '2025-12-11', views: 55, unique: 47 },
      { date: '2025-12-12', views: 52, unique: 44 },
      { date: '2025-12-13', views: 50, unique: 42 },
      { date: '2025-12-14', views: 68, unique: 58 },
    ]
  },
  {
    pagePath: '/blog',
    pageTitle: 'Blog',
    totalViews: 1250,
    uniqueViews: 1050,
    avgTimeOnPage: 180,
    bounceRate: 0.38,
    viewsByDate: [
      { date: '2025-12-01', views: 95, unique: 80 },
      { date: '2025-12-02', views: 88, unique: 75 },
      { date: '2025-12-03', views: 98, unique: 82 },
      { date: '2025-12-04', views: 92, unique: 78 },
      { date: '2025-12-05', views: 85, unique: 70 },
      { date: '2025-12-06', views: 105, unique: 88 },
      { date: '2025-12-07', views: 95, unique: 80 },
      { date: '2025-12-08', views: 78, unique: 65 },
      { date: '2025-12-09', views: 88, unique: 74 },
      { date: '2025-12-10', views: 82, unique: 68 },
      { date: '2025-12-11', views: 78, unique: 65 },
      { date: '2025-12-12', views: 75, unique: 63 },
      { date: '2025-12-13', views: 72, unique: 60 },
      { date: '2025-12-14', views: 94, unique: 80 },
    ]
  },
  {
    pagePath: '/contact',
    pageTitle: 'Contact',
    totalViews: 680,
    uniqueViews: 550,
    avgTimeOnPage: 85,
    bounceRate: 0.25,
    viewsByDate: [
      { date: '2025-12-01', views: 50, unique: 40 },
      { date: '2025-12-02', views: 45, unique: 37 },
      { date: '2025-12-03', views: 52, unique: 43 },
      { date: '2025-12-04', views: 48, unique: 39 },
      { date: '2025-12-05', views: 46, unique: 38 },
      { date: '2025-12-06', views: 55, unique: 45 },
      { date: '2025-12-07', views: 50, unique: 42 },
      { date: '2025-12-08', views: 42, unique: 34 },
      { date: '2025-12-09', views: 48, unique: 40 },
      { date: '2025-12-10', views: 44, unique: 36 },
      { date: '2025-12-11', views: 42, unique: 35 },
      { date: '2025-12-12', views: 40, unique: 33 },
      { date: '2025-12-13', views: 38, unique: 31 },
      { date: '2025-12-14', views: 50, unique: 42 },
    ]
  },
  {
    pagePath: '/pricing',
    pageTitle: 'Pricing',
    totalViews: 520,
    uniqueViews: 440,
    avgTimeOnPage: 150,
    bounceRate: 0.30,
    viewsByDate: [
      { date: '2025-12-01', views: 38, unique: 32 },
      { date: '2025-12-02', views: 35, unique: 30 },
      { date: '2025-12-03', views: 42, unique: 36 },
      { date: '2025-12-04', views: 40, unique: 34 },
      { date: '2025-12-05', views: 36, unique: 30 },
      { date: '2025-12-06', views: 45, unique: 38 },
      { date: '2025-12-07', views: 40, unique: 34 },
      { date: '2025-12-08', views: 32, unique: 26 },
      { date: '2025-12-09', views: 38, unique: 32 },
      { date: '2025-12-10', views: 34, unique: 28 },
      { date: '2025-12-11', views: 32, unique: 27 },
      { date: '2025-12-12', views: 30, unique: 25 },
      { date: '2025-12-13', views: 28, unique: 23 },
      { date: '2025-12-14', views: 40, unique: 34 },
    ]
  }
]

const userEngagement: UserEngagementMetrics = {
  totalSessions: 3200,
  avgSessionDuration: 185,
  pagesPerSession: 2.8,
  returnVisitorRate: 0.42,
  engagedSessions: 1850
}

const performanceData: PerformanceMetrics = {
  metrics: {
    lcp: 1850,
    fid: 75,
    cls: 0.08,
    fcp: 1200,
    ttfb: 450
  },
  entries: [
    { metric: 'LCP', value: 1850, rating: 'good', timestamp: '2026-01-14T10:30:00.000Z' },
    { metric: 'FID', value: 75, rating: 'good', timestamp: '2026-01-14T10:30:05.000Z' },
    { metric: 'CLS', value: 0.08, rating: 'good', timestamp: '2026-01-14T10:30:10.000Z' },
    { metric: 'FCP', value: 1200, rating: 'good', timestamp: '2026-01-14T10:30:15.000Z' },
    { metric: 'TTFB', value: 450, rating: 'good', timestamp: '2026-01-14T10:30:20.000Z' }
  ],
  averageRating: 'good',
  lastUpdated: new Date().toISOString()
}

const analyticsData: AnalyticsData = {
  formSubmissions,
  pageViews,
  userEngagement,
  performance: performanceData,
  lastUpdated: new Date().toISOString()
}

export default analyticsData

export const getAnalyticsData = (): AnalyticsData => {
  return analyticsData
}

export const getFormSubmissionsByType = (formType: string): FormSubmissionMetrics | undefined => {
  return formSubmissions.find(f => f.formType === formType)
}

export const getPageViewsByPath = (pagePath: string): PageViewMetrics | undefined => {
  return pageViews.find(p => p.pagePath === pagePath)
}
