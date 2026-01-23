'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { useTheme } from '@/contexts/ThemeContext';
import { 
  personalizationEngine, 
  behaviorTracker,
  segmentationEngine 
} from '@/utils/personalization';
import type {
  PersonalizationRule,
  ContentVariant,
  RuleCondition,
  UserSegment,
  ContentType,
  PersonalizationTrigger,
  UserProfile,
} from '@/types/personalization';

const SEGMENT_LABELS: Record<UserSegment, string> = {
  new_visitor: 'Pengunjung Baru',
  returning_visitor: 'Pengunjung Kembali',
  frequent_reader: 'Pembaca Sering',
  content_creator: 'Pembuat Konten',
  engaged_user: 'Pengguna Terlibat',
  dormant_user: 'Pengguna Tidak Aktif',
};

const CONTENT_TYPE_LABELS: Record<ContentType, string> = {
  blog_post: 'Artikel Blog',
  service: 'Layanan',
  page: 'Halaman',
  custom: 'Kustom',
};

const TRIGGER_LABELS: Record<PersonalizationTrigger, string> = {
  on_page_load: 'Saat Halaman Dimuat',
  on_scroll: 'Saat Menggulir',
  on_click: 'Saat Klik',
  time_on_page: 'Waktu di Halaman',
  session_start: 'Awal Sesi',
};

