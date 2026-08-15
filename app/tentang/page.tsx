"use client";
import React, {
  useState,
  useEffect,
  useRef,
  useCallback,
  type CSSProperties,
  type MouseEvent as ReactMouseEvent,
  type TouchEvent as ReactTouchEvent,
} from "react";
import BottomNav from "../../components/bottomnav"; 
import { useTheme } from "../context/ThemeContext"; 
import GlobalMiniPlayer from "@/components/GlobalMiniPlayer";

/* =========================
   Types
   ========================= */
interface LinkItem {
  label: string;
  url: string;
  displayUrl: string;
  image: string;
}

interface CardRef {
  el: HTMLDivElement | null;
  x: number;
  y: number;
  url: string;
  displayUrl: string;
  label: string;
  image: string;
  color: string;
}

/* =========================
   Constants & 8 Locked Links
   ========================= */
const LINKS: LinkItem[] = [
  {
    label: "ipixchat.my.id",
    url: "https://ipixchat.my.id",
    displayUrl: "ipixchat.my.id",
    image: "/0.webp",
  },
  {
    label: "sukachub.my.id",
    url: "https://sukachub.my.id",
    displayUrl: "sukachub.my.id",
    image: "/1.webp",
  },
  {
    label: "X@sixripix",
    url: "https://www.x.com/sixripix",
    displayUrl: "x.com/sixripix",
    image: "/2.webp",
  },
  {
    label: "Walla@pix",
    url: "https://international.walla-app.com/user?id=V2O6MN&app=2",
    displayUrl: "walla-app.com",
    image: "/3.webp",
  },
  {
    label: "TikTok@ipixaja",
    url: "https://www.tiktok.com/@ipixaja",
    displayUrl: "tiktok.com/@ipixaja",
    image: "/4.webp",
  },
  {
    label: "ipix.my.id",
    url: "https://ipix.my.id",
    displayUrl: "ipix.my.id",
    image: "/0.webp",
  },
  {
    label: "Growlr@pix",
    url: "https://growlrapp.com",
    displayUrl: "growlrapp.com",
    image: "/1.webp",
  },
  {
    label: "iPix.Fun",
    url: "https://ipix.fun",
    displayUrl: "ipix.fun",
    image: "/2.webp",
  },
];

function getRandomColorForTheme(themeId: string, customColors: any): string {
  if (themeId === "custom" && customColors) {
    const customList = [
      customColors.accent || "#39FF14",
      customColors.wave1 || "#191970",
      customColors.wave2 || "#00BFFF",
      customColors.wave3 || "#FF0055",
    ];
    return customList[Math.floor(Math.random() * customList.length)];
  }

  const presetPalettes: Record<string, string[]> = {
    "dark": ["#525252", "#737373", "#a3a3a3", "#d4d4d4"],
    "navy-electric": ["#1e3a8a", "#3b82f6", "#60a5fa", "#93c5fd"],
    "emerald-cream": ["#10b981", "#fcd34d", "#34d399", "#fde68a"],
    "teal-coral": ["#14b8a6", "#fdba74", "#2dd4bf", "#fed7aa"],
    "sea-citrus": ["#06b6d4", "#5eead4", "#22d3ee", "#99f6e4"],
    "raisin-sunset": ["#f43f5e", "#fb7185", "#f43f5e", "#e11d48"],
    "gunmetal-platinum": ["#475569", "#64748b", "#94a3b8", "#cbd5e1"],
    "charcoal-ecru": ["#44403c", "#57534e", "#78716c", "#a8a29e"],
    "charcoal-sage": ["#3f3f46", "#52525b", "#71717a", "#a1a1aa"],
    "cyber-neon": ["#0ea5e9", "#a855f7", "#ec4899", "#39FF14"],
  };

  const options = presetPalettes[themeId] || presetPalettes["cyber-neon"];
  return options[Math.floor(Math.random() * options.length)];
}

