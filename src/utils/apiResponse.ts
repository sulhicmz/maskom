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

export interface ServiceErrorResponseConfig {
    error: string;
    errorCode?: ServiceErrorCodeType;
    status?: number;
    headers?: HeadersInit;
    metadata?: Record<string, unknown>;
    retryAfter?: number;
}

export function createServiceErrorResponse({
    error,
    errorCode,
    status = 500,
    headers,
    metadata,
    retryAfter
}: ServiceErrorResponseConfig): NextResponse<ServiceResult<void>> {
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

    const serviceResult: ServiceResult<void> = {
        success: false,
        error,
        errorCode,
        metadata
    };

    return NextResponse.json(serviceResult, {
        status,
        headers: mergedHeaders
    });
}
