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
