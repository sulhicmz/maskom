import type { IAPMProvider, APMConfig } from './types';
import type { APMTransaction, APMError, APMUser, APMPerformanceMetrics } from '@/types/apm';

export class SentryAPMProvider implements IAPMProvider {
  private config: APMConfig;
  private enabled: boolean;

  constructor() {
    this.config = {
      provider: 'sentry',
      enabled: true,
      environment: process.env.NODE_ENV || 'development'
    };
    this.enabled = true;
  }

  initialize(config: APMConfig): void {
    this.config = { ...this.config, ...config };
    this.enabled = this.config.enabled ?? true;
  }

  captureError(error: APMError): void {
    if (!this.enabled) return;
    console.error('[Sentry APM] Error captured:', error);
  }

  captureException(error: Error): void {
    if (!this.enabled) return;
    console.error('[Sentry APM] Exception captured:', error);
  }

  startTransaction(name: string, op?: string): APMTransaction | undefined {
    if (!this.enabled) return undefined;
    return {
      name,
      op,
      startTimestamp: Date.now()
    };
  }

  finishTransaction(transaction: APMTransaction): void {
    if (!this.enabled || !transaction) return;
    console.log('[Sentry APM] Transaction finished:', transaction.name);
  }

  setUser(user: APMUser): void {
    if (!this.enabled) return;
    console.log('[Sentry APM] User set:', user.id);
  }

    /* eslint-disable-next-line @typescript-eslint/no-unused-vars */
  setTag(key: string, value: string): void {
    if (!this.enabled) return;
  }

    /* eslint-disable-next-line @typescript-eslint/no-unused-vars */
  setContext(key: string, context: Record<string, unknown>): void {
    if (!this.enabled) return;
  }

    /* eslint-disable-next-line @typescript-eslint/no-unused-vars */
  addBreadcrumb(message: string, category?: string, level?: 'info' | 'warning' | 'error'): void {
    if (!this.enabled) return;
  }

  trackPerformance(metric: APMPerformanceMetrics): void {
    if (!this.enabled) return;
    console.log('[Sentry APM] Performance tracked:', metric.name, metric.value);
  }

  async flush(): Promise<void> {
    if (!this.enabled) return;
  }

  isEnabled(): boolean {
    return this.enabled;
  }

  getConfig(): APMConfig {
    return { ...this.config };
  }
}
