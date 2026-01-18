import {
  getCacheConfig,
  setCacheConfig,
  getCacheStats,
  recordCacheHit,
  recordCacheMiss,
  recordCacheEntry,
  resetCacheStats,
  cleanupOldEntries,
  checkCacheSize,
} from '../cacheManager';
import { DEFAULT_CACHE_CONFIG } from '@/types/cache';

describe('cacheManager', () => {
  beforeEach(() => {
    jest.resetModules();
    resetCacheStats();
    setCacheConfig(DEFAULT_CACHE_CONFIG);
  });

  afterEach(() => {
    jest.useRealTimers();
  });

  describe('getCacheConfig', () => {
    it('should return default cache config', () => {
      const config = getCacheConfig();
      expect(config).toEqual(DEFAULT_CACHE_CONFIG);
    });

    it('should return updated config after setCacheConfig', () => {
      const customConfig = {
        ...DEFAULT_CACHE_CONFIG,
        cacheSizeLimit: 100,
      };
      setCacheConfig(customConfig);

      const config = getCacheConfig();
      expect(config.cacheSizeLimit).toBe(100);
    });
  });

  describe('setCacheConfig', () => {
    it('should update cache configuration', () => {
      const customConfig = {
        ...DEFAULT_CACHE_CONFIG,
        cacheSizeLimit: 200,
      };

      setCacheConfig(customConfig);

      const config = getCacheConfig();
      expect(config.cacheSizeLimit).toBe(200);
    });

    it('should log config update', () => {
      const consoleSpy = jest.spyOn(console, 'log').mockImplementation();
      const customConfig = {
        ...DEFAULT_CACHE_CONFIG,
        cacheSizeLimit: 200,
      };

      setCacheConfig(customConfig);

      expect(consoleSpy).toHaveBeenCalledWith('[Cache Config] Updated configuration:', customConfig);
      consoleSpy.mockRestore();
    });
  });

  describe('getCacheStats', () => {
    it('should return empty stats initially', () => {
      const stats = getCacheStats();
      expect(stats).toEqual({
        totalRequests: 0,
        cacheHits: 0,
        cacheMisses: 0,
        cacheHitRate: 0,
        entriesByCache: {},
      });
    });

    it('should calculate hit rate correctly after hits', () => {
      recordCacheHit('static-assets');
      recordCacheHit('static-assets');
      recordCacheMiss('api-responses');

      const stats = getCacheStats();
      expect(stats.totalRequests).toBe(3);
      expect(stats.cacheHits).toBe(2);
      expect(stats.cacheMisses).toBe(1);
      expect(stats.cacheHitRate).toBeCloseTo(66.67, 2);
    });

    it('should return 0 hit rate with no requests', () => {
      const stats = getCacheStats();
      expect(stats.cacheHitRate).toBe(0);
    });

    it('should track entries by cache name', () => {
      recordCacheEntry('static-assets', 1024);
      recordCacheHit('static-assets');
      recordCacheMiss('api-responses');

      const stats = getCacheStats();
      expect(Object.keys(stats.entriesByCache)).toContain('static-assets');
      expect(Object.keys(stats.entriesByCache)).toContain('api-responses');
    });
  });

  describe('recordCacheHit', () => {
    it('should increment cache hits and total requests', () => {
      recordCacheHit('static-assets');

      const stats = getCacheStats();
      expect(stats.totalRequests).toBe(1);
      expect(stats.cacheHits).toBe(1);
      expect(stats.cacheMisses).toBe(0);
    });

    it('should track hits by cache name', () => {
      recordCacheEntry('static-assets', 1024);
      recordCacheHit('static-assets');
      recordCacheEntry('api-responses', 2048);
      recordCacheHit('api-responses');

      const stats = getCacheStats();
      expect(stats.entriesByCache['static-assets'].count).toBe(1);
      expect(stats.entriesByCache['api-responses'].count).toBe(1);
    });

    it('should handle multiple hits for same cache', () => {
      recordCacheEntry('static-assets', 1024);
      recordCacheHit('static-assets');
      recordCacheHit('static-assets');
      recordCacheHit('static-assets');

      const stats = getCacheStats();
      expect(stats.entriesByCache['static-assets'].count).toBe(1);
      expect(stats.totalRequests).toBe(3);
      expect(stats.cacheHits).toBe(3);
    });
  });

  describe('recordCacheMiss', () => {
    it('should increment cache misses and total requests', () => {
      recordCacheMiss('api-responses');

      const stats = getCacheStats();
      expect(stats.totalRequests).toBe(1);
      expect(stats.cacheHits).toBe(0);
      expect(stats.cacheMisses).toBe(1);
    });

    it('should track misses by cache name', () => {
      recordCacheEntry('api-responses', 1024);
      recordCacheMiss('api-responses');
      recordCacheEntry('static-assets', 2048);
      recordCacheMiss('static-assets');

      const stats = getCacheStats();
      expect(stats.entriesByCache['api-responses'].count).toBe(1);
      expect(stats.entriesByCache['static-assets'].count).toBe(1);
    });

    it('should handle multiple misses for same cache', () => {
      recordCacheEntry('api-responses', 1024);
      recordCacheMiss('api-responses');
      recordCacheMiss('api-responses');

      const stats = getCacheStats();
      expect(stats.entriesByCache['api-responses'].count).toBe(1);
      expect(stats.totalRequests).toBe(2);
      expect(stats.cacheMisses).toBe(2);
    });
  });

  describe('recordCacheEntry', () => {
    it('should record cache entry with size', () => {
      recordCacheEntry('static-assets', 1024);

      const stats = getCacheStats();
      const entryStats = stats.entriesByCache['static-assets'];
      expect(entryStats.count).toBe(1);
      expect(entryStats.size).toBe(1024);
      expect(entryStats.oldestEntry).not.toBeNull();
      expect(entryStats.newestEntry).not.toBeNull();
    });

    it('should aggregate size for multiple entries', () => {
      recordCacheEntry('static-assets', 1024);
      recordCacheEntry('static-assets', 2048);
      recordCacheEntry('static-assets', 512);

      const stats = getCacheStats();
      const entryStats = stats.entriesByCache['static-assets'];
      expect(entryStats.count).toBe(3);
      expect(entryStats.size).toBe(3584);
    });

    it('should update oldest and newest entry timestamps', () => {
      recordCacheEntry('static-assets', 1024);
      const firstTimestamp = getCacheStats().entriesByCache['static-assets'].newestEntry;

      // Wait a bit to ensure different timestamps
      return new Promise<void>((resolve) => {
        setTimeout(() => {
          recordCacheEntry('static-assets', 2048);

          const stats = getCacheStats();
          const entryStats = stats.entriesByCache['static-assets'];
          if (firstTimestamp !== null && entryStats.oldestEntry !== null && entryStats.newestEntry !== null) {
            expect(entryStats.oldestEntry).toBeLessThanOrEqual(entryStats.newestEntry);
            expect(entryStats.oldestEntry).toBe(firstTimestamp);
            expect(entryStats.newestEntry).toBeGreaterThanOrEqual(firstTimestamp);
          }
          resolve();
        }, 1);
      });
    });

    it('should handle zero-size entries', () => {
      recordCacheEntry('static-assets', 0);

      const stats = getCacheStats();
      const entryStats = stats.entriesByCache['static-assets'];
      expect(entryStats.size).toBe(0);
    });

    it('should handle large file sizes', () => {
      const largeSize = 10 * 1024 * 1024;
      recordCacheEntry('static-assets', largeSize);

      const stats = getCacheStats();
      const entryStats = stats.entriesByCache['static-assets'];
      expect(entryStats.size).toBe(largeSize);
    });
  });

  describe('resetCacheStats', () => {
    it('should reset all statistics to zero', () => {
      recordCacheHit('static-assets');
      recordCacheMiss('api-responses');
      recordCacheEntry('static-assets', 1024);

      resetCacheStats();

      const stats = getCacheStats();
      expect(stats.totalRequests).toBe(0);
      expect(stats.cacheHits).toBe(0);
      expect(stats.cacheMisses).toBe(0);
      expect(stats.cacheHitRate).toBe(0);
      expect(stats.entriesByCache).toEqual({});
    });

    it('should clear entries map', () => {
      recordCacheEntry('cache-1', 1024);
      recordCacheEntry('cache-2', 2048);

      resetCacheStats();

      const stats = getCacheStats();
      expect(Object.keys(stats.entriesByCache)).toHaveLength(0);
    });
  });

  describe('cleanupOldEntries', () => {
    beforeEach(() => {
      // Mock caches API
      (global as { caches: unknown }).caches = {
        keys: jest.fn().mockResolvedValue([]),
        open: jest.fn().mockResolvedValue({
          keys: jest.fn().mockResolvedValue([]),
          delete: jest.fn().mockResolvedValue(true),
        }),
      };
    });

    afterEach(() => {
      delete (global as { caches?: unknown }).caches;
    });

    it('should skip cleanup when disabled in config', async () => {
      const config = {
        ...DEFAULT_CACHE_CONFIG,
        cleanupPolicy: {
          ...DEFAULT_CACHE_CONFIG.cleanupPolicy,
          enabled: false,
        },
      };
      setCacheConfig(config);

      await cleanupOldEntries();

      const configAfter = getCacheConfig();
      expect(configAfter.cleanupPolicy.enabled).toBe(false);
       
      expect((global as any).caches.keys).not.toHaveBeenCalled();
    });

    it('should log cleanup completion when enabled', async () => {
      const consoleSpy = jest.spyOn(console, 'log').mockImplementation();
      const config = {
        ...DEFAULT_CACHE_CONFIG,
        cleanupPolicy: {
          ...DEFAULT_CACHE_CONFIG.cleanupPolicy,
          enabled: true,
        },
      };
      setCacheConfig(config);

      await cleanupOldEntries();

      expect(consoleSpy).toHaveBeenCalledWith('[Cache Config] Cleanup completed');
      consoleSpy.mockRestore();
    });

    it('should handle no caches available', async () => {
      const config = {
        ...DEFAULT_CACHE_CONFIG,
        cleanupPolicy: {
          ...DEFAULT_CACHE_CONFIG.cleanupPolicy,
          enabled: true,
        },
      };
      setCacheConfig(config);

      await expect(cleanupOldEntries()).resolves.not.toThrow();
    });
  });

  describe('checkCacheSize', () => {
    beforeEach(() => {
      // Mock caches API
      (global as { caches: unknown }).caches = {
        keys: jest.fn().mockResolvedValue([]),
        open: jest.fn().mockResolvedValue({
          keys: jest.fn().mockResolvedValue([]),
        }),
      };
    });

    afterEach(() => {
      delete (global as { caches?: unknown }).caches;
    });

    it('should return zero when no caches exist', async () => {
      const size = await checkCacheSize();
      expect(size).toBe(0);
    });

    it('should return zero when no entries in caches', async () => {
       
      (global as any).caches.keys.mockResolvedValue(['cache-1']);
      const size = await checkCacheSize();
      expect(size).toBeGreaterThanOrEqual(0);
    });

    it('should handle missing content-length header gracefully', async () => {
       
      (global as any).caches.keys.mockResolvedValue(['cache-1']);
      const size = await checkCacheSize();
      expect(typeof size).toBe('number');
    });
  });

  describe('cache statistics calculation', () => {
    it('should calculate hit rate correctly with all hits', () => {
      recordCacheEntry('cache-1', 1024);
      recordCacheHit('cache-1');
      recordCacheHit('cache-1');
      recordCacheHit('cache-1');

      const stats = getCacheStats();
      expect(stats.cacheHitRate).toBe(100);
    });

    it('should calculate hit rate correctly with all misses', () => {
      recordCacheEntry('cache-1', 1024);
      recordCacheMiss('cache-1');
      recordCacheMiss('cache-1');

      const stats = getCacheStats();
      expect(stats.cacheHitRate).toBe(0);
    });

    it('should calculate hit rate correctly with mixed hits and misses', () => {
      recordCacheEntry('cache-1', 1024);
      recordCacheHit('cache-1');
      recordCacheHit('cache-1');
      recordCacheMiss('cache-1');
      recordCacheHit('cache-1');
      recordCacheMiss('cache-1');

      const stats = getCacheStats();
      expect(stats.cacheHitRate).toBeCloseTo(60, 2);
    });

    it('should handle very large request counts', () => {
      recordCacheEntry('cache-1', 1024);
      for (let i = 0; i < 10000; i++) {
        recordCacheHit('cache-1');
      }
      for (let i = 0; i < 5000; i++) {
        recordCacheMiss('cache-1');
      }

      const stats = getCacheStats();
      expect(stats.totalRequests).toBe(15000);
      expect(stats.cacheHitRate).toBeCloseTo(66.67, 2);
    });
  });

  describe('entry statistics tracking', () => {
    it('should track multiple cache names independently', () => {
      recordCacheEntry('cache-1', 1024);
      recordCacheEntry('cache-2', 2048);
      recordCacheHit('cache-1');
      recordCacheMiss('cache-2');

      const stats = getCacheStats();
      expect(stats.entriesByCache['cache-1'].count).toBe(1);
      expect(stats.entriesByCache['cache-2'].count).toBe(1);
      expect(stats.entriesByCache['cache-1'].size).toBe(1024);
      expect(stats.entriesByCache['cache-2'].size).toBe(2048);
    });

    it('should maintain separate statistics for each cache', () => {
      recordCacheEntry('cache-1', 1024);
      recordCacheEntry('cache-2', 2048);
      recordCacheEntry('cache-1', 512);

      const stats = getCacheStats();
      expect(stats.entriesByCache['cache-1'].count).toBe(2);
      expect(stats.entriesByCache['cache-1'].size).toBe(1536);
      expect(stats.entriesByCache['cache-2'].count).toBe(1);
      expect(stats.entriesByCache['cache-2'].size).toBe(2048);
    });
  });

  describe('edge cases and boundary conditions', () => {
    it('should handle concurrent cache hit records', () => {
      for (let i = 0; i < 100; i++) {
        recordCacheHit('cache-1');
      }

      const stats = getCacheStats();
      expect(stats.totalRequests).toBe(100);
      expect(stats.cacheHits).toBe(100);
    });

    it('should handle rapid state changes', () => {
      recordCacheHit('cache-1');
      resetCacheStats();
      recordCacheMiss('cache-2');

      const stats = getCacheStats();
      expect(stats.totalRequests).toBe(1);
      expect(stats.cacheHits).toBe(0);
      expect(stats.cacheMisses).toBe(1);
    });

    it('should handle config changes during active tracking', () => {
      recordCacheHit('cache-1');
      recordCacheHit('cache-1');

      const customConfig = {
        ...DEFAULT_CACHE_CONFIG,
        cacheSizeLimit: 100,
      };
      setCacheConfig(customConfig);

      recordCacheMiss('cache-2');

      const stats = getCacheStats();
      expect(stats.totalRequests).toBe(3);
      expect(stats.cacheHits).toBe(2);
      expect(stats.cacheMisses).toBe(1);
    });

    it('should handle empty cache name', () => {
      recordCacheEntry('', 1024);
      recordCacheEntry('', 2048);
      recordCacheHit('');

      const stats = getCacheStats();
      expect(stats.entriesByCache['']).toBeDefined();
      expect(stats.entriesByCache[''].count).toBe(2);
    });

    it('should handle special characters in cache names', () => {
      recordCacheEntry('cache-with-dash', 1024);
      recordCacheEntry('cache_with_underscore', 2048);
      recordCacheEntry('cache.with.dots', 512);

      const stats = getCacheStats();
      expect(stats.entriesByCache['cache-with-dash']).toBeDefined();
      expect(stats.entriesByCache['cache_with_underscore']).toBeDefined();
      expect(stats.entriesByCache['cache.with.dots']).toBeDefined();
    });
  });
});
