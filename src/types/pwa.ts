export type ServiceWorkerStatus = 'unsupported' | 'installing' | 'activated' | 'error' | 'waiting';

export type NetworkStatus = 'online' | 'offline' | 'unknown';

export type AddToHomeScreenStatus = 'unsupported' | 'prompting' | 'accepted' | 'dismissed' | 'installed';

export interface PWAStatus {
  serviceWorker: ServiceWorkerStatus;
  network: NetworkStatus;
  addToHomeScreen: AddToHomeScreenStatus;
  cacheStatus?: {
    totalSize: number;
    hitRate: number;
  };
  backgroundSync?: {
    pending: number;
    lastSync: number | null;
  };
}

export interface OfflineAction {
  id: string;
  type: 'form_submission' | 'bookmark' | 'comment' | 'like';
  url: string;
  data: unknown;
  timestamp: number;
  retries: number;
  status: 'pending' | 'synced' | 'failed';
}

export interface ServiceWorkerHealth {
  isRegistered: boolean;
  isActive: boolean;
  isControlling: boolean;
  lastUpdateCheck: number | null;
  updateAvailable: boolean;
  cacheSize: number;
  cacheHitRate: number;
  totalRequests: number;
}

export interface BackgroundSyncConfig {
  enabled: boolean;
  syncInterval: number;
  maxRetries: number;
  retryDelay: number;
}

export const DEFAULT_BACKGROUND_SYNC_CONFIG: BackgroundSyncConfig = {
  enabled: true,
  syncInterval: 60000,
  maxRetries: 3,
  retryDelay: 5000,
};

export const OFFLINE_ACTIONS_KEY = 'maskom_offline_actions';
export const PWA_STATUS_KEY = 'maskom_pwa_status';
export const BACKGROUND_SYNC_CONFIG_KEY = 'maskom_background_sync_config';
