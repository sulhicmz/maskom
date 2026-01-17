import { ConsoleAPMProvider } from '../consoleProvider';

describe('ConsoleAPMProvider', () => {
  let provider: ConsoleAPMProvider;

  beforeEach(() => {
    provider = new ConsoleAPMProvider();
  });

  describe('Initialization', () => {
    it('should initialize with default config', () => {
      const spy = jest.spyOn(console, 'log');
      provider.initialize();
      expect(spy).toHaveBeenCalledWith('[APM:Console] Initialized');
      spy.mockRestore();
    });

    it('should initialize with enabled: false', () => {
      const spy = jest.spyOn(console, 'log');
      provider.initialize({ enabled: false });
      expect(spy).toHaveBeenCalledWith('[APM:Console] Disabled');
      spy.mockRestore();
    });

    it('should return enabled status', () => {
      provider.initialize();
      expect(provider.isEnabled()).toBe(true);
    });

    it('should return disabled status when explicitly disabled', () => {
      provider.initialize({ enabled: false });
      expect(provider.isEnabled()).toBe(false);
    });
  });

  describe('Error Capture', () => {
    it('should capture error with level: error', () => {
      const spy = jest.spyOn(console, 'error');
      provider.captureError({
        message: 'Test error',
        level: 'error',
        stack: 'Error stack trace'
      });
      expect(spy).toHaveBeenCalledWith('[APM:Error]', expect.objectContaining({
        message: 'Test error',
        level: 'error',
        stack: 'Error stack trace'
      }));
      spy.mockRestore();
    });

    it('should capture error with level: warning', () => {
      const spy = jest.spyOn(console, 'warn');
      provider.captureError({
        message: 'Test warning',
        level: 'warning'
      });
      expect(spy).toHaveBeenCalledWith('[APM:Error]', expect.objectContaining({
        message: 'Test warning',
        level: 'warning'
      }));
      spy.mockRestore();
    });

    it('should capture error with level: info', () => {
      const spy = jest.spyOn(console, 'info');
      provider.captureError({
        message: 'Test info',
        level: 'info'
      });
      expect(spy).toHaveBeenCalledWith('[APM:Error]', expect.objectContaining({
        message: 'Test info',
        level: 'info'
      }));
      spy.mockRestore();
    });

    it('should capture error without level (default to error)', () => {
      const spy = jest.spyOn(console, 'error');
      provider.captureError({
        message: 'Test error without level'
      });
      expect(spy).toHaveBeenCalledWith('[APM:Error]', expect.objectContaining({
        message: 'Test error without level'
      }));
      spy.mockRestore();
    });

    it('should not capture error when disabled', () => {
      provider.initialize({ enabled: false });
      const spy = jest.spyOn(console, 'error');
      provider.captureError({ message: 'Should not log' });
      expect(spy).not.toHaveBeenCalled();
      spy.mockRestore();
    });

    it('should capture error with tags', () => {
      const spy = jest.spyOn(console, 'error');
      provider.setTag('environment', 'test');
      provider.captureError({
        message: 'Error with tags',
        tags: { component: 'TestComponent' }
      });
      expect(spy).toHaveBeenCalledWith('[APM:Error]', expect.objectContaining({
        tags: expect.objectContaining({
          environment: 'test',
          component: 'TestComponent'
        })
      }));
      spy.mockRestore();
    });
  });

  describe('Exception Capture', () => {
    it('should capture exception', () => {
      const spy = jest.spyOn(console, 'error');
      const error = new Error('Test exception');
      error.stack = 'Error: Test exception\n    at test.js:1:1';
      provider.captureException(error);
      expect(spy).toHaveBeenCalledWith('[APM:Exception]', expect.objectContaining({
        message: 'Test exception',
        stack: 'Error: Test exception\n    at test.js:1:1',
        name: 'Error'
      }));
      spy.mockRestore();
    });

    it('should not capture exception when disabled', () => {
      provider.initialize({ enabled: false });
      const spy = jest.spyOn(console, 'error');
      provider.captureException(new Error('Should not log'));
      expect(spy).not.toHaveBeenCalled();
      spy.mockRestore();
    });
  });

  describe('Transaction Tracking', () => {
    it('should start transaction', () => {
      const spy = jest.spyOn(console, 'log');
      const transaction = provider.startTransaction('test-transaction', 'test-op');
      expect(transaction).toBeDefined();
      expect(transaction?.name).toBe('test-transaction');
      expect(transaction?.op).toBe('test-op');
      expect(transaction?.startTimestamp).toBeDefined();
      expect(spy).toHaveBeenCalledWith(
        '[APM:Transaction] Started: test-transaction',
        expect.objectContaining({
          op: 'test-op',
          timestamp: expect.any(Number)
        })
      );
      spy.mockRestore();
    });

    it('should finish transaction with duration', async () => {
      const spy = jest.spyOn(console, 'log');
      const transaction = provider.startTransaction('test-transaction');
      expect(transaction).toBeDefined();

      await new Promise(resolve => setTimeout(resolve, 10));
      provider.finishTransaction(transaction!);

      const calls = spy.mock.calls;
      const finishCall = calls.find(call => call[0] === '[APM:Transaction] Finished: test-transaction');
      expect(finishCall).toBeDefined();
      expect(finishCall?.[1]).toMatchObject({
        duration: expect.stringMatching(/^\d+ms$/)
      });
      spy.mockRestore();
    });

    it('should return undefined when disabled', () => {
      provider.initialize({ enabled: false });
      const transaction = provider.startTransaction('test-transaction');
      expect(transaction).toBeUndefined();
    });

    it('should track multiple transactions separately', async () => {
      const spy = jest.spyOn(console, 'log');
      const tx1 = provider.startTransaction('transaction-1');
      const tx2 = provider.startTransaction('transaction-2');

      await new Promise(resolve => setTimeout(resolve, 5));
      provider.finishTransaction(tx1!);

      await new Promise(resolve => setTimeout(resolve, 5));
      provider.finishTransaction(tx2!);

      const startCalls = spy.mock.calls.filter(call => call[0]?.includes('Started'));
      const finishCalls = spy.mock.calls.filter(call => call[0]?.includes('Finished'));

      expect(startCalls).toHaveLength(2);
      expect(finishCalls).toHaveLength(2);
      spy.mockRestore();
    });
  });

  describe('User Management', () => {
    it('should set user', () => {
      const spy = jest.spyOn(console, 'log');
      provider.setUser({
        id: 'user-123',
        email: 'test@example.com',
        role: 'admin'
      });
      expect(spy).toHaveBeenCalledWith('[APM:User] Set:', {
        id: 'user-123',
        email: 'test@example.com',
        role: 'admin'
      });
      spy.mockRestore();
    });

    it('should not set user when disabled', () => {
      provider.initialize({ enabled: false });
      const spy = jest.spyOn(console, 'log');
      provider.setUser({ id: 'user-123' });
      expect(spy).not.toHaveBeenCalled();
      spy.mockRestore();
    });

    it('should set user with partial data', () => {
      const spy = jest.spyOn(console, 'log');
      provider.setUser({
        email: 'partial@example.com'
      });
      expect(spy).toHaveBeenCalledWith('[APM:User] Set:', {
        email: 'partial@example.com'
      });
      spy.mockRestore();
    });
  });

  describe('Tags and Contexts', () => {
    it('should set tag', () => {
      provider.setTag('environment', 'production');
    });

    it('should set context', () => {
      provider.setContext('page', {
        path: '/test',
        title: 'Test Page'
      });
    });

    it('should merge tags in error capture', () => {
      const spy = jest.spyOn(console, 'error');
      provider.setTag('environment', 'test');
      provider.setTag('component', 'TestComponent');

      provider.captureError({
        message: 'Error with merged tags'
      });

      expect(spy).toHaveBeenCalledWith('[APM:Error]', expect.objectContaining({
        tags: {
          environment: 'test',
          component: 'TestComponent'
        }
      }));
      spy.mockRestore();
    });

    it('should merge contexts in error capture', () => {
      const spy = jest.spyOn(console, 'error');
      provider.setContext('request', {
        url: '/api/test',
        method: 'GET'
      });
      provider.setContext('page', {
        path: '/test'
      });

      provider.captureError({
        message: 'Error with merged contexts'
      });

      expect(spy).toHaveBeenCalledWith('[APM:Error]', expect.objectContaining({
        extra: {
          request: {
            url: '/api/test',
            method: 'GET'
          },
          page: {
            path: '/test'
          }
        }
      }));
      spy.mockRestore();
    });
  });

  describe('Breadcrumbs', () => {
    it('should add breadcrumb with default category and level', () => {
      const spy = jest.spyOn(console, 'log');
      provider.addBreadcrumb('Test breadcrumb');
      expect(spy).toHaveBeenCalledWith(
        '[APM:Breadcrumb] [default] [info] Test breadcrumb',
        expect.objectContaining({
          timestamp: expect.any(Number)
        })
      );
      spy.mockRestore();
    });

    it('should add breadcrumb with custom category and level', () => {
      const spy = jest.spyOn(console, 'log');
      provider.addBreadcrumb('User clicked', 'ui', 'info');
      expect(spy).toHaveBeenCalledWith(
        '[APM:Breadcrumb] [ui] [info] User clicked',
        expect.any(Object)
      );
      spy.mockRestore();
    });

    it('should add breadcrumb with error level', () => {
      const spy = jest.spyOn(console, 'log');
      provider.addBreadcrumb('API failed', 'network', 'error');
      expect(spy).toHaveBeenCalledWith(
        '[APM:Breadcrumb] [network] [error] API failed',
        expect.any(Object)
      );
      spy.mockRestore();
    });

    it('should not add breadcrumb when disabled', () => {
      provider.initialize({ enabled: false });
      const spy = jest.spyOn(console, 'log');
      provider.addBreadcrumb('Should not log');
      expect(spy).not.toHaveBeenCalled();
      spy.mockRestore();
    });

    it('should include user and tags in breadcrumb', () => {
      const spy = jest.spyOn(console, 'log');
      provider.setUser({ id: 'user-123' });
      provider.setTag('session', 'abc123');
      provider.addBreadcrumb('Test breadcrumb with metadata');

      expect(spy).toHaveBeenCalledWith(
        '[APM:Breadcrumb] [default] [info] Test breadcrumb with metadata',
        expect.objectContaining({
          user: { id: 'user-123' },
          tags: { session: 'abc123' }
        })
      );
      spy.mockRestore();
    });
  });

  describe('Performance Tracking', () => {
    it('should track performance metric', () => {
      const spy = jest.spyOn(console, 'log');
      provider.trackPerformance({
        name: 'page_load_time',
        value: 1234,
        unit: 'ms'
      });
      expect(spy).toHaveBeenCalledWith('[APM:Performance]', {
        name: 'page_load_time',
        value: 1234,
        unit: 'ms',
        tags: {}
      });
      spy.mockRestore();
    });

    it('should track performance metric with tags', () => {
      const spy = jest.spyOn(console, 'log');
      provider.setTag('route', '/test');
      provider.trackPerformance({
        name: 'api_response_time',
        value: 567,
        unit: 'ms',
        tags: { endpoint: '/api/data' }
      });
      expect(spy).toHaveBeenCalledWith('[APM:Performance]', {
        name: 'api_response_time',
        value: 567,
        unit: 'ms',
        tags: {
          route: '/test',
          endpoint: '/api/data'
        }
      });
      spy.mockRestore();
    });

    it('should not track performance when disabled', () => {
      provider.initialize({ enabled: false });
      const spy = jest.spyOn(console, 'log');
      provider.trackPerformance({
        name: 'test_metric',
        value: 100,
        unit: 'ms'
      });
      expect(spy).not.toHaveBeenCalled();
      spy.mockRestore();
    });
  });

  describe('Flush', () => {
    it('should flush events', async () => {
      const spy = jest.spyOn(console, 'log');
      await provider.flush();
      expect(spy).toHaveBeenCalledWith('[APM:Flush] Flushing events...');
      spy.mockRestore();
    });
  });
});
