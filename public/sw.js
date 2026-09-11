// Service Worker para FRAGATA COURIER PWA
const CACHE_NAME = 'fragata-cache-v1';
const ASSETS_TO_CACHE = [
  '/',
  '/index.html',
  '/manifest.json',
  '/icons/icon-192.png',
  '/icons/icon-512.png',
  '/icons/icon-maskable-192.png',
  '/icons/icon-maskable-512.png',
  '/favicon.png',
  '/apple-touch-icon.png'
];

// Instalación del Service Worker
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      return cache.addAll(ASSETS_TO_CACHE).catch((err) => {
        console.warn('SW Pre-caching non-critical error:', err);
      });
    })
  );
  self.skipWaiting();
});

// Activación y limpieza de caches antiguas
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.map((cacheName) => {
          if (cacheName !== CACHE_NAME) {
            return caches.delete(cacheName);
          }
        })
      );
    })
  );
  self.clients.claim();
});

// Interceptor de red para soporte Offline y carga instantánea
self.addEventListener('fetch', (event) => {
  // Ignorar llamadas de API y endpoints externos
  if (
    event.request.method !== 'GET' ||
    event.request.url.includes('/api/') ||
    event.request.url.includes('wa.me')
  ) {
    return;
  }

  event.respondWith(
    caches.match(event.request).then((cachedResponse) => {
      if (cachedResponse) {
        return cachedResponse;
      }
      return fetch(event.request).then((networkResponse) => {
        // Cachear dinámicamente recursos estáticos
        if (
          networkResponse &&
          networkResponse.status === 200 &&
          (networkResponse.type === 'basic' || networkResponse.type === 'cors')
        ) {
          const responseToCache = networkResponse.clone();
          caches.open(CACHE_NAME).then((cache) => {
            cache.put(event.request, responseToCache);
          });
        }
        return networkResponse;
      }).catch(() => {
        // Si falla la red (offline) y es navegación, devolver index.html
        if (event.request.mode === 'navigate') {
          return caches.match('/');
        }
      });
    })
  );
});
