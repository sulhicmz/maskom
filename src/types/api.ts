/**
 * API Contract Types
 * 
 * This file defines all TypeScript types for Maskom API contracts.
 * These types provide compile-time type safety for API consumers.
 * 
 * @packageDocumentation
 * @category API Contracts
 */

/**
 * Base service result type returned by all API operations
 * @template T - Type of data returned on success
 */
export interface ServiceResult<T = void> {
    /** Indicates if the operation was successful */
    success: boolean;

    /** Human-readable message describing the result */
    message?: string;

    /** Response data (present only when success is true) */
    data?: T;

    /** Error message (present only when success is false) */
    error?: string;

    /** Machine-readable error code (present only when success is false) */
    errorCode?: ServiceErrorCodeType;

    /** Additional metadata providing context for success or failure */
    metadata?: Record<string, unknown>;
}

/**
 * Standardized error codes used across all services
 */
export const ServiceErrorCode = {
    /** Invalid input data or validation failure */
    VALIDATION: 'VALIDATION_ERROR',

    /** Too many requests, rate limit exceeded */
    RATE_LIMIT: 'RATE_LIMIT_EXCEEDED',

    /** Request timed out */
    TIMEOUT: 'TIMEOUT',

    /** Service circuit breaker is open */
    CIRCUIT_BREAKER: 'CIRCUIT_BREAKER_OPEN',

    /** Service credentials not configured */
    CREDENTIALS_MISSING: 'CREDENTIALS_MISSING',

    /** Unknown error occurred */
    UNKNOWN: 'UNKNOWN_ERROR',

    /** Network connectivity issue */
    NETWORK: 'NETWORK_ERROR',
} as const;

/**
 * Union type of all possible error codes
 */
export type ServiceErrorCodeType = typeof ServiceErrorCode[keyof typeof ServiceErrorCode];

/**
 * ============================================================================
 * HEALTH API TYPES
 * ============================================================================
 */

/**
 * Parameters for health check endpoint
 */
export interface HealthCheckParams {
    /** Success rate threshold (0.0 - 1.0). Default: 0.9 */
    threshold?: number;
}

/**
 * Health check response data
 */
export interface HealthResponseData {
    /** Overall system status */
    status: 'healthy' | 'degraded';

    /** ISO 8601 timestamp of health check */
    timestamp: string;

    /** Health status for each service */
    services: HealthCheckResult[];

    /** Summary statistics */
    summary: HealthCheckSummary;
}

/**
 * Health check result for a single service
 */
export interface HealthCheckResult {
    /** Name of the service */
    serviceName: string;

    /** Whether the service is healthy */
    healthy: boolean;

    /** Human-readable message describing service status */
    message: string;

    /** Service metrics */
    metrics: ServiceMetrics;

    /** Unix timestamp when check was performed */
    checkedAt: number;
}

/**
 * Summary statistics for all services
 */
export interface HealthCheckSummary {
    /** Total number of services checked */
    totalServices: number;

    /** Number of services that are healthy */
    healthyServices: number;

    /** Number of services that are unhealthy */
    unhealthyServices: number;

    /** Success rate threshold used for health check */
    successRateThreshold: number;
}

/**
 * ============================================================================
 * METRICS API TYPES
 * ============================================================================ */

/**
 * Metrics response data
 */
export interface MetricsResponseData {
    /** ISO 8601 timestamp of metrics collection */
    timestamp: string;

    /** Summary statistics across all services */
    summary: MetricsSummary;

    /** Metrics for each service */
    services: ServiceMetricsWithHealth[];
}

/**
 * Summary statistics across all services
 */
export interface MetricsSummary {
    /** Total number of services */
    totalServices: number;

    /** Total number of API calls across all services */
    totalCalls: number;

    /** Total number of successful calls across all services */
    totalSuccesses: number;

    /** Total number of failed calls across all services */
    totalFailures: number;

    /** Total number of timeouts across all services */
    totalTimeouts: number;

    /** Total number of rate limit hits across all services */
    totalRateLimits: number;
}

/**
 * Service metrics with calculated health status
 */
export interface ServiceMetricsWithHealth extends ServiceMetrics {
    /** Success rate as percentage (0-100) */
    successRate: number;

