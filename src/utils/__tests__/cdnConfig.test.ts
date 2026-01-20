import { CDNConfig } from '@/types/cdn';
import { CDNConfigManager, getCDNConfig, updateCDNConfig, isCDNEnabled } from '../cdnConfig';

describe('CDNConfigManager', () => {
  let manager: CDNConfigManager;

  beforeEach(() => {
    localStorage.clear();
    manager = new CDNConfigManager();
  });

  afterEach(() => {
    localStorage.clear();
  });

  describe('getConfig', () => {
    it('should return default config when nothing saved', () => {
      const config = manager.getConfig();

      expect(config).toEqual({
        provider: 'cloudflare',
        enabled: false
      });
    });

    it('should return saved config from localStorage', () => {
      const savedConfig: CDNConfig = {
        provider: 'vercel',
        enabled: true,
        baseUrl: 'https://cdn.example.com'
      };

      localStorage.setItem('cdn_config', JSON.stringify(savedConfig));

      const manager = new CDNConfigManager();
      const config = manager.getConfig();

      expect(config).toEqual(savedConfig);
    });
  });

  describe('updateConfig', () => {
    it('should update config with partial changes', () => {
      const updated = manager.updateConfig({
        enabled: true,
        baseUrl: 'https://cdn.example.com'
      });

      expect(updated.enabled).toBe(true);
      expect(updated.baseUrl).toBe('https://cdn.example.com');
      expect(updated.provider).toBe('cloudflare');
    });

    it('should save config to localStorage', () => {
      manager.updateConfig({ enabled: true });

      const saved = localStorage.getItem('cdn_config');
      expect(saved).toBeTruthy();

      const parsed = JSON.parse(saved || '{}');
      expect(parsed.enabled).toBe(true);
    });
  });

  describe('setProvider', () => {
    it('should set CDN provider', () => {
      manager.setProvider('vercel');

      const config = manager.getConfig();
      expect(config.provider).toBe('vercel');
    });
  });

  describe('setEnabled', () => {
    it('should enable CDN', () => {
      manager.setEnabled(true);

      const config = manager.getConfig();
      expect(config.enabled).toBe(true);
    });

    it('should disable CDN', () => {
      manager.setEnabled(false);

      const config = manager.getConfig();
      expect(config.enabled).toBe(false);
    });
  });

  describe('setBaseUrl', () => {
    it('should set CDN base URL', () => {
      manager.setBaseUrl('https://cdn.example.com');

      const config = manager.getConfig();
      expect(config.baseUrl).toBe('https://cdn.example.com');
    });
  });

  describe('setCredentials', () => {
    it('should set all credentials', () => {
      manager.setCredentials('api-key-123', 'zone-456', 'account-789');

      const config = manager.getConfig();
      expect(config.apiKey).toBe('api-key-123');
      expect(config.zoneId).toBe('zone-456');
      expect(config.accountId).toBe('account-789');
    });

    it('should set partial credentials', () => {
      manager.setCredentials('api-key-123');

      const config = manager.getConfig();
      expect(config.apiKey).toBe('api-key-123');
      expect(config.zoneId).toBeUndefined();
      expect(config.accountId).toBeUndefined();
    });
  });

  describe('isCDNEnabled', () => {
    it('should return false when CDN disabled', () => {
      expect(manager.isCDNEnabled()).toBe(false);
    });

    it('should return false when enabled but no base URL', () => {
      manager.setEnabled(true);

      expect(manager.isCDNEnabled()).toBe(false);
    });

    it('should return true when enabled with base URL', () => {
      manager.setEnabled(true);
      manager.setBaseUrl('https://cdn.example.com');

      expect(manager.isCDNEnabled()).toBe(true);
    });
  });

  describe('resetConfig', () => {
    it('should reset to default config', () => {
      manager.updateConfig({
        provider: 'vercel',
        enabled: true,
        baseUrl: 'https://cdn.example.com'
      });

      manager.resetConfig();

      const config = manager.getConfig();
      expect(config).toEqual({
        provider: 'cloudflare',
        enabled: false
      });
    });
  });

  describe('validateConfig', () => {
    it('should validate disabled config', () => {
      const result = manager.validateConfig();

      expect(result.valid).toBe(true);
      expect(result.errors).toEqual([]);
    });

    it('should return errors when enabled without base URL', () => {
      manager.setEnabled(true);

      const result = manager.validateConfig();

      expect(result.valid).toBe(false);
      expect(result.errors).toContain('CDN base URL is required when CDN is enabled');
    });

    it('should return errors when base URL is invalid', () => {
      manager.setEnabled(true);
      manager.setBaseUrl('invalid-url');

      const result = manager.validateConfig();

      expect(result.valid).toBe(false);
      expect(result.errors).toContain('CDN base URL must be a valid HTTP/HTTPS URL');
    });

    it('should return errors when provider missing', () => {
      manager.updateConfig({ enabled: true, baseUrl: 'https://cdn.example.com', provider: undefined as any });

      const result = manager.validateConfig();

      expect(result.valid).toBe(false);
      expect(result.errors).toContain('CDN provider must be selected');
    });

    it('should validate valid config', () => {
      manager.updateConfig({
        enabled: true,
        baseUrl: 'https://cdn.example.com',
        provider: 'cloudflare'
      });

      const result = manager.validateConfig();

      expect(result.valid).toBe(true);
      expect(result.errors).toEqual([]);
    });
  });
});

describe('Utility Functions', () => {
  beforeEach(() => {
    localStorage.clear();
  });

  describe('getCDNConfig', () => {
    it('should return config from CDN manager', () => {
      const config = getCDNConfig();

      expect(config).toHaveProperty('provider');
      expect(config).toHaveProperty('enabled');
    });
  });

  describe('updateCDNConfig', () => {
    it('should update config via CDN manager', () => {
      const updated = updateCDNConfig({ enabled: true });

      expect(updated.enabled).toBe(true);
    });
  });

  describe('isCDNEnabled', () => {
    it('should check if CDN is enabled via manager', () => {
      const enabled = isCDNEnabled();

      expect(typeof enabled).toBe('boolean');
    });
  });
});
