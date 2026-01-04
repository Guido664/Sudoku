const CACHE_NAME = 'sudoku-master-offline-v3';
const OFFLINE_URL = '/';
const ASSETS_TO_CACHE = [
  OFFLINE_URL,
  '/manifest.json',
  'https://cdn.tailwindcss.com'
];

// Install: Cache critical assets immediately
self.addEventListener('install', (event) => {
  self.skipWaiting();
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      // Cache App Shell and Critical External Dependencies
      // We use addAll to ensure the app looks correct immediately after installation
      return cache.addAll(ASSETS_TO_CACHE).catch(err => {
        console.error('Failed to cache critical assets during install:', err);
      });
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
  // Allow chrome-extension scheme if needed, but generally ignore
  if (event.request.method !== 'GET' || url.pathname.includes('generativelanguage')) {
    return;
  }

  // 2. Navigation Requests (HTML): Network First, fallback to Cache (App Shell)
  if (event.request.mode === 'navigate') {
    event.respondWith(
      fetch(event.request)
        .catch(() => {
          return caches.match(OFFLINE_URL);
        })
    );
    return;
  }

  // 3. Asset Requests (JS, CSS, Images, Fonts): Stale-While-Revalidate
  event.respondWith(
    caches.match(event.request).then((cachedResponse) => {
      const fetchPromise = fetch(event.request).then((networkResponse) => {
        // Check if valid response
        // IMPORTANT: Allow 'cors' type for external CDNs like Tailwind
        if (!networkResponse || networkResponse.status !== 200 || (networkResponse.type !== 'basic' && networkResponse.type !== 'cors')) {
          return networkResponse;
        }

        // Update cache with new version
        const responseToCache = networkResponse.clone();
        caches.open(CACHE_NAME).then((cache) => {
          cache.put(event.request, responseToCache);
        });

        return networkResponse;
      }).catch((err) => {
        // Network failed
        // console.log('Network fetch failed for', event.request.url);
      });

      // Return cached response if available, otherwise wait for network
      return cachedResponse || fetchPromise;
    })
  );
});