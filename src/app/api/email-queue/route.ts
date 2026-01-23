import { NextResponse } from 'next/server';
import emailService from '@/services/email/EmailService';
import { createServiceResponse, createServiceErrorResponse } from '@/utils/apiResponse';
import { executeApiRoute } from '@/utils/apiRouteHandler';
import { CIRCUIT_BREAKER_CONFIG } from '@/constants';

export async function GET() {
    return executeApiRoute({
        operationName: 'EmailQueue.GET',
        circuitBreakerConfig: CIRCUIT_BREAKER_CONFIG.API_ROUTES.SERVICES_STATUS,
        handler: async () => {
            const queueStatus = emailService.getQueueStatus();
            const circuitBreakerState = emailService.getCircuitBreakerState();
            const metrics = emailService.getMetrics();

            const response = {
                timestamp: new Date().toISOString(),
                queue: {
                    size: queueStatus.queueSize,
                    expired: queueStatus.expired,
                    status: queueStatus.queueSize > 0 ? 'has_pending_emails' : 'empty'
                },
                circuitBreaker: {
                    isOpen: circuitBreakerState.isOpen,
                    failureCount: circuitBreakerState.failureCount,
                    lastFailureTime: circuitBreakerState.lastFailureTime,
                    lastSuccessTime: circuitBreakerState.lastSuccessTime,
                    status: circuitBreakerState.isOpen ? 'open' : 'closed'
                },
                metrics: metrics || null
            };

            return createServiceResponse({
                data: response,
                message: 'Email queue status retrieved successfully',
                status: 200
            });
        }
    });
}

export async function POST() {
    return executeApiRoute({
        operationName: 'EmailQueue.PROCESS',
        circuitBreakerConfig: CIRCUIT_BREAKER_CONFIG.API_ROUTES.SERVICES_STATUS,
        handler: async () => {
            const result = await emailService.processQueue();

            if (!result) {
                throw new Error('Email queue processing returned null');
            }

            if (result.success) {
                return createServiceResponse({
                    data: result.data,
                    message: 'Email queue processed',
                    status: 200
                });
            }

            return createServiceErrorResponse({
                error: 'Failed to process email queue',
                status: 503
            });
        }
    });
}
