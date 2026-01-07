# Email Service API Documentation

## Overview

The EmailService provides a resilient, production-ready abstraction for sending emails via EmailJS. It implements circuit breaker, retry, and timeout patterns to ensure reliable email delivery.

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
    sendEmail(params: EmailSendParams): Promise<EmailSendResult>;
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

### Response: `EmailSendResult`

```typescript
interface EmailSendResult {
    success: boolean;        // True if email sent successfully
    text?: string;          // Success message from EmailJS
    error?: string;         // Error message if failed
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
    console.log('Email sent successfully:', result.text);
} else {
    console.error('Failed to send email:', result.error);
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

    return result;
};
```

## Resilience Patterns

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

1. **Missing Credentials**
   - **Response**: `{ success: false, error: 'EmailJS credentials not configured' }`
   - **Action**: Check environment variables

2. **Timeout**
   - **Response**: `{ success: false, error: 'EmailJS request timed out' }`
   - **Action**: Retried automatically (up to 3 attempts)

3. **Network Error**
   - **Response**: `{ success: false, error: 'Network error occurred' }`
   - **Action**: Retried automatically if matches retryable patterns

4. **Circuit Breaker Open**
   - **Response**: `{ success: false, error: 'Circuit breaker is open' }`
   - **Action**: Wait 60 seconds or manually reset (not recommended)

5. **EmailJS Service Error**
   - **Response**: `{ success: false, error: 'Service error' }`
   - **Action**: Check EmailJS status, configuration

### Error Recovery

The service automatically handles:
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

- **Single Request Max**: 10 seconds
- **Max Total Wait**: 10s (attempt 1) + 1s (delay) + 10s (attempt 2) + 2s (delay) + 10s (attempt 3) = ~33 seconds

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

1. **"EmailJS credentials not configured"**
   - Check `.env` file has required variables
   - Verify environment variables are set in deployment

2. **"Circuit breaker is open"**
   - EmailJS API may be experiencing issues
   - Wait 60 seconds for automatic reset
   - Check EmailJS status page

3. **"EmailJS request timed out"**
   - Network connectivity issue
   - EmailJS API slow or unresponsive
   - Retried automatically (up to 3 times)

4. **Repeated failures**
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
- [Integration Architecture - docs/blueprint.md](../../docs/blueprint.md)
