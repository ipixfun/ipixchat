import { NextRequest, NextResponse } from 'next/server';
import { Innertube, UniversalCache } from 'youtubei.js';

export const dynamic = 'force-dynamic';
export const maxDuration = 60;

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

async function proxyStream(url: string, req: NextRequest) {
  const range = req.headers.get('range') || 'bytes=0-';
  
  const response = await fetch(url, {
    headers: {
      'Range': range,
      'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
    },
  });

  if (!response.ok && response.status !== 206) {
    throw new Error(`Proxy gagal dengan status: ${response.status}`);
  }

  const headers = new Headers();
  headers.set('Content-Type', response.headers.get('content-type') || 'audio/webm');
  headers.set('Accept-Ranges', 'bytes');
  headers.set('Cache-Control', 'public, max-age=3600');
  headers.set('Access-Control-Allow-Origin', '*');
  
  if (response.headers.has('content-length')) {
    headers.set('Content-Length', response.headers.get('content-length')!);
  }
  if (response.headers.has('content-range')) {
    headers.set('Content-Range', response.headers.get('content-range')!);
  }

  return new Response(response.body, {
    status: response.status,
    headers,
  });
}

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const v = searchParams.get('v');
  const q = searchParams.get('q');
  const type = searchParams.get('type');

  if (q) {
    try {
      const youtube = await getYT();
      const search = await youtube.search(q, { type: 'video' });
      const songs = search.videos.slice(0, 8).map((vid: any) => ({
        id: vid.id,
        title: vid.title?.text || 'Judul Tidak Diketahui',
        artist: vid.author?.name || 'Artis Tidak Diketahui',
        duration: vid.duration?.text || '0:00',
        thumbnail: vid.thumbnails?.[0]?.url || '',
      }));
      return NextResponse.json({ songs });
    } catch (e) {
      try {
        const res = await fetch(`https://pipedapi.kavin.rocks/search?q=${encodeURIComponent(q)}&filter=music_songs`);
        const data = await res.json();
        const songs = (data.items || []).slice(0, 8).map((item: any) => ({
          id: item.url?.replace('/watch?v=', ''),
          title: item.title,
          artist: item.uploaderName,
          duration: item.duration ? `${Math.floor(item.duration / 60)}:${item.duration % 60 < 10 ? '0' : ''}${item.duration % 60}` : '0:00',
        }));
        return NextResponse.json({ songs });
      } catch (err) {
        return NextResponse.json({ songs: [] });
      }
    }
  }

  if (!v) return NextResponse.json({ error: 'Video ID dibutuhkan' }, { status: 400 });

  if (type === 'info') {
    try {
      const youtube = await getYT();
      const info = await youtube.getBasicInfo(v);
      return NextResponse.json({
        title: info.basic_info.title,
        artist: info.basic_info.author,
      });
    } catch (e) {
      return NextResponse.json({ title: 'Lagu', artist: 'Artis' });
    }
  }

  try {
    const youtube = await getYT();
    const info = await youtube.getInfo(v);
    const format = info.chooseFormat({ type: 'audio', quality: 'best' });
    const directUrl = await format?.decipher(youtube.session.player);
    if (directUrl) {
      return await proxyStream(directUrl, req);
    }
  } catch (e) {
    console.warn('Engine 1 (Youtubei) diblokir, pindah ke Piped...');
  }

  const pipedServers = ['https://pipedapi.kavin.rocks', 'https://api.piped.video', 'https://pipedapi.drgnz.club'];
  for (const server of pipedServers) {
    try {
      const res = await fetch(`${server}/streams/${v}`, { signal: AbortSignal.timeout(3000) });
      if (!res.ok) continue;
      const data = await res.json();
      const audio = data.audioStreams?.find((a: any) => a.mimeType.includes('mp4')) || data.audioStreams?.[0];
      if (audio?.url) {
        return await proxyStream(audio.url, req);
      }
    } catch (e) {}
  }

  try {
    const cobalt = await fetch('https://api.cobalt.tools/', {
      method: 'POST',
      headers: { 'Accept': 'application/json', 'Content-Type': 'application/json' },
      body: JSON.stringify({ url: `https://youtu.be/${v}`, downloadMode: 'audio' }),
      signal: AbortSignal.timeout(4000)
    });
    if (cobalt.ok) {
      const data = await cobalt.json();
      if (data.url) {
         return NextResponse.redirect(data.url, 307);
      }
    }
  } catch (e) {}

  return NextResponse.json(
    { error: 'Semua server stream saat ini sedang sibuk/diblokir.' },
    { status: 503 }
  );
}