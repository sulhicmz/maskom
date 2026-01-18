"use client"

import React, { useState, useEffect, memo } from 'react'
import { useTheme } from '@/contexts/ThemeContext'
import Button from '@/components/ui/Button'
import { RestoreResult, BackupMetadata } from '@/types/backup'
import { restoreBackup } from '@/utils/backupEngine'

interface BackupRestoreModalProps {
  isOpen: boolean
  backup: BackupMetadata | null
  onClose: () => void
  onRestoreComplete: (result: RestoreResult) => void
}

const BackupRestoreModal: React.FC<BackupRestoreModalProps> = ({
  isOpen,
  backup,
  onClose,
  onRestoreComplete,
}) => {
  const { theme } = useTheme()
  const [isRestoring, setIsRestoring] = useState(false)
  const [restoreProgress, setRestoreProgress] = useState({
    current: 0,
    total: 0,
    message: '',
  })
  const [restoreResult, setRestoreResult] = useState<RestoreResult | null>(null)

  useEffect(() => {
    if (!isOpen) {
      setIsRestoring(false)
      setRestoreProgress({ current: 0, total: 0, message: '' })
      setRestoreResult(null)
    }
  }, [isOpen])

  const handleRestore = async () => {
    if (!backup) return

    setIsRestoring(true)
    setRestoreResult(null)

    try {
      const result = await restoreBackup(
        backup.id,
        (progress) => {
          setRestoreProgress(progress)
        },
      )

      setRestoreResult(result)
      onRestoreComplete(result)
    } catch (error) {
      const errorResult: RestoreResult = {
        success: false,
        backupId: backup.id,
        restoreDate: new Date().toISOString(),
        restoreTime: 0,
        itemsRestored: 0,
        errors: [
          error instanceof Error ? error.message : 'Terjadi kesalahan tidak diketahui',
        ],
        warnings: [],
      }

      setRestoreResult(errorResult)
      onRestoreComplete(errorResult)
    } finally {
      setIsRestoring(false)
    }
  }

  const handleClose = () => {
    onClose()
  }

  if (!isOpen || !backup) {
    return null
  }

  const date = new Date(backup.timestamp)
  const formattedDate = date.toLocaleDateString('id-ID', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  })
  const formattedTime = date.toLocaleTimeString('id-ID', {
    hour: '2-digit',
    minute: '2-digit',
  })
  const formattedSize = formatBytes(backup.size)

  return (
    <div
      className={`modal fade ${isOpen ? 'show' : ''}`}
      tabIndex={-1}
      role="dialog"
      aria-labelledby="restoreModalLabel"
      aria-hidden="true"
      style={{ display: isOpen ? 'block' : 'none' }}
    >
      <div className="modal-dialog">
        <div
          className={`modal-content ${theme === 'dark' ? 'dark-mode' : ''}`}
        >
          <div
            className={`modal-header ${theme === 'dark' ? 'bg-dark' : 'bg-white'}`}
          >
            <h5 className="modal-title" id="restoreModalLabel">
              Pulihkan Backup
            </h5>
            <button
              type="button"
              className="btn-close"
              onClick={handleClose}
              aria-label="Tutup"
            ></button>
          </div>

          <div className="modal-body">
            {!restoreResult ? (
              <>
                <div className="mb-3">
                  <h6>Informasi Backup</h6>
                  <table className="table table-sm">
                    <tbody>
                      <tr>
                        <td className="fw-bold">ID Backup:</td>
                        <td>{backup.id}</td>
                      </tr>
                      <tr>
                        <td className="fw-bold">Tipe:</td>
                        <td>
                          {backup.type === 'full' ? 'Penuh' : 'Inkremental'}
                        </td>
                      </tr>
                      <tr>
                        <td className="fw-bold">Tanggal:</td>
                        <td>
                          {formattedDate} {formattedTime}
                        </td>
                      </tr>
                      <tr>
                        <td className="fw-bold">Ukuran:</td>
                        <td>{formattedSize}</td>
                      </tr>
                      <tr>
                        <td className="fw-bold">Enkripsi:</td>
                        <td>{backup.encryption}</td>
                      </tr>
                      <tr>
                        <td className="fw-bold">Status:</td>
                        <td>
                          {backup.status === 'completed' ? 'Sukses' : 'Gagal'}
                        </td>
                      </tr>
                    </tbody>
                  </table>
                </div>

                {isRestoring && (
                  <div className="alert alert-info">
                    <h6>
                      <i className="bi bi-arrow-repeat me-2"></i>
                      Sedang Memulihkan...
                    </h6>
                    <div className="progress mb-2">
                      <div
                        className="progress-bar progress-bar-striped progress-bar-animated"
                        role="progressbar"
                        style={{
                          width: `${(restoreProgress.current / restoreProgress.total) * 100}%`,
                        }}
                      ></div>
                    </div>
                    <small>{restoreProgress.message}</small>
                  </div>
                )}

                <div className="alert alert-warning">
                  <h6>
                    <i className="bi bi-exclamation-triangle me-2"></i>
                    Peringatan
                  </h6>
                  <ul className="mb-0">
                    <li>
                      Pulihan backup akan menimpa semua data saat ini
                    </li>
                    <li>
                      Pastikan untuk membuat backup baru sebelum memulihkan
                    </li>
                    <li>
                      Operasi ini tidak dapat dibatalkan setelah dimulai
                    </li>
                  </ul>
                </div>
              </>
            ) : (
              <div
                className={`alert ${restoreResult.success ? 'alert-success' : 'alert-danger'}`}
              >
                <h6>
                  {restoreResult.success ? (
                    <>
                      <i className="bi bi-check-circle me-2"></i>
                      Pulihan Berhasil
                    </>
                  ) : (
                    <>
                      <i className="bi bi-x-circle me-2"></i>
                      Pulihan Gagal
                    </>
                  )}
                </h6>
                <table className="table table-sm mb-3">
                  <tbody>
                    <tr>
                      <td className="fw-bold">Waktu Pulihan:</td>
                      <td>{(restoreResult.restoreTime / 1000).toFixed(2)} detik</td>
                    </tr>
                    <tr>
                      <td className="fw-bold">Item Dipulihkan:</td>
                      <td>{restoreResult.itemsRestored}</td>
                    </tr>
                  </tbody>
                </table>

                {restoreResult.errors.length > 0 && (
                  <div className="mt-3">
                    <strong>Error:</strong>
                    <ul>
                      {restoreResult.errors.map((error, index) => (
                        <li key={index}>{error}</li>
                      ))}
                    </ul>
                  </div>
                )}

                {restoreResult.warnings.length > 0 && (
                  <div className="mt-3">
                    <strong>Peringatan:</strong>
                    <ul>
                      {restoreResult.warnings.map((warning, index) => (
                        <li key={index}>{warning}</li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
            )}
          </div>

          <div
            className={`modal-footer ${theme === 'dark' ? 'bg-dark' : 'bg-white'}`}
          >
            {!restoreResult ? (
              <>
                <button
                  type="button"
                  className="btn btn-secondary"
                  onClick={handleClose}
                  disabled={isRestoring}
                >
                  Batal
                </button>
                <button
                  type="button"
                  className="btn btn-primary"
                  onClick={handleRestore}
                  disabled={isRestoring}
                >
                  {isRestoring ? (
                    <>
                      <span
                        className="spinner-border spinner-border-sm me-2"
                        role="status"
                        aria-hidden="true"
                      ></span>
                      Sedang Memulihkan...
                    </>
                  ) : (
                    'Mulai Pulihan'
                  )}
                </button>
              </>
            ) : (
              <button
                type="button"
                className="btn btn-primary"
                onClick={handleClose}
              >
                Tutup
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}

function formatBytes(bytes: number): string {
  if (bytes === 0) return '0 Bytes'
  const k = 1024
  const sizes = ['Bytes', 'KB', 'MB', 'GB']
  const i = Math.floor(Math.log(bytes) / Math.log(k))
  return (
    Math.round(bytes / Math.pow(k, i) * 100) / 100 + ' ' + sizes[i]
  )
}

export default memo(BackupRestoreModal)
