"use client";
import React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";

export default function BottomNav() {
  const pathname = usePathname();

  const links = [
    { href: "/", label: "Home", icon: "🏠" },
    { href: "/chat", label: "Chat", icon: "💬" },
    { href: "/tema", label: "Tema", icon: "🎨" },
    { href: "/tentang", label: "Tentang", icon: "ℹ️" },
  ];

  return (
    <nav
      className="fixed bottom-0 left-0 right-0 z-50 border-t backdrop-blur-md"
      style={{
        backgroundColor: "color-mix(in srgb, var(--background) 85%, transparent)",
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
              className="flex flex-col items-center gap-0.5 px-4 py-2 rounded-xl transition-all"
              style={{
                color: isActive ? "var(--accent)" : "var(--foreground)",
              }}
            >
              <span className={`text-xl transition-transform ${isActive ? "scale-110" : ""}`}>
                {link.icon}
              </span>
              <span className="text-[10px] font-bold">{link.label}</span>
              {isActive && (
                <div
                  className="w-1 h-1 rounded-full mt-0.5"
                  style={{ backgroundColor: "var(--accent)" }}
                />
              )}
            </Link>
          );
        })}
      </div>
    </nav>
  );
}