"use client";
import React, { useRef, useState, useEffect } from "react";

const EMOJI_ANIM_MAP: Record<string, string> = {
  "🤬": "anim-pulse-glow",
  "😍": "anim-heartbeat",
  "😂": "anim-wiggle",
  "💦": "anim-wiggle",
  "👍": "anim-bounce-soft",
  "😱": "anim-bounce-soft",
  "🔥": "anim-pulse-glow",
  "🙏": "anim-shake-soft",
  "😭": "anim-shake-soft",
  "😊": "anim-pulse-soft",
};

const parseAnimatedEmojis = (text: string) => {
  const emojiRegex = /([\p{Extended_Pictographic}\p{Emoji_Presentation}])/gu;
  return text.split(emojiRegex).map((part, idx) =>
    part.match(emojiRegex) ? (
      <span key={idx} className={`inline-block mx-[1px] ${EMOJI_ANIM_MAP[part] || "anim-bounce-soft"}`}>
        {part}
      </span>
    ) : (
      <React.Fragment key={idx}>{part}</React.Fragment>
    )
  );
};

// ==========================================
// KOMPONEN PLAYER VOICE NOTE (CUSTOM AUDIO)
// ==========================================
export function VoiceNotePlayer({ audioUrl, duration }: { audioUrl: string; duration?: number }) {
  const [isPlaying, setIsPlaying] = useState(false);
  const [progress, setProgress] = useState(0);
  const [currentTime, setCurrentTime] = useState(0);
  const [audioDuration, setAudioDuration] = useState(duration || 0);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  const togglePlay = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (!audioRef.current) return;
    if (isPlaying) {
      audioRef.current.pause();
    } else {
      audioRef.current.play();
    }
    setIsPlaying(!isPlaying);
  };

  const handleTimeUpdate = () => {
    if (!audioRef.current) return;
    const cur = audioRef.current.currentTime;
    const dur = audioRef.current.duration || audioDuration || 1;
    setCurrentTime(cur);
    setProgress((cur / dur) * 100);
  };

  const handleLoadedMetadata = () => {
    if (audioRef.current && audioRef.current.duration) {
      setAudioDuration(audioRef.current.duration);
    }
  };

  const handleEnded = () => {
    setIsPlaying(false);
    setProgress(0);
    setCurrentTime(0);
  };

  const handleSeek = (e: React.MouseEvent<HTMLDivElement>) => {
    e.stopPropagation();
    if (!audioRef.current) return;
    const rect = e.currentTarget.getBoundingClientRect();
    const clickX = e.clientX - rect.left;
    const width = rect.width;
    const dur = audioRef.current.duration || audioDuration || 1;
    const newTime = (clickX / width) * dur;
    audioRef.current.currentTime = newTime;
    setCurrentTime(newTime);
    setProgress((newTime / dur) * 100);
  };

  const formatSec = (sec: number) => {
    if (isNaN(sec) || sec === Infinity) return "0:00";
    const m = Math.floor(sec / 60);
    const s = Math.floor(sec % 60);
    return `${m}:${s.toString().padStart(2, "0")}`;
  };

  return (
    <div
      className="flex items-center gap-2.5 p-2 px-3 bg-black/20 backdrop-blur-md rounded-2xl border border-white/10 my-1 w-full max-w-[260px] shadow-inner select-none"
      onClick={(e) => e.stopPropagation()}
    >
      <audio
        ref={audioRef}
        src={audioUrl}
        onTimeUpdate={handleTimeUpdate}
        onLoadedMetadata={handleLoadedMetadata}
        onEnded={handleEnded}
        preload="metadata"
      />
      <button
        type="button"
        onClick={togglePlay}
        className="w-9 h-9 rounded-full bg-[var(--accent,#eab308)] text-[var(--background,#000)] font-black flex items-center justify-center shrink-0 active:scale-90 transition-transform shadow-md cursor-pointer"
      >
        {isPlaying ? (
          <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4 fill-current" viewBox="0 0 24 24">
            <path d="M6 4h4v16H6zm8 0h4v16h-4z" />
          </svg>
        ) : (
          <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4 fill-current ml-0.5" viewBox="0 0 24 24">
            <path d="M8 5v14l11-7z" />
          </svg>
        )}
      </button>

      <div className="flex-1 flex flex-col justify-center gap-1 min-w-0">
        <div
          className="w-full bg-white/20 h-2 rounded-full overflow-hidden cursor-pointer relative"
          onClick={handleSeek}
        >
          <div
            className="bg-[var(--accent,#eab308)] h-full transition-all duration-75 rounded-full"
            style={{ width: `${progress}%` }}
          />
        </div>
        <div className="flex justify-between items-center text-[9px] font-mono opacity-80" style={{ color: "var(--foreground)" }}>
          <span>{formatSec(currentTime)}</span>
          <span>{formatSec(audioDuration)}</span>
        </div>
      </div>
    </div>
  );
}

