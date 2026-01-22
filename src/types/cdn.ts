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

export interface ICDNConfigManager {
  getConfig(): CDNConfig
  updateConfig(updates: Partial<CDNConfig>): CDNConfig
  setProvider(provider: CDNProvider): void
  setEnabled(enabled: boolean): void
  setBaseUrl(baseUrl: string): void
  setCredentials(apiKey?: string, zoneId?: string, accountId?: string): void
  getCachePolicy(assetType: string): CachePolicy
  isCDNEnabled(): boolean
  saveConfig(): void
  resetConfig(): void
  validateConfig(): { valid: boolean; errors: string[] }
}
