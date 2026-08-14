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
import BottomNav from "../../components/bottomnav"; // Sesuaikan path
import { useTheme } from "../context/ThemeContext"; // Sesuaikan path

/* =========================
   Types
   ========================= */
interface LinkItem {
  label: string;
  url: string;
  displayUrl: string; // Teks Link Asli Full
  image: string; // Gambar .webp
}

interface CardRef {
  el: HTMLDivElement | null;
  x: number;
  y: number;
  vx: number;
  vy: number;
  url: string;
  displayUrl: string;
  label: string;
  image: string;
  color: string;
}

type AppState = "moving" | "aligned";

/* =========================
   Constants & Theme Helpers
   ========================= */
const LINKS: LinkItem[] = [
  {
    label: "X@sixripix",
    url: "https://www.x.com/sixripix",
    displayUrl: "x.com/sixripix",
    image: "/0.webp",
  },
  {
    label: "Walla@pix",
    url: "https://international.walla-app.com/user?id=V2O6MN&app=2",
    displayUrl: "walla-app.com",
    image: "/1.webp",
  },
  {
    label: "TikTok@ipixaja",
    url: "https://www.tiktok.com/@ipixaja",
    displayUrl: "tiktok.com/@ipixaja",
    image: "/2.webp",
  },
  {
    label: "ipix.my.id",
    url: "https://ipix.my.id",
    displayUrl: "ipix.my.id",
    image: "/3.webp",
  },
  {
    label: "iPix.Fun",
    url: "https://ipix.fun",
    displayUrl: "ipix.fun",
    image: "/0.webp",
  },
  {
    label: "Growlr@pix",
    url: "https://growlrapp.com",
    displayUrl: "growlrapp.com",
    image: "/4.webp",
  },
];

// Helper: Preset Palette untuk 10 Tema & Custom
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

