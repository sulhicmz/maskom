'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { SuspiciousActivityAlert } from '@/types/audit';
import { getSuspiciousAlerts, resolveAlert } from '@/utils/activityLogger';
import Button from '@/components/ui/Button';

export const SuspiciousChangeAlerts: React.FC = () => {
    const [alerts, setAlerts] = useState<SuspiciousActivityAlert[]>([]);
    const [selectedAlert, setSelectedAlert] = useState<SuspiciousActivityAlert | null>(null);
    const [isLoading, setIsLoading] = useState<boolean>(true);

    const loadAlerts = useCallback(() => {
        setIsLoading(true);
        try {
            const loadedAlerts = getSuspiciousAlerts();
            setAlerts(loadedAlerts.filter(a => !a.resolved));
        } catch (error) {
            console.error('Failed to load suspicious alerts:', error);
        } finally {
            setIsLoading(false);
        }
    }, []);

    useEffect(() => {
        loadAlerts();
        const interval = setInterval(loadAlerts, 60000);
        return () => clearInterval(interval);
    }, [loadAlerts]);

    const handleResolveAlert = (alertId: string) => {
        if (confirm('Apakah Anda yakin ingin menyelesaikan peringatan ini?')) {
            resolveAlert(alertId, 'admin');
            loadAlerts();
        }
    };

    const handleViewDetails = (alert: SuspiciousActivityAlert) => {
        setSelectedAlert(alert);
    };

    const getRiskLevel = (alert: SuspiciousActivityAlert): 'high' | 'medium' | 'low' => {
        if (alert.count >= alert.threshold * 2) return 'high';
        if (alert.count >= alert.threshold * 1.5) return 'medium';
        return 'low';
    };

    const getRiskBadgeClass = (risk: 'high' | 'medium' | 'low'): string => {
        switch (risk) {
            case 'high':
                return 'badge bg-danger';
            case 'medium':
                return 'badge bg-warning';
            case 'low':
                return 'badge bg-info';
        }
    };

    const getRiskLabel = (risk: 'high' | 'medium' | 'low'): string => {
        switch (risk) {
            case 'high':
                return 'Tinggi';
            case 'medium':
                return 'Sedang';
            case 'low':
                return 'Rendah';
        }
    };

    if (isLoading) {
        return (
            <div className="text-center py-5">
                <div className="spinner-border text-primary" role="status">
                    <span className="visually-hidden">Memuat...</span>
                </div>
            </div>
        );
    }

    if (alerts.length === 0) {
        return (
            <div className="card">
                <div className="card-body text-center py-5">
                    <i className="bi bi-shield-check text-success" style={{ fontSize: '48px' }}></i>
                    <h4 className="mt-3">Tidak Ada Peringatan Mencurigakan</h4>
                    <p className="text-muted">
                        Tidak ada aktivitas mencurigakan yang terdeteksi saat ini.
                    </p>
                </div>
            </div>
        );
    }

    return (
        <div className="card">
            <div className="card-header d-flex justify-content-between align-items-center">
                <h3>
                    <i className="bi bi-exclamation-triangle-fill text-warning me-2"></i>
                    Peringatan Perubahan Mencurigakan
                    <span className="badge bg-danger ms-2">{alerts.length}</span>
                </h3>
                <Button
                    className="btn-outline-secondary btn-sm"
                    onClick={loadAlerts}
                >
                    <i className="bi bi-arrow-clockwise me-1"></i>
                    Refresh
                </Button>
            </div>
            <div className="card-body">
                <div className="list-group">
                    {alerts.sort((a, b) => 
                        new Date(b.triggeredAt).getTime() - new Date(a.triggeredAt).getTime()
                    ).map((alert) => {
                        const riskLevel = getRiskLevel(alert);
                        return (
                            <div
                                key={alert.id}
                                className="list-group-item list-group-item-action"
                                onClick={() => handleViewDetails(alert)}
                                style={{ cursor: 'pointer' }}
                            >
                                <div className="d-flex w-100 justify-content-between">
                                    <div>
                                        <h6 className="mb-1">
                                            <i className="bi bi-shield-exclamation me-2"></i>
                                            {alert.ruleName}
                                        </h6>
                                        <p className="mb-1 text-muted small">
                                            {alert.userId || 'Unknown User'}
                                        </p>
                                        <div className="d-flex gap-2 flex-wrap">
                                            <span className={`badge ${getRiskBadgeClass(riskLevel)}`}>
                                                {getRiskLabel(riskLevel)}
                                            </span>
                                            <span className="badge bg-secondary">
                                                {alert.count} / {alert.threshold} kejadian
                                            </span>
                                        </div>
                                    </div>
                                    <div className="text-end">
                                        <small className="text-muted">
                                            {new Date(alert.triggeredAt).toLocaleString('id-ID')}
                                        </small>
                                    </div>
                                </div>
                            </div>
                        );
                    })}
                </div>

                {selectedAlert && (
                    <div className="modal fade show d-block" tabIndex={-1} role="dialog">
                        <div className="modal-dialog modal-lg">
                            <div className="modal-content">
                                <div className="modal-header">
                                    <h5 className="modal-title">
                                        <i className="bi bi-shield-exclamation me-2"></i>
                                        {selectedAlert.ruleName}
                                    </h5>
                                    <button
                                        type="button"
                                        className="btn-close"
                                        onClick={() => setSelectedAlert(null)}
                                    ></button>
                                </div>
                                <div className="modal-body">
                                    <div className="row mb-3">
                                        <div className="col-md-6">
                                            <strong>ID Peringatan:</strong>
                                            <p>{selectedAlert.id}</p>
                                        </div>
                                        <div className="col-md-6">
                                            <strong>Dipicu pada:</strong>
                                            <p>{new Date(selectedAlert.triggeredAt).toLocaleString('id-ID')}</p>
                                        </div>
                                    </div>

                                    <div className="row mb-3">
                                        <div className="col-md-6">
                                            <strong>ID Pengguna:</strong>
                                            <p>{selectedAlert.userId || 'Tidak diketahui'}</p>
                                        </div>
                                        <div className="col-md-6">
                                            <strong>Tindakan:</strong>
                                            <p>{selectedAlert.action}</p>
                                        </div>
                                    </div>

                                    <div className="mb-3">
                                        <strong>Statistik:</strong>
                                        <p>
                                            {selectedAlert.count} kejadian terdeteksi 
                                            (threshold: {selectedAlert.threshold} per {selectedAlert.timeWindow} menit)
                                        </p>
                                    </div>

                                    <div className="mb-3">
                                        <strong>Aktivitas Terkait:</strong>
                                        <div className="table-responsive">
                                            <table className="table table-sm">
                                                <thead>
                                                    <tr>
                                                        <th>Waktu</th>
                                                        <th>Tindakan</th>
                                                        <th>Resource</th>
                                                    </tr>
                                                </thead>
                                                <tbody>
                                                    {selectedAlert.activities.map((activity, index) => (
                                                        <tr key={index}>
                                                            <td>
                                                                {new Date(activity.timestamp).toLocaleString('id-ID')}
                                                            </td>
                                                            <td>{activity.action}</td>
                                                            <td>{activity.resource}</td>
                                                        </tr>
                                                    ))}
                                                </tbody>
                                            </table>
                                        </div>
                                    </div>
                                </div>
                                <div className="modal-footer">
                                    <Button
                                        className="btn-secondary"
                                        onClick={() => setSelectedAlert(null)}
                                    >
                                        Tutup
                                    </Button>
                                    <Button
                                        className="btn-danger"
                                        onClick={() => {
                                            handleResolveAlert(selectedAlert.id);
                                            setSelectedAlert(null);
                                        }}
                                    >
                                        <i className="bi bi-check-circle me-1"></i>
                                        Selesaikan Peringatan
                                    </Button>
                                </div>
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};
