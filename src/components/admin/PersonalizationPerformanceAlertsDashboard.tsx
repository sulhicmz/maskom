'use client';

import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { useTheme } from '@/contexts/ThemeContext';
import performanceAlerts from '@/utils/personalization/performanceAlerts';
import type { 
  PerformanceAlert, 
  AlertSeverity, 
  AlertStatus,
  PerformanceAlertType,
  AlertChannel,
  PerformanceAlertConfig,
  PerformanceAlertStatistics,
} from '@/types/personalization';

const ALERT_TYPE_LABELS: Record<PerformanceAlertType, string> = {
  conversion_drop: 'Penurunan Konversi',
  engagement_drop: 'Penurunan Keterlibatan',
  lift_degradation: 'Degradasi Lift',
  rule_underperforming: 'Aturan Berkinerja Buruk',
  zero_lift: 'Lift Nol',
  negative_lift: 'Lift Negatif',
};

const ALERT_TYPE_DESCRIPTIONS: Record<PerformanceAlertType, string> = {
  conversion_drop: 'Tingkat konversi turun melewati ambang batas',
  engagement_drop: 'Tingkat keterlibatan turun melewati ambang batas',
  lift_degradation: 'Lift menurun dari baseline',
  rule_underperforming: 'Aturan memiliki skor efektivitas rendah',
  zero_lift: 'Lift bernilai nol atau dapat diabaikan',
  negative_lift: 'Lift negatif yang merugikan',
};

const SEVERITY_LABELS: Record<AlertSeverity, string> = {
  critical: 'Kritis',
  warning: 'Peringatan',
  info: 'Informasi',
};

const SEVERITY_BADGES: Record<AlertSeverity, string> = {
  critical: 'badge-danger',
  warning: 'badge-warning',
  info: 'badge-info',
};

const STATUS_LABELS: Record<AlertStatus, string> = {
  active: 'Aktif',
  acknowledged: 'Diakui',
  resolved: 'Diselesaikan',
};

const _CHANNEL_LABELS: Record<AlertChannel, string> = {
  dashboard: 'Dasbor',
  email: 'Email',
  webhook: 'Webhook',
};

const RESOLUTION_LABELS: Record<string, string> = {
  rule_disabled: 'Aturan Dinonaktifkan',
  variants_adjusted: 'Varian Disesuaikan',
  conditions_modified: 'Kondisi Dimodifikasi',
  threshold_updated: 'Ambang Diperbarui',
  ignored: 'Diabaikan',
  monitoring_continued: 'Pemantauan Dilanjutkan',
};

