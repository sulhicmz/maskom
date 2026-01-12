import type { IAuthService, LoginCredentials, RegisterData, User, AuthResult } from './types';
import { validateEmail, validatePassword } from '@/utils/validation';
import { RateLimiter } from '@/utils/rateLimiter';
import metricsCollector from '@/utils/metrics';
import { 
    ServiceErrorCode, 
    ServiceValidationError,
    executeWithResilience,
    RateLimitExceededError,
    createSuccessResult,
    createErrorResult
} from '@/services/common';
import { RATE_LIMITS } from '@/constants';
import { logServiceError, logServiceSuccess } from '@/services/common';
import { CircuitBreaker, withTimeout } from '@/utils/resilience';

class AuthService implements IAuthService {
    private currentUser: User | null = null;
    private loginRateLimiter: RateLimiter;
    private registerRateLimiter: RateLimiter;
    private circuitBreaker: CircuitBreaker;

    constructor() {
        this.loginRateLimiter = new RateLimiter(RATE_LIMITS.LOGIN);
        this.registerRateLimiter = new RateLimiter(RATE_LIMITS.REGISTER);
        this.circuitBreaker = new CircuitBreaker({
            failureThreshold: 50,
            resetTimeoutMs: 60000,
            monitoringPeriodMs: 60000
        });
    }

    private async loginWithTimeout(credentials: LoginCredentials): Promise<AuthResult> {
        return withTimeout(
            this.loginWithoutResilience(credentials),
            { timeoutMs: 5000, timeoutError: 'Login request timed out' }
        );
    }

    private async registerWithTimeout(userData: RegisterData): Promise<AuthResult> {
        return withTimeout(
            this.registerWithoutResilience(userData),
            { timeoutMs: 5000, timeoutError: 'Registration request timed out' }
        );
    }

    private validateCredentials(email: string, password: string, requireName: boolean = false, name?: string): void {
        if (requireName && (!name || !email || !password)) {
            const error = new ServiceValidationError('Nama, email, dan kata sandi diperlukan');
            throw error;
        }

        if (!requireName && (!email || !password)) {
            const error = new ServiceValidationError('Email dan kata sandi diperlukan');
            throw error;
        }

        const emailValidation = validateEmail(email);
        if (!emailValidation.valid) {
            const error = new ServiceValidationError(emailValidation.error || 'Format email tidak valid');
            throw error;
        }

        const passwordValidation = validatePassword(password);
        if (!passwordValidation.valid) {
            const error = new ServiceValidationError(passwordValidation.error || 'Kata sandi tidak valid');
            throw error;
        }
    }

    private async loginWithoutResilience(credentials: LoginCredentials): Promise<AuthResult> {
        this.validateCredentials(credentials.email, credentials.password, false);

        this.currentUser = {
            id: this.generateUserId(credentials.email),
            name: this.extractNameFromEmail(credentials.email),
            email: credentials.email,
        };

        return {
            success: true,
            message: 'Berhasil masuk ke portal',
            user: this.currentUser,
            token: 'mock-jwt-token',
        };
    }

    private async registerWithoutResilience(userData: RegisterData): Promise<AuthResult> {
        this.validateCredentials(userData.email, userData.password, true, userData.name);

        this.currentUser = {
            id: this.generateUserId(userData.email),
            name: userData.name,
            email: userData.email,
        };

        return {
            success: true,
            message: 'Registrasi berhasil dikirim',
            user: this.currentUser,
            token: 'mock-jwt-token',
        };
    }

    async login(credentials: LoginCredentials): Promise<AuthResult> {
        try {
            const result = await executeWithResilience<AuthResult, LoginCredentials>(
                {
                    operationName: 'AuthService.login',
                    rateLimiter: this.loginRateLimiter,
                    identifier: credentials.email,
                    circuitBreaker: this.circuitBreaker,
                    timeoutMs: 5000
                },
                this.loginWithTimeout.bind(this),
                credentials
            );

            return result;
        } catch (error) {
            if (error instanceof RateLimitExceededError && error.limitCheck) {
                const secondsRemaining = Math.ceil(((error.limitCheck.resetTime || Date.now()) - Date.now()) / 1000);
                return createErrorResult(
                    error.limitCheck.error?.includes('Too many attempts')
                        ? `Terlalu banyak percobaan. Silakan coba lagi dalam ${secondsRemaining} detik.`
                        : 'Terlalu banyak percobaan. Silakan coba lagi nanti.',
                    ServiceErrorCode.RATE_LIMIT,
                    { rateLimited: true }
                );
            }

            const standardizedError = error instanceof Error ? error : new Error('Unknown error');
            
            if (standardizedError instanceof ServiceValidationError) {
                return createErrorResult(standardizedError.message, ServiceErrorCode.VALIDATION);
            }

            return createErrorResult(standardizedError.message);
        }
    }

