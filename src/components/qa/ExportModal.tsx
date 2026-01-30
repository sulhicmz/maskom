'use client';

import { memo } from 'react';
import Button from '@/components/ui/Button';

interface ExportModalProps {
  show: boolean;
  exportFormat: 'pdf' | 'csv';
  filteredTestsCount: number;
  onExportFormatChange: (format: 'pdf' | 'csv') => void;
  onExport: () => void;
  onClose: () => void;
}

const ExportModal = ({
  show,
  exportFormat,
  filteredTestsCount,
  onExportFormatChange,
  onExport,
  onClose,
}: ExportModalProps) => {
  if (!show) {
    return null;
  }

  return (
    <div className="modal show d-block" tabIndex={-1}>
      <div className="modal-dialog">
        <div className="modal-content">
          <div className="modal-header">
            <h5 className="modal-title">Ekspor Laporan Tes yang Diabaikan</h5>
            <button
              type="button"
              className="btn-close"
              onClick={onClose}
            ></button>
          </div>
          <div className="modal-body">
            <div className="mb-3">
              <label className="form-label">Format Ekspor</label>
              <select
                className="form-select"
                value={exportFormat}
                onChange={(e) => onExportFormatChange(e.target.value as 'pdf' | 'csv')}
              >
                <option value="csv">CSV (untuk analisis)</option>
                <option value="pdf">PDF (untuk tim)</option>
              </select>
            </div>
            <div className="alert alert-info">
              <i className="bi bi-info-circle me-2"></i>
              Ekspor akan mencakup {filteredTestsCount} tes yang difilter.
            </div>
          </div>
          <div className="modal-footer">
            <Button
              variant="secondary"
              onClick={onClose}
            >
              Batal
            </Button>
            <Button variant="primary" onClick={onExport}>
              <i className="bi bi-download me-2"></i>
              Ekspor
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default memo(ExportModal);
