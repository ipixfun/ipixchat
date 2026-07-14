'use client';
import React, { useRef, useState } from 'react';
// Jalur disesuaikan keluar dari folder components menuju folder app
import { supabase } from '../app/supabaseClient'; 

// Helper Internal: Perbaikan Scroll & Animasi Sorot Pesan
const scrollMsg = (id: number) => {
  const el = document.getElementById(`msg-${id}`);
  const bubble = document.getElementById(`bubble-${id}`);
  if (el && bubble) {
    el.scrollIntoView({ behavior: 'smooth', block: 'center' });
    bubble.classList.add('anim-bg-blink-cream');
    setTimeout(() => bubble.classList.remove('anim-bg-blink-cream'), 1500);
  }
};

// Helper Internal: Sensor Kata Terlarang
const applyCensor = (t: string, words: string[]) => {
  let r = t;
  words.forEach(w => {
    if (w.trim()) r = r.replace(new RegExp(`\\b${w}\\b`, 'gi'), '***');
  });
  return r;
};

const isCensored = (t: string, words: string[]) => 
  words.some(w => w.trim() && t.toLowerCase().includes(w.toLowerCase()));

const copyToClipboard = (t: string, l: string) => {
  navigator.clipboard.writeText(t);
  alert(`${l} disalin!`);
};

interface MessageListProps {
  arr: any[];
  allMessages: any[];
  colType: 'public' | 'private';
  uiTab: 'user' | 'admin';
  currentDeviceId: string | null;
  authUser: string;
  adminOnline: boolean;
  adminOfflineTime: string;
  userStatus: Record<string, any>;
  censorWords: string[];
  fetchData: () => void;
  setReplyTo: (m: any) => void;
  setInputBlink: (b: boolean) => void;
  handleInteraction: (m: 'public' | 'private') => void;
  setSelPriv: (id: string) => void;
  startDrag: (msg: any, x: number, y: number) => void;
  fmtTime: (d: string) => string;
}

