const CACHE_NAME = 'watchme-cache-v1';
const urlsToCache = [
  './index.html',
  './kategori.html',
  './jadwal.html',
  './favorit.html',
  './nonton.html',
  './css/style.css',
  './js/main.js',
  './logo.svg'
];

self.addEventListener('install', event => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then(cache => cache.addAll(urlsToCache))
  );
});

self.addEventListener('fetch', event => {
  event.respondWith(
    caches.match(event.request)
      .then(response => response || fetch(event.request))
  );
});