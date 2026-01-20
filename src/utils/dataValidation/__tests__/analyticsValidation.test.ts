import {
  validateDateSubmission,
  validateDatePageView,
  validateFormSubmissionMetrics,
  validatePageViewMetrics,
  validateUserEngagementMetrics,
  validateAnalyticsData
} from '../analyticsValidation'

describe('Analytics Data Validation', () => {
  describe('validateDateSubmission', () => {
    it('should validate correct date submission', () => {
      const submission = {
        date: '2025-12-01',
        count: 10,
        successful: 8,
        failed: 2
      }

      const result = validateDateSubmission(submission)
      expect(result.isValid).toBe(true)
      expect(result.errors).toHaveLength(0)
    })

    it('should reject invalid date format', () => {
      const submission = {
        date: '2025/12/01',
        count: 10,
        successful: 8,
        failed: 2
      }

      const result = validateDateSubmission(submission)
      expect(result.isValid).toBe(false)
      expect(result.errors).toContain('Date must be in ISO 8601 format (YYYY-MM-DD)')
    })

    it('should reject negative count', () => {
      const submission = {
        date: '2025-12-01',
        count: -1,
        successful: 8,
        failed: 2
      }

      const result = validateDateSubmission(submission)
      expect(result.isValid).toBe(false)
      expect(result.errors).toContain('Count must be a non-negative number')
    })

    it('should reject mismatched total', () => {
      const submission = {
        date: '2025-12-01',
        count: 10,
        successful: 8,
        failed: 3
      }

      const result = validateDateSubmission(submission)
      expect(result.isValid).toBe(false)
      expect(result.errors).toContain('Successful + failed must equal count')
    })
  })

  describe('validateDatePageView', () => {
    it('should validate correct date page view', () => {
      const pageView = {
        date: '2025-12-01',
        views: 100,
        unique: 80
      }

      const result = validateDatePageView(pageView)
      expect(result.isValid).toBe(true)
      expect(result.errors).toHaveLength(0)
    })

    it('should reject unique views exceeding total views', () => {
      const pageView = {
        date: '2025-12-01',
        views: 80,
        unique: 100
      }

      const result = validateDatePageView(pageView)
      expect(result.isValid).toBe(false)
      expect(result.errors).toContain('Unique views cannot exceed total views')
    })

    it('should reject negative views', () => {
      const pageView = {
        date: '2025-12-01',
        views: -10,
        unique: 8
      }

      const result = validateDatePageView(pageView)
      expect(result.isValid).toBe(false)
      expect(result.errors).toContain('Views must be a non-negative number')
    })
  })

  describe('validateFormSubmissionMetrics', () => {
    it('should validate correct form metrics', () => {
      const metrics = {
        formType: 'contact',
        totalSubmissions: 100,
        successfulSubmissions: 80,
        failedSubmissions: 20,
        avgCompletionTime: 180,
        submissionsByDate: [
          { date: '2025-12-01', count: 10, successful: 8, failed: 2 }
        ]
      }

      const result = validateFormSubmissionMetrics(metrics)
      expect(result.isValid).toBe(true)
      expect(result.errors).toHaveLength(0)
    })

    it('should reject invalid form type', () => {
      const metrics = {
        formType: 'invalid',
        totalSubmissions: 100,
        successfulSubmissions: 80,
        failedSubmissions: 20,
        avgCompletionTime: 180,
        submissionsByDate: []
      }

       
      const result = validateFormSubmissionMetrics(metrics as any)
      expect(result.isValid).toBe(false)
      expect(result.errors.some(e => e.includes('Form type must be one of'))).toBe(true)
    })

    it('should reject mismatched totals', () => {
      const metrics = {
        formType: 'contact',
        totalSubmissions: 100,
        successfulSubmissions: 80,
        failedSubmissions: 30,
        avgCompletionTime: 180,
        submissionsByDate: []
      }

      const result = validateFormSubmissionMetrics(metrics)
      expect(result.isValid).toBe(false)
      expect(result.errors).toContain('Successful + failed submissions must equal total submissions')
    })

    it('should reject zero or negative completion time', () => {
      const metrics = {
        formType: 'contact',
        totalSubmissions: 100,
        successfulSubmissions: 80,
        failedSubmissions: 20,
        avgCompletionTime: 0,
        submissionsByDate: []
      }

      const result = validateFormSubmissionMetrics(metrics)
      expect(result.isValid).toBe(false)
      expect(result.errors).toContain('Average completion time must be a positive number')
    })
  })

  describe('validatePageViewMetrics', () => {
    it('should validate correct page metrics', () => {
      const metrics = {
        pagePath: '/',
        pageTitle: 'Home',
        totalViews: 1000,
        uniqueViews: 800,
        avgTimeOnPage: 95,
        bounceRate: 0.32,
        viewsByDate: [
          { date: '2025-12-01', views: 100, unique: 80 }
        ]
      }

      const result = validatePageViewMetrics(metrics)
      expect(result.isValid).toBe(true)
      expect(result.errors).toHaveLength(0)
    })

    it('should reject unique views exceeding total views', () => {
      const metrics = {
        pagePath: '/',
        pageTitle: 'Home',
        totalViews: 800,
        uniqueViews: 1000,
        avgTimeOnPage: 95,
        bounceRate: 0.32,
        viewsByDate: []
      }

      const result = validatePageViewMetrics(metrics)
      expect(result.isValid).toBe(false)
      expect(result.errors).toContain('Unique views cannot exceed total views')
    })

    it('should reject bounce rate out of range', () => {
      const metrics = {
        pagePath: '/',
        pageTitle: 'Home',
        totalViews: 1000,
        uniqueViews: 800,
        avgTimeOnPage: 95,
        bounceRate: 1.5,
        viewsByDate: []
      }

      const result = validatePageViewMetrics(metrics)
      expect(result.isValid).toBe(false)
      expect(result.errors).toContain('Bounce rate must be between 0 and 1')
    })

    it('should reject missing page path', () => {
      const metrics = {
        pagePath: '',
        pageTitle: 'Home',
        totalViews: 1000,
        uniqueViews: 800,
        avgTimeOnPage: 95,
        bounceRate: 0.32,
        viewsByDate: []
      }

      const result = validatePageViewMetrics(metrics)
      expect(result.isValid).toBe(false)
      expect(result.errors).toContain('Page path is required and must be a string')
    })
  })

  describe('validateUserEngagementMetrics', () => {
    it('should validate correct engagement metrics', () => {
      const metrics = {
        totalSessions: 100,
        avgSessionDuration: 185,
        pagesPerSession: 2.8,
        returnVisitorRate: 0.42,
        engagedSessions: 50
      }

      const result = validateUserEngagementMetrics(metrics)
      expect(result.isValid).toBe(true)
      expect(result.errors).toHaveLength(0)
    })

    it('should reject engaged sessions exceeding total sessions', () => {
      const metrics = {
        totalSessions: 50,
        avgSessionDuration: 185,
        pagesPerSession: 2.8,
        returnVisitorRate: 0.42,
        engagedSessions: 100
      }

      const result = validateUserEngagementMetrics(metrics)
      expect(result.isValid).toBe(false)
      expect(result.errors).toContain('Engaged sessions cannot exceed total sessions')
    })

    it('should reject return visitor rate out of range', () => {
      const metrics = {
        totalSessions: 100,
        avgSessionDuration: 185,
        pagesPerSession: 2.8,
        returnVisitorRate: 1.5,
        engagedSessions: 50
      }

      const result = validateUserEngagementMetrics(metrics)
      expect(result.isValid).toBe(false)
      expect(result.errors).toContain('Return visitor rate must be between 0 and 1')
    })

    it('should reject negative session duration', () => {
      const metrics = {
        totalSessions: 100,
        avgSessionDuration: -10,
        pagesPerSession: 2.8,
        returnVisitorRate: 0.42,
        engagedSessions: 50
      }

      const result = validateUserEngagementMetrics(metrics)
      expect(result.isValid).toBe(false)
      expect(result.errors).toContain('Average session duration must be a positive number')
    })
  })

  describe('validateAnalyticsData', () => {
    it('should validate complete analytics data', () => {
      const data = {
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

      const result = validateAnalyticsData(data)
      expect(result.isValid).toBe(true)
      expect(result.errors).toHaveLength(0)
    })

    it('should reject invalid form submissions', () => {
      const data = {
        formSubmissions: [
          {
            formType: 'invalid',
            totalSubmissions: 100,
            successfulSubmissions: 80,
            failedSubmissions: 20,
            avgCompletionTime: 180,
            submissionsByDate: []
          }
        ] as any,  
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

      const result = validateAnalyticsData(data)
      expect(result.isValid).toBe(false)
      expect(result.errors.length).toBeGreaterThan(0)
    })

    it('should reject missing last updated', () => {
      const data = {
        formSubmissions: [],
        pageViews: [],
        userEngagement: {
          totalSessions: 100,
          avgSessionDuration: 185,
          pagesPerSession: 2.8,
          returnVisitorRate: 0.42,
          engagedSessions: 50
        },
        lastUpdated: '' as any  
      }

      const result = validateAnalyticsData(data)
      expect(result.isValid).toBe(false)
      expect(result.errors).toContain('Last updated is required and must be a string')
    })
  })
})
