# Email Service API Documentation

## Overview

The EmailService provides a resilient, production-ready abstraction for sending emails via EmailJS. It implements circuit breaker, retry, and timeout patterns to ensure reliable email delivery.

## Service Type System

### ServiceResult<T>

All services in the application use a standardized response type system:

```typescript
interface ServiceResult<T = void> {
    success: boolean;
    message?: string;
    data?: T;
    error?: string;
    errorCode?: ServiceErrorCodeType;
    metadata?: Record<string, unknown>;
}
```

### Standardized Error Codes

```typescript
const ServiceErrorCode = {
    VALIDATION: 'VALIDATION_ERROR',
    RATE_LIMIT: 'RATE_LIMIT_EXCEEDED',
    TIMEOUT: 'TIMEOUT',
    CIRCUIT_BREAKER: 'CIRCUIT_BREAKER_OPEN',
    CREDENTIALS_MISSING: 'CREDENTIALS_MISSING',
    UNKNOWN: 'UNKNOWN_ERROR',
    NETWORK: 'NETWORK_ERROR',
};
```

### EmailService Response

EmailService returns `ServiceResult<{ text: string }>`:
- `data`: Contains `{ text: string }` from EmailJS response
- `metadata`: May contain `{ rateLimited: boolean }` for rate limit status
- `errorCode`: Uses `ServiceErrorCode` constants for type-safe error handling

This standardized approach ensures consistent error handling, type safety, and predictable response structure across all services.

## Environment Variables

```bash
NEXT_PUBLIC_EMAILJS_SERVICE_ID=<service-id>
NEXT_PUBLIC_EMAILJS_TEMPLATE_ID=<template-id>
NEXT_PUBLIC_EMAILJS_PUBLIC_KEY=<public-key>
```

## API Contract

### `IEmailService` Interface

```typescript
interface IEmailService {
    sendEmail(params: EmailSendParams, options?: EmailSendOptions): Promise<EmailSendResult>;
    getCircuitBreakerState(): CircuitBreakerState;
    resetCircuitBreaker(): void;
}
```

### Request: `EmailSendParams`

```typescript
interface EmailSendParams {
    templateParams: {
        user_name: string;   // Sender name
        user_email: string;  // Sender email address
        message: string;      // Email message content
    };
}
```

### Options: `EmailSendOptions`

```typescript
interface EmailSendOptions {
    skipRateLimit?: boolean;  // Skip rate limit check (for admin use)
    identifier?: string;     // Custom identifier for rate limiting (defaults to user_email)
}
```

### Response: `ServiceResult<{ text: string }>`

```typescript
interface ServiceResult<{ text: string }> {
    success: boolean;        // True if email sent successfully
    message?: string;        // Success message
    data?: { text: string }; // EmailJS response object with text field
    error?: string;         // Error message if failed
    errorCode?: ServiceErrorCodeType;  // Error code
    metadata?: { rateLimited?: boolean };  // Additional metadata
}
```

## Usage

### Basic Usage

```typescript
import emailService from '@/services/email';

const result = await emailService.sendEmail({
    templateParams: {
        user_name: 'John Doe',
        user_email: 'john@example.com',
        message: 'Hello, this is a test message.'
    }
});

if (result.success) {
    console.log('Email sent successfully:', result.data?.text);
    console.log('Message:', result.message);
} else if (result.metadata?.rateLimited) {
    console.warn('Rate limited:', result.error);
} else {
    console.error('Failed to send email:', result.error);
    console.error('Error code:', result.errorCode);
}
```

### React Component Integration

```typescript
import emailService from '@/services/email';

const handleSendEmail = async (formData: FormData) => {
    const result = await emailService.sendEmail({
        templateParams: {
            user_name: formData.get('name') as string,
            user_email: formData.get('email') as string,
            message: formData.get('message') as string
        }
    });

    if (result.metadata?.rateLimited) {
        toast.error(result.error || 'Too many attempts. Please try again later.');
        return;
    }

    return result;
};
```

### Custom Rate Limit Identifier

