'use client';

import React, { createContext, useContext, useState, useRef, useEffect, useCallback, RefObject } from 'react';
import { usePathname } from 'next/navigation';
import { KeepAwake } from '@capacitor-community/keep-awake';
import { MediaSession } from '@jofr/capacitor-media-session';
import { ForegroundService } from '@capawesome-team/capacitor-android-foreground-service';

import { SongItem, SyncedLine, fetchLyrics, searchSongs } from '@/app/mp3/yt';

export const notifyAuthChange = () => {
  if (typeof window !== 'undefined') {
    window.dispatchEvent(new Event('auth-change'));
    window.dispatchEvent(new Event('user-logged-in'));
    window.dispatchEvent(new Event('storage'));
  }
};

type PlayMode = 'normal' | 'repeat-one' | 'repeat-all' | 'shuffle';

interface AudioContextType {
  isAuthenticated: boolean;
  checkingAuth: boolean;
  checkAuthStatus: () => boolean;
  currentSong: SongItem | null;
  isPlaying: boolean;
  playMode: PlayMode;
  progress: number;
  currentTimeSec: number;
  currentTime: string;
  duration: string;
  searchResults: SongItem[];
  quickPicks: SongItem[];
  isSearching: boolean;
  hasSearched: boolean;
  inputQuery: string;
  showLyricsModal: boolean;
  syncedLyrics: SyncedLine[];
  rawLyrics: string;
  isLoadingLyrics: boolean;
  activeLyricIndex: number;
  lyricsContainerRef: RefObject<HTMLDivElement>;
  searchInputRef: RefObject<HTMLInputElement>;
  setInputQuery: (q: string) => void;
  setShowLyricsModal: (show: boolean) => void;
  playSong: (song: SongItem) => Promise<void>;
  togglePlayPause: () => void;
  playNext: () => void;
  playPrev: () => void;
  togglePlayMode: () => void;
  setPlayMode: React.Dispatch<React.SetStateAction<PlayMode>>;
  setSearchResults: React.Dispatch<React.SetStateAction<SongItem[]>>;
  handleSeek: (e: React.ChangeEvent<HTMLInputElement>) => void;
  handleSearch: (e: React.FormEvent, onUnauth?: () => void) => Promise<void>;
  refreshQuickPicks: () => Promise<void>;
  seekToTime: (timeSec: number) => void;
}

const AudioContext = createContext<AudioContextType | undefined>(undefined);

// API Extractor Gratis untuk Mengambil Direct Audio Stream dari YouTube ID
const getDirectAudioUrl = async (videoId: string): Promise<string | null> => {
  try {
    const res = await fetch(`https://pipedapi.kavin.rocks/streams/${videoId}`);
    const data = await res.json();
    if (data && data.audioStreams && data.audioStreams.length > 0) {
      const bestAudio = data.audioStreams.find((s: any) => s.mimeType?.includes('audio/mp4')) || data.audioStreams[0];
      return bestAudio.url;
    }
  } catch (err) {
    console.error("Gagal mengambil stream audio:", err);
  }
  return null;
};

