"use client";

import React, { useState, useEffect, useCallback, memo } from 'react';
import { useTheme } from '@/contexts/ThemeContext';
import ProtectedRoute from '@/components/common/ProtectedRoute';
import { Permission } from '@/types/permission';
import anomalyDetector from '@/utils/anomalyDetector';
import LoadingSpinner from '@/components/ui/LoadingSpinner';
import type {
  Anomaly,
  AnomalyType,
  AnomalySeverity,
  AnomalyStatus,
  AnomalyThreshold,
  AnomalyAlertChannel,
  AnomalyStatistics,
} from '@/types/anomaly';

const ANOMALY_TYPE_LABELS: Record<AnomalyType, string> = {
  traffic: 'Lalu Lintas',
  error: 'Kesalahan',
  performance: 'Kinerja',
};

const SEVERITY_LABELS: Record<AnomalySeverity, string> = {
  low: 'Rendah',
  medium: 'Sedang',
  high: 'Tinggi',
  critical: 'Kritis',
};

const SEVERITY_BADGE_CLASSES: Record<AnomalySeverity, string> = {
  low: 'bg-info',
  medium: 'bg-warning',
  high: 'bg-danger',
  critical: 'bg-dark',
};

const STATUS_LABELS: Record<AnomalyStatus, string> = {
  detected: 'Terdeteksi',
  confirmed: 'Dikonfirmasi',
  false_positive: 'Positif Palsu',
  investigating: 'Diselidiki',
};

const ALERT_CHANNEL_LABELS: Record<AnomalyAlertChannel, string> = {
  dashboard: 'Dasbor',
  email: 'Email',
  webhook: 'Webhook',
  sms: 'SMS',
};

