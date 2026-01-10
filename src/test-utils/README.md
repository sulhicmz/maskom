# Test Utilities

This directory contains reusable testing utilities, mocks, fixtures, and custom matchers to help write cleaner and more maintainable tests.

## Files

### `testHelpers.ts`
Helper functions for common test operations:
- `renderWithProviders()` - Custom render with providers
- `mockOf<T>()` - Type assertion for mocks
- `mockAsyncResolved<T>()` - Create async mock with resolved value
- `mockAsyncRejected()` - Create async mock with rejected error
- `waitForAsync()` - Wait for async operations
- `createMockEvent()` - Create mock event object
- `clickByText()` - Click button by text
- `typeByPlaceholder()` - Type in input by placeholder
- `assertVisible()` - Assert element is visible
- `assertHidden()` - Assert element is hidden
- `assertNotExists()` - Assert element not in document
- `getTextContent()` - Get text content safely
- `assertTextContent()` - Assert text content matches
- `mockToast()` - Setup toast mock

### `mocks.ts`
Centralized mock setup for common dependencies:
- `mockReactToastify()` - Mock react-toastify
- `mockNextImage()` - Mock next/image
- `mockNextLink()` - Mock next/link
- `mockNextDynamic()` - Mock next/dynamic
- `mockEmailService()` - Mock EmailService
- `mockAuthService()` - Mock AuthService
- `setupCommonMocks()` - Setup all common mocks
- `cleanupCommonMocks()` - Cleanup all mocks

### `fixtures.ts`
Test data fixtures for consistent test data:
- `mockUsers` - Common user data
- `mockFormData` - Form data fixtures (contact, login, signup, blog)
- `mockServiceResults` - Service result fixtures
- `mockEmailResults` - Email service result fixtures
- `mockAuthResults` - Auth service result fixtures
- `mockErrors` - Error object fixtures
- `mockPagination` - Pagination fixtures
- `mockDataItems` - Data item fixtures for filter tests

### `customMatchers.ts`
Custom Jest matchers for common assertions:
- `toHaveAriaLabel()` - Check aria-label attribute
- `toHaveAriaLive()` - Check aria-live attribute
- `toHaveAriaBusy()` - Check aria-busy attribute
- `toBeDisabled()` - Check if element is disabled
- `toHaveRole()` - Check role attribute
- `toHaveClass()` - Check CSS classes
- `toBeLoading()` - Check loading state
- `toHaveValidationError()` - Check validation error

### `index.ts`
Central export point for all utilities.

## Usage

### Importing

Import utilities from the central index:

```typescript
import { renderWithProviders, mockToast, mockUsers } from '@/test-utils';
```

### Using Test Helpers

```typescript
import { renderWithProviders, typeByPlaceholder, clickByText } from '@/test-utils';

const { getByRole } = renderWithProviders(<MyComponent />);

// Type in input
await typeByPlaceholder('Enter text', 'test value');

// Click button
await clickByText('Submit');
```

### Using Mocks

```typescript
import { mockReactToastify, mockEmailService } from '@/test-utils';

const { toast } = mockReactToastify();
const { mockSendEmail } = mockEmailService();

// Use mocks in tests
mockSendEmail.mockResolvedValue({ success: true });
```

### Using Fixtures

```typescript
import { mockUsers, mockFormData } from '@/test-utils';

const user = mockUsers.validUser;
const formData = mockFormData.validContactForm;
```

### Using Custom Matchers

```typescript
// Matchers are automatically available after jest.setup.js imports customMatchers.ts

expect(button).toBeDisabled();
expect(input).toHaveAriaLabel('Search');
expect(text).toHaveValidationError('Required');
expect(container).toBeLoading();
```

## Setup

Custom matchers are automatically enabled via `jest.setup.js`:

```javascript
import '@testing-library/jest-dom';
import './src/test-utils/customMatchers';
```

## Benefits

1. **Reduced Boilerplate** - Common patterns extracted into reusable functions
2. **Type Safety** - Proper TypeScript types for all utilities
3. **Consistency** - Same test patterns across all test files
4. **Maintainability** - Changes in one place affect all tests
5. **Readability** - Clear, descriptive function names

## Examples

### Component Testing

```typescript
import { renderWithProviders, clickByText } from '@/test-utils';
import MyForm from '@/components/MyForm';

describe('MyForm', () => {
  it('should submit form on button click', async () => {
    renderWithProviders(<MyForm />);
    await clickByText('Submit');
    expect(mockSubmit).toHaveBeenCalled();
  });
});
```

### Service Testing

```typescript
import { mockAsyncResolved, mockAsyncRejected } from '@/test-utils';

describe('MyService', () => {
  it('should return success', async () => {
    const mock = mockAsyncResolved({ success: true });
    const result = await mock();
    expect(result.success).toBe(true);
  });
});
```

### Accessibility Testing

```typescript
expect(button).toHaveAriaLabel('Close modal');
expect(form).toHaveAriaLive('polite');
expect(submitButton).toBeDisabled();
```
