"use client";

import React, { useState, useEffect, memo } from 'react';
import { useTheme } from '@/contexts/ThemeContext';
import { useAuthService } from '@/hooks/useAuthService';
import ProtectedRoute from '@/components/common/ProtectedRoute';
import { Permission } from '@/types/permission';
import { CampaignStatus, type EmailCampaign } from '@/types/campaign';
import campaignManager from '@/utils/campaignManager';
import LoadingSpinner from '@/components/ui/LoadingSpinner';

const StatusBadge = memo(({ status }: { status: CampaignStatus }) => {
    const getStatusColor = (status: CampaignStatus): string => {
        switch (status) {
            case 'draft': return 'bg-secondary';
            case 'scheduled': return 'bg-info';
            case 'sending': return 'bg-warning';
            case 'sent': return 'bg-success';
            case 'cancelled': return 'bg-danger';
            default: return 'bg-secondary';
        }
    };

    const getStatusLabel = (status: CampaignStatus): string => {
        const labels: Record<CampaignStatus, string> = {
            draft: 'Draft',
            scheduled: 'Dijadwalkan',
            sending: 'Mengirim',
            sent: 'Terkirim',
            cancelled: 'Dibatalkan',
        };

        return labels[status] || status;
    };

    return (
        <span className={`badge ${getStatusColor(status)}`}>
            {getStatusLabel(status)}
        </span>
    );
});

StatusBadge.displayName = 'StatusBadge';

const CampaignRow = memo(({ campaign, onEdit, onDelete, onDuplicate, onSend, onSchedule, onCancel }: {
    campaign: EmailCampaign;
    onEdit: (id: string) => void;
    onDelete: (id: string) => void;
    onDuplicate: (id: string) => void;
    onSend: (id: string) => void;
    onSchedule: (id: string) => void;
    onCancel: (id: string) => void;
}) => {
    const { theme } = useTheme();
    const formatDate = (dateString: string): string => {
        const date = new Date(dateString);
        return date.toLocaleString('id-ID', {
            day: '2-digit',
            month: 'short',
            year: 'numeric',
            hour: '2-digit',
            minute: '2-digit',
        });
    };

    const totalRecipients = campaign.recipientLists.reduce(
        (sum, list) => sum + list.totalRecipients,
        0
    );

    const openRate = campaign.sentCount > 0 ? ((campaign.openCount / campaign.sentCount) * 100).toFixed(1) : '0.0';
    const clickRate = campaign.sentCount > 0 ? ((campaign.clickCount / campaign.sentCount) * 100).toFixed(1) : '0.0';
    const bounceRate = campaign.sentCount > 0 ? ((campaign.bounceCount / campaign.sentCount) * 100).toFixed(1) : '0.0';

    return (
        <tr className={theme === 'dark' ? 'table-dark' : ''}>
            <td><small>{campaign.id}</small></td>
            <td>
                <strong>{campaign.name}</strong>
                {campaign.subject && (
                    <div><small className="text-muted">{campaign.subject}</small></div>
                )}
            </td>
            <td>{campaign.templateId}</td>
            <td><StatusBadge status={campaign.status} /></td>
            <td>{totalRecipients}</td>
            <td>{campaign.sentCount}</td>
            <td>{campaign.openCount} ({openRate}%)</td>
            <td>{campaign.clickCount} ({clickRate}%)</td>
            <td>{campaign.bounceCount} ({bounceRate}%)</td>
            <td>{formatDate(campaign.createdAt)}</td>
            <td>
                <div className="btn-group btn-group-sm">
                    <button
                        className="btn btn-outline-primary"
                        onClick={() => onEdit(campaign.id)}
                        title="Edit Campaign"
                    >
                        <i className="bi bi-pencil"></i>
                    </button>
                    {campaign.status === 'draft' && (
                        <button
                            className="btn btn-outline-info"
                            onClick={() => onSend(campaign.id)}
                            title="Send Campaign"
                        >
                            <i className="bi bi-send"></i>
                        </button>
                    )}
                    {campaign.status === 'draft' && (
                        <button
                            className="btn btn-outline-success"
                            onClick={() => onSchedule(campaign.id)}
                            title="Schedule Campaign"
                        >
                            <i className="bi bi-calendar"></i>
                        </button>
                    )}
                    {(campaign.status === 'draft' || campaign.status === 'scheduled') && (
                        <button
                            className="btn btn-outline-danger"
                            onClick={() => onCancel(campaign.id)}
                            title="Cancel Campaign"
                        >
                            <i className="bi bi-x-circle"></i>
                        </button>
                    )}
                    <button
                        className="btn btn-outline-secondary"
                        onClick={() => onDuplicate(campaign.id)}
                        title="Duplicate Campaign"
                    >
                        <i className="bi bi-copy"></i>
                    </button>
                    {(campaign.status === 'draft' || campaign.status === 'cancelled') && (
                        <button
                            className="btn btn-outline-danger"
                            onClick={() => onDelete(campaign.id)}
                            title="Delete Campaign"
                        >
                            <i className="bi bi-trash"></i>
                        </button>
                    )}
                </div>
            </td>
        </tr>
    );
});

