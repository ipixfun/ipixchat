'use client';
import { motion } from 'framer-motion';
import { useState, useEffect } from 'react';

export default function Login({
  activeTab,
  username,
  setUsername,
  isExistingUser,
  adminEmail,
  setAdminEmail,
  adminPass,
  setAdminPass,
  handleUserLogin,
  handleAdminLogin
}: any) {
  const title = "iPixChaT";
  const existingNote = "Mohon maaf nama anda tidak bisa diubah lagi, Hubungi admin di chat jika anda ingin merubahnya.";
  const [displayedNote, setDisplayedNote] = useState("");
  const [isNoteTypingDone, setIsNoteTypingDone] = useState(false);

  // Typing effect for existing user note
  useEffect(() => {
    if (!isExistingUser) return;

    let index = 0;
    const interval = setInterval(() => {
      if (index < existingNote.length) {
        setDisplayedNote(existingNote.slice(0, index + 1));
        index++;
      } else {
        clearInterval(interval);
        setIsNoteTypingDone(true);
      }
    }, 60);

    return () => clearInterval(interval);
  }, [isExistingUser]);

  return (
    <div className="flex flex-col items-center justify-center h-screen bg-gradient-to-br from-emerald-700 via-emerald-800 to-blue-950 p-6 relative overflow-hidden w-full">
      {/* Glass Background Layer */}
      <div className="absolute inset-0 bg-white/10 backdrop-blur-3xl z-0"></div>
      
      {/* Soft Glow Orbs - Adjusted for darker theme */}
      <div className="absolute top-[-120px] left-[-120px] w-[520px] h-[520px] bg-emerald-400/20 rounded-full blur-3xl z-0"></div>
      <div className="absolute bottom-[-140px] right-[-100px] w-[480px] h-[480px] bg-blue-400/20 rounded-full blur-3xl z-0"></div>

      {/* Logo iPixChaT - Tidak bisa diklik */}
      <div className="relative z-20 mb-8 flex justify-center pointer-events-none select-none">
        <div className="flex">
          {title.split('').map((letter, index) => (
            <motion.span
              key={index}
              className="inline-block text-5xl sm:text-6xl font-black tracking-[-2px] text-white drop-shadow-[0_4px_12px_rgba(255,255,255,0.5)]"
              style={{ 
                fontFamily: "'Nunito', system-ui, sans-serif",
                textShadow: '0 4px 15px rgba(0,0,0,0.35)'
              }}
              animate={{
                y: [0, -18, 0],
                rotate: [0, letter === 'i' || letter === 'P' ? 8 : 0, 0]
              }}
              transition={{
                duration: 1.8 + (index * 0.1),
                repeat: Infinity,
                delay: index * 0.08,
                ease: "easeInOut"
              }}
            >
              {letter}
            </motion.span>
          ))}
        </div>
      </div>

      {/* Main Glass Card */}
      <div className="w-full max-w-sm flex flex-col items-center bg-white/15 backdrop-blur-3xl border border-white/30 p-8 rounded-[2.5rem] shadow-2xl shadow-black/40 z-20">
        {activeTab === 'user' ? (
          <div className="w-full flex flex-col items-center">
            <input 
              className="w-full p-4 rounded-2xl bg-white/90 text-black placeholder-gray-500 border border-transparent focus:border-white/60 focus:bg-white transition-all outline-none font-medium shadow-inner text-center max-w-[280px]" 
              placeholder="input nama max 20 huruf" 
              value={username || ""} 
              onChange={(e) => setUsername(e.target.value.slice(0, 20))} 
              disabled={isExistingUser} 
              maxLength={20}
            />
            
            {!isExistingUser && (
              <div className="mt-4 mb-6 text-sm font-medium tracking-wide text-gray-800 min-h-[24px]">
                Buat username sesuka anda terserah max 20 huruf
              </div>
            )}

            {isExistingUser && (
              <div className="text-sm text-gray-700 mt-4 mb-6 text-center leading-relaxed bg-white/20 backdrop-blur-md border border-white/30 px-5 py-4 rounded-2xl w-full min-h-[90px] flex items-center justify-center shadow-inner">
                {displayedNote}
                {!isNoteTypingDone && <span className="animate-pulse ml-1">|</span>}
              </div>
            )}

            <button 
              onClick={handleUserLogin} 
              className="w-full py-4 bg-gradient-to-r from-emerald-500 to-blue-600 hover:from-emerald-600 hover:to-blue-700 text-white font-bold text-lg shadow-[0_4px_15px_rgba(16,185,129,0.4)] hover:shadow-[0_8px_25px_rgba(16,185,129,0.5)] active:scale-95 transition-all rounded-2xl tracking-wider">
              {isExistingUser ? 'Masuk Chat' : 'Login'}
            </button>
          </div>
        ) : (
          <div className="w-full flex flex-col items-center">
            <input className="w-full p-4 rounded-2xl bg-white/90 text-black placeholder-gray-500 border border-transparent focus:border-white/60 focus:bg-white transition-all outline-none font-medium shadow-inner text-center mb-4" placeholder="Email Admin" value={adminEmail || ""} onChange={(e) => setAdminEmail(e.target.value)} />
            <input type="password" className="w-full p-4 rounded-2xl bg-white/90 text-black placeholder-gray-500 border border-transparent focus:border-white/60 focus:bg-white transition-all outline-none font-medium shadow-inner text-center mb-6" placeholder="Password Admin" value={adminPass || ""} onChange={(e) => setAdminPass(e.target.value)} />
            <button 
              onClick={handleAdminLogin} 
              className="w-full py-4 bg-gradient-to-r from-emerald-500 to-blue-600 hover:from-emerald-600 hover:to-blue-700 text-white font-bold text-lg shadow-[0_4px_15px_rgba(16,185,129,0.4)] hover:shadow-[0_8px_25px_rgba(16,185,129,0.5)] active:scale-95 transition-all rounded-2xl tracking-wider">
              Login Admin
            </button>
          </div>
        )}
      </div>

      {/* Footer */}
      <div className="absolute bottom-6 text-[11px] text-white/80 flex items-center gap-1.5 z-30 font-medium">
        created by 
        <motion.a 
          href="https://ipix.my.id" 
          target="_blank" 
          className="text-emerald-300 font-black hover:text-emerald-100 px-0.5" 
          animate={{ y: [0, -4, 0] }} 
          transition={{ repeat: Infinity, duration: 2, ease: "easeInOut" }}>
          ipix.my.id
        </motion.a>
        with 
        <motion.span 
          animate={{ scale: [1, 1.3, 1] }} 
          transition={{ repeat: Infinity, duration: 0.8, ease: "easeInOut" }} 
          className="text-red-500 text-sm drop-shadow-md">
          ❤️
        </motion.span>
      </div>
    </div>
  );
}