"use client";
import React from "react";
import Admin from "./Admin";
import { useTheme } from "@/app/context/ThemeContext";

/* ---- Fluid Blob Atas (2 Layer, Smooth & Glowing) ---- */
const FluidTop = () => {
  const { theme } = useTheme();
  
  // Warna wave berdasarkan tema
  const getWaveColors = () => {
    switch (theme) {
      case "dark":
        return {
          layer1: "75, 85, 99",    // dark gray
          layer2: "156, 163, 175", // soft gray
          glow: "drop-shadow(0 0 15px rgba(75,85,99,0.4))"
        };
      case "blue":
        return {
          layer1: "59, 130, 246",  // ocean blue
          layer2: "96, 165, 250",  // light blue
          glow: "drop-shadow(0 0 15px rgba(59,130,246,0.6))"
        };
      case "emerald":
        return {
          layer1: "16, 185, 129",  // emerald green
          layer2: "52, 211, 153",  // light emerald
          glow: "drop-shadow(0 0 15px rgba(16,185,129,0.6))"
        };
      default:
        return {
          layer1: "16, 185, 129",
          layer2: "52, 211, 153",
          glow: "drop-shadow(0 0 15px rgba(16,185,129,0.6))"
        };
    }
  };

  const { layer1, layer2, glow } = getWaveColors();
  
  return (
    <div 
      className="absolute top-0 left-0 w-full h-[8%] overflow-hidden pointer-events-none origin-top animate-blob-bounce-top" 
      style={{ zIndex: 1, filter: glow }}
    >
      {/* Layer 1 - Aliran ke Kiri */}
      <div
        className="absolute bottom-0 left-0 w-[200%] h-full animate-wave"
        style={{
          animationDuration: "12s",
          backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 1200 120' preserveAspectRatio='none'%3E%3Cpath d='M0,0 L0,60 C150,20 350,120 600,60 C850,0 1050,100 1200,60 L1200,0 Z' fill='rgba(${layer1},0.4)'/%3E%3C/svg%3E")`,
          backgroundRepeat: "repeat-x",
          backgroundSize: "50% 100%",
        }}
      />
      {/* Layer 2 - Aliran ke Kanan */}
      <div
        className="absolute bottom-0 left-0 w-[200%] h-full animate-wave-reverse"
        style={{
          animationDuration: "15s",
          backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 1200 120' preserveAspectRatio='none'%3E%3Cpath d='M0,0 L0,40 C200,100 400,0 600,40 C800,80 1000,-20 1200,40 L1200,0 Z' fill='rgba(${layer2},0.7)'/%3E%3C/svg%3E")`,
          backgroundRepeat: "repeat-x",
          backgroundSize: "50% 100%",
        }}
      />
    </div>
  );
};

/* ---- Fluid Blob Bawah ---- */
const FluidBottom = () => {
  const { theme } = useTheme();
  
  // Warna wave berdasarkan tema
  const getWaveColors = () => {
    switch (theme) {
      case "dark":
        return {
          layer1: "75, 85, 99",    // dark gray
          layer2: "156, 163, 175", // soft gray
          layer3: "107, 114, 128", // medium gray
          glow: "drop-shadow(0 0 20px rgba(75,85,99,0.3))"
        };
      case "blue":
        return {
          layer1: "59, 130, 246",  // ocean blue
          layer2: "96, 165, 250",  // light blue
          layer3: "37, 99, 235",   // dark blue
          glow: "drop-shadow(0 0 20px rgba(59,130,246,0.5))"
        };
      case "emerald":
        return {
          layer1: "16, 185, 129",  // emerald green
          layer2: "52, 211, 153",  // light emerald
          layer3: "5, 150, 105",   // dark emerald
          glow: "drop-shadow(0 0 20px rgba(16,185,129,0.5))"
        };
      default:
        return {
          layer1: "16, 185, 129",
          layer2: "52, 211, 153",
          layer3: "5, 150, 105",
          glow: "drop-shadow(0 0 20px rgba(16,185,129,0.5))"
        };
    }
  };

  const { layer1, layer2, layer3, glow } = getWaveColors();
  const bgSize = "50% 100%";

  return (
    <div 
      className="absolute bottom-0 left-0 w-full h-[30%] overflow-hidden pointer-events-none origin-bottom animate-blob-bounce-bottom" 
      style={{ zIndex: 1, filter: glow }}
    >
      {/* Layer 1 - Background */}
      <div 
        className="absolute bottom-0 left-0 w-[200%] h-full animate-wave" 
        style={{ 
          animationDuration: "14s", 
          backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 1200 120' preserveAspectRatio='none'%3E%3Cpath d='M0,120 L0,60 C300,100 300,20 600,60 C900,100 900,20 1200,60 L1200,120 Z' fill='rgba(${layer1},0.35)'/%3E%3C/svg%3E")`, 
          backgroundRepeat: "repeat-x", 
          backgroundSize: bgSize 
        }} 
      />
      
      {/* Layer 2 - Gelombang Tengah */}
      <div 
        className="absolute bottom-0 left-0 w-[200%] h-full animate-wave" 
        style={{ 
          animationDuration: "20s", 
          backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 1200 120' preserveAspectRatio='none'%3E%3Cpath d='M0,120 L0,70 C300,30 300,110 600,70 C900,30 900,110 1200,70 L1200,120 Z' fill='rgba(${layer2},0.25)'/%3E%3C/svg%3E")`, 
          backgroundRepeat: "repeat-x", 
          backgroundSize: bgSize 
        }} 
      />

      {/* Layer 3 - Foreground */}
      <div 
        className="absolute bottom-0 left-0 w-[200%] h-full animate-wave-reverse" 
        style={{ 
          animationDuration: "18s", 
          backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 1200 120' preserveAspectRatio='none'%3E%3Cpath d='M0,120 L0,80 C300,120 300,40 600,80 C900,120 900,40 1200,80 L1200,120 Z' fill='rgba(${layer3},0.65)'/%3E%3C/svg%3E")`, 
          backgroundRepeat: "repeat-x", 
          backgroundSize: bgSize 
        }} 
      />
    </div>
  );
};

/* ---- Main layout ---- */
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
        .animate-blob-bounce-top {
          animation: blob-bounce-top 6s ease-in-out infinite;
        }
        .animate-blob-bounce-bottom {
          animation: blob-bounce-bottom 8s ease-in-out infinite;
        }
      `}</style>

      <div className="flex w-full h-full relative transition-all duration-500 ease-in-out">
        
        <div 
          className="h-full flex flex-col w-full relative bg-transparent overflow-hidden"
        >
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