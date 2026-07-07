// Service Worker for IPTV PWA
const CACHE_NAME = 'iptv-vision-v1';
const urlsToCache = [
  './',
  './index.html',
  './app.js',
  'https://cdn.tailwindcss.com',
  'https://cdn.jsdelivr.net/npm/hls.js@1.5.13'
];

self.addEventListener('install', event => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then(cache => cache.addAll(urlsToCache))
      .then(() => self.skipWaiting())
  );
});

self.addEventListener('fetch', event => {
  event.respondWith(
    caches.match(event.request)
      .then(response => response || fetch(event.request))
  );
});

self.addEventListener('activate', event => {
  event.waitUntil(self.clients.claim());
});