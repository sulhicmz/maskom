# Auth Service API Documentation

## Overview

The AuthService provides a resilient, production-ready abstraction for user authentication and registration. It implements circuit breaker, retry, timeout, and rate limiting patterns to ensure secure and reliable authentication operations.

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

### Domain-Specific Result Types

Some services use domain-specific result types that extend or follow the same structure as `ServiceResult<T>`:

**AuthResult** (AuthService):
- Domain-specific for authentication operations
- Contains `user` and `token` fields directly (not in `data`)
- Same structure as `ServiceResult<T>` but tailored for auth needs
- Follows same error handling and metadata patterns

This approach allows type safety while maintaining consistency across all services. All services use the same error codes, error handling patterns, and metadata structure.

## API Contract

### `IAuthService` Interface

```typescript
interface IAuthService {
    login(credentials: LoginCredentials): Promise<AuthResult>;
    register(userData: RegisterData): Promise<AuthResult>;
    logout(): Promise<AuthResult>;
    getCurrentUser(): Promise<User | null>;
    getLoginRateLimitStatus(email: string): RateLimitStatus;
    getRegisterRateLimitStatus(email: string): RateLimitStatus;
    resetLoginRateLimit(email: string): void;
    resetRegisterRateLimit(email: string): void;
    resetAllRateLimits(): void;
    getMetrics(): ServiceMetrics;
    getCircuitBreakerState(): CircuitBreakerState;
    resetCircuitBreaker(): void;
}
```

## Authentication Operations

### Login

Authenticates a user with email and password.

#### Request: `LoginCredentials`

```typescript
interface LoginCredentials {
    email: string;     // User email address
    password: string;  // User password (min 8 characters)
}
```

#### Response: `AuthResult`

```typescript
interface AuthResult {
    success: boolean;           // True if operation succeeded
    message?: string;          // Success message
    user?: User;              // Authenticated user object (on success)
    token?: string;           // JWT token (on success)
    error?: string;           // Error message (on failure)
    errorCode?: ServiceErrorCode;  // Error code (on failure)
    metadata?: Record<string, unknown>;  // Additional metadata (e.g., rateLimited)
}
```

**Note**: `AuthResult` is domain-specific for authentication operations. It follows the same structure as `ServiceResult<T>` but includes both `user` and `token` fields directly (instead of a single `data` field) because authentication operations need to return both user information and authentication token simultaneously.

#### User Object

```typescript
interface User {
    id: string;       // Unique user ID (generated from email)
    name: string;     // User display name
    email: string;    // User email address
}
```

#### Rate Limiting

- **Login Limit**: 5 attempts per 15 minutes
- **Cooldown**: 30 minutes after limit exceeded
- **Identifier**: User email address
- **Behavior**:
  - First 5 attempts: Allowed
  - Exceeding limit: Blocked with countdown message
  - Cooldown: 30 minutes before automatic reset

#### Usage Example

```typescript
import authService from '@/services/auth';

const handleLogin = async (email: string, password: string) => {
    const result = await authService.login({ email, password });

    if (result.success) {
        console.log('Login successful:', result.user);
        console.log('Token:', result.token);
    } else if (result.metadata?.rateLimited) {
        console.warn('Rate limited:', result.error);
    } else {
        console.error('Login failed:', result.error);
    }

    return result;
};
```

#### React Component Integration

```typescript
import authService from '@/services/auth';

const LoginForm = () => {
    const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        const formData = new FormData(e.currentTarget);
        
        const result = await authService.login({
            email: formData.get('email') as string,
            password: formData.get('password') as string
        });

        if (result.success) {
            toast.success('Berhasil masuk ke portal');
            // Redirect to dashboard
        } else if (result.metadata?.rateLimited) {
            toast.error(result.error || 'Terlalu banyak percobaan');
        } else {
            toast.error(result.error || 'Gagal masuk');
        }
    };

    return (
        <form onSubmit={handleSubmit}>
            {/* Form fields */}
        </form>
    );
};
```

