export interface MetricData {
    name: string;
    timestamp: number;
    value: number;
    tags?: Record<string, string>;
}

export interface ServiceMetrics {
    serviceName: string;
    totalCalls: number;
    successCalls: number;
    failureCalls: number;
    timeoutCalls: number;
    rateLimitCalls: number;
    circuitBreakerOpenCount: number;
    lastError?: string;
    lastSuccessTime?: number;
    lastFailureTime?: number;
    averageResponseTime?: number;
}

export interface HealthCheckResult {
    serviceName: string;
    healthy: boolean;
    message: string;
    metrics: ServiceMetrics;
    checkedAt: number;
}
