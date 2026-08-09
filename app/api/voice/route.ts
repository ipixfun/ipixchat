// app/api/voice/route.ts
// @ts-ignore
import { NextResponse } from 'next/server';
import { v2 as cloudinary } from 'cloudinary';
import { createClient } from '@supabase/supabase-js';

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME || 'bjamo8ld',
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

const MAX_DURATION_SECONDS = 300; // 5 Menit

export async function POST(req: Request) {
  try {
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

    if (!supabaseUrl || !supabaseKey) {
      return NextResponse.json({ error: 'Supabase Key belum terkonfigurasi' }, { status: 500 });
    }

    const supabase = createClient(supabaseUrl, supabaseKey);

    const formData = await req.formData();
    const file = formData.get('file') as File | null;
    const username = formData.get('username') as string;
    const chatWith = formData.get('chat_with') as string;

    if (!file || !username || !chatWith) {
      return NextResponse.json({ error: 'File, username, dan chat_with wajib diisi' }, { status: 400 });
    }

    // --- LOGIKA SYARAT 3: MAKSIMAL 5 VN PER 24 JAM ---
    if (username !== 'Admin●ipix.my.id') {
      const twentyFourHoursAgo = new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString();
      const { count } = await supabase
        .from('messages')
        .select('*', { count: 'exact', head: true })
        .eq('username', username)
        .not('audio_url', 'is', null)
        .gte('created_at', twentyFourHoursAgo);

      if (count && count >= 5) {
        return NextResponse.json(
          { error: 'Batas maksimal upload Voice Note adalah 5x dalam 24 jam.' },
          { status: 400 }
        );
      }
    }

    if (!file.type.startsWith('audio/')) {
      return NextResponse.json({ error: 'Format file harus berupa audio' }, { status: 400 });
    }

    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);

    // Upload ke Cloudinary
    const uploadResult = await new Promise<any>((resolve, reject) => {
      const stream = cloudinary.uploader.upload_stream(
        {
          folder: 'voice_notes',
          resource_type: 'video',
          transformation: [{ end_offset: '300' }],
        },
        (error, result) => {
          if (error) reject(error);
          else resolve(result);
        }
      );
      stream.end(buffer);
    });

    const rawDuration = uploadResult.duration || 0;
    const finalDuration = Math.min(rawDuration, MAX_DURATION_SECONDS);

    const finalAudioUrl = cloudinary.url(uploadResult.public_id, {
      resource_type: 'video',
      end_offset: '300',
      secure: true,
      format: uploadResult.format,
    });

    // Simpan metadata ke Database Supabase
    const { data: messageData, error: dbError } = await supabase
      .from('messages')
      .insert([
        {
          username: username,
          chat_with: chatWith,
          audio_url: finalAudioUrl,
          duration: finalDuration,
          pesan: '🎤 Voice Note',
          user_browser: req.headers.get('user-agent') || '',
        },
      ])
      .select()
      .single();

    if (dbError) {
      await cloudinary.uploader.destroy(uploadResult.public_id, { resource_type: 'video' });
      throw dbError;
    }

    return NextResponse.json({ message: 'Voice note berhasil dikirim', data: messageData }, { status: 201 });
  } catch (error: any) {
    console.error('Error voice route:', error);
    return NextResponse.json({ error: error.message || 'Terjadi kesalahan pada server' }, { status: 500 });
  }
}