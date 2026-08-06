import { NextRequest, NextResponse } from 'next/server';
import { Innertube } from 'youtubei.js';

let ytPromise: Promise<Innertube> | null = null;

async function getYT() {
  if (!ytPromise) {
    ytPromise = Innertube.create({
      generate_session_locally: true,
    });
  }
  return ytPromise;
}

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const videoId = searchParams.get('v');
  const type = searchParams.get('type');
  const query = searchParams.get('q');

  try {
    const youtube = await getYT();

    // 1. CARI LAGU (DENGAN FALLBACK JIKA YT BLOKIR SEARCH)
    if (query) {
      try {
        const searchResults = await youtube.search(query, { type: 'video' });
        const songs = searchResults.videos
          .filter((v: any) => v.id)
          .slice(0, 8)
          .map((v: any) => ({
            id: v.id,
            title: v.title?.text || v.title || 'Judul Tidak Diketahui',
            artist: v.author?.name || 'Artis Tidak Diketahui',
            duration: v.duration?.text || '0:00',
          }));
        return NextResponse.json({ songs });
      } catch (e) {
        console.warn('YT Search diblokir, menggunakan Fallback Piped Search...');
        const pipedRes = await fetch(
          `https://api.piped.video/search?q=${encodeURIComponent(query)}&filter=music_songs`
        );
        const pipedData = await pipedRes.json();
        const songs = (pipedData.items || []).slice(0, 8).map((item: any) => ({
          id: item.url?.replace('/watch?v=', '') || '',
          title: item.title || 'Judul Tidak Diketahui',
          artist: item.uploaderName || 'Artis Tidak Diketahui',
          duration: item.duration
            ? `${Math.floor(item.duration / 60)}:${
                item.duration % 60 < 10 ? '0' : ''
              }${item.duration % 60}`
            : '0:00',
        }));
        return NextResponse.json({ songs });
      }
    }

    if (!videoId) {
      return NextResponse.json(
        { error: 'Video ID (v) atau Query (q) dibutuhkan' },
        { status: 400 }
      );
    }

    // 2. METADATA INFO LAGU
    if (type === 'info') {
      try {
        const info = await youtube.getBasicInfo(videoId);
        return NextResponse.json({
          title: info.basic_info.title || 'Judul Tidak Diketahui',
          artist: info.basic_info.author || 'Artis Tidak Diketahui',
        });
      } catch (e) {
        return NextResponse.json({ title: 'Lagu YouTube', artist: 'Artis' });
      }
    }

    // 3. AMBIL STREAM AUDIO (ENGINE 1: YouTubei.js)
    let audioStream: ReadableStream | null = null;
    let contentType = 'audio/webm';

    try {
      const stream = await youtube.download(videoId, {
        type: 'audio',
        quality: 'best',
        client: 'IOS',
      });

      audioStream = new ReadableStream({
        async start(controller) {
          try {
            for await (const chunk of stream) {
              controller.enqueue(chunk);
            }
            controller.close();
          } catch (err) {
            controller.error(err);
          }
        },
      });
    } catch (ytErr) {
      console.warn('YouTubei.js diblokir YT! Beralih ke Engine Cadangan Piped...', ytErr);
    }

    // 4. ENGINE 2 (FALLBACK): JIKA YOUTUBE MEMBLOKIR, AMBIL DARI PIPED STREAM SERVER
    if (!audioStream) {
      const pipedRes = await fetch(`https://api.piped.video/streams/${videoId}`, {
        headers: { 'User-Agent': 'Mozilla/5.0' },
      });

      if (!pipedRes.ok) throw new Error('Gagal mengambil audio dari server cadangan');

      const pipedData = await pipedRes.json();
      const audioInfo = (pipedData.audioStreams || []).sort(
        (a: any, b: any) => b.bitrate - a.bitrate
      )[0];

      if (!audioInfo?.url) throw new Error('Audio stream cadangan tidak ditemukan');

      const mediaRes = await fetch(audioInfo.url);
      if (!mediaRes.body) throw new Error('Gagal membuka stream cadangan');

      return new Response(mediaRes.body as any, {
        headers: {
          'Content-Type': audioInfo.mimeType || 'audio/mp4',
          'Accept-Ranges': 'bytes',
          'Cache-Control': 'public, max-age=3600',
        },
      });
    }

    return new Response(audioStream, {
      headers: {
        'Content-Type': contentType,
        'Accept-Ranges': 'bytes',
        'Cache-Control': 'public, max-age=3600',
      },
    });
  } catch (err: any) {
    console.error('Final YT API Error:', err);
    return NextResponse.json(
      { error: err?.message || 'Layanan audio sedang tidak tersedia' },
      { status: 500 }
    );
  }
}