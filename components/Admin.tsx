"use client";

import { useState, useEffect } from "react";

interface AdminProps {
  privateUsers: any[];
  setSelectedPrivateUser: (username: string) => void;
  formatMessageTime: (time: any) => string;
  onDeleteAllMsgs?: (username: string, isPrivate: boolean) => void;
  onUpdatePin?: (username: string, newPin: string) => void;
  onUpdateUsername?: (oldUsername: string, newUsername: string) => void;
}

export default function Admin({
  privateUsers,
  setSelectedPrivateUser,
  formatMessageTime,
  onDeleteAllMsgs,
  onUpdatePin,
  onUpdateUsername
}: AdminProps) {
  // Simpan batas bawah (baseline) dari total pesan pas terakhir kali admin klik
  const [readBaselines, setReadBaselines] = useState<Record<string, number>>({});

  // Effect untuk menangani penambahan pesan baru atau setelah "Delete All"
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
    
    setReadBaselines((prev) => ({
      ...prev,
      [user.username]: user.totalUserMsgs || 0
    }));
  };

  // Handler Edit PIN ke Database
  const handleEditPin = (e: React.MouseEvent, user: any) => {
    e.stopPropagation();
    const currentPin = user.pin || "";
    const newPin = prompt(`Edit PIN untuk user (${user.username}):`, currentPin);
    
    if (newPin !== null && newPin.trim() !== currentPin) {
      onUpdatePin && onUpdatePin(user.username, newPin.trim());
    }
  };

  // Handler Edit Username ke Database
  const handleEditUsername = (e: React.MouseEvent, user: any) => {
    e.stopPropagation();
    const currentName = user.username || "";
    const newUsername = prompt(`Edit Username untuk (${currentName}):`, currentName);
    
    if (newUsername !== null && newUsername.trim() !== "" && newUsername.trim() !== currentName) {
      onUpdateUsername && onUpdateUsername(currentName, newUsername.trim());
    }
  };

  return (
    <div className="space-y-3 p-3">
      {privateUsers.map((user: any, index: number) => {
        const identifier = user.username || `anonymous-${index}`;
        const baseline = readBaselines[user.username];
        
        let displayCount = 0;
        if (baseline !== undefined) {
          displayCount = Math.max(0, (user.totalUserMsgs || 0) - baseline);
        } else {
          displayCount = user.count || 0;
        }
        
        const hasUnread = displayCount > 0;

        return (
          <div 
            key={identifier} 
            onClick={() => handleUserClick(user)} 
            className="bg-white p-4 rounded-2xl shadow-sm hover:shadow-md cursor-pointer transition-all flex flex-col group gap-2 border"
            style={{ borderColor: "var(--card-border)" }}
          >
            {/* BARIS ATAS: Username (Editable) & Tanggal/Jam */}
            <div className="flex justify-between items-center w-full gap-2">
              <div className="flex items-center gap-1.5 min-w-0 flex-1">
                <span 
                  className="font-bold text-blue-700 text-sm sm:text-base tracking-tight truncate max-w-[210px] sm:max-w-[280px]"
                  title={user.username || 'User Tanpa Nama'}
                >
                  {user.username || 'User Tanpa Nama'}
                </span>
                
                {/* Tombol Edit Username */}
                <button
                  onClick={(e) => handleEditUsername(e, user)}
                  className="text-gray-400 hover:text-blue-600 p-0.5 rounded transition-colors text-xs shrink-0"
                  title="Edit Username"
                >
                  ✏️
                </button>
              </div>
              
              {/* Tanggal & Jam */}
              <div className={`text-[10px] sm:text-xs font-medium whitespace-nowrap shrink-0 text-right ${hasUnread ? 'text-emerald-600 font-semibold' : 'text-gray-400'}`}>
                {formatMessageTime(user.last_active)}
              </div>
            </div>

            {/* BARIS TENGAH: Pesan Terakhir (Kiri) & Umur/Berat (Kanan Tengah Dinamis) */}
            <div className="flex justify-between items-center w-full gap-2 my-0.5">
              <div className={`text-xs font-medium truncate flex-1 min-w-0 ${hasUnread ? 'text-emerald-600 font-semibold' : 'text-gray-500'}`}>
                {user.last_message === "___DELETED___" 
                  ? "(Pesan dihapus)" 
                  : user.last_message || "Mengirim Gambar"}
              </div>

              {/* Umur & Berat di posisi kanan tengah (di atas counter badge) */}
              {(user.umur || user.berat) && (
                <div className="flex gap-1.5 shrink-0 justify-end items-center">
                  {user.umur && (
                    <span className="text-[9px] font-bold bg-gray-100 text-gray-700 px-1.5 py-0.5 rounded border border-gray-200 whitespace-nowrap">
                      U: {user.umur}
                    </span>
                  )}
                  {user.berat && (
                    <span className="text-[9px] font-bold bg-gray-100 text-gray-700 px-1.5 py-0.5 rounded border border-gray-200 whitespace-nowrap">
                      B: {user.berat}
                    </span>
                  )}
                </div>
              )}
            </div>

            {/* BARIS BAWAH: Action Buttons (PIN & Delete All) + Total Pesan Badges */}
            <div className="flex justify-between items-end pt-2 border-t border-gray-100 w-full gap-2">
              <div className="flex gap-1.5 items-center">
                {/* Pill PIN (Editable) menggantikan Block User */}
                <button
                  onClick={(e) => handleEditPin(e, user)}
                  className="bg-amber-50 hover:bg-amber-500 text-amber-700 hover:text-white text-[9px] font-black px-2 py-1 rounded shadow-sm border border-amber-200 hover:border-amber-500 transition-colors uppercase tracking-wider flex items-center gap-1"
                  title="Klik untuk edit PIN user"
                >
                  🔑 PIN: {user.pin || '---'}
                </button>

                {/* Tombol Delete All */}
                <button
                  onClick={(e) => { 
                    e.stopPropagation(); 
                    onDeleteAllMsgs && onDeleteAllMsgs(user.username, true); 
                  }}
                  className="bg-orange-50 hover:bg-orange-600 text-orange-600 hover:text-white text-[9px] font-black px-2 py-1 rounded shadow-sm border border-orange-200 hover:border-orange-600 transition-colors uppercase tracking-wider"
                >
                  Delete All
                </button>
              </div>

              {/* Jumlah Pesan Admin & User */}
              <div className="flex gap-1.5 items-center shrink-0">
                {hasUnread ? (
                  <span className="bg-emerald-500 text-white text-[9px] font-bold px-2 py-1 rounded-full shadow-sm whitespace-nowrap animate-pulse">
                    {displayCount} Baru
                  </span>
                ) : (
                  <span className="bg-gray-400 text-white text-[9px] font-bold px-2 py-1 rounded-full shadow-sm whitespace-nowrap">
                    0
                  </span>
                )}
                
                <span 
                  className="bg-blue-500 text-white text-[9px] font-bold px-2 py-1 rounded-full shadow-sm whitespace-nowrap" 
                  title="Total pesan dikirim oleh user"
                >
                  👤 {user.totalUserMsgs || 0}
                </span>
                
                <span 
                  className="bg-red-500 text-white text-[9px] font-bold px-2 py-1 rounded-full shadow-sm whitespace-nowrap" 
                  title="Total balasan admin ke user"
                >
                  ⭐ {user.totalAdminMsgs || 0}
                </span>
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}