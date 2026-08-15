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
  color: string;
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
    label: "ipix.my.id",
    url: "https://ipix.my.id",
    displayUrl: "ipix.my.id",
    image: "/tentang/06.webp",
    color: "#A855F7",
  },
   {
    label: "sukachub.my.id",
    url: "https://sukachub.my.id",
    displayUrl: "sukachub.my.id",
    image: "/tentang/02.webp",
    color: "#E5FF00",
  },
  {
    label: "ipixchat.my.id",
    url: "https://ipixchat.my.id",
    displayUrl: "ipixchat.my.id",
    image: "/tentang/01.webp",
    color: "#FF5500",
  },
  {
    label: "Growlr@pix",
    url: "https://growlrapp.com",
    displayUrl: "growlrapp.com",
    image: "/tentang/07.webp",
    color: "#9b6c48", // COKLAT
  },
  {
    label: "iPix.Fun",
    url: "https://ipix.fun",
    displayUrl: "ipix.fun",
    image: "/tentang/08.webp",
    color: "#078b3c", // HIJAU
  },
{
    label: "TikTok@ipixaja",
    url: "https://www.tiktok.com/@ipixaja",
    displayUrl: "tiktok.com/@ipixaja",
    image: "/tentang/05.webp",
    color: "#f71e54",
  },
    {
    label: "Walla@pix",
    url: "https://international.walla-app.com/user?id=V2O6MN&app=2",
    displayUrl: "walla-app.com",
    image: "/tentang/04.webp",
    color: "#00E5FF", // CYAN
  },
  {
    label: "X@sixripix",
    url: "https://www.x.com/sixripix",
    displayUrl: "x.com/sixripix",
    image: "/tentang/03.webp",
    color: "#979797", // ABU-ABU
  },
];

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
      color: link.color,
    }))
  );

  const activeCardRef = useRef<CardRef | null>(null);
  const deployedCardRef = useRef<CardRef | null>(null);
  const origPosRef = useRef<{ x: number; y: number } | null>(null);
  const dragStartPosRef = useRef<{ x: number; y: number }>({ x: 0, y: 0 });
  const offsetRef = useRef<{ x: number; y: number }>({ x: 0, y: 0 });

  const pointerStartRef = useRef<{ x: number; y: number }>({ x: 0, y: 0 });
  const hasMovedRef = useRef<boolean>(false);

  // ---------- State ----------
  const [modalOpen, setModalOpen] = useState(false);
  const [previewModalOpen, setPreviewModalOpen] = useState(false);
  const [slashModalOpen, setSlashModalOpen] = useState(false);
  const [slashCard, setSlashCard] = useState<LinkItem | null>(null);

  const [selectedLink, setSelectedLink] = useState<LinkItem | null>(null);
  const [iframeError, setIframeError] = useState(false);

  const [targetText, setTargetText] = useState("TARGET LINK");
  const [targetGlow, setTargetGlow] = useState(false);
  const [activeCardIdx, setActiveCardIdx] = useState<number | null>(null);
  const [isInitialized, setIsInitialized] = useState(false);

  // ---------- Helper: Bounds ----------
  const getBounds = useCallback(() => {
    const headerGroup = document.querySelector(".header-top-bar") as HTMLElement | null;
    const tgt = targetRef.current;
    const container = containerRef.current;

    const hRect = headerGroup?.getBoundingClientRect() ?? new DOMRect();
    const tRect = tgt?.getBoundingClientRect() ?? new DOMRect();
    const cRect = container?.getBoundingClientRect() ?? new DOMRect();

    const containerWidth = container ? container.clientWidth : 800;
    const containerHeight = container ? container.clientHeight : 800;

    const tgtCenterX = tRect.width > 0 
      ? (tRect.left - cRect.left + tRect.width / 2) 
      : (containerWidth / 2);
    const tgtCenterY = tRect.height > 0 
      ? (tRect.top - cRect.top + tRect.height / 2) 
      : (containerHeight / 2);

    return {
      topOffset: Math.max(hRect.bottom - cRect.top + 10, 60),
      tgtTop: tRect.top - cRect.top,
      tgtBottom: tRect.bottom - cRect.top,
      tgtCenterX,
      tgtCenterY,
      containerWidth,
      containerHeight,
      bottomLimit: containerHeight - BOTTOM_NAV_HEIGHT,
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

    // Row 2 (Tengah - 2 Kartu)
    if (cardRefs.current[3]) { cardRefs.current[3].x = col1X; cardRefs.current[3].y = midY; }
    if (cardRefs.current[4]) { cardRefs.current[4].x = col3X; cardRefs.current[4].y = midY; }

    // Row 3 (Bawah - 3 Kartu)
    if (cardRefs.current[5]) { cardRefs.current[5].x = col1X; cardRefs.current[5].y = botY; }
    if (cardRefs.current[6]) { cardRefs.current[6].x = col2X; cardRefs.current[6].y = botY; }
    if (cardRefs.current[7]) { cardRefs.current[7].x = col3X; cardRefs.current[7].y = botY; }

    cardRefs.current.forEach((c) => applyCardStyle(c));
  }, [getBounds, applyCardStyle]);

  // ---------- Animasi Kocok / Shuffle Kartu ----------
  const triggerShuffleAnimation = useCallback(() => {
    const { tgtCenterX, tgtCenterY } = getBounds();
    const cx = tgtCenterX - CARD_W / 2;
    const cy = tgtCenterY - CARD_H / 2;

    cardRefs.current.forEach((c, idx) => {
      if (!c.el) return;

      c.el.style.setProperty("--cx", `${cx}px`);
      c.el.style.setProperty("--cy", `${cy}px`);
      c.el.style.setProperty("--tx", `${c.x}px`);
      c.el.style.setProperty("--ty", `${c.y}px`);

      c.el.style.animation = "none";
      const innerEl = c.el.querySelector(".card-inner") as HTMLElement | null;
      if (innerEl) innerEl.style.animation = "none";

      void c.el.offsetHeight; // Force Reflow

      const delay = idx * 90;
      c.el.style.animation = `shuffleDeal 0.65s cubic-bezier(0.34, 1.45, 0.64, 1) ${delay}ms both`;
      if (innerEl) {
        innerEl.style.animation = `cardSpin3D 0.65s ease-in-out ${delay}ms both`;
      }
    });

    const totalTime = LINKS.length * 90 + 700;
    setTimeout(() => {
      cardRefs.current.forEach((c) => {
        if (!c.el) return;
        c.el.style.animation = "";
        const innerEl = c.el.querySelector(".card-inner") as HTMLElement | null;
        if (innerEl) innerEl.style.animation = "";
        applyCardStyle(c);
      });
    }, totalTime);
  }, [getBounds, applyCardStyle]);

  useEffect(() => {
    if (mounted) {
      requestAnimationFrame(() => {
        lockCardPositions();
        triggerShuffleAnimation();
        setIsInitialized(true);
      });
    }
  }, [mounted, lockCardPositions, triggerShuffleAnimation]);

  // ---------- Canvas Drawing ----------
  const drawConnections = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    ctx.clearRect(0, 0, canvas.width, canvas.height);
  }, []);

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

  // ---------- Drag & Click Handlers ----------
  const startDrag = useCallback((obj: CardRef, idx: number, clientX: number, clientY: number) => {
    const container = containerRef.current;
    if (!container) return;
    const cRect = container.getBoundingClientRect();

    activeCardRef.current = obj;
    setActiveCardIdx(idx);
    dragStartPosRef.current = { x: obj.x, y: obj.y };

    pointerStartRef.current = { x: clientX, y: clientY };
    hasMovedRef.current = false;

    setTargetText(`MENUJU: ${obj.label}`);

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

    if (obj.el) {
      obj.el.style.animation = "";
      const innerEl = obj.el.querySelector(".card-inner") as HTMLElement | null;
      if (innerEl) innerEl.style.animation = "";
    }

    const clientX = "touches" in e ? e.touches[0].clientX : (e as ReactMouseEvent).clientX;
    const clientY = "touches" in e ? e.touches[0].clientY : (e as ReactMouseEvent).clientY;
    startDrag(obj, idx, clientX, clientY);
  };

  const endDrag = useCallback(() => {
    const active = activeCardRef.current;
    if (!active) return;

    // Jika pengguna hanya menekan (klik 1x) tanpa menggeser kartu
    if (!hasMovedRef.current) {
      const clickedItem = LINKS.find((l) => l.url === active.url) || {
        label: active.label,
        url: active.url,
        displayUrl: active.displayUrl,
        image: active.image,
        color: active.color,
      };

      // Reset kartu ke posisi asal
      active.x = dragStartPosRef.current.x;
      active.y = dragStartPosRef.current.y;
      applyCardStyle(active);

      activeCardRef.current = null;
      setActiveCardIdx(null);
      setTargetText("TARGET LINK");
      setTargetGlow(false);

      // Buka Animasi Cut-In
      setSlashCard(clickedItem);
      setSlashModalOpen(true);
      return;
    }

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
          color: active.color,
        };
        setSelectedLink(item);
        setIframeError(false);
        setPreviewModalOpen(true);
      } else {
        active.x = dragStartPosRef.current.x;
        active.y = dragStartPosRef.current.y;
        applyCardStyle(active);
        setActiveCardIdx(null);
      }
    }
    activeCardRef.current = null;
    setTargetText("TARGET LINK");
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
    setActiveCardIdx(null);
    setPreviewModalOpen(false);
  }, [applyCardStyle]);

  const moveCard = useCallback(
    (clientX: number, clientY: number) => {
      const active = activeCardRef.current;
      const container = containerRef.current;
      if (!active || !container) return;

      const dist = Math.hypot(
        clientX - pointerStartRef.current.x,
        clientY - pointerStartRef.current.y
      );
      if (dist > 6) {
        hasMovedRef.current = true;
      }

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
          height: 32px;
          display: flex;
          align-items: center;
          justify-content: center;
          padding: 0 10px;
          background: var(--card-bg, rgba(15, 23, 42, 0.9));
          border: 1px solid var(--accent, #00f0ff);
          border-radius: 10px;
          font-weight: 800;
          font-size: 0.65rem;
          cursor: pointer;
          color: var(--accent, #00f0ff);
          text-transform: uppercase;
          box-shadow: 0 0 10px var(--accent-glow, rgba(0, 240, 255, 0.2));
          transition: all 0.3s;
          pointer-events: auto;
        }

        .hud-btn:active {
          transform: scale(0.95);
        }

        .mp3-player-container {
          display: flex;
          align-items: center;
        }

        #control-panel {
          position: absolute;
          top: 50%;
          left: 50%;
          transform: translate(-50%, -50%);
          display: flex;
          align-items: center;
          justify-content: center;
          z-index: 998;
          pointer-events: none;
        }

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

        .character-card { 
          position: absolute; 
          left: 0; 
          top: 0; 
          width: ${CARD_W}px; 
          height: ${CARD_H}px; 
          cursor: grab; 
          user-select: none; 
          touch-action: none; 
          perspective: 1000px;
          transition: z-index 0.2s ease, opacity 0.15s ease;
        }
        .character-card:active { cursor: grabbing; }

        .card-inner {
          width: 100%;
          height: 100%;
          border-radius: 12px;
          background: var(--card-bg, rgba(15, 23, 42, 0.92));
          border: 1.5px solid var(--card-border, rgba(255, 255, 255, 0.15));
          position: relative;
          transform-style: preserve-3d;
          transform-origin: center center;
          transition: border-color 0.3s, box-shadow 0.3s, transform 0.25s cubic-bezier(0.4, 0, 0.2, 1);
        }

        /* Animasi Rotasi 3D Bergantian Satu-Satu */
        @keyframes autoFlipSequential {
          0% {
            transform: rotateY(0deg);
          }
          4% {
            transform: rotateY(180deg) scale(1.08);
          }
          8% {
            transform: rotateY(360deg) scale(1);
          }
          100% {
            transform: rotateY(360deg);
          }
        }

        .card-auto-flip {
          animation: autoFlipSequential 16s cubic-bezier(0.4, 0, 0.2, 1) infinite;
          animation-delay: var(--flip-delay, 0s);
        }

        @keyframes shuffleDeal {
          0% {
            transform: translate3d(var(--cx), var(--cy), 0) scale(0.2) rotate(-20deg);
            opacity: 0;
          }
          45% {
            transform: translate3d(var(--cx), var(--cy), 0) scale(1.15) rotate(12deg);
            opacity: 1;
          }
          100% {
            transform: translate3d(var(--tx), var(--ty), 0) scale(1) rotate(0deg);
            opacity: 1;
          }
        }

        @keyframes cardSpin3D {
          0% {
            transform: rotateY(0deg);
          }
          50% {
            transform: rotateY(180deg) scale(1.1);
          }
          100% {
            transform: rotateY(360deg) scale(1);
          }
        }

        @keyframes rotateYCard {
          0% { transform: scale(1.1) rotateY(0deg); }
          100% { transform: scale(1.1) rotateY(360deg); }
        }
        .card-active-deploy {
          border: 2px solid var(--card-color, #00f0ff) !important;
          box-shadow: 0 0 20px var(--card-color, #00f0ff), inset 0 0 10px var(--card-color, #00f0ff) !important;
          animation: rotateYCard 1.4s cubic-bezier(0.4, 0, 0.2, 1) infinite !important;
        }

        .card-at-target {
          animation: none !important;
          transform: scale(1) rotateY(0deg) !important;
        }

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

        .card-img-container { width: 100%; height: 92px; background: radial-gradient(circle at center, rgba(30, 41, 59, 0.8), rgba(15, 23, 42, 0.95)); display: flex; align-items: center; justify-content: center; border-bottom: 1px solid var(--card-border, rgba(255, 255, 255, 0.1)); overflow: hidden; padding: 2px; }
        .card-img { width: 100%; height: 100%; object-fit: contain; object-position: center bottom; filter: drop-shadow(0 2px 4px rgba(0,0,0,0.5)); }

        .card-info { padding: 4px 6px; display: flex; flex-direction: column; justify-content: space-between; flex: 1; background: linear-gradient(180deg, rgba(0,0,0,0.4) 0%, rgba(0,0,0,0.9) 100%); }
        .card-title { font-size: 0.62rem; font-weight: 800; color: #fff; line-height: 1.1; }
        .card-hp-bar { width: 100%; height: 4px; background: #334155; border-radius: 2px; overflow: hidden; margin-top: 3px; }
        .card-hp-fill { height: 100%; border-radius: 2px; transition: background-color 0.3s; }

        .modal-backdrop { display: none; position: fixed; top: 0; left: 0; width: 100%; height: 100dvh; background: rgba(0, 0, 0, 0.85); backdrop-filter: blur(10px); z-index: 2000; align-items: center; justify-content: center; }
        .modal-backdrop.open { display: flex; }

        #modal-card { width: 85%; max-width: 320px; padding: 20px; background: var(--card-bg, #0f172a); border-radius: 16px; border: 1px solid var(--accent, #00f0ff); color: var(--foreground, #fff); }

        /* =========================================
           ANIMASI CUT-IN MODAL
           ========================================= */
        @keyframes slashBackdropIn {
          0% { opacity: 0; backdrop-filter: blur(0px); }
          100% { opacity: 1; backdrop-filter: blur(12px); }
        }

        @keyframes slashCharIn {
          0% {
            transform: translateY(80px) scale(0.5) rotate(-10deg);
            opacity: 0;
          }
          65% {
            transform: translateY(-12px) scale(1.08) rotate(3deg);
            opacity: 1;
          }
          100% {
            transform: translateY(0) scale(1) rotate(0deg);
            opacity: 1;
          }
        }

        @keyframes slashTextIn {
          0% {
            transform: translateX(-120px) skewX(-14deg) scale(0.7);
            opacity: 0;
          }
          70% {
            transform: translateX(12px) skewX(-14deg) scale(1.08);
            opacity: 1;
          }
          100% {
            transform: translateX(0) skewX(-14deg) scale(1);
            opacity: 1;
          }
        }

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

      {/* Header Top Bar */}
      <div className="header-top-bar">
        <div id="mp3-player-container" className="mp3-player-container">
          <GlobalMiniPlayer />
        </div>
        <div className="flex items-center gap-1.5">
          <button
            className="hud-btn"
            onClick={triggerShuffleAnimation}
          >
            KOCOK KARTU
          </button>
          <div className="hud-btn" onClick={() => setModalOpen(true)}>
            INFO
          </div>
        </div>
      </div>

      {/* Control Panel Tengah */}
      <div id="control-panel">
        <div ref={targetRef} id="target-pill" className={targetGlow ? "target-glow" : ""}>
          <span>{targetText}</span>
        </div>
      </div>

      {/* 8 Kartu Karakter */}
      {LINKS.map((link, idx) => {
        const renderCardContent = () => (
          <>
            <div className="card-img-container">
              <img src={link.image} alt={link.label} className="card-img" />
            </div>
            <div className="card-info">
              <span className="card-title truncate">{link.label}</span>
              <div>
                <div className="w-full text-[8.5px] font-bold">
                  <span
                    className="block truncate font-mono w-full"
                    style={{ color: link.color }}
                    title={link.displayUrl}
                  >
                    {link.displayUrl}
                  </span>
                </div>
                <div className="card-hp-bar">
                  <div
                    className="card-hp-fill"
                    style={{ width: "100%", backgroundColor: link.color }}
                  />
                </div>
              </div>
            </div>
          </>
        );

        const isSelected = activeCardIdx === idx;
        const flipDelay = `${idx * 2}s`;

        return (
          <div
            key={link.label}
            className="character-card"
            style={{
              zIndex: isSelected ? 50 : 10,
              visibility: isInitialized ? "visible" : "hidden",
              opacity: isInitialized ? 1 : 0,
            }}
            ref={(el) => {
              const c = cardRefs.current[idx];
              if (c) c.el = el;
            }}
            onMouseDown={(e) => onCardPointerDown(e, idx)}
            onTouchStart={(e) => onCardPointerDown(e, idx)}
          >
            <div
              className={`card-inner ${
                isSelected ? "card-active-deploy" : "card-auto-flip"
              } ${isSelected && targetGlow ? "card-at-target" : ""}`}
              style={
                {
                  "--flip-delay": flipDelay,
                } as CSSProperties
              }
            >
              <div className="card-front">{renderCardContent()}</div>
              <div className="card-back">{renderCardContent()}</div>
            </div>
          </div>
        );
      })}

      {/* Pop-Up Animasi Cut-In (Tanpa Background Slash Ribbon, Kotak Miring Pasif Dimunculkan Kembali) */}
      {slashModalOpen && slashCard && (
        <div 
          className="modal-backdrop open flex flex-col items-center justify-center p-4 z-[3000]"
          onClick={() => setSlashModalOpen(false)}
          style={{ animation: "slashBackdropIn 0.3s forwards" }}
        >
          <div 
            className="relative w-full max-w-sm flex flex-col items-center justify-center pointer-events-auto"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Area Cut-In Transparan */}
            <div className="relative w-full h-[430px] flex items-center justify-center overflow-hidden">
              
              {/* Karakter Pop-Out Miring */}
              <div 
                className="relative z-10 w-full h-[280px] flex items-center justify-center pointer-events-none"
                style={{ animation: "slashCharIn 0.5s cubic-bezier(0.34, 1.56, 0.64, 1) forwards" }}
              >
                <img 
                  src={slashCard.image} 
                  alt={slashCard.label}
                  className="h-full object-contain filter drop-shadow-[0_15px_30px_rgba(0,0,0,0.85)]"
                />
              </div>

              {/* Kotak Miring Pasif Pembungkus Link */}
              <div 
                className="absolute bottom-6 z-20 flex flex-col items-center justify-center text-center px-4 w-full pointer-events-none select-none"
                style={{ animation: "slashTextIn 0.55s cubic-bezier(0.34, 1.56, 0.64, 1) 0.1s both" }}
              >
                <div 
                  className="transform -skew-x-12 -rotate-2 bg-slate-950/90 px-7 py-3 rounded-2xl border-2 shadow-[0_10px_35px_rgba(0,0,0,0.95)]"
                  style={{ borderColor: slashCard.color }}
                >
                  <h2 className="text-xl font-black uppercase tracking-wider text-white drop-shadow-[0_2px_4px_rgba(0,0,0,1)] italic">
                    {slashCard.label}
                  </h2>
                  <p 
                    className="text-xs font-mono font-extrabold tracking-widest mt-0.5 truncate max-w-[240px]"
                    style={{ color: slashCard.color }}
                  >
                    {slashCard.displayUrl}
                  </p>
                </div>
              </div>
            </div>

            {/* Tombol TUTUP Mengikuti Warna Kartu */}
            <div className="w-full mt-3 z-30">
              <button
                onClick={() => setSlashModalOpen(false)}
                className="w-full py-3 px-6 rounded-full font-black text-xs uppercase tracking-wider transition active:scale-95 cursor-pointer shadow-xl border border-white/20"
                style={{
                  backgroundColor: slashCard.color,
                  color: "#000000",
                  boxShadow: `0 4px 20px ${slashCard.color}80`
                }}
              >
                TUTUP
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal Bantuan */}
      <div id="modal" className={`modal-backdrop ${modalOpen ? "open" : ""}`}>
        <div id="modal-card">
          <h3 className="font-extrabold text-base mb-2" style={{ color: "var(--accent, #00f0ff)" }}>
            BANTUAN GAME UI
          </h3>
          <ul className="space-y-2 text-xs opacity-90">
            <li>
              • <b>Klik 1x pada Kartu</b> untuk menampilkan animasi slash miring dinamis.
            </li>
            <li>
              • <b>Drag Kartu Karakter</b> ke slot <b>TARGET LINK</b> untuk melihat antarmuka link secara langsung.
            </li>
            <li>
              • Kartu yang digeser akan <b>membesar & berputar 3D</b> di posisi paling atas.
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

      {/* Pop-Up Preview Modal */}
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
              style={{ color: selectedLink.color }}
            >
              {selectedLink.url}
            </p>

            <div className="flex flex-col gap-2.5 w-full">
              <a
                href={selectedLink.url}
                target="_blank"
                rel="noreferrer"
                onClick={() => {
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