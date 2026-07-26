import { NextResponse } from 'next/server';
import { initializeApp, getApps, cert } from 'firebase-admin/app';
import { getMessaging } from 'firebase-admin/messaging';
import { createClient } from '@supabase/supabase-js';

// Inisialisasi Supabase Client di Backend
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '';
const supabase = createClient(supabaseUrl, supabaseKey);

// Inisialisasi Firebase Admin
if (!getApps().length) {
  initializeApp({
    credential: cert({
      projectId: process.env.FIREBASE_PROJECT_ID,
      clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
      privateKey: process.env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, '\n'),
    }),
  });
}

export async function POST(request: Request) {
  try {
    const reqData = await request.json();
    const recipientUsername = reqData.recipientUsername || reqData.targetUser;
    const title = reqData.title || `Pesan dari ${reqData.senderUsername || 'Seseorang'}`;
    const body = reqData.body || reqData.message || 'Kamu menerima pesan baru';

    let fcmToken = reqData.token;

    // Jika token tidak dikirim langsung dari frontend, cari di Supabase berdasarkan recipientUsername
    if (!fcmToken && recipientUsername) {
      // 1. Cek tabel push_subscriptions
      const { data: subData } = await supabase
        .from('push_subscriptions')
        .select('subscription')
        .ilike('username', recipientUsername)
        .order('created_at', { ascending: false })
        .limit(1)
        .maybeSingle();

      if (subData?.subscription) {
        // Parse data JSON dari kolom subscription
        const sub = typeof subData.subscription === 'string' 
          ? JSON.parse(subData.subscription) 
          : subData.subscription;
        
        // Ambil token jika formatnya {"type":"fcm", "token":"..."}
        if (sub?.token) {
          fcmToken = sub.token;
        }
      }

      // 2. Fallback: Cek di tabel profiles jika belum ketemu
      if (!fcmToken) {
        const { data: profileData } = await supabase
          .from('profiles')
          .select('fcm_token')
          .ilike('username', recipientUsername)
          .maybeSingle();
        
        if (profileData?.fcm_token) {
          fcmToken = profileData.fcm_token;
        }
      }
    }

    if (!fcmToken) {
      console.warn(`FCM Token tidak ditemukan untuk username: ${recipientUsername}`);
      return NextResponse.json({ error: `FCM Token tidak ditemukan untuk ${recipientUsername}` }, { status: 400 });
    }

    // Payload Pengiriman FCM v1
    const message = {
      token: fcmToken,
      notification: {
        title: String(title),
        body: String(body),
      },
      android: {
        priority: 'high' as const,
        notification: {
          sound: 'default',
          channelId: 'default',
        },
      },
    };

    const response = await getMessaging().send(message);
    return NextResponse.json({ success: true, response });

  } catch (error: any) {
    console.error('Error sending push notification:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}