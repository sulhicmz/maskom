# API Documentation

## Overview

This document provides comprehensive documentation for all API routes in the application, including standardized error codes and response formats.

## Base URL

```
http://localhost:3000/api
```

## Standard Response Format

All API responses follow this structure:

### Success Response

```typescript
{
  success: true,
  message: string,
  data?: T
}
```

### Error Response

```typescript
{
  success: false,
  error: string,
  errorCode: string,
  message: string,
  metadata?: Record<string, unknown>,
  retryAfter?: number
}
```

## Standard Error Codes

| Error Code | Message | HTTP Status | Retryable | Description |
|------------|----------|--------------|------------|-------------|
| `VALIDATION_ERROR` | Validation failed | 400 | No | Request validation failed |
| `AUTHENTICATION_ERROR` | Authentication failed | 401 | No | Authentication required or failed |
| `AUTHORIZATION_ERROR` | Authorization failed | 403 | No | User lacks required permissions |
| `RESOURCE_NOT_FOUND` | Resource not found | 404 | No | Requested resource does not exist |
| `RESOURCE_CONFLICT` | Resource conflict | 409 | No | Resource already exists or conflicts with existing state |
| `MISSING_REQUIRED_FIELDS` | Missing required fields | 400 | No | Required fields are missing in request |
| `INVALID_REQUEST_DATA` | Invalid request data | 400 | No | Request data is invalid |
| `INVALID_QUERY_PARAMETERS` | Invalid query parameters | 400 | No | Query parameters are invalid |
| `INVALID_CREDENTIALS` | Invalid credentials | 401 | No | Credentials are incorrect |
| `SESSION_NOT_FOUND` | Session not found | 404 | No | Collaboration session not found |
| `USER_NOT_FOUND_IN_SESSION` | User not found in session | 404 | No | User not found in collaboration session |
| `TEMPLATE_NOT_FOUND` | Template not found | 404 | No | Template not found |
| `CREDENTIALS_MISSING` | Credentials missing | 401 | No | Required credentials not provided |
| `RATE_LIMIT_EXCEEDED` | Rate limit exceeded | 429 | Yes | Rate limit exceeded |
| `REQUEST_TIMEOUT` | Request timed out | 504 | Yes | Request timed out |
| `CIRCUIT_BREAKER_OPEN` | Circuit breaker is open | 503 | Yes | Service is temporarily unavailable |
| `NETWORK_ERROR` | Network error occurred | 503 | Yes | Network error occurred |
| `UNKNOWN_ERROR` | Unknown error | 500 | No | Unknown error occurred |

## Rate Limiting

All API endpoints are subject to rate limiting. When rate limit is exceeded, the response includes:

```typescript
{
  success: false,
  error: "Rate limit exceeded",
  errorCode: "RATE_LIMIT_EXCEEDED",
  message: "Rate limit exceeded",
  retryAfter: number // seconds to wait before retry
}
```

### Rate Limit Headers

| Header | Description |
|---------|-------------|
| `Retry-After` | Number of seconds to wait before retrying |
| `X-RateLimit-Limit` | Maximum number of requests per window |
| `X-RateLimit-Remaining` | Number of requests remaining in current window |
| `X-RateLimit-Reset` | Timestamp when rate limit window resets |

---

## API Endpoints

### 1. Health Check

#### GET `/api/health`

Check the health status of all services.

**Query Parameters:**
- `threshold` (optional, default: 0.9) - Minimum success rate threshold (0.0 - 1.0)

**Response (200):**

```typescript
{
  success: true,
  message: "All services healthy",
  data: {
    status: "healthy" | "degraded",
    timestamp: string, // ISO 8601
    services: Array<{
      serviceName: string,
      healthy: boolean,
      successRate: number,
      lastFailureTime: string | null,
      lastSuccessTime: string | null
    }>,
    summary: {
      totalServices: number,
      healthyServices: number,
      unhealthyServices: number,
      successRateThreshold: number
    }
  }
}
```

**Response (503):**
```typescript
{
  success: false,
  error: "One or more services degraded",
  errorCode: "CIRCUIT_BREAKER_OPEN",
  message: "Circuit breaker is open",
  retryAfter: 60
}
```

---

### 2. Metrics

#### GET `/api/metrics`

Retrieve performance metrics for all services.

**Response (200):**

