"use client";

import React, { useState, useEffect, useCallback, useMemo, memo } from 'react';
import { useTheme } from '@/contexts/ThemeContext';
import ProtectedRoute from '@/components/common/ProtectedRoute';
import { Permission } from '@/types/permission';
import publishingPipeline from '@/utils/publishing/pipeline';
import type {
    PublishingWorkflow,
    PublishingMetrics,
    PublishingWorkflowStage,
    ApprovalAssignment,
    ContentQualityGate,
    RoleType,
    BulkOperation,
    DistributionChannel,
} from '@/types/publishing';

const STAGE_LABELS: Record<PublishingWorkflowStage, string> = {
    draft: 'Draf',
    review: 'Review',
    approved: 'Disetujui',
    scheduled: 'Terjadwal',
    published: 'Diterbitkan',
};

const ROLE_LABELS: Record<RoleType, string> = {
    editor: 'Editor',
    content_strategist: 'Penyusun Strategi Konten',
    admin: 'Admin',
};

const CHANNEL_LABELS: Record<DistributionChannel, string> = {
    web: 'Web',
    email: 'Email',
    rss: 'RSS',
    social: 'Media Sosial',
};

const APPROVAL_STATUS_LABELS: Record<ApprovalAssignment['status'], string> = {
    pending: 'Menunggu',
    approved: 'Disetujui',
    rejected: 'Ditolak',
};