```typescript
import emailService from '@/services/email';

// Use a custom identifier for rate limiting (e.g., IP address instead of email)
const result = await emailService.sendEmail(
    {
        templateParams: {
            user_name: 'John Doe',
            user_email: 'john@example.com',
            message: 'Hello, this is a test message.'
        }
    },
    {
        identifier: userIpAddress // Rate limit by IP instead of email
    }
);
```

### Skip Rate Limiting (Admin Only)

```typescript
import emailService from '@/services/email';

// Skip rate limit check for administrative operations (use with caution)
const result = await emailService.sendEmail(
    {
        templateParams: {
            user_name: 'Admin',
            user_email: 'admin@example.com',
            message: 'Admin notification'
        }
    },
    {
        skipRateLimit: true // Bypass rate limiting
    }
);
```

## Resilience Patterns

### 0. Rate Limiting

Email sending is protected by rate limiting to prevent abuse:

- **Default Limiter**: 5 attempts per minute, 5 minute cooldown
- **Identifier**: User email address (customizable via `identifier` option)
- **Behavior**:
  - First 5 attempts: Allowed
  - Exceeding limit: Blocked with cooldown message
  - Cooldown: 5 minutes before reset
- **Skip Option**: Use `skipRateLimit: true` for admin operations (use with caution)

**Error Response**:
```json
{
    "success": false,
    "error": "Too many attempts. Please try again in X seconds.",
    "errorCode": "RATE_LIMIT_EXCEEDED",
    "metadata": {
        "rateLimited": true
    }
}
```

### 1. Timeout Protection

All EmailJS requests are wrapped in a 10-second timeout to prevent indefinite hangs:

- **Timeout Duration**: 10,000ms (10 seconds)
- **Error Message**: "EmailJS request timed out"
- **Purpose**: Prevents UI freezing from slow or unresponsive EmailJS API

### 2. Retry Mechanism

Transient failures are automatically retried with exponential backoff:

- **Max Attempts**: 3 (1 initial + 2 retries)
- **Base Delay**: 1,000ms (1 second)
- **Max Delay**: 10,000ms (10 seconds)
- **Backoff Multiplier**: 2x (1s → 2s → 4s)
- **Retryable Error Patterns**:
  - `/network/i` - Network-related errors
  - `/timeout/i` - Timeout errors
  - `/ECONN/i` - Connection errors

**Retry Schedule**:
```
Attempt 1: Immediate
Attempt 2: Wait 1s (base delay)
Attempt 3: Wait 2s (base × 2)
Max wait: 4s (if base were 4s, would cap at 10s)
```

### 3. Circuit Breaker

Prevents cascading failures when EmailJS API is experiencing issues:

- **Failure Threshold**: 5 consecutive failures
- **Reset Timeout**: 60,000ms (60 seconds)
- **Monitoring Period**: 60,000ms (60 seconds)
- **States**:
  - **Closed** (Normal): Requests flow through, failures counted
  - **Open** (Failed): Requests rejected immediately, no retries
  - **Half-Open** (Recovering): Test request allowed, state transitions based on result

**State Transitions**:
```
Closed → Open: After 5 consecutive failures
Open → Half-Open: After 60 seconds
Half-Open → Open: On failure (reset timer)
Half-Open → Closed: On success (reset failure count)
```

### 4. Circuit Breaker Monitoring

Monitor circuit breaker state:

```typescript
import emailService from '@/services/email';

const state = emailService.getCircuitBreakerState();
console.log('Circuit breaker state:', state);

// Output:
// {
//   state: 'closed' | 'open' | 'half-open',
//   failureCount: number,
//   lastFailureTime: Date | null,
//   nextAttemptTime: Date | null
// }
```

### 5. Manual Circuit Breaker Reset

Reset circuit breaker manually (use with caution):

```typescript
import emailService from '@/services/email';

emailService.resetCircuitBreaker();
```

## Error Handling

### Error Scenarios

1. **Rate Limited**
    - **Response**: `{ success: false, error: 'Too many attempts...', errorCode: 'RATE_LIMIT_EXCEEDED', metadata: { rateLimited: true } }`
    - **Action**: Wait for cooldown period (5 minutes) or use different identifier

