import metricsCollector from '@/utils/metrics';
import { createApiResponse } from '@/utils/apiResponse';

export async function GET() {
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

    return createApiResponse({
        data: response,
        status: 200
    });
}