export default function MessageList({
  arr, allMessages, colType, uiTab, currentDeviceId, authUser, adminOnline,
  adminOfflineTime, userStatus, censorWords, fetchData, setReplyTo,
  setInputBlink, handleInteraction, setSelPriv, startDrag, fmtTime
}: MessageListProps) {
  
  const [activeMenuId, setActiveMenuId] = useState<number | null>(null);
  const [swipingId, setSwipingId] = useState<number | null>(null);
  const [popupMsg, setPopupMsg] = useState<any>(null);

  // Database Actions Internal
  const deleteMsg = async (id: number, created_at: string, device_id: string, username: string) => {
    if (uiTab === 'admin') {
      await supabase.from('messages').delete().eq('id', id);
    } else {
      const isUnder24h = Date.now() - new Date(created_at).getTime() < 24 * 60 * 60 * 1000;
      const isMsgMine = device_id === currentDeviceId || username === authUser;
      if (isMsgMine && isUnder24h) {
        if (!confirm("Hapus pesan ini?")) return;
        await supabase.from('messages').update({ pesan: '___DELETED___', image_url: null }).eq('id', id);
      } else if (isMsgMine) {
        return alert("Pesan > 24 jam hanya dapat dihapus admin.");
      }
    }
    fetchData();
  };

  const editMsg = async (id: number, currentText: string) => {
    const nt = prompt("Edit:", currentText || "");
    if (nt) {
      await supabase.from('messages').update({ pesan: nt, is_edited: true }).eq('id', id);
      localStorage.setItem(`edit_count_${id}`, '1');
      fetchData();
    }
  };

  const editNama = async (id: number, currentName: string, device_id: string) => {
    const nn = prompt("Nama:", currentName);
    if (nn && isCensored(nn, censorWords)) return alert("Terlarang!");
    if (nn) {
      await Promise.all([
        supabase.from('profiles').update({ username: nn }).eq('device_id', device_id),
        supabase.from('messages').update({ username: nn }).eq('device_id', device_id)
      ]);
      fetchData();
    }
  };

  const blockUser = async (id: string, nm: string) => {
    if (confirm("Blokir user ini?")) {
      await supabase.from('blocked_users').insert([{ device_id: id, username: nm }]);
      fetchData();
    }
  };

  const triggerReply = (m: any) => {
    setReplyTo(m);
    setInputBlink(true);
    setTimeout(() => setInputBlink(false), 800);
  };

  if (arr.length === 0) {
    return <div className="text-center text-white/70 italic mt-10 text-[10px]">Belum ada pesan.</div>;
  }

  return (
    <div className="w-full flex flex-col gap-2 p-2">
      {arr.map((m) => (
        <MessageItem
          key={m.id}
          m={m}
          allMessages={allMessages}
          colType={colType}
          currentDeviceId={currentDeviceId}
          uiTab={uiTab}
          adminOnline={adminOnline}
          adminOfflineTime={adminOfflineTime}
          userStatus={userStatus}
          censorWords={censorWords}
          activeMenuId={activeMenuId}
          setActiveMenuId={setActiveMenuId}
          swipingId={swipingId}
          setSwipingId={setSwipingId}
          setPopupMsg={setPopupMsg}
          triggerReply={triggerReply}
          deleteMsg={deleteMsg}
          editMsg={editMsg}
          editNama={editNama}
          blockUser={blockUser}
          handleInteraction={handleInteraction}
          setSelPriv={setSelPriv}
          startDrag={startDrag}
          fmtTime={fmtTime}
          authUser={authUser}
        />
      ))}

      {/* POPUP MODAL DETAIL PESAN */}
      {popupMsg && popupMsg.pesan !== '___DELETED___' && (
        <div className="fixed inset-0 z-[200] bg-black/70 flex items-center justify-center p-4 backdrop-blur-sm" onClick={() => setPopupMsg(null)}>
          <div className={`w-full max-w-lg bg-white rounded-2xl shadow-2xl p-5 relative max-h-[90vh] flex flex-col ${popupMsg.is_private ? 'border-t-4 border-emerald-500' : 'border-t-4 border-blue-500'}`} onClick={e => e.stopPropagation()}>
            <button type="button" onClick={() => setPopupMsg(null)} className="absolute top-3 right-3 text-gray-400 bg-gray-100 rounded-full w-8 h-8 flex items-center justify-center font-bold active:scale-95">×</button>
            <div className="flex items-center gap-2 border-b pb-3 mb-3">
              <span className={`px-2 py-1 rounded-full text-white text-xs font-bold shadow-sm ${popupMsg.username === 'Admin●ipix.my.id' ? 'bg-red-600' : (popupMsg.device_id === currentDeviceId || popupMsg.username === authUser ? 'bg-blue-600' : 'bg-gray-700')}`}>{popupMsg.username}</span>
              <span className="text-[10px] text-gray-400">{fmtTime(popupMsg.created_at)}</span>
            </div>
            
            <div className="overflow-y-auto pr-2 pb-2 text-sm text-black flex flex-col break-words break-all whitespace-pre-wrap">
              {popupMsg.image_url && (
                <img src={popupMsg.image_url} alt="Uploaded Image" className="w-full h-auto max-h-[50vh] object-contain rounded-lg border mb-3 shadow-sm bg-gray-50" />
              )}
              {popupMsg.pesan && applyCensor(popupMsg.pesan, censorWords)}
            </div>

            <div className="flex flex-wrap items-center justify-end gap-2 mt-4 pt-3 border-t border-gray-100">
              {popupMsg.image_url && (
                <button 
                  type="button" 
                  onClick={async (e) => {
                    e.stopPropagation();
                    try {
                      const response = await fetch(popupMsg.image_url);
                      const blob = await response.blob();
                      const url = window.URL.createObjectURL(blob);
                      const a = document.createElement('a');
                      a.href = url;
                      a.download = `ipix_image_${popupMsg.id}.jpg`;
                      document.body.appendChild(a);
                      a.click(); a.remove();
                      window.URL.revokeObjectURL(url);
                    } catch (err) { window.open(popupMsg.image_url, '_blank'); }
                  }} 
                  className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white text-[10px] sm:text-xs font-black rounded-full shadow-md active:scale-95 transition-all flex items-center gap-1"
                >
                  📥 Unduh Gambar
                </button>
              )}
              <button type="button" onClick={(e) => { e.stopPropagation(); copyToClipboard(popupMsg.pesan, 'Pesan'); }} className="px-3 py-1.5 bg-blue-600 text-white text-[10px] sm:text-xs font-black rounded-full shadow-md">📋 Salin</button>
              {((uiTab === 'admin') || (popupMsg.device_id === currentDeviceId && popupMsg.username !== 'Admin●ipix.my.id')) && (
                <button 
                  type="button" 
                  onClick={async (e) => {
                    e.stopPropagation();
                    const targetMsg = popupMsg; // Simpan referensi objek
                    const oldText = targetMsg.pesan;
                    
                    const newText = window.prompt("Edit pesan:", oldText);
                    setPopupMsg(null); // Tutup popup setelah dialog prompt

                    if (newText && newText.trim() !== oldText) {
                      if (uiTab === 'admin') {
                        await supabase.from('messages').update({ pesan: newText.trim(), is_edited: true }).eq('id', targetMsg.id);
                      } else {
                        const c = parseInt(localStorage.getItem(`edit_${targetMsg.id}`) || '0');
                        if (c >= 2) return alert("Batas 2x Edit");
                        await supabase.from('messages').update({ pesan: newText.trim(), is_edited: true }).eq('id', targetMsg.id);
                        localStorage.setItem(`edit_${targetMsg.id}`, (c+1).toString());
                        localStorage.setItem(`edit_count_${targetMsg.id}`, '1');
                      }
                      fetchData();
                    }
                  }} 
                  className="px-3 py-1.5 bg-amber-500 text-white text-[10px] sm:text-xs font-black rounded-full shadow-md"
                >
                  ✏️ Edit
                </button>
              )}
              <button type="button" onClick={(e) => { e.stopPropagation(); triggerReply(popupMsg); setPopupMsg(null); }} className="px-3 py-1.5 bg-indigo-600 text-white text-[10px] sm:text-xs font-black rounded-full shadow-md">💬 Balas</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

interface MessageItemProps {
  m: any;
  allMessages: any[];
  colType: 'public' | 'private';
  currentDeviceId: string | null;
  uiTab: 'user' | 'admin';
  adminOnline: boolean;
  adminOfflineTime: string;
  userStatus: Record<string, any>;
  censorWords: string[];
  activeMenuId: number | null;
  setActiveMenuId: (id: number | null) => void;
  swipingId: number | null;
  setSwipingId: (id: number | null) => void;
  setPopupMsg: (m: any) => void;
  triggerReply: (m: any) => void;
  deleteMsg: (id: number, created_at: string, device_id: string, username: string) => void;
  editMsg: (id: number, currentText: string) => void;
  editNama: (id: number, currentName: string, device_id: string) => void;
  blockUser: (id: string, nm: string) => void;
  handleInteraction: (m: 'public' | 'private') => void;
  setSelPriv: (id: string) => void;
  startDrag: (msg: any, x: number, y: number) => void;
  fmtTime: (d: string) => string;
  authUser: string;
}

function MessageItem({
  m, allMessages, colType, currentDeviceId, uiTab, adminOnline, adminOfflineTime,
  userStatus, censorWords, activeMenuId, setActiveMenuId, swipingId, setSwipingId,
  setPopupMsg, triggerReply, deleteMsg, editMsg, editNama, blockUser,
  handleInteraction, setSelPriv, startDrag, fmtTime, authUser
}: MessageItemProps) {
  const [swipeDelta, setSwipeDelta] = useState(0);
  const [isHorizontalSwipe, setIsHorizontalSwipe] = useState(false);
  const [touchStartX, setTouchStartX] = useState(0);
  const [touchInitialY, setTouchInitialY] = useState(0);
  const longPressTimer = useRef<NodeJS.Timeout | null>(null);

  const shortBrowser = m.user_browser ? m.user_browser.split('(')[0].trim() + (m.user_browser.includes('(') ? ` (${m.user_browser.split('(')[1].split(')')[0]})` : '') : 'Unknown Browser';
  const isMsgAdmin = m.username === 'Admin●ipix.my.id';
  const isMsgMine = m.device_id === currentDeviceId || m.username === authUser;
  const isEdited = m.is_edited || (typeof window !== 'undefined' ? parseInt(localStorage.getItem(`edit_count_${m.id}`) || '0') > 0 : false);

  if (m.pesan === '___DELETED___') {
    return (
      <div id={`msg-${m.id}`} className="relative w-full flex justify-start mb-2 z-10">
        <div className="bg-gray-100/80 border border-gray-200 border-dashed rounded-md p-1.5 flex flex-col w-full max-w-[180px] shadow-sm ml-1">
          <div className="flex items-center gap-1">
            <span className="bg-gray-300 text-gray-600 text-[8px] px-1 rounded font-bold">🚫 Dihapus</span>
          </div>
          <div className="text-[8px] text-gray-400 mt-1 font-mono">{fmtTime(m.created_at)}</div>
        </div>
      </div>
    );
  }

  const isPrivateAndNotAdmin = m.is_private && !isMsgAdmin;
  const borderThicknessClass = 'border-b-[3px] border-r-[3px] border-t-[1px] border-l-[1px] border-t-black/5 border-l-black/5';
  const borderColorClass = isMsgAdmin ? 'border-r-red-600' : isPrivateAndNotAdmin ? 'border-b-emerald-500 border-r-emerald-500' : isMsgMine ? 'border-b-blue-500 border-r-blue-500' : 'border-b-gray-400 border-r-gray-400';
  const bgBubbleClass = m.is_private ? 'bg-emerald-50/95' : 'bg-blue-50/95';

  const renderContent = (text: string) => {
    if (!text) return null;
    const match = text.match(/^@(\w+)\s\("(.*?)"\)\s?(.*)$/);
    if (match) {
      const [_, user, quotedText, replyText] = match;
      return (
        <>
          <div className="text-[9px] text-gray-500 italic bg-white/70 p-1 rounded cursor-pointer hover:bg-gray-200 border-l-2 mb-1 border-blue-500" 
               onClick={(e) => { 
                 e.stopPropagation(); 
                 const matchedTarget = allMessages.find(x => x.pesan.includes(quotedText));
                 if (matchedTarget) scrollMsg(matchedTarget.id);
               }}>
            <span className="font-bold">@{user}</span>: "{applyCensor(quotedText, censorWords)}"
          </div>
          <div className="text-[11px] leading-tight text-gray-800 break-words">{applyCensor(replyText, censorWords)}</div>
        </>
      );
    }
    return <div className="text-[11px] leading-tight text-gray-800 break-words">{applyCensor(text, censorWords)}</div>;
  };

  return (
    <div id={`msg-${m.id}`} className="relative w-full">
      {swipingId === m.id && swipeDelta !== 0 && (
        <div className={`absolute inset-0 flex items-center px-4 rounded-md transition-colors ${swipeDelta > 0 ? 'bg-blue-500 justify-start' : 'bg-red-500 justify-end'}`}>
          {swipeDelta > 0 ? <span className="text-white text-xs font-bold">💬 Balas</span> : <span className="text-white text-xs font-bold">🗑️ Hapus</span>}
        </div>
      )}

      <div 
        id={`bubble-${m.id}`}
        className={`relative z-10 ${bgBubbleClass} p-1.5 rounded-md ${borderThicknessClass} shadow-sm w-full select-none ${borderColorClass}`}
        onMouseDown={(e) => {
          if (e.button !== 0) return;
          const startX = e.clientX;
          const startY = e.clientY;
          
          if (longPressTimer.current) clearTimeout(longPressTimer.current);
          longPressTimer.current = setTimeout(() => { 
            setPopupMsg(m); 
          }, 500);
          
          // Memulai fitur drag drop admin/user
          startDrag(m, startX, startY);
        }}
        onMouseMove={() => { if (longPressTimer.current) clearTimeout(longPressTimer.current); }}
        onMouseUp={() => { if (longPressTimer.current) clearTimeout(longPressTimer.current); }}
        onTouchStart={(e) => {
          setTouchStartX(e.touches[0].clientX); 
          setTouchInitialY(e.touches[0].clientY);
          setSwipingId(m.id); 
          setSwipeDelta(0); 
          setIsHorizontalSwipe(false);
          
          if (longPressTimer.current) clearTimeout(longPressTimer.current);
          longPressTimer.current = setTimeout(() => { 
            setPopupMsg(m); 
            setSwipingId(null); 
          }, 500);
        }}
        onTouchMove={(e) => {
          const deltaX = e.touches[0].clientX - touchStartX; 
          const deltaY = e.touches[0].clientY - touchInitialY;
          
          // Membatalkan long press/popup jika user sedang asik menggulir atau menyeret ke bawah
          if (Math.abs(deltaX) > 10 || Math.abs(deltaY) > 10) {
            if (longPressTimer.current) clearTimeout(longPressTimer.current);
          }

          if (swipingId !== m.id) return;
          if (!isHorizontalSwipe && Math.abs(deltaX) > Math.abs(deltaY) && Math.abs(deltaX) > 10) {
            setIsHorizontalSwipe(true);
          }
          
          if (isHorizontalSwipe) {
            let allowedDelta = deltaX;
            // Hanya izinkan swipe kiri (hapus) untuk admin / pengirim asli
            if (allowedDelta < 0 && !(uiTab === 'admin' || isMsgMine)) allowedDelta = 0;
            setSwipeDelta(Math.max(-75, Math.min(75, allowedDelta)));
          }
        }}
        onTouchEnd={() => {
          if (longPressTimer.current) clearTimeout(longPressTimer.current);
          if (swipingId === m.id && isHorizontalSwipe) {
            if (swipeDelta > 50) {
              triggerReply(m); // Kanan memicu Balas
            } else if (swipeDelta < -50) {
              deleteMsg(m.id, m.created_at, m.device_id, m.username); // Kiri memicu Hapus
            }
          }
          setSwipingId(null); setSwipeDelta(0); setIsHorizontalSwipe(false);
        }}
      >
        <div className="flex justify-between items-start mb-0.5">
          <b className={`px-2 py-0.5 rounded-full text-white text-[8px] cursor-pointer ${isMsgAdmin ? 'bg-red-600' : isMsgMine ? 'bg-blue-600' : 'bg-gray-700'}`}>
            {m.username}
          </b>
          <span className="text-[8px] text-gray-500">
            {isMsgAdmin ? (adminOnline ? 'Online' : adminOfflineTime) : (userStatus[m.username]?.online ? 'Online' : userStatus[m.username]?.offlineTime || '')}
          </span>
        </div>

        {m.image_url && (
          <img src={m.image_url} alt="attachment" className="mt-1 w-20 h-20 object-cover rounded border bg-black/5" loading="lazy" />
        )}
        
        <div className="mt-1 min-w-0 break-words whitespace-pre-wrap">
          {renderContent(m.pesan)}
        </div>
        
        <div className="mt-1 pt-1 border-t border-black/10 flex justify-between items-end gap-2">
          <div className="flex-1 flex flex-col gap-0.5 text-[8px] text-gray-400">
            {isEdited && <span className="text-yellow-600 font-bold">(edited)</span>}
            {uiTab === 'admin' && (
              <>
                <span className="text-blue-600 font-mono break-all" onClick={() => copyToClipboard(m.device_id, 'Device ID')}>ID: {m.device_id}</span>
                <span className="text-orange-600 truncate max-w-[150px]">🌐 {shortBrowser}</span>
              </>
            )}
          </div>
          
          <div className="flex items-center gap-1.5 shrink-0 text-[9px]">
            <span className="text-[8px] text-gray-400">{fmtTime(m.created_at)}</span>
            
            {/* Tombol Balas hanya muncul jika di kotak pesan Private */}
            {colType === 'private' && (
              <button type="button" onClick={() => triggerReply(m)} className="font-bold underline text-blue-600">Balas</button>
            )}
            
            {uiTab === 'admin' && (
              <div className="relative">
                <button type="button" onClick={(e) => { e.stopPropagation(); setActiveMenuId(activeMenuId === m.id ? null : m.id); }} className="text-gray-500 font-bold px-1">⋮</button>
                {activeMenuId === m.id && (
                  <>
                    <div className="fixed inset-0 z-20" onClick={() => setActiveMenuId(null)} />
                    <div className="absolute right-0 bottom-full mb-1 w-40 bg-white border border-gray-200 shadow-xl rounded-lg z-30 py-1 flex flex-col">
                      <button type="button" onClick={() => { editMsg(m.id, m.pesan); setActiveMenuId(null); }} className="px-3 py-1.5 text-left text-[11px] font-bold text-blue-600 hover:bg-gray-50">✏️ Edit Teks</button>
                      <button type="button" onClick={() => { editNama(m.id, m.username, m.device_id); setActiveMenuId(null); }} className="px-3 py-1.5 text-left text-[11px] font-bold text-purple-600 hover:bg-gray-50">👤 Edit Nama</button>
                      <button type="button" onClick={() => { deleteMsg(m.id, m.created_at, m.device_id, m.username); setActiveMenuId(null); }} className="px-3 py-1.5 text-left text-[11px] font-bold text-red-600 hover:bg-gray-50">🗑️ Hapus</button>
                      {!isMsgAdmin && (
                        <>
                          <button type="button" onClick={() => { blockUser(m.device_id, m.username); setActiveMenuId(null); }} className="px-3 py-1.5 text-left text-[11px] font-bold text-orange-600 hover:bg-gray-50">🚫 Blokir</button>
                          <button type="button" onClick={() => { handleInteraction('private'); setSelPriv(m.device_id); setActiveMenuId(null); }} className="px-3 py-1.5 text-left text-[11px] font-bold text-emerald-600 hover:bg-gray-50">🔒 Private</button>
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
  );
}