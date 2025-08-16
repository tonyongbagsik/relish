const CACHE_NAME = 'staff-consumption-cache-v9';
const urlsToCache = [
  '/', // assuming index.html is at root
  '/index.html',
  '/manifest.json',
  // mga CSS, JS files kung naka-separate
];

// On install, cache files
self.addEventListener('install', event => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then(cache => cache.addAll(urlsToCache))
      .then(() => self.skipWaiting())
  );
});

// On activate, clean old caches if needed
self.addEventListener('activate', event => {
  event.waitUntil(
    caches.keys().then(keys => 
      Promise.all(
        keys.filter(key => key !== CACHE_NAME)
            .map(key => caches.delete(key))
      )
    ).then(() => self.clients.claim())
  );
});

// Fetch handler: respond from cache, fallback to network, cache new requests
self.addEventListener('fetch', event => {
  if (event.request.method !== 'GET') return; // only cache GET requests

  event.respondWith(
    caches.match(event.request).then(cachedResponse => {
      if (cachedResponse) {
        return cachedResponse;
      }
      return fetch(event.request).then(networkResponse => {
        // cache fetched files dynamically (optional)
        return caches.open(CACHE_NAME).then(cache => {
          // Clone response before caching
          cache.put(event.request, networkResponse.clone());
          return networkResponse;
        });
      }).catch(() => {
        // fallback if offline and resource not cached
        if (event.request.destination === 'document') {
          return caches.match('/index.html');
        }
      });
    })
  );

});







