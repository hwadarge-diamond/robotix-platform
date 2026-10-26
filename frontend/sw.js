// City Life Service Worker for offline baseline caching
const CACHE_NAME = 'citylife-cache-v1';
const ASSETS_TO_CACHE = [
  '/',
  '/index.html',
  '/static/css/styles.css',
  '/static/js/app.js',
  '/static/js/api.js',
  '/static/js/map.js',
  '/static/js/layers.js'
];

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      return cache.addAll(ASSETS_TO_CACHE);
    })
  );
  self.skipWaiting();
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((keys) => {
      return Promise.all(
        keys.map((k) => {
          if (k !== CACHE_NAME) return caches.delete(k);
        })
      );
    })
  );
  self.clients.claim();
});

self.addEventListener('fetch', (event) => {
  if (event.request.method === 'GET' && !event.request.url.includes('/api/')) {
    event.respondWith(
      caches.match(event.request).then((cached) => {
        return cached || fetch(event.request);
      })
    );
  }
});
