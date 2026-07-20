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
  const existingNote = "Maaf user dan pin tidak bisa diubah.\n\nHubungi admin di chat untuk merubahnya.";
  const [displayedNote, setDisplayedNote] = useState("");
  const [isNoteTypingDone, setIsNoteTypingDone] = useState(false);
  const [placeholderText, setPlaceholderText] = useState("");
  const [isLoginMode, setIsLoginMode] = useState(false);
  const [isUsernameAgreed, setIsUsernameAgreed] = useState(false);
  const [validationMsg, setValidationMsg] = useState("");

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

  const isFormValid = isLoginMode
    ? (username?.trim().length > 0 && pin?.length === 6)
    : (username?.trim().length > 0 && pin?.length === 6 && umur !== "" && berat !== "" && isUsernameAgreed);

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
    handleUserLogin(isLoginMode);
  };

  // --- LOGIK STYLING: PILL INSERT SHADOW & COLORED GLOW ---

  // 1. Outline & Glow untuk Input Username
  const usernameBorderClass = isFormValid
    ? 'border-green-400 bg-white/20 text-green-900 shadow-[inset_0_3px_8px_rgba(0,0,0,0.1),0_0_15px_rgba(34,197,94,0.5)]' 
    : (validationMsg === "Isi nama dulu sayang")
      ? 'border-red-400 animate-pulse bg-white/20 text-red-900 shadow-[inset_0_3px_8px_rgba(0,0,0,0.1),0_0_15px_rgba(239,68,68,0.6)]' 
      : 'border-cyan-300 bg-white/20 text-cyan-900 shadow-[inset_0_3px_8px_rgba(0,0,0,0.1),0_0_15px_rgba(6,182,212,0.4)] focus:shadow-[inset_0_3px_8px_rgba(0,0,0,0.1),0_0_20px_rgba(6,182,212,0.7)]';

  // 1b. Outline & Glow untuk Input PIN
  const pinBorderClass = isFormValid
    ? 'border-green-400 bg-white/20 text-green-900 shadow-[inset_0_3px_8px_rgba(0,0,0,0.1),0_0_15px_rgba(34,197,94,0.5)]'
    : (validationMsg === "PIN harus 6 angka sayang")
      ? 'border-red-400 animate-pulse bg-white/20 text-red-900 shadow-[inset_0_3px_8px_rgba(0,0,0,0.1),0_0_15px_rgba(239,68,68,0.6)]'
      : 'border-cyan-300 bg-white/20 text-cyan-900 shadow-[inset_0_3px_8px_rgba(0,0,0,0.1),0_0_15px_rgba(6,182,212,0.4)] focus:shadow-[inset_0_3px_8px_rgba(0,0,0,0.1),0_0_20px_rgba(6,182,212,0.7)]';

  // 2. Dropdown Umur
  const umurBorderClass = isFormValid
    ? 'border-green-400 bg-white/20 text-green-950 shadow-[inset_0_3px_8px_rgba(0,0,0,0.1),0_0_15px_rgba(34,197,94,0.4)]'
    : (validationMsg && !umur)
      ? 'border-red-400 animate-pulse bg-white/20 text-red-950 shadow-[inset_0_3px_8px_rgba(0,0,0,0.1),0_0_15px_rgba(239,68,68,0.5)]'
      : 'border-cyan-300 bg-white/20 text-cyan-950 shadow-[inset_0_3px_8px_rgba(0,0,0,0.1),0_0_15px_rgba(6,182,212,0.3)]';

  // 3. Dropdown Berat
  const beratBorderClass = isFormValid
    ? 'border-green-400 bg-white/20 text-green-950 shadow-[inset_0_3px_8px_rgba(0,0,0,0.1),0_0_15px_rgba(34,197,94,0.4)]'
    : (validationMsg && !berat)
      ? 'border-red-400 animate-pulse bg-white/20 text-red-950 shadow-[inset_0_3px_8px_rgba(0,0,0,0.1),0_0_15px_rgba(239,68,68,0.5)]'
      : 'border-cyan-300 bg-white/20 text-cyan-950 shadow-[inset_0_3px_8px_rgba(0,0,0,0.1),0_0_15px_rgba(6,182,212,0.3)]';

  // 4. Checkbox Warning
  const checkboxBorderClass = isFormValid
    ? 'border-green-400/60 bg-white/20 shadow-[0_0_15px_rgba(34,197,94,0.3)]'
    : (validationMsg === "Ceklist dulu sayang")
      ? 'border-red-400 animate-pulse bg-white/20 shadow-[0_0_15px_rgba(239,68,68,0.4)]'
      : 'border-cyan-300/60 bg-white/20 shadow-[0_0_10px_rgba(6,182,212,0.2)]';

  // 5. Tombol Utama (Gradient + Glow + Inner Highlight)
  let buttonStyle = "";
  let buttonText = "";

  if (isExistingUser) {
    buttonStyle = "bg-gradient-to-r from-emerald-400 to-green-500 hover:from-emerald-500 hover:to-green-600 border border-green-300 shadow-[inset_0_2px_4px_rgba(255,255,255,0.4),0_0_20px_rgba(34,197,94,0.6)] text-white";
    buttonText = "Masuk Chat";
  } else if (validationMsg) {
    buttonStyle = "bg-gradient-to-r from-rose-400 to-red-500 hover:from-rose-500 hover:to-red-600 border border-red-300 shadow-[inset_0_2px_4px_rgba(255,255,255,0.4),0_0_20px_rgba(239,68,68,0.6)] text-white";
    buttonText = validationMsg;
  } else if (isFormValid) {
    buttonStyle = "bg-gradient-to-r from-emerald-400 to-green-500 hover:from-emerald-500 hover:to-green-600 border border-green-300 shadow-[inset_0_2px_4px_rgba(255,255,255,0.4),0_0_20px_rgba(34,197,94,0.6)] text-white";
    buttonText = isLoginMode ? "Masuk Sekarang" : "Gabung Sekarang";
  } else {
    buttonStyle = "bg-gradient-to-r from-cyan-400 to-blue-500 hover:from-cyan-500 hover:to-blue-600 border border-cyan-300 shadow-[inset_0_2px_4px_rgba(255,255,255,0.4),0_0_20px_rgba(6,182,212,0.6)] text-white";
    buttonText = isLoginMode ? "Masuk" : "Gabung";
  }

  return (
    <div className="fixed inset-0 flex flex-col items-center justify-center p-4 sm:p-6 z-50 bg-slate-900/5 overflow-hidden w-full font-sans">
      
      {/* 🟢🔵 BACKGROUND BLOBS ANIMATION 🔵🟢 */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none z-0">
        <motion.div
          animate={{ scale: [1, 1.2, 1], x: [0, 60, 0], y: [0, 40, 0] }}
          transition={{ duration: 12, repeat: Infinity, ease: "easeInOut" }}
          className="absolute -top-[15%] -left-[10%] w-[400px] h-[400px] sm:w-[600px] sm:h-[600px] bg-cyan-400/30 rounded-full blur-[100px]"
        />
        <motion.div
          animate={{ scale: [1, 1.3, 1], x: [0, -50, 0], y: [0, -60, 0] }}
          transition={{ duration: 15, repeat: Infinity, ease: "easeInOut" }}
          className="absolute -bottom-[15%] -right-[10%] w-[400px] h-[400px] sm:w-[600px] sm:h-[600px] bg-emerald-400/30 rounded-full blur-[100px]"
        />
        <motion.div
          animate={{ scale: [1, 1.5, 1], opacity: [0.2, 0.4, 0.2] }}
          transition={{ duration: 8, repeat: Infinity, ease: "easeInOut" }}
          className="absolute top-[30%] left-[20%] w-[250px] h-[250px] bg-blue-500/20 rounded-full blur-[80px]"
        />
      </div>

      {/* ⚪ MAIN CARD - Glass Effect */}
      <div className="w-full max-w-[95%] sm:max-w-sm md:max-w-md flex flex-col items-center bg-white/10 backdrop-blur-2xl border border-white/30 p-6 sm:p-8 rounded-[2rem] sm:rounded-[2.5rem] shadow-[0_8px_32px_rgba(0,0,0,0.15)] z-20 relative overflow-hidden transition-all duration-300">
        
        {activeTab === 'user' ? (
          <div className="w-full flex flex-col items-center relative z-10">
            
            {/* Input Nama */}
            <input 
              autoComplete="off" 
              readOnly={isExistingUser}
              className={`w-full p-3.5 sm:p-4 border rounded-full focus:outline-none transition-all text-center text-base sm:text-lg tracking-wide mb-3 font-extrabold backdrop-blur-md placeholder-slate-600/70 ${
                isExistingUser 
                  ? 'bg-white/10 text-slate-700 border-white/20 shadow-[inset_0_3px_8px_rgba(0,0,0,0.1)] cursor-not-allowed opacity-80' 
                  : usernameBorderClass
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
            
            {/* Input PIN */}
            <input 
              type="text" 
              style={{ WebkitTextSecurity: 'disc' } as any} 
              inputMode="numeric"
              autoComplete="new-password"
              readOnly={isExistingUser}
              className={`w-full p-3.5 sm:p-4 border rounded-full focus:outline-none transition-all text-center text-base sm:text-lg tracking-wide mb-4 font-extrabold backdrop-blur-md placeholder-slate-600/70 ${
                isExistingUser 
                  ? 'bg-white/10 text-slate-700 border-white/20 shadow-[inset_0_3px_8px_rgba(0,0,0,0.1)] cursor-not-allowed opacity-80' 
                  : pinBorderClass
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
            
            {/* Kolom Pilihan Umur dan Berat */}
            {!isExistingUser && !isLoginMode && (
              <div className="grid grid-cols-2 gap-3 w-full mb-5 sm:mb-6">
                <div className="relative">
                  <select 
                    value={umur}
                    onChange={(e) => {
                      setUmur(e.target.value);
                      if (validationMsg) setValidationMsg("");
                    }}
                    className={`w-full p-3 border backdrop-blur-md font-extrabold rounded-3xl focus:outline-none appearance-none cursor-pointer text-center text-sm transition-all duration-300 ${umurBorderClass}`}
                  >
                    <option value="" disabled className="text-slate-800">Umur</option>
                    <option value="20+" className="text-slate-800">20+</option>
                    <option value="25+" className="text-slate-800">25+</option>
                    <option value="30+" className="text-slate-800">30+</option>
                    <option value="35+" className="text-slate-800">35+</option>
                    <option value="40+" className="text-slate-800">40+</option>
                  </select>
                  <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-3 text-cyan-800">
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
                    className={`w-full p-3 border backdrop-blur-md font-extrabold rounded-3xl focus:outline-none appearance-none cursor-pointer text-center text-sm transition-all duration-300 ${beratBorderClass}`}
                  >
                    <option value="" disabled className="text-slate-800">Berat</option>
                    <option value="<55" className="text-slate-800">&lt;55</option>
                    <option value="60+" className="text-slate-800">60+</option>
                    <option value="70+" className="text-slate-800">70+</option>
                    <option value="80+" className="text-slate-800">80+</option>
                    <option value="90+" className="text-slate-800">90+</option>
                    <option value="100+" className="text-slate-800">100+</option>
                  </select>
                  <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-3 text-cyan-800">
                    <svg className="fill-current h-4 w-4" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20"><path d="M9.293 12.95l.707.707L15.657 8l-1.414-1.414L10 10.828 5.757 6.586 4.343 8z"/></svg>
                  </div>
                </div>
              </div>
            )}

            {/* Existing User Note */}
            {isExistingUser && (
              <motion.div 
                layout
                className="text-xs sm:text-sm text-slate-800 mt-1 mb-5 sm:mb-6 text-center leading-relaxed bg-white/20 backdrop-blur-xl border border-white/30 px-5 py-4 rounded-3xl w-full min-h-[95px] flex items-center justify-center shadow-[0_4px_15px_rgba(0,0,0,0.1)] font-bold transition-all duration-300 whitespace-pre-line"
              >
                <span className="w-full block drop-shadow-sm">
                  {displayedNote}
                  {!isNoteTypingDone && <span className="animate-pulse ml-0.5 text-cyan-500 font-extrabold">|</span>}
                </span>
              </motion.div>
            )}

            {/* Tombol Login */}
            <button 
              onClick={handleUserLoginWrapper} 
              className={`w-full py-3.5 sm:py-4 mb-3 font-extrabold text-sm sm:text-md transition-all rounded-full tracking-wider active:scale-95 cursor-pointer ${buttonStyle}`}
            >
              {buttonText}
            </button>

            {/* Kolom Centang warning */}
            {!isExistingUser && !isLoginMode && (
              <motion.div 
                whileHover={{ scale: 1.01 }}
                className={`backdrop-blur-md px-3.5 sm:px-4 py-2.5 sm:py-3 rounded-full border transition-all select-none w-full flex items-center justify-center gap-2 ${checkboxBorderClass}`}
              >
                <input 
                  type="checkbox" 
                  id="username-agree" 
                  className="w-4 h-4 accent-cyan-500 rounded cursor-pointer drop-shadow-md"
                  checked={isUsernameAgreed}
                  onChange={(e) => {
                    setIsUsernameAgreed(e.target.checked);
                    if (validationMsg) setValidationMsg(""); 
                  }}
                />
                <label htmlFor="username-agree" className="text-[11px] sm:text-xs font-extrabold tracking-wide text-slate-700 cursor-pointer leading-none drop-shadow-sm">
                  *Mengikuti aturan di dalam chat  
                </label>
              </motion.div>
            )}

            {/* Tombol Pindah Mode */}
            {!isExistingUser && (
              <div className="mt-5 text-center">
                <button
                  onClick={() => {
                    setIsLoginMode(!isLoginMode);
                    setValidationMsg("");
                  }}
                  className="text-xs sm:text-sm text-cyan-900 hover:text-cyan-700 font-extrabold underline transition-colors focus:outline-none bg-white/20 px-4 py-1.5 rounded-full border border-white/30 shadow-sm backdrop-blur-md"
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
              className="w-full p-3.5 sm:p-4 mb-3.5 bg-white/20 backdrop-blur-md text-cyan-900 placeholder-slate-600/70 border border-cyan-300 rounded-full focus:outline-none transition-all text-center text-sm sm:text-md tracking-wide shadow-[inset_0_3px_8px_rgba(0,0,0,0.1),0_0_15px_rgba(6,182,212,0.4)] focus:shadow-[inset_0_3px_8px_rgba(0,0,0,0.1),0_0_20px_rgba(6,182,212,0.7)] font-extrabold" 
              placeholder="Email Admin" 
              value={adminEmail || ""} 
              onChange={(e) => setAdminEmail(e.target.value)} 
            />
            <input 
              type="text" 
              style={{ WebkitTextSecurity: 'disc' } as any}
              autoComplete="new-password" 
              className="w-full p-3.5 sm:p-4 mb-6 sm:mb-8 bg-white/20 backdrop-blur-md text-cyan-900 placeholder-slate-600/70 border border-cyan-300 rounded-full focus:outline-none transition-all text-center text-sm sm:text-md tracking-wide shadow-[inset_0_3px_8px_rgba(0,0,0,0.1),0_0_15px_rgba(6,182,212,0.4)] focus:shadow-[inset_0_3px_8px_rgba(0,0,0,0.1),0_0_20px_rgba(6,182,212,0.7)] font-extrabold" 
              placeholder="Password Admin" 
              value={adminPass || ""} 
              onChange={(e) => setAdminPass(e.target.value)} 
            />
            
            <button 
              onClick={handleAdminLogin} 
              className="w-full py-3.5 sm:py-4 bg-gradient-to-r from-cyan-400 to-blue-500 hover:from-cyan-500 hover:to-blue-600 text-white font-extrabold text-sm sm:text-md shadow-[inset_0_2px_4px_rgba(255,255,255,0.4),0_0_20px_rgba(6,182,212,0.6)] active:scale-95 transition-all rounded-full tracking-wider border border-cyan-300">
              Gabung Admin
            </button>
          </div>
        )}
      </div>
    </div>
  );
}