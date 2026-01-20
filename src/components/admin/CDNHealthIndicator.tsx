'use client';

import { useState, useEffect } from 'react';

interface CDNHealthStatus {
  status: 'healthy' | 'degraded' | 'unhealthy';
  lastCheck: string;
  message: string;
}

export default function CDNHealthIndicator() {
  const [health, setHealth] = useState<CDNHealthStatus | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    checkHealth();
    const interval = setInterval(checkHealth, 60000);
    return () => clearInterval(interval);
  }, []);

  const checkHealth = async () => {
    setIsLoading(true);
    try {
      const response = await fetch('/api/cdn/health');
      if (response.ok) {
        const data = await response.json();
        setHealth(data);
      } else {
        setHealth({
          status: 'unhealthy',
          lastCheck: new Date().toISOString(),
          message: 'Gagal memeriksa status CDN'
        });
      }
      } catch {
        setHealth({
          status: 'unhealthy',
          lastCheck: new Date().toISOString(),
          message: 'CDN tidak dapat diakses'
        });
      } finally {
      setIsLoading(false);
    }
  };

  if (!health) {
    return       <div className="cdn-health-indicator loading">Memeriksa...</div>;

  }

  const statusConfig = {
    healthy: {
      className: 'status-healthy',
      icon: '✓',
      label: 'Sehat'
    },
    degraded: {
      className: 'status-degraded',
      icon: '⚠',
      label: 'Terdegradasi'
    },
    unhealthy: {
      className: 'status-unhealthy',
      icon: '✗',
      label: 'Tidak Sehat'
    }
  };

  const config = statusConfig[health.status];

  return (
    <div className={`cdn-health-indicator ${config.className} ${isLoading ? 'loading' : ''}`}>
      <div className="status-icon">{config.icon}</div>
      <div className="status-info">
        <div className="status-label">{config.label}</div>
        <div className="status-message">{health.message}</div>
        <div className="last-check">
          Terakhir diperiksa: {new Date(health.lastCheck).toLocaleString('id-ID')}
        </div>
      </div>
    </div>
  );
}
