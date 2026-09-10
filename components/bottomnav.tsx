"use client";
import React, { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";

interface BottomNavProps {
  isAuth?: boolean;
  handleLogout?: () => void;
  unreadChatCount?: number;
}

export default function BottomNav({ isAuth, handleLogout, unreadChatCount = 4 }: BottomNavProps) {
  const pathname = usePathname();
  const isHome = pathname === "/";
  const [currentSlideIndex, setCurrentSlideIndex] = useState(0);

  // Sync event pergeseran slide
  useEffect(() => {
    if (!isHome) return;

    const handleCustomSlide = (e: Event) => {
      const customEvent = e as CustomEvent<{ index: number }>;
      if (typeof customEvent.detail?.index === "number") {
        setCurrentSlideIndex(customEvent.detail.index);
      }
    };

    window.addEventListener("hero_slide_change", handleCustomSlide);
    return () => window.removeEventListener("hero_slide_change", handleCustomSlide);
  }, [isHome]);

  const links = [
    {
      href: "/",
      label: "Home",
      color: "#382bf0",
      badge: 0,
      icon: (
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-6 h-6">
          <path d="M11.47 3.841a.75.75 0 0 1 1.06 0l8.69 8.69a.75.75 0 1 1-1.06 1.061l-.69-.691V19.5a2.25 2.25 0 0 1-2.25 2.25h-3a.75.75 0 0 1-.75-.75V15a.75.75 0 0 0-.75-.75h-1.5A.75.75 0 0 0 10.5 15v5.25a.75.75 0 0 1-.75.75h-3A2.25 2.25 0 0 1 4.5 19.5v-6.59l-.69.69a.75.75 0 0 1-1.06-1.061l8.72-8.698Z" />
        </svg>
      ),
    },
    {
      href: "/chat",
      label: "Chats",
      color: "#2AABEE",
      badge: unreadChatCount,
      icon: (
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-6 h-6">
          <path d="M4.913 2.658c2.075-.27 4.19-.408 6.337-.408 2.147 0 4.262.139 6.337.408 1.922.25 3.291 1.861 3.405 3.727a4.403 4.403 0 0 1-1.032 3.03l-1.39 1.528 1.258 3.522a.75.75 0 0 1-1.011.932l-3.957-1.76a21.722 21.722 0 0 1-3.61.298c-2.147 0-4.262-.139-6.337-.408C3.02 14.28 1.65 12.668 1.536 10.803a20.088 20.088 0 0 1 0-4.418c.114-1.865 1.484-3.477 3.377-3.727Z" />
        </svg>
      ),
    },
    {
      href: "/tema",
      label: "Tema",
      color: "#0088CC",
      badge: 0,
      icon: (
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-6 h-6">
          <path fillRule="evenodd" d="M12 2.25c-5.385 0-9.75 4.365-9.75 9.75s4.365 9.75 9.75 9.75 9.75-4.365 9.75-9.75S17.385 2.25 12 2.25ZM12.75 6a.75.75 0 0 0-1.5 0v6c0 .414.336.75.75.75h4.5a.75.75 0 0 0 0-1.5h-3.75V6Z" clipRule="evenodd" />
        </svg>
      ),
    },
    {
      href: "/mp3",
      label: "Settings",
      color: "#2AABEE",
      badge: 0,
      icon: (
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-6 h-6">
          <path fillRule="evenodd" d="M11.078 2.25c-.917 0-1.699.663-1.85 1.567L9.05 4.889c-.02.12-.115.215-.235.235l-1.072.179c-.12.02-.239-.03-.306-.131l-.623-.935c-.509-.763-1.537-.996-2.321-.525l-.754.453c-.785.471-1.053 1.483-.604 2.285l.523.935c.063.113.045.253-.042.348l-.758.826c-.088.095-.224.131-.345.09L1.44 8.52c-.9-.301-1.858.214-2.16 1.114l-.28.841c-.301.9 0 1.872.9 2.172l1.078.36c.121.04.202.152.202.28v1.087c0 .128-.081.24-.202.28l-1.078.36c-.9.301-1.201 1.272-.9 2.172l.28.841c.302.9 1.26 1.415 2.16 1.114l1.072-.358c.121-.04.257-.005.345.09l.758.826c.087.095.105.235.042.348l-.523.935c-.449.802-.181 1.814.604 2.285l.754.453c.784.471 1.812.238 2.321-.525l.623-.935c.067-.101.186-.151.306-.131l1.072.179c.12.02.215.115.235.235l.178 1.072c.151.904.933 1.567 1.85 1.567h.904c.917 0 1.699-.663 1.85-1.567l.178-1.072c.02-.12.115-.215.235-.235l1.072-.179c.12-.02.239.03.306.131l.623.935c.509.763 1.537.996 2.321.525l.754-.453c.785-.471 1.053-1.483.604-2.285l-.523-.935c-.063-.113-.045-.253.042-.348l.758-.826c.088-.095.224-.131.345-.09l1.072.358c.9.301 1.858-.214 2.16-1.114l.28-.841c.301-.9 0-1.872-.9-2.172l-1.078-.36c-.121-.04-.202-.152-.202-.28v-1.087c0-.128.081-.24.202-.28l1.078-.36c.9-.301 1.201-1.272.9-2.172l-.28-.841c-.302-.9-1.26-1.415-2.16-1.114l-1.072.358c-.121.04-.257.005-.345-.09l-.758-.826c-.087-.095-.105-.235-.042-.348l.523-.935c.449-.802.181-1.814-.604-2.285l-.754-.453c-.784-.471-1.812-.238-2.321.525l-.623.935c-.067.101-.186.151-.306.131l-1.072-.179c-.12-.02-.215-.115-.235-.235l-.178-1.072c-.151-.904-.933-1.567-1.85-1.567h-.904ZM12 15a3 3 0 1 0 0-6 3 3 0 0 0 0 6Z" clipRule="evenodd" />
        </svg>
      ),
    },
    {
      href: "/tentang",
      label: "Profile",
      color: "#2AABEE",
      badge: 0,
      isImage: true,
      imageSrc: "/favicon.ico",
    },
  ];

  return (
    <aside className="fixed bottom-3 left-0 right-0 z-[100000] flex justify-center px-3 pointer-events-none pb-[env(safe-area-inset-bottom)]">
      <nav className="w-full max-w-md bg-[#1d2733]/95 backdrop-blur-2xl border border-white/10 rounded-full p-1.5 shadow-2xl pointer-events-auto transition-all duration-300">
        <div className="grid grid-cols-5 items-center">
          {links.map((link, idx) => {
            const isActiveRoute = pathname === link.href;
            const isCurrentSlideMenu = isHome && currentSlideIndex === idx;
            const isSelected = isHome ? isCurrentSlideMenu : isActiveRoute;

            return (
              <Link
                key={link.href}
                href={link.href}
                className="flex flex-col items-center justify-center py-1 group select-none active:scale-95 transition-transform duration-150 touch-manipulation"
              >
                {/* Visual Pill Indicator (Bentuk Kapsul Telegram) */}
                <div className="relative flex items-center justify-center">
                  <div
                    className={`flex items-center justify-center px-4 py-1 rounded-full transition-all duration-300 ${
                      isSelected
                        ? "bg-[#2b5278] text-[#5288c1] scale-105"
                        : "text-gray-400 group-hover:text-gray-200"
                    }`}
                  >
                    {link.isImage ? (
                      <img
                        src={link.imageSrc}
                        alt={link.label}
                        className={`w-6 h-6 rounded-full object-cover border transition-all duration-300 ${
                          isSelected ? "border-[#5288c1]" : "border-transparent opacity-60"
                        }`}
                      />
                    ) : (
                      <div className="shrink-0">{link.icon}</div>
                    )}
                  </div>

                  {/* Badge Notifikasi Telegram */}
                  {link.badge > 0 && (
                    <span className="absolute -top-1 -right-1 bg-[#2481cc] text-white text-[10px] font-bold min-w-[18px] h-[18px] px-1 rounded-full flex items-center justify-center border-2 border-[#1d2733] shadow-md">
                      {link.badge > 99 ? "99+" : link.badge}
                    </span>
                  )}
                </div>

                {/* Label Teks */}
                <span
                  className={`text-[10px] font-medium tracking-tight mt-0.5 transition-colors duration-200 ${
                    isSelected
                      ? "text-[#5288c1] font-semibold"
                      : "text-gray-400 group-hover:text-gray-200"
                  }`}
                >
                  {link.label}
                </span>
              </Link>
            );
          })}
        </div>
      </nav>
    </aside>
  );
}
