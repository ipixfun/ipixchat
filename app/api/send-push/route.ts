import { NextResponse } from "next/server";
import webpush from "web-push";
import { supabase } from "../../lib/supabaseClient";

const publicVapidKey = process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY || "";
const privateVapidKey = process.env.VAPID_PRIVATE_KEY || "";
const vapidSubject = process.env.VAPID_SUBJECT || "mailto:admin@ipix.my.id";

if (publicVapidKey && privateVapidKey) {
  webpush.setVapidDetails(vapidSubject, publicVapidKey, privateVapidKey);
}

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { recipientUsername, senderUsername, message } = body;

    if (!recipientUsername) {
      return NextResponse.json({ error: "Recipient username tidak ada" }, { status: 400 });
    }

    // 1. Cari subscription penerima di Supabase
    const { data: subData, error: subError } = await supabase
      .from("push_subscriptions")
      .select("subscription")
      .eq("username", recipientUsername)
      .maybeSingle();

    if (subError || !subData || !subData.subscription) {
      return NextResponse.json({ success: false, message: "Subscription tidak ditemukan" });
    }

    const pushSubscription = typeof subData.subscription === "string" 
      ? JSON.parse(subData.subscription) 
      : subData.subscription;

    // -------------------------------------------------------------
    // JALUR 1: JIKA PENERIMA MENGGUNAKAN APK ANDROID (FCM TOKEN)
    // -------------------------------------------------------------
    if (pushSubscription.type === "fcm" && pushSubscription.token) {
      console.log(`Mengirim FCM Push Notification ke APK Android (${recipientUsername})...`);

      const fcmResponse = await fetch("https://fcm.googleapis.com/fcm/send", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `key=${process.env.FCM_SERVER_KEY}`, // Ambil dari Server Key Firebase
        },
        body: JSON.stringify({
          to: pushSubscription.token,
          priority: "high",
          notification: {
            title: `Pesan dari ${senderUsername}`,
            body: message,
            sound: "default",
          },
          data: {
            senderUsername: senderUsername,
            message: message,
          },
        }),
      });

      const fcmData = await fcmResponse.json();
      return NextResponse.json({ success: true, message: "FCM Push notification terkirim", fcmData });
    }

    // -------------------------------------------------------------
    // JALUR 2: JIKA PENERIMA MENGGUNAKAN BROWSER WEB
    // -------------------------------------------------------------
    console.log(`Mengirim Web Push Notification ke Browser (${recipientUsername})...`);
    
    const payload = JSON.stringify({
      title: `Pesan dari ${senderUsername}`,
      body: message,
      icon: "/icon-192.png",
    });

    await webpush.sendNotification(pushSubscription, payload);

    return NextResponse.json({ success: true, message: "Web Push notification terkirim" });

  } catch (err: any) {
    console.error("Error sending push:", err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}