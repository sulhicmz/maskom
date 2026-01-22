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

export interface IEmailQueue {
  enqueue(params: Record<string, unknown>): boolean;
  dequeue(): QueuedEmail | null;
  peek(): QueuedEmail | null;
  getQueueSize(): number;
  markAttempt(emailId: string): boolean;
  remove(emailId: string): boolean;
  clear(): void;
  getExpiredEmails(): QueuedEmail[];
  removeExpired(): number;
  getRetryableEmails(): QueuedEmail[];
  destroy(): void;
}
