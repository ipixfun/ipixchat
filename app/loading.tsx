export default function Loading() {
  return (
    <div className="h-screen w-full flex flex-col items-center justify-center bg-[#020617] select-none overflow-hidden relative">
      
      {/* Main Content */}
      <div className="relative z-20 flex flex-col items-center justify-center">
        
        {/* Teks iPiX */}
        <h1 className="relative font-rounded text-7xl md:text-9xl font-black tracking-widest flex items-center justify-center">
          <span className="letter neon-blue">i</span>
          <span className="letter neon-green">P</span>
          <span className="letter neon-blue">i</span>
          <span className="letter neon-green animate-X">X</span>
        </h1>
      </div>

      <style dangerouslySetInnerHTML={{
        __html: `
        @import url('https://fonts.googleapis.com/css2?family=Varela+Round&display=swap');

        .font-rounded { font-family: 'Varela Round', sans-serif; }
        .letter { 
          color: #020617; 
          line-height: 1; 
          display: inline-block;
        }

        .neon-blue {
          -webkit-text-stroke: 1.5px rgba(59, 130, 246, 1);
          filter: drop-shadow(0 0 8px rgba(59, 130, 246, 0.6));
        }

        .neon-green {
          -webkit-text-stroke: 1.5px rgba(16, 185, 129, 1);
          filter: drop-shadow(0 0 8px rgba(16, 185, 129, 0.6));
        }

        /* ANIMASI X: PUTAR 1 DETIK + DIAM 0.2 DETIK */
        .animate-X {
          display: inline-flex;
          align-items: center;
          justify-content: center;
          width: 1em;
          height: 1em;
          transform-origin: center center;
          will-change: transform;
          /* Total durasi 1.2s (83.33% putar + 16.67% diam) */
          animation: spinAndPause 1.2s cubic-bezier(0.4, 0, 0.2, 1) infinite;
        }

        @keyframes spinAndPause {
          0% {
            transform: rotate(0deg);
          }
          /* 1.0 Detik Pertama (83.33% dari 1.2s): Putar cepat 3 kali (1080 deg) */
          83.33% {
            transform: rotate(1080deg);
          }
          /* 0.2 Detik Terakhir (100% dari 1.2s): Diam menahan posisi */
          100% {
            transform: rotate(1080deg);
          }
        }
        `
      }} />
    </div>
  );
}