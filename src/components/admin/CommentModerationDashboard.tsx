'use client';

import React, { useState, useMemo } from 'react';
import { BlogCommentItem, CommentModerationStatus } from '@/types/data';
import { calculateModerationStats, bulkModerateComments, filterCommentsByStatus } from '@/utils/moderation';
import Button from '@/components/ui/Button';
import StatusBadge from '@/components/ui/StatusBadge';

const CommentModerationDashboard = () => {
  const [comments, setComments] = useState<BlogCommentItem[]>([]);
  const [selectedStatus, setSelectedStatus] = useState<CommentModerationStatus | 'all'>('pending');
  const [selectedComments, setSelectedComments] = useState<number[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [message, setMessage] = useState('');
  const [expandedComment, setExpandedComment] = useState<number | null>(null);

  const stats = useMemo(() => calculateModerationStats(comments), [comments]);

  const filteredComments = useMemo(
    () => filterCommentsByStatus(comments, selectedStatus),
    [comments, selectedStatus]
  );

  const handleSelectComment = (commentId: number) => {
    setSelectedComments((prev) =>
      prev.includes(commentId)
        ? prev.filter((id) => id !== commentId)
        : [...prev, commentId]
    );
  };

  const handleSelectAll = () => {
    if (selectedComments.length === filteredComments.length) {
      setSelectedComments([]);
    } else {
      setSelectedComments(filteredComments.map((comment) => comment.id));
    }
  };

  const handleBulkModerate = async (newStatus: CommentModerationStatus) => {
    setLoading(true);
    setError('');
    setMessage('');

    try {
      const moderatorId = 1;
      const updatedComments = bulkModerateComments(
        comments,
        selectedComments,
        newStatus,
        moderatorId
      );
      setComments(updatedComments);
      setSelectedComments([]);

      const statusMessage = {
        approved: 'Komentar berhasil disetujui',
        rejected: 'Komentar berhasil ditolak',
        spam: 'Komentar ditandai sebagai spam',
      };
      setMessage(statusMessage[newStatus] || 'Moderasi berhasil');

      setTimeout(() => setMessage(''), 3000);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Gagal melakukan moderasi');
    } finally {
      setLoading(false);
    }
  };

  const getStatusColor = (status: CommentModerationStatus): string => {
    const colorMap = {
      pending: 'warning',
      approved: 'success',
      rejected: 'danger',
      spam: 'secondary',
    };
    return colorMap[status] || 'primary';
  };

  const getStatusLabel = (status: CommentModerationStatus): string => {
    const labelMap = {
      pending: 'Menunggu',
      approved: 'Disetujui',
      rejected: 'Ditolak',
      spam: 'Spam',
    };
    return labelMap[status] || status;
  };

  return (
    <div className="comment-moderation-dashboard">
      <div className="container">
        <h1 className="mb-4">Dasbor Moderasi Komentar</h1>

        {message && (
          <div className="alert alert-success" role="alert">
            {message}
          </div>
        )}

        {error && (
          <div className="alert alert-danger" role="alert">
            {error}
          </div>
        )}

        <div className="moderation-stats mb-4">
          <div className="row">
            <div className="col-md-3">
              <div className="stat-card">
                <h3>{stats.total}</h3>
                <p>Total Komentar</p>
              </div>
            </div>
            <div className="col-md-3">
              <div className="stat-card warning">
                <h3>{stats.pending}</h3>
                <p>Menunggu</p>
              </div>
            </div>
            <div className="col-md-3">
              <div className="stat-card success">
                <h3>{stats.approved}</h3>
                <p>Disetujui</p>
              </div>
            </div>
            <div className="col-md-3">
              <div className="stat-card danger">
                <h3>{stats.rejected + stats.spam}</h3>
                <p>Ditolak/Spam</p>
              </div>
            </div>
          </div>
        </div>

        <div className="filter-bar mb-4">
          <div className="row align-items-center">
            <div className="col-md-4">
              <label className="form-label">Status Filter:</label>
              <select
                className="form-select"
                value={selectedStatus}
                onChange={(e) => setSelectedStatus(e.target.value as CommentModerationStatus | 'all')}
              >
                <option value="all">Semua Status</option>
                <option value="pending">Menunggu</option>
                <option value="approved">Disetujui</option>
                <option value="rejected">Ditolak</option>
                <option value="spam">Spam</option>
              </select>
            </div>
            <div className="col-md-8 text-end">
              <p className="mb-0">{filteredComments.length} komentar ditampilkan</p>
            </div>
          </div>
        </div>

        {selectedComments.length > 0 && (
          <div className="bulk-actions mb-4">
            <div className="alert alert-info">
              <span className="me-2">{selectedComments.length} komentar dipilih</span>
              <Button
                onClick={() => handleBulkModerate('approved')}
                variant="success"
                disabled={loading}
                className="me-2"
              >
                {loading ? 'Memproses...' : 'Setujui Terpilih'}
              </Button>
              <Button
                onClick={() => handleBulkModerate('rejected')}
                variant="danger"
                disabled={loading}
                className="me-2"
              >
                {loading ? 'Memproses...' : 'Tolak Terpilih'}
              </Button>
              <Button
                onClick={() => handleBulkModerate('spam')}
                variant="secondary"
                disabled={loading}
              >
                {loading ? 'Memproses...' : 'Tandai Spam'}
              </Button>
            </div>
          </div>
        )}

        <div className="comments-table">
          {filteredComments.length === 0 ? (
            <div className="text-center py-5 text-muted">
              <p>Tidak ada komentar untuk ditampilkan</p>
            </div>
          ) : (
            <table className="table table-striped table-hover">
              <thead>
                <tr>
                  <th className="col-checkbox">
                    <input
                      type="checkbox"
                      checked={
                        selectedComments.length === filteredComments.length &&
                        filteredComments.length > 0
                      }
                      onChange={handleSelectAll}
                      disabled={loading}
                    />
                  </th>
                  <th>Penulis</th>
                  <th>Konten</th>
                  <th>Status</th>
                  <th>Tanggal</th>
                  <th>Aksi</th>
                </tr>
              </thead>
              <tbody>
                {filteredComments.map((comment) => (
                  <tr key={comment.id}>
                    <td>
                      <input
                        type="checkbox"
                        checked={selectedComments.includes(comment.id)}
                        onChange={() => handleSelectComment(comment.id)}
                        disabled={loading}
                      />
                    </td>
                    <td>
                      <div className="d-flex align-items-center">
                        {comment.avatar && (
                          <img
                            src={comment.avatar.src}
                            alt={comment.name}
                            className="avatar-sm me-2"
                            style={{ width: '32px', height: '32px', borderRadius: '50%' }}
                          />
                        )}
                        <span>{comment.name}</span>
                      </div>
                    </td>
                    <td>
                      <div className="comment-content">
                        <p
                          className={`mb-0 ${expandedComment === comment.id ? '' : 'text-truncate'}`}
                          style={{
                            maxWidth: '300px',
                            whiteSpace: 'nowrap',
                            overflow: 'hidden',
                            textOverflow: 'ellipsis',
                          }}
                        >
                          {comment.content}
                        </p>
                        {comment.content.length > 100 && (
                          <button
                            className="btn-link btn-sm p-0"
                            onClick={() =>
                              setExpandedComment(
                                expandedComment === comment.id ? null : comment.id
                              )
                            }
                          >
                            {expandedComment === comment.id ? 'Tutup' : 'Lihat Selengkapnya'}
                          </button>
                        )}
                      </div>
                    </td>
                    <td>
                      <StatusBadge type={getStatusColor(comment.status)}>
                        {getStatusLabel(comment.status)}
                      </StatusBadge>
                    </td>
                    <td>{comment.date}</td>
                    <td>
                      <div className="btn-group btn-group-sm">
                        {comment.status === 'pending' && (
                          <>
                            <Button
                              variant="success"
                              size="sm"
                              onClick={() => {
                                setSelectedComments([comment.id]);
                                handleBulkModerate('approved');
                              }}
                              disabled={loading}
                            >
                              Setujui
                            </Button>
                            <Button
                              variant="danger"
                              size="sm"
                              onClick={() => {
                                setSelectedComments([comment.id]);
                                handleBulkModerate('rejected');
                              }}
                              disabled={loading}
                            >
                              Tolak
                            </Button>
                            <Button
                              variant="secondary"
                              size="sm"
                              onClick={() => {
                                setSelectedComments([comment.id]);
                                handleBulkModerate('spam');
                              }}
                              disabled={loading}
                            >
                              Spam
                            </Button>
                          </>
                        )}
                        {comment.status === 'approved' && (
                          <Button
                            variant="warning"
                            size="sm"
                            onClick={() => {
                              setSelectedComments([comment.id]);
                              handleBulkModerate('rejected');
                            }}
                            disabled={loading}
                          >
                            Tolak
                          </Button>
                        )}
                        {comment.status !== 'pending' && (
                          <Button
                            variant="primary"
                            size="sm"
                            onClick={() => {
                              setSelectedComments([comment.id]);
                              handleBulkModerate('approved');
                            }}
                            disabled={loading}
                          >
                            Setujui Ulang
                          </Button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>
    </div>
  );
};

export default CommentModerationDashboard;
