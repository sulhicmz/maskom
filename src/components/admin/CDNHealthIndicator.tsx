'use client';

import { useState, useEffect } from 'react';
import { withTimeout } from '@/utils/resilience/timeout';
import { withRetry } from '@/utils/resilience/retry';
import { CircuitBreaker } from '@/utils/resilience/circuitBreaker';
import { TIMEOUTS, SERVICE_RETRY_CONFIG } from '@/constants';
import { CIRCUIT_BREAKER_CONFIG } from '@/constants/circuitBreaker';

interface CDNHealthStatus {
  status: 'healthy' | 'degraded' | 'unhealthy';
  lastCheck: string;
  message: string;
}

const cdnCircuitBreaker = new CircuitBreaker(CIRCUIT_BREAKER_CONFIG.CDN_API);

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
      const retryResult = await cdnCircuitBreaker.execute(async () => {
        return await withRetry(
          async () => {
            return await withTimeout(
              fetch('/api/cdn/health'),
              { timeoutMs: TIMEOUTS.CDN_API, timeoutError: 'CDN health check request timed out' }
            );
          },
          { ...SERVICE_RETRY_CONFIG.CDN_API, retryableErrors: [...SERVICE_RETRY_CONFIG.CDN_API.retryableErrors] }
        );
      });

      if (retryResult.success && retryResult.data) {
        const response = retryResult.data;
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
      } else {
        setHealth({
          status: 'unhealthy',
          lastCheck: new Date().toISOString(),
          message: retryResult.error?.message || 'CDN tidak dapat diakses'
        });
      }
    } catch (error) {
      setHealth({
        status: 'unhealthy',
        lastCheck: new Date().toISOString(),
        message: error instanceof Error ? error.message : 'CDN tidak dapat diakses'
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
