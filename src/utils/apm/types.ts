import type {
  APMConfig,
  APMProviderType,
  APMError,
  APMTransaction,
  APMUser,
  APMPerformanceMetrics
} from '@/types/apm';

export interface IAPMProvider {
  initialize(config?: APMConfig): void;
  captureError(error: APMError): void;
  captureException(error: Error): void;
  startTransaction(name: string, op?: string): APMTransaction | undefined;
  finishTransaction(transaction: APMTransaction): void;
  setUser(user: APMUser): void;
  setTag(key: string, value: string): void;
  setContext(key: string, context: Record<string, unknown>): void;
  addBreadcrumb(message: string, category?: string, level?: 'info' | 'warning' | 'error'): void;
  trackPerformance(metric: APMPerformanceMetrics): void;
  flush(): Promise<void>;
  isEnabled(): boolean;
}

export type { APMConfig, APMProviderType };
