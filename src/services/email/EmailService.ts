import emailjs from '@emailjs/browser';
import type { IEmailService, EmailSendParams, EmailSendOptions, ServiceMetrics } from './types';
import type { ServiceResult } from '@/services/common';
import { withTimeout, withRetry, CircuitBreaker } from '@/utils/resilience';
import { emailRateLimiter } from '@/utils/rateLimiter';
import metricsCollector from '@/utils/metrics';
import { 
    ServiceCredentialsError, 
    ServiceTimeoutError, 
    ServiceRateLimitError,
    ServiceCircuitBreakerError,
    logServiceError,
    logServiceSuccess,
    logServiceWarning,
    createSuccessResult,
    createErrorResult
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

    private async executeWithResilience(
        operation: 'sendEmail',
        identifier: string,
        skipRateLimit: boolean,
        operationFn: () => Promise<{ text: string }>
    ): Promise<ServiceResult<{ text: string }>> {
        const startTime = Date.now();

        if (!skipRateLimit) {
            const limitCheck = emailRateLimiter.check(identifier);
            if (!limitCheck.allowed) {
                metricsCollector.recordCall(`EmailService.${operation}`, false, 'rate_limit');
                const error = new ServiceRateLimitError(limitCheck.error || 'Too many requests');
                return createErrorResult(error, undefined, { rateLimited: true });
            }
        }

        try {
            const result = await this.circuitBreaker.execute(async () => {
                const retryResult = await withRetry(
                    operationFn,
                    {
                        maxAttempts: 3,
                        baseDelayMs: 1000,
                        maxDelayMs: 10000,
                        backoffMultiplier: 2,
                        retryableErrors: [/network/i, /timeout/i, /ECONN/i]
                    }
                );

                if (!retryResult.success || !retryResult.data) {
                    const error = retryResult.error || new Error(`${operation} failed after retries`);
                    throw error;
                }

                return retryResult.data;
            });

            if (!skipRateLimit) {
                emailRateLimiter.recordAttempt(identifier);
            }

            const responseTime = Date.now() - startTime;
            metricsCollector.recordCall(`EmailService.${operation}`, true, undefined, responseTime);
            logServiceSuccess('EmailService', operation, responseTime);

            return createSuccessResult('Email sent successfully', result);
        } catch (error) {
            const responseTime = Date.now() - startTime;
            let errorType = 'unknown';

            if (error instanceof ServiceTimeoutError || (error instanceof Error && error.message.includes('timeout'))) {
                errorType = 'timeout';
            } else if (error instanceof ServiceCircuitBreakerError || (error instanceof Error && error.message.includes('circuit breaker'))) {
                errorType = 'circuit_breaker';
            }

            metricsCollector.recordCall(`EmailService.${operation}`, false, errorType, responseTime);

            const standardizedError = error instanceof Error ? error : new Error('Unknown error');
            if (!(standardizedError instanceof ServiceCredentialsError ||
                  standardizedError instanceof ServiceTimeoutError ||
                  standardizedError instanceof ServiceRateLimitError ||
                  standardizedError instanceof ServiceCircuitBreakerError)) {
                logServiceError(standardizedError, { service: 'EmailService', operation });
            }

            return createErrorResult(standardizedError.message);
        }
    }

    async sendEmail(params: EmailSendParams, options?: EmailSendOptions): Promise<ServiceResult<{ text: string }>> {
        if (!this.serviceId || !this.templateId || !this.publicKey) {
            const error = new ServiceCredentialsError('EmailJS credentials not configured');
            metricsCollector.recordCall('EmailService.sendEmail', false, 'credentials_not_configured');
            logServiceError(error, { service: 'EmailService', operation: 'sendEmail' });
            return createErrorResult(error);
        }

        const identifier = options?.identifier || params.templateParams.user_email;

        return this.executeWithResilience(
            'sendEmail',
            identifier,
            options?.skipRateLimit || false,
            () => this.sendEmailWithTimeout(params)
        );
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
