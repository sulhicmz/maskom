import type { EmailCampaign } from '@/types/campaign';
import campaign_data from '@/data/CampaignData';

export interface ICampaignStorage {
  loadCampaigns(): EmailCampaign[];
  saveCampaigns(campaigns: EmailCampaign[]): void;
  loadSendQueue(): Array<{ id: string; timestamp: string }>;
  saveSendQueue(queue: Array<{ id: string; timestamp: string }>): void;
}

const CAMPAIGN_STORAGE_KEY = 'email_campaigns';
const CAMPAIGN_QUEUE_KEY = 'campaign_send_queue';

export class CampaignLocalStorage implements ICampaignStorage {
  loadCampaigns(): EmailCampaign[] {
    if (typeof window === 'undefined') return [...campaign_data];

    try {
      const stored = localStorage.getItem(CAMPAIGN_STORAGE_KEY);
      if (stored) {
        return JSON.parse(stored);
      }
    } catch (error) {
      console.error('Failed to load campaigns from storage:', error);
    }
    return [...campaign_data];
  }

  saveCampaigns(campaigns: EmailCampaign[]): void {
    if (typeof window === 'undefined') return;

    try {
      localStorage.setItem(CAMPAIGN_STORAGE_KEY, JSON.stringify(campaigns));
    } catch (error) {
      console.error('Failed to save campaigns to storage:', error);
    }
  }

  loadSendQueue(): Array<{ id: string; timestamp: string }> {
    if (typeof window === 'undefined') return [];

    try {
      const stored = localStorage.getItem(CAMPAIGN_QUEUE_KEY);
      return stored ? JSON.parse(stored) : [];
    } catch (error) {
      console.error('Failed to load send queue:', error);
      return [];
    }
  }

  saveSendQueue(queue: Array<{ id: string; timestamp: string }>): void {
    if (typeof window === 'undefined') return;

    try {
      localStorage.setItem(CAMPAIGN_QUEUE_KEY, JSON.stringify(queue));
    } catch (error) {
      console.error('Failed to save send queue:', error);
    }
  }
}

export const campaignLocalStorage = new CampaignLocalStorage();
export default campaignLocalStorage;
