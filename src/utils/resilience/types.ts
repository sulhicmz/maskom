export interface ResilienceError extends Error {
    isTimeout: boolean;
    isRetryable: boolean;
    originalError?: unknown;
}

export interface TimeoutOptions {
    timeoutMs: number;
    timeoutError?: string;
}

export interface RetryOptions {
    maxAttempts: number;
    baseDelayMs: number;
    maxDelayMs: number;
    backoffMultiplier: number;
    retryableErrors?: RegExp[];
}

export interface CircuitBreakerOptions {
    failureThreshold: number;
    resetTimeoutMs: number;
    monitoringPeriodMs: number;
}

export interface CircuitBreakerState {
    isOpen: boolean;
    failureCount: number;
    lastFailureTime: number | null;
    lastSuccessTime: number | null;
}

export interface RetryResult<T> {
    success: boolean;
    data?: T;
    error?: ResilienceError;
    attemptCount: number;
}

export interface ICircuitBreaker {
    execute<T>(fn: () => Promise<T>): Promise<T>;
    getState(): CircuitBreakerState;
    reset(): void;
}
