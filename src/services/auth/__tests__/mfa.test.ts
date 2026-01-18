import authService from '../AuthService';
import type { User } from '../types';
import { UserRole } from '@/types/role';
import { MFAStatus } from '@/types/mfa';

describe('AuthService MFA Methods', () => {
  let mockUser: User;

  beforeEach(() => {
    mockUser = {
      id: 'user-123',
      name: 'Test User',
      email: 'test@example.com',
      role: 'user',
      mfaEnabled: false,
    };
  });

  afterEach(() => {
    authService.logout();
    authService.resetAllRateLimits();
  });

  describe('initiateMFASetup', () => {
    test('should initiate MFA setup for authenticated user', async () => {
      await authService.register({
        name: 'Test User',
        email: 'test@example.com',
        password: 'Password123',
        role: 'user',
      });

      const result = await authService.initiateMFASetup();

      expect(result.success).toBe(true);
      expect(result.mfaSetupData).toBeDefined();
      expect(result.mfaSetupData).toHaveProperty('secret');
      expect(result.mfaSetupData).toHaveProperty('qrCodeUrl');
      expect(result.mfaSetupData).toHaveProperty('backupCodes');
    });

    test('should fail for unauthenticated user', async () => {
      const result = await authService.initiateMFASetup();

      expect(result.success).toBe(false);
      expect(result.error).toContain('not authenticated');
    });

    test('should fail if MFA already enabled', async () => {
      await authService.register({
        name: 'Test User',
        email: 'test@example.com',
        password: 'Password123',
        role: 'user',
      });

      await authService.initiateMFASetup();
      await authService.enableMFA('123456');

      const result = await authService.initiateMFASetup();

      expect(result.success).toBe(false);
      expect(result.error).toContain('already enabled');
    });

    test('should generate unique secrets', async () => {
      await authService.register({
        name: 'Test User',
        email: 'test@example.com',
        password: 'Password123',
        role: 'user',
      });

      const setup1 = await authService.initiateMFASetup();
      await authService.logout();

      await authService.register({
        name: 'Test User',
        email: 'test2@example.com',
        password: 'Password123',
        role: 'user',
      });

      const setup2 = await authService.initiateMFASetup();

      expect(setup1.mfaSetupData?.secret).not.toBe(setup2.mfaSetupData?.secret);
    });

    test('should generate correct number of backup codes', async () => {
      await authService.register({
        name: 'Test User',
        email: 'test@example.com',
        password: 'Password123',
        role: 'user',
      });

      const result = await authService.initiateMFASetup();

      expect(result.mfaSetupData?.backupCodes).toHaveLength(10);
    });
  });

  describe('enableMFA', () => {
    beforeEach(async () => {
      await authService.register({
        name: 'Test User',
        email: 'test@example.com',
        password: 'Password123',
        role: 'user',
      });
      await authService.initiateMFASetup();
    });

    test('should enable MFA for authenticated user', async () => {
      const result = await authService.enableMFA('123456');

      expect(result.success).toBe(true);
      expect(result.user?.mfaEnabled).toBe(true);
      expect(result.user?.mfaSecret).toBeDefined();
      expect(result.user?.mfaBackupCodes).toBeDefined();
    });

    test('should fail for unauthenticated user', async () => {
      await authService.logout();

      const result = await authService.enableMFA('123456');

      expect(result.success).toBe(false);
      expect(result.error).toContain('not authenticated');
    });

    test('should fail if setup not initiated', async () => {
      await authService.logout();
      await authService.register({
        name: 'Test User',
        email: 'test2@example.com',
        password: 'Password123',
        role: 'user',
      });

      const result = await authService.enableMFA('123456');

      expect(result.success).toBe(false);
      expect(result.error).toContain('setup not initiated');
    });

    test('should set enabledAt timestamp', async () => {
      const beforeDate = new Date();
      await new Promise(resolve => setTimeout(resolve, 100));
      
      const result = await authService.enableMFA('123456');
      const afterDate = new Date();

      expect(result.user?.mfaEnabledAt).toBeDefined();
      const enabledAt = new Date(result.user?.mfaEnabledAt || '');
      expect(enabledAt.getTime()).toBeGreaterThanOrEqual(beforeDate.getTime());
      expect(enabledAt.getTime()).toBeLessThanOrEqual(afterDate.getTime());
    });
  });

  describe('disableMFA', () => {
    beforeEach(async () => {
      await authService.register({
        name: 'Test User',
        email: 'test@example.com',
        password: 'Password123',
        role: 'user',
      });
      await authService.initiateMFASetup();
      await authService.enableMFA('123456');
    });

    test('should disable MFA with correct password', async () => {
      const result = await authService.disableMFA('Password123');

      expect(result.success).toBe(true);
      expect(result.user?.mfaEnabled).toBe(false);
      expect(result.user?.mfaSecret).toBeUndefined();
      expect(result.user?.mfaBackupCodes).toBeUndefined();
    });

    test('should fail for unauthenticated user', async () => {
      await authService.logout();

      const result = await authService.disableMFA('Password123');

      expect(result.success).toBe(false);
      expect(result.error).toContain('not authenticated');
    });

    test('should fail with incorrect password', async () => {
      const result = await authService.disableMFA('WrongPassword');

      expect(result.success).toBe(false);
      expect(result.error).toContain('Invalid password');
    });

    test('should fail with empty password', async () => {
      const result = await authService.disableMFA('');

      expect(result.success).toBe(false);
    });
  });

  describe('verifyMFA', () => {
    beforeEach(async () => {
      await authService.register({
        name: 'Test User',
        email: 'test@example.com',
        password: 'Password123',
        role: 'user',
      });
      await authService.initiateMFASetup();
      await authService.enableMFA('123456');
    });

    test('should verify valid TOTP code', async () => {
      const result = await authService.verifyMFA('123456');

      expect(result.success).toBe(true);
      expect(result.message).toContain('MFA berhasil diverifikasi');
    });

    test('should fail for unauthenticated user', async () => {
      await authService.logout();

      const result = await authService.verifyMFA('123456');

      expect(result.success).toBe(false);
    });

    test('should fail when MFA not enabled', async () => {
      await authService.disableMFA('Password123');

      const result = await authService.verifyMFA('123456');

      expect(result.success).toBe(false);
      expect(result.error).toContain('not enabled');
    });

    test('should fail for invalid TOTP code', async () => {
      const result = await authService.verifyMFA('000000');

      expect(result.success).toBe(false);
      expect(result.error).toContain('Invalid TOTP code');
    });

    test('should verify valid backup code', async () => {
      const currentUser = await authService.getCurrentUser();
      const backupCode = currentUser?.mfaBackupCodes?.[0];

      const result = await authService.verifyMFA('', backupCode);

      expect(result.success).toBe(true);
      expect(result.message).toContain('Backup code verified');
    });

    test('should fail for invalid backup code', async () => {
      const result = await authService.verifyMFA('', 'INVALIDCODE');

      expect(result.success).toBe(false);
      expect(result.error).toContain('Invalid backup code');
    });

    test('should remove used backup code', async () => {
      const currentUserBefore = await authService.getCurrentUser();
      const backupCode = currentUserBefore?.mfaBackupCodes?.[0];

      await authService.verifyMFA('', backupCode);

      const currentUserAfter = await authService.getCurrentUser();
      expect(currentUserAfter?.mfaBackupCodes).not.toContain(backupCode);
    });
  });

  describe('getMFAStatus', () => {
    test('should return disabled for unauthenticated user', async () => {
      const status = await authService.getMFAStatus();

      expect(status).toBe('disabled');
    });

    test('should return disabled for user without MFA', async () => {
      await authService.register({
        name: 'Test User',
        email: 'test@example.com',
        password: 'Password123',
        role: 'user',
      });

      const status = await authService.getMFAStatus();

      expect(status).toBe('disabled');
    });

    test('should return enabled for user with MFA', async () => {
      await authService.register({
        name: 'Test User',
        email: 'test@example.com',
        password: 'Password123',
        role: 'user',
      });
      await authService.initiateMFASetup();
      await authService.enableMFA('123456');

      const status = await authService.getMFAStatus();

      expect(status).toBe('enabled');
    });

    test('should return required for admin without MFA', async () => {
      await authService.register({
        name: 'Test Admin',
        email: 'admin@example.com',
        password: 'Password123',
        role: 'admin',
      });

      const status = await authService.getMFAStatus();

      expect(status).toBe('required');
    });

    test('should return enabled for admin with MFA', async () => {
      await authService.register({
        name: 'Test Admin',
        email: 'admin@example.com',
        password: 'Password123',
        role: 'admin',
      });
      await authService.initiateMFASetup();
      await authService.enableMFA('123456');

      const status = await authService.getMFAStatus();

      expect(status).toBe('enabled');
    });
  });

  describe('regenerateBackupCodes', () => {
    beforeEach(async () => {
      await authService.register({
        name: 'Test User',
        email: 'test@example.com',
        password: 'Password123',
        role: 'user',
      });
      await authService.initiateMFASetup();
      await authService.enableMFA('123456');
    });

    test('should regenerate backup codes with correct password', async () => {
      const currentUserBefore = await authService.getCurrentUser();
      const oldCodes = currentUserBefore?.mfaBackupCodes || [];

      const result = await authService.regenerateBackupCodes('Password123');

      expect(result.success).toBe(true);
      expect(result.metadata?.backupCodes).toBeDefined();
      expect(result.metadata?.backupCodes).toHaveLength(10);
      expect(result.metadata?.backupCodes).not.toEqual(oldCodes);
    });

    test('should fail for unauthenticated user', async () => {
      await authService.logout();

      const result = await authService.regenerateBackupCodes('Password123');

      expect(result.success).toBe(false);
    });

    test('should fail when MFA not enabled', async () => {
      await authService.disableMFA('Password123');

      const result = await authService.regenerateBackupCodes('Password123');

      expect(result.success).toBe(false);
      expect(result.error).toContain('not enabled');
    });

    test('should fail with incorrect password', async () => {
      const result = await authService.regenerateBackupCodes('WrongPassword');

      expect(result.success).toBe(false);
      expect(result.error).toContain('Invalid password');
    });

    test('should update user backup codes', async () => {
      const oldCodes = (await authService.getCurrentUser())?.mfaBackupCodes || [];
      
      await authService.regenerateBackupCodes('Password123');
      
      const newCodes = (await authService.getCurrentUser())?.mfaBackupCodes || [];
      
      expect(oldCodes).not.toEqual(newCodes);
      expect(newCodes).toHaveLength(10);
    });
  });

  describe('login with MFA', () => {
    beforeEach(async () => {
      await authService.register({
        name: 'Test Admin',
        email: 'admin@example.com',
        password: 'Password123',
        role: 'admin',
      });
      await authService.initiateMFASetup();
      await authService.enableMFA('123456');
      await authService.logout();
    });

    test('should require MFA for admin login', async () => {
      const result = await authService.login({
        email: 'admin@example.com',
        password: 'Password123',
      });

      expect(result.success).toBe(false);
      expect(result.error).toContain('MFA diperlukan');
      expect(result.user).toBeDefined();
      expect(result.user?.mfaEnabled).toBe(false);
    });

    test('should login successfully with valid MFA code', async () => {
      const result = await authService.login({
        email: 'admin@example.com',
        password: 'Password123',
        totpCode: '123456',
      });

      expect(result.success).toBe(true);
      expect(result.user?.mfaEnabled).toBe(true);
    });

    test('should fail with invalid MFA code', async () => {
      const result = await authService.login({
        email: 'admin@example.com',
        password: 'Password123',
        totpCode: '000000',
      });

      expect(result.success).toBe(false);
      expect(result.error).toContain('Invalid TOTP code');
    });

    test('should not require MFA for regular user login', async () => {
      await authService.register({
        name: 'Regular User',
        email: 'user@example.com',
        password: 'Password123',
        role: 'user',
      });
      await authService.logout();

      const result = await authService.login({
        email: 'user@example.com',
        password: 'Password123',
      });

      expect(result.success).toBe(true);
    });
  });
});
