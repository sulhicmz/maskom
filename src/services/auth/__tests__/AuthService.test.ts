import { authService } from '../AuthService';
import type { LoginCredentials, RegisterData } from '../types';

describe('AuthService', () => {
    beforeEach(() => {
        authService.logout();
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

            expect(result.user?.id).toBe('user_user_name_example_com');
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

            expect(result.success).toBe(true);
            expect(result.user?.id).toBe('user_test_user_example_com');
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
});
