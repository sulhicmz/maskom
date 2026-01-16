# Services Status API

Detailed status monitoring for individual services including circuit breaker state.

## Endpoints

### GET /api/services/status

Returns detailed status for all services with metrics and circuit breaker information.

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
  "message": "Service status retrieved successfully",
  "data": {
    "timestamp": "2026-01-13T22:30:00.000Z",
    "email": {
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
      "circuitBreaker": {
        "isOpen": false,
        "failureCount": 2,
        "lastFailureTime": null,
        "lastSuccessTime": 17368068095678
      }
    },
    "auth": {
      "metrics": {
        "login": {
          "serviceName": "AuthService.login",
          "totalCalls": 200,
          "successCalls": 190,
          "failureCalls": 10,
          "timeoutCalls": 3,
          "rateLimitCalls": 5,
          "circuitBreakerOpenCount": 1
        },
        "register": {
          "serviceName": "AuthService.register",
          "totalCalls": 50,
          "successCalls": 48,
          "failureCalls": 2,
          "timeoutCalls": 0,
          "rateLimitCalls": 1,
          "circuitBreakerOpenCount": 0
        }
      },
      "circuitBreaker": {
        "isOpen": false,
        "failureCount": 1,
        "lastFailureTime": null,
        "lastSuccessTime": 17368068095678
      }
    }
  }
}
```

**500 Internal Server Error** - Service status retrieval timeout or error
```json
{
  "success": false,
  "error": "Service status retrieval timed out"
}
```

#### Circuit Breaker Fields

| Field           | Type   | Description                              |
|-----------------|---------|-----------------------------------------|
| isOpen          | boolean | True = circuit open, blocking requests  |
| failureCount    | number  | Current failure count                   |
| lastFailureTime | number  | Timestamp of last failure (null = none)|
| lastSuccessTime | number  | Timestamp of last success (null = none)|

#### Circuit Breaker States

- **Closed** (isOpen: false): Normal operation, requests flow through
- **Open** (isOpen: true): Failing service, requests rejected
- **Half-Open** (transition): Testing if service has recovered

#### Service Sections

| Service | Metrics Object | Description                    |
|----------|------------------|---------------------------------|
| email    | EmailService     | Email sending via EmailJS          |
| auth      | login/register   | Authentication operations             |

## Use Cases

- **Debugging**: Detailed circuit breaker state for troubleshooting
- **Manual Recovery**: Circuit breaker state inspection before manual reset
- **Performance Analysis**: Identify services with high failure counts
- **Operational Visibility**: Real-time service status for operations teams

## Integration Pattern

```
Services Status API
    ↓
Service Instances (EmailService, AuthService)
    ↓
Service Metrics (getMetrics())
    ↓
Circuit Breaker State (getCircuitBreakerState())
    ↓
Response JSON (service by service)
```

## Security

- No authentication required (public status endpoint)
- No sensitive data exposed (only service metrics and circuit breaker state)
- Cache-Control: no-cache, no-store, must-revalidate

## Rate Limiting

No rate limiting on services status endpoint (designed for monitoring tools).
