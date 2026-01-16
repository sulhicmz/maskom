"use client"

import React, { useEffect, useState, memo } from 'react'
import { useTheme } from '@/contexts/ThemeContext'
import { useAuthService } from '@/hooks/useAuthService'
import AnalyticsSummaryCards from './AnalyticsSummary'
import AnalyticsChart from './AnalyticsChart'
import PerformanceMetrics from './PerformanceMetrics'
import analyticsData from '@/data/analyticsData'
import { calculateAnalyticsSummary } from '@/utils/analytics'
import { formatAsPercentage } from '@/utils/formatPercentage'
import { useRouter } from 'next/navigation'
import type { FormSubmissionMetrics, PageViewMetrics } from '@/types/analytics'

const FormSubmissionRow = memo(({ form, index }: { form: FormSubmissionMetrics; index: number }) => {
  return (
    <tr key={index}>
      <td>
        <span className="badge bg-primary">{form.formType}</span>
      </td>
      <td>{form.totalSubmissions}</td>
      <td className="text-success">{form.successfulSubmissions}</td>
      <td className="text-danger">{form.failedSubmissions}</td>
      <td>{formatAsPercentage(form.successfulSubmissions, form.totalSubmissions)}</td>
      <td>{form.avgCompletionTime}s</td>
    </tr>
  )
})

FormSubmissionRow.displayName = 'FormSubmissionRow'

const PageViewRow = memo(({ page, index }: { page: PageViewMetrics; index: number }) => {
  return (
    <tr key={index}>
      <td>
        <a href={page.pagePath} className="text-decoration-none">
          {page.pageTitle}
        </a>
      </td>
      <td>{page.totalViews}</td>
      <td>{page.uniqueViews}</td>
      <td>{page.avgTimeOnPage}s</td>
      <td>{formatAsPercentage(page.bounceRate * 100, 100)}</td>
    </tr>
  )
})

PageViewRow.displayName = 'PageViewRow'

const AnalyticsDashboard: React.FC = () => {
  const { theme } = useTheme()
  const { user } = useAuthService()
  const router = useRouter()
  const [isClient, setIsClient] = useState(false)

  useEffect(() => {
    setIsClient(true)

    if (!user) {
      router.push('/login')
    }
  }, [user, router])

  if (!isClient) {
    return (
      <div className="d-flex justify-content-center align-items-center" style={{ minHeight: '400px' }}>
        <div className="spinner-border text-primary" role="status">
          <span className="visually-hidden">Loading...</span>
        </div>
      </div>
    )
  }

  if (!user) {
    return null
  }

  const summary = calculateAnalyticsSummary(analyticsData)
  const contactForm = analyticsData.formSubmissions.find(f => f.formType === 'contact')
  const homePageViews = analyticsData.pageViews.find(p => p.pagePath === '/')

  return (
    <section className={`analytics-section ${theme === 'dark' ? 'dark-mode' : ''}`}>
      <div className="container">
        <div className="row">
          <div className="col-12">
            <div className="section-title text-center mb-5">
              <h2>Analytics Dashboard</h2>
              <p className="text-muted">Monitor your website performance and user engagement</p>
            </div>
          </div>
        </div>

        <AnalyticsSummaryCards summary={summary} />

        <div className="row mt-4">
          <div className="col-12">
            <PerformanceMetrics />
          </div>
        </div>

        <div className="row mt-4">
          <div className="col-xl-6 col-lg-12 mb-4">
            {contactForm && (
              <AnalyticsChart
                title="Contact Form Submissions (Last 14 Days)"
                data={contactForm}
                type="form"
              />
            )}
          </div>
          <div className="col-xl-6 col-lg-12 mb-4">
            {homePageViews && (
              <AnalyticsChart
                title="Home Page Views (Last 14 Days)"
                data={homePageViews}
                type="page"
              />
            )}
          </div>
        </div>

        <div className="row mt-4">
          <div className="col-12">
            <div className="card shadow-sm">
              <div className="card-header bg-white">
                <h5 className="mb-0">Form Submissions Breakdown</h5>
              </div>
              <div className="card-body">
                <div className="table-responsive">
                  <table className="table table-hover">
                    <thead>
                      <tr>
                        <th>Form Type</th>
                        <th>Total</th>
                        <th>Successful</th>
                        <th>Failed</th>
                        <th>Success Rate</th>
                        <th>Avg Completion Time</th>
                      </tr>
                    </thead>
                    <tbody>
                      {analyticsData.formSubmissions.map((form, index) => (
                        <FormSubmissionRow key={index} form={form} index={index} />
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="row mt-4">
          <div className="col-12">
            <div className="card shadow-sm">
              <div className="card-header bg-white">
                <h5 className="mb-0">Page Views Breakdown</h5>
              </div>
              <div className="card-body">
                <div className="table-responsive">
                  <table className="table table-hover">
                    <thead>
                      <tr>
                        <th>Page</th>
                        <th>Total Views</th>
                        <th>Unique Views</th>
                        <th>Avg Time on Page</th>
                        <th>Bounce Rate</th>
                      </tr>
                    </thead>
                    <tbody>
                      {analyticsData.pageViews.map((page, index) => (
                        <PageViewRow key={index} page={page} index={index} />
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}

export default AnalyticsDashboard
