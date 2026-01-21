/**
 * Performance Regression Detection Admin Dashboard
 * 
 * Displays detected performance regressions, alerts, and historical trends.
 */

'use client';

import { useState, useEffect } from 'react';
import { useTheme } from '@/contexts/ThemeContext';
import {
  establishBaseline,
  checkForRegressions,
  WebVitalMetric,
  PerformanceBaseline,
  RegressionAlert
} from '@/utils/performanceRegressionDetection';
import {
  loadFromLocalStorage,
  getWebVitalsEntries
} from '@/utils/webVitals';
import apmManager from '@/utils/apm';

const REGRESSION_ALERTS_KEY = 'regression_alerts'
const BASELINES_KEY = 'performance_baselines'

function PerformanceRegressionDashboard() {
  const { theme } = useTheme();
  const [alerts, setAlerts] = useState<RegressionAlert[]>([]);
  const [baselines, setBaselines] = useState<Map<WebVitalMetric, PerformanceBaseline>>(new Map());
  const [filter, setFilter] = useState<'all' | 'active' | 'acknowledged' | 'resolved'>('all');
  const [severityFilter, setSeverityFilter] = useState<'all' | 'low' | 'medium' | 'high'>('all');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = () => {
    setLoading(true);
    
    const webVitalsEntries = loadFromLocalStorage();
    
    const storedAlerts = localStorage.getItem(REGRESSION_ALERTS_KEY);
    const storedBaselines = localStorage.getItem(BASELINES_KEY);
    
    let loadedAlerts: RegressionAlert[] = [];
    let loadedBaselines: Map<WebVitalMetric, PerformanceBaseline> = new Map();
    
    if (storedAlerts) {
      try {
        loadedAlerts = JSON.parse(storedAlerts);
      } catch (error) {
        console.error('Failed to parse stored alerts:', error);
      }
    }
    
    if (storedBaselines) {
      try {
        const baselinesData = JSON.parse(storedBaselines);
        for (const baseline of baselinesData) {
          loadedBaselines.set(baseline.metric as WebVitalMetric, baseline);
        }
      } catch (error) {
        console.error('Failed to parse stored baselines:', error);
      }
    }
    
    if (webVitalsEntries.length >= 10 && loadedBaselines.size === 0) {
      const samplesByMetric = groupSamplesByMetric(webVitalsEntries);
      for (const [metric, samples] of samplesByMetric.entries()) {
        if (samples.length >= 10) {
          const baseline = establishBaseline(metric, samples);
          loadedBaselines.set(metric, baseline);
        }
      }
      saveBaselines(loadedBaselines);
    }
    
    if (loadedBaselines.size > 0) {
      const samplesByMetric = groupSamplesByMetric(webVitalsEntries);
      const newAlerts = checkForRegressions(samplesByMetric, loadedBaselines);
      
      const existingAlertIds = new Set(loadedAlerts.map(a => a.id));
      for (const alert of newAlerts) {
        if (!existingAlertIds.has(alert.id)) {
          loadedAlerts.push(alert);
          sendAPMAlert(alert);
        }
      }
      
      saveAlerts(loadedAlerts);
    }
    
    setAlerts(loadedAlerts);
    setBaselines(loadedBaselines);
    setLoading(false);
  };

  const groupSamplesByMetric = (entries: any[]): Map<WebVitalMetric, any[]> => {
    const map = new Map<WebVitalMetric, any[]>();
    
    for (const entry of entries) {
      const metricName = entry.metric.toUpperCase() as WebVitalMetric;
      if (!map.has(metricName)) {
        map.set(metricName, []);
      }
      map.get(metricName)!.push({
        metric: metricName,
        value: entry.value,
        timestamp: new Date(entry.timestamp).getTime()
      });
    }
    
    return map;
  };

  const sendAPMAlert = (alert: RegressionAlert) => {
    apmManager.captureError({
      message: `Performance regression detected for ${alert.metric}`,
      level: 'error',
      tags: {
        component: 'PerformanceRegressionDetection',
        metric: alert.metric,
        severity: alert.severity,
        degradation: `${alert.degradation.toFixed(1)}%`
      },
      extra: {
        alertId: alert.id,
        currentValue: alert.currentValue,
        baselineValue: alert.baselineValue
      }
    });
  };

  const saveAlerts = (alerts: RegressionAlert[]) => {
    try {
      localStorage.setItem(REGRESSION_ALERTS_KEY, JSON.stringify(alerts));
    } catch (error) {
      console.error('Failed to save alerts:', error);
    }
  };

  const saveBaselines = (baselines: Map<WebVitalMetric, PerformanceBaseline>) => {
    try {
      const baselinesArray = Array.from(baselines.values());
      localStorage.setItem(BASELINES_KEY, JSON.stringify(baselinesArray));
    } catch (error) {
      console.error('Failed to save baselines:', error);
    }
  };

  const handleAcknowledge = (id: string) => {
    const updatedAlerts = alerts.map(alert =>
      alert.id === id ? { ...alert, status: 'acknowledged' as const } : alert
    );
    setAlerts(updatedAlerts);
    saveAlerts(updatedAlerts);
  };

  const handleResolve = (id: string) => {
    const updatedAlerts = alerts.map(alert =>
      alert.id === id ? { ...alert, status: 'resolved' as const } : alert
    );
    setAlerts(updatedAlerts);
    saveAlerts(updatedAlerts);
  };

  const handleResetBaselines = () => {
    if (confirm('Apakah Anda yakin ingin mereset semua baseline performa?')) {
      localStorage.removeItem(BASELINES_KEY);
      localStorage.removeItem(REGRESSION_ALERTS_KEY);
      setBaselines(new Map());
      setAlerts([]);
      loadData();
    }
  };

  const filteredAlerts = alerts.filter(alert => {
    const matchesStatus = filter === 'all' || alert.status === filter;
    const matchesSeverity = severityFilter === 'all' || alert.severity === severityFilter;
    return matchesStatus && matchesSeverity;
  });

  const sortedAlerts = [...filteredAlerts].sort((a, b) => {
    const severityOrder = { high: 0, medium: 1, low: 2 };
    const severityDiff = severityOrder[a.severity] - severityOrder[b.severity];
    if (severityDiff !== 0) return severityDiff;
    return b.detectedAt - a.detectedAt;
  });

  const activeAlerts = alerts.filter(a => a.status === 'active');
  const highSeverityAlerts = activeAlerts.filter(a => a.severity === 'high').length;
  const avgDegradation = activeAlerts.length > 0
    ? activeAlerts.reduce((sum, a) => sum + a.degradation, 0) / activeAlerts.length
    : 0;

  const getMetricDisplayName = (metric: string): string => {
    const names: Record<string, string> = {
      'LCP': 'Largest Contentful Paint (LCP)',
      'FID': 'First Input Delay (FID)',
      'CLS': 'Cumulative Layout Shift (CLS)',
      'FCP': 'First Contentful Paint (FCP)',
      'TTFB': 'Time to First Byte (TTFB)',
      'INP': 'Interaction to Next Paint (INP)'
    };
    return names[metric] || metric;
  };

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'high': return 'text-danger';
      case 'medium': return 'text-warning';
      case 'low': return 'text-info';
      default: return 'text-muted';
    }
  };

  const getSeverityBadge = (severity: string) => {
    switch (severity) {
      case 'high': return 'bg-danger';
      case 'medium': return 'bg-warning';
      case 'low': return 'bg-info';
      default: return 'bg-secondary';
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'active': return 'bg-danger';
      case 'acknowledged': return 'bg-warning';
      case 'resolved': return 'bg-success';
      default: return 'bg-secondary';
    }
  };

  if (loading) {
    return (
      <div className="container mt-4">
        <div className="text-center py-5">
          <div className="spinner-border text-primary" role="status">
            <span className="visually-hidden">Memuat...</span>
          </div>
          <p className="mt-3">Memuat data deteksi regresi...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="container mt-4">
      <div className="row mb-4">
        <div className="col-12">
          <h2 className="mb-3">Deteksi Regresi Performa</h2>
          
          {/* Statistics Cards */}
          <div className="row mb-4">
            <div className="col-md-3">
              <div className="card">
                <div className="card-body">
                  <h5 className="card-title text-muted">Alert Aktif</h5>
                  <h3 className={`card-text ${activeAlerts.length > 0 ? 'text-danger' : 'text-success'}`}>
                    {activeAlerts.length}
                  </h3>
                </div>
              </div>
            </div>
            <div className="col-md-3">
              <div className="card">
                <div className="card-body">
                  <h5 className="card-title text-muted">Prioritas Tinggi</h5>
                  <h3 className="card-text text-danger">
                    {highSeverityAlerts}
                  </h3>
                </div>
              </div>
            </div>
            <div className="col-md-3">
              <div className="card">
                <div className="card-body">
                  <h5 className="card-title text-muted">Rata-rata Degradasi</h5>
                  <h3 className="card-text text-warning">
                    {avgDegradation.toFixed(1)}%
                  </h3>
                </div>
              </div>
            </div>
            <div className="col-md-3">
              <div className="card">
                <div className="card-body">
                  <h5 className="card-title text-muted">Total Alert</h5>
                  <h3 className="card-text text-info">
                    {alerts.length}
                  </h3>
                </div>
              </div>
            </div>
          </div>

          {/* Trend Visualization */}
          {activeAlerts.length > 0 && (
            <div className="card mb-4">
              <div className="card-body">
                <h5 className="card-title mb-3">Trend Degradasi Aktif</h5>
                {activeAlerts.slice(0, 5).map(alert => (
                  <div key={alert.id} className="mb-3">
                    <div className="d-flex justify-content-between mb-1">
                      <span>{getMetricDisplayName(alert.metric)}</span>
                      <span className={`fw-bold ${getSeverityColor(alert.severity)}`}>
                        {alert.degradation.toFixed(1)}%
                      </span>
                    </div>
                    <div className="progress" style={{ height: '10px' }}>
                      <div
                        className={`progress-bar ${
                          alert.severity === 'high' ? 'bg-danger' :
                          alert.severity === 'medium' ? 'bg-warning' : 'bg-info'
                        }`}
                        role="progressbar"
                        style={{ width: `${Math.min(alert.degradation, 100)}%` }}
                        aria-valuenow={alert.degradation}
                        aria-valuemin={0}
                        aria-valuemax={100}
                      >
                        {alert.severity.toUpperCase()}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
 
          {/* Filters */}
          <div className="card mb-4">
            <div className="card-body">
              <div className="row">
                <div className="col-md-6">
                  <label className="form-label">Status</label>
                  <select
                    className="form-select"
                    value={filter}
                    onChange={(e) => setFilter(e.target.value as 'all' | 'active' | 'acknowledged' | 'resolved')}
                  >
                    <option value="all">Semua</option>
                    <option value="active">Aktif</option>
                    <option value="acknowledged">Diakui</option>
                    <option value="resolved">Terselesaikan</option>
                  </select>
                </div>
                <div className="col-md-6">
                  <label className="form-label">Severity</label>
                  <select
                    className="form-select"
                    value={severityFilter}
                    onChange={(e) => setSeverityFilter(e.target.value as 'all' | 'low' | 'medium' | 'high')}
                  >
                    <option value="all">Semua</option>
                    <option value="high">Tinggi</option>
                    <option value="medium">Sedang</option>
                    <option value="low">Rendah</option>
                  </select>
                </div>
              </div>
            </div>
          </div>

          {/* Baseline Status */}
          <div className="card mb-4">
            <div className="card-body">
              <div className="d-flex justify-content-between align-items-center">
                <div>
                  <h5 className="card-title mb-1">Status Baseline</h5>
                  <p className={`mb-0 ${baselines.size > 0 ? 'text-success' : 'text-muted'}`}>
                    {baselines.size > 0 
                      ? `${baselines.size} metrik memiliki baseline terdefinisi`
                      : 'Baseline belum terdefinisi (memerlukan minimal 10 sampel)'
                    }
                  </p>
                </div>
                {baselines.size > 0 && (
                  <button className="btn btn-outline-danger" onClick={handleResetBaselines}>
                    Reset Baseline
                  </button>
                )}
              </div>
            </div>
          </div>

          {/* Alerts List */}
          {sortedAlerts.length === 0 ? (
            <div className="alert alert-success">
              <h4 className="alert-heading">Tidak ada regresi terdeteksi</h4>
              <p>Semua metrik performa berada dalam kisaran baseline.</p>
            </div>
          ) : (
            <div className="list-group">
              {sortedAlerts.map((alert) => (
                <div
                  key={alert.id}
                  className={`list-group-item list-group-item-action ${
                    alert.status === 'active' ? 'border-danger' : ''
                  }`}
                >
                  <div className="d-flex w-100 justify-content-between align-items-start">
                    <div className="flex-grow-1">
                      <h5 className="mb-1">
                        {getMetricDisplayName(alert.metric)}
                        <span className={`badge ${getSeverityBadge(alert.severity)} ms-2`}>
                          {alert.severity.toUpperCase()}
                        </span>
                        <span className={`badge ${getStatusBadge(alert.status)} ms-2`}>
                          {alert.status.toUpperCase()}
                        </span>
                      </h5>
                      <p className="mb-1">
                        Nilai saat ini: <strong>{alert.currentValue}ms</strong> | 
                        Baseline: <strong>{alert.baselineValue}ms</strong>
                      </p>
                      <small className="text-muted">
                        Degradasi: <span className={getSeverityColor(alert.severity)}>
                          {alert.degradation.toFixed(1)}%
                        </span> | 
                        {alert.statisticalSignificance ? 'Signifikan secara statistik' : 'Tidak signifikan'} | 
                        Terdeteksi: {new Date(alert.detectedAt).toLocaleString('id-ID')}
                      </small>
                    </div>
                    {alert.status === 'active' && (
                      <div className="btn-group-vertical">
                        <button
                          className="btn btn-sm btn-warning mb-1"
                          onClick={() => handleAcknowledge(alert.id)}
                        >
                          Akui
                        </button>
                        <button
                          className="btn btn-sm btn-success"
                          onClick={() => handleResolve(alert.id)}
                        >
                          Selesaikan
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default PerformanceRegressionDashboard;
