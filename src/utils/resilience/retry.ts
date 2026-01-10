import type { RetryOptions, RetryResult, ResilienceError } from './types';
import { sleep } from './sleep';

export async function withRetry<T>(
    operation: () => Promise<T>,
    options: RetryOptions
): Promise<RetryResult<T>> {
    const {
        maxAttempts,
        baseDelayMs,
        maxDelayMs,
        backoffMultiplier,
        retryableErrors = []
    } = options;

    let lastError: ResilienceError | undefined;

    for (let attempt = 1; attempt <= maxAttempts; attempt++) {
        try {
            const data = await operation();
            return {
                success: true,
                data,
                attemptCount: attempt
            };
        } catch (error) {
            const resilienceError = createResilienceError(error);
            
            if (attempt === maxAttempts) {
                return {
                    success: false,
                    error: resilienceError,
                    attemptCount: attempt
                };
            }

            const isRetryable = resilienceError.isRetryable && 
                isRetryableByPattern(resilienceError, retryableErrors);

            if (!isRetryable) {
                return {
                    success: false,
                    error: resilienceError,
                    attemptCount: attempt
                };
            }

            lastError = resilienceError;
            const delay = Math.min(
                baseDelayMs * Math.pow(backoffMultiplier, attempt - 1),
                maxDelayMs
            );
            
            await sleep(delay);
        }
    }

    return {
        success: false,
        error: lastError,
        attemptCount: maxAttempts
    };
}

function createResilienceError(error: unknown): ResilienceError {
    const resilienceError: ResilienceError = new Error(
        error instanceof Error ? error.message : 'Unknown error'
    ) as ResilienceError;
    
    resilienceError.isTimeout = (error as ResilienceError)?.isTimeout || false;
    resilienceError.isRetryable = (error as ResilienceError)?.isRetryable !== false;
    resilienceError.originalError = error;
    
    return resilienceError;
}

function isRetryableByPattern(error: ResilienceError, patterns: RegExp[]): boolean {
    if (patterns.length === 0) return true;
    
    return patterns.some(pattern => pattern.test(error.message));
}
