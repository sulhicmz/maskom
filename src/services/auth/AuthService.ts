import type { IAuthService, LoginCredentials, RegisterData, AuthResult, User } from './types';
import { validateEmail, validatePassword } from '@/utils/validation';

class AuthService implements IAuthService {
    private currentUser: User | null = null;

    async login(credentials: LoginCredentials): Promise<AuthResult> {
        try {
            if (!credentials.email || !credentials.password) {
                return {
                    success: false,
                    error: 'Email dan kata sandi diperlukan',
                };
            }

            const emailValidation = validateEmail(credentials.email);
            if (!emailValidation.valid) {
                return {
                    success: false,
                    error: emailValidation.error || 'Format email tidak valid',
                };
            }

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
        } catch (error) {
            return {
                success: false,
                error: error instanceof Error ? error.message : 'Terjadi kesalahan saat login',
            };
        }
    }

    async register(userData: RegisterData): Promise<AuthResult> {
        try {
            if (!userData.name || !userData.email || !userData.password) {
                return {
                    success: false,
                    error: 'Nama, email, dan kata sandi diperlukan',
                };
            }

            const emailValidation = validateEmail(userData.email);
            if (!emailValidation.valid) {
                return {
                    success: false,
                    error: emailValidation.error || 'Format email tidak valid',
                };
            }

            const passwordValidation = validatePassword(userData.password);
            if (!passwordValidation.valid) {
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

            return {
                success: true,
                message: 'Registrasi berhasil dikirim',
                user: this.currentUser,
                token: 'mock-jwt-token',
            };
        } catch (error) {
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
