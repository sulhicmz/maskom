import { MFASetupData, TOTPVerificationOptions } from '@/types/mfa';

const SECRET_LENGTH = 32;
const BACKUP_CODE_LENGTH = 10;
const BACKUP_CODE_COUNT = 10;
const TOTP_DIGITS = 6;
const TOTP_PERIOD = 30;
const TOTP_WINDOW = 1;

function generateSecret(length: number = SECRET_LENGTH): string {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ234567';
  let secret = '';
  const randomValues = new Uint8Array(length);
  crypto.getRandomValues(randomValues);
  
  for (let i = 0; i < length; i++) {
    secret += chars[randomValues[i] % chars.length];
  }
  
  return secret;
}

function generateBackupCode(length: number = BACKUP_CODE_LENGTH): string {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
  let code = '';
  const randomValues = new Uint8Array(length);
  crypto.getRandomValues(randomValues);
  
  for (let i = 0; i < length; i++) {
    code += chars[randomValues[i] % chars.length];
  }
  
  return code;
}

function generateBackupCodes(count: number = BACKUP_CODE_COUNT): string[] {
  return Array.from({ length: count }, () => generateBackupCode());
}

async function deriveTOTPKey(secret: string): Promise<CryptoKey> {
  const encoder = new TextEncoder();
  const secretBytes = encoder.encode(secret);
  
  const key = await crypto.subtle.importKey(
    'raw',
    secretBytes,
    { name: 'HMAC', hash: 'SHA-1' },
    false,
    ['sign']
  );
  
  return key;
}

async function generateTOTP(secret: string): Promise<string> {
  const key = await deriveTOTPKey(secret);
  const time = Math.floor(Date.now() / 1000 / TOTP_PERIOD);
  const timeBytes = new ArrayBuffer(8);
  const timeView = new DataView(timeBytes);
  timeView.setUint32(4, time, false);
  
  const signature = await crypto.subtle.sign('HMAC', key, timeBytes);
  const signatureArray = new Uint8Array(signature);
  const offset = signatureArray[signatureArray.length - 1] & 0x0f;
  const binary =
    ((signatureArray[offset] & 0x7f) << 24) |
    ((signatureArray[offset + 1] & 0xff) << 16) |
    ((signatureArray[offset + 2] & 0xff) << 8) |
    (signatureArray[offset + 3] & 0xff);
  
  const otp = binary % Math.pow(10, TOTP_DIGITS);
  return otp.toString().padStart(TOTP_DIGITS, '0');
}

async function verifyTOTP(options: TOTPVerificationOptions): Promise<boolean> {
  const { secret, code, window: timeWindow = TOTP_WINDOW } = options;
  
  if (!secret || !code) {
    return false;
  }
  
  const currentTime = Math.floor(Date.now() / 1000 / TOTP_PERIOD);
  
  for (let i = -timeWindow; i <= timeWindow; i++) {
    const time = currentTime + i;
    const timeBytes = new ArrayBuffer(8);
    const timeView = new DataView(timeBytes);
    timeView.setUint32(4, time, false);
    
    const key = await deriveTOTPKey(secret);
    const signature = await crypto.subtle.sign('HMAC', key, timeBytes);
    const signatureArray = new Uint8Array(signature);
    const offset = signatureArray[signatureArray.length - 1] & 0x0f;
    const binary =
      ((signatureArray[offset] & 0x7f) << 24) |
      ((signatureArray[offset + 1] & 0xff) << 16) |
      ((signatureArray[offset + 2] & 0xff) << 8) |
      (signatureArray[offset + 3] & 0xff);
    
    const otp = binary % Math.pow(10, TOTP_DIGITS);
    const otpString = otp.toString().padStart(TOTP_DIGITS, '0');
    
    if (otpString === code) {
      return true;
    }
  }
  
  return false;
}

function generateTOTPQRCode(secret: string, issuer: string = 'Maskom', accountName: string = 'user'): string {
  const otpAuthUrl = `otpauth://totp/${issuer}:${accountName}?secret=${secret}&issuer=${issuer}&digits=${TOTP_DIGITS}&period=${TOTP_PERIOD}`;
  const qrCodeUrl = `https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=${encodeURIComponent(otpAuthUrl)}`;
  return qrCodeUrl;
}

async function createMFASetupData(accountName: string = 'user'): Promise<MFASetupData> {
  const secret = generateSecret();
  const backupCodes = generateBackupCodes();
  const qrCodeUrl = generateTOTPQRCode(secret, 'Maskom', accountName);
  
  return {
    secret,
    qrCodeUrl,
    backupCodes,
  };
}

export {
  generateSecret,
  generateBackupCodes,
  generateBackupCode,
  generateTOTP,
  verifyTOTP,
  generateTOTPQRCode,
  createMFASetupData,
  SECRET_LENGTH,
  BACKUP_CODE_LENGTH,
  BACKUP_CODE_COUNT,
  TOTP_DIGITS,
  TOTP_PERIOD,
  TOTP_WINDOW,
};
