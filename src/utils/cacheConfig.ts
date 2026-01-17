import { CacheConfig, CacheStatistics, DEFAULT_CACHE_CONFIG, CACHE_STORAGE_KEY } from '@/types/cache';

export function loadCacheConfig(): CacheConfig {
  if (typeof window === 'undefined') {
    return DEFAULT_CACHE_CONFIG;
  }

  try {
    const stored = localStorage.getItem(CACHE_STORAGE_KEY);
    if (stored) {
      const config = JSON.parse(stored) as CacheConfig;
      return { ...DEFAULT_CACHE_CONFIG, ...config };
    }
  } catch (error) {
    console.error('[Cache Config] Failed to load config:', error);
  }

  return DEFAULT_CACHE_CONFIG;
}

export function saveCacheConfig(config: CacheConfig): void {
  if (typeof window === 'undefined') {
    return;
  }

  try {
    localStorage.setItem(CACHE_STORAGE_KEY, JSON.stringify(config));
    notifyServiceWorker('UPDATE_CACHE_CONFIG', config);
  } catch (error) {
    console.error('[Cache Config] Failed to save config:', error);
  }
}

export function validateCacheConfig(config: CacheConfig): { valid: boolean; errors: string[] } {
  const errors: string[] = [];

  if (!Array.isArray(config.cacheFirstExtensions)) {
    errors.push('cacheFirstExtensions must be an array');
  } else if (config.cacheFirstExtensions.length === 0) {
    errors.push('cacheFirstExtensions must have at least one extension');
  } else if (config.cacheFirstExtensions.some(ext => !ext.startsWith('.'))) {
    errors.push('All cacheFirstExtensions must start with a dot (.)');
  }

  if (!Array.isArray(config.networkFirstPatterns)) {
    errors.push('networkFirstPatterns must be an array');
  }

  if (!config.cacheTTL || typeof config.cacheTTL !== 'object') {
    errors.push('cacheTTL must be an object');
  } else {
    const ttl = config.cacheTTL;
    if (typeof ttl.staticAssets !== 'number' || ttl.staticAssets < 0) {
      errors.push('cacheTTL.staticAssets must be a non-negative number');
    }
    if (typeof ttl.apiResponses !== 'number' || ttl.apiResponses < 0) {
      errors.push('cacheTTL.apiResponses must be a non-negative number');
    }
    if (typeof ttl.images !== 'number' || ttl.images < 0) {
      errors.push('cacheTTL.images must be a non-negative number');
    }
    if (typeof ttl.fonts !== 'number' || ttl.fonts < 0) {
      errors.push('cacheTTL.fonts must be a non-negative number');
    }
  }

  if (typeof config.cacheSizeLimit !== 'number' || config.cacheSizeLimit <= 0 || config.cacheSizeLimit > 1000) {
    errors.push('cacheSizeLimit must be between 1 and 1000 MB');
  }

  if (!config.cleanupPolicy || typeof config.cleanupPolicy !== 'object') {
    errors.push('cleanupPolicy must be an object');
  } else {
    const policy = config.cleanupPolicy;
    if (typeof policy.enabled !== 'boolean') {
      errors.push('cleanupPolicy.enabled must be a boolean');
    }
    if (typeof policy.maxAge !== 'number' || policy.maxAge < 0) {
      errors.push('cleanupPolicy.maxAge must be a non-negative number');
    }
    if (typeof policy.maxEntries !== 'number' || policy.maxEntries <= 0 || policy.maxEntries > 10000) {
      errors.push('cleanupPolicy.maxEntries must be between 1 and 10000');
    }
    if (typeof policy.autoCleanupInterval !== 'number' || policy.autoCleanupInterval < 1) {
      errors.push('cleanupPolicy.autoCleanupInterval must be at least 1 minute');
    }
  }

  return { valid: errors.length === 0, errors };
}

export function resetCacheConfig(): CacheConfig {
  saveCacheConfig(DEFAULT_CACHE_CONFIG);
  return DEFAULT_CACHE_CONFIG;
}

export async function clearCache(): Promise<void> {
  if ('serviceWorker' in navigator && navigator.serviceWorker.controller) {
    return new Promise((resolve, reject) => {
      const messageChannel = new MessageChannel();

      messageChannel.port1.onmessage = (event) => {
        if (event.data.type === 'CACHE_CLEARED') {
          resolve();
        } else if (event.data.type === 'CACHE_CLEAR_ERROR') {
          reject(new Error(event.data.error));
        }
      };

      navigator.serviceWorker.controller.postMessage(
        { type: 'CLEAR_CACHE' },
        [messageChannel.port2]
      );
    });
  } else {
    console.warn('[Cache Config] Service worker not available');
    throw new Error('Service worker not available');
  }
}

export async function getCacheStatistics(): Promise<CacheStatistics> {
  if (typeof window === 'undefined') {
    return getEmptyStatistics();
  }

  try {
    if ('serviceWorker' in navigator && navigator.serviceWorker.controller) {
      return new Promise((resolve) => {
        const messageChannel = new MessageChannel();

        messageChannel.port1.onmessage = (event) => {
          if (event.data.type === 'CACHE_STATS') {
            resolve(event.data.stats as CacheStatistics);
          }
        };

        navigator.serviceWorker.controller.postMessage(
          { type: 'GET_CACHE_STATS' },
          [messageChannel.port2]
        );
      });
    }
  } catch (error) {
    console.error('[Cache Config] Failed to get statistics:', error);
  }

  return getEmptyStatistics();
}

export function getEmptyStatistics(): CacheStatistics {
  return {
    totalCacheSize: 0,
    cacheHitRate: 0,
    totalRequests: 0,
    cacheHits: 0,
    cacheMisses: 0,
    entriesByCache: {},
    lastCleanupTime: null,
  };
}

export function notifyServiceWorker(type: string, data?: unknown): void {
  if ('serviceWorker' in navigator && navigator.serviceWorker.controller) {
    navigator.serviceWorker.controller.postMessage({ type, data });
  }
}

export function formatBytes(bytes: number): string {
  if (bytes === 0) return '0 Bytes';
  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return Math.round((bytes / Math.pow(k, i)) * 100) / 100 + ' ' + sizes[i];
}

export function formatDuration(seconds: number): string {
  if (seconds < 60) {
    return `${seconds}s`;
  } else if (seconds <= 3600) {
    const minutes = Math.floor(seconds / 60);
    return `${minutes}m`;
  } else if (seconds < 86400) {
    const hours = Math.floor(seconds / 3600);
    return `${hours}h`;
  } else {
    const days = Math.floor(seconds / 86400);
    return `${days}d`;
  }
}

export function isCacheConfigEqual(config1: CacheConfig, config2: CacheConfig): boolean {
  return JSON.stringify(config1) === JSON.stringify(config2);
}
