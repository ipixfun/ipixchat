"use client";
import React from "react";
import Admin from "../../components/Admin";
import { useTheme } from "../context/ThemeContext";

// Helper untuk mengonversi Hex (#ffffff) ke format RGB (255, 255, 255)
const hexToRgb = (hex: string) => {
  if (!hex) return "59, 130, 246";
  let c = hex.replace("#", "");
  if (c.length === 3) c = c.split("").map((x) => x + x).join("");
  const num = parseInt(c, 16);
  if (isNaN(num)) return "59, 130, 246";
  return `${(num >> 16) & 255}, ${(num >> 8) & 255}, ${num & 255}`;
};

const THEME_WAVES: Record<string, { layer1: string; layer2: string; layer3: string; glow: string }> = {
  "dark": { layer1: "45, 45, 50", layer2: "161, 161, 170", layer3: "228, 228, 231", glow: "drop-shadow(0 0 15px rgba(228,228,231,0.2))" },
  "navy-electric": { layer1: "15, 23, 42", layer2: "59, 130, 246", layer3: "148, 163, 184", glow: "drop-shadow(0 0 15px rgba(59,130,246,0.4))" },
  "emerald-cream": { layer1: "6, 95, 70", layer2: "16, 185, 129", layer3: "167, 243, 208", glow: "drop-shadow(0 0 15px rgba(16,185,129,0.4))" },
  "teal-coral": { layer1: "15, 118, 110", layer2: "255, 127, 80", layer3: "245, 230, 202", glow: "drop-shadow(0 0 15px rgba(255,127,80,0.4))" },
  "sea-citrus": { layer1: "26, 117, 109", layer2: "46, 196, 182", layer3: "255, 159, 28", glow: "drop-shadow(0 0 15px rgba(255,159,28,0.4))" },
  "raisin-sunset": { layer1: "39, 39, 39", layer2: "212, 170, 125", layer3: "239, 208, 158", glow: "drop-shadow(0 0 15px rgba(239,208,158,0.3))" },
  "gunmetal-platinum": { layer1: "45, 49, 66", layer2: "173, 172, 181", layer3: "216, 213, 219", glow: "drop-shadow(0 0 15px rgba(216,213,219,0.3))" },
  "charcoal-ecru": { layer1: "39, 62, 71", layer2: "216, 201, 155", layer3: "216, 151, 60", glow: "drop-shadow(0 0 15px rgba(216,151,60,0.3))" },
  "charcoal-sage": { layer1: "46, 46, 46", layer2: "181, 203, 183", layer3: "243, 239, 230", glow: "drop-shadow(0 0 15px rgba(181,203,183,0.3))" },
  "cyber-neon": { layer1: "127, 86, 255", layer2: "128, 255, 86", layer3: "43, 45, 49", glow: "drop-shadow(0 0 15px rgba(127,86,255,0.5))" }
};

/* ---- Fluid Blob Atas ---- */
const FluidTop = () => {
  const { theme, customColors } = useTheme();

  const activeWave = theme === "custom" ? {
    layer1: hexToRgb(customColors.wave1),
    layer2: hexToRgb(customColors.wave2),
    layer3: hexToRgb(customColors.wave3),
    glow: `drop-shadow(0 0 15px ${customColors.wave2}66)`
  } : (THEME_WAVES[theme] || THEME_WAVES["dark"]);

  return (
    <div 
      className="absolute top-0 left-0 w-full h-[8%] overflow-hidden pointer-events-none origin-top animate-blob-bounce-top" 
      style={{ zIndex: 1, filter: activeWave.glow }}
    >
      <div
        className="absolute bottom-0 left-0 w-[200%] h-full animate-wave"
        style={{
          animationDuration: "12s",
          backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 1200 120' preserveAspectRatio='none'%3E%3Cpath d='M0,0 L0,60 C150,20 350,120 600,60 C850,0 1050,100 1200,60 L1200,0 Z' fill='rgba(${activeWave.layer1},0.4)'/%3E%3C/svg%3E")`,
          backgroundRepeat: "repeat-x",
          backgroundSize: "50% 100%",
        }}
      />
      <div
        className="absolute bottom-0 left-0 w-[200%] h-full animate-wave-reverse"
        style={{
          animationDuration: "15s",
          backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 1200 120' preserveAspectRatio='none'%3E%3Cpath d='M0,0 L0,40 C200,100 400,0 600,40 C800,80 1000,-20 1200,40 L1200,0 Z' fill='rgba(${activeWave.layer2},0.7)'/%3E%3C/svg%3E")`,
          backgroundRepeat: "repeat-x",
          backgroundSize: "50% 100%",
        }}
      />
    </div>
  );
};

