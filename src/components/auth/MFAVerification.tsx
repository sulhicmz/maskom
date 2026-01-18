'use client';

import { useState } from 'react';
import Button from '@/components/common/Button';
import authService from '@/services/auth/AuthService';
import type { AuthResult } from '@/services/auth/types';

interface MFAVerificationProps {
  email: string;
  onVerify: (result: AuthResult) => void;
  onUseBackupCode?: () => void;
}

export default function MFAVerification({ email, onVerify, onUseBackupCode }: MFAVerificationProps) {
  const [totpCode, setTotpCode] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    
    try {
      const result = await authService.verifyMFA(totpCode);
      
      if (result.success) {
        onVerify(result);
      } else {
        setError(result.error || 'Kode TOTP tidak valid');
      }
    } catch (err) {
      setError('Terjadi kesalahan saat memverifikasi MFA');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="mfa-verification">
      <h3>Verifikasi Dua Faktor</h3>
      <p className="mfa-verification__description">
        Masukkan kode autentikasi 6 digit dari aplikasi otentikator Anda untuk akun:
      </p>
      <p className="mfa-verification__email">{email}</p>
      
      <form onSubmit={handleSubmit} className="mfa-verification__form">
        <div className="mfa-verification__form-group">
          <label htmlFor="totp-code">Kode Autentikasi</label>
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
            className="mfa-verification__input"
            disabled={loading}
            autoFocus
          />
        </div>
        
        {error && <p className="error-message mfa-verification__error">{error}</p>}
        
        <div className="mfa-verification__actions">
          <Button type="submit" disabled={loading || totpCode.length !== 6}>
            {loading ? 'Memverifikasi...' : 'Verifikasi'}
          </Button>
        </div>

        {onUseBackupCode && (
          <div className="mfa-verification__backup">
            <Button variant="text" onClick={onUseBackupCode}>
              Gunakan Kode Cadangan
            </Button>
          </div>
        )}
      </form>
    </div>
  );
}
