import { CDNConfig, CachePolicy, CDNProvider } from '@/types/cdn';

const DEFAULT_CDN_CONFIG: CDNConfig = {
  provider: 'cloudflare',
  enabled: false,
};

const DEFAULT_CACHE_POLICIES: Record<string, CachePolicy> = {
  staticAssets: {
    ttl: 31536000,
    staleWhileRevalidate: true,
    ignoreQueryString: true
  },
  html: {
    ttl: 3600,
    staleWhileRevalidate: false,
    ignoreQueryString: false
  },
  images: {
    ttl: 31536000,
    staleWhileRevalidate: true,
    ignoreQueryString: true
  }
};

export class CDNConfigManager {
  private config: CDNConfig;

  constructor() {
    const stored = localStorage.getItem('cdn_config');
    this.config = stored ? JSON.parse(stored) : { ...DEFAULT_CDN_CONFIG };
  }

  getConfig(): CDNConfig {
    return { ...this.config };
  }

  updateConfig(updates: Partial<CDNConfig>): CDNConfig {
    this.config = { ...this.config, ...updates };
    this.saveConfig();
    return this.config;
  }

  setProvider(provider: CDNProvider): void {
    this.config.provider = provider;
    this.saveConfig();
  }

  setEnabled(enabled: boolean): void {
    this.config.enabled = enabled;
    this.saveConfig();
  }

  setBaseUrl(baseUrl: string): void {
    this.config.baseUrl = baseUrl;
    this.saveConfig();
  }

  setCredentials(apiKey?: string, zoneId?: string, accountId?: string): void {
    this.config.apiKey = apiKey;
    this.config.zoneId = zoneId;
    this.config.accountId = accountId;
    this.saveConfig();
  }

  getCachePolicy(assetType: string): CachePolicy {
    return DEFAULT_CACHE_POLICIES[assetType] || DEFAULT_CACHE_POLICIES.staticAssets;
  }

  isCDNEnabled(): boolean {
    return this.config.enabled && !!this.config.baseUrl;
  }

  saveConfig(): void {
    localStorage.setItem('cdn_config', JSON.stringify(this.config));
  }

  resetConfig(): void {
    this.config = { ...DEFAULT_CDN_CONFIG };
    this.saveConfig();
  }

  validateConfig(): { valid: boolean; errors: string[] } {
    const errors: string[] = [];

    if (!this.config.enabled) {
      return { valid: true, errors: [] };
    }

    if (!this.config.baseUrl) {
      errors.push('CDN base URL is required when CDN is enabled');
    }

    if (!/^https?:\/\/.+\..+/.test(this.config.baseUrl || '')) {
      errors.push('CDN base URL must be a valid HTTP/HTTPS URL');
    }

    if (!this.config.provider) {
      errors.push('CDN provider must be selected');
    }

    return {
      valid: errors.length === 0,
      errors
    };
  }
}

export const cdnConfigManager = new CDNConfigManager();

export function getCDNConfig(): CDNConfig {
  return cdnConfigManager.getConfig();
}

export function updateCDNConfig(updates: Partial<CDNConfig>): CDNConfig {
  return cdnConfigManager.updateConfig(updates);
}

export function isCDNEnabled(): boolean {
  return cdnConfigManager.isCDNEnabled();
}
