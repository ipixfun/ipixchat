'use client';

export default function Admin({
  privateUsers,
  setSelectedPrivateUser,
  formatMessageTime,
  onPinAutoLogin 
}: any) {
  return (
    <div className="space-y-3 p-3">
      {privateUsers.map((user: any, index: number) => {
        const identifier = user.username || `anonymous-${index}`;

        return (
          <div 
            key={identifier} 
            onClick={() => setSelectedPrivateUser(user.username)} 
            className="bg-white p-4 rounded-2xl border border-gray-200 shadow-sm hover:shadow-md hover:border-emerald-300 cursor-pointer transition-all flex justify-between items-center group"
          >
            <div className="flex flex-col items-start">
              <div className="font-semibold text-blue-700 text-base">
                {user.username || 'User Tanpa Nama'}
              </div>
              
              {/* Menampilkan Pesan Terakhir User */}
              {user.username && (
                <div className="text-xs text-gray-500 font-medium mt-0.5 truncate max-w-[200px]">
                  {user.last_message === "___DELETED___" 
                    ? "(Pesan dihapus)" 
                    : user.last_message || "Mengirim Gambar"}
                </div>
              )}
              
              {/* TOMBOL KUNCI / BUKA AKSES */}
              <button
                onClick={(e) => {
                  e.stopPropagation(); 
                  if(onPinAutoLogin) {
                    onPinAutoLogin(user);
                  } else {
                    alert("Gagal: Props 'onPinAutoLogin' belum diteruskan!");
                  }
                }}
                className={`mt-3 flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-[10px] font-bold transition-colors border shadow-sm ${
                  user.is_locked 
                    ? "bg-red-50 hover:bg-red-600 text-red-600 hover:text-white border-red-100 hover:border-red-600" 
                    : "bg-indigo-50 hover:bg-indigo-600 text-indigo-600 hover:text-white border-indigo-100 hover:border-indigo-600"
                }`}
                title={user.is_locked ? "Buka Akses Login" : "Kunci Akses Login"}
              >
                {user.is_locked ? (
                  <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="11" width="18" height="11" rx="2" ry="2"></rect><path d="M7 11V7a5 5 0 0 1 10 0v4"></path></svg>
                ) : (
                  <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="11" width="18" height="11" rx="2" ry="2"></rect><path d="M7 11V7a5 5 0 0 1 10 0"></path></svg>
                )}
                {user.is_locked ? 'BUKA AKSES LOGIN' : 'KUNCI AKSES LOGIN'}
              </button>
            </div>
            
            <div className="text-right flex flex-col items-end gap-1.5">
              {user.count > 0 ? (
                <div className="bg-red-500 text-white text-[10px] font-bold px-2.5 py-1 rounded-full shadow-sm whitespace-nowrap">
                  {user.count} Pesan Baru
                </div>
              ) : (
                <div className="bg-gray-400 text-white text-[10px] font-bold px-2.5 py-1 rounded-full shadow-sm opacity-90 whitespace-nowrap">
                  Terbaca
                </div>
              )}
              <div className="text-[10px] text-emerald-600 font-medium">
                Terakhir: {formatMessageTime(user.last_active)}
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}