export const AudioProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const pathname = usePathname();

  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false);
  const [checkingAuth, setCheckingAuth] = useState<boolean>(true);

  const [inputQuery, setInputQuery] = useState('');
  const [searchResults, setSearchResults] = useState<SongItem[]>([]);
  const [quickPicks, setQuickPicks] = useState<SongItem[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [hasSearched, setHasSearched] = useState(false);

  const [currentSong, setCurrentSong] = useState<SongItem | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [playMode, setPlayMode] = useState<PlayMode>('normal');

  const [progress, setProgress] = useState(0);
  const [currentTimeSec, setCurrentTimeSec] = useState(0);
  const [currentTime, setCurrentTime] = useState('0:00');
  const [duration, setDuration] = useState('0:00');

  const [showLyricsModal, setShowLyricsModal] = useState(false);
  const [syncedLyrics, setSyncedLyrics] = useState<SyncedLine[]>([]);
  const [rawLyrics, setRawLyrics] = useState<string>('');
  const [isLoadingLyrics, setIsLoadingLyrics] = useState(false);
  const [activeLyricIndex, setActiveLyricIndex] = useState<number>(-1);

  const audioRef = useRef<HTMLAudioElement | null>(null);
  const lyricsContainerRef = useRef<HTMLDivElement>(null) as RefObject<HTMLDivElement>;
  const searchInputRef = useRef<HTMLInputElement>(null) as RefObject<HTMLInputElement>;

  const activePlaylistRef = useRef<SongItem[]>([]);
  const playModeRef = useRef<PlayMode>('normal');
  const currentSongRef = useRef<SongItem | null>(null);

  useEffect(() => { playModeRef.current = playMode; }, [playMode]);
  useEffect(() => { currentSongRef.current = currentSong; }, [currentSong]);

  const formatTime = (secs: number) => {
    if (isNaN(secs) || !isFinite(secs) || secs < 0) return '0:00';
    const m = Math.floor(secs / 60);
    const s = Math.floor(secs % 60);
    return `${m}:${s < 10 ? '0' : ''}${s}`;
  };

  const checkAuthStatus = useCallback(() => {
    try {
      if (typeof window === 'undefined') return false;
      const isAuthFlag = localStorage.getItem('is_auth') === 'true' || sessionStorage.getItem('is_auth') === 'true';
      const localUser = localStorage.getItem('remembered_username') || localStorage.getItem('active_username') || localStorage.getItem('username') || localStorage.getItem('user') || sessionStorage.getItem('active_username') || sessionStorage.getItem('username');
      const isAuth = Boolean(isAuthFlag || localUser);
      setIsAuthenticated(isAuth);
      return isAuth;
    } catch (err) {
      setIsAuthenticated(false);
      return false;
    } finally {
      setCheckingAuth(false);
    }
  }, []);

  const refreshQuickPicks = useCallback(async () => {
    setIsSearching(true);
    try {
      const isAuthLocal = localStorage.getItem('is_auth') === 'true' || Boolean(localStorage.getItem('remembered_username') || localStorage.getItem('active_username') || localStorage.getItem('username') || localStorage.getItem('user') || sessionStorage.getItem('active_username') || sessionStorage.getItem('username'));
      const limit = isAuthLocal ? 20 : 5;
      let pinnedSongs: SongItem[] = [];
      try {
        const res = await fetch('/api/quick-picks');
        const data = await res.json();
        if (data.success && Array.isArray(data.pinnedSongs)) pinnedSongs = data.pinnedSongs;
      } catch (err) {}

      let additionalSongs: SongItem[] = [];
      if (pinnedSongs.length < limit) {
        const keywords = ['Lagu Populer Indonesia', 'Hits Indonesia 2026', 'Lagu Viral Tiktok', 'Pop Hits Indonesia'];
        const randomKeyword = keywords[Math.floor(Math.random() * keywords.length)];
        const ytSongs = await searchSongs(randomKeyword, limit - pinnedSongs.length);
        additionalSongs = ytSongs.filter((ytSong) => !pinnedSongs.some((pinned) => pinned.id === ytSong.id));
      }

      const combinedQuickPicks = [...pinnedSongs, ...additionalSongs].slice(0, limit);
      setQuickPicks(combinedQuickPicks);
      if (!hasSearched) setSearchResults(combinedQuickPicks);
    } catch (error) {
    } finally {
      setIsSearching(false);
    }
  }, [hasSearched]);

  useEffect(() => {
    checkAuthStatus();
    const handleStorageOrAuthChange = () => {
      if (checkAuthStatus()) refreshQuickPicks();
    };
    window.addEventListener('storage', handleStorageOrAuthChange);
    window.addEventListener('user-logged-in', handleStorageOrAuthChange);
    window.addEventListener('auth-change', handleStorageOrAuthChange);
    return () => {
      window.removeEventListener('storage', handleStorageOrAuthChange);
      window.removeEventListener('user-logged-in', handleStorageOrAuthChange);
      window.removeEventListener('auth-change', handleStorageOrAuthChange);
    };
  }, [pathname, checkAuthStatus, refreshQuickPicks]);

  useEffect(() => {
    if (!checkingAuth) refreshQuickPicks();
  }, [checkingAuth, refreshQuickPicks]);

  useEffect(() => {
    if (searchResults.length > 0) activePlaylistRef.current = searchResults;
    else if (quickPicks.length > 0) activePlaylistRef.current = quickPicks;
  }, [searchResults, quickPicks]);

  useEffect(() => {
    if (!currentSong) return;
    const loadLyrics = async () => {
      setIsLoadingLyrics(true);
      setSyncedLyrics([]);
      setRawLyrics('');
      setActiveLyricIndex(-1);
      const res = await fetchLyrics(currentSong);
      if (res.syncedLyrics) setSyncedLyrics(res.syncedLyrics);
      else setRawLyrics(res.rawLyrics || 'Lirik tidak tersedia');
      setIsLoadingLyrics(false);
    };
    loadLyrics();
  }, [currentSong]);

  useEffect(() => {
    if (syncedLyrics.length === 0) return;
    let index = -1;
    for (let i = 0; i < syncedLyrics.length; i++) {
      if (currentTimeSec >= syncedLyrics[i].time) index = i;
      else break;
    }
    if (index !== activeLyricIndex) {
      setActiveLyricIndex(index);
      if (lyricsContainerRef.current && index !== -1) {
        const activeElem = lyricsContainerRef.current.children[index] as HTMLElement;
        if (activeElem) activeElem.scrollIntoView({ behavior: 'smooth', block: 'center' });
      }
    }
  }, [currentTimeSec, syncedLyrics, activeLyricIndex]);

  const updateNativeMediaSession = useCallback(async (song: SongItem) => {
    try {
      await MediaSession.setMetadata({
        title: song.title,
        artist: song.artist,
        album: 'iPix Chat MP3',
        artwork: [{ src: song.thumbnail || '/icon.png', sizes: '512x512', type: 'image/png' }]
      });
      await MediaSession.setPlaybackState({ playbackState: 'playing' });
    } catch (e) {}
  }, []);

  const playSong = useCallback(
    async (song: SongItem) => {
      try { if (KeepAwake.keepAwake) await KeepAwake.keepAwake(); } catch (e) {}

      setCurrentSong(song);
      setIsPlaying(false);
      setProgress(0);
      setCurrentTime('0:00');
      setCurrentTimeSec(0);

      try {
        await ForegroundService.startForegroundService({
          id: 1001,
          title: song.title || "ipixchat",
          body: song.artist || "Memutar musik...",
          smallIcon: "ic_launcher",
        });
      } catch (e) {}

      await updateNativeMediaSession(song);

      // Ambil stream audio langsung tanpa Iframe
      const directUrl = await getDirectAudioUrl(song.id);
      if (audioRef.current) {
        if (directUrl) {
          audioRef.current.src = directUrl;
        } else {
          audioRef.current.src = `https://www.youtube.com/watch?v=${song.id}`;
        }
        audioRef.current.play().then(() => {
          setIsPlaying(true);
        }).catch((err) => console.log("Play error:", err));
      }
    },
    [updateNativeMediaSession]
  );

  const togglePlayPause = useCallback(() => {
    if (!audioRef.current) return;
    if (isPlaying) {
      audioRef.current.pause();
      setIsPlaying(false);
      try { MediaSession.setPlaybackState({ playbackState: 'paused' }); } catch (e) {}
      try { ForegroundService.stopForegroundService(); } catch (e) {}
    } else {
      audioRef.current.play();
      setIsPlaying(true);
      try { MediaSession.setPlaybackState({ playbackState: 'playing' }); } catch (e) {}
      try {
        ForegroundService.startForegroundService({
          id: 1001,
          title: currentSongRef.current?.title || "ipixchat",
          body: currentSongRef.current?.artist || "Memutar musik...",
          smallIcon: "ic_launcher",
        });
      } catch (e) {}
    }
  }, [isPlaying]);

  const playNext = useCallback(() => {
    const playlist = activePlaylistRef.current;
    if (!currentSong || playlist.length === 0) return;
    const currentIndex = playlist.findIndex((s: SongItem) => s.id === currentSong.id);
    const nextIndex = (currentIndex + 1) % playlist.length;
    playSong(playlist[nextIndex]);
  }, [currentSong, playSong]);

  const playPrev = useCallback(() => {
    const playlist = activePlaylistRef.current;
    if (!currentSong || playlist.length === 0) return;
    const currentIndex = playlist.findIndex((s: SongItem) => s.id === currentSong.id);
    const prevIndex = (currentIndex - 1 + playlist.length) % playlist.length;
    playSong(playlist[prevIndex]);
  }, [currentSong, playSong]);

  const seekToTime = useCallback((timeSec: number) => {
    if (audioRef.current) {
      audioRef.current.currentTime = timeSec;
      setCurrentTimeSec(timeSec);
    }
  }, []);

  const handleSearch = async (e: React.FormEvent, onUnauth?: () => void) => {
    e.preventDefault();
    if (!checkAuthStatus()) { if (onUnauth) onUnauth(); return; }
    if (!inputQuery.trim()) return;

    let queryOrId = inputQuery.trim();
    setIsSearching(true);
    const newSongs = await searchSongs(queryOrId, 20);
    setSearchResults(newSongs);
    setHasSearched(true);
    setIsSearching(false);
  };

  const togglePlayMode = () => {
    setPlayMode((prevMode) => (prevMode === 'repeat-one' ? 'normal' : 'repeat-one'));
  };

  const handleSeek = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newProgress = Number(e.target.value);
    setProgress(newProgress);
    if (audioRef.current && audioRef.current.duration) {
      const seekTime = (newProgress / 100) * audioRef.current.duration;
      seekToTime(seekTime);
    }
  };

  return (
    <AudioContext.Provider
      value={{
        isAuthenticated,
        checkingAuth,
        checkAuthStatus,
        currentSong,
        isPlaying,
        playMode,
        progress,
        currentTimeSec,
        currentTime,
        duration,
        searchResults,
        quickPicks,
        isSearching,
        hasSearched,
        inputQuery,
        showLyricsModal,
        syncedLyrics,
        rawLyrics,
        isLoadingLyrics,
        activeLyricIndex,
        lyricsContainerRef,
        searchInputRef,
        setInputQuery,
        setShowLyricsModal,
        playSong,
        togglePlayPause,
        playNext,
        playPrev,
        togglePlayMode,
        setPlayMode,
        setSearchResults,
        handleSeek,
        handleSearch,
        refreshQuickPicks,
        seekToTime,
      }}
    >
      {/* HTML5 Audio Element menggantikan YouTube Iframe */}
      <audio
        ref={audioRef}
        onTimeUpdate={() => {
          if (audioRef.current) {
            const cur = audioRef.current.currentTime || 0;
            const dur = audioRef.current.duration || 0;
            setCurrentTimeSec(cur);
            setCurrentTime(formatTime(cur));
            if (dur > 0) {
              setProgress((cur / dur) * 100);
              setDuration(formatTime(dur));
            }
          }
        }}
        onEnded={() => {
          if (playModeRef.current === 'repeat-one' && audioRef.current) {
            audioRef.current.currentTime = 0;
            audioRef.current.play();
          } else {
            playNext();
          }
        }}
      />
      {children}
    </AudioContext.Provider>
  );
};

export const useAudio = () => {
  const context = useContext(AudioContext);
  if (!context) throw new Error('useAudio harus digunakan di dalam AudioProvider');
  return context;
};