### Register

Registers a new user account.

#### Request: `RegisterData`

```typescript
interface RegisterData {
    name: string;     // User full name
    email: string;    // User email address
    password: string; // User password (min 8 characters)
}
```

#### Response: `AuthResult`

Same as login response format.

#### Rate Limiting

- **Register Limit**: 5 attempts per 1 hour
- **Cooldown**: 2 hours after limit exceeded
- **Identifier**: User email address
- **Behavior**:
  - First 5 attempts: Allowed
  - Exceeding limit: Blocked with countdown message
  - Cooldown: 2 hours before automatic reset

#### Usage Example

```typescript
import authService from '@/services/auth';

const handleRegister = async (name: string, email: string, password: string) => {
    const result = await authService.register({ name, email, password });

    if (result.success) {
        console.log('Registration successful:', result.user);
        console.log('Token:', result.token);
    } else if (result.rateLimited) {
        console.warn('Rate limited:', result.error);
    } else {
        console.error('Registration failed:', result.error);
    }

    return result;
};
```

#### React Component Integration

```typescript
import authService from '@/services/auth';

const SignUpForm = () => {
    const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        const formData = new FormData(e.currentTarget);
        
        const result = await authService.register({
            name: formData.get('name') as string,
            email: formData.get('email') as string,
            password: formData.get('password') as string
        });

        if (result.success) {
            toast.success('Registrasi berhasil dikirim');
            // Redirect to dashboard
        } else if (result.metadata?.rateLimited) {
            toast.error(result.error || 'Terlalu banyak percobaan');
        } else {
            toast.error(result.error || 'Gagal registrasi');
        }
    };

    return (
        <form onSubmit={handleSubmit}>
            {/* Form fields */}
        </form>
    );
};
```

### Logout

Logs out the current user and clears session data.

#### Response: `AuthResult`

```typescript
interface AuthResult {
    success: boolean;
    message?: string;
    error?: string;
    errorCode?: ServiceErrorCode;
}
```

#### Usage Example

```typescript
import authService from '@/services/auth';

const handleLogout = async () => {
    const result = await authService.logout();

    if (result.success) {
        console.log('Logout successful:', result.message);
        // Redirect to login page
    } else {
        console.error('Logout failed:', result.error);
    }

    return result;
};
```

#### React Component Integration

```typescript
import authService from '@/services/auth';

const LogoutButton = () => {
    const handleLogout = async () => {
        const result = await authService.logout();

        if (result.success) {
            toast.success('Berhasil keluar');
            router.push('/login');
        } else {
            toast.error('Terjadi kesalahan saat logout');
        }
    };

    return <button onClick={handleLogout}>Keluar</button>;
};
```

### Get Current User

Retrieves the currently authenticated user.

#### Response: `User | null`

Returns the current user object if authenticated, otherwise null.

#### Usage Example

```typescript
import authService from '@/services/auth';

const getCurrentUser = async () => {
    const user = await authService.getCurrentUser();

    if (user) {
        console.log('Authenticated user:', user);
        return user;
    } else {
        console.log('No user authenticated');
        return null;
    }
};
```

#### React Component Integration

```typescript
import authService from '@/services/auth';
import { useEffect, useState } from 'react';

const Dashboard = () => {
    const [user, setUser] = useState<User | null>(null);

    useEffect(() => {
        authService.getCurrentUser().then(setUser);
    }, []);

    if (!user) {
        return <div>Loading...</div>;
    }

    return <div>Welcome, {user.name}!</div>;
};
```

## Rate Limiting Management

### Get Login Rate Limit Status

Retrieves rate limit status for login attempts.

#### Request Parameter

```typescript
email: string  // User email address
```

#### Response: `RateLimitStatus`

```typescript
interface RateLimitStatus {
    count: number;                    // Current attempt count
    firstAttempt: number;             // Timestamp of first attempt
    lockedUntil?: number | null;      // Timestamp when cooldown expires
    attemptsRemaining: number;        // Remaining attempts
}
```

