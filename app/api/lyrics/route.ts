// app/api/lyrics/route.ts
import { NextResponse } from 'next/server';
import { Innertube } from 'youtubei.js';

export const runtime = 'nodejs'; // Dijalankan di Node.js Serverless Vercel

// ============================================================================
// 1. TYPES & INTERFACES
// ============================================================================
export interface SyncedLine {
  time: number; // Durasi dalam detik (misal: 12.34)
  text: string; // Teks lirik
}

export interface LyricResult {
  source: 'LRCLIB' | 'BetterLyrics' | 'NetEase' | 'YouTube Music' | 'None';
  isSynced: boolean;
  rawLyrics: string | null;
  syncedLyrics: SyncedLine[] | null;
}

// Singleton Instance YouTubei
let ytInstance: Innertube | null = null;
async function getYT() {
  if (!ytInstance) {
    ytInstance = await Innertube.create();
  }
  return ytInstance;
}

// ============================================================================
// 2. PARSER & OFFSET HELPERS
// ============================================================================

/** Mengubah string format LRC [mm:ss.xx] menjadi Array JSON */
function parseLrc(lrcText: string): SyncedLine[] {
  const lines = lrcText.split('\n');
  const result: SyncedLine[] = [];
  const regex = /\[(\d{2}):(\d{2})\.(\d{2,3})\](.*)/;

  for (const line of lines) {
    const match = line.match(regex);
    if (match) {
      const minutes = parseInt(match[1], 10);
      const seconds = parseInt(match[2], 10);
      const msStr = match[3].padEnd(3, '0');
      const milliseconds = parseInt(msStr, 10);

      const timeInSeconds = minutes * 60 + seconds + milliseconds / 1000;
      const text = match[4].trim();

      if (text) {
        result.push({
          time: parseFloat(timeInSeconds.toFixed(2)),
          text,
        });
      }
    }
  }
  return result.sort((a, b) => a.time - b.time);
}

/** Menggeser timestamp lirik (+/- detik) agar pas dengan audio */
function applyOffset(syncedLyrics: SyncedLine[], offsetSeconds: number): SyncedLine[] {
  return syncedLyrics.map((line) => ({
    ...line,
    time: Math.max(0, parseFloat((line.time + offsetSeconds).toFixed(2))),
  }));
}

// ============================================================================
// 3. LYRICS FETCHERS (4-TIER FALLBACK SYSTEM)
// ============================================================================

// Tier 1: LRCLIB
async function fetchFromLrclib(title: string, artist: string, duration?: number) {
  try {
    const params = new URLSearchParams({ artist_name: artist, track_name: title });
    if (duration) params.append('duration', Math.round(duration).toString());

    const res = await fetch(`https://lrclib.net/api/get?${params.toString()}`);
    if (!res.ok) return null;
    const data = await res.json();

    if (data.syncedLyrics) return { raw: data.syncedLyrics, synced: true };
    if (data.plainLyrics) return { raw: data.plainLyrics, synced: false };
    return null;
  } catch {
    return null;
  }
}

// Tier 2: BetterLyrics API
async function fetchFromBetterLyrics(title: string, artist: string, duration?: number) {
  try {
    const params = new URLSearchParams({ song: title, artist: artist });
    if (duration) params.append('duration', Math.round(duration).toString());

    const res = await fetch(`https://unison.betterlyrics.org/lyrics?${params.toString()}`);
    if (!res.ok) return null;
    const data = await res.json();

    const raw = data.syncedLyrics || data.lyrics || data.lrc || null;
    if (raw) {
      const isSynced = /\[\d{2}:\d{2}\.\d{2,3}\]/.test(raw);
      return { raw, synced: isSynced };
    }
    return null;
  } catch {
    return null;
  }
}

