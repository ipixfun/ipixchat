"use client";
import { useEffect } from "react";

export default function ClientPushSetup() {
  useEffect(() => {
    async function registerAndSubscribe() {
      if (!("serviceWorker" in navigator) || !("PushManager" in window)) return;

      try {
        // 1. Daftarkan Service Worker
        const registration = await navigator.serviceWorker.register("/sw.js");
        console.log("Service Worker berhasil didaftarkan:", registration.scope);

        // Tunggu sampai Service Worker benar-benar siap
        await navigator.serviceWorker.ready;

        // 2. Ambil username dari localStorage
        const userStr = localStorage.getItem("ipix_user") || localStorage.getItem("user");
        let username = "";
        
        if (userStr) {
          try {
            const parsed = JSON.parse(userStr);
            // Tambahkan pengecekan parsed.user menyesuaikan objek auth di console Anda
            username = parsed.username || parsed.user || parsed;
            
            // Mencegah username berupa [object Object] jika format tidak sesuai
            if (typeof username === "object") {
               username = "";
            }
          } catch {
            username = userStr;
          }
        }

        if (!username) {
          console.log("[Push] Menunggu user login untuk setup notifikasi...");
          return;
        }

        // 3. Minta izin notifikasi browser
        const permission = await Notification.requestPermission();
        if (permission !== "granted") {
          console.warn("[Push] Izin notifikasi tidak diberikan oleh user.");
          return;
        }

        // 4. Lakukan Push Subscribe via Environment Variable
        const publicVapidKey = process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY;
        if (!publicVapidKey) {
          console.error("VAPID Public Key tidak ditemukan di environment variable (.env.local)!");
          return;
        }

        const subscription = await registration.pushManager.subscribe({
          userVisibleOnly: true,
          applicationServerKey: urlBase64ToUint8Array(publicVapidKey),
        });

        // 5. Kirim ke API backend untuk disimpan ke Supabase
        const response = await fetch("/api/save-subscription", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            username: username,
            subscription: subscription,
          }),
        });

        if (!response.ok) {
          throw new Error(`Gagal menyimpan ke database. Status: ${response.status}`);
        }

        console.log("Push subscription berhasil disimpan ke database!");
      } catch (err) {
        console.error("Gagal melakukan setup push notification:", err);
      }
    }

    registerAndSubscribe();
  }, []);

  return null;
}

function urlBase64ToUint8Array(base64String: string) {
  const padding = "=".repeat((4 - (base64String.length % 4)) % 4);
  const base64 = (base64String + padding).replace(/-/g, "+").replace(/_/g, "/");
  const rawData = window.atob(base64);
  const outputArray = new Uint8Array(rawData.length);
  for (let i = 0; i < rawData.length; ++i) {
    outputArray[i] = rawData.charCodeAt(i);
  }
  return outputArray;
}