# Service Health Check Patterns and Monitoring Strategies

## Overview

This document describes health check patterns, monitoring strategies, and observability patterns for Maskom frontend services.

## Architecture

Frontend services use a three-layer monitoring approach:

```
Service Layer (EmailService, AuthService)
    ↓
Circuit Breaker State Monitoring
    ↓
Metrics Collection (call tracking, success rate, response time)
    ↓
Health Check (aggregated service status)
    ↓
Alert/Notification (future enhancement)
```

## Monitoring Components

### 1. Metrics Collector

**Location**: `src/utils/metrics/metricsCollector.ts`

**Purpose**: Real-time call tracking for all service operations

**Metrics Tracked**:
- `totalCalls`: Total number of API calls
- `successCalls`: Number of successful calls
- `failureCalls`: Number of failed calls
- `timeoutCalls`: Number of timeout errors
- `rateLimitCalls`: Number of rate limit errors
- `circuitBreakerOpenCount`: Number of times circuit breaker opened
- `lastError`: Last error message
- `lastSuccessTime`: Timestamp of last successful call (Unix epoch)
- `lastFailureTime`: Timestamp of last failed call (Unix epoch)
- `averageResponseTime`: Average response time in milliseconds (last 100 calls)

**Key Methods**:
```typescript
// Record a service call
metricsCollector.recordCall(
    serviceName: string,
    success: boolean,
    errorType?: string,
    responseTime?: number
): void

// Record circuit breaker state change
metricsCollector.recordCircuitBreakerState(
    serviceName: string,
    isOpen: boolean
): void

// Get metrics for a specific service
metricsCollector.getMetrics(serviceName: string): ServiceMetrics | undefined

// Get all metrics
metricsCollector.getAllMetrics(): ServiceMetrics[]

// Check service health with threshold
metricsCollector.healthCheck(
    serviceName: string,
    thresholdSuccessRate?: number
): HealthCheckResult

// Get all health checks
metricsCollector.getAllHealthChecks(
    thresholdSuccessRate?: number
): HealthCheckResult[]

// Reset metrics for a service
metricsCollector.reset(serviceName: string): void

// Reset all metrics
metricsCollector.resetAll(): void

// Export metrics for external monitoring
metricsCollector.exportMetrics(): MetricData[]
```

### 2. Circuit Breaker State

**Location**: `src/utils/resilience/circuitBreaker.ts`

**Purpose**: Prevent cascading failures when external APIs are experiencing issues

**States**:
- **Closed** (Normal): Requests flow through, failures counted
- **Open** (Failed): Requests rejected immediately, no retries
- **Half-Open** (Recovering): Test request allowed, state transitions based on result

**Key Methods**:
```typescript
// Execute operation with circuit breaker protection
circuitBreaker.execute<T>(
    fn: () => Promise<T>
): Promise<T>

// Get current state
circuitBreaker.getState(): CircuitBreakerState

// Reset circuit breaker
circuitBreaker.reset(): void
```

**Configuration** (from EmailService and AuthService):
- `failureThreshold`: Number of consecutive failures before opening (5 for EmailService, 50 for AuthService)
- `resetTimeoutMs`: Time in milliseconds before transitioning to half-open (60000ms = 60s)
- `monitoringPeriodMs`: Time window for failure counting (60000ms = 60s)

### 3. Service-Level Monitoring

#### EmailService Monitoring

**Monitoring Methods**:
```typescript
// Get EmailService metrics
emailService.getMetrics(): ServiceMetrics

// Get circuit breaker state
emailService.getCircuitBreakerState(): CircuitBreakerState

// Reset circuit breaker
emailService.resetCircuitBreaker(): void
```

**Monitoring Points**:
- Email send attempts
- Success/failure tracking
- Timeout detection
- Rate limit enforcement
- Circuit breaker state changes

**Metrics Structure**:
```typescript
interface ServiceMetrics {
    serviceName: string;           // 'EmailService'
    totalCalls: number;           // Total calls made
    successCalls: number;          // Successful calls
    failureCalls: number;          // Failed calls
    successRate: number;           // Success rate (0-1)
    averageResponseTime: number;    // Avg response time (ms)
}
```

