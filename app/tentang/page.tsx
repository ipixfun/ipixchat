"use client";
import React from "react";
import BottomNav from "../../components/bottomnav"; // Sesuaikan path

export default function TentangPage() {
  return (
    <div 
      className="w-full max-w-2xl mx-auto h-dvh flex flex-col pb-[70px] transition-colors duration-300"
      style={{ backgroundColor: "var(--background)", color: "var(--foreground)" }}
    >
      
      {/* Header */}
      <div 
        className="sticky top-0 z-20 p-4 backdrop-blur-md border-b transition-colors duration-300"
        style={{ 
          backgroundColor: "color-mix(in srgb, var(--background) 85%, transparent)",
          borderColor: "var(--card-border)"
        }}
      >
        <h1 className="text-xl font-bold" style={{ color: "var(--accent)" }}>
          ℹ️ Tentang iPix
        </h1>
      </div>

      {/* Content */}
      <div className="flex-1 p-5 overflow-y-auto">
        
        {/* Logo / Banner */}
        <div 
          className="w-full py-8 flex flex-col items-center justify-center rounded-3xl border mb-6 shadow-inner transition-colors duration-300"
          style={{ 
            backgroundColor: "var(--card-bg)",
            borderColor: "var(--card-border)",
            boxShadow: "0 0 20px var(--accent-glow)"
          }}
        >
          <div className="text-5xl mb-2 drop-shadow-lg">✨</div>
          <h2 className="text-2xl font-black tracking-widest" style={{ color: "var(--foreground-heading)" }}>
            iPIX CHAT
          </h2>
          <span 
            className="text-xs px-3 py-1 rounded-full mt-2 border transition-colors"
            style={{ 
              backgroundColor: "color-mix(in srgb, var(--background) 50%, transparent)",
              borderColor: "var(--card-border)",
              color: "var(--foreground)"
            }}
          >
            Versi 1.0.0
          </span>
        </div>

        {/* Deskripsi */}
        <div 
          className="p-5 rounded-2xl border text-sm leading-relaxed space-y-4 transition-colors duration-300"
          style={{ 
            backgroundColor: "var(--card-bg)",
            borderColor: "var(--card-border)",
            color: "var(--foreground)"
          }}
        >
          <p>
            <strong style={{ color: "var(--foreground-heading)" }}>iPix Chat</strong> adalah platform komunikasi real-time modern yang dirancang untuk memberikan pengalaman bertukar pesan secara instan, aman, dan fleksibel.
          </p>
          
          <p>
            Mendukung berbagai fitur canggih seperti obrolan publik dan pribadi (langsung dengan admin), notifikasi badge real-time, sensor kata otomatis, hingga pengiriman file media.
          </p>

          {/* Teknologi */}
          <div className="pt-4 border-t mt-4" style={{ borderColor: "var(--card-border)" }}>
            <h3 className="font-bold mb-2" style={{ color: "var(--foreground-heading)" }}>
              Teknologi yang digunakan:
            </h3>
            <div className="flex gap-2 flex-wrap text-xs">
              <span 
                className="px-2.5 py-1 rounded-md border font-medium transition-colors"
                style={{ 
                  backgroundColor: "var(--card-bg)",
                  borderColor: "var(--card-border)",
                  color: "var(--accent)"
                }}
              >
                Next.js App Router
              </span>
              <span 
                className="px-2.5 py-1 rounded-md border font-medium transition-colors"
                style={{ 
                  backgroundColor: "var(--card-bg)",
                  borderColor: "var(--card-border)",
                  color: "var(--accent)"
                }}
              >
                Supabase
              </span>
              <span 
                className="px-2.5 py-1 rounded-md border font-medium transition-colors"
                style={{ 
                  backgroundColor: "var(--card-bg)",
                  borderColor: "var(--card-border)",
                  color: "var(--accent)"
                }}
              >
                Tailwind CSS
              </span>
            </div>
          </div>
        </div>

        {/* Footer Copyright */}
        <div 
          className="text-center text-[10px] mt-8 mb-4 opacity-60"
          style={{ color: "var(--foreground)" }}
        >
          © 2026 iPix.my.id - All Rights Reserved.
        </div>

      </div>

      <BottomNav />
    </div>
  );
}