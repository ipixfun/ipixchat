// public/sw.js

self.addEventListener("push", function (event) {
  if (!event.data) return;

  event.waitUntil((async () => {
    try {
      const data = event.data.json();
      const sender = data.senderUsername || "(PIX)";
      const tag = `chat-${sender}`; 

      // 1. Ambil notif lama
      const existingNotifications = await self.registration.getNotifications({ tag });
      let messages = [];
      
      if (existingNotifications.length > 0) {
        const oldMessages = existingNotifications[0].data?.messages || [];
        messages = [...oldMessages];
        existingNotifications[0].close(); // Tutup yang lama
      }

      // 2. Tambahkan pesan baru
      messages.push(data.body || "Pesan baru");

      // 3. Akali format teks agar lebih mudah dibaca jika \n diabaikan oleh HP
      // Kita gunakan bullet atau spasi ekstra sebagai pemisah antar pesan
      const maxMessages = 3; // Ambil 3 pesan terakhir
      const recentMessages = messages.slice(-maxMessages);
      
      // Menggunakan kombinasi \n dan karakter bullet agar jika \n dihapus Chrome,
      // teksnya tetap memiliki pembatas yang jelas.
      const bodyText = recentMessages.length > 1
        ? recentMessages.map(msg => `• ${msg}`).join('\n')
        : recentMessages[0];

      const options = {
        body: bodyText,
        icon: data.icon || "/icon.png",
        badge: "/badge.png", // Harus PNG satu warna (putih transparan)
        vibrate: [200, 100, 200],
        tag: tag,
        renotify: true,
        requireInteraction: true, // Memaksa notif tetap diam di layar sampai user interaksi
        data: {
          url: data.url || "/",
          messages: messages,
        },
        actions: [
          {
            action: "reply",
            title: "Balas"
          }
        ]
      };

      return self.registration.showNotification(sender, options);
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
      for (let i = 0; i < clientList.length; i++) {
        let client = clientList[i];
        if (client.url.includes("/") && "focus" in client) {
          client.focus();
          client.postMessage({ type: action === "reply" ? "ACTION_REPLY" : "ACTION_OPEN" });
          return;
        }
      }
      
      if (clients.openWindow) {
        const targetUrl = action === "reply" ? "/?action=reply" : "/";
        return clients.openWindow(targetUrl);
      }
    })
  );
});