#### Usage Example

```typescript
import authService from '@/services/auth';

const checkLoginLimit = (email: string) => {
    const status = authService.getLoginRateLimitStatus(email);

    if (status.lockedUntil) {
        const cooldownEnds = new Date(status.lockedUntil);
        console.log(`Cooldown ends at: ${cooldownEnds.toLocaleString()}`);
    }

    console.log(`Attempts remaining: ${status.attemptsRemaining}`);

    return status;
};
```

### Get Register Rate Limit Status

Retrieves rate limit status for registration attempts.

#### Request Parameter

```typescript
email: string  // User email address
```

#### Response: `RateLimitStatus`

Same as login rate limit status.

#### Usage Example

```typescript
import authService from '@/services/auth';

const checkRegisterLimit = (email: string) => {
    const status = authService.getRegisterRateLimitStatus(email);

    if (status.lockedUntil) {
        const cooldownEnds = new Date(status.lockedUntil);
        console.log(`Cooldown ends at: ${cooldownEnds.toLocaleString()}`);
    }

    console.log(`Attempts remaining: ${status.attemptsRemaining}`);

    return status;
};
```

### Reset Login Rate Limit

Resets rate limit for a specific email address (admin operation).

#### Request Parameter

```typescript
email: string  // User email address
```

#### Usage Example

```typescript
import authService from '@/services/auth';

const resetUserLoginLimit = (email: string) => {
    authService.resetLoginRateLimit(email);
    console.log(`Login rate limit reset for: ${email}`);
};
```

### Reset Register Rate Limit

Resets rate limit for a specific email address (admin operation).

#### Request Parameter

```typescript
email: string  // User email address
```

#### Usage Example

```typescript
import authService from '@/services/auth';

const resetUserRegisterLimit = (email: string) => {
    authService.resetRegisterRateLimit(email);
    console.log(`Register rate limit reset for: ${email}`);
};
```

### Reset All Rate Limits

Resets all rate limits (admin operation).

#### Usage Example

```typescript
import authService from '@/services/auth';

const resetAllLimits = () => {
    authService.resetAllRateLimits();
    console.log('All rate limits reset');
};
```

## Monitoring & Observability

### Get Metrics

Retrieves service metrics for monitoring.

#### Response: `ServiceMetrics`

```typescript
interface ServiceMetrics {
    login?: ServiceMetrics | undefined;
    register?: ServiceMetrics | undefined;
}

interface ServiceMetrics {
    totalCalls: number;         // Total calls made
    successCalls: number;       // Successful calls
    failureCalls: number;       // Failed calls
    successRate: number;        // Success rate (0-1)
    averageResponseTime: number; // Average response time (ms)
}
```

#### Usage Example

```typescript
import authService from '@/services/auth';

const getAuthMetrics = () => {
    const metrics = authService.getMetrics();

    console.log('Login metrics:', metrics.login);
    console.log('Register metrics:', metrics.register);

    return metrics;
};
```

### Get Circuit Breaker State

Retrieves circuit breaker state for monitoring.

#### Response: `CircuitBreakerState`

```typescript
interface CircuitBreakerState {
    state: 'closed' | 'open' | 'half-open';  // Current state
    failureCount: number;                    // Consecutive failures
    lastFailureTime: Date | null;            // Last failure timestamp
    nextAttemptTime: Date | null;            // Next attempt allowed (when open)
}
```

#### Usage Example

```typescript
import authService from '@/services/auth';

const checkCircuitBreaker = () => {
    const state = authService.getCircuitBreakerState();

    console.log('Circuit breaker state:', state.state);
    console.log('Failure count:', state.failureCount);

    if (state.state === 'open') {
        console.log('Circuit breaker open until:', state.nextAttemptTime);
    }

    return state;
};
```

### Reset Circuit Breaker

Resets circuit breaker state (admin operation, use with caution).

#### Usage Example

