const CACHE_NAME = 'artvinrehber-v1';
const URLS = [
  '/',
  '/index.html',
  '/taksi.html',
  '/dolmus.html',
  '/havas.html',
  '/namaz.html',
  '/eczane.html',
  '/eczane-rehber.html',
  '/oteller.html',
  '/artvinmetre.html',
  '/imece.html',
  '/kayipbuluntu.html',
  '/artvin-nasil-gidilir.html',
  '/artvin-kampus-ulasim.html',
  '/manifest.json'
];

self.addEventListener('install', function(e) {
  e.waitUntil(
    caches.open(CACHE_NAME).then(function(cache) {
      return cache.addAll(URLS);
    })
  );
  self.skipWaiting();
});

self.addEventListener('activate', function(e) {
  e.waitUntil(
    caches.keys().then(function(keys) {
      return Promise.all(
        keys.filter(function(k) { return k !== CACHE_NAME; })
            .map(function(k) { return caches.delete(k); })
      );
    })
  );
  self.clients.claim();
});

self.addEventListener('fetch', function(e) {
  e.respondWith(
    caches.match(e.request).then(function(cached) {
      return cached || fetch(e.request).catch(function() {
        return caches.match('/index.html');
      });
    })
  );
});
