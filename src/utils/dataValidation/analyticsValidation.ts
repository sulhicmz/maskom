import { createValidator, validateDataArray, checkDuplicateIds, validateRequiredFields, validateEnum, validateRange, validateEmail } from './baseValidation'
import {
  FormSubmissionMetrics,
  PageViewMetrics,
  UserEngagementMetrics,
  AnalyticsData,
  DateSubmission,
  DatePageView
} from '@/types/analytics'

export function validateDateSubmission(item: DateSubmission): { isValid: boolean; errors: string[] } {
  const errors: string[] = []

  if (!item.date || typeof item.date !== 'string') {
    errors.push('Date is required and must be a string')
  } else if (!/^\d{4}-\d{2}-\d{2}$/.test(item.date)) {
    errors.push('Date must be in ISO 8601 format (YYYY-MM-DD)')
  }

  if (typeof item.count !== 'number' || item.count < 0) {
    errors.push('Count must be a non-negative number')
  }

  if (typeof item.successful !== 'number' || item.successful < 0) {
    errors.push('Successful must be a non-negative number')
  }

  if (typeof item.failed !== 'number' || item.failed < 0) {
    errors.push('Failed must be a non-negative number')
  }

  if (item.successful + item.failed !== item.count) {
    errors.push('Successful + failed must equal count')
  }

  return {
    isValid: errors.length === 0,
    errors
  }
}

export function validateDatePageView(item: DatePageView): { isValid: boolean; errors: string[] } {
  const errors: string[] = []

  if (!item.date || typeof item.date !== 'string') {
    errors.push('Date is required and must be a string')
  } else if (!/^\d{4}-\d{2}-\d{2}$/.test(item.date)) {
    errors.push('Date must be in ISO 8601 format (YYYY-MM-DD)')
  }

  if (typeof item.views !== 'number' || item.views < 0) {
    errors.push('Views must be a non-negative number')
  }

  if (typeof item.unique !== 'number' || item.unique < 0) {
    errors.push('Unique must be a non-negative number')
  }

  if (item.unique > item.views) {
    errors.push('Unique views cannot exceed total views')
  }

  return {
    isValid: errors.length === 0,
    errors
  }
}

export function validateFormSubmissionMetrics(item: FormSubmissionMetrics): { isValid: boolean; errors: string[] } {
  const errors: string[] = []

  const validFormTypes = ['contact', 'login', 'signup', 'blog']
  if (!item.formType || !validFormTypes.includes(item.formType)) {
    errors.push(`Form type must be one of: ${validFormTypes.join(', ')}`)
  }

  if (typeof item.totalSubmissions !== 'number' || item.totalSubmissions < 0) {
    errors.push('Total submissions must be a non-negative number')
  }

  if (typeof item.successfulSubmissions !== 'number' || item.successfulSubmissions < 0) {
    errors.push('Successful submissions must be a non-negative number')
  }

  if (typeof item.failedSubmissions !== 'number' || item.failedSubmissions < 0) {
    errors.push('Failed submissions must be a non-negative number')
  }

  if (item.successfulSubmissions + item.failedSubmissions !== item.totalSubmissions) {
    errors.push('Successful + failed submissions must equal total submissions')
  }

  if (typeof item.avgCompletionTime !== 'number' || item.avgCompletionTime <= 0) {
    errors.push('Average completion time must be a positive number')
  }

  if (!Array.isArray(item.submissionsByDate)) {
    errors.push('Submissions by date must be an array')
  } else {
    item.submissionsByDate.forEach((submission, index) => {
      const validation = validateDateSubmission(submission)
      if (!validation.isValid) {
        errors.push(`Submissions by date[${index}]: ${validation.errors.join(', ')}`)
      }
    })
  }

  return {
    isValid: errors.length === 0,
    errors
  }
}

export function validatePageViewMetrics(item: PageViewMetrics): { isValid: boolean; errors: string[] } {
  const errors: string[] = []

  if (!item.pagePath || typeof item.pagePath !== 'string') {
    errors.push('Page path is required and must be a string')
  }

  if (!item.pageTitle || typeof item.pageTitle !== 'string') {
    errors.push('Page title is required and must be a string')
  }

  if (typeof item.totalViews !== 'number' || item.totalViews < 0) {
    errors.push('Total views must be a non-negative number')
  }

  if (typeof item.uniqueViews !== 'number' || item.uniqueViews < 0) {
    errors.push('Unique views must be a non-negative number')
  }

  if (item.uniqueViews > item.totalViews) {
    errors.push('Unique views cannot exceed total views')
  }

  if (typeof item.avgTimeOnPage !== 'number' || item.avgTimeOnPage <= 0) {
    errors.push('Average time on page must be a positive number')
  }

  if (typeof item.bounceRate !== 'number' || item.bounceRate < 0 || item.bounceRate > 1) {
    errors.push('Bounce rate must be between 0 and 1')
  }

  if (!Array.isArray(item.viewsByDate)) {
    errors.push('Views by date must be an array')
  } else {
    item.viewsByDate.forEach((view, index) => {
      const validation = validateDatePageView(view)
      if (!validation.isValid) {
        errors.push(`Views by date[${index}]: ${validation.errors.join(', ')}`)
      }
    })
  }

  return {
    isValid: errors.length === 0,
    errors
  }
}

export function validateUserEngagementMetrics(item: UserEngagementMetrics): { isValid: boolean; errors: string[] } {
  const errors: string[] = []

  if (typeof item.totalSessions !== 'number' || item.totalSessions < 0) {
    errors.push('Total sessions must be a non-negative number')
  }

  if (typeof item.avgSessionDuration !== 'number' || item.avgSessionDuration <= 0) {
    errors.push('Average session duration must be a positive number')
  }

  if (typeof item.pagesPerSession !== 'number' || item.pagesPerSession <= 0) {
    errors.push('Pages per session must be a positive number')
  }

  if (typeof item.returnVisitorRate !== 'number' || item.returnVisitorRate < 0 || item.returnVisitorRate > 1) {
    errors.push('Return visitor rate must be between 0 and 1')
  }

  if (typeof item.engagedSessions !== 'number' || item.engagedSessions < 0) {
    errors.push('Engaged sessions must be a non-negative number')
  }

  if (item.engagedSessions > item.totalSessions) {
    errors.push('Engaged sessions cannot exceed total sessions')
  }

  return {
    isValid: errors.length === 0,
    errors
  }
}

export function validateAnalyticsData(data: AnalyticsData): { isValid: boolean; errors: string[] } {
  const errors: string[] = []

  if (!Array.isArray(data.formSubmissions)) {
    errors.push('Form submissions must be an array')
  } else {
    data.formSubmissions.forEach((form, index) => {
      const validation = validateFormSubmissionMetrics(form)
      if (!validation.isValid) {
        errors.push(`Form submissions[${index}]: ${validation.errors.join(', ')}`)
      }
    })
  }

  if (!Array.isArray(data.pageViews)) {
    errors.push('Page views must be an array')
  } else {
    data.pageViews.forEach((page, index) => {
      const validation = validatePageViewMetrics(page)
      if (!validation.isValid) {
        errors.push(`Page views[${index}]: ${validation.errors.join(', ')}`)
      }
    })
  }

  const engagementValidation = validateUserEngagementMetrics(data.userEngagement)
  if (!engagementValidation.isValid) {
    errors.push(`User engagement: ${engagementValidation.errors.join(', ')}`)
  }

  if (!data.lastUpdated || typeof data.lastUpdated !== 'string') {
    errors.push('Last updated is required and must be a string')
  }

  return {
    isValid: errors.length === 0,
    errors
  }
}
