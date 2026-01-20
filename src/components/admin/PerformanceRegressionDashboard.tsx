/**
 * Performance Regression Detection Admin Dashboard
 * 
 * Displays detected performance regressions, alerts, and historical trends.
 */

'use client';

import { useState } from 'react';

interface RegressionAlert {
  id: string;
  metric: string;
  currentValue: number;
  baselineValue: number;
  degradation: number;
  statisticalSignificance: boolean;
  detectedAt: string;
  severity: 'low' | 'medium' | 'high';
  status: 'active' | 'acknowledged' | 'resolved';
}

interface PerformanceDashboardProps {
  alerts: RegressionAlert[];
  onAcknowledge: (id: string) => void;
  onResolve: (id: string) => void;
}

function PerformanceRegressionDashboard({ alerts, onAcknowledge, onResolve }: PerformanceDashboardProps) {
  const [filter, setFilter] = useState<'all' | 'active' | 'acknowledged' | 'resolved'>('all');
  const [severityFilter, setSeverityFilter] = useState<'all' | 'low' | 'medium' | 'high'>('all');

  // Filter alerts
  const filteredAlerts = alerts.filter(alert => {
    const matchesStatus = filter === 'all' || alert.status === filter;
    const matchesSeverity = severityFilter === 'all' || alert.severity === severityFilter;
    return matchesStatus && matchesSeverity;
  });

  // Sort by severity and detectedAt (high first, then most recent)
  const sortedAlerts = [...filteredAlerts].sort((a, b) => {
    const severityOrder = { high: 0, medium: 1, low: 2 };
    const severityDiff = severityOrder[a.severity] - severityOrder[b.severity];
    if (severityDiff !== 0) return severityDiff;
    return new Date(b.detectedAt).getTime() - new Date(a.detectedAt).getTime();
  });

  // Calculate statistics
  const activeAlerts = alerts.filter(a => a.status === 'active');
  const highSeverityAlerts = activeAlerts.filter(a => a.severity === 'high').length;
  const avgDegradation = activeAlerts.length > 0
    ? activeAlerts.reduce((sum, a) => sum + a.degradation, 0) / activeAlerts.length
    : 0;

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
                        {alert.metric}
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
                          onClick={() => onAcknowledge(alert.id)}
                        >
                          Akui
                        </button>
                        <button
                          className="btn btn-sm btn-success"
                          onClick={() => onResolve(alert.id)}
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
