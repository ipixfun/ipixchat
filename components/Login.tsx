'use client';
import { motion } from 'framer-motion';
import { useState, useEffect } from 'react';

// --- CONFIG SOSMED IPIX (Custom Glassmorphism Style) ---
const socialPlatforms = [
  { 
    name: 'Twitter', 
    label: 'Twitter : sixripix', 
    color: 'bg-sky-500/10 text-sky-400 border-sky-400/30 hover:bg-sky-500/20 shadow-[0_0_12px_rgba(14,165,233,0.15)] backdrop-blur-sm', 
    link: 'https://x.com/sixripix' 
  },
  { 
    name: 'TikTok', 
    label: 'Tiktok : ipixaja', 
    color: 'bg-zinc-950/40 text-zinc-200 border-purple-500/30 hover:bg-zinc-950/60 shadow-[0_0_12px_rgba(168,85,247,0.15),_0_0_12px_rgba(6,182,212,0.15)] backdrop-blur-sm', 
    link: 'https://tiktok.com/@ipixaja' 
  },
  { 
    name: 'Heesay', 
    label: 'Heesay/Walla : V206MN/ipiX', 
    color: 'bg-pink-500/10 text-pink-400 border-pink-400/30 hover:bg-pink-500/20 shadow-[0_0_12px_rgba(236,72,153,0.15)] backdrop-blur-sm', 
    link: 'https://international.walla-app.com/user?id=V2O6MN&app=2' 
  },
  { 
    name: 'Growlr', 
    label: 'Growlr : pix', 
    color: 'bg-amber-950/20 text-amber-600 border-amber-700/30 hover:bg-amber-950/40 shadow-[0_0_12px_rgba(180,83,9,0.15)] backdrop-blur-sm', 
    link: 'https://www.growlrapp.com' 
  },
];

// --- ICONS ---
const UserIcon = () => (
  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" /></svg>
);
const LockIcon = () => (
  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" /></svg>
);
const CalendarIcon = () => (
  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg>
);
const ScaleIcon = () => (
  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 6l3 1m0 0l-3 9a5.002 5.002 0 006.001 0M6 7l3 9M6 7l6-2m6 2l3-1m-3 1l-3 9a5.002 5.002 0 006.001 0M18 7l3 9m-3-9l-6-2m0-2v2m0 16V5m0 16H9m3 0h3" /></svg>
);
const MailIcon = () => (
  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" /></svg>
);
const EyeIcon = () => (
  <svg className="w-5 h-5 text-slate-500 cursor-pointer hover:text-slate-800 transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" /></svg>
);
const EyeOffIcon = () => (
  <svg className="w-5 h-5 text-slate-500 cursor-pointer hover:text-slate-800 transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.542-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l18 18" /></svg>
);

// --- REUSABLE COMPONENTS ---
const InputField = ({ icon, suffix, readOnly, className, ...props }: any) => (
  <div className={`flex items-center w-full rounded-full px-4 py-3 sm:py-3.5 mb-3 border transition-all duration-300 shadow-[inset_0_2px_4px_rgba(0,0,0,0.06)] ${className}`}>
    <div className="mr-3 flex-shrink-0 opacity-60">
      {icon}
    </div>
    <input 
      readOnly={readOnly}
      className="bg-transparent outline-none flex-1 text-sm font-extrabold w-full placeholder-slate-400 disabled:cursor-not-allowed text-inherit"
      {...props}
    />
    {suffix && <div className="ml-2 flex-shrink-0 flex items-center">{suffix}</div>}
  </div>
);

