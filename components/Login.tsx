'use client';
import { motion } from 'framer-motion';
import { useState, useEffect } from 'react';

// --- CONFIG SOSMED IPIX (Glassmorphism Style) ---
const socialPlatforms = [
  { 
    name: 'Twitter', 
    label: 'Twitter : sixripix', 
    color: 'bg-white/10 text-white border-white/20 hover:bg-white/20 backdrop-blur-sm', 
    link: 'https://x.com/sixripix' 
  },
  { 
    name: 'TikTok', 
    label: 'Tiktok : ipixaja', 
    color: 'bg-white/10 text-white border-white/20 hover:bg-white/20 backdrop-blur-sm', 
    link: 'https://tiktok.com/@ipixaja' 
  },
  { 
    name: 'Heesay', 
    label: 'Heesay/Walla : V206MN/ipiX', 
    color: 'bg-white/10 text-white border-white/20 hover:bg-white/20 backdrop-blur-sm', 
    link: 'https://international.walla-app.com/user?id=V2O6MN&app=2' 
  },
  { 
    name: 'Growlr', 
    label: 'Growlr : pix', 
    color: 'bg-white/10 text-white border-white/20 hover:bg-white/20 backdrop-blur-sm', 
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

// --- REUSABLE COMPONENTS DENGAN ABU MUDA (TANPA BLUR) ---
const InputField = ({ icon, suffix, readOnly, className, ...props }: any) => (
  <div className={`flex items-center w-full rounded-full px-4 py-3 sm:py-3.5 mb-3 border transition-all duration-300 ${className}`}>
    <div className="mr-3 flex-shrink-0 opacity-60">
      {icon}
    </div>
    <input 
      readOnly={readOnly}
      className="bg-transparent outline-none flex-1 text-sm font-extrabold w-full placeholder-slate-400 disabled:cursor-not-allowed text-slate-900"
      {...props}
    />
    {suffix && <div className="ml-2 flex-shrink-0 flex items-center">{suffix}</div>}
  </div>
);

const SelectField = ({ icon, options, value, onChange, placeholder, className }: any) => (
  <div className={`flex items-center w-full rounded-full px-4 py-3 sm:py-3.5 mb-3 border relative transition-all duration-300 ${className}`}>
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

  // --- LOGIK STYLING ABU MUDA ---
  const usernameBorderClass = isFormValid
    ? 'border-green-400 bg-green-50 text-green-950 shadow-[inset_0_2px_4px_rgba(0,0,0,0.02)] font-extrabold' 
    : (validationMsg === "Isi nama dulu sayang")
      ? 'border-red-400 animate-pulse bg-red-50 text-red-950 shadow-[inset_0_2px_4px_rgba(0,0,0,0.02)] font-extrabold' 
      : 'border-gray-300 bg-gray-100 text-slate-900 focus-within:border-[#0B2027] focus-within:bg-gray-50 font-extrabold';

  const pinBorderClass = isFormValid
    ? 'border-green-400 bg-green-50 text-green-950 shadow-[inset_0_2px_4px_rgba(0,0,0,0.02)] font-extrabold'
    : (validationMsg === "PIN harus 6 angka sayang" || (!isLoginMode && validationMsg && (!pin || pin.length !== 6)))
      ? 'border-red-400 animate-pulse bg-red-50 text-red-950 shadow-[inset_0_2px_4px_rgba(0,0,0,0.02)] font-extrabold'
      : 'border-gray-300 bg-gray-100 text-slate-900 focus-within:border-[#0B2027] focus-within:bg-gray-50 font-extrabold';

  const umurBorderClass = isFormValid
    ? 'border-green-400 bg-green-50 text-green-950 shadow-[inset_0_2px_4px_rgba(0,0,0,0.02)]'
    : (validationMsg && !umur)
      ? 'border-red-400 animate-pulse bg-red-50 text-red-950 shadow-[inset_0_2px_4px_rgba(0,0,0,0.02)]'
      : 'border-gray-300 bg-gray-100 text-slate-900 focus-within:border-[#0B2027] focus-within:bg-gray-50';

  const beratBorderClass = isFormValid
    ? 'border-green-400 bg-green-50 text-green-950 shadow-[inset_0_2px_4px_rgba(0,0,0,0.02)]'
    : (validationMsg && !berat)
      ? 'border-red-400 animate-pulse bg-red-50 text-red-950 shadow-[inset_0_2px_4px_rgba(0,0,0,0.02)]'
      : 'border-gray-300 bg-gray-100 text-slate-900 focus-within:border-[#0B2027] focus-within:bg-gray-50';

  const checkboxBorderClass = isFormValid
    ? 'border-green-400/60 bg-white/20 shadow-[0_0_15px_rgba(34,197,94,0.2)]'
    : (validationMsg === "Ceklist dulu sayang")
      ? 'border-red-400 animate-pulse bg-white/20 shadow-[0_0_15px_rgba(239,68,68,0.3)]'
      : 'border-[#235867]/30 bg-white/20 shadow-[0_0_10px_rgba(11,32,39,0.1)]';

  // --- LOGIK STYLING TOMBOL UTAMA ---
  let buttonStyle = "";
  let buttonText = "";

  if (isExistingUser) {
    buttonStyle = "bg-gradient-to-r from-emerald-500 to-green-600 hover:from-emerald-600 hover:to-green-700 border border-green-400 shadow-[inset_0_2px_4px_rgba(255,255,255,0.3),0_0_20px_rgba(34,197,94,0.5)] text-white";
    buttonText = "Masuk Chat";
  } else if (validationMsg) {
    buttonStyle = "bg-gradient-to-r from-rose-500 to-red-600 hover:from-rose-600 hover:to-red-700 border border-red-400 shadow-[inset_0_2px_4px_rgba(255,255,255,0.3),0_0_20px_rgba(239,68,68,0.5)] text-white animate-pulse";
    buttonText = validationMsg;
  } else if (isFormValid) {
    if (isLoginMode) {
      buttonStyle = "bg-gradient-to-r from-emerald-500 to-green-600 hover:from-emerald-600 hover:to-green-700 border border-green-400 shadow-[inset_0_2px_4px_rgba(255,255,255,0.3),0_0_20px_rgba(34,197,94,0.5)] text-white";
      buttonText = "Masuk Sekarang";
    } else {
      // KETIKA PILL REGISTRASI SUDAH DIISI SEMUA -> JADI IJO ("Gabung Sekarang")
      buttonStyle = "bg-gradient-to-r from-emerald-500 to-green-600 hover:from-emerald-600 hover:to-green-700 border border-green-400 shadow-[inset_0_2px_4px_rgba(255,255,255,0.3),0_0_20px_rgba(34,197,94,0.5)] text-white";
      buttonText = "Gabung Sekarang";
    }
  } else {
    if (isLoginMode) {
      buttonStyle = "bg-gradient-to-r from-[#0B2027] to-[#1a3f4c] hover:from-[#13313c] hover:to-[#0B2027] border border-[#235867] shadow-[inset_0_2px_4px_rgba(255,255,255,0.2),0_0_15px_rgba(11,32,39,0.4)] text-white";
      buttonText = "Login";
    } else {
      // SAAT AWAL REGISTRASI (BELUM LENGKAP) -> WARNA BIRU ("Register")
      buttonStyle = "bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 border border-blue-400 shadow-[inset_0_2px_4px_rgba(255,255,255,0.2),0_0_15px_rgba(37,99,235,0.4)] text-white";
      buttonText = "Register";
    }
  }

  return (
    <div className="fixed inset-0 flex justify-center items-center bg-transparent z-50 overflow-hidden font-sans sm:p-6">
      
      {/* ⚪ MAIN CARD - Background Transparant Bening Tipis Banget */}
      <div className="relative w-full h-[100dvh] sm:h-[820px] sm:max-h-[95vh] sm:max-w-[420px] bg-white/[0.03] backdrop-blur-[4px] border border-white/10 sm:rounded-[2.5rem] shadow-[0_8px_32px_rgba(0,0,0,0.05)] overflow-hidden flex flex-col z-10 transition-all duration-300">
        
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
              className="absolute left-0 right-0 h-[35%] bg-[#0B2027]/75 backdrop-blur-xl border border-white/10 z-20 flex flex-col items-center justify-center p-4 text-white overflow-hidden shadow-[0_5px_15px_rgba(0,0,0,0.2)]"
            >
              <div className="relative w-full h-full flex items-center justify-center">
                
                {/* View For Login Mode (Sosmed DIATAS, Register Biru DIBAWAH) */}
                <motion.div
                  animate={{ opacity: isLoginMode ? 1 : 0, scale: isLoginMode ? 1 : 0.95 }}
                  transition={{ duration: 0.3 }}
                  className="absolute flex flex-col items-center text-center w-full"
                  style={{ pointerEvents: isLoginMode ? 'auto' : 'none' }}
                >
                  {/* Sosmed Section */}
                  <div className="flex flex-col items-center w-full mb-3">
                    <p className="text-[10px] font-extrabold text-white/50 mb-2 tracking-wide uppercase">Sosial Media Ipix</p>
                    <div className="flex flex-wrap justify-center gap-2 px-4">
                      {socialPlatforms.map((platform) => (
                        <a 
                          key={platform.name} 
                          href={platform.link} 
                          target="_blank" 
                          rel="noopener noreferrer" 
                          className={`px-3 py-1.5 rounded-full border font-black text-[10px] tracking-wide shadow-sm transition-all duration-300 active:scale-95 ${platform.color}`}
                        >
                          {platform.label}
                        </a>
                      ))}
                    </div>
                  </div>

                  {/* Pill Register Panjang & Biru di bawah Sosmed */}
                  {!isExistingUser && (
                    <button 
                      onClick={() => { setIsLoginMode(false); setValidationMsg(""); }}
                      className="w-[85%] py-2.5 rounded-full bg-blue-600 hover:bg-blue-700 text-white font-extrabold border border-blue-400 transition-all text-sm active:scale-95 shadow-md tracking-wider"
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
                  {/* Pill Login Panjang & Hijau diatas Sosmed */}
                  <button 
                    onClick={() => { setIsLoginMode(true); setValidationMsg(""); }}
                    className="w-[85%] py-2.5 mb-3 rounded-full bg-emerald-600 hover:bg-emerald-700 text-white font-extrabold border border-emerald-400 transition-all text-sm active:scale-95 shadow-md tracking-wider"
                  >
                    Login
                  </button>

                  {/* Sosmed Section */}
                  <div className="flex flex-col items-center w-full">
                    <p className="text-[10px] font-extrabold text-white/50 mb-2 tracking-wide uppercase">Sosial Media Ipix</p>
                    <div className="flex flex-wrap justify-center gap-2 px-4">
                      {socialPlatforms.map((platform) => (
                        <a 
                          key={platform.name} 
                          href={platform.link} 
                          target="_blank" 
                          rel="noopener noreferrer" 
                          className={`px-3 py-1.5 rounded-full border font-black text-[10px] tracking-wide shadow-sm transition-all duration-300 active:scale-95 ${platform.color}`}
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
                className="absolute top-0 w-full h-[65%] px-6 sm:px-8 py-4 sm:py-6 flex flex-col items-center justify-center bg-transparent overflow-y-auto [&::-webkit-scrollbar]:hidden"
                style={{ pointerEvents: !isLoginMode ? 'auto' : 'none' }}
              >
                <h2 className="text-2xl sm:text-3xl font-extrabold mb-4 sm:mb-6 text-[#0B2027] drop-shadow-sm">Registration</h2>
                
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
                    className="w-4 h-4 accent-[#0B2027] cursor-pointer rounded drop-shadow-sm"
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
              </motion.div>


              {/* === LOGIN FORM === */}
              <motion.div
                animate={{ opacity: isLoginMode ? 1 : 0, y: isLoginMode ? 0 : -20 }}
                transition={{ duration: 0.3 }}
                className="absolute bottom-0 w-full h-[65%] px-6 sm:px-8 py-4 sm:py-6 flex flex-col items-center justify-center bg-transparent overflow-y-auto [&::-webkit-scrollbar]:hidden"
                style={{ pointerEvents: isLoginMode ? 'auto' : 'none' }}
              >
                <h2 className="text-2xl sm:text-3xl font-extrabold mb-4 sm:mb-6 text-[#0B2027] drop-shadow-sm">Login</h2>
                
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
                  className={isExistingUser ? 'bg-gray-200/60 text-slate-500 border-gray-300 cursor-not-allowed opacity-75' : usernameBorderClass}
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
                  className={isExistingUser ? 'bg-gray-200/60 text-slate-500 border-gray-300 cursor-not-allowed opacity-75' : pinBorderClass}
                  maxLength={6}
                />

                {/* LOGIN OTOMATIS NOTE CONTAINER (TANPA BLUR) */}
                {isExistingUser && (
                  <div className="w-full text-xs text-[#0B2027] bg-gray-100 p-4 border border-gray-300 rounded-3xl mb-4 font-extrabold text-center shadow-[inset_0_2px_4px_rgba(0,0,0,0.02)] whitespace-pre-line leading-relaxed min-h-[65px] flex items-center justify-center">
                    <span className="w-full block drop-shadow-sm">
                      {displayedNote}
                      {!isNoteTypingDone && <span className="animate-pulse ml-0.5 text-[#0B2027]">|</span>}
                    </span>
                  </div>
                )}

                <button 
                  onClick={handleUserLoginWrapper}
                  className={`w-full py-3 rounded-full font-extrabold tracking-wider transition-all active:scale-[0.98] cursor-pointer mt-1 ${buttonStyle}`}
                >
                  {buttonText}
                </button>
              </motion.div>

            </div>
          </>
        ) : (
          
          /* === ADMIN TAB === */
          <div className="absolute inset-0 z-10 w-full h-full px-6 sm:px-8 py-6 flex flex-col items-center justify-center bg-transparent">
            <h2 className="text-3xl font-extrabold mb-8 text-[#0B2027] drop-shadow-sm">Admin Login</h2>
            
            <InputField 
              icon={<MailIcon />} 
              placeholder="Email Admin" 
              value={adminEmail || ""} 
              onChange={(e: any) => setAdminEmail(e.target.value)} 
              className="border-gray-300 bg-gray-100 text-slate-900 focus-within:border-[#0B2027]"
              autoComplete="off"
            />
            
            <InputField 
              icon={<LockIcon />} 
              placeholder="Password Admin" 
              type="text"
              style={showPin ? {} : ({ WebkitTextSecurity: 'disc' } as any)}
              value={adminPass || ""} 
              onChange={(e: any) => setAdminPass(e.target.value)} 
              className="border-gray-300 bg-gray-100 text-slate-900 focus-within:border-[#0B2027] mb-6"
            />
            
            <button 
              onClick={handleAdminLogin} 
              className="w-full bg-gradient-to-r from-[#0B2027] to-[#1a3f4c] hover:from-[#13313c] hover:to-[#0B2027] text-white py-3.5 mt-4 rounded-full font-extrabold shadow-[inset_0_2px_4px_rgba(255,255,255,0.2),0_0_15px_rgba(11,32,39,0.4)] border border-[#235867] tracking-wider transition-all active:scale-[0.98]"
            >
              Gabung Admin
            </button>
          </div>
        )}
      </div>
    </div>
  );
}