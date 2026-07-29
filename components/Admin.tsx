"use client";

import { useState, useEffect } from "react";

export default function Admin({
  privateUsers,
  setSelectedPrivateUser,
  formatMessageTime,
  onBlockUser,
  onDeleteAllMsgs
}: any) {
  // Simpan batas bawah (baseline) dari total pesan (badge biru) pas terakhir kali admin klik
  const [readBaselines, setReadBaselines] = useState<Record<string, number>>({});

  // Effect ini buat nangkep user yang baru load atau kalau lu abis "Delete All"
  useEffect(() => {
    setReadBaselines((prev) => {
      let hasChanges = false;
      const nextBaselines = { ...prev };

      privateUsers.forEach((user: any) => {
        const currentTotal = user.totalUserMsgs || 0;
        
        // Kalau user belum ada di state, ATAU total pesannya tiba-tiba drop (karena Delete All)
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
    
    // Pas diklik, "baseline" diupdate sama persis dengan angka di Badge Biru saat ini.
    // Otomatis badge hijau (selisihnya) bakal jadi 0.
    setReadBaselines((prev) => ({
      ...prev,
      [user.username]: user.totalUserMsgs || 0
    }));
  };

  return (
    <div className="space-y-3 p-3">
      {privateUsers.map((user: any, index: number) => {
        const identifier = user.username || `anonymous-${index}`;
        
        const baseline = readBaselines[user.username];
        
        // RAHASIANYA DI SINI: Badge Hijau = Total Pesan Biru - Baseline terakhir diklik
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
            <div className="flex justify-between items-start w-full">
              <div className="flex flex-col">
                <div className="flex items-center gap-2">
                  <span className="font-semibold text-blue-700 text-base">
                    {user.username || 'User Tanpa Nama'}
                  </span>
                  
                  {(user.umur || user.berat) && (
                    <div className="flex gap-1.5 mt-0.5">
                      {user.umur && (
                        <span className="text-[9px] font-bold bg-gray-100 text-gray-600 px-1.5 py-0.5 rounded border border-gray-200">
                          U: {user.umur}
                        </span>
                      )}
                      {user.berat && (
                        <span className="text-[9px] font-bold bg-gray-100 text-gray-600 px-1.5 py-0.5 rounded border border-gray-200">
                          B: {user.berat}
                        </span>
                      )}
                    </div>
                  )}
                </div>
                
                {user.username && (
                  <div className={`text-xs font-medium mt-1 truncate max-w-[200px] ${hasUnread ? 'text-emerald-600' : 'text-gray-500'}`}>
                    {user.last_message === "___DELETED___" 
                      ? "(Pesan dihapus)" 
                      : user.last_message || "Mengirim Gambar"}
                  </div>
                )}
              </div>
              
              <div className={`text-[10px] font-medium whitespace-nowrap ${hasUnread ? 'text-emerald-600' : 'text-gray-400'}`}>
                {formatMessageTime(user.last_active)}
              </div>
            </div>

            <div className="flex justify-between items-end mt-2 pt-2 border-t border-gray-100 w-full gap-2">
              <div className="flex gap-1.5">
                <button
                  onClick={(e) => { 
                    e.stopPropagation(); 
                    onBlockUser && onBlockUser(user.username); 
                  }}
                  className="bg-red-50 hover:bg-red-600 text-red-600 hover:text-white text-[9px] font-black px-2 py-1 rounded shadow-sm border border-red-200 hover:border-red-600 transition-colors uppercase tracking-wider"
                >
                  Block User
                </button>
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

              <div className="flex gap-1.5 items-center">
                {/* Rendering Badge Unread */}
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