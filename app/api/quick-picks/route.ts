export const dynamic = 'force-dynamic';
export const revalidate = 0;

import { NextResponse } from 'next/server';
import { prisma } from '@/app/lib/prisma';

export async function GET() {
  try {
    const pinnedDb = await prisma.pinnedSong.findMany({
      orderBy: { createdAt: 'desc' },
    });

    const pinnedSongs = pinnedDb.map((song: any) => ({
      id: String(song.id),
      title: String(song.title),
      artist: String(song.artist),
      thumbnail: String(song.thumbnail),
      duration: String(song.duration),
      isPinned: true,
    }));

    return NextResponse.json({
      success: true,
      pinnedSongs: pinnedSongs,
    });
  } catch (error: any) {
    console.error('DATABASE_ERROR_VERCEL:', error);
    return NextResponse.json({
      success: false,
      pinnedSongs: [],
      errorDetail: error?.message || String(error),
    });
  }
}