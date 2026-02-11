import { ICollaborationAnalytics, CollaborationMetrics, DocumentOperation } from '@/types/collaboration';
import { COLLABORATION_CONFIG } from './config';

interface SessionData {
  roomId: string;
  userId: string;
  startTime: number;
  endTime: number;
  operationCount: number;
}

interface RoomMetrics {
  roomId: string;
  operationCount: number;
  conflictCount: number;
  sessionDurations: number[];
  lastActivity: number;
}

interface UserMetrics {
  userId: string;
  operationCount: number;
  conflictCount: number;
  sessionDurations: number[];
  lastActivity: number;
}

class CollaborationAnalytics implements ICollaborationAnalytics {
  private totalOperations: number = 0;
  private totalConflicts: number = 0;
  private operations: DocumentOperation[] = [];
  private conflicts: DocumentOperation[][] = [];
  private sessions: Map<string, SessionData> = new Map();
  private roomMetrics: Map<string, RoomMetrics> = new Map();
  private userMetrics: Map<string, UserMetrics> = new Map();

  trackOperation(operation: DocumentOperation): void {
    this.totalOperations++;
    this.operations.push(operation);

    const roomId = operation.roomId || 'default';
    this.updateRoomMetrics(roomId, operation.userId, 1);
    this.updateUserMetrics(operation.userId, 1);

    const now = Date.now();
    this.operations = this.operations.filter((op) => now - op.timestamp < COLLABORATION_CONFIG.analytics.operationRetention);
  }

  trackSession(roomId: string, userId: string, duration: number): void {
    const sessionKey = `${roomId}:${userId}`;
    const sessionData: SessionData = {
      roomId,
      userId,
      startTime: Date.now() - duration,
      endTime: Date.now(),
      operationCount: 0,
    };

    this.sessions.set(sessionKey, sessionData);

    const roomMetrics = this.roomMetrics.get(roomId);
    if (roomMetrics) {
      roomMetrics.sessionDurations.push(duration);
      roomMetrics.lastActivity = Date.now();
    }

    const userMetrics = this.userMetrics.get(userId);
    if (userMetrics) {
      userMetrics.sessionDurations.push(duration);
      userMetrics.lastActivity = Date.now();
    }
  }

  trackConflict(conflict: DocumentOperation[]): void {
    this.totalConflicts++;
    this.conflicts.push(conflict);

    for (const operation of conflict) {
      const roomId = operation.roomId || 'default';
      this.updateRoomMetrics(roomId, operation.userId, 0, 1);
      this.updateUserMetrics(operation.userId, 0, 1);
    }

    const now = Date.now();
    this.conflicts = this.conflicts.filter((c) => {
      const latestOp = c[c.length - 1];
      return latestOp && now - latestOp.timestamp < COLLABORATION_CONFIG.analytics.operationRetention;
    });
  }

  getMetrics(): CollaborationMetrics {
    const totalRooms = this.roomMetrics.size;
    const activeParticipants = this.getActiveParticipantCount();
    const operationsPerMinute = this.calculateOperationsPerMinute();
    const conflictRate = this.calculateConflictRate();
    const averageSessionDuration = this.calculateAverageSessionDuration();
    const offlineOperations = this.getOfflineOperationCount();
    const syncErrors = this.getSyncErrorCount();

    return {
      totalRooms,
      activeParticipants,
      totalOperations: this.totalOperations,
      operationsPerMinute,
      conflictRate,
      averageSessionDuration,
      offlineOperations,
      syncErrors,
    };
  }

  getMetricsByRoom(roomId: string): CollaborationMetrics {
    const roomMetrics = this.roomMetrics.get(roomId);
    
    if (!roomMetrics) {
      return {
        totalRooms: 0,
        activeParticipants: 0,
        totalOperations: 0,
        operationsPerMinute: 0,
        conflictRate: 0,
        averageSessionDuration: 0,
        offlineOperations: 0,
        syncErrors: 0,
      };
    }

    const operationsPerMinute = this.calculateRoomOperationsPerMinute(roomId);
    const conflictRate = roomMetrics.operationCount > 0 
      ? roomMetrics.conflictCount / roomMetrics.operationCount 
      : 0;
    const averageSessionDuration = roomMetrics.sessionDurations.length > 0
      ? roomMetrics.sessionDurations.reduce((sum, dur) => sum + dur, 0) / roomMetrics.sessionDurations.length
      : 0;

    return {
      totalRooms: 1,
      activeParticipants: 1,
      totalOperations: roomMetrics.operationCount,
      operationsPerMinute,
      conflictRate,
      averageSessionDuration,
      offlineOperations: 0,
      syncErrors: 0,
    };
  }

