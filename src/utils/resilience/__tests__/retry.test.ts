import { withRetry } from '../retry';
import type { ResilienceError } from '../types';

describe('withRetry', () => {
    it('should succeed on first attempt', async () => {
        const operation = jest.fn().mockResolvedValue('success');

        const result = await withRetry(operation, {
            maxAttempts: 3,
            baseDelayMs: 100,
            maxDelayMs: 1000,
            backoffMultiplier: 2
        });

        expect(result.success).toBe(true);
        expect(result.data).toBe('success');
        expect(result.attemptCount).toBe(1);
        expect(operation).toHaveBeenCalledTimes(1);
    });

    it('should retry on failure and eventually succeed', async () => {
        const operation = jest.fn()
            .mockRejectedValueOnce(new Error('Temporary error'))
            .mockRejectedValueOnce(new Error('Another error'))
            .mockResolvedValue('success');

        const result = await withRetry(operation, {
            maxAttempts: 3,
            baseDelayMs: 10,
            maxDelayMs: 100,
            backoffMultiplier: 2
        });

        expect(result.success).toBe(true);
        expect(result.data).toBe('success');
        expect(result.attemptCount).toBe(3);
        expect(operation).toHaveBeenCalledTimes(3);
    });

    it('should fail after max attempts', async () => {
        const operation = jest.fn().mockRejectedValue(new Error('Persistent error'));

        const result = await withRetry(operation, {
            maxAttempts: 2,
            baseDelayMs: 10,
            maxDelayMs: 100,
            backoffMultiplier: 2
        });

        expect(result.success).toBe(false);
        expect(result.error).toBeDefined();
        expect(result.attemptCount).toBe(2);
        expect(operation).toHaveBeenCalledTimes(2);
    });

    it('should not retry non-retryable errors', async () => {
        const error: ResilienceError = new Error('Validation error') as ResilienceError;
        error.isRetryable = false;

        const operation = jest.fn().mockRejectedValue(error);

        const result = await withRetry(operation, {
            maxAttempts: 3,
            baseDelayMs: 10,
            maxDelayMs: 100,
            backoffMultiplier: 2
        });

        expect(result.success).toBe(false);
        expect(result.attemptCount).toBe(1);
        expect(operation).toHaveBeenCalledTimes(1);
    });

    it('should respect retryable error patterns', async () => {
        const operation = jest.fn()
            .mockRejectedValueOnce(new Error('Network error'))
            .mockRejectedValueOnce(new Error('Database timeout'))
            .mockResolvedValue('success');

        const result = await withRetry(operation, {
            maxAttempts: 3,
            baseDelayMs: 10,
            maxDelayMs: 100,
            backoffMultiplier: 2,
            retryableErrors: [/network/i, /timeout/i]
        });

        expect(result.success).toBe(true);
        expect(result.attemptCount).toBe(3);
    });

    it('should not retry if error does not match patterns', async () => {
        const operation = jest.fn().mockRejectedValue(new Error('Validation failed'));

        const result = await withRetry(operation, {
            maxAttempts: 3,
            baseDelayMs: 10,
            maxDelayMs: 100,
            backoffMultiplier: 2,
            retryableErrors: [/network/i, /timeout/i]
        });

        expect(result.success).toBe(false);
        expect(result.attemptCount).toBe(1);
    });

    it('should use exponential backoff with max delay cap', async () => {
        const operation = jest.fn()
            .mockRejectedValueOnce(new Error('Error 1'))
            .mockRejectedValueOnce(new Error('Error 2'))
            .mockRejectedValueOnce(new Error('Error 3'))
            .mockResolvedValue('success');

        const start = Date.now();
        await withRetry(operation, {
            maxAttempts: 4,
            baseDelayMs: 10,
            maxDelayMs: 50,
            backoffMultiplier: 2
        });
        const elapsed = Date.now() - start;

        expect(operation).toHaveBeenCalledTimes(4);
        expect(elapsed).toBeGreaterThanOrEqual(10);
        expect(elapsed).toBeLessThan(200);
    });

    it('should preserve error information', async () => {
        const originalError = new Error('Original error message');
        const operation = jest.fn().mockRejectedValue(originalError);

        const result = await withRetry(operation, {
            maxAttempts: 1,
            baseDelayMs: 10,
            maxDelayMs: 100,
            backoffMultiplier: 2
        });

        expect(result.success).toBe(false);
        expect(result.error).toBeDefined();
        expect(result.error?.message).toBe('Original error message');
        expect((result.error as ResilienceError).originalError).toBe(originalError);
    });
});
