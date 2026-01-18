'use client';

import { useState, useEffect } from 'react';
import ProtectedRoute from '@/components/common/ProtectedRoute';
import { useTheme } from '@/contexts/ThemeContext';
import { Permission, CacheConfig, CacheStatistics } from '@/types';
import { loadCacheConfig, saveCacheConfig, clearCache, getCacheStatistics, validateCacheConfig, resetCacheConfig, formatBytes, formatDuration } from '@/utils/cacheConfig';
import SectionTitle from '@/components/common/SectionTitle';
import AnimationWrapper from '@/components/common/AnimationWrapper';

export default function CacheConfigPage() {
  useTheme();
  const [config, setConfig] = useState<CacheConfig | null>(null);
  const [stats, setStats] = useState<CacheStatistics | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [clearing, setClearing] = useState(false);
  const [loadingStats, setLoadingStats] = useState(false);
  const [errors, setErrors] = useState<string[]>([]);
  const [saveSuccess, setSaveSuccess] = useState(false);

  useEffect(() => {
    const loadData = async () => {
      const loadedConfig = loadCacheConfig();
      setConfig(loadedConfig);
      const loadedStats = await getCacheStatistics();
      setStats(loadedStats);
      setLoading(false);
    };

    loadData();
  }, []);

  const handleRefreshStats = async () => {
    setLoadingStats(true);
    const loadedStats = await getCacheStatistics();
    setStats(loadedStats);
    setLoadingStats(false);
  };

  const handleSave = async () => {
    if (!config) return;

    const validation = validateCacheConfig(config);
    if (!validation.valid) {
      setErrors(validation.errors);
      return;
    }

    setSaving(true);
    setErrors([]);
    saveCacheConfig(config);
    await new Promise(resolve => setTimeout(resolve, 500));
    setSaving(false);
    setSaveSuccess(true);
    setTimeout(() => setSaveSuccess(false), 3000);
  };

  const handleReset = () => {
    const resetConfig = resetCacheConfig();
    setConfig(resetConfig);
    setSaveSuccess(true);
    setTimeout(() => setSaveSuccess(false), 3000);
  };

  const handleConfigChange = <T extends keyof CacheConfig>(
    parentKey: T,
    childKey: string | null,
    value: string | number | boolean | string[]
  ) => {
    if (!config) return;

    const currentValue = config[parentKey];
    if (childKey && typeof currentValue === 'object' && currentValue !== null && !Array.isArray(currentValue)) {
      setConfig({
        ...config,
        [parentKey]: {
          ...(currentValue as unknown as Record<string, string | number | boolean | string[]>),
          [childKey]: value,
        },
      } as CacheConfig);
    } else {
      setConfig({
        ...config,
        [parentKey]: value,
      } as CacheConfig);
    }
  };

  const handleClearCache = async () => {
    if (!confirm('Apakah Anda yakin ingin menghapus semua cache? Tindakan ini akan menghapus semua data yang tersimpan di cache.')) {
      return;
    }

    setClearing(true);
    try {
      await clearCache();
      await handleRefreshStats();
      setClearing(false);
    } catch (error) {
      console.error('Failed to clear cache:', error);
      alert('Gagal menghapus cache. Silakan coba lagi.');
      setClearing(false);
    }
  };

  const handleAddExtension = () => {
    if (!config) return;
    setConfig({
      ...config,
      cacheFirstExtensions: [...config.cacheFirstExtensions, '.ext'],
    });
  };

  const handleRemoveExtension = (index: number) => {
    if (!config || config.cacheFirstExtensions.length <= 1) return;
    setConfig({
      ...config,
      cacheFirstExtensions: config.cacheFirstExtensions.filter((_, i) => i !== index),
    });
  };

  const handleExtensionChange = (index: number, value: string) => {
    if (!config) return;
    const newExtensions = [...config.cacheFirstExtensions];
    newExtensions[index] = value;
    setConfig({
      ...config,
      cacheFirstExtensions: newExtensions,
    });
  };

  const handleAddPattern = () => {
    if (!config) return;
    setConfig({
      ...config,
      networkFirstPatterns: [...config.networkFirstPatterns, '/path/'],
    });
  };

  const handleRemovePattern = (index: number) => {
    if (!config) return;
    setConfig({
      ...config,
      networkFirstPatterns: config.networkFirstPatterns.filter((_, i) => i !== index),
    });
  };

  const handlePatternChange = (index: number, value: string) => {
    if (!config) return;
    const newPatterns = [...config.networkFirstPatterns];
    newPatterns[index] = value;
    setConfig({
      ...config,
      networkFirstPatterns: newPatterns,
    });
  };

  if (loading) {
    return (
      <div className="container mt-5 text-center">
        <div className="spinner-border text-primary" role="status">
          <span className="visually-hidden">Memuat...</span>
        </div>
      </div>
    );
  }

  if (!config) {
    return (
      <div className="container mt-5">
        <div className="alert alert-danger">Gagal memuat konfigurasi cache.</div>
      </div>
    );
  }

  return (
    <ProtectedRoute requiredPermission={Permission.MANAGE_SETTINGS}>
      <AnimationWrapper animation="fadeInUp">
        <SectionTitle
          title="Konfigurasi Cache"
          subtitle="Kelola pengaturan cache service worker untuk optimasi performa"
        />

        <div className="row mt-4">
          <div className="col-12">
            {errors.length > 0 && (
              <div className="alert alert-danger">
                <h5 className="alert-heading">Error Validasi</h5>
                <ul className="mb-0">
                  {errors.map((error, index) => (
                    <li key={index}>{error}</li>
                  ))}
                </ul>
              </div>
            )}

            {saveSuccess && (
              <div className="alert alert-success">
                Konfigurasi cache berhasil disimpan!
              </div>
            )}

            <div className="card mb-4">
              <div className="card-header d-flex justify-content-between align-items-center">
                <h5 className="mb-0">Statistik Cache</h5>
                <button
                  className="btn btn-sm btn-outline-primary"
                  onClick={handleRefreshStats}
                  disabled={loadingStats}
                >
                  {loadingStats ? 'Memuat...' : 'Refresh'}
                </button>
              </div>
              <div className="card-body">
                {stats ? (
                  <div className="row">
                    <div className="col-md-3">
                      <div className="stat-card">
                        <h6 className="text-muted">Ukuran Cache Total</h6>
                        <h3 className="text-primary">{formatBytes(stats.totalCacheSize)}</h3>
                      </div>
                    </div>
                    <div className="col-md-3">
                      <div className="stat-card">
                        <h6 className="text-muted">Cache Hit Rate</h6>
                        <h3 className="text-success">
                          {stats.cacheHitRate.toFixed(1)}%
                        </h3>
                      </div>
                    </div>
                    <div className="col-md-3">
                      <div className="stat-card">
                        <h6 className="text-muted">Total Request</h6>
                        <h3 className="text-info">{stats.totalRequests}</h3>
                      </div>
                    </div>
                    <div className="col-md-3">
                      <div className="stat-card">
                        <h6 className="text-muted">Cache Hit / Miss</h6>
                        <div>
                          <span className="text-success">{stats.cacheHits}</span>
                          {' / '}
                          <span className="text-danger">{stats.cacheMisses}</span>
                        </div>
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="text-center">
                    <div className="spinner-border text-primary" role="status">
                      <span className="visually-hidden">Memuat statistik...</span>
                    </div>
                  </div>
                )}
              </div>
            </div>

            <div className="card mb-4">
              <div className="card-header">
                <h5 className="mb-0">Strategi Cache-First (Aset Statis)</h5>
              </div>
              <div className="card-body">
                <p className="text-muted">
                  Ekstensi file yang akan di-cache menggunakan strategi cache-first
                  (prioritaskan cache, jaringan sebagai fallback).
                </p>
                {config.cacheFirstExtensions.map((ext, index) => (
                  <div key={index} className="input-group mb-2">
                    <span className="input-group-text">Ekstensi</span>
                    <input
                      type="text"
                      className="form-control"
                      value={ext}
                      onChange={(e) => handleExtensionChange(index, e.target.value)}
                      placeholder=".js"
                    />
                    <button
                      className="btn btn-outline-danger"
                      onClick={() => handleRemoveExtension(index)}
                      disabled={config.cacheFirstExtensions.length <= 1}
                    >
                      Hapus
                    </button>
                  </div>
                ))}
                <button
                  className="btn btn-outline-primary"
                  onClick={handleAddExtension}
                >
                  + Tambah Ekstensi
                </button>
              </div>
            </div>

            <div className="card mb-4">
              <div className="card-header">
                <h5 className="mb-0">Strategi Network-First (API)</h5>
              </div>
              <div className="card-body">
                <p className="text-muted">
                  Pola URL yang akan di-cache menggunakan strategi network-first
                  (prioritaskan jaringan, cache sebagai fallback).
                </p>
                {config.networkFirstPatterns.map((pattern, index) => (
                  <div key={index} className="input-group mb-2">
                    <span className="input-group-text">Pola URL</span>
                    <input
                      type="text"
                      className="form-control"
                      value={pattern}
                      onChange={(e) => handlePatternChange(index, e.target.value)}
                      placeholder="/api/"
                    />
                    <button
                      className="btn btn-outline-danger"
                      onClick={() => handleRemovePattern(index)}
                    >
                      Hapus
                    </button>
                  </div>
                ))}
                <button
                  className="btn btn-outline-primary"
                  onClick={handleAddPattern}
                >
                  + Tambah Pola
                </button>
              </div>
            </div>

            <div className="card mb-4">
              <div className="card-header">
                <h5 className="mb-0">Pengaturan TTL Cache</h5>
              </div>
              <div className="card-body">
                <div className="row">
                  <div className="col-md-6">
                    <label className="form-label">Aset Statis</label>
                    <input
                      type="number"
                      className="form-control mb-3"
                      value={config.cacheTTL.staticAssets}
                      onChange={(e) => handleConfigChange('cacheTTL', 'staticAssets', parseInt(e.target.value) || 0)}
                      min="0"
                    />
                    <small className="text-muted">{formatDuration(config.cacheTTL.staticAssets)}</small>
                  </div>
                  <div className="col-md-6">
                    <label className="form-label">Respons API</label>
                    <input
                      type="number"
                      className="form-control mb-3"
                      value={config.cacheTTL.apiResponses}
                      onChange={(e) => handleConfigChange('cacheTTL', 'apiResponses', parseInt(e.target.value) || 0)}
                      min="0"
                    />
                    <small className="text-muted">{formatDuration(config.cacheTTL.apiResponses)}</small>
                  </div>
                  <div className="col-md-6">
                    <label className="form-label">Gambar</label>
                    <input
                      type="number"
                      className="form-control mb-3"
                      value={config.cacheTTL.images}
                      onChange={(e) => handleConfigChange('cacheTTL', 'images', parseInt(e.target.value) || 0)}
                      min="0"
                    />
                    <small className="text-muted">{formatDuration(config.cacheTTL.images)}</small>
                  </div>
                  <div className="col-md-6">
                    <label className="form-label">Font</label>
                    <input
                      type="number"
                      className="form-control mb-3"
                      value={config.cacheTTL.fonts}
                      onChange={(e) => handleConfigChange('cacheTTL', 'fonts', parseInt(e.target.value) || 0)}
                      min="0"
                    />
                    <small className="text-muted">{formatDuration(config.cacheTTL.fonts)}</small>
                  </div>
                </div>
              </div>
            </div>

            <div className="card mb-4">
              <div className="card-header">
                <h5 className="mb-0">Batas & Kebijakan Pembersihan</h5>
              </div>
              <div className="card-body">
                <div className="row">
                  <div className="col-md-6">
                    <label className="form-label">Batas Ukuran Cache (MB)</label>
                    <input
                      type="number"
                      className="form-control mb-3"
                      value={config.cacheSizeLimit}
                      onChange={(e) => handleConfigChange('cacheSizeLimit', null, parseInt(e.target.value) || 1)}
                      min="1"
                      max="1000"
                    />
                  </div>
                  <div className="col-md-6">
                    <div className="form-check form-switch mb-3">
                      <input
                        className="form-check-input"
                        type="checkbox"
                        id="cleanupEnabled"
                        checked={config.cleanupPolicy.enabled}
                        onChange={(e) => handleConfigChange('cleanupPolicy', 'enabled', e.target.checked)}
                      />
                      <label className="form-check-label" htmlFor="cleanupEnabled">
                        Aktifkan Pembersihan Otomatis
                      </label>
                    </div>
                  </div>
                  <div className="col-md-4">
                    <label className="form-label">Usia Maksimum (detik)</label>
                    <input
                      type="number"
                      className="form-control mb-3"
                      value={config.cleanupPolicy.maxAge}
                      onChange={(e) => handleConfigChange('cleanupPolicy', 'maxAge', parseInt(e.target.value) || 0)}
                      min="0"
                      disabled={!config.cleanupPolicy.enabled}
                    />
                    <small className="text-muted">{formatDuration(config.cleanupPolicy.maxAge)}</small>
                  </div>
                  <div className="col-md-4">
                    <label className="form-label">Entry Maksimum</label>
                    <input
                      type="number"
                      className="form-control mb-3"
                      value={config.cleanupPolicy.maxEntries}
                      onChange={(e) => handleConfigChange('cleanupPolicy', 'maxEntries', parseInt(e.target.value) || 1)}
                      min="1"
                      max="10000"
                      disabled={!config.cleanupPolicy.enabled}
                    />
                  </div>
                  <div className="col-md-4">
                    <label className="form-label">Interval Pembersihan (menit)</label>
                    <input
                      type="number"
                      className="form-control mb-3"
                      value={config.cleanupPolicy.autoCleanupInterval}
                      onChange={(e) => handleConfigChange('cleanupPolicy', 'autoCleanupInterval', parseInt(e.target.value) || 1)}
                      min="1"
                      disabled={!config.cleanupPolicy.enabled}
                    />
                  </div>
                </div>
              </div>
            </div>

            <div className="card mb-4">
              <div className="card-header">
                <h5 className="mb-0">Aksi</h5>
              </div>
              <div className="card-body">
                <div className="d-flex gap-3 flex-wrap">
                  <button
                    className="btn btn-primary"
                    onClick={handleSave}
                    disabled={saving}
                  >
                    {saving ? 'Menyimpan...' : 'Simpan Konfigurasi'}
                  </button>
                  <button
                    className="btn btn-outline-secondary"
                    onClick={handleReset}
                  >
                    Reset ke Default
                  </button>
                  <button
                    className="btn btn-outline-danger"
                    onClick={handleClearCache}
                    disabled={clearing}
                  >
                    {clearing ? 'Menghapus...' : 'Hapus Semua Cache'}
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </AnimationWrapper>
    </ProtectedRoute>
  );
}
