"use client"

import React, { useState, useEffect, memo } from 'react'
import { useTheme } from '@/contexts/ThemeContext'
import { useAuthService } from '@/hooks/useAuthService'
import { useRouter } from 'next/navigation'
import {
    getLogs,
    filterLogs,
    exportLogsToCSV,
    exportLogsToJSON,
    downloadLogs,
} from '@/utils/activityLogger'
import { ActivityLog, ActivityAction, ActivityDetails } from '@/types/audit'
import LoadingSpinner from '@/components/ui/LoadingSpinner'
import ProtectedRoute from '@/components/common/ProtectedRoute'
import { Permission } from '@/types/permission'

const ActionBadge = memo(({ action }: { action: ActivityAction }) => {
    const getActionColor = (action: ActivityAction): string => {
        const authActions = [ActivityAction.LOGIN, ActivityAction.LOGOUT, ActivityAction.PASSWORD_CHANGE, ActivityAction.MFA_ENABLED, ActivityAction.MFA_DISABLED]
        const contentActions = [ActivityAction.CONTENT_PUBLISH, ActivityAction.CONTENT_UPDATE, ActivityAction.CONTENT_DELETE, ActivityAction.CONTENT_SCHEDULE]
        const securityActions = [ActivityAction.ROLE_CHANGE, ActivityAction.PERMISSION_GRANTED, ActivityAction.PERMISSION_REVOKED]
        const systemActions = [ActivityAction.BACKUP_CREATE, ActivityAction.BACKUP_RESTORE, ActivityAction.BACKUP_DELETE, ActivityAction.CACHE_CLEAR, ActivityAction.SETTINGS_CHANGE]

        if (authActions.includes(action)) return 'bg-info'
        if (contentActions.includes(action)) return 'bg-success'
        if (securityActions.includes(action)) return 'bg-warning'
        if (systemActions.includes(action)) return 'bg-primary'
        return 'bg-secondary'
    }

    const getActionLabel = (action: ActivityAction): string => {
        const labels: Record<ActivityAction, string> = {
            [ActivityAction.LOGIN]: 'Masuk',
            [ActivityAction.LOGOUT]: 'Keluar',
            [ActivityAction.PASSWORD_CHANGE]: 'Ubah Password',
            [ActivityAction.MFA_ENABLED]: 'Aktifkan MFA',
            [ActivityAction.MFA_DISABLED]: 'Nonaktifkan MFA',
            [ActivityAction.BACKUP_CODES_GENERATED]: 'Generate Kode Cadangan',
            [ActivityAction.ROLE_CHANGE]: 'Ubah Role',
            [ActivityAction.ROLE_ASSIGNED]: 'Tetapkan Role',
            [ActivityAction.ROLE_REMOVED]: 'Hapus Role',
            [ActivityAction.PERMISSION_GRANTED]: 'Berikan Izin',
            [ActivityAction.PERMISSION_REVOKED]: 'Cabut Izin',
            [ActivityAction.CONTENT_PUBLISH]: 'Publikasikan Konten',
            [ActivityAction.CONTENT_UPDATE]: 'Perbarui Konten',
            [ActivityAction.CONTENT_DELETE]: 'Hapus Konten',
            [ActivityAction.CONTENT_SCHEDULE]: 'Jadwalkan Konten',
            [ActivityAction.SETTINGS_CHANGE]: 'Ubah Pengaturan',
            [ActivityAction.BACKUP_CREATE]: 'Buat Backup',
            [ActivityAction.BACKUP_RESTORE]: 'Pulihkan Backup',
            [ActivityAction.BACKUP_DELETE]: 'Hapus Backup',
            [ActivityAction.CACHE_CLEAR]: 'Bersihkan Cache',
            [ActivityAction.APM_CONFIG_CHANGE]: 'Ubah Konfigurasi APM',
            [ActivityAction.USER_REGISTER]: 'Daftar Pengguna',
            [ActivityAction.USER_DELETE]: 'Hapus Pengguna',
            [ActivityAction.API_ACCESS]: 'Akses API',
            [ActivityAction.COMMENT_CREATE]: 'Buat Komentar',
            [ActivityAction.COMMENT_DELETE]: 'Hapus Komentar',
            [ActivityAction.COMMENT_MODERATE]: 'Moderasi Komentar',
        }

        return labels[action] || action
    }

    return (
        <span className={`badge ${getActionColor(action)}`}>
            {getActionLabel(action)}
        </span>
    )
})

ActionBadge.displayName = 'ActionBadge'

