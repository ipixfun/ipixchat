'use client';
import { motion } from 'framer-motion';

interface BearMascotProps {
  /** -1 (kiri) sampai 1 (kanan), posisi pupil mata mengikuti ketikan */
  eyeX?: number;
  /** true kalau field yang aktif adalah PIN tersembunyi -> tangan nutup mata */
  isCovering?: boolean;
  /** true kalau sedang mengetik username/email -> mata jadi love */
  isLove?: boolean;
  /** true kalau sedang mengetik (kolom aktif) -> tangan gerak ngetik */
  isTyping?: boolean;
  /** ukuran render (px), default 140 */
  size?: number;
  className?: string;
}

export default function BearMascot({
  eyeX = 0,
  isCovering = false,
  isLove = false,
  isTyping = false,
  size = 140,
  className = '',
}: BearMascotProps) {
  const clampedX = Math.max(-1, Math.min(1, eyeX));
  const pupilOffset = clampedX * 3.2;

  return (
    <div className={className} style={{ width: size, height: size }}>
      <svg
        viewBox="0 0 200 200"
        width={size}
        height={size}
        xmlns="http://www.w3.org/2000/svg"
      >
        {/* --- TELINGA --- */}
        <circle cx="62" cy="52" r="22" fill="#8a5a34" />
        <circle cx="62" cy="52" r="12" fill="#c99a6b" />
        <circle cx="138" cy="52" r="22" fill="#8a5a34" />
        <circle cx="138" cy="52" r="12" fill="#c99a6b" />

        {/* --- KEPALA --- */}
        <ellipse cx="100" cy="105" rx="72" ry="66" fill="#a5713f" />
        <ellipse cx="100" cy="105" rx="72" ry="66" fill="url(#shade)" opacity="0.25" />

        {/* --- PIPI / MONCONG --- */}
        <ellipse cx="100" cy="128" rx="34" ry="26" fill="#d9ac78" />

        {/* --- HIDUNG & MULUT DINAMIS --- */}
        <motion.g
          animate={{ x: pupilOffset * 1.5 }}
          transition={{ type: 'spring', stiffness: 260, damping: 18 }}
        >
          {/* Hidung */}
          <ellipse cx="100" cy="116" rx="11" ry="8" fill="#3b2416" />
          {/* Mulut berubah jadi senyum lebar saat mata love (isLove), normal jika tidak */}
          <motion.path
            stroke="#3b2416"
            strokeLinecap="round"
            fill="none"
            animate={{ 
              d: isLove ? "M82 126 Q100 142 118 126" : "M92 126 Q100 132 108 126",
              strokeWidth: isLove ? 3.5 : 2.5
            }}
            transition={{ type: 'spring', stiffness: 260, damping: 20 }}
          />
        </motion.g>

        {/* --- MATA --- */}
        <g>
          {/* 1. Mata Putih Normal (Hilang saat isLove atau isCovering) */}
          <motion.g animate={{ opacity: (isLove || isCovering) ? 0 : 1 }}>
            <circle cx="76" cy="98" r="9" fill="#fff" />
            <circle cx="124" cy="98" r="9" fill="#fff" />
            <motion.circle
              cx={76} cy={98} r="5" fill="#2a1a10"
              animate={{ cx: 76 + pupilOffset }}
              transition={{ type: 'spring', stiffness: 260, damping: 18 }}
            />
            <motion.circle
              cx={124} cy={98} r="5" fill="#2a1a10"
              animate={{ cx: 124 + pupilOffset }}
              transition={{ type: 'spring', stiffness: 260, damping: 18 }}
            />
          </motion.g>

          {/* 2. Mata Love Bouncing (Muncul saat isLove aktif) */}
          <motion.g>
            {/* Love Kiri */}
            <motion.path
              d="M76 96 C76 93.5, 78.5 92, 80 92 C82.5 92, 84 93.5, 84 96 C84 99, 79 102, 76 104 C73 102, 68 99, 68 96 C68 93.5, 69.5 92, 72 92 C73.5 92, 76 93.5, 76 96 Z"
              fill="#ef4444"
              animate={{
                x: pupilOffset,
                y: (isLove && !isCovering) ? [0, -5, 0] : 0,
                opacity: (isLove && !isCovering) ? 1 : 0
              }}
              transition={{
                x: { type: 'spring', stiffness: 260, damping: 18 },
                y: (isLove && !isCovering) ? { repeat: Infinity, duration: 1.2, ease: "easeInOut" } : { type: 'spring' },
                opacity: { duration: 0.15 }
              }}
            />
            {/* Love Kanan */}
            <motion.path
              d="M124 96 C124 93.5, 126.5 92, 128 92 C130.5 92, 132 93.5, 132 96 C132 99, 127 102, 124 104 C121 102, 116 99, 116 96 C116 93.5, 117.5 92, 120 92 C121.5 92, 124 93.5, 124 96 Z"
              fill="#ef4444"
              animate={{
                x: pupilOffset,
                y: (isLove && !isCovering) ? [0, -5, 0] : 0,
                opacity: (isLove && !isCovering) ? 1 : 0
              }}
              transition={{
                x: { type: 'spring', stiffness: 260, damping: 18 },
                y: (isLove && !isCovering) ? { repeat: Infinity, duration: 1.2, ease: "easeInOut", delay: 0.15 } : { type: 'spring' },
                opacity: { duration: 0.15 }
              }}
            />
          </motion.g>
          
          {/* Alis (Naik sedikit saat isLove) */}
          <motion.path 
            d="M66 83 Q76 77 86 83" stroke="#3b2416" strokeWidth="2.5" fill="none" strokeLinecap="round" 
            animate={{ y: isLove ? -3 : 0 }} 
          />
          <motion.path 
            d="M114 83 Q124 77 134 83" stroke="#3b2416" strokeWidth="2.5" fill="none" strokeLinecap="round" 
            animate={{ y: isLove ? -3 : 0 }} 
          />
        </g>

        {/* --- TANGAN KIRI (Mengetik / Menutup Mata) --- */}
        <motion.g
          initial={false}
          animate={{
            x: isCovering ? 0 : -34,
            y: isCovering ? 0 : isTyping ? [58, 52, 58] : 58,
            rotate: isCovering ? 0 : -18
          }}
          transition={{
            x: { type: 'spring', stiffness: 220, damping: 20 },
            y: isCovering 
                 ? { type: 'spring', stiffness: 220, damping: 20 } 
                 : isTyping 
                     ? { repeat: Infinity, duration: 0.35, ease: "easeInOut" } 
                     : { type: 'spring', stiffness: 220, damping: 20 },
            rotate: { type: 'spring', stiffness: 220, damping: 20 }
          }}
          style={{ originX: '76px', originY: '98px' }}
        >
          <ellipse cx="76" cy="98" rx="18" ry="15" fill="#a5713f" stroke="#8a5a34" strokeWidth="1.5" />
          <circle cx="68" cy="94" r="2.6" fill="#6e4527" />
          <circle cx="76" cy="90" r="2.6" fill="#6e4527" />
          <circle cx="84" cy="94" r="2.6" fill="#6e4527" />
        </motion.g>

        {/* --- TANGAN KANAN (Mengetik / Menutup Mata) --- */}
        <motion.g
          initial={false}
          animate={{
            x: isCovering ? 0 : 34,
            y: isCovering ? 0 : isTyping ? [58, 52, 58] : 58,
            rotate: isCovering ? 0 : 18
          }}
          transition={{
            x: { type: 'spring', stiffness: 220, damping: 20 },
            y: isCovering 
                 ? { type: 'spring', stiffness: 220, damping: 20 } 
                 : isTyping 
                     // Delay kanan sedikit agar ketikan tangannya bergantian
                     ? { repeat: Infinity, duration: 0.35, ease: "easeInOut", delay: 0.17 } 
                     : { type: 'spring', stiffness: 220, damping: 20 },
            rotate: { type: 'spring', stiffness: 220, damping: 20 }
          }}
          style={{ originX: '124px', originY: '98px' }}
        >
          <ellipse cx="124" cy="98" rx="18" ry="15" fill="#a5713f" stroke="#8a5a34" strokeWidth="1.5" />
          <circle cx="116" cy="94" r="2.6" fill="#6e4527" />
          <circle cx="124" cy="90" r="2.6" fill="#6e4527" />
          <circle cx="132" cy="94" r="2.6" fill="#6e4527" />
        </motion.g>

        <defs>
          <radialGradient id="shade" cx="35%" cy="30%" r="70%">
            <stop offset="0%" stopColor="#ffffff" />
            <stop offset="100%" stopColor="#000000" />
          </radialGradient>
        </defs>
      </svg>
    </div>
  );
}