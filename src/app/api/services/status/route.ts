import { emailService } from '@/services/email';
import { authService } from '@/services/auth';
import { createApiResponse } from '@/utils/apiResponse';

export async function GET() {
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

    return createApiResponse({
        data: response,
        status: 200
    });
}
