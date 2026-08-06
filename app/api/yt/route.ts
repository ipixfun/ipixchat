import { NextRequest, NextResponse } from 'next/server';
import { Innertube } from 'youtubei.js';

// Global variable untuk menyimpan instance Innertube (agar tidak re-create setiap kali dipanggil)
let yt: Innertube | null = null;

async function getYT() {
  if (!yt) {
    yt = await Innertube.create();
  }
  return yt;
}

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const videoId = searchParams.get('v');
  const type = searchParams.get('type'); // 'info' atau null (untuk audio stream)

  // Validasi ID Video
  if (!videoId) {
    return NextResponse.json(
      { error: 'Parameter video ID (v) wajib diisi' },
      { status: 400 }
    );
  }

  try {
    const youtube = await getYT();

    // -------------------------------------------------------------
    // OPSIONAL 1: Jika dipanggil untuk mengambil Teks Info (Judul & Artis)
    // Contoh URL: /api/yt?v=dQw4w9WgXcQ&type=info
    // -------------------------------------------------------------
    if (type === 'info') {
      const info = await youtube.getBasicInfo(videoId);
      return NextResponse.json({
        title: info.basic_info.title || 'Judul Tidak Diketahui',
        artist: info.basic_info.author || 'Artis Tidak Diketahui',
      });
    }

    // -------------------------------------------------------------
    // OPSIONAL 2: Streaming Audio MP3
    // Contoh URL: /api/yt?v=dQw4w9WgXcQ
    // -------------------------------------------------------------
    const stream = await youtube.download(videoId, {
      type: 'audio',
      quality: 'best',
    });

    // Mengubah stream dari youtubei.js ke Web ReadableStream untuk Next.js
    const webStream = new ReadableStream({
      async start(controller) {
        for await (const chunk of stream) {
          controller.enqueue(chunk);
        }
        controller.close();
      },
    });

    return new NextResponse(webStream, {
      headers: {
        'Content-Type': 'audio/mpeg',
        'Cache-Control': 'no-cache, no-store, must-revalidate',
      },
    });
  } catch (err) {
    console.error('Error pada API YT:', err);
    return NextResponse.json(
      { error: 'Gagal memproses data lagu dari YouTube' },
      { status: 500 }
    );
  }
}