const formatDateTime = (isoString: string): string => {
  const date = new Date(isoString);
  return date.toLocaleString('id-ID', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
};

const formatNumber = (num: number, decimals: number = 2): string => {
  return num.toFixed(decimals);
};

const formatPercent = (value: number): string => {
  return `${formatNumber(value)}%`;
};

const AnomalyDashboard: React.FC = () => {
  const { theme } = useTheme();
  const [anomalies, setAnomalies] = useState<Anomaly[]>([]);
  const [statistics, setStatistics] = useState<AnomalyStatistics | null>(null);
  const [thresholds, setThresholds] = useState<Record<AnomalyType, AnomalyThreshold>>({} as Record<AnomalyType, AnomalyThreshold>);
  const [loading, setLoading] = useState(true);
  const [filterType, setFilterType] = useState<AnomalyType | ''>('');
  const [filterSeverity, setFilterSeverity] = useState<AnomalySeverity | ''>('');
  const [filterStatus, setFilterStatus] = useState<AnomalyStatus | ''>('');
  const [showThresholds, setShowThresholds] = useState(false);

  const loadDashboardData = useCallback(() => {
    setLoading(true);
    setTimeout(() => {
      const loadedAnomalies = anomalyDetector.getAnomalies(
        filterType || filterSeverity || filterStatus
          ? {
              type: filterType || undefined,
              severity: filterSeverity || undefined,
              status: filterStatus || undefined,
            }
          : undefined
      );
      setAnomalies(loadedAnomalies);

      const loadedStatistics = anomalyDetector.getStatistics();
      setStatistics(loadedStatistics);

      const loadedThresholds: Record<AnomalyType, AnomalyThreshold> = {
        traffic: anomalyDetector.getThreshold('traffic')!,
        error: anomalyDetector.getThreshold('error')!,
        performance: anomalyDetector.getThreshold('performance')!,
      };
      setThresholds(loadedThresholds);

      setLoading(false);
    }, 300);
  }, [filterType, filterSeverity, filterStatus]);

  const handleRefresh = useCallback(() => {
    loadDashboardData();
  }, [loadDashboardData]);

  const handleConfirmAnomaly = useCallback((anomalyId: string) => {
    if (anomalyDetector.confirmAnomaly(anomalyId)) {
      handleRefresh();
    }
  }, [handleRefresh]);

  const handleMarkFalsePositive = useCallback((anomalyId: string) => {
    if (anomalyDetector.markFalsePositive(anomalyId)) {
      handleRefresh();
    }
  }, [handleRefresh]);

  const handleAcknowledgeAnomaly = useCallback((anomalyId: string) => {
    if (anomalyDetector.acknowledgeAnomaly(anomalyId, 'admin')) {
      handleRefresh();
    }
  }, [handleRefresh]);

  const handleUpdateThreshold = useCallback((type: AnomalyType, updates: Partial<AnomalyThreshold>) => {
    anomalyDetector.updateThreshold(type, updates);
    handleRefresh();
  }, [handleRefresh]);

  const handleClearAnomalies = useCallback(() => {
    if (confirm('Apakah Anda yakin ingin menghapus semua anomali?')) {
      anomalyDetector.clearAnomalies();
      handleRefresh();
    }
  }, [handleRefresh]);

  const handleReset = useCallback(() => {
    if (confirm('Apakah Anda yakin ingin mereset semua data deteksi anomali?')) {
      anomalyDetector.reset();
      handleRefresh();
    }
  }, [handleRefresh]);

  useEffect(() => {
    loadDashboardData();
  }, [filterType, filterSeverity, filterStatus]);

  return (
    <ProtectedRoute requiredPermission={Permission.MANAGE_CONTENT}>
      <div className="container-fluid py-4">
        <div className="d-flex justify-content-between align-items-center mb-4">
          <h2 className="mb-0">Dasbor Deteksi Anomali Real-Time</h2>
          <div className="d-flex gap-2">
            <button
              className="btn btn-outline-primary"
              onClick={() => setShowThresholds(!showThresholds)}
            >
              {showThresholds ? 'Sembunyikan Ambang' : 'Konfigurasi Ambang'}
            </button>
            <button className="btn btn-secondary" onClick={handleRefresh}>
              <i className="bi bi-arrow-clockwise me-2" />
              Segarkan
            </button>
          </div>
        </div>

        {showThresholds && (
          <div className={`card mb-4 ${theme === 'dark' ? 'bg-dark border-secondary' : ''}`}>
            <div className="card-header">
              <h5 className="mb-0">Konfigurasi Ambang Deteksi</h5>
            </div>
            <div className="card-body">
              <div className="row">
                {(Object.keys(thresholds) as AnomalyType[]).map((type) => (
                  <div key={type} className="col-md-4 mb-3">
                    <div className={`card ${theme === 'dark' ? 'bg-secondary border-secondary' : ''}`}>
                      <div className="card-body">
                        <h6 className="card-title">{ANOMALY_TYPE_LABELS[type]}</h6>
                        <div className="mb-3">
                          <label className="form-label">Metode Ambang</label>
                          <select
                            className={`form-select ${theme === 'dark' ? 'bg-dark text-light' : ''}`}
                            value={thresholds[type]?.thresholdMethod || 'z_score'}
                            onChange={(e) =>
                              handleUpdateThreshold(type, {
                                thresholdMethod: e.target.value as 'z_score' | 'moving_average' | 'isolation_forest',
                              })
                            }
                          >
                            <option value="z_score">Skor-Z</option>
                            <option value="moving_average">Rata-rata Bergerak</option>
                          </select>
                        </div>
                        <div className="mb-3">
                          <label className="form-label">Tingkat Sensitivitas</label>
                          <select
                            className={`form-select ${theme === 'dark' ? 'bg-dark text-light' : ''}`}
                            value={thresholds[type]?.sensitivityLevel || 'medium'}
                            onChange={(e) =>
                              handleUpdateThreshold(type, {
                                sensitivityLevel: e.target.value as 'low' | 'medium' | 'high',
                              })
                            }
                          >
                            <option value="low">Rendah</option>
                            <option value="medium">Sedang</option>
                            <option value="high">Tinggi</option>
                          </select>
                        </div>
                        <div className="mb-3">
                          <label className="form-label">Ambang Skor-Z</label>
                          <input
                            type="number"
                            step="0.5"
                            min="1"
                            className={`form-control ${theme === 'dark' ? 'bg-dark text-light' : ''}`}
                            value={thresholds[type]?.zScoreThreshold || 3}
                            onChange={(e) =>
                              handleUpdateThreshold(type, {
                                zScoreThreshold: parseFloat(e.target.value),
                              })
                            }
                          />
                        </div>
                        <div className="mb-3">
                          <label className="form-label">Saluran Peringatan</label>
                          {(['dashboard', 'email', 'webhook', 'sms'] as AnomalyAlertChannel[]).map(
                            (channel) => (
                              <div key={channel} className="form-check">
                                <input
                                  className="form-check-input"
                                  type="checkbox"
                                  id={`${type}-${channel}`}
                                  checked={thresholds[type]?.alertChannels.includes(channel) || false}
                                  onChange={(e) => {
                                    const channels = thresholds[type]?.alertChannels || [];
                                    if (e.target.checked) {
                                      handleUpdateThreshold(type, {
                                        alertChannels: [...channels, channel],
                                      });
                                    } else {
                                      handleUpdateThreshold(type, {
                                        alertChannels: channels.filter((c) => c !== channel),
                                      });
                                    }
                                  }}
                                />
                                <label className="form-check-label" htmlFor={`${type}-${channel}`}>
                                  {ALERT_CHANNEL_LABELS[channel]}
                                </label>
                              </div>
                            )
                          )}
                        </div>
                        <div className="form-check form-switch">
                          <input
                            className="form-check-input"
                            type="checkbox"
                            id={`${type}-enabled`}
                            checked={thresholds[type]?.enabled || false}
                            onChange={(e) =>
                              handleUpdateThreshold(type, {
                                enabled: e.target.checked,
                              })
                            }
                          />
                          <label className="form-check-label" htmlFor={`${type}-enabled`}>
                            Aktifkan Deteksi
                          </label>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {statistics && (
          <div className="row mb-4">
            <div className="col-md-3">
              <div className={`card ${theme === 'dark' ? 'bg-dark border-secondary' : ''}`}>
                <div className="card-body">
                  <h6 className="card-subtitle text-muted">Total Anomali</h6>
                  <h3 className="mb-0">{statistics.totalAnomalies}</h3>
                </div>
              </div>
            </div>
            <div className="col-md-3">
              <div className={`card ${theme === 'dark' ? 'bg-dark border-secondary' : ''}`}>
                <div className="card-body">
                  <h6 className="card-subtitle text-muted">Anomali Aktif</h6>
                  <h3 className="mb-0 text-warning">{statistics.activeAnomalies}</h3>
                </div>
              </div>
            </div>
            <div className="col-md-3">
              <div className={`card ${theme === 'dark' ? 'bg-dark border-secondary' : ''}`}>
                <div className="card-body">
                  <h6 className="card-subtitle text-muted">Dikonfirmasi</h6>
                  <h3 className="mb-0 text-success">{statistics.confirmedAnomalies}</h3>
                </div>
              </div>
            </div>
            <div className="col-md-3">
              <div className={`card ${theme === 'dark' ? 'bg-dark border-secondary' : ''}`}>
                <div className="card-body">
                  <h6 className="card-subtitle text-muted">Positif Palsu</h6>
                  <h3 className="mb-0 text-info">{statistics.falsePositives}</h3>
                </div>
              </div>
            </div>
          </div>
        )}

        <div className={`card mb-4 ${theme === 'dark' ? 'bg-dark border-secondary' : ''}`}>
          <div className="card-header">
            <div className="d-flex justify-content-between align-items-center">
              <h5 className="mb-0">Daftar Anomali</h5>
              <div className="d-flex gap-2">
                <select
                  className={`form-select form-select-sm ${theme === 'dark' ? 'bg-dark text-light' : ''}`}
                  value={filterType}
                  onChange={(e) => setFilterType(e.target.value as AnomalyType | '')}
                >
                  <option value="">Semua Tipe</option>
                  {Object.entries(ANOMALY_TYPE_LABELS).map(([key, label]) => (
                    <option key={key} value={key}>
                      {label}
                    </option>
                  ))}
                </select>
                <select
                  className={`form-select form-select-sm ${theme === 'dark' ? 'bg-dark text-light' : ''}`}
                  value={filterSeverity}
                  onChange={(e) => setFilterSeverity(e.target.value as AnomalySeverity | '')}
                >
                  <option value="">Semua Tingkat Keparahan</option>
                  {Object.entries(SEVERITY_LABELS).map(([key, label]) => (
                    <option key={key} value={key}>
                      {label}
                    </option>
                  ))}
                </select>
                <select
                  className={`form-select form-select-sm ${theme === 'dark' ? 'bg-dark text-light' : ''}`}
                  value={filterStatus}
                  onChange={(e) => setFilterStatus(e.target.value as AnomalyStatus | '')}
                >
                  <option value="">Semua Status</option>
                  {Object.entries(STATUS_LABELS).map(([key, label]) => (
                    <option key={key} value={key}>
                      {label}
                    </option>
                  ))}
                </select>
              </div>
            </div>
          </div>
          <div className="card-body">
            {loading ? (
              <LoadingSpinner />
            ) : anomalies.length === 0 ? (
              <div className="text-center text-muted py-5">
                <i className="bi bi-check-circle" style={{ fontSize: '3rem' }} />
                <p className="mt-3">Tidak ada anomali terdeteksi</p>
              </div>
            ) : (
              <div className="table-responsive">
                <table className={`table ${theme === 'dark' ? 'table-dark' : ''}`}>
                  <thead>
                    <tr>
                      <th>ID</th>
                      <th>Tipe</th>
                      <th>Metrik</th>
                      <th>Keparahan</th>
                      <th>Status</th>
                      <th>Nilai Aktual</th>
                      <th>Nilai Diharapkan</th>
                      <th>Deviasi</th>
                      <th>Terdeteksi</th>
                      <th>Aksi</th>
                    </tr>
                  </thead>
                  <tbody>
                    {anomalies.map((anomaly) => (
                      <tr key={anomaly.id}>
                        <td>
                          <code className={theme === 'dark' ? 'text-light' : ''}>{anomaly.id}</code>
                        </td>
                        <td>{ANOMALY_TYPE_LABELS[anomaly.type]}</td>
                        <td>{anomaly.metric}</td>
                        <td>
                          <span
                            className={`badge ${SEVERITY_BADGE_CLASSES[anomaly.severity]} ${
                              theme === 'dark' ? 'text-light' : ''
                            }`}
                          >
                            {SEVERITY_LABELS[anomaly.severity]}
                          </span>
                        </td>
                        <td>
                          <span className={`badge bg-${anomaly.status === 'detected' ? 'primary' : 'secondary'} ${
                            theme === 'dark' ? 'text-light' : ''
                          }`}>
                            {STATUS_LABELS[anomaly.status]}
                          </span>
                        </td>
                        <td>{formatNumber(anomaly.actualValue)}</td>
                        <td>{formatNumber(anomaly.expectedValue)}</td>
                        <td>
                          {anomaly.zScore
                            ? `${formatNumber(anomaly.zScore)}σ`
                            : `${formatPercent(anomaly.deviation)}`}
                        </td>
                        <td>{formatDateTime(anomaly.detectedAt)}</td>
                        <td>
                          <div className="btn-group btn-group-sm">
                            {anomaly.status === 'detected' && (
                              <>
                                <button
                                  className="btn btn-success"
                                  onClick={() => handleConfirmAnomaly(anomaly.id)}
                                  title="Konfirmasi"
                                >
                                  <i className="bi bi-check-lg" />
                                </button>
                                <button
                                  className="btn btn-info"
                                  onClick={() => handleAcknowledgeAnomaly(anomaly.id)}
                                  title="Akui"
                                >
                                  <i className="bi bi-eye" />
                                </button>
                              </>
                            )}
                            {anomaly.status === 'detected' && (
                              <button
                                className="btn btn-secondary"
                                onClick={() => handleMarkFalsePositive(anomaly.id)}
                                title="Tandai Positif Palsu"
                              >
                                <i className="bi bi-x-lg" />
                              </button>
                            )}
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>

        {anomalies.length > 0 && (
          <div className={`card mb-4 ${theme === 'dark' ? 'bg-dark border-secondary' : ''}`}>
            <div className="card-body">
              <div className="d-flex gap-2">
                <button className="btn btn-outline-danger" onClick={handleClearAnomalies}>
                  Hapus Semua Anomali
                </button>
                <button className="btn btn-outline-warning" onClick={handleReset}>
                  Reset Semua Data
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </ProtectedRoute>
  );
};

export default memo(AnomalyDashboard);
