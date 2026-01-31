import { describe, it, expect, beforeEach, afterEach } from '@jest/globals';
import {
  addOfflineAction,
  removeOfflineAction,
  updateOfflineActionStatus,
  incrementOfflineActionRetries,
  clearOfflineActions,
  syncOfflineActions,
  getOfflineActions,
  getPendingActionCount,
  getSyncConfig,
  updateSyncConfig,
} from '../backgroundSync';

jest.mock('@/types/pwa', () => ({
  ...jest.requireActual('@/types/pwa'),
  OFFLINE_ACTIONS_KEY: 'test_offline_actions',
  BACKGROUND_SYNC_CONFIG_KEY: 'test_background_sync_config',
}));

describe('backgroundSync', () => {
  beforeEach(() => {
    localStorage.clear();
  });

  afterEach(() => {
    localStorage.clear();
  });

  describe('addOfflineAction', () => {
    it('should add a new offline action', () => {
      const action = addOfflineAction({
        type: 'form_submission',
        url: '/api/contact',
        data: { name: 'Test', email: 'test@example.com' },
      });

      expect(action).toHaveProperty('id');
      expect(action.type).toBe('form_submission');
      expect(action.url).toBe('/api/contact');
      expect(action.status).toBe('pending');
      expect(action.retries).toBe(0);
      expect(typeof action.timestamp).toBe('number');
    });

    it('should persist action to localStorage', () => {
      const action = addOfflineAction({
        type: 'bookmark',
        url: '/api/bookmarks',
        data: { postId: 123 },
      });

      const actions = getOfflineActions();
      expect(actions).toHaveLength(1);
      expect(actions[0].id).toBe(action.id);
    });
  });

  describe('removeOfflineAction', () => {
    it('should remove an existing action', () => {
      const action = addOfflineAction({
        type: 'bookmark',
        url: '/api/bookmarks',
        data: { postId: 123 },
      });

      const removed = removeOfflineAction(action.id);
      expect(removed).toBe(true);

      const actions = getOfflineActions();
      expect(actions).toHaveLength(0);
    });

    it('should return false for non-existent action', () => {
      const removed = removeOfflineAction('non-existent-id');
      expect(removed).toBe(false);
    });
  });

  describe('updateOfflineActionStatus', () => {
    it('should update action status', () => {
      const action = addOfflineAction({
        type: 'bookmark',
        url: '/api/bookmarks',
        data: { postId: 123 },
      });

      const updated = updateOfflineActionStatus(action.id, 'synced');
      expect(updated).toBe(true);

      const actions = getOfflineActions();
      expect(actions[0].status).toBe('synced');
    });

    it('should return false for non-existent action', () => {
      const updated = updateOfflineActionStatus('non-existent-id', 'synced');
      expect(updated).toBe(false);
    });
  });

  describe('incrementOfflineActionRetries', () => {
    it('should increment action retries', () => {
      const action = addOfflineAction({
        type: 'bookmark',
        url: '/api/bookmarks',
        data: { postId: 123 },
      });

      const incremented = incrementOfflineActionRetries(action.id);
      expect(incremented).toBe(true);

      const actions = getOfflineActions();
      expect(actions[0].retries).toBe(1);

      incrementOfflineActionRetries(action.id);
      expect(getOfflineActions()[0].retries).toBe(2);
    });
  });

  describe('clearOfflineActions', () => {
    it('should clear all offline actions', () => {
      addOfflineAction({
        type: 'bookmark',
        url: '/api/bookmarks',
        data: { postId: 123 },
      });

      addOfflineAction({
        type: 'form_submission',
        url: '/api/contact',
        data: { name: 'Test' },
      });

      expect(getOfflineActions()).toHaveLength(2);

      clearOfflineActions();
      expect(getOfflineActions()).toHaveLength(0);
    });
  });

  describe('syncOfflineActions', () => {
    it('should sync pending actions when online', async () => {
      Object.defineProperty(navigator, 'onLine', {
        value: true,
        writable: true,
        configurable: true,
      });

      updateSyncConfig({ retryDelay: 0 });

      global.fetch = jest.fn().mockResolvedValue({
        ok: true,
        json: async () => ({}),
      }) as unknown as typeof fetch;

      addOfflineAction({
        type: 'bookmark',
        url: '/api/bookmarks',
        data: { postId: 123 },
      });

      const result = await syncOfflineActions();
      expect(result.succeeded).toBeGreaterThan(0);
      expect(result.failed).toBe(0);
    });

    it('should not sync when offline', async () => {
      Object.defineProperty(navigator, 'onLine', {
        value: false,
        writable: true,
        configurable: true,
      });

      const result = await syncOfflineActions();
      expect(result.succeeded).toBe(0);
      expect(result.failed).toBe(0);
    });
  });

  describe('getPendingActionCount', () => {
    it('should count pending actions', () => {
      const action1 = addOfflineAction({
        type: 'bookmark',
        url: '/api/bookmarks',
        data: { postId: 123 },
      });

      addOfflineAction({
        type: 'form_submission',
        url: '/api/contact',
        data: { name: 'Test' },
      });

      updateOfflineActionStatus(action1.id, 'synced');

      expect(getPendingActionCount()).toBe(1);
    });
  });

  describe('getSyncConfig and updateSyncConfig', () => {
    it('should get default config', () => {
      const config = getSyncConfig();
      expect(config).toHaveProperty('enabled');
      expect(config).toHaveProperty('syncInterval');
      expect(config).toHaveProperty('maxRetries');
      expect(config).toHaveProperty('retryDelay');
    });

    it('should update config', () => {
      updateSyncConfig({ maxRetries: 5, retryDelay: 10000 });

      const config = getSyncConfig();
      expect(config.maxRetries).toBe(5);
      expect(config.retryDelay).toBe(10000);
    });
  });
});
