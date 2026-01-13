import { MetricsCollector, type IMetricsCollector } from '../metricsCollector';
import { describe, it, expect, beforeEach } from '@jest/globals';

describe('MetricsCollector Interface Contract', () => {
    let metricsCollectorInstance: IMetricsCollector;

    beforeEach(() => {
        metricsCollectorInstance = new MetricsCollector();
    });

    it('should implement IMetricsCollector interface correctly', () => {
        expect(metricsCollectorInstance).toBeDefined();
        expect(typeof metricsCollectorInstance.recordCall).toBe('function');
        expect(typeof metricsCollectorInstance.recordCircuitBreakerState).toBe('function');
        expect(typeof metricsCollectorInstance.getMetrics).toBe('function');
        expect(typeof metricsCollectorInstance.getAllMetrics).toBe('function');
        expect(typeof metricsCollectorInstance.getSuccessRate).toBe('function');
        expect(typeof metricsCollectorInstance.getFailureRate).toBe('function');
        expect(typeof metricsCollectorInstance.healthCheck).toBe('function');
        expect(typeof metricsCollectorInstance.getAllHealthChecks).toBe('function');
        expect(typeof metricsCollectorInstance.reset).toBe('function');
        expect(typeof metricsCollectorInstance.resetAll).toBe('function');
        expect(typeof metricsCollectorInstance.exportMetrics).toBe('function');
    });

    it('should record successful calls', () => {
        metricsCollectorInstance.recordCall('TestService', true, undefined, 100);
        
        const metrics = metricsCollectorInstance.getMetrics('TestService');
        expect(metrics).toBeDefined();
        expect(metrics?.totalCalls).toBe(1);
        expect(metrics?.successCalls).toBe(1);
        expect(metrics?.failureCalls).toBe(0);
    });

    it('should record failed calls', () => {
        metricsCollectorInstance.recordCall('TestService', false, 'network_error', 200);
        
        const metrics = metricsCollectorInstance.getMetrics('TestService');
        expect(metrics?.totalCalls).toBe(1);
        expect(metrics?.successCalls).toBe(0);
        expect(metrics?.failureCalls).toBe(1);
        expect(metrics?.lastError).toBe('network_error');
    });

    it('should record circuit breaker state', () => {
        metricsCollectorInstance.recordCircuitBreakerState('TestService', true);
        
        const metrics = metricsCollectorInstance.getMetrics('TestService');
        expect(metrics?.circuitBreakerOpenCount).toBe(1);
    });

    it('should calculate success rate', () => {
        metricsCollectorInstance.recordCall('TestService', true);
        metricsCollectorInstance.recordCall('TestService', false);
        
        const successRate = metricsCollectorInstance.getSuccessRate('TestService');
        expect(successRate).toBe(0.5);
    });

    it('should calculate failure rate', () => {
        metricsCollectorInstance.recordCall('TestService', true);
        metricsCollectorInstance.recordCall('TestService', false);
        
        const failureRate = metricsCollectorInstance.getFailureRate('TestService');
        expect(failureRate).toBe(0.5);
    });

    it('should perform health check', () => {
        metricsCollectorInstance.recordCall('TestService', true);
        metricsCollectorInstance.recordCall('TestService', true);
        metricsCollectorInstance.recordCall('TestService', false);
        
        const healthCheck = metricsCollectorInstance.healthCheck('TestService', 0.6);
        expect(healthCheck).toBeDefined();
        expect(healthCheck).toHaveProperty('serviceName');
        expect(healthCheck).toHaveProperty('healthy');
        expect(healthCheck).toHaveProperty('message');
        expect(healthCheck).toHaveProperty('metrics');
        expect(healthCheck).toHaveProperty('checkedAt');
        expect(healthCheck.serviceName).toBe('TestService');
    });

    it('should get all health checks', () => {
        metricsCollectorInstance.recordCall('ServiceA', true);
        metricsCollectorInstance.recordCall('ServiceB', false);
        
        const allHealthChecks = metricsCollectorInstance.getAllHealthChecks(0.5);
        expect(allHealthChecks).toHaveLength(2);
        expect(allHealthChecks[0].serviceName).toBe('ServiceA');
        expect(allHealthChecks[1].serviceName).toBe('ServiceB');
    });

    it('should get all metrics', () => {
        metricsCollectorInstance.recordCall('ServiceA', true);
        metricsCollectorInstance.recordCall('ServiceB', true);
        
        const allMetrics = metricsCollectorInstance.getAllMetrics();
        expect(allMetrics).toHaveLength(2);
        expect(allMetrics[0].serviceName).toBe('ServiceA');
        expect(allMetrics[1].serviceName).toBe('ServiceB');
    });

    it('should reset specific service metrics', () => {
        metricsCollectorInstance.recordCall('TestService', true);
        metricsCollectorInstance.reset('TestService');
        
        const metrics = metricsCollectorInstance.getMetrics('TestService');
        expect(metrics).toBeUndefined();
    });

    it('should reset all metrics', () => {
        metricsCollectorInstance.recordCall('ServiceA', true);
        metricsCollectorInstance.recordCall('ServiceB', true);
        metricsCollectorInstance.resetAll();
        
        expect(metricsCollectorInstance.getAllMetrics()).toHaveLength(0);
    });

    it('should export metrics correctly', () => {
        metricsCollectorInstance.recordCall('TestService', true, undefined, 150);
        
        const exportedMetrics = metricsCollectorInstance.exportMetrics();
        expect(exportedMetrics.length).toBeGreaterThan(0);
        expect(exportedMetrics[0]).toHaveProperty('name');
        expect(exportedMetrics[0]).toHaveProperty('timestamp');
        expect(exportedMetrics[0]).toHaveProperty('value');
        expect(exportedMetrics[0]).toHaveProperty('tags');
    });

    it('should handle response time tracking', () => {
        metricsCollectorInstance.recordCall('TestService', true, undefined, 100);
        metricsCollectorInstance.recordCall('TestService', true, undefined, 200);
        
        const metrics = metricsCollectorInstance.getMetrics('TestService');
        expect(metrics?.averageResponseTime).toBe(150);
    });

    it('should return undefined for non-existent service', () => {
        const metrics = metricsCollectorInstance.getMetrics('NonExistentService');
        expect(metrics).toBeUndefined();
    });

    it('should handle zero calls in success rate calculation', () => {
        const successRate = metricsCollectorInstance.getSuccessRate('NewService');
        expect(successRate).toBe(1);
    });
});
