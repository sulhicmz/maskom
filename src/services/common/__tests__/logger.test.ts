import { ServiceErrorCode } from '../types';
import {
    logServiceError,
    logServiceSuccess,
    logServiceWarning,
    type LoggerOptions
} from '../logger';
import { ServiceTimeoutError, ServiceNetworkError, ServiceRateLimitError } from '../ServiceException';

describe('logger', () => {
    let consoleErrorSpy: jest.SpyInstance;
    let consoleLogSpy: jest.SpyInstance;
    let consoleWarnSpy: jest.SpyInstance;

    beforeEach(() => {
        consoleErrorSpy = jest.spyOn(console, 'error').mockImplementation(() => {});
        consoleLogSpy = jest.spyOn(console, 'log').mockImplementation(() => {});
        consoleWarnSpy = jest.spyOn(console, 'warn').mockImplementation(() => {});
    });

    afterEach(() => {
        consoleErrorSpy.mockRestore();
        consoleLogSpy.mockRestore();
        consoleWarnSpy.mockRestore();
    });

    describe('logServiceError', () => {
        const baseOptions: LoggerOptions = {
            service: 'EmailService',
            operation: 'sendEmail'
        };

        it('should log ServiceException with all properties', () => {
            const error = new ServiceTimeoutError('Request timed out', { url: '/api/send' });
            const options: LoggerOptions = { ...baseOptions, includeDetails: true };

            logServiceError(error, options);

            expect(consoleErrorSpy).toHaveBeenCalledTimes(1);
            expect(consoleErrorSpy).toHaveBeenCalledWith(
                '[EmailService] sendEmail failed:',
                expect.objectContaining({
                    code: ServiceErrorCode.TIMEOUT,
                    message: 'Request timed out',
                    isRetryable: true,
                    isTimeout: true,
                    details: { url: '/api/send' }
                })
            );
        });

        it('should log ServiceException without details by default', () => {
            const error = new ServiceTimeoutError('Request timed out', { url: '/api/send' });

            logServiceError(error, baseOptions);

            expect(consoleErrorSpy).toHaveBeenCalledTimes(1);
            expect(consoleErrorSpy).toHaveBeenCalledWith(
                '[EmailService] sendEmail failed:',
                expect.objectContaining({
                    code: ServiceErrorCode.TIMEOUT,
                    message: 'Request timed out',
                    isRetryable: true,
                    isTimeout: true
                })
            );

            const loggedObject = consoleErrorSpy.mock.calls[0][1] as Record<string, unknown>;
            expect(loggedObject.details).toBeUndefined();
        });

        it('should log different ServiceException types', () => {
            const errors = [
                new ServiceTimeoutError('Timeout'),
                new ServiceNetworkError('Network error'),
                new ServiceRateLimitError('Rate limited')
            ];

            errors.forEach(error => {
                logServiceError(error, baseOptions);
            });

            expect(consoleErrorSpy).toHaveBeenCalledTimes(3);
        });

        it('should log regular Error instance', () => {
            const error = new Error('Regular error message');

            logServiceError(error, baseOptions);

            expect(consoleErrorSpy).toHaveBeenCalledTimes(1);
            expect(consoleErrorSpy).toHaveBeenCalledWith(
                '[EmailService] sendEmail failed:',
                expect.objectContaining({
                    message: 'Regular error message',
                    code: ServiceErrorCode.UNKNOWN
                })
            );
        });

        it('should log unknown error type', () => {
            const error = 'string error';

            logServiceError(error, baseOptions);

            expect(consoleErrorSpy).toHaveBeenCalledTimes(1);
            expect(consoleErrorSpy).toHaveBeenCalledWith(
                '[EmailService] sendEmail failed with unknown error:',
                expect.objectContaining({
                    error: 'string error',
                    code: ServiceErrorCode.UNKNOWN
                })
            );
        });

        it('should log null error', () => {
            logServiceError(null, baseOptions);

            expect(consoleErrorSpy).toHaveBeenCalledTimes(1);
            expect(consoleErrorSpy).toHaveBeenCalledWith(
                '[EmailService] sendEmail failed with unknown error:',
                expect.objectContaining({
                    error: 'null',
                    code: ServiceErrorCode.UNKNOWN
                })
            );
        });

        it('should log undefined error', () => {
            logServiceError(undefined, baseOptions);

            expect(consoleErrorSpy).toHaveBeenCalledTimes(1);
            expect(consoleErrorSpy).toHaveBeenCalledWith(
                '[EmailService] sendEmail failed with unknown error:',
                expect.objectContaining({
                    error: 'undefined',
                    code: ServiceErrorCode.UNKNOWN
                })
            );
        });

        it('should log number error', () => {
            logServiceError(404, baseOptions);

            expect(consoleErrorSpy).toHaveBeenCalledTimes(1);
            expect(consoleErrorSpy).toHaveBeenCalledWith(
                '[EmailService] sendEmail failed with unknown error:',
                expect.objectContaining({
                    error: '404',
                    code: ServiceErrorCode.UNKNOWN
                })
            );
        });

        it('should log object error', () => {
            const error = { customError: 'custom message', code: 500 };

            logServiceError(error, baseOptions);

            expect(consoleErrorSpy).toHaveBeenCalledTimes(1);
            expect(consoleErrorSpy).toHaveBeenCalledWith(
                '[EmailService] sendEmail failed with unknown error:',
                expect.objectContaining({
                    error: '[object Object]',
                    code: ServiceErrorCode.UNKNOWN
                })
            );
        });

        it('should format service and operation in message', () => {
            const error = new Error('Test');
            const options: LoggerOptions = {
                service: 'AuthService',
                operation: 'login'
            };

            logServiceError(error, options);

            expect(consoleErrorSpy).toHaveBeenCalledWith(
                '[AuthService] login failed:',
                expect.any(Object)
            );
        });
    });

    describe('logServiceSuccess', () => {
        const service = 'EmailService';
        const operation = 'sendEmail';

        it('should log success message without duration', () => {
            logServiceSuccess(service, operation);

            expect(consoleLogSpy).toHaveBeenCalledTimes(1);
            expect(consoleLogSpy).toHaveBeenCalledWith('[EmailService] sendEmail completed successfully');
        });

        it('should log success message with duration', () => {
            logServiceSuccess(service, operation, 150);

            expect(consoleLogSpy).toHaveBeenCalledTimes(1);
            expect(consoleLogSpy).toHaveBeenCalledWith('[EmailService] sendEmail completed in 150ms');
        });

        it('should log success message with zero duration (treated as falsy)', () => {
            logServiceSuccess(service, operation, 0);

            expect(consoleLogSpy).toHaveBeenCalledTimes(1);
            expect(consoleLogSpy).toHaveBeenCalledWith('[EmailService] sendEmail completed successfully');
        });

        it('should log success message with decimal duration', () => {
            logServiceSuccess(service, operation, 123.456);

            expect(consoleLogSpy).toHaveBeenCalledTimes(1);
            expect(consoleLogSpy).toHaveBeenCalledWith('[EmailService] sendEmail completed in 123.456ms');
        });

        it('should format different service and operation names', () => {
            logServiceSuccess('AuthService', 'login', 50);

            expect(consoleLogSpy).toHaveBeenCalledWith('[AuthService] login completed in 50ms');
        });

        it('should handle undefined duration parameter', () => {
            logServiceSuccess(service, operation, undefined);

            expect(consoleLogSpy).toHaveBeenCalledWith('[EmailService] sendEmail completed successfully');
        });
    });

    describe('logServiceWarning', () => {
        it('should log warning message', () => {
            logServiceWarning('EmailService', 'sendEmail', 'Rate limit approaching');

            expect(consoleWarnSpy).toHaveBeenCalledTimes(1);
            expect(consoleWarnSpy).toHaveBeenCalledWith(
                '[EmailService] sendEmail warning:',
                'Rate limit approaching'
            );
        });

        it('should log warning with empty message', () => {
            logServiceWarning('EmailService', 'sendEmail', '');

            expect(consoleWarnSpy).toHaveBeenCalledTimes(1);
            expect(consoleWarnSpy).toHaveBeenCalledWith(
                '[EmailService] sendEmail warning:',
                ''
            );
        });

        it('should log warning with complex message', () => {
            const message = 'Retrying in 5 seconds... (attempt 2/3)';
            logServiceWarning('AuthService', 'login', message);

            expect(consoleWarnSpy).toHaveBeenCalledWith(
                '[AuthService] login warning:',
                message
            );
        });

        it('should format different service and operation names', () => {
            logServiceWarning('AuthService', 'register', 'Verification email sent');

            expect(consoleWarnSpy).toHaveBeenCalledWith(
                '[AuthService] register warning:',
                'Verification email sent'
            );
        });

        it('should handle multi-line warning messages', () => {
            const message = 'Line 1\nLine 2\nLine 3';
            logServiceWarning('EmailService', 'sendEmail', message);

            expect(consoleWarnSpy).toHaveBeenCalledWith(
                '[EmailService] sendEmail warning:',
                message
            );
        });
    });

    describe('LoggerOptions type safety', () => {
        it('should accept minimal options', () => {
            const options: LoggerOptions = {
                service: 'TestService',
                operation: 'testOperation'
            };

            expect(() => logServiceError(new Error('test'), options)).not.toThrow();
        });

        it('should accept options with includeDetails', () => {
            const options: LoggerOptions = {
                service: 'TestService',
                operation: 'testOperation',
                includeDetails: true
            };

            const error = new ServiceTimeoutError('Test', { detail: 'value' });
            expect(() => logServiceError(error, options)).not.toThrow();
        });

        it('should handle includeDetails false explicitly', () => {
            const options: LoggerOptions = {
                service: 'TestService',
                operation: 'testOperation',
                includeDetails: false
            };

            const error = new ServiceTimeoutError('Test', { detail: 'value' });
            expect(() => logServiceError(error, options)).not.toThrow();
        });
    });

    describe('Logger behavior edge cases', () => {
        it('should handle service name with special characters', () => {
            const error = new Error('Test');
            const options: LoggerOptions = {
                service: 'My-Service_v2',
                operation: 'test-op'
            };

            expect(() => logServiceError(error, options)).not.toThrow();
            expect(consoleErrorSpy).toHaveBeenCalledWith(
                '[My-Service_v2] test-op failed:',
                expect.any(Object)
            );
        });

        it('should handle very long service name', () => {
            const longService = 'A'.repeat(100);
            const error = new Error('Test');
            const options: LoggerOptions = {
                service: longService,
                operation: 'test'
            };

            expect(() => logServiceError(error, options)).not.toThrow();
        });

        it('should handle very long operation name', () => {
            const longOperation = 'B'.repeat(100);
            const error = new Error('Test');
            const options: LoggerOptions = {
                service: 'TestService',
                operation: longOperation
            };

            expect(() => logServiceError(error, options)).not.toThrow();
        });

        it('should handle large duration values', () => {
            const largeDuration = 999999;
            logServiceSuccess('Service', 'operation', largeDuration);

            expect(consoleLogSpy).toHaveBeenCalledWith(
                `[Service] operation completed in ${largeDuration}ms`
            );
        });

        it('should handle negative duration values (treated as truthy)', () => {
            const negativeDuration = -100;
            logServiceSuccess('Service', 'operation', negativeDuration);

            expect(consoleLogSpy).toHaveBeenCalledWith(
                `[Service] operation completed in ${negativeDuration}ms`
            );
        });

        it('should handle very long warning messages', () => {
            const longMessage = 'X'.repeat(1000);
            logServiceWarning('Service', 'operation', longMessage);

            expect(consoleWarnSpy).toHaveBeenCalledWith(
                '[Service] operation warning:',
                longMessage
            );
        });
    });

    describe('Multiple sequential calls', () => {
        it('should handle multiple error logs', () => {
            const errors = [
                new Error('Error 1'),
                new Error('Error 2'),
                new Error('Error 3')
            ];
            const options: LoggerOptions = { service: 'Test', operation: 'test' };

            errors.forEach(error => logServiceError(error, options));

            expect(consoleErrorSpy).toHaveBeenCalledTimes(3);
        });

        it('should handle mixed log types', () => {
            const error = new Error('Test error');
            const options: LoggerOptions = { service: 'Test', operation: 'test' };

            logServiceError(error, options);
            logServiceSuccess('Test', 'test', 100);
            logServiceWarning('Test', 'test', 'Warning message');

            expect(consoleErrorSpy).toHaveBeenCalledTimes(1);
            expect(consoleLogSpy).toHaveBeenCalledTimes(1);
            expect(consoleWarnSpy).toHaveBeenCalledTimes(1);
        });
    });

    describe('Error details handling', () => {
        it('should include details when includeDetails is true', () => {
            const error = new ServiceTimeoutError('Timeout', { url: '/api', attempt: 3 });
            const options: LoggerOptions = {
                service: 'Test',
                operation: 'test',
                includeDetails: true
            };

            logServiceError(error, options);

            const loggedObject = consoleErrorSpy.mock.calls[0][1] as Record<string, unknown>;
            expect(loggedObject.details).toEqual({ url: '/api', attempt: 3 });
        });

        it('should not include details when includeDetails is false', () => {
            const error = new ServiceTimeoutError('Timeout', { url: '/api' });
            const options: LoggerOptions = {
                service: 'Test',
                operation: 'test',
                includeDetails: false
            };

            logServiceError(error, options);

            const loggedObject = consoleErrorSpy.mock.calls[0][1] as Record<string, unknown>;
            expect(loggedObject.details).toBeUndefined();
        });

        it('should handle undefined includeDetails', () => {
            const error = new ServiceTimeoutError('Timeout', { url: '/api' });
            const options: LoggerOptions = {
                service: 'Test',
                operation: 'test'
            };

            logServiceError(error, options);

            const loggedObject = consoleErrorSpy.mock.calls[0][1] as Record<string, unknown>;
            expect(loggedObject.details).toBeUndefined();
        });
    });
});
