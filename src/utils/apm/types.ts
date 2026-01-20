import type { APMConfig, APMProviderType } from '@/types/apm';

export interface APMError {
  message: string;
  stack?: string;
  level?: 'error' | 'warning' | 'info';
  tags?: Record<string, string>;
  extra?: Record<string, unknown>;
}

export interface APMTransaction {
  name: string;
  op?: string;
  startTimestamp?: number;
  tags?: Record<string, string>;
  data?: Record<string, unknown>;
}

export interface APMUser {
  id?: string;
  email?: string;
  username?: string;
  role?: string;
}

export interface APMSession {
  id: string;
  startTime: number;
  userId?: string;
  duration?: number;
  events?: APMEvent[];
}

export interface APMEvent {
  name: string;
  timestamp: number;
  type: 'error' | 'transaction' | 'custom' | 'navigation';
  data?: Record<string, unknown>;
}

export interface APMPerformanceMetrics {
  name: string;
  value: number;
  unit: 'ms' | 'bytes' | 'count';
  tags?: Record<string, string>;
}

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
