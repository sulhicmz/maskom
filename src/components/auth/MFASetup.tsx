'use client';

import { useState } from 'react';
import Image from 'next/image';
import Button from '@/components/ui/Button';
import authService from '@/services/auth/AuthService';
import type { MFASetupData } from '@/services/auth/types';

interface MFASetupProps {
  onSuccess?: () => void;
  onCancel?: () => void;
}

export default function MFASetup({ onSuccess, onCancel }: MFASetupProps) {
  const [setupData, setSetupData] = useState<MFASetupData | null>(null);
  const [totpCode, setTotpCode] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [step, setStep] = useState<'initiate' | 'scan' | 'verify'>('initiate');
  const [backupCodesVisible, setBackupCodesVisible] = useState(false);

  const handleInitiate = async () => {
    setLoading(true);
    setError('');
    
    try {
      const result = await authService.initiateMFASetup();
      
      if (result.success && result.mfaSetupData) {
        setSetupData(result.mfaSetupData);
        setStep('scan');
      } else {
        setError(result.error || 'Gagal menginisialisasi MFA');
      }
    } catch {
      setError('Terjadi kesalahan saat menginisialisasi MFA');
    } finally {
      setLoading(false);
    }
  };

  const handleVerify = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    
    try {
      const result = await authService.enableMFA(totpCode);
      
      if (result.success) {
        setStep('verify');
        onSuccess?.();
      } else {
        setError(result.error || 'Kode TOTP tidak valid');
      }
    } catch {
      setError('Terjadi kesalahan saat memverifikasi MFA');
    } finally {
      setLoading(false);
    }
  };

  const handleCopyBackupCode = (code: string) => {
    navigator.clipboard.writeText(code);
  };

  const handleCopyAllBackupCodes = () => {
    if (setupData) {
      const allCodes = setupData.backupCodes.join('\n');
      navigator.clipboard.writeText(allCodes);
    }
  };

  if (step === 'initiate') {
    return (
      <div className="mfa-setup">
        <h3>Siapkan Autentikasi Dua Faktor</h3>
        <p className="mfa-setup__description">
          Aktifkan autentikasi dua faktor (2FA) untuk keamanan akun tambahan. Anda akan memerlukan aplikasi otentikator seperti Google Authenticator atau Authy.
        </p>
        <div className="mfa-setup__actions">
          <Button onClick={handleInitiate} disabled={loading}>
            {loading ? 'Memuat...' : 'Mulai Pengaturan'}
          </Button>
          {onCancel && (
            <Button variant="secondary" onClick={onCancel}>
              Batal
            </Button>
          )}
        </div>
        {error && <p className="error-message">{error}</p>}
      </div>
    );
  }

  if (step === 'scan' && setupData) {
    return (
      <div className="mfa-setup">
        <h3>Scan Kode QR</h3>
        <p className="mfa-setup__description">
          Gunakan aplikasi otentikator untuk memindai kode QR di bawah ini:
        </p>
        
        <div className="mfa-setup__qr">
          <Image 
            src={setupData.qrCodeUrl} 
            alt="QR Code for MFA" 
            width={200}
            height={200}
            className="mfa-setup__qr-image"
            unoptimized
          />
        </div>
        
        <div className="mfa-setup__secret">
          <p className="mfa-setup__secret-label">
            Kode Manual (jika tidak dapat memindai QR):
          </p>
          <code className="mfa-setup__secret-code">{setupData.secret}</code>
        </div>

        <form onSubmit={handleVerify} className="mfa-setup__form">
          <div className="mfa-setup__form-group">
            <label htmlFor="totp-code">Kode TOTP</label>
            <input
              id="totp-code"
              type="text"
              inputMode="numeric"
              pattern="[0-9]{6}"
              maxLength={6}
              value={totpCode}
              onChange={(e) => setTotpCode(e.target.value.replace(/[^0-9]/g, ''))}
              placeholder="Masukkan 6 digit kode"
              required
              className="mfa-setup__input"
              disabled={loading}
            />
          </div>
          
          {error && <p className="error-message">{error}</p>}
          
          <div className="mfa-setup__actions">
            <Button type="submit" disabled={loading || totpCode.length !== 6}>
              {loading ? 'Memverifikasi...' : 'Verifikasi & Aktifkan'}
            </Button>
            <Button variant="secondary" onClick={onCancel}>
              Batal
            </Button>
          </div>
        </form>
      </div>
    );
  }

  if (step === 'verify' && setupData) {
    return (
      <div className="mfa-setup mfa-setup--success">
        <div className="mfa-setup__success-icon">✓</div>
        <h3>MFA Berhasil Diaktifkan</h3>
        <p className="mfa-setup__description">
          Autentikasi dua faktor telah berhasil diaktifkan untuk akun Anda.
        </p>
        
        <div className="mfa-setup__backup-codes">
          <div className="mfa-setup__backup-header">
            <h4>Kode Cadangan</h4>
            <Button 
              variant="text" 
              size="small"
              onClick={() => setBackupCodesVisible(!backupCodesVisible)}
            >
              {backupCodesVisible ? 'Sembunyikan' : 'Tampilkan'}
            </Button>
          </div>
          
          {backupCodesVisible && (
            <>
              <p className="mfa-setup__backup-description">
                Simpan kode cadangan ini di tempat yang aman. Anda dapat menggunakan kode ini jika tidak memiliki akses ke aplikasi otentikator.
              </p>
              
              <div className="mfa-setup__backup-actions">
                <Button variant="text" size="small" onClick={handleCopyAllBackupCodes}>
                  Salin Semua Kode
                </Button>
              </div>
              
              <ul className="mfa-setup__backup-list">
                {setupData.backupCodes.map((code, index) => (
                  <li key={index} className="mfa-setup__backup-item">
                    <code>{code}</code>
                    <Button 
                      variant="text" 
                      size="small"
                      onClick={() => handleCopyBackupCode(code)}
                    >
                      Salin
                    </Button>
                  </li>
                ))}
              </ul>
            </>
          )}
        </div>

        <div className="mfa-setup__actions">
          <Button onClick={onCancel}>
            Selesai
          </Button>
        </div>
      </div>
    );
  }

  return null;
}
