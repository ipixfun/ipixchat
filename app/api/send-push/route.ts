import { NextResponse } from 'next/server';
import webPush from 'web-push';
import { createClient } from '@supabase/supabase-js';

// Setup VAPID Web Push
webPush.setVapidDetails(
  process.env.VAPID_SUBJECT || 'mailto:admin@domain.com',
  process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY!,
  process.env.VAPID_PRIVATE_KEY!
);

// Setup Supabase Client
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;
const supabase = createClient(supabaseUrl, supabaseKey);

export async function POST(req: Request) {
  try {
    const { recipientUsername, senderUsername, messageText } = await req.json();

    // 1. Ambil push_subscription milik penerima (private_with / admin / user)
    const { data: userProfile, error } = await supabase
      .from('profiles')
      .select('push_subscription')
      .eq('username', recipientUsername)
      .single();

    if (error || !userProfile?.push_subscription) {
      return NextResponse.json(
        { message: 'Penerima tidak memiliki push subscription aktif' },
        { status: 200 }
      );
    }

    // 2. Payload Notifikasi
    const payload = JSON.stringify({
      title: `Pesan baru dari ${senderUsername}`,
      body: messageText,
      url: `/chat`,
    });

    // 3. Kirim Push Notification
    await webPush.sendNotification(userProfile.push_subscription, payload);

    return NextResponse.json({ success: true, message: 'Push terkirim' });
  } catch (err: any) {
    console.error('Error send push:', err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}