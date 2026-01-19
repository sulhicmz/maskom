# Service Contracts

This document defines the contracts for all services in the Maskom application. These contracts specify the exact interfaces, error codes, and behavior that services must implement.

## Table of Contents

- [EmailService](#emailservice)
- [AuthService](#authservice)
- [Error Codes](#error-codes)
- [Resilience Patterns](#resilience-patterns)

---

## EmailService

EmailService provides email sending capabilities with template support, queue management, and resilience features.

### Interface

```typescript
interface IEmailService {
    sendEmail(params: EmailSendParams, options?: EmailSendOptions): Promise<ServiceResult<{ text: string }>>;
    sendTemplatedEmail(
        templateId: number,
        variables: Record<string, string>,
        options?: EmailSendOptions
    ): Promise<ServiceResult<{ subject: string; body: string; text: string }>>;
    getCircuitBreakerState(): CircuitBreakerState;
    resetCircuitBreaker(): void;
    getMetrics(): ServiceMetrics | undefined;
    processQueue(): Promise<ServiceResult<{ processed: number; failed: number }>>;
    getQueueStatus(): { queueSize: number; expired: number };
}
```

### Types

#### EmailSendParams

```typescript
interface EmailSendParams {
    templateParams: {
        user_name: string;
        user_email: string;
        message: string;
    };
}
```

#### EmailSendOptions

```typescript
interface EmailSendOptions {
    skipRateLimit?: boolean;
    identifier?: string;
}
```

### Methods

#### sendEmail

Sends an email using the configured EmailJS service.

**Parameters:**
- `params`: EmailSendParams - Email parameters including recipient name, email, and message
- `options`: EmailSendOptions (optional) - Options to control sending behavior

**Returns:** `Promise<ServiceResult<{ text: string }>>`

**Success Response:**
- `success`: true
- `message`: "Email sent successfully" or "Email queued for later delivery"
- `data`: `{ text: string }` - EmailJS response text
- `metadata.queued`: boolean (true if email was queued due to circuit breaker/network error)

**Error Responses:**
- `VALIDATION_ERROR`: Invalid email parameters
- `CREDENTIALS_MISSING`: EmailJS credentials not configured
- `RATE_LIMIT_EXCEEDED`: Rate limit exceeded (includes retryAfter in metadata)
- `TIMEOUT`: EmailJS request timed out (10s timeout)
- `CIRCUIT_BREAKER_OPEN`: Circuit breaker is open (5 failures in 60s)
- `NETWORK_ERROR`: Network connectivity issue

**Resilience:**
- Timeout: 10 seconds
- Retry: 3 attempts with exponential backoff (2s, 4s, 8s)
- Circuit Breaker: Opens after 5 failures, resets after 60s
- Rate Limit: 5 requests per 60 seconds
- Fallback: Emails queued on circuit/network errors

#### sendTemplatedEmail

Sends an email using a predefined template with variable substitution.

**Parameters:**
- `templateId`: number - ID of the email template
- `variables`: Record<string, string> - Variables to substitute in template
- `options`: EmailSendOptions (optional) - Options to control sending behavior

**Returns:** `Promise<ServiceResult<{ subject: string; body: string; text: string }>>`

**Success Response:**
- `success`: true
- `message`: "Email sent successfully"
- `data`: `{ subject: string; body: string; text: string }` - Email content

**Error Responses:**
- `VALIDATION_ERROR`: Invalid template ID or variables
- `TEMPLATE_VALIDATION_FAILED`: Template validation failed (missing variables)
- `TEMPLATE_NOT_FOUND`: Template with specified ID not found
- `EMAIL_SEND_FAILED`: Failed to send email

**Resilience:** Same as sendEmail (timeout, retry, circuit breaker, rate limit, queue)

#### processQueue

Processes all emails in the queue. Failed emails are retried up to 3 times.

**Returns:** `Promise<ServiceResult<{ processed: number; failed: number }>>`

**Success Response:**
- `success`: true
- `message`: "Queue processed"
- `data`: `{ processed: number; failed: number }` - Processing statistics

**Error Responses:**
- `CIRCUIT_BREAKER_OPEN`: Cannot process queue while circuit breaker is open

**Resilience:**
- Timeout: 10 seconds per email
- Retry: 3 attempts per email with exponential backoff (2s, 4s, 8s)
- Rate Limit: Skipped (higher priority for queue processor)
- Max Attempts: 3 per email before marked as failed

#### getQueueStatus

Returns current email queue status.

**Returns:** `{ queueSize: number; expired: number }`

**Fields:**
- `queueSize`: Number of emails currently in queue
- `expired`: Number of emails that have expired (not sent within timeout)

---

## AuthService

AuthService provides authentication, user management, and MFA (Multi-Factor Authentication) capabilities.

### Interface

```typescript
interface IAuthService {
    login(credentials: LoginCredentials): Promise<AuthResult>;
    register(userData: RegisterData): Promise<AuthResult>;
    logout(): Promise<AuthResult>;
    getCurrentUser(): Promise<User | null>;
    getCurrentUserRole(): Promise<UserRole | null>;
    hasPermission(permission: Permission): Promise<boolean>;
    hasRole(role: UserRole): Promise<boolean>;
    getCircuitBreakerState(): CircuitBreakerState;
    resetCircuitBreaker(): void;
    enableMFA(totpCode: string): Promise<AuthResult>;
    disableMFA(password: string): Promise<AuthResult>;
    verifyMFA(totpCode: string, backupCode?: string): Promise<AuthResult>;
    getMFAStatus(): Promise<MFAStatus>;
    regenerateBackupCodes(password: string): Promise<AuthResult>;
    initiateMFASetup(): Promise<AuthResult>;
}
```

### Types

#### LoginCredentials

```typescript
interface LoginCredentials {
    email: string;
    password: string;
    totpCode?: string;
}
```

#### RegisterData

```typescript
interface RegisterData {
    name: string;
    email: string;
    password: string;
    role?: UserRole;
}
```

#### AuthResult

```typescript
interface AuthResult {
    success: boolean;
    message?: string;
    error?: string;
    errorCode?: ServiceErrorCodeType;
    user?: User;
    token?: string;
    metadata?: Record<string, unknown>;
    mfaSetupData?: MFASetupData;
}
```

#### User

```typescript
interface User {
    id: string;
    name: string;
    email: string;
    role: UserRole;
    mfaEnabled: boolean;
    mfaSecret?: string;
    mfaBackupCodes?: string[];
    mfaEnabledAt?: string;
}
```

#### UserRole

```typescript
type UserRole = 'admin' | 'editor' | 'user';
```

#### MFAStatus

```typescript
type MFAStatus = 'enabled' | 'disabled' | 'required';
```

### Methods

#### login

Authenticates a user with email and password.

**Parameters:**
- `credentials`: LoginCredentials - Email, password, and optional TOTP code

**Returns:** `Promise<AuthResult>`

**Success Response:**
- `success`: true
- `message`: "Berhasil masuk ke portal" (Indonesian: Successfully logged in)
- `user`: User object
- `token`: JWT token (mock: "mock-jwt-token")

**Error Responses:**
- `VALIDATION_ERROR`: Invalid email or password format
- `MFA_REQUIRED`: MFA code required for admin role
- `MFA_INVALID`: Invalid TOTP or backup code
- `RATE_LIMIT_EXCEEDED`: Too many login attempts (5 per 15 minutes)

**Resilience:**
- Timeout: 5 seconds
- Retry: 2 attempts with exponential backoff (1s, 2s)
- Circuit Breaker: Opens after 50 failures, resets after 60s
- Rate Limit: 5 attempts per 15 minutes per email

**MFA Behavior:**
- Admin role requires MFA (status: 'required')
- If MFA enabled and no totpCode provided, returns error
- totpCode verified via TOTP algorithm
- backupCode can be used instead of totpCode

#### register

Registers a new user account.

**Parameters:**
- `userData`: RegisterData - Name, email, password, and optional role

**Returns:** `Promise<AuthResult>`

**Success Response:**
- `success`: true
- `message`: "Registrasi berhasil dikirim" (Indonesian: Registration successful)
- `user`: User object
- `token`: JWT token (mock: "mock-jwt-token")

**Error Responses:**
- `VALIDATION_ERROR`: Invalid name, email, or password format
- `RATE_LIMIT_EXCEEDED`: Too many registration attempts (5 per hour)

**Resilience:**
- Timeout: 5 seconds
- Retry: 2 attempts with exponential backoff (1s, 2s)
- Circuit Breaker: Opens after 50 failures, resets after 60s
- Rate Limit: 5 attempts per hour per email

**Default Behavior:**
- Default role: 'user' if not specified
- Role validation: Must be valid UserRole ('admin', 'editor', 'user')

#### logout

Logs out the current user.

**Returns:** `Promise<AuthResult>`

**Success Response:**
- `success`: true
- `message`: "Berhasil keluar" (Indonesian: Successfully logged out)

**Behavior:**
- Clears currentUser from session
- Clears MFA setup data
- Logs logout activity

#### getCurrentUser

Returns the currently authenticated user.

**Returns:** `Promise<User | null>`

**Behavior:**
- Returns User object if authenticated
- Returns null if not authenticated

#### getCurrentUserRole

Returns the role of the currently authenticated user.

**Returns:** `Promise<UserRole | null>`

**Behavior:**
- Returns UserRole if authenticated
- Returns null if not authenticated

#### hasPermission

Checks if the current user has a specific permission.

**Parameters:**
- `permission`: Permission - Permission to check

**Returns:** `Promise<boolean>`

**Behavior:**
- Returns true if user has permission
- Returns false if user doesn't have permission or not authenticated

#### hasRole

Checks if the current user has a specific role.

**Parameters:**
- `role`: UserRole - Role to check

**Returns:** `Promise<boolean>`

**Behavior:**
- Returns true if user has exact role match
- Returns false if user has different role or not authenticated

#### enableMFA

Enables Multi-Factor Authentication for the current user.

**Parameters:**
- `totpCode`: string - TOTP code from authenticator app

**Returns:** `Promise<AuthResult>`

**Success Response:**
- `success`: true
- `message`: "MFA berhasil diaktifkan" (Indonesian: MFA successfully enabled)
- `user`: User object with MFA enabled

**Error Responses:**
- `VALIDATION_ERROR`: User not authenticated, MFA setup not initiated, or invalid TOTP code

**Behavior:**
- Requires MFA setup to be initiated first (initiateMFASetup)
- Verifies TOTP code
- Enables MFA on success
- Logs MFA enabled activity

#### disableMFA

Disables Multi-Factor Authentication for the current user.

**Parameters:**
- `password`: string - User password for verification

**Returns:** `Promise<AuthResult>`

**Success Response:**
- `success`: true
- `message`: "MFA berhasil dinonaktifkan" (Indonesian: MFA successfully disabled)
- `user`: User object with MFA disabled

**Error Responses:**
- `VALIDATION_ERROR`: User not authenticated or invalid password

**Behavior:**
- Validates password
- Clears MFA secret and backup codes
- Logs MFA disabled activity

#### verifyMFA

Verifies MFA code for login or operations requiring MFA.

**Parameters:**
- `totpCode`: string - TOTP code from authenticator app
- `backupCode`?: string - Backup code instead of TOTP

**Returns:** `Promise<AuthResult>**

**Success Response:**
- `success`: true
- `message`: "MFA berhasil diverifikasi" (Indonesian: MFA successfully verified)
- `user`: User object
- If backupCode used: message is "Backup code verified"

**Error Responses:**
- `VALIDATION_ERROR`: MFA not enabled, invalid TOTP code, or invalid backup code

**Behavior:**
- Verifies TOTP code using TOTP algorithm
- Backup codes are single-use (removed after use)
- Logs MFA verification activity

#### getMFAStatus

Returns MFA status for the current user.

**Returns:** `Promise<MFAStatus>`

**MFAStatus Values:**
- `'enabled'`: MFA is enabled
- `'disabled'`: MFA is disabled
- `'required'`: MFA is required (admin role without MFA enabled)

**Behavior:**
- Returns 'required' for admin role if MFA not enabled
- Returns 'enabled' if MFA is enabled
- Returns 'disabled' otherwise

#### regenerateBackupCodes

Regenerates new backup codes for MFA.

**Parameters:**
- `password`: string - User password for verification

**Returns:** `Promise<AuthResult>`

**Success Response:**
- `success`: true
- `message`: "Kode cadangan berhasil dibuat ulang" (Indonesian: Backup codes successfully regenerated)
- `user`: User object
- `metadata.backupCodes`: string[] - New backup codes

**Error Responses:**
- `VALIDATION_ERROR`: MFA not enabled or invalid password

**Behavior:**
- Validates password
- Generates new 10 backup codes
- Replaces existing backup codes
- Logs backup codes generation activity

#### initiateMFASetup

Initiates MFA setup process.

**Returns:** `Promise<AuthResult>`

**Success Response:**
- `success`: true
- `message`: "MFA setup initiated"
- `mfaSetupData`: MFASetupData object

**MFASetupData:**
```typescript
interface MFASetupData {
    secret: string;      // TOTP secret
    qrCodeUrl: string;   // QR code URL for authenticator app
    backupCodes: string[]; // 10 backup codes
}
```

**Error Responses:**
- `VALIDATION_ERROR`: User not authenticated or MFA already enabled

**Behavior:**
- Generates TOTP secret
- Creates QR code URL
- Generates 10 backup codes
- Stores setup data temporarily (cleared on enableMFA or disableMFA)

---

## Error Codes

All services use standardized error codes defined in ServiceErrorCode.

### ServiceErrorCode

```typescript
const ServiceErrorCode = {
    VALIDATION: 'VALIDATION_ERROR',
    RATE_LIMIT: 'RATE_LIMIT_EXCEEDED',
    TIMEOUT: 'TIMEOUT',
    CIRCUIT_BREAKER: 'CIRCUIT_BREAKER_OPEN',
    CREDENTIALS_MISSING: 'CREDENTIALS_MISSING',
    UNKNOWN: 'UNKNOWN_ERROR',
    NETWORK: 'NETWORK_ERROR',
} as const;
```

### Error Code Descriptions

| Error Code | Description | Retryable | HTTP Status |
|------------|-------------|------------|-------------|
| VALIDATION_ERROR | Invalid input data or validation failure | No | 400 |
| RATE_LIMIT_EXCEEDED | Too many requests, rate limit exceeded | Yes | 429 |
| TIMEOUT | Request timed out | Yes | 504 |
| CIRCUIT_BREAKER_OPEN | Service circuit breaker is open | Yes | 503 |
| CREDENTIALS_MISSING | Service credentials not configured | No | 500 |
| NETWORK_ERROR | Network connectivity issue | Yes | 503 |
| UNKNOWN_ERROR | Unknown error occurred | No | 500 |

### Retry Behavior

For retryable errors, clients should:
1. Check `Retry-After` header if present
2. Use exponential backoff for retries
3. Implement circuit breaker logic for repeated failures

### Rate Limits

### EmailService Rate Limits

| Operation | Limit | Window | Cooldown |
|-----------|-------|--------|----------|
| sendEmail | 5 requests | 60 seconds | 5 minutes |

### AuthService Rate Limits

| Operation | Limit | Window | Cooldown |
|-----------|-------|--------|----------|
| login | 5 attempts | 15 minutes | 30 minutes |
| register | 5 attempts | 1 hour | 2 hours |

### Circuit Breaker Configuration

| Service | Failure Threshold | Reset Timeout | Monitoring Period |
|---------|-------------------|---------------|-------------------|
| EmailService | 5 failures | 60 seconds | 60 seconds |
| AuthService | 50 failures | 60 seconds | 60 seconds |
| API Routes (Health, Metrics, Status) | 3 failures | 30 seconds | 60 seconds |

---

## Resilience Patterns

All services implement the following resilience patterns:

### 1. Timeout Protection

All service calls have configurable timeouts to prevent hanging:

- EmailService: 10 seconds
- AuthService: 5 seconds (login/register)
- API Routes: 5 seconds

### 2. Exponential Backoff Retry

Failed requests are retried with exponential backoff:

**EmailService Retry Config:**
- Max Attempts: 3
- Base Delay: 2000ms
- Max Delay: 15000ms
- Backoff Multiplier: 2
- Retryable Errors: /network/i, /timeout/i, /ECONN/i, /5\d{2}/

**AuthService Retry Config:**
- Max Attempts: 2
- Base Delay: 1000ms
- Max Delay: 5000ms
- Backoff Multiplier: 2
- Retryable Errors: /network/i, /timeout/i, /ECONN/i

### 3. Circuit Breaker Pattern

Circuit breaker prevents cascading failures:

**States:**
- **Closed**: Normal operation, requests pass through
- **Open**: Requests fail fast, service considered down
- **Half-Open**: Testing if service has recovered

**Behavior:**
1. Monitor failures in monitoring window
2. Open circuit if failure threshold exceeded
3. Keep open for reset timeout duration
4. Enter half-open state after timeout
5. Close circuit on first success, re-open on failure

### 4. Rate Limiting

Rate limiting protects services from overload:

**Sliding Window Algorithm:**
- Tracks request timestamps in window
- Allows requests if count < max
- Returns rate limit error if exceeded
- Implements cooldown period after sustained limit hits

### 5. Fallback and Degradation

Services provide fallback behavior when degraded:

- **EmailService**: Queues emails on circuit/network errors
- **API Routes**: Return cached metrics if available
- **Circuit Breaker**: Fail fast with Retry-After header

### 6. Idempotency

Operations are designed to be idempotent:

- Multiple identical requests produce same result
- Queue operations deduplicate by ID
- MFA verification codes are single-use (backup codes)

---

## Service Metrics

All services collect and expose metrics:

### Metrics Schema

```typescript
interface ServiceMetrics {
    serviceName: string;
    totalCalls: number;
    successCalls: number;
    failureCalls: number;
    timeoutCalls: number;
    rateLimitCalls: number;
    circuitBreakerOpenCount: number;
    lastError?: string;
    lastSuccessTime?: number;  // Unix timestamp
    lastFailureTime?: number;  // Unix timestamp
    averageResponseTime?: number; // milliseconds
}
```

### Metrics Collection

Metrics are automatically collected for all service calls:
- Call count (total, success, failure)
- Response time tracking
- Error type tracking (timeout, rate limit, circuit breaker)
- Circuit breaker state tracking

### Health Checks

Services provide health check endpoints:

**Health Criteria:**
- Success rate >= 90% (configurable)
- Circuit breaker not open
- No recent critical errors

**Health Status:**
- `healthy`: All criteria met
- `degraded`: Some criteria not met
- `unhealthy`: Critical issues detected

---

## Backward Compatibility

This contract guarantees backward compatibility:

### Rules:
1. **Never remove fields** from existing interfaces
2. **Never change field types** (use new fields instead)
3. **Never break existing API behavior**
4. **Always mark new fields as optional**
5. **Never change error codes** (add new ones instead)

### Versioning:
- API version in path: `/api/v1/...`
- Contract version: SemVer (1.0.0)
- Major version changes indicate breaking changes
- Minor version changes indicate new features
- Patch version changes indicate bug fixes

---

## Examples

### EmailService Example

```typescript
import emailService from '@/services/email';

// Send simple email
const result = await emailService.sendEmail({
    templateParams: {
        user_name: 'John Doe',
        user_email: 'john@example.com',
        message: 'Hello from Maskom!'
    }
});

if (result.success) {
    console.log('Email sent:', result.data?.text);
} else {
    console.error('Error:', result.error, result.errorCode);
}
```

### AuthService Example

```typescript
import authService from '@/services/auth';

// Login
const result = await authService.login({
    email: 'user@example.com',
    password: 'securepassword'
});

if (result.success) {
    console.log('Logged in as:', result.user?.name);
    console.log('Token:', result.token);
} else {
    if (result.errorCode === 'RATE_LIMIT_EXCEEDED') {
        console.log('Too many attempts, try again later');
    } else {
        console.error('Login failed:', result.error);
    }
}
```

### Circuit Breaker Example

```typescript
import emailService from '@/services/email';

// Check circuit breaker state
const state = emailService.getCircuitBreakerState();
console.log('Circuit breaker open:', state.isOpen);

if (state.isOpen) {
    console.log('Service is down, emails will be queued');
    console.log('Last failure:', new Date(state.lastFailureTime || 0));
}
```

---

## Contact

For questions about service contracts or integration issues:
- **Documentation**: This document
- **OpenAPI Spec**: `docs/openapi.yaml`
- **Support**: support@maskom.com
- **License**: MIT
