'use client';
import { motion } from 'framer-motion';

interface IpixProps {
  className?: string;
}

export default function Ipix({ className = '' }: IpixProps) {
  // Data 3 link dinamis dengan urutan baru, menggunakan variabel CSS Global
  const logos = [
    { 
      id: 1, 
      name: 'ipix', 
      url: 'https://ipix.my.id', 
      bg: 'var(--accent)', 
      text: '#ffffff',
      border: '1px solid transparent',
      shadow: 'color-mix(in srgb, var(--accent) 50%, transparent)' 
    },
    { 
      id: 2, 
      name: 'sukachub', 
      url: 'https://sukachub.my.id', 
      bg: 'var(--card-bg)', 
      text: 'var(--foreground-heading)',
      border: '1px solid var(--card-border)',
      shadow: 'color-mix(in srgb, var(--foreground) 10%, transparent)' 
    },
    { 
      id: 3, 
      name: 'ipixfun', 
      url: 'https://ipix.fun', 
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
      {logos.map((logo, index) => (
        <motion.a
          key={logo.id}
          href={logo.url}
          target="_blank"
          rel="noopener noreferrer"
          style={{
            backgroundColor: logo.bg,
            color: logo.text,
            border: logo.border,
            boxShadow: `0 10px 25px -5px ${logo.shadow}`,
          }}
          className="relative flex items-center justify-center px-6 py-3 sm:px-8 sm:py-4 rounded-2xl font-bold text-lg md:text-2xl tracking-wide decoration-transparent overflow-hidden"
          
          // Animasi Masuk (Entrance)
          initial={{ opacity: 0, y: 40, scale: 0.5 }}
          
          // Animasi Melayang Terus-Menerus (Floating)
          animate={{
            opacity: 1,
            scale: 1,
            y: [0, -10, 0], 
          }}
          
          transition={{
            // Transisi Floating yang berulang
            y: {
              duration: 3,
              repeat: Infinity,
              ease: 'easeInOut',
              delay: index * 0.25, // Stagger effect antar logo
            },
            // Transisi Muncul
            opacity: { duration: 0.5, delay: index * 0.15 },
            scale: { type: 'spring', bounce: 0.5, delay: index * 0.15 },
          }}
          
          // Interaksi Hover & Click (Ekspresif)
          whileHover={{
            scale: 1.15,
            rotate: index % 2 === 0 ? 4 : -4, // Miring kanan/kiri berseling
            boxShadow: `0 20px 35px -5px ${logo.shadow}`,
            transition: { duration: 0.2, type: 'spring', bounce: 0.4 }
          }}
          whileTap={{ scale: 0.9, rotate: 0 }}
        >
          {/* Efek kilauan kaca (Glass reflection) */}
          <div className="absolute inset-0 bg-gradient-to-tr from-transparent via-white/20 to-transparent opacity-0 hover:opacity-100 transition-opacity duration-300 pointer-events-none" />
          
          <span className="relative z-10 drop-shadow-sm">
            {logo.name}
          </span>
        </motion.a>
      ))}
    </div>
  );
}