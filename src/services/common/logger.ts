import { ServiceErrorCode } from './types';
import { isServiceException } from './ServiceException';

export interface LoggerOptions {
    service: string;
    operation: string;
    includeDetails?: boolean;
}

export function logServiceError(error: unknown, options: LoggerOptions): void {
    const { service, operation, includeDetails = false } = options;

    if (isServiceException(error)) {
        console.error(`[${service}] ${operation} failed:`, {
            code: error.code,
            message: error.message,
            isRetryable: error.isRetryable,
            isTimeout: error.isTimeout,
            ...(includeDetails && { details: error.details }),
        });
    } else if (error instanceof Error) {
        console.error(`[${service}] ${operation} failed:`, {
            message: error.message,
            code: ServiceErrorCode.UNKNOWN,
        });
    } else {
        console.error(`[${service}] ${operation} failed with unknown error:`, {
            error: String(error),
            code: ServiceErrorCode.UNKNOWN,
        });
    }
}

export function logServiceSuccess(service: string, operation: string, duration?: number): void {
    const message = duration
        ? `[${service}] ${operation} completed in ${duration}ms`
        : `[${service}] ${operation} completed successfully`;

    console.log(message);
}

export function logServiceWarning(service: string, operation: string, message: string): void {
    console.warn(`[${service}] ${operation} warning:`, message);
}
