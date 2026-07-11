// components/MessageItem.tsx
import React from 'react';

export default function MessageItem({ msg, isMinimized, isMine, isPrivate, isAdmin, onReply, onDelete, onEdit, onCopy }: any) {
  const bgBubbleClass = msg.is_private ? 'bg-emerald-50/90' : 'bg-blue-50/90';
  
  return (
    <div id={`msg-${msg.id}`} className={`${bgBubbleClass} p-3 rounded-xl border-b-[2.5px] border-r-[2.5px] shadow-sm w-full relative`}>
      <div className="flex justify-between items-start mb-1">
        <b className="text-[10px] text-blue-700">{msg.username}</b>
        <span className="text-[8px] text-gray-400">{new Date(msg.created_at).toLocaleTimeString()}</span>
      </div>
      
      <div className="mt-1 break-words text-sm text-gray-800">
        {msg.pesan}
      </div>

      <div className="mt-2 pt-2 border-t flex justify-between items-center">
        <button onClick={() => onReply(msg)} className="text-[10px] text-blue-600 underline font-bold">Balas</button>
        {isMine && (
           <button onClick={() => onDelete(msg.id)} className="text-[10px] text-red-500 underline">Hapus</button>
        )}
      </div>
    </div>
  );
}