const PublishingDashboard: React.FC = () => {
    const { theme } = useTheme();
    const [workflows, setWorkflows] = useState<PublishingWorkflow[]>([]);
    const [metrics, setMetrics] = useState<PublishingMetrics | null>(null);
    const [activeTab, setActiveTab] = useState<'workflow' | 'calendar' | 'metrics'>('workflow');
    const [filterStage, setFilterStage] = useState<PublishingWorkflowStage | 'all'>('all');
    const [selectedWorkflow, setSelectedWorkflow] = useState<PublishingWorkflow | null>(null);
    const [qualityGate, setQualityGate] = useState<ContentQualityGate | null>(null);
    const [loading, setLoading] = useState(true);
    const [showAssignReviewer, setShowAssignReviewer] = useState(false);
    const [reviewerName, setReviewerName] = useState('');
    const [reviewerRole, setReviewerRole] = useState<RoleType>('editor');

    const loadData = useCallback(() => {
        setLoading(true);
        setTimeout(() => {
            const allWorkflows = publishingPipeline.getWorkflows();
            setWorkflows(allWorkflows);

            const metrics = publishingPipeline.getMetrics();
            setMetrics(metrics);

            setLoading(false);
        }, 500);
    }, []);

    useEffect(() => {
        loadData();
    }, [loadData]);

    const filteredWorkflows = useMemo(() => {
        if (filterStage === 'all') {
            return workflows;
        }
        return workflows.filter((w) => w.currentStage === filterStage);
    }, [workflows, filterStage]);

    const formatDuration = (minutes: number): string => {
        if (minutes < 60) {
            return `${Math.round(minutes)} menit`;
        }
        const hours = Math.floor(minutes / 60);
        const mins = Math.round(minutes % 60);
        return `${hours} jam ${mins} menit`;
    };

    const formatDate = (isoString: string): string => {
        const date = new Date(isoString);
        return date.toLocaleString('id-ID', {
            day: '2-digit',
            month: 'short',
            year: 'numeric',
            hour: '2-digit',
            minute: '2-digit',
        });
    };

    const handleCheckQualityGate = useCallback((workflow: PublishingWorkflow) => {
        const gate = publishingPipeline.checkQualityGates(workflow.postId);
        setQualityGate(gate);
        setSelectedWorkflow(workflow);
        setActiveTab('workflow');
    }, []);

    const handleAssignReviewer = useCallback((workflow: PublishingWorkflow) => {
        setSelectedWorkflow(workflow);
        setShowAssignReviewer(true);
    }, []);

    const handleSubmitAssignReviewer = useCallback(() => {
        if (selectedWorkflow && reviewerName) {
            publishingPipeline.assignReviewer(
                `workflow_${selectedWorkflow.postId}`,
                `user_${Date.now()}`,
                reviewerName,
                reviewerRole
            );
            setShowAssignReviewer(false);
            setReviewerName('');
            setSelectedWorkflow(null);
            loadData();
        }
    }, [selectedWorkflow, reviewerName, reviewerRole, loadData]);

    const handleAdvanceStage = useCallback((workflow: PublishingWorkflow, stage: PublishingWorkflowStage) => {
        const workflowId = `workflow_${workflow.postId}`;
        const success = publishingPipeline.advanceStage(workflowId, stage, 'system');
        if (success) {
            loadData();
        }
    }, [loadData]);

    const handleBulkOperation = useCallback(async (operation: 'approve' | 'publish', postIds: number[]) => {
        const bulkOp: BulkOperation = {
            operationId: `bulk_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`,
            type: operation,
            postIds,
            status: 'pending',
            progress: 0,
            errors: [],
            createdAt: new Date().toISOString(),
        };

        await publishingPipeline.executeBulkOperation(bulkOp);
        loadData();
    }, [loadData]);

    const handleConfigureDistribution = useCallback((workflow: PublishingWorkflow, channel: DistributionChannel, enabled: boolean) => {
        const workflowId = `workflow_${workflow.postId}`;
        publishingPipeline.configureDistribution(workflowId, channel, enabled);
        loadData();
    }, [loadData]);

    const handleBulkApprove = useCallback(() => {
        const reviewWorkflows = workflows.filter((w) => w.currentStage === 'review');
        if (reviewWorkflows.length === 0) {
            alert('Tidak ada konten dalam tahap review');
            return;
        }

        if (confirm(`Apakah Anda yakin ingin menyetujui ${reviewWorkflows.length} konten?`)) {
            handleBulkOperation('approve', reviewWorkflows.map((w) => w.postId));
        }
    }, [workflows, handleBulkOperation]);

    const handleBulkPublish = useCallback(() => {
        const scheduledWorkflows = workflows.filter((w) => w.currentStage === 'scheduled');
        if (scheduledWorkflows.length === 0) {
            alert('Tidak ada konten terjadwal');
            return;
        }

        if (confirm(`Apakah Anda yakin ingin menerbitkan ${scheduledWorkflows.length} konten terjadwal?`)) {
            handleBulkOperation('publish', scheduledWorkflows.map((w) => w.postId));
        }
    }, [workflows, handleBulkOperation]);

    if (loading) {
        return <div className="container mt-4 text-center">Memuat...</div>;
    }

    return (
        <ProtectedRoute requiredPermission={Permission.MANAGE_CONTENT}>
            <div className={`container mt-4 ${theme === 'dark' ? 'dark-mode' : ''}`}>
                <div className="d-flex justify-content-between align-items-center mb-4">
                    <h2>Pipeline Penerbitan</h2>
                    <div>
                        <button className="btn btn-outline-primary me-2" onClick={loadData}>
                            Segarkan
                        </button>
                        <button className="btn btn-outline-success me-2" onClick={handleBulkApprove}>
                            Setujui Semua Review
                        </button>
                        <button className="btn btn-outline-primary" onClick={handleBulkPublish}>
                            Terbitkan Semua Terjadwal
                        </button>
                    </div>
                </div>

                <ul className="nav nav-tabs mb-4">
                    <li className="nav-item">
                        <button
                            className={`nav-link ${activeTab === 'workflow' ? 'active' : ''}`}
                            onClick={() => setActiveTab('workflow')}
                        >
                            Workflow
                        </button>
                    </li>
                    <li className="nav-item">
                        <button
                            className={`nav-link ${activeTab === 'calendar' ? 'active' : ''}`}
                            onClick={() => setActiveTab('calendar')}
                        >
                            Kalender
                        </button>
                    </li>
                    <li className="nav-item">
                        <button
                            className={`nav-link ${activeTab === 'metrics' ? 'active' : ''}`}
                            onClick={() => setActiveTab('metrics')}
                        >
                            Metrik
                        </button>
                    </li>
                </ul>

                {activeTab === 'workflow' && (
                    <div>
                        <div className="mb-3">
                            <select
                                className="form-select"
                                value={filterStage}
                                onChange={(e) => setFilterStage(e.target.value as PublishingWorkflowStage | 'all')}
                            >
                                <option value="all">Semua Tahap</option>
                                <option value="draft">Draf</option>
                                <option value="review">Review</option>
                                <option value="approved">Disetujui</option>
                                <option value="scheduled">Terjadwal</option>
                                <option value="published">Diterbitkan</option>
                            </select>
                        </div>

                        <div className="table-responsive">
                            <table className={`table ${theme === 'dark' ? 'table-dark' : ''}`}>
                                <thead>
                                    <tr>
                                        <th>ID Post</th>
                                        <th>Judul</th>
                                        <th>Tahap</th>
                                        <th>Pemeriksa</th>
                                        <th>Distribusi</th>
                                        <th>Dibuat Pada</th>
                                        <th>Update Terakhir</th>
                                        <th>Aksi</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {filteredWorkflows.map((workflow) => (
                                        <tr key={workflow.postId}>
                                            <td>{workflow.postId}</td>
                                            <td>
                                                <strong>{workflow.postTitle}</strong>
                                            </td>
                                            <td>
                                                <span className={`badge bg-primary`}>
                                                    {STAGE_LABELS[workflow.currentStage]}
                                                </span>
                                            </td>
                                            <td>
                                                {workflow.approvalAssignments.length === 0 ? (
                                                    <span className="text-muted">Tidak ada</span>
                                                ) : (
                                                    <ul className="list-unstyled mb-0">
                                                        {workflow.approvalAssignments.slice(0, 2).map((assignment, index) => (
                                                            <li key={index}>
                                                                <small>
                                                                    {assignment.reviewerName}
                                                                    <span className={`badge ms-1 ${
                                                                        assignment.status === 'approved' ? 'bg-success' :
                                                                        assignment.status === 'rejected' ? 'bg-danger' : 'bg-secondary'
                                                                    }`}>
                                                                        {APPROVAL_STATUS_LABELS[assignment.status]}
                                                                    </span>
                                                                </small>
                                                            </li>
                                                        ))}
                                                        {workflow.approvalAssignments.length > 2 && (
                                                            <li>
                                                                <small className="text-muted">
                                                                    +{workflow.approvalAssignments.length - 2} lagi
                                                                </small>
                                                            </li>
                                                        )}
                                                    </ul>
                                                )}
                                            </td>
                                            <td>
                                                <ul className="list-unstyled mb-0">
                                                    {workflow.distributionConfigs.map((config, index) => (
                                                        <li key={index}>
                                                            <small>
                                                                {CHANNEL_LABELS[config.channel]}:{' '}
                                                                {config.enabled ? (
                                                                    <span className="text-success">Aktif</span>
                                                                ) : (
                                                                    <span className="text-muted">Nonaktif</span>
                                                                )}
                                                            </small>
                                                        </li>
                                                    ))}
                                                </ul>
                                            </td>
                                            <td>
                                                <small>{formatDate(workflow.createdAt)}</small>
                                            </td>
                                            <td>
                                                <small>{formatDate(workflow.updatedAt)}</small>
                                            </td>
                                            <td>
                                                <div className="btn-group btn-group-sm">
                                                    <button
                                                        className="btn btn-outline-info"
                                                        onClick={() => handleCheckQualityGate(workflow)}
                                                        title="Cek Kualitas"
                                                    >
                                                        <i className="bi bi-check-circle"></i>
                                                    </button>
                                                    {workflow.currentStage === 'review' && (
                                                        <button
                                                            className="btn btn-outline-warning"
                                                            onClick={() => handleAssignReviewer(workflow)}
                                                            title="Tetapkan Pemeriksa"
                                                        >
                                                            <i className="bi bi-person-plus"></i>
                                                        </button>
                                                    )}
                                                    {(workflow.currentStage === 'draft' || workflow.currentStage === 'review') && (
                                                        <button
                                                            className="btn btn-outline-success"
                                                            onClick={() => handleAdvanceStage(workflow, workflow.currentStage === 'draft' ? 'review' : 'approved')}
                                                            title={workflow.currentStage === 'draft' ? 'Kirim ke Review' : 'Setujui'}
                                                        >
                                                            <i className="bi bi-arrow-right"></i>
                                                        </button>
                                                    )}
                                                    {workflow.currentStage === 'approved' && (
                                                        <button
                                                            className="btn btn-outline-primary"
                                                            onClick={() => {
                                                                const workflowId = `workflow_${workflow.postId}`;
                                                                const scheduledAt = new Date(Date.now() + 86400000).toISOString();
                                                                publishingPipeline.schedulePublishing(workflowId, scheduledAt, 'Asia/Jakarta', 'system');
                                                                loadData();
                                                            }}
                                                            title="Jadwalkan Terbitan"
                                                        >
                                                            <i className="bi bi-calendar-plus"></i>
                                                        </button>
                                                    )}
                                                </div>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </div>
                )}

                {activeTab === 'calendar' && (
                    <div>
                        <div className="alert alert-info">
                            <strong>Kalender Penerbitan</strong>{' '}
                            Tampilkan jadwal penerbitan konten. Gunakan tab ini untuk melihat dan mengelola jadwal terbitan.
                        </div>
                        <button
                            className="btn btn-primary"
                            onClick={() => window.location.href = '/admin/publishing-calendar'}
                        >
                            Buka Kalender Penuh
                        </button>
                    </div>
                )}

                {activeTab === 'metrics' && metrics && (
                    <div>
                        <div className="row mb-4">
                            <div className="col-md-3">
                                <div className="card text-center p-3">
                                    <h6>Total Post</h6>
                                    <h3>{metrics.totalPosts}</h3>
                                </div>
                            </div>
                            <div className="col-md-3">
                                <div className="card text-center p-3">
                                    <h6>Diterbitkan</h6>
                                    <h3 className="text-success">{metrics.publishedPosts}</h3>
                                </div>
                            </div>
                            <div className="col-md-3">
                                <div className="card text-center p-3">
                                    <h6>Menunggu Review</h6>
                                    <h3 className="text-warning">{metrics.pendingApproval}</h3>
                                </div>
                            </div>
                            <div className="col-md-3">
                                <div className="card text-center p-3">
                                    <h6>Terjadwal</h6>
                                    <h3 className="text-info">{metrics.scheduledPosts}</h3>
                                </div>
                            </div>
                        </div>

                        <div className="row mb-4">
                            <div className="col-md-6">
                                <div className="card p-3">
                                    <h6>Draf</h6>
                                    <h4 className="text-secondary">{metrics.draftPosts}</h4>
                                </div>
                            </div>
                            <div className="col-md-6">
                                <div className="card p-3">
                                    <h6>Disetujui</h6>
                                    <h4 className="text-primary">{metrics.postsByStage.approved}</h4>
                                </div>
                            </div>
                        </div>

                        <div className="row mb-4">
                            <div className="col-md-4">
                                <div className="card p-3">
                                    <h6>Rata-rata Waktu Terbitan</h6>
                                    <h4>{formatDuration(metrics.avgTimeToPublish)}</h4>
                                </div>
                            </div>
                            <div className="col-md-4">
                                <div className="card p-3">
                                    <h6>Rata-rata Siklus Persetujuan</h6>
                                    <h4>{formatDuration(metrics.avgApprovalCycleTime)}</h4>
                                </div>
                            </div>
                            <div className="col-md-4">
                                <div className="card p-3">
                                    <h6>Tingkat Ketepatan Waktu</h6>
                                    <h4 className="text-success">{metrics.onTimeDeliveryRate.toFixed(1)}%</h4>
                                </div>
                            </div>
                        </div>

                        <div className="card">
                            <div className="card-header">
                                <h5 className="mb-0">Post per Tahap</h5>
                            </div>
                            <div className="card-body">
                                <div className="row">
                                    {Object.entries(metrics.postsByStage).map(([stage, count]) => (
                                        <div key={stage} className="col-md-2 mb-3">
                                            <div className="text-center p-2 border rounded">
                                                <small className="text-muted">{STAGE_LABELS[stage as PublishingWorkflowStage]}</small>
                                                <h5>{count}</h5>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </div>
                    </div>
                )}

                {showAssignReviewer && selectedWorkflow && (
                    <div className="modal show" style={{ display: 'block' }}>
                        <div className="modal-dialog">
                            <div className={`modal-content ${theme === 'dark' ? 'bg-dark text-light' : ''}`}>
                                <div className="modal-header">
                                    <h5 className="modal-title">Tetapkan Pemeriksa</h5>
                                    <button
                                        type="button"
                                        className="btn-close"
                                        onClick={() => setShowAssignReviewer(false)}
                                    />
                                </div>
                                <div className="modal-body">
                                    <div className="mb-3">
                                        <label className="form-label">Nama Pemeriksa</label>
                                        <input
                                            type="text"
                                            className="form-control"
                                            value={reviewerName}
                                            onChange={(e) => setReviewerName(e.target.value)}
                                            placeholder="Masukkan nama pemeriksa"
                                        />
                                    </div>
                                    <div className="mb-3">
                                        <label className="form-label">Peran</label>
                                        <select
                                            className="form-select"
                                            value={reviewerRole}
                                            onChange={(e) => setReviewerRole(e.target.value as RoleType)}
                                        >
                                            <option value="editor">Editor</option>
                                            <option value="content_strategist">Penyusun Strategi Konten</option>
                                            <option value="admin">Admin</option>
                                        </select>
                                    </div>
                                    <div className="alert alert-info">
                                        <strong>Info:</strong> Post ini adalah{' '}
                                        <em>{selectedWorkflow.postTitle}</em>
                                    </div>
                                </div>
                                <div className="modal-footer">
                                    <button
                                        type="button"
                                        className="btn btn-secondary"
                                        onClick={() => setShowAssignReviewer(false)}
                                    >
                                        Batal
                                    </button>
                                    <button
                                        type="button"
                                        className="btn btn-primary"
                                        onClick={handleSubmitAssignReviewer}
                                        disabled={!reviewerName}
                                    >
                                        Tetapkan
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>
                )}

                {qualityGate && selectedWorkflow && (
                    <div className="modal show" style={{ display: 'block' }}>
                        <div className="modal-dialog">
                            <div className={`modal-content ${theme === 'dark' ? 'bg-dark text-light' : ''}`}>
                                <div className="modal-header">
                                    <h5 className="modal-title">
                                        Gerbang Kualitas:{' '}
                                        {qualityGate.passed ? (
                                            <span className="text-success">Lulus</span>
                                        ) : (
                                            <span className="text-danger">Gagal</span>
                                        )}
                                    </h5>
                                    <button
                                        type="button"
                                        className="btn-close"
                                        onClick={() => setQualityGate(null)}
                                    />
                                </div>
                                <div className="modal-body">
                                    <div className="row mb-3">
                                        <div className="col-md-6">
                                            <div className="card p-2">
                                                <h6 className="text-center">Skor SEO</h6>
                                                <h4 className={`text-center ${
                                                    qualityGate.seoScore >= 70 ? 'text-success' : 'text-danger'
                                                }`}>
                                                    {qualityGate.seoScore}/100
                                                </h4>
                                            </div>
                                        </div>
                                        <div className="col-md-6">
                                            <div className="card p-2">
                                                <h6 className="text-center">Skor Keterbacaan</h6>
                                                <h4 className={`text-center ${
                                                    qualityGate.readabilityScore >= 60 ? 'text-success' : 'text-danger'
                                                }`}>
                                                    {qualityGate.readabilityScore}/100
                                                </h4>
                                            </div>
                                        </div>
                                    </div>

                                    <div className="mb-3">
                                        <h6>Isu yang Ditemukan:</h6>
                                        {qualityGate.issues.length === 0 ? (
                                            <p className="text-success">Tidak ada isu yang ditemukan</p>
                                        ) : (
                                            <ul>
                                                {qualityGate.issues.map((issue, index) => (
                                                    <li key={index}>{issue}</li>
                                                ))}
                                            </ul>
                                        )}
                                    </div>

                                    <div className={`alert ${qualityGate.passed ? 'alert-success' : 'alert-danger'}`}>
                                        <strong>Kelengkapan:</strong>{' '}
                                        {qualityGate.completenessCheck ? 'Lengkap' : 'Tidak Lengkap'}
                                    </div>
                                </div>
                                <div className="modal-footer">
                                    <button
                                        type="button"
                                        className="btn btn-primary"
                                        onClick={() => setQualityGate(null)}
                                    >
                                        Tutup
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </ProtectedRoute>
    );
};

PublishingDashboard.displayName = 'PublishingDashboard';

export default memo(PublishingDashboard);
