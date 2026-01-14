export const CIRCUIT_BREAKER_CONFIG = {
    EMAIL_SERVICE: {
        failureThreshold: 5,
        resetTimeoutMs: 60000,
        monitoringPeriodMs: 60000
    },
    AUTH_SERVICE: {
        failureThreshold: 50,
        resetTimeoutMs: 60000,
        monitoringPeriodMs: 60000
    }
} as const;

export type CircuitBreakerConfig = typeof CIRCUIT_BREAKER_CONFIG[keyof typeof CIRCUIT_BREAKER_CONFIG];
