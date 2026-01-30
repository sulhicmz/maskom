'use client';

import React, { memo } from 'react';
import { useTheme } from '@/contexts/ThemeContext';
import type { ROICalculator } from '@/types/personalization';

interface ROICalculatorCardProps {
  roiData: ROICalculator;
}

const ROICalculatorCard: React.FC<ROICalculatorCardProps> = memo(({ roiData }) => {
  const { theme } = useTheme();

  const getROIColor = (roi: number) => {
    if (roi >= 200) return { bg: 'bg-success', text: 'text-success', label: 'Sangat Tinggi' };
    if (roi >= 100) return { bg: 'bg-info', text: 'text-info', label: 'Tinggi' };
    if (roi >= 0) return { bg: 'bg-warning', text: 'text-warning', label: 'Sedang' };
    return { bg: 'bg-danger', text: 'text-danger', label: 'Rendah' };
  };

  const roiColor = getROIColor(roiData.roi);
  const profitColor = roiData.profit >= 0 ? 'text-success' : 'text-danger';

  return (
    <div className={`card ${theme === 'dark' ? 'bg-secondary text-light' : ''}`}>
      <div className="card-header">
        <h5 className="card-title mb-0">Kalkulator ROI</h5>
      </div>
      <div className="card-body">
        <div className="row g-4">
          <div className="col-md-6">
            <div className="card mb-3">
              <div className="card-body text-center">
                <h6 className="text-muted mb-2">Pengembalian Investasi (ROI)</h6>
                <h3 className={roiColor.text}>{roiData.roi.toFixed(1)}%</h3>
                <span className={`badge ${roiColor.bg}`}>{roiColor.label}</span>
              </div>
            </div>
          </div>

          <div className="col-md-6">
            <div className="card mb-3">
              <div className="card-body text-center">
                <h6 className="text-muted mb-2">Keuntungan Bersih</h6>
                <h3 className={profitColor}>
                  {roiData.profit >= 0 ? '+' : ''}Rp {roiData.profit.toLocaleString('id-ID')}
                </h3>
              </div>
            </div>
          </div>

          <div className="col-md-4">
            <div className="card mb-3">
              <div className="card-body text-center">
                <h6 className="text-muted mb-2">Total Investasi</h6>
                <h4>Rp {roiData.totalInvestment.toLocaleString('id-ID')}</h4>
              </div>
            </div>
          </div>

          <div className="col-md-4">
            <div className="card mb-3">
              <div className="card-body text-center">
                <h6 className="text-muted mb-2">Pendapatan Total</h6>
                <h4 className="text-success">Rp {roiData.revenueGenerated.toLocaleString('id-ID')}</h4>
              </div>
            </div>
          </div>

          <div className="col-md-4">
            <div className="card mb-3">
              <div className="card-body text-center">
                <h6 className="text-muted mb-2">Periode Pulang Modal</h6>
                <h4>{roiData.paybackPeriod.toFixed(1)} hari</h4>
              </div>
            </div>
          </div>

          <div className="col-md-6">
            <div className="card mb-3">
              <div className="card-body text-center">
                <h6 className="text-muted mb-2">Biaya per Akuisisi</h6>
                <h4>Rp {roiData.costPerAcquisition.toLocaleString('id-ID')}</h4>
              </div>
            </div>
          </div>

          <div className="col-md-6">
            <div className="card mb-3">
              <div className="card-body text-center">
                <h6 className="text-muted mb-2">Nilai Seumur Hidup (LTV)</h6>
                <h4 className="text-info">Rp {roiData.lifetimeValue.toLocaleString('id-ID')}</h4>
              </div>
            </div>
          </div>

          <div className="col-12">
            <div className="card mb-3">
              <div className="card-body text-center">
                <h6 className="text-muted mb-2">Rasio LTV:CAC</h6>
                <h3 className={roiData.ltvToCacRatio >= 3 ? 'text-success' : roiData.ltvToCacRatio >= 1 ? 'text-warning' : 'text-danger'}>
                  {roiData.ltvToCacRatio.toFixed(2)}x
                </h3>
                <small className="text-muted">
                  {roiData.ltvToCacRatio >= 3 ? 'Sangat Baik (≥3x)' : roiData.ltvToCacRatio >= 1 ? 'Baik (≥1x)' : 'Perlu Perbaikan (<1x)'}
                </small>
              </div>
            </div>
          </div>
        </div>

        <div className="mt-4">
          <h6 className="mb-3">Ringkasan Investasi</h6>
          <ul className="list-group">
            <li className={`list-group-item ${theme === 'dark' ? 'bg-dark' : ''}`}>
              <div className="d-flex justify-content-between">
                <span>Total Investasi:</span>
                <strong>Rp {roiData.totalInvestment.toLocaleString('id-ID')}</strong>
              </div>
            </li>
            <li className={`list-group-item ${theme === 'dark' ? 'bg-dark' : ''}`}>
              <div className="d-flex justify-content-between">
                <span>Pendapatan yang Dihasilkan:</span>
                <strong className="text-success">Rp {roiData.revenueGenerated.toLocaleString('id-ID')}</strong>
              </div>
            </li>
            <li className={`list-group-item ${theme === 'dark' ? 'bg-dark' : ''}`}>
              <div className="d-flex justify-content-between">
                <span>Keuntungan Bersih:</span>
                <strong className={profitColor}>
                  {roiData.profit >= 0 ? '+' : ''}Rp {roiData.profit.toLocaleString('id-ID')}
                </strong>
              </div>
            </li>
            <li className={`list-group-item ${theme === 'dark' ? 'bg-dark' : ''}`}>
              <div className="d-flex justify-content-between">
                <span>Pengembalian Investasi (ROI):</span>
                <strong className={roiColor.text}>{roiData.roi.toFixed(1)}%</strong>
              </div>
            </li>
            <li className={`list-group-item ${theme === 'dark' ? 'bg-dark' : ''}`}>
              <div className="d-flex justify-content-between">
                <span>Titik Impas:</span>
                <strong>{roiData.breakEvenPoint.toLocaleString('id-ID')} konversi</strong>
              </div>
            </li>
          </ul>
        </div>
      </div>
    </div>
  );
});

ROICalculatorCard.displayName = 'ROICalculatorCard';

export default ROICalculatorCard;
