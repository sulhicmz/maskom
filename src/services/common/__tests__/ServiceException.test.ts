import { ServiceErrorCode } from '../types';
import {
    ServiceException,
    ServiceTimeoutError,
    ServiceRateLimitError,
    ServiceValidationError,
    ServiceCircuitBreakerError,
    ServiceCredentialsError,
    ServiceNetworkError,
    isServiceException
} from '../ServiceException';

describe('ServiceException', () => {
    describe('constructor', () => {
        it('should create exception with all properties', () => {
            const error = new ServiceException(
                ServiceErrorCode.VALIDATION,
                'Validation failed',
                { field: 'email' },
                true,
                true
            );

            expect(error.code).toBe(ServiceErrorCode.VALIDATION);
            expect(error.message).toBe('Validation failed');
            expect(error.details).toEqual({ field: 'email' });
            expect(error.isRetryable).toBe(true);
            expect(error.isTimeout).toBe(true);
            expect(error.name).toBe('ServiceException');
        });

        it('should create exception with minimal properties', () => {
            const error = new ServiceException(
                ServiceErrorCode.UNKNOWN,
                'Unknown error'
            );

            expect(error.code).toBe(ServiceErrorCode.UNKNOWN);
            expect(error.message).toBe('Unknown error');
            expect(error.details).toBeUndefined();
            expect(error.isRetryable).toBe(false);
            expect(error.isTimeout).toBe(false);
        });

        it('should extend Error class', () => {
            const error = new ServiceException(ServiceErrorCode.UNKNOWN, 'Test error');

            expect(error instanceof Error).toBe(true);
            expect(error instanceof ServiceException).toBe(true);
        });

        it('should have correct error name', () => {
            const error = new ServiceException(ServiceErrorCode.UNKNOWN, 'Test error');

            expect(error.name).toBe('ServiceException');
        });
    });

    describe('toJSON', () => {
        it('should serialize exception to JSON', () => {
            const error = new ServiceException(
                ServiceErrorCode.VALIDATION,
                'Validation failed',
                { field: 'email' },
                true,
                true
            );

            const json = error.toJSON();

            expect(json).toEqual({
                code: ServiceErrorCode.VALIDATION,
                message: 'Validation failed',
                details: { field: 'email' },
                isRetryable: true,
                isTimeout: true
            });
        });

        it('should serialize without details when undefined', () => {
            const error = new ServiceException(
                ServiceErrorCode.UNKNOWN,
                'Unknown error'
            );

            const json = error.toJSON();

            expect(json).toEqual({
                code: ServiceErrorCode.UNKNOWN,
                message: 'Unknown error',
                details: undefined,
                isRetryable: false,
                isTimeout: false
            });
        });

        it('should return plain object', () => {
            const error = new ServiceException(ServiceErrorCode.UNKNOWN, 'Test');
            const json = error.toJSON();

            expect(typeof json).toBe('object');
            expect(json).not.toBeInstanceOf(ServiceException);
        });
    });

    describe('isServiceException type guard', () => {
        it('should return true for ServiceException instance', () => {
            const error = new ServiceException(ServiceErrorCode.UNKNOWN, 'Test');

            expect(isServiceException(error)).toBe(true);
        });

        it('should return true for ServiceTimeoutError instance', () => {
            const error = new ServiceTimeoutError('Timeout');

            expect(isServiceException(error)).toBe(true);
        });

        it('should return true for ServiceRateLimitError instance', () => {
            const error = new ServiceRateLimitError('Rate limited');

            expect(isServiceException(error)).toBe(true);
        });

        it('should return true for ServiceValidationError instance', () => {
            const error = new ServiceValidationError('Invalid');

            expect(isServiceException(error)).toBe(true);
        });

        it('should return true for ServiceCircuitBreakerError instance', () => {
            const error = new ServiceCircuitBreakerError('Circuit open');

            expect(isServiceException(error)).toBe(true);
        });

        it('should return true for ServiceCredentialsError instance', () => {
            const error = new ServiceCredentialsError('Missing credentials');

            expect(isServiceException(error)).toBe(true);
        });

        it('should return true for ServiceNetworkError instance', () => {
            const error = new ServiceNetworkError('Network error');

            expect(isServiceException(error)).toBe(true);
        });

        it('should return false for regular Error', () => {
            const error = new Error('Regular error');

            expect(isServiceException(error)).toBe(false);
        });

        it('should return false for null', () => {
            expect(isServiceException(null)).toBe(false);
        });

        it('should return false for undefined', () => {
            expect(isServiceException(undefined)).toBe(false);
        });

        it('should return false for string', () => {
            expect(isServiceException('string error')).toBe(false);
        });

        it('should return false for object', () => {
            expect(isServiceException({ code: 'TEST', message: 'error' })).toBe(false);
        });

        it('should narrow type correctly', () => {
            const error: unknown = new ServiceTimeoutError('Test');

            if (isServiceException(error)) {
                expect(error.code).toBeDefined();
                expect(error.isRetryable).toBeDefined();
                expect(error.isTimeout).toBeDefined();
            } else {
                fail('Type guard should narrow to ServiceException');
            }
        });
    });
});

