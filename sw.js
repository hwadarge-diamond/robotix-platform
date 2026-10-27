// ROBOTIX Platform - Offline Service Worker
const CACHE_NAME = 'robotix-v2-cache';
const PRECACHE_ASSETS = [
  './',
  './index.html',
  './components.html',
  './types.html',
  './electronics.html',
  './simulators.html',
  './programming.html',
  './applications.html',
  './quiz.html',
  './credits.html',
  './404.html',
  './style.css',
  './script.js',
  './manifest.json',
  './assets/images/favicon.svg',
  './assets/images/logo.webp',
  './assets/images/humanoid.webp',
  './assets/images/robotic_arm.webp',
  './assets/images/surgical_robot.webp',
  './assets/images/mobile_amr.webp'
];

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      return cache.addAll(PRECACHE_ASSETS);
    }).then(() => self.skipWaiting())
  );
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((keys) => {
      return Promise.all(
        keys.filter((key) => key !== CACHE_NAME).map((key) => caches.delete(key))
      );
    }).then(() => self.clients.claim())
  );
});

self.addEventListener('fetch', (event) => {
  // Stale-while-revalidate strategy for same-origin requests
  if (event.request.method === 'GET' && event.request.url.startsWith(self.location.origin)) {
    event.respondWith(
      caches.match(event.request).then((cachedResponse) => {
        const fetchPromise = fetch(event.request).then((networkResponse) => {
          if (networkResponse && networkResponse.status === 200) {
            const responseToCache = networkResponse.clone();
            caches.open(CACHE_NAME).then((cache) => {
              cache.put(event.request, responseToCache);
            });
          }
          return networkResponse;
        }).catch(() => cachedResponse || caches.match('./404.html'));
        return cachedResponse || fetchPromise;
      })
    );
  }
});
