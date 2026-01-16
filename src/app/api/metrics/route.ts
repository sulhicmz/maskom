import metricsCollector from '@/utils/metrics';
import { createServiceResponse, createServiceErrorResponse } from '@/utils/apiResponse';
import { withTimeout } from '@/utils/resilience';
import { TIMEOUTS } from '@/constants';

const METRICS_TIMEOUT = TIMEOUTS.API_ROUTE;

export async function GET() {
    try {
        const metricsData = await withTimeout(
            Promise.resolve().then(() => {
                const allMetrics = metricsCollector.getAllMetrics();

                const summary = {
                    totalServices: allMetrics.length,
                    totalCalls: allMetrics.reduce((sum, m) => sum + m.totalCalls, 0),
                    totalSuccesses: allMetrics.reduce((sum, m) => sum + m.successCalls, 0),
                    totalFailures: allMetrics.reduce((sum, m) => sum + m.failureCalls, 0),
                    totalTimeouts: allMetrics.reduce((sum, m) => sum + m.timeoutCalls, 0),
                    totalRateLimits: allMetrics.reduce((sum, m) => sum + m.rateLimitCalls, 0)
                };

                const response = {
                    timestamp: new Date().toISOString(),
                    summary,
                    services: allMetrics.map(metrics => {
                        const successRate = metricsCollector.getSuccessRate(metrics.serviceName);
                        return {
                            ...metrics,
                            successRate: Math.round(successRate * 10000) / 100,
                            health: successRate >= 0.9 ? 'healthy' : successRate >= 0.7 ? 'degraded' : 'unhealthy'
                        };
                    })
                };

                return response;
            }),
            {
                timeoutMs: METRICS_TIMEOUT,
                timeoutError: 'Metrics retrieval timed out'
            }
        );

        return createServiceResponse({
            data: metricsData,
            message: 'Metrics retrieved successfully',
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
