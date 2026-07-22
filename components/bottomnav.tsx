"use client";
import React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";

export default function BottomNav() {
  const pathname = usePathname();

  const navItems = [
    { href: "/", label: "Home", icon: "🏠" },
    { href: "/chat", label: "Chat", icon: "💬" },
    { href: "/tema", label: "Tema", icon: "🎨" },
    { href: "/tentang", label: "Tentang", icon: "ℹ️" },
  ];

  return (
    <div className="fixed bottom-0 left-0 right-0 z-50 flex justify-center pointer-events-none">
      <nav className="w-full max-w-2xl bg-slate-900/90 backdrop-blur-xl border-t border-white/10 px-6 py-2.5 flex justify-around items-center shadow-[0_-4px_20px_rgba(0,0,0,0.3)] pointer-events-auto">
        {navItems.map((item) => {
          const isActive = pathname === item.href;
          return (
            <Link
              key={item.href}
              href={item.href}
              className={`flex flex-col items-center justify-center py-1 px-4 rounded-xl transition-all duration-300 ${
                isActive
                  ? "text-blue-400 font-bold scale-105 bg-blue-500/10 shadow-inner"
                  : "text-white/50 hover:text-white hover:bg-white/5"
              }`}
            >
              <span className="text-lg mb-0.5 transition-transform">{item.icon}</span>
              <span className="text-[10px] tracking-wide">{item.label}</span>
            </Link>
          );
        })}
      </nav>
    </div>
  );
}