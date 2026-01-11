import { ServiceErrorCodeType, ServiceErrorCode } from './types';

export class ServiceException extends Error {
    public readonly code: ServiceErrorCodeType;
    public readonly details?: unknown;
    public readonly isRetryable: boolean;
    public readonly isTimeout: boolean;

    constructor(
        code: ServiceErrorCodeType,
        message: string,
        details?: unknown,
        isRetryable: boolean = false,
        isTimeout: boolean = false
    ) {
        super(message);
        this.name = 'ServiceException';
        this.code = code;
        this.details = details;
        this.isRetryable = isRetryable;
        this.isTimeout = isTimeout;
    }

    toJSON() {
        return {
            code: this.code,
            message: this.message,
            details: this.details,
            isRetryable: this.isRetryable,
            isTimeout: this.isTimeout,
        };
    }
}

export class ServiceTimeoutError extends ServiceException {
    constructor(message: string, details?: unknown) {
        super(ServiceErrorCode.TIMEOUT, message, details, true, true);
        this.name = 'ServiceTimeoutError';
    }
}

export class ServiceRateLimitError extends ServiceException {
    constructor(message: string, details?: unknown) {
        super(ServiceErrorCode.RATE_LIMIT, message, details, false, false);
        this.name = 'ServiceRateLimitError';
    }
}

export class ServiceValidationError extends ServiceException {
    constructor(message: string, details?: unknown) {
        super(ServiceErrorCode.VALIDATION, message, details, false, false);
        this.name = 'ServiceValidationError';
    }
}

export class ServiceCircuitBreakerError extends ServiceException {
    constructor(message: string, details?: unknown) {
        super(ServiceErrorCode.CIRCUIT_BREAKER, message, details, false, false);
        this.name = 'ServiceCircuitBreakerError';
    }
}

export class ServiceCredentialsError extends ServiceException {
    constructor(message: string, details?: unknown) {
        super(ServiceErrorCode.CREDENTIALS_MISSING, message, details, false, false);
        this.name = 'ServiceCredentialsError';
    }
}

export class ServiceNetworkError extends ServiceException {
    constructor(message: string, details?: unknown) {
        super(ServiceErrorCode.NETWORK, message, details, true, false);
        this.name = 'ServiceNetworkError';
    }
}

export function isServiceException(error: unknown): error is ServiceException {
    return error instanceof ServiceException;
}
