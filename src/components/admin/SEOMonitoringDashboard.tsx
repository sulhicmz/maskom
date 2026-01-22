"use client";

import React, { useState, useEffect, useCallback, memo } from 'react';
import { useTheme } from '@/contexts/ThemeContext';
import ProtectedRoute from '@/components/common/ProtectedRoute';
import { Permission } from '@/types/permission';
import LoadingSpinner from '@/components/ui/LoadingSpinner';
import type {
  SEOIssue,
  SEOAudit,
  SEOIssueSeverity,
  SEOIssueCategory,
  SEOIssueStatus,
  SEOMetrics,
  SEOScoreTrend,
  KeywordRanking,
  OrganicTrafficMetrics,
  SEORecommendation,
} from '@/types/seoMonitor';
import {
  runSEOAudit,
  loadSEOAuditHistory,
  loadCurrentSEOAudit,
  updateSEOIssueStatus,
  generateSEOScoreTrend,
  generateSEOReport,
  generateKeywordRankings,
  generateOrganicTrafficMetrics,
  generateSEORecommendations,
  getSEOConfig,
  saveSEOConfig,
  clearSEOAuditData,
} from '@/utils/seoMonitor';

const SEVERITY_LABELS: Record<SEOIssueSeverity, string> = {
  critical: 'Kritis',
  high: 'Tinggi',
  moderate: 'Sedang',
  low: 'Rendah',
};

const SEVERITY_BADGE_CLASSES: Record<SEOIssueSeverity, string> = {
  critical: 'bg-danger',
  high: 'bg-warning',
  moderate: 'bg-info',
  low: 'bg-secondary',
};

const CATEGORY_LABELS: Record<SEOIssueCategory, string> = {
  'meta-tags': 'Meta Tags',
  'structured-data': 'Data Terstruktur',
  'content-quality': 'Kualitas Konten',
  'performance': 'Performa',
  'mobile': 'Mobile',
  'links': 'Tautan',
  'images': 'Gambar',
  'url-structure': 'Struktur URL',
  'schema': 'Skema',
  'keywords': 'Kata Kunci',
};

