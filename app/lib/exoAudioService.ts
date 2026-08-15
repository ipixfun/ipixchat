import { Capacitor } from '@capacitor/core';

export interface TrackData {
  id: string;
  url: string;
  title: string;
  artist: string;
  artwork?: string;
}

export class ExoAudioService {
  private static isNative = Capacitor.isNativePlatform();
  private static htmlAudio: HTMLAudioElement | null = null;

  // 1. Memutar Lagu via ExoPlayer Native
  static async play(track: TrackData) {
    if (this.isNative) {
      try {
        // @ts-ignore
        const { CapacitorExoPlayer } = await import(/* webpackIgnore: true */ 'capacitor-exoplayer');
        
        await CapacitorExoPlayer.play({
          url: track.url,
          title: track.title,
          artist: track.artist,
          artwork: track.artwork || '',
          showNotification: true,
        });
        return;
      } catch (e) {
        console.warn('ExoPlayer Native gagal, fallback ke HTML Audio', e);
      }
    }

    // Fallback jika dibuka di Browser Web biasa
    if (!this.htmlAudio) {
      this.htmlAudio = new Audio();
    }
    this.htmlAudio.src = track.url;
    this.htmlAudio.play();
  }

  // 2. Pause Lagu
  static async pause() {
    if (this.isNative) {
      try {
        // @ts-ignore
        const { CapacitorExoPlayer } = await import(/* webpackIgnore: true */ 'capacitor-exoplayer');
        await CapacitorExoPlayer.pause();
        return;
      } catch (e) {}
    }

    if (this.htmlAudio) {
      this.htmlAudio.pause();
    }
  }

  // 3. Resume / Lanjut Lagu
  static async resume() {
    if (this.isNative) {
      try {
        // @ts-ignore
        const { CapacitorExoPlayer } = await import(/* webpackIgnore: true */ 'capacitor-exoplayer');
        await CapacitorExoPlayer.resume();
        return;
      } catch (e) {}
    }

    if (this.htmlAudio) {
      this.htmlAudio.play();
    }
  }
}