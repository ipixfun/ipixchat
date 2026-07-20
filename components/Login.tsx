'use client';
import { motion } from 'framer-motion';
import { useState, useEffect } from 'react';

export default function Login({
  activeTab,
  username,
  setUsername,
  pin,              
  setPin,           
  umur,             
  setUmur,          
  berat,            
  setBerat,         
  isExistingUser,
  adminEmail,
  setAdminEmail,
  adminPass,
  setAdminPass,
  handleUserLogin,
  handleAdminLogin
}: any) {
  // Teks berjalan 2 paragraf (\n\n)
  const existingNote = "Maaf user dan pin tidak bisa diubah.\n\nHubungi admin di chat untuk merubahnya.";
  const [displayedNote, setDisplayedNote] = useState("");
  const [isNoteTypingDone, setIsNoteTypingDone] = useState(false);
  
  // State untuk efek ketikan placeholder username
  const [placeholderText, setPlaceholderText] = useState("");

  // State Mode: false = Daftar Baru, true = Login Akun Lama
  const [isLoginMode, setIsLoginMode] = useState(false);

  // State untuk persetujuan username permanen
  const [isUsernameAgreed, setIsUsernameAgreed] = useState(false);

  // State untuk notifikasi validasi di dalam tombol
  const [validationMsg, setValidationMsg] = useState("");

  // Typing effect untuk placeholder username (Maks 20 huruf)
  useEffect(() => {
    if (isExistingUser) return;
    const targetPlaceholder = "Username (Maks 20 huruf)";
    let index = 0;
    const interval = setInterval(() => {
      if (index < targetPlaceholder.length) {
        setPlaceholderText(targetPlaceholder.slice(0, index + 1));
        index++;
      } else {
        clearInterval(interval);
      }
    }, 60); // Kecepatan ketikan placeholder

    return () => clearInterval(interval);
  }, [isExistingUser]);

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
    }, 45);

    return () => clearInterval(interval);
  }, [isExistingUser]);

  // Validasi apakah form sudah terisi lengkap tergantung mode (Daftar vs Login)
  const isFormValid = isLoginMode 
    ? (username?.trim().length > 0 && pin?.length === 6) 
    : (username?.trim().length > 0 && pin?.length === 6 && umur !== "" && berat !== "" && isUsernameAgreed);

  // Handler Login User dengan Pemicu Notifikasi Merah
  const handleUserLoginWrapper = () => {
    if (!isExistingUser) {
      if (!username || username.trim().length === 0) {
        setValidationMsg("isi nama dulu sayang");
        return;
      }
      if (!pin || pin.length !== 6) {
        setValidationMsg("PIN harus 6 angka sayang");
        return;
      }
      // Validasi tambahan ini hanya jalan jika mode DAFTAR BARU
      if (!isLoginMode) {
        if (!umur || !berat) {
          setValidationMsg("pilih dulu sayang");
          return;
        }
        if (!isUsernameAgreed) {
          setValidationMsg("ceklist dulu sayang");
          return;
        }
      }
    }
    
    setValidationMsg("");
    // Mengirim status isLoginMode ke parent (page.tsx)
    handleUserLogin(isLoginMode);
  };

  // --- LOGIK STYLING OUTLINE DINAMIS (MANDIRI & SPESIFIK) ---
  
  // 1. Outline untuk Input Username
  const usernameBorderClass = isFormValid
    ? 'border-emerald-500 border-2'
    : (validationMsg === "isi nama dulu sayang")
      ? 'border-red-500 animate-pulse border-2'
      : 'border-white/30 border';

  // 1b. Outline untuk Input PIN (Baru)
  const pinBorderClass = isFormValid
    ? 'border-emerald-500 border-2'
    : (validationMsg === "PIN harus 6 angka sayang")
      ? 'border-red-500 animate-pulse border-2'
      : 'border-white/30 border';

  // 2. Outline Mandiri untuk Dropdown Umur
  const umurBorderClass = isFormValid
    ? 'border-emerald-500 border-2'
    : (validationMsg && !umur)
      ? 'border-red-500 animate-pulse border-2'
      : 'border-blue-400 border-2';

  // 3. Outline Mandiri untuk Dropdown Berat
  const beratBorderClass = isFormValid
    ? 'border-emerald-500 border-2'
    : (validationMsg && !berat)
      ? 'border-red-500 animate-pulse border-2'
      : 'border-blue-400 border-2';

  // 4. Outline untuk Ceklist Warning
  const checkboxBorderClass = isFormValid
    ? 'border-emerald-500/50 border-2'
    : (validationMsg === "ceklist dulu sayang")
      ? 'border-red-500 animate-pulse border-2'
      : 'border-white/20 border';

  // 5. Pengaturan Tombol Utama (Pill)
  let buttonStyle = "";
  let buttonText = "";

  if (isExistingUser) {
    buttonStyle = "bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700 border-emerald-400 shadow-green-500/20";
    buttonText = "Masuk Chat";
  } else if (validationMsg) {
    buttonStyle = "bg-gradient-to-r from-rose-500 to-red-600 hover:from-rose-600 hover:to-red-700 border-red-400 shadow-rose-500/20";
    buttonText = validationMsg;
  } else if (isFormValid) {
    buttonStyle = "bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700 border-emerald-400 shadow-green-500/20";
    buttonText = isLoginMode ? "Masuk" : "Gabung";
  } else {
    buttonStyle = "bg-gradient-to-r from-blue-500 to-cyan-600 hover:from-blue-600 hover:to-cyan-700 border-cyan-400 shadow-blue-500/20";
    buttonText = isLoginMode ? "Masuk" : "Gabung";
  }

  return (
    // Background utama full screen
    <div className="fixed inset-0 flex flex-col items-center justify-center p-4 sm:p-6 z-50 bg-transparent overflow-hidden w-full font-sans">
      
      {/* Main Card - Responsif adaptif dan blur 5% */}
      <div className="w-full max-w-[95%] sm:max-w-sm md:max-w-md flex flex-col items-center bg-white/5 backdrop-blur-sm border border-white/10 p-6 sm:p-8 rounded-[2rem] sm:rounded-[2.5rem] shadow-[0_12px_40px_rgba(0,0,0,0.2)] z-20 relative overflow-hidden transition-all duration-300">
        
        {activeTab === 'user' ? (
          <div className="w-full flex flex-col items-center relative z-10">
            
            {/* Input Nama / Username - Selalu tampil. Jika isExistingUser, input disable dan bergaya pill abu-abu */}
            <input 
              autoComplete="off" 
              readOnly={isExistingUser}
              className={`w-full p-3.5 sm:p-4 rounded-full focus:outline-none transition-all text-center text-base sm:text-lg tracking-wide mb-3 shadow-inner font-bold backdrop-blur-sm ${
                isExistingUser 
                  ? 'bg-neutral-500/30 text-gray-700 border border-white/20 cursor-not-allowed opacity-90' 
                  : 'bg-neutral-500/20 text-blue-900 placeholder-neutral-500 focus:ring-2 focus:ring-blue-300 ' + usernameBorderClass
              }`}
              placeholder={placeholderText} 
              value={username || ""} 
              onChange={(e) => {
                if (isExistingUser) return;
                setUsername(e.target.value.slice(0, 20));
                if (validationMsg) setValidationMsg(""); 
              }} 
              maxLength={20}
            />
            
            {/* Input PIN 6 Digit - Menggunakan as any untuk menghilangkan error typescript */}
            <input 
              type="text" 
              style={{ WebkitTextSecurity: 'disc' } as any} 
              inputMode="numeric"
              autoComplete="new-password"
              readOnly={isExistingUser}
              className={`w-full p-3.5 sm:p-4 rounded-full focus:outline-none transition-all text-center text-base sm:text-lg tracking-wide mb-4 shadow-inner font-bold backdrop-blur-sm ${
                isExistingUser 
                  ? 'bg-neutral-500/30 text-gray-700 border border-white/20 cursor-not-allowed opacity-90' 
                  : 'bg-neutral-500/20 text-blue-900 placeholder-neutral-500 focus:ring-2 focus:ring-blue-300 ' + pinBorderClass
              }`}
              placeholder="PIN 6 Digit (Angka)" 
              value={pin || ""} 
              onChange={(e) => {
                if (isExistingUser) return;
                const val = e.target.value.replace(/\D/g, '').slice(0, 6);
                setPin(val);
                if (validationMsg) setValidationMsg(""); 
              }} 
              maxLength={6}
            />
            
            {/* Kolom Pilihan Umur dan Berat HANYA TAMPIL SAAT DAFTAR BARU */}
            {!isExistingUser && !isLoginMode && (
              <div className="grid grid-cols-2 gap-3 w-full mb-5 sm:mb-6">
                <div className="relative">
                  <select 
                    value={umur}
                    onChange={(e) => {
                      setUmur(e.target.value);
                      if (validationMsg) setValidationMsg("");
                    }}
                    className={`w-full p-3 bg-white/40 backdrop-blur-sm text-gray-900 font-bold rounded-3xl focus:outline-none appearance-none shadow-sm cursor-pointer text-center text-xs sm:text-sm transition-all duration-300 ${umurBorderClass}`}
                  >
                    <option value="" disabled>Umur</option>
                    <option value="20+">20+</option>
                    <option value="25+">25+</option>
                    <option value="30+">30+</option>
                    <option value="35+">35+</option>
                    <option value="40+">40+</option>
                  </select>
                  <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2.5 sm:px-3 text-gray-700">
                    <svg className="fill-current h-3.5 w-3.5 sm:h-4 sm:w-4" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20"><path d="M9.293 12.95l.707.707L15.657 8l-1.414-1.414L10 10.828 5.757 6.586 4.343 8z"/></svg>
                  </div>
                </div>

                <div className="relative">
                  <select 
                    value={berat}
                    onChange={(e) => {
                      setBerat(e.target.value);
                      if (validationMsg) setValidationMsg("");
                    }}
                    className={`w-full p-3 bg-white/40 backdrop-blur-sm text-gray-800 font-bold rounded-3xl focus:outline-none appearance-none shadow-sm cursor-pointer text-center text-xs sm:text-sm transition-all duration-300 ${beratBorderClass}`}
                  >
                    <option value="" disabled>Berat</option>
                    <option value="<55">&lt;55</option>
                    <option value="60+">60+</option>
                    <option value="70+">70+</option>
                    <option value="80+">80+</option>
                    <option value="90+">90+</option>
                    <option value="100+">100+</option>
                  </select>
                  <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2.5 sm:px-3 text-gray-700">
                    <svg className="fill-current h-3.5 w-3.5 sm:h-4 sm:w-4" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20"><path d="M9.293 12.95l.707.707L15.657 8l-1.414-1.414L10 10.828 5.757 6.586 4.343 8z"/></svg>
                  </div>
                </div>
              </div>
            )}

            {isExistingUser && (
              /* Existing User Note - 2 Paragraf */
              <motion.div 
                layout
                className="text-xs sm:text-sm text-gray-800 mt-1 mb-5 sm:mb-6 text-center leading-relaxed bg-white/50 backdrop-blur-md border border-white/30 px-5 py-4 rounded-3xl w-full min-h-[95px] flex items-center justify-center shadow-inner font-semibold transition-all duration-300 whitespace-pre-line"
              >
                <span className="w-full block">
                  {displayedNote}
                  {!isNoteTypingDone && <span className="animate-pulse ml-0.5 text-blue-900 font-bold">|</span>}
                </span>
              </motion.div>
            )}

            {/* Tombol Login Pintar */}
            <button 
              onClick={handleUserLoginWrapper} 
              className={`w-full py-3.5 sm:py-4 mb-3 text-white font-bold text-sm sm:text-md shadow-lg transition-all rounded-full tracking-wider border-2 active:scale-95 cursor-pointer ${buttonStyle}`}
            >
              {buttonText}
            </button>

            {/* Kolom Centang warning username HANYA TAMPIL SAAT DAFTAR */}
            {!isExistingUser && !isLoginMode && (
              <motion.div 
                whileHover={{ scale: 1.01 }}
                className={`bg-white/20 backdrop-blur-sm px-3.5 sm:px-4 py-2.5 sm:py-3 rounded-full shadow-sm w-full flex items-center justify-center gap-2 transition-all select-none ${checkboxBorderClass}`}
              >
                <input 
                  type="checkbox" 
                  id="username-agree" 
                  className="w-3.5 h-3.5 sm:w-4 sm:h-4 accent-blue-500 border-white/40 rounded cursor-pointer"
                  checked={isUsernameAgreed}
                  onChange={(e) => {
                    setIsUsernameAgreed(e.target.checked);
                    if (validationMsg) setValidationMsg(""); 
                  }}
                />
                <label htmlFor="username-agree" className="text-[10px] sm:text-[11px] font-small tracking-wide text-gray-500 drop-shadow-sm cursor-pointer leading-none">
                  *Mengikuti aturan di dalam chat  
                </label>
              </motion.div>
            )}

            {/* Tombol Pindah Mode: Daftar Baru <--> Login Lama */}
            {!isExistingUser && (
              <div className="mt-4 text-center">
                <button
                  onClick={() => {
                    setIsLoginMode(!isLoginMode);
                    setValidationMsg(""); // Reset warning saat ganti mode
                  }}
                  className="text-[11px] sm:text-xs text-blue-900/70 hover:text-blue-900 font-bold underline transition-colors focus:outline-none"
                >
                  {isLoginMode ? "Belum punya akun? Buat Baru" : "Punya akun lama? Login pakai PIN"}
                </button>
              </div>
            )}
          </div>
        ) : (
          <div className="w-full flex flex-col items-center relative z-10">
            {/* Input Admin */}
            <input 
              autoComplete="off" 
              className="w-full p-3.5 sm:p-4 mb-3.5 bg-white/40 backdrop-blur-sm text-gray-900 placeholder-gray-700 border border-white/30 rounded-full focus:border-blue-400 focus:ring-2 focus:ring-blue-300 focus:outline-none transition-all text-center text-sm sm:text-md tracking-wide shadow-inner font-bold" 
              placeholder="Email Admin" 
              value={adminEmail || ""} 
              onChange={(e) => setAdminEmail(e.target.value)} 
            />
            {/* Menggunakan as any untuk menghilangkan error typescript */}
            <input 
              type="text" 
              style={{ WebkitTextSecurity: 'disc' } as any}
              autoComplete="new-password" 
              className="w-full p-3.5 sm:p-4 mb-6 sm:mb-8 bg-white/40 backdrop-blur-sm text-gray-900 placeholder-gray-700 border border-white/30 rounded-full focus:border-blue-400 focus:ring-2 focus:ring-blue-300 focus:outline-none transition-all text-center text-sm sm:text-md tracking-wide shadow-inner font-bold" 
              placeholder="Password Admin" 
              value={adminPass || ""} 
              onChange={(e) => setAdminPass(e.target.value)} 
            />
            
            <button 
              onClick={handleAdminLogin} 
              className="w-full py-3.5 sm:py-4 bg-gradient-to-r from-blue-500 to-cyan-600 hover:from-blue-600 hover:to-cyan-700 text-white font-bold text-sm sm:text-md shadow-lg hover:shadow-xl active:scale-95 transition-all rounded-full tracking-wider border-2 border-cyan-400">
              Gabung Admin
            </button>
          </div>
        )}
      </div>
    </div>
  );
}