// ==========================================
// KOMPONEN PINNED MESSAGE
// ==========================================
export function PinnedMessage({
  adminPinnedMsg,
  userPinnedMsg,
  uiTab,
  onEditPinned,
  onScrollToMsg,
}: {
  adminPinnedMsg?: any;
  userPinnedMsg?: any;
  uiTab?: string;
  onEditPinned?: (msg: any) => void;
  onScrollToMsg?: (id: number) => void;
}) {
  if (!adminPinnedMsg && !userPinnedMsg && uiTab !== "admin") return null;
  return (
    <div
      className="w-full px-3 py-1.5 z-10 shrink-0 border-b transition-all duration-300"
      style={{ backgroundColor: "var(--background)", borderColor: "var(--card-border)" }}
    >
      <div className="grid grid-cols-2 gap-2 w-full">
        <div
          onClick={() => adminPinnedMsg && onScrollToMsg?.(adminPinnedMsg.id)}
          className={`p-2 rounded-xl transition-all border backdrop-blur-md relative shadow-sm flex items-center gap-2 min-w-0 ${
            adminPinnedMsg ? "cursor-pointer active:scale-[0.98]" : "opacity-50"
          }`}
          style={{ backgroundColor: "var(--card-bg, rgba(255,255,255,0.03))", borderColor: "var(--card-border)" }}
        >
          <div className="shrink-0 opacity-90" style={{ color: "var(--accent)" }}>
            <svg xmlns="http://www.w3.org/2000/svg" className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M12 17v5" />
              <path d="M9 10.76a2 2 0 0 1-1.11 1.79l-1.78.9A2 2 0 0 0 5 15.24V16a1 1 0 0 0 1 1h12a1 1 0 0 0 1-1v-.76a2 2 0 0 0-1.11-.79l-1.78-.9A2 2 0 0 1 15 10.76V7a1 1 0 0 1 1-1 2 2 0 0 0 0-4H8a2 2 0 0 1 1 1z" />
            </svg>
          </div>
          <div className="flex flex-col flex-1 overflow-hidden pr-3 min-w-0">
            <span className="text-[8px] font-bold uppercase tracking-wider" style={{ color: "var(--accent)" }}>
              Admin Pin
            </span>
            <p className="text-[11px] truncate font-medium leading-tight opacity-90" style={{ color: "var(--foreground)" }}>
              {adminPinnedMsg ? adminPinnedMsg.pesan : "Belum ada sematan"}
            </p>
          </div>
          {uiTab === "admin" && onEditPinned && adminPinnedMsg && (
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                onEditPinned(adminPinnedMsg);
              }}
              className="absolute right-1 top-1/2 -translate-y-1/2 p-1 text-gray-400 hover:text-amber-400 rounded hover:bg-white/5"
              title="Edit Sematan Admin"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="w-3 h-3" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M12 20h9" />
                <path d="M16.5 3.5a2.121 2.121 0 0 1 3 3L7 19l-4 1 1-4L16.5 3.5z" />
              </svg>
            </button>
          )}
        </div>
        <div
          onClick={() => userPinnedMsg && onScrollToMsg?.(userPinnedMsg.id)}
          className={`p-2 rounded-xl transition-all border backdrop-blur-md relative shadow-sm flex items-center gap-2 min-w-0 ${
            userPinnedMsg ? "cursor-pointer active:scale-[0.98]" : "opacity-50"
          }`}
          style={{ backgroundColor: "var(--card-bg, rgba(255,255,255,0.03))", borderColor: "var(--card-border)" }}
        >
          <div className="shrink-0 opacity-90" style={{ color: "var(--accent)" }}>
            <svg xmlns="http://www.w3.org/2000/svg" className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M12 17v5" />
              <path d="M9 10.76a2 2 0 0 1-1.11 1.79l-1.78.9A2 2 0 0 0 5 15.24V16a1 1 0 0 0 1 1h12a1 1 0 0 0 1-1v-.76a2 2 0 0 0-1.11-.79l-1.78-.9A2 2 0 0 1 15 10.76V7a1 1 0 0 1 1-1 2 2 0 0 0 0-4H8a2 2 0 0 1 1 1z" />
            </svg>
          </div>
          <div className="flex flex-col flex-1 overflow-hidden min-w-0">
            <span className="text-[8px] font-bold uppercase tracking-wider truncate max-w-full" style={{ color: "var(--accent)" }}>
              {userPinnedMsg ? userPinnedMsg.username.split("●")[0] : "User Pin"}
            </span>
            <p className="text-[11px] truncate font-medium leading-tight opacity-90" style={{ color: "var(--foreground)" }}>
              {userPinnedMsg ? userPinnedMsg.pesan : "Belum ada sematan"}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

