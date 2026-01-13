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

export interface IMetricsCollector {
    recordCall(serviceName: string, success: boolean, errorType?: string, responseTime?: number): void;
    recordCircuitBreakerState(serviceName: string, isOpen: boolean): void;
    getMetrics(serviceName: string): ServiceMetrics | undefined;
    getAllMetrics(): ServiceMetrics[];
    getSuccessRate(serviceName: string): number;
    getFailureRate(serviceName: string): number;
    healthCheck(serviceName: string, thresholdSuccessRate?: number): HealthCheckResult;
    getAllHealthChecks(thresholdSuccessRate?: number): HealthCheckResult[];
    reset(serviceName: string): void;
    resetAll(): void;
    exportMetrics(): MetricData[];
}
