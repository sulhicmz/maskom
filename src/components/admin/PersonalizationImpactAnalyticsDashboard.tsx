'use client';

import React, { useState, useEffect, useCallback, memo } from 'react';
import { useTheme } from '@/contexts/ThemeContext';
import { personalizationEngine } from '@/utils/personalization';
import personalizationImpactAnalyzer from '@/utils/personalization/impactAnalyzer';
import SegmentPerformanceTracker from '@/components/personalization/SegmentPerformanceTracker';
import RuleEffectivenessChart from '@/components/personalization/RuleEffectivenessChart';
import ROICalculatorCard from '@/components/personalization/ROICalculatorCard';
import CohortAnalysisChart from '@/components/personalization/CohortAnalysisChart';
import type { PersonalizationRule, PersonalizationImpactAnalytics, IPersonalizationImpactAnalyzer } from '@/types/personalization';

const SEGMENT_LABELS: Record<string, string> = {
  new_visitor: 'Pengunjung Baru',
  returning_visitor: 'Pengunjung Kembali',
  frequent_reader: 'Pembaca Sering',
  content_creator: 'Pembuat Konten',
  engaged_user: 'Pengguna Terlibat',
  dormant_user: 'Pengguna Tidak Aktif',
};

const PersonalizationImpactAnalyticsDashboard = () => {
  const { theme } = useTheme();
  const [, setRules] = useState<PersonalizationRule[]>([]);
  const [analytics, setAnalytics] = useState<PersonalizationImpactAnalytics | null>(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'overview' | 'segments' | 'rules' | 'roi' | 'cohorts'>('overview');
  const [dateRange, setDateRange] = useState<'7d' | '30d' | '90d'>('30d');

  useEffect(() => {
    const loadData = () => {
      const allRules = personalizationEngine.getAllRules();
      setRules(allRules);
      const impactAnalytics = personalizationImpactAnalyzer.getComprehensiveAnalytics(allRules);
      setAnalytics(impactAnalytics);
      setLoading(false);
    };

    loadData();
    const interval = setInterval(loadData, 10000);
    return () => clearInterval(interval);
  }, []);

  const handleExportSegmentPerformance = useCallback((data: unknown[]) => {
    personalizationImpactAnalyzer.exportToCSV(data, 'segment-performance');
  }, []);

  const handleExportRuleEffectiveness = useCallback((data: unknown[]) => {
    personalizationImpactAnalyzer.exportToCSV(data, 'rule-effectiveness');
  }, []);

  const handleExportCohortAnalysis = useCallback((data: unknown) => {
    if (Array.isArray(data)) {
      personalizationImpactAnalyzer.exportToCSV(data, 'cohort-analysis');
    } else {
      personalizationImpactAnalyzer.exportToCSV([data], 'cohort-analysis-summary');
    }
  }, []);

  const handleExportAllData = useCallback(() => {
    if (analytics) {
      const allData = {
        impactMetrics: analytics.impactMetrics,
        segmentPerformance: analytics.segmentPerformance,
        ruleEffectiveness: analytics.ruleEffectiveness,
        roiCalculator: analytics.roiCalculator,
        summary: analytics.summary,
      };
      personalizationImpactAnalyzer.exportToCSV([allData], 'personalization-impact-analytics');
    }
  }, [analytics]);

  if (loading || !analytics) {
    return (
      <div className={`min-vh-100 py-4 ${theme === 'dark' ? 'bg-dark text-light' : 'bg-light text-dark'}`}>
        <div className="container">
          <div className="text-center py-5">
            <div className="spinner-border text-primary" role="status">
              <span className="visually-hidden">Memuat...</span>
            </div>
            <p className="mt-3">Memuat analitik dampak personalisasi...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className={`min-vh-100 py-4 ${theme === 'dark' ? 'bg-dark text-light' : 'bg-light text-dark'}`}>
      <div className="container">
        <div className="d-flex justify-content-between align-items-center mb-4">
          <div>
            <h1>Analitik Dampak Personalisasi</h1>
            <p className="text-muted mb-0">Pantau ROI, performa, dan dampak personalisasi konten</p>
          </div>
          <button
            className="btn btn-primary"
            onClick={handleExportAllData}
          >
            <i className="bi bi-download me-2" />
            Ekspor Semua Data
          </button>
        </div>

        <div className="mb-4 d-flex justify-content-between align-items-center">
          <div className="btn-group">
            <button
              className={`btn ${activeTab === 'overview' ? 'btn-primary' : 'btn-outline-primary'}`}
              onClick={() => setActiveTab('overview')}
            >
              Ringkasan
            </button>
            <button
              className={`btn ${activeTab === 'segments' ? 'btn-primary' : 'btn-outline-primary'}`}
              onClick={() => setActiveTab('segments')}
            >
              Segmen
            </button>
            <button
              className={`btn ${activeTab === 'rules' ? 'btn-primary' : 'btn-outline-primary'}`}
              onClick={() => setActiveTab('rules')}
            >
              Aturan
            </button>
            <button
              className={`btn ${activeTab === 'roi' ? 'btn-primary' : 'btn-outline-primary'}`}
              onClick={() => setActiveTab('roi')}
            >
              ROI
            </button>
            <button
              className={`btn ${activeTab === 'cohorts' ? 'btn-primary' : 'btn-outline-primary'}`}
              onClick={() => setActiveTab('cohorts')}
            >
              Kohort
            </button>
          </div>

          <select
            className="form-select w-auto"
            value={dateRange}
            onChange={(e) => setDateRange(e.target.value as '7d' | '30d' | '90d')}
          >
            <option value="7d">7 Hari Terakhir</option>
            <option value="30d">30 Hari Terakhir</option>
            <option value="90d">90 Hari Terakhir</option>
          </select>
        </div>

        {activeTab === 'overview' && (
          <div>
            <div className="row mb-4">
              <div className="col-md-3 mb-3">
                <div className={`card ${theme === 'dark' ? 'bg-secondary text-light' : ''} text-center`}>
                  <div className="card-body">
                    <h3 className="text-primary">{analytics.summary.totalRules}</h3>
                    <p className="mb-0">Total Aturan</p>
                    <small className="text-muted">{analytics.summary.activeRules} aktif</small>
                  </div>
                </div>
              </div>
              <div className="col-md-3 mb-3">
                <div className={`card ${theme === 'dark' ? 'bg-secondary text-light' : ''} text-center`}>
                  <div className="card-body">
                    <h3 className="text-success">
                      {analytics.impactMetrics.totalConversions.toLocaleString('id-ID')}
                    </h3>
                    <p className="mb-0">Total Konversi</p>
                    <small className="text-muted">{analytics.impactMetrics.conversionRate.toFixed(2)}% tarif</small>
                  </div>
                </div>
              </div>
              <div className="col-md-3 mb-3">
                <div className={`card ${theme === 'dark' ? 'bg-secondary text-light' : ''} text-center`}>
                  <div className="card-body">
                    <h3 className="text-info">
                      {analytics.impactMetrics.totalImpressions.toLocaleString('id-ID')}
                    </h3>
                    <p className="mb-0">Total Tayangan</p>
                    <small className="text-muted">{analytics.impactMetrics.engagementRate.toFixed(2)}% keterlibatan</small>
                  </div>
                </div>
              </div>
              <div className="col-md-3 mb-3">
                <div className={`card ${theme === 'dark' ? 'bg-secondary text-light' : ''} text-center`}>
                  <div className="card-body">
                    <h3 className="text-warning">
                      +{analytics.impactMetrics.avgLift.toFixed(1)}%
                    </h3>
                    <p className="mb-0">Lift Keseluruhan</p>
                    <small className="text-muted">{analytics.summary.overallROI.toFixed(1)}% ROI</small>
                  </div>
                </div>
              </div>
            </div>

            <div className="row mb-4">
              <div className="col-md-6">
                <div className={`card ${theme === 'dark' ? 'bg-secondary text-light' : ''}`}>
                  <div className="card-body">
                    <h5 className="card-title mb-3">Segmen Terbaik</h5>
                    <div className="d-flex align-items-center">
                      <div className="flex-grow-1">
                        <h4 className="mb-0">
                          {SEGMENT_LABELS[analytics.summary.bestSegment] || analytics.summary.bestSegment}
                        </h4>
                        <p className="text-muted mb-0">
                          Lift rata-rata: {analytics.segmentPerformance.find(s => s.segment === analytics.summary.bestSegment)?.avgLift.toFixed(1)}%
                        </p>
                      </div>
                      <div className="text-end">
                        <span className="badge bg-success fs-5">
                          {analytics.segmentPerformance.find(s => s.segment === analytics.summary.bestSegment)?.avgLift.toFixed(1)}%
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
              <div className="col-md-6">
                <div className={`card ${theme === 'dark' ? 'bg-secondary text-light' : ''}`}>
                  <div className="card-body">
                    <h5 className="card-title mb-3">Segmen Terburuk</h5>
                    <div className="d-flex align-items-center">
                      <div className="flex-grow-1">
                        <h4 className="mb-0">
                          {SEGMENT_LABELS[analytics.summary.worstSegment] || analytics.summary.worstSegment}
                        </h4>
                        <p className="text-muted mb-0">
                          Lift rata-rata: {analytics.segmentPerformance.find(s => s.segment === analytics.summary.worstSegment)?.avgLift.toFixed(1)}%
                        </p>
                      </div>
                      <div className="text-end">
                        <span className="badge bg-danger fs-5">
                          {analytics.segmentPerformance.find(s => s.segment === analytics.summary.worstSegment)?.avgLift.toFixed(1)}%
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <div className="row">
              <div className="col-md-6">
                <div className={`card ${theme === 'dark' ? 'bg-secondary text-light' : ''}`}>
                  <div className="card-header">
                    <h5 className="card-title mb-0">5 Aturan Terbaik</h5>
                  </div>
                  <div className="card-body">
                    <ul className="list-group list-group-flush">
                      {analytics.topPerformingRules.map((rule, index) => (
                        <li key={rule.ruleId} className={`list-group-item ${theme === 'dark' ? 'bg-dark' : ''}`}>
                          <div className="d-flex justify-content-between align-items-center">
                            <div>
                              <strong>#{index + 1} {rule.ruleName}</strong>
                              <br />
                              <small className="text-muted">
                                {SEGMENT_LABELS[rule.segment] || rule.segment} - Lift: {rule.liftPercentage.toFixed(1)}%
                              </small>
                            </div>
                            <span className={`badge bg-${rule.effectivenessScore >= 80 ? 'success' : rule.effectivenessScore >= 60 ? 'info' : 'warning'}`}>
                              {rule.effectivenessScore.toFixed(0)}
                            </span>
                          </div>
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
              </div>
              <div className="col-md-6">
                <div className={`card ${theme === 'dark' ? 'bg-secondary text-light' : ''}`}>
                  <div className="card-header">
                    <h5 className="card-title mb-0">5 Aturan Terburuk</h5>
                  </div>
                  <div className="card-body">
                    <ul className="list-group list-group-flush">
                      {analytics.worstPerformingRules.map((rule, index) => (
                        <li key={rule.ruleId} className={`list-group-item ${theme === 'dark' ? 'bg-dark' : ''}`}>
                          <div className="d-flex justify-content-between align-items-center">
                            <div>
                              <strong>#{index + 1} {rule.ruleName}</strong>
                              <br />
                              <small className="text-muted">
                                {SEGMENT_LABELS[rule.segment] || rule.segment} - Lift: {rule.liftPercentage.toFixed(1)}%
                              </small>
                            </div>
                            <span className={`badge bg-${rule.effectivenessScore >= 40 ? 'warning' : 'danger'}`}>
                              {rule.effectivenessScore.toFixed(0)}
                            </span>
                          </div>
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'segments' && (
          <SegmentPerformanceTracker
            segmentPerformance={analytics.segmentPerformance}
            onExport={handleExportSegmentPerformance}
          />
        )}

        {activeTab === 'rules' && (
          <RuleEffectivenessChart
            ruleEffectiveness={analytics.ruleEffectiveness}
            onExport={handleExportRuleEffectiveness}
          />
        )}

        {activeTab === 'roi' && (
          <ROICalculatorCard roiData={analytics.roiCalculator} />
        )}

        {activeTab === 'cohorts' && (
          <CohortAnalysisChart
            cohortAnalysis={analytics.cohortAnalysis}
            onExport={handleExportCohortAnalysis}
          />
        )}
      </div>
    </div>
  );
};

export default memo(PersonalizationImpactAnalyticsDashboard);
