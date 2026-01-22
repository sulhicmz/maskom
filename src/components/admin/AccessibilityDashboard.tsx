"use client";

import React, { useState, useEffect, useCallback, memo } from 'react';
import { useTheme } from '@/contexts/ThemeContext';
import ProtectedRoute from '@/components/common/ProtectedRoute';
import { Permission } from '@/types/permission';
import LoadingSpinner from '@/components/ui/LoadingSpinner';
import type {
  AccessibilityIssue,
  AccessibilityAudit,
  AccessibilitySeverity,
  AccessibilityIssueCategory,
} from '@/types/accessibility';
import { runAccessibilityAudit } from '@/utils/accessibilityAudit';

const SEVERITY_LABELS: Record<AccessibilitySeverity, string> = {
  critical: 'Kritis',
  serious: 'Serius',
  moderate: 'Sedang',
  minor: 'Ringan',
};

const SEVERITY_BADGE_CLASSES: Record<AccessibilitySeverity, string> = {
  critical: 'bg-danger',
  serious: 'bg-warning',
  moderate: 'bg-info',
  minor: 'bg-secondary',
};

const CATEGORY_LABELS: Record<AccessibilityIssueCategory, string> = {
  aria: 'ARIA',
  color: 'Warna',
  forms: 'Formulir',
  keyboard: 'Keyboard',
  language: 'Bahasa',
  labels: 'Label',
  'name-role-value': 'Nama-Role-Nilai',
  parsing: 'Parsing',
  reading: 'Membaca',
  'semantic-html': 'HTML Semantik',
  tables: 'Tabel',
  timing: 'Waktu',
  contrast: 'Kontras',
  images: 'Gambar',
  navigation: 'Navigasi',
  landmarks: 'Titik Arah',
  focus: 'Fokus',
  wcag2a: 'WCAG 2.0 A',
  wcag2aa: 'WCAG 2.0 AA',
  wcag21aa: 'WCAG 2.1 AA',
  'best-practice': 'Praktik Terbaik',
};

