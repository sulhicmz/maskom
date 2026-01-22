jest.mock('@/services/email/EmailService');
jest.mock('@/utils/metrics', () => ({
    __esModule: true,
    default: {
        recordCall: jest.fn(),
        recordLatency: jest.fn(),
        recordError: jest.fn()
    }
}));

import { GET, POST } from '../route';
import emailService from '@/services/email/EmailService';
import metricsCollector from '@/utils/metrics';
import { CIRCUIT_BREAKER_CONFIG } from '@/constants';
import { resetAllCircuitBreakers } from '@/utils/apiRouteHandler';

describe('/api/email-queue - Critical Path Testing', () => {
    beforeEach(() => {
        jest.clearAllMocks();
        resetAllCircuitBreakers();
    });

    afterEach(() => {
        jest.clearAllMocks();
        resetAllCircuitBreakers();
    });

    describe('GET - Happy Path - Successful Queue Status Retrieval', () => {
        it('should return queue status with circuit breaker state and metrics', async () => {
            const mockQueueStatus = { queueSize: 10, expired: 0 };
            const mockCircuitBreakerState = { isOpen: false, failureCount: 0, lastFailureTime: null, lastSuccessTime: '2026-01-22T10:00:00Z' };
            const mockMetrics = { totalCalls: 100, successCalls: 95, failureCalls: 5 };

            (emailService.getQueueStatus as jest.Mock).mockReturnValue(mockQueueStatus);
            (emailService.getCircuitBreakerState as jest.Mock).mockReturnValue(mockCircuitBreakerState);
            (emailService.getMetrics as jest.Mock).mockReturnValue(mockMetrics);

            const result = await GET();
            const resultJson = await result.json();

            expect(resultJson.success).toBe(true);
            expect(resultJson.data).toBeDefined();
            expect(resultJson.data.timestamp).toBeDefined();
            expect(resultJson.data.queue).toBeDefined();
            expect(resultJson.data.queue.size).toBe(10);
            expect(resultJson.data.queue.expired).toBe(0);
            expect(resultJson.data.queue.status).toBe('has_pending_emails');
            expect(resultJson.data.circuitBreaker).toBeDefined();
            expect(resultJson.data.circuitBreaker.isOpen).toBe(false);
            expect(resultJson.data.circuitBreaker.failureCount).toBe(0);
            expect(resultJson.data.circuitBreaker.status).toBe('closed');
            expect(resultJson.data.metrics).toEqual(mockMetrics);
            expect(result.status).toBe(200);
        });

        it('should return empty queue status when queue is empty', async () => {
            const mockQueueStatus = { queueSize: 0, expired: 0 };
            const mockCircuitBreakerState = { isOpen: false, failureCount: 0, lastFailureTime: null, lastSuccessTime: '2026-01-22T10:00:00Z' };
            const mockMetrics = { totalCalls: 100, successCalls: 95, failureCalls: 5 };

            (emailService.getQueueStatus as jest.Mock).mockReturnValue(mockQueueStatus);
            (emailService.getCircuitBreakerState as jest.Mock).mockReturnValue(mockCircuitBreakerState);
            (emailService.getMetrics as jest.Mock).mockReturnValue(mockMetrics);

            const result = await GET();
            const resultJson = await result.json();

            expect(resultJson.data.queue.size).toBe(0);
            expect(resultJson.data.queue.expired).toBe(0);
            expect(resultJson.data.queue.status).toBe('empty');
            expect(result.status).toBe(200);
        });

        it('should return circuit breaker state as open when circuit is open', async () => {
            const mockQueueStatus = { queueSize: 10, expired: 0 };
            const mockCircuitBreakerState = { isOpen: true, failureCount: 6, lastFailureTime: '2026-01-22T10:00:00Z', lastSuccessTime: '2026-01-22T09:00:00Z' };
            const mockMetrics = { totalCalls: 100, successCalls: 80, failureCalls: 20 };

            (emailService.getQueueStatus as jest.Mock).mockReturnValue(mockQueueStatus);
            (emailService.getCircuitBreakerState as jest.Mock).mockReturnValue(mockCircuitBreakerState);
            (emailService.getMetrics as jest.Mock).mockReturnValue(mockMetrics);

            const result = await GET();
            const resultJson = await result.json();

            expect(resultJson.data.circuitBreaker.isOpen).toBe(true);
            expect(resultJson.data.circuitBreaker.status).toBe('open');
            expect(resultJson.data.circuitBreaker.failureCount).toBe(6);
            expect(result.status).toBe(200);
        });

        it('should return null metrics when getMetrics returns null', async () => {
            const mockQueueStatus = { queueSize: 10, expired: 0 };
            const mockCircuitBreakerState = { isOpen: false, failureCount: 0, lastFailureTime: null, lastSuccessTime: null };

            (emailService.getQueueStatus as jest.Mock).mockReturnValue(mockQueueStatus);
            (emailService.getCircuitBreakerState as jest.Mock).mockReturnValue(mockCircuitBreakerState);
            (emailService.getMetrics as jest.Mock).mockReturnValue(null);

            const result = await GET();
            const resultJson = await result.json();

            expect(resultJson.data.metrics).toBeNull();
            expect(result.status).toBe(200);
        });

        it('should return valid ISO 8601 timestamp', async () => {
            const mockQueueStatus = { queueSize: 10, expired: 0 };
            const mockCircuitBreakerState = { isOpen: false, failureCount: 0, lastFailureTime: null, lastSuccessTime: null };

            (emailService.getQueueStatus as jest.Mock).mockReturnValue(mockQueueStatus);
            (emailService.getCircuitBreakerState as jest.Mock).mockReturnValue(mockCircuitBreakerState);
            (emailService.getMetrics as jest.Mock).mockReturnValue(null);

            const result = await GET();
            const resultJson = await result.json();

            expect(resultJson.data.timestamp).toMatch(/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}\.\d{3}Z$/);
        });

        it('should include success message', async () => {
            const mockQueueStatus = { queueSize: 10, expired: 0 };
            const mockCircuitBreakerState = { isOpen: false, failureCount: 0, lastFailureTime: null, lastSuccessTime: null };

            (emailService.getQueueStatus as jest.Mock).mockReturnValue(mockQueueStatus);
            (emailService.getCircuitBreakerState as jest.Mock).mockReturnValue(mockCircuitBreakerState);
            (emailService.getMetrics as jest.Mock).mockReturnValue(null);

            const result = await GET();
            const resultJson = await result.json();

            expect(resultJson.message).toBe('Email queue status retrieved successfully');
        });

        it('should record metrics call', async () => {
            const mockQueueStatus = { queueSize: 10, expired: 0 };
            const mockCircuitBreakerState = { isOpen: false, failureCount: 0, lastFailureTime: null, lastSuccessTime: null };

            (emailService.getQueueStatus as jest.Mock).mockReturnValue(mockQueueStatus);
            (emailService.getCircuitBreakerState as jest.Mock).mockReturnValue(mockCircuitBreakerState);
            (emailService.getMetrics as jest.Mock).mockReturnValue(null);

            await GET();

            expect(metricsCollector.recordCall).toHaveBeenCalledWith('EmailQueue.GET', true, undefined, expect.any(Number));
        });
    });

    describe('GET - Edge Cases - Queue States', () => {
        it('should handle expired emails in queue', async () => {
            const mockQueueStatus = { queueSize: 15, expired: 5 };
            const mockCircuitBreakerState = { isOpen: false, failureCount: 0, lastFailureTime: null, lastSuccessTime: null };

            (emailService.getQueueStatus as jest.Mock).mockReturnValue(mockQueueStatus);
            (emailService.getCircuitBreakerState as jest.Mock).mockReturnValue(mockCircuitBreakerState);
            (emailService.getMetrics as jest.Mock).mockReturnValue(null);

            const result = await GET();
            const resultJson = await result.json();

            expect(resultJson.data.queue.expired).toBe(5);
            expect(resultJson.data.queue.size).toBe(15);
            expect(result.status).toBe(200);
        });

        it('should handle null circuit breaker timestamps', async () => {
            const mockQueueStatus = { queueSize: 0, expired: 0 };
            const mockCircuitBreakerState = { isOpen: false, failureCount: 0, lastFailureTime: null, lastSuccessTime: null };

            (emailService.getQueueStatus as jest.Mock).mockReturnValue(mockQueueStatus);
            (emailService.getCircuitBreakerState as jest.Mock).mockReturnValue(mockCircuitBreakerState);
            (emailService.getMetrics as jest.Mock).mockReturnValue(null);

            const result = await GET();
            const resultJson = await result.json();

            expect(resultJson.data.circuitBreaker.lastFailureTime).toBeNull();
            expect(resultJson.data.circuitBreaker.lastSuccessTime).toBeNull();
            expect(result.status).toBe(200);
        });

        it('should handle circuit breaker with high failure count', async () => {
            const mockQueueStatus = { queueSize: 10, expired: 0 };
            const mockCircuitBreakerState = { isOpen: true, failureCount: 10, lastFailureTime: '2026-01-22T10:00:00Z', lastSuccessTime: '2026-01-22T09:00:00Z' };

            (emailService.getQueueStatus as jest.Mock).mockReturnValue(mockQueueStatus);
            (emailService.getCircuitBreakerState as jest.Mock).mockReturnValue(mockCircuitBreakerState);
            (emailService.getMetrics as jest.Mock).mockReturnValue(null);

            const result = await GET();
            const resultJson = await result.json();

            expect(resultJson.data.circuitBreaker.failureCount).toBe(10);
            expect(result.status).toBe(200);
        });
    });

    describe('GET - Error Scenarios', () => {
        it('should handle getQueueStatus error gracefully', async () => {
            (emailService.getQueueStatus as jest.Mock).mockImplementation(() => {
                throw new Error('Queue status retrieval failed');
            });

            const result = await GET();
            const resultJson = await result.json();

            expect(resultJson.success).toBe(false);
            expect(resultJson.error).toBeDefined();
            expect(result.status).not.toBe(200);
        });

        it('should handle getCircuitBreakerState error gracefully', async () => {
            const mockQueueStatus = { queueSize: 10, expired: 0 };

            (emailService.getQueueStatus as jest.Mock).mockReturnValue(mockQueueStatus);
            (emailService.getCircuitBreakerState as jest.Mock).mockImplementation(() => {
                throw new Error('Circuit breaker state retrieval failed');
            });

            const result = await GET();
            const resultJson = await result.json();

            expect(resultJson.success).toBe(false);
            expect(resultJson.error).toBeDefined();
        });

        it('should handle getMetrics error gracefully', async () => {
            const mockQueueStatus = { queueSize: 10, expired: 0 };
            const mockCircuitBreakerState = { isOpen: false, failureCount: 0, lastFailureTime: null, lastSuccessTime: null };

            (emailService.getQueueStatus as jest.Mock).mockReturnValue(mockQueueStatus);
            (emailService.getCircuitBreakerState as jest.Mock).mockReturnValue(mockCircuitBreakerState);
            (emailService.getMetrics as jest.Mock).mockImplementation(() => {
                throw new Error('Metrics retrieval failed');
            });

            const result = await GET();
            const resultJson = await result.json();

            expect(resultJson.success).toBe(false);
            expect(resultJson.error).toBeDefined();
        });
    });

    describe('POST - Happy Path - Successful Queue Processing', () => {
        it('should process queue and return success result', async () => {
            const mockProcessResult = { success: true, data: { processed: 5, failed: 0 } };

            (emailService.processQueue as jest.Mock).mockResolvedValue(mockProcessResult);

            const result = await POST();
            const resultJson = await result.json();

            expect(resultJson.success).toBe(true);
            expect(resultJson.data).toBeDefined();
            expect(resultJson.data).toEqual(mockProcessResult.data);
            expect(resultJson.message).toBe('Email queue processed');
            expect(result.status).toBe(200);
        });

        it('should call processQueue on emailService', async () => {
            const mockProcessResult = { success: true, data: { processed: 5, failed: 0 } };

            (emailService.processQueue as jest.Mock).mockResolvedValue(mockProcessResult);

            await POST();

            expect(emailService.processQueue).toHaveBeenCalledTimes(1);
        });

        it('should record metrics call', async () => {
            const mockProcessResult = { success: true, data: { processed: 5, failed: 0 } };

            (emailService.processQueue as jest.Mock).mockResolvedValue(mockProcessResult);

            await POST();

            expect(metricsCollector.recordCall).toHaveBeenCalledWith('EmailQueue.PROCESS', true, undefined, expect.any(Number));
        });
    });

    describe('POST - Edge Cases - Processing Results', () => {
        it('should handle successful processing with some failures', async () => {
            const mockProcessResult = { success: true, data: { processed: 8, failed: 2 } };

            (emailService.processQueue as jest.Mock).mockResolvedValue(mockProcessResult);

            const result = await POST();
            const resultJson = await result.json();

            expect(resultJson.success).toBe(true);
            expect(resultJson.data.processed).toBe(8);
            expect(resultJson.data.failed).toBe(2);
            expect(result.status).toBe(200);
        });

        it('should handle empty queue processing result', async () => {
            const mockProcessResult = { success: true, data: { processed: 0, failed: 0 } };

            (emailService.processQueue as jest.Mock).mockResolvedValue(mockProcessResult);

            const result = await POST();
            const resultJson = await result.json();

            expect(resultJson.success).toBe(true);
            expect(resultJson.data.processed).toBe(0);
            expect(resultJson.data.failed).toBe(0);
            expect(result.status).toBe(200);
        });

        it('should handle large batch processing', async () => {
            const mockProcessResult = { success: true, data: { processed: 1000, failed: 5 } };

            (emailService.processQueue as jest.Mock).mockResolvedValue(mockProcessResult);

            const result = await POST();
            const resultJson = await result.json();

            expect(resultJson.success).toBe(true);
            expect(resultJson.data.processed).toBe(1000);
            expect(result.status).toBe(200);
        });
    });

    describe('POST - Error Scenarios', () => {
        it('should handle failed queue processing', async () => {
            const mockProcessResult = { success: false, data: { error: 'SMTP connection failed' } };

            (emailService.processQueue as jest.Mock).mockResolvedValue(mockProcessResult);

            const result = await POST();
            const resultJson = await result.json();

            expect(resultJson.success).toBe(false);
            expect(resultJson.message).toBe('Failed to process email queue');
            expect(resultJson.data).toEqual(mockProcessResult.data);
            expect(result.status).toBe(503);
        });

        it('should handle processQueue error gracefully', async () => {
            (emailService.processQueue as jest.Mock).mockRejectedValue(new Error('Queue processing error'));

            const result = await POST();
            const resultJson = await result.json();

            expect(resultJson.success).toBe(false);
            expect(resultJson.error).toBeDefined();
            expect(result.status).not.toBe(200);
        });

        it('should handle null process result', async () => {
            (emailService.processQueue as jest.Mock).mockResolvedValue(null);

            const result = await POST();
            const resultJson = await result.json();

            expect(resultJson.success).toBe(false);
            expect(resultJson.error).toBeDefined();
        });
    });

    describe('Resilience - Circuit Breaker Integration', () => {
        it('should use executeApiRoute wrapper for resilience on GET', async () => {
            const mockQueueStatus = { queueSize: 10, expired: 0 };
            const mockCircuitBreakerState = { isOpen: false, failureCount: 0, lastFailureTime: null, lastSuccessTime: null };

            (emailService.getQueueStatus as jest.Mock).mockReturnValue(mockQueueStatus);
            (emailService.getCircuitBreakerState as jest.Mock).mockReturnValue(mockCircuitBreakerState);
            (emailService.getMetrics as jest.Mock).mockReturnValue(null);

            await GET();

            expect(metricsCollector.recordCall).toHaveBeenCalledWith('EmailQueue.GET', true, undefined, expect.any(Number));
        });

        it('should use executeApiRoute wrapper for resilience on POST', async () => {
            const mockProcessResult = { success: true, data: { processed: 5, failed: 0 } };

            (emailService.processQueue as jest.Mock).mockResolvedValue(mockProcessResult);

            await POST();

            expect(metricsCollector.recordCall).toHaveBeenCalledWith('EmailQueue.PROCESS', true, undefined, expect.any(Number));
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
