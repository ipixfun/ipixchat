"use client";
import React, { useRef } from "react";

export const MessageItem = ({
  index,
  m,
  colType,
  isMinimized,
  currentDeviceId, // Tetap di-pass dari parent untuk berjaga-jaga tapi tidak menentukan hak akses edit/hapus
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
  editNama,
  blockUser,
  inviteToPrivate,
  setPopupMsg,
  handleLongPress,
  approveImage,
  applyCensor,
  scrollToMessage,
  formatMessageTime,
  authUser, // PROPS PENTING: digunakan untuk mengecek identitas
}: any) => {
  const isDeleted = m.pesan === "___DELETED___";
  
  // PERUBAHAN UTAMA: Memeriksa kepemilikan pesan hanya berdasarkan USERNAME (authUser)
  const isMine = m.username === authUser;
  const isAdminMsg = m.username === "Admin●ipix.my.id";
  const amIAdmin = activeTab === "admin";
  
  const userStat = userStatus[m.username] || { online: false, offlineTime: "N/A" };
  const showUserOnline = m.username !== "Admin●ipix.my.id" ? userStat.online : isAdminOnline;
  
  const touchStartRef = useRef<number | null>(null);
  const pressTimer = useRef<NodeJS.Timeout | null>(null);

  const handleTouchStartLocal = (e: React.TouchEvent | React.MouseEvent) => {
    if (isDeleted) return;
    const clientX = "touches" in e ? e.touches[0].clientX : (e as React.MouseEvent).clientX;
    touchStartRef.current = clientX;
    
    pressTimer.current = setTimeout(() => {
      handleLongPress(m);
      setSwipingId(null);
    }, 500);
  };

  const handleTouchMoveLocal = (e: React.TouchEvent | React.MouseEvent) => {
    if (isDeleted || touchStartRef.current === null) return;
    const clientX = "touches" in e ? e.touches[0].clientX : (e as React.MouseEvent).clientX;
    const delta = clientX - touchStartRef.current;
    
    if (Math.abs(delta) > 10 && pressTimer.current) {
      clearTimeout(pressTimer.current);
      pressTimer.current = null;
    }

    if (delta > 50) {
      setSwipingId(m.id);
    } else if (delta < -50) {
      setSwipingId(m.id);
    }
  };

  const handleTouchEndLocal = () => {
    if (pressTimer.current) {
      clearTimeout(pressTimer.current);
      pressTimer.current = null;
    }
    
    if (swipingId === m.id) {
      if (isMine || amIAdmin) {
        deleteMsg(m, true);
      } else {
        handleReply(m);
      }
    }
    touchStartRef.current = null;
    setTimeout(() => {
      if (swipingId === m.id) setSwipingId(null);
    }, 200);
  };

  return (
    <div 
      id={`msg-bubble-${m.id}`}
      className={`relative w-full rounded-2xl p-2.5 sm:p-3 shadow-md transition-all duration-300 ${
        swipingId === m.id ? (isMine ? "translate-x-12 opacity-50" : "-translate-x-12 opacity-50") : "translate-x-0 opacity-100"
      } ${
        isDeleted ? "bg-gray-800/40 border border-gray-700/30 backdrop-blur-sm" : 
        isMine ? (colType === "public" ? "bg-blue-600/90 text-white rounded-br-sm" : "bg-emerald-600/90 text-white rounded-br-sm") : 
        (colType === "public" ? "bg-white/10 text-gray-100 rounded-bl-sm backdrop-blur-md" : "bg-white/10 text-emerald-50 rounded-bl-sm backdrop-blur-md")
      }`}
      onTouchStart={handleTouchStartLocal}
      onTouchMove={handleTouchMoveLocal}
      onTouchEnd={handleTouchEndLocal}
      onMouseDown={handleTouchStartLocal}
      onMouseMove={handleTouchMoveLocal}
      onMouseUp={handleTouchEndLocal}
      onMouseLeave={handleTouchEndLocal}
    >
      <div className="flex justify-between items-start mb-1 gap-2">
        <div className="flex items-center gap-1.5 flex-wrap">
          <span 
            onClick={(e) => {
              e.stopPropagation();
              if(!isDeleted) handleTag(m.username);
            }}
            className={`text-[10px] sm:text-xs font-bold px-2 py-0.5 rounded-full cursor-pointer shadow-sm ${
              isAdminMsg ? "bg-red-500 text-white" : "bg-black/30 text-white"
            }`}
          >
            {m.username.split("●")[0]}
          </span>
          {!isDeleted && (
            <span className="flex items-center gap-1">
              <span className={`w-1.5 h-1.5 rounded-full ${showUserOnline ? "bg-green-400 shadow-[0_0_4px_#4ade80] animate-pulse" : "bg-gray-400"}`}></span>
            </span>
          )}
        </div>
        
        <div className="flex items-center gap-2">
          {!isDeleted && m.is_pinned && <span className="text-[10px]" title="Pesan Disematkan">📌</span>}
          
          <button 
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              setActiveMenuId(activeMenuId === m.id ? null : m.id);
            }}
            className="w-5 h-5 flex items-center justify-center bg-black/20 rounded-full hover:bg-black/40 text-white active:scale-95"
          >
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-3 h-3">
              <path fillRule="evenodd" d="M12.53 16.28a.75.75 0 01-1.06 0l-7.5-7.5a.75.75 0 011.06-1.06L12 14.69l6.97-6.97a.75.75 0 111.06 1.06l-7.5 7.5z" clipRule="evenodd" />
            </svg>
          </button>
        </div>
      </div>

      {activeMenuId === m.id && !isDeleted && (
        <div className="absolute right-0 top-8 z-50 bg-white/95 backdrop-blur-xl rounded-xl shadow-2xl border border-gray-200 py-1.5 min-w-[140px] text-gray-800 text-[11px] sm:text-xs font-semibold overflow-hidden animate-in fade-in zoom-in-95 duration-100">
          <div className="px-3 py-1 text-[9px] text-gray-400 border-b border-gray-100 mb-1">Pilihan</div>
          
          <button onClick={() => { setActiveMenuId(null); copyToClipboard(m.pesan, "Pesan"); }} className="w-full text-left px-4 py-2 hover:bg-blue-50 flex items-center gap-2">
            📋 Salin
          </button>
          
          <button onClick={() => { setActiveMenuId(null); handleReply(m); }} className="w-full text-left px-4 py-2 hover:bg-blue-50 flex items-center gap-2">
            💬 Balas
          </button>
          
          <button onClick={() => { setActiveMenuId(null); setPopupMsg(m); }} className="w-full text-left px-4 py-2 hover:bg-blue-50 flex items-center gap-2">
            🔍 Pop-up View
          </button>

          {(amIAdmin || isMine) && (
            <button onClick={() => { setActiveMenuId(null); amIAdmin ? editMsg(m.id) : handleEditLimit(m); }} className="w-full text-left px-4 py-2 hover:bg-amber-50 text-amber-600 flex items-center gap-2">
              ✏️ Edit Teks
            </button>
          )}

          {amIAdmin && (
            <>
              <div className="h-px bg-gray-100 my-1"></div>
              <button onClick={() => { setActiveMenuId(null); inviteToPrivate(m.device_id); }} className="w-full text-left px-4 py-2 hover:bg-purple-50 text-purple-600 flex items-center gap-2">
                🔒 Private Chat
              </button>
              <button onClick={() => { setActiveMenuId(null); blockUser(m.device_id, m.username); }} className="w-full text-left px-4 py-2 hover:bg-red-50 text-red-600 flex items-center gap-2">
                🚫 Block User
              </button>
            </>
          )}

          {(isMine || amIAdmin) && (
            <>
              <div className="h-px bg-gray-100 my-1"></div>
              <button onClick={() => { setActiveMenuId(null); deleteMsg(m); }} className="w-full text-left px-4 py-2 hover:bg-red-50 text-red-600 flex items-center gap-2">
                🗑️ Hapus
              </button>
            </>
          )}
        </div>
      )}

      {isDeleted ? (
        <div className="text-gray-400 text-xs italic opacity-70 flex items-center gap-1.5">
          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="w-3.5 h-3.5">
            <path fillRule="evenodd" d="M8.75 1A2.75 2.75 0 006 3.75v.443c-.795.077-1.584.176-2.365.298a.75.75 0 10.23 1.482l.149-.022.841 10.518A2.75 2.75 0 007.596 19h4.807a2.75 2.75 0 002.742-2.53l.841-10.52.149.023a.75.75 0 00.23-1.482A41.03 41.03 0 0014 4.193V3.75A2.75 2.75 0 0011.25 1h-2.5zM10 4c.84 0 1.673.025 2.5.075V3.75c0-.69-.56-1.25-1.25-1.25h-2.5c-.69 0-1.25.56-1.25 1.25v.325C8.327 4.025 9.16 4 10 4z" clipRule="evenodd" />
          </svg>
          {m.deleted_by_admin ? "Dihapus oleh admin" : "Pesan dihapus"}
        </div>
      ) : (
        <>
          {m.image_url && (
            <div className="mt-1 mb-2 relative group overflow-hidden rounded-lg">
              <img 
                src={m.image_url} 
                alt="Upload" 
                onClick={() => setPopupMsg(m)}
                className={`w-full max-h-[250px] object-cover cursor-zoom-in transition-all duration-300 ${!m.is_approved && !amIAdmin && m.username !== "Admin●ipix.my.id" ? "blur-xl scale-110" : "hover:brightness-90"}`} 
              />
              {!m.is_approved && m.username !== "Admin●ipix.my.id" && (
                <div className="absolute inset-0 flex flex-col items-center justify-center bg-black/40 backdrop-blur-sm pointer-events-none gap-2">
                  <span className="text-[10px] font-bold text-white bg-black/60 px-2 py-1 rounded-full text-center">Menunggu Persetujuan Admin</span>
                  {amIAdmin && (
                    <button 
                      onClick={(e) => { e.stopPropagation(); approveImage(m.id); }}
                      className="mt-1 bg-emerald-500 hover:bg-emerald-600 text-white text-[10px] px-3 py-1 rounded-full font-bold shadow-lg pointer-events-auto active:scale-95"
                    >
                      Setujui Gambar
                    </button>
                  )}
                </div>
              )}
            </div>
          )}
          
          <div className="text-xs sm:text-sm font-medium leading-relaxed break-words break-all whitespace-pre-wrap">
            {applyCensor(m.pesan)}
          </div>
        </>
      )}

      <div className={`text-[9px] mt-1.5 flex items-center justify-end gap-1.5 ${isMine ? "text-blue-100/70" : "text-white/40"}`}>
        {m.is_edited && !isDeleted && (
          <span className="italic opacity-80">(diedit)</span>
        )}
        <span className="font-mono">{formatMessageTime(m.created_at)}</span>
      </div>
    </div>
  );
};