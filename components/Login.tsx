'use client';
import { motion } from 'framer-motion';
import { useState, useEffect } from 'react';
import { useTheme } from '@/app/context/ThemeContext';

// --- CONFIG SOSMED IPIX ---
const socialPlatforms = [
  { name: 'Twitter', label: 'Twitter : sixripix', link: 'https://x.com/sixripix' },
  { name: 'TikTok', label: 'Tiktok : ipixaja', link: 'https://tiktok.com/@ipixaja' },
  { name: 'Heesay', label: 'Heesay/Walla : V206MN/ipiX', link: 'https://international.walla-app.com/user?id=V2O6MN&app=2' },
  { name: 'Growlr', label: 'Growlr : pix', link: 'https://www.growlrapp.com' },
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
  <svg className="w-5 h-5 opacity-70 cursor-pointer hover:opacity-100 transition-opacity" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" /></svg>
);
const EyeOffIcon = () => (
  <svg className="w-5 h-5 opacity-70 cursor-pointer hover:opacity-100 transition-opacity" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.542-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l18 18" /></svg>
);

// --- REUSABLE COMPONENTS WITH DYNAMIC THEME ---
const InputField = ({ icon, suffix, readOnly, className, style, ...props }: any) => (
  <div 
    className={`flex items-center w-full rounded-full px-4 py-3 sm:py-3.5 mb-3 border transition-all duration-300 ${className}`}
    style={style}
  >
    <div className="mr-3 flex-shrink-0 opacity-80" style={{ color: "var(--accent)" }}>{icon}</div>
    <input 
      readOnly={readOnly}
      className="bg-transparent outline-none flex-1 text-sm font-extrabold w-full placeholder:opacity-50 disabled:cursor-not-allowed"
      style={{ color: "var(--foreground-heading)" }}
      {...props}
    />
    {suffix && <div className="ml-2 flex-shrink-0 flex items-center">{suffix}</div>}
  </div>
);

const SelectField = ({ icon, options, value, onChange, placeholder, className, style }: any) => (
  <div 
    className={`flex items-center w-full rounded-full px-4 py-3 sm:py-3.5 mb-3 border relative transition-all duration-300 ${className}`}
    style={style}
  >
    <div className="mr-3 flex-shrink-0 opacity-80" style={{ color: "var(--accent)" }}>{icon}</div>
    <select 
      value={value}
      onChange={onChange}
      className="bg-transparent outline-none flex-1 text-sm font-extrabold w-full appearance-none cursor-pointer"
      style={{ color: "var(--foreground-heading)" }}
    >
      <option value="" disabled style={{ backgroundColor: "var(--background)", color: "var(--foreground)" }}>{placeholder}</option>
      {options.map((opt: string) => (
        <option key={opt} value={opt} style={{ backgroundColor: "var(--background)", color: "var(--foreground-heading)" }}>
          {opt}
        </option>
      ))}
    </select>
    <div className="pointer-events-none absolute right-4 opacity-70" style={{ color: "var(--foreground-heading)" }}>
      <svg className="w-4 h-4 fill-current" viewBox="0 0 20 20"><path d="M9.293 12.95l.707.707L15.657 8l-1.414-1.414L10 10.828 5.757 6.586 4.343 8z"/></svg>
    </div>
  </div>
);

// =============================================
// ✅ KONSTANTA TRANSISI ANTI-GLITCH
// =============================================
const PANEL_TRANSITION = {
  type: "tween" as const,
  duration: 0.45,
  ease: [0.4, 0, 0.2, 1] as [number, number, number, number],
};

const FORM_TRANSITION = {
  duration: 0.45,
  ease: [0.4, 0, 0.2, 1] as [number, number, number, number],
};

