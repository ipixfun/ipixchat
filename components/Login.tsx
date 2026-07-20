'use client';
import { motion } from 'framer-motion';
import { useState, useEffect } from 'react';

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

// --- REUSABLE COMPONENTS WITH GLASS STYLE ---
const InputField = ({ icon, readOnly, className, ...props }: any) => (
  <div className={`flex items-center w-full rounded-full px-4 py-3.5 mb-3 border backdrop-blur-md transition-all duration-300 ${className}`}>
    <div className="mr-3 flex-shrink-0 opacity-70">
      {icon}
    </div>
    <input 
      readOnly={readOnly}
      className="bg-transparent outline-none flex-1 text-sm font-extrabold w-full placeholder-slate-600/60 disabled:cursor-not-allowed"
      {...props}
    />
  </div>
);

const SelectField = ({ icon, options, value, onChange, placeholder, className }: any) => (
  <div className={`flex items-center w-full rounded-full px-4 py-3.5 mb-3 border backdrop-blur-md relative transition-all duration-300 ${className}`}>
    <div className="mr-3 flex-shrink-0 opacity-70">
      {icon}
    </div>
    <select 
      value={value}
      onChange={onChange}
      className="bg-transparent outline-none flex-1 text-sm font-extrabold w-full appearance-none cursor-pointer"
    >
      <option value="" disabled className="text-slate-900">{placeholder}</option>
      {options.map((opt: string) => <option key={opt} value={opt} className="text-slate-900">{opt}</option>)}
    </select>
    <div className="pointer-events-none absolute right-4 opacity-70">
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
  const existingNote = "Maaf user dan pin tidak bisa diubah.\n\nHubungi admin di chat untuk merubahnya.";
  const [displayedNote, setDisplayedNote] = useState("");
  const [isNoteTypingDone, setIsNoteTypingDone] = useState(false);
  const [placeholderText, setPlaceholderText] = useState("");
  const [isLoginMode, setIsLoginMode] = useState(true);
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

  // --- LOGIK STYLING DENGAN SENTUHAN TEMA #0B2027 & GLASS EFFECT ---

  const usernameBorderClass = isFormValid
    ? 'border-green-400 bg-white/20 text-green-950 shadow-[inset_0_3px_8px_rgba(0,0,0,0.05),0_0_15px_rgba(34,197,94,0.4)] font-extrabold' 
    : (validationMsg === "Isi nama dulu sayang")
      ? 'border-red-400 animate-pulse bg-white/20 text-red-950 shadow-[inset_0_3px_8px_rgba(0,0,0,0.05),0_0_15px_rgba(239,68,68,0.5)] font-extrabold' 
      : 'border-[#235867]/40 bg-white/20 text-slate-900 shadow-[inset_0_3px_8px_rgba(0,0,0,0.05)] focus-within:border-[#0B2027] focus-within:shadow-[0_0_15px_rgba(11,32,39,0.2)] font-extrabold';

  const pinBorderClass = isFormValid
    ? 'border-green-400 bg-white/20 text-green-950 shadow-[inset_0_3px_8px_rgba(0,0,0,0.05),0_0_15px_rgba(34,197,94,0.4)] font-extrabold'
    : (validationMsg === "PIN harus 6 angka sayang")
      ? 'border-red-400 animate-pulse bg-white/20 text-red-950 shadow-[inset_0_3px_8px_rgba(0,0,0,0.05),0_0_15px_rgba(239,68,68,0.5)] font-extrabold'
      : 'border-[#235867]/40 bg-white/20 text-slate-900 shadow-[inset_0_3px_8px_rgba(0,0,0,0.05)] focus-within:border-[#0B2027] focus-within:shadow-[0_0_15px_rgba(11,32,39,0.2)] font-extrabold';

  const umurBorderClass = isFormValid
    ? 'border-green-400 bg-white/20 text-green-950 shadow-[inset_0_3px_8px_rgba(0,0,0,0.05),0_0_15px_rgba(34,197,94,0.3)]'
    : (validationMsg && !umur)
      ? 'border-red-400 animate-pulse bg-white/20 text-red-950 shadow-[inset_0_3px_8px_rgba(0,0,0,0.05),0_0_15px_rgba(239,68,68,0.4)]'
      : 'border-[#235867]/40 bg-white/20 text-slate-900 shadow-[inset_0_3px_8px_rgba(0,0,0,0.05)] focus-within:border-[#0B2027]';

  const beratBorderClass = isFormValid
    ? 'border-green-400 bg-white/20 text-green-950 shadow-[inset_0_3px_8px_rgba(0,0,0,0.05),0_0_15px_rgba(34,197,94,0.3)]'
    : (validationMsg && !berat)
      ? 'border-red-400 animate-pulse bg-white/20 text-red-950 shadow-[inset_0_3px_8px_rgba(0,0,0,0.05),0_0_15px_rgba(239,68,68,0.4)]'
      : 'border-[#235867]/40 bg-white/20 text-slate-900 shadow-[inset_0_3px_8px_rgba(0,0,0,0.05)] focus-within:border-[#0B2027]';

  const checkboxBorderClass = isFormValid
    ? 'border-green-400/60 bg-white/20 shadow-[0_0_15px_rgba(34,197,94,0.2)]'
    : (validationMsg === "Ceklist dulu sayang")
      ? 'border-red-400 animate-pulse bg-white/20 shadow-[0_0_15px_rgba(239,68,68,0.3)]'
      : 'border-[#235867]/30 bg-white/20 shadow-[0_0_10px_rgba(11,32,39,0.1)]';

  let buttonStyle = "";
  let buttonText = "";

  if (isExistingUser) {
    buttonStyle = "bg-gradient-to-r from-emerald-500 to-green-600 hover:from-emerald-600 hover:to-green-700 border border-green-400 shadow-[inset_0_2px_4px_rgba(255,255,255,0.3),0_0_20px_rgba(34,197,94,0.5)] text-white";
    buttonText = "Masuk Chat";
  } else if (validationMsg) {
    buttonStyle = "bg-gradient-to-r from-rose-500 to-red-600 hover:from-rose-600 hover:to-red-700 border border-red-400 shadow-[inset_0_2px_4px_rgba(255,255,255,0.3),0_0_20px_rgba(239,68,68,0.5)] text-white animate-pulse";
    buttonText = validationMsg;
  } else if (isFormValid) {
    buttonStyle = "bg-gradient-to-r from-emerald-500 to-green-600 hover:from-emerald-600 hover:to-green-700 border border-green-400 shadow-[inset_0_2px_4px_rgba(255,255,255,0.3),0_0_20px_rgba(34,197,94,0.5)] text-white";
    buttonText = isLoginMode ? "Masuk Sekarang" : "Gabung Sekarang";
  } else {
    buttonStyle = "bg-gradient-to-r from-[#0B2027] to-[#1a3f4c] hover:from-[#13313c] hover:to-[#0B2027] border border-[#235867] shadow-[inset_0_2px_4px_rgba(255,255,255,0.2),0_0_15px_rgba(11,32,39,0.4)] text-white";
    buttonText = isLoginMode ? "Login" : "Register";
  }

  return (
    <div className="fixed inset-0 flex justify-center items-center bg-slate-900/10 z-50 overflow-hidden font-sans sm:p-6">
      
      {/* 🟢🔵 BACKGROUND BLOBS ANIMATION 🔵🟢 */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none z-0">
        <motion.div
          animate={{ scale: [1, 1.2, 1], x: [0, 60, 0], y: [0, 40, 0] }}
          transition={{ duration: 12, repeat: Infinity, ease: "easeInOut" }}
          className="absolute -top-[15%] -left-[10%] w-[400px] h-[400px] sm:w-[600px] sm:h-[600px] bg-[#0B2027]/20 rounded-full blur-[100px]"
        />
        <motion.div
          animate={{ scale: [1, 1.3, 1], x: [0, -50, 0], y: [0, -60, 0] }}
          transition={{ duration: 15, repeat: Infinity, ease: "easeInOut" }}
          className="absolute -bottom-[15%] -right-[10%] w-[400px] h-[400px] sm:w-[600px] sm:h-[600px] bg-emerald-400/20 rounded-full blur-[100px]"
        />
      </div>

      {/* ⚪ MAIN CARD - Glass Transparant Design */}
      <div className="relative w-full h-[100dvh] sm:h-[800px] sm:max-h-[90vh] sm:max-w-[420px] bg-white/10 backdrop-blur-2xl border border-white/20 sm:rounded-[2.5rem] shadow-[0_10px_40px_rgba(0,0,0,0.15)] overflow-hidden flex flex-col z-10 transition-all duration-300">
        
        {activeTab === 'user' ? (
          <>
            {/* 🔵 TOGGLE OVERLAY PANEL (Teal Dark Glass) */}
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
              className="absolute left-0 right-0 h-[35%] bg-[#0B2027]/75 backdrop-blur-xl border border-white/10 z-20 flex flex-col items-center justify-center p-6 text-white overflow-hidden shadow-[0_5px_15px_rgba(0,0,0,0.2)]"
            >
              <div className="relative w-full h-full flex items-center justify-center">
                
                {/* Text For Login Mode */}
                <motion.div
                  animate={{ opacity: isLoginMode ? 1 : 0, scale: isLoginMode ? 1 : 0.95 }}
                  transition={{ duration: 0.3 }}
                  className="absolute flex flex-col items-center text-center"
                  style={{ pointerEvents: isLoginMode ? 'auto' : 'none' }}
                >
                  <h2 className="text-2xl sm:text-3xl font-bold mb-1 tracking-wide text-white drop-shadow-sm">Hello, Welcome</h2>
                  <p className="text-sm text-gray-200 mb-6 font-light">Don't have an Account</p>
                  {!isExistingUser && (
                    <button 
                      onClick={() => { setIsLoginMode(false); setValidationMsg(""); }}
                      className="px-10 py-2.5 rounded-full border border-white/60 text-white font-extrabold hover:bg-white/20 transition-all text-sm backdrop-blur-sm active:scale-95 shadow-sm"
                    >
                      Register
                    </button>
                  )}
                </motion.div>

                {/* Text For Register Mode */}
                <motion.div
                  animate={{ opacity: !isLoginMode ? 1 : 0, scale: !isLoginMode ? 1 : 0.95 }}
                  transition={{ duration: 0.3 }}
                  className="absolute flex flex-col items-center text-center"
                  style={{ pointerEvents: !isLoginMode ? 'auto' : 'none' }}
                >
                  <h2 className="text-2xl sm:text-3xl font-bold mb-1 tracking-wide text-white drop-shadow-sm">Welcome Back!</h2>
                  <p className="text-sm text-gray-200 mb-6 font-light">Already have an Account</p>
                  <button 
                    onClick={() => { setIsLoginMode(true); setValidationMsg(""); }}
                    className="px-10 py-2.5 rounded-full border border-white/60 text-white font-extrabold hover:bg-white/20 transition-all text-sm backdrop-blur-sm active:scale-95 shadow-sm"
                  >
                    Login
                  </button>
                </motion.div>
                
              </div>
            </motion.div>

            {/* ⚪ FORMS CONTAINER (Transparent Glass Subsections) */}
            <div className="absolute inset-0 z-10 w-full h-full bg-transparent">
              
              {/* === REGISTER FORM === */}
              <motion.div
                animate={{ opacity: !isLoginMode ? 1 : 0, y: !isLoginMode ? 0 : 20 }}
                transition={{ duration: 0.3 }}
                className="absolute top-0 w-full h-[65%] px-6 sm:px-8 py-6 flex flex-col items-center justify-center bg-transparent overflow-y-auto [&::-webkit-scrollbar]:hidden"
                style={{ pointerEvents: !isLoginMode ? 'auto' : 'none' }}
              >
                <h2 className="text-3xl font-extrabold mb-6 text-[#0B2027] drop-shadow-sm">Registration</h2>
                
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
                  style={{ WebkitTextSecurity: 'disc' } as any}
                  inputMode="numeric"
                  value={pin || ""} 
                  onChange={(e: any) => {
                    const val = e.target.value.replace(/\D/g, '').slice(0, 6);
                    setPin(val);
                    if (validationMsg) setValidationMsg(""); 
                  }}
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

                <div className={`flex items-center justify-center w-full mb-5 px-4 py-2.5 border rounded-full backdrop-blur-md select-none transition-all duration-300 ${checkboxBorderClass}`}>
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
                  className={`w-full py-3.5 rounded-full font-extrabold tracking-wider transition-all active:scale-[0.98] cursor-pointer ${buttonStyle}`}
                >
                  {buttonText}
                </button>
              </motion.div>


              {/* === LOGIN FORM === */}
              <motion.div
                animate={{ opacity: isLoginMode ? 1 : 0, y: isLoginMode ? 0 : -20 }}
                transition={{ duration: 0.3 }}
                className="absolute bottom-0 w-full h-[65%] px-6 sm:px-8 py-6 flex flex-col items-center justify-center bg-transparent overflow-y-auto [&::-webkit-scrollbar]:hidden"
                style={{ pointerEvents: isLoginMode ? 'auto' : 'none' }}
              >
                <h2 className="text-3xl font-extrabold mb-6 text-[#0B2027] drop-shadow-sm">Login</h2>
                
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
                  className={isExistingUser ? 'bg-white/10 text-slate-700 border-white/20 shadow-[inset_0_3px_8px_rgba(0,0,0,0.05)] cursor-not-allowed opacity-70' : usernameBorderClass}
                  autoComplete="off"
                />
                
                <InputField 
                  icon={<LockIcon />} 
                  placeholder="Password (PIN)" 
                  type="text"
                  style={{ WebkitTextSecurity: 'disc' } as any}
                  inputMode="numeric"
                  value={pin || ""} 
                  onChange={(e: any) => {
                    if (isExistingUser) return;
                    const val = e.target.value.replace(/\D/g, '').slice(0, 6);
                    setPin(val);
                    if (validationMsg) setValidationMsg(""); 
                  }}
                  readOnly={isExistingUser}
                  className={isExistingUser ? 'bg-white/10 text-slate-700 border-white/20 shadow-[inset_0_3px_8px_rgba(0,0,0,0.05)] cursor-not-allowed opacity-70' : pinBorderClass}
                  maxLength={6}
                />

                {isExistingUser && (
                  <div className="w-full text-xs text-[#0B2027] bg-white/20 p-4 border border-white/30 rounded-3xl mb-4 font-extrabold text-center shadow-[0_4px_15px_rgba(0,0,0,0.05)] backdrop-blur-xl whitespace-pre-line leading-relaxed min-h-[65px] flex items-center justify-center">
                    <span className="w-full block drop-shadow-sm">
                      {displayedNote}
                      {!isNoteTypingDone && <span className="animate-pulse ml-0.5 text-[#0B2027]">|</span>}
                    </span>
                  </div>
                )}

                <button 
                  onClick={handleUserLoginWrapper}
                  className={`w-full py-3.5 rounded-full font-extrabold tracking-wider transition-all active:scale-[0.98] cursor-pointer mt-2 ${buttonStyle}`}
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
              className="border-[#235867]/40 bg-white/20 text-slate-900 shadow-[inset_0_3px_8px_rgba(0,0,0,0.05)] focus-within:border-[#0B2027] focus-within:shadow-[0_0_15px_rgba(11,32,39,0.2)]"
              autoComplete="off"
            />
            
            <InputField 
              icon={<LockIcon />} 
              placeholder="Password Admin" 
              type="text"
              style={{ WebkitTextSecurity: 'disc' } as any}
              value={adminPass || ""} 
              onChange={(e: any) => setAdminPass(e.target.value)} 
              className="border-[#235867]/40 bg-white/20 text-slate-900 shadow-[inset_0_3px_8px_rgba(0,0,0,0.05)] focus-within:border-[#0B2027] focus-within:shadow-[0_0_15px_rgba(11,32,39,0.2)] mb-6"
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