export default function Loading() {
  return (
    <div className="h-screen w-full flex flex-col items-center justify-center bg-[#020617] select-none overflow-hidden relative">
      
      {/* Main Content */}
      <div className="relative z-20 flex flex-col items-center justify-center">
        
        {/* Teks iPiX */}
        <h1 className="relative font-rounded text-7xl md:text-9xl font-black tracking-widest flex items-center justify-center">
          <span className="letter neon-blue animate-i1">i</span>
          <span className="letter neon-green animate-P">P</span>
          <span className="letter neon-blue animate-i2">i</span>
          <span className="letter neon-green animate-X">X</span>
        </h1>
      </div>

      <style dangerouslySetInnerHTML={{
        __html: `
        @import url('https://fonts.googleapis.com/css2?family=Varela+Round&display=swap');

        .font-rounded { font-family: 'Varela Round', sans-serif; }
        .letter { color: #020617; line-height: 1; }

        .neon-blue {
          -webkit-text-stroke: 1.5px rgba(59, 130, 246, 1);
          filter: drop-shadow(0 0 8px rgba(59, 130, 246, 0.6));
        }

        .neon-green {
          -webkit-text-stroke: 1.5px rgba(16, 185, 129, 1);
          filter: drop-shadow(0 0 8px rgba(16, 185, 129, 0.6));
        }

        /* ANIMATION CONFIGURATION (1.5s Lebih Cepat) */
        .animate-X {
          display: inline-flex;
          align-items: center;
          justify-content: center;
          width: 1em;
          height: 1em;
          animation: spinX 1.5s cubic-bezier(0.65, 0, 0.35, 1) infinite;
        }

        .animate-i1 { animation: suck-i1 1.5s cubic-bezier(0.65, 0, 0.35, 1) infinite; }
        .animate-P  { animation: suck-P 1.5s cubic-bezier(0.65, 0, 0.35, 1) infinite; }
        .animate-i2 { animation: suck-i2 1.5s cubic-bezier(0.65, 0, 0.35, 1) infinite; }

        /* X Berputar di Tempat */
        @keyframes spinX {
          0%, 15% { transform: scale(1) rotate(0deg); }
          40%, 60% { 
            transform: scale(1.4) rotate(720deg); 
            filter: drop-shadow(0 0 20px rgba(16, 185, 129, 1));
          }
          85%, 100% { transform: scale(1) rotate(0deg); }
        }

        /* Huruf-huruf ditarik ke kanan menuju posisi X */
        @keyframes suck-i1 {
          0%, 15% { transform: translateX(0) scale(1); opacity: 1; }
          40%, 60% { transform: translateX(2.5em) scale(0); opacity: 0; }
          85%, 100% { transform: translateX(0) scale(1); opacity: 1; }
        }

        @keyframes suck-P {
          0%, 15% { transform: translateX(0) scale(1); opacity: 1; }
          40%, 60% { transform: translateX(1.5em) scale(0); opacity: 0; }
          85%, 100% { transform: translateX(0) scale(1); opacity: 1; }
        }

        @keyframes suck-i2 {
          0%, 15% { transform: translateX(0) scale(1); opacity: 1; }
          40%, 60% { transform: translateX(0.5em) scale(0); opacity: 0; }
          85%, 100% { transform: translateX(0) scale(1); opacity: 1; }
        }
        `
      }} />
    </div>
  );
}