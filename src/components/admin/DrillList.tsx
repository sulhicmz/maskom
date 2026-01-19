"use client"

import React, { useState, useEffect, memo, useCallback, useMemo } from 'react'
import { useTheme } from '@/contexts/ThemeContext'
import {
  BackupDrill,
  DrillType,
  DrillStatus,
  DrillFilters
} from '@/types/drill'
import drillData from '@/data/DrillData'
import StatusBadge from '@/components/ui/StatusBadge'
import LoadingSpinner from '@/components/ui/LoadingSpinner'

interface DrillListProps {
  onRunDrill: (drillId: string, backupId: string, drillType: DrillType) => void
  onCancelDrill: (drillId: string) => void
  onViewResults: (drillId: string) => void
}

interface DrillRowProps {
  drill: BackupDrill
  onRunDrill: (drillId: string, backupId: string, drillType: DrillType) => void
  onCancelDrill: (drillId: string) => void
  onViewResults: (drillId: string) => void
}

const formatDuration = (ms: number): string => {
  const seconds = Math.floor(ms / 1000)
  const minutes = Math.floor(seconds / 60)

  if (minutes > 0) {
    return `${minutes}m ${seconds % 60}s`
  }

  return `${seconds}s`
}

const getDrillTypeLabel = (type: DrillType): string => {
  switch (type) {
    case DrillType.FULL_RESTORE:
      return 'Pemulihan Penuh'
    case DrillType.PARTIAL_RESTORE:
      return 'Pemulihan Sebagian'
    case DrillType.INTEGRITY_CHECK:
      return 'Pemeriksaan Integritas'
    default:
      return type
  }
}

const getDrillTypeBadgeClass = (type: DrillType): string => {
  switch (type) {
    case DrillType.FULL_RESTORE:
      return 'bg-primary'
    case DrillType.PARTIAL_RESTORE:
      return 'bg-info'
    case DrillType.INTEGRITY_CHECK:
      return 'bg-success'
    default:
      return 'bg-secondary'
  }
}

const DrillRow = memo(({ drill, onRunDrill, onCancelDrill, onViewResults }: DrillRowProps) => {
  useTheme()
  const date = new Date(drill.timestamp)
  const formattedDate = date.toLocaleDateString('id-ID', {
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  })
  const formattedTime = date.toLocaleTimeString('id-ID', {
    hour: '2-digit',
    minute: '2-digit'
  })

  const hasResults = drill.status === DrillStatus.PASSED || drill.status === DrillStatus.FAILED

  return (
    <tr>
      <td>{drill.id}</td>
      <td>
        <span className={`badge ${getDrillTypeBadgeClass(drill.drillType)}`}>
          {getDrillTypeLabel(drill.drillType)}
        </span>
      </td>
      <td>{drill.backupId}</td>
      <td>
        {formattedDate}{' '}
        <small className="text-muted">({formattedTime})</small>
      </td>
      <td>{formatDuration(drill.duration)}</td>
      <td>
        <StatusBadge
          type={drill.status === DrillStatus.PASSED ? 'success' :
                drill.status === DrillStatus.FAILED ? 'danger' :
                drill.status === DrillStatus.RUNNING ? 'warning' : 'secondary'}
        >
          {drill.status === DrillStatus.PASSED ? 'Berhasil' :
           drill.status === DrillStatus.FAILED ? 'Gagal' :
           drill.status === DrillStatus.RUNNING ? 'Berjalan' :
           drill.status === DrillStatus.SCHEDULED ? 'Terjadwal' : 'Dibatalkan'}
        </StatusBadge>
      </td>
      <td>
        <div className="d-flex gap-1">
          {drill.status === DrillStatus.SCHEDULED && (
            <button
              className="btn btn-sm btn-danger"
              onClick={() => onCancelDrill(drill.id)}
              title="Batalkan Latihan"
            >
              <i className="bi bi-x-circle"></i>
            </button>
          )}
          {hasResults && drill.results && (
            <button
              className="btn btn-sm btn-info"
              onClick={() => onViewResults(drill.id)}
              title="Lihat Hasil"
            >
              <i className="bi bi-file-text"></i>
            </button>
          )}
          {drill.status === DrillStatus.PASSED && (
            <button
              className="btn btn-sm btn-success"
              onClick={() => onRunDrill(drill.id, drill.backupId, drill.drillType)}
              title="Jalankan Ulang"
            >
              <i className="bi bi-arrow-repeat"></i>
            </button>
          )}
        </div>
      </td>
    </tr>
  )
})

DrillRow.displayName = 'DrillRow'

