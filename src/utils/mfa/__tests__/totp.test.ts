import {
  generateSecret,
  generateBackupCodes,
  generateBackupCode,
  verifyTOTP,
  generateTOTPQRCode,
  createMFASetupData,
  SECRET_LENGTH,
  BACKUP_CODE_LENGTH,
  BACKUP_CODE_COUNT,
  TOTP_DIGITS,
  TOTP_PERIOD,
  TOTP_WINDOW,
} from '../totp';
import type { TOTPVerificationOptions } from '@/types/mfa';
import { API_ENDPOINTS } from '@/constants';
// eslint-disable-next-line @typescript-eslint/no-unused-vars
import { CircuitBreaker } from '@/utils/resilience/circuitBreaker';

jest.mock('@/utils/resilience/circuitBreaker', () => ({
  CircuitBreaker: jest.fn().mockImplementation(() => ({
    execute: jest.fn(async (operation) => await operation())
  }))
}));

jest.mock('@/utils/uuid', () => ({
  generateUUID: jest.fn(() => 'mock-uuid-12345'),
}));

const mockFetch = jest.fn();
global.fetch = mockFetch;

describe('TOTP Utilities', () => {
  describe('generateSecret', () => {
    test('should generate secret with default length', () => {
      const secret = generateSecret();
      expect(secret).toHaveLength(SECRET_LENGTH);
      expect(secret).toMatch(/^[A-Z2-7]+$/);
    });

    test('should generate secret with custom length', () => {
      const customLength = 20;
      const secret = generateSecret(customLength);
      expect(secret).toHaveLength(customLength);
      expect(secret).toMatch(/^[A-Z2-7]+$/);
    });

    test('should generate unique secrets', () => {
      const secret1 = generateSecret();
      const secret2 = generateSecret();
      expect(secret1).not.toBe(secret2);
    });

    test('should generate secret with valid base32 characters', () => {
      const secret = generateSecret();
      const validChars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ234567';
      for (const char of secret) {
        expect(validChars).toContain(char);
      }
    });
  });

  describe('generateBackupCode', () => {
    test('should generate backup code with default length', () => {
      const code = generateBackupCode();
      expect(code).toHaveLength(BACKUP_CODE_LENGTH);
      expect(code).toMatch(/^[A-Z0-9]+$/);
    });

    test('should generate backup code with custom length', () => {
      const customLength = 8;
      const code = generateBackupCode(customLength);
      expect(code).toHaveLength(customLength);
      expect(code).toMatch(/^[A-Z0-9]+$/);
    });

    test('should generate unique backup codes', () => {
      const code1 = generateBackupCode();
      const code2 = generateBackupCode();
      expect(code1).not.toBe(code2);
    });

    test('should generate backup code with valid characters', () => {
      const code = generateBackupCode();
      const validChars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
      for (const char of code) {
        expect(validChars).toContain(char);
      }
    });
  });

  describe('generateBackupCodes', () => {
    test('should generate default number of backup codes', () => {
      const codes = generateBackupCodes();
      expect(codes).toHaveLength(BACKUP_CODE_COUNT);
    });

    test('should generate custom number of backup codes', () => {
      const customCount = 5;
      const codes = generateBackupCodes(customCount);
      expect(codes).toHaveLength(customCount);
    });

    test('should generate unique backup codes', () => {
      const codes = generateBackupCodes();
      const uniqueCodes = new Set(codes);
      expect(uniqueCodes.size).toBe(BACKUP_CODE_COUNT);
    });

    test('should generate valid backup codes', () => {
      const codes = generateBackupCodes();
      codes.forEach(code => {
        expect(code).toHaveLength(BACKUP_CODE_LENGTH);
        expect(code).toMatch(/^[A-Z0-9]+$/);
      });
    });
  });

  describe('generateTOTPQRCode', () => {
    beforeEach(() => {
      mockFetch.mockClear();
      mockFetch.mockResolvedValue({
        ok: true,
        url: `${API_ENDPOINTS.QR_CODE_API}?size=200x200&data=otpauth%3A%2F%2Ftotp%2FTestIssuer%3Atest%40example.com`
      });
    });

    test('should generate valid QR code URL', async () => {
      const secret = 'JBSWY3DPEHPK3PXP';
      const qrCodeUrl = await generateTOTPQRCode(secret, 'TestIssuer', 'test@example.com');

      expect(qrCodeUrl).toContain(API_ENDPOINTS.QR_CODE_API);
      expect(qrCodeUrl).toContain('size=200x200');
      expect(qrCodeUrl).toContain('otpauth%3A%2F%2Ftotp%2FTestIssuer%3Atest%40example.com');
      expect(qrCodeUrl).toContain(`secret%3D${secret}`);
      expect(qrCodeUrl).toContain('issuer%3DTestIssuer');
    });

    test('should generate QR code URL with default issuer', async () => {
      const secret = 'JBSWY3DPEHPK3PXP';
      const qrCodeUrl = await generateTOTPQRCode(secret);

      expect(qrCodeUrl).toContain('issuer%3DMaskom');
    });

    test('should generate QR code URL with default account name', async () => {
      const secret = 'JBSWY3DPEHPK3PXP';
      const qrCodeUrl = await generateTOTPQRCode(secret);

      expect(qrCodeUrl).toContain('Maskom%3Auser');
    });

    test('should include TOTP digits and period in QR code', async () => {
      const secret = 'JBSWY3DPEHPK3PXP';
      const qrCodeUrl = await generateTOTPQRCode(secret);
      
      expect(qrCodeUrl).toContain(`digits%3D${TOTP_DIGITS}`);
      expect(qrCodeUrl).toContain(`period%3D${TOTP_PERIOD}`);
    });
  });

  describe('verifyTOTP', () => {
    let validSecret: string;
    let validCode: string;

    beforeAll(() => {
      validSecret = 'JBSWY3DPEHPK3PXP';
      validCode = '123456';
    });

    test('should return false for missing secret', async () => {
      const result = await verifyTOTP({ secret: '', code: validCode });
      expect(result).toBe(false);
    });

    test('should return false for missing code', async () => {
      const result = await verifyTOTP({ secret: validSecret, code: '' });
      expect(result).toBe(false);
    });

    test('should return false for invalid code length', async () => {
      const shortCode = '12345';
      const result = await verifyTOTP({ secret: validSecret, code: shortCode });
      expect(result).toBe(false);
    });

    test('should return false for non-numeric code', async () => {
      const invalidCode = 'ABCDEF';
      const result = await verifyTOTP({ secret: validSecret, code: invalidCode });
      expect(result).toBe(false);
    });

    test('should accept default time window', async () => {
      const options: TOTPVerificationOptions = {
        secret: validSecret,
        code: validCode,
      };
      expect(async () => verifyTOTP(options)).not.toThrow();
    });

    test('should accept custom time window', async () => {
      const customWindow = 2;
      const options: TOTPVerificationOptions = {
        secret: validSecret,
        code: validCode,
        window: customWindow,
      };
      expect(async () => verifyTOTP(options)).not.toThrow();
    });

    test('should return boolean result', async () => {
      const options: TOTPVerificationOptions = {
        secret: validSecret,
        code: validCode,
      };
      const result = await verifyTOTP(options);
      expect(typeof result).toBe('boolean');
    });
  });

  describe('createMFASetupData', () => {
    test('should create MFA setup data with default account', async () => {
      const setupData = await createMFASetupData();
      
      expect(setupData).toHaveProperty('secret');
      expect(setupData).toHaveProperty('qrCodeUrl');
      expect(setupData).toHaveProperty('backupCodes');
    });

    test('should create setup data with custom account', async () => {
      const customAccount = 'user@example.com';
      const setupData = await createMFASetupData(customAccount);
      
      expect(setupData.qrCodeUrl).toContain(encodeURIComponent(customAccount));
    });

    test('should generate valid secret in setup data', async () => {
      const setupData = await createMFASetupData();
      
      expect(setupData.secret).toHaveLength(SECRET_LENGTH);
      expect(setupData.secret).toMatch(/^[A-Z2-7]+$/);
    });

    test('should generate valid QR code URL in setup data', async () => {
      const setupData = await createMFASetupData();

      expect(setupData.qrCodeUrl).toContain(API_ENDPOINTS.QR_CODE_API);
      expect(setupData.qrCodeUrl).toContain('otpauth%3A%2F%2Ftotp%2F');
    });

    test('should generate correct number of backup codes', async () => {
      const setupData = await createMFASetupData();
      
      expect(setupData.backupCodes).toHaveLength(BACKUP_CODE_COUNT);
    });

    test('should generate unique backup codes in setup data', async () => {
      const setupData = await createMFASetupData();
      const uniqueCodes = new Set(setupData.backupCodes);
      
      expect(uniqueCodes.size).toBe(BACKUP_CODE_COUNT);
    });

    test('should generate valid backup codes in setup data', async () => {
      const setupData = await createMFASetupData();
      
      setupData.backupCodes.forEach(code => {
        expect(code).toHaveLength(BACKUP_CODE_LENGTH);
        expect(code).toMatch(/^[A-Z0-9]+$/);
      });
    });
  });

  describe('Constants', () => {
    test('should have correct constant values', () => {
      expect(SECRET_LENGTH).toBe(32);
      expect(BACKUP_CODE_LENGTH).toBe(10);
      expect(BACKUP_CODE_COUNT).toBe(10);
      expect(TOTP_DIGITS).toBe(6);
      expect(TOTP_PERIOD).toBe(30);
      expect(TOTP_WINDOW).toBe(1);
    });
  });
});
