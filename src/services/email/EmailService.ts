import emailjs from '@emailjs/browser';
import type { IEmailService, EmailSendParams, EmailSendResult } from './types';

class EmailService implements IEmailService {
    private serviceId: string;
    private templateId: string;
    private publicKey: string;

    constructor() {
        this.serviceId = process.env.NEXT_PUBLIC_EMAILJS_SERVICE_ID || '';
        this.templateId = process.env.NEXT_PUBLIC_EMAILJS_TEMPLATE_ID || '';
        this.publicKey = process.env.NEXT_PUBLIC_EMAILJS_PUBLIC_KEY || '';

        if (!this.serviceId || !this.templateId || !this.publicKey) {
            console.warn('EmailJS credentials not configured in environment variables');
        }
    }

    async sendEmail(params: EmailSendParams): Promise<EmailSendResult> {
        if (!this.serviceId || !this.templateId || !this.publicKey) {
            return {
                success: false,
                error: 'EmailJS credentials not configured'
            };
        }

        try {
            const result = await emailjs.send(
                this.serviceId,
                this.templateId,
                params.templateParams,
                this.publicKey
            );

            return {
                success: true,
                text: result.text
            };
        } catch (error) {
            console.error('Email send failed:', error);
            return {
                success: false,
                error: error instanceof Error ? error.message : 'Unknown error'
            };
        }
    }
}

const emailServiceInstance = new EmailService();
export default emailServiceInstance;