export default function PersonalizationDashboard() {
  const router = useRouter();
  const { theme } = useTheme();
  const [rules, setRules] = useState<PersonalizationRule[]>([]);
  const [variants, setVariants] = useState<ContentVariant[]>([]);
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
  const [selectedRule, setSelectedRule] = useState<PersonalizationRule | null>(null);
  const [showModal, setShowModal] = useState(false);
  const [activeTab, setActiveTab] = useState<'rules' | 'analytics' | 'preview'>('rules');
  const [previewSegment, setPreviewSegment] = useState<UserSegment>('new_visitor');

  useEffect(() => {
    const loadData = () => {
      setRules(personalizationEngine.getAllRules());
      setVariants(personalizationEngine.getVariantsForContent(''));
      setUserProfile(behaviorTracker.getUserProfile());
    };

    loadData();
    const interval = setInterval(loadData, 5000);
    return () => clearInterval(interval);
  }, []);

  const handleCreateRule = useCallback(() => {
    const newRule = personalizationEngine.createRule({
      name: 'Aturan Personalisasi Baru',
      description: 'Deskripsi aturan',
      segment: 'new_visitor',
      trigger: 'on_page_load',
      contentType: 'blog_post',
      variants: [],
      isActive: true,
      priority: 1,
      conditions: [],
    });
    setRules([...rules, newRule]);
    setSelectedRule(newRule);
    setShowModal(true);
  }, [rules]);

  const handleUpdateRule = useCallback((ruleId: string, updates: Partial<PersonalizationRule>) => {
    const updated = personalizationEngine.updateRule(ruleId, updates);
    if (updated) {
      setRules(rules.map(r => r.id === ruleId ? updated : r));
      if (selectedRule?.id === ruleId) {
        setSelectedRule(updated);
      }
    }
  }, [rules, selectedRule]);

  const handleDeleteRule = useCallback((ruleId: string) => {
    if (confirm('Apakah Anda yakin ingin menghapus aturan ini?')) {
      personalizationEngine.deleteRule(ruleId);
      setRules(rules.filter(r => r.id !== ruleId));
      if (selectedRule?.id === ruleId) {
        setSelectedRule(null);
      }
    }
  }, [rules, selectedRule]);

  const handleToggleRule = useCallback((ruleId: string) => {
    const rule = rules.find(r => r.id === ruleId);
    if (rule) {
      handleUpdateRule(ruleId, { isActive: !rule.isActive });
    }
  }, [rules, handleUpdateRule]);

  const analytics = personalizationEngine.getAnalytics();

  const handlePersonalizePreview = useCallback(() => {
    const personalized = personalizationEngine.personalizeContent(
      'post_1',
      previewSegment,
      'blog_post',
      {}
    );
    alert(personalized ? JSON.stringify(personalized, null, 2) : 'Tidak ada konten yang dipersonalisasi untuk segmen ini');
  }, [previewSegment]);

  const handleOptOut = useCallback((optedOut: boolean) => {
    behaviorTracker.setOptOut(optedOut);
    setUserProfile(behaviorTracker.getUserProfile());
  }, []);

  return (
    <div className={`min-vh-100 py-4 ${theme === 'dark' ? 'bg-dark text-light' : 'bg-light text-dark'}`}>
      <div className="container">
        <div className="d-flex justify-content-between align-items-center mb-4">
          <h1>Personalisasi Konten</h1>
          <div>
            {activeTab === 'rules' && (
              <button
                className="btn btn-primary"
                onClick={handleCreateRule}
              >
                + Aturan Baru
              </button>
            )}
          </div>
        </div>

        <div className="mb-4">
          <div className="btn-group">
            <button
              className={`btn ${activeTab === 'rules' ? 'btn-primary' : 'btn-outline-primary'}`}
              onClick={() => setActiveTab('rules')}
            >
              Aturan
            </button>
            <button
              className={`btn ${activeTab === 'analytics' ? 'btn-primary' : 'btn-outline-primary'}`}
              onClick={() => setActiveTab('analytics')}
            >
              Analitik
            </button>
            <button
              className={`btn ${activeTab === 'preview' ? 'btn-primary' : 'btn-outline-primary'}`}
              onClick={() => setActiveTab('preview')}
            >
              Pratinjau
            </button>
          </div>
        </div>

        {activeTab === 'rules' && (
          <div className="row">
            <div className="col-md-8">
              <div className={`card ${theme === 'dark' ? 'bg-secondary text-light' : ''}`}>
                <div className="card-body">
                  <h5 className="card-title mb-3">Aturan Personalisasi</h5>
                  {rules.length === 0 ? (
                    <p className="text-muted">Belum ada aturan personalisasi</p>
                  ) : (
                    <div className="list-group">
                      {rules.sort((a, b) => b.priority - a.priority).map(rule => (
                        <div
                          key={rule.id}
                          className={`list-group-item ${theme === 'dark' ? 'bg-dark border-secondary' : ''} ${selectedRule?.id === rule.id ? 'active' : ''}`}
                          onClick={() => setSelectedRule(rule)}
                        >
                          <div className="d-flex justify-content-between align-items-start">
                            <div>
                              <h6 className="mb-1">{rule.name}</h6>
                              <small className="text-muted">{rule.description}</small>
                              <div className="mt-2">
                                <span className="badge bg-info me-2">
                                  {SEGMENT_LABELS[rule.segment]}
                                </span>
                                <span className="badge bg-secondary">
                                  {CONTENT_TYPE_LABELS[rule.contentType]}
                                </span>
                              </div>
                            </div>
                            <div className="d-flex gap-2">
                              <button
                                className={`btn btn-sm ${rule.isActive ? 'btn-success' : 'btn-outline-secondary'}`}
                                onClick={(e) => {
                                  e.stopPropagation();
                                  handleToggleRule(rule.id);
                                }}
                              >
                                {rule.isActive ? 'Aktif' : 'Nonaktif'}
                              </button>
                              <button
                                className="btn btn-sm btn-outline-danger"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  handleDeleteRule(rule.id);
                                }}
                              >
                                Hapus
                              </button>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            </div>
            <div className="col-md-4">
              <div className={`card ${theme === 'dark' ? 'bg-secondary text-light' : ''} mb-3`}>
                <div className="card-body">
                  <h5 className="card-title">Status Personalisasi</h5>
                  <div className="form-check form-switch mb-3">
                    <input
                      className="form-check-input"
                      type="checkbox"
                      id="personalizationEnabled"
                      checked={personalizationEngine.isEnabled()}
                      onChange={(e) => personalizationEngine.setEnabled(e.target.checked)}
                    />
                    <label className="form-check-label" htmlFor="personalizationEnabled">
                      Personalisasi Diaktifkan
                    </label>
                  </div>
                  <hr />
                  {userProfile && (
                    <div>
                      <h6>Profil Pengguna Saat Ini</h6>
                      <p><strong>Segmen:</strong> {SEGMENT_LABELS[userProfile.segment]}</p>
                      <p><strong>Skor Keterlibatan:</strong> {userProfile.engagementScore}</p>
                      <p><strong>Preferensi:</strong></p>
                      <ul>
                        <li>Personalisasi: {userProfile.preferences.allowPersonalization ? 'Diizinkan' : 'Ditolak'}</li>
                        <li>Tracking: {userProfile.preferences.allowTracking ? 'Diizinkan' : 'Ditolak'}</li>
                      </ul>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'analytics' && (
          <div className="row">
            <div className="col-md-3 mb-3">
              <div className={`card ${theme === 'dark' ? 'bg-secondary text-light' : 'text-center'}`}>
                <div className="card-body">
                  <h3 className="text-primary">{analytics.totalRules}</h3>
                  <p className="mb-0">Total Aturan</p>
                </div>
              </div>
            </div>
            <div className="col-md-3 mb-3">
              <div className={`card ${theme === 'dark' ? 'bg-secondary text-light' : 'text-center'}`}>
                <div className="card-body">
                  <h3 className="text-success">{analytics.activeRules}</h3>
                  <p className="mb-0">Aturan Aktif</p>
                </div>
              </div>
            </div>
            <div className="col-md-3 mb-3">
              <div className={`card ${theme === 'dark' ? 'bg-secondary text-light' : 'text-center'}`}>
                <div className="card-body">
                  <h3 className="text-info">{analytics.totalImpressions}</h3>
                  <p className="mb-0">Total Tayangan</p>
                </div>
              </div>
            </div>
            <div className="col-md-3 mb-3">
              <div className={`card ${theme === 'dark' ? 'bg-secondary text-light' : 'text-center'}`}>
                <div className="card-body">
                  <h3 className="text-warning">{analytics.overallLift.toFixed(1)}%</h3>
                  <p className="mb-0">Lift Keseluruhan</p>
                </div>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'preview' && (
          <div className={`card ${theme === 'dark' ? 'bg-secondary text-light' : ''}`}>
            <div className="card-body">
              <h5 className="card-title mb-3">Pratinjau Personalisasi</h5>
              <div className="mb-3">
                <label className="form-label">Lihat sebagai Segmen:</label>
                <select
                  className="form-select"
                  value={previewSegment}
                  onChange={(e) => setPreviewSegment(e.target.value as UserSegment)}
                >
                  {Object.entries(SEGMENT_LABELS).map(([key, label]) => (
                    <option key={key} value={key}>
                      {label}
                    </option>
                  ))}
                </select>
              </div>
              <button
                className="btn btn-primary"
                onClick={handlePersonalizePreview}
              >
                Uji Personalisasi
              </button>
              <hr />
              <h6>Aturan Personalisasi untuk Segmen Ini:</h6>
              {rules.filter(r => r.segment === previewSegment).length === 0 ? (
                <p className="text-muted">Tidak ada aturan untuk segmen ini</p>
              ) : (
                <ul>
                  {rules.filter(r => r.segment === previewSegment).map(rule => (
                    <li key={rule.id}>
                      <strong>{rule.name}</strong> - {rule.description}
                    </li>
                  ))}
                </ul>
              )}
            </div>
          </div>
        )}

        {selectedRule && showModal && (
          <div className="modal show" style={{ display: 'block' }}>
            <div className="modal-dialog modal-lg">
              <div className={`modal-content ${theme === 'dark' ? 'bg-dark text-light' : ''}`}>
                <div className="modal-header">
                  <h5 className="modal-title">
                    {rules.find(r => r.id === selectedRule.id)?.name || 'Edit Aturan'}
                  </h5>
                  <button
                    type="button"
                    className="btn-close"
                    onClick={() => {
                      setShowModal(false);
                      setSelectedRule(null);
                    }}
                  />
                </div>
                <div className="modal-body">
                  <form>
                    <div className="mb-3">
                      <label className="form-label">Nama Aturan</label>
                      <input
                        type="text"
                        className="form-control"
                        value={selectedRule.name}
                        onChange={(e) => handleUpdateRule(selectedRule.id, { name: e.target.value })}
                      />
                    </div>
                    <div className="mb-3">
                      <label className="form-label">Deskripsi</label>
                      <textarea
                        className="form-control"
                        value={selectedRule.description}
                        onChange={(e) => handleUpdateRule(selectedRule.id, { description: e.target.value })}
                      />
                    </div>
                    <div className="mb-3">
                      <label className="form-label">Segmen</label>
                      <select
                        className="form-select"
                        value={selectedRule.segment}
                        onChange={(e) => handleUpdateRule(selectedRule.id, { segment: e.target.value as UserSegment })}
                      >
                        {Object.entries(SEGMENT_LABELS).map(([key, label]) => (
                          <option key={key} value={key}>
                            {label}
                          </option>
                        ))}
                      </select>
                    </div>
                    <div className="mb-3">
                      <label className="form-label">Trigger</label>
                      <select
                        className="form-select"
                        value={selectedRule.trigger}
                        onChange={(e) => handleUpdateRule(selectedRule.id, { trigger: e.target.value as PersonalizationTrigger })}
                      >
                        {Object.entries(TRIGGER_LABELS).map(([key, label]) => (
                          <option key={key} value={key}>
                            {label}
                          </option>
                        ))}
                      </select>
                    </div>
                    <div className="mb-3">
                      <label className="form-label">Prioritas</label>
                      <input
                        type="number"
                        className="form-control"
                        value={selectedRule.priority}
                        onChange={(e) => handleUpdateRule(selectedRule.id, { priority: parseInt(e.target.value) })}
                      />
                      <small className="text-muted">
        Aturan dengan prioritas lebih tinggi akan dievaluasi terlebih dahulu
      </small>
                    </div>
                  </form>
                </div>
                <div className="modal-footer">
                  <button
                    type="button"
                    className="btn btn-secondary"
                    onClick={() => {
                      setShowModal(false);
                      setSelectedRule(null);
                    }}
                  >
                    Batal
                  </button>
                  <button
                    type="button"
                    className="btn btn-primary"
                    onClick={() => {
                      setShowModal(false);
                      setSelectedRule(null);
                    }}
                  >
                    Simpan
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