#### AuthService Monitoring

**Monitoring Methods**:
```typescript
// Get auth service metrics
authService.getMetrics(): {
    login?: ServiceMetrics;
    register?: ServiceMetrics;
}

// Get circuit breaker state
authService.getCircuitBreakerState(): CircuitBreakerState

// Reset circuit breaker
authService.resetCircuitBreaker(): void

// Get login rate limit status
authService.getLoginRateLimitStatus(email: string): RateLimitStatus

// Get register rate limit status
authService.getRegisterRateLimitStatus(email: string): RateLimitStatus

// Reset rate limits
authService.resetLoginRateLimit(email: string): void
authService.resetRegisterRateLimit(email: string): void
authService.resetAllRateLimits(): void
```

**Monitoring Points**:
- Login attempts and results
- Registration attempts and results
- Rate limit enforcement (per email)
- Circuit breaker state changes
- Logout operations

**Rate Limit Status Structure**:
```typescript
interface RateLimitStatus {
    count: number;                  // Current attempt count
    firstAttempt: number;            // Timestamp of first attempt
    lockedUntil?: number | null;   // Timestamp when cooldown expires
    attemptsRemaining: number;        // Remaining attempts
}
```

## Health Check Patterns

### 1. Service Health Check

**Purpose**: Determine if a service is healthy based on metrics

**Implementation**:
```typescript
metricsCollector.healthCheck(
    serviceName: string,
    thresholdSuccessRate?: number  // Default: 0.8 (80%)
): HealthCheckResult
```

**Health Criteria**:
- **Healthy**: Success rate ≥ threshold AND total calls ≥ minimum sample size (10 calls)
- **Degraded**: Success rate < threshold BUT total calls ≥ minimum sample size
- **Insufficient Data**: Total calls < minimum sample size (10 calls)
- **Service Not Found**: No metrics recorded for service

**Health Check Result Structure**:
```typescript
interface HealthCheckResult {
    serviceName: string;           // Service name
    healthy: boolean;              // Health status
    message: string;              // Human-readable health message
    metrics?: ServiceMetrics;      // Service metrics (if available)
    checkedAt: number;            // Timestamp of check (Unix epoch)
}
```

### 2. All Services Health Check

**Purpose**: Perform health check on all monitored services

**Implementation**:
```typescript
metricsCollector.getAllHealthChecks(
    thresholdSuccessRate?: number  // Default: 0.8 (80%)
): HealthCheckResult[]
```

### 3. Health Check Examples

**Example 1: Healthy Service**
```typescript
const health = metricsCollector.healthCheck('EmailService', 0.9);

// Result:
{
//     serviceName: 'EmailService',
//     healthy: true,
//     message: 'Service is healthy (95.0% success rate)',
//     metrics: {
//         totalCalls: 100,
//         successCalls: 95,
//         failureCalls: 5,
//         successRate: 0.95,
//         averageResponseTime: 1500
//     },
//     checkedAt: 1736697600000
// }
```

**Example 2: Degraded Service**
```typescript
const health = metricsCollector.healthCheck('AuthService.login', 0.8);

// Result:
{
//     serviceName: 'AuthService.login',
//     healthy: false,
//     message: 'Service is degraded (70.0% success rate, below threshold 80.0%)',
//     metrics: {
//         totalCalls: 100,
//         successCalls: 70,
//         failureCalls: 30,
//         successRate: 0.70,
//         averageResponseTime: 2500
//     },
//     checkedAt: 1736697600000
// }
```

**Example 3: Insufficient Data**
```typescript
const health = metricsCollector.healthCheck('AuthService.register', 0.8);

// Result:
{
//     serviceName: 'AuthService.register',
//     healthy: false,
//     message: 'Insufficient data to determine health (5 calls, minimum 10 required)',
//     metrics: {
//         totalCalls: 5,
//         successCalls: 5,
//         failureCalls: 0,
//         successRate: 1.0,
//         averageResponseTime: 1200
//     },
//     checkedAt: 1736697600000
// }
```

## Monitoring Strategies

### Strategy 1: Real-Time Metrics Collection

