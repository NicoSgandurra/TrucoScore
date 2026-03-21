const CACHE_NAME = 'truco-pro-cache-v1';
const ASSETS_TO_CACHE = [
    './',
    './index.html',
    './logo.svg'
];

self.addEventListener('install', (event) => {
    event.waitUntil(
        caches.open(CACHE_NAME).then((cache) => {
            return cache.addAll(ASSETS_TO_CACHE);
        })
    );
    // Force the waiting service worker to become the active service worker.
    self.skipWaiting();
});

self.addEventListener('activate', (event) => {
    event.waitUntil(
        caches.keys().then((cacheNames) => {
            return Promise.all(
                cacheNames.map((name) => {
                    if (name !== CACHE_NAME) {
                        return caches.delete(name);
                    }
                })
            );
        })
    );
    // Tell the active service worker to take control of the page immediately.
    self.clients.claim();
});

self.addEventListener('fetch', (event) => {
    event.respondWith(
        caches.match(event.request).then((cachedResponse) => {
            // Return cached resource if found
            if (cachedResponse) {
                return cachedResponse;
            }
            // Otherwise, fetch from network
            return fetch(event.request).catch(() => {
                // If offline and request fails, serve index.html as a fallback (since it's an SPA app)
                if (event.request.mode === 'navigate' || event.request.url.includes('index.html')) {
                    return caches.match('./index.html');
                }
            });
        })
    );
});
