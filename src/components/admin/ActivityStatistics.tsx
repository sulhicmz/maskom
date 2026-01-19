"use client"

import React, { useState, useEffect, memo } from 'react'
import { useTheme } from '@/contexts/ThemeContext'
import { calculateActivityStatistics } from '@/utils/activityLogger'
import { ActivityStatistics } from '@/types/audit'
import LoadingSpinner from '@/components/ui/LoadingSpinner'

const StatCard = memo(({ title, value, icon, color }: { title: string; value: number; icon: string; color: string }) => {
    const { theme } = useTheme()
    return (
        <div className={`card shadow-sm ${theme === 'dark' ? 'bg-dark text-light' : ''}`}>
            <div className="card-body">
                <div className="d-flex align-items-center">
                    <div className={`p-3 rounded-circle bg-${color} bg-opacity-10 me-3`}>
                        <i className={`bi ${icon} fs-4 text-${color}`}></i>
                    </div>
                    <div>
                        <h6 className="text-muted mb-1">{title}</h6>
                        <h3 className={`mb-0 ${theme === 'dark' ? 'text-light' : ''}`}>
                            {value.toLocaleString()}
                        </h3>
                    </div>
                </div>
            </div>
        </div>
    )
})

StatCard.displayName = 'StatCard'

const ActionStatRow = memo(({ action, count, color }: { action: string; count: number; color: string }) => {
    return (
        <tr>
            <td>
                <span className={`badge bg-${color}`}>{action}</span>
            </td>
            <td>{count.toLocaleString()}</td>
            <td>
                <div className="progress" style={{ height: '6px' }}>
                    <div
                        className={`progress-bar bg-${color}`}
                        role="progressbar"
                        style={{ width: `${Math.min(count * 2, 100)}%` }}
                    ></div>
                </div>
            </td>
        </tr>
    )
})

ActionStatRow.displayName = 'ActionStatRow'

const UserStatRow = memo(({ userId, count, color }: { userId: string; count: number; color: string }) => {
    return (
        <tr>
            <td>{userId}</td>
            <td>{count.toLocaleString()}</td>
            <td>
                <div className="progress" style={{ height: '6px' }}>
                    <div
                        className={`progress-bar bg-${color}`}
                        role="progressbar"
                        style={{ width: `${Math.min(count * 5, 100)}%` }}
                    ></div>
                </div>
            </td>
        </tr>
    )
})

UserStatRow.displayName = 'UserStatRow'

