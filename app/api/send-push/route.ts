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
      return NextResponse.json(
        { error: "Recipient username tidak boleh kosong" },
        { status: 400 }
      );
    }

    console.log(`Mencoba mengirim push notification ke: ${recipientUsername} dari ${senderUsername}`);

    // 1. Ambil data subscription dari tabel Supabase berdasarkan username penerima
    const { data, error } = await supabase
      .from("push_subscriptions")
      .select("subscription")
      .eq("username", recipientUsername)
      .maybeSingle();

    if (error || !data || !data.subscription) {
      console.log(`Gagal: Subscription untuk user ${recipientUsername} tidak ditemukan di database.`);
      return NextResponse.json(
        { success: false, message: "Subscription not found" },
        { status: 404 }
      );
    }

    const subscription = JSON.parse(data.subscription);

    // 2. Buat payload isi notifikasi
    const pushPayload = JSON.stringify({
      title: `Pesan baru dari ${senderUsername ? senderUsername.split("●")[0] : "Seseorang"}`,
      body: message && message.length > 50 ? message.substring(0, 50) + "..." : (message || "Ada pesan masuk."),
      url: "/chat",
    });

    // 3. Kirim push notification menggunakan library web-push
    await webpush.sendNotification(subscription, pushPayload);
    console.log("Push notification berhasil dikirim ke server browser!");

    return NextResponse.json({ success: true, message: "Notifikasi berhasil dikirim" });
  } catch (err: any) {
    console.error("Error saat mengirim push notification:", err);
    return NextResponse.json(
      { error: err.message || "Internal Server Error" },
      { status: 500 }
    );
  }
}