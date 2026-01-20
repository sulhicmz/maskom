"use client"

import React, { useState, useEffect, memo } from 'react'
import { useTheme } from '@/contexts/ThemeContext'
import { BackupConfig } from '@/types/backup'

interface BackupConfigFormProps {
  config: BackupConfig
  onSave: (config: BackupConfig) => void
  onCancel: () => void
}

const BackupConfigForm: React.FC<BackupConfigFormProps> = ({
  config,
  onSave,
  onCancel,
}) => {
  const { theme } = useTheme()
  const [localConfig, setLocalConfig] = useState<BackupConfig>(config)
  const [errors, setErrors] = useState<Record<string, string>>({})

  useEffect(() => {
    setLocalConfig(config)
  }, [config])

  const validate = (): boolean => {
    const newErrors: Record<string, string> = {}

    if (!localConfig.time.match(/^\d{2}:\d{2}$/)) {
      newErrors.time = 'Format jam harus HH:MM (contoh: 02:00)'
    }

    if (localConfig.retentionDays < 1 || localConfig.retentionDays > 365) {
      newErrors.retentionDays = 'Hari retensi harus antara 1 dan 365'
    }

    if (
      localConfig.retentionPolicy.keepLastCount < 1 ||
      localConfig.retentionPolicy.keepLastCount > 100
    ) {
      newErrors.keepLastCount = 'Jumlah backup terakhir harus antara 1 dan 100'
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSave = () => {
    if (validate()) {
      onSave(localConfig)
    }
  }

  const handleChange = (
    field: keyof BackupConfig | keyof BackupConfig['retentionPolicy'],
    value: string | number | boolean | BackupConfig['retentionPolicy'],
  ) => {
    if (field in localConfig) {
      setLocalConfig({
        ...localConfig,
        [field]: value,
      })
    } else {
      setLocalConfig({
        ...localConfig,
        retentionPolicy: {
          ...localConfig.retentionPolicy,
          [field]: value as BackupConfig['retentionPolicy'][keyof BackupConfig['retentionPolicy']],
        },
      })
    }
    if (errors[field as string]) {
      setErrors(prev => {
        const newErrors = { ...prev }
        delete newErrors[field as string]
        return newErrors
      })
    }
  }

  const handleKeyDown = (e: React.KeyboardEvent, action: () => void) => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault()
      action()
    }
  }

  return (
    <div className={`card shadow-sm ${theme === 'dark' ? 'dark-mode' : ''}`}>
      <div className={`card-header ${theme === 'dark' ? 'bg-dark' : 'bg-white'}`}>
        <h5 className="mb-0">Konfigurasi Backup</h5>
      </div>
      <div className="card-body">
        <div className="row">
          <div className="col-md-6 mb-3">
            <label htmlFor="backup-enabled" className="form-label">Status Backup</label>
            <select
              id="backup-enabled"
              className={`form-select ${errors.enabled ? 'is-invalid' : ''}`}
              value={localConfig.enabled ? 'true' : 'false'}
              onChange={(e) => handleChange('enabled', e.target.value === 'true')}
              aria-invalid={!!errors.enabled}
              aria-describedby={errors.enabled ? 'backup-enabled-error' : undefined}
            >
              <option value="true">Aktif</option>
              <option value="false">Nonaktif</option>
            </select>
            {errors.enabled && (
              <div id="backup-enabled-error" className="invalid-feedback" role="alert" aria-live="polite">
                {errors.enabled}
              </div>
            )}
          </div>

          <div className="col-md-6 mb-3">
            <label htmlFor="backup-schedule" className="form-label">Jadwal Backup</label>
            <select
              id="backup-schedule"
              className={`form-select ${errors.schedule ? 'is-invalid' : ''}`}
              value={localConfig.schedule}
              onChange={(e) => handleChange('schedule', e.target.value)}
              aria-invalid={!!errors.schedule}
              aria-describedby={errors.schedule ? 'backup-schedule-error' : undefined}
            >
              <option value="manual">Manual</option>
              <option value="daily">Harian</option>
              <option value="weekly">Mingguan</option>
              <option value="monthly">Bulanan</option>
            </select>
            {errors.schedule && (
              <div id="backup-schedule-error" className="invalid-feedback" role="alert" aria-live="polite">
                {errors.schedule}
              </div>
            )}
          </div>
        </div>

        <div className="row">
          <div className="col-md-6 mb-3">
            <label htmlFor="backup-time" className="form-label">Waktu Backup</label>
            <input
              id="backup-time"
              type="time"
              className={`form-control ${errors.time ? 'is-invalid' : ''}`}
              value={localConfig.time}
              onChange={(e) => handleChange('time', e.target.value)}
              aria-invalid={!!errors.time}
              aria-describedby={errors.time ? 'backup-time-error' : 'backup-time-hint'}
              aria-required="true"
            />
            <small id="backup-time-hint" className="form-text text-muted">Format HH:MM (contoh: 02:00)</small>
            {errors.time && (
              <div id="backup-time-error" className="invalid-feedback" role="alert" aria-live="polite">
                {errors.time}
              </div>
            )}
          </div>

          <div className="col-md-6 mb-3">
            <label htmlFor="backup-retention-days" className="form-label">
              Retensi Hari ({localConfig.retentionDays} hari)
            </label>
            <input
              id="backup-retention-days"
              type="number"
              className={`form-control ${errors.retentionDays ? 'is-invalid' : ''}`}
              value={localConfig.retentionDays}
              onChange={(e) =>
                handleChange('retentionDays', parseInt(e.target.value))
              }
              min="1"
              max="365"
              aria-invalid={!!errors.retentionDays}
              aria-describedby={errors.retentionDays ? 'backup-retention-days-error' : 'backup-retention-days-hint'}
              aria-required="true"
            />
            <small id="backup-retention-days-hint" className="form-text text-muted">Nilai antara 1 dan 365 hari</small>
            {errors.retentionDays && (
              <div id="backup-retention-days-error" className="invalid-feedback" role="alert" aria-live="polite">
                {errors.retentionDays}
              </div>
            )}
          </div>
        </div>

        <div className="row">
          <div className="col-md-6 mb-3">
            <label htmlFor="backup-storage-type" className="form-label">Tipe Penyimpanan</label>
            <select
              id="backup-storage-type"
              className="form-select"
              value={localConfig.storageType}
              onChange={(e) => handleChange('storageType', e.target.value)}
              aria-describedby="backup-storage-type-hint"
            >
              <option value="localStorage">LocalStorage (Klien)</option>
              <option value="s3" disabled>
                Amazon S3 (Segera Hadir)
              </option>
              <option value="gcs" disabled>
                Google Cloud Storage (Segera Hadir)
              </option>
              <option value="azure" disabled>
                Azure Storage (Segera Hadir)
              </option>
            </select>
            <small id="backup-storage-type-hint" className="form-text text-muted">Pilih lokasi penyimpanan backup</small>
          </div>

          <div className="col-md-6 mb-3">
            <label htmlFor="backup-max-size" className="form-label">Ukuran Maksimum (GB)</label>
            <input
              id="backup-max-size"
              type="number"
              className="form-control"
              value={localConfig.retentionPolicy.maxSizeGB}
              onChange={(e) =>
                handleChange(
                  'maxSizeGB',
                  parseInt(e.target.value),
                )
              }
              min="1"
              max="100"
              aria-describedby="backup-max-size-hint"
            />
            <small id="backup-max-size-hint" className="form-text text-muted">Nilai antara 1 dan 100 GB</small>
          </div>
        </div>

        <div className="row">
          <div className="col-md-6 mb-3">
            <div className="form-check">
              <input
                className="form-check-input"
                type="checkbox"
                id="encryptionEnabled"
                checked={localConfig.encryptionEnabled}
                onChange={(e) =>
                  handleChange('encryptionEnabled', e.target.checked)
                }
                onKeyDown={(e) => handleKeyDown(e, () => handleChange('encryptionEnabled', !localConfig.encryptionEnabled))}
              />
              <label className="form-check-label" htmlFor="encryptionEnabled">
                Enkripsi AES-256
              </label>
              <small className="form-text text-muted d-block">Amankan data backup dengan enkripsi standar industri</small>
            </div>
          </div>

          <div className="col-md-6 mb-3">
            <div className="form-check">
              <input
                className="form-check-input"
                type="checkbox"
                id="compressionEnabled"
                checked={localConfig.compressionEnabled}
                onChange={(e) =>
                  handleChange('compressionEnabled', e.target.checked)
                }
                onKeyDown={(e) => handleKeyDown(e, () => handleChange('compressionEnabled', !localConfig.compressionEnabled))}
              />
              <label className="form-check-label" htmlFor="compressionEnabled">
                Kompresi Data
              </label>
              <small className="form-text text-muted d-block">Mengurangi ukuran backup dengan kompresi</small>
            </div>
          </div>
        </div>

        <div className="mb-3">
          <h6 className="mb-3">Kebijakan Retensi</h6>
          <div className="row">
            <div className="col-md-4 mb-3">
              <label htmlFor="keep-last-count" className="form-label">
                Pertahankan Backup Terakhir
              </label>
              <input
                id="keep-last-count"
                type="number"
                className={`form-control ${errors.keepLastCount ? 'is-invalid' : ''}`}
                value={localConfig.retentionPolicy.keepLastCount}
                onChange={(e) =>
                  handleChange(
                    'keepLastCount',
                    parseInt(e.target.value),
                  )
                }
                min="1"
                max="100"
                aria-invalid={!!errors.keepLastCount}
                aria-describedby={errors.keepLastCount ? 'keep-last-count-error' : 'keep-last-count-hint'}
                aria-required="true"
              />
              <small id="keep-last-count-hint" className="form-text text-muted">Nilai antara 1 dan 100</small>
              {errors.keepLastCount && (
                <div id="keep-last-count-error" className="invalid-feedback" role="alert" aria-live="polite">
                  {errors.keepLastCount}
                </div>
              )}
            </div>

            <div className="col-md-4 mb-3">
              <label htmlFor="keep-daily-for" className="form-label">Pertahankan Harian (Hari)</label>
              <input
                id="keep-daily-for"
                type="number"
                className="form-control"
                value={localConfig.retentionPolicy.keepDailyFor}
                onChange={(e) =>
                  handleChange(
                    'keepDailyFor',
                    parseInt(e.target.value),
                  )
                }
                min="1"
                max="30"
                aria-describedby="keep-daily-for-hint"
              />
              <small id="keep-daily-for-hint" className="form-text text-muted">Nilai antara 1 dan 30 hari</small>
            </div>

            <div className="col-md-4 mb-3">
              <label htmlFor="keep-weekly-for" className="form-label">Pertahankan Mingguan (Minggu)</label>
              <input
                id="keep-weekly-for"
                type="number"
                className="form-control"
                value={localConfig.retentionPolicy.keepWeeklyFor}
                onChange={(e) =>
                  handleChange(
                    'keepWeeklyFor',
                    parseInt(e.target.value),
                  )
                }
                min="1"
                max="52"
                aria-describedby="keep-weekly-for-hint"
              />
              <small id="keep-weekly-for-hint" className="form-text text-muted">Nilai antara 1 dan 52 minggu</small>
            </div>
          </div>
        </div>

        <div className="d-flex gap-2 justify-content-end">
          <button
            type="button"
            className="btn btn-secondary"
            onClick={onCancel}
            aria-label="Batal perubahan konfigurasi"
          >
            Batal
          </button>
          <button
            type="button"
            className="btn btn-primary"
            onClick={handleSave}
            aria-label="Simpan konfigurasi backup"
          >
            Simpan Konfigurasi
          </button>
        </div>
      </div>
    </div>
  )
}

export default memo(BackupConfigForm)
