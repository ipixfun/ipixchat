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
  icon: string;
}

interface PillRef {
  el: HTMLDivElement | null;
  x: number;
  y: number;
  vx: number;
  vy: number;
  url: string;
  label: string;
  c1: string; // Warna 1 gradient pil (HEX)
  c2: string; // Warna 2 gradient pil (HEX)
}

type AppState = "moving" | "aligned";

/* =========================
   Constants
   ========================= */
const LINKS: LinkItem[] = [
  { label: "X@sixripix", url: "https://www.x.com/sixripix", icon: "https://cdn.simpleicons.org/x/white" },
  { label: "Walla@pix", url: "https://international.walla-app.com/user?id=V2O6MN&app=2", icon: "https://cdn.simpleicons.org/chatwoot/white" },
  { label: "TikTok@ipixaja", url: "https://www.tiktok.com/@ipixaja", icon: "https://cdn.simpleicons.org/tiktok/white" },
  { label: "ipix.my.id", url: "https://ipix.my.id", icon: "https://cdn.simpleicons.org/telegram/white" },
  { label: "Growlr@pix", url: "https://growlrapp.com", icon: "https://cdn.simpleicons.org/bun/white" },
  { label: "iPix.Fun", url: "https://ipix.fun", icon: "https://cdn.simpleicons.org/facebook/white" },
];

const W = 139;
const H = 46;
const BOTTOM_NAV_HEIGHT = 70;

/* =========================
   Helpers: Theme Palette
   ========================= */
function getRandomPaletteForTheme(themeId: string, customColors: any): { c1: string; c2: string } {
  if (themeId === "custom") {
    const customPalettes = [
      { c1: customColors.accent || "#39FF14", c2: customColors.wave1 || "#191970" },
      { c1: customColors.wave2 || "#00BFFF", c2: customColors.accent || "#39FF14" },
      { c1: customColors.wave3 || "#FF0055", c2: customColors.wave1 || "#191970" },
    ];
    return customPalettes[Math.floor(Math.random() * customPalettes.length)];
  }

  const presetPalettes: Record<string, { c1: string; c2: string }[]> = {
    "dark": [{ c1: "#525252", c2: "#171717" }, { c1: "#737373", c2: "#262626" }, { c1: "#a3a3a3", c2: "#404040" }],
    "navy-electric": [{ c1: "#1e3a8a", c2: "#0f172a" }, { c1: "#3b82f6", c2: "#1e40af" }, { c1: "#60a5fa", c2: "#1d4ed8" }],
    "emerald-cream": [{ c1: "#10b981", c2: "#fcd34d" }, { c1: "#34d399", c2: "#fde68a" }, { c1: "#a7f3d0", c2: "#fef3c7" }],
    "teal-coral": [{ c1: "#14b8a6", c2: "#fdba74" }, { c1: "#2dd4bf", c2: "#fed7aa" }, { c1: "#99f6e4", c2: "#ffedd5" }],
    "sea-citrus": [{ c1: "#06b6d4", c2: "#5eead4" }, { c1: "#22d3ee", c2: "#99f6e4" }, { c1: "#a5f3fc", c2: "#ccfbf1" }],
    "raisin-sunset": [{ c1: "#f43f5e", c2: "#262626" }, { c1: "#fb7185", c2: "#404040" }, { c1: "#404040", c2: "#171717" }],
    "gunmetal-platinum": [{ c1: "#475569", c2: "#1e293b" }, { c1: "#64748b", c2: "#334155" }, { c1: "#94a3b8", c2: "#475569" }],
    "charcoal-ecru": [{ c1: "#44403c", c2: "#1c1917" }, { c1: "#57534e", c2: "#292524" }, { c1: "#78716c", c2: "#44403c" }],
    "charcoal-sage": [{ c1: "#3f3f46", c2: "#18181b" }, { c1: "#52525b", c2: "#27272a" }, { c1: "#71717a", c2: "#3f3f46" }],
    "cyber-neon": [{ c1: "#27272a", c2: "#09090b" }, { c1: "#0ea5e9", c2: "#18181b" }, { c1: "#a855f7", c2: "#27272a" }],
  };

  const options = presetPalettes[themeId] || presetPalettes["dark"];
  return options[Math.floor(Math.random() * options.length)];
}

/* =========================
   Component
   ========================= */
