'use client';

import { useEffect, useState } from 'react';
import { useTheme } from '@/contexts/ThemeContext';
import { NetworkStatus } from '@/types/pwa';
import { getPendingActionCount, syncOfflineActions } from '@/utils/pwa/backgroundSync';

export default function OfflineIndicator() {
  const { theme } = useTheme();
  const [networkStatus, setNetworkStatus] = useState<NetworkStatus>('unknown');
  const [pendingActions, setPendingActions] = useState(0);
  const [syncing, setSyncing] = useState(false);

  const isDark = theme === 'dark';

  const updatePendingCount = () => {
    const pending = getPendingActionCount();
    setPendingActions(pending);
  };

  const handleSync = async () => {
    if (!syncing && networkStatus === 'online' && pendingActions > 0) {
      setSyncing(true);
      await syncOfflineActions();
      setSyncing(false);
      updatePendingCount();
    }
  };

  useEffect(() => {
    const updateNetworkStatus = () => {
      if (typeof navigator !== 'undefined') {
        setNetworkStatus(navigator.onLine ? 'online' : 'offline');
      }
    };

    updateNetworkStatus();
    updatePendingCount();

    const syncInterval = setInterval(() => {
      updatePendingCount();
    }, 5000);

    window.addEventListener('online', updateNetworkStatus);
    window.addEventListener('offline', updateNetworkStatus);

    return () => {
      window.removeEventListener('online', updateNetworkStatus);
      window.removeEventListener('offline', updateNetworkStatus);
      clearInterval(syncInterval);
    };
  }, [networkStatus, syncing]);

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
            onClick={handleSync}
          >
            {syncing ? '⏳' : '▶️'}
          </span>
        </>
      )}
    </div>
  );
}
