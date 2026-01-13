import type {
    CircuitBreakerOptions,
    CircuitBreakerState,
    ResilienceError,
    ICircuitBreaker
} from './types';

export class CircuitBreaker implements ICircuitBreaker {
    private state: CircuitBreakerState;
    private readonly options: CircuitBreakerOptions;

    constructor(options: CircuitBreakerOptions) {
        this.options = options;
        this.state = {
            isOpen: false,
            failureCount: 0,
            lastFailureTime: null,
            lastSuccessTime: null
        };
    }

    async execute<T>(operation: () => Promise<T>): Promise<T> {
        if (this.state.isOpen && this.shouldAttemptReset()) {
            this.attemptReset();
        }

        if (this.state.isOpen) {
            throw this.createOpenCircuitError();
        }

        return this.executeWithTracking(operation);
    }

    getState(): CircuitBreakerState {
        return { ...this.state };
    }

    reset(): void {
        this.state = {
            isOpen: false,
            failureCount: 0,
            lastFailureTime: null,
            lastSuccessTime: null
        };
    }

    private async executeWithTracking<T>(operation: () => Promise<T>): Promise<T> {
        try {
            const result = await operation();
            this.recordSuccess();
            return result;
        } catch (error) {
            this.recordFailure();
            throw error;
        }
    }

    private recordSuccess(): void {
        this.state.lastSuccessTime = Date.now();
        this.state.failureCount = 0;
        
        if (this.state.isOpen) {
            this.state.isOpen = false;
        }
    }

    private recordFailure(): void {
        this.state.failureCount++;
        this.state.lastFailureTime = Date.now();

        if (this.state.failureCount >= this.options.failureThreshold) {
            this.state.isOpen = true;
        }
    }

    private shouldAttemptReset(): boolean {
        if (!this.state.lastFailureTime) return false;
        
        const timeSinceLastFailure = Date.now() - this.state.lastFailureTime;
        return timeSinceLastFailure >= this.options.resetTimeoutMs;
    }

    private attemptReset(): void {
        this.state.isOpen = false;
        this.state.failureCount = 0;
    }

    private createOpenCircuitError(): ResilienceError {
        const error: ResilienceError = new Error(
            'Circuit breaker is open. Service temporarily unavailable.'
        ) as ResilienceError;
        error.isTimeout = false;
        error.isRetryable = false;
        return error;
    }
}
