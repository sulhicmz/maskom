import emailjs from '@emailjs/browser';

jest.mock('@emailjs/browser', () => ({
    send: jest.fn(),
}));

jest.useFakeTimers();

jest.setTimeout(15000);

const mockEmailjsSend = emailjs.send as jest.MockedFunction<typeof emailjs.send>;

describe('EmailService', () => {
     
    let emailServiceInstance: any;

    const validParams = {
        templateParams: {
            user_name: 'John Doe',
            user_email: 'john.doe@example.com',
            message: 'Test message'
        }
    };

    beforeAll(() => {
        process.env.NEXT_PUBLIC_EMAILJS_SERVICE_ID = 'test_service_id';
        process.env.NEXT_PUBLIC_EMAILJS_TEMPLATE_ID = 'test_template_id';
        process.env.NEXT_PUBLIC_EMAILJS_PUBLIC_KEY = 'test_public_key';

         
        emailServiceInstance = require('../EmailService').default;
    });

    beforeEach(() => {
        jest.clearAllMocks();
        emailServiceInstance.resetCircuitBreaker();
        jest.clearAllTimers();
        jest.useFakeTimers().setSystemTime(new Date('2020-01-01'));
    });

    afterAll(() => {
        jest.useRealTimers();
    });

    describe('initialization', () => {
        it('initializes with environment variables', () => {
            expect(process.env.NEXT_PUBLIC_EMAILJS_SERVICE_ID).toBe('test_service_id');
            expect(process.env.NEXT_PUBLIC_EMAILJS_TEMPLATE_ID).toBe('test_template_id');
            expect(process.env.NEXT_PUBLIC_EMAILJS_PUBLIC_KEY).toBe('test_public_key');
        });

        it('initializes circuit breaker in closed state', () => {
            const state = emailServiceInstance.getCircuitBreakerState();
            expect(state.isOpen).toBe(false);
            expect(state.failureCount).toBe(0);
        });
    });

    describe('sendEmail', () => {
        it('sends email successfully with valid parameters', async () => {
            const mockResult = { text: 'OK', status: 200 };
            mockEmailjsSend.mockResolvedValue(mockResult as { text: string; status: number });

            const result = await emailServiceInstance.sendEmail(validParams);

            expect(result.success).toBe(true);
            expect(result.message).toBe('Email sent successfully');
            expect(result.data).toEqual({ text: 'OK' });
            expect(mockEmailjsSend).toHaveBeenCalledWith(
                'test_service_id',
                'test_template_id',
                validParams.templateParams,
                'test_public_key'
            );
        });

        it('retries on network errors and succeeds', async () => {
            jest.useRealTimers();
            emailServiceInstance.resetCircuitBreaker();
            const mockResult = { text: 'OK', status: 200 };
            mockEmailjsSend
                .mockRejectedValueOnce(new Error('Network error'))
                .mockRejectedValueOnce(new Error('Network error'))
                .mockResolvedValue(mockResult as { text: string; status: number });

            const result = await emailServiceInstance.sendEmail(validParams);

            expect(result.success).toBe(true);
            expect(result.data).toEqual({ text: 'OK' });
            expect(mockEmailjsSend).toHaveBeenCalledTimes(3);
            jest.useFakeTimers().setSystemTime(new Date('2020-01-01'));
        });

        it('fails after max retries for persistent errors', async () => {
            jest.useRealTimers();
            emailServiceInstance.resetCircuitBreaker();
            mockEmailjsSend.mockRejectedValue(new Error('Persistent error'));

            const result = await emailServiceInstance.sendEmail(validParams);

            expect(result.success).toBe(false);
            expect(result.error).toBeDefined();
            jest.useFakeTimers().setSystemTime(new Date('2020-01-01'));
        });

        it('opens circuit breaker after failure threshold', async () => {
            jest.useRealTimers();
            emailServiceInstance.resetCircuitBreaker();
            mockEmailjsSend.mockRejectedValue(new Error('Service error'));

            await emailServiceInstance.sendEmail(validParams, { skipRateLimit: true });
            await emailServiceInstance.sendEmail(validParams, { skipRateLimit: true });
            await emailServiceInstance.sendEmail(validParams, { skipRateLimit: true });
            await emailServiceInstance.sendEmail(validParams, { skipRateLimit: true });
            await emailServiceInstance.sendEmail(validParams, { skipRateLimit: true });

            const state = emailServiceInstance.getCircuitBreakerState();
            expect(state.isOpen).toBe(true);
            jest.useFakeTimers().setSystemTime(new Date('2020-01-01'));
        });

        it('rejects immediately when circuit is open', async () => {
            jest.useRealTimers();
            emailServiceInstance.resetCircuitBreaker();
            mockEmailjsSend.mockRejectedValue(new Error('Service error'));

            await emailServiceInstance.sendEmail(validParams, { skipRateLimit: true });
            await emailServiceInstance.sendEmail(validParams, { skipRateLimit: true });
            await emailServiceInstance.sendEmail(validParams, { skipRateLimit: true });
            await emailServiceInstance.sendEmail(validParams, { skipRateLimit: true });
            await emailServiceInstance.sendEmail(validParams, { skipRateLimit: true });

            const result = await emailServiceInstance.sendEmail(validParams, { skipRateLimit: true });

            expect(result.success).toBe(false);
            expect(result.error).toContain('Circuit breaker');
            jest.useFakeTimers().setSystemTime(new Date('2020-01-01'));
        });

        it('handles timeout errors', async () => {
            jest.useRealTimers();
            mockEmailjsSend.mockImplementation(() =>
                new Promise((resolve) => setTimeout(() => resolve({ text: 'OK', status: 200 }), 15000))
            );

            const result = await emailServiceInstance.sendEmail(validParams, { skipRateLimit: true });

            expect(result.success).toBe(false);
            expect(result.error).toContain('timed out');

            mockEmailjsSend.mockReset();
        }, 20000);

        it('handles emailjs send errors', async () => {
            jest.useRealTimers();
            emailServiceInstance.resetCircuitBreaker();
            const mockError = new Error('Service unavailable');
            mockEmailjsSend.mockRejectedValue(mockError);

            const result = await emailServiceInstance.sendEmail(validParams);

            expect(result.success).toBe(false);
            expect(result.error).toBeDefined();
            jest.useFakeTimers().setSystemTime(new Date('2020-01-01'));
        });

        it('handles unknown errors', async () => {
            mockEmailjsSend.mockRejectedValue('Unknown error');

            const result = await emailServiceInstance.sendEmail(validParams);

            expect(result.success).toBe(false);
            expect(result.error).toBeDefined();
        });

        it('logs error to console on failure', async () => {
            jest.useRealTimers();
            emailServiceInstance.resetCircuitBreaker();
            const consoleErrorSpy = jest.spyOn(console, 'error').mockImplementation();
            const mockError = new Error('Network error');
            mockEmailjsSend.mockRejectedValue(mockError);

            await emailServiceInstance.sendEmail(validParams, { skipRateLimit: true });

            expect(consoleErrorSpy).toHaveBeenCalledWith(
                '[EmailService] sendEmail failed:',
                expect.objectContaining({
                    code: 'UNKNOWN_ERROR',
                    message: 'Network error'
                })
            );
            consoleErrorSpy.mockRestore();
            jest.useFakeTimers().setSystemTime(new Date('2020-01-01'));
        });

        it('accepts minimal template parameters', async () => {
            const minimalParams = {
                templateParams: {
                    user_name: 'Test',
                    user_email: 'test@test.com',
                    message: 'Hi'
                }
            };
            const mockResult = { text: 'OK', status: 200 };
            mockEmailjsSend.mockResolvedValue(mockResult as { text: string; status: number });

            const result = await emailServiceInstance.sendEmail(minimalParams);

            expect(result.success).toBe(true);
            expect(mockEmailjsSend).toHaveBeenCalledTimes(1);
        });

        it('returns credentials not configured error', async () => {
            process.env.NEXT_PUBLIC_EMAILJS_SERVICE_ID = '';
            process.env.NEXT_PUBLIC_EMAILJS_TEMPLATE_ID = '';
            process.env.NEXT_PUBLIC_EMAILJS_PUBLIC_KEY = '';

            jest.resetModules();
             
            const freshInstance = require('../EmailService').default;

            const result = await freshInstance.sendEmail(validParams);

            expect(result.success).toBe(false);
            expect(result.error).toBe('EmailJS credentials not configured');
            expect(result.errorCode).toBe('CREDENTIALS_MISSING');
            expect(result.metadata).toBeDefined();

            process.env.NEXT_PUBLIC_EMAILJS_SERVICE_ID = 'test_service_id';
            process.env.NEXT_PUBLIC_EMAILJS_TEMPLATE_ID = 'test_template_id';
            process.env.NEXT_PUBLIC_EMAILJS_PUBLIC_KEY = 'test_public_key';
        });
    });

    describe('circuit breaker management', () => {
        it('allows manual reset of circuit breaker', async () => {
            mockEmailjsSend.mockRejectedValue(new Error('Service error'));

            for (let i = 0; i < 5; i++) {
                await emailServiceInstance.sendEmail(validParams, { skipRateLimit: true });
            }

            expect(emailServiceInstance.getCircuitBreakerState().isOpen).toBe(true);

            emailServiceInstance.resetCircuitBreaker();

            expect(emailServiceInstance.getCircuitBreakerState().isOpen).toBe(false);
            expect(emailServiceInstance.getCircuitBreakerState().failureCount).toBe(0);
        });

        it('provides circuit breaker state', () => {
            const state = emailServiceInstance.getCircuitBreakerState();

            expect(state).toHaveProperty('isOpen');
            expect(state).toHaveProperty('failureCount');
            expect(state).toHaveProperty('lastFailureTime');
            expect(state).toHaveProperty('lastSuccessTime');
        });
    });
});
