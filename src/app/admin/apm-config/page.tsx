'use client';

import { useState, useEffect } from 'react';
import ProtectedRoute from '@/components/common/ProtectedRoute';
import { useTheme } from '@/contexts/ThemeContext';
import { Permission } from '@/types';
import { loadAPMConfig, saveAPMConfig, testAPMConnection, validateAPMConfigUI, resetAPMConfig } from '@/utils/apmConfig';
import { APMUIConfig, APMValidationResult } from '@/types';
import SectionTitle from '@/components/common/SectionTitle';
import AnimationWrapper from '@/components/common/AnimationWrapper';
import StatusBadge from '@/components/ui/StatusBadge';

export default function APMConfigPage() {
  useTheme();
  const [config, setConfig] = useState<APMUIConfig | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [testing, setTesting] = useState(false);
  const [errors, setErrors] = useState<string[]>([]);
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [testResult, setTestResult] = useState<{ success: boolean; message: string; error?: string } | null>(null);

  useEffect(() => {
    const loadData = () => {
      const loadedConfig = loadAPMConfig();
      setConfig(loadedConfig);
      setLoading(false);
    };

    loadData();
  }, []);

  const handleSave = async () => {
    if (!config) return;

    const validation = validateAPMConfigUI(config);
    if (!validation.valid) {
      setErrors(validation.errors);
      return;
    }

    setSaving(true);
    setErrors([]);
    try {
      saveAPMConfig(config);
      await new Promise(resolve => setTimeout(resolve, 500));
      setSaving(false);
      setSaveSuccess(true);
      setTimeout(() => setSaveSuccess(false), 3000);
    } catch (error) {
      setSaving(false);
      setErrors(['Failed to save configuration']);
    }
  };

  const handleReset = () => {
    const resetConfig = resetAPMConfig();
    setConfig(resetConfig);
    setTestResult(null);
    setSaveSuccess(true);
    setTimeout(() => setSaveSuccess(false), 3000);
  };

  const handleTestConnection = async () => {
    if (!config) return;

    setTesting(true);
    setTestResult(null);
    setErrors([]);

    const result = await testAPMConnection(config);
    setTestResult(result);
    setTesting(false);

    if (!result.success && result.error) {
      setErrors([result.error]);
    }
  };

  const handleConfigChange = <K extends keyof APMUIConfig>(
    key: K,
    value: APMUIConfig[K]
  ) => {
    if (!config) return;
    setConfig({ ...config, [key]: value });
  };

  const handleSentryChange = <K extends NonNullable<APMUIConfig['sentry']>>(
    key: K,
    value: NonNullable<APMUIConfig['sentry']>[K]
  ) => {
    if (!config) return;
    setConfig({
      ...config,
      sentry: { ...config.sentry, [key]: value }
    });
  };

  if (loading) {
    return (
      <section className="apm-config" aria-label="APM Configuration">
        <div className="container">
          <div className="text-center py-5">
            <div className="spinner-border text-primary" role="status">
              <span className="visually-hidden">Loading...</span>
            </div>
          </div>
        </div>
      </section>
    );
  }

  if (!config) {
    return (
      <section className="apm-config" aria-label="APM Configuration">
        <div className="container">
          <div className="alert alert-warning">Failed to load APM configuration</div>
        </div>
      </section>
    );
  }

  return (
    <ProtectedRoute requiredPermission={Permission.MANAGE_SETTINGS}>
      <section className="apm-config" aria-label="APM Configuration">
        <AnimationWrapper animation="fadeIn">
          <div className="container">
            <SectionTitle
              title="Konfigurasi APM"
              subtitle="Kelola pengaturan Application Performance Monitoring"
              animation="fadeInDown"
            />

            {errors.length > 0 && (
              <div className="alert alert-danger mb-4" role="alert">
                <strong>Validation Errors:</strong>
                <ul className="mb-0 mt-2">
                  {errors.map((error, index) => (
                    <li key={index}>{error}</li>
                  ))}
                </ul>
              </div>
            )}

            {saveSuccess && (
              <div className="alert alert-success mb-4" role="status">
                Konfigurasi berhasil disimpan!
              </div>
            )}

            <div className="row">
              <div className="col-lg-8">
                <div className="card">
                  <div className="card-header">
                    <h5 className="card-title mb-0">Pengaturan APM</h5>
                  </div>
                  <div className="card-body">
                    <div className="mb-4">
                      <label htmlFor="apm-provider" className="form-label">
                        Provider
                      </label>
                      <select
                        id="apm-provider"
                        className="form-select"
                        value={config.provider}
                        onChange={(e) => handleConfigChange('provider', e.target.value as any)}
                      >
                        <option value="console">Console (Development)</option>
                        <option value="sentry">Sentry (Production)</option>
                        <option value="none">Disabled</option>
                      </select>
                      <small className="text-muted">
                        Console provider logs to browser console. Sentry provider sends to Sentry.io.
                      </small>
                    </div>

                    <div className="mb-4">
                      <div className="form-check form-switch">
                        <input
                          className="form-check-input"
                          type="checkbox"
                          id="apm-enabled"
                          checked={config.enabled}
                          onChange={(e) => handleConfigChange('enabled', e.target.checked)}
                          disabled={config.provider === 'none'}
                        />
                        <label className="form-check-label" htmlFor="apm-enabled">
                          Enable APM
                        </label>
                      </div>
                    </div>

                    <div className="mb-4">
                      <label htmlFor="apm-environment" className="form-label">
                        Environment
                      </label>
                      <select
                        id="apm-environment"
                        className="form-select"
                        value={config.environment}
                        onChange={(e) => handleConfigChange('environment', e.target.value as any)}
                      >
                        <option value="development">Development</option>
                        <option value="staging">Staging</option>
                        <option value="production">Production</option>
                      </select>
                    </div>

                    <div className="mb-4">
                      <label htmlFor="apm-sample-rate" className="form-label">
                        Sample Rate ({(config.sampleRate || 0).toFixed(1)})
                      </label>
                      <input
                        type="range"
                        id="apm-sample-rate"
                        className="form-range"
                        min="0"
                        max="1"
                        step="0.1"
                        value={config.sampleRate || 0}
                        onChange={(e) => handleConfigChange('sampleRate', parseFloat(e.target.value))}
                      />
                      <small className="text-muted">
                        Percentage of transactions to sample (0.0 - 1.0)
                      </small>
                    </div>

                    {config.provider === 'sentry' && (
                      <>
                        <div className="mb-4">
                          <label htmlFor="apm-dsn" className="form-label">
                            Sentry DSN
                          </label>
                          <input
                            type="text"
                            id="apm-dsn"
                            className="form-control"
                            placeholder="https://[key]@[host]/[project]"
                            value={config.sentry?.dsn || ''}
                            onChange={(e) => handleSentryChange('dsn', e.target.value)}
                          />
                          <small className="text-muted">
                            Data Source Name for Sentry integration
                          </small>
                        </div>

                        <div className="mb-4">
                          <label htmlFor="apm-traces-rate" className="form-label">
                            Traces Sample Rate ({(config.sentry?.tracesSampleRate || 0).toFixed(1)})
                          </label>
                          <input
                            type="range"
                            id="apm-traces-rate"
                            className="form-range"
                            min="0"
                            max="1"
                            step="0.1"
                            value={config.sentry?.tracesSampleRate || 0}
                            onChange={(e) => handleSentryChange('tracesSampleRate', parseFloat(e.target.value))}
                          />
                          <small className="text-muted">
                            Percentage of traces to sample (0.0 - 1.0)
                          </small>
                        </div>
                      </>
                    )}

                    <div className="d-flex gap-2 flex-wrap">
                      <button
                        type="button"
                        className="btn btn-primary"
                        onClick={handleSave}
                        disabled={saving}
                      >
                        {saving ? (
                          <>
                            <span className="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true" />
                            Menyimpan...
                          </>
                        ) : (
                          'Simpan Konfigurasi'
                        )}
                      </button>
                      <button
                        type="button"
                        className="btn btn-secondary"
                        onClick={handleReset}
                      >
                        Reset
                      </button>
                      <button
                        type="button"
                        className="btn btn-info text-white"
                        onClick={handleTestConnection}
                        disabled={testing || config.provider === 'none' || !config.enabled}
                      >
                        {testing ? (
                          <>
                            <span className="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true" />
                            Menguji...
                          </>
                        ) : (
                          'Tes Koneksi'
                        )}
                      </button>
                    </div>
                  </div>
                </div>
              </div>

              <div className="col-lg-4">
                <div className="card">
                  <div className="card-header">
                    <h5 className="card-title mb-0">Status Konfigurasi</h5>
                  </div>
                  <div className="card-body">
                    <div className="mb-3">
                      <strong>Provider:</strong>
                      <div className="mt-1">
                        <StatusBadge type={config.provider === 'sentry' ? 'success' : config.provider === 'none' ? 'danger' : 'warning'}>
                          {config.provider.toUpperCase()}
                        </StatusBadge>
                      </div>
                    </div>

                    <div className="mb-3">
                      <strong>Status:</strong>
                      <div className="mt-1">
                        <StatusBadge type={config.enabled ? 'success' : 'danger'}>
                          {config.enabled ? 'Enabled' : 'Disabled'}
                        </StatusBadge>
                      </div>
                    </div>

                    <div className="mb-3">
                      <strong>Environment:</strong>
                      <div className="mt-1">{config.environment}</div>
                    </div>

                    <div className="mb-3">
                      <strong>Sample Rate:</strong>
                      <div className="mt-1">{((config.sampleRate || 0) * 100).toFixed(0)}%</div>
                    </div>

                    {testResult && (
                      <div className={`alert ${testResult.success ? 'alert-success' : 'alert-danger'} mb-3`} role="status">
                        <strong>Connection Test:</strong>
                        <div className="mt-1">{testResult.message}</div>
                        {testResult.error && (
                          <div className="mt-1 small">{testResult.error}</div>
                        )}
                      </div>
                    )}
                  </div>
                </div>

                <div className="card mt-3">
                  <div className="card-header">
                    <h5 className="card-title mb-0">Informasi</h5>
                  </div>
                  <div className="card-body">
                    <ul className="list-unstyled mb-0">
                      <li className="mb-2">
                        <i className="fas fa-info-circle text-primary me-2"></i>
                        <strong>Console Provider:</strong> Mengirim log ke browser console untuk development.
                      </li>
                      <li className="mb-2">
                        <i className="fas fa-info-circle text-primary me-2"></i>
                        <strong>Sentry Provider:</strong> Mengirim error dan performance data ke Sentry.io untuk production monitoring.
                      </li>
                      <li>
                        <i className="fas fa-shield-alt text-success me-2"></i>
                        <strong>Sample Rate:</strong> Mengurangi beban dengan sampling sebagian transaksi.
                      </li>
                    </ul>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </AnimationWrapper>
      </section>
    </ProtectedRoute>
  );
}
