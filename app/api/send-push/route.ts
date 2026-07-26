import { NextResponse } from 'next/server';
import { initializeApp, getApps, cert } from 'firebase-admin/app';
import { getMessaging } from 'firebase-admin/messaging';

// Inisialisasi Firebase Admin jika belum berjalan
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
    const { token, title, body } = await request.json();

    if (!token) {
      return NextResponse.json({ error: 'Token FCM tidak ditemukan' }, { status: 400 });
    }

    const message = {
      token: token,
      notification: {
        title: title || 'Pesan Baru',
        body: body || 'Kamu menerima pesan baru di ipixchat',
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