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

const CACHE_STRATEGIES = {
  CACHE_FIRST: 'cache-first',
  NETWORK_FIRST: 'network-first',
  STALE_WHILE_REVALIDATE: 'stale-while-revalidate',
  NETWORK_ONLY: 'network-only',
};

self.addEventListener('install', (event) => {
  console.log('[Service Worker] Installing...');
  
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

  if (url.pathname.startsWith('/api/')) {
    event.respondWith(handleNetworkFirst(event.request));
    return;
  }

  event.respondWith(handleStaleWhileRevalidate(event.request));
});

function isStaticAsset(url) {
  const staticExtensions = [
    '.js', '.css', '.png', '.jpg', '.jpeg', '.gif', '.svg', '.ico', '.woff', '.woff2', '.ttf'
  ];
  return staticExtensions.some(ext => url.pathname.endsWith(ext));
}

async function handleCacheFirst(request) {
  try {
    const cache = await caches.open(CACHE_NAME);
    const cachedResponse = await cache.match(request);
    
    if (cachedResponse) {
      console.log('[Service Worker] Serving from cache:', request.url);
      return cachedResponse;
    }
    
    console.log('[Service Worker] Cache miss, fetching:', request.url);
    const networkResponse = await fetch(request);
    
    if (networkResponse && networkResponse.status === 200) {
      cache.put(request, networkResponse.clone());
    }
    
    return networkResponse;
  } catch (error) {
    console.error('[Service Worker] Cache-first error:', error);
    return handleOfflineFallback(request);
  }
}

async function handleNetworkFirst(request) {
  try {
    const cache = await caches.open(RUNTIME_CACHE);
    const cachedResponse = await cache.match(request);
    
    try {
      const networkResponse = await fetch(request);
      
      if (networkResponse && networkResponse.status === 200) {
        await cache.put(request, networkResponse.clone());
      }
      
      return networkResponse;
    } catch (networkError) {
      console.log('[Service Worker] Network failed, using cache:', request.url);
      
      if (cachedResponse) {
        return cachedResponse;
      }
      
      throw networkError;
    }
  } catch (error) {
    console.error('[Service Worker] Network-first error:', error);
    return handleOfflineFallback(request);
  }
}

async function handleStaleWhileRevalidate(request) {
  try {
    const cache = await caches.open(RUNTIME_CACHE);
    const cachedResponse = await cache.match(request);
    
    const fetchPromise = fetch(request).then(async (networkResponse) => {
      if (networkResponse && networkResponse.status === 200) {
        await cache.put(request, networkResponse.clone());
      }
      return networkResponse;
    }).catch((error) => {
      console.error('[Service Worker] Fetch error:', error);
    });
    
    return cachedResponse || fetchPromise;
  } catch (error) {
    console.error('[Service Worker] Stale-while-revalidate error:', error);
    return handleOfflineFallback(request);
  }
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
      })
    );
  }
});

console.log('[Service Worker] Script loaded');
