import { CircuitBreaker } from '../circuitBreaker';
import type { ResilienceError } from '../types';

describe('CircuitBreaker', () => {
    let circuitBreaker: CircuitBreaker;

    beforeEach(() => {
        circuitBreaker = new CircuitBreaker({
            failureThreshold: 3,
            resetTimeoutMs: 1000,
            monitoringPeriodMs: 1000
        });
    });

    it('should allow operations to pass through initially', async () => {
        const operation = jest.fn().mockResolvedValue('success');

        const result = await circuitBreaker.execute(operation);

        expect(result).toBe('success');
        expect(operation).toHaveBeenCalledTimes(1);
    });

    it('should open circuit after failure threshold is reached', async () => {
        const operation = jest.fn().mockRejectedValue(new Error('Service error'));

        for (let i = 0; i < 3; i++) {
            await expect(circuitBreaker.execute(operation)).rejects.toThrow('Service error');
        }

        const state = circuitBreaker.getState();
        expect(state.isOpen).toBe(true);
        expect(state.failureCount).toBe(3);
    });

    it('should reject immediately when circuit is open', async () => {
        const operation = jest.fn().mockRejectedValue(new Error('Service error'));

        await expect(circuitBreaker.execute(operation)).rejects.toThrow();
        expect(circuitBreaker.getState().failureCount).toBe(1);

        await expect(circuitBreaker.execute(operation)).rejects.toThrow();
        expect(circuitBreaker.getState().failureCount).toBe(2);

        await expect(circuitBreaker.execute(operation)).rejects.toThrow();
        expect(circuitBreaker.getState().failureCount).toBe(3);

        await expect(circuitBreaker.execute(operation)).rejects.toThrow('Circuit breaker is open');
        expect(operation).toHaveBeenCalledTimes(3);
    });

    it('should close circuit after successful operation', async () => {
        const failingOperation = jest.fn().mockRejectedValue(new Error('Service error'));
        const successOperation = jest.fn().mockResolvedValue('success');

        for (let i = 0; i < 2; i++) {
            await expect(circuitBreaker.execute(failingOperation)).rejects.toThrow();
        }

        await circuitBreaker.execute(successOperation);

        const state = circuitBreaker.getState();
        expect(state.isOpen).toBe(false);
        expect(state.failureCount).toBe(0);
    });

    it('should reset failure count on success', async () => {
        const failingOperation = jest.fn().mockRejectedValue(new Error('Service error'));
        const successOperation = jest.fn().mockResolvedValue('success');

        await expect(circuitBreaker.execute(failingOperation)).rejects.toThrow();
        await expect(circuitBreaker.execute(failingOperation)).rejects.toThrow();

        expect(circuitBreaker.getState().failureCount).toBe(2);

        await circuitBreaker.execute(successOperation);

        expect(circuitBreaker.getState().failureCount).toBe(0);
    });

    it('should attempt reset after timeout period', async () => {
        const operation = jest.fn().mockResolvedValue('success');

        for (let i = 0; i < 3; i++) {
            operation.mockRejectedValueOnce(new Error('Service error'));
        }

        for (let i = 0; i < 3; i++) {
            await expect(circuitBreaker.execute(operation)).rejects.toThrow();
        }

        expect(circuitBreaker.getState().isOpen).toBe(true);

        await new Promise(resolve => setTimeout(resolve, 1100));

        await circuitBreaker.execute(operation);

        const state = circuitBreaker.getState();
        expect(state.isOpen).toBe(false);
        expect(operation).toHaveBeenCalledTimes(4);
    });

    it('should track last failure time', async () => {
        const operation = jest.fn().mockRejectedValue(new Error('Service error'));

        await expect(circuitBreaker.execute(operation)).rejects.toThrow();

        const state = circuitBreaker.getState();
        expect(state.lastFailureTime).toBeGreaterThan(0);
        expect(state.lastFailureTime).toBeLessThanOrEqual(Date.now());
    });

    it('should track last success time', async () => {
        const operation = jest.fn().mockResolvedValue('success');

        await circuitBreaker.execute(operation);

        const state = circuitBreaker.getState();
        expect(state.lastSuccessTime).toBeGreaterThan(0);
        expect(state.lastSuccessTime).toBeLessThanOrEqual(Date.now());
    });

    it('should allow manual reset', async () => {
        const operation = jest.fn().mockRejectedValue(new Error('Service error'));

        for (let i = 0; i < 3; i++) {
            await expect(circuitBreaker.execute(operation)).rejects.toThrow();
        }

        expect(circuitBreaker.getState().isOpen).toBe(true);

        circuitBreaker.reset();

        const state = circuitBreaker.getState();
        expect(state.isOpen).toBe(false);
        expect(state.failureCount).toBe(0);
        expect(state.lastFailureTime).toBeNull();
    });

    it('should return copy of state', async () => {
        const state1 = circuitBreaker.getState();
        const state2 = circuitBreaker.getState();

        expect(state1).not.toBe(state2);
        expect(state1).toEqual(state2);
    });

    it('should set isRetryable to false for circuit open error', async () => {
        const operation = jest.fn().mockRejectedValue(new Error('Service error'));

        for (let i = 0; i < 3; i++) {
            await expect(circuitBreaker.execute(operation)).rejects.toThrow();
        }

        try {
            await circuitBreaker.execute(operation);
            fail('Should have thrown circuit open error');
        } catch (error) {
            expect((error as ResilienceError).isRetryable).toBe(false);
            expect((error as ResilienceError).isTimeout).toBe(false);
        }
    });
});
