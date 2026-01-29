'use client'

import React, { useState, useEffect, memo } from 'react'
import { DraftContent } from '@/types/collaboration'
import {
  CollaborativeHistoryEntry,
  getHistory,
  rollbackToVersion,
  clearHistory,
  getHistoryStats,
  formatHistoryTime,
  formatHistoryDate
} from '@/utils/collaboration/collaborativeHistory'

interface HistoryVisualizationProps {
  postId: number
  currentContent: DraftContent
  onRollback: (content: DraftContent, entry: CollaborativeHistoryEntry) => void
}

const HistoryVisualization = ({
  postId,
  currentContent,
  onRollback
}: HistoryVisualizationProps) => {
  const [history, setHistory] = useState<CollaborativeHistoryEntry[]>([])
  const [selectedEntry, setSelectedEntry] = useState<CollaborativeHistoryEntry | null>(null)
  const [showConfirmRollback, setShowConfirmRollback] = useState(false)
  const [showConfirmClear, setShowConfirmClear] = useState(false)

  useEffect(() => {
    const loadHistory = () => {
      setHistory(getHistory(postId))
    }

    loadHistory()

    window.addEventListener('storage', loadHistory)
    return () => window.removeEventListener('storage', loadHistory)
  }, [postId])

  const stats = getHistoryStats(postId)

  const handleRollback = () => {
    if (!selectedEntry) return

    const content = rollbackToVersion(postId, selectedEntry.id)
    if (content) {
      onRollback(content, selectedEntry)
      setShowConfirmRollback(false)
      setSelectedEntry(null)
    }
  }

  const handleClearHistory = () => {
    clearHistory(postId)
    setHistory([])
    setShowConfirmClear(false)
  }

  const compareContent = (entry: CollaborativeHistoryEntry) => {
    const isSame = JSON.stringify(entry.content) === JSON.stringify(currentContent)
    return isSame
  }

  return (
    <div className="history-visualization">
      <div className="history-header">
        <h4>Riwayat Kolaborasi</h4>
        <div className="header-actions">
          <button
            type="button"
            className="btn btn-outline-danger btn-sm"
            onClick={() => setShowConfirmClear(true)}
            disabled={history.length === 0}
          >
            <i className="bi bi-trash"></i> Hapus Riwayat
          </button>
        </div>
      </div>

      <div className="history-stats">
        <div className="stat-item">
          <strong>{stats.totalEntries}</strong>
          <span>Total Entri</span>
        </div>
        <div className="stat-item">
          <strong>{stats.last24Hours}</strong>
          <span>24 Jam Terakhir</span>
        </div>
        <div className="stat-item">
          <strong>{stats.last7Days}</strong>
          <span>7 Hari Terakhir</span>
        </div>
      </div>

      {stats.authorCounts.length > 0 && (
        <div className="author-breakdown">
          <h5>Per Author</h5>
          {stats.authorCounts.map(({ authorId, authorName, count }) => (
            <div key={authorId} className="author-stat">
              <span className="author-name">{authorName}</span>
              <span className="author-count">{count} entri</span>
            </div>
          ))}
        </div>
      )}

      <div className="history-list">
        {history.length === 0 && (
          <div className="no-history">Belum ada riwayat</div>
        )}

        {history.map(entry => (
          <HistoryEntryItem
            key={entry.id}
            entry={entry}
            isSelected={selectedEntry?.id === entry.id}
            isCurrent={compareContent(entry)}
            onSelect={() => setSelectedEntry(entry)}
            formatHistoryTime={formatHistoryTime}
            formatHistoryDate={formatHistoryDate}
          />
        ))}
      </div>

      {selectedEntry && (
        <div className="history-preview">
          <div className="preview-header">
            <h5>Pratinjau Versi</h5>
            <button
              type="button"
              className="btn btn-close"
              onClick={() => setSelectedEntry(null)}
            />
          </div>
          <div className="preview-info">
            <p><strong>Penulis:</strong> {selectedEntry.authorName}</p>
            <p><strong>Waktu:</strong> {formatHistoryDate(selectedEntry.timestamp)}</p>
            {selectedEntry.description && (
              <p><strong>Deskripsi:</strong> {selectedEntry.description}</p>
            )}
          </div>
          <div className="preview-content">
            <h6>Judul</h6>
            <p>{selectedEntry.content.title}</p>
            <h6>Deskripsi</h6>
            <p>{selectedEntry.content.description}</p>
            <h6>Isi</h6>
            <pre className="content-preview">{selectedEntry.content.content}</pre>
          </div>
          <div className="preview-actions">
            <button
              type="button"
              className="btn btn-primary"
              onClick={() => setShowConfirmRollback(true)}
              disabled={compareContent(selectedEntry)}
            >
              <i className="bi bi-arrow-counterclockwise"></i> Kembalikan ke Versi Ini
            </button>
          </div>
        </div>
      )}

      {showConfirmRollback && (
        <div className="confirm-modal">
          <div className="confirm-content">
            <h5>Konfirmasi Kembalikan</h5>
            <p>
              Apakah Anda yakin ingin mengembalikan konten ke versi ini?
              <br />
              <small>
                Penulis: {selectedEntry?.authorName}
                <br />
                Waktu: {selectedEntry ? formatHistoryDate(selectedEntry.timestamp) : ''}
              </small>
            </p>
            <div className="confirm-actions">
              <button
                type="button"
                className="btn btn-secondary"
                onClick={() => setShowConfirmRollback(false)}
              >
                Batal
              </button>
              <button
                type="button"
                className="btn btn-primary"
                onClick={handleRollback}
              >
                Ya, Kembalikan
              </button>
            </div>
          </div>
        </div>
      )}

      {showConfirmClear && (
        <div className="confirm-modal">
          <div className="confirm-content">
            <h5>Konfirmasi Hapus Riwayat</h5>
            <p>
              Apakah Anda yakin ingin menghapus semua riwayat kolaborasi untuk postingan ini?
              <br />
              <small>Tindakan ini tidak dapat dibatalkan.</small>
            </p>
            <div className="confirm-actions">
              <button
                type="button"
                className="btn btn-secondary"
                onClick={() => setShowConfirmClear(false)}
              >
                Batal
              </button>
              <button
                type="button"
                className="btn btn-danger"
                onClick={handleClearHistory}
              >
                Ya, Hapus
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

interface HistoryEntryItemProps {
  entry: CollaborativeHistoryEntry
  isSelected: boolean
  isCurrent: boolean
  onSelect: () => void
  formatHistoryTime: (timestamp: number) => string
  formatHistoryDate: (timestamp: number) => string
}

function HistoryEntryItem({
  entry,
  isSelected,
  isCurrent,
  onSelect,
  formatHistoryTime,
  formatHistoryDate
}: HistoryEntryItemProps) {
  return (
    <div
      className={`history-entry-item ${isSelected ? 'selected' : ''} ${isCurrent ? 'current' : ''}`}
      onClick={onSelect}
    >
      <div className="entry-header">
        <div className="entry-author">
          <strong>{entry.authorName}</strong>
          <span className="entry-time">{formatHistoryTime(entry.timestamp)}</span>
        </div>
        {isCurrent && (
          <span className="current-badge">Versi Saat Ini</span>
        )}
      </div>

      {entry.description && (
        <div className="entry-description">
          <em>{entry.description}</em>
        </div>
      )}

      <div className="entry-meta">
        <small>{formatHistoryDate(entry.timestamp)}</small>
      </div>
    </div>
  )
}

export default memo(HistoryVisualization)
