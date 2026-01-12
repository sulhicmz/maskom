import { executeWithResilience, RateLimitExceededError } from '../resilience';
import { CircuitBreaker } from '@/utils/resilience';
import { RateLimiter } from '@/utils/rateLimiter';
import metricsCollector from '@/utils/metrics';

jest.mock('@/utils/metrics');
jest.mock('@/services/common/logger');

describe('executeWithResilience', () => {
    let mockCircuitBreaker: jest.Mocked<CircuitBreaker>;
    let mockRateLimiter: jest.Mocked<RateLimiter>;
    let mockOperationFn: jest.Mock;

    beforeEach(() => {
        mockCircuitBreaker = {
            execute: jest.fn().mockResolvedValue('test result'),
            getState: jest.fn().mockReturnValue({ isOpen: false }),
            reset: jest.fn(),
        } as unknown as jest.Mocked<CircuitBreaker>;

        mockRateLimiter = {
            check: jest.fn().mockReturnValue({ allowed: true, count: 0, firstAttempt: Date.now() }),
            recordAttempt: jest.fn(),
            getStatus: jest.fn(),
            reset: jest.fn(),
            resetAll: jest.fn(),
        } as unknown as jest.Mocked<RateLimiter>;

        mockOperationFn = jest.fn().mockResolvedValue('test result');
        jest.clearAllMocks();
    });

    describe('successful execution', () => {
        it('should execute operation successfully with all resilience layers', async () => {
            const result = await executeWithResilience<string, void>(
                {
                    operationName: 'TestService.testOperation',
                    rateLimiter: mockRateLimiter,
                    identifier: 'test@example.com',
                    circuitBreaker: mockCircuitBreaker,
                },
                mockOperationFn
            );

            expect(result).toBe('test result');
            expect(mockRateLimiter.check).toHaveBeenCalledWith('test@example.com');
            expect(mockCircuitBreaker.execute).toHaveBeenCalled();
            expect(mockOperationFn).toHaveBeenCalled();
            expect(mockRateLimiter.recordAttempt).toHaveBeenCalledWith('test@example.com');
        });

        it('should skip rate limiting when skipRateLimit is true', async () => {
            await executeWithResilience<string, void>(
                {
                    operationName: 'TestService.testOperation',
                    rateLimiter: mockRateLimiter,
                    identifier: 'test@example.com',
                    circuitBreaker: mockCircuitBreaker,
                    skipRateLimit: true,
                },
                mockOperationFn
            );

            expect(mockRateLimiter.check).not.toHaveBeenCalled();
            expect(mockRateLimiter.recordAttempt).not.toHaveBeenCalled();
        });

        it('should not record rate limit on success when recordRateLimitOnSuccess is false', async () => {
            await executeWithResilience<string, void>(
                {
                    operationName: 'TestService.testOperation',
                    rateLimiter: mockRateLimiter,
                    identifier: 'test@example.com',
                    circuitBreaker: mockCircuitBreaker,
                    recordRateLimitOnSuccess: false,
                },
                mockOperationFn
            );

            expect(mockRateLimiter.recordAttempt).not.toHaveBeenCalled();
        });

        it('should pass data parameter to operation function', async () => {
            const testData = { key: 'value' };
            const mockDataOperation = jest.fn().mockResolvedValue('success');

            await executeWithResilience<string, { key: string }>(
                {
                    operationName: 'TestService.testWithData',
                    rateLimiter: mockRateLimiter,
                    identifier: 'test@example.com',
                    circuitBreaker: mockCircuitBreaker,
                },
                mockDataOperation,
                testData
            );

            expect(mockDataOperation).toHaveBeenCalledWith(testData);
        });
    });

    describe('rate limiting', () => {
        it('should throw RateLimitExceededError when rate limit is exceeded', async () => {
            mockRateLimiter.check.mockReturnValue({
                allowed: false,
                error: 'Too many requests',
                count: 5,
                firstAttempt: Date.now() - 10000,
                resetTime: Date.now() + 60000,
            });

            await expect(
                executeWithResilience<string, void>(
                    {
                        operationName: 'TestService.testOperation',
                        rateLimiter: mockRateLimiter,
                        identifier: 'test@example.com',
                        circuitBreaker: mockCircuitBreaker,
                    },
                    mockOperationFn
                )
            ).rejects.toThrow(RateLimitExceededError);
        });

        it('should include limitCheck in RateLimitExceededError', async () => {
            const limitCheck = {
                allowed: false,
                error: 'Rate limit exceeded',
                count: 5,
                firstAttempt: Date.now() - 10000,
                resetTime: Date.now() + 60000,
            };
            mockRateLimiter.check.mockReturnValue(limitCheck);

            try {
                await executeWithResilience<string, void>(
                    {
                        operationName: 'TestService.testOperation',
                        rateLimiter: mockRateLimiter,
                        identifier: 'test@example.com',
                        circuitBreaker: mockCircuitBreaker,
                    },
                    mockOperationFn
                );
                fail('Should have thrown RateLimitExceededError');
            } catch (error) {
                expect(error).toBeInstanceOf(RateLimitExceededError);
                expect((error as RateLimitExceededError).limitCheck).toEqual(limitCheck);
            }
        });

        it('should record rate_limit error metric when rate limit exceeded', async () => {
            mockRateLimiter.check.mockReturnValue({
                allowed: false,
                error: 'Too many requests',
                count: 5,
                firstAttempt: Date.now(),
                resetTime: Date.now() + 60000,
            });

            try {
                await executeWithResilience<string, void>(
                    {
                        operationName: 'TestService.testOperation',
                        rateLimiter: mockRateLimiter,
                        identifier: 'test@example.com',
                        circuitBreaker: mockCircuitBreaker,
                    },
                mockOperationFn
            );
                fail('Should have thrown RateLimitExceededError');
            } catch {
                // Expected error
            }

            expect(metricsCollector.recordCall).toHaveBeenCalledWith('TestService.testOperation', false, 'rate_limit');
        });
    });

    describe('circuit breaker', () => {
        it('should handle circuit breaker open errors', async () => {
            mockCircuitBreaker.execute.mockRejectedValue(new Error('Circuit breaker is open'));

            await expect(
                executeWithResilience<string, void>(
                    {
                        operationName: 'TestService.testOperation',
                        rateLimiter: mockRateLimiter,
                        identifier: 'test@example.com',
                        circuitBreaker: mockCircuitBreaker,
                    },
                    mockOperationFn
                )
            ).rejects.toThrow('Circuit breaker is open');
        });

        it('should record circuit_breaker error metric when circuit breaker is open', async () => {
            mockCircuitBreaker.execute.mockRejectedValue(new Error('Circuit breaker is open'));

            try {
                await executeWithResilience<string, void>(
                    {
                        operationName: 'TestService.testOperation',
                        rateLimiter: mockRateLimiter,
                        identifier: 'test@example.com',
                        circuitBreaker: mockCircuitBreaker,
                    },
                    mockOperationFn
                );
                fail('Should have thrown error');
            } catch {
                // Expected error
            }

            expect(metricsCollector.recordCall).toHaveBeenCalledWith(
                'TestService.testOperation',
                false,
                'circuit_breaker',
                expect.any(Number)
            );
        });
    });

    describe('operation errors', () => {
        it('should propagate operation errors', async () => {
            const operationError = new Error('Operation failed');
            mockOperationFn.mockRejectedValue(operationError);

            await expect(
                executeWithResilience<string, void>(
                    {
                        operationName: 'TestService.testOperation',
                        rateLimiter: mockRateLimiter,
                        identifier: 'test@example.com',
                        circuitBreaker: mockCircuitBreaker,
                    },
                    mockOperationFn
                )
            ).rejects.toThrow('Operation failed');
        });

        it('should handle timeout errors', async () => {
            mockCircuitBreaker.execute.mockRejectedValue(new Error('testOperation timed out'));

            try {
                await executeWithResilience<string, void>(
                    {
                        operationName: 'TestService.testOperation',
                        rateLimiter: mockRateLimiter,
                        identifier: 'test@example.com',
                        circuitBreaker: mockCircuitBreaker,
                        timeoutMs: 5000,
                    },
                    mockOperationFn
                );
                fail('Should have thrown timeout error');
            } catch {
                // Expected error
            }

            expect(metricsCollector.recordCall).toHaveBeenCalledWith(
                'TestService.testOperation',
                false,
                'timeout',
                expect.any(Number)
            );
        });
    });

    describe('metrics and logging', () => {
        it('should record success metric with response time', async () => {
            await executeWithResilience<string, void>(
                {
                    operationName: 'TestService.testOperation',
                    rateLimiter: mockRateLimiter,
                    identifier: 'test@example.com',
                    circuitBreaker: mockCircuitBreaker,
                },
                mockOperationFn
            );

            expect(metricsCollector.recordCall).toHaveBeenCalledWith(
                'TestService.testOperation',
                true,
                undefined,
                expect.any(Number)
            );
        });

        it('should record failure metric with error type', async () => {
            mockOperationFn.mockRejectedValue(new Error('Operation failed'));

            try {
                await executeWithResilience<string, void>(
                    {
                        operationName: 'TestService.testOperation',
                        rateLimiter: mockRateLimiter,
                        identifier: 'test@example.com',
                        circuitBreaker: mockCircuitBreaker,
                    },
                    mockOperationFn
                );
                fail('Should have thrown error');
            } catch {
                // Expected error
            }

            expect(metricsCollector.recordCall).toHaveBeenCalledWith(
                'TestService.testOperation',
                false,
                'unknown',
                expect.any(Number)
            );
        });

        it('should record rate limit attempt on failure when recordRateLimitOnFailure is true', async () => {
            mockOperationFn.mockRejectedValue(new Error('Operation failed'));

            try {
                await executeWithResilience<string, void>(
                    {
                        operationName: 'TestService.testOperation',
                        rateLimiter: mockRateLimiter,
                        identifier: 'test@example.com',
                        circuitBreaker: mockCircuitBreaker,
                        recordRateLimitOnFailure: true,
                    },
                    mockOperationFn
                );
                fail('Should have thrown error');
            } catch {
                // Expected error
            }

            expect(mockRateLimiter.recordAttempt).toHaveBeenCalledWith('test@example.com');
        });

        it('should not record rate limit attempt on failure when recordRateLimitOnFailure is false', async () => {
            mockOperationFn.mockRejectedValue(new Error('Operation failed'));

            try {
                await executeWithResilience<string, void>(
                    {
                        operationName: 'TestService.testOperation',
                    rateLimiter: mockRateLimiter,
                    identifier: 'test@example.com',
                    circuitBreaker: mockCircuitBreaker,
                    recordRateLimitOnFailure: false,
                },
                mockOperationFn
            );
                fail('Should have thrown error');
            } catch {
                // Expected error
            }

            expect(mockRateLimiter.recordAttempt).not.toHaveBeenCalled();
        });
    });

    describe('edge cases', () => {
        it('should work without rate limiter when not provided', async () => {
            await executeWithResilience<string, void>(
                {
                    operationName: 'TestService.testOperation',
                    circuitBreaker: mockCircuitBreaker,
                    skipRateLimit: true,
                },
                mockOperationFn
            );

            expect(result).toBe('test result');
        });

        it('should work without identifier when skipRateLimit is true', async () => {
            await executeWithResilience<string, void>(
                {
                    operationName: 'TestService.testOperation',
                    rateLimiter: mockRateLimiter,
                    circuitBreaker: mockCircuitBreaker,
                    skipRateLimit: true,
                },
                mockOperationFn
            );

            expect(result).toBe('test result');
        });

        it('should handle undefined data parameter', async () => {
            await executeWithResilience<string, void>(
                {
                    operationName: 'TestService.testOperation',
                    rateLimiter: mockRateLimiter,
                    identifier: 'test@example.com',
                    circuitBreaker: mockCircuitBreaker,
                },
                mockOperationFn,
                undefined
            );

            expect(result).toBe('test result');
        });
    });

    describe('RateLimitExceededError class', () => {
        it('should create error with message', () => {
            const error = new RateLimitExceededError('Too many requests');
            expect(error.message).toBe('Too many requests');
            expect(error.name).toBe('RateLimitExceededError');
        });

        it('should allow attaching limitCheck to error', () => {
            const limitCheck = {
                allowed: false,
                error: 'Rate limit exceeded',
                count: 5,
                firstAttempt: Date.now(),
                resetTime: Date.now() + 60000,
            };
            const error = new RateLimitExceededError('Too many requests');
            error.limitCheck = limitCheck;

            expect(error.limitCheck).toEqual(limitCheck);
        });
    });
});