**Pattern**: Every service call is automatically tracked

**Benefits**:
- Real-time visibility into service performance
- No manual instrumentation required
- Automatic aggregation of success/failure rates
- Response time tracking for performance monitoring

**Implementation**:
- Integrated into `executeWithResilience()` in `src/services/common/resilience.ts`
- Automatic call to `metricsCollector.recordCall()` for every service operation
- No action required from service implementers

### Strategy 2: Circuit Breaker State Monitoring

**Pattern**: Circuit breaker state changes are tracked and logged

**Benefits**:
- Early detection of service degradation
- Prevents cascading failures
- Automatic service recovery after cooldown
- Visible via `getCircuitBreakerState()` method

**Implementation**:
- Circuit breaker calls `metricsCollector.recordCircuitBreakerState()` on state changes
- State can be queried via `service.getCircuitBreakerState()`
- Manual reset available via `service.resetCircuitBreaker()`

### Strategy 3: Health Check Aggregation

**Pattern**: Periodic health checks aggregate service status

**Benefits**:
- Single source of truth for service health
- Configurable success rate thresholds
- Automatic service health classification
- Suitable for dashboards and alerts

**Implementation**:
```typescript
// Check all services
const allHealthChecks = metricsCollector.getAllHealthChecks(0.8);

allHealthChecks.forEach(health => {
    if (!health.healthy) {
        console.warn(`Service degraded: ${health.serviceName} - ${health.message}`);
        // Send alert/notification
    }
});
```

### Strategy 4: Rate Limit Monitoring

**Pattern**: Rate limit status is tracked per email/user

**Benefits**:
- Prevents brute force attacks
- Tracks remaining attempts
- Provides cooldown information
- Enables manual reset for admin operations

**Implementation**:
```typescript
// Check rate limit before operation
const loginStatus = authService.getLoginRateLimitStatus(email);

if (loginStatus.lockedUntil) {
    const cooldownEnds = new Date(loginStatus.lockedUntil);
    const timeRemaining = Math.ceil((cooldownEnds.getTime() - Date.now()) / 1000);
    console.warn(`Rate limited. Please try again in ${timeRemaining} seconds.`);
}

// Reset rate limit (admin)
authService.resetLoginRateLimit(email);
```

### Strategy 5: Metrics Export for External Monitoring

**Pattern**: Export metrics for external monitoring systems

**Benefits**:
- Integration with Prometheus, Datadog, CloudWatch, etc.
- Long-term metric storage and analysis
- Custom dashboards and alerts
- Trend analysis and capacity planning

**Implementation**:
```typescript
// Export all metrics for external monitoring
const metrics = metricsCollector.exportMetrics();

// Format for external systems (example: Prometheus text format)
const prometheusFormat = metrics.map(m =>
    `maskom_service_calls_total{service="${m.serviceName}"} ${m.totalCalls}`
).join('\n');

console.log(prometheusFormat);
```

**Export Structure**:
```typescript
interface MetricData {
    serviceName: string;           // Service name
    totalCalls: number;           // Total calls
    successCalls: number;          // Successful calls
    failureCalls: number;          // Failed calls
    successRate: number;           // Success rate
    averageResponseTime: number;    // Avg response time (ms)
}
```

## Observability Patterns

### Pattern 1: Component-Level Metrics

**Purpose**: Expose metrics to React components for real-time monitoring

**Implementation**:
```typescript
// In a React component
const [serviceMetrics, setServiceMetrics] = useState<ServiceMetrics | null>(null);

useEffect(() => {
    const updateMetrics = () => {
        const metrics = emailService.getMetrics();
        setServiceMetrics(metrics);
    };

    updateMetrics();
    const interval = setInterval(updateMetrics, 5000); // Update every 5 seconds

    return () => clearInterval(interval);
}, []);
```

### Pattern 2: Error Boundary Logging

**Purpose**: Catch and log component errors with service context

**Implementation**:
```typescript
// ErrorBoundary logs service errors automatically
// See: src/components/common/ErrorBoundary.tsx

const logServiceError = (error: Error, context: { service: string; operation: string }) => {
    // Logs to console with service context
    // Future: Send to external logging service
};
```

