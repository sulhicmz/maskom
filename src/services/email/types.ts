import type { ServiceResult } from '@/types/common';

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
     processQueue(): Promise<ServiceResult<{ processed: number; failed: number }>>;
     getQueueStatus(): { queueSize: number; expired: number };
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
