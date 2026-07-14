'use client';
import React, { useRef, useState } from 'react';

export default function MessageItem({
  m, colType, isMinimized, currentDeviceId, activeTab, isAdminOnline, adminOfflineTime,
  userStatus, activeMenuId, setActiveMenuId, longPressId, setLongPressId,
  swipingId, setSwipingId, handleTag, handleReply, deleteMsg, copyToClipboard, handleEditLimit,
  editMsg, editNama, blockUser, inviteToPrivate, setPopupMsg, applyCensor, scrollToMessage, formatMessageTime, authUser, startDrag
}: any) {
  const [swipeDelta, setSwipeDelta] = useState(0);
  const [isHorizontalSwipe, setIsHorizontalSwipe] = useState(false);
  const [touchStartX, setTouchStartX] = useState(0);
  const [touchInitialY, setTouchInitialY] = useState(0);
  const longPressTimer = useRef<NodeJS.Timeout | null>(null);

  const shortBrowser = m.user_browser ? m.user_browser.split('(')[0].trim() + (m.user_browser.includes('(') ? ` (${m.user_browser.split('(')[1].split(')')[0]})` : '') : 'Unknown Browser';
  const isMsgAdmin = m.username === 'Admin●ipix.my.id';
  const isMsgMine = m.device_id === currentDeviceId || m.username === authUser;
  
  // Edited status diubah agar mengecek properti dari database (m.is_edited) agar tersinkronisasi untuk seluruh user
  const isEdited = m.is_edited || (typeof window !== 'undefined' ? parseInt(localStorage.getItem(`edit_count_${m.id}`) || '0') > 0 : false);

  // Render Tombstone jika pesan terhapus
  if (m.pesan === '___DELETED___') {
    return (
      <div id={`msg-${m.id}`} className="relative w-full flex justify-start mb-2 z-10"
           onTouchStart={(e) => {
              setTouchStartX(e.touches[0].clientX); setTouchInitialY(e.touches[0].clientY); 
              setSwipingId(m.id); setSwipeDelta(0); setIsHorizontalSwipe(false); 
           }}
           onTouchMove={(e) => {
              if (swipingId !== m.id) return;
              const deltaX = e.touches[0].clientX - touchStartX; const deltaY = e.touches[0].clientY - touchInitialY;
              if (!isHorizontalSwipe && Math.abs(deltaX) > Math.abs(deltaY) && Math.abs(deltaX) > 10) setIsHorizontalSwipe(true);
              if (isHorizontalSwipe) {
                let allowedDelta = deltaX;
                if (allowedDelta > 0 && activeTab !== 'admin') allowedDelta = 0; 
                setSwipeDelta(Math.max(-75, Math.min(75, allowedDelta)));
              }
           }}
           onTouchEnd={() => {
              if (swipingId === m.id && isHorizontalSwipe) {
                if (swipeDelta > 50 && activeTab === 'admin') { 
                  if (window.confirm("Hapus permanen history dari user ini?")) deleteMsg(m.id); 
                }
              }
              setSwipingId(null); setSwipeDelta(0); setIsHorizontalSwipe(false); 
           }}
           style={{ transform: swipingId === m.id ? `translateX(${swipeDelta}px)` : 'translateX(0px)', transition: swipingId === m.id ? 'none' : 'transform 0.3s cubic-bezier(0.175, 0.885, 0.32, 1.275)' }}>
          
          <div className="bg-gray-100/80 border border-gray-200 border-dashed rounded-lg p-2.5 flex flex-col w-full max-w-[200px] shadow-sm ml-1">
             <div className="flex items-center gap-1.5">
                <span className="bg-gray-300 text-gray-600 text-[9px] px-1.5 py-0.5 rounded font-bold shadow-sm">🚫 Dihapus</span>
                <span className="text-[10px] text-gray-500 font-medium">oleh user</span>
             </div>
             <div className="text-[9px] text-gray-400 mt-1.5 flex items-center gap-1 font-mono bg-white/50 w-max px-1 rounded">
                📅 {formatMessageTime(m.created_at)}
             </div>
          </div>
      </div>
    );
  }

  // DINAMIS OUTLINE & BORDER THICKNESS
  // 1. Admin: Outline tebal hanya di sebelah kanan (border-r-[3px])
  // 2. User Private: Outline tebal di bawah & kanan dengan warna hijau (emerald-500)
  // 3. Lainnya: Outline biru (jika milik sendiri) atau abu-abu (milik user lain)
  const isPrivateAndNotAdmin = m.is_private && !isMsgAdmin;

  const borderThicknessClass = isMsgAdmin 
    ? 'border-r-[3px] border-b-[1px] border-t-[1px] border-l-[1px] border-t-black/5 border-l-black/5 border-b-black/5' 
    : 'border-b-[3px] border-r-[3px] border-t-[1px] border-l-[1px] border-t-black/5 border-l-black/5';

  const borderColorClass = isMsgAdmin 
    ? 'border-r-red-600' 
    : isPrivateAndNotAdmin
      ? 'border-b-emerald-500 border-r-emerald-500'
      : isMsgMine 
        ? 'border-b-blue-500 border-r-blue-500' 
        : 'border-b-gray-400 border-r-gray-400';

  const bgBubbleClass = m.is_private ? 'bg-emerald-50/95' : 'bg-blue-50/95';

  const renderContent = (text: string, isMin: boolean) => {
    if (!text) return null;
    
    const match = text.match(/^@(\w+)\s\("(.*?)"\)\s?(.*)$/);
    const textSize = isMin ? 'text-[11px] leading-tight' : 'text-sm leading-relaxed';
    if (match) {
      const [_, user, quotedText, replyText] = match;
      return (
        <>
          <div className={`text-[9px] text-gray-500 italic bg-white/70 ${isMin ? 'p-1.5' : 'p-2'} rounded cursor-pointer hover:bg-gray-200 border-l-2 mb-1 ${colType === 'private' ? 'border-emerald-500' : 'border-blue-500'}`} onClick={(e) => { e.stopPropagation(); scrollToMessage(quotedText); }}>
            <span className="font-bold">@{user}</span>: "{applyCensor(quotedText)}"
          </div>
          <div className={`${textSize} text-gray-800 break-words`}>{applyCensor(replyText)}</div>
        </>
      );
    }
    return <div className={`${textSize} text-gray-800 break-words`}>{applyCensor(text)}</div>;
  };

  return (
    <div id={`msg-${m.id}`} className="relative w-full">
      {swipingId === m.id && swipeDelta !== 0 && (
        <div className={`absolute inset-0 flex items-center px-5 transition-colors duration-200 ${isMinimized ? 'rounded-md' : 'rounded-xl'} ${swipeDelta > 0 ? 'bg-red-500 justify-start' : (colType === 'private' ? 'bg-emerald-500 justify-end' : 'bg-blue-500 justify-end')}`}>
          {swipeDelta > 0 ? (
            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-white opacity-90" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
            </svg>
          ) : (
            <div className="flex items-center gap-1 text-white font-bold text-sm opacity-90">
              <span>Balas</span>
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10h10a8 8 0 018 8v2M3 10l6 6m-6-6l6-6" />
              </svg>
            </div>
          )}
        </div>
      )}

      <div 
        className={`relative z-10 ${bgBubbleClass} ${isMinimized ? 'p-1.5 rounded-md' : 'p-3 rounded-xl'} ${borderThicknessClass} shadow-sm w-full select-none ${borderColorClass}`}
        onMouseDown={(e) => { 
          if (e.button !== 0) return;
          longPressTimer.current = setTimeout(() => { 
            setLongPressId(null);
            startDrag(m, e.clientX, e.clientY);
            if (navigator.vibrate) navigator.vibrate(50); 
          }, 350); 
        }}
        onMouseMove={() => { if (longPressTimer.current) { clearTimeout(longPressTimer.current); longPressTimer.current = null; } }}
        onMouseUp={() => { if (longPressTimer.current) { clearTimeout(longPressTimer.current); longPressTimer.current = null; } }}
        onTouchStart={(e) => { 
          setTouchStartX(e.touches[0].clientX); setTouchInitialY(e.touches[0].clientY); 
          setSwipingId(m.id); setSwipeDelta(0); setIsHorizontalSwipe(false); 
          longPressTimer.current = setTimeout(() => { 
            setLongPressId(null);
            setSwipingId(null);
            startDrag(m, e.touches[0].clientX, e.touches[0].clientY); 
            if (navigator.vibrate) navigator.vibrate(50); 
          }, 350);
        }}
        onTouchMove={(e) => {
          if (longPressTimer.current) { clearTimeout(longPressTimer.current); longPressTimer.current = null; }
          if (swipingId !== m.id) return;
          const deltaX = e.touches[0].clientX - touchStartX; const deltaY = e.touches[0].clientY - touchInitialY;
          if (!isHorizontalSwipe && Math.abs(deltaX) > Math.abs(deltaY) && Math.abs(deltaX) > 10) setIsHorizontalSwipe(true);
          if (isHorizontalSwipe) {
            let allowedDelta = deltaX;
            if (allowedDelta > 0 && !(activeTab === 'admin' || isMsgMine)) allowedDelta = 0; 
            setSwipeDelta(Math.max(-75, Math.min(75, allowedDelta)));
          }
        }}
        onTouchEnd={() => { 
          if (longPressTimer.current) { clearTimeout(longPressTimer.current); longPressTimer.current = null; }
          if (swipingId === m.id && isHorizontalSwipe) {
            if (swipeDelta > 50) { 
              const isUnder24h = Date.now() - new Date(m.created_at).getTime() < 24 * 60 * 60 * 1000;
              if (activeTab === 'admin' || (isMsgMine && isUnder24h)) { if (window.confirm("Hapus pesan ini?")) deleteMsg(m.id); } 
              else if (isMsgMine) alert("Pesan > 24 jam hanya dapat dihapus admin.");
            } else if (swipeDelta < -50) handleReply(m);
          }
          setSwipingId(null); setSwipeDelta(0); setIsHorizontalSwipe(false); 
        }}
        style={{ transform: swipingId === m.id ? `translateX(${swipeDelta}px)` : 'translateX(0px)', transition: swipingId === m.id ? 'none' : 'transform 0.3s cubic-bezier(0.175, 0.885, 0.32, 1.275)' }}
      >
        
        {longPressId === m.id && (
          <div className="absolute inset-0 bg-white/90 backdrop-blur-sm z-20 rounded-xl flex items-center justify-center gap-3 shadow-sm border border-gray-200 animate-fade-in" onClick={(e) => { e.stopPropagation(); setLongPressId(null); }}>
            <button type="button" className="bg-gray-800 hover:bg-gray-700 text-white px-5 py-2 rounded-full text-xs font-bold shadow-md active:scale-95 transition-all" onClick={(e) => { e.stopPropagation(); copyToClipboard(m.pesan, 'Pesan'); setLongPressId(null); }}>Salin Teks</button>
            {(activeTab !== 'admin' && isMsgMine) && <button type="button" className="bg-blue-600 hover:bg-blue-700 text-white px-5 py-2 rounded-full text-xs font-bold shadow-md active:scale-95 transition-all" onClick={(e) => { e.stopPropagation(); handleEditLimit(m); setLongPressId(null); }}>Edit Teks</button>}
          </div>
        )}

        {/* BAGIAN ATAS: Nama di kiri, Online/offline status di pojok kanan atas */}
        <div className={`flex justify-between items-start ${isMinimized ? 'mb-0.5' : 'mb-1'}`}>
          <div className="flex items-center gap-1.5 flex-wrap">
            <b onClick={() => handleTag(m.username)} className={`px-2 py-0.5 rounded-full text-white cursor-pointer shadow-sm active:scale-95 transition-transform ${isMsgAdmin ? 'bg-red-600' : isMsgMine ? 'bg-blue-600' : 'bg-gray-700'} ${isMinimized ? 'text-[8px]' : 'text-[10px]'}`}>
              {m.username}
            </b>
            {m.is_private && !isMinimized && <span className={`text-[10px] ${isMsgAdmin ? 'text-red-500' : 'text-emerald-600'}`}>🔒 Private</span>}
          </div>
          
          {/* PINDAH KE POJOK KANAN ATAS */}
          <div className="text-right shrink-0">
            {isMsgAdmin ? (
              <span className={`px-1.5 py-0.5 rounded bg-white/60 text-[8px] ${isAdminOnline ? 'text-green-600 font-bold' : 'text-gray-500'}`}>
                {isAdminOnline ? 'Online' : adminOfflineTime}
              </span>
            ) : (
              userStatus[m.username] && (
                <span className={`px-1.5 py-0.5 rounded bg-white/60 text-[8px] ${userStatus[m.username].online ? 'text-green-600 font-bold' : 'text-gray-500'}`}>
                  {userStatus[m.username].online ? 'Online' : userStatus[m.username].offlineTime}
                </span>
              )
            )}
          </div>
        </div>

        {m.image_url && (
          <div 
            className="mt-2 mb-1 relative cursor-zoom-in group w-max"
            onClick={(e) => { e.stopPropagation(); setPopupMsg(m); }}
          >
            <img 
              src={m.image_url} 
              alt="attachment" 
              className={`object-cover rounded-lg border border-black/10 shadow-sm transition-all bg-black/5 group-hover:brightness-90 ${isMinimized ? 'w-20 h-20' : 'w-28 h-28 sm:w-36 sm:h-36'}`} 
              loading="lazy"
            />
          </div>
        )}
        
        {m.pesan && (
          <div className="mt-1 min-w-0 break-words whitespace-pre-wrap cursor-pointer hover:bg-black/5 transition-colors rounded" onClick={(e) => { e.stopPropagation(); setPopupMsg(m); }}>
            {renderContent(m.pesan, isMinimized)}
          </div>
        )}
        
        {/* BAGIAN BAWAH: (edited) di pojok kiri bawah, Hari tanggal jam di pojok kanan bawah */}
        <div className={`${isMinimized ? 'mt-1 pt-1' : 'mt-2 pt-2'} border-t border-black/10 flex justify-between gap-3 ${activeTab === 'admin' ? 'items-end' : 'items-center'}`}>
          
          {/* POJOK KIRI BAWAH: edited & private info */}
          <div className="flex-1 overflow-hidden flex flex-col gap-1 justify-end items-start text-left">
            {isEdited && <span className="text-yellow-600 font-black text-[9px] lowercase bg-yellow-100/70 px-1 rounded shadow-sm">(edited)</span>}
            {m.is_private && isMinimized && <span className={`text-[8px] font-bold ${isMsgAdmin ? 'text-red-500' : 'text-emerald-600'}`}>🔒 Private</span>}
            {activeTab === 'admin' && (
              <div className="flex flex-col gap-1 text-[8px] text-gray-400 font-sans w-full">
                <span className="text-blue-600 font-mono cursor-pointer hover:underline break-all leading-tight" onClick={() => copyToClipboard(m.device_id, 'Device ID')}>ID: {m.device_id}</span>
                <span className="text-orange-600 truncate font-medium max-w-[200px]" title={m.user_browser || ''}>🌐 {shortBrowser}</span>
              </div>
            )}
          </div>
          
          {/* POJOK KANAN BAWAH: Waktu dan tombol aksi */}
          <div className="flex flex-col items-end gap-1 shrink-0 pb-0.5">
            <span className="text-[8px] text-gray-400 font-bold bg-white/50 px-1 rounded">
              {formatMessageTime(m.created_at)}
            </span>
            <div className="flex items-center gap-2 text-[10px]">
              {!isMinimized && <button type="button" onClick={() => handleReply(m)} className={`font-bold underline mr-1 transition-colors ${colType === 'private' ? 'text-emerald-600 hover:text-emerald-700' : 'text-blue-600 hover:text-blue-700'}`}>Balas</button>}
              
              {activeTab === 'admin' && (
                <div className="relative">
                  <button type="button" onClick={(e) => { e.stopPropagation(); setActiveMenuId(activeMenuId === m.id ? null : m.id); }} className="text-gray-500 hover:text-gray-800 text-base font-bold px-2 py-1 rounded hover:bg-white/50 transition-colors">⋮</button>
                  {activeMenuId === m.id && (
                    <>
                      <div className="fixed inset-0 z-20" onClick={() => setActiveMenuId(null)} />
                      <div className="absolute right-0 bottom-full mb-2 w-48 bg-white border border-gray-200 shadow-2xl rounded-xl z-30 py-2 flex flex-col gap-0.5 animate-fade-in">
                        <button type="button" onClick={() => { editMsg(m.id); setActiveMenuId(null); }} className="px-4 py-2 text-left text-xs font-bold text-blue-600 hover:bg-gray-50">✏️ Edit Teks</button>
                        <button type="button" onClick={() => { editNama(m.id); setActiveMenuId(null); }} className="px-4 py-2 text-left text-xs font-bold text-purple-600 hover:bg-gray-50">👤 Edit Nama</button>
                        <button type="button" onClick={() => { deleteMsg(m.id); setActiveMenuId(null); }} className="px-4 py-2 text-left text-xs font-bold text-red-600 hover:bg-gray-50">🗑️ Hapus Pesan</button>
                        <button type="button" onClick={() => { copyToClipboard(m.pesan, 'Pesan'); setActiveMenuId(null); }} className="px-4 py-2 text-left text-xs font-bold text-gray-700 hover:bg-gray-50">📋 Salin Teks</button>
                        {!isMsgAdmin && (
                          <>
                            <div className="h-px bg-gray-200 my-1 mx-2" />
                            <button type="button" onClick={() => { blockUser(m.device_id, m.username); setActiveMenuId(null); }} className="px-4 py-2 text-left text-xs font-bold text-orange-600 hover:bg-gray-50">🚫 Blokir User</button>
                            <button type="button" onClick={() => { inviteToPrivate(m.device_id, m.username); setActiveMenuId(null); }} className="px-4 py-2 text-left text-xs font-bold text-emerald-600 hover:bg-gray-50">🔒 Chat Private</button>
                          </>
                        )}
                      </div>
                    </>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}