import type { ServiceResult } from '@/types/common';
import type { EmailTemplate } from '@/types/data';

export interface IEmailService {
     sendEmail(params: EmailSendParams, options?: EmailSendOptions): Promise<ServiceResult<{ text: string }>>;
     sendTemplatedEmail(
         templateId: number,
         variables: Record<string, string>,
         options?: EmailSendOptions,
     ): Promise<ServiceResult<{ subject: string; body: string; text: string }>>;
     getCircuitBreakerState(): CircuitBreakerState;
     resetCircuitBreaker(): void;
     getMetrics(): ServiceMetrics | undefined;
}

export interface EmailSendParams {
    templateParams: {
        user_name: string;
        user_email: string;
        message: string;
    };
}

export interface EmailSendOptions {
    skipRateLimit?: boolean;
    identifier?: string;
}

export type CircuitBreakerState = {
    isOpen: boolean;
    failureCount: number;
    lastFailureTime: number | null;
    lastSuccessTime: number | null;
};

export type ServiceMetrics = {
    serviceName: string;
    totalCalls: number;
    successCalls: number;
    failureCalls: number;
    timeoutCalls: number;
    rateLimitCalls: number;
    circuitBreakerOpenCount: number;
    lastError?: string;
    lastSuccessTime?: number;
    lastFailureTime?: number;
    averageResponseTime?: number;
};
