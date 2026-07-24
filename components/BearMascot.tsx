'use client';
import { motion } from 'framer-motion';

interface BearMascotProps {
  /** -1 (kiri) sampai 1 (kanan), posisi pupil mata mengikuti ketikan */
  eyeX?: number;
  /** true kalau field yang aktif adalah PIN/password -> tangan nutup mata */
  isCovering?: boolean;
  /** ukuran render (px), default 140 */
  size?: number;
  className?: string;
}

export default function BearMascot({
  eyeX = 0,
  isCovering = false,
  size = 140,
  className = '',
}: BearMascotProps) {
  const clampedX = Math.max(-1, Math.min(1, eyeX));
  const pupilOffset = clampedX * 3.2; // pergeseran pupil dalam px (di viewBox 200x200)

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

        {/* --- HIDUNG --- */}
        <ellipse cx="100" cy="116" rx="11" ry="8" fill="#3b2416" />
        <path
          d="M100 122 L100 132 M100 132 Q92 140 84 134 M100 132 Q108 140 116 134"
          stroke="#3b2416"
          strokeWidth="2.5"
          strokeLinecap="round"
          fill="none"
        />

        {/* --- MATA (base, selalu ada) --- */}
        <g>
          <circle cx="76" cy="98" r="9" fill="#fff" />
          <circle cx="124" cy="98" r="9" fill="#fff" />
          <motion.circle
            cx={76}
            cy={98}
            r="5"
            fill="#2a1a10"
            animate={{ cx: 76 + pupilOffset, opacity: isCovering ? 0 : 1 }}
            transition={{ type: 'spring', stiffness: 260, damping: 18 }}
          />
          <motion.circle
            cx={124}
            cy={98}
            r="5"
            fill="#2a1a10"
            animate={{ cx: 124 + pupilOffset, opacity: isCovering ? 0 : 1 }}
            transition={{ type: 'spring', stiffness: 260, damping: 18 }}
          />
          {/* alis lucu */}
          <path d="M66 84 Q76 78 86 84" stroke="#3b2416" strokeWidth="2" fill="none" strokeLinecap="round" />
          <path d="M114 84 Q124 78 134 84" stroke="#3b2416" strokeWidth="2" fill="none" strokeLinecap="round" />
        </g>

        {/* --- TANGAN KIRI (nutup mata kiri) --- */}
        <motion.g
          initial={false}
          animate={
            isCovering
              ? { x: 0, y: 0, rotate: 0 }
              : { x: -34, y: 58, rotate: -18 }
          }
          transition={{ type: 'spring', stiffness: 220, damping: 20 }}
          style={{ originX: '76px', originY: '98px' }}
        >
          <ellipse cx="76" cy="98" rx="18" ry="15" fill="#a5713f" stroke="#8a5a34" strokeWidth="1.5" />
          <circle cx="68" cy="94" r="2.6" fill="#6e4527" />
          <circle cx="76" cy="90" r="2.6" fill="#6e4527" />
          <circle cx="84" cy="94" r="2.6" fill="#6e4527" />
        </motion.g>

        {/* --- TANGAN KANAN (nutup mata kanan) --- */}
        <motion.g
          initial={false}
          animate={
            isCovering
              ? { x: 0, y: 0, rotate: 0 }
              : { x: 34, y: 58, rotate: 18 }
          }
          transition={{ type: 'spring', stiffness: 220, damping: 20, delay: 0.03 }}
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