### Pattern 3: Service Health Dashboard (Future Enhancement)

**Purpose**: Real-time dashboard for all service health

**Proposed Implementation**:
```typescript
// Future: src/app/monitoring/page.tsx

export default function MonitoringDashboard() {
    const [healthChecks, setHealthChecks] = useState<HealthCheckResult[]>([]);

    useEffect(() => {
        const updateHealth = () => {
            const checks = metricsCollector.getAllHealthChecks(0.85);
            setHealthChecks(checks);
        };

        updateHealth();
        const interval = setInterval(updateHealth, 10000); // Update every 10 seconds

        return () => clearInterval(interval);
    }, []);

    return (
        <div>
            <h1>Service Health Dashboard</h1>
            {healthChecks.map(check => (
                <ServiceHealthCard key={check.serviceName} healthCheck={check} />
            ))}
        </div>
    );
}
```

## Alerting Strategies (Future Enhancement)

### Alert Types

1. **Service Degradation Alert**
   - Trigger: Success rate < threshold (e.g., < 80%)
   - Channel: Email, Slack, PagerDuty
   - Action: Notify on-call engineer

2. **Circuit Breaker Open Alert**
   - Trigger: Circuit breaker transitions to Open state
   - Channel: Email, Slack, PagerDuty
   - Action: Notify on-call engineer immediately

3. **Rate Limit Alert**
   - Trigger: Multiple rate limit violations for same user/IP
   - Channel: Email, Slack
   - Action: Review for potential attack

4. **High Error Rate Alert**
   - Trigger: Error rate > threshold (e.g., > 10%)
   - Channel: Email, Slack, PagerDuty
   - Action: Investigate service issue

### Alert Implementation Pattern

```typescript
// Future: src/utils/monitoring/alertManager.ts

class AlertManager {
    sendServiceDegradedAlert(serviceName: string, successRate: number): void {
        // Send to Slack
        await slackClient.sendMessage({
            channel: '#alerts',
            text: `🚨 Service Degraded: ${serviceName} (${successRate.toFixed(1)}% success rate)`
        });

        // Send to email
        await emailService.sendEmail({
            templateParams: {
                user_name: 'DevOps Team',
                user_email: 'devops@maskom.co.id',
                message: `Service ${serviceName} degraded to ${successRate.toFixed(1)}% success rate`
            }
        });
    }

    sendCircuitBreakerAlert(serviceName: string): void {
        // Send high-priority alert
        await slackClient.sendMessage({
            channel: '#alerts',
            text: `⚡ Circuit Breaker Open: ${serviceName} - Immediate attention required`
        });
    }
}
```

## Best Practices

### 1. Threshold Configuration

**Success Rate Thresholds**:
- **Critical services** (auth): 0.90 - 0.95 (90-95%)
- **Important services** (email): 0.80 - 0.90 (80-90%)
- **Standard services**: 0.75 - 0.85 (75-85%)

**Minimum Sample Size**: 10 calls before determining health

### 2. Monitoring Frequency

- **Real-time metrics**: Every call (automatic)
- **Health checks**: Every 5-10 seconds (dashboard)
- **Metrics export**: Every 60 seconds (external systems)
- **Alerts**: Immediate upon threshold violation

### 3. Circuit Breaker Configuration

**Failure Thresholds**:
- **EmailService**: 5 consecutive failures
- **AuthService**: 50 consecutive failures (high to avoid interfering with per-user rate limiting)

**Reset Timeout**: 60,000ms (60 seconds)

**Monitoring Period**: 60,000ms (60 seconds)

### 4. Rate Limit Configuration

**Login**:
- **Limit**: 5 attempts per 15 minutes
- **Cooldown**: 30 minutes

**Register**:
- **Limit**: 5 attempts per 1 hour
- **Cooldown**: 2 hours

**Email**:
- **Limit**: 5 attempts per 60 seconds
- **Cooldown**: 5 minutes

### 5. Metrics Retention

**In-Memory**: Current session (lost on page refresh)
- Average response time: Last 100 calls
- Total counts: Unlimited (session lifetime)