const LogRow = memo(({ log, index }: { log: ActivityLog; index: number }) => {
    const { theme } = useTheme()
    const formatTimestamp = (timestamp: string): string => {
        const date = new Date(timestamp)
        return date.toLocaleString('id-ID', {
            day: '2-digit',
            month: 'short',
            year: 'numeric',
            hour: '2-digit',
            minute: '2-digit',
            second: '2-digit',
        })
    }

    const formatDetails = (details: ActivityDetails): string => {
        if (Object.keys(details).length === 0) return '-'
        return Object.entries(details)
            .map(([key, value]) => `${key}: ${JSON.stringify(value)}`)
            .join(', ')
            .substring(0, 100)
    }

    return (
        <tr className={theme === 'dark' ? 'table-dark' : ''}>
            <td><small>{log.id}</small></td>
            <td>{log.userId}</td>
            <td><ActionBadge action={log.action} /></td>
            <td>{log.resource}</td>
            <td>{log.resourceId || '-'}</td>
            <td><small>{formatDetails(log.details)}</small></td>
            <td>{formatTimestamp(log.timestamp)}</td>
            <td>{log.ipAddress}</td>
            <td>
                {log.success ? (
                    <span className="badge bg-success">Berhasil</span>
                ) : (
                    <span className="badge bg-danger">{log.errorMessage || 'Gagal'}</span>
                )}
            </td>
        </tr>
    )
})

LogRow.displayName = 'LogRow'

