'use client';

import React, { memo } from 'react';
import { useTheme } from '@/contexts/ThemeContext';
import type { RuleEffectiveness } from '@/types/personalization';

const SEGMENT_LABELS: Record<string, string> = {
  new_visitor: 'Pengunjung Baru',
  returning_visitor: 'Pengunjung Kembali',
  frequent_reader: 'Pembaca Sering',
  content_creator: 'Pembuat Konten',
  engaged_user: 'Pengguna Terlibat',
  dormant_user: 'Pengguna Tidak Aktif',
};

interface RuleEffectivenessChartProps {
  ruleEffectiveness: RuleEffectiveness[];
  onExport?: (data: RuleEffectiveness[]) => void;
  limit?: number;
}

const RuleEffectivenessChart: React.FC<RuleEffectivenessChartProps> = memo(({ ruleEffectiveness, onExport, limit = 10 }) => {
  const { theme } = useTheme();
  const displayRules = ruleEffectiveness.slice(0, limit);

  const getEffectivenessColor = (score: number) => {
    if (score >= 80) return 'success';
    if (score >= 60) return 'info';
    if (score >= 40) return 'warning';
    return 'danger';
  };

  const getTrendIcon = (trend: 'up' | 'down' | 'stable') => {
    switch (trend) {
      case 'up':
        return <span className="text-success">↑</span>;
      case 'down':
        return <span className="text-danger">↓</span>;
      case 'stable':
        return <span className="text-muted">-</span>;
    }
  };

  const getROIColor = (roi: number) => {
    if (roi >= 200) return 'success';
    if (roi >= 100) return 'info';
    if (roi >= 0) return 'warning';
    return 'danger';
  };

  const maxScore = Math.max(...displayRules.map(r => r.effectivenessScore), 1);

  return (
    <div className={`card ${theme === 'dark' ? 'bg-secondary text-light' : ''}`}>
      <div className="card-header d-flex justify-content-between align-items-center">
        <h5 className="card-title mb-0">
          Aturan Paling Efektif {limit < ruleEffectiveness.length && `(Top ${limit} dari ${ruleEffectiveness.length})`}
        </h5>
        {onExport && (
          <button className="btn btn-sm btn-outline-primary" onClick={() => onExport(ruleEffectiveness)}>
            Ekspor CSV
          </button>
        )}
      </div>
      <div className="card-body">
        <div className="table-responsive">
          <table className="table table-hover">
            <thead>
              <tr>
                <th>Peringkat</th>
                <th>Nama Aturan</th>
                <th>Segmen</th>
                <th>Lift</th>
                <th>Tarif Konversi</th>
                <th>Tarif Keterlibatan</th>
                <th>ROI</th>
                <th>Skor Efektivitas</th>
                <th>Tren</th>
              </tr>
            </thead>
            <tbody>
              {displayRules.map((rule, index) => (
                <tr key={rule.ruleId}>
                  <td>
                    <span className={`badge bg-${getEffectivenessColor(rule.effectivenessScore)}`}>
                      #{index + 1}
                    </span>
                  </td>
                  <td>
                    <strong>{rule.ruleName}</strong>
                  </td>
                  <td>{SEGMENT_LABELS[rule.segment] || rule.segment}</td>
                  <td>
                    <span className={`badge ${rule.liftPercentage > 0 ? 'bg-success' : 'bg-danger'}`}>
                      {rule.liftPercentage > 0 ? '+' : ''}{rule.liftPercentage.toFixed(1)}%
                    </span>
                  </td>
                  <td>{rule.conversionRate.toFixed(2)}%</td>
                  <td>{rule.engagementRate.toFixed(2)}%</td>
                  <td>
                    <span className={`badge bg-${getROIColor(rule.roi)}`}>
                      {rule.roi.toFixed(0)}%
                    </span>
                  </td>
                  <td>
                    <div className="d-flex align-items-center">
                      <div className="progress flex-grow-1 me-2" style={{ height: '8px' }}>
                        <div
                          className={`progress-bar bg-${getEffectivenessColor(rule.effectivenessScore)}`}
                          style={{ width: `${(rule.effectivenessScore / maxScore) * 100}%` }}
                          role="progressbar"
                          aria-valuenow={rule.effectivenessScore}
                          aria-valuemin={0}
                          aria-valuemax={maxScore}
                        />
                      </div>
                      <span className="text-nowrap">{rule.effectivenessScore.toFixed(0)}</span>
                    </div>
                  </td>
                  <td>{getTrendIcon(rule.trend)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {ruleEffectiveness.length === 0 && (
          <div className="text-center text-muted py-4">
            <p>Tidak ada data efektivitas aturan yang tersedia</p>
          </div>
        )}
      </div>
    </div>
  );
});

RuleEffectivenessChart.displayName = 'RuleEffectivenessChart';

export default RuleEffectivenessChart;
