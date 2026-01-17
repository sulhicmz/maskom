# API Routes Documentation

## Overview

This document describes the server-side API routes for the Maskom application. These endpoints provide monitoring, health checks, and service status capabilities for production observability.

## Architecture

Maskom uses a hybrid architecture:
- **Client-Side Services**: EmailService and AuthService (documented separately)
- **Server-Side API Routes**: Monitoring and health check endpoints (this document)

### Service Layer vs API Routes

| Layer | Purpose | Location | Documentation |
|-------|---------|----------|---------------|
| Client-Side Services | External integrations (EmailJS, Auth) | `src/services/` | `docs/api/email-service.md`, `docs/api/auth-service.md` |
| Server-Side API Routes | Monitoring, health checks, status | `src/app/api/` | This document |

## Response Format

All API responses follow the standardized `ServiceResult<T>` format:

```typescript
interface ServiceResult<T> {
    success: boolean;                    // Operation success status
    message?: string;                   // Success message (on success)
    data?: T;                          // Response data (on success)
    error?: string;                     // Error message (on failure)
    errorCode?: ServiceErrorCodeType;     // Error code (on failure)
    metadata?: Record<string, unknown>;   // Additional metadata
}
```

### Standard Headers

All API responses include:
- `Content-Type: application/json`
- `Cache-Control: no-cache, no-store, must-revalidate`

## Endpoints

### 1. Health Check Endpoint

#### `GET /api/health`

Performs health check for all services with configurable success rate threshold.

##### Purpose

This endpoint monitors the health of EmailService and AuthService by evaluating their success rate metrics. A service is considered healthy if its success rate meets or exceeds the specified threshold.

##### Query Parameters

| Parameter | Type | Required | Default | Description |
|-----------|------|----------|---------|-------------|
| `threshold` | number | No | 0.9 | Success rate threshold (0-1). Default: 0.9 (90%) |

##### Request Examples

```bash
# Default threshold (0.9)
curl -X GET "http://localhost:3000/api/health"

# Custom threshold (0.8 = 80%)
curl -X GET "http://localhost:3000/api/health?threshold=0.8"

# Strict threshold (0.95 = 95%)
curl -X GET "http://localhost:3000/api/health?threshold=0.95"
```

##### Response: Success (200)

```json
{
  "success": true,
  "data": {
    "status": "healthy",
    "timestamp": "2026-01-14T12:00:00.000Z",
    "services": [
      {
        "serviceName": "EmailService",
        "healthy": true,
        "message": "Service is healthy (100.0% success rate)",
        "metrics": {
          "serviceName": "EmailService",
          "totalCalls": 100,
          "successCalls": 100,
          "failureCalls": 0,
          "averageResponseTime": 1500
        },
        "checkedAt": 1736697600000
      },
      {
        "serviceName": "AuthService.login",
        "healthy": true,
        "message": "Service is healthy (95.0% success rate)",
        "metrics": {
          "serviceName": "AuthService.login",
          "totalCalls": 200,
          "successCalls": 190,
          "failureCalls": 10,
          "averageResponseTime": 2000
        },
        "checkedAt": 1736697600000
      }
    ],
    "summary": {
      "totalServices": 2,
      "healthyServices": 2,
      "unhealthyServices": 0,
      "successRateThreshold": 0.9
    }
  },
  "message": "All services healthy"
}
```

##### Response: Degraded (503)

```json
{
  "success": true,
  "data": {
    "status": "degraded",
    "timestamp": "2026-01-14T12:00:00.000Z",
    "services": [
      {
        "serviceName": "EmailService",
        "healthy": true,
        "message": "Service is healthy (100.0% success rate)",
        "metrics": {
          "serviceName": "EmailService",
          "totalCalls": 100,
          "successCalls": 100,
          "failureCalls": 0,
          "averageResponseTime": 1500
        },
        "checkedAt": 1736697600000
      },
      {
        "serviceName": "AuthService.login",
        "healthy": false,
        "message": "Service is degraded (85.0% success rate, below threshold 90.0%)",
        "metrics": {
          "serviceName": "AuthService.login",
          "totalCalls": 200,
          "successCalls": 170,
          "failureCalls": 30,
          "averageResponseTime": 2500
        },
        "checkedAt": 1736697600000
      }
    ],
    "summary": {
      "totalServices": 2,
      "healthyServices": 1,
      "unhealthyServices": 1,
      "successRateThreshold": 0.9
    }
  },
  "message": "One or more services degraded"
}
```

