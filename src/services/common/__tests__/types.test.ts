import {
    ServiceResult,
    ServiceErrorCode,
    ServiceException,
    ServiceTimeoutError,
    ServiceRateLimitError,
    ServiceValidationError,
    ServiceCircuitBreakerError,
    ServiceCredentialsError,
    ServiceNetworkError,
    isServiceException,
    createSuccessResult,
    createErrorResult,
    mapToServiceResult,
} from '..';

describe('Service Types', () => {
    describe('ServiceResult', () => {
        it('creates success result with data', () => {
            const result: ServiceResult<{ id: number }> = {
                success: true,
                message: 'Success',
                data: { id: 123 },
            };

            expect(result.success).toBe(true);
            expect(result.message).toBe('Success');
            expect(result.data).toEqual({ id: 123 });
        });

        it('creates error result', () => {
            const result: ServiceResult = {
                success: false,
                error: 'Something went wrong',
                errorCode: ServiceErrorCode.UNKNOWN,
            };

            expect(result.success).toBe(false);
            expect(result.error).toBe('Something went wrong');
            expect(result.errorCode).toBe(ServiceErrorCode.UNKNOWN);
        });

        it('allows optional fields', () => {
            const result: ServiceResult = {
                success: false,
                error: 'Error',
            };

            expect(result.success).toBe(false);
            expect(result.error).toBe('Error');
            expect(result.message).toBeUndefined();
            expect(result.errorCode).toBeUndefined();
        });
    });

    describe('ServiceException', () => {
        it('creates base exception', () => {
            const error = new ServiceException(
                ServiceErrorCode.UNKNOWN,
                'Unknown error occurred',
                { detail: 'some detail' },
                false,
                false
            );

            expect(error.code).toBe(ServiceErrorCode.UNKNOWN);
            expect(error.message).toBe('Unknown error occurred');
            expect(error.details).toEqual({ detail: 'some detail' });
            expect(error.isRetryable).toBe(false);
            expect(error.isTimeout).toBe(false);
            expect(error.name).toBe('ServiceException');
        });

        it('converts to JSON', () => {
            const error = new ServiceException(
                ServiceErrorCode.UNKNOWN,
                'Unknown error',
                { detail: 'test' }
            );

            const json = error.toJSON();

            expect(json).toEqual({
                code: 'UNKNOWN_ERROR',
                message: 'Unknown error',
                details: { detail: 'test' },
                isRetryable: false,
                isTimeout: false,
            });
        });

        it('isServiceException returns true for ServiceException', () => {
            const error = new ServiceException(
                ServiceErrorCode.UNKNOWN,
                'Test error'
            );

            expect(isServiceException(error)).toBe(true);
        });

        it('isServiceException returns false for regular Error', () => {
            const error = new Error('Regular error');

            expect(isServiceException(error)).toBe(false);
        });

        it('isServiceException returns false for non-Error', () => {
            const error = 'string error';

            expect(isServiceException(error)).toBe(false);
        });
    });

    describe('Specific Service Exceptions', () => {
        it('creates ServiceTimeoutError', () => {
            const error = new ServiceTimeoutError('Request timed out');

            expect(error.code).toBe(ServiceErrorCode.TIMEOUT);
            expect(error.message).toBe('Request timed out');
            expect(error.isRetryable).toBe(true);
            expect(error.isTimeout).toBe(true);
            expect(error.name).toBe('ServiceTimeoutError');
        });

        it('creates ServiceRateLimitError', () => {
            const error = new ServiceRateLimitError('Too many requests');

            expect(error.code).toBe(ServiceErrorCode.RATE_LIMIT);
            expect(error.message).toBe('Too many requests');
            expect(error.isRetryable).toBe(false);
            expect(error.isTimeout).toBe(false);
            expect(error.name).toBe('ServiceRateLimitError');
        });

        it('creates ServiceValidationError', () => {
            const error = new ServiceValidationError('Invalid input');

            expect(error.code).toBe(ServiceErrorCode.VALIDATION);
            expect(error.message).toBe('Invalid input');
            expect(error.isRetryable).toBe(false);
            expect(error.isTimeout).toBe(false);
            expect(error.name).toBe('ServiceValidationError');
        });

        it('creates ServiceCircuitBreakerError', () => {
            const error = new ServiceCircuitBreakerError('Circuit breaker open');

            expect(error.code).toBe(ServiceErrorCode.CIRCUIT_BREAKER);
            expect(error.message).toBe('Circuit breaker open');
            expect(error.isRetryable).toBe(false);
            expect(error.isTimeout).toBe(false);
            expect(error.name).toBe('ServiceCircuitBreakerError');
        });

        it('creates ServiceCredentialsError', () => {
            const error = new ServiceCredentialsError('Credentials missing');

            expect(error.code).toBe(ServiceErrorCode.CREDENTIALS_MISSING);
            expect(error.message).toBe('Credentials missing');
            expect(error.isRetryable).toBe(false);
            expect(error.isTimeout).toBe(false);
            expect(error.name).toBe('ServiceCredentialsError');
        });

        it('creates ServiceNetworkError', () => {
            const error = new ServiceNetworkError('Network error');

            expect(error.code).toBe(ServiceErrorCode.NETWORK);
            expect(error.message).toBe('Network error');
            expect(error.isRetryable).toBe(true);
            expect(error.isTimeout).toBe(false);
            expect(error.name).toBe('ServiceNetworkError');
        });
    });

    describe('createSuccessResult', () => {
        it('creates success result with message', () => {
            const result = createSuccessResult('Operation successful');

            expect(result).toEqual({
                success: true,
                message: 'Operation successful',
            });
        });

        it('creates success result with data', () => {
            const data = { id: 123, name: 'Test' };
            const result = createSuccessResult('Operation successful', data);

            expect(result.success).toBe(true);
            expect(result.message).toBe('Operation successful');
            expect(result.data).toEqual(data);
        });

        it('creates success result with metadata', () => {
            const metadata = { requestId: 'abc123' };
            const result = createSuccessResult('Operation successful', undefined, metadata);

            expect(result.success).toBe(true);
            expect(result.message).toBe('Operation successful');
            expect(result.metadata).toEqual(metadata);
        });
    });

    describe('createErrorResult', () => {
        it('creates error result from string', () => {
            const result = createErrorResult('Something went wrong');

            expect(result.success).toBe(false);
            expect(result.error).toBe('Something went wrong');
            expect(result.errorCode).toBe(ServiceErrorCode.UNKNOWN);
        });

        it('creates error result from ServiceException', () => {
            const error = new ServiceValidationError('Invalid email');
            const result = createErrorResult(error);

            expect(result.success).toBe(false);
            expect(result.error).toBe('Invalid email');
            expect(result.errorCode).toBe(ServiceErrorCode.VALIDATION);
            expect(result.metadata).toEqual({
                isRetryable: false,
                isTimeout: false,
            });
        });

        it('creates error result with custom error code', () => {
            const result = createErrorResult(
                'Custom error',
                ServiceErrorCode.NETWORK
            );

            expect(result.success).toBe(false);
            expect(result.error).toBe('Custom error');
            expect(result.errorCode).toBe(ServiceErrorCode.NETWORK);
        });

        it('creates error result with metadata', () => {
            const result = createErrorResult(
                'Error occurred',
                undefined,
                { retryAfter: 60 }
            );

            expect(result.success).toBe(false);
            expect(result.error).toBe('Error occurred');
            expect(result.metadata).toEqual({ retryAfter: 60 });
        });
    });

    describe('mapToServiceResult', () => {
        it('maps successful result', () => {
            const result = mapToServiceResult(
                true,
                'Success message',
                'Error message',
                { id: 123 },
                ServiceErrorCode.NETWORK
            );

            expect(result).toEqual({
                success: true,
                message: 'Success message',
                data: { id: 123 },
            });
        });

        it('maps error result', () => {
            const result = mapToServiceResult(
                false,
                'Success message',
                'Error message',
                undefined,
                ServiceErrorCode.VALIDATION
            );

            expect(result).toEqual({
                success: false,
                error: 'Error message',
                errorCode: ServiceErrorCode.VALIDATION,
            });
        });
    });
});