describe('ServiceTimeoutError', () => {
    it('should create timeout error with correct properties', () => {
        const error = new ServiceTimeoutError('Request timed out', { url: '/api/test' });

        expect(error.name).toBe('ServiceTimeoutError');
        expect(error.message).toBe('Request timed out');
        expect(error.code).toBe(ServiceErrorCode.TIMEOUT);
        expect(error.details).toEqual({ url: '/api/test' });
        expect(error.isRetryable).toBe(true);
        expect(error.isTimeout).toBe(true);
    });

    it('should be instance of ServiceException', () => {
        const error = new ServiceTimeoutError('Timeout');

        expect(error instanceof ServiceException).toBe(true);
        expect(error instanceof Error).toBe(true);
    });

    it('should create without details', () => {
        const error = new ServiceTimeoutError('Timeout');

        expect(error.details).toBeUndefined();
    });
});

describe('ServiceRateLimitError', () => {
    it('should create rate limit error with correct properties', () => {
        const error = new ServiceRateLimitError('Too many requests', { limit: 100 });

        expect(error.name).toBe('ServiceRateLimitError');
        expect(error.message).toBe('Too many requests');
        expect(error.code).toBe(ServiceErrorCode.RATE_LIMIT);
        expect(error.details).toEqual({ limit: 100 });
        expect(error.isRetryable).toBe(false);
        expect(error.isTimeout).toBe(false);
    });

    it('should be instance of ServiceException', () => {
        const error = new ServiceRateLimitError('Rate limited');

        expect(error instanceof ServiceException).toBe(true);
        expect(error instanceof Error).toBe(true);
    });
});

describe('ServiceValidationError', () => {
    it('should create validation error with correct properties', () => {
        const error = new ServiceValidationError('Invalid input', { field: 'email' });

        expect(error.name).toBe('ServiceValidationError');
        expect(error.message).toBe('Invalid input');
        expect(error.code).toBe(ServiceErrorCode.VALIDATION);
        expect(error.details).toEqual({ field: 'email' });
        expect(error.isRetryable).toBe(false);
        expect(error.isTimeout).toBe(false);
    });

    it('should be instance of ServiceException', () => {
        const error = new ServiceValidationError('Invalid');

        expect(error instanceof ServiceException).toBe(true);
        expect(error instanceof Error).toBe(true);
    });
});

describe('ServiceCircuitBreakerError', () => {
    it('should create circuit breaker error with correct properties', () => {
        const error = new ServiceCircuitBreakerError('Circuit breaker open', { attempts: 5 });

        expect(error.name).toBe('ServiceCircuitBreakerError');
        expect(error.message).toBe('Circuit breaker open');
        expect(error.code).toBe(ServiceErrorCode.CIRCUIT_BREAKER);
        expect(error.details).toEqual({ attempts: 5 });
        expect(error.isRetryable).toBe(false);
        expect(error.isTimeout).toBe(false);
    });

    it('should be instance of ServiceException', () => {
        const error = new ServiceCircuitBreakerError('Circuit open');

        expect(error instanceof ServiceException).toBe(true);
        expect(error instanceof Error).toBe(true);
    });
});

