jest.mock('@/services/email/EmailService');
jest.mock('@/services/auth/AuthService');
jest.mock('@/utils/metrics', () => ({
    __esModule: true,
    default: {
        recordCall: jest.fn(),
        recordLatency: jest.fn(),
        recordError: jest.fn()
    }
}));

import { GET } from '../route';
import emailService from '@/services/email/EmailService';
import authService from '@/services/auth/AuthService';
import metricsCollector from '@/utils/metrics';
import { CIRCUIT_BREAKER_CONFIG } from '@/constants';
import { resetAllCircuitBreakers } from '@/utils/apiRouteHandler';

describe('/api/services/status - Critical Path Testing', () => {
    beforeEach(() => {
        jest.clearAllMocks();
        resetAllCircuitBreakers();
    });

    afterEach(() => {
        jest.clearAllMocks();
        resetAllCircuitBreakers();
    });

    describe('Happy Path - Successful Status Retrieval', () => {
        it('should return service status with metrics and circuit breaker state for email service', async () => {
            const mockEmailMetrics = { totalCalls: 100, successCalls: 95, failureCalls: 5 };
            const mockEmailCircuitBreaker = { isOpen: false, failureCount: 2, lastFailureTime: null, lastSuccessTime: '2026-01-22T10:00:00Z' };

            (emailService.getMetrics as jest.Mock).mockReturnValue(mockEmailMetrics);
            (emailService.getCircuitBreakerState as jest.Mock).mockReturnValue(mockEmailCircuitBreaker);

            const mockAuthMetrics = { totalCalls: 50, successCalls: 48, failureCalls: 2 };
            const mockAuthCircuitBreaker = { isOpen: false, failureCount: 1, lastFailureTime: null, lastSuccessTime: '2026-01-22T10:00:00Z' };

            (authService.getMetrics as jest.Mock).mockReturnValue(mockAuthMetrics);
            (authService.getCircuitBreakerState as jest.Mock).mockReturnValue(mockAuthCircuitBreaker);

            const result = await GET();
            const resultJson = await result.json();

            expect(resultJson.success).toBe(true);
            expect(resultJson.data).toBeDefined();
            expect(resultJson.data.timestamp).toBeDefined();
            expect(resultJson.data.email).toBeDefined();
            expect(resultJson.data.email.metrics).toEqual(mockEmailMetrics);
            expect(resultJson.data.email.circuitBreaker).toEqual(mockEmailCircuitBreaker);
            expect(resultJson.data.auth).toBeDefined();
            expect(resultJson.data.auth.metrics).toEqual(mockAuthMetrics);
            expect(resultJson.data.auth.circuitBreaker).toEqual(mockAuthCircuitBreaker);
            expect(result.status).toBe(200);
        });

        it('should return valid ISO 8601 timestamp', async () => {
            (emailService.getMetrics as jest.Mock).mockReturnValue({ totalCalls: 100, successCalls: 95, failureCalls: 5 });
            (emailService.getCircuitBreakerState as jest.Mock).mockReturnValue({ isOpen: false });
            (authService.getMetrics as jest.Mock).mockReturnValue({ totalCalls: 50, successCalls: 48, failureCalls: 2 });
            (authService.getCircuitBreakerState as jest.Mock).mockReturnValue({ isOpen: false });

            const result = await GET();
            const resultJson = await result.json();

            expect(resultJson.data.timestamp).toMatch(/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}\.\d{3}Z$/);
        });

        it('should include success message', async () => {
            (emailService.getMetrics as jest.Mock).mockReturnValue({ totalCalls: 100, successCalls: 95, failureCalls: 5 });
            (emailService.getCircuitBreakerState as jest.Mock).mockReturnValue({ isOpen: false });
            (authService.getMetrics as jest.Mock).mockReturnValue({ totalCalls: 50, successCalls: 48, failureCalls: 2 });
            (authService.getCircuitBreakerState as jest.Mock).mockReturnValue({ isOpen: false });

            const result = await GET();
            const resultJson = await result.json();

            expect(resultJson.message).toBe('Service status retrieved successfully');
        });

        it('should record metrics call', async () => {
            (emailService.getMetrics as jest.Mock).mockReturnValue({ totalCalls: 100, successCalls: 95, failureCalls: 5 });
            (emailService.getCircuitBreakerState as jest.Mock).mockReturnValue({ isOpen: false });
            (authService.getMetrics as jest.Mock).mockReturnValue({ totalCalls: 50, successCalls: 48, failureCalls: 2 });
            (authService.getCircuitBreakerState as jest.Mock).mockReturnValue({ isOpen: false });

            await GET();

            expect(metricsCollector.recordCall).toHaveBeenCalledWith('ServicesStatus.GET', true, undefined, expect.any(Number));
        });
    });

    describe('Edge Cases - Service States', () => {
        it('should handle email service with open circuit breaker', async () => {
            const mockEmailMetrics = { totalCalls: 100, successCalls: 80, failureCalls: 20 };
            const mockEmailCircuitBreaker = { isOpen: true, failureCount: 6, lastFailureTime: '2026-01-22T10:00:00Z', lastSuccessTime: '2026-01-22T09:00:00Z' };

            (emailService.getMetrics as jest.Mock).mockReturnValue(mockEmailMetrics);
            (emailService.getCircuitBreakerState as jest.Mock).mockReturnValue(mockEmailCircuitBreaker);

            const mockAuthMetrics = { totalCalls: 50, successCalls: 48, failureCalls: 2 };
            const mockAuthCircuitBreaker = { isOpen: false, failureCount: 1, lastFailureTime: null, lastSuccessTime: '2026-01-22T10:00:00Z' };

            (authService.getMetrics as jest.Mock).mockReturnValue(mockAuthMetrics);
            (authService.getCircuitBreakerState as jest.Mock).mockReturnValue(mockAuthCircuitBreaker);

            const result = await GET();
            const resultJson = await result.json();

            expect(resultJson.data.email.circuitBreaker.isOpen).toBe(true);
            expect(resultJson.data.email.circuitBreaker.failureCount).toBe(6);
            expect(result.status).toBe(200);
        });

        it('should handle services with zero metrics', async () => {
            const mockEmailMetrics = { totalCalls: 0, successCalls: 0, failureCalls: 0 };
            const mockEmailCircuitBreaker = { isOpen: false, failureCount: 0, lastFailureTime: null, lastSuccessTime: null };

            (emailService.getMetrics as jest.Mock).mockReturnValue(mockEmailMetrics);
            (emailService.getCircuitBreakerState as jest.Mock).mockReturnValue(mockEmailCircuitBreaker);

            const mockAuthMetrics = { totalCalls: 0, successCalls: 0, failureCalls: 0 };
            const mockAuthCircuitBreaker = { isOpen: false, failureCount: 0, lastFailureTime: null, lastSuccessTime: null };

            (authService.getMetrics as jest.Mock).mockReturnValue(mockAuthMetrics);
            (authService.getCircuitBreakerState as jest.Mock).mockReturnValue(mockAuthCircuitBreaker);

            const result = await GET();
            const resultJson = await result.json();

            expect(resultJson.data.email.metrics.totalCalls).toBe(0);
            expect(resultJson.data.auth.metrics.totalCalls).toBe(0);
            expect(result.status).toBe(200);
        });

        it('should handle services with null circuit breaker timestamps', async () => {
            (emailService.getMetrics as jest.Mock).mockReturnValue({ totalCalls: 100, successCalls: 95, failureCalls: 5 });
            (emailService.getCircuitBreakerState as jest.Mock).mockReturnValue({ isOpen: false, failureCount: 1, lastFailureTime: null, lastSuccessTime: null });
            (authService.getMetrics as jest.Mock).mockReturnValue({ totalCalls: 50, successCalls: 48, failureCalls: 2 });
            (authService.getCircuitBreakerState as jest.Mock).mockReturnValue({ isOpen: false, failureCount: 1, lastFailureTime: null, lastSuccessTime: null });

            const result = await GET();
            const resultJson = await result.json();

            expect(resultJson.data.email.circuitBreaker.lastFailureTime).toBeNull();
            expect(resultJson.data.email.circuitBreaker.lastSuccessTime).toBeNull();
            expect(result.status).toBe(200);
        });
    });

    describe('Error Scenarios', () => {
        it('should handle email service getMetrics error gracefully', async () => {
            (emailService.getMetrics as jest.Mock).mockImplementation(() => {
                throw new Error('Email service metrics unavailable');
            });
            (emailService.getCircuitBreakerState as jest.Mock).mockReturnValue({ isOpen: false });
            (authService.getMetrics as jest.Mock).mockReturnValue({ totalCalls: 50, successCalls: 48, failureCalls: 2 });
            (authService.getCircuitBreakerState as jest.Mock).mockReturnValue({ isOpen: false });

            const result = await GET();
            const resultJson = await result.json();

            expect(resultJson.success).toBe(false);
            expect(resultJson.error).toBe('Email service metrics unavailable');
            expect(result.status).toBe(500);
        });

        it('should handle auth service getMetrics error gracefully', async () => {
            (emailService.getMetrics as jest.Mock).mockReturnValue({ totalCalls: 100, successCalls: 95, failureCalls: 5 });
            (emailService.getCircuitBreakerState as jest.Mock).mockReturnValue({ isOpen: false });
            (authService.getMetrics as jest.Mock).mockImplementation(() => {
                throw new Error('Auth service metrics unavailable');
            });
            (authService.getCircuitBreakerState as jest.Mock).mockReturnValue({ isOpen: false });

            const result = await GET();
            const resultJson = await result.json();

            expect(resultJson.success).toBe(false);
            expect(resultJson.error).toBe('Auth service metrics unavailable');
            expect(result.status).toBe(500);
        });

        it('should handle circuit breaker state retrieval errors', async () => {
            (emailService.getMetrics as jest.Mock).mockReturnValue({ totalCalls: 100, successCalls: 95, failureCalls: 5 });
            (emailService.getCircuitBreakerState as jest.Mock).mockImplementation(() => {
                throw new Error('Circuit breaker state unavailable');
            });
            (authService.getMetrics as jest.Mock).mockReturnValue({ totalCalls: 50, successCalls: 48, failureCalls: 2 });
            (authService.getCircuitBreakerState as jest.Mock).mockReturnValue({ isOpen: false });

            const result = await GET();
            const resultJson = await result.json();

            expect(resultJson.success).toBe(false);
            expect(resultJson.error).toBe('Service temporarily unavailable');
        });
    });

    describe('Resilience - Circuit Breaker Integration', () => {
        it('should use executeApiRoute wrapper for resilience', async () => {
            (emailService.getMetrics as jest.Mock).mockReturnValue({ totalCalls: 100, successCalls: 95, failureCalls: 5 });
            (emailService.getCircuitBreakerState as jest.Mock).mockReturnValue({ isOpen: false });
            (authService.getMetrics as jest.Mock).mockReturnValue({ totalCalls: 50, successCalls: 48, failureCalls: 2 });
            (authService.getCircuitBreakerState as jest.Mock).mockReturnValue({ isOpen: false });

            await GET();

            expect(metricsCollector.recordCall).toHaveBeenCalledWith('ServicesStatus.GET', true, undefined, expect.any(Number));
        });

        it('should use CIRCUIT_BREAKER_CONFIG.API_ROUTES.SERVICES_STATUS config', async () => {
            expect(CIRCUIT_BREAKER_CONFIG.API_ROUTES.SERVICES_STATUS).toBeDefined();
            expect(CIRCUIT_BREAKER_CONFIG.API_ROUTES.SERVICES_STATUS).toEqual({
                failureThreshold: 3,
                resetTimeoutMs: 30000,
                monitoringPeriodMs: 60000
            });
        });
    });
});
