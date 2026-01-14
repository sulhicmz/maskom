import metricsCollector from '@/utils/metrics';
import type { HealthCheckResult } from '@/utils/metrics/types';
import { createApiResponse } from '@/utils/apiResponse';

const DEFAULT_SUCCESS_RATE_THRESHOLD = 0.9;

export async function GET(request: Request) {
    const { searchParams } = new URL(request.url);
    const thresholdParam = searchParams.get('threshold');
    const threshold = thresholdParam ? parseFloat(thresholdParam) : DEFAULT_SUCCESS_RATE_THRESHOLD;

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

    return createApiResponse({
        data: response,
        status: overallHealth ? 200 : 503
    });
}
