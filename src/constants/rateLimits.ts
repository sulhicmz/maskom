export const RATE_LIMITS = {
    LOGIN: {
        maxAttempts: 5,
        windowMs: 900000,
        cooldownMs: 1800000
    },
    REGISTER: {
        maxAttempts: 5,
        windowMs: 3600000,
        cooldownMs: 7200000
    },
    EMAIL: {
        maxAttempts: 5,
        windowMs: 60000,
        cooldownMs: 300000
    },
    FORM: {
        maxAttempts: 10,
        windowMs: 3600000,
        cooldownMs: 7200000
    }
} as const;

export type RateLimitConfig = typeof RATE_LIMITS[keyof typeof RATE_LIMITS];
