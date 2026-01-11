import type { IAuthService, LoginCredentials, RegisterData, AuthResult, User } from './types';
import { validateEmail, validatePassword } from '@/utils/validation';
import { RateLimiter } from '@/utils/rateLimiter';
import metricsCollector from '@/utils/metrics';

class AuthService implements IAuthService {
    private currentUser: User | null = null;
    private loginRateLimiter: RateLimiter;
    private registerRateLimiter: RateLimiter;

    constructor() {
        this.loginRateLimiter = new RateLimiter({
            maxAttempts: 5,
            windowMs: 900000,
            cooldownMs: 1800000
        });
        this.registerRateLimiter = new RateLimiter({
            maxAttempts: 5,
            windowMs: 3600000,
            cooldownMs: 7200000
        });
    }

    async login(credentials: LoginCredentials): Promise<AuthResult> {
        try {
            const rateLimitCheck = this.loginRateLimiter.check(credentials.email);
            if (!rateLimitCheck.allowed) {
                metricsCollector.recordCall('AuthService.login', false, 'rate_limit');
                const secondsRemaining = Math.ceil(((rateLimitCheck.resetTime || Date.now()) - Date.now()) / 1000);
                return {
                    success: false,
                    error: rateLimitCheck.error?.includes('Too many attempts')
                        ? `Terlalu banyak percobaan. Silakan coba lagi dalam ${secondsRemaining} detik.`
                        : 'Terlalu banyak percobaan. Silakan coba lagi nanti.',
                };
            }

            if (!credentials.email || !credentials.password) {
                this.loginRateLimiter.recordAttempt(credentials.email);
                metricsCollector.recordCall('AuthService.login', false, 'validation');
                return {
                    success: false,
                    error: 'Email dan kata sandi diperlukan',
                };
            }

            const emailValidation = validateEmail(credentials.email);
            if (!emailValidation.valid) {
                this.loginRateLimiter.recordAttempt(credentials.email);
                metricsCollector.recordCall('AuthService.login', false, 'validation');
                return {
                    success: false,
                    error: emailValidation.error || 'Format email tidak valid',
                };
            }

            const passwordValidation = validatePassword(credentials.password);
            if (!passwordValidation.valid) {
                this.loginRateLimiter.recordAttempt(credentials.email);
                metricsCollector.recordCall('AuthService.login', false, 'validation');
                return {
                    success: false,
                    error: passwordValidation.error || 'Kata sandi tidak valid',
                };
            }

            this.currentUser = {
                id: this.generateUserId(credentials.email),
                name: this.extractNameFromEmail(credentials.email),
                email: credentials.email,
            };

            metricsCollector.recordCall('AuthService.login', true);
            return {
                success: true,
                message: 'Berhasil masuk ke portal',
                user: this.currentUser,
                token: 'mock-jwt-token',
            };
        } catch (error) {
            this.loginRateLimiter.recordAttempt(credentials.email);
            metricsCollector.recordCall('AuthService.login', false, 'unknown');
            return {
                success: false,
                error: error instanceof Error ? error.message : 'Terjadi kesalahan saat login',
            };
        }
    }

    async register(userData: RegisterData): Promise<AuthResult> {
        try {
            const rateLimitCheck = this.registerRateLimiter.check(userData.email);
            if (!rateLimitCheck.allowed) {
                metricsCollector.recordCall('AuthService.register', false, 'rate_limit');
                const secondsRemaining = Math.ceil(((rateLimitCheck.resetTime || Date.now()) - Date.now()) / 1000);
                return {
                    success: false,
                    error: rateLimitCheck.error?.includes('Too many attempts')
                        ? `Terlalu banyak percobaan. Silakan coba lagi dalam ${secondsRemaining} detik.`
                        : 'Terlalu banyak percobaan. Silakan coba lagi nanti.',
                };
            }

            if (!userData.name || !userData.email || !userData.password) {
                this.registerRateLimiter.recordAttempt(userData.email);
                metricsCollector.recordCall('AuthService.register', false, 'validation');
                return {
                    success: false,
                    error: 'Nama, email, dan kata sandi diperlukan',
                };
            }

            const emailValidation = validateEmail(userData.email);
            if (!emailValidation.valid) {
                this.registerRateLimiter.recordAttempt(userData.email);
                metricsCollector.recordCall('AuthService.register', false, 'validation');
                return {
                    success: false,
                    error: emailValidation.error || 'Format email tidak valid',
                };
            }

            const passwordValidation = validatePassword(userData.password);
            if (!passwordValidation.valid) {
                this.registerRateLimiter.recordAttempt(userData.email);
                metricsCollector.recordCall('AuthService.register', false, 'validation');
                return {
                    success: false,
                    error: passwordValidation.error || 'Kata sandi tidak valid',
                };
            }

            this.currentUser = {
                id: this.generateUserId(userData.email),
                name: userData.name,
                email: userData.email,
            };

            metricsCollector.recordCall('AuthService.register', true);
            return {
                success: true,
                message: 'Registrasi berhasil dikirim',
                user: this.currentUser,
                token: 'mock-jwt-token',
            };
        } catch (error) {
            this.registerRateLimiter.recordAttempt(userData.email);
            metricsCollector.recordCall('AuthService.register', false, 'unknown');
            return {
                success: false,
                error: error instanceof Error ? error.message : 'Terjadi kesalahan saat registrasi',
            };
        }
    }

    async logout(): Promise<AuthResult> {
        try {
            this.currentUser = null;

            return {
                success: true,
                message: 'Berhasil keluar',
            };
        } catch (error) {
            return {
                success: false,
                error: error instanceof Error ? error.message : 'Terjadi kesalahan saat logout',
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
            attemptsRemaining: Math.max(0, 5 - status.count)
        };
    }

    getRegisterRateLimitStatus(email: string): { count: number; firstAttempt: number; lockedUntil?: number | null; attemptsRemaining: number } {
        const status = this.registerRateLimiter.getStatus(email);
        return {
            count: status.count,
            firstAttempt: status.firstAttempt,
            lockedUntil: status.lockedUntil,
            attemptsRemaining: Math.max(0, 5 - status.count)
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
