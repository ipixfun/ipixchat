// components/MessageItem.tsx
import React from 'react';

export default function MessageItem({ 
  msg, 
  isMinimized, 
  isMine, 
  isPrivate,
  isAdmin,
  onReply,
  onDelete,
  // Tambahkan props lain yang dibutuhkan (seperti handleEdit, dll)
}: any) {
  
  // Masukkan logika styling dan rendering yang ada di dalam map(m => ...) sebelumnya di sini
  const bgBubbleClass = msg.is_private ? 'bg-emerald-50/90' : 'bg-blue-50/90';
  
  return (
    <div id={`msg-${msg.id}`} className={`${bgBubbleClass} p-3 rounded-xl border-b-[2.5px] border-r-[2.5px] shadow-sm w-full`}>
      {/* Pindahkan kode tampilan bubble pesan Anda di sini */}
      <div className="flex justify-between items-start">
        <b className="text-[10px] text-blue-700">{msg.username}</b>
        <span className="text-[8px] text-gray-400">{new Date(msg.created_at).toLocaleTimeString()}</span>
      </div>
      <div className="mt-1 break-words">{msg.pesan}</div>
      
      {/* Area Tombol (Balas, Edit, dll) */}
      <div className="mt-2 pt-2 border-t flex justify-between">
         <button onClick={() => onReply(msg)} className="text-xs text-blue-600 underline">Balas</button>
      </div>
    </div>
  );
}
