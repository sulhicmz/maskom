'use client';

import React, { useState, useEffect, useCallback } from 'react';
import Button from '@/components/ui/Button';
import authService from '@/services/auth/AuthService';
import MFASetup from './MFASetup';
import type { MFAStatus } from '@/types/mfa';
import type { User } from '@/services/auth/types';

const MFAPanel = () => {
  const [user, setUser] = useState<User | null>(null);
  const [mfaStatus, setMfaStatus] = useState<MFAStatus>('disabled');
  const [showSetup, setShowSetup] = useState(false);
  const [showDisable, setShowDisable] = useState(false);
  const [disablePassword, setDisablePassword] = useState('');
  const [newBackupCodes, setNewBackupCodes] = useState<string[] | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [message, setMessage] = useState('');

  const loadUserInfo = useCallback(async () => {
    const currentUser = await authService.getCurrentUser();
    const status = await authService.getMFAStatus();
    
    setUser(currentUser);
    setMfaStatus(status);
  }, []);

  useEffect(() => {
    loadUserInfo();
  }, [loadUserInfo]);

  const handleDisableMFA = useCallback(async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    
    try {
      const result = await authService.disableMFA(disablePassword);
      
      if (result.success) {
        setMessage('MFA berhasil dinonaktifkan');
        setShowDisable(false);
        setDisablePassword('');
        loadUserInfo();
        
        setTimeout(() => setMessage(''), 3000);
      } else {
        setError(result.error || 'Gagal menonaktifkan MFA');
      }
    } catch {
      setError('Terjadi kesalahan saat menonaktifkan MFA');
    } finally {
      setLoading(false);
    }
  }, [disablePassword, loadUserInfo]);

  const handleRegenerateBackupCodes = useCallback(async () => {
    setLoading(true);
    setError('');
    setNewBackupCodes(null);
    
    try {
      const result = await authService.regenerateBackupCodes(disablePassword);
      
      if (result.success && result.metadata?.backupCodes) {
        setNewBackupCodes(result.metadata.backupCodes as string[]);
        setMessage('Kode cadangan berhasil dibuat ulang');
        
        setTimeout(() => setMessage(''), 3000);
      } else {
        setError(result.error || 'Gagal membuat ulang kode cadangan');
      }
    } catch {
      setError('Terjadi kesalahan saat membuat ulang kode cadangan');
    } finally {
      setLoading(false);
    }
  }, [disablePassword]);

  const handleCopyBackupCode = useCallback((code: string) => {
    navigator.clipboard.writeText(code);
  }, []);

  const handleCopyAllBackupCodes = useCallback(() => {
    if (newBackupCodes) {
      const allCodes = newBackupCodes.join('\n');
      navigator.clipboard.writeText(allCodes);
    }
  }, [newBackupCodes]);

  const handleSetupSuccess = useCallback(() => {
    setShowSetup(false);
    loadUserInfo();
  }, [loadUserInfo]);

  if (showSetup) {
    return (
      <div className="mfa-panel">
        <MFASetup 
          onSuccess={handleSetupSuccess}
          onCancel={() => setShowSetup(false)}
        />
      </div>
    );
  }

  if (!user) {
    return <p className="mfa-panel__loading">Memuat informasi pengguna...</p>;
  }

  return (
    <div className="mfa-panel">
      <h2>Pengaturan Autentikasi Dua Faktor</h2>
      
      {message && (
        <div className="mfa-panel__message mfa-panel__message--success" role="status" aria-live="polite">
          {message}
        </div>
      )}

      {error && (
        <div className="mfa-panel__message mfa-panel__message--error" role="alert" aria-live="assertive">
          {error}
        </div>
      )}

      <div className="mfa-panel__status">
        <div className={`mfa-panel__status-indicator mfa-panel__status-indicator--${mfaStatus}`}>
          {mfaStatus === 'enabled' ? '✓' : mfaStatus === 'required' ? '!' : '○'}
        </div>
        <div className="mfa-panel__status-info">
          <h3>Status MFA</h3>
          <p className={`mfa-panel__status-text mfa-panel__status-text--${mfaStatus}`}>
            {mfaStatus === 'enabled' && 'Aktif'}
            {mfaStatus === 'disabled' && 'Tidak Aktif'}
            {mfaStatus === 'required' && 'Wajib (Admin)'}
          </p>
        </div>
      </div>

      {mfaStatus === 'disabled' && (
        <div className="mfa-panel__actions">
          <p className="mfa-panel__description">
            Aktifkan autentikasi dua faktor untuk keamanan akun tambahan. Anda akan memerlukan aplikasi otentikator seperti Google Authenticator atau Authy.
          </p>
          <Button onClick={() => setShowSetup(true)} ariaLabel="Aktifkan autentikasi dua faktor">
            Aktifkan MFA
          </Button>
        </div>
      )}

      {mfaStatus === 'enabled' && (
        <div className="mfa-panel__actions mfa-panel__actions--enabled">
          <div className="mfa-panel__info">
            <h3>Informasi MFA</h3>
            <p>Diaktifkan pada: {user.mfaEnabledAt ? new Date(user.mfaEnabledAt).toLocaleString('id-ID') : 'N/A'}</p>
            <p>Sisa kode cadangan: {user.mfaBackupCodes?.length || 0}</p>
          </div>

          <div className="mfa-panel__backup">
            <h3>Kode Cadangan</h3>
            <p className="mfa-panel__description">
              Gunakan kode cadangan jika Anda tidak memiliki akses ke aplikasi otentikator.
            </p>
            
            {newBackupCodes ? (
              <div className="mfa-panel__new-codes">
                <p className="mfa-panel__new-codes-label">Kode Cadangan Baru:</p>
                <ul className="mfa-panel__backup-list">
                  {newBackupCodes.map((code, index) => (
                    <li key={index} className="mfa-panel__backup-item">
                      <code>{code}</code>
                      <Button variant="text" size="small" onClick={() => handleCopyBackupCode(code)} ariaLabel="Salin kode cadangan">
                        Salin
                      </Button>
                    </li>
                  ))}
                </ul>
                <Button variant="text" onClick={handleCopyAllBackupCodes} ariaLabel="Salin semua kode cadangan">
                  Salin Semua Kode
                </Button>
              </div>
            ) : (
              <form onSubmit={(e) => { e.preventDefault(); handleRegenerateBackupCodes(); }}>
                <div className="mfa-panel__form-group">
                  <label htmlFor="password">Kata Sandi</label>
                  <input
                    id="password"
                    type="password"
                    value={disablePassword}
                    onChange={(e) => setDisablePassword(e.target.value)}
                    placeholder="Masukkan kata sandi Anda"
                    required
                    className="mfa-panel__input"
                    disabled={loading}
                  />
                </div>
                <Button type="submit" disabled={loading || !disablePassword} ariaLabel="Buat ulang kode cadangan MFA">
                  {loading ? 'Memproses...' : 'Buat Ulang Kode Cadangan'}
                </Button>
              </form>
            )}
          </div>

          <div className="mfa-panel__disable">
            <h3>Nonaktifkan MFA</h3>
            <p className="mfa-panel__description">
              Nonaktifkan autentikasi dua faktor akan mengurangi keamanan akun Anda.
            </p>
            
            {showDisable ? (
              <form onSubmit={handleDisableMFA}>
                <div className="mfa-panel__form-group">
                  <label htmlFor="disable-password">Kata Sandi</label>
                  <input
                    id="disable-password"
                    type="password"
                    value={disablePassword}
                    onChange={(e) => setDisablePassword(e.target.value)}
                    placeholder="Masukkan kata sandi Anda"
                    required
                    className="mfa-panel__input"
                    disabled={loading}
                  />
                </div>
                <div className="mfa-panel__actions-row">
                  <Button type="submit" disabled={loading || !disablePassword} ariaLabel="Nonaktifkan autentikasi dua faktor">
                    {loading ? 'Memproses...' : 'Nonaktifkan MFA'}
                  </Button>
                  <Button variant="secondary" onClick={() => {
                    setShowDisable(false);
                    setDisablePassword('');
                  }} ariaLabel="Batal nonaktifkan MFA">
                    Batal
                  </Button>
                </div>
              </form>
            ) : (
              <Button variant="danger" onClick={() => setShowDisable(true)} ariaLabel="Mulai proses nonaktifkan MFA">
                Nonaktifkan MFA
              </Button>
            )}
          </div>
        </div>
      )}

      {mfaStatus === 'required' && (
        <div className="mfa-panel__actions mfa-panel__actions--required">
          <div className="mfa-panel__warning">
            <div className="mfa-panel__warning-icon">⚠</div>
            <h3>MFA Wajib untuk Admin</h3>
            <p>
              Sebagai pengguna admin, Anda diwajibkan mengaktifkan autentikasi dua faktor untuk keamanan akun dan sistem.
            </p>
          </div>
          
          <Button onClick={() => setShowSetup(true)} ariaLabel="Aktifkan autentikasi dua faktor sekarang">
            Aktifkan MFA Sekarang
          </Button>
        </div>
      )}
    </div>
  );
}

MFAPanel.displayName = 'MFAPanel';

export default React.memo(MFAPanel);
