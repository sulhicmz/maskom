'use client';

import { memo } from 'react';
import type { SkipCategory, SkipCategoryStats } from '@/types/testDiagnostics';

interface CategoryBreakdownProps {
  categoryStats: SkipCategoryStats[];
  getCategoryColor: (category: SkipCategory) => string;
}

const CategoryBreakdown = ({ categoryStats, getCategoryColor }: CategoryBreakdownProps) => {
  return (
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
  );
};

export default memo(CategoryBreakdown);
