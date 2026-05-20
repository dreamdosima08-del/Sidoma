const CACHE_NAME = 'artvinrehber-v8';
const URLS = [
  '/',
  '/index.html',
  '/taksi.html',
  '/dolmus.html',
  '/havas.html',
  '/namaz.html',
  '/eczane.html',
  '/hava.html',
  '/oteller.html',
  '/artvin-kampus-ulasim.html',
  '/artvinmetre.html',
  '/acukampus.html',
  '/artvin-mesafe.html',
  '/artvin-rakim-altimetre.html',
  '/artvin-misafirhane.html',
  '/artvin-forum.html',
  '/acu-ders-notu.html',
  '/blog1.html',
  '/blog2.html',
  '/blog3.html',
  '/manifest.json'
];

self.addEventListener('install', function(e) {
  e.waitUntil(
    caches.open(CACHE_NAME).then(function(cache) {
      return cache.addAll(URLS);
    }).catch(function(err) {
      console.log('Cache hatasi:', err);
    })
  );
  self.skipWaiting();
});

self.addEventListener('activate', function(e) {
  e.waitUntil(
    caches.keys().then(function(keys) {
      return Promise.all(
        keys.filter(function(key) {
          return key !== CACHE_NAME;
        }).map(function(key) {
          return caches.delete(key);
        })
      );
    })
  );
  self.clients.claim();
});

self.addEventListener('fetch', function(e) {
  if (e.request.method !== 'GET') return;
  e.respondWith(
    caches.match(e.request).then(function(cached) {
      if (cached) return cached;
      return fetch(e.request).then(function(response) {
        if (!response || response.status !== 200 || response.type !== 'basic') {
          return response;
        }
        var clone = response.clone();
        caches.open(CACHE_NAME).then(function(cache) {
          cache.put(e.request, clone);
        });
        return response;
      }).catch(function() {
        return caches.match('/index.html');
      });
    })
  );
});
