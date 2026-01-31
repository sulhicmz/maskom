'use client';

import { useState, useCallback, useEffect } from 'react';

export type ServiceWorkerStatus = 'unsupported' | 'installing' | 'activated' | 'error' | 'waiting';

export interface ServiceWorkerMessage {
  type: 'SKIP_WAITING' | 'CLEAR_CACHE' | 'STATUS';
  payload?: unknown;
}

export function useServiceWorker() {
  const [status, setStatus] = useState<ServiceWorkerStatus>(() => {
    if (typeof window === 'undefined') return 'unsupported';
    if (!('serviceWorker' in navigator)) return 'unsupported';
    return 'installing';
  });
  const [registration, setRegistration] = useState<ServiceWorkerRegistration | null>(null);
  const [updateAvailable, setUpdateAvailable] = useState(false);

  const skipWaiting = useCallback(() => {
    if (registration && registration.waiting) {
      registration.waiting.postMessage({ type: 'SKIP_WAITING' });
      window.location.reload();
    }
  }, [registration]);

  const clearCache = useCallback(() => {
    if (registration && registration.active) {
      registration.active.postMessage({ type: 'CLEAR_CACHE' });
    }
  }, [registration]);

  useEffect(() => {
    if (typeof window === 'undefined' || !('serviceWorker' in navigator)) {
      return;
    }

    const registerServiceWorker = async () => {
      try {
        const reg = await navigator.serviceWorker.register('/sw.js');
        setRegistration(reg);
        setStatus('activated');

        if (reg.waiting) {
          setUpdateAvailable(true);
          setStatus('waiting');
        }

        reg.addEventListener('updatefound', () => {
          const newWorker = reg.installing;
          if (newWorker) {
            newWorker.addEventListener('statechange', () => {
              if (newWorker.state === 'installed' && reg.waiting) {
                setUpdateAvailable(true);
                setStatus('waiting');
              }
            });
          }
        });
      } catch (_error) {
        setStatus('error');
      }
    };

    registerServiceWorker();
  }, []);

  return {
    status,
    updateAvailable,
    skipWaiting,
    clearCache,
  };
}
