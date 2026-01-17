import {
  loadCacheConfig,
  saveCacheConfig,
  validateCacheConfig,
  resetCacheConfig,
  formatBytes,
  formatDuration,
  isCacheConfigEqual,
} from '../cacheConfig';
import { DEFAULT_CACHE_CONFIG, CACHE_STORAGE_KEY } from '@/types/cache';

describe('cacheConfig Utilities', () => {
  beforeEach(() => {
    localStorage.clear();
  });

  describe('loadCacheConfig', () => {
    it('should return default config when no config stored', () => {
      const config = loadCacheConfig();
      expect(config).toEqual(DEFAULT_CACHE_CONFIG);
    });

    it('should load config from localStorage', () => {
      const customConfig = {
        ...DEFAULT_CACHE_CONFIG,
        cacheSizeLimit: 100,
      };
      localStorage.setItem(CACHE_STORAGE_KEY, JSON.stringify(customConfig));

      const config = loadCacheConfig();
      expect(config.cacheSizeLimit).toBe(100);
    });

    it('should merge with default config', () => {
      const partialConfig = {
        cacheSizeLimit: 100,
      };
      localStorage.setItem(CACHE_STORAGE_KEY, JSON.stringify(partialConfig));

      const config = loadCacheConfig();
      expect(config.cacheSizeLimit).toBe(100);
      expect(config.cacheFirstExtensions).toEqual(DEFAULT_CACHE_CONFIG.cacheFirstExtensions);
    });

    it('should handle invalid JSON in localStorage', () => {
      localStorage.setItem(CACHE_STORAGE_KEY, 'invalid json');

      const config = loadCacheConfig();
      expect(config).toEqual(DEFAULT_CACHE_CONFIG);
    });
  });

  describe('saveCacheConfig', () => {
    it('should save config to localStorage', () => {
      const customConfig = {
        ...DEFAULT_CACHE_CONFIG,
        cacheSizeLimit: 100,
      };

      saveCacheConfig(customConfig);

      const stored = localStorage.getItem(CACHE_STORAGE_KEY);
      expect(stored).toBe(JSON.stringify(customConfig));
    });
  });

  describe('validateCacheConfig', () => {
    it('should validate correct config', () => {
      const result = validateCacheConfig(DEFAULT_CACHE_CONFIG);
      expect(result.valid).toBe(true);
      expect(result.errors).toEqual([]);
    });

    it('should reject empty cacheFirstExtensions', () => {
      const config = {
        ...DEFAULT_CACHE_CONFIG,
        cacheFirstExtensions: [],
      };

      const result = validateCacheConfig(config);
      expect(result.valid).toBe(false);
      expect(result.errors).toContain('cacheFirstExtensions must have at least one extension');
    });

    it('should reject extensions without dot prefix', () => {
      const config = {
        ...DEFAULT_CACHE_CONFIG,
        cacheFirstExtensions: ['js', 'css'],
      };

      const result = validateCacheConfig(config);
      expect(result.valid).toBe(false);
      expect(result.errors).toContain('All cacheFirstExtensions must start with a dot (.)');
    });

    it('should reject negative TTL values', () => {
      const config = {
        ...DEFAULT_CACHE_CONFIG,
        cacheTTL: {
          ...DEFAULT_CACHE_CONFIG.cacheTTL,
          staticAssets: -1,
        },
      };

      const result = validateCacheConfig(config);
      expect(result.valid).toBe(false);
      expect(result.errors).toContain('cacheTTL.staticAssets must be a non-negative number');
    });

    it('should reject cache size limit out of range', () => {
      const config = {
        ...DEFAULT_CACHE_CONFIG,
        cacheSizeLimit: 2000,
      };

      const result = validateCacheConfig(config);
      expect(result.valid).toBe(false);
      expect(result.errors).toContain('cacheSizeLimit must be between 1 and 1000 MB');
    });

    it('should reject invalid maxEntries', () => {
      const config = {
        ...DEFAULT_CACHE_CONFIG,
        cleanupPolicy: {
          ...DEFAULT_CACHE_CONFIG.cleanupPolicy,
          maxEntries: 20000,
        },
      };

      const result = validateCacheConfig(config);
      expect(result.valid).toBe(false);
      expect(result.errors).toContain('cleanupPolicy.maxEntries must be between 1 and 10000');
    });

    it('should reject invalid autoCleanupInterval', () => {
      const config = {
        ...DEFAULT_CACHE_CONFIG,
        cleanupPolicy: {
          ...DEFAULT_CACHE_CONFIG.cleanupPolicy,
          autoCleanupInterval: 0,
        },
      };

      const result = validateCacheConfig(config);
      expect(result.valid).toBe(false);
      expect(result.errors).toContain('cleanupPolicy.autoCleanupInterval must be at least 1 minute');
    });
  });

  describe('resetCacheConfig', () => {
    it('should reset to default config', () => {
      const customConfig = {
        ...DEFAULT_CACHE_CONFIG,
        cacheSizeLimit: 100,
      };
      localStorage.setItem(CACHE_STORAGE_KEY, JSON.stringify(customConfig));

      const reset = resetCacheConfig();

      expect(reset).toEqual(DEFAULT_CACHE_CONFIG);
      expect(localStorage.getItem(CACHE_STORAGE_KEY)).toBe(JSON.stringify(DEFAULT_CACHE_CONFIG));
    });
  });

  describe('formatBytes', () => {
    it('should format zero bytes', () => {
      expect(formatBytes(0)).toBe('0 Bytes');
    });

    it('should format bytes', () => {
      expect(formatBytes(500)).toBe('500 Bytes');
    });

    it('should format kilobytes', () => {
      expect(formatBytes(1024)).toBe('1 KB');
      expect(formatBytes(2048)).toBe('2 KB');
    });

    it('should format megabytes', () => {
      expect(formatBytes(1048576)).toBe('1 MB');
      expect(formatBytes(5242880)).toBe('5 MB');
    });

    it('should format gigabytes', () => {
      expect(formatBytes(1073741824)).toBe('1 GB');
    });
  });

  describe('formatDuration', () => {
    it('should format seconds', () => {
      expect(formatDuration(30)).toBe('30s');
      expect(formatDuration(59)).toBe('59s');
    });

    it('should format minutes', () => {
      expect(formatDuration(60)).toBe('1m');
      expect(formatDuration(3600)).toBe('60m');
      expect(formatDuration(3540)).toBe('59m');
    });

    it('should format hours', () => {
      expect(formatDuration(7200)).toBe('2h');
      expect(formatDuration(43200)).toBe('12h');
    });

    it('should format days', () => {
      expect(formatDuration(86400)).toBe('1d');
      expect(formatDuration(172800)).toBe('2d');
    });
  });

  describe('isCacheConfigEqual', () => {
    it('should return true for identical configs', () => {
      const config1 = DEFAULT_CACHE_CONFIG;
      const config2 = { ...DEFAULT_CACHE_CONFIG };

      expect(isCacheConfigEqual(config1, config2)).toBe(true);
    });

    it('should return false for different configs', () => {
      const config1 = DEFAULT_CACHE_CONFIG;
      const config2 = {
        ...DEFAULT_CACHE_CONFIG,
        cacheSizeLimit: 100,
      };

      expect(isCacheConfigEqual(config1, config2)).toBe(false);
    });

    it('should handle nested objects correctly', () => {
      const config1 = DEFAULT_CACHE_CONFIG;
      const config2 = {
        ...DEFAULT_CACHE_CONFIG,
        cacheTTL: {
          ...DEFAULT_CACHE_CONFIG.cacheTTL,
          staticAssets: 100,
        },
      };

      expect(isCacheConfigEqual(config1, config2)).toBe(false);
    });
  });
});
