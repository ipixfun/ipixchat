'use client';
import { motion } from 'framer-motion';
import { useState, useEffect, useMemo } from 'react';

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
  
  // State untuk dropdown formulir
  const [umur, setUmur] = useState("");
  const [berat, setBerat] = useState("");
  const [sosmed, setSosmed] = useState("");
  const [stay, setStay] = useState("");
  const [status, setStatus] = useState("");
  const [role, setRole] = useState("");

  // State untuk persetujuan username permanen
  const [isUsernameAgreed, setIsUsernameAgreed] = useState(false);

  // Mengunci data gelembung agar tidak terpengaruh re-render dari efek mengetik teks
  const bubbles = useMemo(() => {
    return Array.from({ length: 14 }).map((_, i) => ({
      id: i,
      left: `${2 + Math.random() * 96}%`,
      size: Math.random() * 12 + 6,
      delay: Math.random() * 4,
      duration: Math.random() * 5 + 7,
    }));
  }, []);

  // Typing effect untuk existing user note
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

  // Validasi tombol login user baru (semua kolom wajib diisi & persetujuan dicentang)
  const isFormValid = 
    username?.trim().length > 0 && 
    umur !== "" && 
    berat !== "" && 
    sosmed !== "" && 
    stay !== "" && 
    status !== "" && 
    role !== "" && 
    isUsernameAgreed;

  return (
    // Background utama
    <div className="fixed inset-0 flex flex-col items-center justify-center p-6 z-50 bg-black/35 backdrop-blur-sm overflow-hidden w-full font-sans">
      
      {/* Siluet Gradasi Biru Ijo di belakang Card */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[350px] h-[350px] bg-gradient-to-tr from-emerald-500/20 to-blue-500/20 rounded-full blur-[90px] z-0 animate-pulse" style={{ animationDuration: '4s' }}></div>

      {/* Logo iPixChaT Dinamis (3D Gelombang Ijo-Biru dengan Putih Lembut) */}
      <div className="relative z-20 mb-10 flex justify-center pointer-events-none select-none">
        
        {/* Container Gelembung Putih Semula (Stabil & Tidak Ikut Cepat) */}
        <div className="absolute inset-0 z-0 overflow-visible pointer-events-none">
          {bubbles.map((b) => (
            <motion.div
              key={b.id}
              className="absolute rounded-full border border-white/40 bg-white/10 shadow-sm"
              style={{ 
                left: b.left, 
                width: b.size, 
                height: b.size, 
                bottom: -50,
              }}
              animate={{ 
                y: [0, -520], 
                opacity: [0, 0.7, 0.7, 0],
                x: [0, Math.sin(b.id) * 20]
              }}
              transition={{ 
                repeat: Infinity, 
                duration: b.duration, 
                delay: b.delay, 
                ease: "linear" 
              }}
            />
          ))}
        </div>

        {/* Teks Gelombang 3D */}
        <div className="flex relative z-10">
          {title.split('').map((letter, index) => (
            <motion.span
              key={index}
              className="inline-block text-6xl sm:text-7xl font-black tracking-[-2px] text-transparent bg-clip-text bg-gradient-to-b from-emerald-400 via-teal-300 to-blue-600 drop-shadow-[0_6px_3px_rgba(4,120,87,0.7)]"
              style={{ fontFamily: "'Nunito', system-ui, sans-serif" }}
              animate={{
                y: [0, -18, 0],
              }}
              transition={{
                y: { duration: 2.2, repeat: Infinity, delay: index * 0.15, ease: "easeInOut" },
              }}
            >
              {letter}
            </motion.span>
          ))}
        </div>
      </div>

      {/* Main Card - Transparan 95% / Sisain 5% (bg-white/5) */}
      <div className="w-full max-w-sm flex flex-col items-center bg-white/5 backdrop-blur-xl border border-white/10 p-8 rounded-[2.5rem] shadow-[0_12px_40px_rgba(0,0,0,0.3)] z-20 relative overflow-hidden">
        
        {activeTab === 'user' ? (
          <div className="w-full flex flex-col items-center relative z-10">
            {/* Input Username */}
            <input 
              className="w-full p-4 bg-white/40 backdrop-blur-sm text-gray-900 placeholder-gray-700 border border-white/30 rounded-full focus:border-emerald-400 focus:ring-2 focus:ring-emerald-300 focus:outline-none transition-all text-center text-lg tracking-wide mb-4 shadow-inner font-bold" 
              placeholder="Username (Maks 20 huruf)" 
              value={username || ""} 
              onChange={(e) => setUsername(e.target.value.slice(0, 20))} 
              disabled={isExistingUser} 
              maxLength={20}
            />
            
            {!isExistingUser && (
              <>
                {/* Baris 1: Dropdown Pilihan Umur dan Berat */}
                <div className="flex gap-3 w-full mb-3">
                  <div className="w-1/2 relative">
                    <select 
                      value={umur}
                      onChange={(e) => setUmur(e.target.value)}
                      className="w-full p-3 bg-white/40 backdrop-blur-sm text-gray-800 font-bold border border-white/30 rounded-3xl focus:outline-none focus:ring-2 focus:ring-emerald-400 appearance-none shadow-sm cursor-pointer text-center text-sm"
                    >
                      <option value="" disabled>Umur</option>
                      <option value="20+">20+</option>
                      <option value="25+">25+</option>
                      <option value="30+">30+</option>
                      <option value="35+">35+</option>
                      <option value="40+">40+</option>
                    </select>
                    <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-3 text-gray-700">
                      <svg className="fill-current h-4 w-4" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20"><path d="M9.293 12.95l.707.707L15.657 8l-1.414-1.414L10 10.828 5.757 6.586 4.343 8z"/></svg>
                    </div>
                  </div>

                  <div className="w-1/2 relative">
                    <select 
                      value={berat}
                      onChange={(e) => setBerat(e.target.value)}
                      className="w-full p-3 bg-white/40 backdrop-blur-sm text-gray-800 font-bold border border-white/30 rounded-3xl focus:outline-none focus:ring-2 focus:ring-emerald-400 appearance-none shadow-sm cursor-pointer text-center text-sm"
                    >
                      <option value="" disabled>Berat</option>
                      <option value="<55">&lt;55</option>
                      <option value="60+">60+</option>
                      <option value="70+">70+</option>
                      <option value="80+">80+</option>
                      <option value="90+">90+</option>
                      <option value="100+">100+</option>
                    </select>
                    <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-3 text-gray-700">
                      <svg className="fill-current h-4 w-4" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20"><path d="M9.293 12.95l.707.707L15.657 8l-1.414-1.414L10 10.828 5.757 6.586 4.343 8z"/></svg>
                    </div>
                  </div>
                </div>

                {/* Baris 2: Dropdown Pilihan Platform Sosmed dan Stay */}
                <div className="flex gap-3 w-full mb-3">
                  <div className="w-1/2 relative">
                    <select 
                      value={sosmed}
                      onChange={(e) => setSosmed(e.target.value)}
                      className="w-full p-3 bg-white/40 backdrop-blur-sm text-gray-800 font-bold border border-white/30 rounded-3xl focus:outline-none focus:ring-2 focus:ring-emerald-400 appearance-none shadow-sm cursor-pointer text-center text-sm"
                    >
                      <option value="" disabled>Sosmed</option>
                      <option value="growlr">Growlr</option>
                      <option value="heesay/walla">Heesay/Walla</option>
                      <option value="sosmed lain">Sosmed Lain</option>
                    </select>
                    <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 text-gray-700">
                      <svg className="fill-current h-4 w-4" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20"><path d="M9.293 12.95l.707.707L15.657 8l-1.414-1.414L10 10.828 5.757 6.586 4.343 8z"/></svg>
                    </div>
                  </div>

                  <div className="w-1/2 relative">
                    <select 
                      value={stay}
                      onChange={(e) => setStay(e.target.value)}
                      className="w-full p-3 bg-white/40 backdrop-blur-sm text-gray-800 font-bold border border-white/30 rounded-3xl focus:outline-none focus:ring-2 focus:ring-emerald-400 appearance-none shadow-sm cursor-pointer text-center text-sm"
                    >
                      <option value="" disabled>Stay</option>
                      <option value="jawa tengah">Jawa Tengah</option>
                      <option value="jawa timur">Jawa Timur</option>
                      <option value="jawa barat">Jawa Barat</option>
                      <option value="luar jawa">Luar Jawa</option>
                      <option value="foreigner">Foreigner</option>
                    </select>
                    <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 text-gray-700">
                      <svg className="fill-current h-4 w-4" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20"><path d="M9.293 12.95l.707.707L15.657 8l-1.414-1.414L10 10.828 5.757 6.586 4.343 8z"/></svg>
                    </div>
                  </div>
                </div>

                {/* Baris 3: Dropdown Pilihan Status dan Role */}
                <div className="flex gap-3 w-full mb-6">
                  <div className="w-1/2 relative">
                    <select 
                      value={status}
                      onChange={(e) => setStatus(e.target.value)}
                      className="w-full p-3 bg-white/40 backdrop-blur-sm text-gray-800 font-bold border border-white/30 rounded-3xl focus:outline-none focus:ring-2 focus:ring-emerald-400 appearance-none shadow-sm cursor-pointer text-center text-sm"
                    >
                      <option value="" disabled>Status</option>
                      <option value="single">Single</option>
                      <option value="double">Double</option>
                    </select>
                    <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 text-gray-700">
                      <svg className="fill-current h-4 w-4" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20"><path d="M9.293 12.95l.707.707L15.657 8l-1.414-1.414L10 10.828 5.757 6.586 4.343 8z"/></svg>
                    </div>
                  </div>

                  <div className="w-1/2 relative">
                    <select 
                      value={role}
                      onChange={(e) => setRole(e.target.value)}
                      className="w-full p-3 bg-white/40 backdrop-blur-sm text-gray-800 font-bold border border-white/30 rounded-3xl focus:outline-none focus:ring-2 focus:ring-emerald-400 appearance-none shadow-sm cursor-pointer text-center text-sm"
                    >
                      <option value="" disabled>Role</option>
                      <option value="T">T</option>
                      <option value="V">V</option>
                      <option value="B">B</option>
                      <option value="Side">Side</option>
                    </select>
                    <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 text-gray-700">
                      <svg className="fill-current h-4 w-4" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20"><path d="M9.293 12.95l.707.707L15.657 8l-1.414-1.414L10 10.828 5.757 6.586 4.343 8z"/></svg>
                    </div>
                  </div>
                </div>
              </>
            )}

            {isExistingUser && (
              /* Existing User Note */
              <motion.div 
                layout
                className="text-xs text-gray-800 mt-2 mb-6 text-center leading-relaxed bg-white/50 backdrop-blur-md border border-white/30 px-6 py-4 rounded-3xl w-full min-h-[80px] flex items-center justify-center shadow-inner font-semibold transition-all duration-300"
              >
                <span>{displayedNote}</span>
                {!isNoteTypingDone && <span className="animate-pulse ml-1 text-emerald-600 font-bold">|</span>}
              </motion.div>
            )}

            {/* Tombol Login */}
            <button 
              onClick={handleUserLogin} 
              disabled={!isExistingUser && !isFormValid} 
              className={`w-full py-4 mb-4 text-white font-bold text-md shadow-lg transition-all rounded-full tracking-wider border border-transparent 
                ${(!isExistingUser && !isFormValid) 
                  ? 'bg-gray-400/40 cursor-not-allowed opacity-60 backdrop-blur-sm' 
                  : 'bg-gradient-to-r from-emerald-500 to-blue-600 hover:from-emerald-600 hover:to-blue-700 hover:shadow-xl active:scale-95 cursor-pointer'
                }`}
            >
              {isExistingUser ? 'Masuk Chat' : 'Login'}
            </button>

            {/* Kolom Centang warning username di bawah tombol login */}
            {!isExistingUser && (
              <motion.div 
                whileHover={{ scale: 1.01 }}
                className="bg-white/20 backdrop-blur-sm px-4 py-3 rounded-full border border-white/20 shadow-sm w-full flex items-center justify-center gap-2.5 transition-all select-none"
              >
                <input 
                  type="checkbox" 
                  id="username-agree" 
                  className="w-4 h-4 accent-emerald-500 border-white/40 rounded cursor-pointer scale-105"
                  checked={isUsernameAgreed}
                  onChange={(e) => setIsUsernameAgreed(e.target.checked)}
                />
                <label htmlFor="username-agree" className="text-[11px] font-bold tracking-wide text-gray-800 drop-shadow-sm cursor-pointer leading-none">
                  *Username permanen & tidak dapat diubah
                </label>
              </motion.div>
            )}
          </div>
        ) : (
          <div className="w-full flex flex-col items-center relative z-10">
            {/* Input Admin */}
            <input 
              className="w-full p-4 mb-4 bg-white/40 backdrop-blur-sm text-gray-900 placeholder-gray-700 border border-white/30 rounded-full focus:border-emerald-400 focus:ring-2 focus:ring-emerald-300 focus:outline-none transition-all text-center text-md tracking-wide shadow-inner font-bold" 
              placeholder="Email Admin" 
              value={adminEmail || ""} 
              onChange={(e) => setAdminEmail(e.target.value)} 
            />
            <input 
              type="password" 
              className="w-full p-4 mb-8 bg-white/40 backdrop-blur-sm text-gray-900 placeholder-gray-700 border border-white/30 rounded-full focus:border-emerald-400 focus:ring-2 focus:ring-emerald-300 focus:outline-none transition-all text-center text-md tracking-wide shadow-inner font-bold" 
              placeholder="Password Admin" 
              value={adminPass || ""} 
              onChange={(e) => setAdminPass(e.target.value)} 
            />
            
            <button 
              onClick={handleAdminLogin} 
              className="w-full py-4 bg-gradient-to-r from-emerald-500 to-blue-600 hover:from-emerald-600 hover:to-blue-700 text-white font-bold text-md shadow-lg hover:shadow-xl active:scale-95 transition-all rounded-full tracking-wider border border-transparent">
              Login Admin
            </button>
          </div>
        )}
      </div>

      {/* Footer Pill Responsif */}
      <div className="absolute bottom-6 z-30 flex items-center justify-center w-full pointer-events-none">
        <motion.div 
          className="text-[11px] text-gray-200 flex items-center gap-1.5 font-medium bg-black/40 backdrop-blur-md px-5 py-2.5 rounded-full border border-white/10 shadow-lg pointer-events-auto transition-colors hover:bg-black/50"
          whileHover={{ scale: 1.05 }}
        >
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
            animate={{ scale: [1, 1.3, 1] }} 
            transition={{ repeat: Infinity, duration: 1, ease: "easeInOut" }} 
            className="text-red-500 text-xs drop-shadow-md">
            ❤️
          </motion.span>
        </motion.div>
      </div>
    </div>
  );
}