import metricsCollector from '@/utils/metrics';
import type { HealthCheckResult } from '@/utils/metrics/types';
import { createServiceResponse, createServiceErrorResponse } from '@/utils/apiResponse';
import { withTimeout } from '@/utils/resilience';
import { TIMEOUTS } from '@/constants';

const DEFAULT_SUCCESS_RATE_THRESHOLD = 0.9;
const HEALTH_CHECK_TIMEOUT = TIMEOUTS.API_ROUTE;

export async function GET(request: Request) {
    try {
        const { searchParams } = new URL(request.url);
        const thresholdParam = searchParams.get('threshold');
        const threshold = thresholdParam ? parseFloat(thresholdParam) : DEFAULT_SUCCESS_RATE_THRESHOLD;

        const healthCheckData = await withTimeout(
            Promise.resolve().then(async () => {
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

                return {
                    data: response,
                    overallHealth
                };
            }),
            {
                timeoutMs: HEALTH_CHECK_TIMEOUT,
                timeoutError: 'Health check operation timed out'
            }
        );

        const status = healthCheckData.overallHealth ? 200 : 503;

        return createServiceResponse({
            data: healthCheckData.data,
            message: healthCheckData.overallHealth ? 'All services healthy' : 'One or more services degraded',
            status
        });
    } catch (error) {
        const errorMessage = error instanceof Error ? error.message : 'Internal server error';
        return createServiceErrorResponse({
            error: errorMessage,
            status: 500
        });
    }
}
