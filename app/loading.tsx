export default function Loading() {
  return (
    <div className="h-screen w-full flex flex-col items-center justify-center bg-[#020617] select-none overflow-hidden relative">
      
      {/* Main Content */}
      <div className="relative z-20 flex flex-col items-center justify-center">
        
        {/* Teks iPiX - Statis dengan efek Neon Outline Bergerak */}
        <h1 className="relative font-rounded text-7xl md:text-9xl font-black tracking-widest flex items-center justify-center">
          
          {/* Layer 1: Outline Biru (Bergerak dari kiri ke kanan) */}
          <span 
            className="absolute inset-0 outline-layer outline-blue pointer-events-none" 
            aria-hidden="true"
          >
            iPiX
          </span>
          
          {/* Layer 2: Outline Hijau (Bergerak dari kanan ke kiri) */}
          <span 
            className="absolute inset-0 outline-layer outline-green pointer-events-none" 
            aria-hidden="true"
          >
            iPiX
          </span>
          
          {/* Layer 3: Teks Utama (Solid gelap menutupi bagian dalam agar tersisa outline saja) */}
          <span className="relative z-10 text-[#020617]">
            iPiX
          </span>

        </h1>
      </div>

      {/* STYLES & KEYFRAMES MURNI */}
      <style dangerouslySetInnerHTML={{
        __html: `
        /* Gunakan Varela Round untuk gaya huruf bulat yang rapi */
        @import url('https://fonts.googleapis.com/css2?family=Varela+Round&display=swap');

        .font-rounded {
          font-family: 'Varela Round', 'Arial Rounded MT Bold', system-ui, sans-serif;
        }

        /* 
          Konfigurasi dasar outline: 
          Teks asli transparan, tapi diberi stroke transparan yang diisi oleh gradient background. 
          Layer Teks Utama (#020617) akan menimpa tengahnya, sehingga hanya pinggirannya yang terlihat.
        */
        .outline-layer {
          -webkit-text-fill-color: transparent;
          -webkit-text-stroke: 0.04em transparent;
          z-index: 0;
          /* Sedikit drop shadow halus agar tidak terlalu flat */
          filter: drop-shadow(0 0 2px rgba(255,255,255,0.05));
        }

        /* Outline Biru (Smooth & Soft) */
        .outline-blue {
          background: linear-gradient(90deg, 
            transparent 0%, 
            transparent 35%, 
            rgba(59, 130, 246, 0.7) 50%, /* Blue */
            transparent 65%, 
            transparent 100%
          );
          background-size: 200% 100%;
          -webkit-background-clip: text;
          /* Durasi dipercepat menjadi 1.5 detik */
          animation: sweepRight 1s linear infinite;
        }

        /* Outline Hijau (Smooth & Soft) */
        .outline-green {
          background: linear-gradient(90deg, 
            transparent 0%, 
            transparent 35%, 
            rgba(16, 185, 129, 0.7) 50%, /* Emerald/Green */
            transparent 65%, 
            transparent 100%
          );
          background-size: 200% 100%;
          -webkit-background-clip: text;
          /* Durasi dipercepat menjadi 1.5 detik */
          animation: sweepLeft 1s linear infinite;
          mix-blend-mode: screen; /* Agar warnanya menyatu dengan cantik saat bertemu di tengah */
        }

        /* Keyframes untuk pergerakan silang (menyatu di titik 50%) */
        @keyframes sweepRight {
          0% { background-position: 200% center; }
          100% { background-position: -100% center; }
        }

        @keyframes sweepLeft {
          0% { background-position: -100% center; }
          100% { background-position: 200% center; }
        }
        `
      }} />
    </div>
  );
}