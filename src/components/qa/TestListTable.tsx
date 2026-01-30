'use client';

import { memo } from 'react';
import type { SkippedTestInfo, SkipCategory, SkipSeverity } from '@/types/testDiagnostics';

interface TestListTableProps {
  filteredTests: SkippedTestInfo[];
  getCategoryColor: (category: SkipCategory) => string;
  getSeverityBadge: (severity: SkipSeverity) => string;
  onToggleTestSelection: (testId: string) => void;
  onToggleAllSelections: () => void;
}

const TestListTable = ({
  filteredTests,
  getCategoryColor,
  getSeverityBadge,
  onToggleTestSelection,
  onToggleAllSelections,
}: TestListTableProps) => {
  return (
    <div className="card shadow-sm">
      <div className="card-header d-flex justify-content-between align-items-center">
        <h5 className="mb-0">
          <i className="bi bi-list-check me-2"></i>
          Daftar Tes yang Diabaikan
          <span className="badge bg-secondary ms-2">{filteredTests.length}</span>
        </h5>
        <div className="form-check">
          <input
            type="checkbox"
            className="form-check-input"
            id="selectAll"
            checked={filteredTests.length > 0 && filteredTests.every(t => t.isSelected)}
            onChange={onToggleAllSelections}
          />
          <label className="form-check-label ms-2" htmlFor="selectAll">
            Pilih Semua
          </label>
        </div>
      </div>
      <div className="card-body p-0">
        {filteredTests.length > 0 ? (
          <div className="table-responsive">
            <table className="table table-hover mb-0">
              <thead className="table-light">
                <tr>
                  <th style={{ width: '50px' }}></th>
                  <th>Tes</th>
                  <th>File</th>
                  <th>Kategori</th>
                  <th>Keparahan</th>
                  <th>Rekomendasi</th>
                  <th>Tanggal</th>
                </tr>
              </thead>
              <tbody>
                {filteredTests.map(test => (
                  <tr key={test.id} className={test.isSelected ? 'table-active' : ''}>
                    <td>
                      <input
                        type="checkbox"
                        className="form-check-input"
                        checked={test.isSelected || false}
                        onChange={() => onToggleTestSelection(test.id)}
                      />
                    </td>
                    <td>
                      <div>
                        <strong>{test.testName}</strong>
                        {test.skipReason && (
                          <small className="d-block text-muted">
                            <i className="bi bi-chat-quote me-1"></i>
                            {test.skipReason}
                          </small>
                        )}
                      </div>
                    </td>
                    <td>
                      <code className="small">{test.testFile}</code>
                    </td>
                    <td>
                      <span className={`badge bg-${getCategoryColor(test.category)}`}>
                        {test.category.replace('-', ' ')}
                      </span>
                    </td>
                    <td>
                      <span className={`badge ${getSeverityBadge(test.severity)}`}>
                        {test.severity}
                      </span>
                    </td>
                    <td>
                      <small>{test.recommendationText}</small>
                    </td>
                    <td>
                      <small>{test.skipDate.toLocaleDateString('id-ID')}</small>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="text-center py-5">
            <i className="bi bi-search text-muted fs-1"></i>
            <p className="text-muted mt-3 mb-0">
              Tidak ada tes yang ditemukan dengan filter saat ini
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default memo(TestListTable);
