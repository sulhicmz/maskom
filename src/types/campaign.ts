export type CampaignStatus = 'draft' | 'scheduled' | 'sending' | 'sent' | 'cancelled';

export type RecipientSegment = {
    id: string;
    name: string;
    criteria: RecipientCriteria;
    count: number;
};

export type RecipientCriteria = {
    role?: string[];
    tags?: string[];
    customCriteria?: Record<string, string | number | boolean>;
};

export interface RecipientList {
    id: string;
    name: string;
    segments: RecipientSegment[];
    totalRecipients: number;
    createdAt: string;
    updatedAt: string;
}

export interface EmailCampaign {
    id: string;
    name: string;
    templateId: number;
    recipientLists: RecipientList[];
    scheduledFor?: string;
    status: CampaignStatus;
    subject?: string;
    previewText?: string;
    sentCount: number;
    openCount: number;
    clickCount: number;
    bounceCount: number;
    createdAt: string;
    sentAt?: string;
    variableValues?: Record<string, string>;
}

export interface CampaignMetrics {
    sentCount: number;
    openCount: number;
    openRate: number;
    clickCount: number;
    clickRate: number;
    bounceCount: number;
    bounceRate: number;
}

export interface CampaignABTest {
    id: string;
    campaignId: string;
    variant: 'A' | 'B';
    subject: string;
    sentCount: number;
    openCount: number;
    clickCount: number;
    winner?: 'A' | 'B' | 'none';
}

export interface BulkSendProgress {
    campaignId: string;
    totalRecipients: number;
    sentCount: number;
    failedCount: number;
    isComplete: boolean;
}

export interface CampaignFilter {
    status?: CampaignStatus;
    templateId?: number;
    searchQuery?: string;
    dateRange?: {
        from: string;
        to: string;
    };
}

export interface CampaignScheduleResult {
    success: boolean;
    message: string;
    campaignId?: string;
}

export interface CampaignSendResult {
    success: boolean;
    sentCount: number;
    failedCount: number;
    message: string;
}

export interface ICampaignManager {
    getAllCampaigns(): EmailCampaign[];
    getCampaignById(id: string): EmailCampaign | undefined;
    filterCampaigns(filter: CampaignFilter): EmailCampaign[];
    createCampaign(campaign: Partial<EmailCampaign>): EmailCampaign;
    updateCampaign(id: string, updates: Partial<EmailCampaign>): EmailCampaign | null;
    deleteCampaign(id: string): boolean;
    duplicateCampaign(id: string): EmailCampaign | null;
    sendCampaign(id: string): CampaignSendResult;
    scheduleCampaign(id: string, scheduledFor: string): CampaignScheduleResult;
    cancelCampaign(id: string): boolean;
    trackEmailEvent(campaignId: string, eventType: 'open' | 'click' | 'bounce'): void;
    updateCampaignMetrics(campaignId: string, metrics: Partial<CampaignMetrics>): void;
    getCampaignStats(): { total: number; draft: number; scheduled: number; sending: number; sent: number; cancelled: number };
    executeBulkSend(campaignId: string): Promise<BulkSendProgress>;
    processScheduledCampaigns(): Promise<BulkSendProgress[]>;
    reset(): void;
}
