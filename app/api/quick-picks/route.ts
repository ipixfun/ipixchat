export const dynamic = 'force-dynamic';
export const revalidate = 0;

import { NextResponse } from 'next/server';
import { prisma } from '@/app/lib/prisma';

export async function GET() {
  try {
    const pinnedSongs = await prisma.pinnedSong.findMany({
      orderBy: { createdAt: 'desc' },
    });

    const formattedPinned = pinnedSongs.map((song: any) => ({
      id: song.id,
      title: song.title,
      artist: song.artist,
      thumbnail: song.thumbnail,
      duration: song.duration,
      isPinned: true,
    }));

    return NextResponse.json({
      success: true,
      pinnedSongs: formattedPinned,
    });
  } catch (error) {
    console.error('Error fetching pinned songs:', error);
    return NextResponse.json(
      { success: false, message: 'Gagal memuat lagu pilihan admin' },
      { status: 500 }
    );
  }
}