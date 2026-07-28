// public/sw.js
self.addEventListener("push", async function (event) {
  if (!event.data) return;

  try {
    const data = event.data.json();
    const sender = data.senderUsername || "Seseorang";
    // Gunakan tag untuk mengelompokkan notifikasi dari pengirim yang sama
    const tag = `chat-${sender}`; 

    // Ambil notifikasi yang masih menggantung dengan tag yang sama
    const existingNotifications = await self.registration.getNotifications({ tag });
    
    let messages = [data.body || "Pesan baru masuk!"];
    
    // Jika ada notifikasi sebelumnya, gabungkan jumlah pesannya
    if (existingNotifications.length > 0) {
      const oldMessages = existingNotifications[0].data?.messages || [];
      messages = [...oldMessages, ...messages];
      // Tutup notifikasi lama agar diganti dengan yang baru
      existingNotifications[0].close(); 
    }

    // Tentukan teks notifikasi mirip WhatsApp
    let bodyText = messages.length > 1 
      ? `${messages.length} pesan baru:\n${messages.slice(-3).join('\n')}${messages.length > 3 ? '\n...' : ''}` 
      : messages[0];

    const options = {
      body: bodyText,
      icon: data.icon || "/icon.png",
      badge: "/icon.png",
      vibrate: [200, 100, 200],
      tag: tag,
      renotify: true, // Membunyikan/getar ulang meskipun di-group
      data: {
        url: data.url || "/",
        messages: messages, // Simpan histori pesan di memori notifikasi
      },
      actions: [
        {
          action: "reply",
          title: "Balas",
        }
      ]
    };

    const title = messages.length > 1 ? `Pesan dari ${sender}` : (data.title || "ipixchat");
    event.waitUntil(self.registration.showNotification(title, options));
  } catch (err) {
    console.error("Error handling push event:", err);
  }
});

self.addEventListener("notificationclick", function (event) {
  event.notification.close();
  const action = event.action; // Mendeteksi jika tombol "Balas" diklik

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
      
      // Jika aplikasi sedang tertutup total, buka window baru dan bawa parameter action
      if (clients.openWindow) {
        const targetUrl = action === "reply" ? "/?action=reply" : "/";
        return clients.openWindow(targetUrl);
      }
    })
  );
});