// Service Worker pour Planning 2026 PWA
const CACHE_NAME = 'planning-2026-v1.0';
const urlsToCache = [
    '/',
    '/index.html',
    '/app.js',
    '/data.js',
    '/manifest.json'
];

// Installation
self.addEventListener('install', event => {
    event.waitUntil(
        caches.open(CACHE_NAME)
            .then(cache => {
                console.log('✅ Cache ouvert et prêt');
                return cache.addAll(urlsToCache);
            })
    );
});

// Activation
self.addEventListener('activate', event => {
    event.waitUntil(
        caches.keys().then(cacheNames => {
            return Promise.all(
                cacheNames.map(cacheName => {
                    if (cacheName !== CACHE_NAME) {
                        console.log('🗑️ Suppression ancien cache:', cacheName);
                        return caches.delete(cacheName);
                    }
                })
            );
        })
    );
});

// Interception des requêtes
self.addEventListener('fetch', event => {
    event.respondWith(
        caches.match(event.request)
            .then(response => {
                // Retourner du cache si disponible
                if (response) {
                    return response;
                }
                
                // Sinon faire la requête réseau
                return fetch(event.request).then(response => {
                    // Vérifier si la réponse est valide
                    if (!response || response.status !== 200 || response.type !== 'basic') {
                        return response;
                    }
                    
                    // Cloner la réponse pour la mettre en cache
                    const responseToCache = response.clone();
                    
                    caches.open(CACHE_NAME)
                        .then(cache => {
                            cache.put(event.request, responseToCache);
                        });
                    
                    return response;
                });
            })
            .catch(() => {
                // En cas d'échec réseau, retourner une page d'erreur
                return new Response(`
                    <!DOCTYPE html>
                    <html>
                    <head>
                        <title>Hors ligne</title>
                        <style>
                            body { font-family: sans-serif; padding: 20px; text-align: center; }
                            h1 { color: #dc2626; }
                        </style>
                    </head>
                    <body>
                        <h1>⚠️ Hors ligne</h1>
                        <p>L'application fonctionne en mode hors ligne.</p>
                        <p>Veuillez vérifier votre connexion internet.</p>
                    </body>
                    </html>
                `, {
                    headers: { 'Content-Type': 'text/html' }
                });
            })
    );
});
