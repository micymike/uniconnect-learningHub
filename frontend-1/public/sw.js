// Service Worker for Uniconnect Notifications

self.addEventListener('install', (event) => {
  self.skipWaiting();
});

self.addEventListener('activate', (event) => {
  self.clients.claim();
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
    self.registration.showNotification(data.title || 'Notification', {
      icon: '/logo.png',
      badge: '/logo.png',
      ...data.options
    })
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
