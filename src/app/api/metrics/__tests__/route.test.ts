jest.mock('@/utils/metrics', () => ({
    __esModule: true,
    default: {
        recordCall: jest.fn(),
        recordLatency: jest.fn(),
        recordError: jest.fn(),
        getAllMetrics: jest.fn(),
        getAllHealthChecks: jest.fn(),
        getSuccessRate: jest.fn()
    }
}));

import { GET } from '../route';
import metricsCollector from '@/utils/metrics';
import { CIRCUIT_BREAKER_CONFIG } from '@/constants';

describe('/api/metrics - Critical Path Testing', () => {
    beforeEach(() => {
        jest.clearAllMocks();
    });

    afterEach(() => {
        jest.clearAllMocks();
    });

    describe('Happy Path - Successful Metrics Retrieval', () => {
        it('should return all metrics with summary statistics', async () => {
            const mockMetrics = [
                { serviceName: 'EmailService', totalCalls: 100, successCalls: 95, failureCalls: 5, timeoutCalls: 0, rateLimitCalls: 0 },
                { serviceName: 'AuthService', totalCalls: 50, successCalls: 48, failureCalls: 2, timeoutCalls: 0, rateLimitCalls: 0 },
                { serviceName: 'Collaboration', totalCalls: 200, successCalls: 190, failureCalls: 10, timeoutCalls: 0, rateLimitCalls: 0 }
            ];

            (metricsCollector.getAllMetrics as jest.Mock).mockReturnValue(mockMetrics);
            (metricsCollector.getSuccessRate as jest.Mock)
                .mockReturnValueOnce(0.95)
                .mockReturnValueOnce(0.96)
                .mockReturnValueOnce(0.95);

            const result = await GET();
            const resultJson = await result.json();

            expect(resultJson.success).toBe(true);
            expect(resultJson.data).toBeDefined();
            expect(resultJson.data.timestamp).toBeDefined();
            expect(resultJson.data.summary).toBeDefined();
            expect(resultJson.data.summary.totalServices).toBe(3);
            expect(resultJson.data.summary.totalCalls).toBe(350);
            expect(resultJson.data.summary.totalSuccesses).toBe(333);
            expect(resultJson.data.summary.totalFailures).toBe(17);
            expect(resultJson.data.summary.totalTimeouts).toBe(0);
            expect(resultJson.data.summary.totalRateLimits).toBe(0);
            expect(resultJson.data.services).toBeDefined();
            expect(resultJson.data.services.length).toBe(3);
            expect(result.status).toBe(200);
        });

        it('should calculate success rate percentage for each service', async () => {
            const mockMetrics = [
                { serviceName: 'EmailService', totalCalls: 100, successCalls: 95, failureCalls: 5, timeoutCalls: 0, rateLimitCalls: 0 },
                { serviceName: 'AuthService', totalCalls: 50, successCalls: 48, failureCalls: 2, timeoutCalls: 0, rateLimitCalls: 0 }
            ];

            (metricsCollector.getAllMetrics as jest.Mock).mockReturnValue(mockMetrics);
            (metricsCollector.getSuccessRate as jest.Mock)
                .mockReturnValueOnce(0.95)
                .mockReturnValueOnce(0.96);

            const result = await GET();
            const resultJson = await result.json();

            expect(resultJson.data.services[0].successRate).toBe(95);
            expect(resultJson.data.services[1].successRate).toBe(96);
            expect(metricsCollector.getSuccessRate).toHaveBeenCalledWith('EmailService');
            expect(metricsCollector.getSuccessRate).toHaveBeenCalledWith('AuthService');
        });

        it('should classify service health based on success rate (healthy >= 90%)', async () => {
            const mockMetrics = [
                { serviceName: 'EmailService', totalCalls: 100, successCalls: 95, failureCalls: 5, timeoutCalls: 0, rateLimitCalls: 0 }
            ];

            (metricsCollector.getAllMetrics as jest.Mock).mockReturnValue(mockMetrics);
            (metricsCollector.getSuccessRate as jest.Mock).mockReturnValue(0.95);

            const result = await GET();
            const resultJson = await result.json();

            expect(resultJson.data.services[0].health).toBe('healthy');
        });

        it('should classify service health as degraded (70% <= success rate < 90%)', async () => {
            const mockMetrics = [
                { serviceName: 'EmailService', totalCalls: 100, successCalls: 80, failureCalls: 20, timeoutCalls: 0, rateLimitCalls: 0 }
            ];

            (metricsCollector.getAllMetrics as jest.Mock).mockReturnValue(mockMetrics);
            (metricsCollector.getSuccessRate as jest.Mock).mockReturnValue(0.80);

            const result = await GET();
            const resultJson = await result.json();

            expect(resultJson.data.services[0].health).toBe('degraded');
        });

        it('should classify service health as unhealthy (success rate < 70%)', async () => {
            const mockMetrics = [
                { serviceName: 'EmailService', totalCalls: 100, successCalls: 60, failureCalls: 40, timeoutCalls: 0, rateLimitCalls: 0 }
            ];

            (metricsCollector.getAllMetrics as jest.Mock).mockReturnValue(mockMetrics);
            (metricsCollector.getSuccessRate as jest.Mock).mockReturnValue(0.60);

            const result = await GET();
            const resultJson = await result.json();

            expect(resultJson.data.services[0].health).toBe('unhealthy');
        });

        it('should return valid ISO 8601 timestamp', async () => {
            const mockMetrics = [
                { serviceName: 'EmailService', totalCalls: 100, successCalls: 95, failureCalls: 5, timeoutCalls: 0, rateLimitCalls: 0 }
            ];

            (metricsCollector.getAllMetrics as jest.Mock).mockReturnValue(mockMetrics);
            (metricsCollector.getSuccessRate as jest.Mock).mockReturnValue(0.95);

            const result = await GET();
            const resultJson = await result.json();

            expect(resultJson.data.timestamp).toMatch(/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}\.\d{3}Z$/);
        });

        it('should include success message', async () => {
            const mockMetrics = [
                { serviceName: 'EmailService', totalCalls: 100, successCalls: 95, failureCalls: 5, timeoutCalls: 0, rateLimitCalls: 0 }
            ];

            (metricsCollector.getAllMetrics as jest.Mock).mockReturnValue(mockMetrics);
            (metricsCollector.getSuccessRate as jest.Mock).mockReturnValue(0.95);

            const result = await GET();
            const resultJson = await result.json();

            expect(resultJson.message).toBe('Metrics retrieved successfully');
        });

        it('should record metrics call', async () => {
            const mockMetrics = [
                { serviceName: 'EmailService', totalCalls: 100, successCalls: 95, failureCalls: 5, timeoutCalls: 0, rateLimitCalls: 0 }
            ];

            (metricsCollector.getAllMetrics as jest.Mock).mockReturnValue(mockMetrics);
            (metricsCollector.getSuccessRate as jest.Mock).mockReturnValue(0.95);

            await GET();

            expect(metricsCollector.recordCall).toHaveBeenCalledWith('Metrics.GET', true, undefined, expect.any(Number));
        });
    });

    describe('Edge Cases - Metrics States', () => {
        it('should handle empty metrics array', async () => {
            (metricsCollector.getAllMetrics as jest.Mock).mockReturnValue([]);

            const result = await GET();
            const resultJson = await result.json();

            expect(resultJson.data.summary.totalServices).toBe(0);
            expect(resultJson.data.summary.totalCalls).toBe(0);
            expect(resultJson.data.summary.totalSuccesses).toBe(0);
            expect(resultJson.data.summary.totalFailures).toBe(0);
            expect(resultJson.data.summary.totalTimeouts).toBe(0);
            expect(resultJson.data.summary.totalRateLimits).toBe(0);
            expect(resultJson.data.services).toEqual([]);
            expect(result.status).toBe(200);
        });

        it('should handle services with zero calls', async () => {
            const mockMetrics = [
                { serviceName: 'EmailService', totalCalls: 0, successCalls: 0, failureCalls: 0, timeoutCalls: 0, rateLimitCalls: 0 }
            ];

            (metricsCollector.getAllMetrics as jest.Mock).mockReturnValue(mockMetrics);
            (metricsCollector.getSuccessRate as jest.Mock).mockReturnValue(0);

            const result = await GET();
            const resultJson = await result.json();

            expect(resultJson.data.summary.totalCalls).toBe(0);
            expect(resultJson.data.services[0].successRate).toBe(0);
            expect(resultJson.data.services[0].health).toBe('unhealthy');
            expect(result.status).toBe(200);
        });

        it('should handle services with timeouts and rate limits', async () => {
            const mockMetrics = [
                { serviceName: 'EmailService', totalCalls: 100, successCalls: 85, failureCalls: 5, timeoutCalls: 5, rateLimitCalls: 5 }
            ];

            (metricsCollector.getAllMetrics as jest.Mock).mockReturnValue(mockMetrics);
            (metricsCollector.getSuccessRate as jest.Mock).mockReturnValue(0.85);

            const result = await GET();
            const resultJson = await result.json();

            expect(resultJson.data.summary.totalTimeouts).toBe(5);
            expect(resultJson.data.summary.totalRateLimits).toBe(5);
            expect(resultJson.data.services[0].timeoutCalls).toBe(5);
            expect(resultJson.data.services[0].rateLimitCalls).toBe(5);
            expect(result.status).toBe(200);
        });

        it('should round success rate to 2 decimal places', async () => {
            const mockMetrics = [
                { serviceName: 'EmailService', totalCalls: 100, successCalls: 93, failureCalls: 7, timeoutCalls: 0, rateLimitCalls: 0 }
            ];

            (metricsCollector.getAllMetrics as jest.Mock).mockReturnValue(mockMetrics);
            (metricsCollector.getSuccessRate as jest.Mock).mockReturnValue(0.933333);

            const result = await GET();
            const resultJson = await result.json();

            expect(resultJson.data.services[0].successRate).toBe(93.33);
        });

        it('should handle boundary success rate (exactly 90%)', async () => {
            const mockMetrics = [
                { serviceName: 'EmailService', totalCalls: 100, successCalls: 90, failureCalls: 10, timeoutCalls: 0, rateLimitCalls: 0 }
            ];

            (metricsCollector.getAllMetrics as jest.Mock).mockReturnValue(mockMetrics);
            (metricsCollector.getSuccessRate as jest.Mock).mockReturnValue(0.90);

            const result = await GET();
            const resultJson = await result.json();

            expect(resultJson.data.services[0].health).toBe('healthy');
        });

        it('should handle boundary success rate (exactly 70%)', async () => {
            const mockMetrics = [
                { serviceName: 'EmailService', totalCalls: 100, successCalls: 70, failureCalls: 30, timeoutCalls: 0, rateLimitCalls: 0 }
            ];

            (metricsCollector.getAllMetrics as jest.Mock).mockReturnValue(mockMetrics);
            (metricsCollector.getSuccessRate as jest.Mock).mockReturnValue(0.70);

            const result = await GET();
            const resultJson = await result.json();

            expect(resultJson.data.services[0].health).toBe('degraded');
        });
    });

    describe('Resilience - Circuit Breaker Integration', () => {
        it('should use executeApiRoute wrapper for resilience', async () => {
            const mockMetrics = [
                { serviceName: 'EmailService', totalCalls: 100, successCalls: 95, failureCalls: 5, timeoutCalls: 0, rateLimitCalls: 0 }
            ];

            (metricsCollector.getAllMetrics as jest.Mock).mockReturnValue(mockMetrics);
            (metricsCollector.getSuccessRate as jest.Mock).mockReturnValue(0.95);

            await GET();

            expect(metricsCollector.recordCall).toHaveBeenCalledWith('Metrics.GET', true, undefined, expect.any(Number));
        });

        it('should use CIRCUIT_BREAKER_CONFIG.API_ROUTES.METRICS config', async () => {
            expect(CIRCUIT_BREAKER_CONFIG.API_ROUTES.METRICS).toBeDefined();
            expect(CIRCUIT_BREAKER_CONFIG.API_ROUTES.METRICS).toEqual({
                failureThreshold: 3,
                resetTimeoutMs: 30000,
                monitoringPeriodMs: 60000
            });
        });
    });

    describe('Error Scenarios', () => {
        it('should handle getAllMetrics error gracefully', async () => {
            (metricsCollector.getAllMetrics as jest.Mock).mockImplementation(() => {
                throw new Error('Metrics retrieval failed');
            });

            const result = await GET();
            const resultJson = await result.json();

            expect(resultJson.success).toBe(false);
            expect(resultJson.error).toBe('Metrics retrieval failed');
            expect(result.status).toBe(500);
        });

        it('should handle getSuccessRate error gracefully', async () => {
            const mockMetrics = [
                { serviceName: 'EmailService', totalCalls: 100, successCalls: 95, failureCalls: 5, timeoutCalls: 0, rateLimitCalls: 0 }
            ];

            (metricsCollector.getAllMetrics as jest.Mock).mockReturnValue(mockMetrics);
            (metricsCollector.getSuccessRate as jest.Mock).mockImplementation(() => {
                throw new Error('Success rate calculation failed');
            });

            const result = await GET();
            const resultJson = await result.json();

            expect(resultJson.success).toBe(false);
            expect(resultJson.error).toBe('Success rate calculation failed');
        });
    });

    describe('Resilience - Circuit Breaker Integration', () => {
        it('should use executeApiRoute wrapper for resilience', async () => {
            const mockMetrics = [
                { serviceName: 'EmailService', totalCalls: 100, successCalls: 95, failureCalls: 5, timeoutCalls: 0, rateLimitCalls: 0 }
            ];

            (metricsCollector.getAllMetrics as jest.Mock).mockReturnValue(mockMetrics);
            (metricsCollector.getSuccessRate as jest.Mock).mockReturnValue(0.95);

            await GET();

            expect(metricsCollector.recordCall).toHaveBeenCalledWith('Metrics.GET', true, undefined, expect.any(Number));
        });

        it('should use CIRCUIT_BREAKER_CONFIG.API_ROUTES.METRICS config', async () => {
            expect(CIRCUIT_BREAKER_CONFIG.API_ROUTES.METRICS).toBeDefined();
            expect(CIRCUIT_BREAKER_CONFIG.API_ROUTES.METRICS).toEqual({
                failureThreshold: 3,
                resetTimeoutMs: 30000,
                monitoringPeriodMs: 60000
            });
        });
    });
});
