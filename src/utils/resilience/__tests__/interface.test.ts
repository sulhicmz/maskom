import { CircuitBreaker, type ICircuitBreaker, type CircuitBreakerConfig } from '../../resilience';
import { describe, it, expect, beforeEach } from '@jest/globals';

describe('CircuitBreaker Interface Contract', () => {
    let circuitBreaker: ICircuitBreaker;
    const config: CircuitBreakerConfig = {
        failureThreshold: 3,
        resetTimeoutMs: 60000,
        monitoringPeriodMs: 60000
    };

    beforeEach(() => {
        circuitBreaker = new CircuitBreaker(config);
    });

    it('should implement ICircuitBreaker interface correctly', () => {
        expect(circuitBreaker).toBeDefined();
        expect(typeof circuitBreaker.execute).toBe('function');
        expect(typeof circuitBreaker.getState).toBe('function');
        expect(typeof circuitBreaker.reset).toBe('function');
    });

    it('should execute operations successfully when circuit is closed', async () => {
        const operation = async () => 'success';
        const result = await circuitBreaker.execute(operation);
        expect(result).toBe('success');
    });

    it('should track state correctly', () => {
        const state = circuitBreaker.getState();
        expect(state).toHaveProperty('isOpen');
        expect(state).toHaveProperty('failureCount');
        expect(state).toHaveProperty('lastFailureTime');
        expect(state).toHaveProperty('lastSuccessTime');
        expect(state.isOpen).toBe(false);
        expect(state.failureCount).toBe(0);
    });

    it('should reset circuit state', async () => {
        const failingOperation = async () => {
            throw new Error('Failed');
        };

        for (let i = 0; i < config.failureThreshold; i++) {
            try {
                await circuitBreaker.execute(failingOperation);
            } catch {
            }
        }

        let state = circuitBreaker.getState();
        expect(state.isOpen).toBe(true);

        circuitBreaker.reset();
        state = circuitBreaker.getState();
        expect(state.isOpen).toBe(false);
        expect(state.failureCount).toBe(0);
    });

    it('should open circuit after failure threshold is reached', async () => {
        const failingOperation = async () => {
            throw new Error('Failed');
        };

        for (let i = 0; i < config.failureThreshold; i++) {
            try {
                await circuitBreaker.execute(failingOperation);
            } catch {
            }
        }

        const state = circuitBreaker.getState();
        expect(state.isOpen).toBe(true);
        expect(state.failureCount).toBe(config.failureThreshold);
    });

    it('should reject operations when circuit is open', async () => {
        const failingOperation = async () => {
            throw new Error('Failed');
        };

        for (let i = 0; i < config.failureThreshold; i++) {
            try {
                await circuitBreaker.execute(failingOperation);
            } catch {
            }
        }

        const successfulOperation = async () => 'success';
        
        await expect(circuitBreaker.execute(successfulOperation)).rejects.toThrow(
            'Circuit breaker is open'
        );
    });

    it('should allow operations after reset when circuit was open', async () => {
        const failingOperation = async () => {
            throw new Error('Failed');
        };

        for (let i = 0; i < config.failureThreshold; i++) {
            try {
                await circuitBreaker.execute(failingOperation);
            } catch {
            }
        }

        circuitBreaker.reset();
        
        const successfulOperation = async () => 'success';
        const result = await circuitBreaker.execute(successfulOperation);
        expect(result).toBe('success');
    });

    it('should track last failure time', async () => {
        const failingOperation = async () => {
            throw new Error('Failed');
        };

        await circuitBreaker.execute(failingOperation).catch(() => {});

        const state = circuitBreaker.getState();
        expect(state.lastFailureTime).toBeGreaterThan(0);
        expect(state.lastFailureTime).toBeLessThanOrEqual(Date.now());
    });

    it('should track last success time', async () => {
        const successfulOperation = async () => 'success';
        await circuitBreaker.execute(successfulOperation);

        const state = circuitBreaker.getState();
        expect(state.lastSuccessTime).toBeGreaterThan(0);
        expect(state.lastSuccessTime).toBeLessThanOrEqual(Date.now());
    });

    it('should handle operations that return different types', async () => {
        const stringOp = async () => 'string';
        const numberOp = async () => 42;
        const objectOp = async () => ({ key: 'value' });
        const arrayOp = async () => [1, 2, 3];

        expect(await circuitBreaker.execute(stringOp)).toBe('string');
        expect(await circuitBreaker.execute(numberOp)).toBe(42);
        expect(await circuitBreaker.execute(objectOp)).toEqual({ key: 'value' });
        expect(await circuitBreaker.execute(arrayOp)).toEqual([1, 2, 3]);
    });

    it('should handle operations that return different types', async () => {
        const stringOp = async () => 'string';
        const numberOp = async () => 42;
        const objectOp = async () => ({ key: 'value' });
        const arrayOp = async () => [1, 2, 3];

        expect(await circuitBreaker.execute(stringOp)).toBe('string');
        expect(await circuitBreaker.execute(numberOp)).toBe(42);
        expect(await circuitBreaker.execute(objectOp)).toEqual({ key: 'value' });
        expect(await circuitBreaker.execute(arrayOp)).toEqual([1, 2, 3]);
    });

    it('should increment failure count correctly', async () => {
        const failingOperation = async () => {
            throw new Error('Failed');
        };

        await circuitBreaker.execute(failingOperation).catch(() => {});
        await circuitBreaker.execute(failingOperation).catch(() => {});

        const state = circuitBreaker.getState();
        expect(state.failureCount).toBe(2);
    });

    it('should return immutable state object', () => {
        const state1 = circuitBreaker.getState();
        const state2 = circuitBreaker.getState();
        
        expect(state1).not.toBe(state2);
        expect(state1).toEqual(state2);
    });
});
