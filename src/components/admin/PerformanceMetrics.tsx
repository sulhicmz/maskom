"use client"

import React, { useEffect, useState } from 'react'
import { useTheme } from '@/contexts/ThemeContext'
import { WebVitalsMetrics, WebVitalsEntry } from '@/types/analytics'
import { getWebVitalsMetrics, getWebVitalsEntries, getPerformanceAlerts, hasPerformanceAlerts } from '@/utils/webVitals'

const PerformanceMetrics: React.FC = () => {
  const { theme } = useTheme()
  const [metrics, setMetrics] = useState<WebVitalsMetrics>({
    lcp: 0,
    fid: 0,
    cls: 0,
    fcp: 0,
    ttfb: 0
  })
  const [entries, setEntries] = useState<WebVitalsEntry[]>([])
  const [alerts, setAlerts] = useState<WebVitalsEntry[]>([])
  const [hasAlerts, setHasAlerts] = useState(false)

  useEffect(() => {
    const loadMetrics = () => {
      setMetrics(getWebVitalsMetrics())
      setEntries(getWebVitalsEntries())
      setAlerts(getPerformanceAlerts())
      setHasAlerts(hasPerformanceAlerts())
    }

    loadMetrics()
    const interval = setInterval(loadMetrics, 30000)

    return () => clearInterval(interval)
  }, [])

  const getRatingBadge = (rating: string) => {
    switch (rating) {
      case 'good':
        return <span className="badge bg-success">Good</span>
      case 'needs-improvement':
        return <span className="badge bg-warning text-dark">Needs Improvement</span>
      case 'poor':
        return <span className="badge bg-danger">Poor</span>
      default:
        return <span className="badge bg-secondary">Unknown</span>
    }
  }

  const formatMetricValue = (metric: string, value: number) => {
    if (metric === 'CLS') return value.toFixed(3)
    if (metric === 'LCP' || metric === 'FCP' || metric === 'TTFB') return `${Math.round(value)}ms`
    if (metric === 'FID') return `${Math.round(value)}ms`
    return value.toString()
  }

  const metricCards = [
    { key: 'lcp', label: 'Largest Contentful Paint', description: 'Time to load the largest content element' },
    { key: 'fid', label: 'First Input Delay', description: 'Time until the page responds to user interaction' },
    { key: 'cls', label: 'Cumulative Layout Shift', description: 'Unexpected layout movement during page load' },
    { key: 'fcp', label: 'First Contentful Paint', description: 'Time to render the first content element' },
    { key: 'ttfb', label: 'Time to First Byte', description: 'Time to receive the first byte of response' }
  ]

  return (
    <section className={`performance-metrics-section ${theme === 'dark' ? 'dark-mode' : ''}`}>
      <div className="container">
        <div className="row">
          <div className="col-12">
            <div className="section-title text-center mb-5">
              <h2>Performance Metrics</h2>
              <p className="text-muted">Real-time Core Web Vitals monitoring</p>
            </div>
          </div>
        </div>

        {hasAlerts && (
          <div className="row mb-4">
            <div className="col-12">
              <div className="alert alert-danger" role="alert">
                <strong>Performance Alerts:</strong> {alerts.length} metric(s) performing poorly
              </div>
            </div>
          </div>
        )}

        <div className="row">
          {metricCards.map((card) => {
            const value = metrics[card.key as keyof WebVitalsMetrics]
            const entry = entries.find(e => e.metric === card.key.toUpperCase())
            const rating = entry?.rating || 'good'

            return (
              <div key={card.key} className="col-lg-4 col-md-6 mb-4">
                <div className="card shadow-sm h-100">
                  <div className="card-body">
                    <h5 className="card-title">{card.label}</h5>
                    <div className="mb-2">
                      <span className="h3">{formatMetricValue(card.key, value)}</span>
                    </div>
                    <div className="mb-2">
                      {getRatingBadge(rating)}
                    </div>
                    <p className="card-text text-muted small">{card.description}</p>
                  </div>
                </div>
              </div>
            )
          })}
        </div>

        <div className="row mt-4">
          <div className="col-12">
            <div className="card shadow-sm">
              <div className="card-header bg-white">
                <h5 className="mb-0">Web Vitals History</h5>
              </div>
              <div className="card-body">
                <div className="table-responsive">
                  <table className="table table-hover">
                    <thead>
                      <tr>
                        <th>Metric</th>
                        <th>Value</th>
                        <th>Rating</th>
                        <th>Timestamp</th>
                      </tr>
                    </thead>
                    <tbody>
                      {entries.length === 0 ? (
                        <tr>
                          <td colSpan={4} className="text-center text-muted">
                            No performance data available yet
                          </td>
                        </tr>
                      ) : (
                        entries.map((entry, index) => (
                          <tr key={index}>
                            <td>
                              <span className="badge bg-primary">{entry.metric}</span>
                            </td>
                            <td>{formatMetricValue(entry.metric, entry.value)}</td>
                            <td>{getRatingBadge(entry.rating)}</td>
                            <td className="text-muted small">
                              {new Date(entry.timestamp).toLocaleString()}
                            </td>
                          </tr>
                        ))
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="row mt-4">
          <div className="col-12">
            <div className="card shadow-sm bg-light">
              <div className="card-body">
                <h6 className="card-title">Performance Best Practices</h6>
                <ul className="mb-0">
                  <li><strong>LCP (Largest Contentful Paint):</strong> Target {'<'} 2.5s for optimal user experience</li>
                  <li><strong>FID (First Input Delay):</strong> Target {'<'} 100ms for responsive interactions</li>
                  <li><strong>CLS (Cumulative Layout Shift):</strong> Target {'<'} 0.1 for stable visual layout</li>
                  <li><strong>FCP (First Contentful Paint):</strong> Target {'<'} 1.8s for fast perceived load time</li>
                  <li><strong>TTFB (Time to First Byte):</strong> Target {'<'} 800ms for quick server response</li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}

export default PerformanceMetrics
