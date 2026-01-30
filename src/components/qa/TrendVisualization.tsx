'use client';

import { memo } from 'react';
import type { SkipTrendData } from '@/types/testDiagnostics';

interface TrendVisualizationProps {
  trendData: SkipTrendData[];
}

const TrendVisualization = ({ trendData }: TrendVisualizationProps) => {
  return (
    <div className="card shadow-sm mb-4">
      <div className="card-header">
        <h5 className="mb-0">
          <i className="bi bi-graph-up me-2"></i>
          Tren Tes yang Diabaikan
        </h5>
      </div>
      <div className="card-body">
        <div className="table-responsive">
          <table className="table table-sm">
            <thead>
              <tr>
                <th>Tanggal</th>
                <th>Total</th>
                <th>Baru</th>
                <th>Telusur Kategori</th>
              </tr>
            </thead>
            <tbody>
              {trendData.slice(-4).map((trend, idx) => (
                <tr key={idx}>
                  <td>{trend.date}</td>
                  <td>{trend.totalSkipped}</td>
                  <td className={trend.newSkips > 0 ? 'text-danger' : 'text-success'}>
                    {trend.newSkips > 0 ? '+' : ''}{trend.newSkips}
                  </td>
                  <td>
                    {Object.entries(trend.categoryBreakdown)
                      .filter(([, count]) => count > 0)
                      .map(([cat, count]) => `${cat}: ${count}`)
                      .join(', ') || '-'}
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

export default memo(TrendVisualization);
