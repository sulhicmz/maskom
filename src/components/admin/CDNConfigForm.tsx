'use client';

import { useState, useEffect } from 'react';
import { CDNConfig, CDNProvider, CDNMetrics } from '@/types/cdn';
import { cdnConfigManager } from '@/utils/cdnConfig';

interface CDNConfigFormProps {
  onSave?: (config: CDNConfig) => void;
}

export default function CDNConfigForm({ onSave }: CDNConfigFormProps) {
  const [config, setConfig] = useState<CDNConfig>(cdnConfigManager.getConfig());
  const [metrics, setMetrics] = useState<CDNMetrics | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [errors, setErrors] = useState<string[]>([]);

  useEffect(() => {
    loadMetrics();
  }, []);

  const loadMetrics = async () => {
    try {
      const response = await fetch('/api/cdn/metrics');
      if (response.ok) {
        const data = await response.json();
        setMetrics(data);
      }
    } catch (error) {
      console.error('Failed to load CDN metrics:', error);
    }
  };

  const handleSave = async () => {
    const validation = cdnConfigManager.validateConfig();

    if (!validation.valid) {
      setErrors(validation.errors);
      return;
    }

    setIsLoading(true);
    setErrors([]);

    try {
      cdnConfigManager.updateConfig(config);

      const response = await fetch('/api/cdn/config', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(config)
      });

      if (!response.ok) {
        throw new Error('Failed to save CDN configuration');
      }

      onSave?.(config);
      await loadMetrics();
    } catch (error) {
      setErrors([error instanceof Error ? error.message : 'Unknown error']);
    } finally {
      setIsLoading(false);
    }
  };

  const handlePurgeCache = async () => {
    setIsLoading(true);
    setErrors([]);

    try {
      const response = await fetch('/api/cdn/purge', {
        method: 'POST'
      });

      if (!response.ok) {
        throw new Error('Failed to purge cache');
      }

      await loadMetrics();
    } catch (error) {
      setErrors([error instanceof Error ? error.message : 'Failed to purge cache']);
    } finally {
      setIsLoading(false);
    }
  };

  const handleReset = () => {
    cdnConfigManager.resetConfig();
    setConfig(cdnConfigManager.getConfig());
    setErrors([]);
  };

  return (
    <div className="cdn-config-form">
      <h2>Konfigurasi CDN</h2>

      {errors.length > 0 && (
        <div className="alert alert-danger" role="alert">
          {errors.map((error, index) => (
            <div key={index}>{error}</div>
          ))}
        </div>
      )}

      <div className="form-group">
        <label htmlFor="cdn-enabled">
          <input
            type="checkbox"
            id="cdn-enabled"
            checked={config.enabled}
            onChange={(e) => setConfig({ ...config, enabled: e.target.checked })}
          />
          Aktifkan CDN
        </label>
      </div>

      {config.enabled && (
        <>
          <div className="form-group">
            <label htmlFor="cdn-provider">
              Provider CDN
              <select
                id="cdn-provider"
                value={config.provider}
                onChange={(e) => setConfig({ ...config, provider: e.target.value as CDNProvider })}
              >
                <option value="cloudflare">Cloudflare</option>
                <option value="vercel">Vercel</option>
                <option value="netlify">Netlify</option>
                <option value="custom">Custom</option>
              </select>
            </label>
          </div>

          <div className="form-group">
            <label htmlFor="cdn-base-url">
              Base URL CDN
              <input
                type="url"
                id="cdn-base-url"
                placeholder="https://cdn.example.com"
                value={config.baseUrl || ''}
                onChange={(e) => setConfig({ ...config, baseUrl: e.target.value })}
                required
              />
            </label>
          </div>

          {(config.provider === 'cloudflare' || config.provider === 'custom') && (
            <div className="form-group">
              <label htmlFor="cdn-api-key">
                API Key
                <input
                  type="password"
                  id="cdn-api-key"
                  placeholder="Masukkan API Key"
                  value={config.apiKey || ''}
                  onChange={(e) => setConfig({ ...config, apiKey: e.target.value })}
                />
              </label>
            </div>
          )}

          {config.provider === 'cloudflare' && (
            <>
              <div className="form-group">
                <label htmlFor="cdn-zone-id">
                  Zone ID
                  <input
                    type="text"
                    id="cdn-zone-id"
                    placeholder="Masukkan Zone ID"
                    value={config.zoneId || ''}
                    onChange={(e) => setConfig({ ...config, zoneId: e.target.value })}
                  />
                </label>
              </div>

              <div className="form-group">
                <label htmlFor="cdn-account-id">
                  Account ID
                  <input
                    type="text"
                    id="cdn-account-id"
                    placeholder="Masukkan Account ID"
                    value={config.accountId || ''}
                    onChange={(e) => setConfig({ ...config, accountId: e.target.value })}
                  />
                </label>
              </div>
            </>
          )}
        </>
      )}

      <div className="cdn-actions">
        <button
          onClick={handleSave}
          disabled={isLoading}
          className="btn btn-primary"
        >
          {isLoading ? 'Menyimpan...' : 'Simpan Konfigurasi'}
        </button>

        <button
          onClick={handlePurgeCache}
          disabled={isLoading || !config.enabled}
          className="btn btn-warning"
        >
          {isLoading ? 'Menghapus...' : 'Purge Cache'}
        </button>

        <button
          onClick={handleReset}
          disabled={isLoading}
          className="btn btn-secondary"
        >
          Reset ke Default
        </button>
      </div>

      {metrics && (
        <div className="cdn-metrics">
          <h3>Metrik CDN</h3>
          <div className="metrics-grid">
            <div className="metric-card">
              <label>Cache Hit Rate</label>
              <span>{metrics.cacheHitRate}%</span>
            </div>
            <div className="metric-card">
              <label>Response Time</label>
              <span>{metrics.averageResponseTime}ms</span>
            </div>
            <div className="metric-card">
              <label>Total Requests</label>
              <span>{metrics.totalRequests}</span>
            </div>
            <div className="metric-card">
              <label>Cached Requests</label>
              <span>{metrics.cachedRequests}</span>
            </div>
          </div>
          <div className="metrics-last-updated">
            Terakhir diperbarui: {new Date(metrics.lastUpdated).toLocaleString('id-ID')}
          </div>
        </div>
      )}
    </div>
  );
}