##### Response: Error (500)

```json
{
  "success": false,
  "error": "Internal server error"
}
```

##### Status Codes

| Code | Description |
|------|-------------|
| 200 | All services healthy |
| 503 | One or more services degraded or unhealthy |
| 500 | Internal server error |

##### Use Cases

1. **Health Monitoring**: Monitor service health in production dashboards
2. **Automated Alerts**: Trigger alerts when services degrade
3. **Load Balancing**: Route traffic based on service health
4. **CI/CD Checks**: Verify service health before deployment

##### Response Fields

| Field | Type | Description |
|-------|------|-------------|
| `status` | string | Overall system health: `healthy` or `degraded` |
| `timestamp` | string | ISO 8601 timestamp of health check |
| `services[]` | array | Array of individual service health checks |
| `services[].serviceName` | string | Name of the service |
| `services[].healthy` | boolean | Whether service meets threshold |
| `services[].message` | string | Health check message |
| `services[].metrics` | object | Service metrics at time of check |
| `services[].checkedAt` | number | Unix timestamp of check |
| `summary.totalServices` | number | Total services checked |
| `summary.healthyServices` | number | Services meeting threshold |
| `summary.unhealthyServices` | number | Services below threshold |
| `summary.successRateThreshold` | number | Threshold used for evaluation |

---

### 2. Metrics Endpoint

#### `GET /api/metrics`

Retrieves metrics for all monitored services including success rates and health status.

##### Purpose

This endpoint returns aggregated metrics from EmailService and AuthService, providing insights into API performance, error rates, and system health.

##### Request Examples

```bash
# Get all metrics
curl -X GET "http://localhost:3000/api/metrics"
```

##### Response: Success (200)

```json
{
  "success": true,
  "data": {
    "timestamp": "2026-01-14T12:00:00.000Z",
    "summary": {
      "totalServices": 2,
      "totalCalls": 300,
      "totalSuccesses": 270,
      "totalFailures": 30,
      "totalTimeouts": 2,
      "totalRateLimits": 5
    },
    "services": [
      {
        "serviceName": "EmailService",
        "totalCalls": 100,
        "successCalls": 100,
        "failureCalls": 0,
        "timeoutCalls": 0,
        "rateLimitCalls": 0,
        "circuitBreakerOpenCount": 0,
        "lastError": null,
        "lastSuccessTime": 1736697600000,
        "lastFailureTime": null,
        "averageResponseTime": 1500,
        "successRate": 100,
        "health": "healthy"
      },
      {
        "serviceName": "AuthService.login",
        "totalCalls": 200,
        "successCalls": 170,
        "failureCalls": 30,
        "timeoutCalls": 2,
        "rateLimitCalls": 5,
        "circuitBreakerOpenCount": 0,
        "lastError": "Terlalu banyak percobaan",
        "lastSuccessTime": 1736697600000,
        "lastFailureTime": 1736697500000,
        "averageResponseTime": 2000,
        "successRate": 85,
        "health": "unhealthy"
      }
    ]
  },
  "message": "Metrics retrieved successfully"
}
```

##### Response: Error (500)

```json
{
  "success": false,
  "error": "Internal server error"
}
```

##### Status Codes

| Code | Description |
|------|-------------|
| 200 | Metrics retrieved successfully |
| 500 | Internal server error |

##### Use Cases

1. **Performance Monitoring**: Track API response times and success rates
2. **Error Analysis**: Identify failure patterns and error types
3. **Capacity Planning**: Analyze call volumes and resource usage
4. **Debugging**: Investigate service performance issues

##### Response Fields

