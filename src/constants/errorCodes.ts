export const ERROR_CODES = {
    VALIDATION_ERROR: 'VALIDATION_ERROR',
    AUTHENTICATION_ERROR: 'AUTHENTICATION_ERROR',
    AUTHORIZATION_ERROR: 'AUTHORIZATION_ERROR',
    RESOURCE_NOT_FOUND: 'RESOURCE_NOT_FOUND',
    RESOURCE_CONFLICT: 'RESOURCE_CONFLICT',
    RATE_LIMIT_EXCEEDED: 'RATE_LIMIT_EXCEEDED',
    REQUEST_TIMEOUT: 'REQUEST_TIMEOUT',
    SERVICE_UNAVAILABLE: 'SERVICE_UNAVAILABLE',
    NETWORK_ERROR: 'NETWORK_ERROR',
    INTERNAL_ERROR: 'INTERNAL_ERROR',
    CIRCUIT_BREAKER_OPEN: 'CIRCUIT_BREAKER_OPEN',
    SESSION_NOT_FOUND: 'SESSION_NOT_FOUND',
    USER_NOT_FOUND_IN_SESSION: 'USER_NOT_FOUND_IN_SESSION',
    INVALID_REQUEST_DATA: 'INVALID_REQUEST_DATA',
    INVALID_QUERY_PARAMETERS: 'INVALID_QUERY_PARAMETERS',
    MISSING_REQUIRED_FIELDS: 'MISSING_REQUIRED_FIELDS',
    INVALID_CREDENTIALS: 'INVALID_CREDENTIALS',
    TEMPLATE_NOT_FOUND: 'TEMPLATE_NOT_FOUND'
} as const;

export const ERROR_MESSAGES = {
    [ERROR_CODES.VALIDATION_ERROR]: 'Validation failed',
    [ERROR_CODES.AUTHENTICATION_ERROR]: 'Authentication failed',
    [ERROR_CODES.AUTHORIZATION_ERROR]: 'Authorization failed',
    [ERROR_CODES.RESOURCE_NOT_FOUND]: 'Resource not found',
    [ERROR_CODES.RESOURCE_CONFLICT]: 'Resource conflict',
    [ERROR_CODES.RATE_LIMIT_EXCEEDED]: 'Rate limit exceeded',
    [ERROR_CODES.REQUEST_TIMEOUT]: 'Request timed out',
    [ERROR_CODES.SERVICE_UNAVAILABLE]: 'Service temporarily unavailable',
    [ERROR_CODES.NETWORK_ERROR]: 'Network error occurred',
    [ERROR_CODES.INTERNAL_ERROR]: 'Internal server error',
    [ERROR_CODES.CIRCUIT_BREAKER_OPEN]: 'Circuit breaker is open',
    [ERROR_CODES.SESSION_NOT_FOUND]: 'Session not found',
    [ERROR_CODES.USER_NOT_FOUND_IN_SESSION]: 'User not found in session',
    [ERROR_CODES.INVALID_REQUEST_DATA]: 'Invalid request data',
    [ERROR_CODES.INVALID_QUERY_PARAMETERS]: 'Invalid query parameters',
    [ERROR_CODES.MISSING_REQUIRED_FIELDS]: 'Missing required fields',
    [ERROR_CODES.INVALID_CREDENTIALS]: 'Invalid credentials',
    [ERROR_CODES.TEMPLATE_NOT_FOUND]: 'Template not found'
} as const;

export type ErrorCodeType = typeof ERROR_CODES[keyof typeof ERROR_CODES];
export type ErrorMessageType = typeof ERROR_MESSAGES[keyof typeof ERROR_MESSAGES];

export interface ApiError {
    code: ErrorCodeType;
    message: string;
    details?: unknown;
    requestId?: string;
    timestamp: string;
}

export function createApiError(code: ErrorCodeType, details?: unknown): ApiError {
    return {
        code,
        message: ERROR_MESSAGES[code] || ERROR_CODES.INTERNAL_ERROR,
        details,
        timestamp: new Date().toISOString()
    };
}
