'use client';

import React from 'react';
import { generatePermissionDiff } from '@/utils/auditReportGenerator';
import { ActivityDetailValue } from '@/types/audit';

interface PermissionDiffViewerProps {
    beforeValues: Record<string, ActivityDetailValue>;
    afterValues: Record<string, ActivityDetailValue>;
}

export const PermissionDiffViewer: React.FC<PermissionDiffViewerProps> = ({
    beforeValues,
    afterValues,
}) => {
    const diffs = generatePermissionDiff(beforeValues, afterValues);

    if (diffs.length === 0) {
        return (
            <div className="alert alert-info">
                <i className="bi bi-info-circle me-2"></i>
                Tidak ada perubahan yang terdeteksi.
            </div>
        );
    }

    return (
        <div className="card">
            <div className="card-header">
                <h4>Detail Perubahan Izin</h4>
            </div>
            <div className="card-body">
                <div className="table-responsive">
                    <table className="table table-bordered">
                        <thead>
                            <tr>
                                <th>Field</th>
                                <th>Nilai Sebelum</th>
                                <th>Nilai Sesudah</th>
                                <th>Status</th>
                            </tr>
                        </thead>
                        <tbody>
                            {diffs.map((diff, index) => (
                                <tr key={index}>
                                    <td><strong>{diff.field}</strong></td>
                                    <td className={diff.status === 'removed' ? 'text-danger text-decoration-line-through' : ''}>
                                        {diff.before !== null ? JSON.stringify(diff.before) : '-'}
                                    </td>
                                    <td className={diff.status === 'added' ? 'text-success' : ''}>
                                        {diff.after !== null ? JSON.stringify(diff.after) : '-'}
                                    </td>
                                    <td>
                                        {diff.status === 'added' && (
                                            <span className="badge bg-success">
                                                <i className="bi bi-plus-circle me-1"></i>
                                                Ditambahkan
                                            </span>
                                        )}
                                        {diff.status === 'removed' && (
                                            <span className="badge bg-danger">
                                                <i className="bi bi-dash-circle me-1"></i>
                                                Dihapus
                                            </span>
                                        )}
                                        {diff.status === 'changed' && (
                                            <span className="badge bg-warning">
                                                <i className="bi bi-arrow-left-right me-1"></i>
                                                Diubah
                                            </span>
                                        )}
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
};