const ActivityStatisticsPanel: React.FC = () => {
    const { theme } = useTheme()
    const [isClient, setIsClient] = useState(false)
    const [stats, setStats] = useState<ActivityStatistics | null>(null)
    const [loading, setLoading] = useState(true)

    useEffect(() => {
        setIsClient(true)
    }, [])

    useEffect(() => {
        if (isClient) {
            const loadStats = () => {
                setLoading(true)
                try {
                    const statistics = calculateActivityStatistics()
                    setStats(statistics)
                } catch (error) {
                    console.error('Failed to load statistics:', error)
                } finally {
                    setLoading(false)
                }
            }

            loadStats()
        }
    }, [isClient])

    if (!isClient) {
        return <LoadingSpinner minHeight={400} color="primary" />
    }

    if (loading || !stats) {
        return <LoadingSpinner minHeight={200} color="primary" />
    }

    const successRate = stats.totalLogs > 0
        ? ((stats.successfulLogs / stats.totalLogs) * 100).toFixed(1)
        : '0.0'

    const topActions = Object.entries(stats.logsByAction)
        .sort(([, a], [, b]) => b - a)
        .slice(0, 10)

    const topUsers = Object.entries(stats.logsByUser)
        .sort(([, a], [, b]) => b - a)
        .slice(0, 10)

    const topResources = Object.entries(stats.logsByResource)
        .sort(([, a], [, b]) => b - a)
        .slice(0, 10)

    const actionColors = ['primary', 'success', 'info', 'warning', 'danger']
    const getActionColor = (index: number): string => actionColors[index % actionColors.length]

    return (
        <div className="activity-statistics-panel">
            <div className="row">
                <div className="col-12">
                    <h5 className="mb-3">Statistik Aktivitas</h5>
                </div>
            </div>

            <div className="row mb-4">
                <div className="col-xl-3 col-lg-4 col-md-6 mb-3">
                    <StatCard
                        title="Total Log"
                        value={stats.totalLogs}
                        icon="bi-journal-text"
                        color="primary"
                    />
                </div>
                <div className="col-xl-3 col-lg-4 col-md-6 mb-3">
                    <StatCard
                        title="Berhasil"
                        value={stats.successfulLogs}
                        icon="bi-check-circle"
                        color="success"
                    />
                </div>
                <div className="col-xl-3 col-lg-4 col-md-6 mb-3">
                    <StatCard
                        title="Gagal"
                        value={stats.failedLogs}
                        icon="bi-x-circle"
                        color="danger"
                    />
                </div>
                <div className="col-xl-3 col-lg-4 col-md-6 mb-3">
                    <StatCard
                        title="Tingkat Keberhasilan"
                        value={parseFloat(successRate)}
                        icon="bi-percent"
                        color="info"
                    />
                </div>
            </div>

            <div className="row mb-4">
                <div className="col-xl-3 col-lg-4 col-md-6 mb-3">
                    <StatCard
                        title="Hari Ini"
                        value={stats.todayActivity}
                        icon="bi-calendar-day"
                        color="success"
                    />
                </div>
                <div className="col-xl-3 col-lg-4 col-md-6 mb-3">
                    <StatCard
                        title="24 Jam Terakhir"
                        value={stats.last24hActivity}
                        icon="bi-clock-history"
                        color="primary"
                    />
                </div>
                <div className="col-xl-3 col-lg-4 col-md-6 mb-3">
                    <StatCard
                        title="7 Hari Terakhir"
                        value={stats.last7DaysActivity}
                        icon="bi-calendar-week"
                        color="info"
                    />
                </div>
                <div className="col-xl-3 col-lg-4 col-md-6 mb-3">
                    <StatCard
                        title="30 Hari Terakhir"
                        value={stats.last30DaysActivity}
                        icon="bi-calendar-month"
                        color="warning"
                    />
                </div>
            </div>

            <div className="row">
                <div className="col-xl-4 col-lg-6 mb-4">
                    <div className={`card shadow-sm ${theme === 'dark' ? 'bg-dark text-light' : ''}`}>
                        <div className="card-header bg-white">
                            <h6 className="mb-0">Aksi Teratas</h6>
                        </div>
                        <div className="card-body">
                            {topActions.length === 0 ? (
                                <p className="text-muted text-center py-3">Belum ada data aktivitas</p>
                            ) : (
                                <div className="table-responsive">
                                    <table className="table table-sm">
                                        <thead>
                                            <tr>
                                                <th>Aksi</th>
                                                <th>Jumlah</th>
                                                <th>Visualisasi</th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {topActions.map(([action, count], index) => (
                                                <ActionStatRow
                                                    key={action}
                                                    action={action}
                                                    count={count}
                                                    color={getActionColor(index)}
                                                />
                                            ))}
                                        </tbody>
                                    </table>
                                </div>
                            )}
                        </div>
                    </div>
                </div>

                <div className="col-xl-4 col-lg-6 mb-4">
                    <div className={`card shadow-sm ${theme === 'dark' ? 'bg-dark text-light' : ''}`}>
                        <div className="card-header bg-white">
                            <h6 className="mb-0">Pengguna Teratas</h6>
                        </div>
                        <div className="card-body">
                            {topUsers.length === 0 ? (
                                <p className="text-muted text-center py-3">Belum ada data pengguna</p>
                            ) : (
                                <div className="table-responsive">
                                    <table className="table table-sm">
                                        <thead>
                                            <tr>
                                                <th>Pengguna</th>
                                                <th>Jumlah</th>
                                                <th>Visualisasi</th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {topUsers.map(([userId, count], index) => (
                                                <UserStatRow
                                                    key={userId}
                                                    userId={userId}
                                                    count={count}
                                                    color={getActionColor(index)}
                                                />
                                            ))}
                                        </tbody>
                                    </table>
                                </div>
                            )}
                        </div>
                    </div>
                </div>

                <div className="col-xl-4 col-lg-6 mb-4">
                    <div className={`card shadow-sm ${theme === 'dark' ? 'bg-dark text-light' : ''}`}>
                        <div className="card-header bg-white">
                            <h6 className="mb-0">Resource Teratas</h6>
                        </div>
                        <div className="card-body">
                            {topResources.length === 0 ? (
                                <p className="text-muted text-center py-3">Belum ada data resource</p>
                            ) : (
                                <div className="table-responsive">
                                    <table className="table table-sm">
                                        <thead>
                                            <tr>
                                                <th>Resource</th>
                                                <th>Jumlah</th>
                                                <th>Visualisasi</th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {topResources.map(([resource, count], index) => (
                                                <tr key={resource}>
                                                    <td>
                                                        <span className={`badge bg-${getActionColor(index)}`}>
                                                            {resource}
                                                        </span>
                                                    </td>
                                                    <td>{count.toLocaleString()}</td>
                                                    <td>
                                                        <div className="progress" style={{ height: '6px' }}>
                                                            <div
                                                                className={`progress-bar bg-${getActionColor(index)}`}
                                                                role="progressbar"
                                                                style={{ width: `${Math.min(count * 10, 100)}%` }}
                                                            ></div>
                                                        </div>
                                                    </td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    )
}

export default ActivityStatisticsPanel