// Dimensi Kartu Karakter
const CARD_W = 105;
const CARD_H = 152;
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
      x: -500,
      y: -500,
      vx: 0,
      vy: 0,
      url: link.url,
      displayUrl: link.displayUrl,
      label: link.label,
      image: link.image,
      color: "#00f0ff",
    }))
  );

  const activeCardRef = useRef<CardRef | null>(null);
  const offsetRef = useRef<{ x: number; y: number }>({ x: 0, y: 0 });
  const isPausedRef = useRef<boolean>(false);
  const appStateRef = useRef<AppState>("moving");

  // ---------- State ----------
  const [modalOpen, setModalOpen] = useState(false);
  const [targetText, setTargetText] = useState("TARGET LOCK");
  const [targetGlow, setTargetGlow] = useState(false);

  // ---------- Update Color Berdasarkan Tema ----------
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
    const headerGroup = document.querySelector(".header-group") as HTMLElement | null;
    const tgt = targetRef.current;
    const container = containerRef.current;

    const hRect = headerGroup?.getBoundingClientRect() ?? new DOMRect();
    const tRect = tgt?.getBoundingClientRect() ?? new DOMRect();
    const cRect = container?.getBoundingClientRect() ?? new DOMRect();

    return {
      musicBottom: hRect.bottom - cRect.top,
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

  // ---------- Reset Positions & Colors ----------
  const resetPositions = useCallback(() => {
    appStateRef.current = "moving";
    isPausedRef.current = false;
    randomizeThemeColors();

    const { musicBottom, tgtTop, tgtBottom, containerWidth, bottomLimit } = getBounds();
    const centerX = containerWidth / 2 - CARD_W / 2;

    cardRefs.current.forEach((c, i) => {
      c.x = centerX + (Math.random() - 0.5) * 60;
      if (i < 3) {
        const topSpace = tgtTop - musicBottom;
        c.y = musicBottom + 10 + Math.random() * Math.max(0, topSpace - CARD_H - 10);
      } else {
        const botSpace = bottomLimit - tgtBottom;
        c.y = tgtBottom + 10 + Math.random() * Math.max(0, botSpace - CARD_H - 10);
      }
      c.vx = (Math.random() - 0.5) * 2.5;
      c.vy = (Math.random() - 0.5) * 2.5;
      applyCardStyle(c);
    });
  }, [getBounds, applyCardStyle, randomizeThemeColors]);

  useEffect(() => {
    if (mounted) {
      const id = requestAnimationFrame(() => resetPositions());
      return () => cancelAnimationFrame(id);
    }
  }, [mounted, resetPositions]);

  // ---------- Canvas Drawing (Laser Line Warna Tema Active) ----------
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

  // ---------- Resize Canvas ----------
  useEffect(() => {
    const resize = () => {
      const canvas = canvasRef.current;
      const container = containerRef.current;
      if (!canvas || !container) return;
      canvas.width = container.clientWidth;
      canvas.height = container.clientHeight;
    };
    window.addEventListener("resize", resize);
    resize();
    return () => window.removeEventListener("resize", resize);
  }, []);

  // ---------- Align Cards (Staggered Grid Layout) ----------
  const alignCards = useCallback(() => {
    const { musicBottom, tgtTop, tgtBottom, containerWidth, bottomLimit } = getBounds();

    const colWidth = containerWidth / 3;
    const col1X = Math.max(12, colWidth * 0.5 - CARD_W / 2);
    const col2X = colWidth * 1.5 - CARD_W / 2;
    const col3X = Math.min(containerWidth - CARD_W - 12, colWidth * 2.5 - CARD_W / 2);

    const topSpace = tgtTop - musicBottom;
    const botSpace = bottomLimit - tgtBottom;

    // --- 3 Kartu Atas ---
    if (cardRefs.current[0]) {
      cardRefs.current[0].x = col1X;
      cardRefs.current[0].y = musicBottom + Math.max(10, topSpace * 0.35);
      applyCardStyle(cardRefs.current[0]);
    }
    if (cardRefs.current[1]) {
      cardRefs.current[1].x = col2X;
      cardRefs.current[1].y = musicBottom + Math.max(5, topSpace * 0.05);
      applyCardStyle(cardRefs.current[1]);
    }
    if (cardRefs.current[2]) {
      cardRefs.current[2].x = col3X;
      cardRefs.current[2].y = musicBottom + Math.max(10, topSpace * 0.25);
      applyCardStyle(cardRefs.current[2]);
    }

    // --- 3 Kartu Bawah ---
    if (cardRefs.current[3]) {
      cardRefs.current[3].x = col1X;
      cardRefs.current[3].y = tgtBottom + Math.max(5, botSpace * 0.05);
      applyCardStyle(cardRefs.current[3]);
    }
    if (cardRefs.current[4]) {
      cardRefs.current[4].x = col2X;
      cardRefs.current[4].y = tgtBottom + Math.max(10, botSpace * 0.42);
      applyCardStyle(cardRefs.current[4]);
    }
    if (cardRefs.current[5]) {
      cardRefs.current[5].x = col3X;
      cardRefs.current[5].y = tgtBottom + Math.max(10, botSpace * 0.22);
      applyCardStyle(cardRefs.current[5]);
    }
  }, [getBounds, applyCardStyle]);

  // ---------- Drag Handlers ----------
  const startDrag = useCallback((obj: CardRef, clientX: number, clientY: number) => {
    const container = containerRef.current;
    if (!container) return;
    const cRect = container.getBoundingClientRect();

    activeCardRef.current = obj;
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
    startDrag(obj, clientX, clientY);
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
        window.open(active.url, "_blank");
      }
    }
    activeCardRef.current = null;
    setTargetText("TARGET LOCK");
    setTargetGlow(false);
  }, []);

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

  // Drag listeners
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

  // ---------- Animation Loop ----------
  useEffect(() => {
    let rafId = 0;
    const tick = () => {
      drawConnections();

      if (!isPausedRef.current) {
        const { musicBottom, tgtTop, tgtBottom, containerWidth, bottomLimit } = getBounds();

        cardRefs.current.forEach((c, i) => {
          if (c === activeCardRef.current) return;
          c.x += c.vx;
          c.y += c.vy;

          if (c.x + CARD_W >= containerWidth || c.x <= 0) c.vx *= -1;

          if (i < 3) {
            if (c.y <= musicBottom) {
              c.y = musicBottom;
              c.vy *= -1;
            }
            if (c.y + CARD_H >= tgtTop) {
              c.y = tgtTop - CARD_H;
              c.vy *= -1;
            }
          } else {
            if (c.y <= tgtBottom) {
              c.y = tgtBottom;
              c.vy *= -1;
            }
            if (c.y + CARD_H >= bottomLimit) {
              c.y = bottomLimit - CARD_H;
              c.vy *= -1;
            }
          }
          applyCardStyle(c);
        });
      }
      rafId = requestAnimationFrame(tick);
    };
    rafId = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(rafId);
  }, [drawConnections, getBounds, applyCardStyle]);

  useEffect(() => {
    const onClick = (e: MouseEvent) => {
      const target = e.target as HTMLElement | null;
      if (target?.id === "reload-btn") return;
      if (target?.closest("a, button, .character-card, .hud-btn, #modal-card, .bottom-nav")) return;

      if (appStateRef.current === "moving") {
        isPausedRef.current = true;
        alignCards();
        appStateRef.current = "aligned";
      } else {
        resetPositions();
      }
    };
    window.addEventListener("mousedown", onClick);
    return () => window.removeEventListener("mousedown", onClick);
  }, [alignCards, resetPositions]);

  if (!mounted) return null;

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

        /* HUD Header Links */
        .header-group { position: absolute; top: 12px; left: 0; width: 100%; display: flex; align-items: center; justify-content: space-between; padding: 0 16px; z-index: 1005; }
        .hud-link { padding: 6px 14px; background: var(--card-bg, rgba(15, 23, 42, 0.85)); backdrop-filter: blur(10px); border: 1px solid var(--accent, #00f0ff); border-radius: 6px; color: var(--accent, #00f0ff); text-decoration: none; font-size: 0.75rem; font-weight: 800; letter-spacing: 0.5px; box-shadow: 0 0 10px var(--accent-glow, rgba(0, 240, 255, 0.2)); transition: all 0.3s; }

        /* Control Panel / Target Slot */
        #control-panel { position: absolute; top: 50%; left: 50%; transform: translate(-50%, -50%); display: flex; align-items: center; gap: 10px; z-index: 998; }
        .hud-btn { padding: 8px 12px; background: var(--card-bg, rgba(15, 23, 42, 0.9)); border: 1px solid var(--card-border, rgba(255,255,255,0.2)); border-radius: 8px; font-weight: bold; font-size: 0.75rem; cursor: pointer; color: var(--foreground, #fff); text-transform: uppercase; transition: all 0.3s; }
        #reload-btn { border-color: #ef4444; color: #ef4444; }

        #target-pill { width: 130px; height: 50px; border-radius: 8px; background: var(--card-bg, rgba(15, 23, 42, 0.9)); border: 2px dashed var(--accent, #00f0ff); display: flex; align-items: center; justify-content: center; color: var(--accent, #00f0ff); font-weight: 900; font-size: 0.7rem; pointer-events: none; text-align: center; letter-spacing: 1px; transition: all 0.2s ease; }
        .target-glow { background: color-mix(in srgb, var(--accent, #00f0ff) 30%, transparent) !important; border-style: solid !important; box-shadow: 0 0 25px var(--accent-glow, #00f0ff); transform: scale(1.08); color: #fff !important; }

        /* RPG Character Card Style dengan Warna Tema Dynamic */
        .character-card { position: absolute; left: 0; top: 0; width: ${CARD_W}px; height: ${CARD_H}px; border-radius: 12px; background: var(--card-bg, rgba(15, 23, 42, 0.92)); border: 2px solid var(--card-color, var(--accent, #00f0ff)); overflow: hidden; display: flex; flex-direction: column; cursor: grab; user-select: none; z-index: 10; touch-action: none; box-shadow: 0 8px 20px rgba(0,0,0,0.6), 0 0 10px color-mix(in srgb, var(--card-color, #00f0ff) 40%, transparent); transition: border-color 0.3s, box-shadow 0.3s; }
        .character-card:active { cursor: grabbing; border-color: var(--accent, #00f0ff); box-shadow: 0 0 20px var(--accent-glow, rgba(0, 240, 255, 0.8)); }

        /* Container Gambar Pas Mobile */
        .card-img-container { width: 100%; height: 96px; background: radial-gradient(circle at center, rgba(30, 41, 59, 0.8), rgba(15, 23, 42, 0.95)); display: flex; align-items: center; justify-content: center; border-bottom: 1px solid var(--card-border, rgba(255, 255, 255, 0.1)); overflow: hidden; padding: 2px; }
        .card-img { width: 100%; height: 100%; object-fit: contain; object-position: center bottom; filter: drop-shadow(0 2px 4px rgba(0,0,0,0.5)); }

        .card-info { padding: 4px 6px; display: flex; flex-direction: column; justify-content: space-between; flex: 1; background: linear-gradient(180deg, rgba(0,0,0,0.4) 0%, rgba(0,0,0,0.9) 100%); }
        .card-title { font-size: 0.65rem; font-weight: 800; color: #fff; line-height: 1.1; }
        .card-hp-bar { width: 100%; height: 4px; background: #334155; border-radius: 2px; overflow: hidden; margin-top: 3px; }
        .card-hp-fill { height: 100%; border-radius: 2px; background-color: var(--card-color, var(--accent, #00f0ff)); transition: background-color 0.3s; }

        /* Modal */
        #modal { display: none; position: fixed; top: 0; left: 0; width: 100%; height: 100dvh; background: rgba(0, 0, 0, 0.8); backdrop-filter: blur(8px); z-index: 2000; align-items: center; justify-content: center; }
        #modal.open { display: flex; }
        #modal-card { width: 85%; max-width: 320px; padding: 20px; background: var(--card-bg, #0f172a); border-radius: 16px; border: 1px solid var(--accent, #00f0ff); color: var(--foreground, #fff); }
      `,
        }}
      />

      <canvas ref={canvasRef} id="fx-canvas" />

      {/* Header HUD */}
      <div className="header-group">
        <a href="https://ipixchat.my.id" className="hud-link" target="_blank" rel="noreferrer">
          IPIXCHAT.MY.ID
        </a>
        <a href="https://sukachub.my.id" className="hud-link" target="_blank" rel="noreferrer">
          SUKACHUB.MY.ID
        </a>
      </div>

      {/* Control Panel / Target Zone */}
      <div id="control-panel">
        <div className="hud-btn" onClick={() => setModalOpen(true)}>
          INFO
        </div>
        <div ref={targetRef} id="target-pill" className={targetGlow ? "target-glow" : ""}>
          {targetText}
        </div>
        <div id="reload-btn" className="hud-btn" onClick={resetPositions}>
          RESET
        </div>
      </div>

      {/* RPG Character Cards */}
      {LINKS.map((link, idx) => (
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
          {/* Gambar Karakter */}
          <div className="card-img-container">
            <img src={link.image} alt={link.label} className="card-img" />
          </div>

          <div className="card-info">
            <span className="card-title truncate">{link.label}</span>
            <div>
              <div className="w-full text-[8.5px] font-bold text-gray-300">
                {/* Full Link Teks Berwarna Sesuai Tema */}
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
        </div>
      ))}

      {/* Modal Info */}
      <div id="modal" className={modalOpen ? "open" : ""}>
        <div id="modal-card">
          <h3 className="font-extrabold text-base mb-2" style={{ color: "var(--accent, #00f0ff)" }}>
            BANTUAN GAME UI
          </h3>
          <ul className="space-y-2 text-xs opacity-90">
            <li>
              • <b>Drag Kartu Karakter</b> lalu arahkan ke kotak <b>TARGET LOCK</b> untuk membuka
              situs web.
            </li>
            <li>
              • <b>Tap/Tahan Layar Kosong</b>: Merapikan & menyusun kartu ke posisi grid selang-seling.
            </li>
            <li>
              • <b>Tombol RESET</b>: Memulai ulang pergerakan acak dan mengacak skema warna tema.
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

      <BottomNav />
    </div>
  );
}