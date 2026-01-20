'use client';

import { CDNMetrics } from '@/types/cdn';

interface CDNMetricsDisplayProps {
  metrics: CDNMetrics;
}

export default function CDNMetricsDisplay({ metrics }: CDNMetricsDisplayProps) {
  const getHealthStatus = (hitRate: number): { status: 'good' | 'warning' | 'bad'; label: string } => {
    if (hitRate >= 80) return { status: 'good', label: 'Baik' };
    if (hitRate >= 60) return { status: 'warning', label: 'Peringatan' };
    return { status: 'bad', label: 'Buruk' };
  };

  const health = getHealthStatus(metrics.cacheHitRate);

  return (
    <div className="cdn-metrics-display">
      <div className="metrics-header">
        <h3>Metrik CDN</h3>
        <div className={`health-badge health-${health.status}`}>
          {health.label}
        </div>
      </div>

      <div className="metrics-grid">
        <div className="metric-card">
          <label>Cache Hit Rate</label>
          <span>{metrics.cacheHitRate}%</span>
          <div className="metric-bar">
            <div
              className="metric-fill"
              style={{
                width: `${metrics.cacheHitRate}%`,
                backgroundColor: health.status === 'good' ? '#28a745' :
                             health.status === 'warning' ? '#ffc107' : '#dc3545'
              }}
            />
          </div>
        </div>

        <div className="metric-card">
          <label>Waktu Respons Rata-rata</label>
          <span>{metrics.averageResponseTime}ms</span>
        </div>

        <div className="metric-card">
          <label>Total Request</label>
          <span>{metrics.totalRequests.toLocaleString('id-ID')}</span>
        </div>

        <div className="metric-card">
          <label>Request Ter-cache</label>
          <span>{metrics.cachedRequests.toLocaleString('id-ID')}</span>
        </div>
      </div>

      <div className="metrics-last-updated">
        Terakhir diperbarui: {new Date(metrics.lastUpdated).toLocaleString('id-ID', {
          dateStyle: 'full',
          timeStyle: 'short'
        })}
      </div>
    </div>
  );
}