// Tier 3: NetEase
async function fetchFromNetease(title: string, artist: string) {
  try {
    const query = `${artist} ${title}`;
    const searchRes = await fetch(
      `https://music.163.com/api/search/get/web?s=${encodeURIComponent(query)}&type=1&limit=1`
    );
    if (!searchRes.ok) return null;

    const searchData = await searchRes.json();
    const songId = searchData?.result?.songs?.[0]?.id;
    if (!songId) return null;

    const lyricRes = await fetch(`https://music.163.com/api/song/lyric?os=pc&id=${songId}&lv=-1`);
    if (!lyricRes.ok) return null;

    const lyricData = await lyricRes.json();
    const raw: string | undefined = lyricData?.lrc?.lyric;

    if (raw) {
      const isSynced = /\[\d{2}:\d{2}\.\d{2,3}\]/.test(raw);
      return { raw, synced: isSynced };
    }
    return null;
  } catch {
    return null;
  }
}

// Eksekusi Rantai Fallback 4 Tingkat
async function runLyricsFallback(
  title: string,
  artist: string,
  duration?: number,
  ytId?: string
): Promise<LyricResult> {
  // Tier 1: LRCLIB
  const lrclibRes = await fetchFromLrclib(title, artist, duration);
  if (lrclibRes) {
    return {
      source: 'LRCLIB',
      isSynced: lrclibRes.synced,
      rawLyrics: lrclibRes.raw,
      syncedLyrics: lrclibRes.synced ? parseLrc(lrclibRes.raw) : null,
    };
  }

  // Tier 2: BetterLyrics
  const betterLyricsRes = await fetchFromBetterLyrics(title, artist, duration);
  if (betterLyricsRes) {
    return {
      source: 'BetterLyrics',
      isSynced: betterLyricsRes.synced,
      rawLyrics: betterLyricsRes.raw,
      syncedLyrics: betterLyricsRes.synced ? parseLrc(betterLyricsRes.raw) : null,
    };
  }

  // Tier 3: NetEase
  const neteaseRes = await fetchFromNetease(title, artist);
  if (neteaseRes) {
    return {
      source: 'NetEase',
      isSynced: neteaseRes.synced,
      rawLyrics: neteaseRes.raw,
      syncedLyrics: neteaseRes.synced ? parseLrc(neteaseRes.raw) : null,
    };
  }

  // Tier 4: YouTube Music (via youtubei.js)
  if (ytId) {
    try {
      const yt = await getYT();
      const info = await yt.music.getInfo(ytId);
      const ytLyrics = await info.getLyrics();
      const raw = ytLyrics?.description?.text;
      if (raw) {
        const isSynced = /\[\d{2}:\d{2}\.\d{2,3}\]/.test(raw);
        return {
          source: 'YouTube Music',
          isSynced,
          rawLyrics: raw,
          syncedLyrics: isSynced ? parseLrc(raw) : null,
        };
      }
    } catch {
      // Abaikan jika tidak ditemukan
    }
  }

  return {
    source: 'None',
    isSynced: false,
    rawLyrics: null,
    syncedLyrics: null,
  };
}

