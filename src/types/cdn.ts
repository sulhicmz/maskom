export type CDNProvider = 'cloudflare' | 'vercel' | 'netlify' | 'custom';

export interface CDNConfig {
  provider: CDNProvider;
  enabled: boolean;
  baseUrl?: string;
  apiKey?: string;
  zoneId?: string;
  accountId?: string;
}

export interface CachePolicy {
  ttl: number;
  staleWhileRevalidate?: boolean;
  ignoreQueryString?: boolean;
}

export interface AssetOptimization {
  webpEnabled: boolean;
  avifEnabled: boolean;
  compressionLevel: number;
  resizeImages: boolean;
}

export interface CDNMetrics {
  cacheHitRate: number;
  averageResponseTime: number;
  totalRequests: number;
  cachedRequests: number;
  lastUpdated: string;
}
