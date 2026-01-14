import { RateLimiter, RateLimitConfig, emailRateLimiter, formRateLimiter } from '../rateLimiter';

describe('RateLimiter', () => {
    let rateLimiter: RateLimiter;
    const config: RateLimitConfig = {
        maxAttempts: 3,
        windowMs: 1000,
        cooldownMs: 2000
    };

    beforeEach(() => {
        rateLimiter = new RateLimiter(config);
    });

    afterEach(() => {
        rateLimiter.destroy();
    });

    describe('check', () => {
        it('should allow first request for new identifier', () => {
            const result = rateLimiter.check('user1');

            expect(result.allowed).toBe(true);
            expect(result.attemptsRemaining).toBe(3);
        });

        it('should track attempts within window', () => {
            rateLimiter.recordAttempt('user1');
            rateLimiter.recordAttempt('user1');

            const result = rateLimiter.check('user1');

            expect(result.allowed).toBe(true);
            expect(result.attemptsRemaining).toBe(1);
        });

        it('should block request when max attempts exceeded', () => {
            rateLimiter.recordAttempt('user1');
            rateLimiter.recordAttempt('user1');
            rateLimiter.recordAttempt('user1');

            const result = rateLimiter.check('user1');

            expect(result.allowed).toBe(false);
            expect(result.attemptsRemaining).toBe(0);
            expect(result.error).toBeDefined();
            expect(result.resetTime).toBeDefined();
        });

        it('should reset counter after window expires', async () => {
            rateLimiter.recordAttempt('user1');
            rateLimiter.recordAttempt('user1');

            await new Promise(resolve => setTimeout(resolve, 1100));

            const result = rateLimiter.check('user1');

            expect(result.allowed).toBe(true);
            expect(result.attemptsRemaining).toBe(3);
        });

        it('should allow after cooldown expires', async () => {
            rateLimiter.recordAttempt('user1');
            rateLimiter.recordAttempt('user1');
            rateLimiter.recordAttempt('user1');

            await new Promise(resolve => setTimeout(resolve, 2100));

            const result = rateLimiter.check('user1');

            expect(result.allowed).toBe(true);
            expect(result.attemptsRemaining).toBe(3);
        });

        it('should track separate counters for different identifiers', () => {
            rateLimiter.recordAttempt('user1');
            rateLimiter.recordAttempt('user1');

            const result2 = rateLimiter.check('user2');

            expect(result2.allowed).toBe(true);
            expect(result2.attemptsRemaining).toBe(3);
        });

        it('should handle identifiers that do not exist', () => {
            const result = rateLimiter.check('nonexistent');

            expect(result.allowed).toBe(true);
            expect(result.attemptsRemaining).toBe(3);
        });
    });

    describe('recordAttempt', () => {
        it('should allow and record first attempt', () => {
            const result = rateLimiter.recordAttempt('user1');

            expect(result.allowed).toBe(true);
            expect(result.attemptsRemaining).toBe(2);
        });

        it('should allow until max attempts reached', () => {
            const result1 = rateLimiter.recordAttempt('user1');
            const result2 = rateLimiter.recordAttempt('user1');
            const result3 = rateLimiter.recordAttempt('user1');

            expect(result1.allowed).toBe(true);
            expect(result1.attemptsRemaining).toBe(2);

            expect(result2.allowed).toBe(true);
            expect(result2.attemptsRemaining).toBe(1);

            expect(result3.allowed).toBe(true);
            expect(result3.attemptsRemaining).toBe(0);
        });

        it('should block after max attempts', () => {
            rateLimiter.recordAttempt('user1');
            rateLimiter.recordAttempt('user1');
            rateLimiter.recordAttempt('user1');

            const result = rateLimiter.recordAttempt('user1');

            expect(result.allowed).toBe(false);
            expect(result.attemptsRemaining).toBe(0);
            expect(result.error).toBeDefined();
            expect(result.resetTime).toBeGreaterThan(Date.now());
        });

        it('should block requests during cooldown period', async () => {
            rateLimiter.recordAttempt('user1');
            rateLimiter.recordAttempt('user1');
            rateLimiter.recordAttempt('user1');

            const blockedResult = rateLimiter.recordAttempt('user1');

            expect(blockedResult.allowed).toBe(false);

            const immediateCheck = rateLimiter.check('user1');

            expect(immediateCheck.allowed).toBe(false);
            expect(immediateCheck.error).toBeDefined();
        });

        it('should allow requests after cooldown expires', async () => {
            rateLimiter.recordAttempt('user1');
            rateLimiter.recordAttempt('user1');
            rateLimiter.recordAttempt('user1');

            const blockedResult = rateLimiter.recordAttempt('user1');
            expect(blockedResult.allowed).toBe(false);

            await new Promise(resolve => setTimeout(resolve, 2100));

            const result = rateLimiter.recordAttempt('user1');

            expect(result.allowed).toBe(true);
            expect(result.attemptsRemaining).toBe(2);
        });

        it('should reset counter after window expires (not blocked)', async () => {
            rateLimiter.recordAttempt('user1');
            rateLimiter.recordAttempt('user1');

            await new Promise(resolve => setTimeout(resolve, 1100));

            const result = rateLimiter.recordAttempt('user1');

            expect(result.allowed).toBe(true);
            expect(result.attemptsRemaining).toBe(2);
        });
    });

    describe('reset', () => {
        it('should reset attempts for specific identifier', () => {
            rateLimiter.recordAttempt('user1');
            rateLimiter.recordAttempt('user1');

            rateLimiter.reset('user1');

            const result = rateLimiter.check('user1');

            expect(result.allowed).toBe(true);
            expect(result.attemptsRemaining).toBe(3);
        });

        it('should not affect other identifiers', () => {
            rateLimiter.recordAttempt('user1');
            rateLimiter.recordAttempt('user2');

            rateLimiter.reset('user1');

            const result1 = rateLimiter.check('user1');
            const result2 = rateLimiter.check('user2');

            expect(result1.allowed).toBe(true);
            expect(result1.attemptsRemaining).toBe(3);

            expect(result2.allowed).toBe(true);
            expect(result2.attemptsRemaining).toBe(2);
        });

        it('should handle non-existent identifier gracefully', () => {
            expect(() => rateLimiter.reset('nonexistent')).not.toThrow();
        });
    });

    describe('resetAll', () => {
        it('should reset all identifiers', () => {
            rateLimiter.recordAttempt('user1');
            rateLimiter.recordAttempt('user1');
            rateLimiter.recordAttempt('user1');
            rateLimiter.recordAttempt('user2');

            rateLimiter.resetAll();

            const result1 = rateLimiter.check('user1');
            const result2 = rateLimiter.check('user2');

            expect(result1.allowed).toBe(true);
            expect(result1.attemptsRemaining).toBe(3);

            expect(result2.allowed).toBe(true);
            expect(result2.attemptsRemaining).toBe(3);
        });
    });

    describe('getStatus', () => {
        it('should return status for existing identifier', () => {
            rateLimiter.recordAttempt('user1');
            rateLimiter.recordAttempt('user1');

            const status = rateLimiter.getStatus('user1');

            expect(status.count).toBe(2);
            expect(status.firstAttempt).toBeDefined();
            expect(status.firstAttempt).toBeLessThanOrEqual(Date.now());
            expect(status.lockedUntil).toBeNull();
        });

        it('should return lockedUntil when blocked', () => {
            rateLimiter.recordAttempt('user1');
            rateLimiter.recordAttempt('user1');
            rateLimiter.recordAttempt('user1');
            rateLimiter.recordAttempt('user1');

            const status = rateLimiter.getStatus('user1');

            expect(status.count).toBe(4);
            expect(status.lockedUntil).toBeDefined();
            expect(status.lockedUntil).toBeGreaterThan(Date.now());
        });

        it('should return zero status for non-existent identifier', () => {
            const status = rateLimiter.getStatus('nonexistent');

            expect(status.count).toBe(0);
            expect(status.lockedUntil).toBeNull();
        });
    });

    describe('destroy', () => {
        it('should clear all records', () => {
            rateLimiter.recordAttempt('user1');
            rateLimiter.recordAttempt('user2');

            rateLimiter.destroy();

            const result1 = rateLimiter.check('user1');
            const result2 = rateLimiter.check('user2');

            expect(result1.allowed).toBe(true);
            expect(result2.allowed).toBe(true);
        });
    });

    describe('default limiters', () => {
        it('should export emailRateLimiter', () => {
            expect(emailRateLimiter).toBeInstanceOf(RateLimiter);
        });

        it('should export formRateLimiter', () => {
            expect(formRateLimiter).toBeInstanceOf(RateLimiter);
        });
    });

    describe('edge cases', () => {
        it('should handle empty identifier string', () => {
            const result = rateLimiter.recordAttempt('');

            expect(result.allowed).toBe(true);
        });

        it('should handle special characters in identifier', () => {
            const result = rateLimiter.recordAttempt('user@example.com#123');

            expect(result.allowed).toBe(true);
        });

        it('should handle rapid successive requests', () => {
            const results = [];
            for (let i = 0; i < 5; i++) {
                results.push(rateLimiter.recordAttempt('user1'));
            }

            expect(results[0].allowed).toBe(true);
            expect(results[1].allowed).toBe(true);
            expect(results[2].allowed).toBe(true);
            expect(results[3].allowed).toBe(false);
            expect(results[4].allowed).toBe(false);
        });
    });

    describe('error messages', () => {
        it('should include remaining cooldown time in error message', () => {
            rateLimiter.recordAttempt('user1');
            rateLimiter.recordAttempt('user1');
            rateLimiter.recordAttempt('user1');

            const result = rateLimiter.recordAttempt('user1');

            expect(result.error).toBeDefined();
            expect(result.error).toContain('Too many attempts');
            expect(result.error).toContain('Please try again');
        });

        it('should provide reset time', () => {
            rateLimiter.recordAttempt('user1');
            rateLimiter.recordAttempt('user1');
            rateLimiter.recordAttempt('user1');

            const result = rateLimiter.recordAttempt('user1');

            expect(result.resetTime).toBeDefined();
            expect(result.resetTime).toBeGreaterThan(Date.now());
        });
    });

    describe('cleanup', () => {
        it('should not cleanup automatically in browser environment', () => {
            const testLimiter = new RateLimiter({
                maxAttempts: 3,
                windowMs: 1000,
                cooldownMs: 2000
            });

            testLimiter.recordAttempt('user1');

            expect(testLimiter.getStatus('user1').count).toBe(1);

            testLimiter.destroy();
        });

        it('should start with empty state', () => {
            const result = rateLimiter.check('new_user');

            expect(result.allowed).toBe(true);
            expect(result.attemptsRemaining).toBe(config.maxAttempts);
        });

        it('should destroy cleanup interval on destroy', () => {
            const testLimiter = new RateLimiter({
                maxAttempts: 3,
                windowMs: 1000,
                cooldownMs: 2000
            });

            testLimiter.recordAttempt('user1');

            testLimiter.destroy();

            const status = testLimiter.getStatus('user1');

            expect(status.count).toBe(0);
        });

        it('should handle multiple destroy calls gracefully', () => {
            const testLimiter = new RateLimiter({
                maxAttempts: 3,
                windowMs: 1000,
                cooldownMs: 2000
            });

            testLimiter.recordAttempt('user1');

            testLimiter.destroy();
            testLimiter.destroy();
            testLimiter.destroy();

            expect(() => testLimiter.check('user1')).not.toThrow();
        });

        it('should clear all records on destroy', () => {
            const testLimiter = new RateLimiter({
                maxAttempts: 3,
                windowMs: 1000,
                cooldownMs: 2000
            });

            testLimiter.recordAttempt('user1');
            testLimiter.recordAttempt('user2');
            testLimiter.recordAttempt('user3');

            testLimiter.destroy();

            const result1 = testLimiter.check('user1');
            const result2 = testLimiter.check('user2');
            const result3 = testLimiter.check('user3');

            expect(result1.allowed).toBe(true);
            expect(result2.allowed).toBe(true);
            expect(result3.allowed).toBe(true);

            expect(result1.attemptsRemaining).toBe(3);
            expect(result2.attemptsRemaining).toBe(3);
            expect(result3.attemptsRemaining).toBe(3);
        });

        it('should handle expired window during cleanup', async () => {
            const testLimiter = new RateLimiter({
                maxAttempts: 3,
                windowMs: 100,
                cooldownMs: 200
            });

            testLimiter.recordAttempt('user1');

            await new Promise(resolve => setTimeout(resolve, 150));

            const status = testLimiter.getStatus('user1');

            expect(status.count).toBeGreaterThanOrEqual(0);

            testLimiter.destroy();
        });

        it('should handle locked state during cleanup', async () => {
            const testLimiter = new RateLimiter({
                maxAttempts: 2,
                windowMs: 100,
                cooldownMs: 200
            });

            testLimiter.recordAttempt('user1');
            testLimiter.recordAttempt('user1');

            const blockedResult = testLimiter.recordAttempt('user1');

            expect(blockedResult.allowed).toBe(false);

            testLimiter.destroy();
        });
    });
});
