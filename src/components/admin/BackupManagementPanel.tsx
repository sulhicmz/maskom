"use client"

import React, { useState, useEffect, memo } from 'react'
import { useTheme } from '@/contexts/ThemeContext'
import { useAuthService } from '@/hooks/useAuthService'
import { useRouter } from 'next/navigation'
import {
  BackupConfig,
  BackupMetadata,
  RestoreResult,
  BackupStatistics,
  DEFAULT_BACKUP_CONFIG,
} from '@/types/backup'
import { BACKUP_STORAGE_KEY } from '@/types/backup'
import BackupConfigForm from './BackupConfigForm'
import BackupList from './BackupList'
import BackupRestoreModal from './BackupRestoreModal'
import DisasterRecoveryPlanComponent from './DisasterRecoveryPlan'
import { createFullBackup, getBackupStatistics, deleteBackup, exportBackupToFile } from '@/utils/backupEngine'
import LoadingSpinner from '@/components/ui/LoadingSpinner'

const BackupManagementPanel: React.FC = () => {
  const { theme } = useTheme()
  const { user } = useAuthService()
  const router = useRouter()
  const [isClient, setIsClient] = useState(false)
  const [isInitialized, setIsInitialized] = useState(false)

  const [backupConfig, setBackupConfig] = useState<BackupConfig>(DEFAULT_BACKUP_CONFIG)
  const [showConfigForm, setShowConfigForm] = useState(false)
  const [isCreatingBackup, setIsCreatingBackup] = useState(false)
  const [backupProgress, setBackupProgress] = useState({
    current: 0,
    total: 0,
    message: '',
  })

  const [selectedBackup, setSelectedBackup] = useState<BackupMetadata | null>(null)
  const [showRestoreModal, setShowRestoreModal] = useState(false)
  const [showDisasterRecovery, setShowDisasterRecovery] = useState(false)

  const [statistics, setStatistics] = useState<BackupStatistics | null>(null)
  const [showSuccessMessage, setShowSuccessMessage] = useState(false)
  const [successMessage, setSuccessMessage] = useState('')
  const [showError, setShowError] = useState(false)
  const [errorMessage, setErrorMessage] = useState('')

  useEffect(() => {
    setIsClient(true)

    if (!user) {
      router.push('/login')
    } else {
      loadBackupConfig()
      loadStatistics()
    }
  }, [user, router])

  const loadBackupConfig = () => {
    try {
      const savedConfig = localStorage.getItem(BACKUP_STORAGE_KEY)

      if (savedConfig) {
        const parsed = JSON.parse(savedConfig)
        setBackupConfig({ ...DEFAULT_BACKUP_CONFIG, ...parsed })
      }
    } catch (error) {
      console.error('Failed to load backup config:', error)
    } finally {
      setIsInitialized(true)
    }
  }

  const loadStatistics = async () => {
    try {
      const stats = await getBackupStatistics()
      setStatistics(stats)
    } catch (error) {
      console.error('Failed to load backup statistics:', error)
    }
  }

  const handleCreateBackup = async () => {
    if (!backupConfig.enabled) {
      setShowError(true)
      setErrorMessage('Backup dinonaktifkan. Aktifkan backup terlebih dahulu.')
      return
    }

    setIsCreatingBackup(true)
    setBackupProgress({ current: 0, total: 0, message: '' })
    setShowSuccessMessage(false)

    try {
      const metadata = await createFullBackup(
        backupConfig,
        (progress) => {
          setBackupProgress(progress)
        },
      )

      if (metadata.status === 'completed') {
        setShowSuccessMessage(true)
        setSuccessMessage(`Backup ${metadata.id} berhasil dibuat!`)
        await loadStatistics()
      } else {
        setShowError(true)
        setErrorMessage(`Backup gagal: ${metadata.errorMessage || 'Kesalahan tidak diketahui'}`)
      }
    } catch (error) {
      setShowError(true)
      setErrorMessage(`Gagal membuat backup: ${error instanceof Error ? error.message : 'Kesalahan tidak diketahui'}`)
    } finally {
      setIsCreatingBackup(false)
    }
  }

  const handleSaveConfig = (config: BackupConfig) => {
    try {
      localStorage.setItem(BACKUP_STORAGE_KEY, JSON.stringify(config))
      setBackupConfig(config)
      setShowConfigForm(false)
      setShowSuccessMessage(true)
      setSuccessMessage('Konfigurasi backup berhasil disimpan!')
      setTimeout(() => setShowSuccessMessage(false), 3000)
    } catch (error) {
      setShowError(true)
      setErrorMessage(`Gagal menyimpan konfigurasi: ${error instanceof Error ? error.message : 'Kesalahan tidak diketahui'}`)
    }
  }

  const handleRestore = () => {
    setSelectedBackup(null)
    setShowRestoreModal(true)
  }

  const handleRestoreComplete = (result: RestoreResult) => {
    if (result.success) {
      setShowSuccessMessage(true)
      setSuccessMessage(`Backup ${result.backupId} berhasil dipulihkan! ${result.itemsRestored} item dipulihkan.`)
    } else {
      setShowError(true)
      setErrorMessage(`Gagal memulihkan backup: ${result.errors.join(', ')}`)
    }

    setTimeout(() => {
      setShowRestoreModal(false)
    }, 5000)
  }

  const handleDelete = async (backupId: string) => {
    if (!confirm(`Apakah Anda yakin ingin menghapus backup ${backupId}?`)) {
      return
    }

    try {
      const success = await deleteBackup(backupId)

      if (success) {
        setShowSuccessMessage(true)
        setSuccessMessage(`Backup ${backupId} berhasil dihapus!`)
        await loadStatistics()
      } else {
        setShowError(true)
        setErrorMessage(`Gagal menghapus backup ${backupId}`)
      }
    } catch (error) {
      setShowError(true)
      setErrorMessage(`Gagal menghapus backup: ${error instanceof Error ? error.message : 'Kesalahan tidak diketahui'}`)
    }
  }

  const handleExport = async (backupId: string) => {
    try {
      const blob = await exportBackupToFile(backupId)

      if (blob) {
        const url = URL.createObjectURL(blob)
        const a = document.createElement('a')
        a.href = url
        a.download = `${backupId}.json`
        document.body.appendChild(a)
        a.click()
        document.body.removeChild(a)
        URL.revokeObjectURL(url)

        setShowSuccessMessage(true)
        setSuccessMessage(`Backup ${backupId} berhasil diekspor!`)
      } else {
        setShowError(true)
        setErrorMessage(`Gagal mengekspor backup ${backupId}`)
      }
    } catch (error) {
      setShowError(true)
      setErrorMessage(`Gagal mengekspor backup: ${error instanceof Error ? error.message : 'Kesalahan tidak diketahui'}`)
    }
  }

  if (!isClient || !isInitialized) {
    return <LoadingSpinner minHeight={400} color="primary" />
  }

  if (!user) {
    return null
  }

  return (
    <section className={`backup-section ${theme === 'dark' ? 'dark-mode' : ''}`}>
      <div className="container">
        <div className="row">
          <div className="col-12">
            <div className="section-title text-center mb-5">
              <h2>Manajemen Backup & Pemulihan Bencana</h2>
              <p className="text-muted">
                Kelola backup terjadwal, pantau status backup, dan akses rencana pemulihan
                bencana
              </p>
            </div>
          </div>
        </div>

        {showSuccessMessage && (
          <div className="row mb-3">
            <div className="col-12">
              <div className="alert alert-success alert-dismissible fade show">
                <button
                  type="button"
                  className="btn-close"
                  onClick={() => setShowSuccessMessage(false)}
                ></button>
                <i className="bi bi-check-circle me-2"></i>
                {successMessage}
              </div>
            </div>
          </div>
        )}

        {showError && (
          <div className="row mb-3">
            <div className="col-12">
              <div className="alert alert-danger alert-dismissible fade show">
                <button
                  type="button"
                  className="btn-close"
                  onClick={() => setShowError(false)}
                ></button>
                <i className="bi bi-x-circle me-2"></i>
                {errorMessage}
              </div>
            </div>
          </div>
        )}

        {statistics && (
          <div className="row mb-4">
            <div className="col-md-3 mb-3">
              <div className={`card shadow-sm ${theme === 'dark' ? 'dark-mode' : ''}`}>
                <div className="card-body">
                  <h6 className="text-muted mb-2">Total Backup</h6>
                  <h4 className="mb-0">{statistics.totalBackups}</h4>
                </div>
              </div>
            </div>

            <div className="col-md-3 mb-3">
              <div className={`card shadow-sm ${theme === 'dark' ? 'dark-mode' : ''}`}>
                <div className="card-body">
                  <h6 className="text-muted mb-2">Sukses</h6>
                  <h4 className="mb-0 text-success">
                    {statistics.successfulBackups}
                  </h4>
                </div>
              </div>
            </div>

            <div className="col-md-3 mb-3">
              <div className={`card shadow-sm ${theme === 'dark' ? 'dark-mode' : ''}`}>
                <div className="card-body">
                  <h6 className="text-muted mb-2">Gagal</h6>
                  <h4 className="mb-0 text-danger">{statistics.failedBackups}</h4>
                </div>
              </div>
            </div>

            <div className="col-md-3 mb-3">
              <div className={`card shadow-sm ${theme === 'dark' ? 'dark-mode' : ''}`}>
                <div className="card-body">
                  <h6 className="text-muted mb-2">Total Ukuran</h6>
                  <h4 className="mb-0">{formatBytes(statistics.totalBackupSize)}</h4>
                </div>
              </div>
            </div>
          </div>
        )}

        <div className="row mb-4">
          <div className="col-12">
            <div className="d-flex gap-2 mb-3">
              <button
                className={`btn ${
                  showConfigForm ? 'btn-secondary' : 'btn-primary'
                }`}
                onClick={() => setShowConfigForm(!showConfigForm)}
              >
                <i className={`bi bi-${showConfigForm ? 'x' : 'gear'} me-2`}></i>
                {showConfigForm ? 'Tutup' : 'Konfigurasi'}
              </button>

              <button
                className="btn btn-success"
                onClick={handleCreateBackup}
                disabled={isCreatingBackup || !backupConfig.enabled}
              >
                {isCreatingBackup ? (
                  <>
                    <span className="spinner-border spinner-border-sm me-2" role="status"></span>
                    Sedang Membuat Backup...
                  </>
                ) : (
                  <>
                    <i className="bi bi-plus-circle me-2"></i>
                    Buat Backup Manual
                  </>
                )}
              </button>

              <button
                className={`btn ${
                  showDisasterRecovery ? 'btn-secondary' : 'btn-info'
                }`}
                onClick={() => setShowDisasterRecovery(!showDisasterRecovery)}
              >
                <i className={`bi bi-${showDisasterRecovery ? 'x' : 'life-preserver'} me-2`}></i>
                {showDisasterRecovery ? 'Tutup' : 'Rencana Pemulihan Bencana'}
              </button>
            </div>
          </div>
        </div>

        {showConfigForm && (
          <div className="row mb-4">
            <div className="col-12">
              <BackupConfigForm
                config={backupConfig}
                onSave={handleSaveConfig}
                onCancel={() => setShowConfigForm(false)}
              />
            </div>
          </div>
        )}

        {isCreatingBackup && (
          <div className="row mb-4">
            <div className="col-12">
              <div className="alert alert-info">
                <h6>
                  <i className="bi bi-arrow-repeat me-2"></i>
                  Sedang Membuat Backup...
                </h6>
                <div className="progress mb-2">
                  <div
                    className="progress-bar progress-bar-striped progress-bar-animated"
                    role="progressbar"
                    style={{
                      width: `${(backupProgress.current / backupProgress.total) * 100}%`,
                    }}
                  ></div>
                </div>
                <small>{backupProgress.message}</small>
              </div>
            </div>
          </div>
        )}

        {!showConfigForm && !showDisasterRecovery && (
          <BackupList
            onRestore={handleRestore}
            onDelete={handleDelete}
            onExport={handleExport}
          />
        )}

        {showDisasterRecovery && (
          <div className="row">
            <div className="col-12">
              <DisasterRecoveryPlanComponent />
            </div>
          </div>
        )}
      </div>

      <BackupRestoreModal
        isOpen={showRestoreModal}
        backup={selectedBackup}
        onClose={() => {
          setShowRestoreModal(false)
          setSelectedBackup(null)
        }}
        onRestoreComplete={handleRestoreComplete}
      />
    </section>
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

export default memo(BackupManagementPanel)
