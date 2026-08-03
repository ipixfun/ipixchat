"use client";
import { useState, useEffect } from "react";

interface AdminProps {
  privateUsers: any[];
  setSelectedPrivateUser: (username: string) => void;
  formatMessageTime: (time: any) => string;
  onDeleteAllMsgs?: (username: string) => void;
  onUpdatePin?: (username: string, newPin: string) => void;
  onUpdateUsername?: (oldUsername: string, newUsername: string) => void;
}

export default function Admin({
  privateUsers, setSelectedPrivateUser, formatMessageTime, onDeleteAllMsgs, onUpdatePin, onUpdateUsername
}: AdminProps) {
  const [readBaselines, setReadBaselines] = useState<Record<string, number>>({});
  const [promptState, setPromptState] = useState<{
    isOpen: boolean; title: string; value: string; onConfirm: (val: string) => void;
  }>({ isOpen: false, title: "", value: "", onConfirm: () => {} });

  useEffect(() => {
    setReadBaselines((prev) => {
      let hasChanges = false;
      const nextBaselines = { ...prev };
      privateUsers.forEach((user: any) => {
        const currentTotal = user.totalUserMsgs || 0;
        if (nextBaselines[user.username] === undefined || currentTotal < nextBaselines[user.username]) {
          nextBaselines[user.username] = Math.max(0, currentTotal - (user.count || 0));
          hasChanges = true;
        }
      });
      return hasChanges ? nextBaselines : prev;
    });
  }, [privateUsers]);

  const handleUserClick = (user: any) => {
    setSelectedPrivateUser(user.username);
    setReadBaselines((prev) => ({ ...prev, [user.username]: user.totalUserMsgs || 0 }));
  };

  const handleEditPin = (e: React.MouseEvent, user: any) => {
    e.stopPropagation();
    const currentPin = user.pin || "";
    setPromptState({
      isOpen: true,
      title: `Edit PIN untuk user (${user.username}):`,
      value: currentPin,
      onConfirm: (val) => {
        if (val.trim() !== "" && val.trim() !== currentPin) {
          onUpdatePin && onUpdatePin(user.username, val.trim());
        }
      }
    });
  };

  const handleEditUsername = (e: React.MouseEvent, user: any) => {
    e.stopPropagation();
    const currentName = user.username || "";
    setPromptState({
      isOpen: true,
      title: `Edit Username untuk (${currentName}):`,
      value: currentName,
      onConfirm: (val) => {
        if (val.trim() !== "" && val.trim() !== currentName) {
          onUpdateUsername && onUpdateUsername(currentName, val.trim());
        }
      }
    });
  };

  return (
    <div className="space-y-3 p-3">
      {privateUsers.map((user: any, index: number) => {
        const identifier = user.username || `anonymous-${index}`;
        const baseline = readBaselines[user.username];
        let displayCount = baseline !== undefined ? Math.max(0, (user.totalUserMsgs || 0) - baseline) : (user.count || 0);
        const hasUnread = displayCount > 0;

        return (
          <div key={identifier} onClick={() => handleUserClick(user)} className="bg-white p-4 rounded-2xl shadow-sm hover:shadow-md cursor-pointer transition-all flex flex-col group gap-2 border" style={{ borderColor: "var(--card-border)" }}>
            <div className="flex justify-between items-center w-full gap-2">
              <div className="flex items-center gap-1.5 min-w-0 flex-1">
                <span className="font-bold text-blue-700 text-sm sm:text-base tracking-tight truncate max-w-[210px] sm:max-w-[280px]" title={user.username || 'User Tanpa Nama'}>{user.username || 'User Tanpa Nama'}</span>
                <button onClick={(e) => handleEditUsername(e, user)} className="text-gray-400 hover:text-blue-600 p-0.5 rounded transition-colors text-xs shrink-0" title="Edit Username">✏️</button>
              </div>
              <div className={`text-[10px] sm:text-xs font-medium whitespace-nowrap shrink-0 text-right ${hasUnread ? 'text-emerald-600 font-semibold' : 'text-gray-400'}`}>{formatMessageTime(user.last_active)}</div>
            </div>

            <div className="flex justify-between items-center w-full gap-2 my-0.5">
              <div className={`text-xs font-medium truncate flex-1 min-w-0 ${hasUnread ? 'text-emerald-600 font-semibold' : 'text-gray-500'}`}>{user.last_message === "___DELETED___" ? "(Pesan dihapus)" : user.last_message || "Mengirim Gambar"}</div>
              {(user.umur || user.berat) && (
                <div className="flex gap-1.5 shrink-0 justify-end items-center">
                  {user.umur && <span className="text-[9px] font-bold bg-gray-100 text-gray-700 px-1.5 py-0.5 rounded border border-gray-200 whitespace-nowrap">U: {user.umur}</span>}
                  {user.berat && <span className="text-[9px] font-bold bg-gray-100 text-gray-700 px-1.5 py-0.5 rounded border border-gray-200 whitespace-nowrap">B: {user.berat}</span>}
                </div>
              )}
            </div>

            <div className="flex justify-between items-end pt-2 border-t border-gray-100 w-full gap-2">
              <div className="flex gap-1.5 items-center">
                <button onClick={(e) => handleEditPin(e, user)} className="bg-amber-50 hover:bg-amber-500 text-amber-700 hover:text-white text-[9px] font-black px-2 py-1 rounded shadow-sm border border-amber-200 hover:border-amber-500 transition-colors uppercase tracking-wider flex items-center gap-1" title="Klik untuk edit PIN user">🔑 PIN: {user.pin || '---'}</button>
                <button onClick={(e) => { e.stopPropagation(); onDeleteAllMsgs && onDeleteAllMsgs(user.username); }} className="bg-orange-50 hover:bg-orange-600 text-orange-600 hover:text-white text-[9px] font-black px-2 py-1 rounded shadow-sm border border-orange-200 hover:border-orange-600 transition-colors uppercase tracking-wider">Delete All</button>
              </div>
              <div className="flex gap-1.5 items-center shrink-0">
                {hasUnread ? <span className="bg-emerald-500 text-white text-[9px] font-bold px-2 py-1 rounded-full shadow-sm whitespace-nowrap animate-pulse">{displayCount} Baru</span> : <span className="bg-gray-400 text-white text-[9px] font-bold px-2 py-1 rounded-full shadow-sm whitespace-nowrap">0</span>}
                <span className="bg-blue-500 text-white text-[9px] font-bold px-2 py-1 rounded-full shadow-sm whitespace-nowrap" title="Total pesan dikirim oleh user">👤 {user.totalUserMsgs || 0}</span>
                <span className="bg-red-500 text-white text-[9px] font-bold px-2 py-1 rounded-full shadow-sm whitespace-nowrap" title="Total balasan admin ke user">⭐ {user.totalAdminMsgs || 0}</span>
              </div>
            </div>
          </div>
        );
      })}

      {/* POPUP PROMPT INPUT MODERN */}
      {promptState.isOpen && (
        <div className="fixed inset-0 z-[10000] bg-black/80 backdrop-blur-md flex items-center justify-center p-4 animate-fadeIn select-none" onClick={() => setPromptState((p) => ({ ...p, isOpen: false }))}>
          <div className="w-full max-w-sm bg-slate-900 border border-slate-800 rounded-3xl p-6 shadow-2xl flex flex-col gap-4 animate-scaleUp text-white" onClick={(e) => e.stopPropagation()}>
            <div className="w-10 h-10 rounded-2xl bg-blue-500/10 border border-blue-500/20 flex items-center justify-center text-blue-400 text-xl shadow-inner">✏️</div>
            <h3 className="text-sm font-bold text-slate-200 tracking-wide">{promptState.title}</h3>
            <input
              type="text" autoFocus value={promptState.value}
              onChange={(e) => setPromptState((p) => ({ ...p, value: e.target.value }))}
              onKeyDown={(e) => {
                if (e.key === "Enter") {
                  promptState.onConfirm(promptState.value);
                  setPromptState((p) => ({ ...p, isOpen: false }));
                }
              }}
              className="w-full bg-slate-950 border border-slate-700 focus:border-blue-500 rounded-xl px-4 py-2.5 text-sm text-white focus:outline-none transition-all"
            />
            <div className="grid grid-cols-2 gap-2.5 w-full mt-1">
              <button type="button" onClick={() => setPromptState((p) => ({ ...p, isOpen: false }))} className="w-full py-2.5 px-4 bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white text-xs font-bold rounded-xl transition-all active:scale-95 border border-slate-700">Batal</button>
              <button type="button" onClick={() => { promptState.onConfirm(promptState.value); setPromptState((p) => ({ ...p, isOpen: false })); }} className="w-full py-2.5 px-4 bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold rounded-xl shadow-lg shadow-blue-600/30 transition-all active:scale-95 border border-blue-500/50">OK</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}