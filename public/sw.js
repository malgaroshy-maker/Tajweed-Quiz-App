const CACHE_NAME = 'tajweed-quiz-cache-v3'; // Bumped version

self.addEventListener('install', (event) => {
  self.skipWaiting();
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      return cache.addAll([
        '/',
        '/manifest.json',
        '/icon.png',
        '/about',
      ]);
    })
  );
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.map((cache) => {
          if (cache !== CACHE_NAME) return caches.delete(cache);
        })
      );
    })
  );
});

self.addEventListener('fetch', (event) => {
  event.respondWith(
    caches.match(event.request).then((cachedResponse) => {
      if (cachedResponse) return cachedResponse;

      // Only attempt network if we are online
      return fetch(event.request)
        .then((networkResponse) => {
          // Cache dynamic GET responses for future offline use
          if (event.request.method === 'GET' && networkResponse.status === 200) {
            const responseToCache = networkResponse.clone();
            caches.open(CACHE_NAME).then((cache) => {
              cache.put(event.request, responseToCache);
            });
          }
          return networkResponse;
        })
        .catch(() => {
          // If offline and request is not in cache:
          // 1. If it's a navigation (page load), return the cached index
          if (event.request.mode === 'navigate') {
            return caches.match('/');
          }
          // 2. Otherwise, return a custom offline fallback response
          return new Response('You are offline.', {
            status: 503,
            headers: { 'Content-Type': 'text/plain' },
          });
        });
    })
  );
});