```typescript
import authService from '@/services/auth';

const resetCircuitBreaker = () => {
    authService.resetCircuitBreaker();
    console.log('Circuit breaker reset');
};
```

## Resilience Patterns

### 1. Timeout Protection

All authentication operations are wrapped in a 5-second timeout to prevent indefinite hangs:

- **Timeout Duration**: 5,000ms (5 seconds)
- **Error Message**: "Login request timed out" / "Registration request timed out"
- **Purpose**: Prevents UI freezing from slow authentication operations

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

Prevents cascading failures when authentication backend is experiencing issues:

- **Failure Threshold**: 50 consecutive failures
- **Reset Timeout**: 60,000ms (60 seconds)
- **Monitoring Period**: 60,000ms (60 seconds)
- **States**:
  - **Closed** (Normal): Requests flow through, failures counted
  - **Open** (Failed): Requests rejected immediately, no retries
  - **Half-Open** (Recovering): Test request allowed, state transitions based on result

**State Transitions**:
```
Closed → Open: After 50 consecutive failures
Open → Half-Open: After 60 seconds
Half-Open → Open: On failure (reset timer)
Half-Open → Closed: On success (reset failure count)
```

**Note**: High threshold (50 failures) prevents circuit breaker from interfering with per-user rate limiting.

### 4. Rate Limiting

Authentication operations are protected by rate limiting to prevent brute force attacks:

#### Login Rate Limiting

- **Max Attempts**: 5
- **Window**: 15 minutes (900,000ms)
- **Cooldown**: 30 minutes (1,800,000ms)
- **Identifier**: User email address

#### Register Rate Limiting

- **Max Attempts**: 5
- **Window**: 1 hour (3,600,000ms)
- **Cooldown**: 2 hours (7,200,000ms)
- **Identifier**: User email address

**Behavior**:
- First N attempts: Allowed
- Exceeding limit: Blocked with countdown message
- Cooldown: Automatic reset after cooldown period
- Manual reset: Available via admin methods

## Error Handling

### Error Scenarios

1. **Rate Limited**
    - **Response**: `{ success: false, error: 'Terlalu banyak percobaan. Silakan coba lagi dalam X detik.', errorCode: 'RATE_LIMIT_EXCEEDED', metadata: { rateLimited: true } }`
    - **Error Code**: `ServiceErrorCode.RATE_LIMIT`
    - **Action**: Wait for cooldown period

2. **Validation Error**
    - **Response**: `{ success: false, error: 'Format email tidak valid' | 'Kata sandi tidak valid', errorCode: 'VALIDATION_ERROR' }`
    - **Error Code**: `ServiceErrorCode.VALIDATION_ERROR`
    - **Action**: Validate input format before retrying

3. **Missing Credentials**
    - **Response**: `{ success: false, error: 'Email dan kata sandi diperlukan', errorCode: 'CREDENTIALS_MISSING' }`
    - **Error Code**: `ServiceErrorCode.CREDENTIALS_MISSING`
    - **Action**: Provide required fields

4. **Timeout**
    - **Response**: `{ success: false, error: 'Login request timed out' | 'Registration request timed out', errorCode: 'TIMEOUT' }`
    - **Error Code**: `ServiceErrorCode.TIMEOUT`
    - **Action**: Retried automatically (up to 3 attempts)

5. **Circuit Breaker Open**
    - **Response**: `{ success: false, error: 'Circuit breaker is open', errorCode: 'CIRCUIT_BREAKER_OPEN' }`
    - **Error Code**: `ServiceErrorCode.CIRCUIT_BREAKER_OPEN`
    - **Action**: Wait 60 seconds or manually reset (not recommended)

6. **Network Error**
    - **Response**: `{ success: false, error: 'Network error occurred', errorCode: 'NETWORK_ERROR' }`
    - **Error Code**: `ServiceErrorCode.NETWORK_ERROR`
    - **Action**: Retried automatically if matches retryable patterns

### Error Recovery

