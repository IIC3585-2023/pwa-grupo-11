const staticAssets = [
    './',
    './index.html',
    './styles.css',
    './functionality.js'
];

const cacheName = 'notesCache';

self.addEventListener('install', async event => {
    const cache = await caches.open(cacheName);
    cache.addAll(staticAssets);
});

// const enableNavigationPreload = async () => {
//     if (self.registration.navigationPreload) {
//       // Enable navigation preloads!
//       await self.registration.navigationPreload.enable();
//     }
// };
  
// self.addEventListener('activate', (event) => {
//     event.waitUntil(enableNavigationPreload());
// });

const networkFirstThenCache = async (request) => {
    const cache = await caches.open(cacheName);
    try {
        // Fetch request
        const response = await fetch(request);
        // Save into cache
        cache.put(request, response.clone())
        console.log('Used network')
        return response
    } 
    catch (error) {
        console.log('Falling back to cache...')
        const res = await cache.match(request)
        return res
    }
}

self.addEventListener('fetch', event => {
    const {request} = event;
    // const url = new URL(request.url);
    console.log("Logging from serviceWorker fetch event")
    console.log("Using networkFirst Strategy...")

    event.respondWith(networkFirstThenCache(request));
});
