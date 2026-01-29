/**
 * Template Browser Component
 *
 * Allows users to browse, filter, and apply personalization rule templates.
 */

'use client';

import React, { useState, useMemo, useCallback, memo } from 'react';
import { useTheme } from '@/contexts/ThemeContext';
import {
  personalizationTemplates,
  getTemplatesByCategory,
  getTemplatesByDifficulty,
  searchTemplates,
  getRecommendedTemplates,
  type PersonalizationTemplate,
  type TemplateCategory
} from '@/utils/personalization';
import { getTemplateMetricsById, getTopPerformingTemplates, getMostUsedTemplates } from '@/utils/personalization/templateStorage';

const CATEGORIES: Array<{ value: TemplateCategory | 'all'; label: string }> = [
  { value: 'all', label: 'Semua' },
  { value: 'segment-based', label: 'Berdasarkan Segmen' },
  { value: 'behavioral', label: 'Perilaku' },
  { value: 'engagement-based', label: 'Keterlibatan' },
  { value: 'time-based', label: 'Waktu' },
  { value: 'content-type', label: 'Tipe Konten' },
  { value: 'geographic', label: 'Geografis' }
];

const DIFFICULTIES: Array<{ value: 'all' | 'beginner' | 'intermediate' | 'advanced'; label: string }> = [
  { value: 'all', label: 'Semua Tingkat' },
  { value: 'beginner', label: 'Pemula' },
  { value: 'intermediate', label: 'Menengah' },
  { value: 'advanced', label: 'Lanjutan' }
];

const getDifficultyColor = (difficulty: string, isDark: boolean): string => {
  switch (difficulty) {
    case 'beginner':
      return isDark ? 'text-green-400' : 'text-green-600';
    case 'intermediate':
      return isDark ? 'text-yellow-400' : 'text-yellow-600';
    case 'advanced':
      return isDark ? 'text-red-400' : 'text-red-600';
    default:
      return isDark ? 'text-gray-400' : 'text-gray-600';
  }
};

const getImpactColor = (impact: string, isDark: boolean): string => {
  switch (impact) {
    case 'high':
      return isDark ? 'bg-green-500' : 'bg-green-600';
    case 'medium':
      return isDark ? 'bg-yellow-500' : 'bg-yellow-600';
    case 'low':
      return isDark ? 'bg-red-500' : 'bg-red-600';
    default:
      return isDark ? 'bg-gray-500' : 'bg-gray-600';
  }
};

interface TemplateBrowserProps {
  userSegment?: string;
  onApplyTemplate: (template: PersonalizationTemplate) => void;
}

