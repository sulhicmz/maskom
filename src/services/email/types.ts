export interface IEmailService {
    sendEmail(params: EmailSendParams): Promise<EmailSendResult>;
}

export interface EmailSendParams {
    templateParams: {
        user_name: string;
        user_email: string;
        message: string;
    };
}

export interface EmailSendResult {
    success: boolean;
    text?: string;
    error?: string;
}
