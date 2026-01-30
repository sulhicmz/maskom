'use client';

import { useState, useEffect, useMemo, memo } from 'react';
import {
  SkippedTestInfo,
  SkipCategory,
  SkipSeverity,
  SkipCategoryStats,
  SkipTrendData,
} from '@/types/testDiagnostics';
import {
  generateDiagnosticReport,
  filterByCategory,
  filterBySeverity,
  searchSkippedTests,
  updateTestSelection,
  bulkUpdateSelection,
  reEnableSelectedTests,
  deleteSelectedTests,
  exportSkippedTestsAsCSV,
} from '@/utils/testDiagnostics/skippedTestScanner';
import { useRBAC } from '@/hooks/useRBAC';
import { Permission } from '@/types/permission';
import Button from '@/components/ui/Button';
import {
  TestSummaryCards,
  CategoryBreakdown,
  TrendVisualization,
  FilterSection,
  TestListTable,
  ExportModal,
} from './';

const SkippedTestDashboard = () => {
  const { hasPermission } = useRBAC();

  // State
  const [skippedTests, setSkippedTests] = useState<SkippedTestInfo[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedCategory, setSelectedCategory] = useState<SkipCategory | 'all'>('all');
  const [selectedSeverity, setSelectedSeverity] = useState<SkipSeverity | 'all'>('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [categoryStats, setCategoryStats] = useState<SkipCategoryStats[]>([]);
  const [trendData, setTrendData] = useState<SkipTrendData[]>([]);
  const [criticalIssues, setCriticalIssues] = useState<SkippedTestInfo[]>([]);
  const [showExportModal, setShowExportModal] = useState(false);
  const [exportFormat, setExportFormat] = useState<'pdf' | 'csv'>('csv');

  // Filter tests
  const filteredTests = useMemo(() => {
    let tests = skippedTests;

    if (selectedCategory !== 'all') {
      tests = filterByCategory(tests, selectedCategory);
    }

    if (selectedSeverity !== 'all') {
      tests = filterBySeverity(tests, selectedSeverity);
    }

    if (searchTerm) {
      tests = searchSkippedTests(tests, searchTerm);
    }

    return tests;
  }, [skippedTests, selectedCategory, selectedSeverity, searchTerm]);

  // Selected tests
  const selectedTests = useMemo(() => {
    return filteredTests.filter(t => t.isSelected);
  }, [filteredTests]);

  // Load data
  useEffect(() => {
    loadDiagnosticData();
  }, []);

  const loadDiagnosticData = async () => {
    setLoading(true);
    try {
      const report = await generateDiagnosticReport();
      setSkippedTests([]);
      setCategoryStats(report.categoryStats);
      setTrendData(report.trendData);
      setCriticalIssues(report.criticalIssues);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Gagal memuat diagnostik tes');
    } finally {
      setLoading(false);
    }
  };

  // Update selection
  const toggleTestSelection = (testId: string) => {
    const test = filteredTests.find(t => t.id === testId);
    if (test) {
      setSkippedTests(prev => updateTestSelection(prev, testId, !test.isSelected));
    }
  };

  const toggleAllSelections = () => {
    const allSelected = filteredTests.every(t => t.isSelected);
    setSkippedTests(prev => bulkUpdateSelection(prev, !allSelected, t => filteredTests.includes(t)));
  };

  // Bulk actions
  const handleReEnableTests = () => {
    const reEnabled = reEnableSelectedTests(filteredTests);
    if (reEnabled.length > 0) {
      alert(`${reEnabled.length} tes berhasil diaktifkan kembali`);
      loadDiagnosticData();
    }
  };

  const handleDeleteTests = () => {
    const deleted = deleteSelectedTests(filteredTests);
    if (deleted.length > 0) {
      alert(`${deleted.length} tes dihapus`);
      loadDiagnosticData();
    }
  };

  // Export
  const handleExport = () => {
    if (exportFormat === 'csv') {
      const csv = exportSkippedTestsAsCSV(filteredTests);
      const blob = new Blob([csv], { type: 'text/csv' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `skipped-tests-report-${new Date().toISOString().split('T')[0]}.csv`;
      a.click();
      URL.revokeObjectURL(url);
    } else {
      alert('Ekspor PDF belum diimplementasikan');
    }
    setShowExportModal(false);
  };

  // Category colors
  const getCategoryColor = (category: SkipCategory): string => {
    const colors: Record<SkipCategory, string> = {
      timeout: 'warning',
      pending: 'info',
      skip: 'secondary',
      'fixture-issues': 'danger',
      'dependency-issues': 'danger',
      'environment-issues': 'warning',
      'known-issue': 'warning',
      obsolete: 'danger',
      temporary: 'info',
      unknown: 'secondary',
    };
    return colors[category];
  };

  // Severity badges
  const getSeverityBadge = (severity: SkipSeverity): string => {
    const badges: Record<SkipSeverity, string> = {
      low: 'bg-success text-white',
      medium: 'bg-warning text-dark',
      high: 'bg-danger text-white',
      critical: 'bg-danger text-white font-weight-bold',
    };
    return badges[severity];
  };

  // Check permissions
  if (!hasPermission(Permission.VIEW_QA)) {
    return (
      <div className="alert alert-danger">
        <i className="bi bi-exclamation-triangle-fill me-2"></i>
        Anda tidak memiliki izin untuk mengakses halaman ini.
      </div>
    );
  }

  if (loading) {
    return (
      <div className="text-center py-5">
        <div className="spinner-border text-primary" role="status">
          <span className="visually-hidden">Memuat...</span>
        </div>
        <p className="mt-3">Memuat diagnostik tes yang diabaikan...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="alert alert-danger">
        <i className="bi bi-exclamation-triangle-fill me-2"></i>
        {error}
      </div>
    );
  }

  return (
    <div className="skipped-test-dashboard">
      {/* Header */}
      <div className="d-flex justify-content-between align-items-center mb-4">
        <div>
          <h2 className="mb-1">
            <i className="bi bi-bug-fill me-2 text-warning"></i>
            Diagnostik Tes yang Diabaikan
          </h2>
          <p className="text-muted mb-0">
            Kelola dan tinjau tes yang diabaikan untuk meningkatkan cakupan pengujian
          </p>
        </div>
        <Button
          variant="primary"
          onClick={() => setShowExportModal(true)}
        >
          <i className="bi bi-download me-2"></i>
            Ekspor Laporan
        </Button>
      </div>

      {/* Summary Cards */}
      <TestSummaryCards
        skippedTests={skippedTests}
        criticalIssues={criticalIssues}
        selectedTests={selectedTests}
      />

      {/* Category Breakdown */}
      <CategoryBreakdown
        categoryStats={categoryStats}
        getCategoryColor={getCategoryColor}
      />

      {/* Trend Visualization */}
      {trendData.length > 0 && (
        <TrendVisualization trendData={trendData} />
      )}

      {/* Filters and Search */}
      <FilterSection
        selectedCategory={selectedCategory}
        selectedSeverity={selectedSeverity}
        searchTerm={searchTerm}
        onCategoryChange={setSelectedCategory}
        onSeverityChange={setSelectedSeverity}
        onSearchTermChange={setSearchTerm}
      />

      {/* Bulk Actions */}
      {selectedTests.length > 0 && (
        <div className="alert alert-info mb-3">
          <div className="d-flex justify-content-between align-items-center">
            <span>
              <strong>{selectedTests.length}</strong> tes dipilih
            </span>
            <div>
              <Button
                variant="primary"
                size="small"
                onClick={handleReEnableTests}
                className="me-2"
              >
                <i className="bi bi-check-circle me-1"></i>
                Aktifkan Kembali
              </Button>
              <Button
                variant="danger"
                size="small"
                onClick={handleDeleteTests}
              >
                <i className="bi bi-trash me-1"></i>
                Hapus (Hanya Usang)
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Skipped Tests List */}
      <TestListTable
        filteredTests={filteredTests}
        getCategoryColor={getCategoryColor}
        getSeverityBadge={getSeverityBadge}
        onToggleTestSelection={toggleTestSelection}
        onToggleAllSelections={toggleAllSelections}
      />

      {/* Export Modal */}
      <ExportModal
        show={showExportModal}
        exportFormat={exportFormat}
        filteredTestsCount={filteredTests.length}
        onExportFormatChange={setExportFormat}
        onExport={handleExport}
        onClose={() => setShowExportModal(false)}
      />
    </div>
  );
};

export default memo(SkippedTestDashboard);
