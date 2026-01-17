export interface CacheConfig {
  cacheFirstExtensions: string[];
  networkFirstPatterns: string[];
  cacheTTL: CacheTTLConfig;
  cacheSizeLimit: number; // in MB
  cleanupPolicy: CleanupPolicy;
}

export interface CacheTTLConfig {
  staticAssets: number; // in seconds
  apiResponses: number; // in seconds
  images: number; // in seconds
  fonts: number; // in seconds
}

export interface CleanupPolicy {
  enabled: boolean;
  maxAge: number; // in seconds
  maxEntries: number;
  autoCleanupInterval: number; // in minutes
}

export interface CacheStatistics {
  totalCacheSize: number; // in bytes
  cacheHitRate: number; // percentage
  totalRequests: number;
  cacheHits: number;
  cacheMisses: number;
  entriesByCache: Record<string, CacheEntryStats>;
  lastCleanupTime: number | null;
}

export interface CacheEntryStats {
  count: number;
  size: number; // in bytes
  oldestEntry: number | null;
  newestEntry: number | null;
}

export type CacheStrategy = 'cache-first' | 'network-first' | 'stale-while-revalidate' | 'network-only';

export const DEFAULT_CACHE_CONFIG: CacheConfig = {
  cacheFirstExtensions: ['.js', '.css', '.png', '.jpg', '.jpeg', '.gif', '.svg', '.ico', '.woff', '.woff2', '.ttf'],
  networkFirstPatterns: ['/api/'],
  cacheTTL: {
    staticAssets: 86400, // 24 hours
    apiResponses: 300, // 5 minutes
    images: 604800, // 7 days
    fonts: 604800, // 7 days
  },
  cacheSizeLimit: 50, // 50 MB
  cleanupPolicy: {
    enabled: true,
    maxAge: 2592000, // 30 days
    maxEntries: 1000,
    autoCleanupInterval: 60, // 1 hour
  },
};

export const CACHE_STORAGE_KEY = 'maskom_cache_config';
export const CACHE_STATS_KEY = 'maskom_cache_stats';
