'use client';
import React, { useRef, useState } from 'react';

export default function MessageItem({
  m, colType, isMinimized, currentDeviceId, activeTab, isAdminOnline, adminOfflineTime,
  userStatus, isTwoColumnMode, activeMenuId, setActiveMenuId, longPressId, setLongPressId,
  swipingId, setSwipingId, handleTag, handleReply, deleteMsg, copyToClipboard, handleEditLimit,
  editMsg, editNama, blockUser, inviteToPrivate, setPopupMsg, applyCensor, scrollToMessage, formatMessageTime
}: any) {
  const [swipeDelta, setSwipeDelta] = useState(0);
  const [isHorizontalSwipe, setIsHorizontalSwipe] = useState(false);
  const [touchStartX, setTouchStartX] = useState(0);
  const [touchInitialY, setTouchInitialY] = useState(0);
  const longPressTimer = useRef<NodeJS.Timeout | null>(null);

  const shortBrowser = m.user_browser ? m.user_browser.split('(')[0].trim() + (m.user_browser.includes('(') ? ` (${m.user_browser.split('(')[1].split(')')[0]})` : '') : 'Unknown Browser';
  const isMsgAdmin = m.username === 'Admin●ipix.my.id';
  const isMsgMine = m.device_id === currentDeviceId;
  const isEdited = typeof window !== 'undefined' ? parseInt(localStorage.getItem(`edit_count_${m.id}`) || '0') > 0 : false;

  const borderColorClass = isMsgAdmin ? 'border-red-500' : isMsgMine ? (colType === 'private' ? 'border-emerald-500' : 'border-blue-500') : 'border-gray-300';
  const borderThicknessClass = isMsgAdmin ? 'border-b-[1px] border-r-[1px]' : 'border-b-[2.5px] border-r-[2.5px]';
  const bgBubbleClass = m.is_private ? 'bg-emerald-50/90' : 'bg-blue-50/90';

  const renderContent = (text: string, isMin: boolean) => {
    const match = text.match(/^@(\w+)\s\("(.*?)"\)\s?(.*)$/);
    const textSize = isMin ? 'text-[11px] leading-tight' : 'text-sm leading-relaxed';
    if (match) {
      const [_, user, quotedText, replyText] = match;
      return (
        <>
          <div className={`text-[9px] text-gray-500 italic bg-gray-100 ${isMin ? 'p-1.5' : 'p-2'} rounded cursor-pointer hover:bg-gray-200 border-l-2 mb-1 ${colType === 'private' ? 'border-emerald-500' : 'border-blue-500'}`} onClick={(e) => { e.stopPropagation(); scrollToMessage(quotedText); }}>
            <span className="font-bold">@{user}</span>: "{applyCensor(quotedText)}"
          </div>
          <div className={`${textSize} text-gray-800 break-words`}>{applyCensor(replyText)}</div>
        </>
      );
    }
    return <div className={`${textSize} text-gray-800 break-words`}>{applyCensor(text)}</div>;
  };

  return (
    <div id={`msg-${m.id}`} className={`${bgBubbleClass} ${isMinimized ? 'p-1.5 rounded-md' : 'p-3 rounded-xl'} ${borderThicknessClass} shadow-sm w-full select-none relative ${borderColorClass}`}
      onMouseDown={() => { longPressTimer.current = setTimeout(() => { setLongPressId(m.id); if (navigator.vibrate) navigator.vibrate(50); }, 500); }}
      onMouseMove={() => { if (longPressTimer.current) { clearTimeout(longPressTimer.current); longPressTimer.current = null; } }}
      onMouseUp={() => { if (longPressTimer.current) { clearTimeout(longPressTimer.current); longPressTimer.current = null; } }}
      onTouchStart={(e) => { 
        setTouchStartX(e.touches[0].clientX); setTouchInitialY(e.touches[0].clientY); 
        setSwipingId(m.id); setSwipeDelta(0); setIsHorizontalSwipe(false); 
        longPressTimer.current = setTimeout(() => { setLongPressId(m.id); if (navigator.vibrate) navigator.vibrate(50); }, 500);
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
      style={{ transform: swipingId === m.id ? `translateX(${swipeDelta}px)` : 'translateX(0px)', transition: swipingId === m.id ? 'none' : 'transform 0.3s cubic-bezier(0.175, 0.885, 0.32, 1.275)' }}>
      
      {swipingId === m.id && Math.abs(swipeDelta) > 15 && (
        <div className={`absolute top-1/2 -translate-y-1/2 font-bold text-xs pointer-events-none transition-opacity flex items-center justify-center ${swipeDelta > 0 ? '-left-8 text-red-500' : '-right-8 text-blue-500'}`}>
          {swipeDelta > 0 ? <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 stroke-current opacity-80" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg> : '↩'}
        </div>
      )}
      
      {longPressId === m.id && (
        <div className="absolute inset-0 bg-white/90 backdrop-blur-sm z-20 rounded-xl flex items-center justify-center gap-3 shadow-sm border border-gray-200 animate-fade-in" onClick={(e) => { e.stopPropagation(); setLongPressId(null); }}>
          <button className="bg-gray-800 hover:bg-gray-700 text-white px-5 py-2 rounded-full text-xs font-bold shadow-md active:scale-95 transition-all" onClick={(e) => { e.stopPropagation(); copyToClipboard(m.pesan, 'Pesan'); setLongPressId(null); }}>Salin Teks</button>
          {(activeTab !== 'admin' && isMsgMine) && <button className="bg-blue-600 hover:bg-blue-700 text-white px-5 py-2 rounded-full text-xs font-bold shadow-md active:scale-95 transition-all" onClick={(e) => { e.stopPropagation(); handleEditLimit(m); setLongPressId(null); }}>Edit Teks</button>}
        </div>
      )}

      <div className={`flex justify-between items-start ${isMinimized ? 'mb-0.5' : 'mb-1'}`}>
        <div className="flex items-center gap-1.5 flex-wrap">
          <b onClick={() => handleTag(m.username)} className={`${isMsgAdmin ? 'text-red-600' : 'text-blue-700'} ${isMinimized ? 'text-[8px]' : 'text-[10px]'} cursor-pointer hover:underline`}>{m.username}</b>
          {isMsgAdmin ? <span className={`text-[8px] px-1 rounded ${isAdminOnline ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-500'}`}>{isAdminOnline ? 'Online' : adminOfflineTime}</span> : userStatus[m.username] && <span className={`text-[8px] px-1 rounded ${userStatus[m.username].online ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-500'}`}>{userStatus[m.username].online ? 'Online' : userStatus[m.username].offlineTime}</span>}
          {m.is_private && !isMinimized && <span className={`text-[10px] ${isMsgAdmin ? 'text-red-500' : 'text-emerald-500'}`}>🔒 Private</span>}
          {isEdited && <span className="text-yellow-600 text-[9px] italic font-medium ml-1">(edited)</span>}
        </div>
        <span className="text-[8px] text-gray-400 font-medium">{formatMessageTime(m.created_at)}</span>
      </div>
      
      <div className={`mt-1 min-w-0 break-words whitespace-pre-wrap ${isTwoColumnMode ? 'line-clamp-4 cursor-pointer hover:bg-black/5 transition-colors rounded' : ''}`} onClick={(e) => { if (isTwoColumnMode) { e.stopPropagation(); setPopupMsg(m); } }}>
        {renderContent(m.pesan, isMinimized)}
      </div>
      
      <div className={`${isMinimized ? 'mt-1 pt-1' : 'mt-2 pt-2'} border-t border-gray-200 flex justify-between gap-3 ${activeTab === 'admin' ? 'items-end' : 'items-center'}`}>
        <div className="flex-1 overflow-hidden flex flex-col gap-1 justify-end">
          {m.is_private && isMinimized && <span className={`text-[8px] font-bold ${isMsgAdmin ? 'text-red-500' : 'text-emerald-500'}`}>🔒 Private</span>}
          {activeTab === 'admin' && (
            <div className="flex flex-col gap-1 text-[8px] text-gray-400 font-sans w-full">
              <span className="text-blue-600 font-mono cursor-pointer hover:underline break-all leading-tight" onClick={() => copyToClipboard(m.device_id, 'Device ID')}>ID: {m.device_id}</span>
              <span className="text-orange-600 truncate font-medium max-w-[200px]" title={m.user_browser || ''}>🌐 {shortBrowser}</span>
            </div>
          )}
        </div>
        
        <div className="flex items-center gap-2 text-[10px] shrink-0 pb-0.5">
          {!isMinimized && <button onClick={() => handleReply(m)} className={`font-bold underline mr-1 transition-colors ${colType === 'private' ? 'text-emerald-600 hover:text-emerald-700' : 'text-blue-600 hover:text-blue-700'}`}>Balas</button>}
          
          {/* Menu Dropdown Admin yang Baru */}
          {activeTab === 'admin' && (
            <div className="relative flex items-center">
              {activeMenuId === m.id && (
                <div className="absolute right-6 bottom-0 bg-white border border-gray-200 shadow-xl rounded-lg px-4 py-3 flex flex-col items-start gap-3 z-30 animate-fade-in whitespace-nowrap bg-opacity-95 backdrop-blur-sm" onClick={(e) => e.stopPropagation()}>
                  <button onClick={() => { editMsg(m.id); setActiveMenuId(null); }} className="text-blue-600 font-bold hover:underline">✏️ Edit Teks</button>
                  <button onClick={() => { editNama(m.id); setActiveMenuId(null); }} className="text-purple-600 font-bold hover:underline">👤 Edit Nama</button>
                  <button onClick={() => { deleteMsg(m.id); setActiveMenuId(null); }} className="text-red-600 font-bold hover:underline">🗑️ Hapus Pesan</button>
                  <button onClick={() => { copyToClipboard(m.pesan, 'Pesan'); setActiveMenuId(null); }} className="text-gray-700 font-bold hover:underline">📋 Salin Teks</button>
                  
                  {!m.username.includes('Admin') && (
                    <>
                      <hr className="w-full border-gray-200 my-0.5" />
                      <button onClick={() => { blockUser(m.device_id, m.username); setActiveMenuId(null); }} className="text-gray-500 font-bold hover:underline">🚫 Blokir User</button>
                      <button onClick={() => { inviteToPrivate(m.device_id, m.username); setActiveMenuId(null); }} className="text-emerald-600 font-bold hover:underline">🔒 Chat Private</button>
                    </>
                  )}
                </div>
              )}
              <button onClick={(e) => { e.stopPropagation(); setActiveMenuId(activeMenuId === m.id ? null : m.id); }} className="text-gray-500 hover:text-gray-800 text-base font-bold px-1 rounded hover:bg-gray-100 transition-colors">⋮</button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}