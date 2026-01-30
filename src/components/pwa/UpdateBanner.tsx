'use client';

import { useEffect, useState } from 'react';
import { useTheme } from '@/contexts/ThemeContext';
import { useServiceWorker } from '@/hooks/useServiceWorker';

export default function UpdateBanner() {
  const { theme } = useTheme();
  const { updateAvailable, skipWaiting } = useServiceWorker();
  const [dismissed, setDismissed] = useState(false);

  const isDark = theme === 'dark';

  const handleUpdate = () => {
    skipWaiting();
  };

  const handleDismiss = () => {
    setDismissed(true);
  };

  if (!updateAvailable || dismissed) {
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
      role="alert"
      aria-live="polite"
    >
      <div className="d-flex align-items-center gap-3">
        <span aria-hidden="true" style={{ fontSize: '24px' }}>
          🔄
        </span>
        <div>
          <strong className="d-block mb-1">Versi Baru Tersedia</strong>
          <span className="d-block" style={{ fontSize: '14px', opacity: 0.9 }}>
            Versi baru aplikasi telah tersedia. Perbarui sekarang untuk mendapatkan fitur terbaru.
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
          onClick={handleUpdate}
          style={{ minWidth: '80px' }}
        >
          Perbarui
        </button>
      </div>
    </div>
  );
}
