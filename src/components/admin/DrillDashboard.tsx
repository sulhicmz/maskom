"use client"

import React, { useState, useEffect, useCallback, memo } from 'react'
import { useTheme } from '@/contexts/ThemeContext'
import {
  DrillStatistics,
  DrillTypeStats,
  DrillHealthStatus
} from '@/types/drill'
import LoadingSpinner from '@/components/ui/LoadingSpinner'
import { DrillEngine } from '@/utils/drillEngine'

const formatDuration = (ms: number): string => {
  const seconds = Math.floor(ms / 1000)
  const minutes = Math.floor(seconds / 60)

  if (minutes > 0) {
    return `${minutes}m ${seconds % 60}s`
  }

  return `${seconds}s`
}

const getDrillTypeLabel = (type: string): string => {
  switch (type) {
    case 'full_restore':
      return 'Pemulihan Penuh'
    case 'partial_restore':
      return 'Pemulihan Sebagian'
    case 'integrity_check':
      return 'Pemeriksaan Integritas'
    default:
      return type
  }
}

const getHealthBadgeClass = (status: DrillHealthStatus): string => {
  switch (status) {
    case 'healthy':
      return 'bg-success'
    case 'warning':
      return 'bg-warning'
    case 'critical':
      return 'bg-danger'
    default:
      return 'bg-secondary'
  }
}

const getHealthLabel = (status: DrillHealthStatus): string => {
  switch (status) {
    case 'healthy':
      return 'Sehat'
    case 'warning':
      return 'Peringatan'
    case 'critical':
      return 'Kritis'
    default:
      return status
  }
}

interface StatCardProps {
  title: string
  value: string | number
  icon: string
  color: string
  trend?: {
    value: number
    positive: boolean
  }
}

const StatCard: React.FC<StatCardProps> = memo(({ title, value, icon, color, trend }) => {
  const { theme } = useTheme()

  return (
    <div className={`card ${theme} shadow-sm`}>
      <div className="card-body">
        <div className="d-flex align-items-center">
          <div className={`bg-${color} text-white rounded-circle p-3 me-3`}>
            <i className={`bi ${icon} fs-4`}></i>
          </div>
          <div className="flex-grow-1">
            <h6 className="text-muted mb-1">{title}</h6>
            <h4 className="mb-0 fw-bold">{value}</h4>
            {trend && (
              <small className={`text-${trend.positive ? 'success' : 'danger'}`}>
                <i className={`bi bi-${trend.positive ? 'arrow-up' : 'arrow-down'} me-1`}></i>
                {Math.abs(trend.value)}%
              </small>
            )}
          </div>
        </div>
      </div>
    </div>
  )
})

StatCard.displayName = "StatCard"

const DrillTypeStatsCard: React.FC<{
  type: string
  stats: DrillTypeStats
}> = memo(({ type, stats }) => {
  const { theme } = useTheme()

  const successRate =
    stats.total >0 ? ((stats.passed / stats.total) * 100).toFixed(1) : '0'

  return (
    <div className={`card ${theme} shadow-sm`}>
      <div className="card-body">
        <h6 className="text-muted mb-3">{getDrillTypeLabel(type)}</h6>
        <div className="row g-2">
          <div className="col-6">
            <small className="text-muted d-block">Total</small>
            <strong className="fs-5">{stats.total}</strong>
          </div>
          <div className="col-6">
            <small className="text-muted d-block">Berhasil</small>
            <strong className="fs-5 text-success">{stats.passed}</strong>
          </div>
          <div className="col-6">
            <small className="text-muted d-block">Gagal</small>
            <strong className="fs-5 text-danger">{stats.failed}</strong>
          </div>
          <div className="col-6">
            <small className="text-muted d-block">Rata-rata Durasi</small>
            <strong className="fs-5">{formatDuration(stats.averageDuration)}</strong>
          </div>
        </div>
        <div className="progress mt-3" style={{ height: '6px' }}>
          <div
            className={`progress-bar bg-${parseFloat(successRate) >= 90 ? 'success' : parseFloat(successRate) >= 70 ? 'warning' : 'danger'}`}
            style={{ width: `${successRate}%` }}
            role="progressbar"
          />
        </div>
        <small className="text-muted mt-2 d-block">
          Tingkat Keberhasilan: {successRate}%
        </small>
      </div>
    </div>
  )
})

DrillTypeStatsCard.displayName = "DrillTypeStatsCard"

