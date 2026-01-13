import { withTimeout, withRetry, CircuitBreaker } from '@/utils/resilience';
import metricsCollector from '@/utils/metrics';
import { RateLimiter } from '@/utils/rateLimiter';
import { logServiceError, logServiceSuccess } from './logger';
import { RETRY_CONFIG } from '@/constants';

export interface RetryOptions {
    maxAttempts: number;
    baseDelayMs: number;
    maxDelayMs: number;
    backoffMultiplier: number;
    retryableErrors?: RegExp[];
}

export interface ResilienceContext {
    operationName: string;
    rateLimiter?: RateLimiter;
    identifier?: string;
    circuitBreaker: CircuitBreaker;
    skipRateLimit?: boolean;
    recordRateLimitOnSuccess?: boolean;
    recordRateLimitOnFailure?: boolean;
    timeoutMs?: number;
    retryOptions?: RetryOptions;
}

const DEFAULT_RETRY_OPTIONS: Required<RetryOptions> = {
    maxAttempts: RETRY_CONFIG.MAX_ATTEMPTS,
    baseDelayMs: RETRY_CONFIG.BASE_DELAY_MS,
    maxDelayMs: RETRY_CONFIG.MAX_DELAY_MS,
    backoffMultiplier: RETRY_CONFIG.BACKOFF_MULTIPLIER,
    retryableErrors: [/network/i, /timeout/i, /ECONN/i]
};

const DEFAULT_DEFAULTS = {
    skipRateLimit: false,
    recordRateLimitOnSuccess: true,
    recordRateLimitOnFailure: true
};

export async function executeWithResilience<T, TData = void>(
    context: ResilienceContext,
    operationFn: (data: TData) => Promise<T>,
    data?: TData
): Promise<T> {
    const {
        operationName,
        rateLimiter,
        identifier,
        circuitBreaker,
        skipRateLimit = DEFAULT_DEFAULTS.skipRateLimit,
        recordRateLimitOnSuccess = DEFAULT_DEFAULTS.recordRateLimitOnSuccess,
        recordRateLimitOnFailure = DEFAULT_DEFAULTS.recordRateLimitOnFailure,
        timeoutMs,
        retryOptions = DEFAULT_RETRY_OPTIONS
    } = context;

    const startTime = Date.now();
    const serviceName = operationName.split('.')[0] || 'Service';
    const methodName = operationName.split('.')[1] || 'operation';

    if (!skipRateLimit && rateLimiter && identifier) {
        const limitCheck = rateLimiter.check(identifier);
        if (!limitCheck.allowed) {
            metricsCollector.recordCall(operationName, false, 'rate_limit');
            const error = new RateLimitExceededError(limitCheck.error || 'Too many requests');
            error.limitCheck = limitCheck;
            throw error;
        }
    }

    try {
        const result = await circuitBreaker.execute(async () => {
            let operation = () => operationFn(data as TData);

            if (timeoutMs) {
                const timeoutError = `${methodName} timed out`;
                operation = () => withTimeout(operationFn(data as TData), { timeoutMs, timeoutError });
            }

            const retryResult = await withRetry(operation, retryOptions);

            if (!retryResult.success || !retryResult.data) {
                const error = retryResult.error || new Error(`${methodName} failed after retries`);
                throw error;
            }

            return retryResult.data;
        });

        if (!skipRateLimit && recordRateLimitOnSuccess && rateLimiter && identifier) {
            rateLimiter.recordAttempt(identifier);
        }

        const responseTime = Date.now() - startTime;
        metricsCollector.recordCall(operationName, true, undefined, responseTime);
        logServiceSuccess(serviceName, methodName, responseTime);

        return result;
    } catch (error) {
        const responseTime = Date.now() - startTime;
        let errorType = 'unknown';

        const errorObj = error instanceof Error ? error : new Error('Unknown error');
        const lowerMessage = errorObj.message.toLowerCase();

        if (lowerMessage.indexOf('timeout') !== -1 || lowerMessage.indexOf('timed out') !== -1) {
            errorType = 'timeout';
        } else if (lowerMessage.indexOf('circuit breaker') !== -1) {
            errorType = 'circuit_breaker';
        } else if (error instanceof RateLimitExceededError) {
            errorType = 'rate_limit';
        }

        if (!skipRateLimit && recordRateLimitOnFailure && rateLimiter && identifier) {
            rateLimiter.recordAttempt(identifier);
        }

        metricsCollector.recordCall(operationName, false, errorType, responseTime);

        if (!(error instanceof RateLimitExceededError) &&
            errorObj.message.indexOf('timeout') === -1 &&
            errorObj.message.indexOf('circuit breaker') === -1) {
            logServiceError(errorObj, { service: serviceName, operation: methodName });
        }

        throw error;
    }
}

export class RateLimitExceededError extends Error {
    limitCheck?: { allowed: boolean; error?: string; resetTime?: number };

    constructor(message: string) {
        super(message);
        this.name = 'RateLimitExceededError';
    }
}
