"use client";
import React, { createContext, useContext, useState, useEffect, ReactNode } from "react";

// Daftar 10 tema lengkap sebagai konstan
export const AVAILABLE_THEMES = [
  "dark",
  "navy-electric",
  "emerald-cream",
  "teal-coral",
  "sea-citrus",
  "raisin-sunset",
  "gunmetal-platinum",
  "charcoal-ecru",
  "charcoal-sage",
  "cyber-neon",
] as const;

export type Theme = typeof AVAILABLE_THEMES[number];

interface ThemeContextType {
  theme: Theme;
  setTheme: (theme: Theme) => void;
  mounted: boolean;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

export function ThemeProvider({ children }: { children: ReactNode }) {
  const [theme, setTheme] = useState<Theme>("dark");
  const [mounted, setMounted] = useState(false);

  // Load tema dari localStorage saat komponen terpasang di client
  useEffect(() => {
    const saved = localStorage.getItem("app-theme") as Theme | null;
    if (saved && AVAILABLE_THEMES.includes(saved)) {
      setTheme(saved);
    }
    setMounted(true);
  }, []);

  // Update class di element <html> & simpan ke localStorage setiap kali tema berubah
  useEffect(() => {
    if (!mounted) return;
    
    localStorage.setItem("app-theme", theme);
    
    // Generator daftar class tema ("theme-dark", "theme-navy-electric", dll)
    const themeClasses = AVAILABLE_THEMES.map((t) => `theme-${t}`);
    
    // Hapus semua class lama sekaligus & tambahkan class yang aktif
    document.documentElement.classList.remove(...themeClasses);
    document.documentElement.classList.add(`theme-${theme}`);
  }, [theme, mounted]);

  return (
    <ThemeContext.Provider value={{ theme, setTheme, mounted }}>
      {children}
    </ThemeContext.Provider>
  );
}

export function useTheme() {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error("useTheme harus dipakai di dalam ThemeProvider");
  }
  return context;
}