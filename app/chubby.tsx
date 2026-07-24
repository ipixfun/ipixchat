'use client';
import { motion } from 'framer-motion';
import { useEffect, useState } from 'react';

interface ChubbyGuyProps {
  /** true jika sedang mengucapkan "Hallo" -> mulut animasi */
  isSpeaking?: boolean;
  /** ukuran render (px), default 200 */
  size?: number;
  className?: string;
}

export default function ChubbyGuy({
  isSpeaking = false,
  size = 200,
  className = '',
}: ChubbyGuyProps) {
  const [speakingStep, setSpeakingStep] = useState(0);

  // Animasi mulut untuk kata "Hal-lo" (2 suku kata)
  useEffect(() => {
    if (!isSpeaking) {
      setSpeakingStep(0);
      return;
    }

    const sequence = [0, 1, 2, 1, 0]; // buka-sedikit-buka lebar-sedikit-tutup
    let i = 0;
    const interval = setInterval(() => {
      setSpeakingStep(sequence[i]);
      i++;
      if (i >= sequence.length) {
        clearInterval(interval);
        setTimeout(() => setSpeakingStep(0), 400);
      }
    }, 180);

    return () => clearInterval(interval);
  }, [isSpeaking]);

  // Mapping bentuk mulut berdasarkan step
  const mouthPaths = [
    "M85 136 Q100 140 115 136", // netral
    "M85 136 Q100 148 115 136", // sedikit buka (Ha)
    "M82 136 Q100 158 118 136", // buka lebar (Lo)
  ];

  return (
    <div className={className} style={{ width: size, height: size }}>
      <svg
        viewBox="0 0 200 200"
        width={size}
        height={size}
        xmlns="http://www.w3.org/2000/svg"
      >
        {/* ====== LATAR BELAKANG BAYANGAN DUDUK ====== */}
        <motion.ellipse
          cx="100" cy="188" rx="55" ry="8"
          fill="#00000022"
          animate={{ rx: isSpeaking ? [55, 50, 55] : 55 }}
          transition={{ duration: 0.4, repeat: isSpeaking ? 1 : 0 }}
        />

        {/* ====== KAKI (nangkring santai) ====== */}
        <motion.g
          animate={{ rotate: isSpeaking ? [0, -3, 3, 0] : 0 }}
          transition={{ duration: 0.6, ease: 'easeInOut' }}
        >
          {/* Kaki kiri */}
          <ellipse cx="70" cy="178" rx="22" ry="12" fill="#f4b98a" />
          <path d="M48 178 Q50 172 55 170 L65 168" stroke="#f4b98a" strokeWidth="8" strokeLinecap="round" fill="none" />
          {/* Kaki kanan */}
          <ellipse cx="130" cy="178" rx="22" ry="12" fill="#f4b98a" />
          <path d="M152 178 Q150 172 145 170 L135 168" stroke="#f4b98a" strokeWidth="8" strokeLinecap="round" fill="none" />
        </motion.g>

        {/* ====== CELANA PENDEK ====== */}
        <motion.g
          animate={{ y: isSpeaking ? [0, -2, 0] : 0 }}
          transition={{ duration: 0.3 }}
        >
          <path d="M55 145 Q50 140 55 130 L70 125 L130 125 L145 130 Q150 140 145 145 Z" fill="#3b5998" />
          <path d="M55 145 L55 162 L78 162 L78 145 Z" fill="#3b5998" />
          <path d="M145 145 L145 162 L122 162 L122 145 Z" fill="#3b5998" />
        </motion.g>

        {/* ====== BADAN (Chubby, shirtless) ====== */}
        <motion.g
          animate={{
            y: isSpeaking ? [0, -3, 0] : 0,
            scaleY: isSpeaking ? [1, 1.03, 1] : 1,
          }}
          transition={{ duration: 0.4, ease: 'easeInOut' }}
        >
          {/* Badan utama */}
          <ellipse cx="100" cy="120" rx="52" ry="58" fill="#f4b98a" />
          {/* Bayangan badan */}
          <ellipse cx="100" cy="120" rx="52" ry="58" fill="url(#bodyShade)" opacity="0.2" />

          {/* Pusar (chubby banget) */}
          <motion.ellipse
            cx="100" cy="140" rx="6" ry="4" fill="#d4946a"
            animate={{ scaleY: isSpeaking ? [1, 0.7, 1] : 1 }}
            transition={{ duration: 0.4 }}
          />

          {/* Garis perut chubby */}
          <path d="M72 130 Q100 142 128 130" stroke="#d4946a" strokeWidth="1" fill="none" opacity="0.4" />
        </motion.g>

        {/* ====== LENGAN & TANGAN (Megang HP) ====== */}
        {/* Lengan kiri (penyangga) */}
        <motion.g
          animate={{
            rotate: isSpeaking ? [-5, 5, -5] : 0,
          }}
          transition={{ duration: 0.5, ease: 'easeInOut' }}
          style={{ originX: '55px', originY: '110px' }}
        >
          {/* Lengan atas */}
          <path d="M50 100 Q30 120 25 145 Q22 158 35 155 L50 148" fill="#f4b98a" stroke="#e0a880" strokeWidth="1.5" />
          {/* Tangan kiri */}
          <circle cx="32" cy="152" r="10" fill="#f4b98a" />
        </motion.g>

        {/* Lengan kanan (megang HP) */}
        <motion.g
          animate={{
            rotate: isSpeaking ? [8, -3, 8] : 5,
            y: isSpeaking ? [0, -4, 0] : 0,
          }}
          transition={{ duration: 0.5, ease: 'easeInOut' }}
          style={{ originX: '145px', originY: '110px' }}
        >
          {/* Lengan atas */}
          <path d="M150 100 Q170 115 168 138 Q167 148 155 148 L148 140" fill="#f4b98a" stroke="#e0a880" strokeWidth="1.5" />
          {/* Tangan kanan */}
          <circle cx="162" cy="142" r="9" fill="#f4b98a" />
          {/* Jari */}
          <circle cx="170" cy="138" r="3.5" fill="#f4b98a" />
          <circle cx="172" cy="143" r="3.5" fill="#f4b98a" />
          <circle cx="170" cy="148" r="3.5" fill="#f4b98a" />
        </motion.g>

        {/* ====== HP (Di tangan kanan) ====== */}
        <motion.g
          animate={{
            y: isSpeaking ? [0, -4, 0] : 0,
            rotate: isSpeaking ? [5, -2, 5] : 5,
          }}
          transition={{ duration: 0.5, ease: 'easeInOut' }}
        >
          <rect x="158" y="118" width="28" height="48" rx="6" fill="#2d2d2d" />
          <rect x="161" y="122" width="22" height="36" rx="3" fill="#4ecdc4" />
          {/* Layar HP */}
          <motion.rect
            x="163" y="126" width="18" height="28" rx="2"
            fill="#ffffff"
            animate={{ opacity: isSpeaking ? [0.7, 1, 0.7] : 0.9 }}
            transition={{ duration: 0.4, repeat: isSpeaking ? Infinity : 0 }}
          />
          {/* Notifikasi kecil */}
          <circle cx="177" cy="130" r="3" fill="#ff6b6b" />
          {/* Tombol home */}
          <circle cx="172" cy="163" r="2.5" fill="#555" />
        </motion.g>

        {/* ====== KEPALA ====== */}
        <motion.g
          animate={{
            y: isSpeaking ? [0, -5, 0] : 0,
            rotate: isSpeaking ? [-2, 3, -2] : 0,
          }}
          transition={{ duration: 0.5, ease: 'easeInOut' }}
        >
          {/* Kepala */}
          <ellipse cx="100" cy="65" rx="48" ry="44" fill="#f4b98a" />
          <ellipse cx="100" cy="65" rx="48" ry="44" fill="url(#headShade)" opacity="0.15" />

          {/* Pipi chubby */}
          <ellipse cx="68" cy="78" rx="14" ry="9" fill="#ffb6c1" opacity="0.3" />
          <ellipse cx="132" cy="78" rx="14" ry="9" fill="#ffb6c1" opacity="0.3" />

          {/* ====== KACAMATA ====== */}
          <motion.g
            animate={{ y: isSpeaking ? [0, -2, 0] : 0 }}
            transition={{ duration: 0.3 }}
          >
            {/* Frame kacamata */}
            <rect x="62" y="60" width="28" height="20" rx="6" fill="none" stroke="#2d3436" strokeWidth="2.5" />
            <rect x="110" y="60" width="28" height="20" rx="6" fill="none" stroke="#2d3436" strokeWidth="2.5" />
            {/* Jembatan */}
            <path d="M90 68 Q100 62 110 68" stroke="#2d3436" strokeWidth="2.5" fill="none" />
            {/* Gagang kacamata */}
            <path d="M62 68 L52 66" stroke="#2d3436" strokeWidth="2.5" strokeLinecap="round" />
            <path d="M138 68 L148 66" stroke="#2d3436" strokeWidth="2.5" strokeLinecap="round" />
            {/* Lensa (sedikit transparan) */}
            <rect x="64" y="62" width="24" height="16" rx="5" fill="#e8f4fd" opacity="0.25" />
            <rect x="112" y="62" width="24" height="16" rx="5" fill="#e8f4fd" opacity="0.25" />
            {/* Pantulan lensa */}
            <path d="M68 66 L72 66" stroke="#ffffff" strokeWidth="1" opacity="0.5" />
            <path d="M116 66 L120 66" stroke="#ffffff" strokeWidth="1" opacity="0.5" />
          </motion.g>

          {/* ====== MATA (dibalik kacamata) ====== */}
          <motion.g
            animate={{ scaleY: isSpeaking ? [1, 0.85, 1] : 1 }}
            transition={{ duration: 0.3 }}
          >
            {/* Mata kiri */}
            <circle cx="76" cy="70" r="6" fill="#fff" />
            <motion.circle
              cx="76" cy="70" r="3.5" fill="#2a1a10"
              animate={{ x: isSpeaking ? [0, 2, -1, 0] : 0 }}
              transition={{ duration: 0.5 }}
            />
            {/* Mata kanan */}
            <circle cx="124" cy="70" r="6" fill="#fff" />
            <motion.circle
              cx="124" cy="70" r="3.5" fill="#2a1a10"
              animate={{ x: isSpeaking ? [0, 2, -1, 0] : 0 }}
              transition={{ duration: 0.5 }}
            />
          </motion.g>

          {/* ====== ALIS (nyantai di atas kacamata) ====== */}
          <motion.path
            d="M62 56 Q76 52 86 56"
            stroke="#2a1a10"
            strokeWidth="2.5"
            fill="none"
            strokeLinecap="round"
            animate={{ y: isSpeaking ? [0, -2, 0] : 0 }}
            transition={{ duration: 0.3 }}
          />
          <motion.path
            d="M114 56 Q124 52 138 56"
            stroke="#2a1a10"
            strokeWidth="2.5"
            fill="none"
            strokeLinecap="round"
            animate={{ y: isSpeaking ? [0, -2, 0] : 0 }}
            transition={{ duration: 0.3 }}
          />

          {/* ====== HIDUNG ====== */}
          <ellipse cx="100" cy="76" rx="5" ry="3.5" fill="#e0a880" />

          {/* ====== MULUT DINAMIS (Intonasi "Hallo") ====== */}
          <motion.g
            animate={{ y: isSpeaking ? [0, -1, 0] : 0 }}
            transition={{ duration: 0.25 }}
          >
            {/* Mulut utama */}
            <motion.path
              stroke="#c0392b"
              strokeWidth="3.5"
              fill="#e74c3c"
              strokeLinecap="round"
              strokeLinejoin="round"
              animate={{ d: mouthPaths[speakingStep] || mouthPaths[0] }}
              transition={{ duration: 0.15, ease: 'easeInOut' }}
            />
            {/* Lidah kecil (muncul saat buka lebar) */}
            {speakingStep === 2 && (
              <motion.ellipse
                cx="100" cy="150" rx="7" ry="4"
                fill="#ff7675"
                initial={{ scaleY: 0 }}
                animate={{ scaleY: 1 }}
                exit={{ scaleY: 0 }}
                transition={{ duration: 0.1 }}
              />
            )}
          </motion.g>
        </motion.g>

        {/* ====== RAMBUT SPIKE HITAM ====== */}
        <motion.g
          animate={{
            y: isSpeaking ? [0, -6, 0] : 0,
          }}
          transition={{ duration: 0.5, ease: 'easeInOut', delay: 0.05 }}
        >
          {/* Spike belakang */}
          <path d="M58 38 Q55 20 68 18 Q72 22 70 38" fill="#1a1a2e" />
          <path d="M72 32 Q75 10 88 12 Q86 18 82 34" fill="#1a1a2e" />
          {/* Spike tengah (paling tinggi) */}
          <motion.path
            d="M88 30 Q92 2 100 6 Q98 16 96 32"
            fill="#1a1a2e"
            animate={{ scaleY: isSpeaking ? [1, 1.08, 1] : 1 }}
            transition={{ duration: 0.4, ease: 'easeInOut' }}
          />
          <path d="M104 32 Q108 8 112 14 Q108 20 106 34" fill="#1a1a2e" />
          <path d="M118 34 Q124 14 132 18 Q128 24 122 36" fill="#1a1a2e" />
          {/* Spike samping */}
          <path d="M134 40 Q142 24 145 30 Q140 36 136 42" fill="#1a1a2e" />
          {/* Poni depan */}
          <path d="M64 42 Q68 28 78 24 Q90 20 100 22 Q110 20 122 24 Q132 28 136 42" fill="#1a1a2e" />
          {/* Detail spike tambahan */}
          <path d="M60 48 Q56 32 64 30 Q68 38 64 48" fill="#252540" />
          <path d="M140 48 Q144 32 136 30 Q132 38 136 48" fill="#252540" />
        </motion.g>

        {/* ====== TEKS "Hallo!" ====== */}
        {isSpeaking && (
          <motion.g
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: -20 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.3 }}
          >
            {/* Balon teks */}
            <rect x="120" y="-15" width="65" height="30" rx="12" fill="#fff" stroke="#2d3436" strokeWidth="1.5" />
            <path d="M135 12 L125 22 L140 14" fill="#fff" stroke="#2d3436" strokeWidth="1.5" />
            {/* Teks */}
            <motion.text
              x="152"
              y="5"
              textAnchor="middle"
              fill="#2d3436"
              fontSize="16"
              fontWeight="bold"
              fontFamily="sans-serif"
              animate={{ scale: [1, 1.1, 1] }}
              transition={{ duration: 0.5, repeat: Infinity }}
            >
              Hallo!
            </motion.text>
          </motion.g>
        )}

        <defs>
          <radialGradient id="headShade" cx="40%" cy="30%" r="60%">
            <stop offset="0%" stopColor="#ffffff" />
            <stop offset="100%" stopColor="#000000" />
          </radialGradient>
          <radialGradient id="bodyShade" cx="40%" cy="30%" r="60%">
            <stop offset="0%" stopColor="#ffffff" />
            <stop offset="100%" stopColor="#000000" />
          </radialGradient>
        </defs>
      </svg>
    </div>
  );
}