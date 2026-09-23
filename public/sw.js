// Service Worker для каталога пряжи
// Версия 2.0 - без кэширования

const CACHE_NAME = 'yarn-catalog-v2';

// При установке - ничего не кэшируем
self.addEventListener('install', (event) => {
  console.log('Service Worker установлен');
  self.skipWaiting();
});

// При активации - очищаем старые кэши
self.addEventListener('activate', (event) => {
  console.log('Service Worker активирован');
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.map((cacheName) => {
          console.log('Удаляю старый кэш:', cacheName);
          return caches.delete(cacheName);
        })
      );
    })
  );
  self.clients.claim();
});

// При запросе - просто пропускаем, без кэширования
self.addEventListener('fetch', (event) => {
  event.respondWith(fetch(event.request));
});
