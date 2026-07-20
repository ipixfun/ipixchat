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

        /* Efek Stroke Outline - Tipis dan rapi (1.5px) */
        .neon-blue {
          -webkit-text-stroke: 1.5px rgba(59, 130, 246, 1);
          filter: drop-shadow(0 0 8px rgba(59, 130, 246, 0.6));
        }

        .neon-green {
          -webkit-text-stroke: 1.5px rgba(16, 185, 129, 1);
          filter: drop-shadow(0 0 8px rgba(16, 185, 129, 0.6));
        }

        /* 
          ANIMASI SIKLUS SUPER CEPAT: 0.6 DETIK TOTAL
          (0.1 detik diam/pause + 0.5 detik bergerak/berkedip)
        */
        .animate-i1 { animation: flicker-i1 0.6s infinite; }
        .animate-P  { animation: flicker-P 0.6s infinite; }
        .animate-i2 { animation: flicker-i2 0.6s infinite; }
        
        .animate-X {
          animation: spinX 0.6s linear infinite;
          transform-origin: center center;
        }

        /* 
          KEYFRAMES SIKLUS
          0% - 16.67% adalah zona 0.1 detik (diam menyala).
          16.67% - 100% adalah zona 0.5 detik (waktu beraksi super cepat).
        */
        
        /* Huruf 'i' pertama berkedip cepat setelah jeda */
        @keyframes flicker-i1 {
          0%, 17%, 35%, 100% { opacity: 1; }
          25% { opacity: 0.15; }
        }

        /* Huruf 'P' menyusul berkedip di pertengahan */
        @keyframes flicker-P {
          0%, 40%, 60%, 100% { opacity: 1; }
          50% { opacity: 0.15; }
        }

        /* Huruf 'i' kedua berkedip di akhir sebelum siklus ulang */
        @keyframes flicker-i2 {
          0%, 65%, 85%, 100% { opacity: 1; }
          75% { opacity: 0.15; }
        }

        /* Huruf 'X' diam 0.1s, lalu langsung putar 360 derajat dalam 0.5s */
        @keyframes spinX {
          0%, 16.67% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }
        `
      }} />
    </div>
  );
}