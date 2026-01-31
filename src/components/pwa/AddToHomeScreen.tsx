'use client';

import { useEffect, useState } from 'react';
import { useTheme } from '@/contexts/ThemeContext';

interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: 'accepted' | 'dismissed' }>;
}

export default function AddToHomeScreen() {
  const { theme } = useTheme();
  const [deferredPrompt, setDeferredPrompt] = useState<BeforeInstallPromptEvent | null>(null);
  const [showPrompt, setShowPrompt] = useState(false);

  const isDark = theme === 'dark';

  useEffect(() => {
    const handleBeforeInstallPrompt = (e: Event) => {
      e.preventDefault();
      setDeferredPrompt(e as BeforeInstallPromptEvent);
      setShowPrompt(true);
    };

    const handleAppInstalled = () => {
      setShowPrompt(false);
      setDeferredPrompt(null);
    };

    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
    window.addEventListener('appinstalled', handleAppInstalled);

    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
      window.removeEventListener('appinstalled', handleAppInstalled);
    };
  }, []);

  const handleInstall = async () => {
    if (!deferredPrompt) {
      return;
    }

    deferredPrompt.prompt();

    const { outcome } = await deferredPrompt.userChoice;

    if (outcome === 'accepted') {
      setShowPrompt(false);
    }

    setDeferredPrompt(null);
  };

  const handleDismiss = () => {
    setShowPrompt(false);
    setDeferredPrompt(null);
  };

  if (!showPrompt || !deferredPrompt) {
    return null;
  }

  return (
    <div
      className={`position-fixed bottom-0 start-50 translate-middle-x p-3 shadow-lg d-flex justify-content-between align-items-center ${isDark ? 'dark-theme' : ''}`}
      style={{
        backgroundColor: isDark ? '#0d6efd' : '#0d6efd',
        color: '#fff',
        zIndex: 9999,
        width: '90%',
        maxWidth: '500px',
        marginBottom: '20px',
        borderRadius: '8px',
      }}
      role="dialog"
      aria-labelledby="a2hs-title"
      aria-describedby="a2hs-description"
    >
      <div className="d-flex align-items-center gap-3">
        <span aria-hidden="true" style={{ fontSize: '24px' }}>
          📱
        </span>
        <div>
          <strong id="a2hs-title" className="d-block mb-1">Tambahkan ke Layar Utama</strong>
          <span id="a2hs-description" className="d-block" style={{ fontSize: '14px', opacity: 0.9 }}>
            Tambahkan Maskom ke layar utama Anda untuk akses cepat dan pengalaman seperti aplikasi.
          </span>
        </div>
      </div>
      <div className="d-flex gap-2">
        <button
          type="button"
          className="btn btn-sm btn-light fw-bold"
          onClick={handleDismiss}
          style={{ minWidth: '80px' }}
        >
          Nanti
        </button>
        <button
          type="button"
          className="btn btn-sm btn-light fw-bold"
          onClick={handleInstall}
          style={{ minWidth: '80px' }}
        >
          Tambahkan
        </button>
      </div>
    </div>
  );
}
