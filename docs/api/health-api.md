# Health Check API

Provides health status monitoring for all services with configurable success rate thresholds.

## Endpoints

### GET /api/health

Returns health check results for all monitored services.

#### Query Parameters

| Parameter | Type    | Default | Description                             |
|-----------|----------|----------|-----------------------------------------|
| threshold | number   | 0.9      | Success rate threshold (0.0 - 1.0) |

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

**200 OK** - All services healthy
```json
{
  "success": true,
  "message": "All services healthy",
  "data": {
    "status": "healthy",
    "timestamp": "2026-01-13T22:30:00.000Z",
    "services": [
      {
        "serviceName": "EmailService.sendEmail",
        "healthy": true,
        "message": "Service healthy (success rate: 95.0%)",
        "metrics": {
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
          "averageResponseTime": 150
        },
        "checkedAt": 1736808600000
      }
    ],
    "summary": {
      "totalServices": 1,
      "healthyServices": 1,
      "unhealthyServices": 0,
      "successRateThreshold": 0.9
    }
  }
}
```

**503 Service Unavailable** - Any service unhealthy
```json
{
  "success": true,
  "message": "One or more services degraded",
  "data": {
    "status": "degraded",
    "timestamp": "2026-01-13T22:30:00.000Z",
    "services": [...],
    "summary": {
      "totalServices": 2,
      "healthyServices": 1,
      "unhealthyServices": 1,
      "successRateThreshold": 0.9
    }
  }
}
```

**500 Internal Server Error** - Health check timeout or error
```json
{
  "success": false,
  "error": "Health check operation timed out"
}
```

#### Health Status Categories

- **healthy** (≥90%): Service operating normally
- **degraded** (70-89%): Service experiencing issues
- **unhealthy** (<70%): Service requires attention

#### Use Cases

- **Monitoring Systems**: Periodic health checks by external monitoring tools
- **Load Balancers**: Health-based routing decisions
- **CI/CD**: Pre-deployment health verification
- **Dashboards**: Real-time service status display

## Integration Pattern

Follows resilience architecture:
```
Health Check API
    ↓
Metrics Collector (in-memory)
    ↓
Service Metrics (EmailService, AuthService)
    ↓
Circuit Breaker State
    ↓
Health Status (healthy/degraded)
```

## Security

- No authentication required (public endpoint for monitoring)
- No sensitive data exposed (only metrics and health status)
- Cache-Control: no-cache, no-store, must-revalidate

## Rate Limiting

No rate limiting on health check endpoint (designed for high-frequency monitoring).
