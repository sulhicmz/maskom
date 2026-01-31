'use client';

import { useState, useCallback } from 'react';

export type ServiceWorkerStatus = 'unsupported' | 'installing' | 'activated' | 'error' | 'waiting';

export interface ServiceWorkerMessage {
  type: 'SKIP_WAITING' | 'CLEAR_CACHE' | 'STATUS';
  payload?: unknown;
}

export function useServiceWorker() {
  const [_status, _setStatus] = useState<ServiceWorkerStatus>(() => {
    if (typeof window === 'undefined') return 'unsupported';
    if (!('serviceWorker' in navigator)) return 'unsupported';
    return 'installing';
  });
  const [registration, setRegistration] = useState<ServiceWorkerRegistration | null>(null);
  const [updateAvailable, setUpdateAvailable] = useState(false);

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
