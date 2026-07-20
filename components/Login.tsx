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
    }, 60);

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
        setValidationMsg("Isi nama dulu sayang");
        return;
      }
      if (!pin || pin.length !== 6) {
        setValidationMsg("PIN harus 6 angka sayang");
        return;
      }
      // Validasi tambahan ini hanya jalan jika mode DAFTAR BARU
      if (!isLoginMode) {
        if (!umur || !berat) {
          setValidationMsg("Pilih umur & berat sayang");
          return;
        }
        if (!isUsernameAgreed) {
          setValidationMsg("Ceklist dulu sayang");
          return;
        }
      }
    }
    
    setValidationMsg("");
    // Mengirim status isLoginMode ke parent untuk membedakan Insert (Daftar) atau Select (Login) di Supabase
    handleUserLogin(isLoginMode);
  };

  // --- LOGIK STYLING OUTLINE DINAMIS (TEMA GLASS PUTIH, HIJAU, BIRU, MERAH) ---
  
  // 1. Outline untuk Input Username
  const usernameBorderClass = isFormValid
    ? 'border-green-500 border-2 bg-green-50/30 text-green-900' // Hijau jika valid
    : (validationMsg === "Isi nama dulu sayang")
      ? 'border-red-500 animate-pulse border-2 bg-red-50/40 text-red-900' // Merah jika error
      : 'border-blue-400 border-2 bg-white/40 text-blue-900'; // Biru default

  // 1b. Outline untuk Input PIN
  const pinBorderClass = isFormValid
    ? 'border-green-500 border-2 bg-green-50/30 text-green-900'
    : (validationMsg === "PIN harus 6 angka sayang")
      ? 'border-red-500 animate-pulse border-2 bg-red-50/40 text-red-900'
      : 'border-blue-400 border-2 bg-white/40 text-blue-900';

  // 2. Outline Mandiri untuk Dropdown Umur
  const umurBorderClass = isFormValid
    ? 'border-green-500 border-2 bg-green-50/30 text-green-950'
    : (validationMsg && !umur)
      ? 'border-red-500 animate-pulse border-2 bg-red-50/40 text-red-950'
      : 'border-blue-400 border-2 bg-white/40 text-blue-950';

  // 3. Outline Mandiri untuk Dropdown Berat
  const beratBorderClass = isFormValid
    ? 'border-green-500 border-2 bg-green-50/30 text-green-950'
    : (validationMsg && !berat)
      ? 'border-red-500 animate-pulse border-2 bg-red-50/40 text-red-950'
      : 'border-blue-400 border-2 bg-white/40 text-blue-950';

  // 4. Outline untuk Ceklist Warning
  const checkboxBorderClass = isFormValid
    ? 'border-green-500/60 border-2 bg-green-100/30'
    : (validationMsg === "Ceklist dulu sayang")
      ? 'border-red-500 animate-pulse border-2 bg-red-100/40'
      : 'border-blue-300 border-2 bg-white/30';

  // 5. Pengaturan Tombol Utama (Pill) - Menggunakan Gradient Hijau, Biru, Merah
  let buttonStyle = "";
  let buttonText = "";

  if (isExistingUser) {
    buttonStyle = "bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700 border-green-400 shadow-[0_4px_15px_rgba(34,197,94,0.4)] text-white";
    buttonText = "Masuk Chat";
  } else if (validationMsg) {
    buttonStyle = "bg-gradient-to-r from-red-500 to-red-600 hover:from-red-600 hover:to-red-700 border-red-400 shadow-[0_4px_15px_rgba(239,68,68,0.4)] text-white";
    buttonText = validationMsg;
  } else if (isFormValid) {
    buttonStyle = "bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700 border-green-400 shadow-[0_4px_15px_rgba(34,197,94,0.4)] text-white";
    buttonText = isLoginMode ? "Masuk Sekarang" : "Gabung Sekarang";
  } else {
    buttonStyle = "bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 border-blue-400 shadow-[0_4px_15px_rgba(59,130,246,0.4)] text-white";
    buttonText = isLoginMode ? "Masuk" : "Gabung";
  }

  return (
    <div className="fixed inset-0 flex flex-col items-center justify-center p-4 sm:p-6 z-50 bg-transparent overflow-hidden w-full font-sans">
      
      {/* Main Card - Efek Glass Putih Terang dengan bayangan lembut */}
      <div className="w-full max-w-[95%] sm:max-w-sm md:max-w-md flex flex-col items-center bg-white/20 backdrop-blur-md border border-white/50 p-6 sm:p-8 rounded-[2rem] sm:rounded-[2.5rem] shadow-[0_8px_32px_rgba(0,0,0,0.1)] z-20 relative overflow-hidden transition-all duration-300">
        
        {activeTab === 'user' ? (
          <div className="w-full flex flex-col items-center relative z-10">
            
            {/* Input Nama / Username */}
            <input 
              autoComplete="off" 
              readOnly={isExistingUser}
              className={`w-full p-3.5 sm:p-4 rounded-full focus:outline-none transition-all text-center text-base sm:text-lg tracking-wide mb-3 shadow-inner font-extrabold backdrop-blur-md placeholder-gray-600 ${
                isExistingUser 
                  ? 'bg-gray-200/50 text-gray-800 border-2 border-gray-300/50 cursor-not-allowed opacity-90' 
                  : `focus:ring-4 focus:ring-blue-300/50 ${usernameBorderClass}`
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
            
            {/* Input PIN 6 Digit */}
            <input 
              type="text" 
              style={{ WebkitTextSecurity: 'disc' } as any} 
              inputMode="numeric"
              autoComplete="new-password"
              readOnly={isExistingUser}
              className={`w-full p-3.5 sm:p-4 rounded-full focus:outline-none transition-all text-center text-base sm:text-lg tracking-wide mb-4 shadow-inner font-extrabold backdrop-blur-md placeholder-gray-600 ${
                isExistingUser 
                  ? 'bg-gray-200/50 text-gray-800 border-2 border-gray-300/50 cursor-not-allowed opacity-90' 
                  : `focus:ring-4 focus:ring-blue-300/50 ${pinBorderClass}`
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
            
            {/* Kolom Pilihan Umur dan Berat - HANYA TAMPIL SAAT DAFTAR BARU */}
            {!isExistingUser && !isLoginMode && (
              <div className="grid grid-cols-2 gap-3 w-full mb-5 sm:mb-6">
                <div className="relative">
                  <select 
                    value={umur}
                    onChange={(e) => {
                      setUmur(e.target.value);
                      if (validationMsg) setValidationMsg("");
                    }}
                    className={`w-full p-3 backdrop-blur-md font-extrabold rounded-3xl focus:outline-none appearance-none shadow-sm cursor-pointer text-center text-sm transition-all duration-300 ${umurBorderClass}`}
                  >
                    <option value="" disabled>Umur</option>
                    <option value="20+">20+</option>
                    <option value="25+">25+</option>
                    <option value="30+">30+</option>
                    <option value="35+">35+</option>
                    <option value="40+">40+</option>
                  </select>
                  <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-3 text-gray-800">
                    <svg className="fill-current h-4 w-4" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20"><path d="M9.293 12.95l.707.707L15.657 8l-1.414-1.414L10 10.828 5.757 6.586 4.343 8z"/></svg>
                  </div>
                </div>

                <div className="relative">
                  <select 
                    value={berat}
                    onChange={(e) => {
                      setBerat(e.target.value);
                      if (validationMsg) setValidationMsg("");
                    }}
                    className={`w-full p-3 backdrop-blur-md font-extrabold rounded-3xl focus:outline-none appearance-none shadow-sm cursor-pointer text-center text-sm transition-all duration-300 ${beratBorderClass}`}
                  >
                    <option value="" disabled>Berat</option>
                    <option value="<55">&lt;55</option>
                    <option value="60+">60+</option>
                    <option value="70+">70+</option>
                    <option value="80+">80+</option>
                    <option value="90+">90+</option>
                    <option value="100+">100+</option>
                  </select>
                  <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-3 text-gray-800">
                    <svg className="fill-current h-4 w-4" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20"><path d="M9.293 12.95l.707.707L15.657 8l-1.414-1.414L10 10.828 5.757 6.586 4.343 8z"/></svg>
                  </div>
                </div>
              </div>
            )}

            {isExistingUser && (
              /* Existing User Note */
              <motion.div 
                layout
                className="text-xs sm:text-sm text-gray-900 mt-1 mb-5 sm:mb-6 text-center leading-relaxed bg-white/60 backdrop-blur-lg border-2 border-white/70 px-5 py-4 rounded-3xl w-full min-h-[95px] flex items-center justify-center shadow-sm font-bold transition-all duration-300 whitespace-pre-line"
              >
                <span className="w-full block drop-shadow-sm">
                  {displayedNote}
                  {!isNoteTypingDone && <span className="animate-pulse ml-0.5 text-blue-600 font-extrabold">|</span>}
                </span>
              </motion.div>
            )}

            {/* Tombol Login Pintar */}
            <button 
              onClick={handleUserLoginWrapper} 
              className={`w-full py-3.5 sm:py-4 mb-3 font-extrabold text-sm sm:text-md transition-all rounded-full tracking-wider border-2 active:scale-95 cursor-pointer ${buttonStyle}`}
            >
              {buttonText}
            </button>

            {/* Kolom Centang warning HANYA TAMPIL SAAT DAFTAR */}
            {!isExistingUser && !isLoginMode && (
              <motion.div 
                whileHover={{ scale: 1.01 }}
                className={`backdrop-blur-md px-3.5 sm:px-4 py-2.5 sm:py-3 rounded-full shadow-sm w-full flex items-center justify-center gap-2 transition-all select-none ${checkboxBorderClass}`}
              >
                <input 
                  type="checkbox" 
                  id="username-agree" 
                  className="w-4 h-4 accent-blue-600 rounded cursor-pointer"
                  checked={isUsernameAgreed}
                  onChange={(e) => {
                    setIsUsernameAgreed(e.target.checked);
                    if (validationMsg) setValidationMsg(""); 
                  }}
                />
                <label htmlFor="username-agree" className="text-[11px] sm:text-xs font-bold tracking-wide text-gray-800 cursor-pointer leading-none">
                  *Mengikuti aturan di dalam chat  
                </label>
              </motion.div>
            )}

            {/* Tombol Pindah Mode: Daftar Baru <--> Login Lama */}
            {!isExistingUser && (
              <div className="mt-5 text-center">
                <button
                  onClick={() => {
                    setIsLoginMode(!isLoginMode);
                    setValidationMsg(""); // Reset warning
                  }}
                  className="text-xs sm:text-sm text-blue-900 hover:text-blue-700 font-extrabold underline transition-colors focus:outline-none bg-white/40 px-4 py-1.5 rounded-full border border-white/50 shadow-sm"
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
              className="w-full p-3.5 sm:p-4 mb-3.5 bg-white/40 backdrop-blur-md text-gray-900 placeholder-gray-600 border-2 border-blue-300 rounded-full focus:border-blue-500 focus:ring-4 focus:ring-blue-300/50 focus:outline-none transition-all text-center text-sm sm:text-md tracking-wide shadow-inner font-extrabold" 
              placeholder="Email Admin" 
              value={adminEmail || ""} 
              onChange={(e) => setAdminEmail(e.target.value)} 
            />
            <input 
              type="text" 
              style={{ WebkitTextSecurity: 'disc' } as any}
              autoComplete="new-password" 
              className="w-full p-3.5 sm:p-4 mb-6 sm:mb-8 bg-white/40 backdrop-blur-md text-gray-900 placeholder-gray-600 border-2 border-blue-300 rounded-full focus:border-blue-500 focus:ring-4 focus:ring-blue-300/50 focus:outline-none transition-all text-center text-sm sm:text-md tracking-wide shadow-inner font-extrabold" 
              placeholder="Password Admin" 
              value={adminPass || ""} 
              onChange={(e) => setAdminPass(e.target.value)} 
            />
            
            <button 
              onClick={handleAdminLogin} 
              className="w-full py-3.5 sm:py-4 bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white font-extrabold text-sm sm:text-md shadow-[0_4px_15px_rgba(59,130,246,0.4)] active:scale-95 transition-all rounded-full tracking-wider border-2 border-blue-400">
              Gabung Admin
            </button>
          </div>
        )}
      </div>
    </div>
  );
}