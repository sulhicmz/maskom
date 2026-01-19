'use client';

import React, { useState, useEffect } from 'react';
import { 
    ActivityLog, 
    AuditSummary,
    AuditFilters
} from '@/types/audit';
import { filterLogs } from '@/utils/activityLogger';

interface AuditReportDashboardProps {
    onFilterChange?: (filters: AuditFilters) => void;
}

export const AuditReportDashboard: React.FC<AuditReportDashboardProps> = ({
    onFilterChange,
}) => {
    const [summary, setSummary] = useState<AuditSummary | null>(null);
    const [trendData, setTrendData] = useState<Record<string, number>>({});
    const [timeFilter, setTimeFilter] = useState<'today' | '24h' | '7days' | '30days'>('7days');

    useEffect(() => {
        loadAuditData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    const loadAuditData = () => {
        const endDate = new Date();
        let startDate: Date;

        switch (timeFilter) {
            case 'today':
                startDate = new Date(endDate);
                startDate.setHours(0, 0, 0, 0);
                break;
            case '24h':
                startDate = new Date(endDate.getTime() - 24 * 60 * 60 * 1000);
                break;
            case '7days':
                startDate = new Date(endDate.getTime() - 7 * 24 * 60 * 60 * 1000);
                break;
            case '30days':
                startDate = new Date(endDate.getTime() - 30 * 24 * 60 * 60 * 1000);
                break;
            default:
                startDate = new Date(endDate.getTime() - 7 * 24 * 60 * 60 * 1000);
        }

        const filters: AuditFilters = {
            startDate: startDate.toISOString(),
            endDate: endDate.toISOString(),
        };

        const logs = filterLogs(filters);
        const stats = calculateAuditStats(logs);
        setSummary(stats);

        const trends = calculateTrends(logs);
        setTrendData(trends);

        if (onFilterChange) {
            onFilterChange(filters);
        }
    };

    const calculateAuditStats = (logs: ActivityLog[]): AuditSummary => {
        const changesByAction: Record<string, number> = {};
        const changesByUser: Record<string, number> = {};
        const changesByResource: Record<string, number> = {};

        let suspiciousChanges = 0;
        let approvedChanges = 0;
        let pendingApproval = 0;

        for (const log of logs) {
            if (!changesByAction[log.action]) {
                changesByAction[log.action] = 0;
            }
            changesByAction[log.action]++;

            if (!changesByUser[log.userId]) {
                changesByUser[log.userId] = 0;
            }
            changesByUser[log.userId]++;

            if (!changesByResource[log.resource]) {
                changesByResource[log.resource] = 0;
            }
            changesByResource[log.resource]++;

            if (log.details?.apprvedBy) {
                approvedChanges++;
            } else if (
                log.action.includes('permission') || 
                log.action.includes('role')
            ) {
                pendingApproval++;
            }

            const suspicious = detectSuspiciousLog(log, logs);
            if (suspicious) {
                suspiciousChanges++;
            }
        }

        return {
            totalChanges: logs.length,
            changesByAction,
            changesByUser,
            changesByResource,
            suspiciousChanges,
            approvedChanges,
            pendingApproval,
        };
    };

    const detectSuspiciousLog = (log: ActivityLog, allLogs: ActivityLog[]): boolean => {
        const userLogs = allLogs.filter(l => l.userId === log.userId);
        
        if (userLogs.length > 10) {
            return true;
        }

        if (log.action.includes('admin') || log.action.includes('permission_grant')) {
            const recentAdminChanges = userLogs.filter(
                l => l.timestamp > new Date(Date.now() - 60 * 60 * 1000).toISOString()
            );
            if (recentAdminChanges.length > 3) {
                return true;
            }
        }

        return false;
    };

    const calculateTrends = (logs: ActivityLog[]): Record<string, number> => {
        const trends: Record<string, number> = {};
        
        const last7Days = logs.filter(
            log => new Date(log.timestamp) > new Date(Date.now() - 7 * 24 * 60 * 60 * 1000)
        );
        
        const last30Days = logs.filter(
            log => new Date(log.timestamp) > new Date(Date.now() - 30 * 24 * 60 * 60 * 1000)
        );

        const byDay: Record<string, number> = {};
        for (const log of last7Days) {
            const day = new Date(log.timestamp).toLocaleDateString('id-ID');
            byDay[day] = (byDay[day] || 0) + 1;
        }

        return byDay;
    };

    const handleActionFilterChange = (action: string) => {
        setSelectedAction(action);
    };

    if (!summary) {
        return (
            <div className="text-center py-5">
                <div className="spinner-border text-primary" role="status">
                    <span className="visually-hidden">Memuat...</span>
                </div>
            </div>
        );
    }

    return (
        <div className="card">
            <div className="card-header d-flex justify-content-between align-items-center">
                <h3>Dashboard Audit Izin</h3>
                <div className="btn-group" role="group">
                    <button
                        className={`btn btn-outline-primary ${timeFilter === 'today' ? 'active' : ''}`}
                        onClick={() => setTimeFilter('today')}
                    >
                        Hari Ini
                    </button>
                    <button
                        className={`btn btn-outline-primary ${timeFilter === '24h' ? 'active' : ''}`}
                        onClick={() => setTimeFilter('24h')}
                    >
                        24 Jam
                    </button>
                    <button
                        className={`btn btn-outline-primary ${timeFilter === '7days' ? 'active' : ''}`}
                        onClick={() => setTimeFilter('7days')}
                    >
                        7 Hari
                    </button>
                    <button
                        className={`btn btn-outline-primary ${timeFilter === '30days' ? 'active' : ''}`}
                        onClick={() => setTimeFilter('30days')}
                    >
                        30 Hari
                    </button>
                </div>
            </div>
            <div className="card-body">
                <div className="row">
                    <div className="col-md-3 mb-4">
                        <div className="card bg-light">
                            <div className="card-body">
                                <h6 className="text-muted">Total Perubahan</h6>
                                <h2 className="mb-0">{summary.totalChanges}</h2>
                            </div>
                        </div>
                    </div>
                    <div className="col-md-3 mb-4">
                        <div className="card bg-danger bg-opacity-10">
                            <div className="card-body">
                                <h6 className="text-muted">Perubahan Mencurigakan</h6>
                                <h2 className="mb-0 text-danger">{summary.suspiciousChanges}</h2>
                            </div>
                        </div>
                    </div>
                    <div className="col-md-3 mb-4">
                        <div className="card bg-success bg-opacity-10">
                            <div className="card-body">
                                <h6 className="text-muted">Disetujui</h6>
                                <h2 className="mb-0 text-success">{summary.approvedChanges}</h2>
                            </div>
                        </div>
                    </div>
                    <div className="col-md-3 mb-4">
                        <div className="card bg-warning bg-opacity-10">
                            <div className="card-body">
                                <h6 className="text-muted">Menunggu Persetujuan</h6>
                                <h2 className="mb-0 text-warning">{summary.pendingApproval}</h2>
                            </div>
                        </div>
                    </div>
                </div>

                <div className="row mt-4">
                    <div className="col-md-6">
                        <h5>Perubahan Berdasarkan Tindakan</h5>
                        <div className="table-responsive">
                            <table className="table table-sm">
                                <thead>
                                    <tr>
                                        <th>Tindakan</th>
                                        <th>Jumlah</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {Object.entries(summary.changesByAction)
                                        .sort(([, a], [, b]) => b - a)
                                        .slice(0, 5)
                                        .map(([action, count], index) => (
                                            <tr key={index}>
                                                <td>{formatActionName(action)}</td>
                                                <td>{count}</td>
                                            </tr>
                                        ))}
                                </tbody>
                            </table>
                        </div>
                    </div>
                    <div className="col-md-6">
                        <h5>Pengguna Paling Aktif</h5>
                        <div className="table-responsive">
                            <table className="table table-sm">
                                <thead>
                                    <tr>
                                        <th>ID Pengguna</th>
                                        <th>Jumlah Perubahan</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {Object.entries(summary.changesByUser)
                                        .sort(([, a], [, b]) => b - a)
                                        .slice(0, 5)
                                        .map(([userId, count], index) => (
                                            <tr key={index}>
                                                <td>{userId}</td>
                                                <td>{count}</td>
                                            </tr>
                                        ))}
                                </tbody>
                            </table>
                        </div>
                    </div>
                </div>

                <div className="row mt-4">
                    <div className="col-md-6">
                        <h5>Resource Paling Diubah</h5>
                        <div className="table-responsive">
                            <table className="table table-sm">
                                <thead>
                                    <tr>
                                        <th>Resource</th>
                                        <th>Jumlah Perubahan</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {Object.entries(summary.changesByResource)
                                        .sort(([, a], [, b]) => b - a)
                                        .slice(0, 5)
                                        .map(([resource, count], index) => (
                                            <tr key={index}>
                                                <td>{resource}</td>
                                                <td>{count}</td>
                                            </tr>
                                        ))}
                                </tbody>
                            </table>
                        </div>
                    </div>
                    <div className="col-md-6">
                        <h5>Tren Aktivitas (7 Hari Terakhir)</h5>
                        {Object.keys(trendData).length > 0 ? (
                            <div className="progress-stacked" style={{ height: '200px' }}>
                                {Object.entries(trendData)
                                    .slice(0, 7)
                                    .map(([day, count], index, arr) => {
                                        const maxCount = Math.max(...Object.values(trendData));
                                        const height = (count / maxCount) * 100;
                                        const barWidth = 100 / Math.min(arr.length, 7);
                                        return (
                                            <div
                                                key={index}
                                                className="progress"
                                                style={{
                                                    width: `${barWidth}%`,
                                                    height: `${height}%`,
                                                    backgroundColor: getColorForIndex(index),
                                                    marginRight: '2px',
                                                }}
                                                title={`${day}: ${count} perubahan`}
                                            ></div>
                                        );
                                    })}
                            </div>
                        ) : (
                            <p className="text-muted">Tidak ada data aktivitas.</p>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};

const formatActionName = (action: string): string => {
    const actionMap: Record<string, string> = {
        'role_change': 'Ubah Peran',
        'role_assigned': 'Tetapkan Peran',
        'role_removed': 'Hapus Peran',
        'permission_granted': 'Berikan Izin',
        'permission_revoked': 'Tarik Izin',
        'settings_change': 'Ubah Pengaturan',
    };
    return actionMap[action] || action;
};

const getColorForIndex = (index: number): string => {
    const colors = [
        '#0d6efd',
        '#6610f2',
        '#dc3545',
        '#fd7e14',
        '#198754',
        '#0dcaf0',
        '#6f42c1',
    ];
    return colors[index % colors.length];
};
