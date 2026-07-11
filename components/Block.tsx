'use client';

export default function Block({
  blockedList,
  unblock,
  blockedWords,
  newBadWord,
  setNewBadWord,
  addBlockedWord,
  removeBlockedWord,
  formatMessageTime
}: any) {
  return (
    <div className="min-h-full bg-gradient-to-br from-emerald-950 via-blue-950 to-emerald-950 text-white">
      <div className="sticky top-0 bg-gradient-to-br from-emerald-950 to-blue-950 border-b border-white/10 z-20 p-6">
        <div className="max-w-5xl mx-auto flex justify-between items-center">
          <div>
            <h2 className="text-3xl font-bold flex items-center gap-3">⚙️ Manajemen Blokir</h2>
            <p className="text-white/70 text-sm mt-1">Kelola user dan kata terlarang</p>
          </div>
          <button onClick={() => window.history.back()} className="px-6 py-2.5 bg-white/10 hover:bg-white/20 border border-white/30 rounded-full text-sm font-medium transition-all">← Kembali</button>
        </div>
      </div>
      <div className="p-6 max-w-5xl mx-auto space-y-8 pb-20">
        <section className="bg-white/10 backdrop-blur-xl rounded-3xl border border-white/20 p-6">
          <h3 className="text-xl font-semibold mb-5 flex items-center gap-3">👤 User Terblokir <span className="text-sm font-normal text-white/50">({blockedList.length})</span></h3>
          {blockedList.length === 0 ? <p className="text-white/50 italic py-12 text-center">Belum ada user yang diblokir.</p> : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {blockedList.map((b: any) => (
                <div key={b.device_id} onClick={() => unblock(b.device_id)} className="group bg-white/5 hover:bg-white/10 border border-white/10 hover:border-red-500/50 p-5 rounded-2xl cursor-pointer transition-all flex justify-between items-start">
                  <div><div className="font-semibold text-lg">{b.username || 'Tanpa Nama'}</div><div className="text-xs text-white/60 mt-1 font-mono">ID: {b.device_id}</div></div>
                  <div className="text-right text-xs text-white/50">{formatMessageTime(b.created_at || new Date().toISOString())}<span className="block text-red-400 text-3xl group-hover:text-red-300 mt-2">×</span></div>
                </div>
              ))}
            </div>
          )}
        </section>
        <section className="bg-white/10 backdrop-blur-xl rounded-3xl border border-white/20 p-6">
          <h3 className="text-xl font-semibold mb-5">🚫 Filter Kata Kasar</h3>
          <div className="flex gap-3 mb-6">
            <input className="flex-1 border border-white/30 focus:border-red-400 bg-white/5 text-white rounded-2xl px-5 py-4 text-sm outline-none transition-all placeholder:text-white/50" placeholder="Tambahkan kata yang dilarang..." value={newBadWord} onChange={(e) => setNewBadWord(e.target.value)} onKeyPress={(e) => e.key === 'Enter' && addBlockedWord()} />
            <button onClick={addBlockedWord} className="bg-red-600 hover:bg-red-700 text-white px-10 rounded-2xl font-semibold transition-all active:scale-95">Tambah</button>
          </div>
          <div className="flex flex-wrap gap-3">
            {blockedWords.length === 0 ? <p className="text-white/50 italic py-8">Belum ada kata yang diblokir.</p> : blockedWords.sort((a: any, b: any) => a.localeCompare(b)).map((word: any, idx: number) => (
              <div key={idx} className="group flex items-center gap-2 bg-white/10 hover:bg-white/20 border border-white/30 px-5 py-2.5 rounded-2xl text-sm transition-all"><span className="font-medium text-white">{word}</span><button onClick={() => removeBlockedWord(word)} className="text-white/50 hover:text-red-400 text-xl leading-none">×</button></div>
            ))}
          </div>
        </section>
      </div>
    </div>
  );
}