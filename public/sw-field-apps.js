// ============================================================
// VANGUARD ERP: FIELD APPS SERVICE WORKER (PWA & OFFLINE SHELL)
// Supports: V-Driver Mobile App & Sales Rep Mobile App ONLY
// Version: v2 (Strictly isolated from Backoffice & Core ERP)
// ============================================================

const CACHE_NAME = 'vanguard-field-apps-v2';
const STATIC_ASSETS = [
  '/v-driver',
  '/sales-rep',
  '/supersonic/driver',
  '/manifest-driver.json',
  '/manifest-sales.json',
  '/vanguard.jpg'
];

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      console.log('[Service Worker v2] Caching Field Apps Shell & Static Assets');
      return cache.addAll(STATIC_ASSETS).catch((err) => {
        console.warn('[Service Worker] Non-fatal cache addAll warning:', err);
      });
    })
  );
  self.skipWaiting();
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((keys) => {
      return Promise.all(
        keys.map((key) => {
          if (key !== CACHE_NAME) {
            console.log('[Service Worker] Removing old cache:', key);
            return caches.delete(key);
          }
        })
      );
    })
  );
  self.clients.claim();
});

// Network-First strictly for designated field app routes
self.addEventListener('fetch', (event) => {
  const { request } = event;

  // Ignore non-http/https schemes
  if (!request.url.startsWith('http://') && !request.url.startsWith('https://')) {
    return;
  }

  const url = new URL(request.url);

  // CRITICAL: NEVER intercept or block Backoffice, POS, Contacts, My Sales, Next.js bundles, or APIs
  if (
    url.pathname.startsWith('/backoffice') ||
    url.pathname.startsWith('/contacts') ||
    url.pathname.startsWith('/my-sales') ||
    url.pathname.startsWith('/pos') ||
    url.pathname.startsWith('/_next') ||
    url.pathname.startsWith('/api') ||
    url.pathname.startsWith('/workspace') ||
    url.pathname.startsWith('/accounting') ||
    url.pathname.startsWith('/inventory') ||
    url.pathname.startsWith('/pressing-mill') ||
    url.searchParams.has('section')
  ) {
    return; // Pass through natively to browser networking without calling event.respondWith
  }

  // Only handle explicit field apps scope
  const isFieldAppRoute =
    url.pathname === '/v-driver' ||
    url.pathname === '/sales-rep' ||
    url.pathname.startsWith('/supersonic/driver') ||
    url.pathname === '/manifest-driver.json' ||
    url.pathname === '/manifest-sales.json' ||
    url.pathname === '/vanguard.jpg';

  if (!isFieldAppRoute) {
    return; // Let browser handle natively
  }

  // Field Apps offline caching
  event.respondWith(
    fetch(request)
      .then((response) => {
        if (response && response.status === 200 && request.method === 'GET') {
          const responseClone = response.clone();
          caches.open(CACHE_NAME).then((cache) => {
            try {
              cache.put(request, responseClone).catch(() => {});
            } catch (err) {}
          }).catch(() => {});
        }
        return response;
      })
      .catch(async () => {
        try {
          const cached = await caches.match(request);
          if (cached) return cached;
          if (request.mode === 'navigate') {
            const fallback =
              (await caches.match('/v-driver')) ||
              (await caches.match('/sales-rep')) ||
              (await caches.match('/'));
            if (fallback) return fallback;
          }
        } catch (e) {}
        return new Response('Offline', { status: 503, statusText: 'Offline' });
      })
  );
});
