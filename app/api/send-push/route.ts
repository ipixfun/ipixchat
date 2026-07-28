import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import webpush from 'web-push';
import { initializeApp, getApps, cert } from 'firebase-admin/app';
import { getMessaging } from 'firebase-admin/messaging';

// Inisialisasi Firebase Admin SDK untuk FCM Native menggunakan modular import
if (!getApps().length) {
  const privateKey = process.env.FIREBASE_PRIVATE_KEY
    ? process.env.FIREBASE_PRIVATE_KEY.replace(/\\n/g, '\n')
    : undefined;

  if (process.env.FIREBASE_PROJECT_ID && process.env.FIREBASE_CLIENT_EMAIL && privateKey) {
    initializeApp({
      credential: cert({
        projectId: process.env.FIREBASE_PROJECT_ID,
        clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
        privateKey: privateKey,
      }),
    });
  }
}

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '';
const supabase = createClient(supabaseUrl, supabaseKey);

// Inisialisasi Web Push untuk Browser
webpush.setVapidDetails(
  'mailto:admin@ipix.fun',
  process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY || '',
  process.env.VAPID_PRIVATE_KEY || ''
);

export async function POST(request: Request) {
  try {
    const reqData = await request.json();
    const recipientUsername = reqData.recipientUsername || reqData.targetUser;
    const senderUsername = reqData.senderUsername || 'Seseorang';
    const title = reqData.title || `Pesan dari ${senderUsername}`;
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
      if (!getApps().length) {
        return NextResponse.json({ error: "Firebase Admin belum dikonfigurasi di server" }, { status: 500 });
      }

      const message = {
        token: subscription.token,
        notification: {
          title: String(title),
          body: String(body),
        },
        android: {
          priority: 'high' as const,
          notification: {
            sound: 'default',
            channelId: 'default',
            tag: `chat-${senderUsername}`, // Tag pengelompokan native Android
          },
        },
        data: {
          title: String(title),
          body: String(body),
          senderUsername: senderUsername,
        },
      };

      const response = await getMessaging().send(message);
      return NextResponse.json({ success: true, type: 'fcm_v1', response });
    }

    // ==========================================
    // 2. JIKA PENERIMA ADALAH WEB BROWSER (CHROME/WEB-PUSH)
    // ==========================================
    
    // Kita sisipkan senderUsername agar ditangkap oleh Service Worker
    const payload = JSON.stringify({
      title: String(title),
      body: String(body),
      icon: '/icon.png',
      senderUsername: senderUsername,
      url: '/'
    });

    const response = await webpush.sendNotification(subscription, payload);
    return NextResponse.json({ success: true, type: 'webpush', response });

  } catch (error: any) {
    console.error('Error sending push notification:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}