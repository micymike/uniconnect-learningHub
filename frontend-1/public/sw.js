// Service Worker for Uniconnect PWA
const CACHE_NAME = 'uniconnect-v2';
const urlsToCache = [
  '/',
  '/static/js/bundle.js',
  '/static/css/main.css',
  '/logo.png',
  '/manifest.json'
];

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then((cache) => cache.addAll(urlsToCache))
      .then(() => self.skipWaiting())
  );
});

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
    }).then(() => self.clients.claim())
  );
});

self.addEventListener('fetch', (event) => {
  event.respondWith(
    caches.match(event.request)
      .then((response) => {
        if (response) {
          return response;
        }
        return fetch(event.request);
      }
    )
  );
});

// Listen for push events (for background notifications)
self.addEventListener('push', function(event) {
  let data = {};
  try {
    data = event.data.json();
  } catch {
    data = { title: 'Notification', options: {} };
  }
  event.waitUntil(
    (async () => {
      // Show native notification
      await self.registration.showNotification(data.title || 'Notification', {
        icon: '/logo.png',
        badge: '/logo.png',
        ...data.options
      });
      // Post message to all clients for in-app UI
      const allClients = await self.clients.matchAll({ includeUncontrolled: true });
      for (const client of allClients) {
        client.postMessage({
          type: 'push-received',
          title: data.title,
          options: data.options
        });
      }
    })()
  );
});

// Listen for messages from the app (for foreground notifications)
self.addEventListener('message', function(event) {
  const { type, title, options } = event.data || {};
  if (type === 'show-notification') {
    self.registration.showNotification(title || 'Notification', {
      icon: '/logo.png',
      badge: '/logo.png',
      ...options
    });
  }
});

// Optionally handle notification click
self.addEventListener('notificationclick', function(event) {
  event.notification.close();
  event.waitUntil(
    clients.matchAll({ type: 'window', includeUncontrolled: true }).then(function(clientList) {
      if (clientList.length > 0) {
        clientList[0].focus();
      } else {
        clients.openWindow('/');
      }
    })
  );
});