/* ---- Fluid Blob Bawah ---- */
const FluidBottom = () => {
  const { theme, customColors } = useTheme();

  const activeWave = theme === "custom" ? {
    layer1: hexToRgb(customColors.wave1),
    layer2: hexToRgb(customColors.wave2),
    layer3: hexToRgb(customColors.wave3),
    glow: `drop-shadow(0 0 15px ${customColors.wave2}66)`
  } : (THEME_WAVES[theme] || THEME_WAVES["dark"]);

  const bgSize = "50% 100%";

  return (
    <div 
      className="absolute bottom-0 left-0 w-full h-[30%] overflow-hidden pointer-events-none origin-bottom animate-blob-bounce-bottom" 
      style={{ zIndex: 1, filter: activeWave.glow }}
    >
      <div 
        className="absolute bottom-0 left-0 w-[200%] h-full animate-wave" 
        style={{ 
          animationDuration: "14s", 
          backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 1200 120' preserveAspectRatio='none'%3E%3Cpath d='M0,120 L0,60 C300,100 300,20 600,60 C900,100 900,20 1200,60 L1200,120 Z' fill='rgba(${activeWave.layer1},0.35)'/%3E%3C/svg%3E")`, 
          backgroundRepeat: "repeat-x", 
          backgroundSize: bgSize 
        }} 
      />
      <div 
        className="absolute bottom-0 left-0 w-[200%] h-full animate-wave" 
        style={{ 
          animationDuration: "20s", 
          backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 1200 120' preserveAspectRatio='none'%3E%3Cpath d='M0,120 L0,70 C300,30 300,110 600,70 C900,30 900,110 1200,70 L1200,120 Z' fill='rgba(${activeWave.layer2},0.25)'/%3E%3C/svg%3E")`, 
          backgroundRepeat: "repeat-x", 
          backgroundSize: bgSize 
        }} 
      />
      <div 
        className="absolute bottom-0 left-0 w-[200%] h-full animate-wave-reverse" 
        style={{ 
          animationDuration: "18s", 
          backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 1200 120' preserveAspectRatio='none'%3E%3Cpath d='M0,120 L0,80 C300,120 300,40 600,80 C900,120 900,40 1200,80 L1200,120 Z' fill='rgba(${activeWave.layer3},0.65)'/%3E%3C/svg%3E")`, 
          backgroundRepeat: "repeat-x", 
          backgroundSize: bgSize 
        }} 
      />
    </div>
  );
};

export default function ChatLayout({ 
  cMode, 
  hScroll, 
  aTab, 
  selPrivUser, 
  pUsers, 
  privMsgs, 
  renderMsgs,
  renderInput, 
  fmtTime, 
  setSelPriv 
}: any) {
  return (
    <>
      <style>{`
        @keyframes wave { from { transform: translateX(0); } to { transform: translateX(-50%); } }
        @keyframes wave-reverse { from { transform: translateX(-50%); } to { transform: translateX(0); } }
        .animate-wave { animation: wave linear infinite; }
        .animate-wave-reverse { animation: wave-reverse linear infinite; }
        
        @keyframes blob-bounce-top {
          0%, 100% { transform: scaleY(1); }
          50% { transform: scaleY(1.3); }
        }
        @keyframes blob-bounce-bottom {
          0%, 100% { transform: scaleY(1); }
          50% { transform: scaleY(1.15); }
        }
        .animate-blob-bounce-top { animation: blob-bounce-top 6s ease-in-out infinite; }
        .animate-blob-bounce-bottom { animation: blob-bounce-bottom 8s ease-in-out infinite; }
      `}</style>

      <div className="flex w-full h-full relative transition-all duration-500 ease-in-out">
        <div className="h-full flex flex-col w-full relative bg-transparent overflow-hidden">
          <FluidTop />
          <FluidBottom />
          
          <div onScroll={hScroll} className="relative z-10 p-1 sm:p-2 space-y-2 overflow-y-auto overflow-x-hidden flex-1 h-full [scrollbar-width:none] [-ms-overflow-style:none] [&::-webkit-scrollbar]:hidden">
            {aTab === "admin" && cMode === "private" && !selPrivUser ? (
              <Admin privateUsers={pUsers} setSelectedPrivateUser={setSelPriv} formatMessageTime={fmtTime} />
            ) : (
              renderMsgs(privMsgs, "private")
            )}
            <div id="messages-end-private" className="h-0" />
          </div>
        </div>
      </div>
    </>
  );
}