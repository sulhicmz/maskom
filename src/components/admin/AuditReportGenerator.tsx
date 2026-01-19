'use client';

import React, { useState } from 'react';
import { Button } from '@/components/ui/Button';
import { 
    DateRange, 
    AuditFilters, 
    PermissionAuditReport 
} from '@/types/audit';
import { 
    generatePermissionAuditReport, 
    downloadAuditReport 
} from '@/utils/auditReportGenerator';

interface AuditReportGeneratorProps {
    generatedBy: string;
    onReportGenerated?: (report: PermissionAuditReport) => void;
}

export const AuditReportGenerator: React.FC<AuditReportGeneratorProps> = ({
    generatedBy,
    onReportGenerated,
}) => {
    const [dateRange, setDateRange] = useState<DateRange>({
        startDate: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
        endDate: new Date().toISOString().split('T')[0],
    });
    
    const [userId, setUserId] = useState<string>('');
    const [resource, setResource] = useState<string>('');
    const [report, setReport] = useState<PermissionAuditReport | null>(null);
    const [isLoading, setIsLoading] = useState<boolean>(false);
    const [downloadFormat, setDownloadFormat] = useState<'csv' | 'json'>('csv');

    const handleGenerateReport = () => {
        setIsLoading(true);
        
        setTimeout(() => {
            const filters: AuditFilters = {
                userId: userId || undefined,
                resource: resource || undefined,
            };

            const newReport = generatePermissionAuditReport(dateRange, filters, generatedBy);
            setReport(newReport);
            setIsLoading(false);

            if (onReportGenerated) {
                onReportGenerated(newReport);
            }
        }, 500);
    };

    const handleDownload = () => {
        if (report) {
            downloadAuditReport(report, downloadFormat);
        }
    };

    const handleReset = () => {
        setReport(null);
        setUserId('');
        setResource('');
    };

    return (
        <div className="card">
            <div className="card-header">
                <h3>Generate Audit Report</h3>
            </div>
            <div className="card-body">
                <div className="row mb-3">
                    <div className="col-md-6">
                        <label className="form-label">Tanggal Mulai</label>
                        <input
                            type="date"
                            className="form-control"
                            value={dateRange.startDate}
                            onChange={(e) => setDateRange({ ...dateRange, startDate: e.target.value })}
                        />
                    </div>
                    <div className="col-md-6">
                        <label className="form-label">Tanggal Selesai</label>
                        <input
                            type="date"
                            className="form-control"
                            value={dateRange.endDate}
                            onChange={(e) => setDateRange({ ...dateRange, endDate: e.target.value })}
                        />
                    </div>
                </div>

                <div className="row mb-3">
                    <div className="col-md-6">
                        <label className="form-label">ID Pengguna (Opsional)</label>
                        <input
                            type="text"
                            className="form-control"
                            placeholder="Filter berdasarkan ID pengguna"
                            value={userId}
                            onChange={(e) => setUserId(e.target.value)}
                        />
                    </div>
                    <div className="col-md-6">
                        <label className="form-label">Resource (Opsional)</label>
                        <input
                            type="text"
                            className="form-control"
                            placeholder="Filter berdasarkan resource"
                            value={resource}
                            onChange={(e) => setResource(e.target.value)}
                        />
                    </div>
                </div>

                <div className="mb-3">
                    <Button
                        className="btn-primary"
                        onClick={handleGenerateReport}
                        disabled={isLoading}
                    >
                        {isLoading ? 'Memproses...' : 'Buat Laporan'}
                    </Button>
                    {report && (
                        <Button
                            className="btn-secondary ms-2"
                            onClick={handleReset}
                        >
                            Reset
                        </Button>
                    )}
                </div>

                {report && (
                    <div className="alert alert-success mt-3">
                        <h4>Laporan Berhasil Dibuat!</h4>
                        <p><strong>Total Perubahan:</strong> {report.summary.totalChanges}</p>
                        <p><strong>Perubahan Mencurigakan:</strong> {report.summary.suspiciousChanges}</p>
                        <p><strong>Perubahan Disetujui:</strong> {report.summary.approvedChanges}</p>
                        <p><strong>Menunggu Persetujuan:</strong> {report.summary.pendingApproval}</p>
                        <div className="mt-3">
                            <div className="form-check form-check-inline">
                                <input
                                    className="form-check-input"
                                    type="radio"
                                    id="csv"
                                    checked={downloadFormat === 'csv'}
                                    onChange={() => setDownloadFormat('csv')}
                                />
                                <label className="form-check-label" htmlFor="csv">
                                    CSV
                                </label>
                            </div>
                            <div className="form-check form-check-inline ms-3">
                                <input
                                    className="form-check-input"
                                    type="radio"
                                    id="json"
                                    checked={downloadFormat === 'json'}
                                    onChange={() => setDownloadFormat('json')}
                                />
                                <label className="form-check-label" htmlFor="json">
                                    JSON
                                </label>
                            </div>
                            <Button
                                className="btn-success ms-3"
                                onClick={handleDownload}
                            >
                                Download
                            </Button>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};
