# Metrics API

Real-time metrics collection and monitoring for all services.

## Endpoints

### GET /api/metrics

Returns aggregated metrics for all monitored services.

#### Response

All responses follow ServiceResult<T> pattern:
```typescript
interface ServiceResult<T> {
    success: boolean;
    message?: string;
    data?: T;
    error?: string;
    errorCode?: ServiceErrorCodeType;
    metadata?: Record<string, unknown>;
}
```

**200 OK**
```json
{
  "success": true,
  "message": "Metrics retrieved successfully",
  "data": {
    "timestamp": "2026-01-13T22:30:00.000Z",
    "summary": {
      "totalServices": 2,
      "totalCalls": 300,
      "totalSuccesses": 285,
      "totalFailures": 15,
      "totalTimeouts": 5,
      "totalRateLimits": 6
    },
    "services": [
      {
        "serviceName": "EmailService.sendEmail",
        "totalCalls": 100,
        "successCalls": 95,
        "failureCalls": 5,
        "timeoutCalls": 2,
        "rateLimitCalls": 1,
        "circuitBreakerOpenCount": 0,
        "lastError": "timeout",
        "lastSuccessTime": 17368068095678,
        "lastFailureTime": 1736808004567,
        "averageResponseTime": 150,
        "successRate": 95.0,
        "health": "healthy"
      },
      {
        "serviceName": "AuthService.login",
        "totalCalls": 200,
        "successCalls": 190,
        "failureCalls": 10,
        "timeoutCalls": 3,
        "rateLimitCalls": 5,
        "circuitBreakerOpenCount": 1,
        "averageResponseTime": 80,
        "successRate": 95.0,
        "health": "healthy"
      }
    ]
  }
}
```

**500 Internal Server Error** - Metrics retrieval timeout or error
```json
{
  "success": false,
  "error": "Metrics retrieval timed out"
}
```

#### Metrics Fields

| Field                  | Type    | Description                                |
|------------------------|----------|-------------------------------------------|
| serviceName             | string   | Service operation name                     |
| totalCalls             | number   | Total API calls since start               |
| successCalls           | number   | Successful requests                        |
| failureCalls           | number   | Failed requests                          |
| timeoutCalls           | number   | Requests that timed out                  |
| rateLimitCalls         | number   | Requests blocked by rate limiter        |
| circuitBreakerOpenCount| number   | Circuit breaker triggered count             |
| lastError              | string   | Last error message                       |
| lastSuccessTime        | number   | Timestamp of last successful request      |
| lastFailureTime        | number   | Timestamp of last failed request         |
| averageResponseTime    | number   | Avg response time (last 100 calls, ms)  |
| successRate           | number   | Success rate percentage (0-100)         |
| health                | string   | Health status (healthy/degraded/unhealthy) |

#### Health Status Calculation

- **healthy**: successRate ≥ 90%
- **degraded**: 70% ≤ successRate < 90%
- **unhealthy**: successRate < 70%

#### Summary Fields

| Field            | Type   | Description                              |
|------------------|---------|-----------------------------------------|
| totalServices    | number  | Number of monitored services            |
| totalCalls       | number  | Total calls across all services        |
| totalSuccesses   | number  | Total successes across all services    |
| totalFailures   | number  | Total failures across all services      |
| totalTimeouts    | number  | Total timeouts across all services       |
| totalRateLimits  | number  | Total rate limits across all services   |

## Use Cases

- **Monitoring Dashboards**: Real-time performance metrics
- **Alerting Systems**: Threshold-based alerts (low success rate, high timeouts)
- **Capacity Planning**: Track service usage and growth
- **Performance Analysis**: Identify bottlenecks and optimization opportunities

## Integration Pattern

```
Metrics API
    ↓
Metrics Collector (in-memory)
    ↓
Service Aggregates (reduce operations)
    ↓
Health Status Calculation
    ↓
Response JSON
```

## Security

- No authentication required (public metrics endpoint)
- No sensitive data exposed (only aggregated metrics)
- Cache-Control: no-cache, no-store, must-revalidate

## Rate Limiting

No rate limiting on metrics endpoint (designed for monitoring tools).
