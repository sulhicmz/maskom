import type {
    EmailCampaign,
    CampaignMetrics,
    ICampaignManager,
    BulkSendProgress,
    CampaignFilter,
    CampaignScheduleResult,
    CampaignSendResult,
} from '@/types/campaign';
import campaign_data from '@/data/CampaignData';
import emailService from '@/services/email/EmailService';
import type { ICampaignStorage } from './campaignStorage';
import campaignLocalStorage from './campaignStorage';

class CampaignManager implements ICampaignManager {
    private campaigns: EmailCampaign[];
    private idCounter = 1;
    private storage: ICampaignStorage;

    constructor(storage: ICampaignStorage = campaignLocalStorage) {
        this.storage = storage;
        this.campaigns = [...campaign_data];
        this.loadCampaignsFromStorage();
    }

    private loadCampaignsFromStorage(): void {
        this.campaigns = this.storage.loadCampaigns();
    }

    reset(): void {
        this.idCounter = 1;
        this.campaigns = [...campaign_data];
        this.loadCampaignsFromStorage();
    }

    private saveCampaignsToStorage(): void {
        this.storage.saveCampaigns(this.campaigns);
    }

    getAllCampaigns(): EmailCampaign[] {
        return [...this.campaigns].sort(
            (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
        );
    }

    getCampaignById(id: string): EmailCampaign | undefined {
        return this.campaigns.find((campaign) => campaign.id === id);
    }

    filterCampaigns(filter: CampaignFilter): EmailCampaign[] {
        let filtered = this.getAllCampaigns();

        if (filter.status) {
            filtered = filtered.filter((campaign) => campaign.status === filter.status);
        }

        if (filter.templateId) {
            filtered = filtered.filter((campaign) => campaign.templateId === filter.templateId);
        }

        if (filter.searchQuery) {
            const query = filter.searchQuery.toLowerCase();
            filtered = filtered.filter(
                (campaign) =>
                    campaign.name.toLowerCase().includes(query) ||
                    campaign.subject?.toLowerCase().includes(query)
            );
        }

        if (filter.dateRange) {
            const from = new Date(filter.dateRange.from).getTime();
            const to = new Date(filter.dateRange.to).getTime();

            filtered = filtered.filter((campaign) => {
                const campaignDate = new Date(campaign.createdAt).getTime();
                return campaignDate >= from && campaignDate <= to;
            });
        }

        return filtered;
    }

    createCampaign(
        campaignData: Omit<EmailCampaign, 'id' | 'createdAt' | 'sentCount' | 'openCount' | 'clickCount' | 'bounceCount'>
    ): EmailCampaign {
        const id = `CAMP-${this.idCounter++}`;
        const newCampaign: EmailCampaign = {
            id,
            ...campaignData,
            createdAt: new Date().toISOString(),
            sentCount: 0,
            openCount: 0,
            clickCount: 0,
            bounceCount: 0,
        };

        this.campaigns.unshift(newCampaign);
        this.saveCampaignsToStorage();

        return newCampaign;
    }

    updateCampaign(id: string, updates: Partial<EmailCampaign>): EmailCampaign | null {
        const index = this.campaigns.findIndex((campaign) => campaign.id === id);

        if (index === -1) return null;

        const campaign = this.campaigns[index];

        if (campaign.status === 'sent') {
            console.warn('Cannot modify a sent campaign');
            return null;
        }

        this.campaigns[index] = {
            ...campaign,
            ...updates,
            id: campaign.id,
        };

        this.saveCampaignsToStorage();

        return this.campaigns[index];
    }

    deleteCampaign(id: string): boolean {
        const campaign = this.getCampaignById(id);

        if (!campaign) return false;

        if (campaign.status === 'sending') {
            console.warn('Cannot delete a campaign that is currently sending');
            return false;
        }

        this.campaigns = this.campaigns.filter((campaign) => campaign.id !== id);
        this.saveCampaignsToStorage();

        return true;
    }

    duplicateCampaign(id: string): EmailCampaign | null {
        const originalCampaign = this.getCampaignById(id);

        if (!originalCampaign) return null;

        // eslint-disable-next-line @typescript-eslint/no-unused-vars
        const { id: originalId, createdAt, sentCount, openCount, clickCount, bounceCount, ...campaignData } = originalCampaign;

        const duplicatedCampaign = this.createCampaign({
            ...campaignData,
            name: `${originalCampaign.name} (Copy)`,
            status: 'draft',
        });

        return duplicatedCampaign;
    }

    getCampaignMetrics(id: string): CampaignMetrics | null {
        const campaign = this.getCampaignById(id);

        if (!campaign) return null;

        /* eslint-disable-next-line @typescript-eslint/no-unused-vars */
        const totalRecipients = campaign.recipientLists.reduce(
            (sum, list) => sum + list.totalRecipients,
            0
        );

        const openRate = campaign.sentCount > 0 ? (campaign.openCount / campaign.sentCount) * 100 : 0;
        const clickRate = campaign.sentCount > 0 ? (campaign.clickCount / campaign.sentCount) * 100 : 0;
        const bounceRate = campaign.sentCount > 0 ? (campaign.bounceCount / campaign.sentCount) * 100 : 0;

        return {
            sentCount: campaign.sentCount,
            openCount: campaign.openCount,
            openRate: parseFloat(openRate.toFixed(2)),
            clickCount: campaign.clickCount,
            clickRate: parseFloat(clickRate.toFixed(2)),
            bounceCount: campaign.bounceCount,
            bounceRate: parseFloat(bounceRate.toFixed(2)),
        };
    }

    scheduleCampaign(id: string, scheduledDate: string): CampaignScheduleResult {
        const campaign = this.getCampaignById(id);

        if (!campaign) {
            return {
                success: false,
                message: `Campaign with ID ${id} not found`,
            };
        }

        if (campaign.status === 'sent' || campaign.status === 'sending') {
            return {
                success: false,
                message: 'Cannot schedule a campaign that has been sent or is currently sending',
            };
        }

        const scheduledDateTime = new Date(scheduledDate);
        const now = new Date();

        if (scheduledDateTime <= now) {
            return {
                success: false,
                message: 'Scheduled date must be in future',
            };
        }

        const updatedCampaign = this.updateCampaign(id, {
            scheduledFor: scheduledDate,
            status: 'scheduled',
        });

        if (!updatedCampaign) {
            return {
                success: false,
                message: 'Failed to update campaign schedule',
            };
        }

        return {
            success: true,
            message: 'Campaign scheduled successfully',
            campaignId: id,
        };
    }

    sendCampaign(id: string): CampaignSendResult {
        const campaign = this.getCampaignById(id);

        if (!campaign) {
            return {
                success: false,
                sentCount: 0,
                failedCount: 0,
                message: `Campaign with ID ${id} not found`,
            };
        }

        if (campaign.status === 'sent' || campaign.status === 'sending') {
            return {
                success: false,
                sentCount: 0,
                failedCount: 0,
                message: 'Campaign has already been sent or is currently sending',
            };
        }

        const totalRecipients = campaign.recipientLists.reduce(
            (sum, list) => sum + list.totalRecipients,
            0
        );

        if (totalRecipients === 0) {
            return {
                success: false,
                sentCount: 0,
                failedCount: 0,
                message: 'Campaign has no recipients',
            };
        }

        const updatedCampaign = this.updateCampaign(id, {
            status: 'sending',
            sentCount: 0,
            openCount: 0,
            clickCount: 0,
            bounceCount: 0,
        });

        if (!updatedCampaign) {
            return {
                success: false,
                sentCount: 0,
                failedCount: 0,
                message: 'Failed to update campaign status',
            };
        }

        this.queueCampaignSend(id);

        return {
            success: true,
            sentCount: 0,
            failedCount: 0,
            message: 'Campaign queued for sending',
        };
    }

    private queueCampaignSend(id: string): void {
        const queue = this.storage.loadSendQueue();
        queue.push({ id, timestamp: new Date().toISOString() });
        this.storage.saveSendQueue(queue);
    }

    private getSendQueue(): Array<{ id: string; timestamp: string }> {
        return this.storage.loadSendQueue();
    }

    updateCampaignMetrics(
        id: string,
        metrics: Partial<Pick<EmailCampaign, 'sentCount' | 'openCount' | 'clickCount' | 'bounceCount'>>
    ): boolean {
        const campaign = this.getCampaignById(id);

        if (!campaign) return false;

        const index = this.campaigns.findIndex((c) => c.id === id);
        if (index === -1) return false;

        this.campaigns[index] = {
            ...this.campaigns[index],
            ...metrics,
        };

        this.saveCampaignsToStorage();

        return true;
    }

    cancelCampaign(id: string): boolean {
        const campaign = this.getCampaignById(id);

        if (!campaign) return false;

        if (campaign.status === 'sent') {
            console.warn('Cannot cancel a campaign that has already been sent');
            return false;
        }

        const updated = this.updateCampaign(id, {
            status: 'cancelled',
        });

        return updated !== null;
    }

    getCampaignStats(): {
        total: number;
        draft: number;
        scheduled: number;
        sending: number;
        sent: number;
        cancelled: number;
    } {
        const total = this.campaigns.length;
        const draft = this.campaigns.filter((c) => c.status === 'draft').length;
        const scheduled = this.campaigns.filter((c) => c.status === 'scheduled').length;
        const sending = this.campaigns.filter((c) => c.status === 'sending').length;
        const sent = this.campaigns.filter((c) => c.status === 'sent').length;
        const cancelled = this.campaigns.filter((c) => c.status === 'cancelled').length;

        return {
            total,
            draft,
            scheduled,
            sending,
            sent,
            cancelled,
        };
    }

    async executeBulkSend(campaignId: string): Promise<BulkSendProgress> {
        const campaign = this.getCampaignById(campaignId);

        if (!campaign) {
            return {
                campaignId,
                totalRecipients: 0,
                sentCount: 0,
                failedCount: 0,
                isComplete: false,
            };
        }

        const totalRecipients = campaign.recipientLists.reduce(
            (sum, list) => sum + list.totalRecipients,
            0
        );

        let sentCount = 0;
        let failedCount = 0;

        const variableValues = campaign.variableValues || {};

        for (const recipientList of campaign.recipientLists) {
            for (const segment of recipientList.segments) {
                for (let i = 0; i < segment.count; i++) {
                    try {
                        const result = await emailService.sendTemplatedEmail(
                            campaign.templateId,
                            variableValues
                        );

                        if (result.success) {
                            sentCount++;
                        } else {
                            failedCount++;
                        }

                        this.updateCampaignMetrics(campaignId, {
                            sentCount,
                            openCount: 0,
                            clickCount: 0,
                            bounceCount: failedCount,
                        });
                    } catch (error) {
                        console.error('Failed to send email:', error);
                        failedCount++;
                    }

                    await new Promise((resolve) => setTimeout(resolve, 100));
                }
            }
        }

        this.updateCampaign(campaignId, {
            status: 'sent',
            sentAt: new Date().toISOString(),
        });

        return {
            campaignId,
            totalRecipients,
            sentCount,
            failedCount,
            isComplete: true,
        };
    }

    processScheduledCampaigns(): Promise<BulkSendProgress[]> {
        const now = new Date();
        const scheduledCampaigns = this.campaigns.filter(
            (campaign) =>
                campaign.status === 'scheduled' &&
                campaign.scheduledFor &&
                new Date(campaign.scheduledFor) <= now
        );

        const promises = scheduledCampaigns.map((campaign) =>
            this.executeBulkSend(campaign.id)
        );

        return Promise.all(promises);
    }

    trackEmailEvent(campaignId: string, eventType: 'open' | 'click' | 'bounce'): void {
        const campaign = this.getCampaignById(campaignId);

        if (!campaign) return;

        const updates: Partial<Pick<EmailCampaign, 'openCount' | 'clickCount' | 'bounceCount'>> = {};

        switch (eventType) {
            case 'open':
                updates.openCount = campaign.openCount + 1;
                break;
            case 'click':
                updates.clickCount = campaign.clickCount + 1;
                break;
            case 'bounce':
                updates.bounceCount = campaign.bounceCount + 1;
                break;
        }

        this.updateCampaignMetrics(campaignId, updates);
    }
}

const campaignManagerInstance = new CampaignManager();

export { CampaignManager };
export default campaignManagerInstance;
export { type ICampaignManager } from '@/types/campaign';
