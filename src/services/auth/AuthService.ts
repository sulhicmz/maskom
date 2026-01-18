import type { IAuthService, LoginCredentials, RegisterData, User, AuthResult, MFASetupData } from './types';
import { validateEmail, validatePassword } from '@/utils/validation';
import { RateLimiter } from '@/utils/rateLimiter';
import metricsCollector from '@/utils/metrics';
import {
    ServiceErrorCode,
    ServiceValidationError,
    executeWithResilience,
    RateLimitExceededError,
    createErrorResult,
    createRateLimitErrorResult
} from '@/services/common';
import { RATE_LIMITS, TIMEOUTS, MS_TO_SECONDS, CIRCUIT_BREAKER_CONFIG } from '@/constants';
import { logServiceError, logServiceSuccess } from '@/services/common';
import { CircuitBreaker, withTimeout } from '@/utils/resilience';
import { generateUUID } from '@/utils/uuid';
import { UserRole, isValidRole, Permission, MFAStatus } from '@/types';
import { hasPermission as checkPermission } from '@/data/rolesData';
import { verifyTOTP, createMFASetupData } from '@/utils/mfa';
import { logActivity, ActivityAction } from '@/utils/activityLogger';

class AuthService implements IAuthService {
    private currentUser: User | null = null;
    private loginRateLimiter: RateLimiter;
    private registerRateLimiter: RateLimiter;
    private circuitBreaker: CircuitBreaker;
    private mfaSetupData: MFASetupData | null = null;

    constructor() {
        this.loginRateLimiter = new RateLimiter(RATE_LIMITS.LOGIN);
        this.registerRateLimiter = new RateLimiter(RATE_LIMITS.REGISTER);
        this.circuitBreaker = new CircuitBreaker(CIRCUIT_BREAKER_CONFIG.AUTH_SERVICE);
    }

    private async loginWithTimeout(credentials: LoginCredentials): Promise<AuthResult> {
        return withTimeout(
            this.loginWithoutResilience(credentials),
            { timeoutMs: TIMEOUTS.AUTH_LOGIN, timeoutError: 'Login request timed out' }
        );
    }

    private async registerWithTimeout(userData: RegisterData): Promise<AuthResult> {
        return withTimeout(
            this.registerWithoutResilience(userData),
            { timeoutMs: TIMEOUTS.AUTH_REGISTER, timeoutError: 'Registration request timed out' }
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
 
        const role: UserRole = 'user';
        const userId = this.generateUserId();
 
        this.currentUser = {
            id: userId,
            name: this.extractNameFromEmail(credentials.email),
            email: credentials.email,
            role,
            mfaEnabled: false,
        };
 
        const mfaStatus = await this.getMFAStatus();
 
        if (mfaStatus === 'required' && !credentials.totpCode) {
            logActivity(
                userId,
                ActivityAction.LOGIN,
                'auth',
                userId,
                { method: 'password', email: credentials.email },
                false,
                'MFA required for admin role'
            );
            return {
                success: false,
                message: 'MFA diperlukan untuk peran admin',
                errorCode: ServiceErrorCode.VALIDATION,
                user: this.currentUser,
            };
        }
 
        if (credentials.totpCode && mfaStatus === 'required') {
            const mfaResult = await this.verifyMFA(credentials.totpCode);
            if (!mfaResult.success) {
                logActivity(
                    userId,
                    ActivityAction.LOGIN,
                    'auth',
                    userId,
                    { method: 'mfa', email: credentials.email },
                    false,
                    'Invalid MFA code'
                );
                return mfaResult;
            }
        }
 
        logActivity(
            userId,
            ActivityAction.LOGIN,
            'auth',
            userId,
            { method: mfaStatus === 'enabled' ? 'mfa' : 'password', email: credentials.email },
            true
        );
 
        return {
            success: true,
            message: 'Berhasil masuk ke portal',
            user: this.currentUser,
            token: 'mock-jwt-token',
        };
    }

    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    private handleAuthError(error: unknown, _operation: string): AuthResult {
        if (error instanceof RateLimitExceededError) {
            return createRateLimitErrorResult(error, MS_TO_SECONDS);
        }

        const standardizedError = error instanceof Error ? error : new Error('Unknown error');

        if (standardizedError instanceof ServiceValidationError) {
            return createErrorResult(standardizedError.message, ServiceErrorCode.VALIDATION);
        }

        return createErrorResult(standardizedError.message);
    }

    private async registerWithoutResilience(userData: RegisterData): Promise<AuthResult> {
        this.validateCredentials(userData.email, userData.password, true, userData.name);
 
        const role: UserRole = userData.role && isValidRole(userData.role) ? userData.role : 'user';
        const userId = this.generateUserId();
 
        this.currentUser = {
            id: userId,
            name: userData.name,
            email: userData.email,
            role,
            mfaEnabled: false,
        };
 
        logActivity(
            userId,
            ActivityAction.USER_REGISTER,
            'auth',
            userId,
            { email: userData.email, role }
        );
 
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
                    timeoutMs: TIMEOUTS.AUTH_LOGIN
                },
                this.loginWithTimeout.bind(this),
                credentials
            );

