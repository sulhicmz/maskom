import { sleep } from '../sleep';
import { describe, it, expect } from '@jest/globals';

describe('sleep utility', () => {
    describe('Happy Path', () => {
        it('should resolve after specified milliseconds', async () => {
            const startTime = Date.now();
            await sleep(100);
            const endTime = Date.now();
            const elapsed = endTime - startTime;

            expect(elapsed).toBeGreaterThanOrEqual(95);
            expect(elapsed).toBeLessThan(200);
        });

        it('should resolve quickly for small delays', async () => {
            const startTime = Date.now();
            await sleep(10);
            const endTime = Date.now();
            const elapsed = endTime - startTime;

            expect(elapsed).toBeGreaterThanOrEqual(5);
            expect(elapsed).toBeLessThan(50);
        });

        it('should return undefined', async () => {
            const result = await sleep(100);
            expect(result).toBeUndefined();
        });
    });

    describe('Edge Cases', () => {
        it('should handle delay of 0 milliseconds', async () => {
            const startTime = Date.now();
            await sleep(0);
            const endTime = Date.now();
            const elapsed = endTime - startTime;

            expect(elapsed).toBeLessThan(50);
        });

        it('should handle delay of 1 millisecond', async () => {
            const startTime = Date.now();
            await sleep(1);
            const endTime = Date.now();
            const elapsed = endTime - startTime;

            expect(elapsed).toBeGreaterThanOrEqual(1);
            expect(elapsed).toBeLessThan(100);
        });

        it('should handle large delay values', async () => {
            const startTime = Date.now();
            await sleep(500);
            const endTime = Date.now();
            const elapsed = endTime - startTime;

            expect(elapsed).toBeGreaterThanOrEqual(499);
            expect(elapsed).toBeLessThan(600);
        });

        it('should handle delay of fractional milliseconds', async () => {
            const startTime = Date.now();
            await sleep(50.5);
            const endTime = Date.now();
            const elapsed = endTime - startTime;

            expect(elapsed).toBeGreaterThanOrEqual(50);
            expect(elapsed).toBeLessThan(150);
        });
    });

    describe('Error Handling', () => {
        it('should resolve (not reject) for negative delay values', async () => {
            const startTime = Date.now();
            await sleep(-100);
            const endTime = Date.now();
            const elapsed = endTime - startTime;

            expect(elapsed).toBeLessThan(100);
        });

        it('should resolve (not reject) for NaN delay', async () => {
            const startTime = Date.now();
            await sleep(NaN);
            const endTime = Date.now();
            const elapsed = endTime - startTime;

            expect(elapsed).toBeLessThan(100);
        });

        it('should resolve (not reject) for Infinity delay', async () => {
            const resultPromise = sleep(Infinity);

            const isResolvedInTime = await Promise.race([
                resultPromise.then(() => true),
                new Promise(resolve => setTimeout(() => resolve(false), 100))
            ]);

            expect(isResolvedInTime).toBe(true);

            resultPromise.then(() => {});
        });
    });

    describe('Integration Behavior', () => {
        it('should be usable in async/await patterns', async () => {
            const results: string[] = [];

            results.push('start');
            await sleep(50);
            results.push('after 50ms');
            await sleep(50);
            results.push('after 100ms');

            expect(results).toEqual(['start', 'after 50ms', 'after 100ms']);
        });

        it('should work with Promise.all', async () => {
            const startTime = Date.now();
            await Promise.all([
                sleep(50),
                sleep(50),
                sleep(50)
            ]);
            const endTime = Date.now();
            const elapsed = endTime - startTime;

            expect(elapsed).toBeGreaterThanOrEqual(50);
            expect(elapsed).toBeLessThan(150);
        });

        it('should work with Promise.race', async () => {
            const startTime = Date.now();
            await Promise.race([
                sleep(50),
                sleep(100)
            ]);
            const endTime = Date.now();
            const elapsed = endTime - startTime;

            expect(elapsed).toBeGreaterThanOrEqual(45);
            expect(elapsed).toBeLessThan(150);
        });

        it('should allow chaining', async () => {
            const startTime = Date.now();
            await sleep(50)
                .then(() => sleep(50))
                .then(() => sleep(50));
            const endTime = Date.now();
            const elapsed = endTime - startTime;

            expect(elapsed).toBeGreaterThanOrEqual(140);
            expect(elapsed).toBeLessThan(250);
        });
    });

    describe('Performance', () => {
        it('should not accumulate memory leaks', async () => {
            const initialMemory = process.memoryUsage().heapUsed;

            for (let i = 0; i < 100; i++) {
                await sleep(1);
            }

            const finalMemory = process.memoryUsage().heapUsed;
            const memoryIncrease = finalMemory - initialMemory;

            expect(memoryIncrease).toBeLessThan(10 * 1024 * 1024);
        });
    });
});
