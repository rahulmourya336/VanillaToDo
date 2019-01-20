let CACHE_NAME = 'static-cache';
let urlsToCache = [
  'index.html',
  'style.css',
  'assets',
  'node_modules',
  'script.js'
];
self.addEventListener('install', function (event) {
  console.info('Caching resources');
  event.waitUntil(
    caches.keys().then(function(cacheNames) {
      return Promise.all(
        cacheNames.filter(function(cacheName) {
         return true;
        }).map(function(cacheName) {
          return caches.delete(cacheName);
        })
      );
    })
  );
}); 

self.addEventListener('activate', function(event) {
  console.log('👷', 'activate', event);
  event.waitUntil(
    caches.keys().then(function(cacheNames) {
      return Promise.all(
        cacheNames.filter(function(cacheName) {
         return true;
        }).map(function(cacheName) {
          return caches.delete(cacheName);
        })
      );
    })
  );
});

self.addEventListener('fetch', function (event) {
  // console.log('👷', 'fetch', event);
  event.respondWith(
    caches.open('static-cache').then(function(cache) {
      return cache.match(event.request).then(function (response) {
        return response || fetch(event.request).then(function(response) {
          cache.put(event.request, response.clone());
          return response;
        });
      });
    })
  );
});
