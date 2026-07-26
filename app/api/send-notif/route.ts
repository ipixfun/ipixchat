import { NextResponse } from 'next/server';

export async function POST(request: Request) {
  try {
    const { username, text } = await request.json();

    // Tembak API OneSignal menggunakan REST API Key yang aman di server
    const response = await fetch('https://onesignal.com/api/v1/notifications', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json; charset=utf-8',
        'Authorization': `Basic ${process.env.ONESIGNAL_REST_API_KEY}`,
      },
      body: JSON.stringify({
        app_id: process.env.ONESIGNAL_APP_ID,
        included_segments: ['Subscribed Users'],
        headings: { en: `Pesan baru dari ${username}` },
        contents: { en: text },
      }),
    });

    const data = await response.json();
    return NextResponse.json({ success: true, data });
  } catch (error) {
    return NextResponse.json({ success: false, error: 'Gagal kirim notif' }, { status: 500 });
  }
}