The service automatically handles:
- Rate limiting (prevents brute force, provides countdown messages)
- Transient network failures (retries with backoff)
- Authentication backend outages (circuit breaker prevents cascade)
- Timeout scenarios (bounded wait, no indefinite hang)
- Input validation (clear error messages for invalid data)

## Input Validation

### Email Validation

- **Format**: Valid email address (regex validation)
- **Required**: Yes
- **Error Message**: "Format email tidak valid"

### Password Validation

- **Minimum Length**: 8 characters
- **Required**: Yes
- **Error Message**: "Kata sandi tidak valid"

### Name Validation

- **Required**: Yes (for registration only)
- **Error Message**: "Nama, email, dan kata sandi diperlukan"

## Best Practices

### 1. Error Handling in Components

```typescript
const handleSubmit = async (formData: FormData) => {
    setIsLoading(true);

    const result = await authService.login({
        email: formData.get('email') as string,
        password: formData.get('password') as string
    });

    setIsLoading(false);

    if (result.success) {
        toast.success('Berhasil masuk ke portal');
        router.push('/dashboard');
    } else if (result.rateLimited) {
        toast.error(result.error || 'Terlalu banyak percobaan');
    } else {
        toast.error(result.error || 'Gagal masuk');
    }
};
```

### 2. Pre-Submission Validation

```typescript
const validateLoginForm = (email: string, password: string): boolean => {
    if (!email || !password) {
        toast.error('Email dan kata sandi diperlukan');
        return false;
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
        toast.error('Format email tidak valid');
        return false;
    }

    if (password.length < 8) {
        toast.error('Kata sandi harus minimal 8 karakter');
        return false;
    }

    return true;
};
```

### 3. Rate Limit Check Before Submission

```typescript
const checkRateLimitBeforeLogin = (email: string): boolean => {
    const status = authService.getLoginRateLimitStatus(email);

    if (status.lockedUntil) {
        const cooldownEnds = new Date(status.lockedUntil);
        const timeRemaining = Math.ceil((cooldownEnds.getTime() - Date.now()) / 1000);
        toast.error(`Terlalu banyak percobaan. Silakan coba lagi dalam ${timeRemaining} detik.`);
        return false;
    }

    return true;
};
```

### 4. Circuit Breaker Monitoring (Optional)

```typescript
const checkAuthHealth = () => {
    const state = authService.getCircuitBreakerState();

    if (state.state === 'open') {
        toast.warning('Layanan autentikasi sementara tidak tersedia. Silakan coba lagi nanti.');
    }
};
```

## Performance Considerations

### Request Flow

```
User Action
    ↓
Component sends request
    ↓
AuthService.login() / register()
    ↓
Input Validation (fails if invalid)
    ↓
Rate Limit Check (rejects if exceeded)
    ↓
Circuit Breaker Check (rejects if open)
    ↓
withRetry() (up to 3 attempts)
    ↓
withTimeout() (5s max per attempt)
    ↓
Authentication Operation
    ↓
Response (success or error)
```

### Timeouts

- **Input Validation**: Instant (< 1ms)
- **Rate Limit Check**: Instant (< 1ms)
- **Circuit Breaker Check**: Instant (< 1ms)
- **Single Request Max**: 5 seconds
- **Max Total Wait**: 5s (attempt 1) + 1s (delay) + 5s (attempt 2) + 2s (delay) + 5s (attempt 3) = ~18 seconds

### Rate Limiting Impact

- **Within Limits**: Normal operation, requests proceed
- **Exceeded Limit**: Requests rejected immediately (0ms wait)
- **Cooldown**: Automatic reset after cooldown period
- **Manual Reset**: Available via admin methods

### Circuit Breaker Impact

- **Circuit Closed**: Normal operation, requests proceed
- **Circuit Open**: Requests rejected immediately (0ms wait)
- **Half-Open**: Test request allowed, state updates based on result

## Testing

### Unit Tests