// ============================================================================
// 4. MAIN API ROUTE HANDLER
// ============================================================================
export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const action = searchParams.get('action');

  try {
    const yt = await getYT();

    // ------------------------------------------------------------------------
    // 1. Cari Lagu di YT Music (SUDAH DIPERBAIKI)
    // GET /api/lyrics?action=search-song&q=Coldplay
    // ------------------------------------------------------------------------
    if (action === 'search-song') {
      const q = searchParams.get('q');
      if (!q) return NextResponse.json({ error: 'Query "q" required' }, { status: 400 });

      const searchResults = await yt.music.search(q, { type: 'song' });
      
      // Perbaikan: Gunakan .contents dan tambahkan penegasan tipe (song: any)
      const songs = searchResults.songs?.contents?.map((song: any) => ({
        id: song.id,
        title: song.title?.text || song.title || '',
        artist: song.artists?.[0]?.name || 'Unknown Artist',
        album: song.album?.name || 'Single',
        duration: song.duration?.seconds || 0,
        thumbnail: song.thumbnails?.[0]?.url || '',
      }));

      return NextResponse.json({ songs: songs || [] });
    }

    // ------------------------------------------------------------------------
    // 2. Dapatkan Stream Audio Direct dari YT Music (SUDAH DIPERBAIKI)
    // GET /api/lyrics?action=get-stream&id=VIDEO_ID
    // ------------------------------------------------------------------------
    if (action === 'get-stream') {
      const id = searchParams.get('id');
      if (!id) return NextResponse.json({ error: 'Song "id" required' }, { status: 400 });

      // Perbaikan: Menggunakan { client: 'YTMUSIC' } menggantikan string 'WEB_REMIX'
      const info = await yt.getBasicInfo(id, { client: 'YTMUSIC' });
      const format = info.chooseFormat({ type: 'audio', quality: 'best' });

      return NextResponse.json({
        id,
        streamUrl: format?.decipher(yt.session.player),
        mimeType: format?.mime_type,
        bitrate: format?.bitrate,
      });
    }

    // ------------------------------------------------------------------------
    // 3. Cari Daftar Alternatif Lirik (Manual Selection)
    // GET /api/lyrics?action=search-lyrics&q=Coldplay Viva La Vida
    // ------------------------------------------------------------------------
    if (action === 'search-lyrics') {
      const q = searchParams.get('q');
      if (!q) return NextResponse.json({ error: 'Query "q" required' }, { status: 400 });

      const res = await fetch(`https://lrclib.net/api/search?q=${encodeURIComponent(q)}`);
      const data = res.ok ? await res.json() : [];

      return NextResponse.json({ candidates: data });
    }

    // ------------------------------------------------------------------------
    // 4. Ambil Lirik Berdasarkan ID Kandidat + Offset
    // GET /api/lyrics?action=lyric-by-id&id=12345&offset=1.5
    // ------------------------------------------------------------------------
    if (action === 'lyric-by-id') {
      const id = searchParams.get('id');
      const offset = parseFloat(searchParams.get('offset') || '0');

      if (!id) return NextResponse.json({ error: 'Lyric "id" required' }, { status: 400 });

      const res = await fetch(`https://lrclib.net/api/get/${id}`);
      if (!res.ok) return NextResponse.json({ error: 'Lyric not found' }, { status: 404 });

      const data = await res.json();
      const raw = data.syncedLyrics || data.plainLyrics || null;
      const isSynced = Boolean(data.syncedLyrics);

      let syncedLyrics = isSynced && raw ? parseLrc(raw) : null;
      if (syncedLyrics && offset !== 0) {
        syncedLyrics = applyOffset(syncedLyrics, offset);
      }

      return NextResponse.json({
        source: 'LRCLIB (Manual)',
        isSynced,
        rawLyrics: raw,
        syncedLyrics,
      });
    }

    // ------------------------------------------------------------------------
    // 5. DEFAULT / AUTO LYRICS: Title + Artist (+ Optional YT ID / Offset)
    // GET /api/lyrics?title=Viva La Vida&artist=Coldplay&ytId=VIDEO_ID&offset=-0.5
    // ------------------------------------------------------------------------
    const title = searchParams.get('title');
    const artist = searchParams.get('artist') || '';
    const duration = searchParams.get('duration');
    const ytId = searchParams.get('ytId') || undefined;
    const offset = parseFloat(searchParams.get('offset') || '0');

    if (!title) {
      return NextResponse.json({ error: 'Parameter "title" is required' }, { status: 400 });
    }

    const parsedDuration = duration ? parseFloat(duration) : undefined;
    const lyricResult = await runLyricsFallback(title, artist, parsedDuration, ytId);

    if (lyricResult.syncedLyrics && offset !== 0) {
      lyricResult.syncedLyrics = applyOffset(lyricResult.syncedLyrics, offset);
    }

    return NextResponse.json(lyricResult);

  } catch (error) {
    return NextResponse.json(
      { error: 'Internal Server Error', details: (error as Error).message },
      { status: 500 }
    );
  }
}