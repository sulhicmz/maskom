# Testing Guide

This document provides comprehensive guidance for testing in the Maskom codebase.

## Overview

The Maskom project uses **Jest** and **React Testing Library** for testing with over **870 tests** across **47 test files**. Test coverage includes components, hooks, utilities, services, and data validation.

### Test Statistics

- **Total Test Files**: 47
- **Total Tests**: 872+
- **Success Rate**: 100% (all tests passing)
- **Test Framework**: Jest 29.x with React Testing Library
- **Code Coverage**: See coverage reports after running `npm test -- --coverage`

## Quick Start

### Run All Tests

```bash
npm test
```

### Run Tests in Watch Mode

```bash
npm test -- --watch
```

### Run Tests with Coverage Report

```bash
npm test -- --coverage
```

### Run Specific Test File

```bash
npm test -- src/components/forms/LoginForm.test.tsx
```

### Run Tests Matching a Pattern

```bash
npm test -- --testNamePattern="should show"
```

## Testing Architecture

### Test Organization

Tests are organized to mirror the source code structure:

```
src/
├── components/          # Component tests (25+ test files)
│   ├── homes/          # Home page component tests
│   ├── pages/          # Page component tests
│   ├── forms/          # Form component tests
│   ├── common/         # Shared component tests
│   └── ...
├── hooks/              # Custom hook tests (2 test files)
├── layouts/            # Layout component tests (2 test files)
├── modals/            # Modal component tests (1 test file)
├── services/           # Service layer tests (2 test files)
└── utils/              # Utility function tests (7 test files)
```

### Test Categories

1. **Component Tests** (~35 files)
   - React component rendering and behavior
   - User interaction testing
   - State management verification
   - Accessibility testing

2. **Utility Tests** (~7 files)
   - Pure function testing
   - Data validation tests
   - Filter and transformation utilities

3. **Service Tests** (~2 files)
   - API integration tests
   - Mock implementations
   - Error handling verification

4. **Hook Tests** (~2 files)
   - Custom hook behavior
   - Effect testing
   - State transitions

## Writing Tests

### Test Pattern: AAA (Arrange-Act-Assert)

All tests should follow the AAA pattern for clarity:

```typescript
describe('ComponentName', () => {
    test('should do something when something happens', () => {
        // Arrange - Set up test conditions
        const mockProps = { title: 'Test' };
        render(<ComponentName {...mockProps} />);

        // Act - Perform the action being tested
        const button = screen.getByRole('button');
        fireEvent.click(button);

        // Assert - Verify expected outcome
        expect(screen.getByText('Expected Text')).toBeInTheDocument();
    });
});
```

### Component Testing Best Practices

#### 1. Test Behavior, Not Implementation

✅ **Good**:
```typescript
test('should show error when email is invalid', () => {
    render(<LoginForm />);
    const emailInput = screen.getByLabelText(/email/i);
    fireEvent.change(emailInput, { target: { value: 'invalid' } });
    fireEvent.submit(screen.getByRole('form'));
    expect(screen.getByText(/format email tidak valid/i)).toBeInTheDocument();
});
```

❌ **Bad**:
```typescript
test('should set error state to true', () => {
    // Tests internal implementation details
    const wrapper = mount(<LoginForm />);
    wrapper.setState({ emailError: true });
    expect(wrapper.state().emailError).toBe(true);
});
```

#### 2. Use Descriptive Test Names

```typescript
// ✅ Good: Describes scenario and expectation
test('should show loading state during submission', () => { });

// ❌ Bad: Generic description
test('form test 1', () => { });
```

#### 3. Mock External Dependencies

```typescript
// Mock next/image for tests
jest.mock('next/image', () => ({
    __esModule: true,
    default: (props) => <img {...props} />,
}));

// Mock next/dynamic for lazy-loaded components
jest.mock('next/dynamic', () => ({
    __esModule: true,
    default: (...args) => {
        const dynamicModule = jest.requireActual('next/dynamic');
        const dynamicActualComp = dynamicModule.default;
        const RequiredComponent = dynamicActualComp(args[0]);
        RequiredComponent.preload ? RequiredComponent.preload() : RequiredComponent.render.preload();
        return RequiredComponent;
    },
}));
```

### Testing Components with State

#### Example: LoginForm Testing

