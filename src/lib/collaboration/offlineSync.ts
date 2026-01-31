import { IOfflineSync, OfflineOperation } from '@/types/collaboration';
import { IStorage } from '@/types/storage';

interface OfflineSyncConfig {
  maxOfflineOperations: number;
  retryDelay: number;
  maxRetryAttempts: number;
}

class OfflineSync implements IOfflineSync {
  private operationQueue: Map<string, OfflineOperation[]> = new Map();
  private isOnline: boolean = true;
  private config: OfflineSyncConfig;
  private storage?: IStorage<OfflineOperation[]>;
  private syncInProgress: boolean = false;
  private storageKey = 'offline-sync-operations';

  constructor(config?: Partial<OfflineSyncConfig>) {
    this.config = {
      maxOfflineOperations: config?.maxOfflineOperations || 100,
      retryDelay: config?.retryDelay || 5000,
      maxRetryAttempts: config?.maxRetryAttempts || 3,
    };

    if (typeof window !== 'undefined') {
      this.storage = this.createStorage();
      this.loadFromStorage();
    }

    this.setupOnlineListeners();
  }

  private createStorage(): IStorage<OfflineOperation[]> | undefined {
    try {
      const { Storage } = require('@/utils/storage');
      return new Storage<OfflineOperation[]>(this.storageKey, []);
    } catch (error) {
      console.error('Failed to create storage for offline sync:', error);
      return undefined;
    }
  }

  private setupOnlineListeners(): void {
    if (typeof window === 'undefined') return;

    window.addEventListener('online', () => {
      this.setOnlineStatus(true);
      this.processQueue().catch((error) => {
        console.error('Failed to process offline queue on reconnect:', error);
      });
    });

    window.addEventListener('offline', () => {
      this.setOnlineStatus(false);
    });
  }

  queueOperation(operation: OfflineOperation): void {
    const roomId = operation.roomId;
    let roomQueue = this.operationQueue.get(roomId);

    if (!roomQueue) {
      roomQueue = [];
      this.operationQueue.set(roomId, roomQueue);
    }

    if (roomQueue.length >= this.config.maxOfflineOperations) {
      console.warn(`Offline queue for room ${roomId} is full. Dropping oldest operation.`);
      roomQueue.shift();
    }

    roomQueue.push(operation);
    this.saveToStorage();
  }

  async processQueue(): Promise<OfflineOperation[]> {
    if (this.syncInProgress || this.isOnline === false) {
      return [];
    }

    this.syncInProgress = true;
    const processedOperations: OfflineOperation[] = [];

    try {
      for (const [roomId, operations] of this.operationQueue.entries()) {
        for (let i = 0; i < operations.length; i++) {
          const operation = operations[i];

          if (operation.synced || operation.retryCount >= this.config.maxRetryAttempts) {
            continue;
          }

          try {
            await this.syncOperation(operation);
            operation.synced = true;
            processedOperations.push(operation);
          } catch (error) {
            operation.retryCount++;
            console.error(`Failed to sync operation ${i} for room ${roomId}:`, error);

            if (operation.retryCount >= this.config.maxRetryAttempts) {
              console.warn(`Operation exceeded max retry attempts. Marking as synced to prevent infinite loop.`);
              operation.synced = true;
            }

            await new Promise((resolve) => setTimeout(resolve, this.config.retryDelay));
          }
        }

        const syncedOperations = operations.filter((op) => op.synced);
        this.operationQueue.set(roomId, operations.filter((op) => !op.synced));
        this.saveToStorage();
      }
    } finally {
      this.syncInProgress = false;
    }

    return processedOperations;
  }

  private async syncOperation(operation: OfflineOperation): Promise<void> {
    if (typeof window === 'undefined') return;

    const event = new CustomEvent('offline-operation', {
      detail: operation,
    });

    window.dispatchEvent(event);
  }

  getQueueSize(): number {
    let totalSize = 0;
    for (const queue of this.operationQueue.values()) {
      totalSize += queue.length;
    }
    return totalSize;
  }

  getQueueSizeByRoom(roomId: string): number {
    const queue = this.operationQueue.get(roomId);
    return queue ? queue.length : 0;
  }

  clearQueue(): void {
    this.operationQueue.clear();
    this.saveToStorage();
  }

  clearQueueForRoom(roomId: string): void {
    this.operationQueue.delete(roomId);
    this.saveToStorage();
  }

  async retryFailedOperations(): Promise<OfflineOperation[]> {
    const failedOps: OfflineOperation[] = [];

    for (const [roomId, operations] of this.operationQueue.entries()) {
      for (const operation of operations) {
        if (!operation.synced && operation.retryCount < this.config.maxRetryAttempts) {
          operation.retryCount = 0;
          failedOps.push(operation);
        }
      }
    }

    await this.processQueue();
    return failedOps;
  }

  isOnlineStatus(): boolean {
    return this.isOnline;
  }

  setOnlineStatus(isOnline: boolean): void {
    this.isOnline = isOnline;
    
    if (isOnline && !this.syncInProgress) {
      this.processQueue().catch((error) => {
        console.error('Failed to process queue on online status change:', error);
      });
    }
  }

  private saveToStorage(): void {
    if (!this.storage) return;

    const allOperations: OfflineOperation[] = [];
    for (const queue of this.operationQueue.values()) {
      allOperations.push(...queue);
    }

    try {
      this.storage.set(allOperations);
    } catch (error) {
      console.error('Failed to save offline operations to storage:', error);
    }
  }

  private loadFromStorage(): void {
    if (!this.storage) return;

    try {
      const operations = this.storage.get();
      if (!operations || !Array.isArray(operations)) return;

      for (const operation of operations) {
        this.queueOperation(operation);
      }
    } catch (error) {
      console.error('Failed to load offline operations from storage:', error);
    }
  }

  getPendingOperations(): OfflineOperation[] {
    const pending: OfflineOperation[] = [];

    for (const queue of this.operationQueue.values()) {
      for (const operation of queue) {
        if (!operation.synced) {
          pending.push(operation);
        }
      }
    }

    return pending;
  }

  getPendingOperationsByRoom(roomId: string): OfflineOperation[] {
    const queue = this.operationQueue.get(roomId);
    if (!queue) return [];

    return queue.filter((op) => !op.synced);
  }

  getConfig(): OfflineSyncConfig {
    return { ...this.config };
  }

  updateConfig(config: Partial<OfflineSyncConfig>): void {
    this.config = {
      ...this.config,
      ...config,
    };
  }
}

export const offlineSync = new OfflineSync();
export default OfflineSync;