```typescript
{
  success: true,
  message: "Metrics retrieved successfully",
  data: {
    timestamp: string, // ISO 8601
    summary: {
      totalServices: number,
      totalCalls: number,
      totalSuccesses: number,
      totalFailures: number,
      totalTimeouts: number,
      totalRateLimits: number
    },
    services: Array<{
      serviceName: string,
      totalCalls: number,
      successCalls: number,
      failureCalls: number,
      timeoutCalls: number,
      rateLimitCalls: number,
      successRate: number,
      health: "healthy" | "degraded" | "unhealthy"
    }>
  }
}
```

---

### 3. Collaboration API

#### GET `/api/collaborate`

Poll for collaborative events.

**Query Parameters:**
- `sessionId` (required) - Collaboration session ID
- `userId` (required) - User ID
- `username` (required) - Username
- `lastEventId` (optional) - Last received event ID

**Response (200):**

```typescript
{
  success: true,
  message: "Success",
  data: {
    events: Array<{
      type: "user_joined" | "user_left" | "cursor_moved" | "edit_applied" | "comment_added",
      sessionId: string,
      postId: number,
      userId: number,
      timestamp: number,
      data: unknown
    }>,
    sessionActive: boolean
  }
}
```

**Error Responses:**

- **400** - Invalid query parameters
  ```typescript
  {
    success: false,
    error: "Invalid query parameters",
    errorCode: "INVALID_QUERY_PARAMETERS",
    message: "Invalid query parameters",
    metadata: { details: [...] }
  }
  ```

- **404** - Session not found
  ```typescript
  {
    success: false,
    error: "Session not found",
    errorCode: "SESSION_NOT_FOUND",
    message: "Session not found"
  }
  ```

- **429** - Rate limit exceeded
  ```typescript
  {
    success: false,
    error: "Rate limit exceeded",
    errorCode: "RATE_LIMIT_EXCEEDED",
    message: "Rate limit exceeded",
    retryAfter: number
  }
  ```

#### POST `/api/collaborate`

Perform collaboration actions (join, leave, cursor update, edit, comment).

**Request Body:**

```typescript
{
  action: "join" | "leave" | "cursor_update" | "edit" | "comment",
  postId?: number, // Required for join
  sessionId?: string, // Required for leave, cursor_update, edit, comment
  userId: number, // Required for all actions
  username?: string, // Required for join, comment
  cursorPosition?: { line: number, column: number }, // Required for cursor_update
  selection?: { start: { line: number, column: number }, end: { line: number, column: number } }, // Optional for cursor_update
  editOperation?: { // Required for edit
    type: "insert" | "delete" | "replace",
    position: { line: number, column: number },
    content?: string,
    length?: number,
    version: number
  },
  comment?: { // Required for comment
    content: string,
    position: { line: number, column: number }
  }
}
```

**Response (200):** Returns action-specific data

**Error Responses:**

- **400** - Invalid request data or missing required fields
  ```typescript
  {
    success: false,
    error: "Invalid request data" | "Missing required fields",
    errorCode: "INVALID_REQUEST_DATA" | "MISSING_REQUIRED_FIELDS",
    message: "Invalid request data" | "Missing required fields"
  }
  ```

- **404** - Session not found or user not found in session
  ```typescript
  {
    success: false,
    error: "Session not found" | "User not found in session",
    errorCode: "SESSION_NOT_FOUND" | "USER_NOT_FOUND_IN_SESSION",
    message: "Session not found" | "User not found in session"
  }
  ```

- **429** - Rate limit exceeded
  ```typescript
  {
    success: false,
    error: "Rate limit exceeded",
    errorCode: "RATE_LIMIT_EXCEEDED",
    message: "Rate limit exceeded",
    retryAfter: number
  }
  ```

---

### 4. Email Queue

#### GET `/api/email-queue`

Get email queue status.

**Response (200):**

```typescript
{
  success: true,
  message: "Email queue status retrieved successfully",
  data: {
    timestamp: string,
    queue: {
      size: number,
      expired: number,
      status: "empty" | "has_pending_emails"
    },
    circuitBreaker: {
      isOpen: boolean,
      failureCount: number,
      lastFailureTime: string | null,
      lastSuccessTime: string | null,
      status: "open" | "closed"
    },
    metrics: {
      totalSent: number,
      totalFailed: number,
      totalRetries: number,
      successRate: number | null
    } | null
  }
}
```

#### POST `/api/email-queue`

Process email queue.

**Response (200):**

```typescript
{
  success: true,
  message: "Email queue processed",
  data: {
    processed: number,
    failed: number,
    success: boolean
  }
}
```

