import type { IAPMProvider, APMTransaction, APMError, APMUser, APMPerformanceMetrics, APMConfig, APMProviderType } from './types';
import { ConsoleAPMProvider } from './consoleProvider';

class APMManager {
  private provider: IAPMProvider;
  private providerType: APMProviderType;
  private config: APMConfig;

  constructor() {
    this.config = {
      provider: 'console',
      enabled: true,
      environment: process.env.NODE_ENV || 'development'
    };

    this.providerType = 'console';
    this.provider = new ConsoleAPMProvider();
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

  captureError(error: APMError): void {
    this.provider.captureError(error);
  }

  captureException(error: Error): void {
    this.provider.captureException(error);
  }

  startTransaction(name: string, op?: string): APMTransaction | undefined {
    return this.provider.startTransaction(name, op);
  }

  finishTransaction(transaction: APMTransaction): void {
    this.provider.finishTransaction(transaction);
  }

  setUser(user: APMUser): void {
    this.provider.setUser(user);
  }

  setTag(key: string, value: string): void {
    this.provider.setTag(key, value);
  }

  setContext(key: string, context: Record<string, unknown>): void {
    this.provider.setContext(key, context);
  }

  addBreadcrumb(message: string, category?: string, level?: 'info' | 'warning' | 'error'): void {
    this.provider.addBreadcrumb(message, category, level);
  }

  trackPerformance(metric: APMPerformanceMetrics): void {
    this.provider.trackPerformance(metric);
  }

  async flush(): Promise<void> {
    await this.provider.flush();
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
}

export const apmManager = new APMManager();
export default apmManager;
