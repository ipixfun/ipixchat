import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import webpush from 'web-push';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '';
const supabase = createClient(supabaseUrl, supabaseKey);

// Otomatis pake VAPID Key LAMA dari Environment Variables Vercel
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

    const payload = JSON.stringify({
      title: String(title),
      body: String(body),
      icon: '/icon.png',
    });

    const response = await webpush.sendNotification(subscription, payload);
    return NextResponse.json({ success: true, response });

  } catch (error: any) {
    console.error('Error sending web push:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}