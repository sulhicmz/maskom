const CACHE_NAME = 'maskom-pwa-v1';
const RUNTIME_CACHE = 'maskom-runtime-v1';

const STATIC_ASSETS = [
  '/',
  '/favicon.png',
  '/manifest.json',
  '/_next/static/css/app/layout.css',
  '/assets/images/logo/main-logo.png',
  '/assets/images/logo/white-logo.png',
  '/assets/images/logo/secondary-logo.png',
];

const DEFAULT_CACHE_CONFIG = {
  cacheFirstExtensions: ['.js', '.css', '.png', '.jpg', '.jpeg', '.gif', '.svg', '.ico', '.woff', '.woff2', '.ttf'],
  networkFirstPatterns: ['/api/'],
  cacheTTL: {
    staticAssets: 86400,
    apiResponses: 300,
    images: 604800,
    fonts: 604800,
  },
  cacheSizeLimit: 50,
  cleanupPolicy: {
    enabled: true,
    maxAge: 2592000,
    maxEntries: 1000,
    autoCleanupInterval: 60,
  },
};

let cacheConfig = DEFAULT_CACHE_CONFIG;

let cacheStats = {
  totalRequests: 0,
  cacheHits: 0,
  cacheMisses: 0,
  entriesByCache: {},
};

function loadConfig() {
  try {
    const stored = localStorage?.getItem('maskom_cache_config');
    if (stored) {
      cacheConfig = { ...DEFAULT_CACHE_CONFIG, ...JSON.parse(stored) };
    }
  } catch (error) {
    console.error('[Service Worker] Failed to load config:', error);
  }
}

function recordCacheHit(cacheName) {
  cacheStats.totalRequests++;
  cacheStats.cacheHits++;
  updateEntryStats(cacheName);
}

function recordCacheMiss(cacheName) {
  cacheStats.totalRequests++;
  cacheStats.cacheMisses++;
  updateEntryStats(cacheName);
}

function recordCacheEntry(cacheName, size) {
  const now = Date.now();
  const stats = cacheStats.entriesByCache[cacheName] || {
    count: 0,
    size: 0,
    oldestEntry: null,
    newestEntry: null,
  };

  stats.count++;
  stats.size += size;
  if (!stats.oldestEntry || now < stats.oldestEntry) {
    stats.oldestEntry = now;
  }
  if (!stats.newestEntry || now > stats.newestEntry) {
    stats.newestEntry = now;
  }

  cacheStats.entriesByCache[cacheName] = stats;
}

function resetCacheStats() {
  cacheStats.totalRequests = 0;
  cacheStats.cacheHits = 0;
  cacheStats.cacheMisses = 0;
  cacheStats.entriesByCache = {};
}

function updateEntryStats(cacheName) {
  if (!cacheStats.entriesByCache[cacheName]) {
    cacheStats.entriesByCache[cacheName] = {
      count: 0,
      size: 0,
      oldestEntry: null,
      newestEntry: null,
    };
  }
}

function getCacheStats() {
  return {
    totalRequests: cacheStats.totalRequests,
    cacheHits: cacheStats.cacheHits,
    cacheMisses: cacheStats.cacheMisses,
    cacheHitRate: cacheStats.totalRequests > 0
      ? (cacheStats.cacheHits / cacheStats.totalRequests) * 100
      : 0,
    entriesByCache: cacheStats.entriesByCache,
  };
}

async function checkCacheSize() {
  const cacheNames = await caches.keys();
  let totalSize = 0;

  for (const cacheName of cacheNames) {
    const cache = await caches.open(cacheName);
    const requests = await cache.keys();

    for (const request of requests) {
      const response = await cache.match(request);
      if (response) {
        const size = response.headers.get('content-length');
        if (size) {
          totalSize += parseInt(size);
        }
      }
    }
  }

  return totalSize;
}

self.addEventListener('install', (event) => {
  console.log('[Service Worker] Installing...');
  loadConfig();

  event.waitUntil(
    caches.open(CACHE_NAME)
      .then((cache) => {
        console.log('[Service Worker] Caching static assets...');
        return cache.addAll(STATIC_ASSETS);
      })
      .then(() => {
        console.log('[Service Worker] Static assets cached successfully');
        return self.skipWaiting();
      })
      .catch((error) => {
        console.error('[Service Worker] Failed to cache static assets:', error);
      })
  );
});

self.addEventListener('activate', (event) => {
  console.log('[Service Worker] Activating...');

  event.waitUntil(
    Promise.all([
      caches.keys().then((cacheNames) => {
        return Promise.all(
          cacheNames.map((cacheName) => {
            if (cacheName !== CACHE_NAME && cacheName !== RUNTIME_CACHE) {
              console.log('[Service Worker] Deleting old cache:', cacheName);
              return caches.delete(cacheName);
            }
          })
        );
      }),
      self.clients.claim(),
    ])
  );
});

