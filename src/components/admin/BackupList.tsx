"use client"

import React, { useState, useEffect, memo } from 'react'
import { useTheme } from '@/contexts/ThemeContext'
import { BackupMetadata, BackupType, BackupStatus } from '@/types/backup'
import { getBackupMetadata } from '@/data/BackupData'
import { BACKUP_METADATA_KEY } from '@/types/backup'
import StatusBadge from '@/components/ui/StatusBadge'
import LoadingSpinner from '@/components/ui/LoadingSpinner'

interface BackupListProps {
  onRestore: (backupId: string) => void
  onDelete: (backupId: string) => void
  onExport: (backupId: string) => void
}

const BackupRow = memo(({
  backup,
  onRestore,
  onDelete,
  onExport,
}: {
  backup: BackupMetadata
  onRestore: (id: string) => void
  onDelete: (id: string) => void
  onExport: (id: string) => void
  index: number
}) => {
  const { theme } = useTheme()
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
    <tr key={index}>
      <td>{backup.id}</td>
      <td>
        <span className={`badge ${
          backup.type === 'full' ? 'bg-primary' : 'bg-info'
        }`}>
          {backup.type === 'full' ? 'Penuh' : 'Inkremental'}
        </span>
      </td>
      <td>
        {formattedDate}{' '}
        <small className="text-muted">({formattedTime})</small>
      </td>
      <td>{formattedSize}</td>
      <td>
        <StatusBadge
          type={backup.status === 'completed' ? 'success' : 'danger'}
        >
          {backup.status === 'completed' ? 'Sukses' : 'Gagal'}
        </StatusBadge>
      </td>
      <td>{backup.encryption}</td>
      <td>{backup.retention}</td>
      <td>
        <div className="d-flex gap-1">
          <button
            className="btn btn-sm btn-success"
            onClick={() => onRestore(backup.id)}
            disabled={backup.status !== 'completed'}
            title="Pulihkan Backup"
          >
            <i className="bi bi-arrow-counterclockwise"></i>
          </button>
          <button
            className="btn btn-sm btn-primary"
            onClick={() => onExport(backup.id)}
            disabled={backup.status !== 'completed'}
            title="Ekspor Backup"
          >
            <i className="bi bi-download"></i>
          </button>
          <button
            className="btn btn-sm btn-danger"
            onClick={() => onDelete(backup.id)}
            title="Hapus Backup"
          >
            <i className="bi bi-trash"></i>
          </button>
        </div>
      </td>
    </tr>
  )
})

BackupRow.displayName = 'BackupRow'

const BackupList: React.FC<BackupListProps> = ({
  onRestore,
  onDelete,
  onExport,
}) => {
  const { theme } = useTheme()
  const [backups, setBackups] = useState<BackupMetadata[]>([])
  const [filteredBackups, setFilteredBackups] = useState<BackupMetadata[]>([])
  const [loading, setLoading] = useState(true)
  const [filterType, setFilterType] = useState<BackupType | 'all'>('all')
  const [filterStatus, setFilterStatus] = useState<BackupStatus | 'all'>('all')
  const [searchTerm, setSearchTerm] = useState('')

  useEffect(() => {
    loadBackups()
  }, [])

  useEffect(() => {
    applyFilters()
  }, [backups, filterType, filterStatus, searchTerm])

  const loadBackups = () => {
    try {
      const metadataList = localStorage.getItem(BACKUP_METADATA_KEY)

      if (metadataList) {
        const parsed: BackupMetadata[] = JSON.parse(metadataList)
        const sorted = parsed.sort(
          (a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime(),
        )
        setBackups(sorted)
      } else {
        setBackups([])
      }
    } catch (error) {
      console.error('Failed to load backups:', error)
      setBackups([])
    } finally {
      setLoading(false)
    }
  }

  const applyFilters = () => {
    let filtered = [...backups]

    if (filterType !== 'all') {
      filtered = filtered.filter((backup) => backup.type === filterType)
    }

    if (filterStatus !== 'all') {
      filtered = filtered.filter((backup) => backup.status === filterStatus)
    }

    if (searchTerm) {
      const term = searchTerm.toLowerCase()
      filtered = filtered.filter(
        (backup) =>
          backup.id.toLowerCase().includes(term) ||
          backup.timestamp.toLowerCase().includes(term),
      )
    }

    setFilteredBackups(filtered)
  }

  const formatBytes = (bytes: number): string => {
    if (bytes === 0) return '0 Bytes'
    const k = 1024
    const sizes = ['Bytes', 'KB', 'MB', 'GB']
    const i = Math.floor(Math.log(bytes) / Math.log(k))
    return Math.round(bytes / Math.pow(k, i) * 100) / 100 + ' ' + sizes[i]
  }

  if (loading) {
    return <LoadingSpinner minHeight={300} color="primary" />
  }

  return (
    <div className={`card shadow-sm ${theme === 'dark' ? 'dark-mode' : ''}`}>
      <div className={`card-header ${theme === 'dark' ? 'bg-dark' : 'bg-white'}`}>
        <h5 className="mb-0">Riwayat Backup</h5>
      </div>
      <div className="card-body">
        <div className="row mb-3">
          <div className="col-md-3 mb-2">
            <select
              className="form-select"
              value={filterType}
              onChange={(e) => setFilterType(e.target.value as BackupType | 'all')}
            >
              <option value="all">Semua Tipe</option>
              <option value="full">Penuh</option>
              <option value="incremental">Inkremental</option>
            </select>
          </div>

          <div className="col-md-3 mb-2">
            <select
              className="form-select"
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value as BackupStatus | 'all')}
            >
              <option value="all">Semua Status</option>
              <option value="completed">Sukses</option>
              <option value="failed">Gagal</option>
              <option value="pending">Pending</option>
              <option value="in_progress">Sedang Berjalan</option>
            </select>
          </div>

          <div className="col-md-6 mb-2">
            <input
              type="text"
              className="form-control"
              placeholder="Cari backup berdasarkan ID atau tanggal..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
        </div>

        <div className="table-responsive">
          <table className="table table-hover">
            <thead>
              <tr>
                <th scope="col">ID Backup</th>
                <th>Tipe</th>
                <th>Tanggal</th>
                <th>Ukuran</th>
                <th>Status</th>
                <th>Enkripsi</th>
                <th>Retensi</th>
                <th>Aksi</th>
              </tr>
            </thead>
            <tbody>
              {filteredBackups.length > 0 ? (
                filteredBackups.map((backup, index) => (
                  <BackupRow
                    key={index}
                    backup={backup}
                    onRestore={onRestore}
                    onDelete={onDelete}
                    onExport={onExport}
                    index={index}
                  />
                ))
              ) : (
                <tr>
                  <td colSpan={9} className="text-center text-muted py-4">
                    <i className="bi bi-inbox fs-1 d-block mb-2"></i>
                    <p>Tidak ada backup yang sesuai dengan filter</p>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {filteredBackups.length > 0 && (
          <div className="mt-3">
            <small className="text-muted">
              Menampilkan {filteredBackups.length} dari {backups.length} backup
            </small>
          </div>
        )}
      </div>
    </div>
  )
}

export default BackupList
