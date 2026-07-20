export default function Loading() {
  return (
    <div className="h-screen w-full flex flex-col items-center justify-center bg-[#07070a] text-white select-none overflow-hidden relative">
      
      {/* Container 3D Motion Graphic */}
      <div className="relative flex items-center justify-center transform-style-3d w-72 h-72 md:w-[400px] md:h-[400px]">
        
        {/* Cincin Animasi 3D (Background motion) */}
        <div className="absolute w-full h-full border-t-[6px] border-green-400 rounded-full animate-spin-slow shadow-[0_0_25px_rgba(74,222,128,0.5)] opacity-80"></div>
        
        <div className="absolute w-5/6 h-5/6 border-r-[6px] border-blue-400 rounded-full animate-spin-3d-x shadow-[0_0_25px_rgba(96,165,250,0.5)] opacity-80"></div>
        
        <div className="absolute w-4/6 h-4/6 border-b-[6px] border-purple-500 rounded-full animate-spin-3d-y shadow-[0_0_25px_rgba(168,85,247,0.5)] opacity-80"></div>

        {/* Teks IPIX (Rounded, Glassy, Gradasi Ijo-Biru, Outline Kaca, 3D & Jelly Bounce) */}
        <div className="absolute z-20 flex items-center justify-center animate-jelly-bounce">
          <h1 className="text-7xl md:text-9xl font-black tracking-tighter font-rounded glassy-3d-text">
            IPIX
          </h1>
        </div>

        {/* Efek Cahaya Inti di belakang teks */}
        <div className="absolute w-20 h-20 bg-cyan-400 rounded-full blur-[40px] opacity-40 animate-pulse"></div>
      </div>

      {/* SOLUSI: Gunakan dangerouslySetInnerHTML */}
      <style dangerouslySetInnerHTML={{
        __html: `
        /* Import Font Rounded (Nunito) agar teks terlihat lebih gemas dan membulat */
        @import url('https://fonts.googleapis.com/css2?family=Nunito:wght@900&display=swap');

        .font-rounded {
          font-family: 'Nunito', sans-serif;
        }

        /* Efek Teks Glassy, Gradasi, Outline, & 3D */
        .glassy-3d-text {
          background: linear-gradient(135deg, #4ade80 0%, #3b82f6 100%);
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
          -webkit-text-stroke: 3px rgba(255, 255, 255, 0.7);
          filter: drop-shadow(0px 8px 0px rgba(59, 130, 246, 0.6))
                  drop-shadow(0px 15px 25px rgba(74, 222, 128, 0.4));
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

        .animate-jelly-bounce {
          animation: jelly-bounce 2s infinite ease-in-out;
          transform-origin: bottom center;
        }

        @keyframes spin3dX {
          0% { transform: rotateX(0deg) rotateY(45deg) rotateZ(0deg); }
          100% { transform: rotateX(360deg) rotateY(45deg) rotateZ(360deg); }
        }
        
        @keyframes spin3dY {
          0% { transform: rotateY(0deg) rotateX(45deg) rotateZ(0deg); }
          100% { transform: rotateY(360deg) rotateX(45deg) rotateZ(-360deg); }
        }

        @keyframes spin {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }

        @keyframes jelly-bounce {
          0%, 100% { transform: scale(1, 1) translateY(0); }
          10% { transform: scale(1.15, 0.85) translateY(0); }
          30% { transform: scale(0.85, 1.15) translateY(-40px); }
          50% { transform: scale(1.05, 0.95) translateY(0); }
          65% { transform: scale(0.98, 1.02) translateY(-15px); }
          80% { transform: scale(1.01, 0.99) translateY(0); }
        }
        `
      }} />
    </div>
  );
}