describe('ServiceCredentialsError', () => {
    it('should create credentials error with correct properties', () => {
        const error = new ServiceCredentialsError('Missing API key', { key: 'EMAILJS_PUBLIC' });

        expect(error.name).toBe('ServiceCredentialsError');
        expect(error.message).toBe('Missing API key');
        expect(error.code).toBe(ServiceErrorCode.CREDENTIALS_MISSING);
        expect(error.details).toEqual({ key: 'EMAILJS_PUBLIC' });
        expect(error.isRetryable).toBe(false);
        expect(error.isTimeout).toBe(false);
    });

    it('should be instance of ServiceException', () => {
        const error = new ServiceCredentialsError('Missing credentials');

        expect(error instanceof ServiceException).toBe(true);
        expect(error instanceof Error).toBe(true);
    });
});

describe('ServiceNetworkError', () => {
    it('should create network error with correct properties', () => {
        const error = new ServiceNetworkError('Network unreachable', { url: '/api/send' });

        expect(error.name).toBe('ServiceNetworkError');
        expect(error.message).toBe('Network unreachable');
        expect(error.code).toBe(ServiceErrorCode.NETWORK);
        expect(error.details).toEqual({ url: '/api/send' });
        expect(error.isRetryable).toBe(true);
        expect(error.isTimeout).toBe(false);
    });

    it('should be instance of ServiceException', () => {
        const error = new ServiceNetworkError('Network error');

        expect(error instanceof ServiceException).toBe(true);
        expect(error instanceof Error).toBe(true);
    });
});

describe('Exception type safety', () => {
        it('should have correct type for code property', () => {
        const error = new ServiceException(ServiceErrorCode.VALIDATION, 'Test');

        expect(typeof error.code).toBe('string');
        expect(['VALIDATION_ERROR', 'TIMEOUT', 'RATE_LIMIT_EXCEEDED', 'CIRCUIT_BREAKER_OPEN', 'CREDENTIALS_MISSING', 'NETWORK_ERROR', 'UNKNOWN_ERROR']).toContain(error.code);
    });

    it('should have correct type for isRetryable property', () => {
        const error = new ServiceException(ServiceErrorCode.NETWORK, 'Test', undefined, true, false);

        expect(typeof error.isRetryable).toBe('boolean');
        expect(error.isRetryable).toBe(true);
    });

    it('should have correct type for isTimeout property', () => {
        const error = new ServiceException(ServiceErrorCode.TIMEOUT, 'Test', undefined, false, true);

        expect(typeof error.isTimeout).toBe('boolean');
        expect(error.isTimeout).toBe(true);
    });

    it('should have correct type for details property', () => {
        const error = new ServiceException(ServiceErrorCode.UNKNOWN, 'Test', { data: 'test' });

        expect(typeof error.details).toBe('object');
    });

    it('should allow undefined details', () => {
        const error = new ServiceException(ServiceErrorCode.UNKNOWN, 'Test');

        expect(error.details).toBeUndefined();
    });
});

describe('Exception message propagation', () => {
    it('should preserve message from constructor', () => {
        const message = 'Custom error message';
        const error = new ServiceException(ServiceErrorCode.UNKNOWN, message);

        expect(error.message).toBe(message);
    });

    it('should propagate message to Error stack', () => {
        const message = 'Test error message';
        const error = new ServiceException(ServiceErrorCode.UNKNOWN, message);

        expect(error.stack).toBeDefined();
        expect(error.stack).toContain(message);
    });
});

describe('Exception details handling', () => {
    it('should store primitive details', () => {
        const error = new ServiceException(ServiceErrorCode.UNKNOWN, 'Test', 42);

        expect(error.details).toBe(42);
    });

    it('should store object details', () => {
        const details = { field: 'email', value: 'invalid' };
        const error = new ServiceException(ServiceErrorCode.VALIDATION, 'Test', details);

        expect(error.details).toEqual(details);
    });

    it('should store array details', () => {
        const details = ['error1', 'error2'];
        const error = new ServiceException(ServiceErrorCode.VALIDATION, 'Test', details);

        expect(error.details).toEqual(details);
    });

    it('should store null details', () => {
        const error = new ServiceException(ServiceErrorCode.UNKNOWN, 'Test', null);

        expect(error.details).toBe(null);
    });
});