| Field | Type | Description |
|-------|------|-------------|
| `timestamp` | string | ISO 8601 timestamp of metrics collection |
| `summary.totalServices` | number | Total number of services |
| `summary.totalCalls` | number | Total API calls across all services |
| `summary.totalSuccesses` | number | Total successful calls |
| `summary.totalFailures` | number | Total failed calls |
| `summary.totalTimeouts` | number | Total timeout errors |
| `summary.totalRateLimits` | number | Total rate limit errors |
| `services[]` | array | Array of service metrics |
| `services[].serviceName` | string | Name of the service |
| `services[].totalCalls` | number | Total API calls |
| `services[].successCalls` | number | Successful calls |
| `services[].failureCalls` | number | Failed calls |
| `services[].timeoutCalls` | number | Timeout errors |
| `services[].rateLimitCalls` | number | Rate limit errors |
| `services[].circuitBreakerOpenCount` | number | Circuit breaker opens |
| `services[].lastError` | string\|null | Last error message |
| `services[].lastSuccessTime` | number | Last success timestamp (Unix epoch) |
| `services[].lastFailureTime` | number | Last failure timestamp (Unix epoch) |
| `services[].averageResponseTime` | number | Average response time (ms) |
| `services[].successRate` | number | Success rate percentage (0-100) |
| `services[].health` | string | Health status: `healthy`, `degraded`, `unhealthy` |

---

### 3. Service Status Endpoint

#### `GET /api/services/status`

Retrieves detailed status for EmailService and AuthService including metrics and circuit breaker states.

##### Purpose

This endpoint provides real-time status monitoring for client-side services, including circuit breaker states for debugging and production monitoring.

##### Request Examples

```bash
# Get service status
curl -X GET "http://localhost:3000/api/services/status"
```

##### Response: Success (200)

```json
{
  "success": true,
  "data": {
    "timestamp": "2026-01-14T12:00:00.000Z",
    "email": {
      "metrics": {
        "serviceName": "EmailService",
        "totalCalls": 100,
        "successCalls": 95,
        "failureCalls": 5,
        "averageResponseTime": 1500
      },
      "circuitBreaker": {
        "state": "closed",
        "failureCount": 0,
        "lastFailureTime": null,
        "nextAttemptTime": null
      }
    },
    "auth": {
      "metrics": {
        "login": {
          "serviceName": "AuthService.login",
          "totalCalls": 200,
          "successCalls": 190,
          "failureCalls": 10,
          "averageResponseTime": 2000
        },
        "register": {
          "serviceName": "AuthService.register",
          "totalCalls": 50,
          "successCalls": 48,
          "failureCalls": 2,
          "averageResponseTime": 2500
        }
      },
      "circuitBreaker": {
        "state": "closed",
        "failureCount": 3,
        "lastFailureTime": 1736697500000,
        "nextAttemptTime": null
      }
    }
  },
  "message": "Service status retrieved successfully"
}
```

##### Response: Error (500)

```json
{
  "success": false,
  "error": "Internal server error"
}
```

##### Status Codes

| Code | Description |
|------|-------------|
| 200 | Service status retrieved successfully |
| 500 | Internal server error |

##### Use Cases

1. **Debugging**: Investigate circuit breaker state transitions
2. **Service Monitoring**: Real-time service health monitoring
3. **Troubleshooting**: Diagnose service issues in production
4. **Automated Recovery**: Detect circuit breaker opens and trigger alerts

##### Response Fields

| Field | Type | Description |
|-------|------|-------------|
| `timestamp` | string | ISO 8601 timestamp of status check |
| `email.metrics` | object | Email service metrics |
| `email.metrics.serviceName` | string | Name of the service |
| `email.metrics.totalCalls` | number | Total API calls |
| `email.metrics.successCalls` | number | Successful calls |
| `email.metrics.failureCalls` | number | Failed calls |
| `email.metrics.averageResponseTime` | number | Average response time (ms) |
| `email.circuitBreaker` | object | Circuit breaker state |
| `email.circuitBreaker.state` | string | Circuit breaker state: `closed`, `open`, `half-open` |
| `email.circuitBreaker.failureCount` | number | Consecutive failures count |
| `email.circuitBreaker.lastFailureTime` | number\|null | Last failure timestamp (Unix epoch) |
| `email.circuitBreaker.nextAttemptTime` | number\|null | Next attempt allowed timestamp (Unix epoch) |
| `auth.metrics` | object | Auth service metrics (grouped by operation) |
| `auth.metrics.login` | object | Login operation metrics |
| `auth.metrics.register` | object | Register operation metrics |
| `auth.circuitBreaker` | object | Auth circuit breaker state |

