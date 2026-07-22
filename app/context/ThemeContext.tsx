"use client";
import React, { createContext, useContext, useState, useEffect, ReactNode } from "react";

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
  "custom",
] as const;

export type Theme = typeof AVAILABLE_THEMES[number];

export interface CustomColors {
  bg: string;
  accent: string;
  text: string;
  wave1: string;
  wave2: string;
  wave3: string;
}

interface ThemeContextType {
  theme: Theme;
  setTheme: (theme: Theme) => void;
  customColors: CustomColors;
  setCustomColors: (colors: CustomColors) => void;
  mounted: boolean;
}

const DEFAULT_CUSTOM: CustomColors = {
  bg: "#09090b",
  accent: "#3b82f6",
  text: "#f4f4f5",
  wave1: "#1e293b",
  wave2: "#3b82f6",
  wave3: "#60a5fa",
};

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

export function ThemeProvider({ children }: { children: ReactNode }) {
  const [theme, setTheme] = useState<Theme>("dark");
  const [customColors, setCustomColors] = useState<CustomColors>(DEFAULT_CUSTOM);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    const savedTheme = localStorage.getItem("app-theme") as Theme | null;
    const savedCustom = localStorage.getItem("app-custom-colors");

    if (savedTheme && AVAILABLE_THEMES.includes(savedTheme)) {
      setTheme(savedTheme);
    }
    if (savedCustom) {
      try {
        setCustomColors(JSON.parse(savedCustom));
      } catch (e) {}
    }
    setMounted(true);
  }, []);

  useEffect(() => {
    if (!mounted) return;

    localStorage.setItem("app-theme", theme);
    localStorage.setItem("app-custom-colors", JSON.stringify(customColors));

    const themeClasses = AVAILABLE_THEMES.map((t) => `theme-${t}`);
    document.documentElement.classList.remove(...themeClasses);

    if (theme === "custom") {
      const root = document.documentElement;
      root.style.setProperty("--background", customColors.bg);
      root.style.setProperty("--background-gradient-start", customColors.bg);
      root.style.setProperty("--background-gradient-end", customColors.bg);
      root.style.setProperty("--accent", customColors.accent);
      root.style.setProperty("--accent-glow", `${customColors.accent}4d`);
      root.style.setProperty("--foreground-heading", customColors.text);
      root.style.setProperty("--foreground", `${customColors.text}b3`);
      root.style.setProperty("--card-bg", `${customColors.accent}1a`);
      root.style.setProperty("--card-border", `${customColors.accent}33`);
    } else {
      document.documentElement.removeAttribute("style");
      document.documentElement.classList.add(`theme-${theme}`);
    }
  }, [theme, customColors, mounted]);

  return (
    <ThemeContext.Provider value={{ theme, setTheme, customColors, setCustomColors, mounted }}>
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