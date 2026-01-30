'use client';

import { memo } from 'react';
import type { SkipCategory, SkipSeverity } from '@/types/testDiagnostics';

interface FilterSectionProps {
  selectedCategory: SkipCategory | 'all';
  selectedSeverity: SkipSeverity | 'all';
  searchTerm: string;
  onCategoryChange: (category: SkipCategory | 'all') => void;
  onSeverityChange: (severity: SkipSeverity | 'all') => void;
  onSearchTermChange: (term: string) => void;
}

const FilterSection = ({
  selectedCategory,
  selectedSeverity,
  searchTerm,
  onCategoryChange,
  onSeverityChange,
  onSearchTermChange,
}: FilterSectionProps) => {
  return (
    <div className="card shadow-sm mb-4">
      <div className="card-body">
        <div className="row g-3">
          <div className="col-md-4">
            <label className="form-label">Kategori</label>
            <select
              className="form-select"
              value={selectedCategory}
              onChange={(e) => onCategoryChange(e.target.value as SkipCategory | 'all')}
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
              onChange={(e) => onSeverityChange(e.target.value as SkipSeverity | 'all')}
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
                onChange={(e) => onSearchTermChange(e.target.value)}
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default memo(FilterSection);
