'use client';

import { useServiceWorker } from '@/hooks/useServiceWorker';
import Button from '@/components/ui/Button';
import { useTheme } from '@/contexts/ThemeContext';

export default function ServiceWorkerUpdate() {
  const { status, updateAvailable, skipWaiting, clearCache } = useServiceWorker();
  const { theme } = useTheme();

  if (status === 'unsupported') {
    return null;
  }

  if (!updateAvailable) {
    return null;
  }

  const isDark = theme === 'dark';

  return (
    <div 
      className={`position-fixed bottom-0 start-0 m-3 p-3 rounded shadow-lg d-flex align-items-center gap-3 ${isDark ? 'dark-theme' : ''}`}
      style={{
        backgroundColor: isDark ? '#2c2c2c' : '#ffffff',
        border: `1px solid ${isDark ? '#444' : '#dee2e6'}`,
        zIndex: 9999,
        maxWidth: '400px',
      }}
      role="alert"
      aria-live="polite"
    >
      <div>
        <h6 className="mb-1" style={{ color: isDark ? '#fff' : '#212529' }}>
          Update Tersedia
        </h6>
        <p className="mb-0 small" style={{ color: isDark ? '#ccc' : '#6c757d' }}>
          Versi baru Maskom tersedia. Klik untuk memperbarui.
        </p>
      </div>
      <div className="d-flex gap-2">
        <Button
          onClick={skipWaiting}
          variant="primary"
          ariaLabel="Update aplikasi ke versi terbaru"
        >
          Perbarui Sekarang
        </Button>
        <Button
          onClick={clearCache}
          variant="secondary"
          ariaLabel="Bersihkan cache aplikasi"
        >
          Bersihkan Cache
        </Button>
      </div>
    </div>
  );
}
