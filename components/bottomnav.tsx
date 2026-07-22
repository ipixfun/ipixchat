"use client";
import React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";

export default function BottomNav() {
  const pathname = usePathname();

  const links = [
    {
      href: "/",
      label: "Home",
      icon: (
        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2.2} stroke="currentColor" className="w-5 h-5">
          <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 12l8.954-8.955c.44-.439 1.152-.439 1.591 0L21.75 12M4.5 9.75v10.125c0 .621.504 1.125 1.125 1.125H9.75v-4.875c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125V21h4.125c.621 0 1.125-.504 1.125-1.125V9.75M8.25 21h8.25" />
        </svg>
      ),
    },
    {
      href: "/chat",
      label: "Chat",
      icon: (
        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2.2} stroke="currentColor" className="w-5 h-5">
          <path strokeLinecap="round" strokeLinejoin="round" d="M8.625 12a.375.375 0 11-.75 0 .375.375 0 01.75 0zm0 0H8.25m4.125 0a.375.375 0 11-.75 0 .375.375 0 01.75 0zm0 0h-.375m4.125 0a.375.375 0 11-.75 0 .375.375 0 01.75 0zm0 0h-.375M21 12c0 4.556-4.03 8.25-9 8.25a9.764 9.764 0 01-2.555-.337A5.972 5.972 0 015.41 20.97a.75.75 0 01-.81-.548a.75.75 0 01.12-.652a5.58 5.58 0 001.002-2.183A8.204 8.204 0 013 12c0-4.556 4.03-8.25 9-8.25s9 3.694 9 8.25z" />
        </svg>
      ),
    },
    {
      href: "/tema",
      label: "Tema",
      icon: (
        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2.2} stroke="currentColor" className="w-5 h-5">
          <path strokeLinecap="round" strokeLinejoin="round" d="M4.098 19.902a3.75 3.75 0 005.304 0l6.401-6.402M6.75 21A3.75 3.75 0 003 17.25c0-.528.105-1.03.298-1.488a3.75 3.75 0 013.452 5.238M19.5 4.5l.375-.375a1.875 1.875 0 112.652 2.652l-.375.375M19.5 4.5l-6.402 6.402m6.402-6.402l-1.582 1.582M13.098 10.902l-6.402 6.402m0 0l-1.582 1.582" />
        </svg>
      ),
    },
    {
      href: "/tentang",
      label: "Tentang",
      icon: (
        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2.2} stroke="currentColor" className="w-5 h-5">
          <path strokeLinecap="round" strokeLinejoin="round" d="M11.25 11.25l.041-.02a.75.75 0 011.063.852l-.708 2.836a.75.75 0 001.063.853l.041-.021M21 12a9 9 0 11-18 0 9 9 0 0118 0zm-9-3.75h.008v.008H12V8.25z" />
        </svg>
      ),
    },
  ];

  return (
    <nav
      className="fixed bottom-0 left-0 right-0 z-50 border-t backdrop-blur-xl transition-colors duration-300"
      style={{
        // Warna Paling Gelap dari variabel tema saat ini
        backgroundColor: "var(--background-gradient-end)",
        borderColor: "var(--card-border)",
      }}
    >
      <div className="max-w-2xl mx-auto flex items-center justify-around h-[65px]">
        {links.map((link) => {
          const isActive = pathname === link.href;

          return (
            <Link
              key={link.href}
              href={link.href}
              className="flex flex-col items-center gap-1 px-4 py-1.5 rounded-xl transition-all duration-300 select-none group"
              style={{
                // Menu Aktif mengambil Warna Paling Cerah (var(--foreground-heading))
                color: isActive ? "var(--foreground-heading)" : "var(--foreground)",
              }}
            >
              <div
                className={`transition-all duration-300 ${
                  isActive
                    ? "scale-110 drop-shadow-[0_0_10px_var(--foreground-heading)]"
                    : "opacity-40 group-hover:opacity-80"
                }`}
              >
                {link.icon}
              </div>

              <span
                className={`text-[10px] font-bold transition-all duration-300 ${
                  isActive ? "opacity-100" : "opacity-40 group-hover:opacity-80"
                }`}
              >
                {link.label}
              </span>

              {/* Indikator Titik Aktif Paling Cerah */}
              {isActive && (
                <div
                  className="w-1.5 h-1.5 rounded-full animate-pulse"
                  style={{
                    backgroundColor: "var(--foreground-heading)",
                    boxShadow: "0 0 8px var(--foreground-heading)",
                  }}
                />
              )}
            </Link>
          );
        })}
      </div>
    </nav>
  );
}