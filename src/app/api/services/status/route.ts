import { emailService } from '@/services/email';
import { authService } from '@/services/auth';
import { createServiceResponse } from '@/utils/apiResponse';
import { executeApiRoute } from '@/utils/apiRouteHandler';
import { CIRCUIT_BREAKER_CONFIG } from '@/constants';

export async function GET() {
    return executeApiRoute({
        operationName: 'ServicesStatus.GET',
        circuitBreakerConfig: CIRCUIT_BREAKER_CONFIG.API_ROUTES.SERVICES_STATUS,
        handler: async () => {
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

            return createServiceResponse({
                data: response,
                message: 'Service status retrieved successfully',
                status: 200
            });
        }
    });
}