2. **Missing Credentials**
    - **Response**: `{ success: false, error: 'EmailJS credentials not configured', errorCode: 'CREDENTIALS_MISSING' }`
    - **Action**: Check environment variables

3. **Timeout**
    - **Response**: `{ success: false, error: 'EmailJS request timed out', errorCode: 'TIMEOUT' }`
    - **Action**: Retried automatically (up to 3 attempts)

4. **Network Error**
    - **Response**: `{ success: false, error: 'Network error occurred', errorCode: 'NETWORK_ERROR' }`
    - **Action**: Retried automatically if matches retryable patterns

5. **Circuit Breaker Open**
    - **Response**: `{ success: false, error: 'Circuit breaker is open', errorCode: 'CIRCUIT_BREAKER_OPEN' }`
    - **Action**: Wait 60 seconds or manually reset (not recommended)

6. **EmailJS Service Error**
    - **Response**: `{ success: false, error: 'Service error', errorCode: 'UNKNOWN_ERROR' }`
    - **Action**: Check EmailJS status, configuration

### Error Recovery

The service automatically handles:
- Rate limiting (prevents abuse, provides clear countdown messages)
- Transient network failures (retries with backoff)
- Temporary EmailJS outages (circuit breaker prevents cascade)
- Timeout scenarios (bounded wait, no indefinite hang)

## Best Practices

### 1. Error Handling in Components

```typescript
const handleSubmit = async (data: FormData) => {
    setIsLoading(true);

    const result = await emailService.sendEmail({
        templateParams: {
            user_name: data.get('name') as string,
            user_email: data.get('email') as string,
            message: data.get('message') as string
        }
    });

    setIsLoading(false);

    if (result.success) {
        toast.success('Email sent successfully!');
    } else if (result.metadata?.rateLimited) {
        toast.error(result.error || 'Too many attempts. Please try again later.');
    } else {
        toast.error('Failed to send email. Please try again.');
    }
};
```

### 2. Circuit Breaker Monitoring (Optional)

```typescript
const checkEmailServiceHealth = () => {
    const state = emailService.getCircuitBreakerState();
    
    if (state.state === 'open') {
        // Show warning to users
        toast.warning('Email service temporarily unavailable. Please try again later.');
    }
};
```

### 3. Input Validation

Always validate user input before calling the service:

```typescript
const validateEmailInput = (params: EmailSendParams): boolean => {
    const { user_name, user_email, message } = params.templateParams;
    
    if (!user_name || user_name.trim().length === 0) return false;
    if (!user_email || !isValidEmail(user_email)) return false;
    if (!message || message.trim().length === 0) return false;
    
    return true;
};
```

## Performance Considerations

### Request Flow

```
User Action
    ↓
Component sends request
    ↓
EmailService.sendEmail()
    ↓
Rate Limit Check (rejects if exceeded)
    ↓
Circuit Breaker Check (rejects if open)
    ↓
withRetry() (up to 3 attempts)
    ↓
withTimeout() (10s max per attempt)
    ↓
EmailJS API Call
    ↓
Response (success or error)
```

### Timeouts

- **Rate Limit Check**: Instant (< 1ms)
- **Circuit Breaker Check**: Instant (< 1ms)
- **Single Request Max**: 10 seconds
- **Max Total Wait**: 10s (attempt 1) + 1s (delay) + 10s (attempt 2) + 2s (delay) + 10s (attempt 3) = ~33 seconds

### Rate Limiting Impact

- **Within Limits**: Normal operation, requests proceed
- **Exceeded Limit**: Requests rejected immediately (0ms wait)
- **Cooldown**: 5 minutes before automatic reset

### Circuit Breaker Impact

- **Circuit Closed**: Normal operation, requests proceed
- **Circuit Open**: Requests rejected immediately (0ms wait)
- **Half-Open**: Test request allowed, state updates based on result

## Testing

### Unit Tests

See `src/services/email/__tests__/EmailService.test.ts` for comprehensive test coverage:

