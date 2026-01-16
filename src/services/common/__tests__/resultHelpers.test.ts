import { createRateLimitErrorResult } from '../resultHelpers';
import { RateLimitExceededError } from '../resilience';
import { ServiceErrorCode } from '../types';

describe('createRateLimitErrorResult', () => {
    describe('Happy Path', () => {
        it('creates rate limit error with Too many attempts message', () => {
            const now = Date.now();
            const resetTime = now + 60000;

            const rateLimitError = new RateLimitExceededError('Too many attempts');
            rateLimitError.limitCheck = {
                allowed: false,
                error: 'Too many attempts',
                resetTime
            };

            const result = createRateLimitErrorResult(rateLimitError, 1000);

            expect(result.success).toBe(false);
            expect(result.error).toContain('Terlalu banyak percobaan');
            expect(result.error).toContain('60 detik');
            expect(result.errorCode).toBe(ServiceErrorCode.RATE_LIMIT);
            expect(result.metadata).toEqual({
                rateLimited: true
            });
        });

        it('creates rate limit error with generic message', () => {
            const now = Date.now();
            const resetTime = now + 60000;

            const rateLimitError = new RateLimitExceededError('Rate limit exceeded');
            rateLimitError.limitCheck = {
                allowed: false,
                error: 'Rate limit exceeded',
                resetTime
            };

            const result = createRateLimitErrorResult(rateLimitError, 1000);

            expect(result.success).toBe(false);
            expect(result.error).toBe('Terlalu banyak percobaan. Silakan coba lagi nanti.');
            expect(result.errorCode).toBe(ServiceErrorCode.RATE_LIMIT);
            expect(result.metadata).toEqual({
                rateLimited: true
            });
        });

        it('calculates seconds remaining correctly', () => {
            const now = Date.now();
            const resetTime = now + 30000;

            const rateLimitError = new RateLimitExceededError('Too many attempts');
            rateLimitError.limitCheck = {
                allowed: false,
                error: 'Too many attempts',
                resetTime
            };

            const result = createRateLimitErrorResult(rateLimitError, 1000);

            expect(result.error).toContain('30 detik');
        });
    });

    describe('Edge Cases', () => {
        it('handles rate limit error without limitCheck', () => {
            const rateLimitError = new RateLimitExceededError('Too many attempts');

            const result = createRateLimitErrorResult(rateLimitError, 1000);

            expect(result.success).toBe(false);
            expect(result.error).toBe('Terlalu banyak percobaan. Silakan coba lagi nanti.');
            expect(result.errorCode).toBe(ServiceErrorCode.RATE_LIMIT);
            expect(result.metadata).toBeUndefined();
        });

        it('handles null limitCheck', () => {
            const rateLimitError = new RateLimitExceededError('Too many attempts');
            (rateLimitError as { limitCheck?: unknown }).limitCheck = undefined;

            const result = createRateLimitErrorResult(rateLimitError, 1000);

            expect(result.success).toBe(false);
            expect(result.error).toBe('Terlalu banyak percobaan. Silakan coba lagi nanti.');
            expect(result.errorCode).toBe(ServiceErrorCode.RATE_LIMIT);
            expect(result.metadata).toBeUndefined();
        });

        it('handles undefined limitCheck', () => {
            const rateLimitError = new RateLimitExceededError('Too many attempts');
            rateLimitError.limitCheck = undefined;

            const result = createRateLimitErrorResult(rateLimitError, 1000);

            expect(result.success).toBe(false);
            expect(result.error).toBe('Terlalu banyak percobaan. Silakan coba lagi nanti.');
            expect(result.errorCode).toBe(ServiceErrorCode.RATE_LIMIT);
            expect(result.metadata).toBeUndefined();
        });

        it('handles limitCheck with undefined resetTime', () => {
            const rateLimitError = new RateLimitExceededError('Too many attempts');
            rateLimitError.limitCheck = {
                allowed: false,
                error: 'Too many attempts',
                resetTime: undefined
            };

            const result = createRateLimitErrorResult(rateLimitError, 1000);

            expect(result.success).toBe(false);
            expect(result.error).toContain('0 detik');
            expect(result.errorCode).toBe(ServiceErrorCode.RATE_LIMIT);
            expect(result.metadata).toEqual({
                rateLimited: true
            });
        });

        it('handles zero seconds remaining', () => {
            const now = Date.now();
            const resetTime = now;

            const rateLimitError = new RateLimitExceededError('Too many attempts');
            rateLimitError.limitCheck = {
                allowed: false,
                error: 'Too many attempts',
                resetTime
            };

            const result = createRateLimitErrorResult(rateLimitError, 1000);

            expect(result.success).toBe(false);
            expect(result.error).toContain('0 detik');
            expect(result.errorCode).toBe(ServiceErrorCode.RATE_LIMIT);
        });

        it('handles negative seconds remaining (past reset time)', () => {
            const now = Date.now();
            const resetTime = now - 5000;

            const rateLimitError = new RateLimitExceededError('Too many attempts');
            rateLimitError.limitCheck = {
                allowed: false,
                error: 'Too many attempts',
                resetTime
            };

            const result = createRateLimitErrorResult(rateLimitError, 1000);

            expect(result.success).toBe(false);
            expect(result.error).toContain('-5 detik');
            expect(result.errorCode).toBe(ServiceErrorCode.RATE_LIMIT);
        });

        it('handles large seconds remaining', () => {
            const now = Date.now();
            const resetTime = now + 3600000;

            const rateLimitError = new RateLimitExceededError('Too many attempts');
            rateLimitError.limitCheck = {
                allowed: false,
                error: 'Too many attempts',
                resetTime
            };

            const result = createRateLimitErrorResult(rateLimitError, 1000);

            expect(result.success).toBe(false);
            expect(result.error).toContain('3600 detik');
            expect(result.errorCode).toBe(ServiceErrorCode.RATE_LIMIT);
        });

        it('handles different error message pattern', () => {
            const now = Date.now();
            const resetTime = now + 60000;

            const rateLimitError = new RateLimitExceededError('Exceeded rate limit');
            rateLimitError.limitCheck = {
                allowed: false,
                error: 'Exceeded rate limit',
                resetTime
            };

            const result = createRateLimitErrorResult(rateLimitError, 1000);

            expect(result.success).toBe(false);
            expect(result.error).toBe('Terlalu banyak percobaan. Silakan coba lagi nanti.');
            expect(result.errorCode).toBe(ServiceErrorCode.RATE_LIMIT);
        });

        it('handles empty error message', () => {
            const now = Date.now();
            const resetTime = now + 60000;

            const rateLimitError = new RateLimitExceededError('');
            rateLimitError.limitCheck = {
                allowed: false,
                error: '',
                resetTime
            };

            const result = createRateLimitErrorResult(rateLimitError, 1000);

            expect(result.success).toBe(false);
            expect(result.error).toBe('Terlalu banyak percobaan. Silakan coba lagi nanti.');
            expect(result.errorCode).toBe(ServiceErrorCode.RATE_LIMIT);
        });
    });

    describe('Boundary Conditions', () => {
        it('handles 1 second remaining', () => {
            const now = Date.now();
            const resetTime = now + 1000;

            const rateLimitError = new RateLimitExceededError('Too many attempts');
            rateLimitError.limitCheck = {
                allowed: false,
                error: 'Too many attempts',
                resetTime
            };

            const result = createRateLimitErrorResult(rateLimitError, 1000);

            expect(result.success).toBe(false);
            expect(result.error).toContain('1 detik');
            expect(result.errorCode).toBe(ServiceErrorCode.RATE_LIMIT);
        });

        it('handles fractional seconds (ceiling)', () => {
            const now = Date.now();
            const resetTime = now + 1500;

            const rateLimitError = new RateLimitExceededError('Too many attempts');
            rateLimitError.limitCheck = {
                allowed: false,
                error: 'Too many attempts',
                resetTime
            };

            const result = createRateLimitErrorResult(rateLimitError, 1000);

            expect(result.success).toBe(false);
            expect(result.error).toContain('2 detik');
            expect(result.errorCode).toBe(ServiceErrorCode.RATE_LIMIT);
        });

        it('handles very large msToSeconds value', () => {
            const now = Date.now();
            const resetTime = now + 60000;

            const rateLimitError = new RateLimitExceededError('Too many attempts');
            rateLimitError.limitCheck = {
                allowed: false,
                error: 'Too many attempts',
                resetTime
            };

            const result = createRateLimitErrorResult(rateLimitError, 1000000);

            expect(result.success).toBe(false);
            expect(result.error).toContain('1 detik');
            expect(result.errorCode).toBe(ServiceErrorCode.RATE_LIMIT);
        });

        it('handles msToSeconds of 1', () => {
            const mockNow = 1700000000000;
            jest.spyOn(Date, 'now').mockReturnValue(mockNow);
            const resetTime = mockNow + 60000;

            const rateLimitError = new RateLimitExceededError('Too many attempts');
            rateLimitError.limitCheck = {
                allowed: false,
                error: 'Too many attempts',
                resetTime
            };

            const result = createRateLimitErrorResult(rateLimitError, 1);

            expect(result.success).toBe(false);
            expect(result.error).toContain('60000 detik');
            expect(result.errorCode).toBe(ServiceErrorCode.RATE_LIMIT);
            jest.restoreAllMocks();
        });
    });

    describe('Type Safety', () => {
        it('returns ServiceResult<void> type', () => {
            const rateLimitError = new RateLimitExceededError('Too many attempts');

            const result = createRateLimitErrorResult(rateLimitError, 1000);

            expect(result).toHaveProperty('success');
            expect(result).toHaveProperty('error');
            expect(result).toHaveProperty('errorCode');
            expect(result.data).toBeUndefined();
        });

        it('correctly sets error code to RATE_LIMIT', () => {
            const rateLimitError = new RateLimitExceededError('Too many attempts');

            const result = createRateLimitErrorResult(rateLimitError, 1000);

            expect(result.errorCode).toBe(ServiceErrorCode.RATE_LIMIT);
        });

        it('sets rateLimited flag in metadata when limitCheck is present', () => {
            const now = Date.now();
            const resetTime = now + 60000;

            const rateLimitError = new RateLimitExceededError('Too many attempts');
            rateLimitError.limitCheck = {
                allowed: false,
                error: 'Too many attempts',
                resetTime
            };

            const result = createRateLimitErrorResult(rateLimitError, 1000);

            expect(result.metadata).toEqual({
                rateLimited: true
            });
        });

        it('does not set metadata when limitCheck is missing', () => {
            const rateLimitError = new RateLimitExceededError('Too many attempts');

            const result = createRateLimitErrorResult(rateLimitError, 1000);

            expect(result.metadata).toBeUndefined();
        });
    });

    describe('Integration Behavior', () => {
        it('preserves error type structure', () => {
            const now = Date.now();
            const resetTime = now + 60000;

            const rateLimitError = new RateLimitExceededError('Too many attempts');
            rateLimitError.limitCheck = {
                allowed: false,
                error: 'Too many attempts',
                resetTime
            };

            const result = createRateLimitErrorResult(rateLimitError, 1000);

            expect(typeof result.success).toBe('boolean');
            expect(typeof result.error).toBe('string');
            expect(typeof result.errorCode).toBe('string');
            expect(typeof result.metadata).toBe('object');
        });

        it('ensures result is not successful', () => {
            const rateLimitError = new RateLimitExceededError('Too many attempts');

            const result = createRateLimitErrorResult(rateLimitError, 1000);

            expect(result.success).toBe(false);
        });

        it('sets rateLimited metadata when limitCheck exists', () => {
            const now = Date.now();
            const resetTime = now + 60000;

            const rateLimitError = new RateLimitExceededError('Too many attempts');
            rateLimitError.limitCheck = {
                allowed: false,
                error: 'Too many attempts',
                resetTime
            };

            const result = createRateLimitErrorResult(rateLimitError, 1000);

            expect(result.metadata).toHaveProperty('rateLimited', true);
        });
    });

    describe('Case Sensitivity', () => {
        it('matches "Too many attempts" case-sensitive', () => {
            const now = Date.now();
            const resetTime = now + 60000;

            const rateLimitError = new RateLimitExceededError('Too many attempts');
            rateLimitError.limitCheck = {
                allowed: false,
                error: 'Too many attempts',
                resetTime
            };

            const result = createRateLimitErrorResult(rateLimitError, 1000);

            expect(result.error).toContain('60 detik');
        });

        it('does not match "too many attempts" (lowercase)', () => {
            const now = Date.now();
            const resetTime = now + 60000;

            const rateLimitError = new RateLimitExceededError('too many attempts');
            rateLimitError.limitCheck = {
                allowed: false,
                error: 'too many attempts',
                resetTime
            };

            const result = createRateLimitErrorResult(rateLimitError, 1000);

            expect(result.error).toBe('Terlalu banyak percobaan. Silakan coba lagi nanti.');
        });

        it('does not match "TOO MANY ATTEMPTS" (uppercase)', () => {
            const now = Date.now();
            const resetTime = now + 60000;

            const rateLimitError = new RateLimitExceededError('TOO MANY ATTEMPTS');
            rateLimitError.limitCheck = {
                allowed: false,
                error: 'TOO MANY ATTEMPTS',
                resetTime
            };

            const result = createRateLimitErrorResult(rateLimitError, 1000);

            expect(result.error).toBe('Terlalu banyak percobaan. Silakan coba lagi nanti.');
        });
    });
});