---

## Circuit Breaker States

### State Descriptions

| State | Description | Behavior |
|-------|-------------|-----------|
| **Closed** | Normal operation | Requests flow through, failures counted |
| **Open** | Service degraded | Requests rejected immediately, no retries |
| **Half-Open** | Testing recovery | Test request allowed, state transitions based on result |

### State Transitions

```
Closed → Open: After consecutive failures exceed threshold
Open → Half-Open: After reset timeout expires
Half-Open → Open: On failure (resets timer)
Half-Open → Closed: On success (resets failure count)
```

### Configuration

| Parameter | EmailService | AuthService |
|-----------|--------------|--------------|
| Failure Threshold | 5 consecutive failures | 50 consecutive failures |
| Reset Timeout | 60 seconds | 60 seconds |

---

## Service Health Classification

### Success Rate Thresholds

| Health Status | Success Rate | Description |
|---------------|--------------|-------------|
| **Healthy** | ≥ 90% | Service operating normally |
| **Degraded** | ≥ 70% & < 90% | Service experiencing issues |
| **Unhealthy** | < 70% | Service requires attention |

### Health Calculation

Health status is calculated from service metrics:
- `successRate = successCalls / totalCalls`
- Health classification based on success rate thresholds
- Applied per service (not aggregated)

---

## Rate Limiting Configuration

### EmailService Rate Limits

| Operation | Limit | Window | Cooldown |
|-----------|-------|--------|----------|
| sendEmail | 5 attempts | 1 minute | 5 minutes |

### AuthService Rate Limits

| Operation | Limit | Window | Cooldown |
|-----------|-------|--------|----------|
| login | 5 attempts | 15 minutes | 30 minutes |
| register | 5 attempts | 1 hour | 2 hours |

---

## Timeout Configuration

### Service Timeouts

| Service | Operation | Timeout |
|---------|-----------|----------|
| EmailService | sendEmail | 10,000ms (10 seconds) |
| AuthService | login | 5,000ms (5 seconds) |
| AuthService | register | 5,000ms (5 seconds) |
| AuthService | logout | 5,000ms (5 seconds) |

### API Route Timeouts

| Endpoint | Timeout |
|----------|----------|
| /api/health | 30,000ms (30 seconds) |
| /api/metrics | 30,000ms (30 seconds) |
| /api/services/status | 30,000ms (30 seconds) |

---

## Error Handling

### Standard Error Response

```json
{
  "success": false,
  "error": "Error message",
  "errorCode": "ERROR_CODE"
}
```

### Error Codes

| Error Code | Description | Action |
|------------|-------------|---------|
| `VALIDATION_ERROR` | Input validation failed | Validate input format |
| `RATE_LIMIT_EXCEEDED` | Rate limit exceeded | Wait for cooldown |
| `TIMEOUT` | Operation timed out | Retry automatically |
| `CIRCUIT_BREAKER_OPEN` | Circuit breaker open | Wait for reset |
| `CREDENTIALS_MISSING` | Credentials missing | Check environment variables |
| `NETWORK_ERROR` | Network error | Check connectivity |
| `UNKNOWN_ERROR` | Unknown error | Check logs |

---

## Best Practices

### 1. Health Monitoring

```typescript
const checkHealth = async () => {
  const response = await fetch('/api/health?threshold=0.9');

  if (response.status === 503) {
    // Alert: Services degraded
    alert('One or more services degraded');
  } else if (response.status === 200) {
    // All services healthy
    console.log('All services healthy');
  }
};
```

### 2. Metrics Analysis

```typescript
const getMetrics = async () => {
  const response = await fetch('/api/metrics');
  const result = await response.json();

  if (result.success) {
    const { summary, services } = result.data;

    // Calculate overall success rate
    const successRate = (summary.totalSuccesses / summary.totalCalls) * 100;
    console.log(`Overall success rate: ${successRate.toFixed(2)}%`);

    // Identify unhealthy services
    const unhealthyServices = services.filter(s => s.health !== 'healthy');
    if (unhealthyServices.length > 0) {
      console.warn('Unhealthy services:', unhealthyServices);
    }
  }
};
```

