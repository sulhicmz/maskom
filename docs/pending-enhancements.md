# Pending Enhancement Issues

These integration gaps were identified during Phase 2 (Product Thinking Mode) analysis on 2026-01-21.

---

## Issue 1: Backup System + APM Monitoring

**Category**: enhancement
**Priority**: P1 (HIGH)

### Problem Statement
The Backup System lacks APM integration, reducing observability for critical backup operations.

### Current State
- Backup operations use `console.log` for progress tracking
- No APM error capture for backup failures
- No APM performance tracking for backup duration/completion
- No APM breadcrumbs for backup operation flow

### Proposed Integration
1. **Error Capture**: Use `apmManager.captureError()` for backup failures
2. **Performance Tracking**: Use `apmManager.trackPerformance()` for backup duration
3. **Operation Logging**: Use `apmManager.addBreadcrumb()` for backup flow tracking
4. **User Context**: Set user context for backup operations with ownership info

### Benefits
- Real-time alerting when backups fail
- Performance insights for backup optimization
- Better observability for disaster recovery system
- Leverages existing APM infrastructure (FEATURE-022)

### Implementation Notes
- Integration is non-breaking (additive only)
- Follows existing APM integration patterns
- Related to FEATURE-003 (Performance Optimization)

---

## Issue 2: MFA + Activity Logging

**Category**: enhancement
**Priority**: P1 (HIGH)

### Problem Statement
The MFA system does not integrate with Activity Logging, creating security audit trail gaps.

### Current State
- MFA operations (setup, verification, disable) not logged to ActivityLogger
- No audit trail exists for MFA lifecycle events
- Cannot detect suspicious MFA patterns (multiple setup attempts, failures)

### Proposed Integration
Add `logActivity()` calls for these MFA events:
1. **MFA Setup**: When user generates TOTP secret and QR code
2. **MFA Verification**: Successful or failed MFA verification during login
3. **MFA Disable**: When user disables MFA (security de-escalation)
4. **MFA Recovery**: When user uses recovery codes or admin recovery

Use new `ActivityAction` enum values:
- `MFA_ENABLED` - New action for MFA setup
- `MFA_DISABLED` - New action for MFA disable
- `MFA_VERIFIED` - New action for successful verification
- `MFA_FAILED` - New action for failed verification
- `MFA_RECOVERY` - New action for recovery operations

### Benefits
- Complete security audit trail for authentication events
- Detect suspicious MFA patterns (brute force, multiple setups)
- Compliance with security best practices
- Forensic investigation capability
- Leverages existing ActivityLogger infrastructure

### Implementation Notes
- Add new `ActivityAction` enum values for MFA events
- Integration is non-breaking (additive only)
- Related to Task 316 (Activity Logging) and Task 366 (MFA Integration Hardening)

---

## Issue 3: Email Service + Analytics

**Category**: enhancement
**Priority**: P2 (MEDIUM)

### Problem Statement
The Email Service does not integrate with Analytics, creating visibility gaps for email operations.

### Current State
- Email Service sends emails via EmailJS
- Email operations use APM for error tracking only
- No Analytics tracking for email events
- No correlation between emails sent and user engagement

### Proposed Integration
Add Analytics tracking for these email events:
1. **Email Sent**: Track when email is successfully sent
   - Email type (contact form, campaign, notification, etc.)
   - Recipient user (anonymized if needed)
   - Timestamp

2. **Email Failed**: Track when email send fails
   - Error type (timeout, quota, API error, etc.)
   - Retry count
   - Failure reason

### Implementation Options
**Option 1**: Direct Analytics Integration
- Add `analytics.trackEvent()` calls in EmailService
- Simple, direct coupling
- Good for immediate needs

**Option 2**: Event-Driven Integration
- Publish email events to an event bus
- Analytics subscribes to email events
- Decoupled, more extensible
- Recommended for future growth

### Benefits
- Measure email communication effectiveness
- Identify email delivery issues proactively
- Optimize email campaign performance
- Correlate email sends with user engagement

### Implementation Notes
- Start with Option 1 (direct integration) for simplicity
- Consider Option 2 (event-driven) when email volume grows
- Privacy: Consider anonymizing recipient data
- Related to FEATURE-001 (Email Service Integration) and FEATURE-009 (Analytics Dashboard)

---

**Created**: 2026-01-21
**Phase**: Phase 2 (Product Thinking Mode - Feature Gap Analysis)
**Status**: Documented, awaiting GitHub issue creation (requires permissions)
