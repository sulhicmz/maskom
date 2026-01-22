'use client';

import { useEffect, useState, useCallback } from 'react';

export type ServiceWorkerStatus = 'unsupported' | 'installing' | 'activated' | 'error' | 'waiting';

export interface ServiceWorkerMessage {
  type: 'SKIP_WAITING' | 'CLEAR_CACHE' | 'STATUS';
  payload?: unknown;
}

export function useServiceWorker() {
  const [status, setStatus] = useState<ServiceWorkerStatus>('unsupported');
  const [registration, setRegistration] = useState<ServiceWorkerRegistration | null>(null);
  const [updateAvailable, setUpdateAvailable] = useState(false);

  const handleUpdateFound = useCallback(() => {
    if (!registration) return;

    const newWorker = registration.installing;
    if (!newWorker) return;

    newWorker.addEventListener('statechange', () => {
      if (newWorker.state === 'installed' && registration.waiting) {
        setUpdateAvailable(true);
      }
    });
  }, [registration]);

  const registerServiceWorker = useCallback(async () => {
    try {
      const reg = await navigator.serviceWorker.register('/sw.js');
      setRegistration(reg);
      setStatus('activated');
      
      reg.addEventListener('updatefound', handleUpdateFound);

      if (reg.waiting) {
        setUpdateAvailable(true);
      }
    } catch (error) {
      console.error('[Service Worker] Registration failed:', error);
      setStatus('error');
    }
  }, [handleUpdateFound]);

  useEffect(() => {
    if (!('serviceWorker' in navigator)) {
      setStatus('unsupported');
      return;
    }

    registerServiceWorker();

    return () => {
      if (registration) {
        registration.removeEventListener('updatefound', handleUpdateFound);
      }
    };
  }, [registerServiceWorker, registration, handleUpdateFound]);

  const skipWaiting = () => {
    if (registration && registration.waiting) {
      registration.waiting.postMessage({ type: 'SKIP_WAITING' });
      window.location.reload();
    }
  };

  const clearCache = () => {
    if (registration && registration.active) {
      registration.active.postMessage({ type: 'CLEAR_CACHE' });
    }
  };

  return {
    status,
    updateAvailable,
    skipWaiting,
    clearCache,
  };
}
