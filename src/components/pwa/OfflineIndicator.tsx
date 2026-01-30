'use client';

import { useEffect, useState } from 'react';
import { useTheme } from '@/contexts/ThemeContext';
import { NetworkStatus } from '@/types/pwa';
import { getOfflineActions } from '@/utils/pwa/backgroundSync';

export default function OfflineIndicator() {
  const { theme } = useTheme();
  const [networkStatus, setNetworkStatus] = useState<NetworkStatus>('unknown');
  const [pendingActions, setPendingActions] = useState(0);
  const [syncing, setSyncing] = useState(false);

  const isDark = theme === 'dark';

  useEffect(() => {
    const updateNetworkStatus = () => {
      if (typeof navigator !== 'undefined') {
        setNetworkStatus(navigator.onLine ? 'online' : 'offline');
      }
    };

    const updatePendingCount = () => {
      const actions = getOfflineActions();
      const pending = actions.filter(a => a.status === 'pending').length;
      setPendingActions(pending);
    };

    updateNetworkStatus();
    updatePendingCount();

    window.addEventListener('online', updateNetworkStatus);
    window.addEventListener('offline', updateNetworkStatus);

    const syncInterval = setInterval(() => {
      updatePendingCount();
    }, 5000);

    return () => {
      window.removeEventListener('online', updateNetworkStatus);
      window.removeEventListener('offline', updateNetworkStatus);
      clearInterval(syncInterval);
    };
  }, []);

  if (networkStatus === 'online' && pendingActions === 0) {
    return null;
  }

  const isOffline = networkStatus === 'offline';
  const showPending = pendingActions > 0 && !isOffline;

  return (
    <div
      className={`position-fixed top-0 start-50 translate-middle-x py-2 px-3 shadow-sm d-flex align-items-center gap-2 ${isDark ? 'dark-theme' : ''}`}
      style={{
        backgroundColor: isOffline 
          ? (isDark ? '#dc3545' : '#dc3545') 
          : (showPending ? (isDark ? '#ffc107' : '#ffc107') : (isDark ? '#198754' : '#198754')),
        color: isDark ? '#fff' : '#fff',
        zIndex: 10000,
        minWidth: '200px',
        fontSize: '14px',
      }}
      role="status"
      aria-live="polite"
    >
      {isOffline && (
        <>
          <span aria-hidden="true">📡</span>
          <span>Offline - Aksi Tersimpan</span>
          <span className="badge bg-white text-dark ms-1">
            {pendingActions}
          </span>
        </>
      )}
      
      {showPending && (
        <>
          <span aria-hidden="true">🔄</span>
          <span>{pendingActions} Aksi Tersimpan</span>
          <span 
            className="ms-1"
            style={{ cursor: 'pointer', fontSize: '16px' }}
            role="button"
            aria-label="Sinkronkan sekarang"
            onClick={() => {
              setSyncing(true);
              setTimeout(() => setSyncing(false), 1000);
            }}
          >
            {syncing ? '⏳' : '▶️'}
          </span>
        </>
      )}
    </div>
  );
}
