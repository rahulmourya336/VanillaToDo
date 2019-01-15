// self.addEventListener('install', (event) => {
//   console.log('👷', 'install', event);
  
//   event.respondWith(
//     caches.match(event.request)
//     .then(function(response) {
//       return response || fetchAndCache(event.request);
//     })
//   );
  
//   self.skipWaiting();
// });

let CACHE_NAME = 'static-cache';
let urlsToCache = [
'/'
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



async function fetchAndCache(url) {
  try {
    const response = await fetch(url);
    // Check if we received a valid response
    if (!response.ok) {
      throw Error(response.statusText);
    }
    const cache = await caches.open(CACHE_NAME);
    cache.put(url, response.clone());
    return response;
  }
  catch (error) {
    console.log('Request failed:', error);
  }
}