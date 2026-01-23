import { NextResponse } from 'next/server';
import type { ServiceResult, ServiceErrorCodeType } from '@/types/common';

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

const ERROR_MESSAGES: Record<string, string> = {
    'VALIDATION_ERROR': 'Validation failed',
    'RATE_LIMIT': 'Rate limit exceeded',
    'TIMEOUT': 'Request timed out',
    'CIRCUIT_BREAKER': 'Circuit breaker is open',
    'CREDENTIALS_MISSING': 'Credentials missing',
    'NETWORK': 'Network error occurred',
    'UNKNOWN': 'Unknown error',
    'REQUEST_TIMEOUT': 'Request timed out',
    'SERVICE_UNAVAILABLE': 'Service temporarily unavailable',
    'RESOURCE_NOT_FOUND': 'Resource not found',
    'SESSION_NOT_FOUND': 'Session not found',
    'USER_NOT_FOUND_IN_SESSION': 'User not found in session',
    'INVALID_REQUEST_DATA': 'Invalid request data',
    'INVALID_QUERY_PARAMETERS': 'Invalid query parameters',
    'MISSING_REQUIRED_FIELDS': 'Missing required fields',
    'INVALID_CREDENTIALS': 'Invalid credentials',
    'TEMPLATE_NOT_FOUND': 'Template not found'
};

export function createServiceErrorResponse<T = void>({
    error,
    errorCode,
    status = 500,
    headers,
    metadata,
    retryAfter,
    message,
    data
}: ServiceErrorResponseConfig<T>): NextResponse<ServiceResult<T>> {
    const defaultHeaders: HeadersInit = {
        'Content-Type': 'application/json',
        'Cache-Control': 'no-cache, no-store, must-revalidate'
    };

    if (retryAfter !== undefined && retryAfter > 0) {
        (defaultHeaders as Record<string, string>)['Retry-After'] = retryAfter.toString();
    }

    const mergedHeaders = headers
        ? { ...defaultHeaders, ...headers }
        : defaultHeaders;

    const errorMessage = message || (errorCode ? ERROR_MESSAGES[errorCode] || 'Unknown error' : 'Unknown error');

    const serviceResult: ServiceResult<T> = {
        success: false,
        error,
        errorCode,
        message: errorMessage,
        metadata,
        data
    };

    return NextResponse.json(serviceResult, {
        status,
        headers: mergedHeaders
    });
}
