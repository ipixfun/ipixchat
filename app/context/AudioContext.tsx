'use client';

import React, { createContext, useContext, useState, useRef, useEffect, useCallback, RefObject } from 'react';
import { usePathname } from 'next/navigation'; // <-- 1. IMPORT usePathname
import { KeepAwake } from '@capacitor-community/keep-awake';
import { MediaSession } from '@jofr/capacitor-media-session';

import { SongItem, SyncedLine, fetchLyrics, searchSongs } from '@/app/mp3/yt';

declare global {
  interface Window {
    onYouTubeIframeAPIReady: () => void;
    YT: any;
  }
}

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

export const AudioProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const pathname = usePathname(); // <-- 2. AMBIL PATHNAME SAAT INI

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

  const playerRef = useRef<any>(null);
  const isSeeking = useRef(false);
  const intervalRef = useRef<any>(null);

  const lyricsContainerRef = useRef<HTMLDivElement>(null) as RefObject<HTMLDivElement>;
  const searchInputRef = useRef<HTMLInputElement>(null) as RefObject<HTMLInputElement>;

  const activePlaylistRef = useRef<SongItem[]>([]);

  const formatTime = (secs: number) => {
    if (isNaN(secs) || !isFinite(secs) || secs < 0) return '0:00';
    const m = Math.floor(secs / 60);
    const s = Math.floor(secs % 60);
    return `${m}:${s < 10 ? '0' : ''}${s}`;
  };

  const checkAuthStatus = useCallback(() => {
    try {
      if (typeof window === 'undefined') return false;

      const isAuthFlag =
        localStorage.getItem('is_auth') === 'true' ||
        sessionStorage.getItem('is_auth') === 'true';

      const localUser =
        localStorage.getItem('remembered_username') ||
        localStorage.getItem('active_username') ||
        localStorage.getItem('username') ||
        localStorage.getItem('user') ||
        sessionStorage.getItem('active_username') ||
        sessionStorage.getItem('username');

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
    const keywords = [
      'Lagu Populer Indonesia',
      'Hits Indonesia 2026',
      'Lagu Viral Tiktok',
      'Pop Hits Indonesia',
      'Indie Indonesia Terbaru',
    ];
    const randomKeyword = keywords[Math.floor(Math.random() * keywords.length)];

    const isAuthLocal =
      localStorage.getItem('is_auth') === 'true' ||
      Boolean(
        localStorage.getItem('remembered_username') ||
        localStorage.getItem('active_username') ||
        localStorage.getItem('username') ||
        localStorage.getItem('user') ||
        sessionStorage.getItem('active_username') ||
        sessionStorage.getItem('username')
      );

    const songs = await searchSongs(randomKeyword, isAuthLocal ? 20 : 5);
    setSearchResults(songs);
    setIsSearching(false);
  }, []);

  // DETEKSI AUTH REAKSIF (Termasuk saat perpindahan halaman Next.js / route change)
  useEffect(() => {
    checkAuthStatus();

    const handleStorageOrAuthChange = () => {
      const authState = checkAuthStatus();
      if (authState) {
        refreshQuickPicks();
      }
    };

    window.addEventListener('storage', handleStorageOrAuthChange);
    window.addEventListener('user-logged-in', handleStorageOrAuthChange);
    window.addEventListener('auth-change', handleStorageOrAuthChange);
    window.addEventListener('focus', handleStorageOrAuthChange);
    document.addEventListener('visibilitychange', handleStorageOrAuthChange);

    return () => {
      window.removeEventListener('storage', handleStorageOrAuthChange);
      window.removeEventListener('user-logged-in', handleStorageOrAuthChange);
      window.removeEventListener('auth-change', handleStorageOrAuthChange);
      window.removeEventListener('focus', handleStorageOrAuthChange);
      document.removeEventListener('visibilitychange', handleStorageOrAuthChange);
    };
  }, [pathname, checkAuthStatus, refreshQuickPicks]); // <-- 3. MASUKKAN pathname DI DEPENDENCY

  useEffect(() => {
    if (!window.YT) {
      const tag = document.createElement('script');
      tag.src = 'https://www.youtube.com/iframe_api';
      const firstScriptTag = document.getElementsByTagName('script')[0];
      firstScriptTag?.parentNode?.insertBefore(tag, firstScriptTag);
    }
  }, []);

  useEffect(() => {
    if (!checkingAuth) refreshQuickPicks();
  }, [checkingAuth, refreshQuickPicks]);

  useEffect(() => {
    if (searchResults.length > 0) {
      activePlaylistRef.current = searchResults;
    } else if (quickPicks.length > 0) {
      activePlaylistRef.current = quickPicks;
    }
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

  const stopProgressTimer = () => {
    if (intervalRef.current) clearInterval(intervalRef.current);
  };

  const seekToTime = useCallback((timeSec: number) => {
    if (playerRef.current) {
      playerRef.current.seekTo(timeSec, true);
      setCurrentTimeSec(timeSec);

      const dur = playerRef.current.getDuration() || 0;
      if (dur > 0) {
        setProgress((timeSec / dur) * 100);
        setCurrentTime(formatTime(timeSec));

        try {
          MediaSession.setPositionState({
            duration: dur,
            playbackRate: 1,
            position: Math.min(Math.max(0, timeSec), dur),
          });
        } catch (e) {}
      }
    }
  }, []);

  const syncMediaSessionState = useCallback(() => {
    if (!playerRef.current) return;
    try {
      const cur = typeof playerRef.current.getCurrentTime === 'function' ? playerRef.current.getCurrentTime() : 0;
      const dur = typeof playerRef.current.getDuration === 'function' ? playerRef.current.getDuration() : 0;

      if (dur > 0 && isFinite(dur)) {
        MediaSession.setPositionState({
          duration: dur,
          playbackRate: 1,
          position: Math.min(Math.max(0, cur), dur),
        });
      }
    } catch (e) {}
  }, []);

  const startProgressTimer = useCallback(() => {
    stopProgressTimer();
    intervalRef.current = setInterval(() => {
      if (playerRef.current && typeof playerRef.current.getCurrentTime === 'function' && !isSeeking.current) {
        const cur = playerRef.current.getCurrentTime() || 0;
        const dur = playerRef.current.getDuration() || 0;
        setCurrentTimeSec(cur);

        if (dur > 0) {
          setProgress((cur / dur) * 100);
          setDuration(formatTime(dur));
          syncMediaSessionState();
        }
        setCurrentTime(formatTime(cur));
      }
    }, 800);
  }, [syncMediaSessionState]);

  const togglePlayPause = useCallback(() => {
    if (!playerRef.current) return;
    if (isPlaying) {
      playerRef.current.pauseVideo();
      setIsPlaying(false);
      try { MediaSession.setPlaybackState({ playbackState: 'paused' }); } catch (e) {}
    } else {
      playerRef.current.playVideo();
      setIsPlaying(true);
      try { MediaSession.setPlaybackState({ playbackState: 'playing' }); } catch (e) {}
    }
  }, [isPlaying]);

  const playNext = useCallback(() => {
    const playlist = activePlaylistRef.current;
    if (!currentSong || playlist.length === 0) return;

    if (playMode === 'shuffle') {
      const randomIndex = Math.floor(Math.random() * playlist.length);
      playSong(playlist[randomIndex]);
      return;
    }
    const currentIndex = playlist.findIndex((s: SongItem) => s.id === currentSong.id);
    const nextIndex = (currentIndex + 1) % playlist.length;
    playSong(playlist[nextIndex]);
  }, [currentSong, playMode]);

  const playPrev = useCallback(() => {
    const playlist = activePlaylistRef.current;
    if (!currentSong || playlist.length === 0) return;

    if (playMode === 'shuffle') {
      const randomIndex = Math.floor(Math.random() * playlist.length);
      playSong(playlist[randomIndex]);
      return;
    }
    const currentIndex = playlist.findIndex((s: SongItem) => s.id === currentSong.id);
    const prevIndex = (currentIndex - 1 + playlist.length) % playlist.length;
    playSong(playlist[prevIndex]);
  }, [currentSong, playMode]);

  const handleSongEnded = useCallback(() => {
    if (!currentSong) return;
    const playlist = activePlaylistRef.current;

    if (playMode === 'repeat-one') {
      if (playerRef.current) {
        playerRef.current.seekTo(0, true);
        playerRef.current.playVideo();
      }
      return;
    }

    if (playMode === 'shuffle') {
      if (playlist.length > 0) {
        const randomIndex = Math.floor(Math.random() * playlist.length);
        playSong(playlist[randomIndex]);
      }
      return;
    }

    const currentIndex = playlist.findIndex((s) => s.id === currentSong.id);
    if (currentIndex !== -1 && currentIndex < playlist.length - 1) {
      playSong(playlist[currentIndex + 1]);
    } else if (playMode === 'repeat-all' && playlist.length > 0) {
      playSong(playlist[0]);
    }
  }, [currentSong, playMode]);

  const updateNativeMediaSession = useCallback(async (song: SongItem) => {
    try {
      await MediaSession.setMetadata({
        title: song.title,
        artist: song.artist,
        album: 'iPix Chat MP3',
        artwork: [
          { src: song.thumbnail || '/icon.png', sizes: '512x512', type: 'image/png' }
        ]
      });

      await MediaSession.setPlaybackState({ playbackState: 'playing' });

      await MediaSession.setActionHandler({ action: 'play' }, () => {
        if (playerRef.current) {
          playerRef.current.playVideo();
          setIsPlaying(true);
          try { MediaSession.setPlaybackState({ playbackState: 'playing' }); } catch (e) {}
        }
      });

      await MediaSession.setActionHandler({ action: 'pause' }, () => {
        if (playerRef.current) {
          playerRef.current.pauseVideo();
          setIsPlaying(false);
          try { MediaSession.setPlaybackState({ playbackState: 'paused' }); } catch (e) {}
        }
      });

      await MediaSession.setActionHandler({ action: 'nexttrack' }, () => {
        playNext();
      });

      await MediaSession.setActionHandler({ action: 'previoustrack' }, () => {
        playPrev();
      });

      await MediaSession.setActionHandler({ action: 'seekto' }, (details: any) => {
        if (details && details.seekTime !== undefined && playerRef.current) {
          seekToTime(details.seekTime);
        }
      });
    } catch (e) {
      console.log('MediaSession native error:', e);
    }
  }, [playNext, playPrev, seekToTime]);

  const playSong = useCallback(
    async (song: SongItem) => {
      try {
        if (typeof KeepAwake !== 'undefined' && KeepAwake.keepAwake) {
          await KeepAwake.keepAwake();
        }
      } catch (e) {}

      setCurrentSong(song);
      setIsPlaying(false);
      setProgress(0);
      setCurrentTime('0:00');
      setCurrentTimeSec(0);

      await updateNativeMediaSession(song);

      setQuickPicks((prev: SongItem[]) => {
        if (prev.some((item: SongItem) => item.id === song.id)) return prev;
        const updated = [song, ...prev];
        return isAuthenticated ? updated : updated.slice(0, 5);
      });

      if (!window.YT || !window.YT.Player) return;

      if (playerRef.current) {
        playerRef.current.loadVideoById(song.id);
      } else {
        playerRef.current = new window.YT.Player('yt-global-player', {
          height: '1',
          width: '1',
          videoId: song.id,
          playerVars: { autoplay: 1, controls: 0, disablekb: 1, fs: 0, rel: 0 },
          events: {
            onReady: (event: any) => event.target.playVideo(),
            onStateChange: (event: any) => {
              if (event.data === 1) { // PLAYING
                setIsPlaying(true);
                startProgressTimer();
                try { MediaSession.setPlaybackState({ playbackState: 'playing' }); } catch (e) {}
              } else if (event.data === 2) { // PAUSED
                setIsPlaying(false);
                stopProgressTimer();
                try { MediaSession.setPlaybackState({ playbackState: 'paused' }); } catch (e) {}
              } else if (event.data === 0) { // ENDED
                setIsPlaying(false);
                stopProgressTimer();
                setProgress(0);
                handleSongEnded();
              }
            },
          },
        });
      }
    },
    [startProgressTimer, handleSongEnded, isAuthenticated, updateNativeMediaSession]
  );

  const handleSearch = async (e: React.FormEvent, onUnauth?: () => void) => {
    e.preventDefault();

    const isAuthNow = checkAuthStatus();

    if (!isAuthNow) {
      if (onUnauth) onUnauth();
      return;
    }

    if (!inputQuery.trim()) return;

    let queryOrId = inputQuery.trim();
    const ytMatch = queryOrId.match(
      /(?:youtube\.com\/watch\?v=|youtu\.be\/|youtube\.com\/shorts\/)([a-zA-Z0-9_-]{11})/
    );
    if (ytMatch) {
      queryOrId = ytMatch[1];
      playSong({ id: queryOrId, title: 'Memuat Video...', artist: 'YouTube', duration: '0:00' });
      return;
    }

    setIsSearching(true);
    const newSongs = await searchSongs(queryOrId, 20);

    if (searchResults.length > 0) {
      setQuickPicks((prev: SongItem[]) => {
        const combined = [...searchResults, ...prev];
        return combined.filter(
          (v: SongItem, i: number, a: SongItem[]) => a.findIndex((t: SongItem) => t.id === v.id) === i
        );
      });
    }

    setSearchResults(newSongs);
    setHasSearched(true);
    setIsSearching(false);
  };

  const togglePlayMode = () => {
    if (playMode === 'normal') setPlayMode('repeat-one');
    else if (playMode === 'repeat-one') setPlayMode('repeat-all');
    else if (playMode === 'repeat-all') setPlayMode('shuffle');
    else setPlayMode('normal');
  };

  const handleSeek = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newProgress = Number(e.target.value);
    setProgress(newProgress);
    if (playerRef.current && typeof playerRef.current.getDuration === 'function') {
      const dur = playerRef.current.getDuration();
      if (dur > 0) {
        const seekTime = (newProgress / 100) * dur;
        seekToTime(seekTime);
      }
    }
  };

  useEffect(() => {
    try {
      MediaSession.setPlaybackState({ playbackState: isPlaying ? 'playing' : 'paused' });
      syncMediaSessionState();
    } catch (e) {}
  }, [isPlaying, syncMediaSessionState]);

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
      <div className="absolute opacity-0 pointer-events-none -z-50 w-1 h-1 overflow-hidden">
        <div id="yt-global-player"></div>
      </div>
      {children}
    </AudioContext.Provider>
  );
};

export const useAudio = () => {
  const context = useContext(AudioContext);
  if (!context) throw new Error('useAudio harus digunakan di dalam AudioProvider');
  return context;
};