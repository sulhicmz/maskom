import type { IAuthService, LoginCredentials, RegisterData, User, AuthResult } from './types';
import { validateEmail, validatePassword } from '@/utils/validation';
import { RateLimiter } from '@/utils/rateLimiter';
import metricsCollector from '@/utils/metrics';
import { 
    ServiceErrorCode, 
    ServiceValidationError,
    logServiceError,
    logServiceSuccess,
    createErrorResult
} from '@/services/common';
import { RATE_LIMITS } from '@/constants';

class AuthService implements IAuthService {
    private currentUser: User | null = null;
    private loginRateLimiter: RateLimiter;
    private registerRateLimiter: RateLimiter;

    constructor() {
        this.loginRateLimiter = new RateLimiter(RATE_LIMITS.LOGIN);
        this.registerRateLimiter = new RateLimiter(RATE_LIMITS.REGISTER);
    }

    async login(credentials: LoginCredentials): Promise<AuthResult> {
        try {
            const rateLimitCheck = this.loginRateLimiter.check(credentials.email);
            if (!rateLimitCheck.allowed) {
                metricsCollector.recordCall('AuthService.login', false, 'rate_limit');
                const secondsRemaining = Math.ceil(((rateLimitCheck.resetTime || Date.now()) - Date.now()) / 1000);
                return createErrorResult(
                    rateLimitCheck.error?.includes('Too many attempts')
                        ? `Terlalu banyak percobaan. Silakan coba lagi dalam ${secondsRemaining} detik.`
                        : 'Terlalu banyak percobaan. Silakan coba lagi nanti.',
                    ServiceErrorCode.RATE_LIMIT,
                    { rateLimited: true }
                );
            }

            if (!credentials.email || !credentials.password) {
                this.loginRateLimiter.recordAttempt(credentials.email);
                metricsCollector.recordCall('AuthService.login', false, 'validation');
                const error = new ServiceValidationError('Email dan kata sandi diperlukan');
                logServiceError(error, { service: 'AuthService', operation: 'login' });
                return createErrorResult(error);
            }

            const emailValidation = validateEmail(credentials.email);
            if (!emailValidation.valid) {
                this.loginRateLimiter.recordAttempt(credentials.email);
                metricsCollector.recordCall('AuthService.login', false, 'validation');
                const error = new ServiceValidationError(emailValidation.error || 'Format email tidak valid');
                logServiceError(error, { service: 'AuthService', operation: 'login' });
                return createErrorResult(error);
            }

            const passwordValidation = validatePassword(credentials.password);
            if (!passwordValidation.valid) {
                this.loginRateLimiter.recordAttempt(credentials.email);
                metricsCollector.recordCall('AuthService.login', false, 'validation');
                const error = new ServiceValidationError(passwordValidation.error || 'Kata sandi tidak valid');
                logServiceError(error, { service: 'AuthService', operation: 'login' });
                return createErrorResult(error);
            }

            this.currentUser = {
                id: this.generateUserId(credentials.email),
                name: this.extractNameFromEmail(credentials.email),
                email: credentials.email,
            };

            metricsCollector.recordCall('AuthService.login', true);
            logServiceSuccess('AuthService', 'login');
            
            return {
                success: true,
                message: 'Berhasil masuk ke portal',
                user: this.currentUser,
                token: 'mock-jwt-token',
            };
        } catch (error) {
            this.loginRateLimiter.recordAttempt(credentials.email);
            metricsCollector.recordCall('AuthService.login', false, 'unknown');
            const errorMessage = error instanceof Error ? error.message : 'Terjadi kesalahan saat login';
            const standardError = new Error(errorMessage);
            logServiceError(standardError, { service: 'AuthService', operation: 'login' });
            
            return {
                success: false,
                error: errorMessage,
                errorCode: ServiceErrorCode.UNKNOWN,
            };
        }
    }

    async register(userData: RegisterData): Promise<AuthResult> {
        try {
            const rateLimitCheck = this.registerRateLimiter.check(userData.email);
            if (!rateLimitCheck.allowed) {
                metricsCollector.recordCall('AuthService.register', false, 'rate_limit');
                const secondsRemaining = Math.ceil(((rateLimitCheck.resetTime || Date.now()) - Date.now()) / 1000);
                return createErrorResult(
                    rateLimitCheck.error?.includes('Too many attempts')
                        ? `Terlalu banyak percobaan. Silakan coba lagi dalam ${secondsRemaining} detik.`
                        : 'Terlalu banyak percobaan. Silakan coba lagi nanti.',
                    ServiceErrorCode.RATE_LIMIT,
                    { rateLimited: true }
                );
            }

            if (!userData.name || !userData.email || !userData.password) {
                this.registerRateLimiter.recordAttempt(userData.email);
                metricsCollector.recordCall('AuthService.register', false, 'validation');
                const error = new ServiceValidationError('Nama, email, dan kata sandi diperlukan');
                logServiceError(error, { service: 'AuthService', operation: 'register' });
                return createErrorResult(error);
            }

            const emailValidation = validateEmail(userData.email);
            if (!emailValidation.valid) {
                this.registerRateLimiter.recordAttempt(userData.email);
                metricsCollector.recordCall('AuthService.register', false, 'validation');
                const error = new ServiceValidationError(emailValidation.error || 'Format email tidak valid');
                logServiceError(error, { service: 'AuthService', operation: 'register' });
                return createErrorResult(error);
            }

            const passwordValidation = validatePassword(userData.password);
            if (!passwordValidation.valid) {
                this.registerRateLimiter.recordAttempt(userData.email);
                metricsCollector.recordCall('AuthService.register', false, 'validation');
                const error = new ServiceValidationError(passwordValidation.error || 'Kata sandi tidak valid');
                logServiceError(error, { service: 'AuthService', operation: 'register' });
                return createErrorResult(error);
            }

            this.currentUser = {
                id: this.generateUserId(userData.email),
                name: userData.name,
                email: userData.email,
            };

            metricsCollector.recordCall('AuthService.register', true);
            logServiceSuccess('AuthService', 'register');
            
            return {
                success: true,
                message: 'Registrasi berhasil dikirim',
                user: this.currentUser,
                token: 'mock-jwt-token',
            };
        } catch (error) {
            this.registerRateLimiter.recordAttempt(userData.email);
            metricsCollector.recordCall('AuthService.register', false, 'unknown');
            const errorMessage = error instanceof Error ? error.message : 'Terjadi kesalahan saat registrasi';
            const standardError = new Error(errorMessage);
            logServiceError(standardError, { service: 'AuthService', operation: 'register' });
            
            return {
                success: false,
                error: errorMessage,
                errorCode: ServiceErrorCode.UNKNOWN,
            };
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
