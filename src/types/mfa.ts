export type MFAStatus = 'disabled' | 'enabled' | 'required';

export interface MFAData {
  secret: string;
  backupCodes: string[];
  enabledAt: string | null;
}

export interface BackupCode {
  code: string;
  used: boolean;
  createdAt: string;
  usedAt: string | null;
}

export interface TOTPVerificationOptions {
  secret: string;
  code: string;
  window?: number;
}

export interface MFASetupData {
  secret: string;
  qrCodeUrl: string;
  backupCodes: string[];
}
