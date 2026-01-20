import { CampaignLocalStorage } from '../campaignStorage';

describe('CampaignLocalStorage', () => {
  let storage: CampaignLocalStorage;
  const mockCampaigns = [
    {
      id: 'CAMP-1',
      name: 'Test Campaign 1',
      subject: 'Subject 1',
      templateId: 1,
      status: 'draft' as const,
      recipientLists: [{ id: 'list-1', name: 'List 1', totalRecipients: 100, segments: [] }],
      createdAt: '2024-01-01T00:00:00.000Z',
      sentCount: 0,
      openCount: 0,
      clickCount: 0,
      bounceCount: 0,
    },
    {
      id: 'CAMP-2',
      name: 'Test Campaign 2',
      subject: 'Subject 2',
      templateId: 2,
      status: 'sent' as const,
      recipientLists: [{ id: 'list-2', name: 'List 2', totalRecipients: 200, segments: [] }],
      createdAt: '2024-01-02T00:00:00.000Z',
      sentCount: 200,
      openCount: 150,
      clickCount: 75,
      bounceCount: 5,
    },
  ];

  beforeEach(() => {
    storage = new CampaignLocalStorage();
    localStorage.clear();
  });

  describe('loadCampaigns', () => {
    it('should load campaigns from localStorage when available', () => {
      localStorage.setItem('email_campaigns', JSON.stringify(mockCampaigns));
      const result = storage.loadCampaigns();
      expect(result).toEqual(mockCampaigns);
    });

    it('should return default campaigns when localStorage is empty', () => {
      const result = storage.loadCampaigns();
      expect(Array.isArray(result)).toBe(true);
      expect(result.length).toBeGreaterThan(0);
    });

    it('should handle localStorage parse errors gracefully', () => {
      localStorage.setItem('email_campaigns', 'invalid json');
      const result = storage.loadCampaigns();
      expect(Array.isArray(result)).toBe(true);
    });

    it('should return default campaigns when window is undefined', () => {
      const originalWindow = global.window;
      delete (global as any).window;
      const result = storage.loadCampaigns();
      global.window = originalWindow;
      expect(Array.isArray(result)).toBe(true);
      expect(result.length).toBeGreaterThan(0);
    });
  });

  describe('saveCampaigns', () => {
    it('should save campaigns to localStorage', () => {
      storage.saveCampaigns(mockCampaigns);
      const stored = localStorage.getItem('email_campaigns');
      expect(stored).toBe(JSON.stringify(mockCampaigns));
    });

    it('should handle localStorage write errors gracefully', () => {
      const originalSetItem = localStorage.setItem;
      localStorage.setItem = jest.fn(() => {
        throw new Error('Storage quota exceeded');
      });
      expect(() => storage.saveCampaigns(mockCampaigns)).not.toThrow();
      localStorage.setItem = originalSetItem;
    });

    it('should not throw when window is undefined', () => {
      const originalWindow = global.window;
      delete (global as any).window;
      expect(() => storage.saveCampaigns(mockCampaigns)).not.toThrow();
      global.window = originalWindow;
    });
  });

  describe('loadSendQueue', () => {
    const mockQueue = [
      { id: 'CAMP-1', timestamp: '2024-01-01T00:00:00.000Z' },
      { id: 'CAMP-2', timestamp: '2024-01-02T00:00:00.000Z' },
    ];

    it('should load send queue from localStorage when available', () => {
      localStorage.setItem('campaign_send_queue', JSON.stringify(mockQueue));
      const result = storage.loadSendQueue();
      expect(result).toEqual(mockQueue);
    });

    it('should return empty array when localStorage is empty', () => {
      const result = storage.loadSendQueue();
      expect(result).toEqual([]);
    });

    it('should handle localStorage parse errors gracefully', () => {
      localStorage.setItem('campaign_send_queue', 'invalid json');
      const result = storage.loadSendQueue();
      expect(result).toEqual([]);
    });

    it('should return empty array when window is undefined', () => {
      const originalWindow = global.window;
      delete (global as any).window;
      const result = storage.loadSendQueue();
      global.window = originalWindow;
      expect(result).toEqual([]);
    });
  });

  describe('saveSendQueue', () => {
    const mockQueue = [
      { id: 'CAMP-1', timestamp: '2024-01-01T00:00:00.000Z' },
      { id: 'CAMP-2', timestamp: '2024-01-02T00:00:00.000Z' },
    ];

    it('should save send queue to localStorage', () => {
      storage.saveSendQueue(mockQueue);
      const stored = localStorage.getItem('campaign_send_queue');
      expect(stored).toBe(JSON.stringify(mockQueue));
    });

    it('should handle localStorage write errors gracefully', () => {
      const originalSetItem = localStorage.setItem;
      localStorage.setItem = jest.fn(() => {
        throw new Error('Storage quota exceeded');
      });
      expect(() => storage.saveSendQueue(mockQueue)).not.toThrow();
      localStorage.setItem = originalSetItem;
    });

    it('should not throw when window is undefined', () => {
      const originalWindow = global.window;
      delete (global as any).window;
      expect(() => storage.saveSendQueue(mockQueue)).not.toThrow();
      global.window = originalWindow;
    });
  });

  describe('integration', () => {
    it('should save and load campaigns correctly', () => {
      storage.saveCampaigns(mockCampaigns);
      const loaded = storage.loadCampaigns();
      expect(loaded).toEqual(mockCampaigns);
    });

    it('should save and load send queue correctly', () => {
      const mockQueue = [
        { id: 'CAMP-1', timestamp: '2024-01-01T00:00:00.000Z' },
      ];
      storage.saveSendQueue(mockQueue);
      const loaded = storage.loadSendQueue();
      expect(loaded).toEqual(mockQueue);
    });

    it('should persist campaigns across storage instances', () => {
      storage.saveCampaigns(mockCampaigns);
      const storage2 = new CampaignLocalStorage();
      const loaded = storage2.loadCampaigns();
      expect(loaded).toEqual(mockCampaigns);
    });
  });
});
