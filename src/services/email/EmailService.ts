import emailjs from '@emailjs/browser';
import type { IEmailService, EmailSendParams, EmailSendOptions, ServiceMetrics } from './types';
import type { ServiceResult } from '@/services/common';
import { withTimeout, CircuitBreaker } from '@/utils/resilience';
import { emailRateLimiter } from '@/utils/rateLimiter';
import metricsCollector from '@/utils/metrics';
import { 
    ServiceCredentialsError, 
    ServiceRateLimitError,
    logServiceError,
    logServiceSuccess,
    logServiceWarning,
    createSuccessResult,
    createErrorResult,
    executeWithResilience,
    RateLimitExceededError
} from '@/services/common';

class EmailService implements IEmailService {
    private serviceId: string;
    private templateId: string;
    private publicKey: string;
    private circuitBreaker: CircuitBreaker;

    constructor() {
        this.serviceId = process.env.NEXT_PUBLIC_EMAILJS_SERVICE_ID || '';
        this.templateId = process.env.NEXT_PUBLIC_EMAILJS_TEMPLATE_ID || '';
        this.publicKey = process.env.NEXT_PUBLIC_EMAILJS_PUBLIC_KEY || '';

        if (!this.serviceId || !this.templateId || !this.publicKey) {
            logServiceWarning('EmailService', 'constructor', 'EmailJS credentials not configured in environment variables');
        }

        this.circuitBreaker = new CircuitBreaker({
            failureThreshold: 5,
            resetTimeoutMs: 60000,
            monitoringPeriodMs: 60000
        });
    }

    async sendEmail(params: EmailSendParams, options?: EmailSendOptions): Promise<ServiceResult<{ text: string }>> {
        if (!this.serviceId || !this.templateId || !this.publicKey) {
            const error = new ServiceCredentialsError('EmailJS credentials not configured');
            metricsCollector.recordCall('EmailService.sendEmail', false, 'credentials_not_configured');
            logServiceError(error, { service: 'EmailService', operation: 'sendEmail' });
            return createErrorResult(error);
        }

        const identifier = options?.identifier || params.templateParams.user_email;

        try {
            const result = await executeWithResilience<{ text: string }>(
                {
                    operationName: 'EmailService.sendEmail',
                    rateLimiter: emailRateLimiter,
                    identifier,
                    circuitBreaker: this.circuitBreaker,
                    skipRateLimit: options?.skipRateLimit || false,
                    timeoutMs: 10000
                },
                () => this.sendEmailWithTimeout(params)
            );

            return createSuccessResult('Email sent successfully', result);
        } catch (error) {
            if (error instanceof RateLimitExceededError) {
                metricsCollector.recordCall('EmailService.sendEmail', false, 'rate_limit');
                const rateLimitError = new ServiceRateLimitError(error.message);
                return createErrorResult(rateLimitError, undefined, { rateLimited: true });
            }

            const standardizedError = error instanceof Error ? error : new Error('Unknown error');
            return createErrorResult(standardizedError.message);
        }
    }

    private async sendEmailWithTimeout(params: EmailSendParams): Promise<{ text: string }> {
        const result = await withTimeout(
            emailjs.send(
                this.serviceId,
                this.templateId,
                params.templateParams,
                this.publicKey
            ),
            { timeoutMs: 10000, timeoutError: 'EmailJS request timed out' }
        );
        return { text: result.text };
    }

    getCircuitBreakerState() {
        const state = this.circuitBreaker.getState();
        metricsCollector.recordCircuitBreakerState('EmailService', state.isOpen);
        return state;
    }

    resetCircuitBreaker() {
        this.circuitBreaker.reset();
    }

    getMetrics(): ServiceMetrics | undefined {
        return metricsCollector.getMetrics('EmailService');
    }
}

const emailServiceInstance = new EmailService();
export default emailServiceInstance;