const DrillList: React.FC<DrillListProps> = ({
  onRunDrill,
  onCancelDrill,
  onViewResults
}) => {
  const { theme } = useTheme()
  const [drills, setDrills] = useState<BackupDrill[]>([])
  const [loading, setLoading] = useState(true)
  const [filters, setFilters] = useState<DrillFilters>({})

  const loadDrills = useCallback(async () => {
    setLoading(true)
    try {
      setDrills(drillData)
    } catch (error) {
      console.error('Error loading drills:', error)
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    loadDrills()
  }, [loadDrills])

  const filteredDrills = useMemo(() => {
    let filtered = [...drills]

    if (filters.drillType && filters.drillType.length > 0) {
      filtered = filtered.filter(d => filters.drillType!.includes(d.drillType))
    }

    if (filters.status && filters.status.length > 0) {
      filtered = filtered.filter(d => filters.status!.includes(d.status))
    }

    if (filters.dateRange) {
      const startDate = new Date(filters.dateRange.startDate)
      const endDate = new Date(filters.dateRange.endDate)
      filtered = filtered.filter(d => {
        const drillDate = new Date(d.timestamp)
        return drillDate >= startDate && drillDate <= endDate
      })
    }

    if (filters.backupId) {
      filtered = filtered.filter(d => d.backupId === filters.backupId)
    }

    return filtered.sort((a, b) =>
      new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
    )
  }, [drills, filters])

  const handleFilterChange = useCallback((key: keyof DrillFilters, value: any) => {
    setFilters(prev => ({ ...prev, [key]: value }))
  }, [])

  const clearFilters = useCallback(() => {
    setFilters({})
  }, [])

  if (loading) {
    return <LoadingSpinner />
  }

  return (
    <div className={`container-fluid py-4 ${theme}`}>
      <div className="card shadow">
        <div className="card-header bg-primary text-white">
          <h5 className="card-title mb-0">
            <i className="bi bi-activity me-2"></i>
            Riwayat Latihan Pemulihan
          </h5>
        </div>
        <div className="card-body">
          <div className="row mb-4">
            <div className="col-md-3">
              <label className="form-label">Tipe Latihan</label>
              <select
                className="form-select"
                value={filters.drillType?.[0] || ''}
                onChange={(e) => {
                  const value = e.target.value as DrillType
                  handleFilterChange('drillType', value ? [value] : [])
                }}
              >
                <option value="">Semua Tipe</option>
                <option value={DrillType.FULL_RESTORE}>Pemulihan Penuh</option>
                <option value={DrillType.PARTIAL_RESTORE}>Pemulihan Sebagian</option>
                <option value={DrillType.INTEGRITY_CHECK}>Pemeriksaan Integritas</option>
              </select>
            </div>
            <div className="col-md-3">
              <label className="form-label">Status</label>
              <select
                className="form-select"
                value={filters.status?.[0] || ''}
                onChange={(e) => {
                  const value = e.target.value as DrillStatus
                  handleFilterChange('status', value ? [value] : [])
                }}
              >
                <option value="">Semua Status</option>
                <option value={DrillStatus.SCHEDULED}>Terjadwal</option>
                <option value={DrillStatus.RUNNING}>Berjalan</option>
                <option value={DrillStatus.PASSED}>Berhasil</option>
                <option value={DrillStatus.FAILED}>Gagal</option>
                <option value={DrillStatus.CANCELLED}>Dibatalkan</option>
              </select>
            </div>
            <div className="col-md-3">
              <label className="form-label">ID Backup</label>
              <input
                type="text"
                className="form-control"
                placeholder="Cari ID backup..."
                value={filters.backupId || ''}
                onChange={(e) => handleFilterChange('backupId', e.target.value)}
              />
            </div>
            <div className="col-md-3">
              <label className="form-label">&nbsp;</label>
              <button
                className="btn btn-secondary w-100"
                onClick={clearFilters}
              >
                <i className="bi bi-x-circle me-2"></i>
                Hapus Filter
              </button>
            </div>
          </div>

          <div className="table-responsive">
            <table className="table table-hover">
              <thead>
                <tr>
                  <th>ID</th>
                  <th>Tipe Latihan</th>
                  <th>ID Backup</th>
                  <th>Waktu</th>
                  <th>Durasi</th>
                  <th>Status</th>
                  <th>Aksi</th>
                </tr>
              </thead>
              <tbody>
                {filteredDrills.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="text-center py-4">
                      <i className="bi bi-inbox fs-1 text-muted"></i>
                      <p className="text-muted mt-2">Tidak ada latihan yang ditemukan</p>
                    </td>
                  </tr>
                ) : (
                  filteredDrills.map(drill => (
                    <DrillRow
                      key={drill.id}
                      drill={drill}
                      onRunDrill={onRunDrill}
                      onCancelDrill={onCancelDrill}
                      onViewResults={onViewResults}
                    />
                  ))
                )}
              </tbody>
            </table>
          </div>

          <div className="alert alert-info mt-3">
            <i className="bi bi-info-circle me-2"></i>
            <strong>Info:</strong> Latihan pemulihan dilakukan untuk memverifikasi bahwa backup dapat dipulihkan dengan benar sebelum terjadi bencana.
          </div>
        </div>
      </div>
    </div>
  )
}

export default DrillList
