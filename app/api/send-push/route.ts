import { NextResponse } from 'next/server';
import { initializeApp, getApps, cert } from 'firebase-admin/app';
import { getMessaging } from 'firebase-admin/messaging';

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

    // Otomatis deteksi token dari berbagai nama variabel frontend
    const token = reqData.token || reqData.fcmToken || reqData.to || reqData.subscription?.token || reqData.subscription;
    const title = reqData.title || reqData.sender || reqData.name || 'Pesan Baru';
    const body = reqData.body || reqData.text || reqData.message || 'Kamu menerima pesan baru';

    // Jika token benar-benar kosong di database
    if (!token || typeof token !== 'string') {
      console.error('Payload diterima tapi token kosong:', reqData);
      return NextResponse.json({ error: 'Token FCM tidak valid atau kosong', payload: reqData }, { status: 400 });
    }

    const message = {
      token: token,
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