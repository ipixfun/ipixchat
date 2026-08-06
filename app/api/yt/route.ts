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

const PIPED_SERVERS = [
  'https://pipedapi.kavin.rocks',
  'https://api.piped.video',
  'https://pipedapi.mha.fi',
  'https://pipedapi.drgnz.club',
  'https://piped-api.garudalinux.org',
  'https://pipedapi.astral.cool',
  'https://pipedapi.librem.one',
];

const INVIDIOUS_SERVERS = [
  'https://invidious.nerdvpn.de',
  'https://inv.riverside.rocks',
  'https://invidious.flokinet.to',
  'https://yt.drgnz.club',
  'https://invidious.projectsegfau.lt',
];

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const videoId = searchParams.get('v');
  const type = searchParams.get('type');
  const query = searchParams.get('q');

  try {
    // 1. CARI LAGU (SEARCH)
    if (query) {
      for (const server of PIPED_SERVERS) {
        try {
          const res = await fetch(
            `${server}/search?q=${encodeURIComponent(query)}&filter=music_songs`,
            { signal: AbortSignal.timeout(2500) }
          );
          if (!res.ok) continue;
          const data = await res.json();
          const items = data.items || data;
          const songs = items.slice(0, 8).map((item: any) => ({
            id: item.url?.replace('/watch?v=', '') || item.videoId || '',
            title: item.title || 'Judul Tidak Diketahui',
            artist: item.uploaderName || item.author || 'Artis Tidak Diketahui',
            duration: item.duration
              ? `${Math.floor(item.duration / 60)}:${
                  item.duration % 60 < 10 ? '0' : ''
                }${item.duration % 60}`
              : '0:00',
          }));
          if (songs.length > 0) return NextResponse.json({ songs });
        } catch (e) {
          // Lanjut ke server berikutnya jika gagal
        }
      }

      // Fallback Search via Youtubei.js
      try {
        const youtube = await getYT();
        const searchResults = await youtube.search(query, { type: 'video' });
        const songs = searchResults.videos.slice(0, 8).map((v: any) => ({
          id: v.id,
          title: v.title?.text || 'Judul Tidak Diketahui',
          artist: v.author?.name || 'Artis Tidak Diketahui',
          duration: v.duration?.text || '0:00',
        }));
        return NextResponse.json({ songs });
      } catch (e) {
        return NextResponse.json({ songs: [] });
      }
    }

    if (!videoId) {
      return NextResponse.json({ error: 'Video ID dibutuhkan' }, { status: 400 });
    }

    // 2. METADATA INFO LAGU
    if (type === 'info') {
      try {
        const youtube = await getYT();
        const info = await youtube.getBasicInfo(videoId);
        return NextResponse.json({
          title: info.basic_info.title || 'Judul Tidak Diketahui',
          artist: info.basic_info.author || 'Artis Tidak Diketahui',
        });
      } catch (e) {
        return NextResponse.json({ title: 'Lagu YouTube', artist: 'Artis' });
      }
    }

    // 3. STREAMING AUDIO (ENGINE 1: PIPED)
    for (const server of PIPED_SERVERS) {
      try {
        const res = await fetch(`${server}/streams/${videoId}`, {
          headers: { 'User-Agent': 'Mozilla/5.0' },
          signal: AbortSignal.timeout(3000),
        });

        if (!res.ok) continue;
        const data = await res.json();

        if (data.audioStreams && data.audioStreams.length > 0) {
          const sorted = data.audioStreams.sort(
            (a: any, b: any) => (b.bitrate || 0) - (a.bitrate || 0)
          );
          const audioUrl = sorted[0]?.url;
          if (audioUrl) {
            return NextResponse.redirect(audioUrl, 307);
          }
        }
      } catch (e) {
        // Lanjut ke server berikutnya
      }
    }

    // 4. STREAMING AUDIO (ENGINE 2: COBALT)
    try {
      const cobaltRes = await fetch('https://api.cobalt.tools/', {
        method: 'POST',
        headers: {
          Accept: 'application/json',
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          url: `https://www.youtube.com/watch?v=${videoId}`,
          downloadMode: 'audio',
        }),
        signal: AbortSignal.timeout(4000),
      });

      if (cobaltRes.ok) {
        const cobaltData = await cobaltRes.json();
        if (cobaltData.url) {
          return NextResponse.redirect(cobaltData.url, 307);
        }
      }
    } catch (e) {
      // Lanjut jika timeout
    }

    // 5. STREAMING AUDIO (ENGINE 3: INVIDIOUS)
    for (const server of INVIDIOUS_SERVERS) {
      try {
        const invRes = await fetch(`${server}/api/v1/videos/${videoId}`, {
          headers: { 'User-Agent': 'Mozilla/5.0' },
          signal: AbortSignal.timeout(3000),
        });
        if (!invRes.ok) continue;
        const invData = await invRes.json();
        const audioFormats = (invData.adaptiveFormats || []).filter((f: any) =>
          f.type?.startsWith('audio/')
        );
        if (audioFormats.length > 0) {
          audioFormats.sort((a: any, b: any) => (b.bitrate || 0) - (a.bitrate || 0));
          return NextResponse.redirect(audioFormats[0].url, 307);
        }
      } catch (e) {
        // Lanjut
      }
    }

    // 6. STREAMING AUDIO (ENGINE 4: YOUTUBE I.JS)
    try {
      const youtube = await getYT();
      const info = await youtube.getInfo(videoId);
      const format = info.chooseFormat({ type: 'audio', quality: 'best' });
      if (format) {
        const directUrl = await format.decipher(youtube.session.player);
        if (directUrl) {
          return NextResponse.redirect(directUrl, 307);
        }
      }
    } catch (e) {
      // Lanjut
    }

    return NextResponse.json(
      { error: 'Gagal mendapatkan stream dari seluruh server' },
      { status: 503 }
    );
  } catch (err: any) {
    console.error('YT Route Error:', err);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}