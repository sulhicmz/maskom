import type { IAPMProvider, APMConfig } from './types';
import type { APMProviderType, IAPMManager, APMTransaction, APMError, APMUser, APMPerformanceMetrics } from '@/types/apm';
import { ConsoleAPMProvider } from './consoleProvider';

class APMManager implements IAPMManager {
  private provider: IAPMProvider;
  private providerType: APMProviderType;
  private config: APMConfig;
  private fallbackProvider: IAPMProvider;
  private consecutiveFailures: number;
  private maxFailuresBeforeFallback: number;
  private lastFailureTime: number;

  constructor() {
    this.config = {
      provider: 'console',
      enabled: true,
      environment: process.env.NODE_ENV || 'development'
    };

    this.providerType = 'console';
    this.provider = new ConsoleAPMProvider();
    this.fallbackProvider = new ConsoleAPMProvider();
    this.consecutiveFailures = 0;
    this.maxFailuresBeforeFallback = 5;
    this.lastFailureTime = 0;
    this.initialize();
  }

  private initialize(): void {
    if (this.config.provider === 'none') {
      this.config.enabled = false;
    }

    if (!this.config.enabled) {
      this.provider = new ConsoleAPMProvider();
      this.providerType = 'console';
      this.provider.initialize(this.config);
      return;
    }

    switch (this.config.provider) {
      case 'console':
        this.provider = new ConsoleAPMProvider();
        this.providerType = 'console';
        break;

      case 'sentry':
        try {
          const { SentryAPMProvider } = require('./sentryProvider');
          this.provider = new SentryAPMProvider();
          this.providerType = 'sentry';
        } catch {
          console.warn('[APM] Sentry provider not available, falling back to console');
          this.provider = new ConsoleAPMProvider();
          this.providerType = 'console';
        }
        break;

      default:
        console.warn(`[APM] Unknown provider "${this.config.provider}", falling back to console (disabled)`);
        this.config.enabled = false;
        this.provider = new ConsoleAPMProvider();
        this.providerType = 'console';
        break;
    }

    this.provider.initialize(this.config);
  }

  configure(config: Partial<APMConfig>): void {
    this.config = { ...this.config, ...config };

    if (config.provider && config.provider !== this.providerType) {
      this.initialize();
    } else if (config.enabled !== undefined) {
      this.initialize();
    }
  }

  private handleError(method: string, error: unknown): void {
    const now = Date.now();
    const timeSinceLastFailure = now - this.lastFailureTime;

    if (timeSinceLastFailure < 60000) {
      this.consecutiveFailures++;
    } else {
      this.consecutiveFailures = 1;
    }

    this.lastFailureTime = now;

    if (this.consecutiveFailures >= this.maxFailuresBeforeFallback && this.providerType !== 'console') {
      console.warn(`[APM] Provider ${this.providerType} failing consistently (${this.consecutiveFailures} failures), switching to console fallback`);
      this.switchToFallback();
    }

    console.error(`[APM] ${method} failed:`, error);
  }

  private switchToFallback(): void {
    const previousProvider = this.providerType;
    this.provider = this.fallbackProvider;
    this.providerType = 'console';
    this.consecutiveFailures = 0;
    this.provider.initialize(this.config);
    console.warn(`[APM] Switched from ${previousProvider} to console fallback due to persistent failures`);
  }

  captureError(error: APMError): void {
    try {
      this.provider.captureError(error);
    } catch (err) {
      this.handleError('captureError', err);
    }
  }

  captureException(error: Error): void {
    try {
      this.provider.captureException(error);
    } catch (err) {
      this.handleError('captureException', err);
    }
  }

  startTransaction(name: string, op?: string): APMTransaction | undefined {
    try {
      return this.provider.startTransaction(name, op);
    } catch (err) {
      this.handleError('startTransaction', err);
      return undefined;
    }
  }

  finishTransaction(transaction: APMTransaction): void {
    try {
      this.provider.finishTransaction(transaction);
    } catch (err) {
      this.handleError('finishTransaction', err);
    }
  }

  setUser(user: APMUser): void {
    try {
      this.provider.setUser(user);
    } catch (err) {
      this.handleError('setUser', err);
    }
  }

  setTag(key: string, value: string): void {
    try {
      this.provider.setTag(key, value);
    } catch (err) {
      this.handleError('setTag', err);
    }
  }

  setContext(key: string, context: Record<string, unknown>): void {
    try {
      this.provider.setContext(key, context);
    } catch (err) {
      this.handleError('setContext', err);
    }
  }

  addBreadcrumb(message: string, category?: string, level?: 'info' | 'warning' | 'error'): void {
    try {
      this.provider.addBreadcrumb(message, category, level);
    } catch (err) {
      this.handleError('addBreadcrumb', err);
    }
  }

  trackPerformance(metric: APMPerformanceMetrics): void {
    try {
      this.provider.trackPerformance(metric);
    } catch (err) {
      this.handleError('trackPerformance', err);
    }
  }

  async flush(): Promise<void> {
    try {
      await this.provider.flush();
    } catch (err) {
      this.handleError('flush', err);
    }
  }

  isEnabled(): boolean {
    return this.provider.isEnabled();
  }

  getProviderType(): APMProviderType {
    return this.providerType;
  }

  getConfig(): APMConfig {
    return { ...this.config };
  }

  getFailureStats(): { consecutiveFailures: number; lastFailureTime: number } {
    return {
      consecutiveFailures: this.consecutiveFailures,
      lastFailureTime: this.lastFailureTime
    };
  }

  resetFailures(): void {
    this.consecutiveFailures = 0;
    this.lastFailureTime = 0;
  }

  restoreOriginalProvider(): void {
    if (this.config.provider !== 'console') {
      this.initialize();
      this.consecutiveFailures = 0;
      console.log(`[APM] Restored to original provider: ${this.config.provider}`);
    }
  }
}

export { APMManager };
export const apmManager = new APMManager();
export default apmManager;