// ==========================================
// KOMPONEN IMAGE POPUP MODAL
// ==========================================
export function ImagePopupModal({
  popupMsg,
  onClose,
  formatMessageTime,
  onPin,
  onDeleteImage,
  authUser,
}: {
  popupMsg: any;
  onClose: () => void;
  formatMessageTime?: (t: any) => string;
  onPin?: (msg: any) => void;
  onDeleteImage?: (msg: any) => void;
  authUser?: string;
}) {
  if (!popupMsg || !popupMsg.image_url) return null;
  const [scale, setScale] = useState(1);
  const [position, setPosition] = useState({ x: 0, y: 0 });
  const [isDragging, setIsDragging] = useState(false);
  const [resolution, setResolution] = useState<string>("Dimuat...");
  const [fileSize, setFileSize] = useState<string>("");
  const dragStart = useRef({ x: 0, y: 0 });
  const touchDist = useRef<number | null>(null);

  useEffect(() => {
    if (popupMsg?.image_url) {
      setFileSize("Cek ukuran...");
      fetch(popupMsg.image_url)
        .then((res) => res.blob())
        .then((blob) => {
          const bytes = blob.size;
          setFileSize(bytes < 1024 ? `${bytes} B` : bytes < 1024 * 1024 ? `${(bytes / 1024).toFixed(1)} KB` : `${(bytes / (1024 * 1024)).toFixed(2)} MB`);
        })
        .catch(() => setFileSize(""));
    }
  }, [popupMsg?.image_url]);

  const handleZoomIn = () => setScale((prev) => Math.min(prev + 0.5, 4));
  const handleZoomOut = () =>
    setScale((prev) => {
      const next = Math.max(prev - 0.5, 1);
      if (next === 1) setPosition({ x: 0, y: 0 });
      return next;
    });
  const handleResetZoom = () => {
    setScale(1);
    setPosition({ x: 0, y: 0 });
  };
  const handleMouseDown = (e: React.MouseEvent) => {
    if (scale > 1) {
      setIsDragging(true);
      dragStart.current = { x: e.clientX - position.x, y: e.clientY - position.y };
    }
  };
  const handleMouseMove = (e: React.MouseEvent) => {
    if (isDragging && scale > 1) setPosition({ x: e.clientX - dragStart.current.x, y: e.clientY - dragStart.current.y });
  };
  const handleMouseUp = () => setIsDragging(false);

  const handleTouchStart = (e: React.TouchEvent) => {
    if (e.touches.length === 2) touchDist.current = Math.hypot(e.touches[0].clientX - e.touches[1].clientX, e.touches[0].clientY - e.touches[1].clientY);
    else if (e.touches.length === 1 && scale > 1) {
      setIsDragging(true);
      dragStart.current = { x: e.touches[0].clientX - position.x, y: e.touches[0].clientY - position.y };
    }
  };
  const handleTouchMove = (e: React.TouchEvent) => {
    if (e.touches.length === 2 && touchDist.current !== null) {
      const dist = Math.hypot(e.touches[0].clientX - e.touches[1].clientX, e.touches[0].clientY - e.touches[1].clientY);
      setScale((prev) => Math.min(Math.max(prev + (dist - touchDist.current!) * 0.01, 1), 4));
      touchDist.current = dist;
    } else if (e.touches.length === 1 && isDragging && scale > 1)
      setPosition({ x: e.touches[0].clientX - dragStart.current.x, y: e.touches[0].clientY - dragStart.current.y });
  };
  const handleTouchEnd = () => {
    touchDist.current = null;
    setIsDragging(false);
  };

  const handleDownload = async (e: React.MouseEvent) => {
    e.stopPropagation();
    try {
      const response = await fetch(popupMsg.image_url),
        blob = await response.blob(),
        url = window.URL.createObjectURL(blob),
        a = document.createElement("a");
      a.href = url;
      a.download = `ipix_image_${popupMsg.id || Date.now()}.jpg`;
      document.body.appendChild(a);
      a.click();
      a.remove();
      window.URL.revokeObjectURL(url);
    } catch (err) {
      window.open(popupMsg.image_url, "_blank");
    }
  };

  return (
    <div className="fixed inset-0 z-[99999] bg-black/90 backdrop-blur-md flex flex-col items-center justify-between p-3 sm:p-4 select-none animate-fadeIn" onClick={onClose}>
      <div className="w-full max-w-4xl flex items-center justify-between z-20 pt-1 pb-2" onClick={(e) => e.stopPropagation()}>
        <div className="flex flex-col">
          <span className="text-xs font-extrabold text-amber-400 drop-shadow">@{popupMsg.username ? popupMsg.username.split("●")[0] : "User"}</span>
          {formatMessageTime && <span className="text-[10px] text-slate-400">{formatMessageTime(popupMsg.created_at)}</span>}
        </div>
        <button
          type="button"
          onClick={(e) => {
            e.stopPropagation();
            onClose();
          }}
          className="w-9 h-9 rounded-full bg-slate-800/90 hover:bg-red-600 text-white flex items-center justify-center font-black text-sm border border-slate-700 shadow-xl active:scale-90 transition-all cursor-pointer"
          title="Tutup Modal Gambar"
        >
          ✕
        </button>
      </div>
      <div
        className="w-full flex-1 max-w-4xl my-auto overflow-hidden flex items-center justify-center cursor-grab active:cursor-grabbing relative"
        onClick={(e) => e.stopPropagation()}
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
        onTouchStart={handleTouchStart}
        onTouchMove={handleTouchMove}
        onTouchEnd={handleTouchEnd}
        onDoubleClick={() => (scale > 1 ? handleResetZoom() : setScale(2.5))}
      >
        <img
          src={popupMsg.image_url}
          alt="Preview"
          onLoad={(e) => setResolution(`${e.currentTarget.naturalWidth}x${e.currentTarget.naturalHeight}`)}
          className="max-h-[70vh] max-w-full object-contain transition-transform duration-75 ease-out rounded-xl shadow-2xl border border-slate-800"
          style={{ transform: `translate(${position.x}px, ${position.y}px) scale(${scale})`, touchAction: "none" }}
          draggable={false}
        />
      </div>
      <div className="z-20 w-full max-w-md flex flex-col items-center gap-2 pb-1" onClick={(e) => e.stopPropagation()}>
        <div className="w-full flex items-center justify-center gap-2 flex-wrap bg-slate-900/90 border border-slate-800 p-2 rounded-2xl backdrop-blur-md shadow-2xl">
          {onPin && (
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                onPin(popupMsg);
                onClose();
              }}
              className="px-3 py-1.5 bg-amber-500/20 hover:bg-amber-500/30 text-amber-300 border border-amber-500/40 text-xs font-bold rounded-xl active:scale-95 transition-all flex items-center gap-1 shrink-0 cursor-pointer"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M12 17v5" />
                <path d="M9 10.76a2 2 0 0 1-1.11 1.79l-1.78.9A2 2 0 0 0 5 15.24V16a1 1 0 0 0 1 1h12a1 1 0 0 0 1-1v-.76a2 2 0 0 0-1.11-1.79l-1.78-.9A2 2 0 0 1 15 10.76V7a1 1 0 0 1 1-1 2 2 0 0 0 0-4H8a2 2 0 0 1 1 1z" />
              </svg>
              {popupMsg.is_pinned ? "Lepas Pin" : "Sematkan"}
            </button>
          )}
          {onDeleteImage && authUser === "Admin●ipix.my.id" && (
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                onDeleteImage(popupMsg);
                onClose();
              }}
              className="px-3 py-1.5 bg-red-600/30 hover:bg-red-600/50 text-red-300 border border-red-500/50 text-xs font-bold rounded-xl active:scale-95 transition-all flex items-center gap-1 shrink-0 cursor-pointer"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <polyline points="3 6 5 6 21 6" />
                <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" />
              </svg>
              Hapus Gambar
            </button>
          )}
          <button type="button" onClick={handleDownload} className="px-3 py-1.5 bg-teal-600 hover:bg-teal-500 text-white text-xs font-bold rounded-xl active:scale-95 transition-all flex items-center gap-1 shrink-0 cursor-pointer">
            <svg xmlns="http://www.w3.org/2000/svg" className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
              <polyline points="7 10 12 15 17 10" />
              <line x1="12" y1="15" x2="12" y2="3" />
            </svg>
            Unduh
          </button>
          <span className="px-2.5 py-1.5 bg-slate-800 border border-slate-700 text-slate-300 text-[11px] font-mono font-semibold rounded-xl shrink-0 flex items-center gap-1.5">
            <span>{resolution}</span>
            {fileSize && (
              <>
                <span className="text-slate-500">•</span>
                <span className="text-teal-400 font-bold">{fileSize}</span>
              </>
            )}
          </span>
          <div className="flex items-center gap-1 bg-slate-800 px-2 py-1 rounded-xl border border-slate-700 shrink-0">
            <button type="button" onClick={handleZoomOut} className="w-6 h-6 flex items-center justify-center bg-slate-700 hover:bg-slate-600 text-white rounded-lg text-xs font-bold cursor-pointer">
              -
            </button>
            <span className="text-[10px] font-mono text-slate-200 min-w-[32px] text-center">{Math.round(scale * 100)}%</span>
            <button type="button" onClick={handleZoomIn} className="w-6 h-6 flex items-center justify-center bg-slate-700 hover:bg-slate-600 text-white rounded-lg text-xs font-bold cursor-pointer">
              +
            </button>
          </div>
          <button type="button" onClick={handleResetZoom} className="px-2.5 py-1.5 bg-amber-600 hover:bg-amber-500 text-white text-xs font-bold rounded-xl active:scale-95 transition-all shrink-0 cursor-pointer">
            Reset
          </button>
        </div>
        <button type="button" onClick={onClose} className="px-6 py-1.5 bg-red-600/80 hover:bg-red-600 text-white text-xs font-bold rounded-full border border-red-500/50 shadow-lg active:scale-95 transition-all cursor-pointer">
          Tutup ✕
        </button>
      </div>
    </div>
  );
}

