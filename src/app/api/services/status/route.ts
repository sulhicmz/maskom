import { NextResponse } from 'next/server';
import { emailService } from '@/services/email';
import { authService } from '@/services/auth';

export async function GET() {
    const emailMetrics = emailService.getMetrics();
    const authMetrics = authService.getMetrics();

    const emailCircuitBreaker = emailService.getCircuitBreakerState();
    const authCircuitBreaker = authService.getCircuitBreakerState();

    const response = {
        timestamp: new Date().toISOString(),
        email: {
            metrics: emailMetrics,
            circuitBreaker: emailCircuitBreaker
        },
        auth: {
            metrics: authMetrics,
            circuitBreaker: authCircuitBreaker
        }
    };

    return NextResponse.json(response, {
        status: 200,
        headers: {
            'Content-Type': 'application/json',
            'Cache-Control': 'no-cache, no-store, must-revalidate'
        }
    });
}
