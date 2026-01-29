'use client';

import React, { useState, useCallback, memo } from 'react';
import { useTheme } from '@/contexts/ThemeContext';
import { personalizationEngine } from '@/utils/personalization';
import type {
  PersonalizationRule,
  UserSegment,
  ContentType,
  PreviewDeviceType,
  PreviewValidationResult,
  PreviewHistory,
} from '@/types/personalization';

const SEGMENT_LABELS: Record<UserSegment, string> = {
  new_visitor: 'Pengunjung Baru',
  returning_visitor: 'Pengunjung Kembali',
  frequent_reader: 'Pembaca Sering',
  content_creator: 'Pembuat Konten',
  engaged_user: 'Pengguna Terlibat',
  dormant_user: 'Pengguna Tidak Aktif',
};

const DEVICE_LABELS: Record<PreviewDeviceType, string> = {
  desktop: 'Desktop',
  tablet: 'Tablet',
  mobile: 'Ponsel',
};

const DEVICE_WIDTHS: Record<PreviewDeviceType, number> = {
  desktop: 1200,
  tablet: 768,
  mobile: 375,
};

interface PersonalizationPreviewProps {
  rules: PersonalizationRule[];
  userProfileSegment?: UserSegment;
}

const PersonalizationPreview: React.FC<PersonalizationPreviewProps> = memo(({ rules, userProfileSegment }: PersonalizationPreviewProps) => {
  const { theme } = useTheme();
  const [previewSegment, setPreviewSegment] = useState<UserSegment>(userProfileSegment || 'new_visitor');
  const [previewDevice, setPreviewDevice] = useState<PreviewDeviceType>('desktop');
  const [selectedRule, setSelectedRule] = useState<PersonalizationRule | null>(null);
  const [personalizedContent, setPersonalizedContent] = useState<Record<string, unknown> | null>(null);
  const [validationResults, setValidationResults] = useState<PreviewValidationResult | null>(null);
  const [previewHistory, setPreviewHistory] = useState<PreviewHistory[]>([]);
  const [showPreviewURL, setShowPreviewURL] = useState(false);

  const validateRule = useCallback((rule: PersonalizationRule): PreviewValidationResult => {
    const errors: Array<{ field: string; message: string; code: string }> = [];
    const warnings: Array<{ field: string; message: string; code: string }> = [];

    if (!rule.name || rule.name.trim() === '') {
      errors.push({ field: 'name', message: 'Nama aturan wajib diisi', code: 'REQUIRED_FIELD' });
    }

    if (!rule.segment) {
      errors.push({ field: 'segment', message: 'Segmen wajib dipilih', code: 'REQUIRED_FIELD' });
    }

    if (!rule.contentType) {
      errors.push({ field: 'contentType', message: 'Tipe konten wajib dipilih', code: 'REQUIRED_FIELD' });
    }

    if (!rule.trigger) {
      errors.push({ field: 'trigger', message: 'Trigger wajib dipilih', code: 'REQUIRED_FIELD' });
    }

    if (rule.variants.length === 0) {
      errors.push({ field: 'variants', message: 'Minimal satu varian konten diperlukan', code: 'REQUIRED_FIELD' });
    }

    if (rule.variants.length > 0 && rule.variants.every(v => !v.isActive)) {
      errors.push({ field: 'variants', message: 'Minimal satu varian harus aktif', code: 'NO_ACTIVE_VARIANT' });
    }

    if (rule.conditions.length > 10) {
      warnings.push({ field: 'conditions', message: 'Terlalu banyak kondisi mungkin mempengaruhi performa', code: 'TOO_MANY_CONDITIONS' });
    }

    if (rule.priority < 0 || rule.priority > 100) {
      warnings.push({ field: 'priority', message: 'Prioritas sebaiknya antara 0-100', code: 'PRIORITY_OUT_OF_RANGE' });
    }

    return {
      isValid: errors.length === 0,
      errors,
      warnings,
    };
  }, []);

  const handlePreview = useCallback(() => {
    if (!selectedRule) return;

    const validation = validateRule(selectedRule);
    setValidationResults(validation);

    if (!validation.isValid) {
      setPersonalizedContent(null);
      return;
    }

    const personalized = personalizationEngine.personalizeContent(
      'preview_content',
      previewSegment,
      selectedRule.contentType,
      {},
      'preview_user'
    );

    setPersonalizedContent(personalized);

    const historyEntry: PreviewHistory = {
      id: `preview_${Date.now()}`,
      ruleId: selectedRule.id,
      ruleName: selectedRule.name,
      segment: previewSegment,
      device: previewDevice,
      contentType: selectedRule.contentType,
      personalizedContent: personalized,
      timestamp: new Date().toISOString(),
      validationResults: validation,
    };

    const newHistory = [historyEntry, ...previewHistory].slice(0, 50);
    setPreviewHistory(newHistory);
  }, [selectedRule, previewSegment, previewDevice, validateRule, previewHistory]);

  const generatePreviewURL = useCallback(() => {
    const params = new URLSearchParams();
    params.set('rule', selectedRule?.id || '');
    params.set('segment', previewSegment);
    params.set('device', previewDevice);
    const baseURL = typeof window !== 'undefined' ? window.location.origin : '';
    return `${baseURL}/admin/personalization?${params.toString()}`;
  }, [selectedRule, previewSegment, previewDevice]);

  const copyPreviewURL = useCallback(() => {
    const url = generatePreviewURL();
    navigator.clipboard.writeText(url).then(() => {
      alert('URL pratinjau berhasil disalin ke papan klip!');
    }).catch(() => {
      alert('Gagal menyalin URL pratinjau');
    });
  }, [generatePreviewURL]);

  const renderContent = useCallback((content: Record<string, unknown>) => {
    return (
      <div className="preview-content">
        {content.headline && (
          <h2 className="preview-headline mb-3">
            {String(content.headline)}
          </h2>
        )}
        {content.subheadline && (
          <p className="preview-subheadline mb-3 text-muted">
            {String(content.subheadline)}
          </p>
        )}
        {content.imageUrl && (
          <img
            src={String(content.imageUrl)}
            alt="Preview"
            className="preview-image mb-3 img-fluid rounded"
            style={{ maxHeight: '300px', objectFit: 'cover' }}
          />
        )}
        {content.body && (
          <div className="preview-body mb-3">
            {String(content.body).split('\n').map((paragraph, index) => (
              <p key={index} className="mb-2">
                {paragraph}
              </p>
            ))}
          </div>
        )}
        {content.cta && (
          <button className="preview-cta btn btn-primary">
            {String(content.cta)}
          </button>
        )}
        {content.ctaSecondary && (
          <button className="preview-cta-secondary btn btn-outline-primary ms-2">
            {String(content.ctaSecondary)}
          </button>
        )}
      </div>
    );
  }, []);

  const filteredRules = rules.filter(r => r.segment === previewSegment);

  return (
    <div className="personalization-preview">
      <div className="row mb-4">
        <div className="col-md-4">
          <label className="form-label fw-bold">Pilih Segmen:</label>
          <select
            className="form-select mb-2"
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
        <div className="col-md-4">
          <label className="form-label fw-bold">Mode Perangkat:</label>
          <select
            className="form-select mb-2"
            value={previewDevice}
            onChange={(e) => setPreviewDevice(e.target.value as PreviewDeviceType)}
          >
            {Object.entries(DEVICE_LABELS).map(([key, label]) => (
              <option key={key} value={key}>
                {label}
              </option>
            ))}
          </select>
        </div>
        <div className="col-md-4">
          <label className="form-label fw-bold">Pilih Aturan:</label>
          <select
            className="form-select mb-2"
            value={selectedRule?.id || ''}
            onChange={(e) => setSelectedRule(rules.find(r => r.id === e.target.value) || null)}
          >
            <option value="">-- Pilih Aturan --</option>
              {filteredRules.map((rule: PersonalizationRule) => (
                <option key={rule.id} value={rule.id}>
                  {rule.name} {rule.isActive ? '(Aktif)' : '(Nonaktif)'}
                </option>
              ))}
          </select>
        </div>
      </div>

      {selectedRule && (
        <div className="mb-3">
          <div className="btn-group">
            <button
              className="btn btn-primary"
              onClick={handlePreview}
            >
              Pratinjau Konten
            </button>
            {personalizedContent && (
              <button
                className="btn btn-outline-secondary"
                onClick={() => setShowPreviewURL(!showPreviewURL)}
              >
                {showPreviewURL ? 'Sembunyikan URL' : 'Bagikan URL'}
              </button>
            )}
          </div>
        </div>
      )}

      {showPreviewURL && personalizedContent && (
        <div className={`card mb-3 ${theme === 'dark' ? 'bg-secondary text-light' : ''}`}>
          <div className="card-body">
            <h6 className="card-title mb-2">URL Pratinjau</h6>
            <div className="input-group">
              <input
                type="text"
                className="form-control"
                value={generatePreviewURL()}
                readOnly
              />
              <button
                className="btn btn-outline-secondary"
                type="button"
                onClick={copyPreviewURL}
              >
                Salin
              </button>
            </div>
          </div>
        </div>
      )}

      {validationResults && !validationResults.isValid && (
        <div className="alert alert-danger mb-3">
          <h6 className="alert-heading fw-bold">Validasi Gagal</h6>
          <ul className="mb-0">
            {validationResults.errors.map((error, index) => (
              <li key={index}>
                <strong>{error.field}:</strong> {error.message}
              </li>
            ))}
          </ul>
        </div>
      )}

      {validationResults && validationResults.warnings.length > 0 && (
        <div className="alert alert-warning mb-3">
          <h6 className="alert-heading fw-bold">Peringatan Validasi</h6>
          <ul className="mb-0">
            {validationResults.warnings.map((warning, index) => (
              <li key={index}>
                <strong>{warning.field}:</strong> {warning.message}
              </li>
            ))}
          </ul>
        </div>
      )}

      {personalizedContent && (
        <div className="row">
          <div className="col-12">
            <div className={`card ${theme === 'dark' ? 'bg-secondary text-light' : ''}`}>
              <div className="card-header">
                <h5 className="card-title mb-0">
                  Pratinjau Konten - {SEGMENT_LABELS[previewSegment]} ({DEVICE_LABELS[previewDevice]})
                </h5>
              </div>
              <div className="card-body">
                <div
                  className="preview-container mx-auto"
                  style={{
                    width: `${DEVICE_WIDTHS[previewDevice]}px`,
                    minHeight: '400px',
                    border: '2px solid #dee2e6',
                    borderRadius: '8px',
                    padding: '20px',
                    backgroundColor: theme === 'dark' ? '#2c3e50' : '#ffffff',
                  }}
                >
                  {renderContent(personalizedContent)}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {selectedRule && !personalizedContent && validationResults?.isValid && (
        <div className={`card ${theme === 'dark' ? 'bg-secondary text-light' : ''}`}>
          <div className="card-body text-center py-5">
            <p className="text-muted mb-0">
              Pilih aturan dan klik "Pratinjau Konten" untuk melihat konten yang dipersonalisasi
            </p>
          </div>
        </div>
      )}

      {!selectedRule && (
        <div className={`card ${theme === 'dark' ? 'bg-secondary text-light' : ''}`}>
          <div className="card-body text-center py-5">
            <p className="text-muted mb-0">
              Pilih segmen dan aturan untuk memulai pratinjau
            </p>
          </div>
        </div>
      )}

      {previewHistory.length > 0 && (
        <div className={`card mt-4 ${theme === 'dark' ? 'bg-secondary text-light' : ''}`}>
          <div className="card-header">
            <h5 className="card-title mb-0">Riwayat Pratinjau</h5>
          </div>
          <div className="card-body">
            <div className="table-responsive">
              <table className="table table-striped">
                <thead>
                  <tr>
                    <th>Waktu</th>
                    <th>Aturan</th>
                    <th>Segmen</th>
                    <th>Perangkat</th>
                    <th>Status</th>
                  </tr>
                </thead>
                <tbody>
                  {previewHistory.slice(0, 10).map((history) => (
                    <tr key={history.id}>
                      <td>{new Date(history.timestamp).toLocaleString('id-ID')}</td>
                      <td>{history.ruleName}</td>
                      <td>{SEGMENT_LABELS[history.segment]}</td>
                      <td>{DEVICE_LABELS[history.device]}</td>
                      <td>
                        {history.validationResults.isValid ? (
                          <span className="badge bg-success">Valid</span>
                        ) : (
                          <span className="badge bg-danger">Invalid</span>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}
    </div>
  );
});

PersonalizationPreview.displayName = 'PersonalizationPreview';

export default PersonalizationPreview;