**External Systems**: Configurable retention
- Prometheus: 15 days default
- CloudWatch: 30 days default
- Datadog: Customizable

## Troubleshooting

### Issue: Circuit Breaker Frequently Opens

**Symptoms**:
- Circuit breaker in Open state frequently
- High failure rate in metrics

**Investigation Steps**:
1. Check external API status (EmailJS, backend auth service)
2. Review error messages in metrics (`lastError`)
3. Verify API credentials are valid
4. Check network connectivity
5. Review timeout configuration

**Actions**:
- Fix underlying issue (API outage, credentials, network)
- Increase failure threshold temporarily if needed
- Monitor recovery after fix

### Issue: Degraded Service Performance

**Symptoms**:
- Success rate below threshold
- High average response time

**Investigation Steps**:
1. Check `averageResponseTime` in metrics
2. Review `failureCalls` for error patterns
3. Check for rate limit spikes
4. Verify external API performance

**Actions**:
- Optimize slow operations
- Increase timeout if needed
- Review retry configuration
- Scale backend resources if needed

### Issue: High Error Rate

**Symptoms**:
- Many `failureCalls` in metrics
- Low `successRate`

**Investigation Steps**:
1. Review `lastError` messages
2. Check error type distribution (timeout, rate limit, circuit breaker, network)
3. Identify common error patterns

**Actions**:
- Fix root cause of errors
- Improve error handling for transient failures
- Add retries for retryable errors
- Reduce timeout for responsive operations

## External Monitoring Integration

### Prometheus Integration

**Export Format**:
```prometheus
maskom_service_calls_total{service="EmailService"} 1000
maskom_service_calls_success_total{service="EmailService"} 950
maskom_service_calls_failure_total{service="EmailService"} 50
maskom_service_success_rate{service="EmailService"} 0.95
maskom_service_response_time_ms{service="EmailService"} 1500
maskom_circuit_breaker_open{service="EmailService"} 0
```

**Configuration**:
```yaml
# prometheus.yml
scrape_configs:
  - job_name: 'maskom'
    metrics_path: '/api/metrics/prometheus'
    scrape_interval: 15s
```

### Datadog Integration

**API Key**: Required
**Metrics Format**: Custom metrics
**Setup**:
```typescript
// npm install datadog-browser-logs
import datadogLogs from 'datadog-browser-logs';

datadogLogs.init({
    clientToken: process.env.NEXT_PUBLIC_DATADOG_CLIENT_TOKEN,
    site: 'datadoghq.com',
    forwardErrorsToLogs: true
});

// Send metrics
datadogLogs.logger.debug('Service call', {
    service: 'EmailService',
    successRate: 0.95,
    responseTime: 1500
});
```

### CloudWatch Integration

**Setup**:
```typescript
// npm install @aws-sdk/client-cloudwatch
import { CloudWatchClient, PutMetricDataCommand } from '@aws-sdk/client-cloudwatch';

const cloudwatch = new CloudWatchClient({ region: 'ap-southeast-1' });

async function sendMetricToCloudWatch(serviceName: string, metricName: string, value: number) {
    await cloudwatch.send(new PutMetricDataCommand({
        Namespace: 'Maskom/Frontend',
        MetricData: [{
            MetricName: metricName,
            Dimensions: [{ Name: 'Service', Value: serviceName }],
            Value: value,
            Timestamp: new Date(),
            Unit: 'Count'
        }]
    }));
}

// Example: Send success rate
await sendMetricToCloudWatch('EmailService', 'SuccessRate', 0.95);
```

## Summary

Maskom frontend services implement comprehensive monitoring and observability patterns:

1. **Metrics Collection**: Real-time tracking of all service calls
2. **Circuit Breaker Monitoring**: State tracking and automatic recovery
3. **Health Checks**: Aggregated service health with configurable thresholds
4. **Rate Limit Monitoring**: Per-user rate limit tracking
5. **External Integration**: Export capabilities for Prometheus, Datadog, CloudWatch
6. **Future Enhancements**: Alerting, dashboard, persistent metrics storage

All monitoring is integrated into service operations automatically via `executeWithResilience()` and requires no manual instrumentation.
