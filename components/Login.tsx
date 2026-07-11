'use client';
import { motion } from 'framer-motion';

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
  return (
    <div className="flex flex-col items-center justify-center h-screen bg-gradient-to-br from-emerald-500 to-blue-600 p-6 relative overflow-hidden w-full">
      <div className="w-full max-w-sm flex flex-col items-center bg-white/10 backdrop-blur-md p-8 rounded-[2rem] border border-white/20 shadow-2xl z-10">
        <h1 className="w-full text-center text-4xl sm:text-5xl font-black mb-8 text-white/95 tracking-tighter drop-shadow-[0_2px_15px_rgba(255,255,255,0.4)] pb-1" style={{ fontFamily: "'Nunito', 'Segoe UI', sans-serif" }}>
          iPixChaT
        </h1>
        {activeTab === 'user' ? (
          <div className="w-full flex flex-col items-center">
            <input 
              className="w-full p-4 rounded-2xl bg-white/20 text-white placeholder-white/70 border border-white/20 focus:border-white focus:bg-white/30 transition-all outline-none font-medium shadow-inner text-center" 
              placeholder="Masukkan Nama Anda..." 
              value={username || ""} 
              onChange={(e) => setUsername(e.target.value)} 
              disabled={isExistingUser} 
            />
            {!isExistingUser ? (
              <div className="bg-white/20 px-5 py-2 rounded-full mt-4 mb-6 text-[10px] text-white/90 shadow-sm border border-white/10 backdrop-blur-sm font-medium tracking-wide">
                buat username yang baik dan benar
              </div>
            ) : (
              <div className="text-[10px] text-white/90 mt-4 mb-6 text-center leading-relaxed bg-black/10 px-4 py-2.5 rounded-xl backdrop-blur-sm border border-white/10 w-full shadow-inner">
                Nama Anda telah tertanam di sistem <br/>Hubungi admin jika ingin merubahnya.
              </div>
            )}
            <button 
              onClick={handleUserLogin} 
              className="w-full bg-gradient-to-r from-emerald-400 to-blue-500 text-white px-8 py-3.5 rounded-2xl font-bold shadow-[0_4px_15px_rgba(0,0,0,0.1)] hover:shadow-[0_6px_20px_rgba(0,0,0,0.15)] hover:scale-[1.02] active:scale-95 transition-all mt-2 text-sm tracking-wide">
              {isExistingUser ? 'Masuk Chat' : 'Login'}
            </button>
          </div>
        ) : (
          <div className="w-full flex flex-col items-center">
            <input className="w-full p-4 rounded-2xl bg-white/20 text-white placeholder-white/70 border border-white/20 focus:border-white focus:bg-white/30 transition-all outline-none font-medium shadow-inner text-center mb-4" placeholder="Email Admin" value={adminEmail || ""} onChange={(e) => setAdminEmail(e.target.value)} />
            <input type="password" className="w-full p-4 rounded-2xl bg-white/20 text-white placeholder-white/70 border border-white/20 focus:border-white focus:bg-white/30 transition-all outline-none font-medium shadow-inner text-center mb-6" placeholder="Password Admin" value={adminPass || ""} onChange={(e) => setAdminPass(e.target.value)} />
            <button onClick={handleAdminLogin} className="w-full bg-gradient-to-r from-emerald-400 to-blue-500 text-white px-8 py-3.5 rounded-2xl font-bold shadow-[0_4px_15px_rgba(0,0,0,0.1)] hover:shadow-[0_6px_20px_rgba(0,0,0,0.15)] hover:scale-[1.02] active:scale-95 transition-all text-sm tracking-wide">
              Verifikasi Admin
            </button>
          </div>
        )}
      </div>

      <div className="absolute bottom-6 text-[11px] text-white/80 flex items-center gap-1.5 z-10 font-medium">
        created by 
        <motion.a 
          href="https://ipix.my.id" 
          target="_blank" 
          className="text-emerald-300 font-black hover:text-emerald-100 px-0.5" 
          animate={{ y: [0, -4, 0] }} 
          transition={{ repeat: Infinity, duration: 2, ease: "easeInOut" }}>
          ipix.my.id
        </motion.a>
        with 
        <motion.span 
          animate={{ scale: [1, 1.3, 1] }} 
          transition={{ repeat: Infinity, duration: 0.8, ease: "easeInOut" }} 
          className="text-red-500 text-sm drop-shadow-md">
          ❤️
        </motion.span>
      </div>
    </div>
  );
}