const CARD_W = 100;
const CARD_H = 148;
const BOTTOM_NAV_HEIGHT = 70;

export default function IpixFun(): JSX.Element | null {
  const { theme, customColors, mounted } = useTheme();

  // ---------- Refs ----------
  const containerRef = useRef<HTMLDivElement | null>(null);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const targetRef = useRef<HTMLDivElement | null>(null);

  const cardRefs = useRef<CardRef[]>(
    LINKS.map((link) => ({
      el: null,
      x: 0,
      y: 0,
      url: link.url,
      displayUrl: link.displayUrl,
      label: link.label,
      image: link.image,
      color: "#00f0ff",
    }))
  );

  const activeCardRef = useRef<CardRef | null>(null);
  const deployedCardRef = useRef<CardRef | null>(null);
  const origPosRef = useRef<{ x: number; y: number } | null>(null);
  const dragStartPosRef = useRef<{ x: number; y: number }>({ x: 0, y: 0 });
  const offsetRef = useRef<{ x: number; y: number }>({ x: 0, y: 0 });

  // ---------- State ----------
  const [modalOpen, setModalOpen] = useState(false);
  const [previewModalOpen, setPreviewModalOpen] = useState(false);
  const [selectedLink, setSelectedLink] = useState<LinkItem | null>(null);
  const [iframeError, setIframeError] = useState(false);

  const [targetText, setTargetText] = useState("TARGET LOCK");
  const [targetGlow, setTargetGlow] = useState(false);
  const [activeCardIdx, setActiveCardIdx] = useState<number | null>(null);

  // ---------- Update Warna Tema ----------
  const randomizeThemeColors = useCallback(() => {
    cardRefs.current.forEach((c) => {
      c.color = getRandomColorForTheme(theme, customColors);
      if (c.el) {
        c.el.style.setProperty("--card-color", c.color);
      }
    });
  }, [theme, customColors]);

  useEffect(() => {
    if (mounted) {
      randomizeThemeColors();
    }
  }, [theme, customColors, mounted, randomizeThemeColors]);

  // ---------- Helper: Bounds ----------
  const getBounds = useCallback(() => {
    const headerGroup = document.querySelector(".header-top-bar") as HTMLElement | null;
    const tgt = targetRef.current;
    const container = containerRef.current;

    const hRect = headerGroup?.getBoundingClientRect() ?? new DOMRect();
    const tRect = tgt?.getBoundingClientRect() ?? new DOMRect();
    const cRect = container?.getBoundingClientRect() ?? new DOMRect();

    return {
      topOffset: Math.max(hRect.bottom - cRect.top + 10, 60),
      tgtTop: tRect.top - cRect.top,
      tgtBottom: tRect.bottom - cRect.top,
      tgtCenterX: tRect.left - cRect.left + tRect.width / 2,
      tgtCenterY: tRect.top - cRect.top + tRect.height / 2,
      containerWidth: container ? container.clientWidth : 800,
      containerHeight: container ? container.clientHeight : 800,
      bottomLimit: container ? container.clientHeight - BOTTOM_NAV_HEIGHT : 800,
    };
  }, []);

  const applyCardStyle = useCallback((c: CardRef) => {
    if (!c.el) return;
    c.el.style.transform = `translate3d(${c.x}px, ${c.y}px, 0)`;
    c.el.style.setProperty("--card-color", c.color);
  }, []);

  // ---------- Posisi Terkunci 8 Kartu ----------
  const lockCardPositions = useCallback(() => {
    const { topOffset, tgtTop, tgtBottom, tgtCenterX, tgtCenterY, containerWidth, bottomLimit } =
      getBounds();

    const padding = 12;
    const col1X = padding;
    const col2X = (containerWidth - CARD_W) / 2;
    const col3X = containerWidth - CARD_W - padding;

    const topAvailableSpace = tgtTop - topOffset;
    const topY = topOffset + Math.max(0, (topAvailableSpace - CARD_H) / 2);

    const midY = tgtCenterY - CARD_H / 2;

    const botAvailableSpace = bottomLimit - tgtBottom;
    const botY = tgtBottom + Math.max(0, (botAvailableSpace - CARD_H) / 2);

    // Row 1 (Atas - 3 Kartu)
    if (cardRefs.current[0]) { cardRefs.current[0].x = col1X; cardRefs.current[0].y = topY; }
    if (cardRefs.current[1]) { cardRefs.current[1].x = col2X; cardRefs.current[1].y = topY; }
    if (cardRefs.current[2]) { cardRefs.current[2].x = col3X; cardRefs.current[2].y = topY; }

    // Row 2 (Tengah - 2 Kartu di Kiri & Kanan Target Lock)
    if (cardRefs.current[3]) { cardRefs.current[3].x = col1X; cardRefs.current[3].y = midY; }
    if (cardRefs.current[4]) { cardRefs.current[4].x = col3X; cardRefs.current[4].y = midY; }

    // Row 3 (Bawah - 3 Kartu)
    if (cardRefs.current[5]) { cardRefs.current[5].x = col1X; cardRefs.current[5].y = botY; }
    if (cardRefs.current[6]) { cardRefs.current[6].x = col2X; cardRefs.current[6].y = botY; }
    if (cardRefs.current[7]) { cardRefs.current[7].x = col3X; cardRefs.current[7].y = botY; }

    cardRefs.current.forEach((c) => applyCardStyle(c));
  }, [getBounds, applyCardStyle]);

  useEffect(() => {
    if (mounted) {
      lockCardPositions();
    }
  }, [mounted, lockCardPositions]);

  // ---------- Canvas Drawing (Laser Line saat Drag) ----------
  const drawConnections = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    ctx.clearRect(0, 0, canvas.width, canvas.height);
    const active = activeCardRef.current;
    if (active) {
      const { tgtCenterX, tgtCenterY } = getBounds();
      const cardX = active.x + CARD_W / 2;
      const cardY = active.y + CARD_H / 2;

      ctx.beginPath();
      ctx.lineWidth = 3;
      ctx.strokeStyle = active.color || "var(--accent, #00f0ff)";
      ctx.shadowColor = active.color || "var(--accent, #00f0ff)";
      ctx.shadowBlur = 12;
      ctx.moveTo(cardX, cardY);
      ctx.lineTo(tgtCenterX, tgtCenterY);
      ctx.stroke();
      ctx.shadowBlur = 0;
    }
  }, [getBounds]);

  // ---------- Resize Canvas & Position Lock ----------
  useEffect(() => {
    const resize = () => {
      const canvas = canvasRef.current;
      const container = containerRef.current;
      if (canvas && container) {
        canvas.width = container.clientWidth;
        canvas.height = container.clientHeight;
      }
      lockCardPositions();
    };
    window.addEventListener("resize", resize);
    resize();
    return () => window.removeEventListener("resize", resize);
  }, [lockCardPositions]);

  // ---------- Drag Handlers ----------
  const startDrag = useCallback((obj: CardRef, idx: number, clientX: number, clientY: number) => {
    const container = containerRef.current;
    if (!container) return;
    const cRect = container.getBoundingClientRect();

    activeCardRef.current = obj;
    setActiveCardIdx(idx); // Aktifkan Glow & Rotasi 3D hanya saat kartu ini dipilih
    dragStartPosRef.current = { x: obj.x, y: obj.y };

    setTargetText(`DEPLOY: ${obj.label}`);

    offsetRef.current = {
      x: clientX - cRect.left - obj.x,
      y: clientY - cRect.top - obj.y,
    };
  }, []);

  const onCardPointerDown = (
    e: ReactMouseEvent<HTMLDivElement> | ReactTouchEvent<HTMLDivElement>,
    idx: number
  ) => {
    e.preventDefault();
    const obj = cardRefs.current[idx];
    if (!obj) return;
    const clientX = "touches" in e ? e.touches[0].clientX : (e as ReactMouseEvent).clientX;
    const clientY = "touches" in e ? e.touches[0].clientY : (e as ReactMouseEvent).clientY;
    startDrag(obj, idx, clientX, clientY);
  };

  const endDrag = useCallback(() => {
    const active = activeCardRef.current;
    if (!active) return;
    const tgt = targetRef.current?.getBoundingClientRect();
    const container = containerRef.current;

    if (tgt && container) {
      const cRect = container.getBoundingClientRect();
      const cx = active.x + CARD_W / 2 + cRect.left;
      const cy = active.y + CARD_H / 2 + cRect.top;

      if (cx > tgt.left && cx < tgt.right && cy > tgt.top && cy < tgt.bottom) {
        const { tgtCenterX, tgtCenterY } = getBounds();
        active.x = tgtCenterX - CARD_W / 2;
        active.y = tgtCenterY - CARD_H / 2;
        applyCardStyle(active);

        deployedCardRef.current = active;
        origPosRef.current = { ...dragStartPosRef.current };

        const item = LINKS.find((l) => l.url === active.url) || {
          label: active.label,
          url: active.url,
          displayUrl: active.displayUrl,
          image: active.image,
        };
        setSelectedLink(item);
        setIframeError(false);
        setPreviewModalOpen(true);
      } else {
        // Jika dilepas di luar target lock, kembalikan ke posisi semula
        active.x = dragStartPosRef.current.x;
        active.y = dragStartPosRef.current.y;
        applyCardStyle(active);
        setActiveCardIdx(null); // Matikan glow & rotasi saat kembali
      }
    }
    activeCardRef.current = null;
    setTargetText("TARGET LOCK");
    setTargetGlow(false);
  }, [getBounds, applyCardStyle]);

  const handleCancel = useCallback(() => {
    if (deployedCardRef.current && origPosRef.current) {
      deployedCardRef.current.x = origPosRef.current.x;
      deployedCardRef.current.y = origPosRef.current.y;
      applyCardStyle(deployedCardRef.current);
      deployedCardRef.current = null;
      origPosRef.current = null;
    }
    setActiveCardIdx(null); // Matikan glow & rotasi saat modal ditutup/dibatalkan
    setPreviewModalOpen(false);
  }, [applyCardStyle]);

  const moveCard = useCallback(
    (clientX: number, clientY: number) => {
      const active = activeCardRef.current;
      const container = containerRef.current;
      if (!active || !container) return;

      const cRect = container.getBoundingClientRect();
      const newX = clientX - cRect.left - offsetRef.current.x;
      const newY = clientY - cRect.top - offsetRef.current.y;

      active.x = Math.max(0, Math.min(newX, container.clientWidth - CARD_W));
      active.y = Math.max(0, Math.min(newY, container.clientHeight - CARD_H));
      applyCardStyle(active);

      const tgt = targetRef.current?.getBoundingClientRect();
      if (tgt) {
        const cx = active.x + CARD_W / 2 + cRect.left;
        const cy = active.y + CARD_H / 2 + cRect.top;
        setTargetGlow(cx > tgt.left && cx < tgt.right && cy > tgt.top && cy < tgt.bottom);
      }
    },
    [applyCardStyle]
  );

  useEffect(() => {
    const onMouseMove = (e: MouseEvent) => {
      if (activeCardRef.current) moveCard(e.clientX, e.clientY);
    };
    const onTouchMove = (e: TouchEvent) => {
      if (activeCardRef.current) {
        e.preventDefault();
        moveCard(e.touches[0].clientX, e.touches[0].clientY);
      }
    };
    const onUp = () => endDrag();

    window.addEventListener("mousemove", onMouseMove);
    window.addEventListener("touchmove", onTouchMove, { passive: false });
    window.addEventListener("mouseup", onUp);
    window.addEventListener("touchend", onUp);

    return () => {
      window.removeEventListener("mousemove", onMouseMove);
      window.removeEventListener("touchmove", onTouchMove);
      window.removeEventListener("mouseup", onUp);
      window.removeEventListener("touchend", onUp);
    };
  }, [moveCard, endDrag]);

  // ---------- Canvas Loop ----------
  useEffect(() => {
    let rafId = 0;
    const tick = () => {
      drawConnections();
      rafId = requestAnimationFrame(tick);
    };
    rafId = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(rafId);
  }, [drawConnections]);

  if (!mounted) return null;

  // Cek apakah domain menggunakan .my.id atau .fun
  const isLiveIframeDomain = selectedLink && (
    selectedLink.url.includes(".my.id") || selectedLink.url.includes(".fun")
  );

  return (
    <div
      ref={containerRef}
      className="w-full max-w-2xl mx-auto h-dvh flex flex-col relative overflow-hidden transition-colors duration-300 select-none font-sans"
      style={{
        backgroundColor: "var(--background, #020617)",
        color: "var(--foreground, #ffffff)",
      }}
    >
      <style
        dangerouslySetInnerHTML={{
          __html: `
        * { box-sizing: border-box; }
        html, body { height: 100dvh; margin: 0; overflow: hidden; touch-action: none; -webkit-tap-highlight-color: transparent; }
        
        #fx-canvas { position: absolute; top: 0; left: 0; width: 100%; height: 100%; pointer-events: none; z-index: 0; }

        /* Header Top Bar: Presisi Sejajar Tingginya dengan Mini Player */
        .header-top-bar {
          position: absolute;
          top: 12px;
          left: 12px;
          right: 16px;
          display: flex;
          align-items: center;
          justify-content: space-between;
          z-index: 1005;
          pointer-events: none;
        }

        .header-top-bar > * {
          pointer-events: auto;
        }

        .hud-btn {
          height: 40px;
          display: flex;
          align-items: center;
          justify-content: center;
          padding: 0 16px;
          background: var(--card-bg, rgba(15, 23, 42, 0.9));
          border: 1px solid var(--accent, #00f0ff);
          border-radius: 12px;
          font-weight: 800;
          font-size: 0.75rem;
          cursor: pointer;
          color: var(--accent, #00f0ff);
          text-transform: uppercase;
          box-shadow: 0 0 10px var(--accent-glow, rgba(0, 240, 255, 0.2));
          transition: all 0.3s;
        }

        .hud-btn:active {
          transform: scale(0.95);
        }

        /* Slot MP3 Player Dinamis */
        .mp3-player-container {
          display: flex;
          align-items: center;
        }

        /* Control Panel Center: TARGET LOCK */
        #control-panel {
          position: absolute;
          top: 50%;
          left: 50%;
          transform: translate(-50%, -50%);
          display: flex;
          align-items: center;
          justify-content: center;
          z-index: 998;
        }

        /* TARGET LOCK Slot */
        #target-pill { 
          width: ${CARD_W}px; 
          height: ${CARD_H}px; 
          border-radius: 12px; 
          background: var(--card-bg, rgba(15, 23, 42, 0.9)); 
          border: 2px dashed var(--accent, #00f0ff); 
          display: flex; 
          align-items: center; 
          justify-content: center; 
          color: var(--accent, #00f0ff); 
          font-weight: 900; 
          font-size: 0.75rem; 
          pointer-events: none; 
          text-align: center; 
          letter-spacing: 1px; 
          padding: 8px;
          transition: all 0.25s ease; 
          box-shadow: inset 0 0 15px rgba(0, 240, 255, 0.15);
        }
        .target-glow { 
          background: color-mix(in srgb, var(--accent, #00f0ff) 35%, transparent) !important; 
          border-style: solid !important; 
          box-shadow: 0 0 30px var(--accent-glow, #00f0ff), inset 0 0 20px var(--accent, #00f0ff) !important; 
          transform: scale(1.06); 
          color: #fff !important; 
        }

        /* RPG Character Card Base */
        .character-card { 
          position: absolute; 
          left: 0; 
          top: 0; 
          width: ${CARD_W}px; 
          height: ${CARD_H}px; 
          cursor: grab; 
          user-select: none; 
          z-index: 10; 
          touch-action: none; 
          perspective: 1000px;
        }
        .character-card:active { cursor: grabbing; }

        /* Pembungkus Dalam Kartu */
        .card-inner {
          width: 100%;
          height: 100%;
          border-radius: 12px;
          background: var(--card-bg, rgba(15, 23, 42, 0.92));
          border: 1.5px solid var(--card-border, rgba(255, 255, 255, 0.15));
          position: relative;
          transform-style: preserve-3d;
          transform-origin: center center;
          transition: border-color 0.3s, box-shadow 0.3s, transform 0.3s;
        }

        /* Animasi Rotasi 3D 360° + Glow Hanya Saat Kartu Dipilih/Deploy */
        @keyframes rotateYCard {
          0% { transform: rotateY(0deg); }
          100% { transform: rotateY(360deg); }
        }
        .card-active-deploy {
          border: 2px solid var(--card-color, var(--accent, #00f0ff)) !important;
          box-shadow: 0 0 20px var(--card-color, var(--accent, #00f0ff)), inset 0 0 10px var(--card-color, var(--accent, #00f0ff)) !important;
          animation: rotateYCard 1.4s cubic-bezier(0.4, 0, 0.2, 1) infinite;
        }

        /* Sisi Depan dan Sisi Belakang Kartu */
        .card-front, .card-back {
          position: absolute;
          top: 0;
          left: 0;
          width: 100%;
          height: 100%;
          backface-visibility: hidden;
          -webkit-backface-visibility: hidden;
          display: flex;
          flex-direction: column;
          border-radius: 10px;
          overflow: hidden;
        }

        .card-front {
          transform: rotateY(0deg);
        }

        .card-back {
          transform: rotateY(180deg);
        }

        /* Container Gambar Pas Mobile */
        .card-img-container { width: 100%; height: 92px; background: radial-gradient(circle at center, rgba(30, 41, 59, 0.8), rgba(15, 23, 42, 0.95)); display: flex; align-items: center; justify-content: center; border-bottom: 1px solid var(--card-border, rgba(255, 255, 255, 0.1)); overflow: hidden; padding: 2px; }
        .card-img { width: 100%; height: 100%; object-fit: contain; object-position: center bottom; filter: drop-shadow(0 2px 4px rgba(0,0,0,0.5)); }

        .card-info { padding: 4px 6px; display: flex; flex-direction: column; justify-content: space-between; flex: 1; background: linear-gradient(180deg, rgba(0,0,0,0.4) 0%, rgba(0,0,0,0.9) 100%); }
        .card-title { font-size: 0.62rem; font-weight: 800; color: #fff; line-height: 1.1; }
        .card-hp-bar { width: 100%; height: 4px; background: #334155; border-radius: 2px; overflow: hidden; margin-top: 3px; }
        .card-hp-fill { height: 100%; border-radius: 2px; background-color: var(--card-color, var(--accent, #00f0ff)); transition: background-color 0.3s; }

        /* Pop-Up Modal Base */
        .modal-backdrop { display: none; position: fixed; top: 0; left: 0; width: 100%; height: 100dvh; background: rgba(0, 0, 0, 0.85); backdrop-filter: blur(10px); z-index: 2000; align-items: center; justify-content: center; }
        .modal-backdrop.open { display: flex; }

        #modal-card { width: 85%; max-width: 320px; padding: 20px; background: var(--card-bg, #0f172a); border-radius: 16px; border: 1px solid var(--accent, #00f0ff); color: var(--foreground, #fff); }

        /* Big Preview Modal Card */
        #preview-modal-card {
          width: 90%;
          max-width: 380px;
          padding: 20px;
          background: var(--card-bg, #0f172a);
          border-radius: 24px;
          border: 2px solid var(--accent, #00f0ff);
          color: var(--foreground, #fff);
          box-shadow: 0 10px 40px rgba(0, 0, 0, 0.8), 0 0 25px var(--accent-glow, rgba(0, 240, 255, 0.3));
          text-align: center;
          display: flex;
          flex-direction: column;
          align-items: center;
        }

        .preview-iframe-wrapper {
          width: 100%;
          height: 240px;
          background: #090d16;
          border-radius: 16px;
          overflow: hidden;
          margin-bottom: 12px;
          border: 1px solid var(--card-border, rgba(255, 255, 255, 0.15));
          position: relative;
          display: flex;
          align-items: center;
          justify-content: center;
        }

        .preview-snapshot-img {
          width: 100%;
          height: 100%;
          object-fit: cover;
          object-position: top center;
        }

        .preview-capsule-btn {
          width: 100%;
          padding: 12px 20px;
          border-radius: 45px;
          font-weight: 800;
          font-size: 0.85rem;
          text-align: center;
          cursor: pointer;
          transition: all 0.25s ease;
          display: flex;
          align-items: center;
          justify-content: center;
          text-decoration: none;
          user-select: none;
        }

        .preview-capsule-btn.primary {
          background: var(--accent, #00f0ff);
          color: #020617;
          box-shadow: 0 4px 18px var(--accent-glow, rgba(0, 240, 255, 0.4));
          border: none;
        }

        .preview-capsule-btn.primary:active {
          transform: scale(0.96);
          opacity: 0.9;
        }

        .preview-capsule-btn.secondary {
          background: rgba(255, 255, 255, 0.1);
          color: var(--foreground, #ffffff);
          border: 1px solid var(--card-border, rgba(255, 255, 255, 0.2));
        }

        .preview-capsule-btn.secondary:active {
          transform: scale(0.96);
          background: rgba(255, 255, 255, 0.18);
        }
      `,
        }}
      />

      <canvas ref={canvasRef} id="fx-canvas" />

      {/* Header Top Bar: MP3 Player (Kiri) & INFO (Kanan Sejajar) */}
      <div className="header-top-bar">
        <div id="mp3-player-container" className="mp3-player-container">
          <GlobalMiniPlayer />
        </div>
        <div className="hud-btn" onClick={() => setModalOpen(true)}>
          INFO
        </div>
      </div>

      {/* Control Panel Tengah: TARGET LOCK */}
      <div id="control-panel">
        <div ref={targetRef} id="target-pill" className={targetGlow ? "target-glow" : ""}>
          <span>{targetText}</span>
        </div>
      </div>

      {/* 8 Kartu Karakter Dalam Grid Terkunci */}
      {LINKS.map((link, idx) => {
        const renderCardContent = () => (
          <>
            <div className="card-img-container">
              <img src={link.image} alt={link.label} className="card-img" />
            </div>
            <div className="card-info">
              <span className="card-title truncate">{link.label}</span>
              <div>
                <div className="w-full text-[8.5px] font-bold text-gray-300">
                  <span
                    className="block truncate font-mono w-full"
                    style={{ color: "var(--card-color, var(--accent, #38bdf8))" }}
                    title={link.displayUrl}
                  >
                    {link.displayUrl}
                  </span>
                </div>
                <div className="card-hp-bar">
                  <div className="card-hp-fill" style={{ width: "100%" }} />
                </div>
              </div>
            </div>
          </>
        );

        return (
          <div
            key={link.label}
            className="character-card"
            ref={(el) => {
              const c = cardRefs.current[idx];
              if (c) c.el = el;
            }}
            onMouseDown={(e) => onCardPointerDown(e, idx)}
            onTouchStart={(e) => onCardPointerDown(e, idx)}
          >
            <div
              className={`card-inner ${
                activeCardIdx === idx ? "card-active-deploy" : ""
              }`}
            >
              <div className="card-front">{renderCardContent()}</div>
              <div className="card-back">{renderCardContent()}</div>
            </div>
          </div>
        );
      })}

      {/* Modal Info Bantuan */}
      <div id="modal" className={`modal-backdrop ${modalOpen ? "open" : ""}`}>
        <div id="modal-card">
          <h3 className="font-extrabold text-base mb-2" style={{ color: "var(--accent, #00f0ff)" }}>
            BANTUAN GAME UI
          </h3>
          <ul className="space-y-2 text-xs opacity-90">
            <li>
              • <b>Drag Kartu Karakter</b> ke slot <b>TARGET LOCK</b> untuk melihat antarmuka link secara langsung.
            </li>
            <li>
              • <b>8 Kartu Terkunci Presisi</b> dalam susunan grid simetris.
            </li>
            <li>
              • Kartu yang dipilih akan <b>menyala glow & berputar 3D</b> secara khusus saat di-deploy.
            </li>
          </ul>
          <button
            className="mt-4 w-full py-2 font-black rounded-lg text-xs uppercase cursor-pointer"
            style={{
              backgroundColor: "var(--accent, #00f0ff)",
              color: "var(--background, #000000)",
            }}
            onClick={() => setModalOpen(false)}
          >
            TUTUP
          </button>
        </div>
      </div>

      {/* Pop-Up Preview Besar Memuat Live Web Preview Snapshot */}
      <div id="preview-modal" className={`modal-backdrop ${previewModalOpen ? "open" : ""}`}>
        {selectedLink && (
          <div id="preview-modal-card">
            <span
              className="text-[10px] font-extrabold uppercase tracking-widest px-3 py-1 rounded-full mb-3"
              style={{
                backgroundColor: "color-mix(in srgb, var(--accent, #00f0ff) 20%, transparent)",
                color: "var(--accent, #00f0ff)",
                border: "1px solid var(--accent, #00f0ff)",
              }}
            >
              PREVIEW TARGET LINK
            </span>

            {/* Area Live View / Iframe Tanpa Touch (Khusus .my.id dan .fun) */}
            <div className="preview-iframe-wrapper">
              {isLiveIframeDomain ? (
                <iframe
                  src={selectedLink.url}
                  title={selectedLink.label}
                  className="w-full h-full border-0 pointer-events-none select-none"
                />
              ) : !iframeError ? (
                <img
                  src={`https://image.thum.io/get/width/600/crop/800/${selectedLink.url}`}
                  alt={selectedLink.label}
                  className="preview-snapshot-img"
                  onError={() => setIframeError(true)}
                />
              ) : (
                <div className="w-full h-full flex flex-col items-center justify-center p-4">
                  <img
                    src={selectedLink.image}
                    alt={selectedLink.label}
                    className="h-32 object-contain drop-shadow-md mb-2"
                  />
                  <span className="text-xs text-slate-400 font-mono">Interface Loaded</span>
                </div>
              )}
            </div>

            <h2 className="text-base font-black text-white mb-0.5">{selectedLink.label}</h2>

            <p
              className="text-[11px] font-mono mb-4 truncate w-full"
              style={{ color: "var(--accent, #00f0ff)" }}
            >
              {selectedLink.url}
            </p>

            <div className="flex flex-col gap-2.5 w-full">
              <a
                href={selectedLink.url}
                target="_blank"
                rel="noreferrer"
                onClick={() => {
                  // Kembalikan kartu ke posisi semula dalam grid saat menuju link
                  handleCancel();
                }}
                className="preview-capsule-btn primary"
              >
                Menuju Link
              </a>
              <button onClick={handleCancel} className="preview-capsule-btn secondary">
                Cancel
              </button>
            </div>
          </div>
        )}
      </div>

      <BottomNav />
    </div>
  );
}