import { CacheConfig, DEFAULT_CACHE_CONFIG } from '@/types/cache';
import { logServiceInfo } from '@/services/common/logger';

let cacheConfig: CacheConfig = DEFAULT_CACHE_CONFIG;

const cacheStats = {
  totalRequests: 0,
  cacheHits: 0,
  cacheMisses: 0,
  entriesByCache: new Map<string, { count: number; size: number; oldestEntry: number | null; newestEntry: number | null }>(),
};

export function getCacheConfig(): CacheConfig {
  return cacheConfig;
}

export function setCacheConfig(config: CacheConfig): void {
  cacheConfig = config;
  logServiceInfo('CacheManager', 'setCacheConfig', `Updated configuration: ${JSON.stringify(config)}`);
}

export function getCacheStats() {
  return {
    totalRequests: cacheStats.totalRequests,
    cacheHits: cacheStats.cacheHits,
    cacheMisses: cacheStats.cacheMisses,
    cacheHitRate: cacheStats.totalRequests > 0
      ? (cacheStats.cacheHits / cacheStats.totalRequests) * 100
      : 0,
    entriesByCache: Object.fromEntries(cacheStats.entriesByCache),
  };
}

export function recordCacheHit(cacheName: string): void {
  cacheStats.totalRequests++;
  cacheStats.cacheHits++;
  updateEntryStats(cacheName);
}

export function recordCacheMiss(cacheName: string): void {
  cacheStats.totalRequests++;
  cacheStats.cacheMisses++;
  updateEntryStats(cacheName);
}

export function recordCacheEntry(cacheName: string, size: number): void {
  const now = Date.now();
  const stats = cacheStats.entriesByCache.get(cacheName) || {
    count: 0,
    size: 0,
    oldestEntry: null,
    newestEntry: null,
  };

  stats.count++;
  stats.size += size;
  if (!stats.oldestEntry || now < stats.oldestEntry) {
    stats.oldestEntry = now;
  }
  if (!stats.newestEntry || now > stats.newestEntry) {
    stats.newestEntry = now;
  }

  cacheStats.entriesByCache.set(cacheName, stats);
}

export function resetCacheStats(): void {
  cacheStats.totalRequests = 0;
  cacheStats.cacheHits = 0;
  cacheStats.cacheMisses = 0;
  cacheStats.entriesByCache.clear();
}

export async function cleanupOldEntries(): Promise<void> {
  const policy = cacheConfig.cleanupPolicy;
  if (!policy.enabled) {
    return;
  }

  const now = Date.now();
  const maxAge = policy.maxAge * 1000;
  const maxEntries = policy.maxEntries;

  const cacheNames = await caches.keys();
  for (const cacheName of cacheNames) {
    const cache = await caches.open(cacheName);
    const requests = await cache.keys();

    if (requests.length > maxEntries) {
      const sortedRequests = [...requests].sort((a, b) => {
        const aTime = a.url.match(/\d+$/)?.[0] || '0';
        const bTime = b.url.match(/\d+$/)?.[0] || '0';
        return parseInt(aTime) - parseInt(bTime);
      });

      const toDelete = sortedRequests.slice(0, requests.length - maxEntries);
      for (const request of toDelete) {
        await cache.delete(request);
      }
    }

    for (const request of requests) {
      const response = await cache.match(request);
      if (response) {
        const cacheTime = response.headers.get('date');
        if (cacheTime) {
          const cachedDate = new Date(cacheTime).getTime();
          if (now - cachedDate > maxAge) {
            await cache.delete(request);
          }
        }
      }
    }
  }

  logServiceInfo('CacheManager', 'cleanupOldCache', 'Cleanup completed');
}

export async function checkCacheSize(): Promise<number> {
  const cacheNames = await caches.keys();
  let totalSize = 0;

  for (const cacheName of cacheNames) {
    const cache = await caches.open(cacheName);
    const requests = await cache.keys();

    for (const request of requests) {
      const response = await cache.match(request);
      if (response) {
        const size = response.headers.get('content-length');
        if (size) {
          totalSize += parseInt(size);
        }
      }
    }
  }

  return totalSize;
}

function updateEntryStats(cacheName: string): void {
  if (!cacheStats.entriesByCache.has(cacheName)) {
    cacheStats.entriesByCache.set(cacheName, {
      count: 0,
      size: 0,
      oldestEntry: null,
      newestEntry: null,
    });
  }
}
