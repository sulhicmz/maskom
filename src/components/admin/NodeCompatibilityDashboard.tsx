'use client';

import { useState, useEffect } from 'react';
import {
  parseEnginesField,
  checkNodeVersion,
  getCurrentNodeVersion,
  scanDependencyVersions,
  generateVersionManagerConfigs,
  generateRemediationActions,
} from '@/utils/nodeCompatibility/versionCheck';
import type { NodeVersionCheckResult, DependencyVersionRequirement, VersionManagerConfig } from '@/types/nodeCompatibility';

export default function NodeCompatibilityDashboard() {
  const [nodeCheck, setNodeCheck] = useState<NodeVersionCheckResult | null>(null);
  const [dependencies, setDependencies] = useState<DependencyVersionRequirement[]>([]);
  const [versionManagers, setVersionManagers] = useState<VersionManagerConfig[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [showRemediation, setShowRemediation] = useState(false);
  const [showConfigs, setShowConfigs] = useState(false);
  const [selectedExport, setSelectedExport] = useState<'pdf' | 'csv' | null>(null);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    setIsLoading(true);
    try {
      const currentVersion = getCurrentNodeVersion();
      const requirement = parseEnginesField('>=18.0.0');
      const checkResult = checkNodeVersion(currentVersion, requirement);
      setNodeCheck(checkResult);

      const configs = generateVersionManagerConfigs(requirement.minVersion || requirement.requiredVersion || '22.0.0');
      setVersionManagers(configs);

      const deps = await scanDependencyVersions();
      setDependencies(deps);
    } catch (error) {
      console.error('Error loading compatibility data:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const exportToCSV = () => {
    if (!nodeCheck) return;

    const headers = ['Metric', 'Value', 'Status'];
    const rows = [
      ['Current Version', nodeCheck.currentVersion, nodeCheck.status],
      ['Min Version', nodeCheck.required.minVersion || 'N/A', nodeCheck.status],
      ['Max Version', nodeCheck.required.maxVersion || 'N/A', nodeCheck.status],
      ['Required Version', nodeCheck.required.requiredVersion || 'N/A', nodeCheck.status],
    ];

    dependencies.forEach(dep => {
      rows.push([dep.name, dep.version, dep.compatible ? 'Compatible' : 'Incompatible']);
    });

    const csvContent = [
      headers.join(','),
      ...rows.map(row => row.join(','))
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'node-compatibility-report.csv';
    a.click();
    URL.revokeObjectURL(url);
  };

  const exportToPDF = () => {
    if (typeof window !== 'undefined') {
      window.print();
    }
  };

  if (isLoading) {
    return (
      <div className="node-compatibility-dashboard loading">
        <div className="loading-spinner"></div>
        <p>Memeriksa kompatibilitas Node.js...</p>
      </div>
    );
  }

  const statusConfig = {
    pass: { className: 'status-pass', icon: '✓', label: 'Kompatibel' },
    warning: { className: 'status-warning', icon: '⚠', label: 'Peringatan' },
    fail: { className: 'status-fail', icon: '✗', label: 'Tidak Kompatibel' }
  };

  const status = nodeCheck?.status || 'pass';
  const config = statusConfig[status];

  return (
    <div className="node-compatibility-dashboard">
      <div className="dashboard-header">
        <h1>Kompatibilitas Node.js</h1>
        <div className="header-actions">
          <button
            onClick={() => setShowRemediation(!showRemediation)}
            className={`btn ${showRemediation ? 'btn-primary' : 'btn-outline-primary'}`}
            disabled={status === 'pass'}
          >
            Solusi
          </button>
          <button
            onClick={() => setShowConfigs(!showConfigs)}
            className="btn btn-outline-secondary"
          >
            Konfigurasi
          </button>
          <select
            value={selectedExport || ''}
            onChange={(e) => {
              const value = e.target.value as 'pdf' | 'csv' | null;
              setSelectedExport(value);
              if (value === 'csv') exportToCSV();
              if (value === 'pdf') exportToPDF();
            }}
            className="form-select"
          >
            <option value="">Ekspor...</option>
            <option value="csv">Ekspor CSV</option>
            <option value="pdf">Ekspor PDF</option>
          </select>
        </div>
      </div>

      <div className={`status-banner status-${status}`}>
        <div className="status-icon">{config.icon}</div>
        <div className="status-info">
          <h2>{config.label}</h2>
          <p>{nodeCheck?.message}</p>
        </div>
      </div>

      {showRemediation && status !== 'pass' && nodeCheck && (
        <div className="remediation-section">
          <h3>Solusi</h3>
          <div className="remediation-actions">
            {generateRemediationActions(nodeCheck).map((action, index) => (
              <div key={index} className="remediation-card">
                <h4>{action.action}</h4>
                <p>{action.description}</p>
                <code>{action.command}</code>
              </div>
            ))}
          </div>
        </div>
      )}

      {showConfigs && versionManagers.length > 0 && (
        <div className="version-managers-section">
          <h3>Konfigurasi Manager Versi</h3>
          <div className="version-manager-cards">
            {versionManagers.map((manager, index) => (
              <div key={index} className="version-manager-card">
                <h4>{manager.type.toUpperCase()}</h4>
                <p>File: {manager.configPath}</p>
                <pre><code>{manager.content}</code></pre>
              </div>
            ))}
          </div>
        </div>
      )}

      <div className="version-details-section">
        <h3>Detail Versi</h3>
        <div className="version-cards">
          <div className="version-card">
            <h4>Versi Saat Ini</h4>
            <p className="version-value">{nodeCheck?.currentVersion}</p>
          </div>
          <div className="version-card">
            <h4>Versi Minimum</h4>
            <p className="version-value">{nodeCheck?.required.minVersion || 'N/A'}</p>
          </div>
          <div className="version-card">
            <h4>Versi Maksimum</h4>
            <p className="version-value">{nodeCheck?.required.maxVersion || 'N/A'}</p>
          </div>
          <div className="version-card">
            <h4>Versi Diperlukan</h4>
            <p className="version-value">{nodeCheck?.required.requiredVersion || 'N/A'}</p>
          </div>
        </div>
      </div>

      <div className="dependencies-section">
        <h3>Kompatibilitas Dependensi</h3>
        <p className="dependencies-count">Total {dependencies.length} dependensi</p>
        <div className="dependencies-table">
          <table>
            <thead>
              <tr>
                <th>Nama</th>
                <th>Versi</th>
                <th>Versi Node</th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody>
              {dependencies.map((dep, index) => (
                <tr key={index}>
                  <td>{dep.name}</td>
                  <td>{dep.version}</td>
                  <td>{dep.nodeVersionRequirement || 'N/A'}</td>
                  <td className={dep.compatible ? 'compatible' : 'incompatible'}>
                    {dep.compatible ? '✓ Kompatibel' : '✗ Tidak Kompatibel'}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      <div className="help-section">
        <h3>Bantuan</h3>
        <div className="help-cards">
          <div className="help-card">
            <h4>Apa itu Node.js?</h4>
            <p>Node.js adalah runtime JavaScript yang digunakan untuk menjalankan aplikasi sisi server.</p>
          </div>
          <div className="help-card">
            <h4>Mengapa verifikasi versi?</h4>
            <p>Versi Node.js yang tidak kompatibel dapat menyebabkan error saat deployment dan runtime.</p>
          </div>
          <div className="help-card">
            <h4>Bagaimana cara upgrade?</h4>
            <p>Gunakan nvm, volta, atau fnm untuk mengelola beberapa versi Node.js di sistem Anda.</p>
          </div>
        </div>
      </div>
    </div>
  );
}
