'use client';

import { motion } from 'framer-motion';
import { useRef, useState } from 'react';

interface PixVideoPlayerProps {
  className?: string;
  src?: string;
  title?: string;
  autoPlay?: boolean;
  loop?: boolean;
}

export default function PixVideoPlayer({
  className = '',
  src = 'https://res.cloudinary.com/bjamo8ld/video/upload/v1785508218/ipixchat_dryqj3.mp4',
  title = 'ipix Video Player',
  autoPlay = false,
  loop = true,
}: PixVideoPlayerProps) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [isPlaying, setIsPlaying] = useState(autoPlay);

  const togglePlay = () => {
    if (videoRef.current) {
      if (isPlaying) {
        videoRef.current.pause();
      } else {
        videoRef.current.play();
      }
      setIsPlaying(!isPlaying);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 30, scale: 0.95 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      transition={{ duration: 0.5, ease: 'easeOut' }}
      whileHover={{
        scale: 1.01,
        boxShadow: '0 25px 50px -12px color-mix(in srgb, var(--accent) 35%, transparent)',
      }}
      style={{
        backgroundColor: 'var(--card-bg)',
        border: '1px solid color-mix(in srgb, var(--accent) 30%, var(--card-border, transparent))',
        boxShadow: '0 15px 35px -10px color-mix(in srgb, var(--accent) 25%, transparent)',
      }}
      className={`relative w-full max-w-4xl mx-auto rounded-3xl overflow-hidden p-2 sm:p-3 transition-all ${className}`}
    >
      <div className="relative aspect-video w-full rounded-2xl overflow-hidden bg-black/40 group">
        <video
          ref={videoRef}
          src={src}
          controls
          autoPlay={autoPlay}
          loop={loop}
          playsInline
          onPlay={() => setIsPlaying(true)}
          onPause={() => setIsPlaying(false)}
          className="w-full h-full object-cover rounded-2xl"
        />
        <div className="absolute inset-0 bg-gradient-to-tr from-transparent via-white/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none rounded-2xl" />
      </div>

      <div className="flex items-center justify-between px-4 py-3">
        <div className="flex items-center gap-2">
          <span 
            className="w-3 h-3 rounded-full animate-pulse"
            style={{ backgroundColor: 'var(--accent)' }}
          />
          <h3 
            className="font-bold text-base sm:text-lg tracking-wide"
            style={{ color: 'var(--foreground-heading)' }}
          >
            {title}
          </h3>
        </div>

        <button
          onClick={togglePlay}
          className="px-4 py-1.5 rounded-xl font-medium text-xs sm:text-sm transition-transform active:scale-95"
          style={{
            backgroundColor: 'color-mix(in srgb, var(--accent) 20%, var(--background))',
            color: 'var(--foreground-heading)',
            border: '1px solid color-mix(in srgb, var(--accent) 30%, transparent)',
          }}
        >
          {isPlaying ? 'Pause' : 'Play'}
        </button>
      </div>
    </motion.div>
  );
}