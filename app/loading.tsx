export default function Loading() {
  return (
    <div className="h-screen w-full flex flex-col items-center justify-center bg-[#07070a] text-white select-none overflow-hidden relative">
      
      {/* Teks Welcome - Lucu, Gradasi Ijo-Biru, & Mengambang */}
      <h2 className="text-4xl md:text-5xl font-black tracking-widest mb-10 z-10 text-transparent bg-clip-text bg-gradient-to-r from-green-400 via-teal-300 to-blue-500 drop-shadow-[0_0_15px_rgba(74,222,128,0.4)] animate-bounce-slow">
        WELCOME
      </h2>

      {/* Container 3D Motion Graphic */}
      <div className="relative flex items-center justify-center transform-style-3d w-72 h-72 md:w-[400px] md:h-[400px] mb-8">
        
        {/* Cincin Animasi 3D (Background motion) */}
        <div className="absolute w-full h-full border-t-[6px] border-green-400 rounded-full animate-spin-slow shadow-[0_0_25px_rgba(74,222,128,0.5)] opacity-80"></div>
        
        <div className="absolute w-5/6 h-5/6 border-r-[6px] border-blue-400 rounded-full animate-spin-3d-x shadow-[0_0_25px_rgba(96,165,250,0.5)] opacity-80"></div>
        
        <div className="absolute w-4/6 h-4/6 border-b-[6px] border-purple-500 rounded-full animate-spin-3d-y shadow-[0_0_25px_rgba(168,85,247,0.5)] opacity-80"></div>

        {/* Teks IPIX (Gede & Efek 3D Solid) */}
        <div className="absolute z-20 flex items-center justify-center animate-float">
          <h1 className="text-7xl md:text-9xl font-black tracking-tighter text-white text-3d-effect">
            IPIX
          </h1>
        </div>

        {/* Efek Cahaya Inti di belakang teks */}
        <div className="absolute w-20 h-20 bg-cyan-400 rounded-full blur-[40px] opacity-40 animate-pulse"></div>
      </div>

      {/* Custom CSS untuk Animasi 3D dan Teks Solid */}
      <style>{`
        /* Trik CSS untuk membuat teks terlihat timbul 3D */
        .text-3d-effect {
          text-shadow: 
            0 1px 0 #cccccc,
            0 2px 0 #c9c9c9,
            0 3px 0 #bbbbbb,
            0 4px 0 #b9b9b9,
            0 5px 0 #aaaaaa,
            0 6px 1px rgba(0,0,0,.1),
            0 0 5px rgba(0,0,0,.1),
            0 1px 3px rgba(0,0,0,.3),
            0 3px 5px rgba(0,0,0,.2),
            0 5px 10px rgba(0,0,0,.25),
            0 10px 10px rgba(0,0,0,.2),
            0 20px 20px rgba(0,0,0,.15),
            0 0 40px rgba(56, 189, 248, 0.7); /* Efek glow biru dari belakang teks */
        }

        .transform-style-3d {
          transform-style: preserve-3d;
          perspective: 1200px;
        }
        
        .animate-spin-slow {
          animation: spin 5s linear infinite;
        }
        
        .animate-spin-3d-x {
          animation: spin3dX 4s linear infinite;
        }
        
        .animate-spin-3d-y {
          animation: spin3dY 4.5s linear infinite;
        }

        .animate-float {
          animation: float 3s ease-in-out infinite;
        }

        .animate-bounce-slow {
          animation: float 4s ease-in-out infinite reverse;
        }

        @keyframes spin3dX {
          0% { transform: rotateX(0deg) rotateY(45deg) rotateZ(0deg); }
          100% { transform: rotateX(360deg) rotateY(45deg) rotateZ(360deg); }
        }
        
        @keyframes spin3dY {
          0% { transform: rotateY(0deg) rotateX(45deg) rotateZ(0deg); }
          100% { transform: rotateY(360deg) rotateX(45deg) rotateZ(-360deg); }
        }

        /* Animasi mengambang untuk memberikan kesan hidup */
        @keyframes float {
          0% { transform: translateY(0px); }
          50% { transform: translateY(-15px); }
          100% { transform: translateY(0px); }
        }
      `}</style>
    </div>
  );
}