import { EmailQueue, QueuedEmail, EmailQueueConfig } from '../emailQueue';

describe('EmailQueue', () => {
    let emailQueue: EmailQueue;
    let mockLocalStorage: Storage;
    let setItemSpy: jest.SpyInstance;
    let getItemSpy: jest.SpyInstance;
    let originalWindow: any;

    const createMockLocalStorage = (): Storage => {
        const storage: Record<string, string> = {};
        return {
            clear() {
                Object.keys(storage).forEach(key => delete storage[key]);
            },
            getItem(key: string) {
                return storage[key] || null;
            },
            setItem(key: string, value: string) {
                storage[key] = String(value);
            },
            removeItem(key: string) {
                delete storage[key];
            },
            get length() {
                return Object.keys(storage).length;
            },
            key(index: number) {
                return Object.keys(storage)[index] || null;
            },
        } as unknown as Storage;
    };

    beforeEach(() => {
        originalWindow = (global as any).window;
        mockLocalStorage = createMockLocalStorage();
        (global as any).localStorage = mockLocalStorage;
        global.localStorage = mockLocalStorage;
        global.window = { localStorage: mockLocalStorage } as any;
        jest.useFakeTimers();

        setItemSpy = jest.spyOn(mockLocalStorage, 'setItem');
        getItemSpy = jest.spyOn(mockLocalStorage, 'getItem');
    });

    afterEach(() => {
        jest.useRealTimers();
        setItemSpy.mockRestore();
        getItemSpy.mockRestore();
        if (emailQueue) {
            emailQueue.destroy();
        }
        (global as any).window = originalWindow;
        delete (global as any).localStorage;
    });

    describe('constructor', () => {
        beforeEach(() => {
            emailQueue = new EmailQueue();
        });

        it('should initialize with default config', () => {
            expect(emailQueue.getQueueSize()).toBe(0);
        });

        it('should accept custom config', () => {
            const customConfig: Partial<EmailQueueConfig> = {
                maxQueueSize: 200,
                maxRetentionMs: 48 * 60 * 60 * 1000,
                maxAttempts: 5,
            };
            emailQueue = new EmailQueue(customConfig);
            expect(emailQueue.getQueueSize()).toBe(0);
        });

        it('should load existing queue from localStorage', () => {
            const existingEmail: QueuedEmail = {
                id: 'email_1234567890_abc123',
                params: { to: 'test@example.com' },
                timestamp: Date.now(),
                attempts: 0,
                maxAttempts: 3,
            };
            const queueData = JSON.stringify([existingEmail]);
            mockLocalStorage.setItem('email_queue', queueData);

            emailQueue = new EmailQueue();
            expect(emailQueue.getQueueSize()).toBe(1);
        });
    });

    describe('enqueue', () => {
        beforeEach(() => {
            emailQueue = new EmailQueue();
        });

        it('should successfully enqueue an email', () => {
            const result = emailQueue.enqueue({ to: 'test@example.com', subject: 'Test' });

            expect(result).toBe(true);
            expect(emailQueue.getQueueSize()).toBe(1);
        });

        it('should generate unique email IDs', () => {
            emailQueue.enqueue({ to: 'test1@example.com' });
            emailQueue.enqueue({ to: 'test2@example.com' });

            const queue = getQueue(emailQueue);
            expect(queue[0].id).not.toBe(queue[1].id);
        });

        it('should set initial attempts to 0', () => {
            emailQueue.enqueue({ to: 'test@example.com' });

            const queue = getQueue(emailQueue);
            expect(queue[0].attempts).toBe(0);
        });

        it('should set maxAttempts from config', () => {
            const customQueue = new EmailQueue({ maxAttempts: 5 });
            customQueue.enqueue({ to: 'test@example.com' });

            const queue = getQueue(customQueue);
            expect(queue[0].maxAttempts).toBe(5);
            customQueue.destroy();
        });

        it('should save queue to localStorage after enqueue', () => {
            emailQueue.enqueue({ to: 'test@example.com' });

            expect(setItemSpy).toHaveBeenCalled();
        });

        it('should return false when queue is full', () => {
            const smallQueue = new EmailQueue({ maxQueueSize: 1 });
            smallQueue.enqueue({ to: 'test1@example.com' });

            const result = smallQueue.enqueue({ to: 'test2@example.com' });

            expect(result).toBe(false);
            expect(smallQueue.getQueueSize()).toBe(1);
            smallQueue.destroy();
        });
    });

    describe('dequeue', () => {
        beforeEach(() => {
            emailQueue = new EmailQueue();
        });

        it('should remove and return first email', () => {
            emailQueue.enqueue({ to: 'test1@example.com' });
            emailQueue.enqueue({ to: 'test2@example.com' });

            const email = emailQueue.dequeue();

            expect(email).not.toBeNull();
            expect(email?.params.to).toBe('test1@example.com');
            expect(emailQueue.getQueueSize()).toBe(1);
        });

        it('should save queue to localStorage after dequeue', () => {
            emailQueue.enqueue({ to: 'test@example.com' });
            setItemSpy.mockClear();

            emailQueue.dequeue();

            expect(setItemSpy).toHaveBeenCalled();
        });

        it('should return null when queue is empty', () => {
            const email = emailQueue.dequeue();
            expect(email).toBeNull();
        });
    });

    describe('peek', () => {
        beforeEach(() => {
            emailQueue = new EmailQueue();
        });

        it('should return first email without removing it', () => {
            emailQueue.enqueue({ to: 'test1@example.com' });
            emailQueue.enqueue({ to: 'test2@example.com' });

            const email = emailQueue.peek();

            expect(email).not.toBeNull();
            expect(email?.params.to).toBe('test1@example.com');
            expect(emailQueue.getQueueSize()).toBe(2);
        });

        it('should return null when queue is empty', () => {
            const email = emailQueue.peek();
            expect(email).toBeNull();
        });
    });

    describe('getQueueSize', () => {
        beforeEach(() => {
            emailQueue = new EmailQueue();
        });

        it('should return 0 for empty queue', () => {
            expect(emailQueue.getQueueSize()).toBe(0);
        });

        it('should return correct size after enqueue operations', () => {
            emailQueue.enqueue({ to: 'test1@example.com' });
            expect(emailQueue.getQueueSize()).toBe(1);

            emailQueue.enqueue({ to: 'test2@example.com' });
            expect(emailQueue.getQueueSize()).toBe(2);
        });

        it('should return correct size after dequeue operations', () => {
            emailQueue.enqueue({ to: 'test1@example.com' });
            emailQueue.enqueue({ to: 'test2@example.com' });
            emailQueue.dequeue();

            expect(emailQueue.getQueueSize()).toBe(1);
        });
    });

    describe('markAttempt', () => {
        beforeEach(() => {
            emailQueue = new EmailQueue();
        });

        it('should increment attempts for existing email', () => {
            emailQueue.enqueue({ to: 'test@example.com' });
            const queue = getQueue(emailQueue);
            const emailId = queue[0].id;

            const result = emailQueue.markAttempt(emailId);

            expect(result).toBe(true);
            expect(getQueue(emailQueue)[0].attempts).toBe(1);
        });

        it('should save queue after marking attempt', () => {
            emailQueue.enqueue({ to: 'test@example.com' });
            const queue = getQueue(emailQueue);
            const emailId = queue[0].id;
            setItemSpy.mockClear();

            emailQueue.markAttempt(emailId);

            expect(setItemSpy).toHaveBeenCalled();
        });

        it('should return false for non-existent email', () => {
            const result = emailQueue.markAttempt('non-existent-id');
            expect(result).toBe(false);
        });

        it('should increment attempts multiple times', () => {
            emailQueue.enqueue({ to: 'test@example.com' });
            const queue = getQueue(emailQueue);
            const emailId = queue[0].id;

            emailQueue.markAttempt(emailId);
            emailQueue.markAttempt(emailId);
            emailQueue.markAttempt(emailId);

            expect(getQueue(emailQueue)[0].attempts).toBe(3);
        });
    });

    describe('remove', () => {
        beforeEach(() => {
            emailQueue = new EmailQueue();
        });

        it('should remove email by ID', () => {
            emailQueue.enqueue({ to: 'test1@example.com' });
            emailQueue.enqueue({ to: 'test2@example.com' });
            const queue = getQueue(emailQueue);
            const emailId = queue[0].id;

            const result = emailQueue.remove(emailId);

            expect(result).toBe(true);
            expect(emailQueue.getQueueSize()).toBe(1);
            expect(getQueue(emailQueue)[0].params.to).toBe('test2@example.com');
        });

        it('should save queue after removal', () => {
            emailQueue.enqueue({ to: 'test@example.com' });
            const queue = getQueue(emailQueue);
            const emailId = queue[0].id;
            setItemSpy.mockClear();

            emailQueue.remove(emailId);

            expect(setItemSpy).toHaveBeenCalled();
        });

        it('should return false for non-existent email', () => {
            const result = emailQueue.remove('non-existent-id');
            expect(result).toBe(false);
        });

        it('should not affect queue size when removing non-existent email', () => {
            emailQueue.enqueue({ to: 'test@example.com' });
            const initialSize = emailQueue.getQueueSize();

            emailQueue.remove('non-existent-id');

            expect(emailQueue.getQueueSize()).toBe(initialSize);
        });
    });

    describe('clear', () => {
        beforeEach(() => {
            emailQueue = new EmailQueue();
        });

        it('should remove all emails from queue', () => {
            emailQueue.enqueue({ to: 'test1@example.com' });
            emailQueue.enqueue({ to: 'test2@example.com' });
            emailQueue.enqueue({ to: 'test3@example.com' });

            emailQueue.clear();

            expect(emailQueue.getQueueSize()).toBe(0);
        });

        it('should save empty queue to localStorage', () => {
            emailQueue.enqueue({ to: 'test@example.com' });
            setItemSpy.mockClear();

            emailQueue.clear();

            expect(setItemSpy).toHaveBeenCalled();
            const savedData = JSON.parse(setItemSpy.mock.calls[0][1]);
            expect(savedData).toEqual([]);
        });

        it('should be safe to clear empty queue', () => {
            expect(() => emailQueue.clear()).not.toThrow();
            expect(emailQueue.getQueueSize()).toBe(0);
        });
    });

    describe('getExpiredEmails', () => {
        beforeEach(() => {
            emailQueue = new EmailQueue();
        });

        it('should return emails older than retention period', () => {
            const oldEmail: QueuedEmail = {
                id: 'email_old',
                params: { to: 'old@example.com' },
                timestamp: Date.now() - (25 * 60 * 60 * 1000),
                attempts: 0,
                maxAttempts: 3,
            };
            const newEmail: QueuedEmail = {
                id: 'email_new',
                params: { to: 'new@example.com' },
                timestamp: Date.now(),
                attempts: 0,
                maxAttempts: 3,
            };

            setQueue(emailQueue, [oldEmail, newEmail]);

            const expired = emailQueue.getExpiredEmails();

            expect(expired).toHaveLength(1);
            expect(expired[0].id).toBe('email_old');
        });

        it('should return empty array when no expired emails', () => {
            emailQueue.enqueue({ to: 'test1@example.com' });
            emailQueue.enqueue({ to: 'test2@example.com' });

            const expired = emailQueue.getExpiredEmails();

            expect(expired).toHaveLength(0);
        });

        it('should return all emails when queue has only old emails', () => {
            const oldEmail1: QueuedEmail = {
                id: 'email_old1',
                params: { to: 'old1@example.com' },
                timestamp: Date.now() - (30 * 60 * 60 * 1000),
                attempts: 0,
                maxAttempts: 3,
            };
            const oldEmail2: QueuedEmail = {
                id: 'email_old2',
                params: { to: 'old2@example.com' },
                timestamp: Date.now() - (25 * 60 * 60 * 1000),
                attempts: 0,
                maxAttempts: 3,
            };

            setQueue(emailQueue, [oldEmail1, oldEmail2]);

            const expired = emailQueue.getExpiredEmails();

            expect(expired).toHaveLength(2);
        });
    });

    describe('removeExpired', () => {
        beforeEach(() => {
            emailQueue = new EmailQueue();
        });

        it('should remove expired emails and return count', () => {
            const oldEmail: QueuedEmail = {
                id: 'email_old',
                params: { to: 'old@example.com' },
                timestamp: Date.now() - (25 * 60 * 60 * 1000),
                attempts: 0,
                maxAttempts: 3,
            };
            const newEmail: QueuedEmail = {
                id: 'email_new',
                params: { to: 'new@example.com' },
                timestamp: Date.now(),
                attempts: 0,
                maxAttempts: 3,
            };

            setQueue(emailQueue, [oldEmail, newEmail]);

            const removedCount = emailQueue.removeExpired();

            expect(removedCount).toBe(1);
            expect(emailQueue.getQueueSize()).toBe(1);
            expect(getQueue(emailQueue)[0].id).toBe('email_new');
        });

        it('should save queue after removing expired emails', () => {
            const oldEmail: QueuedEmail = {
                id: 'email_old',
                params: { to: 'old@example.com' },
                timestamp: Date.now() - (25 * 60 * 60 * 1000),
                attempts: 0,
                maxAttempts: 3,
            };

            setQueue(emailQueue, [oldEmail]);
            setItemSpy.mockClear();

            emailQueue.removeExpired();

            expect(setItemSpy).toHaveBeenCalled();
        });

        it('should return 0 when no expired emails', () => {
            emailQueue.enqueue({ to: 'test@example.com' });

            const removedCount = emailQueue.removeExpired();

            expect(removedCount).toBe(0);
            expect(emailQueue.getQueueSize()).toBe(1);
        });
    });

    describe('getRetryableEmails', () => {
        beforeEach(() => {
            emailQueue = new EmailQueue();
        });

        it('should return emails with attempts less than maxAttempts', () => {
            const retryableEmail: QueuedEmail = {
                id: 'email_retry',
                params: { to: 'retry@example.com' },
                timestamp: Date.now(),
                attempts: 2,
                maxAttempts: 3,
            };
            const exhaustedEmail: QueuedEmail = {
                id: 'email_exhausted',
                params: { to: 'exhausted@example.com' },
                timestamp: Date.now(),
                attempts: 3,
                maxAttempts: 3,
            };

            setQueue(emailQueue, [retryableEmail, exhaustedEmail]);

            const retryable = emailQueue.getRetryableEmails();

            expect(retryable).toHaveLength(1);
            expect(retryable[0].id).toBe('email_retry');
        });

        it('should return all emails when none have maxed out attempts', () => {
            emailQueue.enqueue({ to: 'test1@example.com' });
            emailQueue.enqueue({ to: 'test2@example.com' });

            const retryable = emailQueue.getRetryableEmails();

            expect(retryable).toHaveLength(2);
        });

        it('should return empty array when all emails exhausted attempts', () => {
            const exhausted1: QueuedEmail = {
                id: 'email_exhausted1',
                params: { to: 'exhausted1@example.com' },
                timestamp: Date.now(),
                attempts: 3,
                maxAttempts: 3,
            };
            const exhausted2: QueuedEmail = {
                id: 'email_exhausted2',
                params: { to: 'exhausted2@example.com' },
                timestamp: Date.now(),
                attempts: 5,
                maxAttempts: 5,
            };

            setQueue(emailQueue, [exhausted1, exhausted2]);

            const retryable = emailQueue.getRetryableEmails();

            expect(retryable).toHaveLength(0);
        });
    });

    describe('localStorage handling', () => {
        beforeEach(() => {
            emailQueue = new EmailQueue();
        });

        it('should handle localStorage save errors gracefully', () => {
            setItemSpy.mockImplementation(() => {
                throw new Error('Storage quota exceeded');
            });
            const consoleSpy = jest.spyOn(console, 'warn').mockImplementation();

            emailQueue.enqueue({ to: 'test@example.com' });

            expect(consoleSpy).toHaveBeenCalledWith(
                '[EmailQueue] Failed to save queue to localStorage:',
                expect.any(Error)
            );
            consoleSpy.mockRestore();
        });

        it('should handle localStorage load errors gracefully', () => {
            mockLocalStorage.getItem = jest.fn(() => {
                throw new Error('Storage access error');
            });
            const consoleSpy = jest.spyOn(console, 'warn').mockImplementation();

            const queue = new EmailQueue();

            expect(consoleSpy).toHaveBeenCalledWith(
                '[EmailQueue] Failed to load queue from localStorage:',
                expect.any(Error)
            );
            expect(queue.getQueueSize()).toBe(0);
            consoleSpy.mockRestore();
        });

        it('should handle JSON parse errors gracefully', () => {
            mockLocalStorage.getItem = jest.fn(() => 'invalid json');
            const consoleSpy = jest.spyOn(console, 'warn').mockImplementation();

            const queue = new EmailQueue();

            expect(consoleSpy).toHaveBeenCalledWith(
                '[EmailQueue] Failed to load queue from localStorage:',
                expect.any(Error)
            );
            expect(queue.getQueueSize()).toBe(0);
            consoleSpy.mockRestore();
        });
    });

    describe('cleanup interval', () => {
        let setIntervalSpy: jest.SpyInstance;
        let clearIntervalSpy: jest.SpyInstance;

        beforeEach(() => {
            setIntervalSpy = jest.spyOn(global, 'setInterval');
            clearIntervalSpy = jest.spyOn(global, 'clearInterval');
            emailQueue = new EmailQueue();
        });

        afterEach(() => {
            setIntervalSpy.mockRestore();
            clearIntervalSpy.mockRestore();
        });

        it('should start cleanup interval on construction', () => {
            expect(setIntervalSpy).toHaveBeenCalledWith(
                expect.any(Function),
                60 * 60 * 1000
            );
        });

        it('should start cleanup interval when creating queue instance', () => {
            setIntervalSpy.mockClear();
            const testQueue = new EmailQueue();

            expect(setIntervalSpy).toHaveBeenCalledWith(
                expect.any(Function),
                60 * 60 * 1000
            );
            testQueue.destroy();
        });

        it('should clear interval on destroy', () => {
            emailQueue.destroy();

            expect(clearIntervalSpy).toHaveBeenCalled();
        });

        it('should save queue on destroy', () => {
            emailQueue.enqueue({ to: 'test@example.com' });
            setItemSpy.mockClear();

            emailQueue.destroy();

            expect(setItemSpy).toHaveBeenCalled();
        });
    });

    describe('edge cases', () => {
        beforeEach(() => {
            emailQueue = new EmailQueue();
        });

        it('should handle empty params object', () => {
            const result = emailQueue.enqueue({});

            expect(result).toBe(true);
            expect(emailQueue.getQueueSize()).toBe(1);
        });

        it('should handle complex params object', () => {
            const complexParams = {
                to: 'test@example.com',
                subject: 'Test Subject',
                body: 'Test Body',
                attachments: ['file1.pdf', 'file2.pdf'],
                metadata: { campaignId: '123', userId: '456' },
            };

            emailQueue.enqueue(complexParams);

            const queue = getQueue(emailQueue);
            expect(queue[0].params).toEqual(complexParams);
        });

        it('should handle rapid enqueue operations', () => {
            for (let i = 0; i < 50; i++) {
                emailQueue.enqueue({ to: `test${i}@example.com` });
            }

            expect(emailQueue.getQueueSize()).toBe(50);
        });

        it('should maintain FIFO order', () => {
            emailQueue.enqueue({ to: 'first@example.com' });
            emailQueue.enqueue({ to: 'second@example.com' });
            emailQueue.enqueue({ to: 'third@example.com' });

            const first = emailQueue.dequeue();
            const second = emailQueue.dequeue();
            const third = emailQueue.dequeue();

            expect(first?.params.to).toBe('first@example.com');
            expect(second?.params.to).toBe('second@example.com');
            expect(third?.params.to).toBe('third@example.com');
        });
    });
});

function getQueue(queue: EmailQueue): QueuedEmail[] {
    return (queue as any).queue;
}

function setQueue(queue: EmailQueue, emails: QueuedEmail[]): void {
    (queue as any).queue = emails;
}
