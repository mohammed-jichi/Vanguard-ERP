// Service Worker for Native PWA Address Bar Installation Support
const CACHE_NAME = 'southern-olive-pwa-v43';

self.addEventListener('install', (event) => {
  self.skipWaiting();
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.map((cache) => {
          if (cache !== CACHE_NAME) {
            return caches.delete(cache);
          }
        })
      );
    }).then(() => self.clients.claim())
  );
});

self.addEventListener('fetch', (event) => {
  const url = event.request.url;

  // 1. Bypass non-http/https schemes (chrome-extension, etc.) & external APIs (Google APIs, Supabase)
  if (!url.startsWith('http://') && !url.startsWith('https://')) {
    return;
  }
  if (url.includes('googleapis.com') || url.includes('supabase.co')) {
    return;
  }

  // 2. Network-First strategy for local scripts, styles, and HTML pages
  event.respondWith(
    fetch(event.request)
      .then((networkResponse) => {
        if (
          networkResponse &&
          networkResponse.status === 200 &&
          event.request.method === 'GET' &&
          (url.startsWith('http://') || url.startsWith('https://'))
        ) {
          const responseClone = networkResponse.clone();
          caches
            .open(CACHE_NAME)
            .then((cache) => cache.put(event.request, responseClone).catch(() => {}))
            .catch(() => {});
        }
        return networkResponse;
      })
      .catch(() => {
        return caches.match(event.request).then((cachedResponse) => {
          return (
            cachedResponse ||
            new Response('', {
              status: 200,
              statusText: 'OK',
              headers: new Headers({ 'Content-Type': 'text/plain' })
            })
          );
        });
      })
  );
});
