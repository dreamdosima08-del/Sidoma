const CACHE_NAME = 'artvinrehber-v10';
const URLS = [
  '/',
  '/index.html',
  '/manifest.json',
  // En çok ziyaret edilen / en kritik sayfalar - internet yokken de açılsın
  '/havas.html',
  '/dolmus.html',
  '/taksi.html',
  '/eczane-rehber.html',
  '/oteller.html',
  '/hava.html',
  '/namaz.html',
  '/artvinmetre.html',
  '/artvin-rakim-altimetre.html',
  '/artvin-harita.html',
  '/artvin-mesafe.html',
  '/gezi.html',
  '/blog19.html',
  '/blog9.html',
  '/blog18.html',
  '/acu-tercih-rehberi.html',
  '/sehirici-dolmus.html'
];

self.addEventListener('install', function(e) {
  e.waitUntil(
    caches.open(CACHE_NAME).then(function(cache) {
      // Tek tek dene - listedeki bir sayfa 404 olsa bile digerleri onbelleklensin
      return Promise.allSettled(
        URLS.map(function(url) {
          return cache.add(url).catch(function(err) {
            console.log('Onbelleklenemedi:', url, err);
          });
        })
      );
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

// NETWORK-FIRST: Once internetten guncel halini cek, internet yoksa cache kullan
self.addEventListener('fetch', function(e) {
  if (e.request.method !== 'GET') return;

  // HTML sayfalari icin her zaman network-first
  e.respondWith(
    fetch(e.request).then(function(response) {
      // Basarili cevap geldiyse cache'i guncelle
      if (response && response.status === 200 && response.type === 'basic') {
        var clone = response.clone();
        caches.open(CACHE_NAME).then(function(cache) {
          cache.put(e.request, clone);
        });
      }
      return response;
    }).catch(function() {
      // Internet yoksa cache'den ver
      return caches.match(e.request).then(function(cached) {
        return cached || caches.match('/index.html');
      });
    })
  );
});