See `src/services/auth/__tests__/AuthService.test.ts` for comprehensive test coverage:

- Login flow tests (success, validation, rate limiting, timeout)
- Register flow tests (success, validation, rate limiting, timeout)
- Logout flow tests (success, error handling)
- Circuit breaker state transitions
- Timeout and retry behavior
- Rate limit status queries
- Metrics collection

### Resilience Pattern Tests

See `src/utils/resilience/__tests__/` for pattern-specific tests:

- **timeout.test.ts**: 6 tests for timeout wrapper
- **retry.test.ts**: 9 tests for retry with backoff
- **circuitBreaker.test.ts**: 19 tests for circuit breaker logic

## Security Considerations

1. **Password Security**: Passwords are validated for minimum length (8 characters)
2. **Rate Limiting**: Prevents brute force attacks
3. **Input Validation**: All inputs validated before processing
4. **Error Messages**: Indonesian error messages prevent information leakage
5. **Circuit Breaker**: Prevents cascading failures from authentication backend
6. **Timeout Protection**: Prevents indefinite hangs from slow authentication
7. **Mock Implementation**: Current implementation is mock-based, ready for real backend integration

## Troubleshooting

### Common Issues

1. **"Terlalu banyak percobaan. Silakan coba lagi dalam X detik."**
    - Rate limit exceeded for this email address
    - Wait for automatic cooldown reset (login: 30min, register: 2hr)
    - Or use admin methods to reset (resetLoginRateLimit, resetRegisterRateLimit)

2. **"Format email tidak valid"**
    - Email format validation failed
    - Ensure email follows standard format (user@domain.com)
    - Check for typos or invalid characters

3. **"Kata sandi tidak valid"**
    - Password validation failed
    - Ensure password is at least 8 characters
    - Check for whitespace or special characters if required by backend

4. **"Email dan kata sandi diperlukan"**
    - Required fields missing
    - Provide both email and password for login
    - Provide name, email, and password for registration

5. **"Login request timed out" / "Registration request timed out"**
    - Authentication operation took too long
    - Retried automatically (up to 3 attempts)
    - Check network connectivity
    - Verify authentication backend is responsive

6. **"Circuit breaker is open"**
    - Authentication backend experiencing issues
    - Wait 60 seconds for automatic reset
    - Check authentication backend status
    - Manual reset available via resetCircuitBreaker (use with caution)

7. **Repeated failures**
    - Check input validation (email format, password length)
    - Check rate limit status (getLoginRateLimitStatus, getRegisterRateLimitStatus)
    - Check circuit breaker state (getCircuitBreakerState)
    - Review error logs (logServiceError)

## Migration from Mock to Real Backend

The current AuthService implementation is mock-based and ready for real backend integration:

### Current Mock Implementation

- User authentication is simulated in-memory
- JWT tokens are mock tokens ("mock-jwt-token")
- User data is stored in-memory (lost on page refresh)
- No persistent session management

### Real Backend Integration Steps

1. **Replace Mock Operations**
    - Replace `loginWithoutResilience()` with API call to backend
    - Replace `registerWithoutResilience()` with API call to backend
    - Implement actual JWT token validation
    - Implement session persistence (localStorage, cookies, or HttpOnly cookies)

2. **Environment Variables**
    ```bash
    NEXT_PUBLIC_AUTH_API_URL=<auth-api-url>
    NEXT_PUBLIC_JWT_SECRET=<jwt-secret>  # Server-side only
    ```

3. **Session Management**
    - Store JWT token securely (HttpOnly cookies recommended)
    - Implement token refresh mechanism
    - Handle token expiration gracefully
    - Implement logout with token invalidation

4. **API Endpoints**
    - POST /api/auth/login - User login
    - POST /api/auth/register - User registration
    - POST /api/auth/logout - User logout
    - GET /api/auth/me - Get current user

5. **Security Enhancements**
    - Implement CSRF protection
    - Add rate limiting at API gateway level
    - Implement OAuth2/OpenID Connect if needed
    - Add multi-factor authentication (MFA) if required

