import { RateLimiter, type IRateLimiter, type RateLimitConfig } from '../../rateLimiter';
import { describe, it, expect, beforeEach } from '@jest/globals';

describe('RateLimiter Interface Contract', () => {
    let rateLimiter: IRateLimiter;
    const config: RateLimitConfig = {
        maxAttempts: 5,
        windowMs: 60000,
        cooldownMs: 300000
    };

    beforeEach(() => {
        rateLimiter = new RateLimiter(config);
    });

    it('should implement IRateLimiter interface correctly', () => {
        expect(rateLimiter).toBeDefined();
        expect(typeof rateLimiter.check).toBe('function');
        expect(typeof rateLimiter.recordAttempt).toBe('function');
        expect(typeof rateLimiter.reset).toBe('function');
        expect(typeof rateLimiter.resetAll).toBe('function');
        expect(typeof rateLimiter.getStatus).toBe('function');
    });

    it('should check rate limit status', () => {
        const result = rateLimiter.check('test@example.com');
        expect(result).toHaveProperty('allowed');
        expect(result).toHaveProperty('attemptsRemaining');
        expect(result.allowed).toBe(true);
        expect(result.attemptsRemaining).toBeGreaterThan(0);
    });

    it('should record attempts and update limits', () => {
        for (let i = 0; i < 3; i++) {
            rateLimiter.recordAttempt('test2@example.com');
        }

        const status = rateLimiter.getStatus('test2@example.com');
        expect(status.count).toBe(3);
        expect(status.firstAttempt).toBeGreaterThan(0);
    });

    it('should reset specific identifier', () => {
        rateLimiter.recordAttempt('test3@example.com');
        rateLimiter.reset('test3@example.com');

        const status = rateLimiter.getStatus('test3@example.com');
        expect(status.count).toBe(0);
    });

    it('should reset all identifiers', () => {
        rateLimiter.recordAttempt('test4@example.com');
        rateLimiter.recordAttempt('test5@example.com');
        rateLimiter.resetAll();

        expect(rateLimiter.getStatus('test4@example.com').count).toBe(0);
        expect(rateLimiter.getStatus('test5@example.com').count).toBe(0);
    });

    it('should enforce rate limits', () => {
        const identifier = 'test6@example.com';
        
        for (let i = 0; i < config.maxAttempts; i++) {
            const result = rateLimiter.recordAttempt(identifier);
            if (i < config.maxAttempts - 1) {
                expect(result.allowed).toBe(true);
            }
        }

        const finalResult = rateLimiter.check(identifier);
        expect(finalResult.allowed).toBe(false);
        expect(finalResult.error).toContain('Too many attempts');
    });

    it('should provide status with correct structure', () => {
        rateLimiter.recordAttempt('test7@example.com');
        const status = rateLimiter.getStatus('test7@example.com');

        expect(status).toHaveProperty('count');
        expect(status).toHaveProperty('firstAttempt');
        expect(status).toHaveProperty('lockedUntil');
        expect(typeof status.count).toBe('number');
        expect(typeof status.firstAttempt).toBe('number');
    });

    it('should handle non-existent identifiers gracefully', () => {
        const status = rateLimiter.getStatus('nonexistent@example.com');
        expect(status.count).toBe(0);
        expect(status.firstAttempt).toBeGreaterThan(0);
    });
});
