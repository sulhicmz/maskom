"use client"

import React from 'react'
import { AnalyticsSummary } from '@/types/analytics'
import { formatNumber, formatPercentage, formatDuration } from '@/utils/analytics'

interface AnalyticsSummaryProps {
  summary: AnalyticsSummary
}

const AnalyticsSummaryCards: React.FC<AnalyticsSummaryProps> = ({ summary }) => {
  const cards = [
    {
      title: 'Total Submissions',
      value: formatNumber(summary.totalFormSubmissions),
      description: 'All form submissions',
      color: 'primary'
    },
    {
      title: 'Form Success Rate',
      value: formatPercentage(summary.formSuccessRate),
      description: 'Successful submissions',
      color: 'success'
    },
    {
      title: 'Total Page Views',
      value: formatNumber(summary.totalPageViews),
      description: 'Page visits',
      color: 'info'
    },
    {
      title: 'Avg Session Duration',
      value: formatDuration(summary.avgSessionDuration),
      description: 'Time on site',
      color: 'warning'
    },
    {
      title: 'Conversion Rate',
      value: formatPercentage(summary.conversionRate),
      description: 'Submissions per view',
      color: 'primary'
    },
    {
      title: 'Engagement Score',
      value: `${summary.engagementScore}/100`,
      description: 'User engagement',
      color: 'success'
    }
  ]

  const getColorClass = (color: string): string => {
    const colorMap: Record<string, string> = {
      primary: 'text-primary',
      success: 'text-success',
      info: 'text-info',
      warning: 'text-warning',
      danger: 'text-danger'
    }
    return colorMap[color] || 'text-primary'
  }

  return (
    <div className="row">
      {cards.map((card, index) => (
        <div key={index} className="col-xl-4 col-lg-6 col-md-6 mb-4">
          <div className="card h-100 shadow-sm">
            <div className="card-body">
              <h6 className="card-subtitle text-muted mb-2">{card.title}</h6>
              <h3 className={`card-title ${getColorClass(card.color)} mb-2`}>
                {card.value}
              </h3>
              <p className="card-text text-muted small">{card.description}</p>
            </div>
          </div>
        </div>
      ))}
    </div>
  )
}

export default AnalyticsSummaryCards