## Related Documentation

- [Email Service API - docs/api/email-service.md](./email-service.md)
- [Resilience Patterns - src/utils/resilience/](../utils/resilience/)
- [Integration Architecture - blueprint.md](../blueprint.md)
- [Rate Limiting Configuration - src/constants/rateLimits.ts](../constants/rateLimits.ts)
- [Service Common Types - src/services/common/](../services/common/)
- [Service Health Monitoring - docs/service-health-monitoring.md](../service-health-monitoring.md)
- [OpenAPI Specification - docs/openapi-spec.yaml](../openapi-spec.yaml)
- [Postman Collection - docs/postman-collection.json](../postman-collection.json)

## Integration Best Practices

### 1. Error Handling in Components

Always check `result.success` before proceeding:

```typescript
const result = await authService.login({ email, password });

if (result.success) {
    toast.success('Berhasil masuk ke portal');
    router.push('/dashboard');
} else if (result.metadata?.rateLimited) {
    const cooldownEnds = new Date(result.metadata.lockedUntil || Date.now());
    const timeRemaining = Math.ceil((cooldownEnds.getTime() - Date.now()) / 1000);
    toast.error(`Terlalu banyak percobaan. Silakan coba lagi dalam ${timeRemaining} detik.`);
} else {
    toast.error(result.error || 'Gagal masuk');
}
```

### 2. Resilience Pattern Awareness

Understand the resilience layers:
1. Input Validation: Email format, password length (8+ chars)
2. Rate Limiting: Per-email (login: 5/15min, register: 5/1hr)
3. Timeout Protection: 5s max per request
4. Retry with Backoff: 3 attempts (1s → 2s → 4s)
5. Circuit Breaker: Opens after 50 failures, resets after 60s

### 3. Rate Limit Status Checks

Pre-check rate limit before user action:

```typescript
const rateLimitStatus = authService.getLoginRateLimitStatus(email);

if (rateLimitStatus.lockedUntil) {
    const cooldownEnds = new Date(rateLimitStatus.lockedUntil);
    const timeRemaining = Math.ceil((cooldownEnds.getTime() - Date.now()) / 1000);
    toast.warning(`Silakan tunggu ${timeRemaining} detik sebelum mencoba lagi.`);
    return false;
}

if (rateLimitStatus.attemptsRemaining <= 1) {
    toast.warning(`Sisa ${rateLimitStatus.attemptsRemaining} percobaan.`);
}

return true;
```

### 4. Service Health Monitoring

Monitor AuthService health using metrics:

```typescript
const metrics = authService.getMetrics();

if (metrics.login?.successRate && metrics.login.successRate < 0.9) {
    console.warn(`AuthService.login degraded: ${metrics.login.successRate * 100}% success rate`);
}

if (metrics.register?.successRate && metrics.register.successRate < 0.9) {
    console.warn(`AuthService.register degraded: ${metrics.register.successRate * 100}% success rate`);
}
```

See [Service Health Monitoring](../service-health-monitoring.md) for comprehensive monitoring strategies.

### 5. Circuit Breaker State Checks

Check circuit breaker before critical operations:

```typescript
const state = authService.getCircuitBreakerState();

if (state.isOpen) {
    toast.warning('Layanan autentikasi sementara tidak tersedia. Silakan coba lagi nanti.');
    return;
}
```

### 6. Current User Management

Manage current user session:

```typescript
const user = await authService.getCurrentUser();

if (user) {
    console.log('Current user:', user);
} else {
    console.log('No user authenticated');
    router.push('/login');
}
```

### 7. Metrics Export

Export metrics for external monitoring systems:

```typescript
import metricsCollector from '@/utils/metrics';

const metricsData = metricsCollector.exportMetrics();

// Send to Prometheus, Datadog, CloudWatch, etc.
```

See [Service Health Monitoring](../service-health-monitoring.md) for external monitoring integration.