CampaignRow.displayName = 'CampaignRow';

const CampaignList: React.FC = () => {
    const { theme } = useTheme();
    const [isClient, setIsClient] = useState(false);
    const [campaigns, setCampaigns] = useState<EmailCampaign[]>([]);
    const [filteredCampaigns, setFilteredCampaigns] = useState<EmailCampaign[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [statusFilter, setStatusFilter] = useState<string>('');
    const [templateFilter, setTemplateFilter] = useState<string>('');

    useEffect(() => {
        setIsClient(true);
    }, []);

    useEffect(() => {
        if (isClient) {
            const loadCampaigns = () => {
                setLoading(true);
                try {
                    const allCampaigns = campaignManager.getAllCampaigns();
                    setCampaigns(allCampaigns);
                    applyFilters(allCampaigns);
                } catch (error) {
                    console.error('Failed to load campaigns:', error);
                } finally {
                    setLoading(false);
                }
            };

            loadCampaigns();
        }
    }, [isClient]);

    const applyFilters = (campaignsToFilter: EmailCampaign[]) => {
        let result = campaignsToFilter;

        if (searchTerm) {
            const term = searchTerm.toLowerCase();
            result = result.filter(
                (campaign) =>
                    campaign.name.toLowerCase().includes(term) ||
                    campaign.subject?.toLowerCase().includes(term)
            );
        }

        if (statusFilter) {
            result = result.filter((campaign) => campaign.status === statusFilter);
        }

        if (templateFilter) {
            result = result.filter((campaign) => campaign.templateId === parseInt(templateFilter, 10));
        }

        setFilteredCampaigns(result);
    };

    const handleEdit = (id: string) => {
        console.log('Edit campaign:', id);
    };

    const handleDelete = (id: string) => {
        if (window.confirm('Are you sure you want to delete this campaign?')) {
            campaignManager.deleteCampaign(id);
            const updatedCampaigns = campaignManager.getAllCampaigns();
            setCampaigns(updatedCampaigns);
            applyFilters(updatedCampaigns);
        }
    };

    const handleDuplicate = (id: string) => {
        campaignManager.duplicateCampaign(id);
        const updatedCampaigns = campaignManager.getAllCampaigns();
        setCampaigns(updatedCampaigns);
        applyFilters(updatedCampaigns);
    };

    const handleSend = (id: string) => {
        const result = campaignManager.sendCampaign(id);
        if (result.success) {
            const updatedCampaigns = campaignManager.getAllCampaigns();
            setCampaigns(updatedCampaigns);
            applyFilters(updatedCampaigns);
            alert(result.message);
        } else {
            alert(result.message);
        }
    };

    const handleSchedule = (id: string) => {
        const scheduledDate = prompt('Enter scheduled date (ISO 8601 format):', new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString());
        if (scheduledDate) {
            const result = campaignManager.scheduleCampaign(id, scheduledDate);
            if (result.success) {
                const updatedCampaigns = campaignManager.getAllCampaigns();
                setCampaigns(updatedCampaigns);
                applyFilters(updatedCampaigns);
                alert(result.message);
            } else {
                alert(result.message);
            }
        }
    };

    const handleCancel = (id: string) => {
        if (window.confirm('Are you sure you want to cancel this campaign?')) {
            campaignManager.cancelCampaign(id);
            const updatedCampaigns = campaignManager.getAllCampaigns();
            setCampaigns(updatedCampaigns);
            applyFilters(updatedCampaigns);
        }
    };

    const clearFilters = () => {
        setSearchTerm('');
        setStatusFilter('');
        setTemplateFilter('');
        setFilteredCampaigns(campaigns);
    };

    if (!isClient) {
        return <LoadingSpinner minHeight={400} color="primary" />;
    }

    return (
        <ProtectedRoute requiredPermission={Permission.MANAGE_CONTENT}>
            <section className={`campaign-list-section ${theme === 'dark' ? 'dark-mode' : ''}`}>
                <div className="container">
                    <div className="row">
                        <div className="col-12">
                            <div className="section-title text-center mb-5">
                                <h2>Campaign Management</h2>
                                <p className="text-muted">Kelola kampanye email dan pantau kinerja</p>
                            </div>
                        </div>
                    </div>

                    <div className="row">
                        <div className="col-12">
                            <div className="card shadow-sm">
                                <div className="card-header bg-white">
                                    <div className="row align-items-center">
                                        <div className="col-md-6">
                                            <h5 className="mb-0">
                                                Campaigns ({filteredCampaigns.length})
                                            </h5>
                                        </div>
                                        <div className="col-md-6 text-end">
                                            <button
                                                className="btn btn-primary"
                                                onClick={() => console.log('Create new campaign')}
                                            >
                                                <i className="bi bi-plus-lg me-1"></i>
                                                Create Campaign
                                            </button>
                                        </div>
                                    </div>
                                </div>
                                <div className="card-body">
                                    <div className="row mb-4">
                                        <div className="col-md-4 mb-2">
                                            <input
                                                type="text"
                                                className="form-control"
                                                placeholder="Search campaigns..."
                                                value={searchTerm}
                                                onChange={(e) => {
                                                    setSearchTerm(e.target.value);
                                                    applyFilters(campaigns);
                                                }}
                                            />
                                        </div>
                                        <div className="col-md-3 mb-2">
                                            <select
                                                className="form-select"
                                                value={statusFilter}
                                                onChange={(e) => {
                                                    setStatusFilter(e.target.value);
                                                    applyFilters(campaigns);
                                                }}
                                            >
                                                <option value="">All Status</option>
                                                <option value="draft">Draft</option>
                                                <option value="scheduled">Dijadwalkan</option>
                                                <option value="sending">Mengirim</option>
                                                <option value="sent">Terkirim</option>
                                                <option value="cancelled">Dibatalkan</option>
                                            </select>
                                        </div>
                                        <div className="col-md-3 mb-2">
                                            <select
                                                className="form-select"
                                                value={templateFilter}
                                                onChange={(e) => {
                                                    setTemplateFilter(e.target.value);
                                                    applyFilters(campaigns);
                                                }}
                                            >
                                                <option value="">All Templates</option>
                                                <option value="1">Welcome Email</option>
                                                <option value="2">Blog Post Published</option>
                                                <option value="3">Password Reset</option>
                                                <option value="4">Order Confirmation</option>
                                            </select>
                                        </div>
                                        <div className="col-md-2 mb-2">
                                            <button
                                                className="btn btn-outline-secondary w-100"
                                                onClick={clearFilters}
                                            >
                                                <i className="bi bi-x-circle"></i>
                                            </button>
                                        </div>
                                    </div>

                                    {loading ? (
                                        <LoadingSpinner minHeight={200} color="primary" />
                                    ) : filteredCampaigns.length === 0 ? (
                                        <div className="text-center py-5">
                                            <i className="bi bi-envelope-paper fs-1 text-muted mb-3"></i>
                                            <p className="text-muted">Tidak ada campaign yang ditemukan</p>
                                        </div>
                                    ) : (
                                        <div className="table-responsive">
                                            <table className="table table-hover">
                                                <thead>
                                                    <tr>
                                                        <th scope="col">ID</th>
                                                        <th scope="col">Name / Subject</th>
                                                        <th scope="col">Template</th>
                                                        <th scope="col">Status</th>
                                                        <th scope="col">Recipients</th>
                                                        <th scope="col">Sent</th>
                                                        <th scope="col">Opens</th>
                                                        <th scope="col">Clicks</th>
                                                        <th scope="col">Bounces</th>
                                                        <th scope="col">Created</th>
                                                        <th scope="col">Actions</th>
                                                    </tr>
                                                </thead>
                                                <tbody>
                                                    {filteredCampaigns.map((campaign) => (
                                                        <CampaignRow
                                                            key={campaign.id}
                                                            campaign={campaign}
                                                            onEdit={handleEdit}
                                                            onDelete={handleDelete}
                                                            onDuplicate={handleDuplicate}
                                                            onSend={handleSend}
                                                            onSchedule={handleSchedule}
                                                            onCancel={handleCancel}
                                                        />
                                                    ))}
                                                </tbody>
                                            </table>
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </section>
        </ProtectedRoute>
    );
};

export default CampaignList;
