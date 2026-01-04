const CACHE_NAME = 'sudoku-master-offline-v2';
const OFFLINE_URL = '/';

// Install: Cache the app shell immediately
self.addEventListener('install', (event) => {
  self.skipWaiting();
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      // We cache the root URL to ensure the app shell loads offline
      return cache.add(OFFLINE_URL);
    })
  );
});

// Activate: Clean up old caches
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

// Fetch: Handle requests
self.addEventListener('fetch', (event) => {
  const url = new URL(event.request.url);

  // 1. Ignore non-GET requests and external API calls (Gemini)
  if (event.request.method !== 'GET' || url.pathname.includes('generativelanguage') || url.protocol === 'chrome-extension:') {
    return;
  }

  // 2. Navigation Requests (HTML): Network First, fallback to Cache (App Shell)
  // This ensures that reloading the page while offline always returns the app
  if (event.request.mode === 'navigate') {
    event.respondWith(
      fetch(event.request)
        .catch(() => {
          return caches.match(OFFLINE_URL);
        })
    );
    return;
  }

  // 3. Asset Requests (JS, CSS, Images): Stale-While-Revalidate
  // Serve from cache immediately, then update cache in background
  event.respondWith(
    caches.match(event.request).then((cachedResponse) => {
      const fetchPromise = fetch(event.request).then((networkResponse) => {
        // Check if valid response
        if (!networkResponse || networkResponse.status !== 200 || networkResponse.type !== 'basic') {
          return networkResponse;
        }

        // Update cache with new version
        const responseToCache = networkResponse.clone();
        caches.open(CACHE_NAME).then((cache) => {
          cache.put(event.request, responseToCache);
        });

        return networkResponse;
      }).catch(() => {
        // Network failed, nothing to do (cached response already returned if available)
      });

      // Return cached response if available, otherwise wait for network
      return cachedResponse || fetchPromise;
    })
  );
});