// ==========================================
// KOMPONEN UTAMA MESSAGEITEM
// ==========================================
export function MessageItem({
  m,
  colType,
  isMinimized,
  activeTab,
  isAdminOnline,
  adminOfflineTime,
  userStatus,
  activeMenuId,
  setActiveMenuId,
  swipingId,
  setSwipingId,
  handleTag,
  handleReply,
  deleteMsg,
  copyToClipboard,
  handleEditLimit,
  editMsg,
  blockUser,
  setPopupMsg,
  handleLongPress,
  applyCensor,
  scrollToMessage,
  formatMessageTime,
  authUser,
  handlePin,
  onOpenGallery,
  userImagesCount,
}: any) {
  const [swipeDelta, setSwipeDelta] = useState(0);
  const [isHorizontalSwipe, setIsHorizontalSwipe] = useState(false);
  const [touchStartX, setTouchStartX] = useState(0);
  const [touchInitialY, setTouchInitialY] = useState(0);
  const imgTimerRef = useRef<NodeJS.Timeout | null>(null),
    imgLongPressFired = useRef(false);
  const textTimerRef = useRef<NodeJS.Timeout | null>(null),
    textLongPressFired = useRef(false);

  const startImgTimer = () => {
    imgLongPressFired.current = false;
    imgTimerRef.current = setTimeout(() => {
      imgLongPressFired.current = true;
      if (typeof window !== "undefined" && navigator.vibrate) {
        try {
          navigator.vibrate(50);
        } catch (err) {}
      }
      setPopupMsg({ ...m, popupMode: "full" });
    }, 400);
  };
  const clearImgTimer = () => {
    if (imgTimerRef.current) {
      clearTimeout(imgTimerRef.current);
      imgTimerRef.current = null;
    }
  };
  const startTextTimer = () => {
    textLongPressFired.current = false;
    textTimerRef.current = setTimeout(() => {
      textLongPressFired.current = true;
      if (typeof window !== "undefined" && navigator.vibrate) {
        try {
          navigator.vibrate(50);
        } catch (err) {}
      }
      setPopupMsg({ ...m, popupMode: "full" });
    }, 400);
  };
  const clearTextTimer = () => {
    if (textTimerRef.current) {
      clearTimeout(textTimerRef.current);
      textTimerRef.current = null;
    }
  };

  const formatOfflineTime = (timeStr: any) => {
    if (!timeStr) return "";
    const str = String(timeStr),
      match = str.match(/(\d+)\s*jam/i);
    if (match) {
      const hours = parseInt(match[1], 10);
      return hours >= 24 ? `${Math.floor(hours / 24)} hari lalu` : str;
    }
    const parsedDate = Date.parse(str);
    if (!isNaN(parsedDate)) {
      const diffInHours = Math.floor((Date.now() - parsedDate) / (1000 * 60 * 60));
      if (diffInHours >= 24) return `${Math.floor(diffInHours / 24)} hari lalu`;
    }
    return str;
  };

  const isMsgAdmin = m.username === "Admin●ipix.my.id",
    isMsgMine = authUser ? m.username === authUser : !isMsgAdmin,
    isRightAligned = isMsgMine;

  const [pillColor, setPillColor] = useState(() =>
    typeof window !== "undefined" && localStorage.getItem("global_enable_custom_chat") === "true"
      ? isMsgAdmin
        ? localStorage.getItem("global_admin_pill_color") || ""
        : localStorage.getItem("global_user_pill_color") || ""
      : ""
  );
  const [bubbleBg, setBubbleBg] = useState(() =>
    typeof window !== "undefined" && localStorage.getItem("global_enable_custom_chat") === "true"
      ? isMsgAdmin
        ? localStorage.getItem("global_admin_bubble_bg") || ""
        : localStorage.getItem("global_user_bubble_bg") || ""
      : ""
  );

  useEffect(() => {
    const handleStorageChange = () => {
      if (typeof window !== "undefined") {
        const isCustomChatEnabled = localStorage.getItem("global_enable_custom_chat") === "true";
        setPillColor(
          isCustomChatEnabled
            ? isMsgAdmin
              ? localStorage.getItem("global_admin_pill_color") || ""
              : localStorage.getItem("global_user_pill_color") || ""
            : ""
        );
        setBubbleBg(
          isCustomChatEnabled
            ? isMsgAdmin
              ? localStorage.getItem("global_admin_bubble_bg") || ""
              : localStorage.getItem("global_user_bubble_bg") || ""
            : ""
        );
      }
    };
    window.addEventListener("storage", handleStorageChange);
    window.addEventListener("globalColorChanged", handleStorageChange);
    return () => {
      window.removeEventListener("storage", handleStorageChange);
      window.removeEventListener("globalColorChanged", handleStorageChange);
    };
  }, [isMsgAdmin]);

  const isEdited = m.is_edited === true || m.edited_by != null || (typeof window !== "undefined" ? parseInt(localStorage.getItem(`edit_count_${m.id}`) || "0") > 0 : false);
  const activeMessageTimestamp = m.updated_at || m.edited_at || m.created_at;

  const handleQuoteClick = (quotedText: string, userTag?: string) => {
    if (typeof window !== "undefined" && navigator.vibrate) {
      try {
        navigator.vibrate([80, 50, 80]);
      } catch (e) {}
    }
    scrollToMessage(quotedText, userTag);
  };
  const triggerEditAction = () => {
    if (editMsg) editMsg(m.id || m);
    setActiveMenuId(null);
    setTimeout(() => {
      const inputEl = document.getElementById("chat-input") as HTMLTextAreaElement;
      if (inputEl) {
        inputEl.focus();
        inputEl.setSelectionRange(inputEl.value.length, inputEl.value.length);
      }
    }, 100);
  };

  if (m.pesan && m.pesan.startsWith("___DELETED")) {
    const isDeletedByAdmin = m.deleted_by_admin === true;
    let deletedNoticeText = m.pesan === "___DELETED_IMAGE___" ? "🚫 Gambar Dihapus" : m.pesan === "___DELETED_BOTH___" ? "🚫 Gambar & Teks Dihapus" : "🚫 Dihapus";
    return (
      <div id={`msg-${m.id}`} className="relative w-full mb-2 z-10 group">
        <div className="bg-white/10 backdrop-blur-md border rounded-xl p-2.5 flex flex-col w-full shadow-sm relative" style={{ borderColor: "var(--card-border)", backgroundColor: "var(--card-bg)" }}>
          {activeTab === "admin" && (
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                deleteMsg(m, false);
              }}
              className="absolute -top-2 -right-2 text-white text-[10px] font-bold w-5 h-5 flex items-center justify-center rounded-full border border-white shadow-md z-20 cursor-pointer hover:bg-red-600 active:scale-95 transition-all"
              style={{ backgroundColor: "var(--accent, #ef4444)" }}
              title="Klik untuk Hapus Permanen dari Database"
            >
              ✕
            </button>
          )}
          <div className="flex items-center gap-2">
            <span className="bg-gray-500/20 text-gray-400 text-[8px] px-1.5 py-0.5 rounded uppercase font-black tracking-tighter">{deletedNoticeText}</span>
            <span className="text-[10px] font-bold" style={{ color: isDeletedByAdmin ? "var(--accent)" : "var(--foreground)" }}>
              oleh {isDeletedByAdmin ? "Admin" : m.username}
            </span>
          </div>
          <div className="text-[8px] opacity-60 mt-1 flex items-center gap-1 font-mono">
            <span>{formatMessageTime ? formatMessageTime(m.created_at) : m.created_at}</span>
          </div>
        </div>
      </div>
    );
  }

  const renderTextWithTags = (t: string) =>
    t.split(/(@\w+)/g).map((part, i) =>
      part.startsWith("@") ? (
        <span
          key={i}
          className={`${
            part.substring(1).toLowerCase() === "admin"
              ? "text-red-500 font-bold"
              : authUser && part.substring(1).toLowerCase() === authUser.split("●")[0].toLowerCase()
              ? "text-blue-400 font-bold"
              : "text-emerald-400 font-bold"
          } cursor-pointer hover:underline`}
          onClick={(e) => {
            e.stopPropagation();
            handleTag(part.substring(1));
          }}
        >
          {part}
        </span>
      ) : (
        <span key={i}>{parseAnimatedEmojis(part)}</span>
      )
    );

  const renderContent = (text: string, isMin: boolean) => {
    if (!text) return null;
    const match = text.match(/^@(\w+)\s\("([\s\S]*?)"\)\s?([\s\S]*)$/);
    const textSize = isMin ? "text-xs sm:text-sm leading-relaxed" : "text-sm leading-relaxed";
    if (match) {
      const [_, user, quotedText, replyText] = match;
      const tagColor =
        user.toLowerCase() === "admin"
          ? "text-red-400 font-bold"
          : authUser && user.toLowerCase() === authUser.split("●")[0].toLowerCase()
          ? "text-blue-400 font-bold"
          : "text-emerald-400 font-bold";
      return (
        <>
          <div
            className="text-[10px] italic p-2 rounded-lg cursor-pointer hover:opacity-100 border-l-2 mb-1.5 transition-colors break-words overflow-hidden shadow-inner"
            style={{ backgroundColor: "rgba(0,0,0,0.15)", borderColor: "var(--accent)", color: "var(--foreground)" }}
            onClick={(e) => {
              e.stopPropagation();
              handleQuoteClick(quotedText, user);
            }}
          >
            <span className={tagColor}>@{user}</span>: "{applyCensor(quotedText).replace(/\s*#\d+$/, "")}"
          </div>
          <div className={`${textSize} break-words overflow-wrap-anywhere`} style={{ color: "var(--foreground)" }}>
            {renderTextWithTags(applyCensor(replyText))}
          </div>
        </>
      );
    }
    return (
      <div className={`${textSize} break-words overflow-wrap-anywhere`} style={{ color: "var(--foreground)" }}>
        {renderTextWithTags(applyCensor(text))}
      </div>
    );
  };

  const activeBorderColor = pillColor === "transparent" ? "transparent" : pillColor || (isMsgAdmin ? "var(--accent)" : isMsgMine ? "var(--accent)" : "var(--card-border)");
  const activeBgColor = bubbleBg === "transparent" ? "transparent" : bubbleBg || "var(--card-bg)";
  const displayCleanUsername = m.username ? m.username.split("●")[0] : "User";

  return (
    <div id={`msg-${m.id}`} className={`relative w-full mb-3 flex ${isRightAligned ? "justify-end" : "justify-start"}`}>
      <style>{`
        @keyframes smoothShake { 0%, 100% { transform: translateX(0); } 20%, 60% { transform: translateX(-6px); } 40%, 80% { transform: translateX(6px); } }
        .animate-smooth-shake { animation: smoothShake 0.4s ease-in-out infinite; }
        .overflow-wrap-anywhere { overflow-wrap: anywhere; word-break: break-word; }
        @keyframes heartbeat { 0%, 100% { transform: scale(1); } 15% { transform: scale(1.28); } 30% { transform: scale(1); } 45% { transform: scale(1.18); } }
        .anim-heartbeat { animation: heartbeat 1.2s infinite ease-in-out; }
        @keyframes wiggle { 0%, 100% { transform: rotate(-8deg); } 50% { transform: rotate(8deg); } }
        .anim-wiggle { animation: wiggle 0.8s infinite ease-in-out alternate; }
        @keyframes bounceSoft { 0%, 100% { transform: translateY(0); } 50% { transform: translateY(-4px); } }
        .anim-bounce-soft { animation: bounceSoft 0.9s infinite ease-in-out; }
        @keyframes pulseGlow { 0%, 100% { transform: scale(1); opacity: 0.9; } 50% { transform: scale(1.22); opacity: 1; filter: drop-shadow(0 0 5px rgba(255,165,0,0.6)); } }
        .anim-pulse-glow { animation: pulseGlow 1.1s infinite ease-in-out; }
        @keyframes shakeSoft { 0%, 100% { transform: translateX(0); } 20% { transform: translateX(-2px) rotate(-3deg); } 60% { transform: translateX(2px) rotate(3deg); } }
        .anim-shake-soft { animation: shakeSoft 0.7s infinite linear; }
        @keyframes pulseSoft { 0%, 100% { transform: scale(1); } 50% { transform: scale(1.12); } }
        .anim-pulse-soft { animation: pulseSoft 1.3s infinite ease-in-out; }
      `}</style>

      {swipingId === m.id && swipeDelta !== 0 && (
        <div className={`absolute inset-0 flex items-center px-4 transition-colors duration-200 bg-transparent rounded-xl ${swipeDelta > 0 ? "justify-start" : "justify-end"}`}>
          {swipeDelta > 0 ? (
            <div className="flex flex-col items-center gap-0.5 text-red-500 opacity-90 drop-shadow-sm">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
              </svg>
              <span className="text-[9px] font-bold uppercase tracking-wider">Hapus</span>
            </div>
          ) : (
            <div className="flex flex-col items-center gap-0.5 opacity-90 drop-shadow-sm" style={{ color: "var(--accent)" }}>
              <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10h10a8 8 0 018 8v2M3 10l6 6m-6-6l6-6" />
              </svg>
              <span className="text-[9px] font-bold uppercase tracking-wider">Balas</span>
            </div>
          )}
        </div>
      )}

      <div
        id={`msg-bubble-${m.id}`}
        className="relative z-10 transition-all duration-200 max-w-[90%] sm:max-w-[80%] min-w-[180px] p-3 border-[1.5px] shadow-sm select-none rounded-2xl"
        onTouchStart={(e) => {
          setTouchStartX(e.touches[0].clientX);
          setTouchInitialY(e.touches[0].clientY);
          setSwipingId(m.id);
          setSwipeDelta(0);
          setIsHorizontalSwipe(false);
        }}
        onTouchMove={(e) => {
          clearImgTimer();
          clearTextTimer();
          if (swipingId !== m.id) return;
          const deltaX = e.touches[0].clientX - touchStartX,
            deltaY = e.touches[0].clientY - touchInitialY;
          if (!isHorizontalSwipe && Math.abs(deltaX) > Math.abs(deltaY) && Math.abs(deltaX) > 10) setIsHorizontalSwipe(true);
          if (isHorizontalSwipe) setSwipeDelta(Math.max(-75, Math.min(75, deltaX > 0 && !(activeTab === "admin" || isMsgMine) ? 0 : deltaX)));
        }}
        onTouchEnd={() => {
          clearImgTimer();
          clearTextTimer();
          if (swipingId === m.id && isHorizontalSwipe) {
            if (swipeDelta > 50) activeTab === "admin" || isMsgMine ? deleteMsg(m, true) : alert("Anda hanya bisa menghapus pesan milik Anda sendiri.");
            else if (swipeDelta < -50) handleReply(m);
          }
          setSwipingId(null);
          setSwipeDelta(0);
          setIsHorizontalSwipe(false);
        }}
        style={{
          transform: swipingId === m.id ? `translateX(${swipeDelta}px)` : "translateX(0px)",
          transition: swipingId === m.id ? "none" : "transform 0.25s cubic-bezier(0.175, 0.885, 0.32, 1.275)",
          backgroundColor: activeBgColor,
          borderColor: activeBorderColor,
        }}
      >
        {m.is_pinned && (
          <div className="absolute -top-3 right-2.5 z-20 pointer-events-none filter drop-shadow-md" title="Pesan Disematkan">
            <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5" viewBox="0 0 24 24" fill="var(--accent)" stroke="var(--background)" strokeWidth="1.2">
              <circle cx="6.5" cy="6.5" r="3" />
              <circle cx="17.5" cy="6.5" r="3" />
              <circle cx="6.5" cy="6.5" r="1.5" fill="var(--background)" />
              <circle cx="17.5" cy="6.5" r="1.5" fill="var(--background)" />
              <circle cx="12" cy="13" r="7" />
              <ellipse cx="12" cy="14.5" rx="2.8" ry="2" fill="var(--background)" />
              <ellipse cx="12" cy="13.8" rx="1.2" ry="0.8" fill="var(--accent)" />
              <circle cx="9.5" cy="11.5" r="0.9" fill="var(--background)" />
              <circle cx="14.5" cy="11.5" r="0.9" fill="var(--background)" />
            </svg>
          </div>
        )}

        {isRightAligned ? (
          <>
            <div className="absolute top-1/2 -translate-y-1/2 -right-[7px] w-0 h-0 border-t-[6px] border-t-transparent border-l-[7px] border-b-[6px] border-b-transparent" style={{ borderLeftColor: activeBorderColor }} />
            <div className="absolute top-1/2 -translate-y-1/2 -right-[5px] w-0 h-0 z-10 border-t-[5px] border-t-transparent border-l-[5px] border-b-[5px] border-b-transparent" style={{ borderLeftColor: activeBgColor }} />
          </>
        ) : (
          <>
            <div className="absolute top-1/2 -translate-y-1/2 -left-[7px] w-0 h-0 border-t-[6px] border-t-transparent border-r-[7px] border-b-[6px] border-b-transparent" style={{ borderRightColor: activeBorderColor }} />
            <div className="absolute top-1/2 -translate-y-1/2 -left-[5px] w-0 h-0 z-10 border-t-[5px] border-t-transparent border-r-[5px] border-b-[5px] border-b-transparent" style={{ borderRightColor: activeBgColor }} />
          </>
        )}

        <div className="flex justify-between items-center gap-2 mb-1.5 w-full">
          <div className="flex items-center gap-1.5 min-w-0 flex-1 overflow-hidden">
            <span
              onClick={(e) => {
                e.stopPropagation();
                handleTag(m.username);
              }}
              className="px-2.5 py-0.5 rounded-full text-[10px] font-black shrink-0 cursor-pointer shadow-sm active:scale-95 transition-transform truncate max-w-full"
              style={{ backgroundColor: pillColor === "transparent" ? "rgba(255,255,255,0.1)" : pillColor || "var(--accent)", color: "var(--background, #ffffff)" }}
              title={displayCleanUsername}
            >
              {displayCleanUsername}
            </span>
          </div>
          <div className="flex items-center shrink-0">
            {isMsgAdmin ? (
              <span className={`px-2 py-0.5 rounded-full bg-black/20 text-[8px] font-bold ${isAdminOnline ? "text-emerald-400" : "opacity-60"}`}>
                {isAdminOnline ? "Online" : formatOfflineTime(adminOfflineTime)}
              </span>
            ) : (
              userStatus[m.username] && (
                <span className={`px-2 py-0.5 rounded-full bg-black/20 text-[8px] font-bold ${userStatus[m.username].online ? "text-emerald-400" : "opacity-60"}`}>
                  {userStatus[m.username].online ? "Online" : formatOfflineTime(userStatus[m.username].offlineTime)}
                </span>
              )
            )}
          </div>
        </div>

        {/* ISI KONTEN PESAN (GAMBAR / VOICE NOTE / TEKS) */}
        <div className="flex flex-col gap-2 my-1">
          {/* 1. GAMBAR */}
          {m.image_url && (
            <div
              className="relative cursor-pointer group shrink-0 w-max z-20"
              onMouseDown={(e) => {
                e.stopPropagation();
                if (e.button === 0) startImgTimer();
              }}
              onMouseMove={clearImgTimer}
              onMouseUp={clearImgTimer}
              onTouchStart={(e) => {
                e.stopPropagation();
                startImgTimer();
              }}
              onTouchMove={clearImgTimer}
              onTouchEnd={clearImgTimer}
              onClick={(e) => {
                e.stopPropagation();
                if (imgLongPressFired.current) {
                  imgLongPressFired.current = false;
                  return;
                }
                setPopupMsg({ ...m, popupMode: "image_only" });
              }}
            >
              <img
                src={m.image_url}
                alt="attachment"
                className={`object-cover rounded-lg border border-black/10 shadow-sm transition-all bg-black/5 group-hover:brightness-90 ${isMinimized ? "w-20 h-20" : "w-28 h-28"}`}
                loading="lazy"
              />
            </div>
          )}

          {/* 2. VOICE NOTE */}
          {m.audio_url && (
            <VoiceNotePlayer audioUrl={m.audio_url} duration={m.duration} />
          )}

          {/* 3. TEKS PESAN */}
          {m.pesan && m.pesan !== "🎤 Voice Note" && (() => {
            const isPage2Private = colType === "private",
              maxLines = isPage2Private ? 4 : 2,
              maxChars = isPage2Private ? 120 : 60,
              paragraphs = m.pesan.split("\n"),
              isLongText = paragraphs.length > maxLines || m.pesan.length > maxChars;
            return (
              <div
                className="min-w-0 flex-1 cursor-pointer"
                onMouseDown={(e) => {
                  e.stopPropagation();
                  if (e.button === 0) startTextTimer();
                }}
                onMouseMove={clearTextTimer}
                onMouseUp={clearTextTimer}
                onTouchStart={(e) => {
                  e.stopPropagation();
                  startTextTimer();
                }}
                onTouchMove={clearTextTimer}
                onTouchEnd={clearTextTimer}
                onClick={(e) => {
                  e.stopPropagation();
                  if (textLongPressFired.current) {
                    textLongPressFired.current = false;
                    return;
                  }
                  setPopupMsg({ ...m, popupMode: "text_only" });
                }}
              >
                <div
                  className={`break-words overflow-wrap-anywhere ${isLongText ? (isPage2Private ? "line-clamp-4" : "line-clamp-2") : ""}`}
                  style={isLongText ? { display: "-webkit-box", WebkitLineClamp: isPage2Private ? 4 : 2, WebkitBoxOrient: "vertical", overflow: "hidden" } : {}}
                >
                  {renderContent(m.pesan, isMinimized)}
                </div>
                {isLongText && (
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      setPopupMsg({ ...m, popupMode: "text_only" });
                    }}
                    className="text-[9px] font-bold mt-1 px-2 py-0.5 rounded shadow-sm transition-colors block"
                    style={{ backgroundColor: "rgba(0,0,0,0.2)", color: "var(--foreground)" }}
                  >
                    Selengkapnya...
                  </button>
                )}
              </div>
            );
          })()}
        </div>

        {isEdited && (
          <div className="mt-1.5 pt-1 border-t border-black/10 flex items-center gap-1.5">
            <span className="text-amber-400 font-bold text-[9px] lowercase">(edited)</span>
            {m.edited_by && (
              <span className="text-[9px] opacity-85 truncate" style={{ color: "var(--foreground)" }}>
                oleh {m.edited_by === "Admin●ipix.my.id" ? "Admin" : m.edited_by.split("●")[0]}
              </span>
            )}
          </div>
        )}

        <div className="mt-1.5 pt-1 border-t border-black/10 flex justify-between items-center gap-2">
          <div className="flex-1 overflow-hidden flex flex-col gap-0.5 text-left min-w-0">
            {userImagesCount > 0 && onOpenGallery && (
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  onOpenGallery(m.username);
                }}
                className="px-2 py-0.5 rounded-full text-[9px] font-extrabold flex items-center w-max shrink-0 active:scale-95 transition-all shadow-xs border"
                style={{
                  backgroundColor: pillColor === "transparent" ? "rgba(255,255,255,0.15)" : pillColor ? `${pillColor}33` : "var(--accent-transparent, rgba(234, 179, 8, 0.2))",
                  color: pillColor && pillColor !== "transparent" ? pillColor : "var(--accent, #eab308)",
                  borderColor: pillColor && pillColor !== "transparent" ? `${pillColor}66` : "var(--accent, rgba(234, 179, 8, 0.4))",
                }}
                title={`Buka Galeri Foto @${displayCleanUsername}`}
              >
                Galeri {userImagesCount}
              </button>
            )}
          </div>
          <div className="flex items-center gap-2 shrink-0">
            <span className="text-[8px] font-bold opacity-60 font-mono">{formatMessageTime ? formatMessageTime(activeMessageTimestamp) : activeMessageTimestamp}</span>
            {!isMinimized && (
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  handleReply(m);
                }}
                className="text-[9px] font-bold underline"
                style={{ color: "var(--accent)" }}
              >
                Balas
              </button>
            )}
            {activeTab === "admin" && (
              <div className="relative flex items-center">
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    setActiveMenuId(activeMenuId !== m.id ? m.id : null);
                  }}
                  className="text-xs font-bold px-1.5 py-0.5 rounded"
                  style={{ color: "var(--foreground)" }}
                >
                  ⋮
                </button>
                {activeMenuId === m.id && (
                  <>
                    <div
                      className="fixed inset-0 z-[90]"
                      onClick={(e) => {
                        e.stopPropagation();
                        setActiveMenuId(null);
                      }}
                    />
                    <div
                      className="absolute right-0 bottom-full mb-2 bg-slate-900 border border-slate-700 shadow-xl rounded-full z-[100] p-1 flex items-center gap-1 min-w-max"
                      onClick={(e) => e.stopPropagation()}
                    >
                      <button type="button" onClick={triggerEditAction} className="px-2.5 py-1 text-[8px] font-bold text-white bg-blue-600 rounded-full">
                        Edit
                      </button>
                      {handlePin && (
                        <button
                          type="button"
                          onClick={() => {
                            handlePin(m);
                            setActiveMenuId(null);
                          }}
                          className="px-2.5 py-1 text-[8px] font-bold text-white bg-amber-600 rounded-full"
                        >
                          {m.is_pinned ? "Lepas Pin" : "Pin"}
                        </button>
                      )}
                      {!isMsgAdmin && (
                        <button
                          type="button"
                          onClick={() => {
                            blockUser(m.username);
                            setActiveMenuId(null);
                          }}
                          className="px-2.5 py-1 text-[8px] font-bold text-white bg-red-600 rounded-full"
                        >
                          Blokir
                        </button>
                      )}
                    </div>
                  </>
                )}
              </div>
            )}
          </div>
        </div>

        {activeTab === "admin" && m.user_browser && (
          <div className="w-full mt-2 pt-1.5 border-t border-black/10 text-[9px] font-mono opacity-70 leading-tight truncate sm:whitespace-normal sm:break-all sm:line-clamp-none" title={m.user_browser}>
            🌐 {m.user_browser}
          </div>
        )}
      </div>
    </div>
  );
}