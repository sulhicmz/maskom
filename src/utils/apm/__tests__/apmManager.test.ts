import { apmManager } from '../apmManager';

describe('APMManager', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    apmManager.configure({
      provider: 'console',
      enabled: true
    });
  });

  describe('Initialization', () => {
    it('should initialize with console provider by default', () => {
      expect(apmManager.getProviderType()).toBe('console');
      expect(apmManager.isEnabled()).toBe(true);
    });

    it('should allow configuration update', () => {
      apmManager.configure({ enabled: false });
      expect(apmManager.isEnabled()).toBe(false);
    });

    it('should return config', () => {
      const config = apmManager.getConfig();
      expect(config).toHaveProperty('provider');
      expect(config).toHaveProperty('enabled');
      expect(config).toHaveProperty('environment');
    });

    it('should switch provider when configured', () => {
      apmManager.configure({ provider: 'console' });
      expect(apmManager.getProviderType()).toBe('console');
    });

    it('should handle invalid provider by falling back to console', () => {
      apmManager.configure({ provider: 'none' });
      expect(apmManager.getProviderType()).toBe('console');
      expect(apmManager.isEnabled()).toBe(false);
    });
  });

  describe('Error Capture', () => {
    it('should capture error through provider', () => {
      const spy = jest.spyOn(console, 'error');
      apmManager.captureError({
        message: 'Test error',
        level: 'error'
      });
      expect(spy).toHaveBeenCalled();
      spy.mockRestore();
    });

    it('should capture exception through provider', () => {
      const spy = jest.spyOn(console, 'error');
      apmManager.captureException(new Error('Test exception'));
      expect(spy).toHaveBeenCalled();
      spy.mockRestore();
    });

    it('should not capture when disabled', () => {
      apmManager.configure({ enabled: false });
      const spy = jest.spyOn(console, 'error');
      apmManager.captureError({
        message: 'Should not log'
      });
      expect(spy).not.toHaveBeenCalled();
      spy.mockRestore();
    });
  });

  describe('Transaction Tracking', () => {
    it('should start transaction through provider', () => {
      const transaction = apmManager.startTransaction('test-transaction', 'test-op');
      expect(transaction).toBeDefined();
      expect(transaction?.name).toBe('test-transaction');
    });

    it('should finish transaction through provider', () => {
      const transaction = apmManager.startTransaction('test-transaction');
      expect(transaction).toBeDefined();
      apmManager.finishTransaction(transaction!);
    });

    it('should return undefined when disabled', () => {
      apmManager.configure({ enabled: false });
      const transaction = apmManager.startTransaction('test-transaction');
      expect(transaction).toBeUndefined();
    });

    it('should handle transaction with no startTimestamp', () => {
      const transaction = { name: 'test', op: 'test' };
      apmManager.finishTransaction(transaction);
    });
  });

  describe('User Management', () => {
    it('should set user through provider', () => {
      const spy = jest.spyOn(console, 'log');
      apmManager.setUser({
        id: 'user-123',
        email: 'test@example.com'
      });
      expect(spy).toHaveBeenCalled();
      spy.mockRestore();
    });

    it('should set user with partial data', () => {
      const spy = jest.spyOn(console, 'log');
      apmManager.setUser({
        email: 'partial@example.com'
      });
      expect(spy).toHaveBeenCalled();
      spy.mockRestore();
    });
  });

  describe('Tags and Contexts', () => {
    it('should set tag through provider', () => {
      apmManager.setTag('environment', 'test');
    });

    it('should set context through provider', () => {
      apmManager.setContext('page', {
        path: '/test',
        title: 'Test Page'
      });
    });
  });

  describe('Breadcrumbs', () => {
    it('should add breadcrumb through provider', () => {
      const spy = jest.spyOn(console, 'log');
      apmManager.addBreadcrumb('Test breadcrumb');
      expect(spy).toHaveBeenCalled();
      spy.mockRestore();
    });

    it('should add breadcrumb with category and level', () => {
      const spy = jest.spyOn(console, 'log');
      apmManager.addBreadcrumb('Test breadcrumb', 'ui', 'info');
      expect(spy).toHaveBeenCalled();
      spy.mockRestore();
    });
  });

  describe('Performance Tracking', () => {
    it('should track performance metric through provider', () => {
      const spy = jest.spyOn(console, 'log');
      apmManager.trackPerformance({
        name: 'page_load_time',
        value: 1234,
        unit: 'ms'
      });
      expect(spy).toHaveBeenCalled();
      spy.mockRestore();
    });

    it('should track performance metric with tags', () => {
      const spy = jest.spyOn(console, 'log');
      apmManager.setTag('route', '/test');
      apmManager.trackPerformance({
        name: 'api_response_time',
        value: 567,
        unit: 'ms',
        tags: { endpoint: '/api/data' }
      });
      expect(spy).toHaveBeenCalled();
      spy.mockRestore();
    });
  });

  describe('Flush', () => {
    it('should flush events through provider', async () => {
      const spy = jest.spyOn(console, 'log');
      await apmManager.flush();
      expect(spy).toHaveBeenCalledWith('[APM:Flush] Flushing events...');
      spy.mockRestore();
    });
  });

  describe('Provider Type Management', () => {
    it('should return console provider type', () => {
      apmManager.configure({ provider: 'console' });
      expect(apmManager.getProviderType()).toBe('console');
    });

    it('should return none provider type when disabled', () => {
      apmManager.configure({ provider: 'none' });
      expect(apmManager.isEnabled()).toBe(false);
    });
  });

  describe('Config Management', () => {
    it('should return config with default values', () => {
      const config = apmManager.getConfig();
      expect(config.provider).toBe('console');
      expect(config.enabled).toBe(true);
      expect(config.environment).toBeDefined();
    });

    it('should update config partially', () => {
      apmManager.configure({ environment: 'production' });
      const config = apmManager.getConfig();
      expect(config.environment).toBe('production');
      expect(config.provider).toBe('console');
    });

    it('should preserve existing config when updating', () => {
      apmManager.configure({ environment: 'staging', sampleRate: 0.5 });
      const config = apmManager.getConfig();
      expect(config.environment).toBe('staging');
      expect(config.sampleRate).toBe(0.5);
      expect(config.enabled).toBe(true);
    });
  });

  describe('Error Handling', () => {
    it('should handle Sentry provider load failure gracefully', () => {
      const spy = jest.spyOn(console, 'warn');
      apmManager.configure({ provider: 'sentry' });
      expect(spy).toHaveBeenCalledWith('[APM] Sentry provider not available, falling back to console');
      spy.mockRestore();
    });

    it('should handle invalid provider configuration', () => {
      apmManager.configure({ provider: 'invalid' as 'console' | 'sentry' | 'none' });
      const config = apmManager.getConfig();
      expect(config).toHaveProperty('provider');
    });
  });
});
