"use client";
import React, { createContext, useContext, useState, useEffect, ReactNode } from "react";

type Theme = "dark" | "blue" | "emerald";

interface ThemeContextType {
  theme: Theme;
  setTheme: (theme: Theme) => void;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

export function ThemeProvider({ children }: { children: ReactNode }) {
  const [theme, setTheme] = useState<Theme>("dark");
  const [mounted, setMounted] = useState(false);

  // Load tema dari localStorage saat mount
  useEffect(() => {
    const saved = localStorage.getItem("app-theme") as Theme | null;
    if (saved && ["dark", "blue", "emerald"].includes(saved)) {
      setTheme(saved);
    }
    setMounted(true);
  }, []);

  // Update class di <html> & simpan ke localStorage setiap tema berubah
  useEffect(() => {
    if (!mounted) return;
    
    localStorage.setItem("app-theme", theme);
    
    // Hapus semua class tema lama
    document.documentElement.classList.remove("theme-dark", "theme-blue", "theme-emerald");
    // Tambah class tema baru
    document.documentElement.classList.add(`theme-${theme}`);
  }, [theme, mounted]);

  return (
    <ThemeContext.Provider value={{ theme, setTheme }}>
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