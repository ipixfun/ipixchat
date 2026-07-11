'use client';

export default function Admin({
  privateUsers,
  setSelectedPrivateUser,
  formatMessageTime
}: any) {
  return (
    <div className="space-y-3 p-3">
      {privateUsers.map((user: any) => (
        <div key={user.device_id} onClick={() => setSelectedPrivateUser(user.device_id)} className="bg-white p-4 rounded-2xl border border-gray-200 shadow-sm hover:shadow-md hover:border-emerald-300 cursor-pointer transition-all flex justify-between items-center group">
          <div>
            <div className="font-semibold text-blue-700 text-base">{user.username || 'User Tanpa Nama'}</div>
            <div className="text-xs text-gray-500 font-mono mt-0.5">ID: {user.device_id.substring(0, 8)}...</div>
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
            <div className="text-[10px] text-emerald-600 font-medium">Terakhir: {formatMessageTime(user.last_active)}</div>
          </div>
        </div>
      ))}
    </div>
  );
}