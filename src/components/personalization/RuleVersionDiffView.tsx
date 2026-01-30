'use client';

import React from 'react';
import { useTheme } from '@/contexts/ThemeContext';
import type { RuleVersionDiff } from '@/types/personalization';

interface RuleVersionDiffViewProps {
  diffs: RuleVersionDiff[];
  version1Timestamp?: string;
  version2Timestamp?: string;
}

export default function RuleVersionDiffView({ diffs, version1Timestamp, version2Timestamp }: RuleVersionDiffViewProps) {
  const { theme } = useTheme();

  const formatDate = (timestamp: string) => {
    const date = new Date(timestamp);
    return date.toLocaleDateString('id-ID', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const formatValue = (value: unknown): string => {
    if (value === null || value === undefined) return '-';
    if (typeof value === 'object') {
      return JSON.stringify(value, null, 2);
    }
    return String(value);
  };

  return (
    <div className={`card ${theme === 'dark' ? 'bg-secondary text-light' : ''}`}>
      <div className="card-header">
        <h5 className="mb-0">Perbedaan Versi</h5>
      </div>
      <div className="card-body">
        {(version1Timestamp || version2Timestamp) && (
          <div className="mb-3">
            {version1Timestamp && (
              <div>
                <strong>Versi 1:</strong> {formatDate(version1Timestamp)}
              </div>
            )}
            {version2Timestamp && (
              <div>
                <strong>Versi 2:</strong> {formatDate(version2Timestamp)}
              </div>
            )}
          </div>
        )}
        {diffs.length === 0 ? (
          <p className="text-muted">Tidak ada perbedaan antara kedua versi</p>
        ) : (
          <div className="table-responsive">
            <table className="table">
              <thead>
                <tr>
                  <th>Field</th>
                  <th>Jenis Perubahan</th>
                  <th>Nilai Lama</th>
                  <th>Nilai Baru</th>
                </tr>
              </thead>
              <tbody>
                {diffs.map((diff, index) => (
                  <tr
                    key={index}
                    className={
                      diff.type === 'changed'
                        ? 'table-warning'
                        : diff.type === 'added'
                        ? 'table-success'
                        : 'table-danger'
                    }
                  >
                    <td>
                      <strong>{diff.field}</strong>
                    </td>
                    <td>
                      <span
                        className={`badge ${
                          diff.type === 'changed'
                            ? 'bg-warning text-dark'
                            : diff.type === 'added'
                            ? 'bg-success'
                            : 'bg-danger'
                        }`}
                      >
                        {diff.type === 'added'
                          ? 'Ditambahkan'
                          : diff.type === 'removed'
                          ? 'Dihapus'
                          : 'Diubah'}
                      </span>
                    </td>
                    <td>
                      <pre className="mb-0" style={{ maxHeight: '150px', overflow: 'auto' }}>
                        {formatValue(diff.oldValue)}
                      </pre>
                    </td>
                    <td>
                      <pre className="mb-0" style={{ maxHeight: '150px', overflow: 'auto' }}>
                        {formatValue(diff.newValue)}
                      </pre>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
