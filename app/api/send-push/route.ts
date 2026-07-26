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

    const payload = JSON.stringify({
      title: `Pesan dari ${senderUsername}`,
      body: message,
      icon: "/icon-192.png",
    });

    await webpush.sendNotification(pushSubscription, payload);

    return NextResponse.json({ success: true, message: "Push notification terkirim" });
  } catch (err: any) {
    console.error("Error sending push:", err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}