"use client"

import React, { useState, useEffect, useCallback } from 'react'
import { useTheme } from '@/contexts/ThemeContext'
import {
  DrillType,
  DrillSchedule as DrillScheduleType,
  DrillConfig,
  DEFAULT_DRILL_CONFIG
} from '@/types/drill'
import DrillEngine from '@/utils/drillEngine'
import { BackupMetadata } from '@/types/backup'
import { BackupEngine } from '@/utils/backupEngine'
import LoadingSpinner from '@/components/ui/LoadingSpinner'

interface DrillScheduleProps {
  onScheduleCreated: () => void
}

const DrillSchedule: React.FC<DrillScheduleProps> = ({ onScheduleCreated }) => {
  const { theme } = useTheme()
  const [loading, setLoading] = useState(false)
  const [backups, setBackups] = useState<BackupMetadata[]>([])
  const [config, setConfig] = useState<DrillConfig>(DEFAULT_DRILL_CONFIG)

  const [selectedDrillType, setSelectedDrillType] = useState<DrillType>(DrillType.INTEGRITY_CHECK)
  const [selectedBackupId, setSelectedBackupId] = useState<string>('')
  const [scheduleTime, setScheduleTime] = useState<string>('')
  const [recurrence, setRecurrence] = useState<DrillScheduleType>(DrillScheduleType.WEEKLY)
  const [errors, setErrors] = useState<Record<string, string>>({})

  const loadBackups = useCallback(async () => {
    try {
      const backupEngine = BackupEngine.getInstance()
      const metadataList = await backupEngine.getBackupMetadataList()
      setBackups(metadataList || [])

      if (metadataList && metadataList.length > 0) {
        setSelectedBackupId(metadataList[0].id)
      }
    } catch (error) {
      console.error('Error loading backups:', error)
    }
  }, [])

  const loadConfig = useCallback(async () => {
    try {
      const engine = DrillEngine.getInstance()
      const drillConfig = await engine.getDrillConfig()
      setConfig(drillConfig)
      setScheduleTime(drillConfig.time)
      setRecurrence(drillConfig.schedule)
    } catch (error) {
      console.error('Error loading drill config:', error)
    }
  }, [])

  useEffect(() => {
    loadBackups()
    loadConfig()
  }, [loadBackups, loadConfig])

  const validateForm = useCallback((): boolean => {
    const newErrors: Record<string, string> = {}

    if (!selectedBackupId) {
      newErrors.backupId = 'Pilih backup terlebih dahulu'
    }

    if (!scheduleTime) {
      newErrors.scheduleTime = 'Waktu penjadwalan harus diisi'
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }, [selectedBackupId, scheduleTime])

  const handleScheduleDrill = useCallback(async () => {
    if (!validateForm()) {
      return
    }

    setLoading(true)
    try {
      const engine = DrillEngine.getInstance()

      const now = new Date()
      const [hours, minutes] = scheduleTime.split(':').map(Number)
      const scheduledFor = new Date(
        now.getFullYear(),
        now.getMonth(),
        now.getDate(),
        hours,
        minutes,
        0,
        0
      )

      if (scheduledFor <= now) {
        scheduledFor.setDate(scheduledFor.getDate() + 1)
      }

      await engine.scheduleDrill(
        selectedDrillType,
        selectedBackupId,
        scheduledFor.toISOString(),
        recurrence
      )

      alert('Latihan berhasil dijadwalkan!')
      onScheduleCreated()
    } catch (error) {
      console.error('Error scheduling drill:', error)
      alert('Gagal menjadwalkan latihan: ' + (error instanceof Error ? error.message : 'Unknown error'))
    } finally {
      setLoading(false)
    }
  }, [validateForm, selectedDrillType, selectedBackupId, scheduleTime, recurrence, onScheduleCreated])

  const handleSaveConfig = useCallback(async () => {
    setLoading(true)
    try {
      const engine = DrillEngine.getInstance()
      const newConfig: DrillConfig = {
        ...config,
        schedule: recurrence,
        time: scheduleTime
      }
      await engine.saveDrillConfig(newConfig)
      setConfig(newConfig)
      alert('Konfigurasi latihan berhasil disimpan!')
    } catch (error) {
      console.error('Error saving config:', error)
      alert('Gagal menyimpan konfigurasi: ' + (error instanceof Error ? error.message : 'Unknown error'))
    } finally {
      setLoading(false)
    }
  }, [config, recurrence, scheduleTime])

  return (
    <div className={`container-fluid py-4 ${theme}`}>
      <div className="card shadow">
        <div className="card-header bg-primary text-white">
          <h5 className="card-title mb-0">
            <i className="bi bi-calendar-check me-2"></i>
            Jadwal Latihan Pemulihan
          </h5>
        </div>
        <div className="card-body">
          {loading && <LoadingSpinner />}

          <div className="row">
            <div className="col-md-6">
              <div className="card shadow-sm mb-4">
                <div className="card-header bg-info text-white">
                  <h6 className="mb-0">
                    <i className="bi bi-plus-circle me-2"></i>
                    Buat Jadwal Baru
                  </h6>
                </div>
                <div className="card-body">
                  <div className="mb-3">
                    <label className="form-label">
                      <strong>Tipe Latihan</strong>
                    </label>
                    <select
                      className="form-select"
                      value={selectedDrillType}
                      onChange={(e) => setSelectedDrillType(e.target.value as DrillType)}
                    >
                      <option value={DrillType.INTEGRITY_CHECK}>Pemeriksaan Integritas</option>
                      <option value={DrillType.PARTIAL_RESTORE}>Pemulihan Sebagian</option>
                      <option value={DrillType.FULL_RESTORE}>Pemulihan Penuh</option>
                    </select>
                    <small className="text-muted">
                      {selectedDrillType === DrillType.INTEGRITY_CHECK && 'Cepat, hanya verifikasi checksum'}
                      {selectedDrillType === DrillType.PARTIAL_RESTORE && 'Sedang, verifikasi dan pulihkan data sampel'}
                      {selectedDrillType === DrillType.FULL_RESTORE && 'Lengkap, verifikasi dan pulihkan semua data'}
                    </small>
                  </div>

                  <div className="mb-3">
                    <label className="form-label">
                      <strong>Backup Target</strong>
                    </label>
                    <select
                      className={`form-select ${errors.backupId ? 'is-invalid' : ''}`}
                      value={selectedBackupId}
                      onChange={(e) => setSelectedBackupId(e.target.value)}
                    >
                      <option value="">-- Pilih Backup --</option>
                      {backups.map(backup => (
                        <option key={backup.id} value={backup.id}>
                          {backup.id} ({backup.type === 'full' ? 'Penuh' : 'Inkremental'}) - {new Date(backup.timestamp).toLocaleDateString('id-ID')}
                        </option>
                      ))}
                    </select>
                    {errors.backupId && (
                      <div className="invalid-feedback">{errors.backupId}</div>
                    )}
                  </div>

                  <div className="row mb-3">
                    <div className="col-md-6">
                      <label className="form-label">
                        <strong>Waktu Penjadwalan</strong>
                      </label>
                      <input
                        type="time"
                        className={`form-control ${errors.scheduleTime ? 'is-invalid' : ''}`}
                        value={scheduleTime}
                        onChange={(e) => setScheduleTime(e.target.value)}
                      />
                      {errors.scheduleTime && (
                        <div className="invalid-feedback">{errors.scheduleTime}</div>
                      )}
                    </div>
                    <div className="col-md-6">
                      <label className="form-label">
                        <strong>Frekuensi</strong>
                      </label>
                      <select
                        className="form-select"
                        value={recurrence}
                        onChange={(e) => setRecurrence(e.target.value as DrillScheduleType)}
                      >
                        <option value={DrillScheduleType.DAILY}>Harian</option>
                        <option value={DrillScheduleType.WEEKLY}>Mingguan</option>
                        <option value={DrillScheduleType.MONTHLY}>Bulanan</option>
                        <option value={DrillScheduleType.MANUAL}>Manual</option>
                      </select>
                    </div>
                  </div>

                  <div className="alert alert-info">
                    <i className="bi bi-info-circle me-2"></i>
                    <strong>Info:</strong> Latihan akan dijadwalkan dan dijalankan secara otomatis sesuai frekuensi yang dipilih.
                  </div>

                  <button
                    className="btn btn-primary w-100"
                    onClick={handleScheduleDrill}
                    disabled={loading || !selectedBackupId || !scheduleTime}
                  >
                    <i className="bi bi-calendar-plus me-2"></i>
                    {loading ? 'Memproses...' : 'Jadwalkan Latihan'}
                  </button>
                </div>
              </div>
            </div>

            <div className="col-md-6">
              <div className="card shadow-sm">
                <div className="card-header bg-success text-white">
                  <h6 className="mb-0">
                    <i className="bi bi-gear me-2"></i>
                    Konfigurasi Latihan
                  </h6>
                </div>
                <div className="card-body">
                  <div className="mb-3 form-check form-switch">
                    <input
                      className="form-check-input"
                      type="checkbox"
                      id="drillEnabled"
                      checked={config.enabled}
                      onChange={(e) => setConfig({ ...config, enabled: e.target.checked })}
                    />
                    <label className="form-check-label" htmlFor="drillEnabled">
                      <strong>Aktifkan Sistem Latihan</strong>
                    </label>
                  </div>

                  <div className="mb-3 form-check form-switch">
                    <input
                      className="form-check-input"
                      type="checkbox"
                      id="autoRemediate"
                      checked={config.autoRemediate}
                      onChange={(e) => setConfig({ ...config, autoRemediate: e.target.checked })}
                    />
                    <label className="form-check-label" htmlFor="autoRemediate">
                      <strong>Perbaikan Otomatis</strong>
                    </label>
                    <small className="text-muted d-block">
                      Coba perbaikan otomatis saat latihan gagal
                    </small>
                  </div>

                  <div className="mb-3 form-check form-switch">
                    <input
                      className="form-check-input"
                      type="checkbox"
                      id="notificationEnabled"
                      checked={config.notificationEnabled}
                      onChange={(e) => setConfig({ ...config, notificationEnabled: e.target.checked })}
                    />
                    <label className="form-check-label" htmlFor="notificationEnabled">
                      <strong>Notifikasi</strong>
                    </label>
                    <small className="text-muted d-block">
                      Kirim notifikasi saat latihan selesai atau gagal
                    </small>
                  </div>

                  <div className="mb-3">
                    <label className="form-label">
                      <strong>Email Notifikasi (Opsional)</strong>
                    </label>
                    <input
                      type="text"
                      className="form-control"
                      placeholder="admin@example.com, ops@example.com"
                      value={config.notificationEmails.join(', ')}
                      onChange={(e) => setConfig({
                        ...config,
                        notificationEmails: e.target.value.split(',').map(email => email.trim()).filter(email => email)
                      })}
                    />
                    <small className="text-muted">
                      Pisahkan email dengan koma
                    </small>
                  </div>

                  <div className="row mb-3">
                    <div className="col-md-6">
                      <label className="form-label">
                        <strong>Hari Retensi Data</strong>
                      </label>
                      <input
                        type="number"
                        className="form-control"
                        min="1"
                        max="365"
                        value={config.retentionDays}
                        onChange={(e) => setConfig({ ...config, retentionDays: parseInt(e.target.value) || 30 })}
                      />
                    </div>
                    <div className="col-md-6">
                      <label className="form-label">
                        <strong>Maks. Kegagalan Berurutan</strong>
                      </label>
                      <input
                        type="number"
                        className="form-control"
                        min="1"
                        max="10"
                        value={config.maxConsecutiveFailures}
                        onChange={(e) => setConfig({ ...config, maxConsecutiveFailures: parseInt(e.target.value) || 3 })}
                      />
                    </div>
                  </div>

                  <button
                    className="btn btn-success w-100"
                    onClick={handleSaveConfig}
                    disabled={loading}
                  >
                    <i className="bi bi-check-circle me-2"></i>
                    {loading ? 'Menyimpan...' : 'Simpan Konfigurasi'}
                  </button>
                </div>
              </div>

              <div className="card shadow-sm mt-4">
                <div className="card-header">
                  <h6 className="mb-0">
                    <i className="bi bi-lightbulb me-2"></i>
                    Rekomendasi
                  </h6>
                </div>
                <div className="card-body">
                  <ul className="list-unstyled mb-0">
                    <li className="mb-2">
                      <i className="bi bi-check-circle text-success me-2"></i>
                      Jalankan latihan integritas harian untuk verifikasi cepat
                    </li>
                    <li className="mb-2">
                      <i className="bi bi-check-circle text-success me-2"></i>
                      Latihan pemulihan penuh bulanan untuk verifikasi lengkap
                    </li>
                    <li className="mb-2">
                      <i className="bi bi-check-circle text-success me-2"></i>
                      Aktifkan notifikasi untuk mendapatkan peringatan dini
                    </li>
                    <li className="mb-0">
                      <i className="bi bi-check-circle text-success me-2"></i>
                      Pantau dasbor untuk tren keberhasilan latihan
                    </li>
                  </ul>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default DrillSchedule
