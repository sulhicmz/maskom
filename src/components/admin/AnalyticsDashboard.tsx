"use client"

import React, { useEffect, useState } from 'react'
import { useTheme } from '@/contexts/ThemeContext'
import { useAuthService } from '@/hooks/useAuthService'
import AnalyticsSummaryCards from './AnalyticsSummary'
import AnalyticsChart from './AnalyticsChart'
import PerformanceMetrics from './PerformanceMetrics'
import LoadingSpinner from '@/components/ui/LoadingSpinner'
import FormSubmissionsTable from './FormSubmissionsTable'
import PageViewsTable from './PageViewsTable'
import analyticsData from '@/data/analyticsData'
import { calculateAnalyticsSummary } from '@/utils/analytics'
import { useRouter } from 'next/navigation'

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
    return <LoadingSpinner minHeight={400} color="primary" />
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
            <FormSubmissionsTable data={analyticsData.formSubmissions} />
          </div>
        </div>

        <div className="row mt-4">
          <div className="col-12">
            <PageViewsTable data={analyticsData.pageViews} />
          </div>
        </div>
      </div>
    </section>
  )
}

export default AnalyticsDashboard
