export interface IEmailService {
    sendEmail(params: EmailSendParams, options?: EmailSendOptions): Promise<EmailSendResult>;
    getCircuitBreakerState(): CircuitBreakerState;
    resetCircuitBreaker(): void;
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

export interface EmailSendResult {
    success: boolean;
    text?: string;
    error?: string;
    rateLimited?: boolean;
}

export type CircuitBreakerState = {
    isOpen: boolean;
    failureCount: number;
    lastFailureTime: number | null;
    lastSuccessTime: number | null;
};