self.addEventListener('fetch', (event) => {
  const url = new URL(event.request.url);

  if (url.origin === location.origin) {
    if (isStaticAsset(url)) {
      event.respondWith(handleCacheFirst(event.request));
      return;
    }
  }

  if (isNetworkFirstPattern(url)) {
    event.respondWith(handleNetworkFirst(event.request));
    return;
  }

  event.respondWith(handleStaleWhileRevalidate(event.request));
});

function isStaticAsset(url) {
  return cacheConfig.cacheFirstExtensions.some(ext => url.pathname.endsWith(ext));
}

function isNetworkFirstPattern(url) {
  return cacheConfig.networkFirstPatterns.some(pattern => url.pathname.startsWith(pattern));
}

async function handleCacheFirst(request) {
  const cacheName = CACHE_NAME;
  const cache = await caches.open(cacheName);
  const cachedResponse = await cache.match(request);

  if (cachedResponse) {
    console.log('[Service Worker] Serving from cache:', request.url);
    recordCacheHit(cacheName);
    return cachedResponse;
  }

  console.log('[Service Worker] Cache miss, fetching:', request.url);
  recordCacheMiss(cacheName);

  try {
    const networkResponse = await fetch(request);

    if (networkResponse && networkResponse.status === 200) {
      const clone = networkResponse.clone();
      const size = await calculateResponseSize(clone);
      await cache.put(request, clone);
      recordCacheEntry(cacheName, size);
    }

    return networkResponse;
  } catch (error) {
    console.error('[Service Worker] Cache-first error:', error);
    return handleOfflineFallback(request);
  }
}

async function handleNetworkFirst(request) {
  const cacheName = RUNTIME_CACHE;
  const cache = await caches.open(cacheName);
  const cachedResponse = await cache.match(request);

  try {
    const networkResponse = await fetch(request);

    if (networkResponse && networkResponse.status === 200) {
      const clone = networkResponse.clone();
      const size = await calculateResponseSize(clone);
      await cache.put(request, clone);
      recordCacheEntry(cacheName, size);
    }

    recordCacheHit(cacheName);
    return networkResponse;
  } catch (networkError) {
    console.log('[Service Worker] Network failed, using cache:', request.url);

    if (cachedResponse) {
      recordCacheHit(cacheName);
      return cachedResponse;
    }

    recordCacheMiss(cacheName);
    throw networkError;
  }
}

async function handleStaleWhileRevalidate(request) {
  const cacheName = RUNTIME_CACHE;
  const cache = await caches.open(cacheName);
  const cachedResponse = await cache.match(request);

  const fetchPromise = fetch(request).then(async (networkResponse) => {
    if (networkResponse && networkResponse.status === 200) {
      const clone = networkResponse.clone();
      const size = await calculateResponseSize(clone);
      await cache.put(request, clone);
      recordCacheEntry(cacheName, size);
    }
    recordCacheHit(cacheName);
    return networkResponse;
  }).catch((error) => {
    console.error('[Service Worker] Fetch error:', error);
    recordCacheMiss(cacheName);
  });

  if (cachedResponse) {
    recordCacheHit(cacheName);
    return cachedResponse || fetchPromise;
  }

  return fetchPromise;
}

async function calculateResponseSize(response) {
  const blob = await response.blob();
  return blob.size;
}

function handleOfflineFallback(request) {
  if (request.mode === 'navigate') {
    return caches.match('/');
  }

  return new Response('Offline', {
    status: 503,
    statusText: 'Service Unavailable',
    headers: new Headers({ 'Content-Type': 'text/plain' }),
  });
}

self.addEventListener('message', (event) => {
  console.log('[Service Worker] Message received:', event.data);

  if (event.data && event.data.type === 'SKIP_WAITING') {
    self.skipWaiting();
  }

  if (event.data && event.data.type === 'CLEAR_CACHE') {
    event.waitUntil(
      caches.keys().then((cacheNames) => {
        return Promise.all(
          cacheNames.map((cacheName) => caches.delete(cacheName))
        );
      }).then(() => {
        resetCacheStats();
        event.ports?.[0]?.postMessage({ type: 'CACHE_CLEARED' });
      }).catch((error) => {
        event.ports?.[0]?.postMessage({ type: 'CACHE_CLEAR_ERROR', error: error.message });
      })
    );
  }

  if (event.data && event.data.type === 'GET_CACHE_STATS') {
    event.waitUntil(
      Promise.all([
        checkCacheSize(),
      ]).then(([totalCacheSize]) => {
        const stats = getCacheStats();
        stats.totalCacheSize = totalCacheSize;
        event.ports?.[0]?.postMessage({ type: 'CACHE_STATS', stats });
      }).catch((error) => {
        console.error('[Service Worker] Failed to get statistics:', error);
      })
    );
  }

  if (event.data && event.data.type === 'UPDATE_CACHE_CONFIG') {
    cacheConfig = { ...DEFAULT_CACHE_CONFIG, ...event.data.config };
    console.log('[Service Worker] Cache configuration updated:', cacheConfig);
  }
});

console.log('[Service Worker] Script loaded');
