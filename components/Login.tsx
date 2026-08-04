'use client';
import { motion, AnimatePresence } from 'framer-motion';
import { useState, useEffect, useRef } from 'react';
import { useTheme } from '@/app/context/ThemeContext';
import BearMascot from './BearMascot';

const UserIcon = () => (<svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" /></svg>);
const LockIcon = () => (<svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" /></svg>);
const CalendarIcon = () => (<svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg>);
const ScaleIcon = () => (<svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 6l3 1m0 0l-3 9a5.002 5.002 0 006.001 0M6 7l3 9M6 7l6-2m6 2l3-1m-3 1l-3 9a5.002 5.002 0 006.001 0M18 7l3 9m-3-9l-6-2m0-2v2m0 16V5m0 16H9m3 0h3" /></svg>);
const MailIcon = () => (<svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2 z" /></svg>);
const EyeIcon = () => (<svg className="w-5 h-5 opacity-70 cursor-pointer hover:opacity-100 transition-opacity" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" /></svg>);
const EyeOffIcon = () => (<svg className="w-5 h-5 opacity-70 cursor-pointer hover:opacity-100 transition-opacity" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.542-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l18 18" /></svg>);

// FIREWORKS CANVAS DENGAN WARNA DARI CSS VARIABLE TEMA
const FireworksCanvas = () => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;

    // AMBIL WARNA TEMA SECARA DINAMIS DARI ROOT CSS
    const styles = getComputedStyle(document.documentElement);
    const accent = styles.getPropertyValue('--accent').trim() || '#eab308';
    const accentGlow = styles.getPropertyValue('--accent-glow').trim() || accent;
    const fgHeading = styles.getPropertyValue('--foreground-heading').trim() || '#ffffff';
    const fgText = styles.getPropertyValue('--foreground').trim() || '#ffffff';

    const themeColors = [
      accent,
      accentGlow,
      `color-mix(in srgb, ${accent} 80%, #ffffff)`,
      `color-mix(in srgb, ${accent} 50%, #ffffff)`,
      `color-mix(in srgb, ${accentGlow} 60%, #ffffff)`,
      fgHeading,
      fgText
    ];

    let animationId: number;

    class Particle {
      x: number; y: number; vx: number; vy: number; color: string; size: number; alpha: number; decay: number;
      constructor(x: number, y: number) {
        this.x = x; this.y = y;
        const angle = Math.random() * Math.PI * 2;
        const speed = Math.random() * 11 + 3;
        this.vx = Math.cos(angle) * speed;
        this.vy = Math.sin(angle) * speed;
        this.color = themeColors[Math.floor(Math.random() * themeColors.length)];
        this.size = Math.random() * 4 + 2.5;
        this.alpha = 1;
        this.decay = Math.random() * 0.009 + 0.004;
      }
      update() {
        this.x += this.vx;
        this.y += this.vy;
        this.vy += 0.07;
        this.vx *= 0.98;
        this.vy *= 0.98;
        this.alpha -= this.decay;
      }
      draw(context: CanvasRenderingContext2D) {
        context.save();
        context.globalAlpha = Math.max(0, this.alpha);
        context.beginPath();
        context.arc(this.x, this.y, this.size, 0, Math.PI * 2);
        context.fillStyle = this.color;
        context.shadowColor = this.color;
        context.shadowBlur = 14;
        context.fill();
        context.restore();
      }
    }

    let particles: Particle[] = [];
    const createBurst = (x: number, y: number) => {
      for (let i = 0; i < 65; i++) particles.push(new Particle(x, y));
    };

    createBurst(canvas.width / 2, canvas.height / 3);
    createBurst(canvas.width / 3, canvas.height / 2.5);
    createBurst((canvas.width / 3) * 2, canvas.height / 2.5);

    let frame = 0;
    const render = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      if (frame % 10 === 0 && frame < 160) {
        createBurst(
          Math.random() * (canvas.width * 0.8) + canvas.width * 0.1,
          Math.random() * (canvas.height * 0.5) + canvas.height * 0.1
        );
      }
      frame++;
      particles.forEach((p, index) => {
        p.update();
        p.draw(ctx);
        if (p.alpha <= 0) particles.splice(index, 1);
      });
      animationId = requestAnimationFrame(render);
    };
    render();

    const handleResize = () => {
      if (!canvas) return;
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    };
    window.addEventListener('resize', handleResize);
    return () => { cancelAnimationFrame(animationId); window.removeEventListener('resize', handleResize); };
  }, []);

  return <canvas ref={canvasRef} className="fixed inset-0 pointer-events-none z-[999999]" />;
};

const InputField = ({ icon, suffix, readOnly, className, style, type = "text", disabled, ...props }: any) => (
  <div className={`flex items-center w-full rounded-full px-4 py-2.5 sm:py-3 mb-2.5 border transition-all duration-300 ${(readOnly || disabled) ? 'opacity-75 cursor-not-allowed select-none' : ''} ${className}`} style={style}>
    <div className="mr-3 flex-shrink-0 opacity-80" style={{ color: "var(--accent)" }}>{icon}</div>
    <input type={type} readOnly={readOnly} disabled={disabled} className={`bg-transparent outline-none flex-1 text-xs sm:text-sm font-extrabold w-full placeholder:opacity-50 ${(readOnly || disabled) ? 'cursor-not-allowed select-none' : ''}`} style={{ color: "var(--foreground-heading)" }} {...props} />
    {suffix && <div className="ml-2 flex-shrink-0 flex items-center">{suffix}</div>}
  </div>
);

const SelectField = ({ icon, options, value, onChange, placeholder, className, style, disabled }: any) => (
  <div className={`flex items-center w-full rounded-full px-4 py-2.5 sm:py-3 mb-2.5 border relative transition-all duration-300 ${disabled ? 'opacity-75 cursor-not-allowed' : ''} ${className}`} style={style}>
    <div className="mr-3 flex-shrink-0 opacity-80" style={{ color: "var(--accent)" }}>{icon}</div>
    <select value={value} onChange={onChange} disabled={disabled} className={`bg-transparent outline-none flex-1 text-xs sm:text-sm font-extrabold w-full appearance-none ${disabled ? 'cursor-not-allowed' : 'cursor-pointer'}`} style={{ color: "var(--foreground-heading)" }}>
      <option value="" disabled style={{ backgroundColor: "var(--background)", color: "var(--foreground)" }}>{placeholder}</option>
      {options.map((opt: string) => (<option key={opt} value={opt} style={{ backgroundColor: "var(--background)", color: "var(--foreground-heading)" }}>{opt}</option>))}
    </select>
    <div className="pointer-events-none absolute right-4 opacity-70" style={{ color: "var(--foreground-heading)" }}><svg className="w-4 h-4 fill-current" viewBox="0 0 20 20"><path d="M9.293 12.95l.707.707L15.657 8l-1.414-1.414L10 10.828 5.757 6.586 4.343 8z"/></svg></div>
  </div>
);

export default function Login({ activeTab, username, setUsername, pin, setPin, umur, setUmur, berat, setBerat, isExistingUser, adminEmail, setAdminEmail, adminPass, setAdminPass, handleUserLogin, handleAdminLogin, isLocked }: any) {
  const { theme } = useTheme();
  const prefixText = "Welcome back, "; const currentUserName = username || "User"; const suffixText = ".\nUbah nama atau PIN hubungi admin di chat.";
  const totalNoteLength = prefixText.length + currentUserName.length + suffixText.length;
  const [displayedCharCount, setDisplayedCharCount] = useState(0); const [isNoteTypingDone, setIsNoteTypingDone] = useState(false);
  const [placeholderText, setPlaceholderText] = useState(""); 

  const [isLoginMode, setIsLoginMode] = useState(true); 
  const [hasLoggedInBefore, setHasLoggedInBefore] = useState(false);
  const [isUsernameAgreed, setIsUsernameAgreed] = useState(false); const [validationMsg, setValidationMsg] = useState("");
  const [showPin, setShowPin] = useState(false); const [showWelcomePill, setShowWelcomePill] = useState(false);
  const [showFireworks, setShowFireworks] = useState(false); const [isSavedDevice, setIsSavedDevice] = useState(false);
  const [hasTyped, setHasTyped] = useState(false); 
  const [focusedField, setFocusedField] = useState<'username' | 'pin' | 'adminEmail' | 'adminPass' | null>(null);

  useEffect(() => {
    try {
      const remUser = localStorage.getItem('remembered_username') || localStorage.getItem('username') || localStorage.getItem('active_username');
      const remPin = localStorage.getItem('remembered_pin') || localStorage.getItem('user_pin') || localStorage.getItem('pin') || localStorage.getItem('saved_pin');
      const hideReg = localStorage.getItem('hide_register') === 'true' || localStorage.getItem('has_ever_logged_in') === 'true';

      if (hideReg || isExistingUser) {
        setHasLoggedInBefore(true);
      }

      if (remUser) setUsername(remUser);
      if (remPin) setPin(remPin);

      if (remUser && remPin) {
        setIsSavedDevice(true);
      }
    } catch (e) {}
    setIsLoginMode(true);
  }, []);

  useEffect(() => {
    if (isSavedDevice) return;
    const targetPlaceholder = "Username (Maks 20 huruf)"; let index = 0;
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
  const isFormValid = isSavedDevice ? (username?.trim().length > 0 && pin?.length === 6) : (isLoginMode ? (username?.trim().length > 0 && pin?.length === 6) : (username?.trim().length > 0 && pin?.length === 6 && umur !== "" && berat !== "" && isUsernameAgreed));
  
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
    setShowWelcomePill(false); 
    setShowFireworks(false);

    if (isLocked && !isSavedDevice) return;
    if (!username || username.trim().length === 0) return setValidationMsg("Isi nama dulu sayang");
    if (!pin || pin.length !== 6) return setValidationMsg("PIN harus 6 angka sayang");
    if (!isSavedDevice && !isLoginMode) {
      if (!umur || !berat) return setValidationMsg("Pilih umur & berat sayang");
      if (!isUsernameAgreed) return setValidationMsg("Ceklist dulu sayang");
    }
    setValidationMsg("");

    try {
      // 1. UPDATE BROWSER STORAGE INSTAN DAHULU UNTUK MEMECAH RACE CONDITION
      localStorage.setItem('remembered_username', username.trim().toLowerCase());
      localStorage.setItem('remembered_pin', pin);
      localStorage.setItem('saved_pin', pin);
      localStorage.setItem('user_pin', pin);
      localStorage.setItem('pin', pin);

      // 2. EKSEKUSI FUNGSI LOGIN
      const result = await handleUserLogin(isLoginMode, true);

      if (!result || result === false || (typeof result === 'object' && result.error)) {
        setShowWelcomePill(false);
        setShowFireworks(false);
        if (isSavedDevice) {
          handleResetSavedDevice();
        }
        return setValidationMsg("Username atau PIN salah/diubah");
      }

      // 3. JIKA BERHASIL, BARU NYALAKAN KEMBANG API & UCAPAN SELAMAT DATANG
      setShowWelcomePill(true); 
      setShowFireworks(true);

      localStorage.setItem('hide_register', 'true');
      localStorage.setItem('has_ever_logged_in', 'true');
      setHasLoggedInBefore(true);

    } catch (err) { 
      setShowWelcomePill(false);
      setShowFireworks(false);
      if (isSavedDevice) handleResetSavedDevice();
      setValidationMsg("Username atau PIN telah diubah sayang"); 
    }
  };

  const handleAdminLoginWrapper = async () => { try { const result = await handleAdminLogin(); if (result === false || (result && result.error)) return; } catch (err) {} };

  const inputInset = 'shadow-[inset_0_4px_8px_rgba(0,0,0,0.25)]'; 
  
  const normalInputStyle = { backgroundColor: "var(--card-bg)", borderColor: "var(--card-border)" };
  const validInputStyle = { backgroundColor: "color-mix(in srgb, var(--accent) 15%, transparent)", borderColor: "var(--accent)" };
  const errorInputStyle = { backgroundColor: "rgba(239, 68, 68, 0.15)", borderColor: "rgb(239, 68, 68)" };
  const getInputStyle = (isError: boolean) => { if (isFormValid) return validInputStyle; if (isError) return errorInputStyle; return normalInputStyle; };
  const usernameStyle = getInputStyle(validationMsg === "Isi nama dulu sayang" || validationMsg.includes("salah") || validationMsg.includes("diubah"));
  const pinStyle = getInputStyle(Boolean(validationMsg === "PIN harus 6 angka sayang" || validationMsg.includes("salah") || validationMsg.includes("diubah") || (!isLoginMode && Boolean(validationMsg) && (!pin || pin.length !== 6))));
  const umurStyle = getInputStyle(Boolean(validationMsg && !umur)); const beratStyle = getInputStyle(Boolean(validationMsg && !berat));
  const existingStyle = { backgroundColor: "var(--card-bg)", borderColor: "var(--card-border)", opacity: 0.75 };

  const brightestThemeColor = "color-mix(in srgb, var(--accent) 45%, #ffffff)";

  const active3dSubmitStyle: React.CSSProperties = {
    background: "linear-gradient(135deg, color-mix(in srgb, var(--accent) 40%, #ffffff) 0%, color-mix(in srgb, var(--accent) 85%, #ffffff) 50%, var(--accent) 100%)",
    backgroundSize: "200% 200%",
    animation: "convexColorShift 3s ease infinite alternate",
    boxShadow: "inset 0 3px 4px rgba(255, 255, 255, 0.95), inset 0 -3px 5px rgba(0, 0, 0, 0.35), 0 6px 14px rgba(0,0,0,0.3)",
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
      boxShadow: "inset 0 2px 3px rgba(255, 255, 255, 0.6), inset 0 -2px 4px rgba(0, 0, 0, 0.4)",
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
    <div className="absolute inset-0 z-50 flex flex-col items-center justify-center bg-transparent px-4 pb-16 overflow-y-auto pointer-events-auto">
      <style>{`
        @keyframes convexColorShift {
          0% { background-position: 0% 50%; }
          50% { background-position: 100% 50%; }
          100% { background-position: 0% 50%; }
        }
      `}</style>

      {/* FIREWORKS CANVAS */}
      {showFireworks && <FireworksCanvas />}

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
              className="relative w-full rounded-[2.2rem] p-[1.5px] transition-all duration-300 shadow-[0_12px_36px_rgba(0,0,0,0.7)]"
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
                      className={`flex-1 py-2 rounded-full text-xs font-bold transition-all cursor-pointer relative z-50 ${!isLoginMode ? 'shadow-md' : 'opacity-60'}`} 
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
                      className={`flex-1 py-2 rounded-full text-xs font-bold transition-all cursor-pointer relative z-50 ${isLoginMode ? 'shadow-md' : 'opacity-60'}`} 
                      style={isLoginMode ? { backgroundColor: "var(--accent)", color: "var(--background)" } : { color: "var(--foreground-heading)" }}
                    >
                      Login
                    </button>
                  </div>
                )}

                <div className="w-full flex flex-col items-center relative z-20 pointer-events-auto">
                  <InputField icon={<UserIcon />} placeholder={isLoginMode || isSavedDevice ? "Username" : (placeholderText || "Username")} value={username || ""} disabled={isLocked || isSavedDevice} readOnly={isLocked || isSavedDevice} onChange={(e: any) => { if (isLocked || isSavedDevice) return; if (!hasTyped) setHasTyped(true); setUsername(e.target.value.slice(0, 20)); if (validationMsg) setValidationMsg(""); }} onFocus={() => setFocusedField('username')} onBlur={() => setFocusedField(null)} className={inputInset} style={(isLocked || isSavedDevice) ? existingStyle : usernameStyle} autoComplete="off" />
                  
                  <InputField icon={<LockIcon />} placeholder={isSavedDevice ? "PIN Tersimpan" : (isLoginMode ? "PIN (6 angka)" : "Buat PIN (6 angka)")} type={showPin ? "text" : "password"} inputMode="numeric" value={pin || ""} disabled={isLocked || isSavedDevice} readOnly={isLocked || isSavedDevice} onChange={(e: any) => { if (isLocked || isSavedDevice) return; const val = e.target.value.replace(/\D/g, '').slice(0, 6); setPin(val); if (validationMsg) setValidationMsg(""); }} onFocus={() => setFocusedField('pin')} onBlur={() => setFocusedField(null)} suffix={<button type="button" onClick={() => setShowPin(!showPin)} disabled={isLocked && !isSavedDevice} className="focus:outline-none cursor-pointer">{showPin ? <EyeOffIcon /> : <EyeIcon />}</button>} className={inputInset} style={(isLocked || isSavedDevice) ? existingStyle : pinStyle} maxLength={6} />
                  
                  {!isLoginMode && !shouldHideRegisterTab && (
                    <div className="flex gap-2.5 w-full">
                      <SelectField icon={<CalendarIcon />} placeholder="Umur" options={["25+", "30+", "35+", "40+", "45+"]} value={umur} disabled={isLocked} onChange={(e: any) => { setUmur(e.target.value); if (validationMsg) setValidationMsg(""); }} className={inputInset} style={isLocked ? existingStyle : umurStyle} />
                      <SelectField icon={<ScaleIcon />} placeholder="Berat" options={["70+", "80+", "90+", "100+"]} value={berat} disabled={isLocked} onChange={(e: any) => { setBerat(e.target.value); if (validationMsg) setValidationMsg(""); }} className={inputInset} style={isLocked ? existingStyle : beratStyle} />
                    </div>
                  )}

                  {(isSavedDevice || isLocked) && (
                    <div className={`w-full text-xs p-3.5 border rounded-2xl mb-2.5 font-normal text-center whitespace-pre-line leading-relaxed min-h-[55px] flex flex-col items-center justify-center ${inputInset}`} style={{ backgroundColor: "var(--card-bg)", borderColor: "var(--card-border)", color: "var(--foreground-heading)" }}>
                      <span className="w-full block drop-shadow-sm"><span>{visiblePrefix}</span><span className="font-extrabold italic">{visibleName}</span><span>{visibleSuffix}</span>{!isNoteTypingDone && <span className="animate-pulse ml-0.5">|</span>}</span>
                    </div>
                  )}

                  {!isLoginMode && !shouldHideRegisterTab && (
                    <div className="flex items-center justify-start w-full mb-3 px-1 select-none">
                      <input type="checkbox" id="agree" disabled={isLocked} className="w-3.5 h-3.5 cursor-pointer rounded-sm accent-[var(--accent)]" checked={isUsernameAgreed} onChange={(e) => { setIsUsernameAgreed(e.target.checked); if (validationMsg) setValidationMsg(""); }} />
                      <label htmlFor="agree" className="text-[11px] font-light italic ml-2 select-none leading-none opacity-80 cursor-pointer" style={{ color: "var(--foreground)" }}>*Mengikuti aturan di dalam chat</label>
                    </div>
                  )}

                  <button 
                    type="button" 
                    onClick={handleUserLoginWrapper} 
                    className={`w-full py-2.5 sm:py-3 rounded-full font-black tracking-wider transition-all active:scale-[0.98] cursor-pointer mt-1 pointer-events-auto relative z-40 ${validationMsg ? "animate-pulse" : ""}`} 
                    style={buttonStyleObj}
                  >
                    {buttonText}
                  </button>

                  <AnimatePresence>
                    {showWelcomePill && (
                      <motion.div 
                        initial={{ opacity: 0, y: 10, scale: 0.95 }} 
                        animate={{ opacity: 1, y: 0, scale: 1 }} 
                        exit={{ opacity: 0, y: 10, scale: 0.95 }} 
                        className="w-full text-center mt-4 px-2 py-2.5 rounded-2xl font-black text-base sm:text-lg border pointer-events-auto"
                        style={{ 
                          backgroundColor: "var(--card-bg)", 
                          borderColor: "var(--accent)", 
                          color: "var(--foreground-heading)"
                        }}
                      >
                        Selamat Datang {username ? `${username} ` : ''}Sayang!
                      </motion.div>
                    )}
                  </AnimatePresence>
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
              className="relative w-full rounded-[2.2rem] p-[1.5px] transition-all duration-300 shadow-[0_12px_36px_rgba(0,0,0,0.7)]"
              style={{ backgroundColor: brightestThemeColor }}
            >
              <div 
                className="w-full rounded-[2.1rem] pt-9 p-6 flex flex-col items-center" 
                style={{ backgroundColor: "var(--background)" }}
              >
                <InputField icon={<MailIcon />} placeholder="Email Admin" value={adminEmail || ""} onChange={(e: any) => setAdminEmail(e.target.value)} onFocus={() => setFocusedField('adminEmail')} onBlur={() => setFocusedField(null)} className={inputInset} style={normalInputStyle} autoComplete="off" />
                <InputField icon={<LockIcon />} placeholder="Password Admin" type={showPin ? "text" : "password"} style={normalInputStyle} value={adminPass || ""} onChange={(e: any) => setAdminPass(e.target.value)} onFocus={() => setFocusedField('adminPass')} onBlur={() => setFocusedField(null)} suffix={<button type="button" onClick={() => setShowPin(!showPin)} className="focus:outline-none cursor-pointer">{showPin ? <EyeOffIcon /> : <EyeIcon />}</button>} className={`${inputInset} mb-4`} />
                <button type="button" onClick={handleAdminLoginWrapper} className="w-full py-3 rounded-full font-black tracking-wider transition-all active:scale-[0.98] cursor-pointer pointer-events-auto relative z-40" style={active3dSubmitStyle}>Masuk Admin</button>
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
}