    /** Health status derived from success rate */
    health: 'healthy' | 'degraded' | 'unhealthy';
}

/**
 * Base service metrics type
 */
export interface ServiceMetrics {
    /** Name of the service */
    serviceName: string;

    /** Total number of calls to the service */
    totalCalls: number;

    /** Number of successful calls */
    successCalls: number;

    /** Number of failed calls */
    failureCalls: number;

    /** Number of timeouts */
    timeoutCalls: number;

    /** Number of rate limit hits */
    rateLimitCalls: number;

    /** Number of times circuit breaker opened */
    circuitBreakerOpenCount: number;

    /** Last error message */
    lastError?: string;

    /** Unix timestamp of last success */
    lastSuccessTime?: number;

    /** Unix timestamp of last failure */
    lastFailureTime?: number;

    /** Average response time in milliseconds */
    averageResponseTime?: number;
}

/**
 * ============================================================================
 * SERVICES STATUS API TYPES
 * ============================================================================ */

/**
 * Services status response data
 */
export interface ServicesStatusResponseData {
    /** ISO 8601 timestamp */
    timestamp: string;

    /** Email service status */
    email: ServiceStatus;

    /** Auth service status */
    auth: ServiceStatus;
}

/**
 * Status for a single service
 */
export interface ServiceStatus {
    /** Service metrics */
    metrics?: ServiceMetrics;

    /** Circuit breaker state */
    circuitBreaker: CircuitBreakerState;
}

/**
 * Circuit breaker state
 */
export interface CircuitBreakerState {
    /** Whether circuit breaker is open (blocking requests) */
    isOpen: boolean;

    /** Number of consecutive failures */
    failureCount: number;

    /** Unix timestamp of last failure */
    lastFailureTime: number | null;

    /** Unix timestamp of last success */
    lastSuccessTime: number | null;
}

/**
 * ============================================================================
 * EMAIL QUEUE API TYPES
 * ============================================================================ */

/**
 * Email queue status response data
 */
export interface EmailQueueStatusResponseData {
    /** ISO 8601 timestamp */
    timestamp: string;

    /** Queue status */
    queue: EmailQueueInfo;

    /** Circuit breaker state */
    circuitBreaker: CircuitBreakerState;

    /** Service metrics */
    metrics?: ServiceMetrics;
}

/**
 * Email queue information
 */
export interface EmailQueueInfo {
    /** Number of emails currently in queue */
    size: number;

    /** Number of emails that have expired */
    expired: number;

    /** Queue status */
    status: 'has_pending_emails' | 'empty';
}

/**
 * Email queue process response data
 */
export interface EmailQueueProcessResponseData {
    /** Number of emails successfully processed */
    processed: number;

    /** Number of emails that failed after max attempts */
    failed: number;
}

/**
 * ============================================================================
 * ERROR RESPONSE METADATA TYPES
 * ============================================================================ */

/**
 * Metadata for rate limit errors
 */
export interface RateLimitErrorMetadata {
    /** Seconds until retry is allowed */
    retryAfter: number;

    /** Unix timestamp when rate limit resets */
    resetTime: number;

    /** Maximum number of requests allowed */
    limit: number;

    /** Rate limit window in milliseconds */
    window: number;

    /** Number of attempts remaining (if any) */
    remainingAttempts?: number;

    /** Unix timestamp when cooldown period ends */
    cooldownUntil?: number;
}

/**
 * Metadata for timeout errors
 */
export interface TimeoutErrorMetadata {
    /** Seconds until retry is recommended */
    retryAfter: number;

    /** Timeout duration in milliseconds */
    timeoutMs: number;

    /** Operation that timed out */
    operation: string;

    /** Actual elapsed time in milliseconds */
    elapsedTime?: number;
}

/**
 * Metadata for circuit breaker errors
 */
export interface CircuitBreakerErrorMetadata {
    /** Seconds until retry is recommended */
    retryAfter: number;

    /** Number of consecutive failures */
    failureCount: number;

    /** Unix timestamp of last failure */
    lastFailureTime: number;

    /** Unix timestamp when circuit breaker resets */
    resetTime: number;

    /** Current circuit breaker state */
    state: 'open' | 'closed' | 'half-open';
}

/**
 * Metadata for network errors
 */
