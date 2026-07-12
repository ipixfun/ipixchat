'use client';

import React from 'react';

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
  const [isDraggingOverTrash, setIsDraggingOverTrash] = React.useState(false);

  const handleAddBlockedWord = () => {
    const trimmed = newBadWord?.trim();
    if (!trimmed) return;

    const exists = blockedWords?.some(
      (word: string) => word.toLowerCase() === trimmed.toLowerCase()
    );

    if (exists) {
      alert('Kata ini sudah ada di daftar blokir!');
      return;
    }

    addBlockedWord();
    setNewBadWord('');
  };

  // Drag & Drop
  const handleDragStart = (e: React.DragEvent, word: string) => {
    e.dataTransfer.setData('text/plain', word);
    e.currentTarget.classList.add('opacity-60', 'scale-95');
  };

  const handleDragEnd = (e: React.DragEvent) => {
    e.currentTarget.classList.remove('opacity-60', 'scale-95');
    setIsDraggingOverTrash(false);
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDraggingOverTrash(true);
  };

  const handleDragLeave = () => setIsDraggingOverTrash(false);

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    const word = e.dataTransfer.getData('text/plain');
    if (word) removeBlockedWord(word);
    setIsDraggingOverTrash(false);
  };

  return (
    <div className="min-h-screen w-full bg-gradient-to-br from-slate-950 via-emerald-950 to-blue-950 text-white">
      {/* Header Minimal */}
      <div className="sticky top-0 bg-slate-950/90 backdrop-blur-md border-b border-white/10 z-20 p-4">
        <div className="max-w-4xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-emerald-400 to-cyan-400 flex items-center justify-center text-xl">
              ⚙️
            </div>
            <div>
              <h2 className="text-xl font-semibold">Manajemen Blokir</h2>
              <p className="text-xs text-white/50 -mt-0.5">Kelola user & kata terlarang</p>
            </div>
          </div>
          <button
            onClick={() => window.history.back()}
            className="px-5 py-2 text-sm bg-white/10 hover:bg-white/20 border border-white/20 rounded-full transition-all"
          >
            ← Kembali
          </button>
        </div>
      </div>

      <div className="max-w-4xl mx-auto p-4 space-y-8 pb-24">
        {/* User Terblokir */}
        <section className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-3xl p-5">
          <h3 className="text-lg font-medium mb-5 flex items-center gap-2 text-white/90">
            👤 User Terblokir
            <span className="text-sm px-2.5 py-0.5 bg-white/10 rounded-full text-white/70">({blockedList?.length || 0})</span>
          </h3>

          {!blockedList || blockedList.length === 0 ? (
            <div className="py-16 text-center text-white/50">
              Belum ada user yang diblokir
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {blockedList.map((b: any) => (
                <div
                  key={b.device_id}
                  onClick={() => unblock(b.device_id)}
                  className="group bg-white/5 hover:bg-white/10 border border-white/10 hover:border-red-500/30 p-5 rounded-2xl cursor-pointer transition-all"
                >
                  <div className="flex justify-between items-start">
                    <div className="flex-1 min-w-0">
                      <p className="font-medium text-base truncate">
                        {b.username || b.name || 'Tanpa Nama'}
                      </p>
                      <p className="font-mono text-xs text-white/60 mt-1 break-all">
                        {b.device_id}
                      </p>
                      {b.browser && (
                        <p className="text-xs text-white/50 mt-1">{b.browser}</p>
                      )}
                    </div>

                    <div className="text-right text-xs text-white/50 pt-1">
                      {formatMessageTime(b.created_at || new Date().toISOString())}
                    </div>
                  </div>

                  <div className="mt-6 text-red-400 text-3xl opacity-0 group-hover:opacity-100 transition-all text-right">
                    ×
                  </div>
                </div>
              ))}
            </div>
          )}
        </section>

        {/* Filter Kata Kasar */}
        <section className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-3xl p-5">
          <h3 className="text-lg font-medium mb-5 text-white/90">🚫 Filter Kata Kasar</h3>

          <div className="flex gap-3 mb-6">
            <input
              className="flex-1 bg-white/5 border border-white/20 focus:border-emerald-500 rounded-2xl px-5 py-3.5 text-sm placeholder:text-white/40 focus:outline-none transition-all"
              placeholder="Tambah kata terlarang..."
              value={newBadWord}
              onChange={(e) => setNewBadWord(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && handleAddBlockedWord()}
            />
            <button
              onClick={handleAddBlockedWord}
              className="bg-emerald-600 hover:bg-emerald-500 px-7 rounded-2xl font-medium transition-all active:scale-95"
            >
              Tambah
            </button>
          </div>

          <div className="flex flex-wrap gap-3 min-h-[100px]">
            {!blockedWords || blockedWords.length === 0 ? (
              <p className="text-white/50 italic py-10 w-full text-center">
                Belum ada kata yang diblokir
              </p>
            ) : (
              blockedWords
                .sort((a: any, b: any) => a.localeCompare(b))
                .map((word: any, idx: number) => (
                  <div
                    key={idx}
                    draggable
                    onDragStart={(e) => handleDragStart(e, word)}
                    onDragEnd={handleDragEnd}
                    className="group flex items-center gap-2 bg-white/5 hover:bg-white/10 border border-white/20 px-4 py-2.5 rounded-2xl text-sm cursor-grab active:cursor-grabbing transition-all"
                  >
                    <span>{word}</span>
                    <button
                      onClick={() => removeBlockedWord(word)}
                      className="ml-1 text-white/40 hover:text-red-400 text-xl leading-none"
                    >
                      ×
                    </button>
                  </div>
                ))
            )}
          </div>

          {/* Trash Bin */}
          <div
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            onDrop={handleDrop}
            className={`mt-8 border-2 border-dashed rounded-3xl p-6 text-center transition-all ${
              isDraggingOverTrash
                ? 'border-red-500 bg-red-500/10'
                : 'border-white/20 hover:border-white/40'
            }`}
          >
            <div className="mx-auto text-4xl mb-2">🗑️</div>
            <p className="text-sm text-white/70">
              {isDraggingOverTrash ? 'Lepaskan di sini untuk hapus' : 'Seret kata ke sini untuk menghapus'}
            </p>
          </div>
        </section>
      </div>
    </div>
  );
}