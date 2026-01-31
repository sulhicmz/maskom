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
    AUTHENTICATION: 'AUTHENTICATION_ERROR',
    AUTHORIZATION: 'AUTHORIZATION_ERROR',
    RESOURCE_NOT_FOUND: 'RESOURCE_NOT_FOUND',
    RESOURCE_CONFLICT: 'RESOURCE_CONFLICT',
    RATE_LIMIT: 'RATE_LIMIT_EXCEEDED',
    TIMEOUT: 'TIMEOUT',
    CIRCUIT_BREAKER: 'CIRCUIT_BREAKER_OPEN',
    CREDENTIALS_MISSING: 'CREDENTIALS_MISSING',
    UNKNOWN: 'UNKNOWN_ERROR',
    NETWORK: 'NETWORK_ERROR',
    REQUEST_TIMEOUT: 'REQUEST_TIMEOUT',
    SESSION_NOT_FOUND: 'SESSION_NOT_FOUND',
    USER_NOT_FOUND_IN_SESSION: 'USER_NOT_FOUND_IN_SESSION',
    INVALID_REQUEST_DATA: 'INVALID_REQUEST_DATA',
    INVALID_QUERY_PARAMETERS: 'INVALID_QUERY_PARAMETERS',
    MISSING_REQUIRED_FIELDS: 'MISSING_REQUIRED_FIELDS',
    INVALID_CREDENTIALS: 'INVALID_CREDENTIALS',
    TEMPLATE_NOT_FOUND: 'TEMPLATE_NOT_FOUND'
} as const;

export type ServiceErrorCodeType = typeof ServiceErrorCode[keyof typeof ServiceErrorCode];