const ActivityLogViewer: React.FC = () => {
    const { theme } = useTheme()
    const { user } = useAuthService()
    const router = useRouter()
    const [isClient, setIsClient] = useState(false)
    const [logs, setLogs] = useState<ActivityLog[]>([])
    const [filteredLogs, setFilteredLogs] = useState<ActivityLog[]>([])
    const [loading, setLoading] = useState(true)
    const [searchTerm, setSearchTerm] = useState('')
    const [selectedAction, setSelectedAction] = useState<string>('')
    const [selectedUser, setSelectedUser] = useState<string>('')
    const [selectedResource, setSelectedResource] = useState<string>('')
    const [successFilter, setSuccessFilter] = useState<string>('all')

    useEffect(() => {
        setIsClient(true)
    }, [])

    useEffect(() => {
        if (isClient) {
            const loadLogs = () => {
                setLoading(true)
                try {
                    const allLogs = getLogs()
                    setLogs(allLogs)
                    applyFilters(allLogs)
                } catch (error) {
                    console.error('Failed to load logs:', error)
                } finally {
                    setLoading(false)
                }
            }

            loadLogs()
        }
    }, [isClient])

    const applyFilters = (logsToFilter: ActivityLog[]) => {
        let result = logsToFilter

        if (searchTerm) {
            const term = searchTerm.toLowerCase()
            result = result.filter(log =>
                log.id.toLowerCase().includes(term) ||
                log.userId.toLowerCase().includes(term) ||
                log.resource.toLowerCase().includes(term) ||
                (log.resourceId && log.resourceId.toLowerCase().includes(term))
            )
        }

        if (selectedAction) {
            result = result.filter(log => log.action === selectedAction)
        }

        if (selectedUser) {
            result = result.filter(log => log.userId === selectedUser)
        }

        if (selectedResource) {
            result = result.filter(log => log.resource === selectedResource)
        }

        if (successFilter !== 'all') {
            result = result.filter(log => {
                if (successFilter === 'success') return log.success
                if (successFilter === 'failed') return !log.success
                return true
            })
        }

        setFilteredLogs(result)
    }

    const handleExportCSV = () => {
        downloadLogs(filteredLogs, 'csv', 'activity_logs')
    }

    const handleExportJSON = () => {
        downloadLogs(filteredLogs, 'json', 'activity_logs')
    }

    const clearFilters = () => {
        setSearchTerm('')
        setSelectedAction('')
        setSelectedUser('')
        setSelectedResource('')
        setSuccessFilter('all')
        setFilteredLogs(logs)
    }

    const uniqueUsers = Array.from(new Set(logs.map(log => log.userId)))
    const uniqueResources = Array.from(new Set(logs.map(log => log.resource)))

    if (!isClient) {
        return <LoadingSpinner minHeight={400} color="primary" />
    }

    return (
        <ProtectedRoute requiredPermission={Permission.MANAGE_USERS}>
            <section className={`audit-logs-section ${theme === 'dark' ? 'dark-mode' : ''}`}>
                <div className="container">
                    <div className="row">
                        <div className="col-12">
                            <div className="section-title text-center mb-5">
                                <h2>Audit Logs</h2>
                                <p className="text-muted">Pantau aktivitas pengguna dan kepatuhan keamanan</p>
                            </div>
                        </div>
                    </div>

                    <div className="row">
                        <div className="col-12">
                            <div className="card shadow-sm">
                                <div className="card-header bg-white">
                                    <div className="row align-items-center">
                                        <div className="col-md-6">
                                            <h5 className="mb-0">
                                                Riwayat Aktivitas ({filteredLogs.length} log)
                                            </h5>
                                        </div>
                                        <div className="col-md-6 text-end">
                                            <button
                                                className="btn btn-sm btn-outline-primary me-2"
                                                onClick={handleExportCSV}
                                            >
                                                <i className="bi bi-file-earmark-csv me-1"></i>
                                                Export CSV
                                            </button>
                                            <button
                                                className="btn btn-sm btn-outline-primary"
                                                onClick={handleExportJSON}
                                            >
                                                <i className="bi bi-file-earmark-json me-1"></i>
                                                Export JSON
                                            </button>
                                        </div>
                                    </div>
                                </div>
                                <div className="card-body">
                                    <div className="row mb-4">
                                        <div className="col-md-3 mb-2">
                                            <input
                                                type="text"
                                                className="form-control"
                                                placeholder="Cari logs..."
                                                value={searchTerm}
                                                onChange={(e) => {
                                                    setSearchTerm(e.target.value)
                                                    applyFilters(logs)
                                                }}
                                            />
                                        </div>
                                        <div className="col-md-2 mb-2">
                                            <select
                                                className="form-select"
                                                value={selectedAction}
                                                onChange={(e) => {
                                                    setSelectedAction(e.target.value)
                                                    applyFilters(logs)
                                                }}
                                            >
                                                <option value="">Semua Aksi</option>
                                                {Object.values(ActivityAction).map(action => (
                                                    <option key={action} value={action}>{action}</option>
                                                ))}
                                            </select>
                                        </div>
                                        <div className="col-md-2 mb-2">
                                            <select
                                                className="form-select"
                                                value={selectedUser}
                                                onChange={(e) => {
                                                    setSelectedUser(e.target.value)
                                                    applyFilters(logs)
                                                }}
                                            >
                                                <option value="">Semua Pengguna</option>
                                                {uniqueUsers.map(user => (
                                                    <option key={user} value={user}>{user}</option>
                                                ))}
                                            </select>
                                        </div>
                                        <div className="col-md-2 mb-2">
                                            <select
                                                className="form-select"
                                                value={selectedResource}
                                                onChange={(e) => {
                                                    setSelectedResource(e.target.value)
                                                    applyFilters(logs)
                                                }}
                                            >
                                                <option value="">Semua Resource</option>
                                                {uniqueResources.map(resource => (
                                                    <option key={resource} value={resource}>{resource}</option>
                                                ))}
                                            </select>
                                        </div>
                                        <div className="col-md-2 mb-2">
                                            <select
                                                className="form-select"
                                                value={successFilter}
                                                onChange={(e) => {
                                                    setSuccessFilter(e.target.value)
                                                    applyFilters(logs)
                                                }}
                                            >
                                                <option value="all">Semua Status</option>
                                                <option value="success">Berhasil</option>
                                                <option value="failed">Gagal</option>
                                            </select>
                                        </div>
                                        <div className="col-md-1 mb-2">
                                            <button
                                                className="btn btn-outline-secondary w-100"
                                                onClick={clearFilters}
                                            >
                                                <i className="bi bi-x-circle"></i>
                                            </button>
                                        </div>
                                    </div>

                                    {loading ? (
                                        <LoadingSpinner minHeight={200} color="primary" />
                                    ) : filteredLogs.length === 0 ? (
                                        <div className="text-center py-5">
                                            <i className="bi bi-inbox fs-1 text-muted mb-3"></i>
                                            <p className="text-muted">Tidak ada log yang ditemukan</p>
                                        </div>
                                    ) : (
                                        <div className="table-responsive">
                                            <table className="table table-hover">
                                                <thead>
                                                    <tr>
                                                        <th scope="col">ID</th>
                                                        <th scope="col">Pengguna</th>
                                                        <th scope="col">Aksi</th>
                                                        <th scope="col">Resource</th>
                                                        <th scope="col">Resource ID</th>
                                                        <th scope="col">Detail</th>
                                                        <th scope="col">Waktu</th>
                                                        <th scope="col">IP Address</th>
                                                        <th scope="col">Status</th>
                                                    </tr>
                                                </thead>
                                                <tbody>
                                                    {filteredLogs.slice(0, 50).map((log, index) => (
                                                        <LogRow key={log.id} log={log} index={index} />
                                                    ))}
                                                </tbody>
                                            </table>
                                            {filteredLogs.length > 50 && (
                                                <div className="text-center mt-3">
                                                    <p className="text-muted">
                                                        Menampilkan 50 dari {filteredLogs.length} log
                                                    </p>
                                                </div>
                                            )}
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </section>
        </ProtectedRoute>
    )
}

export default ActivityLogViewer
