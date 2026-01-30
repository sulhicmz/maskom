'use client';

import { memo } from 'react';
import type { SkippedTestInfo } from '@/types/testDiagnostics';

interface TestSummaryCardsProps {
  skippedTests: SkippedTestInfo[];
  criticalIssues: SkippedTestInfo[];
  selectedTests: SkippedTestInfo[];
}

const TestSummaryCards = ({ skippedTests, criticalIssues, selectedTests }: TestSummaryCardsProps) => {
  return (
    <div className="row g-3 mb-4">
      <div className="col-md-3">
        <div className="card shadow-sm">
          <div className="card-body">
            <h6 className="text-muted text-uppercase small">Total Tes Diabaikan</h6>
            <h3 className="mb-0">{skippedTests.length}</h3>
          </div>
        </div>
      </div>
      <div className="col-md-3">
        <div className="card shadow-sm border-danger">
          <div className="card-body">
            <h6 className="text-danger text-uppercase small">Isu Kritis</h6>
            <h3 className="mb-0 text-danger">{criticalIssues.length}</h3>
          </div>
        </div>
      </div>
      <div className="col-md-3">
        <div className="card shadow-sm border-warning">
          <div className="card-body">
            <h6 className="text-warning text-uppercase small">Perlu Investigasi</h6>
            <h3 className="mb-0 text-warning">
              {skippedTests.filter(t => t.severity === 'high').length}
            </h3>
          </div>
        </div>
      </div>
      <div className="col-md-3">
        <div className="card shadow-sm border-info">
          <div className="card-body">
            <h6 className="text-info text-uppercase small">Terpilih</h6>
            <h3 className="mb-0 text-info">{selectedTests.length}</h3>
          </div>
        </div>
      </div>
    </div>
  );
};

export default memo(TestSummaryCards);
