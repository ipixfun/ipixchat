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
  // 2. AUTOMATED HIGH-COMPATIBILITY STREAM CLUSTER
  // ==========================================

  // JALUR I: Cobalt Direct Audio Extractor (Kebal terhadap Blokir DefJam/VEVO/UMG)
  try {
    const cobaltRes = await fetch('https://api.cobalt.tools/', {
      method: 'POST',
      headers: {
        'Accept': 'application/json',
        'Content-Type': 'application/json',
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
      },
      body: JSON.stringify({
        url: `https://www.youtube.com/watch?v=${v}`,
        downloadMode: 'audio',
        audioFormat: 'mp3',
      }),
      signal: AbortSignal.timeout(3500),
    });

    if (cobaltRes.ok) {
      const data = await cobaltRes.json();
      const directUrl = data.url || data.picker?.[0]?.url;
      if (directUrl) {
        return NextResponse.redirect(directUrl, 307);
      }
    }
  } catch (e) {}

  // JALUR II: Cluster Invidious Anti-VEVO & Piped Cluster
  const streamAPIs = [
    // Invidious Instances (Sangat Kuat Tembus Justin Bieber & VEVO)
    `https://inv.nadeko.net/api/v1/videos/${v}`,
    `https://invidious.nerdvpn.de/api/v1/videos/${v}`,
    `https://inv.tux.pizza/api/v1/videos/${v}`,
    `https://invidious.drgns.space/api/v1/videos/${v}`,
    
    // Piped Instances (Fallback)
    `https://pipedapi.kavin.rocks/streams/${v}`,
    `https://api.piped.video/streams/${v}`,
    `https://pipedapi.drgnz.club/streams/${v}`
  ];

  for (const endpoint of streamAPIs) {
    try {
      const res = await fetch(endpoint, { 
        headers: {
          'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
        },
        signal: AbortSignal.timeout(3500) 
      });
      if (!res.ok) continue;
      
      const data = await res.json();

      const audioUrl =
        data.adaptiveFormats?.find((f: any) => f.type?.includes('audio'))?.url ||
        data.audioStreams?.find((a: any) => a.mimeType?.includes('mp4') || a.mimeType?.includes('webm'))?.url;

      if (audioUrl) {
        return NextResponse.redirect(audioUrl, 307);
      }
    } catch (e) {}
  }

  return NextResponse.json(
    { error: 'Gagal memuat stream audio dari seluruh cluster.' },
    { status: 503 }
  );
}