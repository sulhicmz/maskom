export const TIMEOUTS = {
    AUTH_LOGIN: 5000,
    AUTH_REGISTER: 5000,
    EMAIL_SERVICE: 10000,
    API_ROUTE: 5000,
    QR_CODE_API: 5000,
    COLLABORATION_API: 5000,
} as const;

export const RETRY_CONFIG = {
    MAX_ATTEMPTS: 3,
    BASE_DELAY_MS: 1000,
    MAX_DELAY_MS: 10000,
    BACKOFF_MULTIPLIER: 2,
} as const;

export const SERVICE_RETRY_CONFIG = {
    EMAIL_SERVICE: {
        maxAttempts: 3,
        baseDelayMs: 2000,
        maxDelayMs: 15000,
        backoffMultiplier: 2,
        retryableErrors: [/network/i, /timeout/i, /ECONN/i, /5\d{2}/]
    },
    AUTH_SERVICE: {
        maxAttempts: 2,
        baseDelayMs: 1000,
        maxDelayMs: 5000,
        backoffMultiplier: 2,
        retryableErrors: [/network/i, /timeout/i, /ECONN/i]
    },
    API_ROUTE: {
        maxAttempts: 2,
        baseDelayMs: 500,
        maxDelayMs: 3000,
        backoffMultiplier: 2,
        retryableErrors: [/network/i, /timeout/i, /ECONN/i, /503/i]
    },
    QR_CODE_API: {
        maxAttempts: 2,
        baseDelayMs: 1000,
        maxDelayMs: 5000,
        backoffMultiplier: 2,
        retryableErrors: [/network/i, /timeout/i, /ECONN/i, /5\d{2}/]
    },
    COLLABORATION_API: {
        maxAttempts: 2,
        baseDelayMs: 1000,
        maxDelayMs: 5000,
        backoffMultiplier: 2,
        retryableErrors: [/network/i, /timeout/i, /ECONN/i, /503/i]
    }
} as const;

export const MS_TO_SECONDS = 1000;

export type TimeoutConfig = typeof TIMEOUTS[keyof typeof TIMEOUTS];
export type RetryConfigType = typeof SERVICE_RETRY_CONFIG[keyof typeof SERVICE_RETRY_CONFIG];
