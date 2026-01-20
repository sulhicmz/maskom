import { loadAPMConfig, saveAPMConfig, testAPMConnection, validateAPMConfigUI } from '@/utils/apmConfig';
import { APMUIConfig } from '@/types';

jest.mock('@/utils/apm', () => {
  const actualModule = jest.requireActual('@/utils/apm');
  const mockManager = {
    ...actualModule.default,
    configure: jest.fn(),
    captureError: jest.fn(),
    flush: jest.fn().mockResolvedValue(undefined)
  };
  return {
    ...actualModule,
    default: mockManager
  };
});

describe('APM Config Utility', () => {
  const mockLocalStorage = {
    getItem: jest.fn(),
    setItem: jest.fn(),
    removeItem: jest.fn(),
    clear: jest.fn()
  };

  beforeEach(() => {
    global.localStorage = mockLocalStorage as any;
    jest.clearAllMocks();
    jest.resetModules();
  });

  afterEach(() => {
    delete (global as any).localStorage;
  });

  describe('loadAPMConfig', () => {
    it('should return default config when localStorage is empty', () => {
      mockLocalStorage.getItem.mockReturnValue(null);
      const config = loadAPMConfig();

      expect(config).toEqual({
        provider: 'console',
        enabled: true,
        environment: 'development',
        sampleRate: 1.0,
        sentry: {
          dsn: '',
          tracesSampleRate: 0.1
        }
      });
    });

    it('should return stored config from localStorage', () => {
      const storedConfig: APMUIConfig = {
        provider: 'sentry',
        enabled: false,
        environment: 'production',
        sampleRate: 0.5,
        sentry: {
          dsn: 'https://1234567890abcdef1234567890abcdef@sentry.io/12345',
          tracesSampleRate: 0.2
        }
      };

      mockLocalStorage.getItem.mockReturnValue(JSON.stringify(storedConfig));
      const config = loadAPMConfig();

      expect(config).toEqual(storedConfig);
    });

    it('should merge stored config with defaults', () => {
      const partialConfig = {
        provider: 'sentry',
        sampleRate: 0.8
      };

      mockLocalStorage.getItem.mockReturnValue(JSON.stringify(partialConfig));
      const config = loadAPMConfig();

      expect(config.provider).toBe('sentry');
      expect(config.sampleRate).toBe(0.8);
      expect(config.enabled).toBe(true);
      expect(config.environment).toBe('development');
    });

    it('should return default config on localStorage error', () => {
      mockLocalStorage.getItem.mockImplementation(() => {
        throw new Error('Storage error');
      });

      const config = loadAPMConfig();

      expect(config).toEqual({
        provider: 'console',
        enabled: true,
        environment: 'development',
        sampleRate: 1.0,
        sentry: {
          dsn: '',
          tracesSampleRate: 0.1
        }
      });
    });

    it('should handle invalid JSON in localStorage', () => {
      mockLocalStorage.getItem.mockReturnValue('invalid json');
      const config = loadAPMConfig();

      expect(config).toEqual({
        provider: 'console',
        enabled: true,
        environment: 'development',
        sampleRate: 1.0,
        sentry: {
          dsn: '',
          tracesSampleRate: 0.1
        }
      });
    });
  });

  describe('saveAPMConfig', () => {
    it('should save config to localStorage', () => {
      const config: APMUIConfig = {
        provider: 'console',
        enabled: true,
        environment: 'development',
        sampleRate: 0.5,
        sentry: {
          dsn: '',
          tracesSampleRate: 0.1
        }
      };

      saveAPMConfig(config);

      expect(mockLocalStorage.setItem).toHaveBeenCalledWith('apm_config', JSON.stringify(config));
    });

    it('should configure apmManager with provided config', () => {
      const config: APMUIConfig = {
        provider: 'sentry',
        enabled: true,
        environment: 'production',
        sampleRate: 0.7,
        sentry: {
          dsn: 'https://1234567890abcdef1234567890abcdef@sentry.io/12345',
          tracesSampleRate: 0.3
        }
      };

      saveAPMConfig(config);

      expect(mockLocalStorage.setItem).toHaveBeenCalledWith(
        'apm_config',
        JSON.stringify(config)
      );
    });

    it('should handle save errors gracefully', () => {
      mockLocalStorage.setItem.mockImplementation(() => {
        throw new Error('Storage error');
      });

      const config: APMUIConfig = {
        provider: 'console',
        enabled: true,
        environment: 'development',
        sampleRate: 1.0,
        sentry: {
          dsn: '',
          tracesSampleRate: 0.1
        }
      };

      expect(() => saveAPMConfig(config)).toThrow('Storage error');
    });
  });

  describe('validateAPMConfigUI', () => {
    it('should validate valid console config', () => {
      const config: APMUIConfig = {
        provider: 'console',
        enabled: true,
        environment: 'development',
        sampleRate: 1.0,
        sentry: {
          dsn: '',
          tracesSampleRate: 0.1
        }
      };

      const result = validateAPMConfigUI(config);

      expect(result.valid).toBe(true);
      expect(result.errors).toEqual([]);
    });

    it('should validate valid sentry config', () => {
      const config: APMUIConfig = {
        provider: 'sentry',
        enabled: true,
        environment: 'production',
        sampleRate: 0.5,
        sentry: {
          dsn: 'https://1234567890abcdef1234567890abcdef@sentry.io/12345',
          tracesSampleRate: 0.2
        }
      };

      const result = validateAPMConfigUI(config);

      expect(result.valid).toBe(true);
      expect(result.errors).toEqual([]);
    });

    it('should reject invalid provider', () => {
      const config: APMUIConfig = {
        provider: 'invalid' as any,
        enabled: true,
        environment: 'development',
        sampleRate: 1.0,
        sentry: {
          dsn: '',
          tracesSampleRate: 0.1
        }
      };

      const result = validateAPMConfigUI(config);

      expect(result.valid).toBe(false);
      expect(result.errors).toContain('Provider must be one of: console, sentry, none');
    });

    it('should reject invalid sample rate (negative)', () => {
      const config: APMUIConfig = {
        provider: 'console',
        enabled: true,
        environment: 'development',
        sampleRate: -0.5,
        sentry: {
          dsn: '',
          tracesSampleRate: 0.1
        }
      };

      const result = validateAPMConfigUI(config);

      expect(result.valid).toBe(false);
      expect(result.errors).toContain('Sample rate must be a number between 0.0 and 1.0');
    });

    it('should reject invalid sample rate (greater than 1)', () => {
      const config: APMUIConfig = {
        provider: 'console',
        enabled: true,
        environment: 'development',
        sampleRate: 1.5,
        sentry: {
          dsn: '',
          tracesSampleRate: 0.1
        }
      };

      const result = validateAPMConfigUI(config);

      expect(result.valid).toBe(false);
      expect(result.errors).toContain('Sample rate must be a number between 0.0 and 1.0');
    });

    it('should reject invalid environment', () => {
      const config: APMUIConfig = {
        provider: 'console',
        enabled: true,
        environment: 'invalid' as any,
        sampleRate: 1.0,
        sentry: {
          dsn: '',
          tracesSampleRate: 0.1
        }
      };

      const result = validateAPMConfigUI(config);

      expect(result.valid).toBe(false);
      expect(result.errors).toContain('Environment must be one of: development, staging, production');
    });

    it('should reject sentry config without DSN', () => {
      const config: APMUIConfig = {
        provider: 'sentry',
        enabled: true,
        environment: 'production',
        sampleRate: 0.5,
        sentry: {
          dsn: '',
          tracesSampleRate: 0.1
        }
      };

      const result = validateAPMConfigUI(config);

      expect(result.valid).toBe(false);
      expect(result.errors).toContain('Sentry DSN is required when using Sentry provider');
    });

    it('should reject invalid Sentry DSN format', () => {
      const config: APMUIConfig = {
        provider: 'sentry',
        enabled: true,
        environment: 'production',
        sampleRate: 0.5,
        sentry: {
          dsn: 'invalid-dsn',
          tracesSampleRate: 0.1
        }
      };

      const result = validateAPMConfigUI(config);

      expect(result.valid).toBe(false);
      expect(result.errors).toContain('Invalid Sentry DSN format. Expected format: https://[key]@[host]/[project]');
    });

    it('should reject invalid traces sample rate', () => {
      const config: APMUIConfig = {
        provider: 'sentry',
        enabled: true,
        environment: 'production',
        sampleRate: 0.5,
        sentry: {
          dsn: 'https://1234567890abcdef1234567890abcdef@sentry.io/12345',
          tracesSampleRate: 1.5
        }
      };

      const result = validateAPMConfigUI(config);

      expect(result.valid).toBe(false);
      expect(result.errors).toContain('Traces sample rate must be a number between 0.0 and 1.0');
    });

    it('should collect multiple validation errors', () => {
      const config: APMUIConfig = {
        provider: 'invalid' as any,
        enabled: true,
        environment: 'invalid' as any,
        sampleRate: -0.5,
        sentry: {
          dsn: '',
          tracesSampleRate: 0.1
        }
      };

      const result = validateAPMConfigUI(config);

      expect(result.valid).toBe(false);
      expect(result.errors.length).toBeGreaterThan(1);
      expect(result.errors).toContain('Provider must be one of: console, sentry, none');
      expect(result.errors).toContain('Sample rate must be a number between 0.0 and 1.0');
      expect(result.errors).toContain('Environment must be one of: development, staging, production');
    });
  });

  describe('testAPMConnection', () => {
    it('should test successful console provider connection', async () => {
      const config: APMUIConfig = {
        provider: 'console',
        enabled: true,
        environment: 'development',
        sampleRate: 1.0,
        sentry: {
          dsn: '',
          tracesSampleRate: 0.1
        }
      };

      const result = await testAPMConnection(config);

      expect(result.success).toBe(true);
      expect(result.message).toContain('CONSOLE');
    });

    it('should test successful sentry provider connection', async () => {
      const config: APMUIConfig = {
        provider: 'sentry',
        enabled: true,
        environment: 'production',
        sampleRate: 0.5,
        sentry: {
          dsn: 'https://1234567890abcdef1234567890abcdef@sentry.io/12345',
          tracesSampleRate: 0.2
        }
      };

      const result = await testAPMConnection(config);

      expect(result.success).toBe(true);
      expect(result.message).toContain('SENTRY');
    });

    it('should fail connection test for invalid config', async () => {
      const config: APMUIConfig = {
        provider: 'invalid' as any,
        enabled: true,
        environment: 'development',
        sampleRate: 1.0,
        sentry: {
          dsn: '',
          tracesSampleRate: 0.1
        }
      };

      const result = await testAPMConnection(config);

      expect(result.success).toBe(false);
      expect(result.message).toBe('Configuration validation failed');
      expect(result.error).toBeDefined();
    });
  });
});
