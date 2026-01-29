'use client';

import React, { memo } from 'react';
import { useTheme } from '@/contexts/ThemeContext';
import type { SegmentPerformance } from '@/types/personalization';

const SEGMENT_LABELS: Record<string, string> = {
  new_visitor: 'Pengunjung Baru',
  returning_visitor: 'Pengunjung Kembali',
  frequent_reader: 'Pembaca Sering',
  content_creator: 'Pembuat Konten',
  engaged_user: 'Pengguna Terlibat',
  dormant_user: 'Pengguna Tidak Aktif',
};

interface SegmentPerformanceTrackerProps {
  segmentPerformance: SegmentPerformance[];
  onExport?: (data: SegmentPerformance[]) => void;
}

const SegmentPerformanceTracker: React.FC<SegmentPerformanceTrackerProps> = memo(({ segmentPerformance, onExport }) => {
  const { theme } = useTheme();

  const getTrendIcon = (trend: 'up' | 'down' | 'stable') => {
    switch (trend) {
      case 'up':
        return <span className="text-success">↑</span>;
      case 'down':
        return <span className="text-danger">↓</span>;
      case 'stable':
        return <span className="text-muted">-</span>;
    }
  };

  const getTrendLabel = (trend: 'up' | 'down' | 'stable') => {
    switch (trend) {
      case 'up':
        return 'Naik';
      case 'down':
        return 'Turun';
      case 'stable':
        return 'Stabil';
    }
  };

  return (
    <div className={`card ${theme === 'dark' ? 'bg-secondary text-light' : ''}`}>
      <div className="card-header d-flex justify-content-between align-items-center">
        <h5 className="card-title mb-0">Performa Segmen</h5>
        {onExport && (
          <button className="btn btn-sm btn-outline-primary" onClick={() => onExport(segmentPerformance)}>
            Ekspor CSV
          </button>
        )}
      </div>
      <div className="card-body">
        <div className="table-responsive">
          <table className="table table-hover">
            <thead>
              <tr>
                <th>Segmen</th>
                <th>Tayangan</th>
                <th>Konversi</th>
                <th>Tarif Konversi</th>
                <th>Keterlibatan</th>
                <th>Lift Rata-rata</th>
                <th>Aturan Terbaik</th>
                <th>Tren</th>
              </tr>
            </thead>
            <tbody>
              {segmentPerformance.map((segment, index) => (
                <tr key={index}>
                  <td>
                    <strong>{SEGMENT_LABELS[segment.segment] || segment.segment}</strong>
                  </td>
                  <td>{segment.totalImpressions.toLocaleString('id-ID')}</td>
                  <td>{segment.totalConversions.toLocaleString('id-ID')}</td>
                  <td>{segment.conversionRate.toFixed(2)}%</td>
                  <td>{segment.engagementRate.toFixed(2)}%</td>
                  <td>
                    <span className={`badge ${segment.avgLift > 0 ? 'bg-success' : 'bg-danger'}`}>
                      {segment.avgLift.toFixed(1)}%
                    </span>
                  </td>
                  <td>{segment.topPerformingRule || 'N/A'}</td>
                  <td>
                    {getTrendIcon(segment.trend)} {getTrendLabel(segment.trend)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
});

SegmentPerformanceTracker.displayName = 'SegmentPerformanceTracker';

export default SegmentPerformanceTracker;
