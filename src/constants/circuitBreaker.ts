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
    },
    API_ROUTES: {
        HEALTH_CHECK: {
            failureThreshold: 3,
            resetTimeoutMs: 30000,
            monitoringPeriodMs: 60000
        },
        METRICS: {
            failureThreshold: 3,
            resetTimeoutMs: 30000,
            monitoringPeriodMs: 60000
        },
        SERVICES_STATUS: {
            failureThreshold: 3,
            resetTimeoutMs: 30000,
            monitoringPeriodMs: 60000
        }
    },
    QR_CODE_API: {
        failureThreshold: 3,
        resetTimeoutMs: 60000,
        monitoringPeriodMs: 60000
    },
    COLLABORATION_API: {
        failureThreshold: 5,
        resetTimeoutMs: 60000,
        monitoringPeriodMs: 60000
    }
} as const;

export type CircuitBreakerConfig = typeof CIRCUIT_BREAKER_CONFIG[keyof typeof CIRCUIT_BREAKER_CONFIG];