    async register(userData: RegisterData): Promise<AuthResult> {
        try {
            const result = await executeWithResilience<AuthResult, RegisterData>(
                {
                    operationName: 'AuthService.register',
                    rateLimiter: this.registerRateLimiter,
                    identifier: userData.email,
                    circuitBreaker: this.circuitBreaker,
                    timeoutMs: 5000
                },
                this.registerWithTimeout.bind(this),
                userData
            );

            return result;
        } catch (error) {
            if (error instanceof RateLimitExceededError && error.limitCheck) {
                const secondsRemaining = Math.ceil(((error.limitCheck.resetTime || Date.now()) - Date.now()) / 1000);
                return createErrorResult(
                    error.limitCheck.error?.includes('Too many attempts')
                        ? `Terlalu banyak percobaan. Silakan coba lagi dalam ${secondsRemaining} detik.`
                        : 'Terlalu banyak percobaan. Silakan coba lagi nanti.',
                    ServiceErrorCode.RATE_LIMIT,
                    { rateLimited: true }
                );
            }

            const standardizedError = error instanceof Error ? error : new Error('Unknown error');
            
            if (standardizedError instanceof ServiceValidationError) {
                return createErrorResult(standardizedError.message, ServiceErrorCode.VALIDATION);
            }

            return createErrorResult(standardizedError.message);
        }
    }

    async logout(): Promise<AuthResult> {
        try {
            this.currentUser = null;
            logServiceSuccess('AuthService', 'logout');

            return {
                success: true,
                message: 'Berhasil keluar',
            };
        } catch (error) {
            const errorMessage = error instanceof Error ? error.message : 'Terjadi kesalahan saat logout';
            const standardError = new Error(errorMessage);
            logServiceError(standardError, { service: 'AuthService', operation: 'logout' });
            
            return {
                success: false,
                error: errorMessage,
                errorCode: ServiceErrorCode.UNKNOWN,
            };
        }
    }

    async getCurrentUser(): Promise<User | null> {
        return this.currentUser;
    }

    getLoginRateLimitStatus(email: string): { count: number; firstAttempt: number; lockedUntil?: number | null; attemptsRemaining: number } {
        const status = this.loginRateLimiter.getStatus(email);
        return {
            count: status.count,
            firstAttempt: status.firstAttempt,
            lockedUntil: status.lockedUntil,
            attemptsRemaining: Math.max(0, RATE_LIMITS.LOGIN.maxAttempts - status.count)
        };
    }

    getRegisterRateLimitStatus(email: string): { count: number; firstAttempt: number; lockedUntil?: number | null; attemptsRemaining: number } {
        const status = this.registerRateLimiter.getStatus(email);
        return {
            count: status.count,
            firstAttempt: status.firstAttempt,
            lockedUntil: status.lockedUntil,
            attemptsRemaining: Math.max(0, RATE_LIMITS.REGISTER.maxAttempts - status.count)
        };
    }

    resetLoginRateLimit(email: string): void {
        this.loginRateLimiter.reset(email);
    }

    resetRegisterRateLimit(email: string): void {
        this.registerRateLimiter.reset(email);
    }

    resetAllRateLimits(): void {
        this.loginRateLimiter.resetAll();
        this.registerRateLimiter.resetAll();
    }

    getMetrics() {
        const loginMetrics = metricsCollector.getMetrics('AuthService.login');
        const registerMetrics = metricsCollector.getMetrics('AuthService.register');
        return {
            login: loginMetrics,
            register: registerMetrics,
        };
    }

    getCircuitBreakerState() {
        const state = this.circuitBreaker.getState();
        metricsCollector.recordCircuitBreakerState('AuthService', state.isOpen);
        return state;
    }

    resetCircuitBreaker() {
        this.circuitBreaker.reset();
    }

    private generateUserId(email: string): string {
        return `user_${email.replace(/[^a-zA-Z0-9]/g, '_')}`;
    }

    private extractNameFromEmail(email: string): string {
        const localPart = email.split('@')[0];
        return localPart
            .split('.')
            .map(word => word.charAt(0).toUpperCase() + word.slice(1))
            .join(' ');
    }
}

export const authService = new AuthService();
export default authService;