```typescript
describe('LoginForm', () => {
    beforeEach(() => {
        jest.clearAllMocks();
    });

    test('should render form fields correctly', () => {
        render(<LoginForm />);
        expect(screen.getByLabelText(/email/i)).toBeInTheDocument();
        expect(screen.getByLabelText(/kata sandi/i)).toBeInTheDocument();
    });

    test('should submit form with valid data', async () => {
        const mockLogin = jest.fn().mockResolvedValue({
            success: true,
            user: { id: '1', name: 'Test User', email: 'test@example.com' }
        });

        render(<LoginForm authService={{ login: mockLogin }} />);

        fireEvent.change(screen.getByLabelText(/email/i), { target: { value: 'test@example.com' } });
        fireEvent.change(screen.getByLabelText(/kata sandi/i), { target: { value: 'password123' } });
        fireEvent.submit(screen.getByRole('form'));

        await waitFor(() => {
            expect(mockLogin).toHaveBeenCalledWith({
                email: 'test@example.com',
                password: 'password123'
            });
        });
    });
});
```

### Testing Components with Dynamic Imports

For components using `next/dynamic` (e.g., lazy-loaded Swiper, VideoPopup):

```typescript
describe('LazyLoadedComponent', () => {
    test('should render loading state initially', () => {
        render(<LazyLoadedComponent />);
        expect(screen.getByText(/memuat/i)).toBeInTheDocument();
    });

    test('should render component after load', async () => {
        render(<LazyLoadedComponent />);
        await waitFor(() => {
            expect(screen.getByTestId('lazy-content')).toBeInTheDocument();
        });
    });
});
```

### Testing Services with Mock Implementations

#### Example: AuthService Testing

```typescript
import { authService } from '@/services/auth';

describe('AuthService', () => {
    beforeEach(() => {
        jest.clearAllMocks();
    });

    describe('login', () => {
        test('should authenticate user with valid credentials', async () => {
            const result = await authService.login({
                email: 'test@example.com',
                password: 'password123'
            });

            expect(result.success).toBe(true);
            expect(result.user).toBeDefined();
            expect(result.user?.email).toBe('test@example.com');
        });

        test('should reject invalid email format', async () => {
            const result = await authService.login({
                email: 'invalid-email',
                password: 'password123'
            });

            expect(result.success).toBe(false);
            expect(result.error).toContain('Format email tidak valid');
        });
    });
});
```

### Testing Data Validation

The project has comprehensive data validation utilities in `src/utils/dataValidation.ts`:

```typescript
import { validateFeedbackItem, checkDuplicateIds } from '@/utils/dataValidation';

describe('Data Validation', () => {
    test('should validate a valid feedback item', () => {
        const validItem = {
            id: 1,
            page: 'home_1',
            name: 'Test User',
            designation: 'Customer',
            desc: 'Great service',
            rating: '5'
        };

        const result = validateFeedbackItem(validItem);

        expect(result.isValid).toBe(true);
        expect(result.errors).toHaveLength(0);
    });

    test('should reject feedback with invalid rating', () => {
        const invalidItem = {
            id: 1,
            page: 'home_1',
            name: 'Test User',
            designation: 'Customer',
            desc: 'Great service',
            rating: '6' // Invalid: must be 0-5
        };

        const result = validateFeedbackItem(invalidItem);

        expect(result.isValid).toBe(false);
        expect(result.errors).toContain(
            'FeedbackItem[1]: rating must be a number between 0 and 5'
        );
    });

    test('should detect duplicate IDs', () => {
        const items = [
            { id: 1, page: 'home_1' },
            { id: 1, page: 'home_2' } // Duplicate ID
        ];

        const result = checkDuplicateIds(items, 'FeedbackData');

        expect(result.isValid).toBe(false);
        expect(result.errors).toContain(
            'FeedbackData: Duplicate id 1 found in pages: home_1, home_2'
        );
    });
});
```

### Testing Resilience Patterns

The project uses circuit breaker, timeout, and retry patterns for external services:

```typescript
import { CircuitBreaker } from '@/utils/resilience/circuitBreaker';
import { withRetry } from '@/utils/resilience/retry';

describe('Resilience Patterns', () => {
    describe('Circuit Breaker', () => {
        test('should open after failure threshold', async () => {
            const breaker = new CircuitBreaker({
                failureThreshold: 3,
                resetTimeoutMs: 1000
            });

            // Simulate failures
            for (let i = 0; i < 3; i++) {
                try {
                    await breaker.execute(() => { throw new Error('Test error'); });
                } catch (e) {
                    // Expected
                }
            }

            // Circuit should be open
            const state = breaker.getState();
            expect(state.isOpen).toBe(true);
        });
    });

    describe('Retry with Exponential Backoff', () => {
        test('should retry on retryable errors', async () => {
            let attempts = 0;
            const mockFn = jest.fn(() => {
                attempts++;
                if (attempts < 3) {
                    throw new Error('network error');
                }
                return 'success';
            });

            const result = await withRetry(mockFn, {
                maxAttempts: 3,
                baseDelayMs: 10,
                retryableErrors: [/network/i]
            });

            expect(result.success).toBe(true);
            expect(attempts).toBe(3);
        });
    });
});
```

### Testing Hooks

#### Example: UseSticky Hook Testing

```typescript
import { renderHook, act } from '@testing-library/react';
import { UseSticky } from '@/hooks/UseSticky';

describe('UseSticky', () => {
    beforeEach(() => {
        // Mock window object
        global.window = { ...window, pageYOffset: 0 };
    });

    test('should return false when scroll is below threshold', () => {
        const { result } = renderHook(() => UseSticky(200));
        expect(result.current.isSticky).toBe(false);
    });

    test('should return true when scroll exceeds threshold', () => {
        const { result } = renderHook(() => UseSticky(200));

        act(() => {
            global.window.pageYOffset = 250;
            window.dispatchEvent(new Event('scroll'));
        });

        expect(result.current.isSticky).toBe(true);
    });
});
```

## Test Coverage

### Current Coverage Areas

| Category | Test Files | Tests | Coverage |
|----------|-------------|--------|----------|
| Components | ~35 | ~700+ | High |
| Utilities | ~7 | ~100+ | 100% |
| Services | ~2 | ~40 | 100% |
| Hooks | ~2 | ~20 | 100% |
| **Total** | **47** | **872+** | **~90%** |

### High Priority Test Coverage

The following areas have comprehensive test coverage:

1. **Forms** (4 test files, 35+ tests)
   - LoginForm: 11 tests
   - SignUpForm: 9 tests
   - ContactForm: 8 tests
   - BlogForm: 8 tests

2. **Data Validation** (2 test files, 80+ tests)
   - dataValidation.test.ts: 64 tests
   - dataIntegrity.test.ts: 16 tests

3. **Resilience Patterns** (3 test files, 40+ tests)
   - circuitBreaker.test.ts: 15 tests
   - retry.test.ts: 12 tests
   - timeout.test.ts: 10 tests

4. **Error Handling** (1 test file, 25 tests)
   - ErrorBoundary.test.ts: 25 tests

## Running Tests for CI/CD

### CI/CD Configuration

The project uses Jest with configuration in `jest.config.mjs`:

```javascript
import nextJest from 'next/jest';

const createJestConfig = nextJest({
    dir: './',
});

const customJestConfig = {
    setupFilesAfterEnv: ['<rootDir>/jest.setup.js'],
    testEnvironment: 'jest-environment-jsdom',
    moduleNameMapper: {
        '^@/(.*)$': '<rootDir>/src/$1',
        '^@/assets/(.*)$': '<rootDir>/public/assets/$1',
    },
    collectCoverageFrom: [
        'src/**/*.{js,jsx,ts,tsx}',
        '!src/**/*.test.{js,jsx,ts,tsx}',
        '!src/**/*.stories.{js,jsx,ts,tsx}',
        '!src/types/**',
    ],
};

export default createJestConfig(customJestConfig);
```

### Pre-commit Hooks

Tests are run before commits. To skip pre-commit tests (not recommended):

```bash
git commit --no-verify
```

## Debugging Tests

### Interactive Test Debugging

```bash
# Run tests in watch mode with verbose output
npm test -- --watch --verbose

# Run specific test in debug mode
npm test -- --testNamePattern="specific test name" --verbose
```

### Common Test Issues

#### 1. "act" Warnings

If you see warnings about updates not wrapped in `act()`:

```typescript
import { act } from '@testing-library/react';

test('async operation', async () => {
    render(<Component />);
    await act(async () => {
        await someAsyncAction();
    });
    expect(/* assertion */);
});
```

#### 2. Dynamic Import Warnings

For lazy-loaded components using `next/dynamic`:

```typescript
jest.mock('next/dynamic', () => ({
    __esModule: true,
    default: (...args) => {
        const dynamicModule = jest.requireActual('next/dynamic');
        const dynamicActualComp = dynamicModule.default;
        const RequiredComponent = dynamicActualComp(args[0]);
        RequiredComponent.preload ? RequiredComponent.preload() : RequiredComponent.render.preload();
        return RequiredComponent;
    },
}));
```

#### 3. Time-related Tests

Use Jest's fake timers:

```typescript
beforeEach(() => {
    jest.useFakeTimers();
});

afterEach(() => {
    jest.useRealTimers();
});

test('should debounce input', () => {
    const mockFn = jest.fn();
    const { result } = renderHook(() => useDebounce(mockFn, 500));

    act(() => {
        result.current('value1');
        result.current('value2');
        jest.advanceTimersByTime(500);
    });

    expect(mockFn).toHaveBeenCalledTimes(1);
});
```

## Testing Standards

### Naming Conventions

- **Test Files**: `ComponentName.test.tsx` or `utilityName.test.ts`
- **Test Descriptions**: "should [verb] [noun] when [condition]"
- **Describe Blocks**: Component/Function name or feature being tested

### Test Organization

```typescript
describe('ComponentName', () => {
    beforeEach(() => {
        // Reset mocks, setup common state
    });

    afterEach(() => {
        // Cleanup
    });

    describe('Rendering', () => {
        test('should render correctly', () => { });
    });

    describe('User Interactions', () => {
        test('should handle click', () => { });
    });

    describe('Edge Cases', () => {
        test('should handle empty props', () => { });
    });
});
```

### Assertion Best Practices

- Use `screen` queries from `@testing-library/react`
- Prefer user-centric queries (`getByRole`, `getByLabelText`) over `getByTestId`
- Test the component's public API, not internal state
- One assertion per test when possible

## Resources

### Documentation

- [Jest Documentation](https://jestjs.io/)
- [React Testing Library](https://testing-library.com/docs/react-testing-library/intro/)
- [Next.js Testing](https://nextjs.org/docs/testing)

### Related Project Documentation

- `docs/blueprint.md` - Architecture overview
- `docs/task.md` - Task tracking and completed work
- `docs/api.md` - API documentation for services

## Adding New Tests

### Test Template

```typescript
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom';

describe('ComponentName', () => {
    beforeEach(() => {
        jest.clearAllMocks();
    });

    describe('FeatureName', () => {
        test('should do something when something happens', () => {
            // Arrange
            render(<ComponentName />);

            // Act
            fireEvent.click(screen.getByRole('button'));

            // Assert
            expect(/* outcome */).toBeInTheDocument();
        });
    });
});
```

### Test Checklist

Before submitting new code with tests:

- [ ] Tests follow AAA pattern (Arrange-Act-Assert)
- [ ] Test names are descriptive (should...when...)
- [ ] External dependencies are mocked
- [ ] Tests verify behavior, not implementation
- [ ] Edge cases are covered (null, undefined, empty)
- [ ] Tests are independent (no shared state between tests)
- [ ] All tests pass (100% success rate)
- [ ] Coverage does not decrease

## Test Maintenance

### Updating Tests for Code Changes

1. **Breaking Changes**: Update affected tests
2. **New Features**: Add tests for new functionality
3. **Bug Fixes**: Add regression tests
4. **Refactoring**: Ensure tests still pass without modification

### Test Flakiness

If tests are flaky (intermittently fail):

1. Check for race conditions in async tests
2. Ensure proper cleanup in `afterEach`
3. Use `waitFor` for async operations
4. Mock time-dependent operations
5. Verify test isolation (no shared state)

## Summary

The Maskom project has a robust testing foundation with:

- **872+ tests** across **47 test files**
- **100% test success rate**
- Comprehensive coverage for components, utilities, services, and hooks
- Clear testing patterns and standards
- Well-documented testing approach

When adding new features, always include tests to maintain code quality and prevent regressions.
