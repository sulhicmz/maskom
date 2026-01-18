jest.mock('@/utils/metrics');

jest.mock('next/server', () => {
    const mockJson = jest.fn((data: unknown, options?: { status?: number; headers?: Record<string, string> }) => ({
        status: options?.status || 200,
        headers: new Map(Object.entries(options?.headers || {})),
        data,
        json: () => data
    }));
    return {
        NextResponse: {
            json: mockJson
        }
    };
});

const NextResponse = jest.requireMock('next/server').NextResponse;

import { executeApiRoute, getCircuitBreakerState, resetCircuitBreaker, resetAllCircuitBreakers } from '../apiRouteHandler';
import metricsCollector from '@/utils/metrics';

describe('apiRouteHandler', () => {
    beforeEach(() => {
        jest.clearAllMocks();
        resetAllCircuitBreakers();
    });

    afterEach(() => {
        jest.clearAllMocks();
    });

    describe('executeApiRoute - Happy Path', () => {
        it('should return successful response when handler succeeds', async () => {
            const mockResponse = NextResponse.json(
                { success: true, message: 'Success', data: { result: 'success' } },
                { status: 200 }
            );
            const mockHandler = jest.fn().mockResolvedValue(mockResponse);

            const result = await executeApiRoute({
                operationName: 'TestService.success',
                handler: mockHandler
            });

            expect(mockHandler).toHaveBeenCalledTimes(1);
            expect(result).toEqual(mockResponse);
            expect(metricsCollector.recordCall).toHaveBeenCalledWith(
                'TestService.success',
                true,
                undefined,
                expect.any(Number)
            );
        });

        it('should record metrics on successful execution', async () => {
            const mockResponse = NextResponse.json(
                { success: true, message: 'Success', data: { result: 'success' } },
                { status: 200 }
            );
            const mockHandler = jest.fn().mockResolvedValue(mockResponse);

            await executeApiRoute({
                operationName: 'TestService.metrics',
                handler: mockHandler
            });

            expect(metricsCollector.recordCall).toHaveBeenCalledWith(
                'TestService.metrics',
                true,
                undefined,
                expect.any(Number)
            );
            expect(metricsCollector.recordCall).toHaveBeenCalledTimes(1);
        });

        it('should use custom circuit breaker config when provided', async () => {
            const mockResponse = NextResponse.json(
                { success: true, message: 'Success', data: { result: 'success' } },
                { status: 200 }
            );
            const mockHandler = jest.fn().mockResolvedValue(mockResponse);
            const customConfig = {
                failureThreshold: 5,
                resetTimeoutMs: 60000,
                monitoringPeriodMs: 120000
            };

            await executeApiRoute({
                operationName: 'TestService.customConfig',
                handler: mockHandler,
                circuitBreakerConfig: customConfig
            });

            const state = getCircuitBreakerState('TestService');
            expect(state).not.toBeNull();
            expect(state?.failureCount).toBe(0);
            expect(state?.isOpen).toBe(false);
        });

        it('should use default config when circuit breaker config not provided', async () => {
            const mockResponse = NextResponse.json(
                { success: true, message: 'Success', data: { result: 'success' } },
                { status: 200 }
            );
            const mockHandler = jest.fn().mockResolvedValue(mockResponse);

            await executeApiRoute({
                operationName: 'TestService.defaultConfig',
                handler: mockHandler
            });

            const state = getCircuitBreakerState('TestService');
            expect(state).not.toBeNull();
            expect(state?.isOpen).toBe(false);
        });

        it('should use default retry options when not provided', async () => {
            const mockResponse = NextResponse.json(
                { success: true, message: 'Success', data: { result: 'success' } },
                { status: 200 }
            );
            const mockHandler = jest.fn().mockResolvedValue(mockResponse);

            await executeApiRoute({
                operationName: 'TestService.defaultRetry',
                handler: mockHandler
            });

            expect(mockHandler).toHaveBeenCalledTimes(1);
        });

        it('should handle handlers that return NextResponse with data', async () => {
            const mockResponse = NextResponse.json(
                { success: true, message: 'Data retrieved', data: { items: [1, 2, 3] } },
                { status: 200 }
            );
            const mockHandler = jest.fn().mockResolvedValue(mockResponse);

            const result = await executeApiRoute({
                operationName: 'TestService.data',
                handler: mockHandler
            });

            expect(result).toEqual(mockResponse);
        });
    });

    describe('executeApiRoute - Circuit Breaker Errors', () => {
        it('should return 503 error when circuit breaker is open', async () => {
            const mockHandler = jest.fn().mockRejectedValue(new Error('circuit breaker is open'));

            await executeApiRoute({
                operationName: 'TestService.circuitBreaker',
                handler: mockHandler
            });

            expect(metricsCollector.recordCall).toHaveBeenCalledWith(
                'TestService.circuitBreaker',
                false,
                'circuit_breaker',
                expect.any(Number)
            );
        });

        it('should record circuit breaker state when checking state', async () => {
            const mockResponse = NextResponse.json(
                { success: true, message: 'Success', data: { result: 'success' } },
                { status: 200 }
            );
            const mockHandler = jest.fn().mockResolvedValue(mockResponse);

            await executeApiRoute({
                operationName: 'TestService.circuitCheck',
                handler: mockHandler
            });

            getCircuitBreakerState('TestService');

            expect(metricsCollector.recordCircuitBreakerState).toHaveBeenCalledWith(
                'TestService',
                false
            );
        });

        it('should return null when checking state of non-existent circuit breaker', () => {
            const state = getCircuitBreakerState('NonExistentService');
            expect(state).toBeNull();
        });
    });

    describe('executeApiRoute - Timeout Errors', () => {
        it('should return 504 error on timeout', async () => {
            const mockHandler = jest.fn().mockRejectedValue(new Error('Request timed out'));

            await executeApiRoute({
                operationName: 'TestService.timeout',
                handler: mockHandler
            });

            expect(metricsCollector.recordCall).toHaveBeenCalledWith(
                'TestService.timeout',
                false,
                'timeout',
                expect.any(Number)
            );
        });

        it('should detect timeout errors with "timed out" message', async () => {
            const mockHandler = jest.fn().mockRejectedValue(new Error('Operation timed out after 30s'));

            await executeApiRoute({
                operationName: 'TestService.timeout2',
                handler: mockHandler
            });

            expect(metricsCollector.recordCall).toHaveBeenCalledWith(
                'TestService.timeout2',
                false,
                'timeout',
                expect.any(Number)
            );
        });
    });

    describe('executeApiRoute - Network Errors', () => {
        it('should return 503 error on network error', async () => {
            const mockHandler = jest.fn().mockRejectedValue(new Error('Network error'));

            await executeApiRoute({
                operationName: 'TestService.network',
                handler: mockHandler
            });

            expect(metricsCollector.recordCall).toHaveBeenCalledWith(
                'TestService.network',
                false,
                'network',
                expect.any(Number)
            );
        });

        it('should detect ECONN errors', async () => {
            const mockHandler = jest.fn().mockRejectedValue(new Error('ECONNREFUSED'));

            await executeApiRoute({
                operationName: 'TestService.econn',
                handler: mockHandler
            });

            expect(metricsCollector.recordCall).toHaveBeenCalledWith(
                'TestService.econn',
                false,
                'network',
                expect.any(Number)
            );
        });

        it('should detect 503 errors', async () => {
            const mockHandler = jest.fn().mockRejectedValue(new Error('Service returned 503'));

            await executeApiRoute({
                operationName: 'TestService.status503',
                handler: mockHandler
            });

            expect(metricsCollector.recordCall).toHaveBeenCalledWith(
                'TestService.status503',
                false,
                'network',
                expect.any(Number)
            );
        });
    });

    describe('executeApiRoute - Unknown Errors', () => {
        it('should return 500 error for unknown errors', async () => {
            const mockHandler = jest.fn().mockRejectedValue(new Error('Unknown error occurred'));

            await executeApiRoute({
                operationName: 'TestService.unknown',
                handler: mockHandler
            });

            expect(metricsCollector.recordCall).toHaveBeenCalledWith(
                'TestService.unknown',
                false,
                'unknown',
                expect.any(Number)
            );
        });

        it('should handle non-Error objects', async () => {
            const mockHandler = jest.fn().mockRejectedValue('String error');

            await executeApiRoute({
                operationName: 'TestService.stringError',
                handler: mockHandler
            });

            expect(metricsCollector.recordCall).toHaveBeenCalledWith(
                'TestService.stringError',
                false,
                'unknown',
                expect.any(Number)
            );
        });

        it('should use error message when available', async () => {
            const mockHandler = jest.fn().mockRejectedValue(new Error('Custom error message'));

            await executeApiRoute({
                operationName: 'TestService.customError',
                handler: mockHandler
            });

            expect(metricsCollector.recordCall).toHaveBeenCalledWith(
                'TestService.customError',
                false,
                'unknown',
                expect.any(Number)
            );
        });

        it('should handle errors with no message', async () => {
            const mockHandler = jest.fn().mockRejectedValue(new Error());
            
            await executeApiRoute({
                operationName: 'TestService.noMessage',
                handler: mockHandler
            });

            expect(metricsCollector.recordCall).toHaveBeenCalledWith(
                'TestService.noMessage',
                false,
                'unknown',
                expect.any(Number)
            );
        });
    });

    describe('getCircuitBreakerState', () => {
        it('should return circuit breaker state for existing route', async () => {
            const mockResponse = NextResponse.json(
                { success: true, message: 'Success', data: { result: 'success' } },
                { status: 200 }
            );
            const mockHandler = jest.fn().mockResolvedValue(mockResponse);

            await executeApiRoute({
                operationName: 'TestService.getState',
                handler: mockHandler
            });

            const state = getCircuitBreakerState('TestService');
            expect(state).not.toBeNull();
            expect(state).toHaveProperty('isOpen');
            expect(state).toHaveProperty('failureCount');
            expect(state).toHaveProperty('lastFailureTime');
            expect(state).toHaveProperty('lastSuccessTime');
        });

        it('should return null for non-existent route', () => {
            const state = getCircuitBreakerState('NonExistentRoute');
            expect(state).toBeNull();
        });

        it('should record circuit breaker state when called', async () => {
            const mockResponse = NextResponse.json(
                { success: true, message: 'Success', data: { result: 'success' } },
                { status: 200 }
            );
            const mockHandler = jest.fn().mockResolvedValue(mockResponse);

            await executeApiRoute({
                operationName: 'TestService.recordState',
                handler: mockHandler
            });

            getCircuitBreakerState('TestService');

            expect(metricsCollector.recordCircuitBreakerState).toHaveBeenCalledWith(
                'TestService',
                expect.any(Boolean)
            );
        });

        it('should return state for routes with custom config', async () => {
            const mockResponse = NextResponse.json(
                { success: true, message: 'Success', data: { result: 'success' } },
                { status: 200 }
            );
            const mockHandler = jest.fn().mockResolvedValue(mockResponse);
            const customConfig = {
                failureThreshold: 10,
                resetTimeoutMs: 90000,
                monitoringPeriodMs: 180000
            };

            await executeApiRoute({
                operationName: 'TestService.customState',
                handler: mockHandler,
                circuitBreakerConfig: customConfig
            });

            const state = getCircuitBreakerState('TestService');
            expect(state).not.toBeNull();
            expect(state?.isOpen).toBe(false);
        });
    });

    describe('resetCircuitBreaker', () => {
        it('should reset circuit breaker for specific route', async () => {
            const mockResponse = NextResponse.json(
                { success: true, message: 'Success', data: { result: 'success' } },
                { status: 200 }
            );
            const mockHandler = jest.fn().mockResolvedValue(mockResponse);

            await executeApiRoute({
                operationName: 'TestService.reset',
                handler: mockHandler
            });

            resetCircuitBreaker('TestService');

            const state = getCircuitBreakerState('TestService');
            expect(state).not.toBeNull();
            expect(state?.isOpen).toBe(false);
        });

        it('should handle reset for non-existent route', () => {
            expect(() => {
                resetCircuitBreaker('NonExistentRoute');
            }).not.toThrow();
        });

        it('should reset circuit breaker after failures', async () => {
            const mockHandler = jest.fn()
                .mockRejectedValueOnce(new Error('Failure 1'))
                .mockRejectedValueOnce(new Error('Failure 2'))
                .mockRejectedValueOnce(new Error('Failure 3'))
                .mockResolvedValue(NextResponse.json(
                    { success: true, message: 'Success', data: { result: 'success' } },
                    { status: 200 }
                ));

            try {
                await executeApiRoute({
                    operationName: 'TestService.failureReset',
                    handler: mockHandler
                });
            } catch (e) {
                // Expected failures
            }

            resetCircuitBreaker('TestService');

            const state = getCircuitBreakerState('TestService');
            expect(state).not.toBeNull();
            expect(state?.isOpen).toBe(false);
        });
    });

    describe('resetAllCircuitBreakers', () => {
        it('should reset all circuit breakers', async () => {
            const mockResponse = NextResponse.json(
                { success: true, message: 'Success', data: { result: 'success' } },
                { status: 200 }
            );
            const mockHandler = jest.fn().mockResolvedValue(mockResponse);

            await executeApiRoute({
                operationName: 'TestService.resetAll1',
                handler: mockHandler
            });

            await executeApiRoute({
                operationName: 'TestService.resetAll2',
                handler: mockHandler
            });

            await executeApiRoute({
                operationName: 'TestService.resetAll3',
                handler: mockHandler
            });

            resetAllCircuitBreakers();

            const state1 = getCircuitBreakerState('TestService');
            expect(state1?.isOpen).toBe(false);
        });

        it('should handle reset when no circuit breakers exist', () => {
            resetAllCircuitBreakers();
            expect(() => {
                resetAllCircuitBreakers();
            }).not.toThrow();
        });

        it('should reset all circuit breakers including those with custom configs', async () => {
            const mockResponse = NextResponse.json(
                { success: true, message: 'Success', data: { result: 'success' } },
                { status: 200 }
            );
            const mockHandler = jest.fn().mockResolvedValue(mockResponse);
            const customConfig = {
                failureThreshold: 5,
                resetTimeoutMs: 60000,
                monitoringPeriodMs: 120000
            };

            await executeApiRoute({
                operationName: 'TestService.customResetAll',
                handler: mockHandler,
                circuitBreakerConfig: customConfig
            });

            resetAllCircuitBreakers();

            const state = getCircuitBreakerState('TestService');
            expect(state).not.toBeNull();
            expect(state?.isOpen).toBe(false);
        });
    });

    describe('executeApiRoute - Edge Cases', () => {
        it('should handle operationName with multiple dots', async () => {
            const mockResponse = NextResponse.json(
                { success: true, message: 'Success', data: { result: 'success' } },
                { status: 200 }
            );
            const mockHandler = jest.fn().mockResolvedValue(mockResponse);

            await executeApiRoute({
                operationName: 'Service.SubService.Operation.method',
                handler: mockHandler
            });

            const state = getCircuitBreakerState('Service');
            expect(state).not.toBeNull();
        });

        it('should handle operationName without dots', async () => {
            const mockResponse = NextResponse.json(
                { success: true, message: 'Success', data: { result: 'success' } },
                { status: 200 }
            );
            const mockHandler = jest.fn().mockResolvedValue(mockResponse);

            await executeApiRoute({
                operationName: 'SimpleOperation',
                handler: mockHandler
            });

            const state = getCircuitBreakerState('SimpleOperation');
            expect(state).not.toBeNull();
        });

        it('should track response time in metrics', async () => {
            const mockResponse = NextResponse.json(
                { success: true, message: 'Success', data: { result: 'success' } },
                { status: 200 }
            );
            const mockHandler = jest.fn().mockResolvedValue(mockResponse);

            await executeApiRoute({
                operationName: 'TestService.responseTime',
                handler: mockHandler
            });

            expect(metricsCollector.recordCall).toHaveBeenCalledWith(
                'TestService.responseTime',
                true,
                undefined,
                expect.any(Number)
            );
        });

        it('should use custom retry options when provided', async () => {
            const mockResponse = NextResponse.json(
                { success: true, message: 'Success', data: { result: 'success' } },
                { status: 200 }
            );
            const mockHandler = jest.fn().mockResolvedValue(mockResponse);

            await executeApiRoute({
                operationName: 'TestService.customRetry',
                handler: mockHandler,
                retryOptions: {
                    maxAttempts: 5,
                    baseDelayMs: 2000,
                    maxDelayMs: 20000,
                    backoffMultiplier: 3,
                    retryableErrors: [/error/i]
                }
            });

            expect(mockHandler).toHaveBeenCalledTimes(1);
        });

        it('should preserve type safety for typed responses', async () => {
            interface TestData {
                id: number;
                name: string;
            }
            const mockResponse = NextResponse.json(
                { success: true, message: 'Success', data: { id: 1, name: 'Test' } },
                { status: 200 }
            );
            const mockHandler = jest.fn().mockResolvedValue(mockResponse);

            const result = await executeApiRoute<TestData>({
                operationName: 'TestService.typeSafety',
                handler: mockHandler
            });

            expect(result).toEqual(mockResponse);
        });
    });
});