  getMetricsByUser(userId: string): CollaborationMetrics {
    const userMetrics = this.userMetrics.get(userId);
    
    if (!userMetrics) {
      return {
        totalRooms: 0,
        activeParticipants: 0,
        totalOperations: 0,
        operationsPerMinute: 0,
        conflictRate: 0,
        averageSessionDuration: 0,
        offlineOperations: 0,
        syncErrors: 0,
      };
    }

    const operationsPerMinute = this.calculateUserOperationsPerMinute(userId);
    const conflictRate = userMetrics.operationCount > 0
      ? userMetrics.conflictCount / userMetrics.operationCount
      : 0;
    const averageSessionDuration = userMetrics.sessionDurations.length > 0
      ? userMetrics.sessionDurations.reduce((sum, dur) => sum + dur, 0) / userMetrics.sessionDurations.length
      : 0;

    return {
      totalRooms: 1,
      activeParticipants: 1,
      totalOperations: userMetrics.operationCount,
      operationsPerMinute,
      conflictRate,
      averageSessionDuration,
      offlineOperations: 0,
      syncErrors: 0,
    };
  }

  resetMetrics(): void {
    this.totalOperations = 0;
    this.totalConflicts = 0;
    this.operations = [];
    this.conflicts = [];
    this.sessions.clear();
    this.roomMetrics.clear();
    this.userMetrics.clear();
  }

  private updateRoomMetrics(roomId: string, userId: string, operationIncrement: number, conflictIncrement: number = 0): void {
    let roomMetrics = this.roomMetrics.get(roomId);
    
    if (!roomMetrics) {
      roomMetrics = {
        roomId,
        operationCount: 0,
        conflictCount: 0,
        sessionDurations: [],
        lastActivity: Date.now(),
      };
      this.roomMetrics.set(roomId, roomMetrics);
    }

    roomMetrics.operationCount += operationIncrement;
    roomMetrics.conflictCount += conflictIncrement;
    roomMetrics.lastActivity = Date.now();
  }

  private updateUserMetrics(userId: string, operationIncrement: number, conflictIncrement: number = 0): void {
    let userMetrics = this.userMetrics.get(userId);
    
    if (!userMetrics) {
      userMetrics = {
        userId,
        operationCount: 0,
        conflictCount: 0,
        sessionDurations: [],
        lastActivity: Date.now(),
      };
      this.userMetrics.set(userId, userMetrics);
    }

    userMetrics.operationCount += operationIncrement;
    userMetrics.conflictCount += conflictIncrement;
    userMetrics.lastActivity = Date.now();
  }

  private getActiveParticipantCount(): number {
    const now = Date.now();
    let activeCount = 0;

    for (const roomMetrics of this.roomMetrics.values()) {
      if (now - roomMetrics.lastActivity < COLLABORATION_CONFIG.analytics.activeSessionThreshold) {
        activeCount++;
      }
    }

    return activeCount;
  }

  private calculateOperationsPerMinute(): number {
    if (this.operations.length === 0) return 0;

    const now = Date.now();
    const oneMinuteAgo = now - COLLABORATION_CONFIG.analytics.metricsAggregationInterval;
    const recentOperations = this.operations.filter((op) => op.timestamp >= oneMinuteAgo);

    return recentOperations.length;
  }

  private calculateRoomOperationsPerMinute(roomId: string): number {
    const roomOps = this.operations.filter((op) => op.roomId === roomId);
    
    if (roomOps.length === 0) return 0;

    const now = Date.now();
    const oneMinuteAgo = now - COLLABORATION_CONFIG.analytics.metricsAggregationInterval;
    const recentOps = roomOps.filter((op) => op.timestamp >= oneMinuteAgo);

    return recentOps.length;
  }

  private calculateUserOperationsPerMinute(userId: string): number {
    const userOps = this.operations.filter((op) => op.userId === userId);
    
    if (userOps.length === 0) return 0;

    const now = Date.now();
    const oneMinuteAgo = now - COLLABORATION_CONFIG.analytics.metricsAggregationInterval;
    const recentOps = userOps.filter((op) => op.timestamp >= oneMinuteAgo);

    return recentOps.length;
  }

  private calculateConflictRate(): number {
    if (this.totalOperations === 0) return 0;
    return this.totalConflicts / this.totalOperations;
  }

  private calculateAverageSessionDuration(): number {
    const allDurations: number[] = [];

    for (const roomMetrics of this.roomMetrics.values()) {
      allDurations.push(...roomMetrics.sessionDurations);
    }

    if (allDurations.length === 0) return 0;

    const sum = allDurations.reduce((acc, duration) => acc + duration, 0);
    return sum / allDurations.length;
  }

  private getOfflineOperationCount(): number {
    return 0;
  }

  private getSyncErrorCount(): number {
    return 0;
  }

  getTopActiveRooms(limit: number = 10): Array<{ roomId: string; operationCount: number }> {
    const rooms = Array.from(this.roomMetrics.entries())
      .map(([roomId, metrics]) => ({ roomId, operationCount: metrics.operationCount }))
      .sort((a, b) => b.operationCount - a.operationCount)
      .slice(0, limit);

    return rooms;
  }

  getTopActiveUsers(limit: number = 10): Array<{ userId: string; operationCount: number }> {
    const users = Array.from(this.userMetrics.entries())
      .map(([userId, metrics]) => ({ userId, operationCount: metrics.operationCount }))
      .sort((a, b) => b.operationCount - a.operationCount)
      .slice(0, limit);

    return users;
  }
}

export const collaborationAnalytics = new CollaborationAnalytics();
export default CollaborationAnalytics;
