export interface ServiceResult<T = void> {
    success: boolean;
    message?: string;
    data?: T;
    error?: string;
    errorCode?: ServiceErrorCodeType;
    metadata?: Record<string, unknown>;
}

export interface ServiceError {
    code: string;
    message: string;
    details?: unknown;
    isRetryable: boolean;
    isTimeout: boolean;
}

export const ServiceErrorCode = {
    VALIDATION: 'VALIDATION_ERROR',
    RATE_LIMIT: 'RATE_LIMIT_EXCEEDED',
    TIMEOUT: 'TIMEOUT',
    CIRCUIT_BREAKER: 'CIRCUIT_BREAKER_OPEN',
    CREDENTIALS_MISSING: 'CREDENTIALS_MISSING',
    UNKNOWN: 'UNKNOWN_ERROR',
    NETWORK: 'NETWORK_ERROR',
    REQUEST_TIMEOUT: 'REQUEST_TIMEOUT',
} as const;

export type ServiceErrorCodeType = typeof ServiceErrorCode[keyof typeof ServiceErrorCode];