- 6 tests covering happy path and error scenarios
- Mocked EmailJS integration
- Circuit breaker state transitions tested
- Timeout and retry behavior verified

### Resilience Pattern Tests

See `src/utils/resilience/__tests__/` for pattern-specific tests:

- **timeout.test.ts**: 6 tests for timeout wrapper
- **retry.test.ts**: 9 tests for retry with backoff
- **circuitBreaker.test.ts**: 19 tests for circuit breaker logic

## Security Considerations

1. **Credentials**: All EmailJS credentials are loaded from environment variables
2. **No Secrets**: No API keys or secrets are committed to code
3. **Input Validation**: Validate user input before calling service
4. **Error Messages**: Generic error messages prevent information leakage
5. **CORS**: EmailJS handles CORS, no additional configuration needed

## Troubleshooting

### Common Issues

1. **"Too many attempts. Please try again in X seconds."**
    - Rate limit exceeded for this email address
    - Wait 5 minutes for automatic cooldown reset
    - Or use a different email address

2. **"EmailJS credentials not configured"**
    - Check `.env` file has required variables
    - Verify environment variables are set in deployment

3. **"Circuit breaker is open"**
    - EmailJS API may be experiencing issues
    - Wait 60 seconds for automatic reset
    - Check EmailJS status page

4. **"EmailJS request timed out"**
    - Network connectivity issue
    - EmailJS API slow or unresponsive
    - Retried automatically (up to 3 times)

5. **Repeated failures**
    - Check EmailJS service status
    - Verify template ID and service ID are correct
    - Check CSP headers allow EmailJS domain

## Monitoring & Observability

### Logs

The service logs:
- Configuration warnings (missing credentials)
- Send failures (error messages only, no sensitive data)
- Circuit breaker state changes (if added in future)

### Metrics (Future Enhancement)

Consider adding:
- Email send success rate
- Email send failure rate
- Circuit breaker state duration
- Retry attempt distribution
- Timeout frequency

## Related Documentation

- [EmailJS Documentation](https://www.emailjs.com/docs/)
- [Resilience Patterns - src/utils/resilience/](../utils/resilience/)
- [Integration Architecture - blueprint.md](../blueprint.md)
- [Service Health Monitoring - docs/service-health-monitoring.md](./service-health-monitoring.md)
- [OpenAPI Specification - docs/openapi-spec.yaml](../openapi-spec.yaml)
- [Postman Collection - docs/postman-collection.json](../postman-collection.json)

## Integration Best Practices

### 1. Error Handling in Components

Always check `result.success` before proceeding:

```typescript
const result = await emailService.sendEmail({
    templateParams: { user_name, user_email, message }
});

if (result.success) {
    toast.success('Email sent successfully!');
} else if (result.metadata?.rateLimited) {
    toast.error(result.error || 'Too many attempts');
} else {
    toast.error('Failed to send email');
}
```

### 2. Resilience Pattern Awareness

Understand the resilience layers:
1. Rate Limiting: Per-email (5 per 60s)
2. Timeout Protection: 10s max per request
3. Retry with Backoff: 3 attempts (1s → 2s → 4s)
4. Circuit Breaker: Opens after 5 failures, resets after 60s

### 3. Service Health Monitoring

Monitor EmailService health using metrics:

```typescript
const metrics = emailService.getMetrics();

if (metrics.successRate < 0.8) {
    console.warn(`EmailService degraded: ${metrics.successRate * 100}% success rate`);
}
```

See [Service Health Monitoring](../service-health-monitoring.md) for comprehensive monitoring strategies.

### 4. Circuit Breaker State Checks

Check circuit breaker before critical operations:

```typescript
const state = emailService.getCircuitBreakerState();

if (state.isOpen) {
    toast.warning('Email service temporarily unavailable. Please try again later.');
    return;
}
```

### 5. Metrics Export

Export metrics for external monitoring systems:

```typescript
import metricsCollector from '@/utils/metrics';

const metricsData = metricsCollector.exportMetrics();

// Send to Prometheus, Datadog, CloudWatch, etc.
```

See [Service Health Monitoring](../service-health-monitoring.md) for external monitoring integration.
