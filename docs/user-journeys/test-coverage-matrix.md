# User Journey Test Coverage Matrix

This document maps user stories to test coverage for critical user journeys.

## Overview

| Journey | Feature File | Unit Tests | Integration Tests | E2E Tests | Coverage Status |
|---------|-------------|------------|-------------------|-----------|-----------------|
| Authentication | `authentication.feature` | Partial | None | Pending | 30% |
| Content Discovery & Bookmarking | `content-discovery.feature` | Partial | None | Pending | 25% |
| Contact Form Submission | `contact-form.feature` | Good | None | Pending | 40% |
| Admin Dashboard Usage | `admin-dashboard.feature` | Partial | None | Pending | 20% |
| Personalization Rules | `personalization.feature` | Good | None | Pending | 35% |

## Detailed Coverage

### 1. Authentication Journey

| Scenario | Component | Unit Test | Notes |
|----------|-----------|-----------|-------|
| New user registration with valid data | `SignUpForm.tsx` | Needed | Form validation exists |
| Registration with invalid email | `SignUpForm.tsx` | Needed | Schema validation exists |
| Registration with weak password | `SignUpForm.tsx` | Needed | Schema validation exists |
| Existing user login | `LoginForm.tsx` | Needed | Form validation exists |
| Login with invalid credentials | `LoginForm.tsx` | Needed | Auth service mock needed |
| Navigate between login/register | Navigation | Needed | Link navigation |

**Key Files:**
- `src/components/forms/SignUpForm.tsx`
- `src/components/forms/LoginForm.tsx`
- `src/services/auth.ts`
- `src/utils/formValidation.ts`

### 2. Content Discovery & Bookmarking Journey

| Scenario | Component | Unit Test | Notes |
|----------|-----------|-----------|-------|
| Browse blog posts | Blog page | Needed | Data exists in BlogData.ts |
| Read a blog post | Blog details | Needed | Reading history tracking exists |
| Bookmark a blog post | Bookmark component | Needed | localStorage based |
| View saved bookmarks | `BookmarksPage` | Partial | Component tests exist |
| Remove a bookmark | `BookmarksPage` | Needed | |
| Empty bookmarks state | `BookmarksPage` | Needed | |
| Reading history tracking | `ReadingHistorySection` | Needed | |

**Key Files:**
- `src/components/bookmarks/index.tsx`
- `src/components/dashboard/ReadingHistorySection.tsx`
- `src/utils/bookmarkStorage.ts`
- `src/utils/readingHistory.ts`

### 3. Contact Form Submission Journey

| Scenario | Component | Unit Test | Notes |
|----------|-----------|-----------|-------|
| Submit with valid data | `ContactForm.tsx` | Good | Form submission tested |
| Empty name validation | `ContactForm.tsx` | Good | Schema validation |
| Invalid email validation | `ContactForm.tsx` | Good | Schema validation |
| Empty message validation | `ContactForm.tsx` | Good | Schema validation |
| Long message handling | `ContactForm.tsx` | Needed | MaxLength implemented |
| Multiple inquiries | Email service | Needed | |

**Key Files:**
- `src/components/forms/ContactForm.tsx`
- `src/services/email.ts`
- `src/utils/formValidation.ts`

### 4. Admin Dashboard Usage Journey

| Scenario | Component | Unit Test | Notes |
|----------|-----------|-----------|-------|
| Access admin dashboard | Admin layout | Needed | |
| View analytics | Analytics page | Partial | Data exists |
| Manage user comments | Comments page | Needed | |
| Configure email scheduler | Email scheduler | Needed | |
| View audit logs | Audit logs | Needed | |
| Manage backups | Backups page | Needed | |
| Monitor performance | APM config | Needed | |
| Manage CDN | CDN config | Needed | |
| View anomalies | Anomalies page | Needed | |

**Key Files:**
- `src/app/admin/*/page.tsx` (multiple admin pages)
- `src/data/analyticsData.ts`
- `src/data/BackupData.ts`

### 5. Personalization Rule Creation Journey

| Scenario | Component | Unit Test | Notes |
|----------|-----------|-----------|-------|
| View personalization dashboard | `PersonalizationDashboard.tsx` | Partial | |
| Create new rule | `PersonalizationDashboard.tsx` | Needed | |
| Configure segment targeting | `PersonalizationDashboard.tsx` | Needed | |
| Set rule priority | `PersonalizationDashboard.tsx` | Needed | |
| Toggle rule activation | `PersonalizationDashboard.tsx` | Needed | |
| Delete rule | `PersonalizationDashboard.tsx` | Needed | |
| View analytics | Dashboard analytics | Needed | |
| Preview effects | `PersonalizationPreview.tsx` | Needed | |
| View version history | `RuleVersionHistoryPanel.tsx` | Needed | |
| Apply template | `TemplateBrowser.tsx` | Needed | |
| Global toggle | Engine | Needed | |

**Key Files:**
- `src/components/admin/PersonalizationDashboard.tsx`
- `src/components/personalization/*.tsx`
- `src/utils/personalization.ts`
- `src/types/personalization.ts`

## Test Gap Analysis

### High Priority Gaps

1. **Authentication Flow** - No integration tests for auth service
2. **E2E Testing** - No E2E test framework configured (Playwright/Cypress not installed)
3. **Form Submission Integration** - Limited integration tests for form submissions

### Medium Priority Gaps

1. **Admin Dashboard Tests** - Most admin pages lack test coverage
2. **Personalization Flow** - Complex flow needs comprehensive testing
3. **Bookmark Persistence** - localStorage-based, needs testing

### Low Priority Gaps

1. **Navigation Tests** - Basic routing functionality
2. **UI Component Tests** - Individual component rendering

## Recommendations

### Immediate Actions

1. **Add Playwright or Cypress** for E2E testing
2. **Create integration tests** for auth service
3. **Add unit tests** for uncovered scenarios

### Short-term Actions

1. **Implement BDD-style tests** using Gherkin feature files
2. **Add visual regression tests** for critical UI flows
3. **Set up test coverage reporting**

### Long-term Actions

1. **Automate test generation** from feature files
2. **Implement contract testing** for API integrations
3. **Add performance testing** for critical journeys

## Related Documentation

- [Gherkin Feature Files](./features/)
- [Testing Strategy](../testing-strategy.md) (if exists)
- [API Documentation](../api/) (if exists)

---

*Last updated: 2026-02-23*
*Generated by: User Story Engineer*
