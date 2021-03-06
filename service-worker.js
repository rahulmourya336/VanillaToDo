let CACHE_NAME = 'static-cache';
let urlsToCache = [
  'index.html',
  'style.css',
  'assets',
  'node_modules',
  'script.js',
  'service-worker.js',
];
self.addEventListener('install', function (event) {
  console.info('Caching resources');
  event.waitUntil(
    caches.keys().then(function(cacheNames) {
      return Promise.all(
        cacheNames.filter(function(cacheName) {
          // Return true if you want to remove this cache,
          // but remember that caches are shared across
          // the whole origin
        }).map(function(cacheName) {
          return caches.delete(cacheName);
        })
      );
    })
  );
}); 

self.addEventListener('activate', (event) => {
  console.log('👷', 'activate', event);
  return self.clients.claim();
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
