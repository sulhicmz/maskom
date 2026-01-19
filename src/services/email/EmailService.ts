import type { IEmailService, EmailSendParams, EmailSendOptions, ServiceMetrics } from './types';
import type { ServiceResult } from '@/types/common';
import type { EmailTemplate } from '@/types/data';
import { withTimeout, CircuitBreaker } from '@/utils/resilience';
import { emailRateLimiter } from '@/utils/rateLimiter';
import metricsCollector from '@/utils/metrics';
import { substituteTemplateVariables, VariableSubstitution } from '@/utils/templateUtils';
import {
     ServiceCredentialsError,
     ServiceRateLimitError,
     logServiceError,
     logServiceWarning,
     createSuccessResult,
     createErrorResult,
     executeWithResilience,
     RateLimitExceededError
} from '@/services/common';
import { TIMEOUTS, CIRCUIT_BREAKER_CONFIG } from '@/constants';
import email_template_data from '@/data/EmailTemplateData';

class EmailService implements IEmailService {
    private serviceId: string;
    private templateId: string;
    private publicKey: string;
    private circuitBreaker: CircuitBreaker;
    private emailjsModule: typeof import('@emailjs/browser') | null = null;

    constructor() {
        this.serviceId = process.env.NEXT_PUBLIC_EMAILJS_SERVICE_ID || '';
        this.templateId = process.env.NEXT_PUBLIC_EMAILJS_TEMPLATE_ID || '';
        this.publicKey = process.env.NEXT_PUBLIC_EMAILJS_PUBLIC_KEY || '';

        if (!this.serviceId || !this.templateId || !this.publicKey) {
            logServiceWarning('EmailService', 'constructor', 'EmailJS credentials not configured in environment variables');
        }

        this.circuitBreaker = new CircuitBreaker(CIRCUIT_BREAKER_CONFIG.EMAIL_SERVICE);
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
                    timeoutMs: TIMEOUTS.EMAIL_SERVICE
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
        if (!this.emailjsModule) {
            this.emailjsModule = await import('@emailjs/browser');
        }

        const emailjs = this.emailjsModule;
        const result = await withTimeout(
            emailjs.send(
                this.serviceId,
                this.templateId,
                params.templateParams,
                this.publicKey
            ),
            { timeoutMs: TIMEOUTS.EMAIL_SERVICE, timeoutError: 'EmailJS request timed out' }
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

    async sendTemplatedEmail(
        templateId: number,
        variables: Record<string, string>,
        options?: EmailSendOptions,
    ): Promise<ServiceResult<{ subject: string; body: string; text: string }>> {
        const template = email_template_data.find((t) => t.id === templateId);

        if (!template) {
            const errorMessage = `Email template with ID ${templateId} not found`;
            metricsCollector.recordCall('EmailService.sendTemplatedEmail', false, 'template_not_found');
            logServiceError(new Error(errorMessage), { service: 'EmailService', operation: 'sendTemplatedEmail' });
            return createErrorResult(errorMessage);
        }

        const substitutions: VariableSubstitution[] = Object.entries(variables).map(([key, value]) => ({
            key,
            value,
            required: false,
        }));

        const result = substituteTemplateVariables(template, substitutions);

        if (result.errors.length > 0) {
            const errorMessage = `Template validation failed: ${result.errors.join(', ')}`;
            metricsCollector.recordCall('EmailService.sendTemplatedEmail', false, 'template_validation_failed');
            logServiceError(new Error(errorMessage), { service: 'EmailService', operation: 'sendTemplatedEmail' });
            return createErrorResult(errorMessage);
        }

        const emailResult = await this.sendEmail(
            {
                templateParams: {
                    user_name: 'Template Email System',
                    user_email: 'noreply@example.com',
                    message: result.body,
                },
            },
            options,
        );

        if (!emailResult.success) {
            const errorMessage = emailResult.error || 'Failed to send email';
            metricsCollector.recordCall('EmailService.sendTemplatedEmail', false, 'email_send_failed');
            return createErrorResult(errorMessage);
        }

        template.sentCount = (template.sentCount || 0) + 1;

        return createSuccessResult('Email sent successfully', {
            subject: result.subject,
            body: result.body,
            text: emailResult.data?.text || '',
        });
    }
}

const emailServiceInstance = new EmailService();
export default emailServiceInstance;
