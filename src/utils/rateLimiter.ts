import { RATE_LIMITS, MS_TO_SECONDS } from '@/constants';

export interface RateLimitConfig {
    maxAttempts: number;
    windowMs: number;
    cooldownMs?: number;
}

export interface RateLimitResult {
    allowed: boolean;
    attemptsRemaining: number;
    resetTime?: number;
    error?: string;
}

export interface IRateLimiter {
    check(identifier: string): RateLimitResult;
    recordAttempt(identifier: string): RateLimitResult;
    reset(identifier: string): void;
    resetAll(): void;
    getStatus(identifier: string): { count: number; firstAttempt: number; lockedUntil?: number | null };
    destroy?(): void;
}

export class RateLimiter implements IRateLimiter {
    private config: RateLimitConfig;
    private attempts: Map<string, { count: number; firstAttempt: number; lockedUntil?: number }> = new Map();
    private cleanupInterval: NodeJS.Timeout | null = null;

    constructor(config: RateLimitConfig) {
        this.config = config;
        this.startCleanup();
    }

    check(identifier: string): RateLimitResult {
        const now = Date.now();
        const record = this.attempts.get(identifier);

        if (!record) {
            this.attempts.set(identifier, { count: 0, firstAttempt: now });
            return {
                allowed: true,
                attemptsRemaining: this.config.maxAttempts
            };
        }

        if (record.lockedUntil && record.lockedUntil > now) {
            return {
                allowed: false,
                attemptsRemaining: 0,
                resetTime: record.lockedUntil,
                error: `Too many attempts. Please try again in ${Math.ceil((record.lockedUntil - now) / MS_TO_SECONDS)} seconds.`
            };
        }

        const timeSinceFirstAttempt = now - record.firstAttempt;

        if (timeSinceFirstAttempt > this.config.windowMs || (record.lockedUntil && record.lockedUntil <= now)) {
            record.count = 0;
            record.firstAttempt = now;
            record.lockedUntil = undefined;
        }

        if (record.count >= this.config.maxAttempts) {
            record.lockedUntil = now + (this.config.cooldownMs || this.config.windowMs);
            return {
                allowed: false,
                attemptsRemaining: 0,
                resetTime: record.lockedUntil,
                error: `Too many attempts. Please try again in ${Math.ceil((this.config.cooldownMs || this.config.windowMs) / MS_TO_SECONDS)} seconds.`
            };
        }

        return {
            allowed: true,
            attemptsRemaining: this.config.maxAttempts - record.count
        };
    }

    recordAttempt(identifier: string): RateLimitResult {
        const now = Date.now();
        const record = this.attempts.get(identifier);

        if (!record) {
            this.attempts.set(identifier, { count: 1, firstAttempt: now });
            return {
                allowed: true,
                attemptsRemaining: this.config.maxAttempts - 1
            };
        }

        if (record.lockedUntil && record.lockedUntil > now) {
            return {
                allowed: false,
                attemptsRemaining: 0,
                resetTime: record.lockedUntil,
                error: `Too many attempts. Please try again in ${Math.ceil((record.lockedUntil - now) / MS_TO_SECONDS)} seconds.`
            };
        }

        const timeSinceFirstAttempt = now - record.firstAttempt;

        if (timeSinceFirstAttempt > this.config.windowMs) {
            record.count = 1;
            record.firstAttempt = now;
            record.lockedUntil = undefined;
            return {
                allowed: true,
                attemptsRemaining: this.config.maxAttempts - 1
            };
        }

        const newCount = record.count + 1;
        record.count = newCount;

        if (newCount > this.config.maxAttempts) {
            const lockedUntil = now + (this.config.cooldownMs || this.config.windowMs);
            record.lockedUntil = lockedUntil;
            return {
                allowed: false,
                attemptsRemaining: 0,
                resetTime: lockedUntil,
                error: `Too many attempts. Please try again in ${Math.ceil((this.config.cooldownMs || this.config.windowMs) / MS_TO_SECONDS)} seconds.`
            };
        }

        return {
            allowed: true,
            attemptsRemaining: this.config.maxAttempts - newCount
        };
    }

    reset(identifier: string): void {
        this.attempts.delete(identifier);
    }

    resetAll(): void {
        this.attempts.clear();
    }

    getStatus(identifier: string): { count: number; firstAttempt: number; lockedUntil?: number | null } {
        const record = this.attempts.get(identifier);
        if (!record) {
            return { count: 0, firstAttempt: Date.now(), lockedUntil: null };
        }
        return {
            count: record.count,
            firstAttempt: record.firstAttempt,
            lockedUntil: record.lockedUntil || null
        };
    }

    private startCleanup(): void {
        if (typeof window === 'undefined') {
            this.cleanupInterval = setInterval(() => {
                const now = Date.now();
                for (const [identifier, record] of this.attempts.entries()) {
                    if ((now - record.firstAttempt > this.config.windowMs) &&
                        (!record.lockedUntil || record.lockedUntil <= now)) {
                        this.attempts.delete(identifier);
                    }
                }
            }, this.config.windowMs / 2);
        }
    }

    destroy(): void {
        if (this.cleanupInterval) {
            clearInterval(this.cleanupInterval);
            this.cleanupInterval = null;
        }
        this.resetAll();
    }
}

export const emailRateLimiter = new RateLimiter(RATE_LIMITS.EMAIL);

export const formRateLimiter = new RateLimiter(RATE_LIMITS.FORM);
