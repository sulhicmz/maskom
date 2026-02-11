import {
  IPresenceManager,
  UserPresence,
  CursorPosition,
  SelectionRange,
} from '@/types/collaboration';
import { COLLABORATION_CONFIG } from './config';

class PresenceManager implements IPresenceManager {
  private presences: Map<string, UserPresence> = new Map();
  private roomPresences: Map<string, Set<string>> = new Map();
  private presenceTimeout: number = COLLABORATION_CONFIG.presence.timeout;
  private typingTimeout: Map<string, NodeJS.Timeout> = new Map();

  updatePresence(userId: string, presenceUpdate: Partial<UserPresence>): void {
    const existing = this.presences.get(userId);
    
    const updatedPresence: UserPresence = {
      userId,
      userName: presenceUpdate.userName || existing?.userName || '',
      userAvatar: presenceUpdate.userAvatar || existing?.userAvatar,
      status: presenceUpdate.status || existing?.status || 'online',
      cursorPosition: presenceUpdate.cursorPosition || existing?.cursorPosition,
      selection: presenceUpdate.selection || existing?.selection,
      lastSeen: presenceUpdate.lastSeen || existing?.lastSeen || Date.now(),
      isTyping: presenceUpdate.isTyping ?? existing?.isTyping ?? false,
    };

    this.presences.set(userId, updatedPresence);
  }

  getPresence(userId: string): UserPresence | undefined {
    return this.presences.get(userId);
  }

  getAllPresences(roomId: string): UserPresence[] {
    const roomUsers = this.roomPresences.get(roomId);
    if (!roomUsers) return [];

    const presences: UserPresence[] = [];
    for (const userId of roomUsers) {
      const presence = this.presences.get(userId);
      if (presence) {
        presences.push(presence);
      }
    }

    return presences;
  }

  removePresence(userId: string): void {
    const presence = this.presences.get(userId);
    if (!presence) return;

    this.presences.delete(userId);
    
    for (const [roomId, users] of this.roomPresences.entries()) {
      users.delete(userId);
      if (users.size === 0) {
        this.roomPresences.delete(roomId);
      }
    }

    const typingTimer = this.typingTimeout.get(userId);
    if (typingTimer) {
      clearTimeout(typingTimer);
      this.typingTimeout.delete(userId);
    }
  }

  setTypingStatus(userId: string, isTyping: boolean): void {
    const presence = this.presences.get(userId);
    if (!presence) return;

    presence.isTyping = isTyping;
    presence.lastSeen = Date.now();

    const existingTimer = this.typingTimeout.get(userId);
    if (existingTimer) {
      clearTimeout(existingTimer);
    }

    if (isTyping) {
      const timer = setTimeout(() => {
        this.setTypingStatus(userId, false);
      }, COLLABORATION_CONFIG.typing.resetDelay);
      this.typingTimeout.set(userId, timer);
    }
  }

  updateCursorPosition(userId: string, position: CursorPosition, selection?: SelectionRange): void {
    const presence = this.presences.get(userId);
    if (!presence) return;

    presence.cursorPosition = position;
    if (selection) {
      presence.selection = selection;
    }
    presence.lastSeen = Date.now();
    presence.status = 'online';
  }

  async broadcastPresence(roomId: string): Promise<void> {
    const presences = this.getAllPresences(roomId);
    
    const broadcastData = {
      roomId,
      presences: presences.map((p) => ({
        userId: p.userId,
        userName: p.userName,
        userAvatar: p.userAvatar,
        status: p.status,
        cursorPosition: p.cursorPosition,
        selection: p.selection,
        isTyping: p.isTyping,
      })),
      timestamp: Date.now(),
    };

    return broadcastData;
  }

  cleanupInactivePresences(): void {
    const now = Date.now();
    const inactiveUsers: string[] = [];

    for (const [userId, presence] of this.presences.entries()) {
      if (now - presence.lastSeen > this.presenceTimeout) {
        presence.status = 'idle';
        
        if (now - presence.lastSeen > this.presenceTimeout * 2) {
          inactiveUsers.push(userId);
        }
      }
    }

    for (const userId of inactiveUsers) {
      this.removePresence(userId);
    }
  }

  joinRoom(userId: string, roomId: string): void {
    const presence = this.presences.get(userId);
    if (!presence) return;

    let roomUsers = this.roomPresences.get(roomId);
    if (!roomUsers) {
      roomUsers = new Set();
      this.roomPresences.set(roomId, roomUsers);
    }

    roomUsers.add(userId);
    presence.status = 'online';
    presence.lastSeen = Date.now();
  }

  leaveRoom(userId: string, roomId: string): void {
    const roomUsers = this.roomPresences.get(roomId);
    if (roomUsers) {
      roomUsers.delete(userId);
      if (roomUsers.size === 0) {
        this.roomPresences.delete(roomId);
      }
    }

    const presence = this.presences.get(userId);
    if (presence) {
      presence.lastSeen = Date.now();
    }
  }

  getRoomCount(roomId: string): number {
    const roomUsers = this.roomPresences.get(roomId);
    return roomUsers ? roomUsers.size : 0;
  }

  getTotalUserCount(): number {
    return this.presences.size;
  }

  startCleanupInterval(intervalMs: number = COLLABORATION_CONFIG.presence.cleanupInterval): void {
    setInterval(() => {
      this.cleanupInactivePresences();
    }, intervalMs);
  }
}

export const presenceManager = new PresenceManager();
export default PresenceManager;
