self.addEventListener('install', (event) => {
  console.log('👷', 'install', event);
  
  event.respondWith(
    caches.match(event.request)
    .then(function(response) {
      return response || fetchAndCache(event.request);
    })
  );
  
  self.skipWaiting();
});

self.addEventListener('activate', (event) => {
  console.log('👷', 'activate', event);
  return self.clients.claim();
});

self.addEventListener('fetch', function (event) {
  // console.log('👷', 'fetch', event);
  if (event.request.cache === 'only-if-cached' && event.request.mode !== 'same-origin') {
    return;
  }
  event.respondWith(fetch(event.request));
});

let CACHE_NAME = 'static-cache';
let urlsToCache = [
  '.',
  'index.html',
  'style.css',
  'assets/',
  './node_modules',
  'script.js'
];
self.addEventListener('install', function (event) {
  console.info('Caching resources');
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then(function (cache) {
        return cache.addAll(urlsToCache);
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