import { NextResponse } from 'next/server';

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const title = searchParams.get('title') || '';
  const artist = searchParams.get('artist') || '';

  if (!title) {
    return NextResponse.json({ error: 'Title is required' }, { status: 400 });
  }

  // Bersihkan judul dari kata-kata pengganggu (seperti Official Video, Remix, dll.)
  const cleanTitle = title
    .replace(/[\(\[\{].*?[\)\]\}]/g, '')
    .replace(/(official|video|music|audio|lyric|lyrics|remix|ft\.|feat\.).*/gi, '')
    .trim();

  try {
    // Cari lirik otomatis ke LRCLIB API
    const searchUrl = `https://lrclib.net/api/search?q=${encodeURIComponent(cleanTitle + ' ' + artist)}`;
    const res = await fetch(searchUrl);
    const data = await res.json();

    if (Array.isArray(data) && data.length > 0) {
      // Prioritaskan lirik ter-sinkronisasi (Format LRC)
      const syncedMatch = data.find((item) => item.syncedLyrics);

      if (syncedMatch) {
        return NextResponse.json({
          lrc: syncedMatch.syncedLyrics,
          trackName: syncedMatch.trackName,
          artistName: syncedMatch.artistName,
        });
      }

      // Jika tidak ada lirik ter-sinkronisasi, gunakan lirik teks biasa
      const plainMatch = data.find((item) => item.plainLyrics);
      if (plainMatch) {
        return NextResponse.json({
          lyrics: plainMatch.plainLyrics,
          trackName: plainMatch.trackName,
          artistName: plainMatch.artistName,
        });
      }
    }

    return NextResponse.json({ error: 'Lirik tidak ditemukan' }, { status: 404 });
  } catch (err) {
    console.error('Lyrics API Error:', err);
    return NextResponse.json({ error: 'Gagal mengambil lirik' }, { status: 500 });
  }
}