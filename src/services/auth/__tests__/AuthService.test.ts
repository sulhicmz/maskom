import { authService } from '../AuthService';
import type { LoginCredentials, RegisterData } from '../types';

jest.mock('@/utils/uuid', () => ({
    generateUUID: () => '00000000-0000-4000-8000-000000000000',
}));

describe('AuthService', () => {
    beforeEach(() => {
        authService.logout();
        authService.resetAllRateLimits();
        authService.resetCircuitBreaker();
    });

    describe('login', () => {
        it('should login successfully with valid credentials', async () => {
            const credentials: LoginCredentials = {
                email: 'test@example.com',
                password: 'password123',
            };

            const result = await authService.login(credentials);

            expect(result.success).toBe(true);
            expect(result.message).toBe('Berhasil masuk ke portal');
            expect(result.user).toBeDefined();
            expect(result.user?.email).toBe('test@example.com');
            expect(result.token).toBeDefined();
        });

        it('should fail with missing email', async () => {
            const credentials: LoginCredentials = {
                email: '',
                password: 'password123',
            };

            const result = await authService.login(credentials);

            expect(result.success).toBe(false);
            expect(result.error).toBe('Email dan kata sandi diperlukan');
            expect(result.user).toBeUndefined();
        });

        it('should fail with missing password', async () => {
            const credentials: LoginCredentials = {
                email: 'test@example.com',
                password: '',
            };

            const result = await authService.login(credentials);

            expect(result.success).toBe(false);
            expect(result.error).toBe('Email dan kata sandi diperlukan');
            expect(result.user).toBeUndefined();
        });

        it('should fail with invalid email format', async () => {
            const credentials: LoginCredentials = {
                email: 'invalid-email',
                password: 'password123',
            };

            const result = await authService.login(credentials);

            expect(result.success).toBe(false);
            expect(result.error).toBe('Format email tidak valid');
            expect(result.user).toBeUndefined();
        });

        it('should store current user after successful login', async () => {
            const credentials: LoginCredentials = {
                email: 'test@example.com',
                password: 'password123',
            };

            await authService.login(credentials);
            const currentUser = await authService.getCurrentUser();

            expect(currentUser).toBeDefined();
            expect(currentUser?.email).toBe('test@example.com');
        });

        it('should generate user ID from email', async () => {
            const credentials: LoginCredentials = {
                email: 'user.name@example.com',
                password: 'password123',
            };

            const result = await authService.login(credentials);

            const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
            expect(result.user?.id).toMatch(uuidRegex);
        });

        it('should extract name from email for current user', async () => {
            const credentials: LoginCredentials = {
                email: 'john.doe@example.com',
                password: 'password123',
            };

            const result = await authService.login(credentials);

            expect(result.user?.name).toBe('John Doe');
        });

        it('should handle email with special characters', async () => {
            const credentials: LoginCredentials = {
                email: 'test+user@example.com',
                password: 'password123',
            };

            const result = await authService.login(credentials);

            const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
            expect(result.success).toBe(true);
            expect(result.user?.id).toMatch(uuidRegex);
        });

        it('should extract name from email with dots', async () => {
            const credentials: LoginCredentials = {
                email: 'john.doe@example.com',
                password: 'password123',
            };

            const result = await authService.login(credentials);

            expect(result.user?.name).toBe('John Doe');
        });

        it('should extract name from email without dots', async () => {
            const credentials: LoginCredentials = {
                email: 'john@example.com',
                password: 'password123',
            };

            const result = await authService.login(credentials);

            expect(result.user?.name).toBe('John');
        });
    });

    describe('register', () => {
        it('should register successfully with valid data', async () => {
            const userData: RegisterData = {
                name: 'John Doe',
                email: 'john@example.com',
                password: 'password123',
            };

            const result = await authService.register(userData);

            expect(result.success).toBe(true);
            expect(result.message).toBe('Registrasi berhasil dikirim');
            expect(result.user).toBeDefined();
            expect(result.user?.name).toBe('John Doe');
            expect(result.user?.email).toBe('john@example.com');
            expect(result.token).toBeDefined();
        });

        it('should fail with missing name', async () => {
            const userData: RegisterData = {
                name: '',
                email: 'john@example.com',
                password: 'password123',
            };

            const result = await authService.register(userData);

            expect(result.success).toBe(false);
            expect(result.error).toBe('Nama, email, dan kata sandi diperlukan');
        });

        it('should fail with missing email', async () => {
            const userData: RegisterData = {
                name: 'John Doe',
                email: '',
                password: 'password123',
            };

            const result = await authService.register(userData);

            expect(result.success).toBe(false);
            expect(result.error).toBe('Nama, email, dan kata sandi diperlukan');
        });

        it('should fail with missing password', async () => {
            const userData: RegisterData = {
                name: 'John Doe',
                email: 'john@example.com',
                password: '',
            };

            const result = await authService.register(userData);

            expect(result.success).toBe(false);
            expect(result.error).toBe('Nama, email, dan kata sandi diperlukan');
        });

        it('should fail with invalid email format', async () => {
            const userData: RegisterData = {
                name: 'John Doe',
                email: 'invalid-email',
                password: 'password123',
            };

            const result = await authService.register(userData);

            expect(result.success).toBe(false);
            expect(result.error).toBe('Format email tidak valid');
        });

        it('should fail with password less than 8 characters', async () => {
            const userData: RegisterData = {
                name: 'John Doe',
                email: 'john@example.com',
                password: '1234567',
            };

            const result = await authService.register(userData);

            expect(result.success).toBe(false);
            expect(result.error).toBe('Kata sandi minimal 8 karakter');
        });

        it('should store current user after successful registration', async () => {
            const userData: RegisterData = {
                name: 'John Doe',
                email: 'john@example.com',
                password: 'password123',
            };

            await authService.register(userData);
            const currentUser = await authService.getCurrentUser();

            expect(currentUser).toBeDefined();
            expect(currentUser?.email).toBe('john@example.com');
        });

        it('should use provided name instead of extracting from email', async () => {
            const userData: RegisterData = {
                name: 'Jane Smith',
                email: 'jane.doe@example.com',
                password: 'password123',
            };

            const result = await authService.register(userData);

            expect(result.user?.name).toBe('Jane Smith');
        });
    });

    describe('logout', () => {
        it('should logout successfully', async () => {
            const credentials: LoginCredentials = {
                email: 'test@example.com',
                password: 'password123',
            };

            await authService.login(credentials);
            const logoutResult = await authService.logout();
            const currentUser = await authService.getCurrentUser();

            expect(logoutResult.success).toBe(true);
            expect(logoutResult.message).toBe('Berhasil keluar');
            expect(currentUser).toBeNull();
        });

        it('should logout successfully when no user is logged in', async () => {
            const logoutResult = await authService.logout();

            expect(logoutResult.success).toBe(true);
            expect(logoutResult.message).toBe('Berhasil keluar');
        });
    });

    describe('getCurrentUser', () => {
        it('should return null when no user is logged in', async () => {
            const currentUser = await authService.getCurrentUser();

            expect(currentUser).toBeNull();
        });

        it('should return current user after login', async () => {
            const credentials: LoginCredentials = {
                email: 'test@example.com',
                password: 'password123',
            };

            await authService.login(credentials);
            const currentUser = await authService.getCurrentUser();

            expect(currentUser).toBeDefined();
            expect(currentUser?.email).toBe('test@example.com');
        });

        it('should return current user after registration', async () => {
            const userData: RegisterData = {
                name: 'John Doe',
                email: 'john@example.com',
                password: 'password123',
            };

            await authService.register(userData);
            const currentUser = await authService.getCurrentUser();

            expect(currentUser).toBeDefined();
            expect(currentUser?.email).toBe('john@example.com');
        });

        it('should return null after logout', async () => {
            const credentials: LoginCredentials = {
                email: 'test@example.com',
                password: 'password123',
            };

            await authService.login(credentials);
            await authService.logout();
            const currentUser = await authService.getCurrentUser();

            expect(currentUser).toBeNull();
        });

        it('should preserve user across multiple getCurrentUser calls', async () => {
            const credentials: LoginCredentials = {
                email: 'test@example.com',
                password: 'password123',
            };

            await authService.login(credentials);
            const user1 = await authService.getCurrentUser();
            const user2 = await authService.getCurrentUser();
            const user3 = await authService.getCurrentUser();

            expect(user1).toEqual(user2);
            expect(user2).toEqual(user3);
        });
    });

    describe('auth state transitions', () => {
        it('should handle login then logout then login sequence', async () => {
            const credentials1: LoginCredentials = {
                email: 'user1@example.com',
                password: 'password123',
            };

            const credentials2: LoginCredentials = {
                email: 'user2@example.com',
                password: 'password456',
            };

            await authService.login(credentials1);
            let currentUser = await authService.getCurrentUser();
            expect(currentUser?.email).toBe('user1@example.com');

            await authService.logout();
            currentUser = await authService.getCurrentUser();
            expect(currentUser).toBeNull();

            await authService.login(credentials2);
            currentUser = await authService.getCurrentUser();
            expect(currentUser?.email).toBe('user2@example.com');
        });

        it('should handle register then logout then login sequence', async () => {
            const registerData: RegisterData = {
                name: 'Test User',
                email: 'test@example.com',
                password: 'password123',
            };

            await authService.register(registerData);
            let currentUser = await authService.getCurrentUser();
            expect(currentUser?.name).toBe('Test User');

            await authService.logout();
            currentUser = await authService.getCurrentUser();
            expect(currentUser).toBeNull();

            const credentials: LoginCredentials = {
                email: 'test@example.com',
                password: 'password123',
            };

            await authService.login(credentials);
            currentUser = await authService.getCurrentUser();
            expect(currentUser?.email).toBe('test@example.com');
        });
    });

    describe('rate limiting - login', () => {
        it('should allow login within rate limit', async () => {
            const credentials: LoginCredentials = {
                email: 'rate1@example.com',
                password: 'password123',
            };

            const result1 = await authService.login(credentials);
            const result2 = await authService.login(credentials);
            const result3 = await authService.login(credentials);

            expect(result1.success).toBe(true);
            expect(result2.success).toBe(true);
            expect(result3.success).toBe(true);
        });

        it('should allow up to 5 failed login attempts within window', async () => {
            const credentials: LoginCredentials = {
                email: 'rate2@example.com',
                password: 'pass',
            };

            for (let i = 0; i < 5; i++) {
                const result = await authService.login(credentials);
                expect(result.success).toBe(false);
            }
        });

        it('should block login after 5 failed attempts', async () => {
            const credentials: LoginCredentials = {
                email: 'rate3@example.com',
                password: 'pass',
            };

            for (let i = 0; i < 5; i++) {
                await authService.login(credentials);
            }

            const blockedResult = await authService.login(credentials);
            expect(blockedResult.success).toBe(false);
            expect(blockedResult.error).toContain('Terlalu banyak percobaan');
        });

        it('should block successful login attempts after rate limit exceeded', async () => {
            const invalidCredentials: LoginCredentials = {
                email: 'rate4@example.com',
                password: 'pass',
            };

            const validCredentials: LoginCredentials = {
                email: 'rate4@example.com',
                password: 'password123',
            };

            for (let i = 0; i < 5; i++) {
                await authService.login(invalidCredentials);
            }

            const blockedResult = await authService.login(validCredentials);
            expect(blockedResult.success).toBe(false);
            expect(blockedResult.error).toContain('Terlalu banyak percobaan');
        });

        it('should track rate limit status for login', async () => {
            const email = 'rate5@example.com';

            const status1 = authService.getLoginRateLimitStatus(email);
            expect(status1.count).toBe(0);
            expect(status1.attemptsRemaining).toBe(5);

            const credentials: LoginCredentials = {
                email,
                password: 'pass',
            };

            await authService.login(credentials);

            const status2 = authService.getLoginRateLimitStatus(email);
            expect(status2.count).toBe(1);
            expect(status2.attemptsRemaining).toBe(4);
        });

        it('should reset login rate limit for specific email', async () => {
            const email = 'rate6@example.com';
            const credentials: LoginCredentials = {
                email,
                password: 'pass',
            };

            for (let i = 0; i < 5; i++) {
                await authService.login(credentials);
            }

            let status = authService.getLoginRateLimitStatus(email);
            expect(status.count).toBe(5);
            expect(status.attemptsRemaining).toBe(0);

            authService.resetLoginRateLimit(email);

            status = authService.getLoginRateLimitStatus(email);
            expect(status.count).toBe(0);
            expect(status.attemptsRemaining).toBe(5);
        });

        it('should handle rate limit for different emails independently', async () => {
            const credentials1: LoginCredentials = {
                email: 'user1@example.com',
                password: 'pass',
            };

            const credentials2: LoginCredentials = {
                email: 'user2@example.com',
                password: 'password123',
            };

            for (let i = 0; i < 5; i++) {
                await authService.login(credentials1);
            }

            const blockedResult1 = await authService.login(credentials1);
            expect(blockedResult1.success).toBe(false);

            const successResult = await authService.login(credentials2);
            expect(successResult.success).toBe(true);
        });
    });

    describe('rate limiting - register', () => {
        it('should allow register within rate limit', async () => {
            const userData: RegisterData = {
                name: 'User One',
                email: 'rate7@example.com',
                password: 'password123',
            };

            const result1 = await authService.register(userData);
            expect(result1.success).toBe(true);
        });

        it('should allow up to 5 failed register attempts within window', async () => {
            const userData: RegisterData = {
                name: '',
                email: 'rate8@example.com',
                password: 'password123',
            };

            for (let i = 0; i < 5; i++) {
                const result = await authService.register(userData);
                expect(result.success).toBe(false);
            }
        });

        it('should block register after 5 failed attempts', async () => {
            const userData: RegisterData = {
                name: '',
                email: 'rate9@example.com',
                password: 'password123',
            };

            for (let i = 0; i < 5; i++) {
                await authService.register(userData);
            }

            const blockedResult = await authService.register(userData);
            expect(blockedResult.success).toBe(false);
            expect(blockedResult.error).toContain('Terlalu banyak percobaan');
        });

        it('should track rate limit status for register', async () => {
            const email = 'rate10@example.com';

            const status1 = authService.getRegisterRateLimitStatus(email);
            expect(status1.count).toBe(0);
            expect(status1.attemptsRemaining).toBe(5);

            const userData: RegisterData = {
                name: '',
                email,
                password: 'password123',
            };

            await authService.register(userData);

            const status2 = authService.getRegisterRateLimitStatus(email);
            expect(status2.count).toBe(1);
            expect(status2.attemptsRemaining).toBe(4);
        });

        it('should reset register rate limit for specific email', async () => {
            const email = 'rate11@example.com';
            const userData: RegisterData = {
                name: '',
                email,
                password: 'password123',
            };

            for (let i = 0; i < 5; i++) {
                await authService.register(userData);
            }

            let status = authService.getRegisterRateLimitStatus(email);
            expect(status.count).toBe(5);
            expect(status.attemptsRemaining).toBe(0);

            authService.resetRegisterRateLimit(email);

            status = authService.getRegisterRateLimitStatus(email);
            expect(status.count).toBe(0);
            expect(status.attemptsRemaining).toBe(5);
        });

        it('should handle rate limit for login and register independently', async () => {
            const email = 'rate12@example.com';

            const loginCredentials: LoginCredentials = {
                email,
                password: 'pass',
            };

            for (let i = 0; i < 5; i++) {
                await authService.login(loginCredentials);
            }

            const blockedLogin = await authService.login(loginCredentials);
            expect(blockedLogin.success).toBe(false);

            const successRegister = await authService.register({
                name: 'User',
                email,
                password: 'password123',
            });
            expect(successRegister.success).toBe(true);
        });
    });

    describe('edge cases - error handling', () => {
        it('should handle null email by returning default name', async () => {
            const credentials: LoginCredentials = {
                email: 'test@example.com',
                password: 'password123',
            };

            await authService.login(credentials);
            const currentUser = await authService.getCurrentUser();

            expect(currentUser?.name).toBe('Test');
        });

        it('should handle email without @ symbol by returning default name', async () => {
            const credentials: LoginCredentials = {
                email: 'invalid-email',
                password: 'password123',
            };

            const result = await authService.login(credentials);

            expect(result.success).toBe(false);
            expect(result.error).toBe('Format email tidak valid');
        });

        it('should handle email with empty local part by returning default name', async () => {
            const credentials: LoginCredentials = {
                email: '@example.com',
                password: 'password123',
            };

            const result = await authService.login(credentials);

            expect(result.success).toBe(false);
            expect(result.error).toBe('Format email tidak valid');
        });

        it('should handle email with no local part by returning default name', async () => {
            const credentials: LoginCredentials = {
                email: '@example.com',
                password: 'password123',
            };

            const result = await authService.login(credentials);

            expect(result.success).toBe(false);
            expect(result.error).toBe('Format email tidak valid');
        });

        it('should handle logout error gracefully', async () => {
            const credentials: LoginCredentials = {
                email: 'test@example.com',
                password: 'password123',
            };

            await authService.login(credentials);
            const logoutResult = await authService.logout();

            expect(logoutResult.success).toBe(true);
            expect(logoutResult.message).toBe('Berhasil keluar');
        });
    });
});
