import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import webpush from 'web-push';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '';
const supabase = createClient(supabaseUrl, supabaseKey);

// Setup Web Push untuk Browser
webpush.setVapidDetails(
  'mailto:admin@ipix.fun',
  process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY || '',
  process.env.VAPID_PRIVATE_KEY || ''
);

export async function POST(request: Request) {
  try {
    const reqData = await request.json();
    const recipientUsername = reqData.recipientUsername || reqData.targetUser;
    const title = reqData.title || `Pesan dari ${reqData.senderUsername || 'Seseorang'}`;
    const body = reqData.body || reqData.message || 'Kamu menerima pesan baru';

    if (!recipientUsername) {
      return NextResponse.json({ error: 'recipientUsername kosong' }, { status: 400 });
    }

    const { data: subData } = await supabase
      .from('push_subscriptions')
      .select('subscription')
      .ilike('username', recipientUsername)
      .order('created_at', { ascending: false })
      .limit(1)
      .maybeSingle();

    if (!subData?.subscription) {
      return NextResponse.json({ error: `Subscription tidak ditemukan untuk ${recipientUsername}` }, { status: 400 });
    }

    const subscription = typeof subData.subscription === 'string' 
      ? JSON.parse(subData.subscription) 
      : subData.subscription;

    // ==========================================
    // 1. JIKA PENERIMA ADALAH APK NATIVE (FCM)
    // ==========================================
    if (subscription.type === 'fcm' && subscription.token) {
      const serverKey = process.env.FCM_SERVER_KEY; // Masukkan FCM Legacy Server Key di .env
      
      if (!serverKey) {
        console.error("FCM_SERVER_KEY belum di-set di environment variables.");
        return NextResponse.json({ error: "FCM Server Key belum dikonfigurasi" }, { status: 500 });
      }

      const fcmResponse = await fetch('https://fcm.googleapis.com/fcm/send', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `key=${serverKey}`,
        },
        body: JSON.stringify({
          to: subscription.token,
          notification: {
            title: String(title),
            body: String(body),
            sound: 'default',
            click_action: 'TOP_STORY_ACTIVITY'
          },
          data: {
            title: String(title),
            body: String(body),
          },
          priority: 'high',
        }),
      });

      const fcmResult = await fcmResponse.json();
      return NextResponse.json({ success: true, type: 'fcm', result: fcmResult });
    }

    // ==========================================
    // 2. JIKA PENERIMA ADALAH WEB BROWSER (CHROME/WEB-PUSH)
    // ==========================================
    const payload = JSON.stringify({
      title: String(title),
      body: String(body),
      icon: '/icon.png',
    });

    const response = await webpush.sendNotification(subscription, payload);
    return NextResponse.json({ success: true, type: 'webpush', response });

  } catch (error: any) {
    console.error('Error sending push:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}