const STATUS_LABELS: Record<SEOIssueStatus, string> = {
  open: 'Terbuka',
  'in-progress': 'Sedang Dikerjakan',
  fixed: 'Diperbaiki',
  'false-positive': 'Positif Palsu',
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

const SEOMonitoringDashboard: React.FC = () => {
  const { theme } = useTheme();
  const [audits, setAudits] = useState<SEOAudit[]>([]);
  const [currentAudit, setCurrentAudit] = useState<SEOAudit | null>(null);
  const [loading, setLoading] = useState(true);
  const [runningAudit, setRunningAudit] = useState(false);
  const [filterSeverity, setFilterSeverity] = useState<SEOIssueSeverity | ''>('');
  const [filterCategory, setFilterCategory] = useState<SEOIssueCategory | ''>('');
  const [filterStatus, setFilterStatus] = useState<SEOIssueStatus | ''>('');
  const [selectedIssue, setSelectedIssue] = useState<SEOIssue | null>(null);
  const [showIssueDetail, setShowIssueDetail] = useState(false);
  const [scoreTrend, setScoreTrend] = useState<SEOScoreTrend[]>([]);
  const [keywordRankings, setKeywordRankings] = useState<KeywordRanking[]>([]);
  const [organicTraffic, setOrganicTraffic] = useState<OrganicTrafficMetrics[]>([]);
  const [recommendations, setRecommendations] = useState<SEORecommendation[]>([]);
  const [showRecommendations, setShowRecommendations] = useState(false);

  const loadAuditHistory = useCallback(() => {
    try {
      const stored = loadSEOAuditHistory();
      if (stored) {
        setAudits(stored);
      }
    } catch (error) {
      console.error('Error loading audit history:', error);
    }
  }, []);

  const loadCurrentAudit = useCallback(() => {
    try {
      const stored = loadCurrentSEOAudit();
      if (stored) {
        setCurrentAudit(stored);
      }
    } catch (error) {
      console.error('Error loading current audit:', error);
    }
  }, []);

  useEffect(() => {
    setLoading(true);
    loadAuditHistory();
    loadCurrentAudit();

    // Load trend data
    setScoreTrend(generateSEOScoreTrend(30));
    setKeywordRankings(generateKeywordRankings());
    setOrganicTraffic(generateOrganicTrafficMetrics(30));

    setLoading(false);
  }, [loadAuditHistory, loadCurrentAudit]);

  const handleRunAudit = useCallback(async () => {
    setRunningAudit(true);
    try {
      // Simulate audit delay
      await new Promise(resolve => setTimeout(resolve, 2000));

      const pages = ['/', '/about', '/blog', '/contact', '/pricing'];
      const audit = runSEOAudit(pages);
      setCurrentAudit(audit);
      loadAuditHistory();

      // Refresh data
      setScoreTrend(generateSEOScoreTrend(30));
      setRecommendations(generateSEORecommendations(audit));
    } catch (error) {
      console.error('Error running SEO audit:', error);
    } finally {
      setRunningAudit(false);
    }
  }, [loadAuditHistory]);

  const handleUpdateIssueStatus = useCallback((issueId: string, status: SEOIssueStatus) => {
    const success = updateSEOIssueStatus(issueId, status);
    if (success) {
      loadCurrentAudit();
    }
  }, [loadCurrentAudit]);

  const handleClearData = useCallback(() => {
    if (confirm('Apakah Anda yakin ingin menghapus semua data audit SEO?')) {
      clearSEOAuditData();
      setAudits([]);
      setCurrentAudit(null);
      loadAuditHistory();
      loadCurrentAudit();
    }
  }, [loadAuditHistory, loadCurrentAudit]);

  const filteredIssues = currentAudit?.issues.filter(issue => {
    if (filterSeverity && issue.severity !== filterSeverity) return false;
    if (filterCategory && issue.category !== filterCategory) return false;
    if (filterStatus && issue.status !== filterStatus) return false;
    return true;
  }) || [];

  const pageMetrics = currentAudit?.metrics || [];

  if (loading) {
    return (
      <div className="container py-5">
        <LoadingSpinner />
      </div>
    );
  }

  return (
    <ProtectedRoute requiredPermission={Permission.MANAGE_CONTENT}>
      <div className="container py-5">
        <div className="row mb-4">
          <div className="col-12">
            <h1 className="h3">Monitoring Kinerja SEO</h1>
            <p className="text-muted">Pantau kinerja SEO, isu, dan rekomendasi untuk website Anda.</p>
          </div>
        </div>
        <div className="row mb-4">
          <div className="col-12">
            <h1 className="h3">Monitoring Kinerja SEO</h1>
            <p className="text-muted">Pantau kinerja SEO, isu, dan rekomendasi untuk website Anda.</p>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="row mb-4">
          <div className="col-12">
            <div className="d-flex gap-2">
              <button
                className="btn btn-primary"
                onClick={handleRunAudit}
                disabled={runningAudit}
              >
                {runningAudit ? (
                  <>
                    <LoadingSpinner size="sm" />
                    <span className="ms-2">Menjalankan Audit...</span>
                  </>
                ) : (
                  <>
                    <i className="bi bi-play-circle me-2"></i>
                    Jalankan Audit SEO
                  </>
                )}
              </button>
              <button
                className="btn btn-outline-secondary"
                onClick={() => setShowRecommendations(!showRecommendations)}
              >
                <i className="bi bi-lightbulb me-2"></i>
                Rekomendasi
              </button>
              <button
                className="btn btn-outline-danger ms-auto"
                onClick={handleClearData}
              >
                <i className="bi bi-trash me-2"></i>
                Hapus Data
              </button>
            </div>
          </div>
        </div>

        {/* Score Trend */}
        {currentAudit && (
          <div className="row mb-4">
            <div className="col-12">
              <div className={`card border-0 ${theme === 'dark' ? 'bg-dark' : 'bg-white'}`}>
                <div className="card-body">
                  <h5 className="card-title mb-3">Tren Skor SEO</h5>
                  <div className="row">
                    <div className="col-md-4 mb-3 mb-md-0">
                      <div className={`p-3 rounded ${currentAudit.overallScore >= 90 ? 'bg-success' : currentAudit.overallScore >= 70 ? 'bg-warning' : 'bg-danger'} text-white`}>
                        <h6 className="mb-1">Skor SEO Saat Ini</h6>
                        <h2 className="mb-0">{currentAudit.overallScore}/100</h2>
                      </div>
                    </div>
                    <div className="col-md-4 mb-3 mb-md-0">
                      <div className="p-3 rounded bg-primary text-white">
                        <h6 className="mb-1">Isu Aktif</h6>
                        <h2 className="mb-0">{currentAudit.issues.filter(i => i.status === 'open').length}</h2>
                      </div>
                    </div>
                    <div className="col-md-4">
                      <div className="p-3 rounded bg-info text-white">
                        <h6 className="mb-1">Halaman Diaudit</h6>
                        <h2 className="mb-0">{currentAudit.pagesAudited}</h2>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Recommendations Panel */}
        {showRecommendations && recommendations.length > 0 && (
          <div className="row mb-4">
            <div className="col-12">
              <div className={`card border-0 ${theme === 'dark' ? 'bg-dark' : 'bg-white'}`}>
                <div className="card-header d-flex justify-content-between align-items-center">
                  <h5 className="card-title mb-0">Rekomendasi Tindakan</h5>
                  <button
                    className="btn-close"
                    onClick={() => setShowRecommendations(false)}
                  />
                </div>
                <div className="card-body">
                  <div className="table-responsive">
                    <table className="table table-hover">
                      <thead>
                        <tr>
                          <th>Prioritas</th>
                          <th>Tindakan</th>
                          <th>Dampak</th>
                          <th>Usaha</th>
                        </tr>
                      </thead>
                      <tbody>
                        {recommendations.map(rec => (
                          <tr key={rec.issueId}>
                            <td>
                              <span className={`badge ${SEVERITY_BADGE_CLASSES[rec.priority]}`}>
                                {SEVERITY_LABELS[rec.priority]}
                              </span>
                            </td>
                            <td>{rec.action}</td>
                            <td>
                              <span className={`badge ${rec.estimatedImpact === 'high' ? 'bg-success' : rec.estimatedImpact === 'medium' ? 'bg-warning' : 'bg-secondary'}`}>
                                {rec.estimatedImpact === 'high' ? 'Tinggi' : rec.estimatedImpact === 'medium' ? 'Sedang' : 'Rendah'}
                              </span>
                            </td>
                            <td>
                              {rec.effort === 'quick' ? 'Cepat' : rec.effort === 'moderate' ? 'Sedang' : 'Signifikan'}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Filters */}
        <div className="row mb-4">
          <div className="col-12">
            <div className={`card border-0 ${theme === 'dark' ? 'bg-dark' : 'bg-white'}`}>
              <div className="card-body">
                <div className="row g-3">
                  <div className="col-md-3">
                    <label className="form-label">Tingkat Keparahan</label>
                    <select
                      className="form-select"
                      value={filterSeverity}
                      onChange={(e) => setFilterSeverity(e.target.value as SEOIssueSeverity | '')}
                    >
                      <option value="">Semua</option>
                      <option value="critical">Kritis</option>
                      <option value="high">Tinggi</option>
                      <option value="moderate">Sedang</option>
                      <option value="low">Rendah</option>
                    </select>
                  </div>
                  <div className="col-md-3">
                    <label className="form-label">Kategori</label>
                    <select
                      className="form-select"
                      value={filterCategory}
                      onChange={(e) => setFilterCategory(e.target.value as SEOIssueCategory | '')}
                    >
                      <option value="">Semua</option>
                      {Object.entries(CATEGORY_LABELS).map(([key, label]) => (
                        <option key={key} value={key}>{label}</option>
                      ))}
                    </select>
                  </div>
                  <div className="col-md-3">
                    <label className="form-label">Status</label>
                    <select
                      className="form-select"
                      value={filterStatus}
                      onChange={(e) => setFilterStatus(e.target.value as SEOIssueStatus | '')}
                    >
                      <option value="">Semua</option>
                      <option value="open">Terbuka</option>
                      <option value="in-progress">Sedang Dikerjakan</option>
                      <option value="fixed">Diperbaiki</option>
                      <option value="false-positive">Positif Palsu</option>
                    </select>
                  </div>
                  <div className="col-md-3 d-flex align-items-end">
                    <button
                      className="btn btn-outline-secondary w-100"
                      onClick={() => {
                        setFilterSeverity('');
                        setFilterCategory('');
                        setFilterStatus('');
                      }}
                    >
                      <i className="bi bi-x-circle me-2"></i>
                      Hapus Filter
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Issues Table */}
        <div className="row mb-4">
          <div className="col-12">
            <div className={`card border-0 ${theme === 'dark' ? 'bg-dark' : 'bg-white'}`}>
              <div className="card-header">
                <h5 className="card-title mb-0">
                  Isu SEO ({filteredIssues.length})
                </h5>
              </div>
              <div className="card-body p-0">
                {filteredIssues.length > 0 ? (
                  <div className="table-responsive">
                    <table className="table table-hover mb-0">
                      <thead className="table-light">
                        <tr>
                          <th>Halaman</th>
                          <th>Kategori</th>
                          <th>Tingkat Keparahan</th>
                          <th>Judul</th>
                          <th>Status</th>
                          <th>Diketahui Pada</th>
                          <th>Aksi</th>
                        </tr>
                      </thead>
                      <tbody>
                        {filteredIssues.map(issue => (
                          <tr key={issue.id}>
                            <td className="font-monospace text-break">{issue.page}</td>
                            <td>
                              <span className="badge bg-secondary">
                                {CATEGORY_LABELS[issue.category]}
                              </span>
                            </td>
                            <td>
                              <span className={`badge ${SEVERITY_BADGE_CLASSES[issue.severity]}`}>
                                {SEVERITY_LABELS[issue.severity]}
                              </span>
                            </td>
                            <td>
                              <span
                                className="text-decoration-underline cursor-pointer"
                                onClick={() => {
                                  setSelectedIssue(issue);
                                  setShowIssueDetail(true);
                                }}
                              >
                                {issue.title}
                              </span>
                            </td>
                            <td>
                              <span className={`badge ${issue.status === 'open' ? 'bg-danger' : issue.status === 'in-progress' ? 'bg-warning' : issue.status === 'fixed' ? 'bg-success' : 'bg-secondary'}`}>
                                {STATUS_LABELS[issue.status]}
                              </span>
                            </td>
                            <td className="text-muted small">
                              {formatDateTime(issue.detectedAt)}
                            </td>
                            <td>
                              <div className="dropdown">
                                <button
                                  className="btn btn-sm btn-outline-secondary"
                                  type="button"
                                  data-bs-toggle="dropdown"
                                >
                                  <i className="bi bi-three-dots-vertical"></i>
                                </button>
                                <ul className="dropdown-menu">
                                  {issue.status === 'open' && (
                                    <>
                                      <li>
                                        <button
                                          className="dropdown-item"
                                          onClick={() => handleUpdateIssueStatus(issue.id, 'in-progress')}
                                        >
                                          <i className="bi bi-play-circle me-2"></i>
                                          Mulai Pengerjaan
                                        </button>
                                      </li>
                                      <li>
                                        <button
                                          className="dropdown-item text-success"
                                          onClick={() => handleUpdateIssueStatus(issue.id, 'fixed')}
                                        >
                                          <i className="bi bi-check-circle me-2"></i>
                                          Tandai Diperbaiki
                                        </button>
                                      </li>
                                    </>
                                  )}
                                  {issue.status === 'in-progress' && (
                                    <li>
                                      <button
                                        className="dropdown-item text-success"
                                        onClick={() => handleUpdateIssueStatus(issue.id, 'fixed')}
                                      >
                                        <i className="bi bi-check-circle me-2"></i>
                                        Tandai Diperbaiki
                                      </button>
                                    </li>
                                  )}
                                  <li>
                                    <button
                                      className="dropdown-item text-warning"
                                      onClick={() => handleUpdateIssueStatus(issue.id, 'false-positive')}
                                    >
                                      <i className="bi bi-x-circle me-2"></i>
                                      Tandai Positif Palsu
                                    </button>
                                  </li>
                                </ul>
                              </div>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                ) : (
                  <div className="p-5 text-center text-muted">
                    <i className="bi bi-check-circle display-4 mb-3"></i>
                    <p>Tidak ada isu SEO yang sesuai dengan filter Anda.</p>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Page Metrics Table */}
        {pageMetrics.length > 0 && (
          <div className="row mb-4">
            <div className="col-12">
              <div className={`card border-0 ${theme === 'dark' ? 'bg-dark' : 'bg-white'}`}>
                <div className="card-header">
                  <h5 className="card-title mb-0">Metrik SEO per Halaman</h5>
                </div>
                <div className="card-body p-0">
                  <div className="table-responsive">
                    <table className="table table-hover mb-0">
                      <thead className="table-light">
                        <tr>
                          <th>Halaman</th>
                          <th>Skor</th>
                          <th>Meta Tags</th>
                          <th>Data Terstruktur</th>
                          <th>Kualitas Konten</th>
                          <th>Performa</th>
                          <th>Mobile</th>
                          <th>Tautan</th>
                          <th>Gambar</th>
                        </tr>
                      </thead>
                      <tbody>
                        {pageMetrics.map((metric, idx) => (
                          <tr key={idx}>
                            <td className="font-monospace text-break">
                              <a href={metric.url} target="_blank" rel="noopener noreferrer" className="text-decoration-none">
                                {metric.page}
                              </a>
                            </td>
                            <td>
                              <span className={`badge ${metric.score >= 90 ? 'bg-success' : metric.score >= 70 ? 'bg-warning' : 'bg-danger'}`}>
                                {metric.score}/100
                              </span>
                            </td>
                            <td>
                              {metric.metaTagsScore}/100
                              <span className="text-muted ms-1">({metric.metaTagsIssues} isu)</span>
                            </td>
                            <td>
                              {metric.structuredDataScore}/100
                              <span className="text-muted ms-1">({metric.structuredDataIssues} isu)</span>
                            </td>
                            <td>
                              {metric.contentQualityScore}/100
                              <span className="text-muted ms-1">({metric.contentQualityIssues} isu)</span>
                            </td>
                            <td>
                              {metric.performanceScore}/100
                              <span className="text-muted ms-1">({metric.performanceIssues} isu)</span>
                            </td>
                            <td>
                              {metric.mobileScore}/100
                              <span className="text-muted ms-1">({metric.mobileIssues} isu)</span>
                            </td>
                            <td>
                              {metric.linksScore}/100
                              <span className="text-muted ms-1">({metric.linksIssues} isu)</span>
                            </td>
                            <td>
                              {metric.imagesScore}/100
                              <span className="text-muted ms-1">({metric.imagesIssues} isu)</span>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Issue Detail Modal */}
        {showIssueDetail && selectedIssue && (
          <div
            className="modal fade show d-block"
            tabIndex={-1}
            style={{ backgroundColor: 'rgba(0,0,0,0.5)' }}
            onClick={() => setShowIssueDetail(false)}
          >
            <div className="modal-dialog modal-lg" onClick={(e) => e.stopPropagation()}>
              <div className={`modal-content ${theme === 'dark' ? 'bg-dark text-white' : ''}`}>
                <div className="modal-header">
                  <h5 className="modal-title">{selectedIssue.title}</h5>
                  <button
                    type="button"
                    className="btn-close"
                    onClick={() => setShowIssueDetail(false)}
                  />
                </div>
                <div className="modal-body">
                  <div className="mb-3">
                    <strong>Halaman:</strong>
                    <span className="font-monospace ms-2">{selectedIssue.page}</span>
                  </div>
                  <div className="mb-3">
                    <strong>Kategori:</strong>
                    <span className="badge bg-secondary ms-2">{CATEGORY_LABELS[selectedIssue.category]}</span>
                  </div>
                  <div className="mb-3">
                    <strong>Tingkat Keparahan:</strong>
                    <span className={`badge ${SEVERITY_BADGE_CLASSES[selectedIssue.severity]} ms-2`}>
                      {SEVERITY_LABELS[selectedIssue.severity]}
                    </span>
                  </div>
                  <div className="mb-3">
                    <strong>Status:</strong>
                    <span className={`badge ${selectedIssue.status === 'open' ? 'bg-danger' : selectedIssue.status === 'in-progress' ? 'bg-warning' : selectedIssue.status === 'fixed' ? 'bg-success' : 'bg-secondary'} ms-2`}>
                      {STATUS_LABELS[selectedIssue.status]}
                    </span>
                  </div>
                  <div className="mb-3">
                    <strong>Diketahui Pada:</strong>
                    <span className="ms-2">{formatDateTime(selectedIssue.detectedAt)}</span>
                  </div>
                  <hr />
                  <div className="mb-3">
                    <strong>Deskripsi:</strong>
                    <p className="mt-2">{selectedIssue.description}</p>
                  </div>
                  <div className="mb-3">
                    <strong>Rekomendasi:</strong>
                    <div className={`alert alert-info mt-2 ${theme === 'dark' ? 'bg-dark' : ''}`}>
                      {selectedIssue.recommendation}
                    </div>
                  </div>
                </div>
                <div className="modal-footer">
                  <button
                    type="button"
                    className="btn btn-secondary"
                    onClick={() => setShowIssueDetail(false)}
                  >
                    Tutup
                  </button>
                  {selectedIssue.status === 'open' && (
                    <>
                      <button
                        type="button"
                        className="btn btn-warning"
                        onClick={() => {
                          handleUpdateIssueStatus(selectedIssue.id, 'in-progress');
                          setShowIssueDetail(false);
                        }}
                      >
                        Mulai Pengerjaan
                      </button>
                      <button
                        type="button"
                        className="btn btn-success"
                        onClick={() => {
                          handleUpdateIssueStatus(selectedIssue.id, 'fixed');
                          setShowIssueDetail(false);
                        }}
                      >
                        Tandai Diperbaiki
                      </button>
                    </>
                  )}
                  {selectedIssue.status === 'in-progress' && (
                    <button
                      type="button"
                      className="btn btn-success"
                      onClick={() => {
                        handleUpdateIssueStatus(selectedIssue.id, 'fixed');
                        setShowIssueDetail(false);
                      }}
                    >
                      Tandai Diperbaiki
                    </button>
                  )}
                  <button
                    type="button"
                    className="btn btn-outline-warning"
                    onClick={() => {
                      handleUpdateIssueStatus(selectedIssue.id, 'false-positive');
                      setShowIssueDetail(false);
                    }}
                  >
                    Tandai Positif Palsu
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </ProtectedRoute>
  );
};

export default memo(SEOMonitoringDashboard);
