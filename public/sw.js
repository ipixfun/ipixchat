self.addEventListener("push", function (event) {
  if (!event.data) return;

  let title = "Pesan Baru";
  let options = {
    body: "Anda menerima pesan baru.",
    icon: "/icon-192.png",
    badge: "/icon-192.png",
    vibrate: [100, 50, 100],
    data: {
      url: self.location.origin + "/chat",
    },
  };

  try {
    // Kalau dari backend (format JSON)
    const data = event.data.json();
    if (data.title) title = data.title;
    if (data.body) options.body = data.body;
    if (data.icon) options.icon = data.icon;
  } catch (err) {
    // Kalau tes tombol Push DevTools (format teks biasa)
    options.body = event.data.text();
  }

  event.waitUntil(self.registration.showNotification(title, options));
});

self.addEventListener("notificationclick", function (event) {
  event.notification.close();

  event.waitUntil(
    clients.matchAll({ type: "window", includeUncontrolled: true }).then(function (clientList) {
      for (let i = 0; i < clientList.length; i++) {
        let client = clientList[i];
        if ("focus" in client) return client.focus();
      }
      if (clients.openWindow) return clients.openWindow("/chat");
    })
  );
});