const CACHE_NAME = 'islamic-knowledge-cache-v4';
const OFFLINE_URLS = [
    './',
    './ai_studio_code (10).html',
    './quran.html',
    './quran-module.js',
    './question.json',
    './logo.png',
    'https://fonts.googleapis.com/css2?family=Material+Symbols+Rounded:opsz,wght,FILL,GRAD@20..48,100..700,0,1',
    'https://fonts.googleapis.com/css2?family=Noto+Sans+Bengali:wght@400;500;600;700;800&family=Amiri:wght@400;700&family=Scheherazade+New:wght@400;700&display=swap'
];

self.addEventListener('install', event => {
    event.waitUntil(
        caches.open(CACHE_NAME).then(cache => {
            // Not strictly requiring all of these to fetch immediately, but adding what we can
            return cache.addAll(OFFLINE_URLS.map(url => new Request(url, { cache: 'reload' })));
        })
    );
    self.skipWaiting();
});

self.addEventListener('activate', event => {
    event.waitUntil(
        caches.keys().then(cacheNames => {
            return Promise.all(
                cacheNames.filter(name => name !== CACHE_NAME).map(name => caches.delete(name))
            );
        })
    );
    self.clients.claim();
});

self.addEventListener('fetch', event => {
    // If it's an API call or cross-origin text we might want to network first
    if (event.request.url.includes('generativelanguage') || event.request.url.includes('openrouter')) {
        event.respondWith(fetch(event.request));
        return;
    }

    event.respondWith(
        caches.match(event.request).then(response => {
            return response || fetch(event.request).then(fetchResponse => {
                return caches.open(CACHE_NAME).then(cache => {
                    // If it's a GET request, we cache it dynamically
                    if (event.request.method === 'GET' && !event.request.url.startsWith('chrome-extension')) {
                        cache.put(event.request, fetchResponse.clone());
                    }
                    return fetchResponse;
                });
            });
        }).catch(() => {
            // Return fallback page if appropriate, e.g., for navigation requests
            if (event.request.mode === 'navigate') {
                return caches.match('./ai_studio_code (10).html');
            }
        })
    );
});