### 3. Circuit Breaker Monitoring

```typescript
const getServiceStatus = async () => {
  const response = await fetch('/api/services/status');
  const result = await response.json();

  if (result.success) {
    const { email, auth } = result.data;

    // Check circuit breaker states
    if (email.circuitBreaker.state === 'open') {
      alert('Email service circuit breaker is open');
    }

    if (auth.circuitBreaker.state === 'open') {
      alert('Auth service circuit breaker is open');
    }
  }
};
```

---

## Security Considerations

1. **No Authentication**: API routes are public monitoring endpoints (consider adding authentication for production)
2. **Rate Limiting**: API routes themselves are not rate-limited (add if abused)
3. **Error Messages**: Generic error messages prevent information leakage
4. **CORS**: Configure CORS headers for cross-origin requests
5. **HTTPS**: Use HTTPS in production for all API requests

---

## Monitoring & Observability

### Metrics Collected

- **Total Calls**: Total API calls per service
- **Success Calls**: Successful API calls
- **Failure Calls**: Failed API calls
- **Timeout Calls**: Timeout errors
- **Rate Limit Calls**: Rate limit errors
- **Circuit Breaker Opens**: Circuit breaker state transitions
- **Average Response Time**: Mean response time in milliseconds
- **Success Rate**: Calculated success percentage

### Recommended Monitoring Tools

1. **Application Performance Monitoring (APM)**: New Relic, Datadog, or Sentry
2. **Logging**: Centralized logging (ELK Stack, CloudWatch)
3. **Alerting**: PagerDuty, Opsgenie, or custom alerts
4. **Dashboards**: Grafana, Kibana, or custom dashboards

### Alert Thresholds

Recommended alert thresholds:
- **Success Rate**: Alert if < 90% for 5 minutes
- **Response Time**: Alert if > 5 seconds for 5 minutes
- **Failure Rate**: Alert if > 10% for 5 minutes
- **Circuit Breaker**: Alert when circuit opens

---

## Testing

### Manual Testing

```bash
# Health check
curl -X GET "http://localhost:3000/api/health?threshold=0.9"

# Metrics
curl -X GET "http://localhost:3000/api/metrics"

# Service status
curl -X GET "http://localhost:3000/api/services/status"
```

### Automated Testing

See test files:
- `src/app/api/health/__tests__/route.test.ts`
- `src/app/api/metrics/__tests__/route.test.ts`
- `src/app/api/services/status/__tests__/route.test.ts`

---

## Troubleshooting

### Common Issues

1. **"One or more services degraded" (503)**
   - Service success rate below threshold
   - Check service metrics for failure patterns
   - Investigate service logs for errors
   - Adjust threshold if needed

2. **"Internal server error" (500)**
   - Metrics collection failed
   - Check server logs for stack trace
   - Verify metrics collector is initialized

3. **Slow response times**
   - High average response time in metrics
   - Check for circuit breaker opens
   - Investigate service dependencies
   - Review timeout configuration

4. **Circuit breaker open**
   - Consecutive failures exceeded threshold
   - Wait 60 seconds for automatic reset
   - Check service logs for root cause
   - Manual reset available via service methods

---

## Related Documentation

- [Email Service API - docs/api/email-service.md](./email-service.md)
- [Auth Service API - docs/api/auth-service.md](./auth-service.md)
- [OpenAPI Specification - docs/openapi-spec.yaml](./openapi-spec.yaml)
- [Postman Collection - docs/postman-collection.json](./postman-collection.json)
- [Resilience Patterns - src/utils/resilience/](../utils/resilience/)
- [Integration Architecture - docs/blueprint.md](./blueprint.md)

---

## Version History

| Version | Date | Changes |
|---------|------|---------|
| 3.0.0 | 2026-01-17 | Initial API routes documentation |

---

## Support

For issues or questions:
- GitHub Issues: https://github.com/sulhicmz/maskom/issues
- Documentation: https://maskom.co.id/docs
