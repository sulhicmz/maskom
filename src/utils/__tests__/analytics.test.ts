import {
  trackPageView,
  getPageViews,
  resetPageViews,
  trackFormSubmission,
  getFormSubmissions,
  resetFormSubmissions,
  calculateConversionRate,
  calculateEngagementScore,
  calculateFormSuccessRate,
  calculateAnalyticsSummary,
  formatNumber,
  formatPercentage,
  formatDuration
} from '../analytics'
import { AnalyticsData } from '@/types/analytics'

describe('Analytics Utilities', () => {
  beforeEach(() => {
    resetPageViews()
    resetFormSubmissions()
  })

  describe('trackPageView and getPageViews', () => {
    it('should track page views correctly', () => {
      trackPageView('/home')
      trackPageView('/home')
      trackPageView('/home')

      const views = getPageViews('/home')
      expect(views.count).toBe(3)
      expect(views.unique).toBe(0)
    })

    it('should track unique page views with session ID', () => {
      trackPageView('/home', 'session1')
      trackPageView('/home', 'session1')
      trackPageView('/home', 'session2')

      const views = getPageViews('/home')
      expect(views.count).toBe(3)
      expect(views.unique).toBe(2)
    })

    it('should return zero views for non-existent page', () => {
      const views = getPageViews('/non-existent')
      expect(views.count).toBe(0)
      expect(views.unique).toBe(0)
    })

    it('should reset page views correctly', () => {
      trackPageView('/home')
      trackPageView('/about')

      resetPageViews()

      const homeViews = getPageViews('/home')
      const aboutViews = getPageViews('/about')

      expect(homeViews.count).toBe(0)
      expect(aboutViews.count).toBe(0)
    })
  })

  describe('trackFormSubmission and getFormSubmissions', () => {
    it('should track successful form submissions', () => {
      trackFormSubmission('contact', true)
      trackFormSubmission('contact', true)

      const submissions = getFormSubmissions('contact')
      expect(submissions.count).toBe(2)
      expect(submissions.successful).toBe(2)
      expect(submissions.failed).toBe(0)
    })

    it('should track failed form submissions', () => {
      trackFormSubmission('contact', false)
      trackFormSubmission('contact', false)

      const submissions = getFormSubmissions('contact')
      expect(submissions.count).toBe(2)
      expect(submissions.successful).toBe(0)
      expect(submissions.failed).toBe(2)
    })

    it('should track mixed submissions', () => {
      trackFormSubmission('contact', true)
      trackFormSubmission('contact', false)
      trackFormSubmission('contact', true)

      const submissions = getFormSubmissions('contact')
      expect(submissions.count).toBe(3)
      expect(submissions.successful).toBe(2)
      expect(submissions.failed).toBe(1)
    })

    it('should return zero submissions for non-existent form', () => {
      const submissions = getFormSubmissions('non-existent')
      expect(submissions.count).toBe(0)
      expect(submissions.successful).toBe(0)
      expect(submissions.failed).toBe(0)
    })

    it('should reset form submissions correctly', () => {
      trackFormSubmission('contact', true)
      trackFormSubmission('login', true)

      resetFormSubmissions()

      const contactSubmissions = getFormSubmissions('contact')
      const loginSubmissions = getFormSubmissions('login')

      expect(contactSubmissions.count).toBe(0)
      expect(loginSubmissions.count).toBe(0)
    })
  })

  describe('calculateConversionRate', () => {
    it('should calculate conversion rate correctly', () => {
      trackFormSubmission('contact', true)
      trackFormSubmission('contact', true)
      trackFormSubmission('contact', true)

      const conversionRate = calculateConversionRate('contact', 100)
      expect(conversionRate).toBe(3)
    })

    it('should return 0 conversion rate when no submissions', () => {
      const conversionRate = calculateConversionRate('contact', 100)
      expect(conversionRate).toBe(0)
    })

    it('should return 0 conversion rate when total views is 0', () => {
      trackFormSubmission('contact', true)

      const conversionRate = calculateConversionRate('contact', 0)
      expect(conversionRate).toBe(0)
    })
  })

  describe('calculateFormSuccessRate', () => {
    it('should calculate success rate correctly', () => {
      const metrics = {
        formType: 'contact' as const,
        totalSubmissions: 100,
        successfulSubmissions: 80,
        failedSubmissions: 20,
        avgCompletionTime: 180,
        submissionsByDate: []
      }

      const successRate = calculateFormSuccessRate(metrics)
      expect(successRate).toBe(80)
    })

    it('should return 0 success rate when no submissions', () => {
      const metrics = {
        formType: 'contact' as const,
        totalSubmissions: 0,
        successfulSubmissions: 0,
        failedSubmissions: 0,
        avgCompletionTime: 0,
        submissionsByDate: []
      }

      const successRate = calculateFormSuccessRate(metrics)
      expect(successRate).toBe(0)
    })
  })

  describe('calculateEngagementScore', () => {
    it('should calculate engagement score correctly', () => {
      const data: AnalyticsData = {
        formSubmissions: [],
        pageViews: [],
        userEngagement: {
          totalSessions: 100,
          avgSessionDuration: 185,
          pagesPerSession: 2.8,
          returnVisitorRate: 0.42,
          engagedSessions: 50
        },
        lastUpdated: new Date().toISOString()
      }

      const score = calculateEngagementScore(data)
      expect(score).toBeGreaterThanOrEqual(0)
      expect(score).toBeLessThanOrEqual(100)
    })

    it('should calculate maximum engagement score', () => {
      const data: AnalyticsData = {
        formSubmissions: [],
        pageViews: [],
        userEngagement: {
          totalSessions: 100,
          avgSessionDuration: 300,
          pagesPerSession: 5,
          returnVisitorRate: 1,
          engagedSessions: 100
        },
        lastUpdated: new Date().toISOString()
      }

      const score = calculateEngagementScore(data)
      expect(score).toBe(100)
    })
  })

  describe('calculateAnalyticsSummary', () => {
    it('should calculate summary correctly', () => {
      const data: AnalyticsData = {
        formSubmissions: [
          {
            formType: 'contact',
            totalSubmissions: 100,
            successfulSubmissions: 80,
            failedSubmissions: 20,
            avgCompletionTime: 180,
            submissionsByDate: []
          }
        ],
        pageViews: [
          {
            pagePath: '/',
            pageTitle: 'Home',
            totalViews: 1000,
            uniqueViews: 800,
            avgTimeOnPage: 95,
            bounceRate: 0.32,
            viewsByDate: []
          }
        ],
        userEngagement: {
          totalSessions: 100,
          avgSessionDuration: 185,
          pagesPerSession: 2.8,
          returnVisitorRate: 0.42,
          engagedSessions: 50
        },
        lastUpdated: new Date().toISOString()
      }

      const summary = calculateAnalyticsSummary(data)

      expect(summary.totalFormSubmissions).toBe(100)
      expect(summary.formSuccessRate).toBe(80)
      expect(summary.totalPageViews).toBe(1000)
      expect(summary.avgSessionDuration).toBe(185)
      expect(summary.conversionRate).toBe(8)
      expect(summary.engagementScore).toBeGreaterThan(0)
    })
  })

  describe('Formatting Utilities', () => {
    it('should format numbers correctly', () => {
      expect(formatNumber(1000)).toBe('1.000')
      expect(formatNumber(1000000)).toBe('1.000.000')
      expect(formatNumber(0)).toBe('0')
    })

    it('should format percentages correctly', () => {
      expect(formatPercentage(80.5)).toBe('80.5%')
      expect(formatPercentage(100)).toBe('100.0%')
      expect(formatPercentage(0)).toBe('0.0%')
      expect(formatPercentage(50.123)).toBe('50.1%')
    })

    it('should format duration correctly', () => {
      expect(formatDuration(45)).toBe('45s')
      expect(formatDuration(90)).toBe('1m 30s')
      expect(formatDuration(125)).toBe('2m 5s')
      expect(formatDuration(60)).toBe('1m 0s')
    })
  })
})
