import { NextResponse } from 'next/server';
import { prisma } from '@/app/lib/prisma';

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { song, action } = body;

    if (!song || !song.id) {
      return NextResponse.json(
        { success: false, message: 'Data lagu tidak valid' },
        { status: 400 }
      );
    }

    if (action === 'pin') {
      const pinned = await prisma.pinnedSong.upsert({
        where: { id: String(song.id) },
        update: {
          title: String(song.title || 'Tanpa Judul'),
          artist: String(song.artist || 'Unknown Artist'),
          thumbnail: String(song.thumbnail || ''),
          duration: String(song.duration || '0:00'),
        },
        create: {
          id: String(song.id),
          title: String(song.title || 'Tanpa Judul'),
          artist: String(song.artist || 'Unknown Artist'),
          thumbnail: String(song.thumbnail || ''),
          duration: String(song.duration || '0:00'),
        },
      });

      return NextResponse.json({
        success: true,
        message: 'Lagu berhasil di-pin!',
        data: pinned,
      });
    }

    if (action === 'unpin') {
      await prisma.pinnedSong.delete({
        where: { id: String(song.id) },
      });

      return NextResponse.json({
        success: true,
        message: 'Lagu berhasil di-unpin!',
      });
    }

    return NextResponse.json(
      { success: false, message: 'Aksi tidak dikenali' },
      { status: 400 }
    );
  } catch (error: any) {
    console.error('SERVER ERROR PIN SONG:', error);
    return NextResponse.json(
      { success: false, message: error?.message || 'Terjadi kesalahan pada server' },
      { status: 500 }
    );
  }
}