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

    async sendEmail(params: EmailSendParams, options?: EmailSendOptions): Promise<ServiceResult<{ text: string }>> {
        const startTime = Date.now();

        if (!this.serviceId || !this.templateId || !this.publicKey) {
            const error = new ServiceCredentialsError('EmailJS credentials not configured');
            metricsCollector.recordCall('EmailService', false, 'credentials_not_configured');
            logServiceError(error, { service: 'EmailService', operation: 'sendEmail' });
            return createErrorResult(error);
        }

        const identifier = options?.identifier || params.templateParams.user_email;

        if (!options?.skipRateLimit) {
            const limitCheck = emailRateLimiter.check(identifier);
            if (!limitCheck.allowed) {
                const responseTime = Date.now() - startTime;
                const error = new ServiceRateLimitError(limitCheck.error || 'Too many requests');
                metricsCollector.recordCall('EmailService', false, 'rate_limit', responseTime);
                return createErrorResult(error, undefined, { rateLimited: true });
            }
        }

        try {
            const result = await this.circuitBreaker.execute(async () => {
                const retryResult = await withRetry(
                    () => this.sendEmailWithTimeout(params),
                    {
                        maxAttempts: 3,
                        baseDelayMs: 1000,
                        maxDelayMs: 10000,
                        backoffMultiplier: 2,
                        retryableErrors: [/network/i, /timeout/i, /ECONN/i]
                    }
                );

                if (!retryResult.success || !retryResult.data) {
                    const error = retryResult.error || new Error('Email send failed after retries');
                    throw error;
                }

                return retryResult.data;
            });

            if (!options?.skipRateLimit) {
                emailRateLimiter.recordAttempt(identifier);
            }

            const responseTime = Date.now() - startTime;
            metricsCollector.recordCall('EmailService', true, undefined, responseTime);
            logServiceSuccess('EmailService', 'sendEmail', responseTime);

            return createSuccessResult('Email sent successfully', { text: result.text });
        } catch (error) {
            const responseTime = Date.now() - startTime;
            let errorType = 'unknown';
            
            if (error instanceof ServiceTimeoutError || (error instanceof Error && error.message.includes('timeout'))) {
                errorType = 'timeout';
            } else if (error instanceof ServiceCircuitBreakerError || (error instanceof Error && error.message.includes('circuit breaker'))) {
                errorType = 'circuit_breaker';
            }
            
            metricsCollector.recordCall('EmailService', false, errorType, responseTime);
            
            const standardizedError = error instanceof Error ? error : new Error('Unknown error');
            if (!(standardizedError instanceof ServiceCredentialsError || 
                  standardizedError instanceof ServiceTimeoutError || 
                  standardizedError instanceof ServiceRateLimitError || 
                  standardizedError instanceof ServiceCircuitBreakerError)) {
                logServiceError(standardizedError, { service: 'EmailService', operation: 'sendEmail' });
            }
            
            return createErrorResult(standardizedError.message);
        }
    }

    private async sendEmailWithTimeout(params: EmailSendParams) {
        return withTimeout(
            emailjs.send(
                this.serviceId,
                this.templateId,
                params.templateParams,
                this.publicKey
            ),
            { timeoutMs: 10000, timeoutError: 'EmailJS request timed out' }
        );
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

function logServiceWarning(service: string, operation: string, message: string) {
    console.warn(`[${service}] ${operation} warning:`, message);
}
