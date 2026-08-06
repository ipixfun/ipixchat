'use client';

import { motion } from 'framer-motion';
import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useTheme } from '@/app/context/ThemeContext';
import BearMascot from './BearMascot';
import { supabase } from '@/app/lib/supabaseClient';

const UserIcon = () => (<svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" /></svg>);
const LockIcon = () => (<svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" /></svg>);
const CalendarIcon = () => (<svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg>);
const ScaleIcon = () => (<svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 6l3 1m0 0l-3 9a5.002 5.002 0 006.001 0M6 7l3 9M6 7l6-2m6 2l3-1m-3 1l-3 9a5.002 5.002 0 006.001 0M18 7l3 9m-3-9l-6-2m0-2v2m0 16V5m0 16H9m3 0h3" /></svg>);
const MailIcon = () => (<svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2 z" /></svg>);
const EyeIcon = () => (<svg className="w-5 h-5 opacity-70 cursor-pointer hover:opacity-100 transition-opacity" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" /></svg>);
const EyeOffIcon = () => (<svg className="w-5 h-5 opacity-70 cursor-pointer hover:opacity-100 transition-opacity" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.542-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l18 18" /></svg>);

const InputField = ({ icon, suffix, readOnly, className, style, type = "text", disabled, ...props }: any) => (
  <div className={`flex items-center w-full rounded-full px-4 py-2.5 sm:py-3 mb-2.5 border transition-all duration-300 ${(readOnly || disabled) ? 'opacity-75 cursor-not-allowed select-none' : ''} ${className}`} style={style}>
    <div className="mr-3 flex-shrink-0 opacity-80" style={{ color: "var(--accent)" }}>{icon}</div>
    <input type={type} readOnly={readOnly} disabled={disabled} className={`bg-transparent outline-none flex-1 text-xs sm:text-sm font-medium w-full placeholder:opacity-50 ${(readOnly || disabled) ? 'cursor-not-allowed select-none' : ''}`} style={{ color: "var(--foreground-heading)" }} {...props} />
    {suffix && <div className="ml-2 flex-shrink-0 flex items-center">{suffix}</div>}
  </div>
);

const SelectField = ({ icon, options, value, onChange, placeholder, className, style, disabled }: any) => (
  <div className={`flex items-center w-full rounded-full px-4 py-2.5 sm:py-3 mb-2.5 border relative transition-all duration-300 ${disabled ? 'opacity-75 cursor-not-allowed' : ''} ${className}`} style={style}>
    <div className="mr-3 flex-shrink-0 opacity-80" style={{ color: "var(--accent)" }}>{icon}</div>
    <select value={value} onChange={onChange} disabled={disabled} className={`bg-transparent outline-none flex-1 text-xs sm:text-sm font-medium w-full appearance-none ${disabled ? 'cursor-not-allowed' : 'cursor-pointer'}`} style={{ color: "var(--foreground-heading)" }}>
      <option value="" disabled style={{ backgroundColor: "var(--background)", color: "var(--foreground)" }}>{placeholder}</option>
      {options.map((opt: string) => (<option key={opt} value={opt} style={{ backgroundColor: "var(--background)", color: "var(--foreground-heading)" }}>{opt}</option>))}
    </select>
    <div className="pointer-events-none absolute right-4 opacity-70" style={{ color: "var(--foreground-heading)" }}><svg className="w-4 h-4 fill-current" viewBox="0 0 20 20"><path d="M9.293 12.95l.707.707L15.657 8l-1.414-1.414L10 10.828 5.757 6.586 4.343 8z"/></svg></div>
  </div>
);

export default function Login({ activeTab, username, setUsername, pin, setPin, umur, setUmur, berat, setBerat, isExistingUser, adminEmail, setAdminEmail, adminPass, setAdminPass, handleUserLogin, handleAdminLogin, isLocked }: any) {
  const { theme } = useTheme();
  const router = useRouter();

  const prefixText = "Welcome back, "; const currentUserName = username || "User"; const suffixText = ".\nUbah nama atau PIN hubungi admin di chat.";
  const totalNoteLength = prefixText.length + currentUserName.length + suffixText.length;
  const [displayedCharCount, setDisplayedCharCount] = useState(0); const [isNoteTypingDone, setIsNoteTypingDone] = useState(false);
  const [placeholderText, setPlaceholderText] = useState(""); 

  const [isLoginMode, setIsLoginMode] = useState(true); 
  const [hasLoggedInBefore, setHasLoggedInBefore] = useState(false);
  const [isUsernameAgreed, setIsUsernameAgreed] = useState(false); const [validationMsg, setValidationMsg] = useState("");
  const [showPin, setShowPin] = useState(false);
  const [isSavedDevice, setIsSavedDevice] = useState(false);
  const [hasTyped, setHasTyped] = useState(false); 
  const [focusedField, setFocusedField] = useState<'username' | 'pin' | 'adminEmail' | 'adminPass' | null>(null);

  const [isRegisterLockedByAdmin, setIsRegisterLockedByAdmin] = useState<boolean>(() => {
    if (typeof window !== 'undefined') {
      const val = localStorage.getItem('is_register_locked');
      return val === 'true' || val === '1';
    }
    return false;
  });

  const sanitizeUsername = (val: string) => {
    if (val.trim().toLowerCase().startsWith("admin")) return val;
    return val.toLowerCase().replace(/\s+/g, '_').replace(/[^a-z0-9_-]/g, '').slice(0, 20);
  };

  useEffect(() => {
    const fetchLockStatus = async () => {
      try {
        const { data } = await supabase
          .from('app_settings')
          .select('value')
          .eq('key', 'register_locked')
          .maybeSingle();

        if (data) {
          const locked = String(data.value) === 'true' || String(data.value) === '1';
          setIsRegisterLockedByAdmin(locked);
          localStorage.setItem('is_register_locked', locked ? 'true' : 'false');
        }
      } catch (e) {}
    };

    fetchLockStatus();

    const channel = supabase
      .channel('register_lock_realtime')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'app_settings' }, (payload: any) => {
        if (payload.new && payload.new.key === 'register_locked') {
          const locked = String(payload.new.value) === 'true' || String(payload.new.value) === '1';
          setIsRegisterLockedByAdmin(locked);
          localStorage.setItem('is_register_locked', locked ? 'true' : 'false');
        }
      })
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  useEffect(() => {
    try {
      const remUser = localStorage.getItem('remembered_username') || localStorage.getItem('username') || localStorage.getItem('active_username');
      const remPin = localStorage.getItem('remembered_pin') || localStorage.getItem('user_pin') || localStorage.getItem('pin') || localStorage.getItem('saved_pin');
      const hideReg = localStorage.getItem('hide_register') === 'true' || localStorage.getItem('has_ever_logged_in') === 'true';

      if (hideReg || isExistingUser) {
        setHasLoggedInBefore(true);
      }

      if (remUser) setUsername(sanitizeUsername(remUser));
      if (remPin) setPin(remPin);

      if (remUser && remPin) {
        setIsSavedDevice(true);
      }
    } catch (e) {}
    setIsLoginMode(true);
  }, []);

  useEffect(() => {
    if (isSavedDevice) return;
    const targetPlaceholder = "Username (Min 5 karakter)"; let index = 0;
    const interval = setInterval(() => { if (index < targetPlaceholder.length) { setPlaceholderText(targetPlaceholder.slice(0, index + 1)); index++; } else clearInterval(interval); }, 60);
    return () => clearInterval(interval);
  }, [isSavedDevice]);

  useEffect(() => {
    if (!isSavedDevice && !isLocked) return;
    setDisplayedCharCount(0); setIsNoteTypingDone(false); let index = 0;
    const interval = setInterval(() => { if (index <= totalNoteLength) { setDisplayedCharCount(index); index++; } else { clearInterval(interval); setIsNoteTypingDone(true); } }, 45);
    return () => clearInterval(interval);
  }, [isSavedDevice, isLocked, username, totalNoteLength]);

  const pLen = prefixText.length; const uLen = currentUserName.length;
  const visiblePrefix = prefixText.slice(0, Math.max(0, displayedCharCount));
  const visibleName = displayedCharCount > pLen ? currentUserName.slice(0, Math.max(0, displayedCharCount - pLen)) : "";
  const visibleSuffix = displayedCharCount > pLen + uLen ? suffixText.slice(0, Math.max(0, displayedCharCount - pLen - uLen)) : "";
  
  const isAdminInput = username?.trim().toLowerCase().startsWith("admin");
  const isFormValid = isSavedDevice ? ((isAdminInput || username?.trim().length >= 5) && pin?.length === 6) : (isLoginMode ? ((isAdminInput || username?.trim().length >= 5) && pin?.length === 6) : ((isAdminInput || username?.trim().length >= 5) && pin?.length === 6 && umur !== "" && berat !== "" && isUsernameAgreed));
  
  const activeTypingLength = focusedField === 'username' ? (username?.length || 0) : focusedField === 'adminEmail' ? (adminEmail?.length || 0) : (focusedField === 'pin' && showPin) ? (pin?.length || 0) : (focusedField === 'adminPass' && showPin) ? (adminPass?.length || 0) : 0;
  
  let bearEyeX = 0;
  if (isSavedDevice || isLocked) {
    bearEyeX = 0; 
  } else if (focusedField) {
    bearEyeX = Math.sin(activeTypingLength * 0.9);
  } else {
    bearEyeX = isLoginMode ? 2.5 : -2.5;
  }

  const isBearCovering = (isSavedDevice || isLocked) ? !showPin : (focusedField === 'pin' || focusedField === 'adminPass') && !showPin;
  const isTyping = !(isSavedDevice || isLocked) && focusedField !== null && !isBearCovering;
  const isLove = isTyping && (focusedField === 'username' || focusedField === 'adminEmail');

  const handleResetSavedDevice = () => {
    setIsSavedDevice(false);
    try {
      localStorage.removeItem('remembered_username');
      localStorage.removeItem('remembered_pin');
      localStorage.removeItem('username');
      localStorage.removeItem('user_pin');
      localStorage.removeItem('saved_pin');
      localStorage.removeItem('pin');
      localStorage.removeItem('active_username');
      sessionStorage.clear();
    } catch (e) {}
    setUsername('');
    setPin('');
    setValidationMsg('');
  };

  const handleUserLoginWrapper = async () => {
    if (isLocked && !isSavedDevice) return;
    
    const isAdmin = username.trim().toLowerCase().startsWith("admin");
    const cleanUser = sanitizeUsername(username || "");
    const isUserTooShort = !isAdmin && cleanUser.length < 5;
    const isPinEmpty = !pin || pin.length !== 6;

    if (isUserTooShort && isPinEmpty) {
      return setValidationMsg("Username (min 5 char) & PIN salah");
    }
    if (isUserTooShort) {
      return setValidationMsg("Username minimal 5 karakter");
    }
    if (isPinEmpty) {
      return setValidationMsg("PIN harus 6 angka");
    }

    if (!isSavedDevice && !isLoginMode) {
      if (isRegisterLockedByAdmin) {
        return setValidationMsg("Pendaftaran ditutup sementara");
      }
      if (!umur || !berat) return setValidationMsg("Pilih umur & berat");
      if (!isUsernameAgreed) return setValidationMsg("Ceklist persetujuan dulu");
    }
    setValidationMsg("");

    try {
      const result = await handleUserLogin(isLoginMode, true);

      if (!result || result === false || (typeof result === 'object' && result.error)) {
        if (isSavedDevice) handleResetSavedDevice();
        
        if (typeof result === 'object' && result.reason) {
          if (result.reason === "USER_NOT_FOUND") return setValidationMsg("Username tidak terdaftar");
          if (result.reason === "INVALID_PIN") return setValidationMsg("PIN yang dimasukkan salah");
          if (result.reason === "BOTH_INVALID") return setValidationMsg("Username & PIN salah");
        }
        return setValidationMsg("Username atau PIN salah");
      }

      localStorage.setItem('hide_register', 'true');
      localStorage.setItem('has_ever_logged_in', 'true');
      setHasLoggedInBefore(true);

      localStorage.setItem('remembered_username', cleanUser);
      localStorage.setItem('remembered_pin', pin);

    } catch (err) { 
      if (isSavedDevice) handleResetSavedDevice();
      setValidationMsg("Gagal melakukan login"); 
    }
  };

  const handleAdminLoginWrapper = async () => { try { const result = await handleAdminLogin(); if (result === false || (result && result.error)) return; } catch (err) {} };

  const inputInset = 'shadow-[inset_0_2px_4px_rgba(0,0,0,0.15)]'; 
  
  const normalInputStyle = { backgroundColor: "var(--card-bg)", borderColor: "var(--card-border)" };
  const validInputStyle = { backgroundColor: "color-mix(in srgb, var(--accent) 15%, transparent)", borderColor: "var(--accent)" };
  const errorInputStyle = { backgroundColor: "rgba(239, 68, 68, 0.15)", borderColor: "rgb(239, 68, 68)" };
  const getInputStyle = (isError: boolean) => { if (isFormValid) return validInputStyle; if (isError) return errorInputStyle; return normalInputStyle; };
  const usernameStyle = getInputStyle(validationMsg.includes("Username") || validationMsg.includes("username") || validationMsg.includes("tidak terdaftar"));
  const pinStyle = getInputStyle(validationMsg.includes("PIN") || validationMsg.includes("pin"));
  const umurStyle = getInputStyle(Boolean(validationMsg && !umur)); const beratStyle = getInputStyle(Boolean(validationMsg && !berat));
  const existingStyle = { backgroundColor: "var(--card-bg)", borderColor: "var(--card-border)", opacity: 0.75 };

  const brightestThemeColor = "color-mix(in srgb, var(--accent) 45%, #ffffff)";

  const active3dSubmitStyle: React.CSSProperties = {
    background: "linear-gradient(135deg, color-mix(in srgb, var(--accent) 40%, #ffffff) 0%, color-mix(in srgb, var(--accent) 85%, #ffffff) 50%, var(--accent) 100%)",
    boxShadow: "0 4px 12px rgba(0,0,0,0.25)",
    color: "#0f172a",
    border: `1px solid ${brightestThemeColor}`
  };

  let buttonStyleObj: React.CSSProperties = active3dSubmitStyle; 
  let buttonText = isLoginMode ? "Login" : "Register";

  if (isSavedDevice && !isLocked) { 
    buttonStyleObj = active3dSubmitStyle; 
    buttonText = "Masuk Chat"; 
  }
  else if (isLocked && !isSavedDevice) { 
    buttonStyleObj = { display: "none" }; 
  }
  else if (validationMsg) { 
    buttonStyleObj = { 
      background: "linear-gradient(135deg, #f87171 0%, #ef4444 100%)", 
      boxShadow: "0 4px 12px rgba(239, 68, 68, 0.3)",
      color: "#ffffff" 
    }; 
    buttonText = validationMsg; 
  }
  else if (isFormValid) { 
    buttonStyleObj = active3dSubmitStyle; 
    buttonText = isLoginMode ? "Masuk Sekarang" : "Gabung Sekarang"; 
  }

  const shouldHideRegisterTab = hasLoggedInBefore || isExistingUser || isSavedDevice;

  return (
    <div className="absolute inset-0 z-50 flex flex-col items-center justify-center bg-transparent px-4 pb-16 overflow-y-auto pointer-events-auto font-sans">
      <div className="relative w-full max-w-[380px] my-auto flex flex-col items-center pointer-events-auto">
        {activeTab === 'user' ? (
          <>
            <div className="relative -mb-5 z-30 pointer-events-none flex justify-center w-full">
              <div 
                className="absolute inset-0 flex justify-center"
                style={{
                  clipPath: 'inset(0px 0px 24px 0px)',
                  filter: `
                    drop-shadow(1px 0 0 ${brightestThemeColor})
                    drop-shadow(-1px 0 0 ${brightestThemeColor})
                    drop-shadow(0 -1px 0 ${brightestThemeColor})
                  `
                }}
              >
                <motion.div 
                  animate={{ 
                    rotate: isSavedDevice ? 0 : (isLoginMode ? 3 : -3), 
                    x: isSavedDevice ? 0 : (isLoginMode ? 2 : -2) 
                  }} 
                  transition={{ type: "spring", stiffness: 220, damping: 14 }}
                >
                  <BearMascot eyeX={bearEyeX} isCovering={isBearCovering} isLove={isLove} isTyping={isTyping} size={100} />
                </motion.div>
              </div>

              <motion.div 
                className="relative z-10 flex justify-center"
                animate={{ 
                  rotate: isSavedDevice ? 0 : (isLoginMode ? 3 : -3), 
                  x: isSavedDevice ? 0 : (isLoginMode ? 2 : -2) 
                }}
                transition={{ 
                  rotate: { type: "spring", stiffness: 220, damping: 14 },
                  x: { type: "spring", stiffness: 220, damping: 14 }
                }}
              >
                <BearMascot eyeX={bearEyeX} isCovering={isBearCovering} isLove={isLove} isTyping={isTyping} size={100} />
              </motion.div>
            </div>

            <div 
              className="relative w-full rounded-[2.2rem] p-[1.5px] transition-all duration-300 shadow-xl"
              style={{ backgroundColor: brightestThemeColor }}
            >
              <div 
                className="w-full rounded-[2.1rem] pt-9 p-5 sm:p-6 flex flex-col items-center"
                style={{ backgroundColor: "var(--background)" }}
              >
                {!shouldHideRegisterTab && (
                  <div className="w-full flex rounded-full p-1 mb-4 border relative z-50 pointer-events-auto cursor-pointer" style={{ backgroundColor: "var(--card-bg)", borderColor: "var(--card-border)" }}>
                    <button 
                      type="button" 
                      onClick={(e) => { 
                        e.stopPropagation(); 
                        setIsLoginMode(false); 
                        setValidationMsg(""); 
                      }} 
                      className={`flex-1 py-2 rounded-full text-xs font-semibold transition-all cursor-pointer relative z-50 ${!isLoginMode ? 'shadow-md' : 'opacity-60'}`} 
                      style={!isLoginMode ? { backgroundColor: "var(--accent)", color: "var(--background)" } : { color: "var(--foreground-heading)" }}
                    >
                      Register
                    </button>
                    <button 
                      type="button" 
                      onClick={(e) => { 
                        e.stopPropagation(); 
                        setIsLoginMode(true); 
                        setValidationMsg(""); 
                      }} 
                      className={`flex-1 py-2 rounded-full text-xs font-semibold transition-all cursor-pointer relative z-50 ${isLoginMode ? 'shadow-md' : 'opacity-60'}`} 
                      style={isLoginMode ? { backgroundColor: "var(--accent)", color: "var(--background)" } : { color: "var(--foreground-heading)" }}
                    >
                      Login
                    </button>
                  </div>
                )}

                <div className="w-full flex flex-col items-center relative z-20 pointer-events-auto">
                  {!isLoginMode && isRegisterLockedByAdmin ? (
                    <div className="w-full flex flex-col items-center text-center p-5 rounded-2xl bg-black border border-zinc-800 shadow-2xl my-1 animate-fadeIn">
                      <div className="text-3xl mb-2">🔒</div>
                      <h4 className="text-xs font-extrabold text-rose-500 uppercase tracking-wider mb-2">
                        Pendaftaran Ditutup
                      </h4>
                      <p className="text-[11px] leading-relaxed text-zinc-300 font-medium mb-5">
                        Maaf register ditutup sementara. Jika sudah ada user dan PIN bisa ke <span onClick={() => setIsLoginMode(true)} className="text-rose-400 font-bold underline cursor-pointer">Login</span>. Jika belum / lupa bisa hubungi / inbox / PM / DM iPix di sosmed.
                      </p>

                      <Link
                        href="/tentang"
                        className="w-full py-2.5 sm:py-3 rounded-full font-bold text-xs tracking-wide transition-all active:scale-[0.98] cursor-pointer flex items-center justify-center gap-2 shadow-lg"
                        style={active3dSubmitStyle}
                      >
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                        Ke Tentang
                      </Link>
                    </div>
                  ) : (
                    <>
                      <InputField 
                        icon={<UserIcon />} 
                        placeholder={isLoginMode || isSavedDevice ? "Username" : (placeholderText || "Username (Min 5 karakter)")} 
                        value={username || ""} 
                        disabled={isLocked || isSavedDevice} 
                        readOnly={isLocked || isSavedDevice} 
                        onChange={(e: any) => { 
                          if (isLocked || isSavedDevice) return; 
                          if (!hasTyped) setHasTyped(true); 
                          const val = e.target.value;
                          const isTypingAdmin = val.trim().toLowerCase().startsWith("admin");
                          setUsername(isTypingAdmin ? val : sanitizeUsername(val)); 
                          if (validationMsg) setValidationMsg(""); 
                        }} 
                        onFocus={() => setFocusedField('username')} 
                        onBlur={() => setFocusedField(null)} 
                        className={inputInset} 
                        style={(isLocked || isSavedDevice) ? existingStyle : usernameStyle} 
                        autoComplete="off" 
                      />
                      
                      <InputField icon={<LockIcon />} placeholder={isSavedDevice ? "PIN Tersimpan" : (isLoginMode ? "PIN (6 angka)" : "Buat PIN (6 angka)")} type={showPin ? "text" : "password"} inputMode="numeric" value={pin || ""} disabled={isLocked || isSavedDevice} readOnly={isLocked || isSavedDevice} onChange={(e: any) => { if (isLocked || isSavedDevice) return; const val = e.target.value.replace(/\D/g, '').slice(0, 6); setPin(val); if (validationMsg) setValidationMsg(""); }} onFocus={() => setFocusedField('pin')} onBlur={() => setFocusedField(null)} suffix={<button type="button" onClick={() => setShowPin(!showPin)} disabled={isLocked && !isSavedDevice} className="focus:outline-none cursor-pointer">{showPin ? <EyeOffIcon /> : <EyeIcon />}</button>} className={inputInset} style={(isLocked || isSavedDevice) ? existingStyle : pinStyle} maxLength={6} />
                      
                      {!isLoginMode && !shouldHideRegisterTab && (
                        <div className="flex gap-2.5 w-full">
                          <SelectField icon={<CalendarIcon />} placeholder="Umur" options={["25+", "30+", "35+", "40+", "45+"]} value={umur} disabled={isLocked} onChange={(e: any) => { setUmur(e.target.value); if (validationMsg) setValidationMsg(""); }} className={inputInset} style={isLocked ? existingStyle : umurStyle} />
                          <SelectField icon={<ScaleIcon />} placeholder="Berat" options={["70+", "80+", "90+", "100+"]} value={berat} disabled={isLocked} onChange={(e: any) => { setBerat(e.target.value); if (validationMsg) setValidationMsg(""); }} className={inputInset} style={isLocked ? existingStyle : beratStyle} />
                        </div>
                      )}

                      {(isSavedDevice || isLocked) && (
                        <div className={`w-full text-xs p-3.5 border rounded-2xl mb-2.5 font-normal text-center whitespace-pre-line leading-relaxed min-h-[55px] flex flex-col items-center justify-center ${inputInset}`} style={{ backgroundColor: "var(--card-bg)", borderColor: "var(--card-border)", color: "var(--foreground-heading)" }}>
                          <span className="w-full block"><span>{visiblePrefix}</span><span className="font-semibold">{visibleName}</span><span>{visibleSuffix}</span>{!isNoteTypingDone && <span className="animate-pulse ml-0.5">|</span>}</span>
                        </div>
                      )}

                      {!isLoginMode && !shouldHideRegisterTab && (
                        <div className="flex items-center justify-start w-full mb-3 px-1 select-none">
                          <input type="checkbox" id="agree" disabled={isLocked} className="w-3.5 h-3.5 cursor-pointer rounded-sm accent-[var(--accent)]" checked={isUsernameAgreed} onChange={(e) => { setIsUsernameAgreed(e.target.checked); if (validationMsg) setValidationMsg(""); }} />
                          <label htmlFor="agree" className="text-[11px] font-normal ml-2 select-none leading-none opacity-80 cursor-pointer" style={{ color: "var(--foreground)" }}>*Mengikuti aturan di dalam chat</label>
                        </div>
                      )}

                      <button 
                        type="button" 
                        onClick={handleUserLoginWrapper} 
                        className={`w-full py-2.5 sm:py-3 rounded-full font-semibold tracking-wide transition-all active:scale-[0.98] cursor-pointer mt-1 pointer-events-auto relative z-40 ${validationMsg ? "animate-pulse" : ""}`} 
                        style={buttonStyleObj}
                      >
                        {buttonText}
                      </button>
                    </>
                  )}
                </div>
              </div>
            </div>
          </>
        ) : (
          <>
            <div 
              className="relative -mb-5 z-30 pointer-events-none flex justify-center w-full"
              style={{
                filter: `
                  drop-shadow(1px 0 0 ${brightestThemeColor})
                  drop-shadow(-1px 0 0 ${brightestThemeColor})
                  drop-shadow(0 -1px 0 ${brightestThemeColor})
                `
              }}
            >
              <div className="relative z-10 flex justify-center">
                <BearMascot eyeX={bearEyeX} isCovering={isBearCovering} isLove={isLove} isTyping={isTyping} size={100} />
              </div>
            </div>

            <div 
              className="relative w-full rounded-[2.2rem] p-[1.5px] transition-all duration-300 shadow-xl"
              style={{ backgroundColor: brightestThemeColor }}
            >
              <div 
                className="w-full rounded-[2.1rem] pt-9 p-6 flex flex-col items-center" 
                style={{ backgroundColor: "var(--background)" }}
              >
                <InputField icon={<MailIcon />} placeholder="Email Admin" value={adminEmail || ""} onChange={(e: any) => setAdminEmail(e.target.value)} onFocus={() => setFocusedField('adminEmail')} onBlur={() => setFocusedField(null)} className={inputInset} style={normalInputStyle} autoComplete="off" />
                <InputField icon={<LockIcon />} placeholder="Password Admin" type={showPin ? "text" : "password"} style={normalInputStyle} value={adminPass || ""} onChange={(e: any) => setAdminPass(e.target.value)} onFocus={() => setFocusedField('adminPass')} onBlur={() => setFocusedField(null)} suffix={<button type="button" onClick={() => setShowPin(!showPin)} className="focus:outline-none cursor-pointer">{showPin ? <EyeOffIcon /> : <EyeIcon />}</button>} className={`${inputInset} mb-4`} />
                <button type="button" onClick={handleAdminLoginWrapper} className="w-full py-3 rounded-full font-semibold tracking-wide transition-all active:scale-[0.98] cursor-pointer pointer-events-auto relative z-40" style={active3dSubmitStyle}>Masuk Admin</button>
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
}