const STATUS_LABELS: Record<AccessibilityIssue['status'], string> = {
  open: 'Terbuka',
  'in-progress': 'Sedang Dikerjakan',
  fixed: 'Diperbaiki',
  'false-positive': 'Positif Palsu',
  'cannot-reproduce': 'Tidak Dapat Direproduksi',
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

const AccessibilityDashboard: React.FC = () => {
  const { theme } = useTheme();
  const [audits, setAudits] = useState<AccessibilityAudit[]>([]);
  const [currentAudit, setCurrentAudit] = useState<AccessibilityAudit | null>(null);
  const [loading, setLoading] = useState(true);
  const [runningAudit, setRunningAudit] = useState(false);
  const [filterSeverity, setFilterSeverity] = useState<AccessibilitySeverity | ''>('');
  const [filterCategory, setFilterCategory] = useState<AccessibilityIssueCategory | ''>('');
  const [filterStatus, setFilterStatus] = useState<AccessibilityIssue['status'] | ''>('');
  const [selectedIssue, setSelectedIssue] = useState<AccessibilityIssue | null>(null);
  const [showIssueDetail, setShowIssueDetail] = useState(false);

  const loadAuditHistory = useCallback(() => {
    try {
      const stored = localStorage.getItem('accessibility_audits');
      if (stored) {
        setAudits(JSON.parse(stored));
      }
    } catch (error) {
      console.error('Error loading audit history:', error);
    }
  }, []);

  const loadCurrentAudit = useCallback(() => {
    try {
      const stored = localStorage.getItem('accessibility_current_audit');
      if (stored) {
        setCurrentAudit(JSON.parse(stored));
      }
    } catch (error) {
      console.error('Error loading current audit:', error);
    }
  }, []);

  useEffect(() => {
    loadAuditHistory();
    loadCurrentAudit();
    setLoading(false);
  }, [loadAuditHistory, loadCurrentAudit]);

  const handleRunAudit = useCallback(async () => {
    setRunningAudit(true);
    try {
      const audit = await runAccessibilityAudit(window.location.href);
      
      // Store current audit
      localStorage.setItem('accessibility_current_audit', JSON.stringify(audit));
      setCurrentAudit(audit);
      
      // Add to history
      const updatedAudits = [audit, ...audits.slice(0, 49)]; // Keep last 50
      localStorage.setItem('accessibility_audits', JSON.stringify(updatedAudits));
      setAudits(updatedAudits);
    } catch (error) {
      console.error('Error running accessibility audit:', error);
      alert('Gagal menjalankan audit aksesibilitas. Silakan coba lagi.');
    } finally {
      setRunningAudit(false);
    }
  }, [audits]);

  const handleViewIssue = useCallback((issue: AccessibilityIssue) => {
    setSelectedIssue(issue);
    setShowIssueDetail(true);
  }, []);

  const handleUpdateIssueStatus = useCallback(
    (issueId: string, status: AccessibilityIssue['status']) => {
      if (!currentAudit) return;
      
      const updatedIssues = currentAudit.issues.map(issue =>
        issue.id === issueId ? { ...issue, status, fixedAt: status === 'fixed' ? new Date().toISOString() : undefined } : issue
      );
      
      const updatedAudit = { ...currentAudit, issues: updatedIssues };
      localStorage.setItem('accessibility_current_audit', JSON.stringify(updatedAudit));
      setCurrentAudit(updatedAudit);
      
      if (selectedIssue && selectedIssue.id === issueId) {
        setSelectedIssue({ ...selectedIssue, status });
      }
    },
    [currentAudit, selectedIssue]
  );

  const filteredIssues = currentAudit?.issues.filter(issue => {
    if (filterSeverity && issue.impact !== filterSeverity) return false;
    if (filterCategory && issue.category !== filterCategory) return false;
    if (filterStatus && issue.status !== filterStatus) return false;
    return true;
  }) || [];

  const activeIssues = filteredIssues.filter(
    issue => issue.status === 'open' || issue.status === 'in-progress'
  );

  const overallScore = currentAudit?.score.overall || 0;
  const wcag21aaCompliance = currentAudit?.score.wcag21aaCompliance || 0;

  if (loading) {
    return (
      <ProtectedRoute requiredPermissions={[Permission.MANAGE_CONTENT]}>
        <div className="container py-5">
          <LoadingSpinner />
        </div>
      </ProtectedRoute>
    );
  }

  return (
    <ProtectedRoute requiredPermissions={[Permission.MANAGE_CONTENT]}>
      <div className={`container py-5 ${theme === 'dark' ? 'text-light' : ''}`}>
        <h1 className="mb-4">Audit Aksesibilitas</h1>

        {/* Summary Cards */}
        <div className="row mb-4">
          <div className="col-md-3 mb-3">
            <div className="card h-100">
              <div className="card-body">
                <h6 className="card-title text-muted">Skor Keseluruhan</h6>
                <h3 className={`mb-0 ${overallScore >= 90 ? 'text-success' : overallScore >= 70 ? 'text-warning' : 'text-danger'}`}>
                  {overallScore}
                </h3>
                <small className="text-muted">dari 100</small>
              </div>
            </div>
          </div>
          <div className="col-md-3 mb-3">
            <div className="card h-100">
              <div className="card-body">
                <h6 className="card-title text-muted">Kepatuhan WCAG 2.1 AA</h6>
                <h3 className={`mb-0 ${wcag21aaCompliance >= 90 ? 'text-success' : wcag21aaCompliance >= 70 ? 'text-warning' : 'text-danger'}`}>
                  {wcag21aaCompliance}%
                </h3>
                <small className="text-muted">Target: 90%+</small>
              </div>
            </div>
          </div>
          <div className="col-md-3 mb-3">
            <div className="card h-100">
              <div className="card-body">
                <h6 className="card-title text-muted">Isu Aktif</h6>
                <h3 className="mb-0 text-danger">
                  {activeIssues.length}
                </h3>
                <small className="text-muted">
                  {currentAudit?.summary.critical || 0} kritis, {currentAudit?.summary.serious || 0} serius
                </small>
              </div>
            </div>
          </div>
          <div className="col-md-3 mb-3">
            <div className="card h-100">
              <div className="card-body">
                <h6 className="card-title text-muted">Audit Terakhir</h6>
                <h5 className="mb-0">
                  {currentAudit?.timestamp ? formatDateTime(currentAudit.timestamp) : '-'}
                </h5>
                <small className="text-muted">
                  {currentAudit?.metadata.auditDuration ? `${(currentAudit.metadata.auditDuration / 1000).toFixed(1)}s` : '-'}
                </small>
              </div>
            </div>
          </div>
        </div>

        {/* Actions */}
        <div className="row mb-4">
          <div className="col-12">
            <div className="card">
              <div className="card-body">
                <button
                  className="btn btn-primary"
                  onClick={handleRunAudit}
                  disabled={runningAudit}
                >
                  {runningAudit ? (
                    <>
                      <LoadingSpinner size="sm" />
                      <span className="ms-2">Sedang Menjalankan Audit...</span>
                    </>
                  ) : (
                    'Jalankan Audit Aksesibilitas'
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Filters */}
        <div className="row mb-4">
          <div className="col-md-4 mb-2">
            <select
              className="form-select"
              value={filterSeverity}
              onChange={(e) => setFilterSeverity(e.target.value as AccessibilitySeverity | '')}
            >
              <option value="">Semua Tingkat Keparahan</option>
              <option value="critical">Kritis</option>
              <option value="serious">Serius</option>
              <option value="moderate">Sedang</option>
              <option value="minor">Ringan</option>
            </select>
          </div>
          <div className="col-md-4 mb-2">
            <select
              className="form-select"
              value={filterCategory}
              onChange={(e) => setFilterCategory(e.target.value as AccessibilityIssueCategory | '')}
            >
              <option value="">Semua Kategori</option>
              <option value="aria">ARIA</option>
              <option value="color">Warna</option>
              <option value="forms">Formulir</option>
              <option value="keyboard">Keyboard</option>
              <option value="labels">Label</option>
              <option value="contrast">Kontras</option>
              <option value="images">Gambar</option>
              <option value="navigation">Navigasi</option>
              <option value="focus">Fokus</option>
              <option value="wcag21aa">WCAG 2.1 AA</option>
            </select>
          </div>
          <div className="col-md-4 mb-2">
            <select
              className="form-select"
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value as AccessibilityIssue['status'] | '')}
            >
              <option value="">Semua Status</option>
              <option value="open">Terbuka</option>
              <option value="in-progress">Sedang Dikerjakan</option>
              <option value="fixed">Diperbaiki</option>
              <option value="false-positive">Positif Palsu</option>
              <option value="cannot-reproduce">Tidak Dapat Direproduksi</option>
            </select>
          </div>
        </div>

        {/* Issues Table */}
        <div className="row">
          <div className="col-12">
            <div className="card">
              <div className="card-header">
                <h5 className="mb-0">
                  Isu Aksesibilitas ({activeIssues.length}/{filteredIssues.length} aktif)
                </h5>
              </div>
              <div className="card-body">
                {filteredIssues.length === 0 ? (
                  <div className="text-center py-5 text-muted">
                    {currentAudit === null
                      ? 'Klik "Jalankan Audit Aksesibilitas" untuk memulai audit.'
                      : 'Tidak ada isu yang ditemukan dengan filter saat ini.'}
                  </div>
                ) : (
                  <div className="table-responsive">
                    <table className="table table-hover">
                      <thead>
                        <tr>
                          <th>Tingkat Keparahan</th>
                          <th>Kategori</th>
                          <th>Deskripsi</th>
                          <th>Status</th>
                          <th>Aksi</th>
                        </tr>
                      </thead>
                      <tbody>
                        {filteredIssues.map((issue) => (
                          <tr key={issue.id} className={issue.status === 'open' ? 'table-danger' : ''}>
                            <td>
                              <span className={`badge ${SEVERITY_BADGE_CLASSES[issue.impact]}`}>
                                {SEVERITY_LABELS[issue.impact]}
                              </span>
                            </td>
                            <td>{CATEGORY_LABELS[issue.category]}</td>
                            <td>{issue.description}</td>
                            <td>
                              <span className={`badge ${issue.status === 'open' ? 'bg-danger' : 'bg-success'}`}>
                                {STATUS_LABELS[issue.status]}
                              </span>
                            </td>
                            <td>
                              <button
                                className="btn btn-sm btn-outline-primary me-2"
                                onClick={() => handleViewIssue(issue)}
                              >
                                Lihat Detail
                              </button>
                              {issue.status === 'open' && (
                                <button
                                  className="btn btn-sm btn-outline-success me-2"
                                  onClick={() => handleUpdateIssueStatus(issue.id, 'in-progress')}
                                >
                                  Mulai Perbaikan
                                </button>
                              )}
                              {issue.status === 'in-progress' && (
                                <button
                                  className="btn btn-sm btn-outline-success"
                                  onClick={() => handleUpdateIssueStatus(issue.id, 'fixed')}
                                >
                                  Selesaikan
                                </button>
                              )}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Issue Detail Modal */}
        {showIssueDetail && selectedIssue && (
          <div className="modal fade show" style={{ display: 'block' }} tabIndex={-1}>
            <div className="modal-dialog modal-lg">
              <div className={`modal-content ${theme === 'dark' ? 'bg-dark text-light' : ''}`}>
                <div className="modal-header">
                  <h5 className="modal-title">Detail Isu Aksesibilitas</h5>
                  <button
                    type="button"
                    className="btn-close"
                    onClick={() => setShowIssueDetail(false)}
                  ></button>
                </div>
                <div className="modal-body">
                  <div className="mb-3">
                    <strong>Tingkat Keparahan:</strong>{' '}
                    <span className={`badge ${SEVERITY_BADGE_CLASSES[selectedIssue.impact]} ms-2`}>
                      {SEVERITY_LABELS[selectedIssue.impact]}
                    </span>
                  </div>
                  <div className="mb-3">
                    <strong>Kategori:</strong> {CATEGORY_LABELS[selectedIssue.category]}
                  </div>
                  <div className="mb-3">
                    <strong>Deskripsi:</strong> {selectedIssue.description}
                  </div>
                  <div className="mb-3">
                    <strong>Bantuan:</strong> {selectedIssue.help}
                  </div>
                  {selectedIssue.helpUrl && (
                    <div className="mb-3">
                      <a
                        href={selectedIssue.helpUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="btn btn-sm btn-outline-primary"
                      >
                        Pelajari Lebih Lanjut
                      </a>
                    </div>
                  )}
                  {selectedIssue.nodes.length > 0 && (
                    <div className="mb-3">
                      <strong>Elemen Terpengaruh ({selectedIssue.nodes.length}):</strong>
                      <div className="mt-2">
                        <pre className={`p-3 ${theme === 'dark' ? 'bg-secondary text-light' : 'bg-light'}`}>
                          <code>{selectedIssue.nodes[0].html.substring(0, 200)}...</code>
                        </pre>
                      </div>
                    </div>
                  )}
                </div>
                <div className="modal-footer">
                  {selectedIssue.status === 'open' && (
                    <button
                      className="btn btn-success"
                      onClick={() => {
                        handleUpdateIssueStatus(selectedIssue.id, 'in-progress');
                        setShowIssueDetail(false);
                      }}
                    >
                      Mulai Perbaikan
                    </button>
                  )}
                  {selectedIssue.status === 'in-progress' && (
                    <button
                      className="btn btn-success"
                      onClick={() => {
                        handleUpdateIssueStatus(selectedIssue.id, 'fixed');
                        setShowIssueDetail(false);
                      }}
                    >
                      Selesaikan
                    </button>
                  )}
                  {selectedIssue.status !== 'fixed' && (
                    <button
                      className="btn btn-outline-warning me-2"
                      onClick={() => {
                        handleUpdateIssueStatus(selectedIssue.id, 'false-positive');
                        setShowIssueDetail(false);
                      }}
                    >
                      Tandai sebagai Positif Palsu
                    </button>
                  )}
                  <button
                    className="btn btn-secondary"
                    onClick={() => setShowIssueDetail(false)}
                  >
                    Tutup
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
        {showIssueDetail && (
          <div className="modal-backdrop fade show" onClick={() => setShowIssueDetail(false)}></div>
        )}
      </div>
    </ProtectedRoute>
  );
};

export default memo(AccessibilityDashboard);
