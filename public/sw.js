// public/sw.js

self.addEventListener("push", function (event) {
  if (!event.data) return;

  event.waitUntil((async () => {
    try {
      const data = event.data.json();
      const sender = data.senderUsername || "Seseorang";
      const tag = `chat-${sender}`; 

      // Ambil notifikasi yang masih menggantung dengan tag yang sama
      const existingNotifications = await self.registration.getNotifications({ tag });
      
      let messages = [];
      
      // Jika ada notifikasi sebelumnya, ambil histori pesannya dan tutup yang lama
      if (existingNotifications.length > 0) {
        const oldMessages = existingNotifications[0].data?.messages || [];
        messages = [...oldMessages];
        existingNotifications[0].close(); 
      }

      // Masukkan pesan yang baru datang ke dalam array
      messages.push(data.body || "Pesan baru masuk!");

      const title = sender; 
      const bodyText = messages.slice(-4).join('\n');

      const options = {
        body: bodyText,
        icon: data.icon || "/icon.png",
        badge: "/badge.png",
        vibrate: [200, 100, 200],
        tag: tag,
        renotify: true,
        data: {
          url: data.url || "/",
          messages: messages, // Simpan histori pesan
        },
        actions: [
          {
            action: "reply",
            title: "Balas",
          }
        ]
      };

      return self.registration.showNotification(title, options);
    } catch (err) {
      console.error("Error handling push event:", err);
    }
  })());
});

self.addEventListener("notificationclick", function (event) {
  event.notification.close();
  const action = event.action;

  event.waitUntil(
    clients.matchAll({ type: "window", includeUncontrolled: true }).then(function (clientList) {
      // Jika aplikasi sudah terbuka di tab/background
      for (let i = 0; i < clientList.length; i++) {
        let client = clientList[i];
        if (client.url.includes("/") && "focus" in client) {
          client.focus();
          // Kirim pesan ke client UI agar memfokuskan kursor ke input text
          client.postMessage({ type: action === "reply" ? "ACTION_REPLY" : "ACTION_OPEN" });
          return;
        }
      }
      
      // Jika aplikasi sedang tertutup total
      if (clients.openWindow) {
        const targetUrl = action === "reply" ? "/?action=reply" : "/";
        return clients.openWindow(targetUrl);
      }
    })
  );
});