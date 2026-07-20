export default function Loading() {
  return (
    <div className="h-screen w-full flex flex-col items-center justify-center bg-slate-950 text-white select-none overflow-hidden relative font-sans">
      
      {/* 🟢🔵 BACKGROUND BLOBS ANIMATION - Bouncing & Glowing 🔵🟢 */}
      <div className="absolute inset-0 flex items-center justify-center overflow-hidden pointer-events-none z-0">
        
        {/* Blob 1: Bouncing Cyan */}
        <div className="absolute w-[350px] h-[350px] md:w-[500px] md:h-[500px] bg-cyan-400/40 rounded-full blur-[80px] animate-blob-cyan"></div>
        
        {/* Blob 2: Bouncing Emerald */}
        <div className="absolute w-[400px] h-[400px] md:w-[600px] md:h-[600px] bg-emerald-400/40 rounded-full blur-[90px] animate-blob-emerald"></div>
        
        {/* Blob 3: Bouncing Blue Glow (Tengah) */}
        <div className="absolute w-[250px] h-[250px] md:w-[350px] md:h-[350px] bg-blue-500/30 rounded-full blur-[70px] animate-blob-blue"></div>
      </div>

      {/* Main Content (Teks iPiX Jelly Bounce) */}
      <div className="relative z-20 flex flex-col items-center justify-center animate-jelly-bounce">
        
        {/* Teks iPiX (Glassy, Gradasi Tema Blob, SVG Custom untuk X Tanpa Cacat) */}
        <div className="flex items-center justify-center mb-4 font-rounded select-none">
          <h1 className="text-7xl md:text-9xl font-black tracking-tighter glassy-blob-text flex items-center">
            <span>i</span>
            <span>P</span>
            <span>i</span>
            {/* SVG Huruf X presisi simetris di tengah tanpa celah */}
            <svg 
              className="w-[1.1em] h-[1.1em] inline-block align-baseline -ml-[0.05em] overflow-visible" 
              viewBox="0 0 100 100" 
              fill="none" 
              xmlns="http://www.w3.org/2000/svg"
            >
              <path 
                d="M10 10 L40 50 L10 90 H28 L50 60 L72 90 H90 L60 50 L90 10 H72 L50 40 L28 10 H10 Z" 
                className="fill-[url(#ipix-gradient)] stroke-white stroke-[6px] [stroke-linejoin:round]" 
                style={{
                  filter: 'drop-shadow(0px 8px 0px rgba(15, 23, 42, 0.5)) drop-shadow(0px 15px 30px rgba(34, 211, 238, 0.5))'
                }}
              />
              <defs>
                <linearGradient id="ipix-gradient" x1="0%" y1="0%" x2="100%" y2="100%">
                  <stop offset="0%" stopColor="#22d3ee" />
                  <stop offset="50%" stopColor="#34d399" />
                  <stop offset="100%" stopColor="#3b82f6" />
                </linearGradient>
              </defs>
            </svg>
          </h1>
        </div>

        {/* Loading Dots Bouncing */}
        <div className="flex gap-3">
          <span className="w-3.5 h-3.5 bg-cyan-400 rounded-full animate-bounce shadow-[0_0_10px_rgba(34,211,238,0.8)]" style={{ animationDelay: '0s' }}></span>
          <span className="w-3.5 h-3.5 bg-emerald-400 rounded-full animate-bounce shadow-[0_0_10px_rgba(52,211,153,0.8)]" style={{ animationDelay: '0.15s' }}></span>
          <span className="w-3.5 h-3.5 bg-blue-400 rounded-full animate-bounce shadow-[0_0_10px_rgba(96,165,250,0.8)]" style={{ animationDelay: '0.3s' }}></span>
        </div>
      </div>

      {/* STYLES & KEYFRAMES MURNI */}
      <style dangerouslySetInnerHTML={{
        __html: `
        /* Import Font Rounded (Nunito) */
        @import url('https://fonts.googleapis.com/css2?family=Nunito:wght@900&display=swap');

        .font-rounded {
          font-family: 'Nunito', sans-serif;
        }

        /* Efek Teks Glassy untuk Huruf i, P, i */
        .glassy-blob-text {
          background: linear-gradient(135deg, #22d3ee 0%, #34d399 50%, #3b82f6 100%);
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
          -webkit-text-stroke: 2px rgba(255, 255, 255, 0.6);
          filter: drop-shadow(0px 8px 0px rgba(15, 23, 42, 0.5)) 
                  drop-shadow(0px 15px 30px rgba(34, 211, 238, 0.5));
        }

        /* --- ANIMASI BLOBS BOUNCING --- */
        
        .animate-blob-cyan {
          animation: bounceGlowCyan 4s ease-in-out infinite;
        }
        
        .animate-blob-emerald {
          animation: bounceGlowEmerald 5s ease-in-out infinite;
          animation-delay: 1s;
        }
        
        .animate-blob-blue {
          animation: bounceGlowBlue 3.5s ease-in-out infinite;
          animation-delay: 0.5s;
        }

        @keyframes bounceGlowCyan {
          0%, 100% { transform: translateY(30px) scale(1); opacity: 0.3; }
          50%      { transform: translateY(-120px) scale(1.15); opacity: 0.7; }
        }

        @keyframes bounceGlowEmerald {
          0%, 100% { transform: translateY(40px) scale(1); opacity: 0.2; }
          50%      { transform: translateY(-150px) scale(1.25); opacity: 0.6; }
        }

        @keyframes bounceGlowBlue {
          0%, 100% { transform: translate(-20px, -40px) scale(0.8); opacity: 0.4; }
          50%      { transform: translate(30px, 60px) scale(1.3); opacity: 0.9; }
        }

        /* Animasi Jelly Bounce untuk Teks Utama */
        .animate-jelly-bounce {
          animation: jelly-bounce 2.5s infinite ease-in-out;
          transform-origin: bottom center;
        }

        @keyframes jelly-bounce {
          0%, 100% { transform: scale(1, 1) translateY(0); }
          10% { transform: scale(1.1, 0.9) translateY(0); }
          30% { transform: scale(0.9, 1.1) translateY(-25px); }
          50% { transform: scale(1.02, 0.98) translateY(0); }
          65% { transform: scale(0.98, 1.02) translateY(-10px); }
          80% { transform: scale(1.01, 0.99) translateY(0); }
        }
        `
      }} />
    </div>
  );
}