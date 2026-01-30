'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { useTheme } from '@/contexts/ThemeContext';
import {
  personalizationEngine,
  type PersonalizationRuleVersion,
  type PersonalizationRule,
  type RuleVersionDiff,
} from '@/utils/personalization';

interface RuleVersionHistoryPanelProps {
  rule: PersonalizationRule;
  onRestore?: (restoredRule: PersonalizationRule) => void;
  onClose?: () => void;
}

export default function RuleVersionHistoryPanel({ rule, onRestore, onClose }: RuleVersionHistoryPanelProps) {
  const { theme } = useTheme();
  const [versions, setVersions] = useState<PersonalizationRuleVersion[]>([]);
  const [selectedVersions, setSelectedVersions] = useState<[PersonalizationRuleVersion | null, PersonalizationRuleVersion | null]>([null, null]);
  const [showDiff, setShowDiff] = useState(false);
  const [diffs, setDiffs] = useState<RuleVersionDiff[]>([]);

  useEffect(() => {
    const loadVersions = () => {
      const ruleVersions = personalizationEngine.getRuleVersions(rule.id);
      setVersions(ruleVersions);
    };

    loadVersions();
  }, [rule.id]);

  const formatDate = useCallback((timestamp: string) => {
    const date = new Date(timestamp);
    return date.toLocaleDateString('id-ID', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  }, []);

  const handleRestore = useCallback(async (version: PersonalizationRuleVersion) => {
    if (confirm(`Apakah Anda yakin ingin mengembalikan aturan ke versi dari ${formatDate(version.timestamp)}?`)) {
      const restored = personalizationEngine.restoreRuleVersion(rule.id, version.id);
      if (restored && onRestore) {
        onRestore(restored);
      }
    }
  }, [rule.id, onRestore, formatDate]);

  const handleDelete = useCallback((version: PersonalizationRuleVersion) => {
    if (confirm(`Apakah Anda yakin ingin menghapus versi ini?`)) {
      personalizationEngine.deleteRuleVersion(rule.id, version.id);
      setVersions(versions.filter(v => v.id !== version.id));
    }
  }, [versions, rule.id]);

  const handleCompare = useCallback((version1: PersonalizationRuleVersion, version2: PersonalizationRuleVersion) => {
    setSelectedVersions([version1, version2]);
    setShowDiff(true);
    const comparison = personalizationEngine.compareRuleVersions(rule.id, version1.id, version2.id);
    setDiffs(comparison || []);
  }, [rule.id]);

  return (
    <div className={`card ${theme === 'dark' ? 'bg-secondary text-light' : ''}`}>
      <div className="card-header d-flex justify-content-between align-items-center">
        <h5 className="mb-0">Riwayat Versi</h5>
        {onClose && (
          <button
            type="button"
            className="btn-close"
            onClick={onClose}
          />
        )}
      </div>
      <div className="card-body">
        {versions.length === 0 ? (
          <p className="text-muted">Belum ada riwayat versi untuk aturan ini</p>
        ) : (
          <div>
            <div className="mb-3">
              <button
                className="btn btn-outline-primary btn-sm"
                onClick={() => {
                  setSelectedVersions([versions[0], versions[1]]);
                  setShowDiff(true);
                  const comparison = personalizationEngine.compareRuleVersions(rule.id, versions[0].id, versions[1].id);
                  setDiffs(comparison || []);
                }}
                disabled={versions.length < 2}
              >
                Bandingkan 2 Versi Terakhir
              </button>
            </div>
            <div className="list-group">
              {versions.map((version, index) => (
                <div
                  key={version.id}
                  className={`list-group-item ${theme === 'dark' ? 'bg-dark border-secondary' : ''}`}
                >
                  <div className="d-flex justify-content-between align-items-start">
                    <div>
                      <h6 className="mb-1">Versi {versions.length - index}</h6>
                      <small className="text-muted">{formatDate(version.timestamp)}</small>
                      {version.notes && (
                        <p className="mb-1 mt-2"><strong>Catatan:</strong> {version.notes}</p>
                      )}
                      {version.author && (
                        <p className="mb-0"><strong>Oleh:</strong> {version.author}</p>
                      )}
                      {version.performanceMetrics && (
                        <div className="mt-2">
                          <small className="text-muted">
                            <strong>Metrik Kinerja:</strong>{' '}
                            {version.performanceMetrics.views !== undefined && `${version.performanceMetrics.views} tayangan, `}
                            {version.performanceMetrics.clicks !== undefined && `${version.performanceMetrics.clicks} klik, `}
                            {version.performanceMetrics.liftPercentage !== undefined && `${version.performanceMetrics.liftPercentage.toFixed(1)}% lift`}
                          </small>
                        </div>
                      )}
                    </div>
                    <div className="d-flex gap-2">
                      <button
                        className="btn btn-sm btn-outline-success"
                        onClick={() => handleRestore(version)}
                        disabled={index === 0}
                      >
                        Pulihkan
                      </button>
                      <button
                        className="btn btn-sm btn-outline-danger"
                        onClick={() => handleDelete(version)}
                        disabled={index === 0}
                      >
                        Hapus
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {showDiff && selectedVersions[0] && selectedVersions[1] && (
        <div className={`modal show`} style={{ display: 'block' }}>
          <div className="modal-dialog modal-lg">
            <div className={`modal-content ${theme === 'dark' ? 'bg-dark text-light' : ''}`}>
              <div className="modal-header">
                <h5 className="modal-title">Bandingkan Versi</h5>
                <button
                  type="button"
                  className="btn-close"
                  onClick={() => setShowDiff(false)}
                />
              </div>
              <div className="modal-body">
                <h6>Versi 1: {formatDate(selectedVersions[0].timestamp)}</h6>
                <h6>Versi 2: {formatDate(selectedVersions[1].timestamp)}</h6>
                <hr />
                {diffs.length === 0 ? (
                  <p className="text-muted">Tidak ada perbedaan antara kedua versi</p>
                ) : (
                  <div className="list-group">
                    {diffs.map((diff, index) => (
                      <div
                        key={index}
                        className={`list-group-item ${diff.type === 'changed' ? 'list-group-item-warning' : diff.type === 'added' ? 'list-group-item-success' : 'list-group-item-danger'}`}
                      >
                        <strong>{diff.field}</strong>
                        <br />
                        {diff.type === 'added' && (
                          <span className="text-success">+ {JSON.stringify(diff.newValue)}</span>
                        )}
                        {diff.type === 'removed' && (
                          <span className="text-danger">- {JSON.stringify(diff.oldValue)}</span>
                        )}
                        {diff.type === 'changed' && (
                          <div>
                            <span className="text-danger">- {JSON.stringify(diff.oldValue)}</span>
                            <br />
                            <span className="text-success">+ {JSON.stringify(diff.newValue)}</span>
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                )}
              </div>
              <div className="modal-footer">
                <button
                  type="button"
                  className="btn btn-secondary"
                  onClick={() => setShowDiff(false)}
                >
                  Tutup
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
