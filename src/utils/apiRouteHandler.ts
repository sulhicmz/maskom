import type { NextResponse } from 'next/server';
import { CircuitBreaker, withRetry, type RetryOptions, type CircuitBreakerOptions } from '@/utils/resilience';
import metricsCollector from '@/utils/metrics';
import { logServiceError, logServiceSuccess } from '@/services/common/logger';
import { RateLimitExceededError } from '@/services/common/resilience';
import { createServiceErrorResponse } from '@/utils/apiResponse';
import { CIRCUIT_BREAKER_CONFIG, RETRY_CONFIG } from '@/constants';

export interface ApiRouteHandler<T = unknown> {
    operationName: string;
    handler: () => Promise<NextResponse<T>>;
    circuitBreakerConfig?: CircuitBreakerOptions | typeof CIRCUIT_BREAKER_CONFIG.API_ROUTES[keyof typeof CIRCUIT_BREAKER_CONFIG.API_ROUTES];
    timeoutMs?: number;
    retryOptions?: RetryOptions;
}

const DEFAULT_RETRY_OPTIONS: RetryOptions = {
    maxAttempts: RETRY_CONFIG.MAX_ATTEMPTS,
    baseDelayMs: RETRY_CONFIG.BASE_DELAY_MS,
    maxDelayMs: RETRY_CONFIG.MAX_DELAY_MS,
    backoffMultiplier: RETRY_CONFIG.BACKOFF_MULTIPLIER,
    retryableErrors: [/network/i, /timeout/i, /ECONN/i, /503/i]
};

const circuitBreakers = new Map<string, CircuitBreaker>();

function getCircuitBreaker(routeName: string, config: ApiRouteHandler['circuitBreakerConfig']): CircuitBreaker {
    if (!circuitBreakers.has(routeName)) {
        const cbConfig: CircuitBreakerOptions = config && 'failureThreshold' in config
            ? config
            : {
                failureThreshold: 3,
                resetTimeoutMs: 30000,
                monitoringPeriodMs: 60000
            };
        circuitBreakers.set(routeName, new CircuitBreaker(cbConfig));
    }
    return circuitBreakers.get(routeName)!;
}

export async function executeApiRoute<T = unknown>({
    operationName,
    handler,
    circuitBreakerConfig,
    retryOptions = DEFAULT_RETRY_OPTIONS
}: ApiRouteHandler<T>): Promise<NextResponse<T>> {
    const startTime = Date.now();
    const routeName = operationName.split('.')[0] || 'ApiRoute';
    const circuitBreaker = getCircuitBreaker(routeName, circuitBreakerConfig);

    try {
        const result = await circuitBreaker.execute(async () => {
            const retryResult = await withRetry(handler, retryOptions);

            if (!retryResult.success || retryResult.data === undefined) {
                const error = retryResult.error || new Error(`${operationName} failed after retries`);
                throw error;
            }

            return retryResult.data;
        });

        const responseTime = Date.now() - startTime;
        metricsCollector.recordCall(operationName, true, undefined, responseTime);
        logServiceSuccess(routeName, operationName.split('.')[1] || 'operation', responseTime);

        return result;
    } catch (error) {
        const responseTime = Date.now() - startTime;
        let errorType = 'unknown';

        const errorObj = error instanceof Error ? error : new Error('Unknown error');
        const lowerMessage = errorObj.message.toLowerCase();

        if (lowerMessage.indexOf('timeout') !== -1 || lowerMessage.indexOf('timed out') !== -1) {
            errorType = 'timeout';
        } else if (lowerMessage.indexOf('circuit breaker') !== -1 || lowerMessage.indexOf('open') !== -1) {
            errorType = 'circuit_breaker';
        } else if (lowerMessage.indexOf('network') !== -1 || lowerMessage.indexOf('econn') !== -1 || lowerMessage.indexOf('503') !== -1) {
            errorType = 'network';
        }

        metricsCollector.recordCall(operationName, false, errorType, responseTime);

        if (errorType === 'circuit_breaker') {
            logServiceError(errorObj, { service: routeName, operation: operationName });
            return createServiceErrorResponse({
                error: 'Service temporarily unavailable',
                status: 503,
                retryAfter: 60
            }) as NextResponse<T>;
        }

        if (errorType === 'timeout') {
            logServiceError(errorObj, { service: routeName, operation: operationName });
            return createServiceErrorResponse({
                error: 'Request timed out',
                status: 504,
                retryAfter: 30
            }) as NextResponse<T>;
        }

        if (errorType === 'network') {
            logServiceError(errorObj, { service: routeName, operation: operationName });
            return createServiceErrorResponse({
                error: 'Network error occurred',
                status: 503,
                retryAfter: 10
            }) as NextResponse<T>;
        }

        if (errorType === 'rate_limit') {
            const retryAfter = error instanceof RateLimitExceededError && error.limitCheck?.resetTime
                ? Math.max(0, Math.ceil((error.limitCheck.resetTime - Date.now()) / 1000))
                : 60;

            return createServiceErrorResponse({
                error: errorObj.message,
                status: 429,
                retryAfter
            }) as NextResponse<T>;
        }

        logServiceError(errorObj, { service: routeName, operation: operationName });

        return createServiceErrorResponse({
            error: errorObj.message || 'Internal server error',
            status: 500
        }) as NextResponse<T>;
    }
}

export function getCircuitBreakerState(routeName: string) {
    const circuitBreaker = circuitBreakers.get(routeName);
    if (!circuitBreaker) {
        return null;
    }
    const state = circuitBreaker.getState();
    metricsCollector.recordCircuitBreakerState(routeName, state.isOpen);
    return state;
}

export function resetCircuitBreaker(routeName: string) {
    const circuitBreaker = circuitBreakers.get(routeName);
    if (circuitBreaker) {
        circuitBreaker.reset();
    }
}

export function resetAllCircuitBreakers() {
    circuitBreakers.forEach((cb) => cb.reset());
}
