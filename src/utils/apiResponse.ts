import { NextResponse } from 'next/server';
import type { ServiceResult, ServiceErrorCodeType } from '@/types/common';
import { ServiceErrorCode } from '@/services/common';

export interface ApiResponseConfig<T> {
    data: T;
    status?: number;
    headers?: HeadersInit;
}

export function createApiResponse<T>({
    data,
    status = 200,
    headers
}: ApiResponseConfig<T>): NextResponse<T> {
    const defaultHeaders: HeadersInit = {
        'Content-Type': 'application/json',
        'Cache-Control': 'no-cache, no-store, must-revalidate'
    };

    const mergedHeaders = headers
        ? { ...defaultHeaders, ...headers }
        : defaultHeaders;

    return NextResponse.json(data, {
        status,
        headers: mergedHeaders
    });
}

export interface ServiceResponseConfig<T> {
    data?: T;
    message?: string;
    status?: number;
    headers?: HeadersInit;
}

export function createServiceResponse<T>({
    data,
    message = 'Success',
    status = 200,
    headers
}: ServiceResponseConfig<T>): NextResponse<ServiceResult<T>> {
    const defaultHeaders: HeadersInit = {
        'Content-Type': 'application/json',
        'Cache-Control': 'no-cache, no-store, must-revalidate'
    };

    const mergedHeaders = headers
        ? { ...defaultHeaders, ...headers }
        : defaultHeaders;

    const serviceResult: ServiceResult<T> = {
        success: true,
        message,
        data
    };

    return NextResponse.json(serviceResult, {
        status,
        headers: mergedHeaders
    });
}

export interface ServiceErrorResponseConfig<T = void> {
    error: string;
    errorCode?: ServiceErrorCodeType;
    status?: number;
    headers?: HeadersInit;
    metadata?: Record<string, unknown>;
    retryAfter?: number;
    message?: string;
    data?: T;
}

const ERROR_MESSAGES: Record<ServiceErrorCodeType, { message: string; defaultStatus: number; defaultRetryAfter?: number }> = {
    [ServiceErrorCode.VALIDATION]: { message: 'Validation failed', defaultStatus: 400 },
    [ServiceErrorCode.AUTHENTICATION]: { message: 'Authentication failed', defaultStatus: 401 },
    [ServiceErrorCode.AUTHORIZATION]: { message: 'Authorization failed', defaultStatus: 403 },
    [ServiceErrorCode.RESOURCE_NOT_FOUND]: { message: 'Resource not found', defaultStatus: 404 },
    [ServiceErrorCode.RESOURCE_CONFLICT]: { message: 'Resource conflict', defaultStatus: 409 },
    [ServiceErrorCode.RATE_LIMIT]: { message: 'Rate limit exceeded', defaultStatus: 429, defaultRetryAfter: 60 },
    [ServiceErrorCode.TIMEOUT]: { message: 'Request timed out', defaultStatus: 504, defaultRetryAfter: 30 },
    [ServiceErrorCode.CIRCUIT_BREAKER]: { message: 'Circuit breaker is open', defaultStatus: 503, defaultRetryAfter: 60 },
    [ServiceErrorCode.CREDENTIALS_MISSING]: { message: 'Credentials missing', defaultStatus: 401 },
    [ServiceErrorCode.UNKNOWN]: { message: 'Unknown error', defaultStatus: 500 },
    [ServiceErrorCode.NETWORK]: { message: 'Network error occurred', defaultStatus: 503, defaultRetryAfter: 10 },
    [ServiceErrorCode.REQUEST_TIMEOUT]: { message: 'Request timed out', defaultStatus: 504, defaultRetryAfter: 30 },
    [ServiceErrorCode.SESSION_NOT_FOUND]: { message: 'Session not found', defaultStatus: 404 },
    [ServiceErrorCode.USER_NOT_FOUND_IN_SESSION]: { message: 'User not found in session', defaultStatus: 404 },
    [ServiceErrorCode.INVALID_REQUEST_DATA]: { message: 'Invalid request data', defaultStatus: 400 },
    [ServiceErrorCode.INVALID_QUERY_PARAMETERS]: { message: 'Invalid query parameters', defaultStatus: 400 },
    [ServiceErrorCode.MISSING_REQUIRED_FIELDS]: { message: 'Missing required fields', defaultStatus: 400 },
    [ServiceErrorCode.INVALID_CREDENTIALS]: { message: 'Invalid credentials', defaultStatus: 401 },
    [ServiceErrorCode.TEMPLATE_NOT_FOUND]: { message: 'Template not found', defaultStatus: 404 }
};

export function createServiceErrorResponse<T = void>({
    error,
    errorCode,
    status,
    headers,
    metadata,
    retryAfter,
    message,
    data
}: ServiceErrorResponseConfig<T>): NextResponse<ServiceResult<T>> {
    const errorConfig = errorCode ? ERROR_MESSAGES[errorCode] : ERROR_MESSAGES[ServiceErrorCode.UNKNOWN];
    const finalStatus = status ?? errorConfig.defaultStatus;
    const finalRetryAfter = retryAfter ?? errorConfig.defaultRetryAfter;

    const defaultHeaders: HeadersInit = {
        'Content-Type': 'application/json',
        'Cache-Control': 'no-cache, no-store, must-revalidate'
    };

    if (finalRetryAfter !== undefined && finalRetryAfter > 0) {
        (defaultHeaders as Record<string, string>)['Retry-After'] = finalRetryAfter.toString();
    }

    const mergedHeaders = headers
        ? { ...defaultHeaders, ...headers }
        : defaultHeaders;

    const errorMessage = message ?? errorConfig.message;

    const serviceResult: ServiceResult<T> = {
        success: false,
        error,
        errorCode,
        message: errorMessage,
        metadata,
        data
    };

    return NextResponse.json(serviceResult, {
        status: finalStatus,
        headers: mergedHeaders
    });
}
