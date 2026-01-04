const CACHE_NAME = 'sudoku-master-offline-v4';
const OFFLINE_URL = '/';

// List of assets to force-cache during install. 
// This includes the HTML, Manifest, Icons, Tailwind, and the specific ESM libraries used in index.html.
const ASSETS_TO_CACHE = [
  OFFLINE_URL,
  '/manifest.json',
  'https://cdn.tailwindcss.com',
  // App Icon (Critical for PWA startup on some devices)
  'https://upload.wikimedia.org/wikipedia/commons/e/e0/Sudoku_Puzzle_by_L2G-20050714_standardized_layout.svg',
  // External Libraries defined in importmap (Critical for app logic)
  'https://esm.sh/@google/genai@^1.34.0',
  'https://esm.sh/@vitejs/plugin-react@^5.1.2',
  'https://esm.sh/vite@^7.3.0',
  'https://esm.sh/react@^19.2.3/',
  'https://esm.sh/react@^19.2.3',
  'https://esm.sh/react-dom@^19.2.3/',
  'https://esm.sh/react-dom@^19.2.3'
];

// Install: Cache critical assets immediately
self.addEventListener('install', (event) => {
  self.skipWaiting();
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      console.log('SW: Pre-caching offline assets');
      // We use addAll to ensure the app looks correct immediately after installation.
      // We catch errors individually to prevent one failure from stopping the whole install,
      // though for a robust PWA, we ideally want all of them.
      return Promise.all(
        ASSETS_TO_CACHE.map(url => {
          return cache.add(url).catch(err => {
            console.warn('SW: Failed to cache ' + url, err);
          });
        })
      );
    })
  );
});

// Activate: Clean up old caches and take control immediately
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.map((cacheName) => {
          if (cacheName !== CACHE_NAME) {
            console.log('SW: Deleting old cache', cacheName);
            return caches.delete(cacheName);
          }
        })
      );
    })
  );
  // Important: Claim clients immediately so the user doesn't have to refresh twice
  self.clients.claim();
});

// Fetch: Handle requests
self.addEventListener('fetch', (event) => {
  const url = new URL(event.request.url);

  // 1. Ignore non-GET requests and external API calls (Gemini API endpoints)
  // We DO want to cache the library JS (@google/genai) but NOT the API calls (generativelanguage.googleapis.com)
  if (event.request.method !== 'GET' || url.hostname.includes('generativelanguage.googleapis.com')) {
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
        // IMPORTANT: Allow 'cors' and 'opaque' types for external CDNs
        if (!networkResponse || (networkResponse.status !== 200 && networkResponse.status !== 0)) {
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