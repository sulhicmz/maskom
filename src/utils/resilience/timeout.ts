import type { TimeoutOptions, ResilienceError } from './types';

export async function withTimeout<T>(
    promise: Promise<T>,
    options: TimeoutOptions
): Promise<T> {
    const { timeoutMs, timeoutError = 'Operation timed out' } = options;

    const timeoutPromise = new Promise<never>((_, reject) => {
        setTimeout(() => {
            const error: ResilienceError = new Error(timeoutError) as ResilienceError;
            error.isTimeout = true;
            error.isRetryable = true;
            reject(error);
        }, timeoutMs);
    });

    return Promise.race([promise, timeoutPromise]);
}
