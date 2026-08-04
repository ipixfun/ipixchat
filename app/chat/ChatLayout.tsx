"use client";
import React, { useEffect, useState } from "react";
import Admin from "../../components/Admin";
import { useTheme } from "../context/ThemeContext";

const hexToRgb = (hex: string) => {
  if (!hex) return "59, 130, 246";
  let c = hex.replace("#", "");
  if (c.length === 3) c = c.split("").map((x) => x + x).join("");
  const num = parseInt(c, 16);
  if (isNaN(num)) return "59, 130, 246";
  return `${(num >> 16) & 255}, ${(num >> 8) & 255}, ${num & 255}`;
};

const THEME_WAVES: Record<string, { layer1: string; layer2: string; layer3: string; glow: string }> = {
  "dark": { 
    layer1: "24, 24, 27", 
    layer2: "39, 39, 42", 
    layer3: "82, 82, 91", 
    glow: "drop-shadow(0 0 15px rgba(228,228,231,0.2))" 
  },
  "navy-electric": { 
    layer1: "30, 41, 59", 
    layer2: "37, 99, 235", 
    layer3: "96, 165, 250", 
    glow: "drop-shadow(0 0 15px rgba(59,130,246,0.4))" 
  },
  "emerald-cream": { 
    layer1: "209, 250, 229", 
    layer2: "52, 211, 153", 
    layer3: "16, 185, 129", 
    glow: "drop-shadow(0 0 15px rgba(16,185,129,0.4))" 
  },
  "teal-coral": { 
    layer1: "204, 251, 241", 
    layer2: "45, 212, 191", 
    layer3: "255, 127, 80", 
    glow: "drop-shadow(0 0 15px rgba(255,127,80,0.4))" 
  },
  "sea-citrus": { 
    layer1: "153, 246, 228", 
    layer2: "46, 196, 182", 
    layer3: "255, 159, 28", 
    glow: "drop-shadow(0 0 15px rgba(255,159,28,0.4))" 
  },
  "ivory-lime": { 
    layer1: "236, 252, 203", 
    layer2: "163, 230, 53", 
    layer3: "132, 204, 22", 
    glow: "drop-shadow(0 0 15px rgba(132,204,22,0.35))" 
  },
  "gunmetal-platinum": { 
    layer1: "63, 68, 91", 
    layer2: "108, 117, 125", 
    layer3: "216, 213, 219", 
    glow: "drop-shadow(0 0 15px rgba(216,213,219,0.3))" 
  },
  "charcoal-ecru": { 
    layer1: "53, 84, 96", 
    layer2: "216, 201, 155", 
    layer3: "216, 151, 60", 
    glow: "drop-shadow(0 0 15px rgba(216,151,60,0.3))" 
  },
  "ipix-neon": { 
    layer1: "26, 38, 0", 
    layer2: "92, 122, 0", 
    layer3: "234, 251, 93", /* Depan Terang Neon Lime */
    glow: "drop-shadow(0 0 15px rgba(199,243,60,0.5))" 
  },
  "red-purple": { 
    layer1: "45, 11, 54", 
    layer2: "126, 34, 206", 
    layer3: "255, 42, 122", /* Depan Terang Bright Red/Pink */
    glow: "drop-shadow(0 0 15px rgba(244,63,94,0.5))" 
  }
};

