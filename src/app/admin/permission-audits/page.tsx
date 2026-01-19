'use client';

import React, { useState } from 'react';
import ProtectedRoute from '@/components/common/ProtectedRoute';
import { Permission } from '@/types/permission';
import { AuditReportGenerator } from '@/components/admin/AuditReportGenerator';
import { AuditReportDashboard } from '@/components/admin/AuditReportDashboard';
import { SuspiciousChangeAlerts } from '@/components/admin/SuspiciousChangeAlerts';
import { PermissionAuditReport, AuditFilters } from '@/types/audit';

const PermissionAuditsPage: React.FC = () => {
    const [activeTab, setActiveTab] = useState<'dashboard' | 'generate' | 'alerts'>('dashboard');
    const [report, setReport] = useState<PermissionAuditReport | null>(null);

    const handleReportGenerated = (newReport: PermissionAuditReport) => {
        setReport(newReport);
    };

    const handleFilterChange = (filters: AuditFilters) => {
        console.log('Filter changed:', filters);
    };

    return (
        <ProtectedRoute requiredPermission={Permission.MANAGE_USERS}>
            <div className="container-fluid py-4">
                <div className="row mb-4">
                    <div className="col-12">
                        <div className="d-flex justify-content-between align-items-center">
                            <div>
                                <h2>Laporan Audit Izin</h2>
                                <p className="text-muted mb-0">
                                    Pantau dan analisis perubahan izin akses untuk kepatuhan dan keamanan
                                </p>
                            </div>
                        </div>
                    </div>
                </div>

                <div className="row mb-4">
                    <div className="col-12">
                        <div className="nav nav-tabs" role="tablist">
                            <button
                                className={`nav-link ${activeTab === 'dashboard' ? 'active' : ''}`}
                                onClick={() => setActiveTab('dashboard')}
                            >
                                <i className="bi bi-speedometer2 me-2"></i>
                                Dashboard
                            </button>
                            <button
                                className={`nav-link ${activeTab === 'generate' ? 'active' : ''}`}
                                onClick={() => setActiveTab('generate')}
                            >
                                <i className="bi bi-file-earmark-bar-graph me-2"></i>
                                Buat Laporan
                            </button>
                            <button
                                className={`nav-link ${activeTab === 'alerts' ? 'active' : ''}`}
                                onClick={() => setActiveTab('alerts')}
                            >
                                <i className="bi bi-exclamation-triangle me-2"></i>
                                Peringatan
                            </button>
                        </div>
                    </div>
                </div>

                <div className="row">
                    <div className="col-12">
                        {activeTab === 'dashboard' && (
                            <div className="row">
                                <div className="col-12 mb-4">
                                    <SuspiciousChangeAlerts />
                                </div>
                                <div className="col-12">
                                    <AuditReportDashboard onFilterChange={handleFilterChange} />
                                </div>
                            </div>
                        )}

                        {activeTab === 'generate' && (
                            <AuditReportGenerator
                                generatedBy="admin"
                                onReportGenerated={handleReportGenerated}
                            />
                        )}

                        {activeTab === 'alerts' && (
                            <SuspiciousChangeAlerts />
                        )}
                    </div>
                </div>

                {report && activeTab === 'generate' && (
                    <div className="row mt-4">
                        <div className="col-12">
                            <div className="alert alert-success">
                                <h4 className="alert-heading">
                                    <i className="bi bi-check-circle-fill me-2"></i>
                                    Laporan Audit Berhasil Dibuat
                                </h4>
                                <p>
                                    Laporan dengan ID <strong>{report.id}</strong> telah berhasil dibuat.
                                    Total <strong>{report.summary.totalChanges}</strong> perubahan izin
                                    ditemukan dalam periode yang ditentukan.
                                </p>
                                <hr />
                                <div className="row">
                                    <div className="col-md-6">
                                        <strong>Ringkasan:</strong>
                                        <ul className="mb-0">
                                            <li>Perubahan Mencurigakan: {report.summary.suspiciousChanges}</li>
                                            <li>Disetujui: {report.summary.approvedChanges}</li>
                                            <li>Menunggu Persetujuan: {report.summary.pendingApproval}</li>
                                        </ul>
                                    </div>
                                    <div className="col-md-6">
                                        <strong>Detail:</strong>
                                        <ul className="mb-0">
                                            <li>Dibuat pada: {new Date(report.generatedAt).toLocaleString('id-ID')}</li>
                                            <li>Dibuat oleh: {report.generatedBy}</li>
                                            <li>Dijalankan: {new Date(report.dateRange.startDate).toLocaleDateString('id-ID')} - {new Date(report.dateRange.endDate).toLocaleDateString('id-ID')}</li>
                                        </ul>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </ProtectedRoute>
    );
};

export default PermissionAuditsPage;
