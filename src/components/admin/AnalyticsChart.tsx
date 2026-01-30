"use client"

import React, { memo } from 'react'
import { FormSubmissionMetrics, PageViewMetrics, DateSubmission, DatePageView } from '@/types/analytics'
import { formatNumber } from '@/utils/analytics'
import { formatAsPercentage } from '@/utils/formatPercentage'

interface AnalyticsChartProps {
  title: string
  data: FormSubmissionMetrics | PageViewMetrics
  type: 'form' | 'page'
}

const AnalyticsChart: React.FC<AnalyticsChartProps> = ({ title, data, type }) => {
  const isForm = type === 'form'
  const chartData = isForm
    ? (data as FormSubmissionMetrics).submissionsByDate
    : (data as PageViewMetrics).viewsByDate

  const maxValue = Math.max(...chartData.map((d): number => {
    if (isForm) {
      return (d as DateSubmission).count
    } else {
      return (d as DatePageView).views
    }
  }))

  const getBarColor = (index: number): string => {
    const colors = [
      'bg-primary',
      'bg-success',
      'bg-info',
      'bg-warning',
      'bg-danger'
    ]
    return colors[index % colors.length]
  }

  return (
    <div className="card shadow-sm">
      <div className="card-header bg-white">
        <h5 className="mb-0">{title}</h5>
      </div>
      <div className="card-body">
        <div className="d-flex flex-column">
          {chartData.map((item, index) => {
            const value = isForm ? (item as DateSubmission).count : (item as DatePageView).views
            const percentageValue = (value / maxValue) * 100

            return (
              <div key={index} className="mb-3">
                <div className="d-flex justify-content-between mb-1">
                  <span className="small text-muted">{item.date}</span>
                  <span className="small fw-bold">{formatNumber(value)}</span>
                </div>
                <div className="progress" style={{ height: '24px' }}>
                  <div
                    className={`progress-bar ${getBarColor(index)} progress-bar-striped`}
                    role="progressbar"
                    style={{ width: `${percentageValue}%` }}
                    aria-valuenow={value}
                    aria-valuemin={0}
                    aria-valuemax={maxValue}
                  >
                    {formatAsPercentage(value, maxValue)}
                  </div>
                </div>
              </div>
            )
          })}
        </div>
      </div>
    </div>
  )
}

export default memo(AnalyticsChart)