const FluidBottom = () => {
  const { theme, customColors } = useTheme();
  
  const [waveConfig, setWaveConfig] = useState({
    l1Show: true,
    l2Show: true,
    l3Show: true,
    l1Dir: "left",
    l2Dir: "left",
    l3Dir: "right"
  });

  useEffect(() => {
    const loadWaveConfig = () => {
      setWaveConfig({
        l1Show: localStorage.getItem("global_wave_l1_show") !== "false",
        l2Show: localStorage.getItem("global_wave_l2_show") !== "false",
        l3Show: localStorage.getItem("global_wave_l3_show") !== "false",
        l1Dir: localStorage.getItem("global_wave_l1_dir") || "left",
        l2Dir: localStorage.getItem("global_wave_l2_dir") || "left",
        l3Dir: localStorage.getItem("global_wave_l3_dir") || "right",
      });
    };

    loadWaveConfig();
    window.addEventListener("globalColorChanged", loadWaveConfig);
    return () => window.removeEventListener("globalColorChanged", loadWaveConfig);
  }, []);

  const isCustomWaveEnabled = typeof window !== "undefined" && localStorage.getItem("global_enable_custom_wave") === "true";
  
  const activeWave = isCustomWaveEnabled
    ? { layer1: hexToRgb(customColors.wave1), layer2: hexToRgb(customColors.wave2), layer3: hexToRgb(customColors.wave3), glow: `drop-shadow(0 0 15px ${customColors.wave2}66)` } 
    : (THEME_WAVES[theme] || THEME_WAVES["dark"]);
    
  const bgSize = "50% 100%";
  
  return (
    <div className="absolute bottom-0 left-0 w-full h-[30%] overflow-hidden pointer-events-none origin-bottom animate-blob-bounce-bottom" style={{ zIndex: 1, filter: activeWave.glow }}>
      {/* Layer 1 - Belakang */}
      {waveConfig.l1Show && (
        <div 
          className={`absolute bottom-0 left-0 w-[200%] h-full ${waveConfig.l1Dir === "left" ? "animate-wave" : "animate-wave-reverse"}`} 
          style={{ animationDuration: "14s", backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 1200 120' preserveAspectRatio='none'%3E%3Cpath d='M0,120 L0,60 C300,100 300,20 600,60 C900,100 900,20 1200,60 L1200,120 Z' fill='rgba(${activeWave.layer1},0.35)'/%3E%3C/svg%3E")`, backgroundRepeat: "repeat-x", backgroundSize: bgSize }} 
        />
      )}

      {/* Layer 2 - Tengah */}
      {waveConfig.l2Show && (
        <div 
          className={`absolute bottom-0 left-0 w-[200%] h-full ${waveConfig.l2Dir === "left" ? "animate-wave" : "animate-wave-reverse"}`} 
          style={{ animationDuration: "20s", backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 1200 120' preserveAspectRatio='none'%3E%3Cpath d='M0,120 L0,70 C300,30 300,110 600,70 C900,30 900,110 1200,70 L1200,120 Z' fill='rgba(${activeWave.layer2},0.25)'/%3E%3C/svg%3E")`, backgroundRepeat: "repeat-x", backgroundSize: bgSize }} 
        />
      )}

      {/* Layer 3 - Depan */}
      {waveConfig.l3Show && (
        <div 
          className={`absolute bottom-0 left-0 w-[200%] h-full ${waveConfig.l3Dir === "left" ? "animate-wave" : "animate-wave-reverse"}`} 
          style={{ animationDuration: "18s", backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 1200 120' preserveAspectRatio='none'%3E%3Cpath d='M0,120 L0,80 C300,120 300,40 600,80 C900,120 900,40 1200,80 L1200,120 Z' fill='rgba(${activeWave.layer3},0.65)'/%3E%3C/svg%3E")`, backgroundRepeat: "repeat-x", backgroundSize: bgSize }} 
        />
      )}
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
  fmtTime, 
  setSelPriv, 
  onDeleteAllMsgs,
  onUpdatePin,
  onUpdateUsername,
  onRefresh
}: any) {
  const [isWaveDisabled, setIsWaveDisabled] = useState<boolean>(false);

  useEffect(() => {
    const checkWaveSetting = () => {
      const disabled = localStorage.getItem("global_disable_wave") === "true";
      setIsWaveDisabled(disabled);
    };

    checkWaveSetting();
    window.addEventListener("globalColorChanged", checkWaveSetting);

    return () => {
      window.removeEventListener("globalColorChanged", checkWaveSetting);
    };
  }, []);

  return (
    <>
      <style>{`
        @keyframes wave { from { transform: translateX(0); } to { transform: translateX(-50%); } }
        @keyframes wave-reverse { from { transform: translateX(-50%); } to { transform: translateX(0); } }
        .animate-wave { animation: wave linear infinite; }
        .animate-wave-reverse { animation: wave-reverse linear infinite; }
        @keyframes blob-bounce-bottom { 0%, 100% { transform: scaleY(1); } 50% { transform: scaleY(1.15); } }
        .animate-blob-bounce-bottom { animation: blob-bounce-bottom 8s ease-in-out infinite; }
      `}</style>
      <div className="flex w-full h-full relative transition-all duration-500 ease-in-out">
        <div className="h-full flex flex-col w-full relative bg-transparent overflow-hidden">
          
          {!isWaveDisabled && <FluidBottom />}
          
          <div onScroll={hScroll} className="relative z-10 p-1 sm:p-2 space-y-2 overflow-y-auto overflow-x-hidden flex-1 h-full [scrollbar-width:none] [-ms-overflow-style:none] [&::-webkit-scrollbar]:hidden">
            {aTab === "admin" && cMode === "private" && !selPrivUser ? (
              <Admin 
                privateUsers={pUsers} 
                setSelectedPrivateUser={setSelPriv} 
                formatMessageTime={fmtTime} 
                onDeleteAllMsgs={onDeleteAllMsgs}
                onUpdatePin={onUpdatePin}
                onUpdateUsername={onUpdateUsername}
              />
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