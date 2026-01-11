import type { MetricData, ServiceMetrics, HealthCheckResult } from './types';

class MetricsCollector {
    private metrics: Map<string, ServiceMetrics>;
    private responseTimes: Map<string, number[]>;
    private maxResponseTimeSamples: number;

    constructor() {
        this.metrics = new Map();
        this.responseTimes = new Map();
        this.maxResponseTimeSamples = 100;
    }

    recordCall(serviceName: string, success: boolean, errorType?: string, responseTime?: number): void {
        const metrics = this.getOrCreateMetrics(serviceName);

        metrics.totalCalls++;
        
        if (success) {
            metrics.successCalls++;
            metrics.lastSuccessTime = Date.now();
        } else {
            metrics.failureCalls++;
            metrics.lastFailureTime = Date.now();
            metrics.lastError = errorType || 'Unknown error';
            
            if (errorType === 'timeout') {
                metrics.timeoutCalls++;
            } else if (errorType === 'rate_limit') {
                metrics.rateLimitCalls++;
            }
        }

        if (responseTime !== undefined) {
            this.recordResponseTime(serviceName, responseTime);
        }

        this.metrics.set(serviceName, metrics);
    }

    recordCircuitBreakerState(serviceName: string, isOpen: boolean): void {
        const metrics = this.getOrCreateMetrics(serviceName);
        
        if (isOpen) {
            metrics.circuitBreakerOpenCount++;
        }

        this.metrics.set(serviceName, metrics);
    }

    private recordResponseTime(serviceName: string, responseTime: number): void {
        const times = this.responseTimes.get(serviceName) || [];
        times.push(responseTime);

        if (times.length > this.maxResponseTimeSamples) {
            times.shift();
        }

        this.responseTimes.set(serviceName, times);

        const metrics = this.getOrCreateMetrics(serviceName);
        metrics.averageResponseTime = this.calculateAverage(times);
        this.metrics.set(serviceName, metrics);
    }

    private calculateAverage(times: number[]): number {
        if (times.length === 0) return 0;
        const sum = times.reduce((acc, val) => acc + val, 0);
        return Math.round(sum / times.length);
    }

    getOrCreateMetrics(serviceName: string): ServiceMetrics {
        if (!this.metrics.has(serviceName)) {
            this.metrics.set(serviceName, {
                serviceName,
                totalCalls: 0,
                successCalls: 0,
                failureCalls: 0,
                timeoutCalls: 0,
                rateLimitCalls: 0,
                circuitBreakerOpenCount: 0,
            });
        }
        return this.metrics.get(serviceName)!;
    }

    getMetrics(serviceName: string): ServiceMetrics | undefined {
        return this.metrics.get(serviceName);
    }

    getAllMetrics(): ServiceMetrics[] {
        return Array.from(this.metrics.values());
    }

    getSuccessRate(serviceName: string): number {
        const metrics = this.metrics.get(serviceName);
        if (!metrics || metrics.totalCalls === 0) return 1;
        return metrics.successCalls / metrics.totalCalls;
    }

    getFailureRate(serviceName: string): number {
        return 1 - this.getSuccessRate(serviceName);
    }

    healthCheck(serviceName: string, thresholdSuccessRate: number = 0.8): HealthCheckResult {
        const metrics = this.getOrCreateMetrics(serviceName);
        const successRate = this.getSuccessRate(serviceName);
        const healthy = successRate >= thresholdSuccessRate;

        let message = '';
        if (metrics.totalCalls === 0) {
            message = 'No calls recorded yet';
        } else if (healthy) {
            message = `Service healthy (success rate: ${(successRate * 100).toFixed(1)}%)`;
        } else {
            message = `Service degraded (success rate: ${(successRate * 100).toFixed(1)}% < ${(thresholdSuccessRate * 100).toFixed(1)}%)`;
        }

        return {
            serviceName,
            healthy,
            message,
            metrics,
            checkedAt: Date.now(),
        };
    }

    getAllHealthChecks(thresholdSuccessRate: number = 0.8): HealthCheckResult[] {
        return Array.from(this.metrics.keys()).map(serviceName => 
            this.healthCheck(serviceName, thresholdSuccessRate)
        );
    }

    reset(serviceName: string): void {
        this.metrics.delete(serviceName);
        this.responseTimes.delete(serviceName);
    }

    resetAll(): void {
        this.metrics.clear();
        this.responseTimes.clear();
    }

    exportMetrics(): MetricData[] {
        const exported: MetricData[] = [];
        
        for (const [serviceName, metrics] of this.metrics.entries()) {
            const now = Date.now();
            exported.push(
                {
                    name: `${serviceName}.total_calls`,
                    timestamp: now,
                    value: metrics.totalCalls,
                    tags: { service: serviceName },
                },
                {
                    name: `${serviceName}.success_calls`,
                    timestamp: now,
                    value: metrics.successCalls,
                    tags: { service: serviceName },
                },
                {
                    name: `${serviceName}.failure_calls`,
                    timestamp: now,
                    value: metrics.failureCalls,
                    tags: { service: serviceName },
                },
                {
                    name: `${serviceName}.timeout_calls`,
                    timestamp: now,
                    value: metrics.timeoutCalls,
                    tags: { service: serviceName },
                },
                {
                    name: `${serviceName}.rate_limit_calls`,
                    timestamp: now,
                    value: metrics.rateLimitCalls,
                    tags: { service: serviceName },
                },
                {
                    name: `${serviceName}.circuit_breaker_open_count`,
                    timestamp: now,
                    value: metrics.circuitBreakerOpenCount,
                    tags: { service: serviceName },
                }
            );

            if (metrics.averageResponseTime !== undefined) {
                exported.push({
                    name: `${serviceName}.average_response_time`,
                    timestamp: now,
                    value: metrics.averageResponseTime,
                    tags: { service: serviceName },
                });
            }
        }

        return exported;
    }
}

export const metricsCollector = new MetricsCollector();
export default metricsCollector;
