"use client"

import React, { useState, useEffect, useCallback } from 'react'
import { useTheme } from '@/contexts/ThemeContext'
import {
  BackupDrill,
  DrillType
} from '@/types/drill'
import drillData from '@/data/DrillData'
import LoadingSpinner from '@/components/ui/LoadingSpinner'

interface DrillResultsProps {
  drillId: string
  onClose: () => void
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

const DrillResultsComponent: React.FC<DrillResultsProps> = ({ drillId, onClose }) => {
  const { theme } = useTheme()
  const [drill, setDrill] = useState<BackupDrill | null>(null)
  const [loading, setLoading] = useState(true)

  const loadDrill = useCallback(async () => {
    setLoading(true)
    try {
      const foundDrill = drillData.find(d => d.id === drillId)
      setDrill(foundDrill || null)
    } catch (error) {
      console.error('Error loading drill:', error)
    } finally {
      setLoading(false)
    }
  }, [drillId])

  useEffect(() => {
    loadDrill()
  }, [loadDrill])

  const handleKeyDown = useCallback((e: React.KeyboardEvent) => {
    if (e.key === 'Escape') {
      onClose()
    }
  }, [onClose])

  if (loading) {
    return (
      <div
        className="modal-backdrop show"
        role="status"
        aria-live="polite"
        aria-label="Memuat hasil latihan"
      >
        <div className="modal-dialog modal-dialog-centered">
          <div className="modal-content">
            <div className="modal-body text-center py-5">
              <LoadingSpinner />
              <p className="mt-3 text-muted">Memuat hasil latihan...</p>
            </div>
          </div>
        </div>
      </div>
    )
  }

  if (!drill) {
    return (
      <div
        className="modal-backdrop show"
        onClick={onClose}
        onKeyDown={handleKeyDown}
        role="alertdialog"
        aria-labelledby="drill-not-found-title"
        aria-describedby="drill-not-found-desc"
        aria-modal="true"
      >
        <div
          className="modal-dialog modal-dialog-centered"
          onClick={(e) => e.stopPropagation()}
        >
          <div className="modal-content">
            <div className="modal-body text-center py-5">
              <i className="bi bi-exclamation-triangle fs-1 text-warning mb-3" aria-hidden="true"></i>
              <h5 id="drill-not-found-title">Latihan Tidak Ditemukan</h5>
              <p id="drill-not-found-desc" className="text-muted">ID latihan tidak valid atau telah dihapus</p>
              <button
                className="btn btn-primary"
                onClick={onClose}
                aria-label="Tutup modal"
              >
                Tutup
              </button>
            </div>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div
      className="modal-backdrop show"
      onClick={onClose}
      onKeyDown={handleKeyDown}
      role="presentation"
      aria-hidden="true"
      tabIndex={-1}
    >
      <div
        className="modal-dialog modal-lg modal-dialog-centered"
        onClick={(e) => e.stopPropagation()}
        role="dialog"
        aria-modal="true"
        aria-labelledby="drill-results-title"
        aria-describedby="drill-results-content"
      >
        <div className={`modal-content ${theme}`}>
          <div className="modal-header bg-primary text-white">
            <h5 className="modal-title" id="drill-results-title">
              <i className="bi bi-file-earmark-text me-2" aria-hidden="true"></i>
              Hasil Latihan: {drill.id}
            </h5>
            <button
              type="button"
              className="btn-close btn-close-white"
              onClick={onClose}
              aria-label="Tutup hasil latihan"
            />
          </div>
          <div className="modal-body" id="drill-results-content">
            <div className="row mb-4">
              <div className="col-md-6">
                <div className="card shadow-sm">
                  <div className="card-body">
                    <h6 className="text-muted mb-2">Informasi Dasar</h6>
                    <div className="mb-2">
                      <strong>Tipe Latihan:</strong>{' '}
                      <span className="badge bg-primary ms-2">
                        {getDrillTypeLabel(drill.drillType)}
                      </span>
                    </div>
                    <div className="mb-2">
                      <strong>ID Backup:</strong> {drill.backupId}
                    </div>
                    <div className="mb-2">
                      <strong>Status:</strong>{' '}
                      <span className={`badge ${
                        drill.status === 'passed' ? 'bg-success' :
                        drill.status === 'failed' ? 'bg-danger' :
                        drill.status === 'running' ? 'bg-warning' : 'bg-secondary'
                      } ms-2`}>
                        {drill.status === 'passed' ? 'Berhasil' :
                         drill.status === 'failed' ? 'Gagal' :
                         drill.status === 'running' ? 'Berjalan' :
                         drill.status === 'scheduled' ? 'Terjadwal' : 'Dibatalkan'}
                      </span>
                    </div>
                    <div className="mb-2">
                      <strong>Waktu:</strong>{' '}
                      {new Date(drill.timestamp).toLocaleString('id-ID')}
                    </div>
                    <div className="mb-0">
                      <strong>Durasi:</strong> {formatDuration(drill.duration)}
                    </div>
                  </div>
                </div>
              </div>
              <div className="col-md-6">
                <div className={`card shadow-sm ${drill.status === 'failed' ? 'border border-danger' : ''}`}>
                  <div className={`card-body ${
                    drill.status === 'passed' ? 'bg-success bg-opacity-10' :
                    drill.status === 'failed' ? 'bg-danger bg-opacity-10' :
                    drill.status === 'running' ? 'bg-warning bg-opacity-10' : ''
                  }`}>
                    <h6 className="text-muted mb-3">
                      <i className={`bi bi-${
                        drill.status === 'passed' ? 'check-circle' :
                        drill.status === 'failed' ? 'x-circle' :
                        drill.status === 'running' ? 'hourglass-split' : 'info-circle'
                      } me-2`}></i>
                      Ringkasan Status
                    </h6>
                    {drill.status === 'passed' && drill.results && (
                      <div className="text-success">
                        <i className="bi bi-check-circle-fill fs-1 d-block mb-2"></i>
                        <h5 className="fw-bold">Latihan Berhasil!</h5>
                        <p className="mb-0">
                          Semua verifikasi dipulihkan dengan benar.
                        </p>
                      </div>
                    )}
                    {drill.status === 'failed' && (
                      <div className="text-danger">
                        <i className="bi bi-x-circle-fill fs-1 d-block mb-2"></i>
                        <h5 className="fw-bold">Latihan Gagal</h5>
                        <p className="mb-0">
                          Terjadi kesalahan selama latihan.
                        </p>
                      </div>
                    )}
                    {drill.status === 'running' && (
                      <div className="text-warning">
                        <i className="bi bi-hourglass-split fs-1 d-block mb-2"></i>
                        <h5 className="fw-bold">Latihan Berjalan</h5>
                        <p className="mb-0">
                          Latihan sedang dieksekusi saat ini.
                        </p>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>

            {drill.results && (
              <div className="card shadow-sm mb-4">
                <div className="card-header">
                  <h6 className="mb-0">
                    <i className="bi bi-clipboard-data me-2"></i>
                    Detail Hasil
                  </h6>
                </div>
                <div className="card-body">
                  <div className="row g-3">
                    <div className="col-md-6">
                      <div className="border rounded p-3">
                        <small className="text-muted d-block">Durasi Pemulihan</small>
                        <strong className="fs-5">{formatDuration(drill.results.restoreDuration)}</strong>
                      </div>
                    </div>
                    <div className="col-md-6">
                      <div className="border rounded p-3">
                        <small className="text-muted d-block">Item Dipulihkan</small>
                        <strong className="fs-5">{drill.results.itemsRestored}</strong>
                      </div>
                    </div>
                    <div className="col-md-6">
                      <div className={`border rounded p-3 ${drill.results.integrityCheckPassed ? 'border-success' : 'border-danger'}`}>
                        <small className="text-muted d-block">Pemeriksaan Integritas</small>
                        <strong className={`fs-5 ${drill.results.integrityCheckPassed ? 'text-success' : 'text-danger'}`}>
                          {drill.results.integrityCheckPassed ? 'Lulus' : 'Gagal'}
                        </strong>
                      </div>
                    </div>
                    <div className="col-md-6">
                      <div className={`border rounded p-3 ${drill.results.checksumValid ? 'border-success' : 'border-danger'}`}>
                        <small className="text-muted d-block">Validasi Checksum</small>
                        <strong className={`fs-5 ${drill.results.checksumValid ? 'text-success' : 'text-danger'}`}>
                          {drill.results.checksumValid ? 'Valid' : 'Tidak Valid'}
                        </strong>
                      </div>
                    </div>
                    <div className="col-md-6">
                      <div className={`border rounded p-3 ${drill.results.dataLossDetected ? 'border-danger' : 'border-success'}`}>
                        <small className="text-muted d-block">Kehilangan Data</small>
                        <strong className={`fs-5 ${drill.results.dataLossDetected ? 'text-danger' : 'text-success'}`}>
                          {drill.results.dataLossDetected ? 'Terdeteksi' : 'Tidak Terdeteksi'}
                        </strong>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {drill.errors && drill.errors.length > 0 && (
              <div className="card shadow-sm mb-4">
                <div className="card-header bg-danger text-white">
                  <h6 className="mb-0">
                    <i className="bi bi-exclamation-triangle me-2"></i>
                    Kesalahan
                  </h6>
                </div>
                <div className="card-body">
                  <ul className="list-unstyled mb-0">
                    {drill.errors.map((error, index) => (
                      <li key={index} className="mb-2">
                        <i className="bi bi-x-circle text-danger me-2"></i>
                        {error}
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            )}

            {drill.results && drill.results.warnings && drill.results.warnings.length > 0 && (
              <div className="card shadow-sm mb-4">
                <div className="card-header bg-warning">
                  <h6 className="mb-0">
                    <i className="bi bi-exclamation-circle me-2"></i>
                    Peringatan
                  </h6>
                </div>
                <div className="card-body">
                  <ul className="list-unstyled mb-0">
                    {drill.results.warnings.map((warning, index) => (
                      <li key={index} className="mb-2">
                        <i className="bi bi-exclamation-circle text-warning me-2"></i>
                        {warning}
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            )}

            <div className="card shadow-sm">
              <div className="card-body">
                <h6 className="text-muted mb-3">Metadika Tambahan</h6>
                <div className="row">
                  <div className="col-md-6 mb-3">
                    <strong>Perbaikan Dicaptkan:</strong>{' '}
                    <span className={`badge ${drill.remediationAttempted ? 'bg-success' : 'bg-secondary'}`}>
                      {drill.remediationAttempted ? 'Ya' : 'Tidak'}
                    </span>
                  </div>
                  <div className="col-md-6 mb-3">
                    <strong>Notifikasi Dikirim:</strong>{' '}
                    <span className={`badge ${drill.notificationSent ? 'bg-success' : 'bg-secondary'}`}>
                      {drill.notificationSent ? 'Ya' : 'Tidak'}
                    </span>
                  </div>
                  {drill.startedAt && (
                    <div className="col-md-6 mb-3">
                      <strong>Waktu Mulai:</strong>{' '}
                      {new Date(drill.startedAt).toLocaleString('id-ID')}
                    </div>
                  )}
                  {drill.completedAt && (
                    <div className="col-md-6 mb-3">
                      <strong>Waktu Selesai:</strong>{' '}
                      {new Date(drill.completedAt).toLocaleString('id-ID')}
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
          <div className="modal-footer">
            <button type="button" className="btn btn-secondary" onClick={onClose}>
              Tutup
            </button>
            {drill.status === 'passed' && (
              <button
                type="button"
                className="btn btn-primary"
                onClick={() => {
                  window.print()
                }}
              >
                <i className="bi bi-printer me-2"></i>
                Cetak Laporan
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}

export default DrillResultsComponent