const DrillDashboard: React.FC = () => {
  const { theme } = useTheme()
  const [statistics, setStatistics] = useState<DrillStatistics | null>(null)
  const [loading, setLoading] = useState(true)

  const loadStatistics = useCallback(async () => {
    setLoading(true)
    try {
      const engine = DrillEngine.getInstance()
      const stats = await engine.getDrillStatistics()
      setStatistics(stats)
    } catch (error) {
      console.error('Error loading drill statistics:', error)
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    loadStatistics()
  }, [loadStatistics])

  if (loading) {
    return <LoadingSpinner />
  }

  if (!statistics) {
    return (
      <div className="alert alert-danger">
        <i className="bi bi-exclamation-triangle me-2"></i>
        Gagal memuat statistik latihan
      </div>
    )
  }

  const totalPassRate =
    statistics.totalDrills > 0
      ? ((statistics.successfulDrills / statistics.totalDrills) * 100).toFixed(1)
      : '0'

  return (
    <div className={`container-fluid py-4 ${theme}`}>
      <div className="d-flex justify-content-between align-items-center mb-4">
        <div>
          <h4 className="mb-0">
            <i className="bi bi-speedometer2 me-2"></i>
            Dasbor Latihan Pemulihan
          </h4>
          <p className="text-muted mb-0">
            Metrik dan statistik untuk latihan verifikasi backup
          </p>
        </div>
        <div>
          <span className={`badge ${getHealthBadgeClass(statistics.healthStatus)} fs-6`}>
            <i className={`bi bi-${statistics.healthStatus === 'healthy' ? 'heart-pulse' : statistics.healthStatus === 'warning' ? 'exclamation-triangle' : 'x-circle'} me-2`}></i>
            Status: {getHealthLabel(statistics.healthStatus)}
          </span>
        </div>
      </div>

      <div className="row g-4 mb-4">
        <StatCard
          title="Total Latihan"
          value={statistics.totalDrills}
          icon="bi-activity"
          color="primary"
        />
        <StatCard
          title="Berhasil"
          value={statistics.successfulDrills}
          icon="bi-check-circle"
          color="success"
        />
        <StatCard
          title="Gagal"
          value={statistics.failedDrills}
          icon="bi-x-circle"
          color="danger"
        />
        <StatCard
          title="Rata-rata Durasi"
          value={formatDuration(statistics.averageDuration)}
          icon="bi-stopwatch"
          color="info"
        />
        <StatCard
          title="Tingkat Keberhasilan"
          value={`${totalPassRate}%`}
          icon="bi-percent"
          color="success"
        />
        <StatCard
          title="Kegagalan Berurutan"
          value={statistics.consecutiveFailures}
          icon="bi-arrow-repeat"
          color="warning"
        />
      </div>

      <div className="row g-4 mb-4">
        <div className="col-12">
          <div className={`card ${theme} shadow`}>
            <div className="card-header bg-primary text-white">
              <h5 className="card-title mb-0">
                <i className="bi bi-pie-chart me-2"></i>
                Statistik Berdasarkan Tipe Latihan
              </h5>
            </div>
            <div className="card-body">
              <div className="row g-4">
                <div className="col-md-4">
                  <DrillTypeStatsCard
                    type="full_restore"
                    stats={statistics.drillTypeBreakdown.full_restore}
                  />
                </div>
                <div className="col-md-4">
                  <DrillTypeStatsCard
                    type="partial_restore"
                    stats={statistics.drillTypeBreakdown.partial_restore}
                  />
                </div>
                <div className="col-md-4">
                  <DrillTypeStatsCard
                    type="integrity_check"
                    stats={statistics.drillTypeBreakdown.integrity_check}
                  />
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="row g-4">
        <div className="col-md-6">
          <div className={`card ${theme} shadow-sm`}>
            <div className="card-body">
              <h6 className="text-muted mb-3">Latihan Terakhir</h6>
              {statistics.lastDrillDate ? (
                <div>
                  <div className="fs-5 fw-bold mb-2">
                    <i className="bi bi-clock-history me-2 text-primary"></i>
                    {new Date(statistics.lastDrillDate).toLocaleDateString('id-ID', {
                      year: 'numeric',
                      month: 'long',
                      day: 'numeric',
                      hour: '2-digit',
                      minute: '2-digit'
                    })}
                  </div>
                  <div>
                    <span className={`badge ${
                      statistics.lastDrillStatus === 'passed' ? 'bg-success' :
                      statistics.lastDrillStatus === 'failed' ? 'bg-danger' :
                      statistics.lastDrillStatus === 'running' ? 'bg-warning' : 'bg-secondary'
                    }`}>
                      {statistics.lastDrillStatus === 'passed' ? 'Berhasil' :
                       statistics.lastDrillStatus === 'failed' ? 'Gagal' :
                       statistics.lastDrillStatus === 'running' ? 'Berjalan' : statistics.lastDrillStatus}
                    </span>
                  </div>
                </div>
              ) : (
                <p className="text-muted">Tidak ada latihan yang dijalankan</p>
              )}
            </div>
          </div>
        </div>
        <div className="col-md-6">
          <div className={`card ${theme} shadow-sm`}>
            <div className="card-body">
              <h6 className="text-muted mb-3">Rekomendasi</h6>
              {statistics.healthStatus === 'critical' && (
                <div className="alert alert-danger">
                  <i className="bi bi-exclamation-triangle me-2"></i>
                  <strong>Perhatian Kritis:</strong>
                  <ul className="mb-0 mt-2">
                    <li>Jalankan latihan pemulihan penuh segera</li>
                    <li>Periksa integritas backup terbaru</li>
                    <li>Pertimbangkan untuk membuat backup baru</li>
                  </ul>
                </div>
              )}
              {statistics.healthStatus === 'warning' && (
                <div className="alert alert-warning">
                  <i className="bi bi-exclamation-circle me-2"></i>
                  <strong>Peringatan:</strong>
                  <ul className="mb-0 mt-2">
                    <li>Keberhasilan latihan di bawah 90%</li>
                    <li>Pertimbangkan untuk meningkatkan frekuensi latihan</li>
                  </ul>
                </div>
              )}
              {statistics.healthStatus === 'healthy' && (
                <div className="alert alert-success">
                  <i className="bi bi-check-circle me-2"></i>
                  <strong>Status Sehat:</strong>
                  <ul className="mb-0 mt-2">
                    <li>Sistem pemulihan berfungsi dengan baik</li>
                    <li>Tingkat keberhasilan latihan optimal</li>
                    <li>Backup dapat diandalkan untuk pemulihan</li>
                  </ul>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

DrillDashboard.displayName = "DrillDashboard"

export default memo(DrillDashboard)
