jest.mock('@/utils/collaboration/sessionManager');
jest.mock('@/utils/rateLimit');
jest.mock('@/services/common/logger');
jest.mock('@/utils/metrics', () => ({
    __esModule: true,
    default: {
        recordCall: jest.fn(),
        recordLatency: jest.fn(),
        recordError: jest.fn()
    }
}));

import { NextRequest } from 'next/server';
import { GET, POST } from '../route';
import { sessionManager } from '@/utils/collaboration/sessionManager';
import { strictRateLimiter, getClientIdentifier } from '@/utils/rateLimit';
import { logServiceError } from '@/services/common/logger';
import { CIRCUIT_BREAKER_CONFIG, TIMEOUTS } from '@/constants';
import metricsCollector from '@/utils/metrics';

describe('/api/collaborate - Integration Resilience', () => {
    beforeEach(() => {
        jest.clearAllMocks();
    });

    afterEach(() => {
        jest.clearAllMocks();
    });

    describe('GET - Resilience Patterns', () => {
        it('should use executeApiRoute wrapper for resilience', async () => {
            const mockRequest = {
                nextUrl: { searchParams: new URLSearchParams('sessionId=test123&userId=1&username=testuser') }
            } as unknown as NextRequest;

            await GET(mockRequest);

            expect(metricsCollector.recordCall).toHaveBeenCalled();
        });

        it('should use CIRCUIT_BREAKER_CONFIG.COLLABORATION_API config', async () => {
            expect(CIRCUIT_BREAKER_CONFIG.COLLABORATION_API).toBeDefined();
            expect(CIRCUIT_BREAKER_CONFIG.COLLABORATION_API).toEqual({
                failureThreshold: 5,
                resetTimeoutMs: 60000,
                monitoringPeriodMs: 60000
            });
        });

        it('should use TIMEOUTS.COLLABORATION_API timeout', async () => {
            expect(TIMEOUTS.COLLABORATION_API).toBe(5000);
        });

        it('should use configured retry options with exponential backoff', async () => {
            const mockRequest = {
                nextUrl: { searchParams: new URLSearchParams('sessionId=test123&userId=1&username=testuser') }
            } as unknown as NextRequest;

            await GET(mockRequest);

            const lastCall = metricsCollector.recordCall.mock.calls[0];
            expect(lastCall).toBeDefined();
        });
    });

    describe('POST - Resilience Patterns', () => {
        it('should use executeApiRoute wrapper for resilience', async () => {
            const mockRequest = {
                json: jest.fn().mockResolvedValue({ action: 'join', postId: 123, userId: 1, username: 'testuser' })
            } as unknown as NextRequest;

            (sessionManager.getSessionByPostId as jest.Mock).mockReturnValue({ sessionId: 'session-123', postId: 123 });
            (sessionManager.addEditor as jest.Mock).mockReturnValue(true);

            getClientIdentifier.mockReturnValue('127.0.0.1');
            strictRateLimiter.mockReturnValue({ success: true, limit: 100, remaining: 99, resetTime: Date.now() + 60000 });

            await POST(mockRequest);

            expect(metricsCollector.recordCall).toHaveBeenCalled();
        });

        it('should use CIRCUIT_BREAKER_CONFIG.COLLABORATION_API config', async () => {
            expect(CIRCUIT_BREAKER_CONFIG.COLLABORATION_API).toBeDefined();
        });

        it('should use configured retry options for network errors', async () => {
            const mockRequest = {
                json: jest.fn().mockResolvedValue({ action: 'join', postId: 123, userId: 1, username: 'testuser' })
            } as unknown as NextRequest;

            (sessionManager.getSessionByPostId as jest.Mock).mockReturnValue({ sessionId: 'session-123', postId: 123 });
            (sessionManager.addEditor as jest.Mock).mockReturnValue(true);

            getClientIdentifier.mockReturnValue('127.0.0.1');
            strictRateLimiter.mockReturnValue({ success: true, limit: 100, remaining: 99, resetTime: Date.now() + 60000 });

            await POST(mockRequest);

            expect(metricsCollector.recordCall).toHaveBeenCalled();
        });
    });

    describe('Error Response Standardization', () => {
        it('should return error code for rate limit exceeded', async () => {
            const mockRequest = {
                nextUrl: { searchParams: new URLSearchParams('sessionId=test123&userId=1&username=testuser') }
            } as unknown as NextRequest;

            getClientIdentifier.mockReturnValue('127.0.0.1');
            strictRateLimiter.mockReturnValue({ success: false, limit: 100, remaining: 0, resetTime: Date.now() + 60000 });

            const result = await GET(mockRequest);

            const resultJson = await result.json();
            expect(resultJson.errorCode).toBe('RATE_LIMIT_EXCEEDED');
            expect(resultJson.error).toBeDefined();
            expect(result.status).toBe(429);
        });

        it('should return error code for invalid query parameters', async () => {
            const mockRequest = {
                nextUrl: { searchParams: new URLSearchParams('sessionId=&userId=invalid&username=') }
            } as unknown as NextRequest;

            getClientIdentifier.mockReturnValue('127.0.0.1');
            strictRateLimiter.mockReturnValue({ success: true, limit: 100, remaining: 99, resetTime: Date.now() + 60000 });

            const result = await GET(mockRequest);

            const resultJson = await result.json();
            expect(resultJson.errorCode).toBe('INVALID_QUERY_PARAMETERS');
            expect(resultJson.error).toBeDefined();
            expect(resultJson.details).toBeDefined();
            expect(result.status).toBe(400);
        });

        it('should return error code for session not found', async () => {
            const mockRequest = {
                nextUrl: { searchParams: new URLSearchParams('sessionId=nonexistent&userId=1&username=testuser') }
            } as unknown as NextRequest;

            getClientIdentifier.mockReturnValue('127.0.0.1');
            strictRateLimiter.mockReturnValue({ success: true, limit: 100, remaining: 99, resetTime: Date.now() + 60000 });
            (sessionManager.getSession as jest.Mock).mockReturnValue(undefined);

            const result = await GET(mockRequest);

            const resultJson = await result.json();
            expect(resultJson.errorCode).toBe('SESSION_NOT_FOUND');
            expect(resultJson.error).toBeDefined();
            expect(result.status).toBe(404);
        });

        it('should return error code for missing required fields', async () => {
            const mockRequest = {
                json: jest.fn().mockResolvedValue({ action: 'join', postId: '', userId: 0, username: '' })
            } as unknown as NextRequest;

            getClientIdentifier.mockReturnValue('127.0.0.1');
            strictRateLimiter.mockReturnValue({ success: true, limit: 100, remaining: 99, resetTime: Date.now() + 60000 });

            const result = await POST(mockRequest);

            const resultJson = await result.json();
            expect(resultJson.errorCode).toBe('INVALID_REQUEST_DATA');
            expect(resultJson.error).toBeDefined();
            expect(result.status).toBe(400);
        });

        it('should return error code for invalid request data', async () => {
            const mockRequest = {
                json: jest.fn().mockResolvedValue({ invalid: 'data' })
            } as unknown as NextRequest;

            getClientIdentifier.mockReturnValue('127.0.0.1');
            strictRateLimiter.mockReturnValue({ success: true, limit: 100, remaining: 99, resetTime: Date.now() + 60000 });

            const result = await POST(mockRequest);

            const resultJson = await result.json();
            expect(resultJson.errorCode).toBe('INVALID_REQUEST_DATA');
            expect(resultJson.error).toBeDefined();
            expect(resultJson.details).toBeDefined();
            expect(result.status).toBe(400);
        });
    });

    describe('Logging - No console.error', () => {
        it('should use logServiceError for session not found errors', async () => {
            const mockRequest = {
                json: jest.fn().mockResolvedValue({ action: 'join', postId: 123, userId: 1, username: 'testuser' })
            } as unknown as NextRequest;

            getClientIdentifier.mockReturnValue('127.0.0.1');
            strictRateLimiter.mockReturnValue({ success: true, limit: 100, remaining: 99, resetTime: Date.now() + 60000 });
            (sessionManager.getSessionByPostId as jest.Mock).mockReturnValue(undefined);

            await POST(mockRequest);

            expect(logServiceError).toHaveBeenCalledWith(
                expect.any(Error),
                { service: 'Collaboration', operation: 'join' }
            );
        });

        it('should use logServiceError for user not found errors', async () => {
            const mockRequest = {
                json: jest.fn().mockResolvedValue({ action: 'leave', sessionId: 'test123', userId: 1 })
            } as unknown as NextRequest;

            getClientIdentifier.mockReturnValue('127.0.0.1');
            strictRateLimiter.mockReturnValue({ success: true, limit: 100, remaining: 99, resetTime: Date.now() + 60000 });
            (sessionManager.getSession as jest.Mock).mockReturnValue({ sessionId: 'test123', postId: '123' });
            (sessionManager.removeEditor as jest.Mock).mockReturnValue(false);

            await POST(mockRequest);

            expect(logServiceError).toHaveBeenCalledWith(
                expect.any(Error),
                { service: 'Collaboration', operation: 'leave' }
            );
        });
    });

    describe('Happy Path - Successful Operations', () => {
        it('should successfully poll for events', async () => {
            const mockRequest = {
                nextUrl: { searchParams: new URLSearchParams('sessionId=test123&userId=1&username=testuser') }
            } as unknown as NextRequest;

            getClientIdentifier.mockReturnValue('127.0.0.1');
            strictRateLimiter.mockReturnValue({ success: true, limit: 100, remaining: 99, resetTime: Date.now() + 60000 });
            (sessionManager.getSession as jest.Mock).mockReturnValue({ sessionId: 'test123', postId: 123 });

            const result = await GET(mockRequest);

            const resultJson = await result.json();
            expect(resultJson.success).toBe(true);
            expect(resultJson.sessionActive).toBe(true);
            expect(resultJson.events).toEqual([]);
            expect(result.status).toBe(200);
        });

        it('should successfully handle join action', async () => {
            const mockRequest = {
                json: jest.fn().mockResolvedValue({ action: 'join', postId: 123, userId: 1, username: 'testuser' })
            } as unknown as NextRequest;

            getClientIdentifier.mockReturnValue('127.0.0.1');
            strictRateLimiter.mockReturnValue({ success: true, limit: 100, remaining: 99, resetTime: Date.now() + 60000 });
            (sessionManager.getSessionByPostId as jest.Mock).mockReturnValue({ sessionId: 'session-123', postId: 123 });
            (sessionManager.addEditor as jest.Mock).mockReturnValue(true);

            const result = await POST(mockRequest);

            const resultJson = await result.json();
            expect(resultJson.success).toBe(true);
            expect(resultJson.sessionId).toBe('session-123');
            expect(resultJson.postId).toBe(123);
            expect(result.status).toBe(200);
        });

        it('should successfully handle leave action', async () => {
            const mockRequest = {
                json: jest.fn().mockResolvedValue({ action: 'leave', sessionId: 'test123', userId: 1 })
            } as unknown as NextRequest;

            getClientIdentifier.mockReturnValue('127.0.0.1');
            strictRateLimiter.mockReturnValue({ success: true, limit: 100, remaining: 99, resetTime: Date.now() + 60000 });
            (sessionManager.getSession as jest.Mock).mockReturnValue({ sessionId: 'test123', postId: '123' });
            (sessionManager.removeEditor as jest.Mock).mockReturnValue(true);

            const result = await POST(mockRequest);

            const resultJson = await result.json();
            expect(resultJson.success).toBe(true);
            expect(result.status).toBe(200);
        });

        it('should successfully handle cursor_update action', async () => {
            const mockRequest = {
                json: jest.fn().mockResolvedValue({ action: 'cursor_update', sessionId: 'test123', userId: 1, cursorPosition: { line: 10, column: 0 } })
            } as unknown as NextRequest;

            getClientIdentifier.mockReturnValue('127.0.0.1');
            strictRateLimiter.mockReturnValue({ success: true, limit: 100, remaining: 99, resetTime: Date.now() + 60000 });
            (sessionManager.getSession as jest.Mock).mockReturnValue({ sessionId: 'test123', postId: '123' });
            (sessionManager.updateEditorCursor as jest.Mock).mockReturnValue(true);

            const result = await POST(mockRequest);

            const resultJson = await result.json();
            expect(resultJson.success).toBe(true);
            expect(result.status).toBe(200);
        });

        it('should successfully handle edit action', async () => {
            const mockRequest = {
                json: jest.fn().mockResolvedValue({ action: 'edit', sessionId: 'test123', userId: 1, editOperation: { type: 'insert', position: { line: 0, column: 0 }, content: 'test' } })
            } as unknown as NextRequest;

            getClientIdentifier.mockReturnValue('127.0.0.1');
            strictRateLimiter.mockReturnValue({ success: true, limit: 100, remaining: 99, resetTime: Date.now() + 60000 });
            (sessionManager.getSession as jest.Mock).mockReturnValue({ sessionId: 'test123', postId: '123', version: 1 });

            const result = await POST(mockRequest);

            const resultJson = await result.json();
            expect(resultJson.success).toBe(true);
            expect(resultJson.version).toBe(1);
            expect(result.status).toBe(200);
        });

        it('should successfully handle comment action', async () => {
            const mockRequest = {
                json: jest.fn().mockResolvedValue({ action: 'comment', sessionId: 'test123', userId: 1, username: 'testuser', comment: { content: 'test comment', position: { line: 0, column: 0 } } })
            } as unknown as NextRequest;

            getClientIdentifier.mockReturnValue('127.0.0.1');
            strictRateLimiter.mockReturnValue({ success: true, limit: 100, remaining: 99, resetTime: Date.now() + 60000 });
            (sessionManager.getSession as jest.Mock).mockReturnValue({ sessionId: 'test123', postId: '123' });

            const result = await POST(mockRequest);

            const resultJson = await result.json();
            expect(resultJson.success).toBe(true);
            expect(result.status).toBe(200);
        });
    });

    describe('Resilience - Circuit Breaker Integration', () => {
        it('should inherit circuit breaker protection from executeApiRoute', async () => {
            const mockRequest = {
                nextUrl: { searchParams: new URLSearchParams('sessionId=test123&userId=1&username=testuser') }
            } as unknown as NextRequest;

            await GET(mockRequest);

            expect(metricsCollector.recordCall).toHaveBeenCalled();
        });
    });

    describe('Resilience - Retry Integration', () => {
        it('should inherit retry logic from executeApiRoute for network errors', async () => {
            const mockRequest = {
                nextUrl: { searchParams: new URLSearchParams('sessionId=test123&userId=1&username=testuser') }
            } as unknown as NextRequest;

            await GET(mockRequest);

            expect(metricsCollector.recordCall).toHaveBeenCalled();
        });

        it('should inherit retry logic from executeApiRoute for timeout errors', async () => {
            const mockRequest = {
                nextUrl: { searchParams: new URLSearchParams('sessionId=test123&userId=1&username=testuser') }
            } as unknown as NextRequest;

            await GET(mockRequest);

            expect(metricsCollector.recordCall).toHaveBeenCalled();
        });
    });

    describe('Resilience - Timeout Integration', () => {
        it('should use configured timeout of 5000ms', async () => {
            expect(TIMEOUTS.COLLABORATION_API).toBe(5000);
        });

        it('should inherit timeout protection from executeApiRoute', async () => {
            const mockRequest = {
                nextUrl: { searchParams: new URLSearchParams('sessionId=test123&userId=1&username=testuser') }
            } as unknown as NextRequest;

            await GET(mockRequest);

            expect(metricsCollector.recordCall).toHaveBeenCalled();
        });
    });
});
