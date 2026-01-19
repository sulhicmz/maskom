export interface QueuedEmail {
    id: string;
    params: Record<string, unknown>;
    timestamp: number;
    attempts: number;
    maxAttempts: number;
}

export interface EmailQueueConfig {
    maxQueueSize: number;
    maxRetentionMs: number;
    maxAttempts: number;
}

export class EmailQueue {
    private queue: QueuedEmail[] = [];
    private config: EmailQueueConfig;
    private storageKey: string;
    private cleanupInterval: NodeJS.Timeout | null = null;

    constructor(config?: Partial<EmailQueueConfig>) {
        this.config = {
            maxQueueSize: 100,
            maxRetentionMs: 24 * 60 * 60 * 1000,
            maxAttempts: 3,
            ...config
        };
        this.storageKey = 'email_queue';
        this.loadQueue();
        this.startCleanup();
    }

    enqueue(params: Record<string, unknown>): boolean {
        if (this.queue.length >= this.config.maxQueueSize) {
            return false;
        }

        const email: QueuedEmail = {
            id: `email_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
            params,
            timestamp: Date.now(),
            attempts: 0,
            maxAttempts: this.config.maxAttempts
        };

        this.queue.push(email);
        this.saveQueue();
        return true;
    }

    dequeue(): QueuedEmail | null {
        if (this.queue.length === 0) {
            return null;
        }

        const email = this.queue.shift();
        if (email) {
            this.saveQueue();
        }
        return email || null;
    }

    peek(): QueuedEmail | null {
        return this.queue.length > 0 ? this.queue[0] : null;
    }

    getQueueSize(): number {
        return this.queue.length;
    }

    markAttempt(emailId: string): boolean {
        const email = this.queue.find(e => e.id === emailId);
        if (!email) {
            return false;
        }

        email.attempts++;
        this.saveQueue();
        return true;
    }

    remove(emailId: string): boolean {
        const index = this.queue.findIndex(e => e.id === emailId);
        if (index === -1) {
            return false;
        }

        this.queue.splice(index, 1);
        this.saveQueue();
        return true;
    }

    clear(): void {
        this.queue = [];
        this.saveQueue();
    }

    getExpiredEmails(): QueuedEmail[] {
        const now = Date.now();
        return this.queue.filter(email => 
            (now - email.timestamp) > this.config.maxRetentionMs
        );
    }

    removeExpired(): number {
        const initialSize = this.queue.length;
        this.queue = this.queue.filter(email => 
            (Date.now() - email.timestamp) <= this.config.maxRetentionMs
        );
        const removedCount = initialSize - this.queue.length;
        if (removedCount > 0) {
            this.saveQueue();
        }
        return removedCount;
    }

    getRetryableEmails(): QueuedEmail[] {
        return this.queue.filter(email => 
            email.attempts < email.maxAttempts
        );
    }

    private loadQueue(): void {
        if (typeof window === 'undefined' || typeof localStorage === 'undefined') {
            return;
        }

        try {
            const stored = localStorage.getItem(this.storageKey);
            if (stored) {
                this.queue = JSON.parse(stored);
                this.removeExpired();
            }
        } catch (error) {
            console.warn('[EmailQueue] Failed to load queue from localStorage:', error);
            this.queue = [];
        }
    }

    private saveQueue(): void {
        if (typeof window === 'undefined' || typeof localStorage === 'undefined') {
            return;
        }

        try {
            localStorage.setItem(this.storageKey, JSON.stringify(this.queue));
        } catch (error) {
            console.warn('[EmailQueue] Failed to save queue to localStorage:', error);
        }
    }

    private startCleanup(): void {
        if (typeof window !== 'undefined') {
            this.cleanupInterval = setInterval(() => {
                this.removeExpired();
            }, 60 * 60 * 1000);
        }
    }

    destroy(): void {
        if (this.cleanupInterval) {
            clearInterval(this.cleanupInterval);
            this.cleanupInterval = null;
        }
        this.saveQueue();
    }
}

export const emailQueue = new EmailQueue();
export default emailQueue;
