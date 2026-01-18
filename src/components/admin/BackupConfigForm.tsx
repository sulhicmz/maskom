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
  }

  return (
    <div className={`card shadow-sm ${theme === 'dark' ? 'dark-mode' : ''}`}>
      <div className={`card-header ${theme === 'dark' ? 'bg-dark' : 'bg-white'}`}>
        <h5 className="mb-0">Konfigurasi Backup</h5>
      </div>
      <div className="card-body">
        <div className="row">
          <div className="col-md-6 mb-3">
            <label className="form-label">Status Backup</label>
            <select
              className={`form-select ${errors.enabled ? 'is-invalid' : ''}`}
              value={localConfig.enabled ? 'true' : 'false'}
              onChange={(e) => handleChange('enabled', e.target.value === 'true')}
            >
              <option value="true">Aktif</option>
              <option value="false">Nonaktif</option>
            </select>
          </div>

          <div className="col-md-6 mb-3">
            <label className="form-label">Jadwal Backup</label>
            <select
              className={`form-select ${errors.schedule ? 'is-invalid' : ''}`}
              value={localConfig.schedule}
              onChange={(e) => handleChange('schedule', e.target.value)}
            >
              <option value="manual">Manual</option>
              <option value="daily">Harian</option>
              <option value="weekly">Mingguan</option>
              <option value="monthly">Bulanan</option>
            </select>
          </div>
        </div>

        <div className="row">
          <div className="col-md-6 mb-3">
            <label className="form-label">Waktu Backup</label>
            <input
              type="time"
              className={`form-control ${errors.time ? 'is-invalid' : ''}`}
              value={localConfig.time}
              onChange={(e) => handleChange('time', e.target.value)}
            />
            {errors.time && (
              <div className="invalid-feedback">{errors.time}</div>
            )}
          </div>

          <div className="col-md-6 mb-3">
            <label className="form-label">
              Retensi Hari ({localConfig.retentionDays} hari)
            </label>
            <input
              type="number"
              className={`form-control ${errors.retentionDays ? 'is-invalid' : ''}`}
              value={localConfig.retentionDays}
              onChange={(e) =>
                handleChange('retentionDays', parseInt(e.target.value))
              }
              min="1"
              max="365"
            />
            {errors.retentionDays && (
              <div className="invalid-feedback">{errors.retentionDays}</div>
            )}
          </div>
        </div>

        <div className="row">
          <div className="col-md-6 mb-3">
            <label className="form-label">Tipe Penyimpanan</label>
            <select
              className="form-select"
              value={localConfig.storageType}
              onChange={(e) => handleChange('storageType', e.target.value)}
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
          </div>

          <div className="col-md-6 mb-3">
            <label className="form-label">Ukuran Maksimum (GB)</label>
            <input
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
            />
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
              />
              <label className="form-check-label" htmlFor="encryptionEnabled">
                Enkripsi AES-256
              </label>
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
              />
              <label className="form-check-label" htmlFor="compressionEnabled">
                Kompresi Data
              </label>
            </div>
          </div>
        </div>

        <div className="mb-3">
          <h6 className="mb-3">Kebijakan Retensi</h6>
          <div className="row">
            <div className="col-md-4 mb-3">
              <label className="form-label">
                Pertahankan Backup Terakhir
              </label>
              <input
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
              />
              {errors.keepLastCount && (
                <div className="invalid-feedback">{errors.keepLastCount}</div>
              )}
            </div>

            <div className="col-md-4 mb-3">
              <label className="form-label">Pertahankan Harian (Hari)</label>
              <input
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
              />
            </div>

            <div className="col-md-4 mb-3">
              <label className="form-label">Pertahankan Mingguan (Minggu)</label>
              <input
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
              />
            </div>
          </div>
        </div>

        <div className="d-flex gap-2 justify-content-end">
          <button
            type="button"
            className="btn btn-secondary"
            onClick={onCancel}
          >
            Batal
          </button>
          <button
            type="button"
            className="btn btn-primary"
            onClick={handleSave}
          >
            Simpan Konfigurasi
          </button>
        </div>
      </div>
    </div>
  )
}

export default memo(BackupConfigForm)
