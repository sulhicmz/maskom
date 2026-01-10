import { withTimeout } from '../timeout';

describe('withTimeout', () => {
    it('should resolve promise before timeout', async () => {
        const promise = Promise.resolve('success');
        const result = await withTimeout(promise, { timeoutMs: 1000 });

        expect(result).toBe('success');
    });

    it('should reject with timeout error when promise exceeds timeout', async () => {
        const promise = new Promise<string>((resolve) => {
            setTimeout(() => resolve('late'), 2000);
        });

        await expect(
            withTimeout(promise, { timeoutMs: 100 })
        ).rejects.toThrow('Operation timed out');
    });

    it('should use custom timeout error message', async () => {
        const promise = new Promise<string>((resolve) => {
            setTimeout(() => resolve('late'), 2000);
        });

        await expect(
            withTimeout(promise, { timeoutMs: 100, timeoutError: 'Custom timeout' })
        ).rejects.toThrow('Custom timeout');
    });

    it('should set isTimeout flag on error', async () => {
        const promise = new Promise<string>((resolve) => {
            setTimeout(() => resolve('late'), 2000);
        });

        try {
            await withTimeout(promise, { timeoutMs: 100 });
            fail('Should have thrown timeout error');
        } catch (error) {
            const resilienceError = error as { isTimeout: boolean; isRetryable: boolean };
            expect(resilienceError.isTimeout).toBe(true);
            expect(resilienceError.isRetryable).toBe(true);
        }
    });

    it('should reject immediately if promise rejects before timeout', async () => {
        const promise = Promise.reject(new Error('Immediate error'));

        await expect(
            withTimeout(promise, { timeoutMs: 1000 })
        ).rejects.toThrow('Immediate error');
    });

    it('should handle zero timeout correctly', async () => {
        const promise = new Promise<string>((resolve) => {
            setTimeout(() => resolve('success'), 100);
        });

        await expect(
            withTimeout(promise, { timeoutMs: 0 })
        ).rejects.toThrow('Operation timed out');
    });
});
