const CACHE_NAME = 'permisos-v1.0';
const urlsToCache = [
  './',
  './index.html',
  './manifest.json'
];

// Instalación del Service Worker
self.addEventListener('install', function(event) {
  console.log('Service Worker: Instalando...');
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then(function(cache) {
        console.log('Service Worker: Cachando archivos');
        return cache.addAll(urlsToCache);
      })
      .then(() => {
        console.log('Service Worker: Instalado correctamente');
        return self.skipWaiting();
      })
  );
});

// Activación del Service Worker
self.addEventListener('activate', function(event) {
  console.log('Service Worker: Activando...');
  event.waitUntil(
    caches.keys().then(function(cacheNames) {
      return Promise.all(
        cacheNames.map(function(cacheName) {
          if (cacheName !== CACHE_NAME) {
            console.log('Service Worker: Eliminando caché antigua:', cacheName);
            return caches.delete(cacheName);
          }
        })
      );
    }).then(() => {
      console.log('Service Worker: Activado correctamente');
      return self.clients.claim();
    })
  );
});

// Interceptar peticiones de red
self.addEventListener('fetch', function(event) {
  event.respondWith(
    caches.match(event.request)
      .then(function(response) {
        // Si el archivo está en caché, lo devolvemos
        if (response) {
          console.log('Service Worker: Sirviendo desde caché:', event.request.url);
          return response;
        }
        
        // Si no está en caché, lo pedimos a la red
        console.log('Service Worker: Pidiendo a la red:', event.request.url);
        return fetch(event.request).then(function(response) {
          // Si la respuesta es válida, la guardamos en caché
          if (!response || response.status !== 200 || response.type !== 'basic') {
            return response;
          }
          
          const responseToCache = response.clone();
          caches.open(CACHE_NAME)
            .then(function(cache) {
              cache.put(event.request, responseToCache);
            });
          
          return response;
        });
      })
  );
});

// Sincronización en segundo plano
self.addEventListener('sync', function(event) {
  if (event.tag === 'background-sync') {
    console.log('Service Worker: Sincronización en segundo plano');
    event.waitUntil(doBackgroundSync());
  }
});

function doBackgroundSync() {
  // Aquí puedes agregar lógica para sincronizar datos cuando se recupere la conexión
  return Promise.resolve();
}