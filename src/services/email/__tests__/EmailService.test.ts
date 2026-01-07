import emailjs from '@emailjs/browser';

jest.mock('@emailjs/browser', () => ({
    send: jest.fn(),
}));

const mockEmailjsSend = emailjs.send as jest.MockedFunction<typeof emailjs.send>;

describe('EmailService', () => {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
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

        // eslint-disable-next-line @typescript-eslint/no-require-imports
        emailServiceInstance = require('../EmailService').default;
    });

    beforeEach(() => {
        jest.clearAllMocks();
    });

    describe('initialization', () => {
        it('initializes with environment variables', () => {
            expect(process.env.NEXT_PUBLIC_EMAILJS_SERVICE_ID).toBe('test_service_id');
            expect(process.env.NEXT_PUBLIC_EMAILJS_TEMPLATE_ID).toBe('test_template_id');
            expect(process.env.NEXT_PUBLIC_EMAILJS_PUBLIC_KEY).toBe('test_public_key');
        });
    });

    describe('sendEmail', () => {
        it('sends email successfully with valid parameters', async () => {
            const mockResult = { text: 'OK', status: 200 };
            mockEmailjsSend.mockResolvedValue(mockResult as { text: string; status: number });

            const result = await emailServiceInstance.sendEmail(validParams);

            expect(result).toEqual({
                success: true,
                text: 'OK'
            });
            expect(mockEmailjsSend).toHaveBeenCalledWith(
                'test_service_id',
                'test_template_id',
                validParams.templateParams,
                'test_public_key'
            );
        });

        it('handles emailjs send errors', async () => {
            const mockError = new Error('Service unavailable');
            mockEmailjsSend.mockRejectedValue(mockError);

            const result = await emailServiceInstance.sendEmail(validParams);

            expect(result).toEqual({
                success: false,
                error: 'Service unavailable'
            });
            expect(mockEmailjsSend).toHaveBeenCalledTimes(1);
        });

        it('handles unknown errors', async () => {
            mockEmailjsSend.mockRejectedValue('Unknown error');

            const result = await emailServiceInstance.sendEmail(validParams);

            expect(result).toEqual({
                success: false,
                error: 'Unknown error'
            });
        });

        it('logs error to console on failure', async () => {
            const consoleErrorSpy = jest.spyOn(console, 'error').mockImplementation();
            const mockError = new Error('Network error');
            mockEmailjsSend.mockRejectedValue(mockError);

            await emailServiceInstance.sendEmail(validParams);

            expect(consoleErrorSpy).toHaveBeenCalledWith('Email send failed:', mockError);
            consoleErrorSpy.mockRestore();
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
    });
});
