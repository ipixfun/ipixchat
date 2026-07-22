"use client";
import React from "react";
import Link from "next/link";
import BottomNav from "@/components/bottomnav";

export default function HomePage() {
  return (
    <div className="w-full max-w-2xl mx-auto h-dvh flex flex-col pb-[70px]">
      
      {/* Header */}
      <header 
        className="sticky top-0 z-20 p-4 backdrop-blur-md border-b"
        style={{ 
          backgroundColor: "color-mix(in srgb, var(--background) 80%, transparent)",
          borderColor: "var(--card-border)"
        }}
      >
        <h1 className="text-xl font-bold" style={{ color: "var(--foreground-heading)" }}>
          💬 ipixchat
        </h1>
        <p className="text-xs mt-1" style={{ color: "var(--foreground)" }}>
          Selamat datang kembali!
        </p>
      </header>

      {/* Content */}
      <div className="flex-1 p-5 overflow-y-auto space-y-4">
        
        {/* Sambutan */}
        <div 
          className="p-5 rounded-2xl"
          style={{ 
            backgroundColor: "var(--card-bg)", 
            border: "1px solid var(--card-border)" 
          }}
        >
          <h2 className="text-lg font-bold mb-2" style={{ color: "var(--foreground-heading)" }}>
            👋 Halo, Pengguna!
          </h2>
          <p className="text-sm" style={{ color: "var(--foreground)" }}>
            Anda memiliki <strong>3 pesan baru</strong> yang belum dibaca.
          </p>
        </div>

        {/* Quick Actions */}
        <div className="grid grid-cols-2 gap-3">
          <Link
            href="/chat"
            className="p-4 rounded-2xl text-center transition-all hover:scale-[1.02] active:scale-[0.98]"
            style={{ 
              backgroundColor: "var(--accent)",
              boxShadow: `0 0 20px var(--accent-glow)`
            }}
          >
            <span className="text-2xl">💬</span>
            <p className="text-sm font-bold text-white mt-2">Mulai Chat</p>
          </Link>
          
          <Link
            href="/tema"
            className="p-4 rounded-2xl text-center transition-all hover:scale-[1.02] active:scale-[0.98]"
            style={{ 
              backgroundColor: "var(--card-bg)",
              border: "1px solid var(--card-border)"
            }}
          >
            <span className="text-2xl">🎨</span>
            <p className="text-sm font-bold mt-2" style={{ color: "var(--foreground-heading)" }}>
              Ubah Tema
            </p>
          </Link>
        </div>

        {/* Riwayat Chat */}
        <h3 className="font-bold text-sm mt-6" style={{ color: "var(--foreground-heading)" }}>
          📋 Riwayat Chat
        </h3>

        {["Budi", "Ani", "Dina"].map((name, i) => (
          <Link
            key={i}
            href="/chat"
            className="flex items-center gap-3 p-3 rounded-xl transition-all hover:scale-[1.01]"
            style={{ 
              backgroundColor: "var(--card-bg)",
              border: "1px solid var(--card-border)"
            }}
          >
            <div 
              className="w-10 h-10 rounded-full flex items-center justify-center text-lg font-bold text-white"
              style={{ backgroundColor: "var(--accent)" }}
            >
              {name[0]}
            </div>
            <div className="flex-1">
              <p className="font-bold text-sm" style={{ color: "var(--foreground-heading)" }}>
                {name}
              </p>
              <p className="text-xs truncate" style={{ color: "var(--foreground)" }}>
                Pesan terakhir dari {name}...
              </p>
            </div>
            <span className="text-xs" style={{ color: "var(--accent)" }}>
              {i + 1} baru
            </span>
          </Link>
        ))}
      </div>

      <BottomNav />
    </div>
  );
}