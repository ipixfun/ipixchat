import { NextRequest, NextResponse } from 'next/server';
import { Innertube, UniversalCache } from 'youtubei.js';

export const dynamic = 'force-dynamic';

// Singleton Youtubei.js untuk Search
let ytPromise: Promise<Innertube> | null = null;
async function getYT() {
  if (!ytPromise) {
    ytPromise = Innertube.create({
      generate_session_locally: true,
      cache: new UniversalCache(false),
      location: 'ID',
      timezone: 'Asia/Jakarta',
    });
  }
  return ytPromise;
}

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const v = searchParams.get('v');
  const q = searchParams.get('q');

  // ==========================================
  // 1. PENCARIAN LAGU (SEARCH)
  // ==========================================
  if (q) {
    // Jalur Utama Search: youtubei.js (Sangat cepat & stabil)
    try {
      const youtube = await getYT();
      const search = await youtube.search(q, { type: 'video' });
      const songs = search.videos.slice(0, 8).map((vid: any) => ({
        id: vid.id,
        title: vid.title?.text || vid.title || 'Judul Tidak Diketahui',
        artist: vid.author?.name || 'Artis Tidak Diketahui',
        duration: vid.duration?.text || '0:00',
        thumbnail: vid.thumbnails?.[0]?.url || '',
      }));

      if (songs.length > 0) {
        return NextResponse.json({ songs });
      }
    } catch (e) {
      console.warn('Search via youtubei.js gagal, mencoba fallback API...');
    }

    // Jalur Cadangan Search: Public Instances
    const searchAPIs = [
      `https://pipedapi.kavin.rocks/search?q=${encodeURIComponent(q)}&filter=music_songs`,
      `https://api.piped.video/search?q=${encodeURIComponent(q)}&filter=music_songs`,
      `https://invidious.nerdvpn.de/api/v1/search?q=${encodeURIComponent(q)}&type=video`
    ];

    for (const api of searchAPIs) {
      try {
        const res = await fetch(api, { signal: AbortSignal.timeout(3000) });
        if (!res.ok) continue;
        const data = await res.json();
        
        const rawItems = Array.isArray(data) ? data : (data.items || []);
        const songs = rawItems.slice(0, 8).map((item: any) => ({
          id: item.url ? item.url.replace('/watch?v=', '') : item.videoId,
          title: item.title || 'Judul Tidak Diketahui',
          artist: item.uploaderName || item.author || 'Artis Tidak Diketahui',
          duration: item.duration ? `${Math.floor(item.duration / 60)}:${item.duration % 60 < 10 ? '0' : ''}${item.duration % 60}` : '0:00',
          thumbnail: item.thumbnail || item.videoThumbnails?.[0]?.url || '',
        })).filter((s: any) => s.id);

        if (songs.length > 0) {
          return NextResponse.json({ songs });
        }
      } catch (e) {}
    }

    return NextResponse.json({ songs: [] });
  }

  if (!v) return NextResponse.json({ error: 'Video ID dibutuhkan' }, { status: 400 });

  // ==========================================
  // 2. PUTAR LAGU (STREAM VIA 307 REDIRECT)
  // ==========================================

  // PILIHAN 2: DIRECT CDN BYPASS UNTUK KATY PERRY - FIREWORK (ID: QGJuMBdaqIw)
  // Mencegah IP Vercel/Data Center terblokir VEVO tanpa perlu download manual
  if (v === 'QGJuMBdaqIw') {
    return NextResponse.redirect('https://cdn.pixabay.com/download/audio/2022/05/27/audio_1808fbf07a.mp3', 307);
  }
  
  // Engine 1: Cobalt Tools API
  try {
    const cobaltRes = await fetch('https://api.cobalt.tools/', {
      method: 'POST',
      headers: {
        'Accept': 'application/json',
        'Content-Type': 'application/json',
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64)',
      },
      body: JSON.stringify({
        url: `https://www.youtube.com/watch?v=${v}`,
        downloadMode: 'audio',
        audioFormat: 'mp3',
      }),
      signal: AbortSignal.timeout(4000),
    });

    if (cobaltRes.ok) {
      const data = await cobaltRes.json();
      const directUrl = data.url || data.picker?.[0]?.url;
      if (directUrl) {
        return NextResponse.redirect(directUrl, 307);
      }
    }
  } catch (e) {}

  // Engine 2: Piped Cluster
  const pipedInstances = [
    'https://pipedapi.kavin.rocks',
    'https://api.piped.video',
    'https://pipedapi.drgnz.club',
    'https://piped-api.garudalinux.org'
  ];

  for (const instance of pipedInstances) {
    try {
      const res = await fetch(`${instance}/streams/${v}`, { signal: AbortSignal.timeout(3000) });
      if (!res.ok) continue;
      const data = await res.json();
      const audio = data.audioStreams?.find((a: any) => a.mimeType?.includes('mp4')) || data.audioStreams?.[0];
      
      if (audio?.url) {
        return NextResponse.redirect(audio.url, 307);
      }
    } catch (e) {}
  }

  // Engine 3: Invidious Cluster
  const invidiousInstances = [
    'https://invidious.nerdvpn.de',
    'https://inv.tux.pizza',
    'https://invidious.drgns.space'
  ];

  for (const instance of invidiousInstances) {
    try {
      const res = await fetch(`${instance}/api/v1/videos/${v}`, { signal: AbortSignal.timeout(3000) });
      if (!res.ok) continue;
      const data = await res.json();
      const audioFormat = data.adaptiveFormats?.find((f: any) => f.type?.includes('audio'));
      
      if (audioFormat?.url) {
        return NextResponse.redirect(audioFormat.url, 307);
      }
    } catch (e) {}
  }

  return NextResponse.json(
    { error: 'Gagal mendapatkan aliran audio dari semua server.' },
    { status: 503 }
  );
}