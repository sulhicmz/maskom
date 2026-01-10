import type { IAuthService, LoginCredentials, RegisterData, AuthResult, User } from './types';

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

            const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
            if (!emailRegex.test(credentials.email)) {
                return {
                    success: false,
                    error: 'Format email tidak valid',
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

            const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
            if (!emailRegex.test(userData.email)) {
                return {
                    success: false,
                    error: 'Format email tidak valid',
                };
            }

            if (userData.password.length < 8) {
                return {
                    success: false,
                    error: 'Kata sandi minimal 8 karakter',
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
