"use client";
import BottomNav from "../../components/bottomnav"; // Sesuaikan path
import React, {
  useState,
  useEffect,
  useRef,
  useCallback,
  type CSSProperties,
  type MouseEvent as ReactMouseEvent,
  type TouchEvent as ReactTouchEvent,
} from "react";

/* =========================
   Types
   ========================= */
interface LinkItem {
  label: string;
  url: string;
  icon: string;
}

interface Track {
  name: string;
  url: string;
}

interface PillRef {
  el: HTMLDivElement | null;
  x: number;
  y: number;
  vx: number;
  vy: number;
  url: string;
  label: string;
  c1: string;
  c2: string;
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

const PLAYLIST: Track[] = [
  { name: "Lagu 1", url: "https://raw.githubusercontent.com/iopix/ipix/main/lagu1.mp3" },
  { name: "Lagu 2", url: "https://raw.githubusercontent.com/iopix/ipix/main/lagu2.mp3" },
];

const W = 139;
const H = 46;

/* =========================
   Helpers
   ========================= */
function randomHslPair(): { c1: string; c2: string } {
  const hueStart = Math.random() * 360;
  const hueEnd = (hueStart + 60) % 360;
  return {
    c1: `hsl(${hueStart}, 70%, 50%)`,
    c2: `hsl(${hueEnd}, 70%, 50%)`,
  };
}

/* =========================
   Component
   ========================= */
export default function IpixFun(): JSX.Element {
  // ---------- Refs ----------
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const targetRef = useRef<HTMLDivElement | null>(null);
  const ipixCapRef = useRef<HTMLAnchorElement | null>(null);
  const pillRefs = useRef<PillRef[]>([]);

  const activePillRef = useRef<PillRef | null>(null);
  const offsetRef = useRef<{ x: number; y: number }>({ x: 0, y: 0 });
  const isPausedRef = useRef<boolean>(false);
  const appStateRef = useRef<AppState>("moving");
  const hasStartedRef = useRef<boolean>(false);
  const currentTrackRef = useRef<number>(0);
  const ipixXRef = useRef<number>(0);
  const ipixVXRef = useRef<number>(3);

  // ---------- State (UI only) ----------
  const [modalOpen, setModalOpen] = useState(false);
  const [trackName, setTrackName] = useState("Paused");
  const [btnLabel, setBtnLabel] = useState("Play");
  const [targetText, setTargetText] = useState("Menuju Link");
  const [targetBg, setTargetBg] = useState("rgba(255, 255, 255, 0.05)");
  const [targetGlow, setTargetGlow] = useState(false);
  const [capVisible, setCapVisible] = useState(true);

  // ---------- Helpers: bounds ----------
  const getBounds = useCallback(() => {
    const music = document.querySelector(".music-player") as HTMLElement | null;
    const cap = ipixCapRef.current;
    const tgt = targetRef.current;
    const body = document.body;
    return {
      music: music?.getBoundingClientRect() ?? new DOMRect(),
      cap: cap?.getBoundingClientRect() ?? new DOMRect(),
      tgt: tgt?.getBoundingClientRect() ?? new DOMRect(),
      containerWidth: body.clientWidth,
    };
  }, []);

  // ---------- Canvas drawing ----------
  const drawConnections = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    ctx.clearRect(0, 0, canvas.width, canvas.height);
    const bodyRect = document.body.getBoundingClientRect();

    const active = activePillRef.current;
    if (active) {
      const { tgt } = getBounds();
      const targetX = tgt.left + tgt.width / 2;
      const targetY = tgt.top + tgt.height / 2;
      const pillX = active.x + W / 2 + bodyRect.left;
      const pillY = active.y + H / 2;

      const hslaColor = active.c1.replace("hsl", "hsla").replace(")", ", 0.3)");
      const transparent = "hsla(0, 0%, 100%, 0)";

      const grad = ctx.createLinearGradient(pillX, pillY, targetX, targetY);
      grad.addColorStop(0, hslaColor);
      grad.addColorStop(1, transparent);

      ctx.beginPath();
      ctx.fillStyle = grad;
      ctx.moveTo(pillX - W / 2, pillY);
      ctx.lineTo(pillX + W / 2, pillY);
      ctx.lineTo(targetX, targetY);
      ctx.closePath();
      ctx.fill();
    }
  }, [getBounds]);

  // ---------- Init pills ----------
  useEffect(() => {
    pillRefs.current = LINKS.map((link) => {
      const colors = randomHslPair();
      return {
        el: null,
        x: 0,
        y: 0,
        vx: (Math.random() - 0.5) * 3,
        vy: (Math.random() - 0.5) * 3,
        url: link.url,
        label: link.label,
        c1: colors.c1,
        c2: colors.c2,
      };
    });
  }, []);

  // ---------- Canvas resize ----------
  useEffect(() => {
    const resize = () => {
      const canvas = canvasRef.current;
      if (!canvas) return;
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    };
    window.addEventListener("resize", resize);
    resize();
    return () => window.removeEventListener("resize", resize);
  }, []);

  // ---------- Apply pill style helper ----------
  const applyPillStyle = useCallback((p: PillRef) => {
    if (!p.el) return;
    p.el.style.setProperty("--c1", p.c1);
    p.el.style.setProperty("--c2", p.c2);
    p.el.style.transform = `translate3d(${p.x}px, ${p.y}px, 0)`;
  }, []);

  // ---------- Reset positions ----------
  const resetPositions = useCallback(() => {
    appStateRef.current = "moving";
    isPausedRef.current = false;
    const { music, tgt, cap, containerWidth } = getBounds();
    const centerX = containerWidth / 2 - W / 2;

    pillRefs.current.forEach((p, i) => {
      p.x = centerX + (Math.random() - 0.5) * 50;
      if (i < 3) {
        const topSpace = tgt.top - music.bottom;
        p.y = music.bottom + 10 + Math.random() * Math.max(0, topSpace - H - 20);
      } else {
        const botSpace = cap.top - tgt.bottom;
        p.y = tgt.bottom + 10 + Math.random() * Math.max(0, botSpace - H - 20);
      }
      const colors = randomHslPair();
      p.c1 = colors.c1;
      p.c2 = colors.c2;
      p.vx = (Math.random() - 0.5) * 3;
      p.vy = (Math.random() - 0.5) * 3;
      applyPillStyle(p);
    });
    setCapVisible(true);
  }, [getBounds, applyPillStyle]);

  // Run initial reset after mount (when DOM is ready)
  useEffect(() => {
    const id = requestAnimationFrame(() => resetPositions());
    return () => cancelAnimationFrame(id);
  }, [resetPositions]);

  // ---------- Align pills (on tap) ----------
  const alignPills = useCallback(() => {
    const { music, tgt, cap, containerWidth } = getBounds();
    const centerX = (containerWidth - W) / 2;

    const topSpace = tgt.top - music.bottom;
    const topStep = topSpace / 4;
    for (let i = 0; i < 3; i++) {
      const p = pillRefs.current[i];
      if (!p) continue;
      p.x = centerX;
      p.y = music.bottom + topStep * (i + 1) - H / 2;
      applyPillStyle(p);
    }

    const botSpace = cap.top - tgt.bottom;
    const botStep = botSpace / 4;
    for (let i = 3; i < 6; i++) {
      const p = pillRefs.current[i];
      if (!p) continue;
      p.x = centerX;
      p.y = tgt.bottom + botStep * (i - 2) - H / 2;
      applyPillStyle(p);
    }

    const capEl = ipixCapRef.current;
    if (capEl) {
      ipixXRef.current = (window.innerWidth - capEl.offsetWidth) / 2;
      capEl.style.transform = `translateX(${ipixXRef.current}px)`;
    }
  }, [getBounds, applyPillStyle]);

  // ---------- Randomize all colors ----------
  const randomizeAllColors = useCallback(() => {
    pillRefs.current.forEach((p) => {
      const colors = randomHslPair();
      p.c1 = colors.c1;
      p.c2 = colors.c2;
      applyPillStyle(p);
    });
  }, [applyPillStyle]);

  // ---------- Audio ----------
  const toggleAudio = useCallback(() => {
    const audio = audioRef.current;
    if (!audio) return;
    if (!hasStartedRef.current) {
      audio.src = PLAYLIST[currentTrackRef.current].url;
      hasStartedRef.current = true;
    }
    if (audio.paused) {
      audio.play();
      setBtnLabel("Pause");
      setTrackName(PLAYLIST[currentTrackRef.current].name);
    } else {
      audio.pause();
      setBtnLabel("Play");
      setTrackName("Paused");
    }
  }, []);

  const nextTrack = useCallback(() => {
    const audio = audioRef.current;
    if (!audio) return;
    currentTrackRef.current = (currentTrackRef.current + 1) % PLAYLIST.length;
    audio.src = PLAYLIST[currentTrackRef.current].url;
    audio.play();
    setTrackName(PLAYLIST[currentTrackRef.current].name);
    setBtnLabel("Pause");
  }, []);

  // ---------- Drag handlers ----------
  const startDrag = useCallback(
    (obj: PillRef, clientX: number, clientY: number) => {
      activePillRef.current = obj;
      setTargetText("Menuju " + obj.label);
      setTargetBg(`linear-gradient(135deg, ${obj.c1}, ${obj.c2})`);
      offsetRef.current = { x: clientX - obj.x, y: clientY - obj.y };
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
    if (tgt) {
      const cx = active.x + W / 2;
      const cy = active.y + H / 2;
      if (cx > tgt.left && cx < tgt.right && cy > tgt.top && cy < tgt.bottom) {
        window.open(active.url, "_blank");
      }
    }
    activePillRef.current = null;
    setTargetText("Menuju Link");
    setTargetBg("rgba(255, 255, 255, 0.05)");
    setTargetGlow(false);
  }, []);

  const movePill = useCallback(
    (clientX: number, clientY: number) => {
      const active = activePillRef.current;
      if (!active) return;
      const { containerWidth } = getBounds();
      const tgt = targetRef.current?.getBoundingClientRect();

      const newX = clientX - offsetRef.current.x;
      const newY = clientY - offsetRef.current.y;

      active.x = Math.max(0, Math.min(newX, containerWidth - W));
      active.y = Math.max(0, Math.min(newY, window.innerHeight - H));
      applyPillStyle(active);

      if (tgt) {
        const cx = active.x + W / 2;
        const cy = active.y + H / 2;
        if (cx > tgt.left && cx < tgt.right && cy > tgt.top && cy < tgt.bottom) {
          setTargetGlow(true);
        } else {
          setTargetGlow(false);
        }
      }
    },
    [applyPillStyle, getBounds]
  );

  // Global mouse/touch listeners for drag
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
      const cap = ipixCapRef.current;

      if (!isPausedRef.current) {
        // ipix capsule
        if (cap) {
          const capWidth = cap.offsetWidth;
          const viewWidth = window.innerWidth;
          ipixXRef.current += ipixVXRef.current;
          if (ipixXRef.current + capWidth > viewWidth) {
            ipixXRef.current = viewWidth - capWidth;
            ipixVXRef.current *= -1;
          } else if (ipixXRef.current < 0) {
            ipixXRef.current = 0;
            ipixVXRef.current *= -1;
          }
          cap.style.transform = `translateX(${ipixXRef.current}px)`;
        }

        // pills
        const { music, tgt, cap: capRect, containerWidth } = getBounds();
        pillRefs.current.forEach((p, i) => {
          if (p === activePillRef.current) return;
          p.x += p.vx;
          p.y += p.vy;
          if (p.x + W >= containerWidth || p.x <= 0) p.vx *= -1;
          if (i < 3) {
            if (p.y <= music.bottom) {
              p.y = music.bottom;
              p.vy *= -1;
            }
            if (p.y + H >= tgt.top) {
              p.y = tgt.top - H;
              p.vy *= -1;
            }
          } else {
            if (p.y <= tgt.bottom) {
              p.y = tgt.bottom;
              p.vy *= -1;
            }
            if (p.y + H >= capRect.top) {
              p.y = capRect.top - H;
              p.vy *= -1;
            }
          }
          applyPillStyle(p);
        });
      }
      rafId = requestAnimationFrame(tick);
    };
    rafId = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(rafId);
  }, [drawConnections, getBounds, applyPillStyle]);

  // ---------- Window resize: realign if aligned ----------
  useEffect(() => {
    const onResize = () => {
      const cap = ipixCapRef.current;
      if (cap) {
        const capWidth = cap.offsetWidth;
        const viewWidth = window.innerWidth;
        if (ipixXRef.current + capWidth > viewWidth) {
          ipixXRef.current = Math.max(0, viewWidth - capWidth);
        }
      }
      if (appStateRef.current === "aligned") alignPills();
    };
    window.addEventListener("resize", onResize);
    return () => window.removeEventListener("resize", onResize);
  }, [alignPills]);

  // ---------- Body click handler ----------
  useEffect(() => {
    const onClick = (e: MouseEvent) => {
      const target = e.target as HTMLElement | null;
      const id = target?.id ?? "";

      // start audio on first interaction
      if (!hasStartedRef.current) toggleAudio();
      if (id === "reload-btn") return;

      // ignore clicks on interactive elements
      if (target?.closest("a, button, .pill, .header-capsule, .music-player, #modal-card")) return;

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
  }, [toggleAudio, alignPills, randomizeAllColors]);

  // ---------- Pill render helper ----------
  const pillBaseStyle: CSSProperties = {
    width: W,
    height: H,
  };

  return (
    <>
      <style>{`
        * { box-sizing: border-box; }
        html, body { height: 100dvh; margin: 0; background-color: #0f172a; overflow: hidden; touch-action: none; font-family: 'Segoe UI', sans-serif; -webkit-tap-highlight-color: transparent; }
        body { margin: 0 auto; width: 100%; max-width: 800px; background: linear-gradient(135deg, #0f172a 0%, #1e293b 100%); position: relative; border-left: 1px solid #334155; border-right: 1px solid #334155; }

        #fx-canvas { position: fixed; top: 0; left: 0; width: 100%; height: 100%; pointer-events: none; z-index: 0; }
        .pill, .ipix-capsule { will-change: transform; }

        .header-group { position: fixed; top: 12px; width: 100%; max-width: 800px; display: flex; align-items: center; justify-content: space-between; padding: 0 15px; z-index: 1005; }
        .header-capsule { padding: 9px 18px; background: transparent; backdrop-filter: blur(15px); border-radius: 45px; color: #39ff14; text-decoration: none; font-size: 0.81rem; font-weight: bold; box-shadow: 0 5px 15px rgba(0,0,0,0.3); white-space: nowrap; transition: all 0.3s ease; display: flex; align-items: center; height: 36px; position: relative; overflow: hidden; z-index: 0; animation: pulse-soft 2s infinite ease-in-out; }
        .header-capsule::before { content: ''; position: absolute; top: 50%; left: 50%; width: 150%; height: 300%; background: conic-gradient(from 0deg, transparent 70%, #39ff14 100%); transform: translate(-50%, -50%); animation: rotate-border 2s linear infinite; z-index: -2; }
        .header-capsule::after { content: ''; position: absolute; inset: 1.5px; background: #151e2f; border-radius: 45px; z-index: -1; }
        @keyframes rotate-border { from { transform: translate(-50%, -50%) rotate(0deg); } to { transform: translate(-50%, -50%) rotate(360deg); } }
        @keyframes pulse-soft { 0%, 100% { transform: scale(1); } 50% { transform: scale(1.03); } }
        .header-capsule:active { box-shadow: 0 0 20px rgba(57, 255, 20, 0.8); transform: scale(0.95); }

        .music-player { padding: 9px 13px; background: rgba(255, 255, 255, 0.1); backdrop-filter: blur(15px); border: 1px solid rgba(255, 255, 255, 0.2); border-radius: 45px; color: white; display: flex; align-items: center; gap: 9px; font-size: 0.81rem; box-shadow: 0 5px 15px rgba(0,0,0,0.3); height: 36px; }
        .music-player button { background: rgba(255, 255, 255, 0.2); border: none; color: white; padding: 4px 9px; border-radius: 13px; cursor: pointer; font-weight: bold; }

        .ipix-capsule { position: fixed; bottom: 25px; left: 0; padding: 13px 27px; background: rgba(255, 255, 255, 0.15); backdrop-filter: blur(15px); border: 2px solid rgba(255, 255, 255, 0.3); border-radius: 45px; color: white; font-weight: 800; text-decoration: none; font-size: 1rem; z-index: 999; cursor: pointer; box-shadow: 0 10px 25px rgba(0,0,0,0.2); white-space: nowrap; max-width: 90%; overflow: hidden; text-overflow: ellipsis; box-sizing: border-box; }

        #control-panel { position: fixed; top: 50%; left: 50%; transform: translate(-50%, -50%); display: flex; align-items: center; gap: 10px; z-index: 998; }
        #reload-btn, #info-trigger { padding: 9px 18px; border-radius: 18px; cursor: pointer; font-weight: bold; backdrop-filter: blur(10px); border: 1px solid rgba(255,255,255,0.2); font-size: 0.81rem; user-select: none; color: white; background: rgba(255, 255, 255, 0.1); }
        #reload-btn { background: rgba(255, 87, 34, 0.4); }

        .pill { position: absolute; border-radius: 45px; background: linear-gradient(45deg, var(--c1), var(--c2)); background-size: 200% 200%; animation: gradientMove 4s ease infinite; border: 2px solid rgba(255,255,255,0.2); color: white; display: flex; align-items: center; justify-content: flex-start; padding-left: 40px; font-size: 0.81rem; font-weight: bold; box-shadow: 0 4px 15px rgba(0,0,0,0.3); cursor: grab; user-select: none; z-index: 1; touch-action: none; }
        .pill-icon { position: absolute; left: 10px; width: 20px; height: 20px; animation: wiggle 1s ease-in-out infinite alternate; }
        @keyframes wiggle { 0% { transform: translateY(-2px) rotate(-15deg); } 100% { transform: translateY(2px) rotate(15deg); } }
        @keyframes gradientMove { 0% { background-position: 0% 50%; } 50% { background-position: 100% 50%; } 100% { background-position: 0% 50%; } }

        #target-pill { width: 146px; height: 46px; border-radius: 45px; background: rgba(255, 255, 255, 0.05); backdrop-filter: blur(20px); border: 2px solid rgba(255, 255, 255, 0.2); display: flex; align-items: center; justify-content: center; color: white; font-weight: bold; font-size: 0.75rem; pointer-events: none; transition: all 0.2s ease; }
        .target-glow { background: rgba(255, 255, 255, 0.25) !important; box-shadow: 0 0 30px rgba(255, 255, 255, 0.5); transform: scale(1.1) !important; border-color: rgba(255, 255, 255, 0.8) !important; }

        #modal { display: none; position: fixed; top: 0; left: 0; width: 100%; height: 100dvh; background: rgba(0, 0, 0, 0.5); backdrop-filter: blur(5px); z-index: 2000; align-items: center; justify-content: center; }
        #modal.open { display: flex; }
        #modal-card { width: 85%; max-width: 350px; padding: 27px; background: rgba(255, 255, 255, 0.15); backdrop-filter: blur(20px); border-radius: 27px; color: white; text-align: left; }
        #close-btn { width: 45px; height: 45px; background: #ff416c; border-radius: 50%; display: flex; align-items: center; justify-content: center; cursor: pointer; margin: 18px auto 0; color: white; font-weight: bold; }
      `}</style>

      <canvas ref={canvasRef} id="fx-canvas" />

      <div className="header-group">
        <a href="https://ipix.my.id" className="header-capsule" target="_blank" rel="noreferrer">
          www.ipix.my.id
        </a>
        <div className="music-player">
          <span id="track-name">{trackName}</span>
          <button id="btn-play-pause" onClick={toggleAudio}>
            {btnLabel}
          </button>
          <button onClick={nextTrack}>Next</button>
        </div>
      </div>

      <a
        ref={ipixCapRef}
        href="https://ipix.fun"
        className="ipix-capsule"
        style={{ visibility: capVisible ? "visible" : "hidden" }}
      >
        ipix.fun makes everything is fun
      </a>

      <div id="control-panel">
        <div id="info-trigger" onClick={() => setModalOpen(true)}>
          Info
        </div>
        <div
          ref={targetRef}
          id="target-pill"
          className={`target-pill ${targetGlow ? "target-glow" : ""}`}
          style={{ background: targetBg }}
        >
          {targetText}
        </div>
        <div id="reload-btn" onClick={resetPositions}>
          Reload
        </div>
      </div>

      {/* Pills */}
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

      {/* Modal */}
      <div id="modal" className={modalOpen ? "open" : ""}>
        <div id="modal-card">
          <p>
            <b>Info Cara:</b>
          </p>
          <ul>
            <li>
              <b>Tap layar 1x</b>: Melakukan <b>Pause</b> dan{" "}
              <b>Merapihkan posisi Capsule</b>.
            </li>
            <li>
              <b>Tap Lagi</b>: <b>Ganti Warna</b> random.
            </li>
            <li>
              <b>Klik Reload</b>: Untuk <b>Melanjutkan</b> kembali pergerakan.
            </li>
            <li>
              <b>Geser Capsule</b> lalu arahkan Capsule ke :
              <div
                id="target-pill"
                style={{ marginTop: 6, background: "rgba(255,255,255,0.05)" }}
              >
                <b>Menuju Link</b>
              </div>
              ketika menyala lepas dan akan membuka situs link sesuai{" "}
              <b>Capsule link</b> yang dipilih.
            </li>
            <li>
              <b>Have Fun gays!</b>
            </li>
            <li>
              <a
                href="https://ipix.fun"
                className="header-capsule"
                target="_blank"
                rel="noreferrer"
              >
                www.ipix.fun
              </a>
            </li>
            <li>Best regards.</li>
            <li>
              <a
                href="https://ipix.my.id"
                className="header-capsule"
                target="_blank"
                rel="noreferrer"
              >
                www.ipix.my.id
              </a>
            </li>
          </ul>
          <div id="close-btn" onClick={() => setModalOpen(false)}>
            x
          </div>
        </div>
      </div>

      {/* Hidden audio element */}
      <audio ref={audioRef} preload="none" />
    </>
  );
}