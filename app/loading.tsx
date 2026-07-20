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

      {/* STYLES & KEYFRAMES MURNI */}
      <style dangerouslySetInnerHTML={{
        __html: `
        /* Gunakan Varela Round untuk gaya huruf bulat yang rapi */
        @import url('https://fonts.googleapis.com/css2?family=Varela+Round&display=swap');

        .font-rounded {
          font-family: 'Varela Round', 'Arial Rounded MT Bold', system-ui, sans-serif;
        }

        /* Konfigurasi Dasar Huruf */
        .letter {
          display: inline-block;
          color: #020617; /* Warna solid gelap menutupi bagian dalam */
          line-height: 1;
        }

        /* Efek Stroke Outline - Dipertipis jadi 1.5px */
        .neon-blue {
          -webkit-text-stroke: 1.5px rgba(59, 130, 246, 1); /* Biru */
          filter: drop-shadow(0 0 8px rgba(59, 130, 246, 0.6));
        }

        .neon-green {
          -webkit-text-stroke: 1.5px rgba(16, 185, 129, 1); /* Hijau */
          filter: drop-shadow(0 0 8px rgba(16, 185, 129, 0.6));
        }

        /* 
          ANIMASI SIKLUS: 0.8 DETIK TOTAL
          (0.3 detik diam/pause + 0.5 detik bergerak/berkedip)
          Menggunakan infinite agar ritme (diam-gerak-diam-gerak) ini terus berulang
        */
        .animate-i1 { animation: flicker-i1 0.8s infinite; }
        .animate-P  { animation: flicker-P 0.8s infinite; }
        .animate-i2 { animation: flicker-i2 0.8s infinite; }
        
        .animate-X {
          animation: spinX 0.8s linear infinite;
          transform-origin: center center;
        }

        /* 
          KEYFRAMES SIKLUS
          0% - 37.5% adalah zona 0.3 detik awal (semua diam menyala).
          37.5% - 100% adalah zona 0.5 detik akhir (waktunya beraksi).
        */
        
        /* Huruf 'i' pertama berkedip di awal zona gerak */
        @keyframes flicker-i1 {
          0%, 42%, 48%, 100% { opacity: 1; }
          45% { opacity: 0.15; }
        }

        /* Huruf 'P' berkedip di tengah zona gerak */
        @keyframes flicker-P {
          0%, 63%, 69%, 100% { opacity: 1; }
          66% { opacity: 0.15; }
        }

        /* Huruf 'i' kedua berkedip di akhir zona gerak */
        @keyframes flicker-i2 {
          0%, 84%, 90%, 100% { opacity: 1; }
          87% { opacity: 0.15; }
        }

        /* Huruf 'X' diam lalu berputar smooth tepat selama 0.5 detik terakhir */
        @keyframes spinX {
          0%, 37.5% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }
        `
      }} />
    </div>
  );
}