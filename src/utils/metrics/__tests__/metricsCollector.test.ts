import metricsCollector from '../metricsCollector';

describe('MetricsCollector', () => {
    beforeEach(() => {
        metricsCollector.resetAll();
    });

    describe('recordCall', () => {
        it('should record successful call', () => {
            metricsCollector.recordCall('TestService', true);
            const metrics = metricsCollector.getMetrics('TestService');

            expect(metrics).toBeDefined();
            expect(metrics?.totalCalls).toBe(1);
            expect(metrics?.successCalls).toBe(1);
            expect(metrics?.failureCalls).toBe(0);
        });

        it('should record failed call with error type', () => {
            metricsCollector.recordCall('TestService', false, 'timeout');
            const metrics = metricsCollector.getMetrics('TestService');

            expect(metrics?.totalCalls).toBe(1);
            expect(metrics?.successCalls).toBe(0);
            expect(metrics?.failureCalls).toBe(1);
            expect(metrics?.timeoutCalls).toBe(1);
            expect(metrics?.lastError).toBe('timeout');
        });

        it('should record failed call with rate limit error', () => {
            metricsCollector.recordCall('TestService', false, 'rate_limit');
            const metrics = metricsCollector.getMetrics('TestService');

            expect(metrics?.rateLimitCalls).toBe(1);
        });

        it('should record failed call without error type', () => {
            metricsCollector.recordCall('TestService', false);
            const metrics = metricsCollector.getMetrics('TestService');

            expect(metrics?.lastError).toBe('Unknown error');
        });

        it('should record response time', () => {
            metricsCollector.recordCall('TestService', true, undefined, 150);
            const metrics = metricsCollector.getMetrics('TestService');

            expect(metrics?.averageResponseTime).toBe(150);
        });

        it('should calculate average response time across multiple calls', () => {
            metricsCollector.recordCall('TestService', true, undefined, 100);
            metricsCollector.recordCall('TestService', true, undefined, 200);
            metricsCollector.recordCall('TestService', true, undefined, 300);
            const metrics = metricsCollector.getMetrics('TestService');

            expect(metrics?.averageResponseTime).toBe(200);
        });

        it('should keep only last 100 response time samples', () => {
            for (let i = 0; i < 150; i++) {
                metricsCollector.recordCall('TestService', true, undefined, i);
            }
            const metrics = metricsCollector.getMetrics('TestService');

            expect(metrics?.totalCalls).toBe(150);
        });
    });

    describe('recordCircuitBreakerState', () => {
        it('should record circuit breaker open state', () => {
            metricsCollector.recordCircuitBreakerState('TestService', true);
            const metrics = metricsCollector.getMetrics('TestService');

            expect(metrics?.circuitBreakerOpenCount).toBe(1);
        });

        it('should not increment for closed state', () => {
            metricsCollector.recordCircuitBreakerState('TestService', false);
            const metrics = metricsCollector.getMetrics('TestService');

            expect(metrics?.circuitBreakerOpenCount).toBe(0);
        });

        it('should count multiple circuit breaker opens', () => {
            metricsCollector.recordCircuitBreakerState('TestService', true);
            metricsCollector.recordCircuitBreakerState('TestService', true);
            const metrics = metricsCollector.getMetrics('TestService');

            expect(metrics?.circuitBreakerOpenCount).toBe(2);
        });
    });

    describe('getMetrics', () => {
        it('should return undefined for non-existent service', () => {
            const metrics = metricsCollector.getMetrics('NonExistentService');
            expect(metrics).toBeUndefined();
        });

        it('should return metrics for existing service', () => {
            metricsCollector.recordCall('TestService', true);
            const metrics = metricsCollector.getMetrics('TestService');

            expect(metrics).toBeDefined();
            expect(metrics?.serviceName).toBe('TestService');
        });

        it('should return all required metrics properties', () => {
            metricsCollector.recordCall('TestService', true);
            const metrics = metricsCollector.getMetrics('TestService');

            expect(metrics).toMatchObject({
                serviceName: 'TestService',
                totalCalls: expect.any(Number),
                successCalls: expect.any(Number),
                failureCalls: expect.any(Number),
                timeoutCalls: expect.any(Number),
                rateLimitCalls: expect.any(Number),
                circuitBreakerOpenCount: expect.any(Number),
            });
        });
    });

    describe('getAllMetrics', () => {
        it('should return empty array when no metrics recorded', () => {
            const allMetrics = metricsCollector.getAllMetrics();
            expect(allMetrics).toEqual([]);
        });

        it('should return metrics for all services', () => {
            metricsCollector.recordCall('ServiceA', true);
            metricsCollector.recordCall('ServiceB', false, 'timeout');
            const allMetrics = metricsCollector.getAllMetrics();

            expect(allMetrics).toHaveLength(2);
            expect(allMetrics.map(m => m.serviceName)).toContain('ServiceA');
            expect(allMetrics.map(m => m.serviceName)).toContain('ServiceB');
        });
    });

    describe('getSuccessRate', () => {
        it('should return 1 for service with no calls', () => {
            const successRate = metricsCollector.getSuccessRate('TestService');
            expect(successRate).toBe(1);
        });

        it('should return 1 for all successful calls', () => {
            metricsCollector.recordCall('TestService', true);
            metricsCollector.recordCall('TestService', true);
            const successRate = metricsCollector.getSuccessRate('TestService');
            expect(successRate).toBe(1);
        });

        it('should return 0 for all failed calls', () => {
            metricsCollector.recordCall('TestService', false);
            metricsCollector.recordCall('TestService', false);
            const successRate = metricsCollector.getSuccessRate('TestService');
            expect(successRate).toBe(0);
        });

        it('should calculate correct success rate', () => {
            metricsCollector.recordCall('TestService', true);
            metricsCollector.recordCall('TestService', true);
            metricsCollector.recordCall('TestService', false);
            const successRate = metricsCollector.getSuccessRate('TestService');
            expect(successRate).toBeCloseTo(0.6667, 3);
        });
    });

    describe('getFailureRate', () => {
        it('should return 0 for service with no calls', () => {
            const failureRate = metricsCollector.getFailureRate('TestService');
            expect(failureRate).toBe(0);
        });

        it('should return 1 - success rate', () => {
            metricsCollector.recordCall('TestService', true);
            metricsCollector.recordCall('TestService', true);
            metricsCollector.recordCall('TestService', false);
            const failureRate = metricsCollector.getFailureRate('TestService');
            expect(failureRate).toBeCloseTo(0.3333, 3);
        });
    });

    describe('healthCheck', () => {
        it('should return healthy for service with no calls', () => {
            const healthCheck = metricsCollector.healthCheck('TestService');
            expect(healthCheck.healthy).toBe(true);
            expect(healthCheck.message).toBe('No calls recorded yet');
        });

        it('should return healthy for service above threshold', () => {
            metricsCollector.recordCall('TestService', true);
            metricsCollector.recordCall('TestService', true);
            metricsCollector.recordCall('TestService', false);
            const healthCheck = metricsCollector.healthCheck('TestService', 0.6);
            expect(healthCheck.healthy).toBe(true);
            expect(healthCheck.message).toContain('healthy');
        });

        it('should return unhealthy for service below threshold', () => {
            metricsCollector.recordCall('TestService', true);
            metricsCollector.recordCall('TestService', false);
            metricsCollector.recordCall('TestService', false);
            const healthCheck = metricsCollector.healthCheck('TestService', 0.8);
            expect(healthCheck.healthy).toBe(false);
            expect(healthCheck.message).toContain('degraded');
        });

        it('should return health check result with all properties', () => {
            metricsCollector.recordCall('TestService', true);
            const healthCheck = metricsCollector.healthCheck('TestService');

            expect(healthCheck).toMatchObject({
                serviceName: 'TestService',
                healthy: expect.any(Boolean),
                message: expect.any(String),
                metrics: expect.any(Object),
                checkedAt: expect.any(Number),
            });
        });
    });

    describe('getAllHealthChecks', () => {
        it('should return empty array when no metrics recorded', () => {
            const healthChecks = metricsCollector.getAllHealthChecks();
            expect(healthChecks).toEqual([]);
        });

        it('should return health checks for all services', () => {
            metricsCollector.recordCall('ServiceA', true);
            metricsCollector.recordCall('ServiceB', false);
            const healthChecks = metricsCollector.getAllHealthChecks();

            expect(healthChecks).toHaveLength(2);
            expect(healthChecks.map(h => h.serviceName)).toContain('ServiceA');
            expect(healthChecks.map(h => h.serviceName)).toContain('ServiceB');
        });
    });

    describe('reset', () => {
        it('should reset metrics for specific service', () => {
            metricsCollector.recordCall('TestService', true);
            metricsCollector.recordCall('TestService', false);
            metricsCollector.reset('TestService');
            const metrics = metricsCollector.getMetrics('TestService');

            expect(metrics).toBeUndefined();
        });

        it('should not reset other services', () => {
            metricsCollector.recordCall('ServiceA', true);
            metricsCollector.recordCall('ServiceB', true);
            metricsCollector.reset('ServiceA');
            const metricsB = metricsCollector.getMetrics('ServiceB');

            expect(metricsB).toBeDefined();
            expect(metricsB?.totalCalls).toBe(1);
        });
    });

    describe('resetAll', () => {
        it('should reset all metrics', () => {
            metricsCollector.recordCall('ServiceA', true);
            metricsCollector.recordCall('ServiceB', false);
            metricsCollector.resetAll();

            expect(metricsCollector.getAllMetrics()).toEqual([]);
        });
    });

    describe('exportMetrics', () => {
        it('should export empty array when no metrics recorded', () => {
            const exported = metricsCollector.exportMetrics();
            expect(exported).toEqual([]);
        });

        it('should export metrics as MetricData array', () => {
            metricsCollector.recordCall('TestService', true, undefined, 150);
            const exported = metricsCollector.exportMetrics();

            expect(Array.isArray(exported)).toBe(true);
            expect(exported.length).toBeGreaterThan(0);
            expect(exported[0]).toMatchObject({
                name: expect.any(String),
                timestamp: expect.any(Number),
                value: expect.any(Number),
                tags: expect.any(Object),
            });
        });

        it('should export total_calls metric', () => {
            metricsCollector.recordCall('TestService', true);
            const exported = metricsCollector.exportMetrics();

            const totalCallsMetric = exported.find(m => m.name === 'TestService.total_calls');
            expect(totalCallsMetric).toBeDefined();
            expect(totalCallsMetric?.value).toBe(1);
        });

        it('should export success_calls metric', () => {
            metricsCollector.recordCall('TestService', true);
            const exported = metricsCollector.exportMetrics();

            const successCallsMetric = exported.find(m => m.name === 'TestService.success_calls');
            expect(successCallsMetric).toBeDefined();
            expect(successCallsMetric?.value).toBe(1);
        });

        it('should export failure_calls metric', () => {
            metricsCollector.recordCall('TestService', false, 'timeout');
            const exported = metricsCollector.exportMetrics();

            const failureCallsMetric = exported.find(m => m.name === 'TestService.failure_calls');
            expect(failureCallsMetric).toBeDefined();
            expect(failureCallsMetric?.value).toBe(1);
        });

        it('should export timeout_calls metric', () => {
            metricsCollector.recordCall('TestService', false, 'timeout');
            const exported = metricsCollector.exportMetrics();

            const timeoutCallsMetric = exported.find(m => m.name === 'TestService.timeout_calls');
            expect(timeoutCallsMetric).toBeDefined();
            expect(timeoutCallsMetric?.value).toBe(1);
        });

        it('should export rate_limit_calls metric', () => {
            metricsCollector.recordCall('TestService', false, 'rate_limit');
            const exported = metricsCollector.exportMetrics();

            const rateLimitCallsMetric = exported.find(m => m.name === 'TestService.rate_limit_calls');
            expect(rateLimitCallsMetric).toBeDefined();
            expect(rateLimitCallsMetric?.value).toBe(1);
        });

        it('should export circuit_breaker_open_count metric', () => {
            metricsCollector.recordCircuitBreakerState('TestService', true);
            const exported = metricsCollector.exportMetrics();

            const circuitBreakerMetric = exported.find(m => m.name === 'TestService.circuit_breaker_open_count');
            expect(circuitBreakerMetric).toBeDefined();
            expect(circuitBreakerMetric?.value).toBe(1);
        });

        it('should export average_response_time metric', () => {
            metricsCollector.recordCall('TestService', true, undefined, 150);
            const exported = metricsCollector.exportMetrics();

            const avgResponseTimeMetric = exported.find(m => m.name === 'TestService.average_response_time');
            expect(avgResponseTimeMetric).toBeDefined();
            expect(avgResponseTimeMetric?.value).toBe(150);
        });
    });

    describe('Edge Cases', () => {
        it('should handle very high response times', () => {
            metricsCollector.recordCall('TestService', true, undefined, 100000);
            const metrics = metricsCollector.getMetrics('TestService');

            expect(metrics?.averageResponseTime).toBe(100000);
        });

        it('should handle zero response time', () => {
            metricsCollector.recordCall('TestService', true, undefined, 0);
            const metrics = metricsCollector.getMetrics('TestService');

            expect(metrics?.averageResponseTime).toBe(0);
        });

        it('should handle special characters in service name', () => {
            metricsCollector.recordCall('Service-Name_123', true);
            const metrics = metricsCollector.getMetrics('Service-Name_123');

            expect(metrics).toBeDefined();
            expect(metrics?.serviceName).toBe('Service-Name_123');
        });
    });
});