**Error Responses:**

- **503** - Failed to process email queue
  ```typescript
  {
    success: false,
    error: "Failed to process email queue",
    errorCode: "NETWORK_ERROR",
    message: "Network error occurred",
    retryAfter: 10,
    data: {
      processed: number,
      failed: number
    }
  }
  ```

---

### 5. Services Status

#### GET `/api/services/status`

Get status of all services (email, auth).

**Response (200):**

```typescript
{
  success: true,
  message: "Service status retrieved successfully",
  data: {
    timestamp: string,
    email: {
      metrics: {
        totalSent: number,
        totalFailed: number,
        totalRetries: number,
        successRate: number | null
      } | null,
      circuitBreaker: {
        isOpen: boolean,
        failureCount: number,
        lastFailureTime: string | null,
        lastSuccessTime: string | null
      }
    },
    auth: {
      metrics: {
        totalCalls: number,
        successCalls: number,
        failureCalls: number,
        timeoutCalls: number,
        rateLimitCalls: number,
        successRate: number
      },
      circuitBreaker: {
        isOpen: boolean,
        failureCount: number,
        lastFailureTime: string | null,
        lastSuccessTime: string | null
      }
    }
  }
}
```

---

## Resilience Features

### Circuit Breaker

All API routes are protected by circuit breakers to prevent cascading failures.

**States:**
- **Closed**: Requests flow normally
- **Open**: Requests fail fast (circuit breaker active)
- **Half-Open**: Testing if service has recovered

**Configuration:**
- `failureThreshold`: Number of failures before opening
- `resetTimeoutMs`: Time before attempting recovery
- `monitoringPeriodMs`: Time window for monitoring

### Timeout

All requests have configurable timeouts to prevent hanging.

**Default Timeouts:**
- Health Check: 5 seconds
- Metrics: 5 seconds
- Collaboration API: 30 seconds
- Email Queue: 10 seconds
- Services Status: 5 seconds

### Retry

Failed requests are automatically retried with exponential backoff.

**Retry Configuration:**
- `maxAttempts`: Maximum retry attempts (default: 3)
- `baseDelayMs`: Initial delay before retry (default: 1000ms)
- `maxDelayMs`: Maximum delay between retries (default: 10000ms)
- `backoffMultiplier`: Multiplier for delay increase (default: 2)
- `retryableErrors`: Patterns for retryable errors (network, timeout, ECONN, 503)

---

## Integration Guidelines

### Error Handling

Always check `success` field in responses:

```typescript
const response = await fetch('/api/endpoint');
const data = await response.json();

if (data.success) {
  // Handle success
  console.log(data.data);
} else {
  // Handle error
  console.error(data.error, data.errorCode);
  if (data.retryAfter) {
    // Retry after specified time
    setTimeout(() => retry(), data.retryAfter * 1000);
  }
}
```

### Idempotency

Certain operations are idempotent and can be safely retried:

- **Idempotent**: GET requests, retry after `retryAfter`
- **Not Idempotent**: POST requests without idempotency keys

### Rate Limiting

Implement exponential backoff when receiving rate limit errors:

```typescript
async function fetchWithBackoff(url: string, retries = 3) {
  try {
    const response = await fetch(url);
    if (response.status === 429) {
      const retryAfter = response.headers.get('Retry-After');
      await new Promise(resolve => setTimeout(resolve, (parseInt(retryAfter) || 60) * 1000));
      return fetchWithBackoff(url, retries - 1);
    }
    return response;
  } catch (error) {
    if (retries > 0) {
      await new Promise(resolve => setTimeout(resolve, 1000 * Math.pow(2, 3 - retries)));
      return fetchWithBackoff(url, retries - 1);
    }
    throw error;
  }
}
```

### Request Validation

Always validate request data before sending:

```typescript
function validateRequest(data: unknown): data is YourSchema {
  // Validate against schema
  // Throw if invalid
  return true;
}
```

---

## Changelog

### v1.0.0 (January 30, 2026)
- Standardized error codes across all API routes
- Added comprehensive error code mapping
- Unified response format for success and error cases
- Added default HTTP status codes and retry times for each error type
- Created API documentation with all endpoints and error codes

---

## Support

For issues or questions about the API:
1. Check this documentation first
2. Review error codes and messages
3. Check `/api/health` for service status
4. Contact development team with error details (errorCode, error message, requestId if available)
