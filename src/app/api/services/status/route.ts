import { emailService } from '@/services/email';
import { authService } from '@/services/auth';
import { createServiceResponse, createServiceErrorResponse } from '@/utils/apiResponse';
import { withTimeout } from '@/utils/resilience';
import { TIMEOUTS } from '@/constants';

const SERVICES_STATUS_TIMEOUT = TIMEOUTS.API_ROUTE;

export async function GET() {
    try {
        const statusData = await withTimeout(
            Promise.resolve().then(() => {
                const emailMetrics = emailService.getMetrics();
                const authMetrics = authService.getMetrics();

                const emailCircuitBreaker = emailService.getCircuitBreakerState();
                const authCircuitBreaker = authService.getCircuitBreakerState();

                const response = {
                    timestamp: new Date().toISOString(),
                    email: {
                        metrics: emailMetrics,
                        circuitBreaker: emailCircuitBreaker
                    },
                    auth: {
                        metrics: authMetrics,
                        circuitBreaker: authCircuitBreaker
                    }
                };

                return response;
            }),
            {
                timeoutMs: SERVICES_STATUS_TIMEOUT,
                timeoutError: 'Service status retrieval timed out'
            }
        );

        return createServiceResponse({
            data: statusData,
            message: 'Service status retrieved successfully',
            status: 200
        });
    } catch (error) {
        const errorMessage = error instanceof Error ? error.message : 'Internal server error';
        return createServiceErrorResponse({
            error: errorMessage,
            status: 500
        });
    }
}
