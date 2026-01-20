"use client"

import React, { useState, useEffect, useCallback } from 'react';
import { BlogPostVersion, VersionDiff } from '@/types/blog';
import { versionStorage } from '@/utils/versionStorage';
import { formatTimestamp } from '@/utils/dateFormat';
import { getDiffBadgeClass } from '@/utils/diffBadge';

interface VersionHistoryPanelProps {
   postId: number;
   onRestore: (version: BlogPostVersion) => void;
   isVisible: boolean;
   onClose: () => void;
}

const VersionHistoryPanel: React.FC<VersionHistoryPanelProps> = ({
   postId,
   onRestore,
   isVisible,
   onClose
}) => {
   const [versions, setVersions] = useState<BlogPostVersion[]>([]);
   const [selectedVersion, setSelectedVersion] = useState<BlogPostVersion | null>(null);
   const [comparisonDiffs, setComparisonDiffs] = useState<VersionDiff[]>([]);
   const [showCompare, setShowCompare] = useState(false);

   const loadVersions = useCallback(() => {
      const loadedVersions = versionStorage.getPostVersions(postId);
      setVersions(loadedVersions);
   }, [postId]);

   useEffect(() => {
      if (isVisible) {
         loadVersions();
      }
   }, [isVisible, loadVersions]);

    const handleRestore = useCallback((version: BlogPostVersion) => {
       onRestore(version);
       onClose();
    }, [onRestore, onClose]);

    const handleCompare = useCallback((version: BlogPostVersion) => {
       if (!selectedVersion || selectedVersion.id === version.id) return;
 
       const diffs = versionStorage.compareVersions(selectedVersion, version);
       setComparisonDiffs(diffs);
       setShowCompare(true);
    }, [selectedVersion]);

    const handleDelete = useCallback((versionId: string) => {
       versionStorage.deleteVersion(postId, versionId);
       loadVersions();
       if (selectedVersion?.id === versionId) {
          setSelectedVersion(null);
          setShowCompare(false);
        }
     }, [postId, selectedVersion, loadVersions]);

    if (!isVisible) return null;

   return (
      <div className="version-history-overlay">
         <div className="version-history-panel">
            <div className="version-history-header">
               <h3>Riwayat Versi</h3>
               <button 
                  onClick={onClose}
                  className="close-btn"
                  aria-label="Tutup"
               >
                  ✕
               </button>
            </div>

            <div className="version-history-content">
               {versions.length === 0 ? (
                  <div className="no-versions">
                     <p>Belum ada versi yang tersimpan</p>
                  </div>
               ) : (
                  <>
                     {!showCompare ? (
                        <>
                           <div className="version-list">
                              {versions.map((version) => (
                                 <div 
                                    key={version.id}
                                    className={`version-item ${selectedVersion?.id === version.id ? 'selected' : ''}`}
                                    onClick={() => setSelectedVersion(version)}
                                 >
                                    <div className="version-info">
                                       <div className="version-header">
                                           <span className="version-time">
                                              {formatTimestamp(version.timestamp)}
                                           </span>
                                          <span className="version-author">
                                             oleh {version.author}
                                          </span>
                                       </div>
                                       {version.notes && (
                                          <p className="version-notes">
                                             {version.notes}
                                          </p>
                                       )}
                                       <div className="version-fields">
                                          {Object.keys(version.content).slice(0, 3).map((field) => (
                                             <span key={field} className="version-field-badge">
                                                {field}
                                             </span>
                                          ))}
                                          {Object.keys(version.content).length > 3 && (
                                             <span className="version-field-more">
                                                +{Object.keys(version.content).length - 3} lagi
                                             </span>
                                          )}
                                       </div>
                                    </div>
                                    <div className="version-actions">
                                       {selectedVersion?.id === version.id ? (
                                          <>
                                             <button
                                                onClick={(e) => {
                                                   e.stopPropagation();
                                                   handleCompare(version);
                                                }}
                                                className="version-btn version-btn-compare"
                                                disabled={!selectedVersion || selectedVersion.id === version.id}
                                             >
                                                🔄 Bandingkan
                                             </button>
                                             <button
                                                onClick={(e) => {
                                                   e.stopPropagation();
                                                   handleRestore(version);
                                                }}
                                                className="version-btn version-btn-restore"
                                             >
                                                ↩ Pulihkan
                                             </button>
                                             <button
                                                onClick={(e) => {
                                                   e.stopPropagation();
                                                   handleDelete(version.id);
                                                }}
                                                className="version-btn version-btn-delete"
                                             >
                                                🗑️ Hapus
                                             </button>
                                          </>
                                       ) : (
                                          <button
                                             onClick={(e) => {
                                                e.stopPropagation();
                                                setSelectedVersion(version);
                                             }}
                                             className="version-btn version-btn-select"
                                          >
                                             👁️ Lihat
                                          </button>
                                       )}
                                    </div>
                                 </div>
                              ))}
                           </div>

                           {selectedVersion && (
                              <div className="version-details">
                                 <h4>Detail Versi</h4>
                                 <div className="version-detail-grid">
                                     <div className="version-detail-item">
                                        <span className="version-detail-label">Waktu:</span>
                                        <span>{formatTimestamp(selectedVersion.timestamp)}</span>
                                     </div>
                                    <div className="version-detail-item">
                                       <span className="version-detail-label">Penulis:</span>
                                       <span>{selectedVersion.author}</span>
                                    </div>
                                    <div className="version-detail-item">
                                       <span className="version-detail-label">Catatan:</span>
                                       <span>{selectedVersion.notes || '-'}</span>
                                    </div>
                                 </div>
                                 <div className="version-content-preview">
                                    <h5>Isi Konten:</h5>
                                    <pre>
                                       {JSON.stringify(selectedVersion.content, null, 2)}
                                    </pre>
                                 </div>
                              </div>
                           )}
                        </>
                     ) : (
                        <div className="version-compare">
                           <div className="compare-header">
                              <h4>Perbandingan Versi</h4>
                              <button
                                 onClick={() => setShowCompare(false)}
                                 className="version-btn version-btn-close"
                              >
                                 ← Kembali
                              </button>
                           </div>
                           {comparisonDiffs.length === 0 ? (
                              <p className="no-diffs">Tidak ada perubahan</p>
                           ) : (
                              <div className="diff-list">
                                 {comparisonDiffs.map((diff, index) => (
                                    <div 
                                       key={index} 
                                       className={`diff-item ${getDiffBadgeClass(diff.type)}`}
                                    >
                                       <span className="diff-field">{diff.field}</span>
                                       <span className={`diff-value diff-${diff.type}`}>
                                          {diff.type === 'removed' && (
                                             <span className="diff-old">
                                                {JSON.stringify(diff.oldValue)}
                                             </span>
                                          )}
                                          {diff.type === 'added' && (
                                             <span className="diff-new">
                                                {JSON.stringify(diff.newValue)}
                                             </span>
                                          )}
                                          {diff.type === 'changed' && (
                                             <>
                                                <span className="diff-old">
                                                   {JSON.stringify(diff.oldValue)}
                                                </span>
                                                <span className="diff-arrow">→</span>
                                                <span className="diff-new">
                                                   {JSON.stringify(diff.newValue)}
                                                </span>
                                             </>
                                          )}
                                       </span>
                                       <span className={`diff-badge ${getDiffBadgeClass(diff.type)}`}>
                                          {diff.type === 'added' && 'Ditambahkan'}
                                          {diff.type === 'removed' && 'Dihapus'}
                                          {diff.type === 'changed' && 'Diubah'}
                                       </span>
                                    </div>
                                 ))}
                              </div>
                           )}
                        </div>
                     )}
                  </>
               )}
            </div>
         </div>
       </div>
    );
 };

VersionHistoryPanel.displayName = 'VersionHistoryPanel';

export default React.memo(VersionHistoryPanel);
