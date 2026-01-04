const CACHE_NAME = 'ai-sudoku-cache-v1';

// Install event: skip waiting to activate immediately
self.addEventListener('install', (event) => {
  self.skipWaiting();
});

// Activate event: clean up old caches
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.map((cacheName) => {
          if (cacheName !== CACHE_NAME) {
            return caches.delete(cacheName);
          }
        })
      );
    })
  );
  self.clients.claim();
});

// Fetch event: Network first for API, Stale-while-revalidate for assets
self.addEventListener('fetch', (event) => {
  const url = new URL(event.request.url);

  // Don't cache Gemini API calls or other non-GET requests
  if (event.request.method !== 'GET' || url.pathname.includes('generativelanguage')) {
    return;
  }

  event.respondWith(
    caches.match(event.request).then((cachedResponse) => {
      // Strategy: Cache First, falling back to network
      // This ensures the app loads instantly offline
      if (cachedResponse) {
        // Return cached response, but update cache in background (Stale-while-revalidate)
        // for external scripts like tailwind or esm.sh which might change
        fetch(event.request).then((networkResponse) => {
          if (networkResponse && networkResponse.status === 200 && networkResponse.type === 'basic' || networkResponse.type === 'cors') {
            const responseToCache = networkResponse.clone();
            caches.open(CACHE_NAME).then((cache) => {
              cache.put(event.request, responseToCache);
            });
          }
        }).catch(() => {
          // Network failure, just stick with cache
        });
        
        return cachedResponse;
      }

      // If not in cache, fetch from network
      return fetch(event.request).then((networkResponse) => {
        if (!networkResponse || networkResponse.status !== 200 || (networkResponse.type !== 'basic' && networkResponse.type !== 'cors')) {
          return networkResponse;
        }

        const responseToCache = networkResponse.clone();
        caches.open(CACHE_NAME).then((cache) => {
          cache.put(event.request, responseToCache);
        });

        return networkResponse;
      });
    })
  );
});