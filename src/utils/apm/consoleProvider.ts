import type { IAPMProvider, APMError, APMTransaction, APMUser, APMPerformanceMetrics } from './types';

class ConsoleAPMProvider implements IAPMProvider {
  private enabled: boolean = true;
  private user: APMUser = {};
  private tags: Record<string, string> = {};
  private contexts: Record<string, Record<string, unknown>> = {};
  private activeTransactions: Map<string, APMTransaction> = new Map();

  initialize(config?: Record<string, unknown>): void {
    if (config?.enabled === false) {
      this.enabled = false;
      console.log('[APM:Console] Disabled');
      return;
    }

    this.enabled = true;
    console.log('[APM:Console] Initialized');
  }

  captureError(error: APMError): void {
    if (!this.enabled) return;

    const logData = {
      ...error,
      tags: { ...this.tags, ...error.tags },
      extra: { ...this.contexts, ...error.extra },
      user: this.user
    };

    switch (error.level) {
      case 'warning':
        console.warn('[APM:Error]', logData);
        break;
      case 'info':
        console.info('[APM:Error]', logData);
        break;
      default:
        console.error('[APM:Error]', logData);
    }
  }

  captureException(error: Error): void {
    if (!this.enabled) return;

    console.error('[APM:Exception]', {
      message: error.message,
      stack: error.stack,
      name: error.name,
      user: this.user,
      tags: this.tags,
      contexts: this.contexts
    });
  }

  startTransaction(name: string, op?: string): APMTransaction | undefined {
    if (!this.enabled) return undefined;

    const transaction: APMTransaction = {
      name,
      op,
      startTimestamp: Date.now(),
      tags: { ...this.tags }
    };

    this.activeTransactions.set(name, transaction);
    console.log(`[APM:Transaction] Started: ${name}`, { op, timestamp: transaction.startTimestamp });

    return transaction;
  }

  finishTransaction(transaction: APMTransaction): void {
    if (!this.enabled) return;

    this.activeTransactions.delete(transaction.name);

    const duration = transaction.startTimestamp
      ? Date.now() - transaction.startTimestamp
      : undefined;

    console.log(`[APM:Transaction] Finished: ${transaction.name}`, {
      duration: `${duration}ms`,
      op: transaction.op,
      tags: transaction.tags
    });
  }

  setUser(user: APMUser): void {
    if (!this.enabled) return;
    this.user = user;
    console.log('[APM:User] Set:', user);
  }

  setTag(key: string, value: string): void {
    if (!this.enabled) return;
    this.tags[key] = value;
  }

  setContext(key: string, context: Record<string, unknown>): void {
    if (!this.enabled) return;
    this.contexts[key] = context;
  }

  addBreadcrumb(message: string, category?: string, level?: 'info' | 'warning' | 'error'): void {
    if (!this.enabled) return;

    console.log(`[APM:Breadcrumb] [${category || 'default'}] [${level || 'info'}] ${message}`, {
      timestamp: Date.now(),
      user: this.user,
      tags: this.tags
    });
  }

  trackPerformance(metric: APMPerformanceMetrics): void {
    if (!this.enabled) return;

    console.log('[APM:Performance]', {
      name: metric.name,
      value: metric.value,
      unit: metric.unit,
      tags: { ...this.tags, ...metric.tags }
    });
  }

  async flush(): Promise<void> {
    console.log('[APM:Flush] Flushing events...');
    await new Promise(resolve => setTimeout(resolve, 0));
  }

  isEnabled(): boolean {
    return this.enabled;
  }
}

export { ConsoleAPMProvider };
export default ConsoleAPMProvider;
