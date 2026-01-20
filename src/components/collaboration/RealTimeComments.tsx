'use client'

import React, { useState } from 'react'
import { RealTimeComment, CursorPosition } from '@/types/collaboration'

interface RealTimeCommentsProps {
  postId: number
  comments: RealTimeComment[]
  currentUserId: number
  onResolveComment: (commentId: string) => void
  onPositionClick: (position: CursorPosition) => void
}

export default function RealTimeComments({
  comments,
  currentUserId,
  onResolveComment,
  onPositionClick
}: RealTimeCommentsProps) {
  const [expandedComments, setExpandedComments] = useState<Set<string>>(new Set())

  const toggleExpand = (commentId: string) => {
    setExpandedComments(prev => {
      const next = new Set(prev)
      if (next.has(commentId)) {
        next.delete(commentId)
      } else {
        next.add(commentId)
      }
      return next
    })
  }

  const formatTime = (timestamp: number): string => {
    const now = Date.now()
    const diff = now - timestamp

    const seconds = Math.floor(diff / 1000)
    const minutes = Math.floor(diff / 60000)
    const hours = Math.floor(diff / 3600000)
    const days = Math.floor(diff / 86400000)

    if (seconds < 60) return 'baru saja'
    if (minutes < 60) return `${minutes} menit yang lalu`
    if (hours < 24) return `${hours} jam yang lalu`
    return `${days} hari yang lalu`
  }

  const activeComments = comments.filter(c => !c.resolved)
  const resolvedComments = comments.filter(c => c.resolved)

  return (
    <div className="real-time-comments">
      <div className="comments-header">
        <h4>Komentar Aktif ({activeComments.length})</h4>
        {resolvedComments.length > 0 && (
          <button
            type="button"
            className="btn btn-link btn-sm"
            onClick={() => toggleExpand('resolved')}
          >
            {expandedComments.has('resolved') ? 'Sembunyikan' : 'Tampilkan'} Terselesaikan ({resolvedComments.length})
          </button>
        )}
      </div>

      <div className="comments-list">
        {activeComments.length === 0 && resolvedComments.length === 0 && (
          <div className="no-comments">Belum ada komentar</div>
        )}

        {activeComments.map(comment => (
          <CommentItem
            key={comment.id}
            comment={comment}
            isExpanded={expandedComments.has(comment.id)}
            onToggleExpand={() => toggleExpand(comment.id)}
            onResolve={onResolveComment}
            onPositionClick={onPositionClick}
            isOwner={comment.authorId === currentUserId}
            formatTime={formatTime}
          />
        ))}

        {expandedComments.has('resolved') && resolvedComments.map(comment => (
          <CommentItem
            key={comment.id}
            comment={comment}
            isExpanded={expandedComments.has(comment.id)}
            onToggleExpand={() => toggleExpand(comment.id)}
            onResolve={onResolveComment}
            onPositionClick={onPositionClick}
            isOwner={comment.authorId === currentUserId}
            formatTime={formatTime}
          />
        ))}
      </div>
    </div>
  )
}

interface CommentItemProps {
  comment: RealTimeComment
  isExpanded: boolean
  onToggleExpand: () => void
  onResolve: (commentId: string) => void
  onPositionClick: (position: CursorPosition) => void
  isOwner: boolean
  formatTime: (timestamp: number) => string
}

function CommentItem({
  comment,
  isExpanded,
  onToggleExpand,
  onResolve,
  onPositionClick,
  isOwner,
  formatTime
}: CommentItemProps) {
  const positionLabel = `Baris ${comment.position.line}, Kolom ${comment.position.column}`

  return (
    <div className={`comment-item ${comment.resolved ? 'resolved' : ''}`}>
      <div className="comment-header">
        <div className="comment-author">
          <strong>{comment.authorName}</strong>
          <span className="comment-time">{formatTime(comment.createdAt)}</span>
        </div>
        <div className="comment-actions">
          <button
            type="button"
            className="btn btn-link btn-sm"
            onClick={() => onPositionClick(comment.position)}
            title={positionLabel}
          >
            <i className="bi bi-crosshair"></i>
          </button>
          {!comment.resolved && isOwner && (
            <button
              type="button"
              className="btn btn-link btn-sm text-success"
              onClick={() => onResolve(comment.id)}
              title="Selesaikan komentar"
            >
              <i className="bi bi-check-circle"></i>
            </button>
          )}
          <button
            type="button"
            className="btn btn-link btn-sm"
            onClick={onToggleExpand}
            title={isExpanded ? 'Chevron up - Sembunyikan detail' : 'Chevron down - Tampilkan detail'}
          >
            <i className={`bi ${isExpanded ? 'bi-chevron-up' : 'bi-chevron-down'}`}></i>
          </button>
        </div>
      </div>

      <div className="comment-content">
        <p>{comment.content}</p>
        {comment.resolved && (
          <span className="resolved-badge">Terselesaikan</span>
        )}
      </div>

      {isExpanded && (
        <div className="comment-details">
          <div className="comment-position">
            <i className="bi bi-geo-alt"></i>
            <span>{positionLabel}</span>
          </div>
        </div>
      )}
    </div>
  )
}
