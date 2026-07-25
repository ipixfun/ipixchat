'use client';
import { motion } from 'framer-motion';

export interface SiteInfo {
  id: number;
  name: string;
  url: string;
  desc: string;
  bg: string;
  text: string;
  border: string;
  shadow: string;
}

interface IpixProps {
  className?: string;
  onSelect?: (site: SiteInfo) => void;
  selectedId?: number | null;
}

export default function Ipix({ className = '', onSelect, selectedId }: IpixProps) {
  // Data 3 link beserta deskripsinya
  const logos: SiteInfo[] = [
    { 
      id: 1, 
      name: 'ipix', 
      url: 'https://ipix.my.id', 
      desc: 'Portal utama ekosistem ipix. Temukan layanan menarik, informasi terbaru, dan semua hal tentang kami di sini!',
      bg: 'var(--accent)', 
      text: '#ffffff',
      border: '1px solid transparent',
      shadow: 'color-mix(in srgb, var(--accent) 50%, transparent)' 
    },
    { 
      id: 2, 
      name: 'sukachub', 
      url: 'https://sukachub.my.id', 
      desc: 'Komunitas hangat buat kamu yang suka hal-hal unik. Jelajahi galeri dan forum diskusi seru di sukachub!',
      bg: 'var(--card-bg)', 
      text: 'var(--foreground-heading)',
      border: '1px solid var(--card-border)',
      shadow: 'color-mix(in srgb, var(--foreground) 10%, transparent)' 
    },
    { 
      id: 3, 
      name: 'ipixfun', 
      url: 'https://ipix.fun', 
      desc: 'Platform hiburan paling asik! Mainkan game seru, ikuti kuis, dan nikmati waktu santaimu di ipixfun.',
      bg: 'color-mix(in srgb, var(--accent) 15%, var(--background))', 
      text: 'var(--foreground-heading)',
      border: '1px solid color-mix(in srgb, var(--accent) 30%, transparent)',
      shadow: 'color-mix(in srgb, var(--accent) 20%, transparent)' 
    },
  ];

  return (
    <div 
      className={`flex flex-wrap justify-center items-center gap-4 sm:gap-6 min-h-[160px] ${className}`}
    >
      {logos.map((logo, index) => {
        const isSelected = selectedId === logo.id;
        const isDimmed = selectedId !== null && !isSelected;

        return (
          <motion.button
            key={logo.id}
            onClick={() => onSelect && onSelect(logo)}
            style={{
              backgroundColor: logo.bg,
              color: logo.text,
              border: logo.border,
              boxShadow: isSelected ? `0 15px 30px -5px ${logo.shadow}` : `0 10px 25px -5px ${logo.shadow}`,
            }}
            className="relative flex items-center justify-center px-6 py-3 sm:px-8 sm:py-4 rounded-2xl font-bold text-lg md:text-2xl tracking-wide decoration-transparent overflow-hidden outline-none"
            
            // Animasi Masuk
            initial={{ opacity: 0, y: 40, scale: 0.5 }}
            
            // Animasi Melayang (berhenti jika item lain dipilih)
            animate={{
              opacity: isDimmed ? 0.5 : 1, // Redupkan yang tidak dipilih
              scale: isSelected ? 1.1 : 1, // Besarkan yang dipilih
              y: isSelected ? -5 : (isDimmed ? 0 : [0, -10, 0]), 
            }}
            
            transition={{
              y: { duration: 3, repeat: Infinity, ease: 'easeInOut', delay: index * 0.25 },
              opacity: { duration: 0.3 },
              scale: { type: 'spring', bounce: 0.5 }
            }}
            
            // Interaksi Hover
            whileHover={{
              scale: 1.15,
              rotate: index % 2 === 0 ? 4 : -4,
              boxShadow: `0 20px 35px -5px ${logo.shadow}`,
            }}
            whileTap={{ scale: 0.95, rotate: 0 }}
          >
            {/* Efek kilauan kaca */}
            <div className="absolute inset-0 bg-gradient-to-tr from-transparent via-white/20 to-transparent opacity-0 hover:opacity-100 transition-opacity duration-300 pointer-events-none" />
            
            <span className="relative z-10 drop-shadow-sm">
              {logo.name}
            </span>
          </motion.button>
        )
      })}
    </div>
  );
}