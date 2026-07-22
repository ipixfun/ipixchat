"use client";
import React from "react";
import { Varela_Round } from "next/font/google";

// Preload font Varela Round langsung lewat Next.js (Mencegah FOUT & glitch)
const varelaRound = Varela_Round({
  weight: "400",
  subsets: ["latin"],
  display: "block", // 'block' memastikan teks tidak berubah mendadak saat dimuat
});

export default function Loading() {
  return (
    <div 
      className="h-screen w-full flex flex-col items-center justify-center select-none overflow-hidden relative transition-colors duration-500"
      style={{ 
        background: "linear-gradient(135deg, var(--background-gradient-start) 0%, var(--background-gradient-end) 100%)" 
      }}
    >
      {/* Main Content */}
      <div className="relative z-20 flex flex-col items-center justify-center">
        
        {/* Teks iPiX dengan font permanen */}
        <h1 className={`${varelaRound.className} relative text-7xl md:text-9xl font-black tracking-widest flex items-center justify-center`}>
          <span className="letter neon-accent">i</span>
          <span className="letter neon-heading">P</span>
          <span className="letter neon-accent">i</span>
          <span className="letter neon-heading animate-X">X</span>
        </h1>
      </div>

      <style dangerouslySetInnerHTML={{
        __html: `
        .letter { 
          color: var(--background); 
          line-height: 1; 
          display: inline-block;
          transition: color 0.3s ease, filter 0.3s ease;
        }

        /* Neon Warna Aksen Tema (Huruf 'i') */
        .neon-accent {
          -webkit-text-stroke: 2px var(--accent);
          filter: drop-shadow(0 0 12px var(--accent-glow));
        }

        /* Neon Warna Heading Tema (Huruf 'P' & 'X') */
        .neon-heading {
          -webkit-text-stroke: 2px var(--foreground-heading);
          filter: drop-shadow(0 0 12px var(--accent-glow));
        }

        /* ANIMASI X: PUTAR 1 DETIK + DIAM 0.2 DETIK */
        .animate-X {
          display: inline-flex;
          align-items: center;
          justify-content: center;
          width: 1em;
          height: 1em;
          transform-origin: center center;
          will-change: transform;
          animation: spinAndPause 1.2s cubic-bezier(0.4, 0, 0.2, 1) infinite;
        }

        @keyframes spinAndPause {
          0% {
            transform: rotate(0deg);
          }
          83.33% {
            transform: rotate(1080deg);
          }
          100% {
            transform: rotate(1080deg);
          }
        }
        `
      }} />
    </div>
  );
}