const SelectField = ({ icon, options, value, onChange, placeholder, className }: any) => (
  <div className={`flex items-center w-full rounded-full px-4 py-3 sm:py-3.5 mb-3 border relative transition-all duration-300 shadow-[inset_0_2px_4px_rgba(0,0,0,0.06)] ${className}`}>
    <div className="mr-3 flex-shrink-0 opacity-60">
      {icon}
    </div>
    <select 
      value={value}
      onChange={onChange}
      className="bg-transparent outline-none flex-1 text-sm font-extrabold w-full appearance-none cursor-pointer text-slate-900"
    >
      <option value="" disabled className="text-slate-900">{placeholder}</option>
      {options.map((opt: string) => <option key={opt} value={opt} className="text-slate-900">{opt}</option>)}
    </select>
    <div className="pointer-events-none absolute right-4 opacity-60 text-slate-900">
      <svg className="w-4 h-4 fill-current" viewBox="0 0 20 20"><path d="M9.293 12.95l.707.707L15.657 8l-1.414-1.414L10 10.828 5.757 6.586 4.343 8z"/></svg>
    </div>
  </div>
);

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
  const existingNote = "Login otomatis ketika anda sudah register .\nUntuk ubah nama atau pin hubungi admin di chat .";
  const [displayedNote, setDisplayedNote] = useState("");
  const [isNoteTypingDone, setIsNoteTypingDone] = useState(false);
  const [placeholderText, setPlaceholderText] = useState("");
  const [isLoginMode, setIsLoginMode] = useState(true);
  const [isUsernameAgreed, setIsUsernameAgreed] = useState(false);
  const [validationMsg, setValidationMsg] = useState("");
  const [showPin, setShowPin] = useState(false);

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

  // --- LOGIK STYLING INPUT & BORDER ---
  const usernameBorderClass = isFormValid
    ? 'border-emerald-400/60 bg-green-50/50 text-green-950 font-extrabold' 
    : (validationMsg === "Isi nama dulu sayang")
      ? 'border-red-400 bg-red-50 text-red-950 font-extrabold animate-pulse' 
      : 'border-gray-200 bg-gray-50/80 text-slate-900 focus-within:border-gray-400/70 font-extrabold';

  const pinBorderClass = isFormValid
    ? 'border-emerald-400/60 bg-green-50/50 text-green-950 font-extrabold'
    : (validationMsg === "PIN harus 6 angka sayang" || (!isLoginMode && validationMsg && (!pin || pin.length !== 6)))
      ? 'border-red-400 bg-red-50 text-red-950 font-extrabold animate-pulse'
      : 'border-gray-200 bg-gray-50/80 text-slate-900 focus-within:border-gray-400/70 font-extrabold';

  const umurBorderClass = isFormValid
    ? 'border-emerald-400/60 bg-green-50/50 text-green-950'
    : (validationMsg && !umur)
      ? 'border-red-400 bg-red-50 text-red-950 animate-pulse'
      : 'border-gray-200 bg-gray-50/80 text-slate-900 focus-within:border-gray-400/70';

  const beratBorderClass = isFormValid
    ? 'border-emerald-400/60 bg-green-50/50 text-green-950'
    : (validationMsg && !berat)
      ? 'border-red-400 bg-red-50 text-red-950 animate-pulse'
      : 'border-gray-200 bg-gray-50/80 text-slate-900 focus-within:border-gray-400/70';

  const checkboxBorderClass = isFormValid
    ? 'border-emerald-400/40 bg-white/20 shadow-[0_0_15px_rgba(16,185,129,0.15)]'
    : (validationMsg === "Ceklist dulu sayang")
      ? 'border-red-400 animate-pulse bg-white/20 shadow-[0_0_15px_rgba(239,68,68,0.2)]'
      : 'border-gray-200 bg-gray-50/50 shadow-[inset_0_2px_4px_rgba(0,0,0,0.04)]';

  // --- LOGIK STYLING TOMBOL UTAMA & GLOW PANELS ---
  let buttonStyle = "";
  let buttonText = "";

  if (isExistingUser) {
    buttonStyle = "bg-emerald-500/10 text-emerald-600 border border-emerald-400/50 hover:bg-emerald-500/20 shadow-[0_0_15px_rgba(16,185,129,0.25)]";
    buttonText = "Masuk Chat";
  } else if (validationMsg) {
    buttonStyle = "bg-rose-500/10 text-rose-600 border border-rose-400/50 shadow-[0_0_15px_rgba(244,63,94,0.25)] animate-pulse";
    buttonText = validationMsg;
  } else if (isFormValid) {
    if (isLoginMode) {
      buttonStyle = "bg-emerald-500/20 text-emerald-600 border border-emerald-400/60 hover:bg-emerald-500/30 shadow-[0_0_20px_rgba(16,185,129,0.35)]";
      buttonText = "Masuk Sekarang";
    } else {
      buttonStyle = "bg-blue-500/20 text-blue-600 border border-blue-400/60 hover:bg-blue-500/30 shadow-[0_0_20px_rgba(59,130,246,0.35)]";
      buttonText = "Gabung Sekarang";
    }
  } else {
    if (isLoginMode) {
      buttonStyle = "bg-emerald-500/10 text-emerald-500/80 border border-emerald-400/40 hover:bg-emerald-500/20 shadow-[0_0_12px_rgba(16,185,129,0.15)]";
      buttonText = "Login";
    } else {
      buttonStyle = "bg-blue-500/10 text-blue-500/80 border border-blue-400/40 hover:bg-blue-500/20 shadow-[0_0_12px_rgba(59,130,246,0.15)]";
      buttonText = "Register";
    }
  }

  return (
    <div className="fixed inset-0 flex justify-center items-center bg-transparent z-50 overflow-hidden font-sans sm:p-6">
      
      {/* ⚪ MAIN CARD */}
      <div className="relative w-full h-[100dvh] sm:h-[820px] sm:max-h-[95vh] sm:max-w-[420px] bg-transparent sm:rounded-[2.5rem] overflow-hidden flex flex-col z-10 transition-all duration-300">
        
        {activeTab === 'user' ? (
          <>
            {/* 🔵 KOTAK SLIDE OVERLAY PANEL */}
            <motion.div
              layout
              initial={false}
              animate={{
                top: isLoginMode ? '0%' : '65%',
                borderBottomLeftRadius: isLoginMode ? '2.5rem' : '0rem',
                borderBottomRightRadius: isLoginMode ? '2.5rem' : '0rem',
                borderTopLeftRadius: isLoginMode ? '0rem' : '2.5rem',
                borderTopRightRadius: isLoginMode ? '0rem' : '2.5rem',
              }}
              transition={{ type: "spring", stiffness: 350, damping: 30 }}
              className="absolute left-0 right-0 h-[35%] bg-transparent backdrop-blur-md border border-white/20 z-20 flex flex-col items-center justify-center p-4 text-white overflow-hidden shadow-sm"
            >
              <div className="relative w-full h-full flex items-center justify-center drop-shadow-md">
                
                {/* View For Login Mode (Sosmed DIATAS, Register Biru DIBAWAH) */}
                <motion.div
                  animate={{ opacity: isLoginMode ? 1 : 0, scale: isLoginMode ? 1 : 0.95 }}
                  transition={{ duration: 0.3 }}
                  className="absolute flex flex-col items-center text-center w-full"
                  style={{ pointerEvents: isLoginMode ? 'auto' : 'none' }}
                >
                  {/* Sosmed Section */}
                  <div className="flex flex-col items-center w-full mb-3">
                    <p className="text-[10px] font-extrabold text-white/70 mb-2 tracking-wide uppercase drop-shadow-md">Sosial Media Ipix</p>
                    <div className="flex flex-wrap justify-center gap-2 px-4">
                      {socialPlatforms.map((platform) => (
                        <a 
                          key={platform.name} 
                          href={platform.link} 
                          target="_blank" 
                          rel="noopener noreferrer" 
                          className={`px-3 py-1.5 rounded-full border font-black text-[10px] tracking-wide transition-all duration-300 active:scale-95 ${platform.color}`}
                        >
                          {platform.label}
                        </a>
                      ))}
                    </div>
                  </div>

                  {/* Pill Register Floating Blue Glow */}
                  {!isExistingUser && (
                    <button 
                      onClick={() => { setIsLoginMode(false); setValidationMsg(""); }}
                      className="w-[85%] py-2.5 rounded-full bg-blue-500/10 hover:bg-blue-500/20 text-blue-400 font-extrabold border border-blue-400/40 transition-all text-sm active:scale-95 shadow-[0_0_15px_rgba(59,130,246,0.25)] tracking-wider backdrop-blur-md"
                    >
                      Register
                    </button>
                  )}
                </motion.div>

                {/* View For Register Mode (Login Hijau DIATAS, Sosmed DIBAWAH) */}
                <motion.div
                  animate={{ opacity: !isLoginMode ? 1 : 0, scale: !isLoginMode ? 1 : 0.95 }}
                  transition={{ duration: 0.3 }}
                  className="absolute flex flex-col items-center text-center w-full"
                  style={{ pointerEvents: !isLoginMode ? 'auto' : 'none' }}
                >
                  {/* Pill Login Floating Green Glow */}
                  <button 
                    onClick={() => { setIsLoginMode(true); setValidationMsg(""); }}
                    className="w-[85%] py-2.5 mb-3 rounded-full bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-400 font-extrabold border border-emerald-400/40 transition-all text-sm active:scale-95 shadow-[0_0_15px_rgba(16,185,129,0.25)] tracking-wider backdrop-blur-md"
                  >
                    Login
                  </button>

                  {/* Sosmed Section */}
                  <div className="flex flex-col items-center w-full">
                    <p className="text-[10px] font-extrabold text-white/70 mb-2 tracking-wide uppercase drop-shadow-md">Sosial Media Ipix</p>
                    <div className="flex flex-wrap justify-center gap-2 px-4">
                      {socialPlatforms.map((platform) => (
                        <a 
                          key={platform.name} 
                          href={platform.link} 
                          target="_blank" 
                          rel="noopener noreferrer" 
                          className={`px-3 py-1.5 rounded-full border font-black text-[10px] tracking-wide transition-all duration-300 active:scale-95 ${platform.color}`}
                        >
                          {platform.label}
                        </a>
                      ))}
                    </div>
                  </div>
                </motion.div>
                
              </div>
            </motion.div>

            {/* ⚪ FORMS CONTAINER */}
            <div className="absolute inset-0 z-10 w-full h-full bg-transparent">
              
              {/* === REGISTER FORM === */}
              <motion.div
                animate={{ opacity: !isLoginMode ? 1 : 0, y: !isLoginMode ? 0 : 20 }}
                transition={{ duration: 0.3 }}
                className="absolute top-0 w-full h-[65%] px-4 sm:px-6 py-4 flex flex-col items-center justify-center bg-transparent overflow-y-auto [&::-webkit-scrollbar]:hidden"
                style={{ pointerEvents: !isLoginMode ? 'auto' : 'none' }}
              >
                <div className="w-full bg-white/85 backdrop-blur-xl rounded-[2.5rem] shadow-2xl border border-white/60 p-6 sm:p-8 flex flex-col items-center">
                  
                  <InputField 
                    icon={<UserIcon />} 
                    placeholder={placeholderText || "Username"} 
                    value={username || ""} 
                    onChange={(e: any) => {
                      setUsername(e.target.value.slice(0, 20));
                      if (validationMsg) setValidationMsg(""); 
                    }}
                    className={usernameBorderClass}
                    autoComplete="off"
                  />
                  
                  <InputField 
                    icon={<LockIcon />} 
                    placeholder="Password (PIN)" 
                    type="text"
                    style={showPin ? {} : ({ WebkitTextSecurity: 'disc' } as any)}
                    inputMode="numeric"
                    value={pin || ""} 
                    onChange={(e: any) => {
                      const val = e.target.value.replace(/\D/g, '').slice(0, 6);
                      setPin(val);
                      if (validationMsg) setValidationMsg(""); 
                    }}
                    suffix={
                      <button type="button" onClick={() => setShowPin(!showPin)} className="focus:outline-none">
                        {showPin ? <EyeOffIcon /> : <EyeIcon />}
                      </button>
                    }
                    className={pinBorderClass}
                    maxLength={6}
                  />
                  
                  <div className="flex gap-3 w-full">
                    <SelectField 
                      icon={<CalendarIcon />} 
                      placeholder="Umur" 
                      options={["20+", "25+", "30+", "35+", "40+"]}
                      value={umur}
                      onChange={(e: any) => {
                        setUmur(e.target.value);
                        if (validationMsg) setValidationMsg("");
                      }}
                      className={umurBorderClass}
                    />
                    <SelectField 
                      icon={<ScaleIcon />} 
                      placeholder="Berat" 
                      options={["<55", "60+", "70+", "80+", "90+", "100+"]}
                      value={berat}
                      onChange={(e: any) => {
                        setBerat(e.target.value);
                        if (validationMsg) setValidationMsg("");
                      }}
                      className={beratBorderClass}
                    />
                  </div>

                  <div className={`flex items-center justify-center w-full mb-4 py-2 px-4 border rounded-full backdrop-blur-md select-none transition-all duration-300 ${checkboxBorderClass}`}>
                    <input 
                      type="checkbox" 
                      id="agree" 
                      className="w-4 h-4 accent-blue-500 cursor-pointer rounded drop-shadow-sm"
                      checked={isUsernameAgreed}
                      onChange={(e) => {
                        setIsUsernameAgreed(e.target.checked);
                        if (validationMsg) setValidationMsg(""); 
                      }}
                    />
                    <label htmlFor="agree" className="text-xs font-extrabold text-slate-700 ml-2 cursor-pointer select-none leading-none drop-shadow-sm">
                      *Mengikuti aturan di dalam chat
                    </label>
                  </div>

                  <button 
                    onClick={handleUserLoginWrapper}
                    className={`w-full py-3 rounded-full font-extrabold tracking-wider transition-all active:scale-[0.98] cursor-pointer ${buttonStyle}`}
                  >
                    {buttonText}
                  </button>
                </div>
              </motion.div>


              {/* === LOGIN FORM === */}
              <motion.div
                animate={{ opacity: isLoginMode ? 1 : 0, y: isLoginMode ? 0 : -20 }}
                transition={{ duration: 0.3 }}
                className="absolute bottom-0 w-full h-[65%] px-4 sm:px-6 py-4 flex flex-col items-center justify-center bg-transparent overflow-y-auto [&::-webkit-scrollbar]:hidden"
                style={{ pointerEvents: isLoginMode ? 'auto' : 'none' }}
              >
                <div className="w-full bg-white/85 backdrop-blur-xl rounded-[2.5rem] shadow-2xl border border-white/60 p-6 sm:p-8 flex flex-col items-center">
                  
                  <InputField 
                    icon={<UserIcon />} 
                    placeholder={placeholderText || "Username"} 
                    value={username || ""} 
                    onChange={(e: any) => {
                      if (isExistingUser) return;
                      setUsername(e.target.value.slice(0, 20));
                      if (validationMsg) setValidationMsg(""); 
                    }}
                    readOnly={isExistingUser}
                    className={isExistingUser ? 'bg-gray-100 text-slate-700 border-emerald-400/40 cursor-not-allowed font-extrabold' : usernameBorderClass}
                    autoComplete="off"
                  />
                  
                  <InputField 
                    icon={<LockIcon />} 
                    placeholder="Password (PIN)" 
                    type="text"
                    style={showPin ? {} : ({ WebkitTextSecurity: 'disc' } as any)}
                    inputMode="numeric"
                    value={pin || ""} 
                    onChange={(e: any) => {
                      if (isExistingUser) return;
                      const val = e.target.value.replace(/\D/g, '').slice(0, 6);
                      setPin(val);
                      if (validationMsg) setValidationMsg(""); 
                    }}
                    suffix={
                      <button type="button" onClick={() => setShowPin(!showPin)} className="focus:outline-none">
                        {showPin ? <EyeOffIcon /> : <EyeIcon />}
                      </button>
                    }
                    readOnly={isExistingUser}
                    className={isExistingUser ? 'bg-gray-100 text-slate-700 border-emerald-400/40 cursor-not-allowed font-extrabold' : pinBorderClass}
                    maxLength={6}
                  />

                  {/* LOGIN OTOMATIS NOTE CONTAINER (Soft Green Border + Gray Insert Shadow) */}
                  {isExistingUser && (
                    <div className="w-full text-xs text-slate-800 bg-gray-50/90 p-4 border border-emerald-400/40 rounded-3xl mb-4 font-extrabold text-center shadow-[inset_0_2px_4px_rgba(0,0,0,0.06),0_0_10px_rgba(16,185,129,0.05)] whitespace-pre-line leading-relaxed min-h-[65px] flex items-center justify-center">
                      <span className="w-full block drop-shadow-sm">
                        {displayedNote}
                        {!isNoteTypingDone && <span className="animate-pulse ml-0.5 text-emerald-500">|</span>}
                      </span>
                    </div>
                  )}

                  <button 
                    onClick={handleUserLoginWrapper}
                    className={`w-full py-3 rounded-full font-extrabold tracking-wider transition-all active:scale-[0.98] cursor-pointer mt-1 ${buttonStyle}`}
                  >
                    {buttonText}
                  </button>
                </div>
              </motion.div>

            </div>
          </>
        ) : (
          
          /* === ADMIN TAB === */
          <div className="absolute inset-0 z-10 w-full h-full px-4 sm:px-6 py-6 flex flex-col items-center justify-center bg-transparent">
             <div className="w-full bg-white/85 backdrop-blur-xl rounded-[2.5rem] shadow-2xl border border-white/60 p-6 sm:p-8 flex flex-col items-center">
              
              <InputField 
                icon={<MailIcon />} 
                placeholder="Email Admin" 
                value={adminEmail || ""} 
                onChange={(e: any) => setAdminEmail(e.target.value)} 
                className="border-gray-200 bg-gray-50/80 text-slate-900 focus-within:border-gray-400/70"
                autoComplete="off"
              />
              
              <InputField 
                icon={<LockIcon />} 
                placeholder="Password Admin" 
                type="text"
                style={showPin ? {} : ({ WebkitTextSecurity: 'disc' } as any)}
                value={adminPass || ""} 
                onChange={(e: any) => setAdminPass(e.target.value)} 
                className="border-gray-200 bg-gray-50/80 text-slate-900 focus-within:border-gray-400/70 mb-6"
              />
              
              <button 
                onClick={handleAdminLogin} 
                className="w-full bg-slate-900/10 hover:bg-slate-900/20 text-slate-800 py-3.5 mt-2 rounded-full font-extrabold border border-slate-300 shadow-[inset_0_1px_2px_rgba(255,255,255,0.4),0_0_12px_rgba(15,23,42,0.1)] tracking-wider transition-all active:scale-[0.98]"
              >
                Gabung Admin
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}