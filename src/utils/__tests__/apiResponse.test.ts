import { createApiResponse } from '../apiResponse';

interface TestData {
    message: string;
    count: number;
}

jest.mock('next/server', () => ({
    NextResponse: {
        json: jest.fn((data: unknown, options?: { status?: number; headers?: Record<string, string> }) => ({
            status: options?.status || 200,
            headers: new Map(Object.entries(options?.headers || {})),
            data
        }))
    }
}));

describe('createApiResponse', () => {
    describe('Happy Path - Successful Responses', () => {
        it('should create response with default status 200', () => {
            const testData: TestData = { message: 'Success', count: 42 };

            const result = createApiResponse({ data: testData });

            expect(result.status).toBe(200);
            expect(result.status).toBe(200);
        });

        it('should include default Content-Type header', () => {
            const testData = { message: 'Hello' };

            const result = createApiResponse({ data: testData });

            expect(result.headers.get('Content-Type')).toBe('application/json');
        });

        it('should include default Cache-Control header', () => {
            const testData = { message: 'Hello' };

            const result = createApiResponse({ data: testData });

            expect(result.headers.get('Cache-Control')).toBe('no-cache, no-store, must-revalidate');
        });

        it('should create response with custom status code', () => {
            const testData = { message: 'Created' };

            const result = createApiResponse({ data: testData, status: 201 });

            expect(result.status).toBe(201);
        });

        it('should create response with 404 status', () => {
            const testData = { error: 'Not Found' };

            const result = createApiResponse({ data: testData, status: 404 });

            expect(result.status).toBe(404);
        });

        it('should create response with 503 status for service unavailable', () => {
            const testData = { error: 'Service Unavailable' };

            const result = createApiResponse({ data: testData, status: 503 });

            expect(result.status).toBe(503);
        });

        it('should handle complex nested data structures', () => {
            const complexData = {
                user: {
                    id: 1,
                    name: 'John Doe',
                    profile: {
                        email: 'john@example.com',
                        preferences: {
                            theme: 'dark',
                            notifications: true
                        }
                    }
                },
                metadata: {
                    timestamp: new Date().toISOString(),
                    version: '1.0.0'
                }
            };

            const result = createApiResponse({ data: complexData });

            expect(result.status).toBe(200);
            expect(result.headers.get('Content-Type')).toBe('application/json');
        });
    });

    describe('Custom Headers', () => {
        it('should merge custom headers with default headers', () => {
            const testData = { message: 'Hello' };
            const customHeaders = {
                'X-Custom-Header': 'CustomValue',
                'X-Request-ID': '12345'
            };

            const result = createApiResponse({ data: testData, headers: customHeaders });

            expect(result.headers.get('Content-Type')).toBe('application/json');
            expect(result.headers.get('Cache-Control')).toBe('no-cache, no-store, must-revalidate');
            expect(result.headers.get('X-Custom-Header')).toBe('CustomValue');
            expect(result.headers.get('X-Request-ID')).toBe('12345');
        });

        it('should allow overriding default headers with custom headers', () => {
            const testData = { message: 'Hello' };
            const customHeaders = {
                'Cache-Control': 'public, max-age=3600'
            };

            const result = createApiResponse({ data: testData, headers: customHeaders });

            expect(result.headers.get('Content-Type')).toBe('application/json');
            expect(result.headers.get('Cache-Control')).toBe('public, max-age=3600');
        });

        it('should handle security headers', () => {
            const testData = { message: 'Secure Response' };
            const securityHeaders = {
                'X-Frame-Options': 'DENY',
                'X-Content-Type-Options': 'nosniff',
                'Strict-Transport-Security': 'max-age=63072000'
            };

            const result = createApiResponse({ data: testData, headers: securityHeaders });

            expect(result.headers.get('X-Frame-Options')).toBe('DENY');
            expect(result.headers.get('X-Content-Type-Options')).toBe('nosniff');
            expect(result.headers.get('Strict-Transport-Security')).toBe('max-age=63072000');
        });

        it('should handle CORS headers', () => {
            const testData = { message: 'CORS Response' };
            const corsHeaders = {
                'Access-Control-Allow-Origin': 'https://example.com',
                'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE',
                'Access-Control-Allow-Headers': 'Content-Type, Authorization'
            };

            const result = createApiResponse({ data: testData, headers: corsHeaders });

            expect(result.headers.get('Access-Control-Allow-Origin')).toBe('https://example.com');
            expect(result.headers.get('Access-Control-Allow-Methods')).toBe('GET, POST, PUT, DELETE');
            expect(result.headers.get('Access-Control-Allow-Headers')).toBe('Content-Type, Authorization');
        });

        it('should handle empty custom headers object', () => {
            const testData = { message: 'Hello' };

            const result = createApiResponse({ data: testData, headers: {} });

            expect(result.headers.get('Content-Type')).toBe('application/json');
            expect(result.headers.get('Cache-Control')).toBe('no-cache, no-store, must-revalidate');
        });
    });

    describe('Type Safety - Generic Types', () => {
        it('should handle string data type', () => {
            const stringData = 'Plain string response';

            const result = createApiResponse({ data: stringData });

            expect(result.status).toBe(200);
        });

        it('should handle number data type', () => {
            const numberData = 12345;

            const result = createApiResponse({ data: numberData });

            expect(result.status).toBe(200);
        });

        it('should handle boolean data type', () => {
            const booleanData = true;

            const result = createApiResponse({ data: booleanData });

            expect(result.status).toBe(200);
        });

        it('should handle array data type', () => {
            const arrayData = [1, 2, 3, 4, 5];

            const result = createApiResponse({ data: arrayData });

            expect(result.status).toBe(200);
        });

        it('should handle object array data type', () => {
            const objectArrayData = [
                { id: 1, name: 'Item 1' },
                { id: 2, name: 'Item 2' }
            ];

            const result = createApiResponse({ data: objectArrayData });

            expect(result.status).toBe(200);
        });

        it('should handle typed interface data', () => {
            interface User {
                id: number;
                name: string;
                email: string;
            }

            const userData: User = {
                id: 1,
                name: 'John Doe',
                email: 'john@example.com'
            };

            const result = createApiResponse<User>({ data: userData });

            expect(result.status).toBe(200);
        });
    });

    describe('Edge Cases and Boundary Conditions', () => {
        it('should handle empty object', () => {
            const emptyData = {};

            const result = createApiResponse({ data: emptyData });

            expect(result.status).toBe(200);
            expect(result.headers.get('Content-Type')).toBe('application/json');
        });

        it('should handle empty array', () => {
            const emptyData: unknown[] = [];

            const result = createApiResponse({ data: emptyData });

            expect(result.status).toBe(200);
        });

        it('should handle empty string', () => {
            const emptyData = '';

            const result = createApiResponse({ data: emptyData });

            expect(result.status).toBe(200);
        });

        it('should handle null data', () => {
            const nullData = null;

            const result = createApiResponse({ data: nullData });

            expect(result.status).toBe(200);
        });

        it('should handle undefined data', () => {
            const undefinedData = undefined;

            const result = createApiResponse({ data: undefinedData });

            expect(result.status).toBe(200);
        });

        it('should handle zero value', () => {
            const zeroData = 0;

            const result = createApiResponse({ data: zeroData });

            expect(result.status).toBe(200);
        });

        it('should handle false boolean value', () => {
            const falseData = false;

            const result = createApiResponse({ data: falseData });

            expect(result.status).toBe(200);
        });

        it('should handle very large object', () => {
            const largeData = {};
            for (let i = 0; i < 1000; i++) {
                largeData[`key${i}`] = `value${i}`;
            }

            const result = createApiResponse({ data: largeData });

            expect(result.status).toBe(200);
        });

        it('should handle special characters in data', () => {
            const specialData = {
                message: 'Hello 世界 🌍',
                symbols: '<>&"\'',
                unicode: '\u{1F600} \u{1F604}'
            };

            const result = createApiResponse({ data: specialData });

            expect(result.status).toBe(200);
        });

        it('should handle Date object in data', () => {
            const dateData = {
                timestamp: new Date('2026-01-14T12:00:00Z'),
                isoString: new Date().toISOString()
            };

            const result = createApiResponse({ data: dateData });

            expect(result.status).toBe(200);
        });
    });

    describe('Error Handling and HTTP Status Codes', () => {
        it('should create 400 Bad Request response', () => {
            const errorData = {
                error: 'Bad Request',
                message: 'Invalid input parameters'
            };

            const result = createApiResponse({ data: errorData, status: 400 });

            expect(result.status).toBe(400);
        });

        it('should create 401 Unauthorized response', () => {
            const errorData = {
                error: 'Unauthorized',
                message: 'Authentication required'
            };

            const result = createApiResponse({ data: errorData, status: 401 });

            expect(result.status).toBe(401);
        });

        it('should create 403 Forbidden response', () => {
            const errorData = {
                error: 'Forbidden',
                message: 'Insufficient permissions'
            };

            const result = createApiResponse({ data: errorData, status: 403 });

            expect(result.status).toBe(403);
        });

        it('should create 500 Internal Server Error response', () => {
            const errorData = {
                error: 'Internal Server Error',
                message: 'An unexpected error occurred'
            };

            const result = createApiResponse({ data: errorData, status: 500 });

            expect(result.status).toBe(500);
        });

        it('should create 502 Bad Gateway response', () => {
            const errorData = {
                error: 'Bad Gateway',
                message: 'Upstream service unavailable'
            };

            const result = createApiResponse({ data: errorData, status: 502 });

            expect(result.status).toBe(502);
        });

        it('should create 504 Gateway Timeout response', () => {
            const errorData = {
                error: 'Gateway Timeout',
                message: 'Upstream service timed out'
            };

            const result = createApiResponse({ data: errorData, status: 504 });

            expect(result.status).toBe(504);
        });
    });

    describe('API Response Structure Consistency', () => {
        it('should always return response with correct structure', () => {
            const testData = { message: 'Test' };

            const result = createApiResponse({ data: testData });

            expect(result).toHaveProperty('status');
            expect(result).toHaveProperty('headers');
            expect(result).toHaveProperty('data');
        });

        it('should maintain consistent response structure across multiple calls', () => {
            const firstResponse = createApiResponse({ data: { id: 1 } });
            const secondResponse = createApiResponse({ data: { id: 2 } });
            const thirdResponse = createApiResponse({ data: { id: 3 } });

            expect(firstResponse.headers.get('Content-Type')).toBe('application/json');
            expect(secondResponse.headers.get('Content-Type')).toBe('application/json');
            expect(thirdResponse.headers.get('Content-Type')).toBe('application/json');

            expect(firstResponse.headers.get('Cache-Control')).toBe('no-cache, no-store, must-revalidate');
            expect(secondResponse.headers.get('Cache-Control')).toBe('no-cache, no-store, must-revalidate');
            expect(thirdResponse.headers.get('Cache-Control')).toBe('no-cache, no-store, must-revalidate');
        });

        it('should allow multiple custom headers without losing defaults', () => {
            const testData = { message: 'Test' };
            const customHeaders = {
                'X-Header-1': 'Value1',
                'X-Header-2': 'Value2',
                'X-Header-3': 'Value3',
                'X-Header-4': 'Value4',
                'X-Header-5': 'Value5'
            };

            const result = createApiResponse({ data: testData, headers: customHeaders });

            expect(result.headers.get('Content-Type')).toBe('application/json');
            expect(result.headers.get('Cache-Control')).toBe('no-cache, no-store, must-revalidate');
            expect(result.headers.get('X-Header-1')).toBe('Value1');
            expect(result.headers.get('X-Header-2')).toBe('Value2');
            expect(result.headers.get('X-Header-3')).toBe('Value3');
            expect(result.headers.get('X-Header-4')).toBe('Value4');
            expect(result.headers.get('X-Header-5')).toBe('Value5');
        });
    });

    describe('Real-World API Response Scenarios', () => {
        it('should handle health check response format', () => {
            const healthData = {
                status: 'healthy',
                timestamp: '2026-01-14T12:00:00Z',
                services: [
                    { name: 'EmailService', healthy: true },
                    { name: 'AuthService', healthy: true }
                ],
                summary: {
                    totalServices: 2,
                    healthyServices: 2,
                    unhealthyServices: 0
                }
            };

            const result = createApiResponse({ data: healthData, status: 200 });

            expect(result.status).toBe(200);
            expect(result.headers.get('Content-Type')).toBe('application/json');
        });

        it('should handle metrics aggregation response format', () => {
            const metricsData = {
                timestamp: '2026-01-14T12:00:00Z',
                summary: {
                    totalCalls: 100,
                    totalSuccesses: 95,
                    totalFailures: 5
                },
                services: [
                    { name: 'EmailService', successRate: 0.95 },
                    { name: 'AuthService', successRate: 0.98 }
                ]
            };

            const result = createApiResponse({ data: metricsData, status: 200 });

            expect(result.status).toBe(200);
        });

        it('should handle service status response format', () => {
            const statusData = {
                serviceName: 'EmailService',
                state: 'closed',
                failureCount: 0,
                lastFailureTime: null,
                metrics: {
                    totalCalls: 50,
                    successCalls: 48,
                    failureCalls: 2
                }
            };

            const result = createApiResponse({ data: statusData, status: 200 });

            expect(result.status).toBe(200);
        });

        it('should handle error response with custom headers', () => {
            const errorData = {
                error: 'Rate Limit Exceeded',
                message: 'Too many requests',
                retryAfter: 60
            };
            const customHeaders = {
                'Retry-After': '60',
                'X-RateLimit-Limit': '100',
                'X-RateLimit-Remaining': '0'
            };

            const result = createApiResponse({
                data: errorData,
                status: 429,
                headers: customHeaders
            });

            expect(result.status).toBe(429);
            expect(result.headers.get('Retry-After')).toBe('60');
            expect(result.headers.get('X-RateLimit-Limit')).toBe('100');
            expect(result.headers.get('X-RateLimit-Remaining')).toBe('0');
        });

        it('should handle pagination response format', () => {
            const paginatedData = {
                data: [
                    { id: 1, name: 'Item 1' },
                    { id: 2, name: 'Item 2' },
                    { id: 3, name: 'Item 3' }
                ],
                pagination: {
                    page: 1,
                    limit: 10,
                    total: 100,
                    totalPages: 10
                }
            };

            const result = createApiResponse({ data: paginatedData, status: 200 });

            expect(result.status).toBe(200);
        });
    });

    describe('Configurable Interface Parameters', () => {
        it('should handle ApiResponseConfig interface correctly', () => {
            const config = {
                data: { message: 'Test' },
                status: 200,
                headers: { 'X-Custom': 'Value' }
            };

            const result = createApiResponse(config);

            expect(result.status).toBe(200);
            expect(result.headers.get('X-Custom')).toBe('Value');
        });

        it('should handle optional status parameter', () => {
            const config = {
                data: { message: 'Test' }
            };

            const result = createApiResponse(config);

            expect(result.status).toBe(200);
        });

        it('should handle optional headers parameter', () => {
            const config = {
                data: { message: 'Test' },
                status: 201
            };

            const result = createApiResponse(config);

            expect(result.status).toBe(201);
            expect(result.headers.get('Content-Type')).toBe('application/json');
        });

        it('should handle all parameters provided', () => {
            const config = {
                data: { message: 'Test' },
                status: 202,
                headers: { 'X-Accepted': 'true' }
            };

            const result = createApiResponse(config);

            expect(result.status).toBe(202);
            expect(result.headers.get('X-Accepted')).toBe('true');
        });
    });
});
