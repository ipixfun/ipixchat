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
  const existingNote = "Mohon maaf nama anda tidak bisa diubah lagi. Hubungi admin di chat jika anda ingin merubahnya.";
  const [displayedNote, setDisplayedNote] = useState("");
  const [isNoteTypingDone, setIsNoteTypingDone] = useState(false);
  
  // State untuk dropdown formulir
  const [umur, setUmur] = useState("");
  const [berat, setBerat] = useState("");

  // State untuk persetujuan username permanen
  const [isUsernameAgreed, setIsUsernameAgreed] = useState(false);

  // State untuk notifikasi validasi
  const [validationMsg, setValidationMsg] = useState("");

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

  // Validasi apakah semua kolom untuk user baru sudah terisi lengkap & dicentang
  const isFormValid = username?.trim().length > 0 && umur !== "" && berat !== "" && isUsernameAgreed;

  // Handler Login User dengan Notifikasi Kustom
  const handleUserLoginWrapper = () => {
    if (!isExistingUser) {
      if (!username || username.trim().length === 0) {
        setValidationMsg("isi dulu sayang");
        return;
      }
      if (!umur || !berat) {
        setValidationMsg("pilih dulu sayang");
        return;
      }
      if (!isUsernameAgreed) {
        setValidationMsg("ceklist dulu sayang");
        return;
      }
    }
    
    // Jika semua valid atau merupakan existing user
    setValidationMsg("");
    handleUserLogin();
  };

  return (
    // Background utama dibuat full bg-transparent
    <div className="fixed inset-0 flex flex-col items-center justify-center p-6 z-50 bg-transparent overflow-hidden w-full font-sans">
      
      {/* Main Card - Kotak login blur 5% (bg-white/5) */}
      <div className="w-full max-w-sm flex flex-col items-center bg-white/5 backdrop-blur-sm border border-white/10 p-8 rounded-[2.5rem] shadow-[0_12px_40px_rgba(0,0,0,0.2)] z-20 relative overflow-hidden">
        
        {activeTab === 'user' ? (
          <div className="w-full flex flex-col items-center relative z-10">
            {/* Input Username */}
            <input 
              className="w-full p-4 bg-white/40 backdrop-blur-sm text-gray-900 placeholder-gray-700 border border-white/30 rounded-full focus:border-blue-400 focus:ring-2 focus:ring-blue-300 focus:outline-none transition-all text-center text-lg tracking-wide mb-4 shadow-inner font-bold" 
              placeholder="Username (Maks 20 huruf)" 
              value={username || ""} 
              onChange={(e) => {
                setUsername(e.target.value.slice(0, 20));
                if (validationMsg) setValidationMsg(""); 
              }} 
              disabled={isExistingUser} 
              maxLength={20}
            />
            
            {!isExistingUser && (
              /* Kolom Pilihan Umur dan Berat */
              <div className="flex gap-3 w-full mb-6">
                <div className="w-1/2 relative">
                  <select 
                    value={umur}
                    onChange={(e) => {
                      setUmur(e.target.value);
                      if (validationMsg) setValidationMsg("");
                    }}
                    className="w-full p-3 bg-white/40 backdrop-blur-sm text-gray-800 font-bold border border-white/30 rounded-3xl focus:outline-none focus:ring-2 focus:ring-blue-400 appearance-none shadow-sm cursor-pointer text-center text-sm"
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
                    onChange={(e) => {
                      setBerat(e.target.value);
                      if (validationMsg) setValidationMsg("");
                    }}
                    className="w-full p-3 bg-white/40 backdrop-blur-sm text-gray-800 font-bold border border-white/30 rounded-3xl focus:outline-none focus:ring-2 focus:ring-blue-400 appearance-none shadow-sm cursor-pointer text-center text-sm"
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

            {/* Notifikasi Peringatan Masukan */}
            {validationMsg && (
              <motion.div 
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                className="w-full text-center text-sm font-extrabold text-rose-500 bg-rose-500/10 border border-rose-500/20 py-2 px-4 rounded-full mb-3 tracking-wide"
              >
                {validationMsg}
              </motion.div>
            )}

            {/* Tombol Login Berubah Warna: Masuk Chat/Sudah Diisi Lengkap = Ijo, Belum Lengkap = Biru */}
            <button 
              onClick={handleUserLoginWrapper} 
              className={`w-full py-4 mb-4 text-white font-bold text-md shadow-lg transition-all rounded-full tracking-wider border-2 active:scale-95 cursor-pointer
                ${(isExistingUser || isFormValid)
                  ? 'bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700 border-emerald-400 shadow-green-500/20' 
                  : 'bg-gradient-to-r from-blue-500 to-cyan-600 hover:from-blue-600 hover:to-cyan-700 border-cyan-400 shadow-blue-500/20'
                }`}
            >
              {isExistingUser ? 'Masuk Chat' : 'Gabung'}
            </button>

            {/* Kolom Centang warning username */}
            {!isExistingUser && (
              <motion.div 
                whileHover={{ scale: 1.01 }}
                className="bg-white/20 backdrop-blur-sm px-4 py-3 rounded-full border border-white/20 shadow-sm w-full flex items-center justify-center gap-2.5 transition-all select-none"
              >
                <input 
                  type="checkbox" 
                  id="username-agree" 
                  className="w-4 h-4 accent-blue-500 border-white/40 rounded cursor-pointer scale-105"
                  checked={isUsernameAgreed}
                  onChange={(e) => {
                    setIsUsernameAgreed(e.target.checked);
                    if (validationMsg) setValidationMsg("");
                  }}
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
              className="w-full p-4 mb-4 bg-white/40 backdrop-blur-sm text-gray-900 placeholder-gray-700 border border-white/30 rounded-full focus:border-blue-400 focus:ring-2 focus:ring-blue-300 focus:outline-none transition-all text-center text-md tracking-wide shadow-inner font-bold" 
              placeholder="Email Admin" 
              value={adminEmail || ""} 
              onChange={(e) => setAdminEmail(e.target.value)} 
            />
            <input 
              type="password" 
              className="w-full p-4 mb-8 bg-white/40 backdrop-blur-sm text-gray-900 placeholder-gray-700 border border-white/30 rounded-full focus:border-blue-400 focus:ring-2 focus:ring-blue-300 focus:outline-none transition-all text-center text-md tracking-wide shadow-inner font-bold" 
              placeholder="Password Admin" 
              value={adminPass || ""} 
              onChange={(e) => setAdminPass(e.target.value)} 
            />
            
            <button 
              onClick={handleAdminLogin} 
              className="w-full py-4 bg-gradient-to-r from-blue-500 to-cyan-600 hover:from-blue-600 hover:to-cyan-700 text-white font-bold text-md shadow-lg hover:shadow-xl active:scale-95 transition-all rounded-full tracking-wider border-2 border-cyan-400">
              Gabung Admin
            </button>
          </div>
        )}
      </div>

      {/* Footer Pill */}
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