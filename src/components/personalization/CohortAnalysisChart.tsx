'use client';

import React, { memo, useState } from 'react';
import { useTheme } from '@/contexts/ThemeContext';
import type { CohortAnalysis } from '@/types/personalization';

interface CohortAnalysisChartProps {
  cohortAnalysis: CohortAnalysis;
  onExport?: (data: CohortAnalysis) => void;
}

const CohortAnalysisChart: React.FC<CohortAnalysisChartProps> = memo(({ cohortAnalysis, onExport }) => {
  const { theme } = useTheme();
  const [selectedCohort, setSelectedCohort] = useState<number | null>(null);

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('id-ID', { day: '2-digit', month: '2-digit', year: '2-digit' });
  };

  const getRetentionColor = (retention: number) => {
    if (retention >= 0.8) return 'bg-success';
    if (retention >= 0.6) return 'bg-info';
    if (retention >= 0.4) return 'bg-warning';
    return 'bg-danger';
  };

  const getLiftColor = (lift: number) => {
    if (lift >= 15) return 'bg-success';
    if (lift >= 10) return 'bg-info';
    if (lift >= 5) return 'bg-warning';
    return 'bg-danger';
  };

  const selectedCohortData = selectedCohort !== null ? cohortAnalysis.cohorts[selectedCohort] : null;

  return (
    <div className={`card ${theme === 'dark' ? 'bg-secondary text-light' : ''}`}>
      <div className="card-header d-flex justify-content-between align-items-center">
        <h5 className="card-title mb-0">
          Analisis Kohort Personalisasi ({cohortAnalysis.periodType === 'daily' ? 'Harian' : cohortAnalysis.periodType === 'weekly' ? 'Mingguan' : 'Bulanan'})
        </h5>
        {onExport && (
          <button className="btn btn-sm btn-outline-primary" onClick={() => onExport(cohortAnalysis)}>
            Ekspor Data
          </button>
        )}
      </div>
      <div className="card-body">
        <div className="table-responsive">
          <table className="table table-sm table-hover">
            <thead>
              <tr>
                <th>Kohort</th>
                <th>Tanggal</th>
                <th>Pengguna</th>
                <th>Konversi</th>
                <th>Tarif Konversi</th>
                <th>Lift</th>
                <th colSpan={5}>Retensi Periode (%)</th>
              </tr>
            </thead>
            <tbody>
              {cohortAnalysis.cohorts.map((cohort, index) => (
                <tr
                  key={index}
                  className={selectedCohort === index ? 'table-active' : ''}
                  style={{ cursor: 'pointer' }}
                  onClick={() => setSelectedCohort(selectedCohort === index ? null : index)}
                >
                  <td>
                    <strong>{cohort.cohortName}</strong>
                  </td>
                  <td>{formatDate(cohort.cohortDate)}</td>
                  <td>{cohort.users.toLocaleString('id-ID')}</td>
                  <td>{cohort.conversions.toLocaleString('id-ID')}</td>
                  <td>{cohort.conversionRate.toFixed(2)}%</td>
                  <td>
                    <span className={`badge ${getLiftColor(cohort.lift)}`}>
                      +{cohort.lift.toFixed(1)}%
                    </span>
                  </td>
                  {cohort.retention.map((ret, i) => (
                    <td key={i} className="text-center">
                      <span className={`badge ${getRetentionColor(ret)}`}>
                        {(ret * 100).toFixed(0)}%
                      </span>
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {selectedCohortData && (
          <div className={`card mt-4 ${theme === 'dark' ? 'bg-dark' : ''}`}>
            <div className="card-body">
              <h6 className="card-title mb-3">Detail: {selectedCohortData.cohortName}</h6>
              <div className="row g-3">
                <div className="col-md-3">
                  <div className="card">
                    <div className="card-body text-center">
                      <h6 className="text-muted mb-1">Pengguna</h6>
                      <h4 className="mb-0">{selectedCohortData.users.toLocaleString('id-ID')}</h4>
                    </div>
                  </div>
                </div>
                <div className="col-md-3">
                  <div className="card">
                    <div className="card-body text-center">
                      <h6 className="text-muted mb-1">Konversi</h6>
                      <h4 className="mb-0 text-success">{selectedCohortData.conversions.toLocaleString('id-ID')}</h4>
                    </div>
                  </div>
                </div>
                <div className="col-md-3">
                  <div className="card">
                    <div className="card-body text-center">
                      <h6 className="text-muted mb-1">Tarif Konversi</h6>
                      <h4 className="mb-0">{selectedCohortData.conversionRate.toFixed(2)}%</h4>
                    </div>
                  </div>
                </div>
                <div className="col-md-3">
                  <div className="card">
                    <div className="card-body text-center">
                      <h6 className="text-muted mb-1">Lift</h6>
                      <h4 className="mb-0 text-info">+{selectedCohortData.lift.toFixed(1)}%</h4>
                    </div>
                  </div>
                </div>
              </div>

              <div className="mt-4">
                <h6 className="mb-3">Retensi Seiring Waktu</h6>
                <div className="progress" style={{ height: '30px' }}>
                  {selectedCohortData.retention.map((ret, i) => (
                    <div
                      key={i}
                      className={`progress-bar ${getRetentionColor(ret)}`}
                      style={{ width: `${(1 / selectedCohortData.retention.length) * 100}%` }}
                      role="progressbar"
                      title={`Periode ${i + 1}: ${(ret * 100).toFixed(0)}%`}
                    />
                  ))}
                </div>
                <div className="mt-2 d-flex justify-content-between">
                  {selectedCohortData.retention.map((ret, i) => (
                    <small key={i} className="text-muted">
                      Periode {i + 1}: {(ret * 100).toFixed(0)}%
                    </small>
                  ))}
                </div>
              </div>

              <div className="mt-4">
                <h6 className="mb-3">Lift Rata-rata Seiring Waktu</h6>
                <div className="progress" style={{ height: '30px' }}>
                  {selectedCohortData.avgLiftOverTime.map((lift, i) => (
                    <div
                      key={i}
                      className={`progress-bar ${getLiftColor(lift)}`}
                      style={{ width: `${(1 / selectedCohortData.avgLiftOverTime.length) * 100}%` }}
                      role="progressbar"
                      title={`Periode ${i + 1}: +${lift.toFixed(1)}%`}
                    />
                  ))}
                </div>
                <div className="mt-2 d-flex justify-content-between">
                  {selectedCohortData.avgLiftOverTime.map((lift, i) => (
                    <small key={i} className="text-muted">
                      Periode {i + 1}: +{lift.toFixed(1)}%
                    </small>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}

        <div className="mt-4">
          <h6 className="mb-3">Ringkasan Kohort</h6>
          <div className="row g-3">
            <div className="col-md-4">
              <div className="card">
                <div className="card-body text-center">
                  <h6 className="text-muted mb-1">Total Pengguna</h6>
                  <h4 className="mb-0">
                    {cohortAnalysis.cohorts.reduce((sum, c) => sum + c.users, 0).toLocaleString('id-ID')}
                  </h4>
                </div>
              </div>
            </div>
            <div className="col-md-4">
              <div className="card">
                <div className="card-body text-center">
                  <h6 className="text-muted mb-1">Total Konversi</h6>
                  <h4 className="mb-0 text-success">
                    {cohortAnalysis.cohorts.reduce((sum, c) => sum + c.conversions, 0).toLocaleString('id-ID')}
                  </h4>
                </div>
              </div>
            </div>
            <div className="col-md-4">
              <div className="card">
                <div className="card-body text-center">
                  <h6 className="text-muted mb-1">Lift Rata-rata</h6>
                  <h4 className="mb-0 text-info">
                    +{(
                      cohortAnalysis.cohorts.reduce((sum, c) => sum + c.lift, 0) / cohortAnalysis.cohorts.length
                    ).toFixed(1)}%
                  </h4>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
});

CohortAnalysisChart.displayName = 'CohortAnalysisChart';

export default CohortAnalysisChart;
