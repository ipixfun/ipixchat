export default function Loading() {
  return (
    <div className="h-screen w-full flex flex-col items-center justify-center bg-[#0a0a0a] text-white select-none overflow-hidden">
      
      {/* 3D Motion Graphic Element */}
      <div className="relative w-32 h-32 flex items-center justify-center mb-10 transform-style-3d">
        
        {/* Lingkaran Luar (Rotasi Z) */}
        <div className="absolute w-full h-full border-t-4 border-blue-500 rounded-full animate-spin-slow shadow-[0_0_15px_rgba(59,130,246,0.5)]"></div>
        
        {/* Lingkaran Tengah (Rotasi X 3D) */}
        <div className="absolute w-24 h-24 border-r-4 border-cyan-400 rounded-full animate-spin-3d-x shadow-[0_0_15px_rgba(34,211,238,0.5)]"></div>
        
        {/* Lingkaran Dalam (Rotasi Y 3D) */}
        <div className="absolute w-16 h-16 border-b-4 border-purple-500 rounded-full animate-spin-3d-y shadow-[0_0_15px_rgba(168,85,247,0.5)]"></div>
        
        {/* Inti Cahaya (Core) */}
        <div className="absolute w-3 h-3 bg-white rounded-full shadow-[0_0_20px_10px_rgba(255,255,255,0.3)] animate-pulse"></div>
      </div>

      {/* Teks Welcome dengan efek Gradient & Glow */}
      <h1 className="text-4xl md:text-5xl font-black tracking-[0.2em] mb-2 drop-shadow-2xl text-transparent bg-clip-text bg-gradient-to-r from-blue-400 via-cyan-300 to-purple-500 animate-pulse-slow">
        WELCOME
      </h1>
      
      {/* Footer Text */}
      <p className="text-xs md:text-sm font-medium mt-2 text-gray-500/80 tracking-[0.3em] uppercase italic relative overflow-hidden group">
        <span className="inline-block animate-slide-up">created by : ipix</span>
      </p>

      {/* Custom CSS untuk Animasi 3D agar tidak perlu setup config Tailwind */}
      <style>{`
        .transform-style-3d {
          transform-style: preserve-3d;
          perspective: 1000px;
        }
        
        .animate-spin-slow {
          animation: spin 3s linear infinite;
        }
        
        .animate-spin-3d-x {
          animation: spin3dX 2s linear infinite;
        }
        
        .animate-spin-3d-y {
          animation: spin3dY 2.5s linear infinite;
        }

        .animate-pulse-slow {
          animation: pulse 3s cubic-bezier(0.4, 0, 0.6, 1) infinite;
        }

        .animate-slide-up {
          animation: slideUp 1s ease-out forwards;
        }

        @keyframes spin3dX {
          0% { transform: rotateX(0deg) rotateY(45deg) rotateZ(0deg); }
          100% { transform: rotateX(360deg) rotateY(45deg) rotateZ(360deg); }
        }
        
        @keyframes spin3dY {
          0% { transform: rotateY(0deg) rotateX(45deg) rotateZ(0deg); }
          100% { transform: rotateY(360deg) rotateX(45deg) rotateZ(-360deg); }
        }

        @keyframes slideUp {
          from { opacity: 0; transform: translateY(20px); }
          to { opacity: 1; transform: translateY(0); }
        }
      `}</style>
    </div>
  );
}