const CONTENT_TRANSITION = {
  duration: 0.25,
  ease: "easeOut" as const,
};

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
  const { theme } = useTheme();

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

  // --- INSET SHADOW & THEME STYLES ---
  const inputInset = 'shadow-[inset_0_4px_8px_rgba(0,0,0,0.25)]';
  const glassBox = 'shadow-[0_8px_32px_rgba(0,0,0,0.3)] backdrop-blur-xl border';

  // State Warna Input Dinamis Berdasarkan Tema
  const normalInputStyle = {
    backgroundColor: "var(--card-bg)",
    borderColor: "var(--card-border)",
  };

  const validInputStyle = {
    backgroundColor: "color-mix(in srgb, var(--accent) 15%, transparent)",
    borderColor: "var(--accent)",
  };

  const errorInputStyle = {
    backgroundColor: "rgba(239, 68, 68, 0.15)",
    borderColor: "rgb(239, 68, 68)",
  };

  const getInputStyle = (isError: boolean) => {
    if (isFormValid) return validInputStyle;
    if (isError) return errorInputStyle;
    return normalInputStyle;
  };

  const usernameStyle = getInputStyle(validationMsg === "Isi nama dulu sayang");
  const pinStyle = getInputStyle(Boolean(validationMsg === "PIN harus 6 angka sayang" || (!isLoginMode && validationMsg && (!pin || pin.length !== 6))));
  const umurStyle = getInputStyle(Boolean(validationMsg && !umur));
  const beratStyle = getInputStyle(Boolean(validationMsg && !berat));

  const existingStyle = {
    backgroundColor: "var(--card-bg)",
    borderColor: "var(--card-border)",
    opacity: 0.8,
  };

  // --- TOMBOL UTAMA ---
  let buttonStyleObj: React.CSSProperties = {};
  let buttonText = "";

  if (isExistingUser) {
    buttonStyleObj = {
      backgroundColor: "var(--accent)",
      color: "var(--background)",
      boxShadow: "0 0 15px var(--accent-glow)",
    };
    buttonText = "Masuk Chat";
  } else if (validationMsg) {
    buttonStyleObj = {
      backgroundColor: "#ef4444",
      color: "#ffffff",
      boxShadow: "0 0 15px rgba(239, 68, 68, 0.5)",
    };
    buttonText = validationMsg;
  } else if (isFormValid) {
    buttonStyleObj = {
      backgroundColor: "var(--accent)",
      color: "var(--background)",
      boxShadow: "0 0 20px var(--accent-glow)",
    };
    buttonText = isLoginMode ? "Masuk Sekarang" : "Gabung Sekarang";
  } else {
    buttonStyleObj = {
      backgroundColor: "var(--card-bg)",
      color: "var(--foreground-heading)",
      border: "1px solid var(--card-border)",
    };
    buttonText = isLoginMode ? "Login" : "Register";
  }

  // ✅ GPU ACCELERATION STYLE — mencegah repaint flicker
  const gpuStyle = { 
    transform: 'translateZ(0)', 
    backfaceVisibility: 'hidden' as const,
    WebkitBackfaceVisibility: 'hidden' as const,
  };

  return (
    <div className="fixed inset-0 flex justify-center items-center bg-transparent z-50 overflow-hidden font-sans sm:p-6">
      
      {/* ⚪ MAIN CARD */}
      <div 
        className="relative w-full h-[100dvh] sm:h-[820px] sm:max-h-[95vh] sm:max-w-[420px] bg-transparent sm:rounded-[2.5rem] overflow-hidden flex flex-col z-10"
        style={{ contain: 'layout style' }}
      >
        
        {activeTab === 'user' ? (
          <>
            {/* 🔵 SLIDE OVERLAY PANEL */}
            <motion.div
              initial={false}
              animate={{
                y: isLoginMode ? '0%' : '185.7%',
              }}
              transition={PANEL_TRANSITION}
              className={`absolute left-0 right-0 top-0 h-[35%] z-20 flex flex-col items-center justify-center p-4 overflow-hidden border ${glassBox} ${isLoginMode ? 'rounded-b-[2.5rem]' : 'rounded-t-[2.5rem]'}`}
              style={{ 
                ...gpuStyle, 
                willChange: 'transform',
                backgroundColor: "color-mix(in srgb, var(--card-bg) 85%, var(--background))",
                borderColor: "var(--card-border)",
                color: "var(--foreground)",
              }}
            >
              <div className="relative w-full h-full flex items-center justify-center drop-shadow-md">
                
                {/* View For Login Mode */}
                <motion.div
                  initial={false}
                  animate={{ opacity: isLoginMode ? 1 : 0 }}
                  transition={CONTENT_TRANSITION}
                  className="absolute flex flex-col items-center text-center w-full"
                  style={{ pointerEvents: isLoginMode ? 'auto' : 'none' }}
                >
                  <div className="flex flex-col items-center w-full mb-3">
                    <p className="text-[10px] font-extrabold uppercase tracking-wide mb-2 opacity-80" style={{ color: "var(--foreground)" }}>
                      Sosial Media Ipix
                    </p>
                    <div className="grid grid-cols-2 gap-2 w-full px-4">
                      {socialPlatforms.map((platform) => (
                        <a 
                          key={platform.name} 
                          href={platform.link} 
                          target="_blank" 
                          rel="noopener noreferrer" 
                          className="w-full px-2 py-1.5 rounded-full border font-black text-[10px] tracking-wide text-center transition-all duration-300 active:scale-95 shadow-sm"
                          style={{
                            backgroundColor: "var(--card-bg)",
                            borderColor: "var(--card-border)",
                            color: "var(--foreground-heading)"
                          }}
                        >
                          {platform.label}
                        </a>
                      ))}
                    </div>
                  </div>

                  {!isExistingUser && (
                    <button 
                      onClick={() => { setIsLoginMode(false); setValidationMsg(""); }}
                      className="w-[85%] py-2.5 rounded-full font-extrabold text-xs transition-all active:scale-95 tracking-wider shadow-md"
                      style={{
                        backgroundColor: "var(--accent)",
                        color: "var(--background)",
                        boxShadow: "0 0 15px var(--accent-glow)"
                      }}
                    >
                      Register
                    </button>
                  )}
                </motion.div>

                {/* View For Register Mode */}
                <motion.div
                  initial={false}
                  animate={{ opacity: !isLoginMode ? 1 : 0 }}
                  transition={CONTENT_TRANSITION}
                  className="absolute flex flex-col items-center text-center w-full"
                  style={{ pointerEvents: !isLoginMode ? 'auto' : 'none' }}
                >
                  <button 
                    onClick={() => { setIsLoginMode(true); setValidationMsg(""); }}
                    className="w-[85%] py-2.5 mb-3 rounded-full font-extrabold text-xs transition-all active:scale-95 tracking-wider shadow-md"
                    style={{
                      backgroundColor: "var(--accent)",
                      color: "var(--background)",
                      boxShadow: "0 0 15px var(--accent-glow)"
                    }}
                  >
                    Login
                  </button>

                  <div className="flex flex-col items-center w-full">
                    <p className="text-[10px] font-extrabold uppercase tracking-wide mb-2 opacity-80" style={{ color: "var(--foreground)" }}>
                      Sosial Media Ipix
                    </p>
                    <div className="grid grid-cols-2 gap-2 w-full px-4">
                      {socialPlatforms.map((platform) => (
                        <a 
                          key={platform.name} 
                          href={platform.link} 
                          target="_blank" 
                          rel="noopener noreferrer" 
                          className="w-full px-2 py-1.5 rounded-full border font-black text-[10px] tracking-wide text-center transition-all duration-300 active:scale-95 shadow-sm"
                          style={{
                            backgroundColor: "var(--card-bg)",
                            borderColor: "var(--card-border)",
                            color: "var(--foreground-heading)"
                          }}
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
            <div className="absolute inset-0 z-10 w-full h-full">
              
              {/* === REGISTER FORM === */}
              <motion.div
                initial={false}
                animate={{ 
                  opacity: !isLoginMode ? 1 : 0,
                  y: !isLoginMode ? '0%' : '8%',
                }}
                transition={FORM_TRANSITION}
                className="absolute top-0 w-full h-[65%] px-4 sm:px-6 py-4 flex flex-col items-center justify-center overflow-y-auto [&::-webkit-scrollbar]:hidden"
                style={{ 
                  pointerEvents: !isLoginMode ? 'auto' : 'none',
                  ...gpuStyle,
                  willChange: 'transform, opacity',
                }}
              >
                <div 
                  className={`w-full rounded-[2.5rem] p-6 sm:p-8 flex flex-col items-center border ${glassBox}`}
                  style={{
                    backgroundColor: "color-mix(in srgb, var(--background) 90%, transparent)",
                    borderColor: "var(--card-border)",
                  }}
                >
                  <InputField 
                    icon={<UserIcon />} 
                    placeholder={placeholderText || "Username"} 
                    value={username || ""} 
                    onChange={(e: any) => {
                      setUsername(e.target.value.slice(0, 20));
                      if (validationMsg) setValidationMsg(""); 
                    }}
                    className={inputInset}
                    style={usernameStyle}
                    autoComplete="off"
                  />
                  
                  <InputField 
                    icon={<LockIcon />} 
                    placeholder="Password (PIN)" 
                    type="text"
                    style={pinStyle}
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
                    className={inputInset}
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
                      className={inputInset}
                      style={umurStyle}
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
                      className={inputInset}
                      style={beratStyle}
                    />
                  </div>

                  <div className="flex items-center justify-start w-full mb-4 px-2 select-none">
                    <input 
                      type="checkbox" 
                      id="agree" 
                      className="w-3.5 h-3.5 cursor-pointer rounded-sm accent-[var(--accent)]"
                      checked={isUsernameAgreed}
                      onChange={(e) => {
                        setIsUsernameAgreed(e.target.checked);
                        if (validationMsg) setValidationMsg(""); 
                      }}
                    />
                    <label 
                      htmlFor="agree" 
                      className="text-[11px] font-light italic ml-2 cursor-pointer select-none leading-none opacity-80"
                      style={{ color: "var(--foreground)" }}
                    >
                      *Mengikuti aturan di dalam chat
                    </label>
                  </div>

                  <button 
                    onClick={handleUserLoginWrapper}
                    className={`w-full py-3 rounded-full font-extrabold tracking-wider transition-all active:scale-[0.98] cursor-pointer shadow-md ${validationMsg ? "animate-pulse" : ""}`}
                    style={buttonStyleObj}
                  >
                    {buttonText}
                  </button>
                </div>
              </motion.div>


              {/* === LOGIN FORM === */}
              <motion.div
                initial={false}
                animate={{ 
                  opacity: isLoginMode ? 1 : 0,
                  y: isLoginMode ? '0%' : '-8%',
                }}
                transition={FORM_TRANSITION}
                className="absolute bottom-0 w-full h-[65%] px-4 sm:px-6 py-4 flex flex-col items-center justify-center overflow-y-auto [&::-webkit-scrollbar]:hidden"
                style={{ 
                  pointerEvents: isLoginMode ? 'auto' : 'none',
                  ...gpuStyle,
                  willChange: 'transform, opacity',
                }}
              >
                <div 
                  className={`w-full rounded-[2.5rem] p-6 sm:p-8 flex flex-col items-center border ${glassBox}`}
                  style={{
                    backgroundColor: "color-mix(in srgb, var(--background) 90%, transparent)",
                    borderColor: "var(--card-border)",
                  }}
                >
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
                    className={inputInset}
                    style={isExistingUser ? existingStyle : usernameStyle}
                    autoComplete="off"
                  />
                  
                  <InputField 
                    icon={<LockIcon />} 
                    placeholder="Password (PIN)" 
                    type="text"
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
                    className={inputInset}
                    style={isExistingUser ? existingStyle : pinStyle}
                    maxLength={6}
                  />

                  {isExistingUser && (
                    <div 
                      className={`w-full text-xs p-4 border rounded-3xl mb-4 font-extrabold text-center whitespace-pre-line leading-relaxed min-h-[65px] flex items-center justify-center ${inputInset}`}
                      style={{
                        backgroundColor: "var(--card-bg)",
                        borderColor: "var(--card-border)",
                        color: "var(--foreground-heading)"
                      }}
                    >
                      <span className="w-full block drop-shadow-sm">
                        {displayedNote}
                        {!isNoteTypingDone && <span className="animate-pulse ml-0.5">|</span>}
                      </span>
                    </div>
                  )}

                  <button 
                    onClick={handleUserLoginWrapper}
                    className={`w-full py-3 rounded-full font-extrabold tracking-wider transition-all active:scale-[0.98] cursor-pointer mt-1 shadow-md ${validationMsg ? "animate-pulse" : ""}`}
                    style={buttonStyleObj}
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
             <div 
               className={`w-full rounded-[2.5rem] p-6 sm:p-8 flex flex-col items-center border ${glassBox}`}
               style={{
                 backgroundColor: "color-mix(in srgb, var(--background) 90%, transparent)",
                 borderColor: "var(--card-border)",
               }}
             >
              <InputField 
                icon={<MailIcon />} 
                placeholder="Email Admin" 
                value={adminEmail || ""} 
                onChange={(e: any) => setAdminEmail(e.target.value)} 
                className={inputInset}
                style={normalInputStyle}
                autoComplete="off"
              />
              
              <InputField 
                icon={<LockIcon />} 
                placeholder="Password Admin" 
                type="text"
                style={normalInputStyle}
                value={adminPass || ""} 
                onChange={(e: any) => setAdminPass(e.target.value)} 
                className={`${inputInset} mb-6`}
              />
              
              <button 
                onClick={handleAdminLogin} 
                className="w-full py-3.5 mt-2 rounded-full font-extrabold tracking-wider transition-all active:scale-[0.98] shadow-md"
                style={{
                  backgroundColor: "var(--accent)",
                  color: "var(--background)",
                  boxShadow: "0 0 15px var(--accent-glow)",
                }}
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