import { NextResponse } from 'next/server';

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
