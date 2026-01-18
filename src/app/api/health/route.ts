import metricsCollector from '@/utils/metrics';
import type { HealthCheckResult } from '@/utils/metrics/types';
import { createServiceResponse } from '@/utils/apiResponse';
import { executeApiRoute } from '@/utils/apiRouteHandler';
import { CIRCUIT_BREAKER_CONFIG } from '@/constants';

const DEFAULT_SUCCESS_RATE_THRESHOLD = 0.9;

export async function GET(request: Request) {
    const { searchParams } = new URL(request.url);
    const thresholdParam = searchParams.get('threshold');
    const threshold = thresholdParam ? parseFloat(thresholdParam) : DEFAULT_SUCCESS_RATE_THRESHOLD;

    return executeApiRoute({
        operationName: 'HealthCheck.GET',
        circuitBreakerConfig: CIRCUIT_BREAKER_CONFIG.API_ROUTES.HEALTH_CHECK,
        handler: async () => {
            const allHealthChecks: HealthCheckResult[] = metricsCollector.getAllHealthChecks(threshold);
            const overallHealth = allHealthChecks.every(check => check.healthy);

            const response = {
                status: overallHealth ? 'healthy' : 'degraded',
                timestamp: new Date().toISOString(),
                services: allHealthChecks,
                summary: {
                    totalServices: allHealthChecks.length,
                    healthyServices: allHealthChecks.filter(c => c.healthy).length,
                    unhealthyServices: allHealthChecks.filter(c => !c.healthy).length,
                    successRateThreshold: threshold
                }
            };

            const status = overallHealth ? 200 : 503;

            return createServiceResponse({
                data: response,
                message: overallHealth ? 'All services healthy' : 'One or more services degraded',
                status
            });
        }
    });
}
