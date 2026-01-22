"use client"

import React, { useEffect, useState } from 'react'
import { useTheme } from '@/contexts/ThemeContext'
import { useAuthService } from '@/hooks/useAuthService'
import { useRouter } from 'next/navigation'
import { abTestEngine } from '@/utils/abTestEngine'
import { ABTest, ABTestStatus, ABTestSuccessMetric, ABTestType } from '@/types/abTest'
import LoadingSpinner from '@/components/ui/LoadingSpinner'

interface TestFormData {
  postId: number
  type: ABTestType
  duration: number
  trafficSplit: number
  successMetric: ABTestSuccessMetric
  variantName1: string
  variantName2: string
  headline1?: string
  headline2?: string
}

const ABTestDashboard: React.FC = () => {
  const { theme } = useTheme()
  const { user } = useAuthService()
  const router = useRouter()
  const [isClient, setIsClient] = useState(false)
  const [tests, setTests] = useState<ABTest[]>([])
  const [loading, setLoading] = useState(true)
  const [showModal, setShowModal] = useState(false)
  const [formData, setFormData] = useState<TestFormData>({
    postId: 0,
    type: 'headline',
    duration: 7,
    trafficSplit: 50,
    successMetric: 'engagement',
    variantName1: 'Control',
    variantName2: 'Variant A',
    headline1: '',
    headline2: ''
  })
  const [selectedTest] = useState<ABTest | null>(null)

  useEffect(() => {
    setIsClient(true)
    if (!user) {
      router.push('/login')
    }
  }, [user, router])

  useEffect(() => {
    loadTests()
  }, [])

  const loadTests = () => {
    try {
      const allTests = abTestEngine.getAllTests()
      setTests(allTests)
    } catch (error) {
      console.error('Failed to load A/B tests:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleCreateTest = () => {
    try {
      const variant1 = {
        id: `v1-${Date.now()}`,
        testId: '',
        variantName: formData.variantName1,
        content: formData.type === 'headline' ? { title: formData.headline1 } : { title: '' },
        assignmentRate: formData.trafficSplit,
        metrics: { views: 0, clicks: 0, engagement: 0, timeOnPage: 0, conversions: 0 },
        assignedUsers: []
      }

      const variant2 = {
        id: `v2-${Date.now()}`,
        testId: '',
        variantName: formData.variantName2,
        content: formData.type === 'headline' ? { title: formData.headline2 } : { title: '' },
        assignmentRate: 100 - formData.trafficSplit,
        metrics: { views: 0, clicks: 0, engagement: 0, timeOnPage: 0, conversions: 0 },
        assignedUsers: []
      }

      abTestEngine.createTest({
        postId: formData.postId,
        type: formData.type,
        status: 'draft',
        duration: formData.duration,
        trafficSplit: formData.trafficSplit,
        successMetric: formData.successMetric,
        variants: [variant1, variant2],
        minSampleSize: 1000,
        confidenceLevel: 0.95
      })

      setShowModal(false)
      loadTests()
    } catch (error) {
      console.error('Failed to create A/B test:', error)
    }
  }

  const handleStartTest = (testId: string) => {
    try {
      abTestEngine.startTest(testId)
      loadTests()
    } catch (error) {
      console.error('Failed to start test:', error)
    }
  }

  const handlePauseTest = (testId: string) => {
    try {
      abTestEngine.pauseTest(testId)
      loadTests()
    } catch (error) {
      console.error('Failed to pause test:', error)
    }
  }

  const handleCompleteTest = (testId: string) => {
    try {
      abTestEngine.completeTest(testId)
      loadTests()
    } catch (error) {
      console.error('Failed to complete test:', error)
    }
  }

  const handleDeleteTest = (testId: string) => {
    try {
      abTestEngine.deleteTest(testId)
      loadTests()
    } catch (error) {
      console.error('Failed to delete test:', error)
    }
  }

  const handleApplyWinner = (testId: string, winnerId: string) => {
    const test = abTestEngine.getTest(testId)
    if (test) {
      const winner = test.variants.find(v => v.id === winnerId)
      console.log('Applying winner:', winner)
      alert(`Winner "${winner?.variantName}" has been applied!`)
    }
  }

  const getStatusBadge = (status: ABTestStatus) => {
    const badges = {
      draft: { bg: 'secondary', text: 'Draft' },
      running: { bg: 'success', text: 'Running' },
      paused: { bg: 'warning', text: 'Paused' },
      completed: { bg: 'primary', text: 'Completed' }
    }
    const badge = badges[status] || badges.draft
    return (
      <span className={`badge badge-${badge.bg}`}>
        {badge.text}
      </span>
    )
  }

  const stats = abTestEngine.getStatistics()

  if (!isClient) {
    return <LoadingSpinner minHeight={400} color="primary" />
  }

  if (!user) {
    return null
  }

  if (loading) {
    return <LoadingSpinner minHeight={400} color="primary" />
  }

  return (
    <section className={`analytics-section ${theme === 'dark' ? 'dark-mode' : ''}`}>
      <div className="container">
        <div className="row">
          <div className="col-12">
            <div className="section-title text-center mb-5">
              <h2>A/B Testing Dashboard</h2>
              <p className="text-muted">Optimize your content with data-driven experiments</p>
            </div>
          </div>
        </div>

        <div className="row mb-4">
          <div className="col-md-3">
            <div className="card">
              <div className="card-body">
                <h6 className="text-muted">Total Tests</h6>
                <h3 className="mb-0">{stats.totalTests}</h3>
              </div>
            </div>
          </div>
          <div className="col-md-3">
            <div className="card">
              <div className="card-body">
                <h6 className="text-muted">Running</h6>
                <h3 className="mb-0 text-success">{stats.runningTests}</h3>
              </div>
            </div>
          </div>
          <div className="col-md-3">
            <div className="card">
              <div className="card-body">
                <h6 className="text-muted">Completed</h6>
                <h3 className="mb-0 text-primary">{stats.completedTests}</h3>
              </div>
            </div>
          </div>
          <div className="col-md-3">
            <div className="card">
              <div className="card-body">
                <h6 className="text-muted">Avg Duration</h6>
                <h3 className="mb-0">
                  {Math.round(stats.averageDuration / (1000 * 60 * 60 * 24))} days
                </h3>
              </div>
            </div>
          </div>
        </div>

        <div className="row mb-4">
          <div className="col-12">
            <button 
              className="btn btn-primary"
              onClick={() => setShowModal(true)}
            >
              <i className="fas fa-plus me-2"></i>
              Buat A/B Test Baru
            </button>
          </div>
        </div>

        <div className="row">
          <div className="col-12">
            <div className="card">
              <div className="card-body">
                <h5 className="card-title mb-4">Active Tests</h5>
                {tests.length === 0 ? (
                  <div className="text-center py-5">
                    <p className="text-muted">Belum ada A/B test yang dibuat.</p>
                  </div>
                ) : (
                  <div className="table-responsive">
                    <table className="table table-hover">
                      <thead>
                        <tr>
                          <th>Post ID</th>
                          <th>Tipe</th>
                          <th>Status</th>
                          <th>Durasi</th>
                          <th>Variant</th>
                          <th>Metrik</th>
                          <th>Dimulai</th>
                          <th>Aksi</th>
                        </tr>
                      </thead>
                      <tbody>
                        {tests.map(test => (
                          <tr key={test.id}>
                            <td>#{test.postId}</td>
                            <td>{test.type}</td>
                            <td>{getStatusBadge(test.status)}</td>
                            <td>{test.duration} hari</td>
                            <td>
                              {test.variants.map(v => (
                                <div key={v.id} className="small mb-1">
                                  <strong>{v.variantName}</strong>: {v.assignmentRate}%
                                  <br />
                                  <small className="text-muted">
                                    Views: {v.metrics.views} | Clicks: {v.metrics.clicks}
                                  </small>
                                </div>
                              ))}
                            </td>
                            <td>{test.successMetric}</td>
                            <td>
                              {test.startedAt ? new Date(test.startedAt).toLocaleDateString('id-ID') : '-'}
                            </td>
                            <td>
                              {test.status === 'draft' && (
                                <button 
                                  className="btn btn-sm btn-success me-1"
                                  onClick={() => handleStartTest(test.id)}
                                >
                                  Mulai
                                </button>
                              )}
                              {test.status === 'running' && (
                                <>
                                  <button 
                                    className="btn btn-sm btn-warning me-1"
                                    onClick={() => handlePauseTest(test.id)}
                                  >
                                    Pause
                                  </button>
                                  <button 
                                    className="btn btn-sm btn-primary me-1"
                                    onClick={() => handleCompleteTest(test.id)}
                                  >
                                    Selesaikan
                                  </button>
                                </>
                              )}
                              {test.status === 'paused' && (
                                <button 
                                  className="btn btn-sm btn-success me-1"
                                  onClick={() => handleStartTest(test.id)}
                                >
                                  Lanjutkan
                                </button>
                              )}
                              {test.status === 'completed' && test.winner && (
                                <button
                                  className="btn btn-sm btn-success me-1"
                                  onClick={() => handleApplyWinner(test.id, test.winner!.winnerId)}
                                >
                                  Terapkan Pemenang
                                </button>
                              )}
                              <button 
                                className="btn btn-sm btn-danger"
                                onClick={() => handleDeleteTest(test.id)}
                              >
                                Hapus
                              </button>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>

        {selectedTest && selectedTest.winner && (
          <div className="row mt-4">
            <div className="col-12">
              <div className="card bg-success text-white">
                <div className="card-body">
                  <h5 className="card-title">Test Results</h5>
                  <p><strong>Winner:</strong> {selectedTest.winner.winnerId}</p>
                  <p><strong>Uplift:</strong> {selectedTest.winner.uplift.toFixed(2)}%</p>
                  <p><strong>P-Value:</strong> {selectedTest.winner.pValue.toFixed(4)}</p>
                  <p><strong>Statistically Significant:</strong> {selectedTest.winner.statisticalSignificance ? 'Yes' : 'No'}</p>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      {showModal && (
        <div className="modal fade show" style={{ display: 'block' }}>
          <div className="modal-dialog">
            <div className="modal-content">
              <div className="modal-header">
                <h5 className="modal-title">Buat A/B Test Baru</h5>
                <button 
                  type="button" 
                  className="btn-close" 
                  onClick={() => setShowModal(false)}
                >
                  ×
                </button>
              </div>
              <div className="modal-body">
                <form>
                  <div className="mb-3">
                    <label className="form-label">Post ID</label>
                    <input 
                      type="number" 
                      className="form-control"
                      value={formData.postId}
                      onChange={(e) => setFormData({...formData, postId: parseInt(e.target.value)})}
                    />
                  </div>
                  <div className="mb-3">
                    <label className="form-label">Tipe Test</label>
                    <select 
                      className="form-select"
                      value={formData.type}
                      onChange={(e) => setFormData({...formData, type: e.target.value as ABTestType})}
                    >
                      <option value="headline">Headline</option>
                      <option value="content">Content</option>
                      <option value="layout">Layout</option>
                      <option value="image">Image</option>
                    </select>
                  </div>
                  {formData.type === 'headline' && (
                    <>
                      <div className="mb-3">
                        <label className="form-label">Judul Control</label>
                        <input 
                          type="text" 
                          className="form-control"
                          value={formData.headline1}
                          onChange={(e) => setFormData({...formData, headline1: e.target.value})}
                          placeholder="Original Headline"
                        />
                      </div>
                      <div className="mb-3">
                        <label className="form-label">Judul Variant</label>
                        <input 
                          type="text" 
                          className="form-control"
                          value={formData.headline2}
                          onChange={(e) => setFormData({...formData, headline2: e.target.value})}
                          placeholder="New Headline"
                        />
                      </div>
                    </>
                  )}
                  <div className="mb-3">
                    <label className="form-label">Durasi (hari)</label>
                    <input 
                      type="number" 
                      className="form-control"
                      value={formData.duration}
                      onChange={(e) => setFormData({...formData, duration: parseInt(e.target.value)})}
                    />
                  </div>
                  <div className="mb-3">
                    <label className="form-label">Traffic Split (%)</label>
                    <input 
                      type="number" 
                      className="form-control"
                      value={formData.trafficSplit}
                      onChange={(e) => setFormData({...formData, trafficSplit: parseInt(e.target.value)})}
                      min="1"
                      max="99"
                    />
                  </div>
                  <div className="mb-3">
                    <label className="form-label">Success Metric</label>
                    <select 
                      className="form-select"
                      value={formData.successMetric}
                      onChange={(e) => setFormData({...formData, successMetric: e.target.value as ABTestSuccessMetric})}
                    >
                      <option value="views">Views</option>
                      <option value="clicks">Clicks</option>
                      <option value="engagement">Engagement</option>
                      <option value="timeOnPage">Time on Page</option>
                      <option value="conversions">Conversions</option>
                    </select>
                  </div>
                </form>
              </div>
              <div className="modal-footer">
                <button 
                  type="button" 
                  className="btn btn-secondary" 
                  onClick={() => setShowModal(false)}
                >
                  Batal
                </button>
                <button 
                  type="button" 
                  className="btn btn-primary" 
                  onClick={handleCreateTest}
                >
                  Buat Test
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </section>
  )
}

export default ABTestDashboard