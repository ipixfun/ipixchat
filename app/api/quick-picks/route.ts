export const dynamic = 'force-dynamic';
export const revalidate = 0;

import { NextResponse } from 'next/server';
import { prisma } from '@/app/lib/prisma';

export async function GET() {
  try {
    // 1. Ambil lagu ter-pin dari Supabase
    const pinnedDb = await prisma.pinnedSong.findMany({
      orderBy: { createdAt: 'desc' },
    });

    const pinnedSongs = pinnedDb.map((song: any) => ({
      id: song.id,
      title: song.title,
      artist: song.artist,
      thumbnail: song.thumbnail,
      duration: song.duration,
      isPinned: true,
    }));

    // 2. Return data dari Supabase
    return NextResponse.json({
      success: true,
      pinnedSongs: pinnedSongs,
    });
  } catch (error: any) {
    console.error('Error in quick-picks route:', error);
    return NextResponse.json(
      { success: false, message: 'Gagal mengambil lagu pin', pinnedSongs: [] },
      { status: 500 }
    );
  }
}