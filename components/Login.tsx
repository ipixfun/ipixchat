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
  const existingNote = "Mohon maaf nama anda tidak bisa diubah lagi. Hubungi admin di chat jika anda ingin merubahnya.";
  const [displayedNote, setDisplayedNote] = useState("");
  const [isNoteTypingDone, setIsNoteTypingDone] = useState(false);
  const [isAgreed, setIsAgreed] = useState(false);

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
    // Background utama: blur tipis (sm) agar tidak berlebihan
    <div className="fixed inset-0 flex flex-col items-center justify-center p-6 z-50 bg-black/20 backdrop-blur-sm overflow-hidden w-full">
      
      {/* Siluet Gradasi Biru Ijo di belakang Card */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[350px] h-[350px] bg-gradient-to-tr from-emerald-500/40 to-blue-500/40 rounded-full blur-[80px] z-0 animate-pulse" style={{ animationDuration: '4s' }}></div>

      {/* Logo iPixChaT (Teks tetap putih agar kontras dengan background gelap/blur di luarnya) */}
      <div className="relative z-20 mb-8 flex justify-center pointer-events-none select-none">
        <div className="flex">
          {title.split('').map((letter, index) => (
            <motion.span
              key={index}
              className="inline-block text-5xl sm:text-6xl font-black tracking-[-2px] text-white drop-shadow-[0_2px_10px_rgba(255,255,255,0.4)]"
              style={{ fontFamily: "'Nunito', system-ui, sans-serif" }}
              animate={{
                y: [0, -12, 0],
                textShadow: [
                  '0px 4px 15px rgba(16, 185, 129, 0)',
                  '0px 4px 20px rgba(16, 185, 129, 0.6)',
                  '0px 4px 15px rgba(16, 185, 129, 0)'
                ]
              }}
              transition={{
                duration: 2.5,
                repeat: Infinity,
                delay: index * 0.1,
                ease: "easeInOut"
              }}
            >
              {letter}
            </motion.span>
          ))}
        </div>
      </div>

      {/* Main Card - Diubah jadi Putih/Solid agar teks hitam mudah dibaca */}
      <div className="w-full max-w-sm flex flex-col items-center bg-white/95 backdrop-blur-sm border border-gray-200 p-8 rounded-[2rem] shadow-2xl z-20 relative overflow-hidden">
        
        {activeTab === 'user' ? (
          <div className="w-full flex flex-col items-center relative z-10">
            {/* Input Kolom Abu-abu Muda, Teks Hitam */}
            <input 
              className="w-full p-3.5 bg-gray-100 text-black placeholder-gray-500 border border-gray-300 rounded-xl focus:border-emerald-500 focus:ring-2 focus:ring-emerald-200 focus:outline-none transition-all text-center text-lg tracking-wide mb-2" 
              placeholder="Username (Maks 20 huruf)" 
              value={username || ""} 
              onChange={(e) => setUsername(e.target.value.slice(0, 20))} 
              disabled={isExistingUser} 
              maxLength={20}
            />
            
            {!isExistingUser && (
              <>
                <div className="mt-2 mb-4 text-[11px] font-medium tracking-wide text-gray-500 min-h-[20px]">
                  *Username permanen & tidak dapat diubah
                </div>
                
                {/* Checkbox S&K */}
                <div className="flex items-center gap-2 mt-2 mb-6 w-full justify-center">
                  <input 
                    type="checkbox" 
                    id="terms" 
                    className="w-4 h-4 accent-emerald-500 cursor-pointer border-gray-400 rounded-sm"
                    checked={isAgreed}
                    onChange={(e) => setIsAgreed(e.target.checked)}
                  />
                  <label htmlFor="terms" className="text-xs font-semibold text-gray-600 cursor-pointer hover:text-gray-900 transition-colors">
                    Saya setuju S&K yang berlaku
                  </label>
                </div>
              </>
            )}

            {isExistingUser && (
              <div className="text-xs text-gray-700 mt-4 mb-6 text-center leading-relaxed bg-gray-100 border border-gray-300 px-4 py-3 rounded-xl w-full min-h-[80px] flex items-center justify-center shadow-inner font-medium">
                {displayedNote}
                {!isNoteTypingDone && <span className="animate-pulse ml-1 text-emerald-500">|</span>}
              </div>
            )}

            <button 
              onClick={handleUserLogin} 
              disabled={!isExistingUser && !isAgreed} 
              className={`w-full py-3.5 text-white font-bold text-md shadow-lg transition-all rounded-full tracking-wider border border-transparent 
                ${(!isExistingUser && !isAgreed) 
                  ? 'bg-gray-400 cursor-not-allowed opacity-70' 
                  : 'bg-gradient-to-r from-emerald-500 to-blue-600 hover:from-emerald-600 hover:to-blue-700 hover:shadow-xl active:scale-95 cursor-pointer'
                }`}
            >
              {isExistingUser ? 'Masuk Chat' : 'Login'}
            </button>
          </div>
        ) : (
          <div className="w-full flex flex-col items-center relative z-10">
            {/* Input Admin Kolom Abu-abu Muda, Teks Hitam */}
            <input 
              className="w-full p-3.5 mb-4 bg-gray-100 text-black placeholder-gray-500 border border-gray-300 rounded-xl focus:border-emerald-500 focus:ring-2 focus:ring-emerald-200 focus:outline-none transition-all text-center text-md tracking-wide" 
              placeholder="Email Admin" 
              value={adminEmail || ""} 
              onChange={(e) => setAdminEmail(e.target.value)} 
            />
            <input 
              type="password" 
              className="w-full p-3.5 mb-8 bg-gray-100 text-black placeholder-gray-500 border border-gray-300 rounded-xl focus:border-emerald-500 focus:ring-2 focus:ring-emerald-200 focus:outline-none transition-all text-center text-md tracking-wide" 
              placeholder="Password Admin" 
              value={adminPass || ""} 
              onChange={(e) => setAdminPass(e.target.value)} 
            />
            
            <button 
              onClick={handleAdminLogin} 
              className="w-full py-3.5 bg-gradient-to-r from-emerald-500 to-blue-600 hover:from-emerald-600 hover:to-blue-700 text-white font-bold text-md shadow-lg hover:shadow-xl active:scale-95 transition-all rounded-full tracking-wider border border-transparent">
              Login Admin
            </button>
          </div>
        )}
      </div>

      {/* Footer (Tetap dipertahankan dengan teks terang karena berada di atas background gelap luar) */}
      <div className="absolute bottom-6 text-[11px] text-gray-300 flex items-center gap-1.5 z-30 font-medium">
        created by 
        <motion.a 
          href="https://ipix.my.id" 
          target="_blank" 
          className="text-emerald-400 font-bold hover:text-emerald-300 px-0.5 transition-colors" 
          animate={{ y: [0, -2, 0] }} 
          transition={{ repeat: Infinity, duration: 2, ease: "easeInOut" }}>
          ipix.my.id
        </motion.a>
        with 
        <motion.span 
          animate={{ scale: [1, 1.2, 1] }} 
          transition={{ repeat: Infinity, duration: 1, ease: "easeInOut" }} 
          className="text-red-500 text-xs drop-shadow-md">
          ❤️
        </motion.span>
      </div>
    </div>
  );
}