const TemplateBrowserInternal = ({ userSegment, onApplyTemplate }: TemplateBrowserProps) => {
  const { theme } = useTheme();
  const isDark = theme === 'dark';
  const [selectedCategory, setSelectedCategory] = useState<TemplateCategory | 'all'>('all');
  const [selectedDifficulty, setSelectedDifficulty] = useState<'all' | 'beginner' | 'intermediate' | 'advanced'>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedTemplate, setSelectedTemplate] = useState<PersonalizationTemplate | null>(null);

  const topPerforming = useMemo(() => getTopPerformingTemplates(3), []);
  const mostUsed = useMemo(() => getMostUsedTemplates(3), []);

  const filteredTemplates = useMemo(() => {
    let templates = personalizationTemplates;

    if (selectedCategory !== 'all') {
      templates = getTemplatesByCategory(selectedCategory);
    }

    if (selectedDifficulty !== 'all') {
      templates = getTemplatesByDifficulty(selectedDifficulty);
    }

    if (searchQuery.trim() !== '') {
      templates = searchTemplates(searchQuery);
    }

    return templates;
  }, [selectedCategory, selectedDifficulty, searchQuery]);

  const recommendedTemplates = useMemo(() => {
    if (userSegment) {
      return getRecommendedTemplates(userSegment);
    }
    return [];
  }, [userSegment]);

  const templateMetrics = useMemo(() => {
    const metricsMap = new Map<string, ReturnType<typeof getTemplateMetricsById>>();
    filteredTemplates.forEach((template: PersonalizationTemplate) => {
      metricsMap.set(template.id, getTemplateMetricsById(template.id));
    });
    return metricsMap;
  }, [filteredTemplates]);

  const handleApplyTemplate = useCallback((template: PersonalizationTemplate) => {
    setSelectedTemplate(template);
    onApplyTemplate(template);
  }, [onApplyTemplate]);

  const handleClearFilters = useCallback(() => {
    setSelectedCategory('all');
    setSelectedDifficulty('all');
    setSearchQuery('');
  }, []);

  const handleSelectTemplate = useCallback((template: PersonalizationTemplate) => {
    setSelectedTemplate(template);
  }, []);

  const handleCloseModal = useCallback(() => {
    setSelectedTemplate(null);
  }, []);

  return (
    <div className="template-browser">
      {/* Header */}
      <div className="template-browser-header">
        <h2 className="template-browser-title">Pustaka Template Personalisasi</h2>
        <p className="template-browser-subtitle">
          Jelajahi dan terapkan template aturan personalisasi yang sudah siap digunakan
        </p>
      </div>

      {/* Quick Stats */}
      {topPerforming.length > 0 && (
        <div className="template-quick-stats">
          <div className="stat-card">
            <div className="stat-value">{topPerforming.length}</div>
            <div className="stat-label">Template Terbaik</div>
          </div>
          <div className="stat-card">
            <div className="stat-value">{mostUsed.length}</div>
            <div className="stat-label">Paling Sering Digunakan</div>
          </div>
          <div className="stat-card">
            <div className="stat-value">{personalizationTemplates.length}</div>
            <div className="stat-label">Total Template</div>
          </div>
        </div>
      )}

      {/* Recommended Templates */}
      {recommendedTemplates.length > 0 && (
        <div className="recommended-section">
          <h3 className="section-title">Direkomendasikan untuk Segmen Anda</h3>
          <div className="template-grid recommended">
            {recommendedTemplates.slice(0, 3).map((template: PersonalizationTemplate) => {
              const metrics = templateMetrics.get(template.id);
              return (
                <div
                  key={template.id}
                  className="template-card recommended"
                  onClick={() => handleSelectTemplate(template)}
                >
                  <div className="template-card-header">
                    <div className="template-name">{template.name}</div>
                    <div className={`template-difficulty ${getDifficultyColor(template.difficulty, isDark)}`}>
                      {template.difficulty}
                    </div>
                  </div>
                  <p className="template-description">{template.description}</p>
                  <div className="template-tags">
                    {template.metadata.tags.slice(0, 3).map((tag: string) => (
                      <span key={tag} className="template-tag">
                        {tag}
                      </span>
                    ))}
                  </div>
                  <div className="template-metrics">
                    <span className="metric">
                      {metrics?.timesUsed || 0}x digunakan
                    </span>
                    <span className="metric">
                      Est. lift: +{template.metadata.estimatedLift}%
                    </span>
                  </div>
                  <button
                    className="template-apply-button"
                    onClick={(e) => {
                      e.stopPropagation();
                      handleApplyTemplate(template);
                    }}
                  >
                    Terapkan Template
                  </button>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Filters */}
      <div className="template-filters">
        <div className="filter-group">
          <label htmlFor="category-filter">Kategori</label>
          <select
            id="category-filter"
            value={selectedCategory}
            onChange={(e) => setSelectedCategory(e.target.value as TemplateCategory | 'all')}
            className="filter-select"
          >
            {CATEGORIES.map((category) => (
              <option key={category.value} value={category.value}>
                {category.label}
              </option>
            ))}
          </select>
        </div>

        <div className="filter-group">
          <label htmlFor="difficulty-filter">Tingkat Kesulitan</label>
          <select
            id="difficulty-filter"
            value={selectedDifficulty}
            onChange={(e) => setSelectedDifficulty(e.target.value as 'all' | 'beginner' | 'intermediate' | 'advanced')}
            className="filter-select"
          >
            {DIFFICULTIES.map((difficulty) => (
              <option key={difficulty.value} value={difficulty.value}>
                {difficulty.label}
              </option>
            ))}
          </select>
        </div>

        <div className="filter-group search-group">
          <label htmlFor="search-input">Cari Template</label>
          <input
            type="text"
            id="search-input"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Cari template..."
            className="search-input"
          />
        </div>
      </div>

      {/* Template Grid */}
      <div className="template-grid">
        {filteredTemplates.map((template: PersonalizationTemplate) => {
          const metrics = templateMetrics.get(template.id);
          const isRecommended = recommendedTemplates.some((t: PersonalizationTemplate) => t.id === template.id);
          return (
            <div
              key={template.id}
              className={`template-card ${isRecommended ? 'recommended' : ''}`}
              onClick={() => handleSelectTemplate(template)}
            >
              <div className="template-card-header">
                <div className="template-name">
                  {template.name}
                  {isRecommended && <span className="recommended-badge">Direkomendasikan</span>}
                </div>
                <div className={`template-difficulty ${getDifficultyColor(template.difficulty, isDark)}`}>
                  {template.difficulty}
                </div>
              </div>
              <p className="template-description">{template.description}</p>

              <div className="template-metadata">
                <div className="metadata-item">
                  <span className="metadata-label">Kategori:</span>
                  <span className="metadata-value">{template.category}</span>
                </div>
                <div className="metadata-item">
                  <span className="metadata-label">Dampak:</span>
                  <div className={`impact-badge ${getImpactColor(template.metadata.estimatedImpact, isDark)}`}>
                    {template.metadata.estimatedImpact}
                  </div>
                </div>
                <div className="metadata-item">
                  <span className="metadata-label">Est. Lift:</span>
                  <span className="metadata-value">+{template.metadata.estimatedLift}%</span>
                </div>
              </div>

              <div className="template-tags">
                {template.metadata.tags.slice(0, 4).map((tag) => (
                  <span key={tag} className="template-tag">
                    {tag}
                  </span>
                ))}
              </div>

              {metrics && (
                <div className="template-metrics">
                  <span className="metric">
                    {metrics.timesUsed}x digunakan
                  </span>
                  {metrics.avgLift > 0 && (
                    <span className="metric">
                      Avg lift: +{Math.round(metrics.avgLift)}%
                    </span>
                  )}
                  {metrics.rating > 0 && (
                    <span className="metric">
                      Rating: {metrics.rating.toFixed(1)}/5.0
                    </span>
                  )}
                </div>
              )}

              <button
                className="template-apply-button"
                onClick={(e) => {
                  e.stopPropagation();
                  handleApplyTemplate(template);
                }}
              >
                Terapkan Template
              </button>
            </div>
          );
        })}
      </div>

      {/* No Results */}
      {filteredTemplates.length === 0 && (
        <div className="no-results">
          <p>Tidak ada template yang ditemukan</p>
          <button
            className="clear-filters-button"
            onClick={handleClearFilters}
          >
            Hapus Filter
          </button>
        </div>
      )}

      {/* Template Detail Modal */}
      {selectedTemplate && (
        <MemoizedTemplateDetailModal
          template={selectedTemplate}
          metrics={templateMetrics.get(selectedTemplate.id)}
          onClose={handleCloseModal}
          onApply={handleApplyTemplate}
        />
      )}
    </div>
  );
};

export const TemplateBrowser = memo(TemplateBrowserInternal);

interface TemplateDetailModalProps {
  template: PersonalizationTemplate;
  metrics?: { timesUsed: number; avgLift: number; rating: number };
  onClose: () => void;
  onApply: (template: PersonalizationTemplate) => void;
}

function TemplateDetailModal({ template, metrics, onClose, onApply }: TemplateDetailModalProps) {
  const [notes, setNotes] = useState('');
  const [customize, setCustomize] = useState({
    conditions: false,
    variants: false,
    priority: false
  });
  const [activateImmediately, setActivateImmediately] = useState(true);

  const handleApply = () => {
    onApply(template);
    onClose();
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content template-detail-modal" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h2 className="modal-title">{template.name}</h2>
          <button className="modal-close-button" onClick={onClose}>
            ×
          </button>
        </div>

        <div className="modal-body">
          <p className="template-full-description">{template.description}</p>

          <div className="detail-section">
            <h3 className="detail-section-title">Ringkasan Template</h3>
            <div className="detail-grid">
              <div className="detail-item">
                <span className="detail-label">Kategori</span>
                <span className="detail-value">{template.category}</span>
              </div>
              <div className="detail-item">
                <span className="detail-label">Tingkat Kesulitan</span>
                <span className="detail-value">{template.difficulty}</span>
              </div>
              <div className="detail-item">
                <span className="detail-label">Estimasi Dampak</span>
                <span className="detail-value">{template.metadata.estimatedImpact}</span>
              </div>
              <div className="detail-item">
                <span className="detail-label">Estimasi Lift</span>
                <span className="detail-value">+{template.metadata.estimatedLift}%</span>
              </div>
            </div>
          </div>

          <div className="detail-section">
            <h3 className="detail-section-title">Tag</h3>
            <div className="detail-tags">
              {template.metadata.tags.map((tag) => (
                <span key={tag} className="detail-tag">
                  {tag}
                </span>
              ))}
            </div>
          </div>

          <div className="detail-section">
            <h3 className="detail-section-title">Segmen Target</h3>
            <div className="detail-segments">
              {template.metadata.targetSegments.map((segment) => (
                <span key={segment} className="detail-segment">
                  {segment}
                </span>
              ))}
            </div>
          </div>

          <div className="detail-section">
            <h3 className="detail-section-title">Kasus Penggunaan</h3>
            <ul className="detail-use-cases">
              {template.metadata.useCases.map((useCase, index) => (
                <li key={index}>{useCase}</li>
              ))}
            </ul>
          </div>

          {template.metadata.prerequisites.length > 0 && (
            <div className="detail-section">
              <h3 className="detail-section-title">Prasyarat</h3>
              <ul className="detail-prerequisites">
                {template.metadata.prerequisites.map((prereq, index) => (
                  <li key={index}>{prereq}</li>
                ))}
              </ul>
            </div>
          )}

          {metrics && (
            <div className="detail-section">
              <h3 className="detail-section-title">Metrik Template</h3>
              <div className="detail-metrics">
                <div className="detail-metric">
                  <span className="detail-metric-value">{metrics.timesUsed}</span>
                  <span className="detail-metric-label">Kali Digunakan</span>
                </div>
                {metrics.avgLift > 0 && (
                  <div className="detail-metric">
                    <span className="detail-metric-value">+{Math.round(metrics.avgLift)}%</span>
                    <span className="detail-metric-label">Rata-rata Lift</span>
                  </div>
                )}
                {metrics.rating > 0 && (
                  <div className="detail-metric">
                    <span className="detail-metric-value">{metrics.rating.toFixed(1)}/5.0</span>
                    <span className="detail-metric-label">Rating</span>
                  </div>
                )}
              </div>
            </div>
          )}

          <div className="detail-section">
            <h3 className="detail-section-title">Varian Konten</h3>
            <div className="detail-variants">
              {template.variants.map((variant) => (
                <div key={variant.id} className="detail-variant">
                  <div className="variant-header">
                    <span className="variant-name">{variant.variantName}</span>
                    <span className="variant-weight">{variant.weight}%</span>
                  </div>
                  {typeof variant.content === 'object' && 'headline' in variant.content && (
                    <p className="variant-description">{String(variant.content.headline)}</p>
                  )}
                </div>
              ))}
            </div>
          </div>

          <div className="detail-section application-options">
            <h3 className="detail-section-title">Opsi Penerapan</h3>
            
            <label className="checkbox-label">
              <input
                type="checkbox"
                checked={customize.conditions}
                onChange={(e) => setCustomize({ ...customize, conditions: e.target.checked })}
              />
              <span>Kustomisasi Kondisi</span>
            </label>

            <label className="checkbox-label">
              <input
                type="checkbox"
                checked={customize.variants}
                onChange={(e) => setCustomize({ ...customize, variants: e.target.checked })}
              />
              <span>Kustomisasi Varian</span>
            </label>

            <label className="checkbox-label">
              <input
                type="checkbox"
                checked={customize.priority}
                onChange={(e) => setCustomize({ ...customize, priority: e.target.checked })}
              />
              <span>Kustomisasi Prioritas</span>
            </label>

            <label className="checkbox-label">
              <input
                type="checkbox"
                checked={activateImmediately}
                onChange={(e) => setActivateImmediately(e.target.checked)}
              />
              <span>Aktifkan Segera</span>
            </label>

            <div className="notes-input-group">
              <label htmlFor="template-notes">Catatan</label>
              <textarea
                id="template-notes"
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder="Tambahkan catatan tentang penerapan template ini..."
                rows={3}
              />
            </div>
          </div>
        </div>

        <div className="modal-footer">
          <button className="button button-secondary" onClick={onClose}>
            Batal
          </button>
          <button className="button button-primary" onClick={handleApply}>
            Terapkan Template
          </button>
        </div>
      </div>
    </div>
  );
};

const MemoizedTemplateDetailModal = memo(TemplateDetailModal);