            return result;
        } catch (error) {
            return this.handleAuthError(error, 'login');
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
                    timeoutMs: TIMEOUTS.AUTH_REGISTER
                },
                this.registerWithTimeout.bind(this),
                userData
            );

            return result;
        } catch (error) {
            return this.handleAuthError(error, 'register');
        }
    }

    async logout(): Promise<AuthResult> {
        const userId = this.currentUser?.id;
        try {
            if (userId) {
                logActivity(
                    userId,
                    ActivityAction.LOGOUT,
                    'auth',
                    userId,
                    {}
                );
            }
            this.currentUser = null;
            this.mfaSetupData = null;
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

    async getCurrentUserRole(): Promise<UserRole | null> {
        return this.currentUser?.role || null;
    }

    async hasPermission(permission: Permission): Promise<boolean> {
        if (!this.currentUser) {
            return false;
        }
        return checkPermission(this.currentUser.role, permission);
    }

    async hasRole(role: UserRole): Promise<boolean> {
        if (!this.currentUser) {
            return false;
        }
        return this.currentUser.role === role;
    }

    private getRateLimitStatus(rateLimiter: RateLimiter, maxAttempts: number, email: string): { count: number; firstAttempt: number; lockedUntil?: number | null; attemptsRemaining: number } {
        const status = rateLimiter.getStatus(email);
        return {
            count: status.count,
            firstAttempt: status.firstAttempt,
            lockedUntil: status.lockedUntil,
            attemptsRemaining: Math.max(0, maxAttempts - status.count)
        };
    }

    getLoginRateLimitStatus(email: string): { count: number; firstAttempt: number; lockedUntil?: number | null; attemptsRemaining: number } {
        return this.getRateLimitStatus(this.loginRateLimiter, RATE_LIMITS.LOGIN.maxAttempts, email);
    }

    getRegisterRateLimitStatus(email: string): { count: number; firstAttempt: number; lockedUntil?: number | null; attemptsRemaining: number } {
        return this.getRateLimitStatus(this.registerRateLimiter, RATE_LIMITS.REGISTER.maxAttempts, email);
    }

    private resetRateLimit(rateLimiter: RateLimiter, email: string): void {
        rateLimiter.reset(email);
    }

    resetLoginRateLimit(email: string): void {
        this.resetRateLimit(this.loginRateLimiter, email);
    }

    resetRegisterRateLimit(email: string): void {
        this.resetRateLimit(this.registerRateLimiter, email);
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

    private generateUserId(): string {
        return generateUUID();
    }

    private extractNameFromEmail(email: string): string {
        if (!email || !email.includes('@')) {
            return 'User';
        }

        const localPart = email.split('@')[0];
        
        if (!localPart || localPart.trim().length === 0) {
            return 'User';
        }

        const nameParts = localPart.split('.').filter(part => part.trim().length > 0);
        
        if (nameParts.length === 0) {
            return 'User';
        }

        return nameParts
            .map(word => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
            .join(' ');
    }

    async enableMFA(totpCode: string): Promise<AuthResult> {
        try {
            if (!this.currentUser) {
                return createErrorResult('User not authenticated', ServiceErrorCode.VALIDATION);
            }
 
            if (!this.mfaSetupData) {
                return createErrorResult('MFA setup not initiated', ServiceErrorCode.VALIDATION);
            }
 
            const isValid = await verifyTOTP({
                secret: this.mfaSetupData.secret,
                code: totpCode,
            });
 
            if (!isValid) {
                return createErrorResult('Invalid TOTP code', ServiceErrorCode.VALIDATION);
            }
 
            this.currentUser.mfaEnabled = true;
            this.currentUser.mfaSecret = this.mfaSetupData.secret;
            this.currentUser.mfaBackupCodes = this.mfaSetupData.backupCodes;
            this.currentUser.mfaEnabledAt = new Date().toISOString();
            this.mfaSetupData = null;

            logActivity(
                this.currentUser.id,
                ActivityAction.MFA_ENABLED,
                'auth',
                this.currentUser.id,
                { method: 'totp', app: 'Google Authenticator' }
            );
 
            logServiceSuccess('AuthService', 'enableMFA');

            return {
                success: true,
                message: 'MFA berhasil diaktifkan',
                user: this.currentUser,
            };
        } catch (error) {
            const errorMessage = error instanceof Error ? error.message : 'Terjadi kesalahan saat mengaktifkan MFA';
            const standardError = new Error(errorMessage);
            logServiceError(standardError, { service: 'AuthService', operation: 'enableMFA' });
            
            return createErrorResult(errorMessage);
        }
    }

    async disableMFA(password: string): Promise<AuthResult> {
        try {
            if (!this.currentUser) {
                return createErrorResult('User not authenticated', ServiceErrorCode.VALIDATION);
            }
 
            const passwordValidation = validatePassword(password);
            if (!passwordValidation.valid) {
                return createErrorResult(passwordValidation.error || 'Invalid password', ServiceErrorCode.VALIDATION);
            }
 
            this.currentUser.mfaEnabled = false;
            this.currentUser.mfaSecret = undefined;
            this.currentUser.mfaBackupCodes = undefined;
            this.currentUser.mfaEnabledAt = undefined;

            logActivity(
                this.currentUser.id,
                ActivityAction.MFA_DISABLED,
                'auth',
                this.currentUser.id,
                {}
            );
 
            logServiceSuccess('AuthService', 'disableMFA');

            return {
                success: true,
                message: 'MFA berhasil dinonaktifkan',
                user: this.currentUser,
            };
        } catch (error) {
            const errorMessage = error instanceof Error ? error.message : 'Terjadi kesalahan saat menonaktifkan MFA';
            const standardError = new Error(errorMessage);
            logServiceError(standardError, { service: 'AuthService', operation: 'disableMFA' });

            return createErrorResult(errorMessage);
        }
    }

    async verifyMFA(totpCode: string, backupCode?: string): Promise<AuthResult> {
        try {
            if (!this.currentUser || !this.currentUser.mfaEnabled) {
                return createErrorResult('MFA not enabled', ServiceErrorCode.VALIDATION);
            }

            if (backupCode) {
                if (!this.currentUser.mfaBackupCodes || !this.currentUser.mfaBackupCodes.includes(backupCode)) {
                    return createErrorResult('Invalid backup code', ServiceErrorCode.VALIDATION);
                }

                this.currentUser.mfaBackupCodes = this.currentUser.mfaBackupCodes.filter(code => code !== backupCode);

                logServiceSuccess('AuthService', 'verifyMFA (backup code)');

                return {
                    success: true,
                    message: 'Backup code verified',
                    user: this.currentUser,
                };
            }

            if (!this.currentUser.mfaSecret) {
                return createErrorResult('MFA secret not found', ServiceErrorCode.VALIDATION);
            }

            const isValid = await verifyTOTP({
                secret: this.currentUser.mfaSecret,
                code: totpCode,
            });

            if (!isValid) {
                return createErrorResult('Invalid TOTP code', ServiceErrorCode.VALIDATION);
            }

            logServiceSuccess('AuthService', 'verifyMFA');

            return {
                success: true,
                message: 'MFA berhasil diverifikasi',
                user: this.currentUser,
            };
        } catch (error) {
            const errorMessage = error instanceof Error ? error.message : 'Terjadi kesalahan saat memverifikasi MFA';
            const standardError = new Error(errorMessage);
            logServiceError(standardError, { service: 'AuthService', operation: 'verifyMFA' });
            
            return createErrorResult(errorMessage);
        }
    }

    async getMFAStatus(): Promise<MFAStatus> {
        if (!this.currentUser) {
            return 'disabled';
        }

        if (this.currentUser.role === 'admin' && !this.currentUser.mfaEnabled) {
            return 'required';
        }

        return this.currentUser.mfaEnabled ? 'enabled' : 'disabled';
    }

    async regenerateBackupCodes(password: string): Promise<AuthResult> {
        try {
            if (!this.currentUser || !this.currentUser.mfaEnabled) {
                return createErrorResult('MFA not enabled', ServiceErrorCode.VALIDATION);
            }
 
            const passwordValidation = validatePassword(password);
            if (!passwordValidation.valid) {
                return createErrorResult(passwordValidation.error || 'Invalid password', ServiceErrorCode.VALIDATION);
            }
 
            const newBackupCodes = await (await import('@/utils/mfa')).generateBackupCodes();
            this.currentUser.mfaBackupCodes = newBackupCodes;

            logActivity(
                this.currentUser.id,
                ActivityAction.BACKUP_CODES_GENERATED,
                'auth',
                this.currentUser.id,
                { codesGenerated: newBackupCodes.length }
            );
 
            logServiceSuccess('AuthService', 'regenerateBackupCodes');

            return {
                success: true,
                message: 'Kode cadangan berhasil dibuat ulang',
                user: this.currentUser,
                metadata: {
                    backupCodes: newBackupCodes,
                },
            };
        } catch (error) {
            const errorMessage = error instanceof Error ? error.message : 'Terjadi kesalahan saat membuat ulang kode cadangan';
            const standardError = new Error(errorMessage);
            logServiceError(standardError, { service: 'AuthService', operation: 'regenerateBackupCodes' });
            
            return createErrorResult(errorMessage);
        }
    }

    async initiateMFASetup(): Promise<AuthResult> {
        try {
            if (!this.currentUser) {
                return createErrorResult('User not authenticated', ServiceErrorCode.VALIDATION);
            }

            if (this.currentUser.mfaEnabled) {
                return createErrorResult('MFA already enabled', ServiceErrorCode.VALIDATION);
            }

            const setupData = await createMFASetupData(this.currentUser.email);
            this.mfaSetupData = setupData;

            logServiceSuccess('AuthService', 'initiateMFASetup');

            return {
                success: true,
                message: 'MFA setup initiated',
                mfaSetupData: setupData,
            };
        } catch (error) {
            const errorMessage = error instanceof Error ? error.message : 'Terjadi kesalahan saat inisialisasi MFA';
            const standardError = new Error(errorMessage);
            logServiceError(standardError, { service: 'AuthService', operation: 'initiateMFASetup' });
            
            return createErrorResult(errorMessage);
        }
    }
}

export const authService = new AuthService();
export default authService;
