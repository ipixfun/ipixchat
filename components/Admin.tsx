"use client";

export default function Admin({
  privateUsers,
  setSelectedPrivateUser,
  formatMessageTime,
  onBlockUser,
  onDeleteAllMsgs
}: any) {
  return (
    <div className="space-y-3 p-3">
      {privateUsers.map((user: any, index: number) => {
        const identifier = user.username || `anonymous-${index}`;

        return (
          <div 
            key={identifier} 
            onClick={() => setSelectedPrivateUser(user.username)} 
            className="bg-white p-4 rounded-2xl border border-gray-200 shadow-sm hover:shadow-md hover:border-emerald-300 cursor-pointer transition-all flex flex-col group gap-2"
          >
            {/* BARIS ATAS: Info User & Waktu */}
            <div className="flex justify-between items-start w-full">
              <div className="flex flex-col">
                <div className="flex items-center gap-2">
                  <span className="font-semibold text-blue-700 text-base">
                    {user.username || 'User Tanpa Nama'}
                  </span>
                  
                  {/* Badge Umur & Berat */}
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
                  <div className="text-xs text-gray-500 font-medium mt-1 truncate max-w-[200px]">
                    {user.last_message === "___DELETED___" 
                      ? "(Pesan dihapus)" 
                      : user.last_message || "Mengirim Gambar"}
                  </div>
                )}
              </div>
              
              <div className="text-[10px] text-emerald-600 font-medium whitespace-nowrap">
                {formatMessageTime(user.last_active)}
              </div>
            </div>

            {/* BARIS BAWAH: Tombol Aksi & Statistik Pesan */}
            <div className="flex justify-between items-end mt-2 pt-2 border-t border-gray-50 w-full gap-2">
              
              {/* Kiri: Pill Action */}
              <div className="flex gap-1.5">
                <button
                  onClick={(e) => { e.stopPropagation(); onBlockUser && onBlockUser(user.username); }}
                  className="bg-red-50 hover:bg-red-600 text-red-600 hover:text-white text-[9px] font-black px-2 py-1 rounded shadow-sm border border-red-200 hover:border-red-600 transition-colors uppercase tracking-wider"
                >
                  Block User
                </button>
                <button
                  onClick={(e) => { e.stopPropagation(); onDeleteAllMsgs && onDeleteAllMsgs(user.username); }}
                  className="bg-orange-50 hover:bg-orange-600 text-orange-600 hover:text-white text-[9px] font-black px-2 py-1 rounded shadow-sm border border-orange-200 hover:border-orange-600 transition-colors uppercase tracking-wider"
                >
                  Delete All
                </button>
              </div>

              {/* Kanan: Pill Stats */}
              <div className="flex gap-1.5">
                {/* Pill Pesan Baru (Hijau) */}
                {user.count > 0 && (
                  <span className="bg-emerald-500 text-white text-[9px] font-bold px-2 py-1 rounded-full shadow-sm whitespace-nowrap">
                    {user.count} Baru
                  </span>
                )}
                {/* Pill Total Pesan User (Biru) */}
                <span 
                  className="bg-blue-500 text-white text-[9px] font-bold px-2 py-1 rounded-full shadow-sm whitespace-nowrap" 
                  title="Total pesan dikirim oleh user"
                >
                  👤 {user.totalUserMsgs || 0}
                </span>
                {/* Pill Total Balasan Admin (Merah) */}
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