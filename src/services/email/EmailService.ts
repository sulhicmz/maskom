import emailjs from '@emailjs/browser';
import type { IEmailService, EmailSendParams, EmailSendResult, EmailSendOptions } from './types';
import { withTimeout, withRetry, CircuitBreaker } from '@/utils/resilience';
import { emailRateLimiter } from '@/utils/rateLimiter';

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
            console.warn('EmailJS credentials not configured in environment variables');
        }

        this.circuitBreaker = new CircuitBreaker({
            failureThreshold: 5,
            resetTimeoutMs: 60000,
            monitoringPeriodMs: 60000
        });
    }

    async sendEmail(params: EmailSendParams, options?: EmailSendOptions): Promise<EmailSendResult> {
        if (!this.serviceId || !this.templateId || !this.publicKey) {
            return {
                success: false,
                error: 'EmailJS credentials not configured'
            };
        }

        const identifier = options?.identifier || params.templateParams.user_email;

        if (!options?.skipRateLimit) {
            const limitCheck = emailRateLimiter.check(identifier);
            if (!limitCheck.allowed) {
                return {
                    success: false,
                    error: limitCheck.error,
                    rateLimited: true
                };
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
                    throw retryResult.error || new Error('Email send failed after retries');
                }

                return retryResult.data;
            });

            if (!options?.skipRateLimit) {
                emailRateLimiter.recordAttempt(identifier);
            }

            return {
                success: true,
                text: result.text
            };
        } catch (error) {
            const errorMessage = error instanceof Error ? error.message : 'Unknown error';
            console.error('Email send failed:', errorMessage);
            return {
                success: false,
                error: errorMessage
            };
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
        return this.circuitBreaker.getState();
    }

    resetCircuitBreaker() {
        this.circuitBreaker.reset();
    }
}

const emailServiceInstance = new EmailService();
export default emailServiceInstance;
