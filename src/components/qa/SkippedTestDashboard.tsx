'use client';

import { useState, useEffect, useMemo } from 'react';
import {
  SkippedTestInfo,
  SkipCategory,
  SkipSeverity,
  SkipCategoryStats,
  SkipTrendData,
} from '@/types/testDiagnostics';
import {
  generateDiagnosticReport,
  filterByCategory,
  filterBySeverity,
  searchSkippedTests,
  updateTestSelection,
  bulkUpdateSelection,
  reEnableSelectedTests,
  deleteSelectedTests,
  exportSkippedTestsAsCSV,
} from '@/utils/testDiagnostics/skippedTestScanner';
import { useRBAC } from '@/hooks/useRBAC';
import { Permission } from '@/types/permission';
import Button from '@/components/ui/Button';

const SkippedTestDashboard = () => {
  const { hasPermission } = useRBAC();

  // State
  const [skippedTests, setSkippedTests] = useState<SkippedTestInfo[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedCategory, setSelectedCategory] = useState<SkipCategory | 'all'>('all');
  const [selectedSeverity, setSelectedSeverity] = useState<SkipSeverity | 'all'>('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [categoryStats, setCategoryStats] = useState<SkipCategoryStats[]>([]);
  const [trendData, setTrendData] = useState<SkipTrendData[]>([]);
  const [criticalIssues, setCriticalIssues] = useState<SkippedTestInfo[]>([]);
  const [showExportModal, setShowExportModal] = useState(false);
  const [exportFormat, setExportFormat] = useState<'pdf' | 'csv'>('csv');

  // Filter tests
  const filteredTests = useMemo(() => {
    let tests = skippedTests;

    if (selectedCategory !== 'all') {
      tests = filterByCategory(tests, selectedCategory);
    }

    if (selectedSeverity !== 'all') {
      tests = filterBySeverity(tests, selectedSeverity);
    }

    if (searchTerm) {
      tests = searchSkippedTests(tests, searchTerm);
    }

    return tests;
  }, [skippedTests, selectedCategory, selectedSeverity, searchTerm]);

  // Selected tests
  const selectedTests = useMemo(() => {
    return filteredTests.filter(t => t.isSelected);
  }, [filteredTests]);

  // Load data
  useEffect(() => {
    loadDiagnosticData();
  }, []);

  const loadDiagnosticData = async () => {
    setLoading(true);
    try {
      const report = await generateDiagnosticReport();
      setSkippedTests([]);
      setCategoryStats(report.categoryStats);
      setTrendData(report.trendData);
      setCriticalIssues(report.criticalIssues);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Gagal memuat diagnostik tes');
    } finally {
      setLoading(false);
    }
  };

  // Update selection
  const toggleTestSelection = (testId: string) => {
    const test = filteredTests.find(t => t.id === testId);
    if (test) {
      setSkippedTests(prev => updateTestSelection(prev, testId, !test.isSelected));
    }
  };

  const toggleAllSelections = () => {
    const allSelected = filteredTests.every(t => t.isSelected);
    setSkippedTests(prev => bulkUpdateSelection(prev, !allSelected, t => filteredTests.includes(t)));
  };

  // Bulk actions
  const handleReEnableTests = () => {
    const reEnabled = reEnableSelectedTests(filteredTests);
    if (reEnabled.length > 0) {
      alert(`${reEnabled.length} tes berhasil diaktifkan kembali`);
      loadDiagnosticData();
    }
  };

  const handleDeleteTests = () => {
    const deleted = deleteSelectedTests(filteredTests);
    if (deleted.length > 0) {
      alert(`${deleted.length} tes dihapus`);
      loadDiagnosticData();
    }
  };

  // Export
  const handleExport = () => {
    if (exportFormat === 'csv') {
      const csv = exportSkippedTestsAsCSV(filteredTests);
      const blob = new Blob([csv], { type: 'text/csv' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `skipped-tests-report-${new Date().toISOString().split('T')[0]}.csv`;
      a.click();
      URL.revokeObjectURL(url);
    } else {
      alert('Ekspor PDF belum diimplementasikan');
    }
    setShowExportModal(false);
  };

  // Category colors
  const getCategoryColor = (category: SkipCategory): string => {
    const colors: Record<SkipCategory, string> = {
      timeout: 'warning',
      pending: 'info',
      skip: 'secondary',
      'fixture-issues': 'danger',
      'dependency-issues': 'danger',
      'environment-issues': 'warning',
      'known-issue': 'warning',
      obsolete: 'danger',
      temporary: 'info',
      unknown: 'secondary',
    };
    return colors[category];
  };

  // Severity badges
  const getSeverityBadge = (severity: SkipSeverity): string => {
    const badges: Record<SkipSeverity, string> = {
      low: 'bg-success text-white',
      medium: 'bg-warning text-dark',
      high: 'bg-danger text-white',
      critical: 'bg-danger text-white font-weight-bold',
    };
    return badges[severity];
  };

  // Check permissions
  if (!hasPermission(Permission.VIEW_QA)) {
    return (
      <div className="alert alert-danger">
        <i className="bi bi-exclamation-triangle-fill me-2"></i>
        Anda tidak memiliki izin untuk mengakses halaman ini.
      </div>
    );
  }

  if (loading) {
    return (
      <div className="text-center py-5">
        <div className="spinner-border text-primary" role="status">
          <span className="visually-hidden">Memuat...</span>
        </div>
        <p className="mt-3">Memuat diagnostik tes yang diabaikan...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="alert alert-danger">
        <i className="bi bi-exclamation-triangle-fill me-2"></i>
        {error}
      </div>
    );
  }

  return (
    <div className="skipped-test-dashboard">
      {/* Header */}
      <div className="d-flex justify-content-between align-items-center mb-4">
        <div>
          <h2 className="mb-1">
            <i className="bi bi-bug-fill me-2 text-warning"></i>
            Diagnostik Tes yang Diabaikan
          </h2>
          <p className="text-muted mb-0">
            Kelola dan tinjau tes yang diabaikan untuk meningkatkan cakupan pengujian
          </p>
        </div>
        <Button
          variant="primary"
          onClick={() => setShowExportModal(true)}
        >
          <i className="bi bi-download me-2"></i>
            Ekspor Laporan
        </Button>
      </div>

      {/* Summary Cards */}
      <div className="row g-3 mb-4">
        <div className="col-md-3">
          <div className="card shadow-sm">
            <div className="card-body">
              <h6 className="text-muted text-uppercase small">Total Tes Diabaikan</h6>
              <h3 className="mb-0">{skippedTests.length}</h3>
            </div>
          </div>
        </div>
        <div className="col-md-3">
          <div className="card shadow-sm border-danger">
            <div className="card-body">
              <h6 className="text-danger text-uppercase small">Isu Kritis</h6>
              <h3 className="mb-0 text-danger">{criticalIssues.length}</h3>
            </div>
          </div>
        </div>
        <div className="col-md-3">
          <div className="card shadow-sm border-warning">
            <div className="card-body">
              <h6 className="text-warning text-uppercase small">Perlu Investigasi</h6>
              <h3 className="mb-0 text-warning">
                {skippedTests.filter(t => t.severity === 'high').length}
              </h3>
            </div>
          </div>
        </div>
        <div className="col-md-3">
          <div className="card shadow-sm border-info">
            <div className="card-body">
              <h6 className="text-info text-uppercase small">Terpilih</h6>
              <h3 className="mb-0 text-info">{selectedTests.length}</h3>
            </div>
          </div>
        </div>
      </div>

      {/* Category Breakdown */}
      <div className="card shadow-sm mb-4">
        <div className="card-header">
          <h5 className="mb-0">
            <i className="bi bi-pie-chart-fill me-2"></i>
            Statistik Kategori
          </h5>
        </div>
        <div className="card-body">
          {categoryStats.length > 0 ? (
            <div className="row">
              {categoryStats.map(stat => (
                <div key={stat.category} className="col-md-4 mb-3">
                  <div className={`card border-${getCategoryColor(stat.category)}`}>
                    <div className="card-body">
                      <h6 className="text-uppercase small text-muted mb-1">
                        {stat.category.replace('-', ' ')}
                      </h6>
                      <div className="d-flex justify-content-between align-items-center">
                        <h4 className="mb-0">{stat.count}</h4>
                        <span className={`badge bg-${getCategoryColor(stat.category)}`}>
                          {stat.percentage.toFixed(1)}%
                        </span>
                      </div>
                      <div className="mt-2">
                        <small className="text-muted">
                          Kritis: {stat.severityBreakdown.critical} | 
                          Tinggi: {stat.severityBreakdown.high} | 
                          Sedang: {stat.severityBreakdown.medium} | 
                          Rendah: {stat.severityBreakdown.low}
                        </small>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center text-muted py-4">
              <i className="bi bi-check-circle-fill text-success fs-1"></i>
              <p className="mt-3 mb-0">Tidak ada tes yang diabaikan</p>
            </div>
          )}
        </div>
      </div>

      {/* Trend Visualization */}
      {trendData.length > 0 && (
        <div className="card shadow-sm mb-4">
          <div className="card-header">
            <h5 className="mb-0">
              <i className="bi bi-graph-up me-2"></i>
              Tren Tes yang Diabaikan
            </h5>
          </div>
          <div className="card-body">
            <div className="table-responsive">
              <table className="table table-sm">
                <thead>
                  <tr>
                    <th>Tanggal</th>
                    <th>Total</th>
                    <th>Baru</th>
                    <th>Telusur Kategori</th>
                  </tr>
                </thead>
                <tbody>
                  {trendData.slice(-4).map((trend, idx) => (
                    <tr key={idx}>
                      <td>{trend.date}</td>
                      <td>{trend.totalSkipped}</td>
                      <td className={trend.newSkips > 0 ? 'text-danger' : 'text-success'}>
                        {trend.newSkips > 0 ? '+' : ''}{trend.newSkips}
                      </td>
                      <td>
                        {Object.entries(trend.categoryBreakdown)
                          .filter(([, count]) => count > 0)
                          .map(([cat, count]) => `${cat}: ${count}`)
                          .join(', ') || '-'}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* Filters and Search */}
      <div className="card shadow-sm mb-4">
        <div className="card-body">
          <div className="row g-3">
            <div className="col-md-4">
              <label className="form-label">Kategori</label>
              <select
                className="form-select"
                value={selectedCategory}
                onChange={(e) => setSelectedCategory(e.target.value as SkipCategory | 'all')}
              >
                <option value="all">Semua Kategori</option>
                <option value="timeout">Timeout</option>
                <option value="pending">Pending</option>
                <option value="skip">Skip</option>
                <option value="fixture-issues">Isu Fixture</option>
                <option value="dependency-issues">Isu Dependency</option>
                <option value="environment-issues">Isu Lingkungan</option>
                <option value="known-issue">Isu Diketahui</option>
                <option value="obsolete">Usang</option>
                <option value="temporary">Sementara</option>
                <option value="unknown">Tidak Diketahui</option>
              </select>
            </div>
            <div className="col-md-3">
              <label className="form-label">Keparahan</label>
              <select
                className="form-select"
                value={selectedSeverity}
                onChange={(e) => setSelectedSeverity(e.target.value as SkipSeverity | 'all')}
              >
                <option value="all">Semua Keparahan</option>
                <option value="critical">Kritis</option>
                <option value="high">Tinggi</option>
                <option value="medium">Sedang</option>
                <option value="low">Rendah</option>
              </select>
            </div>
            <div className="col-md-5">
              <label className="form-label">Pencarian</label>
              <div className="input-group">
                <span className="input-group-text">
                  <i className="bi bi-search"></i>
                </span>
                <input
                  type="text"
                  className="form-control"
                  placeholder="Cari berdasarkan nama tes, file, atau alasan..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Bulk Actions */}
      {selectedTests.length > 0 && (
        <div className="alert alert-info mb-3">
          <div className="d-flex justify-content-between align-items-center">
            <span>
              <strong>{selectedTests.length}</strong> tes dipilih
            </span>
            <div>
              <Button
                variant="primary"
                size="small"
                onClick={handleReEnableTests}
                className="me-2"
              >
                <i className="bi bi-check-circle me-1"></i>
                Aktifkan Kembali
              </Button>
              <Button
                variant="danger"
                size="small"
                onClick={handleDeleteTests}
              >
                <i className="bi bi-trash me-1"></i>
                Hapus (Hanya Usang)
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Skipped Tests List */}
      <div className="card shadow-sm">
        <div className="card-header d-flex justify-content-between align-items-center">
          <h5 className="mb-0">
            <i className="bi bi-list-check me-2"></i>
            Daftar Tes yang Diabaikan
            <span className="badge bg-secondary ms-2">{filteredTests.length}</span>
          </h5>
          <div className="form-check">
            <input
              type="checkbox"
              className="form-check-input"
              id="selectAll"
              checked={filteredTests.length > 0 && filteredTests.every(t => t.isSelected)}
              onChange={toggleAllSelections}
            />
            <label className="form-check-label ms-2" htmlFor="selectAll">
              Pilih Semua
            </label>
          </div>
        </div>
        <div className="card-body p-0">
          {filteredTests.length > 0 ? (
            <div className="table-responsive">
              <table className="table table-hover mb-0">
                <thead className="table-light">
                  <tr>
                    <th style={{ width: '50px' }}></th>
                    <th>Tes</th>
                    <th>File</th>
                    <th>Kategori</th>
                    <th>Keparahan</th>
                    <th>Rekomendasi</th>
                    <th>Tanggal</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredTests.map(test => (
                    <tr key={test.id} className={test.isSelected ? 'table-active' : ''}>
                      <td>
                        <input
                          type="checkbox"
                          className="form-check-input"
                          checked={test.isSelected || false}
                          onChange={() => toggleTestSelection(test.id)}
                        />
                      </td>
                      <td>
                        <div>
                          <strong>{test.testName}</strong>
                          {test.skipReason && (
                            <small className="d-block text-muted">
                              <i className="bi bi-chat-quote me-1"></i>
                              {test.skipReason}
                            </small>
                          )}
                        </div>
                      </td>
                      <td>
                        <code className="small">{test.testFile}</code>
                      </td>
                      <td>
                        <span className={`badge bg-${getCategoryColor(test.category)}`}>
                          {test.category.replace('-', ' ')}
                        </span>
                      </td>
                      <td>
                        <span className={`badge ${getSeverityBadge(test.severity)}`}>
                          {test.severity}
                        </span>
                      </td>
                      <td>
                        <small>{test.recommendationText}</small>
                      </td>
                      <td>
                        <small>{test.skipDate.toLocaleDateString('id-ID')}</small>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <div className="text-center py-5">
              <i className="bi bi-search text-muted fs-1"></i>
              <p className="text-muted mt-3 mb-0">
                Tidak ada tes yang ditemukan dengan filter saat ini
              </p>
            </div>
          )}
        </div>
      </div>

      {/* Export Modal */}
      {showExportModal && (
        <div className="modal show d-block" tabIndex={-1}>
          <div className="modal-dialog">
            <div className="modal-content">
              <div className="modal-header">
                <h5 className="modal-title">Ekspor Laporan Tes yang Diabaikan</h5>
                <button
                  type="button"
                  className="btn-close"
                  onClick={() => setShowExportModal(false)}
                ></button>
              </div>
              <div className="modal-body">
                <div className="mb-3">
                  <label className="form-label">Format Ekspor</label>
                  <select
                    className="form-select"
                    value={exportFormat}
                    onChange={(e) => setExportFormat(e.target.value as 'pdf' | 'csv')}
                  >
                    <option value="csv">CSV (untuk analisis)</option>
                    <option value="pdf">PDF (untuk tim)</option>
                  </select>
                </div>
                <div className="alert alert-info">
                  <i className="bi bi-info-circle me-2"></i>
                  Ekspor akan mencakup {filteredTests.length} tes yang difilter.
                </div>
              </div>
              <div className="modal-footer">
                <Button
                  variant="secondary"
                  onClick={() => setShowExportModal(false)}
                >
                  Batal
                </Button>
                <Button variant="primary" onClick={handleExport}>
                  <i className="bi bi-download me-2"></i>
                  Ekspor
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default SkippedTestDashboard;
