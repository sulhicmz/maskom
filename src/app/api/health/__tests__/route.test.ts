jest.mock('@/utils/metrics', () => ({
    __esModule: true,
    default: {
        recordCall: jest.fn(),
        recordLatency: jest.fn(),
        recordError: jest.fn(),
        getAllHealthChecks: jest.fn()
    }
}));

import { NextRequest } from 'next/server';
import { GET } from '../route';
import metricsCollector from '@/utils/metrics';
import { CIRCUIT_BREAKER_CONFIG } from '@/constants';

describe('/api/health - Critical Path Testing', () => {
    beforeEach(() => {
        jest.clearAllMocks();
    });

    afterEach(() => {
        jest.clearAllMocks();
    });

    describe('Happy Path - Successful Health Check', () => {
        it('should return healthy status when all services are healthy', async () => {
            const mockHealthChecks = [
                { serviceName: 'EmailService', healthy: true, successRate: 0.95 },
                { serviceName: 'AuthService', healthy: true, successRate: 0.96 },
                { serviceName: 'Collaboration', healthy: true, successRate: 0.94 }
            ];

            (metricsCollector.getAllHealthChecks as jest.Mock).mockReturnValue(mockHealthChecks);

            const mockRequest = {
                url: 'http://localhost:3000/api/health'
            } as unknown as NextRequest;

            const result = await GET(mockRequest);
            const resultJson = await result.json();

            expect(resultJson.success).toBe(true);
            expect(resultJson.data).toBeDefined();
            expect(resultJson.data.status).toBe('healthy');
            expect(resultJson.data.timestamp).toBeDefined();
            expect(resultJson.data.services).toEqual(mockHealthChecks);
            expect(resultJson.data.summary).toBeDefined();
            expect(resultJson.data.summary.totalServices).toBe(3);
            expect(resultJson.data.summary.healthyServices).toBe(3);
            expect(resultJson.data.summary.unhealthyServices).toBe(0);
            expect(resultJson.data.summary.successRateThreshold).toBe(0.9);
            expect(result.status).toBe(200);
        });

        it('should return degraded status when one or more services are unhealthy', async () => {
            const mockHealthChecks = [
                { serviceName: 'EmailService', healthy: true, successRate: 0.95 },
                { serviceName: 'AuthService', healthy: false, successRate: 0.60 },
                { serviceName: 'Collaboration', healthy: true, successRate: 0.94 }
            ];

            (metricsCollector.getAllHealthChecks as jest.Mock).mockReturnValue(mockHealthChecks);

            const mockRequest = {
                url: 'http://localhost:3000/api/health'
            } as unknown as NextRequest;

            const result = await GET(mockRequest);
            const resultJson = await result.json();

            expect(resultJson.success).toBe(true);
            expect(resultJson.data.status).toBe('degraded');
            expect(resultJson.data.summary.healthyServices).toBe(2);
            expect(resultJson.data.summary.unhealthyServices).toBe(1);
            expect(result.status).toBe(503);
        });

        it('should use default threshold of 0.9 when not provided', async () => {
            const mockHealthChecks = [
                { serviceName: 'EmailService', healthy: true, successRate: 0.95 }
            ];

            (metricsCollector.getAllHealthChecks as jest.Mock).mockReturnValue(mockHealthChecks);

            const mockRequest = {
                url: 'http://localhost:3000/api/health'
            } as unknown as NextRequest;

            const result = await GET(mockRequest);
            const resultJson = await result.json();

            expect(resultJson.data.summary.successRateThreshold).toBe(0.9);
            expect(metricsCollector.getAllHealthChecks).toHaveBeenCalledWith(0.9);
        });

        it('should use custom threshold when provided in query params', async () => {
            const mockHealthChecks = [
                { serviceName: 'EmailService', healthy: true, successRate: 0.85 }
            ];

            (metricsCollector.getAllHealthChecks as jest.Mock).mockReturnValue(mockHealthChecks);

            const mockRequest = {
                url: 'http://localhost:3000/api/health?threshold=0.8'
            } as unknown as NextRequest;

            const result = await GET(mockRequest);
            const resultJson = await result.json();

            expect(resultJson.data.summary.successRateThreshold).toBe(0.8);
            expect(metricsCollector.getAllHealthChecks).toHaveBeenCalledWith(0.8);
        });

        it('should return valid ISO 8601 timestamp', async () => {
            const mockHealthChecks = [
                { serviceName: 'EmailService', healthy: true, successRate: 0.95 }
            ];

            (metricsCollector.getAllHealthChecks as jest.Mock).mockReturnValue(mockHealthChecks);

            const mockRequest = {
                url: 'http://localhost:3000/api/health'
            } as unknown as NextRequest;

            const result = await GET(mockRequest);
            const resultJson = await result.json();

            expect(resultJson.data.timestamp).toMatch(/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}\.\d{3}Z$/);
        });

        it('should include appropriate success message', async () => {
            const mockHealthChecks = [
                { serviceName: 'EmailService', healthy: true, successRate: 0.95 }
            ];

            (metricsCollector.getAllHealthChecks as jest.Mock).mockReturnValue(mockHealthChecks);

            const mockRequest = {
                url: 'http://localhost:3000/api/health'
            } as unknown as NextRequest;

            const result = await GET(mockRequest);
            const resultJson = await result.json();

            expect(resultJson.message).toBe('All services healthy');
        });

        it('should include degraded success message when services are unhealthy', async () => {
            const mockHealthChecks = [
                { serviceName: 'EmailService', healthy: false, successRate: 0.60 }
            ];

            (metricsCollector.getAllHealthChecks as jest.Mock).mockReturnValue(mockHealthChecks);

            const mockRequest = {
                url: 'http://localhost:3000/api/health'
            } as unknown as NextRequest;

            const result = await GET(mockRequest);
            const resultJson = await result.json();

            expect(resultJson.message).toBe('One or more services degraded');
        });

        it('should record metrics call', async () => {
            const mockHealthChecks = [
                { serviceName: 'EmailService', healthy: true, successRate: 0.95 }
            ];

            (metricsCollector.getAllHealthChecks as jest.Mock).mockReturnValue(mockHealthChecks);

            const mockRequest = {
                url: 'http://localhost:3000/api/health'
            } as unknown as NextRequest;

            await GET(mockRequest);

            expect(metricsCollector.recordCall).toHaveBeenCalledWith('HealthCheck.GET', true, undefined, expect.any(Number));
        });
    });

    describe('Edge Cases - Threshold Handling', () => {
        it('should handle threshold of 0 (always healthy)', async () => {
            const mockHealthChecks = [
                { serviceName: 'EmailService', healthy: false, successRate: 0.10 }
            ];

            (metricsCollector.getAllHealthChecks as jest.Mock).mockReturnValue(mockHealthChecks);

            const mockRequest = {
                url: 'http://localhost:3000/api/health?threshold=0'
            } as unknown as NextRequest;

            const result = await GET(mockRequest);
            const resultJson = await result.json();

            expect(metricsCollector.getAllHealthChecks).toHaveBeenCalledWith(0);
            expect(resultJson.data.summary.successRateThreshold).toBe(0);
        });

        it('should handle threshold of 1 (always unhealthy unless 100% success)', async () => {
            const mockHealthChecks = [
                { serviceName: 'EmailService', healthy: false, successRate: 0.99 }
            ];

            (metricsCollector.getAllHealthChecks as jest.Mock).mockReturnValue(mockHealthChecks);

            const mockRequest = {
                url: 'http://localhost:3000/api/health?threshold=1'
            } as unknown as NextRequest;

            const result = await GET(mockRequest);
            const resultJson = await result.json();

            expect(metricsCollector.getAllHealthChecks).toHaveBeenCalledWith(1);
            expect(resultJson.data.summary.successRateThreshold).toBe(1);
        });

        it('should handle invalid threshold gracefully (NaN)', async () => {
            const mockHealthChecks = [
                { serviceName: 'EmailService', healthy: true, successRate: 0.95 }
            ];

            (metricsCollector.getAllHealthChecks as jest.Mock).mockReturnValue(mockHealthChecks);

            const mockRequest = {
                url: 'http://localhost:3000/api/health?threshold=invalid'
            } as unknown as NextRequest;

            const result = await GET(mockRequest);
            const resultJson = await result.json();

            expect(resultJson.data.summary.successRateThreshold).toBeNull();
        });

        it('should handle empty threshold string (use default)', async () => {
            const mockHealthChecks = [
                { serviceName: 'EmailService', healthy: true, successRate: 0.95 }
            ];

            (metricsCollector.getAllHealthChecks as jest.Mock).mockReturnValue(mockHealthChecks);

            const mockRequest = {
                url: 'http://localhost:3000/api/health?threshold='
            } as unknown as NextRequest;

            const result = await GET(mockRequest);
            const resultJson = await result.json();

            expect(resultJson.data.summary.successRateThreshold).toBe(0.9);
        });
    });

    describe('Edge Cases - Service States', () => {
        it('should handle empty health checks array', async () => {
            (metricsCollector.getAllHealthChecks as jest.Mock).mockReturnValue([]);

            const mockRequest = {
                url: 'http://localhost:3000/api/health'
            } as unknown as NextRequest;

            const result = await GET(mockRequest);
            const resultJson = await result.json();

            expect(resultJson.data.status).toBe('healthy');
            expect(resultJson.data.summary.totalServices).toBe(0);
            expect(resultJson.data.summary.healthyServices).toBe(0);
            expect(resultJson.data.summary.unhealthyServices).toBe(0);
            expect(resultJson.data.services).toEqual([]);
            expect(result.status).toBe(200);
        });

        it('should handle all services unhealthy', async () => {
            const mockHealthChecks = [
                { serviceName: 'EmailService', healthy: false, successRate: 0.50 },
                { serviceName: 'AuthService', healthy: false, successRate: 0.40 },
                { serviceName: 'Collaboration', healthy: false, successRate: 0.30 }
            ];

            (metricsCollector.getAllHealthChecks as jest.Mock).mockReturnValue(mockHealthChecks);

            const mockRequest = {
                url: 'http://localhost:3000/api/health'
            } as unknown as NextRequest;

            const result = await GET(mockRequest);
            const resultJson = await result.json();

            expect(resultJson.data.status).toBe('degraded');
            expect(resultJson.data.summary.healthyServices).toBe(0);
            expect(resultJson.data.summary.unhealthyServices).toBe(3);
            expect(result.status).toBe(503);
        });

        it('should handle boundary success rate (exactly at threshold)', async () => {
            const mockHealthChecks = [
                { serviceName: 'EmailService', healthy: true, successRate: 0.90 }
            ];

            (metricsCollector.getAllHealthChecks as jest.Mock).mockReturnValue(mockHealthChecks);

            const mockRequest = {
                url: 'http://localhost:3000/api/health?threshold=0.9'
            } as unknown as NextRequest;

            const result = await GET(mockRequest);

            expect(result.status).toBe(200);
        });
    });

    describe('Resilience - Circuit Breaker Integration', () => {
        it('should use executeApiRoute wrapper for resilience', async () => {
            const mockHealthChecks = [
                { serviceName: 'EmailService', healthy: true, successRate: 0.95 }
            ];

            (metricsCollector.getAllHealthChecks as jest.Mock).mockReturnValue(mockHealthChecks);

            const mockRequest = {
                url: 'http://localhost:3000/api/health'
            } as unknown as NextRequest;

            await GET(mockRequest);

            expect(metricsCollector.recordCall).toHaveBeenCalledWith('HealthCheck.GET', true, undefined, expect.any(Number));
        });

        it('should use CIRCUIT_BREAKER_CONFIG.API_ROUTES.HEALTH_CHECK config', async () => {
            expect(CIRCUIT_BREAKER_CONFIG.API_ROUTES.HEALTH_CHECK).toBeDefined();
            expect(CIRCUIT_BREAKER_CONFIG.API_ROUTES.HEALTH_CHECK).toEqual({
                failureThreshold: 3,
                resetTimeoutMs: 30000,
                monitoringPeriodMs: 60000
            });
        });
    });

    describe('Error Scenarios', () => {
        it('should handle getAllHealthChecks error gracefully', async () => {
            (metricsCollector.getAllHealthChecks as jest.Mock).mockImplementation(() => {
                throw new Error('Health check retrieval failed');
            });

            const mockRequest = {
                url: 'http://localhost:3000/api/health'
            } as unknown as NextRequest;

            const result = await GET(mockRequest);
            const resultJson = await result.json();

            expect(resultJson.success).toBe(false);
            expect(resultJson.error).toBe('Health check retrieval failed');
            expect(result.status).toBe(500);
        });

        it('should handle threshold parsing error gracefully', async () => {
            const mockHealthChecks = [
                { serviceName: 'EmailService', healthy: true, successRate: 0.95 }
            ];

            (metricsCollector.getAllHealthChecks as jest.Mock).mockReturnValue(mockHealthChecks);

            const mockRequest = {
                url: 'http://localhost:3000/api/health?threshold=abc123'
            } as unknown as NextRequest;

            const result = await GET(mockRequest);
            const resultJson = await result.json();

            expect(resultJson.data.summary.successRateThreshold).toBeNull();
        });
    });
});
