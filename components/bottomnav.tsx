"use client";
import React, { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";

interface BottomNavProps {
  isAuth?: boolean;
  handleLogout?: () => void;
}

export default function BottomNav({ isAuth, handleLogout }: BottomNavProps) {
  const pathname = usePathname();
  const [isKeyboardOpen, setIsKeyboardOpen] = useState(false);

  useEffect(() => {
    // Sembunyikan BottomNav secara instan ketika elemen input / textarea di-focus (HP)
    const handleFocusIn = (e: FocusEvent) => {
      const target = e.target as HTMLElement;
      if (
        target &&
        (target.tagName === "INPUT" || target.tagName === "TEXTAREA")
      ) {
        setIsKeyboardOpen(true);
      }
    };

    const handleFocusOut = (e: FocusEvent) => {
      const target = e.target as HTMLElement;
      if (
        target &&
        (target.tagName === "INPUT" || target.tagName === "TEXTAREA")
      ) {
        setIsKeyboardOpen(false);
      }
    };

    // Deteksi resize viewport (Keyboard HP Android/Capacitor)
    const handleResize = () => {
      if (window.visualViewport) {
        const isKeyboard = window.innerHeight - window.visualViewport.height > 150;
        setIsKeyboardOpen(isKeyboard);
      }
    };

    document.addEventListener("focusin", handleFocusIn);
    document.addEventListener("focusout", handleFocusOut);
    if (window.visualViewport) {
      window.visualViewport.addEventListener("resize", handleResize);
    }

    return () => {
      document.removeEventListener("focusin", handleFocusIn);
      document.removeEventListener("focusout", handleFocusOut);
      if (window.visualViewport) {
        window.visualViewport.removeEventListener("resize", handleResize);
      }
    };
  }, []);

  // Jika sedang ngetik / keyboard naik di HP, BottomNav tidak dirender
  if (isKeyboardOpen) return null;

  const links = [
    {
      href: "/",
      label: "Home",
      icon: (
        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2.2} stroke="currentColor" className="w-5 h-5 sm:w-5.5 sm:h-5.5">
          <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 12l8.954-8.955c.44-.439 1.152-.439 1.591 0L21.75 12M4.5 9.75v10.125c0 .621.504 1.125 1.125 1.125H9.75v-4.875c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125V21h4.125c.621 0 1.125-.504 1.125-1.125V9.75M8.25 21h8.25" />
        </svg>
      ),
    },
    {
      href: "/chat",
      label: "Chat",
      icon: (
        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2.2} stroke="currentColor" className="w-5 h-5 sm:w-5.5 sm:h-5.5">
          <path strokeLinecap="round" strokeLinejoin="round" d="M8.625 12a.375.375 0 11-.75 0 .375.375 0 01.75 0zm0 0H8.25m4.125 0a.375.375 0 11-.75 0 .375.375 0 01.75 0zm0 0h-.375m4.125 0a.375.375 0 11-.75 0 .375.375 0 01.75 0zm0 0h-.375M21 12c0 4.556-4.03 8.25-9 8.25a9.764 9.764 0 01-2.555-.337A5.972 5.972 0 015.41 20.97a.75.75 0 01-.81-.548a.75.75 0 01.12-.652a5.58 5.58 0 001.002-2.183A8.204 8.204 0 013 12c0-4.556 4.03-8.25 9-8.25s9 3.694 9 8.25z" />
        </svg>
      ),
    },
    {
      href: "/tema",
      label: "Tema",
      icon: (
        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2.2} stroke="currentColor" className="w-5 h-5 sm:w-5.5 sm:h-5.5">
          <path strokeLinecap="round" strokeLinejoin="round" d="M9.813 15.904L9 18.75l-.813-2.846a4.5 4.5 0 00-3.09-3.09L2.25 12l2.846-.813a4.5 4.5 0 003.09-3.09L9 5.25l.813 2.846a4.5 4.5 0 003.09 3.09L15.75 12l-2.846.813a4.5 4.5 0 00-3.09 3.09zM18.259 8.715L18 9.75l-.259-1.035a3.375 3.375 0 00-2.455-2.456L14.25 6l1.036-.259a3.375 3.375 0 002.455-2.456L18 2.25l.259 1.035a3.375 3.375 0 002.456 2.456L21.75 6l-1.035.259a3.375 3.375 0 00-2.456 2.456zM16.894 20.567L16.5 21.75l-.394-1.183a2.25 2.25 0 00-1.423-1.423L13.5 18.75l1.183-.394a2.25 2.25 0 001.423-1.423l.394-1.183.394 1.183a2.25 2.25 0 001.423 1.423l1.183.394-1.183.394a2.25 2.25 0 00-1.423 1.423z" />
        </svg>
      ),
    },
    {
      href: "/mp3",
      label: "MP3",
      icon: (
        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2.2} stroke="currentColor" className="w-5 h-5 sm:w-5.5 sm:h-5.5">
          <path strokeLinecap="round" strokeLinejoin="round" d="M9 9l10.5-3m0 0v12m0-12L9 9m10.5 9a2.25 2.25 0 11-4.5 0 2.25 2.25 0 014.5 0zm-10.5 3a2.25 2.25 0 11-4.5 0 2.25 2.25 0 014.5 0z" />
        </svg>
      ),
    },
    {
      href: "/tentang",
      label: "iPiX",
      isImage: true,
      imageSrc: "/icon.png",
    },
  ];

  return (
    <nav
      className="fixed bottom-0 left-0 right-0 z-[100000] border-t backdrop-blur-2xl transition-colors duration-300 pb-[env(safe-area-inset-bottom)] pointer-events-auto"
      style={{
        backgroundColor: "color-mix(in srgb, var(--background) 85%, transparent)",
        borderColor: "color-mix(in srgb, var(--accent) 20%, var(--card-border, transparent))",
      }}
    >
      <div className="max-w-2xl mx-auto h-14 sm:h-[62px] flex items-center px-1 sm:px-1.5 relative z-[100001]">
        <div className="w-full grid grid-cols-5 relative z-[100002]">
          {links.map((link) => {
            const isActive = pathname === link.href;

            return (
              <Link
                key={link.href}
                href={link.href}
                onClick={(e) => {
                  e.stopPropagation();
                }}
                className="flex flex-col items-center justify-center h-12 sm:h-[50px] rounded-xl transition-all duration-200 select-none active:scale-95 touch-manipulation group min-w-0 cursor-pointer pointer-events-auto relative z-[100003]"
              >
                <div
                  className={`transition-all duration-300 flex items-center justify-center shrink-0 pointer-events-none ${
                    isActive
                      ? "scale-125 -translate-y-0.5"
                      : "opacity-50 group-hover:opacity-80 scale-100"
                  }`}
                  style={{
                    color: isActive ? "var(--accent)" : "var(--foreground)",
                    filter: isActive ? "drop-shadow(0 0 8px color-mix(in srgb, var(--accent) 60%, transparent))" : "none",
                  }}
                >
                  {link.isImage ? (
                    <img
                      src={link.imageSrc}
                      alt={link.label}
                      className={`w-5 h-5 sm:w-5.5 sm:h-5.5 object-cover rounded-md transition-all duration-300 ${
                        isActive ? "brightness-110" : "grayscale opacity-70"
                      }`}
                    />
                  ) : (
                    link.icon
                  )}
                </div>

                <span
                  className={`text-[9px] sm:text-[10px] font-bold tracking-wide transition-all duration-300 mt-0.5 truncate max-w-full px-1 pointer-events-none ${
                    isActive ? "opacity-100" : "opacity-50 group-hover:opacity-80"
                  }`}
                  style={{
                    color: isActive ? "var(--accent)" : "var(--foreground)",
                  }}
                >
                  {link.label}
                </span>
              </Link>
            );
          })}
        </div>
      </div>
    </nav>
  );
}