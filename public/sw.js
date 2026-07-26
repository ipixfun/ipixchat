// sw.js - Service Worker untuk Push Notifications

self.addEventListener("install", (event) => {
  self.skipWaiting();
});

self.addEventListener("activate", (event) => {
  event.waitUntil(self.clients.claim());
});

// Event saat server mengirim push notification
self.addEventListener("push", (event) => {
  let data = { 
    title: "Pesan Baru", 
    body: "Ada pesan masuk di chat.", 
    url: "/chat" 
  };
  
  try {
    if (event.data) {
      const jsonPayload = event.data.json();
      data = {
        title: jsonPayload.title || "Pesan Baru",
        body: jsonPayload.body || jsonPayload.message || "Ada pesan masuk.",
        url: jsonPayload.url || "/chat"
      };
    }
  } catch (e) {
    if (event.data) {
      data.body = event.data.text();
    }
  }

  const options = {
    body: data.body,
    icon: "/favicon.ico", 
    badge: "/favicon.ico",
    data: { url: data.url }
  };

  event.waitUntil(
    self.registration.showNotification(data.title, options)
  );
});

// Event saat notifikasi diklik oleh user
self.addEventListener("notificationclick", (event) => {
  event.notification.close();
  const urlToOpen = event.notification.data?.url || "/chat";

  event.waitUntil(
    clients.matchAll({ type: "window", includeUncontrolled: true }).then((windowClients) => {
      for (let i = 0; i < windowClients.length; i++) {
        const client = windowClients[i];
        if (client.url.includes(urlToOpen) && "focus" in client) {
          return client.focus();
        }
      }
      if (clients.openWindow) {
        return clients.openWindow(urlToOpen);
      }
    })
  );
});