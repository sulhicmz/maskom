export const TIMEOUTS = {
    AUTH_LOGIN: 5000,
    AUTH_REGISTER: 5000,
    EMAIL_SERVICE: 10000,
    API_ROUTE: 5000,
} as const;

export const RETRY_CONFIG = {
    MAX_ATTEMPTS: 3,
    BASE_DELAY_MS: 1000,
    MAX_DELAY_MS: 10000,
    BACKOFF_MULTIPLIER: 2,
} as const;

export const MS_TO_SECONDS = 1000;

export type TimeoutConfig = typeof TIMEOUTS[keyof typeof TIMEOUTS];
