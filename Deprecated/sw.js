const CACHE_NAME = 'truco-score-v1';
const ASSETS = [
    './',
    './index.html',
    './style.css',
    './main.js',
    './icon.png',
    'https://cdn.tailwindcss.com',
    'https://fonts.googleapis.com/css2?family=Outfit:wght@400;700&display=swap'
];

self.addEventListener('install', (e) => {
    e.waitUntil(
        caches.open(CACHE_NAME).then((cache) => cache.addAll(ASSETS))
    );
});

self.addEventListener('fetch', (e) => {
    e.respondWith(
        caches.match(e.request).then((response) => response || fetch(e.request))
    );
});