export interface NetworkErrorMetadata {
    /** Seconds until retry is recommended */
    retryAfter: number;

    /** Network error type */
    networkError?: string;

    /** HTTP status code if available */
    statusCode?: number;
}

/**
 * Metadata for validation errors
 */
export interface ValidationErrorMetadata {
    /** Field that failed validation */
    field?: string;

    /** Validation constraint that failed */
    constraint?: string;

    /** Provided value that failed validation */
    provided?: string;

    /** Expected pattern or format */
    pattern?: string;

    /** Human-readable reason for validation failure */
    reason?: string;
}

/**
 * Metadata for template validation errors
 */
export interface TemplateValidationErrorMetadata extends ValidationErrorMetadata {
    /** Array of validation errors */
    errors?: string[];
}

/**
 * Metadata for unknown errors
 */
export interface UnknownErrorMetadata {
    /** Request ID for debugging */
    requestId?: string;

    /** Unix timestamp of error */
    timestamp: number;

    /** Service that encountered error */
    service?: string;

    /** Operation that encountered error */
    operation?: string;
}

/**
 * ============================================================================
 * REQUEST/RESPONSE HEADER TYPES
 * ============================================================================ */

/**
 * Standard headers included in all API responses
 */
export interface StandardResponseHeaders {
    /** Content type */
    'Content-Type': 'application/json';

    /** Cache control directive */
    'Cache-Control': 'no-cache, no-store, must-revalidate';

    /** Seconds until retry is recommended (for errors) */
    'Retry-After'?: string;
}

/**
 * ============================================================================
 * API CLIENT TYPES
 * ============================================================================ */

/**
 * Configuration for API client
 */
export interface ApiClientConfig {
    /** Base URL for API requests */
    baseUrl: string;

    /** Authentication token */
    token?: string;

    /** Default timeout in milliseconds */
    timeout?: number;

    /** Enable circuit breaker on client side */
    enableCircuitBreaker?: boolean;

    /** Circuit breaker failure threshold */
    circuitBreakerThreshold?: number;

    /** Circuit breaker reset timeout in milliseconds */
    circuitBreakerResetTimeout?: number;
}

/**
 * Configuration for request retry
 */
export interface RetryConfig {
    /** Maximum number of retry attempts */
    maxRetries: number;

    /** Base delay in milliseconds */
    baseDelayMs: number;

    /** Maximum delay in milliseconds */
    maxDelayMs: number;

    /** Backoff multiplier */
    backoffMultiplier: number;

    /** List of error codes that are retryable */
    retryableErrorCodes: ServiceErrorCodeType[];
}

/**
 * ============================================================================
 * HELPER TYPES
 * ============================================================================ */

/**
 * Type guard to check if error code is retryable
 * @param errorCode - Error code to check
 * @returns true if error is retryable
 */
export function isRetryableError(errorCode?: ServiceErrorCodeType): boolean {
    if (!errorCode) return false;
    
    const retryableCodes: ServiceErrorCodeType[] = [
        ServiceErrorCode.RATE_LIMIT,
        ServiceErrorCode.TIMEOUT,
        ServiceErrorCode.CIRCUIT_BREAKER,
        ServiceErrorCode.NETWORK,
    ];
    
    return retryableCodes.includes(errorCode);
}

/**
 * Type guard to check if service result is successful
 * @param result - Service result to check
 * @returns true if result is successful
 */
export function isSuccess<T>(result: ServiceResult<T>): result is ServiceResult<T> & { success: true } {
    return result.success === true;
}

/**
 * Type guard to check if service result is an error
 * @param result - Service result to check
 * @returns true if result is an error
 */
export function isError<T>(result: ServiceResult<T>): result is ServiceResult<T> & { success: false } {
    return result.success === false;
}

/**
 * Extract data from service result (throws if error)
 * @param result - Service result to extract data from
 * @returns data from service result
 * @throws Error if result is not successful
 */
export function extractData<T>(result: ServiceResult<T>): T {
    if (!isSuccess(result)) {
        throw new Error(result.error || 'Service result is not successful');
    }
    return result.data as T;
}

/**
 * ============================================================================
 * EXPORTS
 * ============================================================================
 */

const api = {
    ServiceErrorCode,
    isRetryableError,
    isSuccess,
    isError,
    extractData,
};

export default api;