export default function IpixFun(): JSX.Element | null {
  const { theme, customColors, mounted } = useTheme();

  // ---------- Refs ----------
  const containerRef = useRef<HTMLDivElement | null>(null);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const targetRef = useRef<HTMLDivElement | null>(null);

  const pillRefs = useRef<PillRef[]>(
    LINKS.map((link) => ({
      el: null, x: -500, y: -500, vx: 0, vy: 0,
      url: link.url, label: link.label, c1: "#525252", c2: "#171717",
    }))
  );

  const activePillRef = useRef<PillRef | null>(null);
  const offsetRef = useRef<{ x: number; y: number }>({ x: 0, y: 0 });
  const isPausedRef = useRef<boolean>(false);
  const appStateRef = useRef<AppState>("moving");

  // ---------- State ----------
  const [modalOpen, setModalOpen] = useState(false);
  const [targetText, setTargetText] = useState("Menuju Link");
  const [targetBg, setTargetBg] = useState("var(--card-bg)");
  const [targetGlow, setTargetGlow] = useState(false);

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
      cRect,
      bottomLimit: container ? container.clientHeight - BOTTOM_NAV_HEIGHT : 800,
    };
  }, []);

  // ---------- Apply pill style ----------
  const applyPillStyle = useCallback((p: PillRef) => {
    if (!p.el) return;
    p.el.style.setProperty("--c1", p.c1);
    p.el.style.setProperty("--c2", p.c2);
    p.el.style.transform = `translate3d(${p.x}px, ${p.y}px, 0)`;
  }, []);

  useEffect(() => {
    if (!mounted) return;
    pillRefs.current.forEach((p) => {
      const colors = getRandomPaletteForTheme(theme, customColors);
      p.c1 = colors.c1;
      p.c2 = colors.c2;
      applyPillStyle(p);
    });
  }, [theme, customColors, mounted, applyPillStyle]);

  // ---------- Reset positions ----------
  const resetPositions = useCallback(() => {
    appStateRef.current = "moving";
    isPausedRef.current = false;
    const { musicBottom, tgtTop, tgtBottom, containerWidth, bottomLimit } = getBounds();
    const centerX = containerWidth / 2 - W / 2;

    pillRefs.current.forEach((p, i) => {
      p.x = centerX + (Math.random() - 0.5) * 50;
      if (i < 3) {
        const topSpace = tgtTop - musicBottom;
        p.y = musicBottom + 10 + Math.random() * Math.max(0, topSpace - H - 20);
      } else {
        const botSpace = bottomLimit - tgtBottom;
        p.y = tgtBottom + 10 + Math.random() * Math.max(0, botSpace - H - 20);
      }
      p.vx = (Math.random() - 0.5) * 3;
      p.vy = (Math.random() - 0.5) * 3;
      applyPillStyle(p);
    });
  }, [getBounds, applyPillStyle]);

  useEffect(() => {
    if (mounted) {
      const id = requestAnimationFrame(() => resetPositions());
      return () => cancelAnimationFrame(id);
    }
  }, [mounted, resetPositions]);

  // ---------- Canvas drawing ----------
  const drawConnections = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    ctx.clearRect(0, 0, canvas.width, canvas.height);
    const active = activePillRef.current;
    if (active) {
      const { tgtCenterX, tgtCenterY } = getBounds();
      
      const pillX = active.x + W / 2;
      const pillY = active.y + H / 2;

      const grad = ctx.createLinearGradient(pillX, pillY, tgtCenterX, tgtCenterY);
      grad.addColorStop(0, active.c1); 
      grad.addColorStop(1, "transparent");

      ctx.beginPath();
      ctx.globalAlpha = 0.5;
      ctx.fillStyle = grad;
      ctx.moveTo(pillX - W / 2, pillY);
      ctx.lineTo(pillX + W / 2, pillY);
      ctx.lineTo(tgtCenterX, tgtCenterY);
      ctx.closePath();
      ctx.fill();
      ctx.globalAlpha = 1.0;
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

  // ---------- Align pills (on tap) ----------
  const alignPills = useCallback(() => {
    const { musicBottom, tgtTop, tgtBottom, containerWidth, bottomLimit } = getBounds();
    const centerX = (containerWidth - W) / 2;

    const topSpace = tgtTop - musicBottom;
    const topStep = topSpace / 4;
    for (let i = 0; i < 3; i++) {
      const p = pillRefs.current[i];
      if (!p) continue;
      p.x = centerX;
      p.y = musicBottom + topStep * (i + 1) - H / 2;
      applyPillStyle(p);
    }

    const botSpace = bottomLimit - tgtBottom;
    const botStep = botSpace / 4;
    for (let i = 3; i < 6; i++) {
      const p = pillRefs.current[i];
      if (!p) continue;
      p.x = centerX;
      p.y = tgtBottom + botStep * (i - 2) - H / 2;
      applyPillStyle(p);
    }
  }, [getBounds, applyPillStyle]);

  // ---------- Randomize Colors ----------
  const randomizeAllColors = useCallback(() => {
    pillRefs.current.forEach((p) => {
      const colors = getRandomPaletteForTheme(theme, customColors);
      p.c1 = colors.c1;
      p.c2 = colors.c2;
      applyPillStyle(p);
    });
  }, [theme, customColors, applyPillStyle]);

  // ---------- Drag Handlers ----------
  const startDrag = useCallback(
    (obj: PillRef, clientX: number, clientY: number) => {
      const container = containerRef.current;
      if (!container) return;
      const cRect = container.getBoundingClientRect();

      activePillRef.current = obj;
      setTargetText("Menuju " + obj.label);
      setTargetBg(`linear-gradient(135deg, ${obj.c1}, ${obj.c2})`);
      
      offsetRef.current = { 
        x: (clientX - cRect.left) - obj.x, 
        y: (clientY - cRect.top) - obj.y 
      };
    },
    []
  );

  const onPillPointerDown = (
    e: ReactMouseEvent<HTMLDivElement> | ReactTouchEvent<HTMLDivElement>,
    idx: number
  ) => {
    e.preventDefault();
    const obj = pillRefs.current[idx];
    if (!obj) return;
    const clientX = "touches" in e ? e.touches[0].clientX : (e as ReactMouseEvent).clientX;
    const clientY = "touches" in e ? e.touches[0].clientY : (e as ReactMouseEvent).clientY;
    startDrag(obj, clientX, clientY);
  };

  const endDrag = useCallback(() => {
    const active = activePillRef.current;
    if (!active) return;
    const tgt = targetRef.current?.getBoundingClientRect();
    const container = containerRef.current;

    if (tgt && container) {
      const cRect = container.getBoundingClientRect();
      const cx = active.x + W / 2 + cRect.left;
      const cy = active.y + H / 2 + cRect.top;
      if (cx > tgt.left && cx < tgt.right && cy > tgt.top && cy < tgt.bottom) {
        window.open(active.url, "_blank");
      }
    }
    activePillRef.current = null;
    setTargetText("Menuju Link");
    setTargetBg("var(--card-bg)");
    setTargetGlow(false);
  }, []);

  const movePill = useCallback(
    (clientX: number, clientY: number) => {
      const active = activePillRef.current;
      const container = containerRef.current;
      if (!active || !container) return;
      
      const cRect = container.getBoundingClientRect();

      const newX = clientX - cRect.left - offsetRef.current.x;
      const newY = clientY - cRect.top - offsetRef.current.y;

      active.x = Math.max(0, Math.min(newX, container.clientWidth - W));
      active.y = Math.max(0, Math.min(newY, container.clientHeight - H));
      applyPillStyle(active);

      const tgt = targetRef.current?.getBoundingClientRect();
      if (tgt) {
        const cx = active.x + W / 2 + cRect.left;
        const cy = active.y + H / 2 + cRect.top;
        if (cx > tgt.left && cx < tgt.right && cy > tgt.top && cy < tgt.bottom) {
          setTargetGlow(true);
        } else {
          setTargetGlow(false);
        }
      }
    },
    [applyPillStyle]
  );

  // Drag listeners
  useEffect(() => {
    const onMouseMove = (e: MouseEvent) => {
      if (activePillRef.current) movePill(e.clientX, e.clientY);
    };
    const onTouchMove = (e: TouchEvent) => {
      if (activePillRef.current) {
        e.preventDefault();
        movePill(e.touches[0].clientX, e.touches[0].clientY);
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
  }, [movePill, endDrag]);

  // ---------- Animation loop ----------
  useEffect(() => {
    let rafId = 0;
    const tick = () => {
      drawConnections();

      if (!isPausedRef.current) {
        const { musicBottom, tgtTop, tgtBottom, containerWidth, bottomLimit } = getBounds();

        pillRefs.current.forEach((p, i) => {
          if (p === activePillRef.current) return;
          p.x += p.vx;
          p.y += p.vy;
          
          if (p.x + W >= containerWidth || p.x <= 0) p.vx *= -1;

          if (i < 3) {
            if (p.y <= musicBottom) { p.y = musicBottom; p.vy *= -1; }
            if (p.y + H >= tgtTop) { p.y = tgtTop - H; p.vy *= -1; }
          } else {
            if (p.y <= tgtBottom) { p.y = tgtBottom; p.vy *= -1; }
            if (p.y + H >= bottomLimit) { p.y = bottomLimit - H; p.vy *= -1; }
          }
          applyPillStyle(p);
        });
      }
      rafId = requestAnimationFrame(tick);
    };
    rafId = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(rafId);
  }, [drawConnections, getBounds, applyPillStyle]);

  useEffect(() => {
    const onResize = () => { if (appStateRef.current === "aligned") alignPills(); };
    window.addEventListener("resize", onResize);
    return () => window.removeEventListener("resize", onResize);
  }, [alignPills]);

  useEffect(() => {
    const onClick = (e: MouseEvent) => {
      const target = e.target as HTMLElement | null;
      const id = target?.id ?? "";

      if (id === "reload-btn") return;
      if (target?.closest("a, button, .pill, .header-capsule, #modal-card, .bottom-nav")) return;

      if (appStateRef.current === "moving") {
        isPausedRef.current = true;
        alignPills();
        appStateRef.current = "aligned";
      } else {
        randomizeAllColors();
      }
    };
    window.addEventListener("mousedown", onClick);
    return () => window.removeEventListener("mousedown", onClick);
  }, [alignPills, randomizeAllColors]);

  const pillBaseStyle: CSSProperties = { width: W, height: H };

  if (!mounted) return null;

  return (
    <div 
      ref={containerRef}
      className="w-full max-w-2xl mx-auto h-dvh flex flex-col transition-colors duration-300 relative overflow-hidden"
      style={{ backgroundColor: "var(--background)", color: "var(--foreground)" }}
    >
      <style dangerouslySetInnerHTML={{
        __html: `
        * { box-sizing: border-box; }
        html, body { height: 100dvh; margin: 0; overflow: hidden; touch-action: none; font-family: 'Segoe UI', sans-serif; -webkit-tap-highlight-color: transparent; }
        
        #fx-canvas { position: absolute; top: 0; left: 0; width: 100%; height: 100%; pointer-events: none; z-index: 0; }
        
        .pill { will-change: transform; }

        .header-group { position: absolute; top: 12px; left: 0; width: 100%; display: flex; align-items: center; justify-content: space-between; padding: 0 15px; z-index: 1005; }
        
        .header-capsule { padding: 9px 18px; background: var(--card-bg); backdrop-filter: blur(15px); border-radius: 45px; color: var(--accent); text-decoration: none; font-size: 0.81rem; font-weight: bold; box-shadow: 0 5px 15px rgba(0,0,0,0.2); white-space: nowrap; transition: all 0.3s ease; display: flex; align-items: center; height: 36px; position: relative; overflow: hidden; z-index: 0; border: 1px solid var(--card-border); }
        .header-capsule:active { box-shadow: 0 0 20px var(--accent-glow); transform: scale(0.95); }

        #control-panel { position: absolute; top: 50%; left: 50%; transform: translate(-50%, -50%); display: flex; align-items: center; gap: 10px; z-index: 998; width: max-content; }
        #reload-btn, #info-trigger { padding: 9px 18px; border-radius: 18px; cursor: pointer; font-weight: bold; backdrop-filter: blur(10px); border: 1px solid var(--card-border); font-size: 0.81rem; user-select: none; color: var(--foreground); background: var(--card-bg); }
        #reload-btn { background: color-mix(in srgb, var(--accent) 30%, transparent); color: var(--foreground-heading); }

        .pill { position: absolute; left: 0; top: 0; border-radius: 45px; background: linear-gradient(45deg, var(--c1, #aaa), var(--c2, #444)); background-size: 200% 200%; animation: gradientMove 4s ease infinite; border: 2px solid var(--card-border); color: #ffffff; display: flex; align-items: center; justify-content: flex-start; padding-left: 40px; font-size: 0.81rem; font-weight: bold; box-shadow: 0 4px 15px rgba(0,0,0,0.3); cursor: grab; user-select: none; z-index: 1; touch-action: none; text-shadow: 0px 1px 3px rgba(0,0,0,0.8); }
        .pill-icon { position: absolute; left: 10px; width: 20px; height: 20px; animation: wiggle 1s ease-in-out infinite alternate; }
        
        @keyframes wiggle { 0% { transform: translateY(-2px) rotate(-15deg); } 100% { transform: translateY(2px) rotate(15deg); } }
        @keyframes gradientMove { 0% { background-position: 0% 50%; } 50% { background-position: 100% 50%; } 100% { background-position: 0% 50%; } }

        #target-pill, .target-pill-demo { width: 146px; height: 46px; border-radius: 45px; background: var(--card-bg); backdrop-filter: blur(20px); border: 2px solid var(--card-border); display: flex; align-items: center; justify-content: center; color: var(--foreground-heading); font-weight: bold; font-size: 0.75rem; pointer-events: none; transition: all 0.2s ease; }
        .target-glow { background: color-mix(in srgb, var(--accent) 50%, transparent) !important; box-shadow: 0 0 30px var(--accent-glow); transform: scale(1.1) !important; border-color: var(--accent) !important; color: #fff !important; }

        #modal { display: none; position: fixed; top: 0; left: 0; width: 100%; height: 100dvh; background: rgba(0, 0, 0, 0.7); backdrop-filter: blur(5px); z-index: 2000; align-items: center; justify-content: center; }
        #modal.open { display: flex; }
        #modal-card { width: 85%; max-width: 350px; padding: 27px; background: var(--card-bg); backdrop-filter: blur(20px); border-radius: 27px; color: var(--foreground); border: 1px solid var(--card-border); text-align: left; }
        #close-btn { width: 45px; height: 45px; background: var(--accent); border-radius: 50%; display: flex; align-items: center; justify-content: center; cursor: pointer; margin: 18px auto 0; color: var(--background); font-weight: bold; font-size: 1.2rem; }
      `}} />

      <canvas ref={canvasRef} id="fx-canvas" />

      <div className="header-group">
        <a href="https://ipix.my.id" className="header-capsule" target="_blank" rel="noreferrer">
          www.ipix.my.id
        </a>
        <a href="https://sukachub.my.id" className="header-capsule" target="_blank" rel="noreferrer">
          sukachub.my.id
        </a>
      </div>

      <div id="control-panel">
        <div id="info-trigger" onClick={() => setModalOpen(true)}>
          Info
        </div>
        <div
          ref={targetRef}
          id="target-pill"
          className={targetGlow ? "target-glow" : ""}
          style={{ background: targetBg }}
        >
          {targetText}
        </div>
        <div id="reload-btn" onClick={resetPositions}>
          Reload
        </div>
      </div>

      {LINKS.map((link, idx) => (
        <div
          key={link.label}
          className="pill"
          style={pillBaseStyle}
          ref={(el) => {
            const p = pillRefs.current[idx];
            if (p) p.el = el;
          }}
          onMouseDown={(e) => onPillPointerDown(e, idx)}
          onTouchStart={(e) => onPillPointerDown(e, idx)}
        >
          <img src={link.icon} alt={link.label} className="pill-icon" />
          {link.label}
        </div>
      ))}

      <div id="modal" className={modalOpen ? "open" : ""}>
        <div id="modal-card">
          <p>
            <b style={{ color: "var(--foreground-heading)" }}>Info Cara:</b>
          </p>
          <ul className="mt-2 space-y-1 text-sm opacity-90">
            <li>
              <b>Tap layar 1x</b>: Melakukan <b>Pause</b> dan <b>Merapihkan posisi Link (Pill)</b>.
            </li>
            <li>
              <b>Tap Lagi</b>: <b>Ganti Warna</b> secara random dalam tema ini.
            </li>
            <li>
              <b>Klik Reload</b>: Untuk <b>Melanjutkan</b> pergerakan.
            </li>
            <li>
              <b>Geser Link (Pill)</b> lalu arahkan ke:
              <div
                className="target-pill-demo"
                style={{ marginTop: 6, marginBottom: 6, background: "var(--card-bg)" }}
              >
                <b>Menuju Link</b>
              </div>
              ketika menyala lepas untuk membuka situs web.
            </li>
            <li className="mt-4 pt-2 border-t border-[var(--card-border)] text-center font-bold" style={{ color: "var(--accent)" }}>
              Have Fun guys!
            </li>
          </ul>
          <div id="close-btn" onClick={() => setModalOpen(false)}>
            ×
          </div>
        </div>
      </div>

      <BottomNav />
    </div>
  );
}