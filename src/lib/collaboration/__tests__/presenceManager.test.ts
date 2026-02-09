import { describe, it, expect, beforeEach, afterEach, jest } from '@jest/globals';
import PresenceManager, { presenceManager } from '../presenceManager';
import { UserPresence, CursorPosition, SelectionRange } from '@/types/collaboration';

describe('PresenceManager', () => {
  let manager: PresenceManager;

  beforeEach(() => {
    manager = new PresenceManager();
    jest.useFakeTimers();
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  describe('updatePresence', () => {
    it('should create new presence for user', () => {
      const presence: Partial<UserPresence> = {
        userId: 'user1',
        userName: 'Test User',
        status: 'online',
        lastSeen: Date.now(),
        isTyping: false,
      };

      manager.updatePresence('user1', presence);

      const result = manager.getPresence('user1');
      expect(result).toBeDefined();
      expect(result?.userId).toBe('user1');
      expect(result?.userName).toBe('Test User');
      expect(result?.status).toBe('online');
    });

    it('should update existing presence', () => {
      const presence1: Partial<UserPresence> = {
        userName: 'Test User',
        status: 'online',
        lastSeen: Date.now(),
        isTyping: false,
      };

      manager.updatePresence('user1', presence1);

      const presence2: Partial<UserPresence> = {
        status: 'idle',
        lastSeen: Date.now(),
      };

      manager.updatePresence('user1', presence2);

      const result = manager.getPresence('user1');
      expect(result?.userName).toBe('Test User'); // Unchanged
      expect(result?.status).toBe('idle'); // Updated
    });

    it('should preserve existing fields when updating', () => {
      const presence1: Partial<UserPresence> = {
        userName: 'Test User',
        status: 'online',
        lastSeen: Date.now(),
        isTyping: false,
        cursorPosition: { line: 1, column: 5 },
      };

      manager.updatePresence('user1', presence1);

      const presence2: Partial<UserPresence> = {
        status: 'idle',
      };

      manager.updatePresence('user1', presence2);

      const result = manager.getPresence('user1');
      expect(result?.userName).toBe('Test User'); // Preserved
      expect(result?.cursorPosition).toEqual({ line: 1, column: 5 }); // Preserved
      expect(result?.status).toBe('idle'); // Updated
    });
  });

  describe('getPresence', () => {
    it('should return presence for existing user', () => {
      const presence: Partial<UserPresence> = {
        userName: 'Test User',
        status: 'online',
        lastSeen: Date.now(),
        isTyping: false,
      };

      manager.updatePresence('user1', presence);

      const result = manager.getPresence('user1');
      expect(result).toBeDefined();
      expect(result?.userId).toBe('user1');
    });

    it('should return undefined for non-existent user', () => {
      const result = manager.getPresence('nonexistent');
      expect(result).toBeUndefined();
    });
  });

  describe('getAllPresences', () => {
    beforeEach(() => {
      manager.joinRoom('user1', 'room1');
      manager.joinRoom('user2', 'room1');
      manager.joinRoom('user3', 'room2');
    });

    it('should return all presences for room', () => {
      const room1Presences = manager.getAllPresences('room1');

      expect(room1Presences.length).toBe(2);
      expect(room1Presences.every((p) => p.userId === 'user1' || p.userId === 'user2')).toBe(true);
    });

    it('should return empty array for non-existent room', () => {
      const room3Presences = manager.getAllPresences('room3');
      expect(room3Presences).toEqual([]);
    });
  });

  describe('removePresence', () => {
    beforeEach(() => {
      const presence1: Partial<UserPresence> = {
        userName: 'User 1',
        status: 'online',
        lastSeen: Date.now(),
        isTyping: false,
      };

      const presence2: Partial<UserPresence> = {
        userName: 'User 2',
        status: 'online',
        lastSeen: Date.now(),
        isTyping: false,
      };

      manager.updatePresence('user1', presence1);
      manager.updatePresence('user2', presence2);
      manager.joinRoom('user1', 'room1');
      manager.joinRoom('user2', 'room1');
    });

    it('should remove user presence', () => {
      manager.removePresence('user1');

      const result = manager.getPresence('user1');
      expect(result).toBeUndefined();
    });

    it('should remove user from all rooms', () => {
      manager.joinRoom('user1', 'room2');
      
      manager.removePresence('user1');

      const room1Presences = manager.getAllPresences('room1');
      const room2Presences = manager.getAllPresences('room2');

      expect(room1Presences).toHaveLength(1);
      expect(room1Presences[0].userId).toBe('user2');
      expect(room2Presences).toHaveLength(0);
    });

    it('should clear typing timeout', () => {
      const presence: Partial<UserPresence> = {
        userName: 'Test User',
        status: 'online',
        lastSeen: Date.now(),
        isTyping: true,
      };

      manager.updatePresence('user1', presence);
      manager.setTypingStatus('user1', true);
      
      manager.removePresence('user1');

      expect(jest.getTimerCount()).toBe(0);
    });
  });

  describe('setTypingStatus', () => {
    it('should set typing status to true', () => {
      const presence: Partial<UserPresence> = {
        userName: 'Test User',
        status: 'online',
        lastSeen: Date.now(),
        isTyping: false,
      };

      manager.updatePresence('user1', presence);
      manager.setTypingStatus('user1', true);

      const result = manager.getPresence('user1');
      expect(result?.isTyping).toBe(true);
    });

    it('should set typing status to false', () => {
      const presence: Partial<UserPresence> = {
        userName: 'Test User',
        status: 'online',
        lastSeen: Date.now(),
        isTyping: true,
      };

      manager.updatePresence('user1', presence);
      manager.setTypingStatus('user1', false);

      const result = manager.getPresence('user1');
      expect(result?.isTyping).toBe(false);
    });

    it('should auto-reset typing status after timeout', () => {
      const presence: Partial<UserPresence> = {
        userName: 'Test User',
        status: 'online',
        lastSeen: Date.now(),
        isTyping: false,
      };

      manager.updatePresence('user1', presence);
      manager.setTypingStatus('user1', true);

      jest.advanceTimersByTime(3000);

      const result = manager.getPresence('user1');
      expect(result?.isTyping).toBe(false);
    });

    it('should clear previous timeout when setting new status', () => {
      const presence: Partial<UserPresence> = {
        userName: 'Test User',
        status: 'online',
        lastSeen: Date.now(),
        isTyping: false,
      };

      manager.updatePresence('user1', presence);
      manager.setTypingStatus('user1', true);
      
      jest.advanceTimersByTime(1000);
      manager.setTypingStatus('user1', true); // Reset timer
      
      jest.advanceTimersByTime(2000); // Total 3000ms from first set
      
      const result = manager.getPresence('user1');
      expect(result?.isTyping).toBe(true); // Should still be true due to timer reset
    });
  });

  describe('updateCursorPosition', () => {
    it('should update cursor position', () => {
      const position: CursorPosition = { line: 1, column: 5 };
      const presence: Partial<UserPresence> = {
        userName: 'Test User',
        status: 'online',
        lastSeen: Date.now(),
        isTyping: false,
      };

      manager.updatePresence('user1', presence);
      manager.updateCursorPosition('user1', position);

      const result = manager.getPresence('user1');
      expect(result?.cursorPosition).toEqual(position);
    });

    it('should update selection if provided', () => {
      const position: CursorPosition = { line: 1, column: 5 };
      const selection: SelectionRange = {
        start: { line: 1, column: 5 },
        end: { line: 1, column: 10 },
      };
      const presence: Partial<UserPresence> = {
        userName: 'Test User',
        status: 'online',
        lastSeen: Date.now(),
        isTyping: false,
      };

      manager.updatePresence('user1', presence);
      manager.updateCursorPosition('user1', position, selection);

      const result = manager.getPresence('user1');
      expect(result?.cursorPosition).toEqual(position);
      expect(result?.selection).toEqual(selection);
    });

    it('should set status to online when cursor moves', () => {
      const position: CursorPosition = { line: 1, column: 5 };
      const presence: Partial<UserPresence> = {
        userName: 'Test User',
        status: 'idle',
        lastSeen: Date.now(),
        isTyping: false,
      };

      manager.updatePresence('user1', presence);
      manager.updateCursorPosition('user1', position);

      const result = manager.getPresence('user1');
      expect(result?.status).toBe('online');
    });
  });

  describe('broadcastPresence', () => {
    beforeEach(() => {
      const presence1: Partial<UserPresence> = {
        userName: 'User 1',
        status: 'online',
        lastSeen: Date.now(),
        isTyping: false,
      };

      const presence2: Partial<UserPresence> = {
        userName: 'User 2',
        status: 'online',
        lastSeen: Date.now(),
        isTyping: true,
      };

      manager.updatePresence('user1', presence1);
      manager.updatePresence('user2', presence2);
      manager.joinRoom('user1', 'room1');
      manager.joinRoom('user2', 'room1');
    });

    it('should return broadcast data for room', async () => {
      const broadcastData = await manager.broadcastPresence('room1');

      expect(broadcastData.roomId).toBe('room1');
      expect(broadcastData.presences).toHaveLength(2);
      expect(broadcastData.timestamp).toBeGreaterThan(0);
    });

    it('should include all presence fields', async () => {
      const broadcastData = await manager.broadcastPresence('room1');

      const presence1 = broadcastData.presences.find((p) => p.userId === 'user1');
      expect(presence1).toBeDefined();
      expect(presence1?.userName).toBe('User 1');
      expect(presence1?.status).toBe('online');
      expect(presence1?.isTyping).toBe(false);
    });
  });

  describe('cleanupInactivePresences', () => {
    beforeEach(() => {
      const now = Date.now();
      
      const presence1: Partial<UserPresence> = {
        userName: 'Active User',
        status: 'online',
        lastSeen: now,
        isTyping: false,
      };

      const presence2: Partial<UserPresence> = {
        userName: 'Idle User',
        status: 'online',
        lastSeen: now - 35000, // 35 seconds ago
        isTyping: false,
      };

      const presence3: Partial<UserPresence> = {
        userName: 'Offline User',
        status: 'online',
        lastSeen: now - 70000, // 70 seconds ago
        isTyping: false,
      };

      manager.updatePresence('user1', presence1);
      manager.updatePresence('user2', presence2);
      manager.updatePresence('user3', presence3);
    });

    it('should mark inactive users as idle', () => {
      manager.cleanupInactivePresences();

      const user2 = manager.getPresence('user2');
      expect(user2?.status).toBe('idle');
    });

    it('should remove offline users', () => {
      manager.cleanupInactivePresences();

      const user3 = manager.getPresence('user3');
      expect(user3).toBeUndefined();
    });

    it('should keep active users', () => {
      manager.cleanupInactivePresences();

      const user1 = manager.getPresence('user1');
      expect(user1?.status).toBe('online');
    });
  });

  describe('getRoomCount', () => {
    it('should return 0 for empty room', () => {
      const count = manager.getRoomCount('room1');
      expect(count).toBe(0);
    });

    it('should return correct count for room with users', () => {
      const presence1: Partial<UserPresence> = {
        userName: 'User 1',
        status: 'online',
        lastSeen: Date.now(),
        isTyping: false,
      };

      const presence2: Partial<UserPresence> = {
        userName: 'User 2',
        status: 'online',
        lastSeen: Date.now(),
        isTyping: false,
      };

      manager.updatePresence('user1', presence1);
      manager.updatePresence('user2', presence2);
      manager.joinRoom('user1', 'room1');
      manager.joinRoom('user2', 'room1');

      const count = manager.getRoomCount('room1');
      expect(count).toBe(2);
    });
  });

  describe('getTotalUserCount', () => {
    it('should return 0 when no users', () => {
      const count = manager.getTotalUserCount();
      expect(count).toBe(0);
    });

    it('should return correct count for all users', () => {
      const presence1: Partial<UserPresence> = {
        userName: 'User 1',
        status: 'online',
        lastSeen: Date.now(),
        isTyping: false,
      };

      const presence2: Partial<UserPresence> = {
        userName: 'User 2',
        status: 'online',
        lastSeen: Date.now(),
        isTyping: false,
      };

      const presence3: Partial<UserPresence> = {
        userName: 'User 3',
        status: 'online',
        lastSeen: Date.now(),
        isTyping: false,
      };

      manager.updatePresence('user1', presence1);
      manager.updatePresence('user2', presence2);
      manager.updatePresence('user3', presence3);

      const count = manager.getTotalUserCount();
      expect(count).toBe(3);
    });
  });
});