const PersonalizationPerformanceAlertsDashboard = () => {
  const { theme } = useTheme();
  const [activeTab, setActiveTab] = useState<'alerts' | 'config' | 'history' | 'stats'>('alerts');
  const [alerts, setAlerts] = useState<PerformanceAlert[]>([]);
  const [alertConfigs, setAlertConfigs] = useState<Map<PerformanceAlertType, PerformanceAlertConfig>>(new Map());
  const [statistics, setStatistics] = useState<PerformanceAlertStatistics | null>(null);
  const [loading, setLoading] = useState(true);
  const [selectedAlert, setSelectedAlert] = useState<PerformanceAlert | null>(null);
  const [filterType, setFilterType] = useState<PerformanceAlertType | 'all'>('all');
  const [filterSeverity, setFilterSeverity] = useState<AlertSeverity | 'all'>('all');
  const [filterStatus, setFilterStatus] = useState<AlertStatus | 'all'>('all');

  const loadData = useCallback(() => {
    const allAlerts = performanceAlerts.getAlerts();
    setAlerts(allAlerts);

    const stats = performanceAlerts.getStatistics();
    setStatistics(stats);

    const configs = new Map<PerformanceAlertType, PerformanceAlertConfig>();
    const alertTypes: PerformanceAlertType[] = [
      'conversion_drop',
      'engagement_drop',
      'lift_degradation',
      'rule_underperforming',
      'zero_lift',
      'negative_lift',
    ];

    alertTypes.forEach(type => {
      const config = performanceAlerts.getAlertConfig(type);
      if (config) {
        configs.set(type, config);
      }
    });

    setAlertConfigs(configs);
    setLoading(false);
  }, []);

  useEffect(() => {
    loadData();
    const interval = setInterval(loadData, 10000);
    return () => clearInterval(interval);
  }, []);

  const filteredAlerts = useMemo(() => {
    return alerts.filter(alert => {
      if (filterType !== 'all' && alert.alertType !== filterType) return false;
      if (filterSeverity !== 'all' && alert.severity !== filterSeverity) return false;
      if (filterStatus !== 'all' && alert.status !== filterStatus) return false;
      return true;
    });
  }, [alerts, filterType, filterSeverity, filterStatus]);

  const handleAcknowledgeAlert = useCallback((alertId: string) => {
    const success = performanceAlerts.acknowledgeAlert(alertId, 'admin');
    if (success) {
      const allAlerts = performanceAlerts.getAlerts();
      setAlerts(allAlerts);

      const stats = performanceAlerts.getStatistics();
      setStatistics(stats);

      const configs = new Map<PerformanceAlertType, PerformanceAlertConfig>();
      const alertTypes: PerformanceAlertType[] = [
        'conversion_drop',
        'engagement_drop',
        'lift_degradation',
        'rule_underperforming',
        'zero_lift',
        'negative_lift',
      ];

      alertTypes.forEach(type => {
        const config = performanceAlerts.getAlertConfig(type);
        if (config) {
          configs.set(type, config);
        }
      });

      setAlertConfigs(configs);
    }
  }, []);

  const handleResolveAlert = useCallback((alertId: string, resolution: string) => {
    const notes = prompt('Masukkan catatan resolusi (opsional):');
    performanceAlerts.resolveAlert(alertId, resolution as any, notes || undefined);
    const allAlerts = performanceAlerts.getAlerts();
    setAlerts(allAlerts);

    const stats = performanceAlerts.getStatistics();
    setStatistics(stats);

    const configs = new Map<PerformanceAlertType, PerformanceAlertConfig>();
    const alertTypes: PerformanceAlertType[] = [
      'conversion_drop',
      'engagement_drop',
      'lift_degradation',
      'rule_underperforming',
      'zero_lift',
      'negative_lift',
    ];

    alertTypes.forEach(type => {
      const config = performanceAlerts.getAlertConfig(type);
      if (config) {
        configs.set(type, config);
      }
    });

    setAlertConfigs(configs);
  }, []);

  const handleUpdateConfig = useCallback((alertType: PerformanceAlertType, updates: Partial<PerformanceAlertConfig>) => {
    performanceAlerts.updateAlertConfig(alertType, updates);
    const configs = new Map<PerformanceAlertType, PerformanceAlertConfig>();
    const alertTypes: PerformanceAlertType[] = [
      'conversion_drop',
      'engagement_drop',
      'lift_degradation',
      'rule_underperforming',
      'zero_lift',
      'negative_lift',
    ];

    alertTypes.forEach(type => {
      const config = performanceAlerts.getAlertConfig(type);
      if (config) {
        configs.set(type, config);
      }
    });

    setAlertConfigs(configs);
  }, []);

  const handleClearResolvedAlerts = useCallback(() => {
    const days = prompt('Hapus peringatan yang diselesaikan sebelum berapa hari lalu? (default: 30)', '30');
    if (days && !isNaN(parseInt(days))) {
      performanceAlerts.clearResolvedAlerts(parseInt(days));
      const allAlerts = performanceAlerts.getAlerts();
      setAlerts(allAlerts);

      const stats = performanceAlerts.getStatistics();
      setStatistics(stats);

      const configs = new Map<PerformanceAlertType, PerformanceAlertConfig>();
      const alertTypes: PerformanceAlertType[] = [
        'conversion_drop',
        'engagement_drop',
        'lift_degradation',
        'rule_underperforming',
        'zero_lift',
        'negative_lift',
      ];

      alertTypes.forEach(type => {
        const config = performanceAlerts.getAlertConfig(type);
        if (config) {
          configs.set(type, config);
        }
      });

      setAlertConfigs(configs);
    }
  }, []);

  const activeAlertsCount = alerts.filter(a => a.status === 'active').length;
  const criticalAlertsCount = alerts.filter(a => a.severity === 'critical' && a.status === 'active').length;

  if (loading) {
    return (
      <div className={`min-vh-100 py-4 ${theme === 'dark' ? 'bg-dark text-light' : 'bg-light text-dark'}`}>
        <div className="container">
          <div className="text-center py-5">
            <div className="spinner-border text-primary" role="status">
              <span className="visually-hidden">Memuat...</span>
            </div>
            <p className="mt-3">Memuat peringatan performa personalisasi...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className={`min-vh-100 py-4 ${theme === 'dark' ? 'bg-dark text-light' : 'bg-light text-dark'}`}>
      <div className="container">
        <div className="d-flex justify-content-between align-items-center mb-4">
          <div>
            <h1>Peringatan Performa Personalisasi</h1>
            <p className="text-muted mb-0">Pantau dan atasi masalah performa aturan personalisasi</p>
          </div>
          <button
            className="btn btn-outline-secondary"
            onClick={handleClearResolvedAlerts}
          >
            <i className="bi bi-trash me-2" />
            Bersihkan Terselesaikan
          </button>
        </div>

        <div className="row g-4 mb-4">
          <div className="col-md-3">
            <div className={`card ${theme === 'dark' ? 'bg-secondary text-light' : 'bg-white'}`}>
              <div className="card-body">
                <h6 className="card-subtitle mb-2">Total Peringatan</h6>
                <h3 className="card-title mb-0">{statistics?.totalAlerts || 0}</h3>
              </div>
            </div>
          </div>
          <div className="col-md-3">
            <div className={`card ${theme === 'dark' ? 'bg-secondary text-light' : 'bg-white'}`}>
              <div className="card-body">
                <h6 className="card-subtitle mb-2">Peringatan Aktif</h6>
                <h3 className="card-title mb-0 text-warning">{activeAlertsCount}</h3>
              </div>
            </div>
          </div>
          <div className="col-md-3">
            <div className={`card ${theme === 'dark' ? 'bg-secondary text-light' : 'bg-white'}`}>
              <div className="card-body">
                <h6 className="card-subtitle mb-2">Peringatan Kritis</h6>
                <h3 className="card-title mb-0 text-danger">{criticalAlertsCount}</h3>
              </div>
            </div>
          </div>
          <div className="col-md-3">
            <div className={`card ${theme === 'dark' ? 'bg-secondary text-light' : 'bg-white'}`}>
              <div className="card-body">
                <h6 className="card-subtitle mb-2">Waktu Resolusi Rata-rata</h6>
                <h3 className="card-title mb-0">{Math.round(statistics?.avgResolutionTime || 0)} menit</h3>
              </div>
            </div>
          </div>
        </div>

        <ul className="nav nav-tabs mb-4" role="tablist">
          <li className="nav-item" role="presentation">
            <button
              className={`nav-link ${activeTab === 'alerts' ? 'active' : ''}`}
              onClick={() => setActiveTab('alerts')}
            >
              <i className="bi bi-bell me-2" />
              Peringatan
              {activeAlertsCount > 0 && <span className="badge bg-danger ms-2">{activeAlertsCount}</span>}
            </button>
          </li>
          <li className="nav-item" role="presentation">
            <button
              className={`nav-link ${activeTab === 'config' ? 'active' : ''}`}
              onClick={() => setActiveTab('config')}
            >
              <i className="bi bi-gear me-2" />
              Konfigurasi
            </button>
          </li>
          <li className="nav-item" role="presentation">
            <button
              className={`nav-link ${activeTab === 'history' ? 'active' : ''}`}
              onClick={() => setActiveTab('history')}
            >
              <i className="bi bi-clock-history me-2" />
              Riwayat
            </button>
          </li>
          <li className="nav-item" role="presentation">
            <button
              className={`nav-link ${activeTab === 'stats' ? 'active' : ''}`}
              onClick={() => setActiveTab('stats')}
            >
              <i className="bi bi-bar-chart me-2" />
              Statistik
            </button>
          </li>
        </ul>

        {activeTab === 'alerts' && (
          <div className={`card ${theme === 'dark' ? 'bg-secondary text-light' : 'bg-white'}`}>
            <div className="card-body">
              <div className="row mb-3">
                <div className="col-md-4">
                  <select
                    className="form-select"
                    value={filterType}
                    onChange={(e) => setFilterType(e.target.value as any)}
                  >
                    <option value="all">Semua Tipe</option>
                    {Object.entries(ALERT_TYPE_LABELS).map(([type, label]) => (
                      <option key={type} value={type}>{label}</option>
                    ))}
                  </select>
                </div>
                <div className="col-md-4">
                  <select
                    className="form-select"
                    value={filterSeverity}
                    onChange={(e) => setFilterSeverity(e.target.value as any)}
                  >
                    <option value="all">Semua Tingkat</option>
                    {Object.entries(SEVERITY_LABELS).map(([severity, label]) => (
                      <option key={severity} value={severity}>{label}</option>
                    ))}
                  </select>
                </div>
                <div className="col-md-4">
                  <select
                    className="form-select"
                    value={filterStatus}
                    onChange={(e) => setFilterStatus(e.target.value as any)}
                  >
                    <option value="all">Semua Status</option>
                    {Object.entries(STATUS_LABELS).map(([status, label]) => (
                      <option key={status} value={status}>{label}</option>
                    ))}
                  </select>
                </div>
              </div>

              {filteredAlerts.length === 0 ? (
                <div className="text-center py-5">
                  <i className="bi bi-check-circle text-success" style={{ fontSize: '3rem' }} />
                  <p className="mt-3">Tidak ada peringatan yang cocok dengan filter</p>
                </div>
              ) : (
                <div className="table-responsive">
                  <table className="table table-striped table-hover">
                    <thead>
                      <tr>
                        <th>Tipe</th>
                        <th>Tingkat</th>
                        <th>Aturan</th>
                        <th>Pesan</th>
                        <th>Waktu</th>
                        <th>Status</th>
                        <th>Aksi</th>
                      </tr>
                    </thead>
                    <tbody>
                      {filteredAlerts.map((alert) => (
                        <tr key={alert.id} className="align-middle">
                          <td>
                            <span className={`badge ${SEVERITY_BADGES[alert.severity]}`}>
                              {ALERT_TYPE_LABELS[alert.alertType]}
                            </span>
                          </td>
                          <td>
                            <span className={`badge ${SEVERITY_BADGES[alert.severity]}`}>
                              {SEVERITY_LABELS[alert.severity]}
                            </span>
                          </td>
                          <td>
                            <div>
                              <strong>{alert.ruleName}</strong>
                              {alert.segment && (
                                <div className="text-muted small">
                                  {alert.segment}
                                </div>
                              )}
                            </div>
                          </td>
                          <td>
                            <div>
                              {alert.message}
                              <div className="text-muted small mt-1">
                                {alert.currentValue.toFixed(1)} vs {alert.previousValue.toFixed(1)}
                              </div>
                            </div>
                          </td>
                          <td>{new Date(alert.detectedAt).toLocaleString('id-ID')}</td>
                          <td>
                            <span className={`badge ${alert.status === 'active' ? 'bg-warning' : alert.status === 'acknowledged' ? 'bg-info' : 'bg-success'}`}>
                              {STATUS_LABELS[alert.status]}
                            </span>
                          </td>
                          <td>
                            <div className="btn-group" role="group">
                              <button
                                className="btn btn-sm btn-outline-primary"
                                onClick={() => setSelectedAlert(alert)}
                                title="Lihat Detail"
                              >
                                <i className="bi bi-eye" />
                              </button>
                              {alert.status === 'active' && (
                                <button
                                  className="btn btn-sm btn-outline-success"
                                  onClick={() => handleAcknowledgeAlert(alert.id)}
                                  title="Akui"
                                >
                                  <i className="bi bi-check" />
                                </button>
                              )}
                              {(alert.status === 'active' || alert.status === 'acknowledged') && (
                                <button
                                  className="btn btn-sm btn-outline-danger"
                                  onClick={() => handleResolveAlert(alert.id, 'rule_disabled')}
                                  title="Nonaktifkan Aturan"
                                >
                                  <i className="bi bi-x-circle" />
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
        )}

        {activeTab === 'config' && (
          <div className={`card ${theme === 'dark' ? 'bg-secondary text-light' : 'bg-white'}`}>
            <div className="card-body">
              <h5 className="card-title mb-4">Konfigurasi Peringatan</h5>
              {Array.from(alertConfigs.entries()).map(([alertType, config]) => (
                <div key={alertType} className="border-bottom pb-3 mb-3">
                  <div className="row">
                    <div className="col-md-6">
                      <h6 className="mb-2">
                        <span className={`badge ${SEVERITY_BADGES[config.severity]} me-2`}>
                          {SEVERITY_LABELS[config.severity]}
                        </span>
                        {ALERT_TYPE_LABELS[alertType]}
                      </h6>
                      <p className="text-muted small mb-2">
                        {ALERT_TYPE_DESCRIPTIONS[alertType]}
                      </p>
                    </div>
                    <div className="col-md-6">
                      <div className="form-check form-switch mb-2">
                        <input
                          className="form-check-input"
                          type="checkbox"
                          id={`enabled-${alertType}`}
                          checked={config.enabled}
                          onChange={(e) => handleUpdateConfig(alertType, { enabled: e.target.checked })}
                        />
                        <label className="form-check-label" htmlFor={`enabled-${alertType}`}>
                          Aktifkan Peringatan
                        </label>
                      </div>
                      <div className="mb-2">
                        <label className="form-label">Tingkat Keparahan</label>
                        <select
                          className="form-select form-select-sm"
                          value={config.severity}
                          onChange={(e) => handleUpdateConfig(alertType, { severity: e.target.value as any })}
                        >
                          <option value="critical">Kritis</option>
                          <option value="warning">Peringatan</option>
                          <option value="info">Informasi</option>
                        </select>
                      </div>
                      <div className="mb-2">
                        <label className="form-label">Nilai Ambang ({config.thresholdUnit === 'percent' ? '%' : 'absolut'})</label>
                        <input
                          type="number"
                          className="form-control form-control-sm"
                          value={config.thresholdValue}
                          onChange={(e) => handleUpdateConfig(alertType, { thresholdValue: parseFloat(e.target.value) })}
                        />
                      </div>
                      <div className="mb-2">
                        <label className="form-label">Interval Pengecekan (menit)</label>
                        <input
                          type="number"
                          className="form-control form-control-sm"
                          value={config.checkInterval}
                          onChange={(e) => handleUpdateConfig(alertType, { checkInterval: parseInt(e.target.value) })}
                        />
                      </div>
                      <div className="mb-2">
                        <label className="form-label">Jendela Geser (jam)</label>
                        <input
                          type="number"
                          className="form-control form-control-sm"
                          value={config.slidingWindowHours}
                          onChange={(e) => handleUpdateConfig(alertType, { slidingWindowHours: parseInt(e.target.value) })}
                        />
                      </div>
                      <div>
                        <label className="form-label small">Saluran Notifikasi</label>
                        <div className="d-flex gap-2">
                          <div className="form-check">
                            <input
                              className="form-check-input"
                              type="checkbox"
                              id={`dashboard-${alertType}`}
                              checked={config.alertChannels.includes('dashboard')}
                              onChange={(e) => {
                                const channels = e.target.checked
                                  ? [...config.alertChannels, 'dashboard' as const]
                                  : config.alertChannels.filter(c => c !== 'dashboard');
                                handleUpdateConfig(alertType, { alertChannels: channels as AlertChannel[] });
                              }}
                            />
                            <label className="form-check-label small" htmlFor={`dashboard-${alertType}`}>
                              Dasbor
                            </label>
                          </div>
                          <div className="form-check">
                            <input
                              className="form-check-input"
                              type="checkbox"
                              id={`email-${alertType}`}
                              checked={config.alertChannels.includes('email')}
                              onChange={(e) => {
                                const channels = e.target.checked
                                  ? [...config.alertChannels, 'email' as const]
                                  : config.alertChannels.filter(c => c !== 'email');
                                handleUpdateConfig(alertType, { alertChannels: channels as AlertChannel[] });
                              }}
                            />
                            <label className="form-check-label small" htmlFor={`email-${alertType}`}>
                              Email
                            </label>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {activeTab === 'history' && (
          <div className={`card ${theme === 'dark' ? 'bg-secondary text-light' : 'bg-white'}`}>
            <div className="card-body">
              <h5 className="card-title mb-4">Riwayat Peringatan</h5>
              {performanceAlerts.getAlertHistory().length === 0 ? (
                <div className="text-center py-5">
                  <i className="bi bi-clock-history text-muted" style={{ fontSize: '3rem' }} />
                  <p className="mt-3">Belum ada riwayat peringatan</p>
                </div>
              ) : (
                <div className="table-responsive">
                  <table className="table table-striped">
                    <thead>
                      <tr>
                        <th>Tipe</th>
                        <th>Tingkat</th>
                        <th>Aturan</th>
                        <th>Waktu Terdeteksi</th>
                        <th>Waktu Diselesaikan</th>
                        <th>Waktu Resolusi</th>
                        <th>Resolusi</th>
                        <th>Dampak</th>
                      </tr>
                    </thead>
                    <tbody>
                      {performanceAlerts.getAlertHistory().map((history) => (
                        <tr key={history.alertId}>
                          <td>
                            <span className={`badge ${SEVERITY_BADGES[history.severity]}`}>
                              {ALERT_TYPE_LABELS[history.alertType]}
                            </span>
                          </td>
                          <td>
                            <span className={`badge ${SEVERITY_BADGES[history.severity]}`}>
                              {SEVERITY_LABELS[history.severity]}
                            </span>
                          </td>
                          <td>{history.ruleId}</td>
                          <td>{new Date(history.detectedAt).toLocaleString('id-ID')}</td>
                          <td>
                            {history.resolvedAt ? new Date(history.resolvedAt).toLocaleString('id-ID') : '-'}
                          </td>
                          <td>
                            {history.timeToResolve ? `${history.timeToResolve} menit` : '-'}
                          </td>
                          <td>
                            {history.resolution ? (
                              <span className="badge bg-success">
                                {RESOLUTION_LABELS[history.resolution] || history.resolution}
                              </span>
                            ) : '-'}
                          </td>
                          <td className="small">{history.impactAssessment}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          </div>
        )}

        {activeTab === 'stats' && (
          <div className={`card ${theme === 'dark' ? 'bg-secondary text-light' : 'bg-white'}`}>
            <div className="card-body">
              <h5 className="card-title mb-4">Statistik Peringatan</h5>
              <div className="row">
                <div className="col-md-6 mb-4">
                  <h6 className="mb-3">Peringatan Berdasarkan Tipe</h6>
                  {statistics && Object.entries(statistics.alertsByType).map(([type, count]) => (
                    <div key={type} className="d-flex justify-content-between align-items-center mb-2">
                      <span>
                        <span className={`badge ${SEVERITY_BADGES.warning} me-2`}>
                          {ALERT_TYPE_LABELS[type as PerformanceAlertType]}
                        </span>
                      </span>
                      <span className="badge bg-secondary">{count}</span>
                    </div>
                  ))}
                </div>
                <div className="col-md-6 mb-4">
                  <h6 className="mb-3">Peringatan Berdasarkan Tingkat</h6>
                  {statistics && Object.entries(statistics.alertsBySeverity).map(([severity, count]) => (
                    <div key={severity} className="d-flex justify-content-between align-items-center mb-2">
                      <span>
                        <span className={`badge ${SEVERITY_BADGES[severity as AlertSeverity]} me-2`}>
                          {SEVERITY_LABELS[severity as AlertSeverity]}
                        </span>
                      </span>
                      <span className="badge bg-secondary">{count}</span>
                    </div>
                  ))}
                </div>
                <div className="col-12">
                  <h6 className="mb-3">Aturan Paling Sering Gagal</h6>
                  {statistics && statistics.topFailingRules.length > 0 ? (
                    <div className="table-responsive">
                      <table className="table table-sm table-bordered">
                        <thead>
                          <tr>
                            <th>Aturan</th>
                            <th>Jumlah Peringatan</th>
                          </tr>
                        </thead>
                        <tbody>
                          {statistics.topFailingRules.map((rule, index) => (
                            <tr key={rule.ruleId}>
                              <td>
                                <span className="badge bg-secondary me-2">#{index + 1}</span>
                                {rule.ruleName}
                              </td>
                              <td>
                                <span className="badge bg-danger">{rule.alertCount}</span>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  ) : (
                    <p className="text-muted">Belum ada data aturan yang gagal</p>
                  )}
                </div>
              </div>
            </div>
          </div>
        )}

        {selectedAlert && (
          <>
            <div className="modal fade show" style={{ display: 'block' }} tabIndex={-1}>
              <div className="modal-dialog modal-lg">
                <div className={`modal-content ${theme === 'dark' ? 'bg-dark text-light' : ''}`}>
                  <div className="modal-header">
                    <h5 className="modal-title">Detail Peringatan</h5>
                    <button
                      type="button"
                      className="btn-close"
                      onClick={() => setSelectedAlert(null)}
                    >
                      <span aria-hidden="true">&times;</span>
                    </button>
                  </div>
                  <div className="modal-body">
                  <div className="mb-3">
                    <span className={`badge ${SEVERITY_BADGES[selectedAlert.severity]} fs-6`}>
                      {ALERT_TYPE_LABELS[selectedAlert.alertType]}
                    </span>
                    <span className={`badge ${SEVERITY_BADGES[selectedAlert.severity]} ms-2`}>
                      {SEVERITY_LABELS[selectedAlert.severity]}
                    </span>
                  </div>
                  <p className="lead">{selectedAlert.message}</p>
                  
                  <h6 className="mt-4 mb-3">Rekomendasi</h6>
                  <ul>
                    {selectedAlert.recommendations.map((rec, idx) => (
                      <li key={idx}>{rec}</li>
                    ))}
                  </ul>

                  <div className="row mt-4">
                    <div className="col-md-6">
                      <strong>Aturan:</strong> {selectedAlert.ruleName}
                    </div>
                    <div className="col-md-6">
                      <strong>Segmen:</strong> {selectedAlert.segment || '-'}
                    </div>
                    <div className="col-md-6 mt-2">
                      <strong>Nilai Saat Ini:</strong> {selectedAlert.currentValue.toFixed(2)}
                    </div>
                    <div className="col-md-6 mt-2">
                      <strong>Nilai Sebelumnya:</strong> {selectedAlert.previousValue.toFixed(2)}
                    </div>
                    <div className="col-md-6 mt-2">
                      <strong>Perubahan:</strong> {selectedAlert.percentChange.toFixed(1)}%
                    </div>
                    <div className="col-md-6 mt-2">
                      <strong>Terdeteksi:</strong> {new Date(selectedAlert.detectedAt).toLocaleString('id-ID')}
                    </div>
                    {selectedAlert.acknowledgedAt && (
                      <div className="col-md-6 mt-2">
                        <strong>Diakui:</strong> {new Date(selectedAlert.acknowledgedAt).toLocaleString('id-ID')}
                      </div>
                    )}
                    {selectedAlert.resolvedAt && (
                      <div className="col-md-6 mt-2">
                        <strong>Diselesaikan:</strong> {new Date(selectedAlert.resolvedAt).toLocaleString('id-ID')}
                      </div>
                    )}
                  </div>

                  {selectedAlert.resolution && (
                    <div className="mt-4 p-3 bg-light rounded">
                      <strong>Resolusi:</strong> {RESOLUTION_LABELS[selectedAlert.resolution] || selectedAlert.resolution}
                      {selectedAlert.resolutionNotes && (
                        <div className="mt-2">
                          <strong>Catatan:</strong> {selectedAlert.resolutionNotes}
                        </div>
                      )}
                    </div>
                  )}
                </div>
                <div className="modal-footer">
                  <button
                    type="button"
                    className="btn btn-secondary"
                    onClick={() => setSelectedAlert(null)}
                  >
                    Tutup
                  </button>
                  {selectedAlert.status === 'active' && (
                    <button
                      type="button"
                      className="btn btn-warning"
                      onClick={() => {
                        handleAcknowledgeAlert(selectedAlert.id);
                        setSelectedAlert(null);
                      }}
                    >
                      Akui Peringatan
                    </button>
                  )}
                  {(selectedAlert.status === 'active' || selectedAlert.status === 'acknowledged') && (
                    <button
                      type="button"
                      className="btn btn-danger"
                      onClick={() => {
                        handleResolveAlert(selectedAlert.id, 'rule_disabled');
                        setSelectedAlert(null);
                      }}
                    >
                      Nonaktifkan Aturan
                    </button>
                  )}
                </div>
              </div>
            </div>
          </div>
           <div className="modal-backdrop fade show" style={{ display: 'block' }} onClick={() => setSelectedAlert(null)}></div>
           </>
         )}
        </div>
    </div>
  );
};

export default PersonalizationPerformanceAlertsDashboard;
