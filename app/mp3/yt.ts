export interface SongItem {
  id: string;
  title: string;
  artist: string;
  duration: string | number;
  thumbnail?: string;
}

export interface SyncedLine {
  time: number;
  text: string;
}

export interface LyricsResponse {
  syncedLyrics?: SyncedLine[];
  rawLyrics?: string;
}

/**
 * Mencari lagu melalui API internal (dengan fallback)
 */
export async function searchSongs(query: string, limit = 20): Promise<SongItem[]> {
  try {
    const res = await fetch(`/api/lyrics?action=search-song&q=${encodeURIComponent(query)}&limit=${limit}`);
    const data = await res.json();
    if (data.songs && data.songs.length > 0) {
      return data.songs.slice(0, limit);
    }

    const fallbackRes = await fetch(`/api/yt?q=${encodeURIComponent(query)}&limit=${limit}`);
    const fallbackData = await fallbackRes.json();
    return fallbackData.songs ? fallbackData.songs.slice(0, limit) : [];
  } catch (err) {
    console.error('Failed to fetch songs:', err);
    return [];
  }
}

/**
 * Mengambil lirik lagu berdasarkan judul, artis, dan ID YouTube
 */
export async function fetchLyrics(song: SongItem): Promise<LyricsResponse> {
  try {
    const res = await fetch(
      `/api/lyrics?title=${encodeURIComponent(song.title)}&artist=${encodeURIComponent(
        song.artist
      )}&ytId=${song.id}`
    );
    const data = await res.json();
    return {
      syncedLyrics: data.syncedLyrics && data.syncedLyrics.length > 0 ? data.syncedLyrics : undefined,
      rawLyrics: data.rawLyrics || 'Lirik tidak tersedia untuk lagu ini.',
    };
  } catch (err) {
    console.error('Failed to fetch lyrics:', err);
    return { rawLyrics: 'Gagal memuat lirik.' };
  }
}

/**
 * Membagi array menjadi potongan-potongan dengan ukuran tertentu (misal: per 5 item)
 */
export function chunkArray<T>(array: T[], size: number): T[][] {
  const result: T[][] = [];
  for (let i = 0; i < array.length; i += size) {
    result.push(array.slice(i, i + size));
  }
  return result;
}

/**
 * Mengacak array (Fisher-Yates Shuffle)
 */
export function shuffleArray<T>(array: T[]): T[] {
  const arr = [...array];
  for (let i = arr.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [arr[i], arr[j]] = [arr[j], arr[i]];
  }
  return arr;
}