"use client";
import React, { useEffect, useState } from "react";
import { useTheme } from "../context/ThemeContext";

const EMOJIS = [
  { char: "😊", anim: "anim-pulse-soft" },
  { char: "😂", anim: "anim-wiggle" },
  { char: "🤬", anim: "anim-heartbeat" },
  { char: "👍", anim: "anim-bounce-soft" },
  { char: "🔥", anim: "anim-pulse-glow" },
  { char: "🙏", anim: "anim-shake-soft" },
  { char: "😍", anim: "anim-heartbeat" },
  { char: "💦", anim: "anim-wiggle"},
  { char: "😭", anim: "anim-shake-soft" },
  { char: "😱", anim: "anim-bounce-soft" },
];

const InputThemeWrapper = ({ children }: { children: (styles: any) => React.ReactNode }) => {
  const styles = {
    container: "bg-[var(--card-bg)] border-[var(--card-border)]",
    input: "bg-[var(--card-bg)] border-[var(--card-border)] focus:border-[var(--accent)] text-[var(--foreground-heading)] placeholder:text-[var(--foreground)]/40",
    inputBlink: "bg-[var(--card-bg)] border-[var(--accent)] ring-2 ring-[var(--accent-glow)]",
    button: "bg-[var(--accent)] text-[var(--background)] font-bold hover:opacity-90",
    replyBg: "bg-[var(--card-bg)] border-[var(--card-border)] text-[var(--foreground-heading)]",
    placeholder: "text-[var(--foreground)]/40",
    counter: "text-[var(--foreground)]/60",
    refreshBtn: "bg-yellow-500/90 text-black border-yellow-600 font-bold hover:bg-yellow-400/90",
    cancelBtn: "bg-red-600/80 text-white border-red-700 font-bold",
    uploadIcon: "text-[var(--foreground)] hover:text-[var(--accent)]",
    labelText: "text-[var(--foreground)]",
  };

  return <>{children(styles)}</>;
};

export default function ChatInput({
  input,
  setInput,
  interact,
  setInteract,
  ui,
  setUi,
  auth,
  usersInfo,
  currentHash,
  isBlocked,
  hasInputReady,
  handleImageUpload,
  scrollMsg,
  sendMsg,
}: {
  input: any;
  setInput: any;
  interact: any;
  setInteract: any;
  ui: any;
  setUi: any;
  auth: any;
  usersInfo: any;
  currentHash: string;
  isBlocked: boolean;
  hasInputReady: boolean;
  handleImageUpload: (e: React.ChangeEvent<HTMLInputElement>) => void;
  scrollMsg: (id: number) => void;
  sendMsg: (e: React.FormEvent) => void;
}) {

  const [showEmoji, setShowEmoji] = useState(false);

  // Auto-register push subscription
  useEffect(() => {
    async function setupPushSubscription() {
      if (!("serviceWorker" in navigator) || !("PushManager" in window)) return;

      try {
        const currentUsername = typeof auth?.user === "string" ? auth.user : auth?.user?.username;
        if (!currentUsername) return;

        let registration = await navigator.serviceWorker.getRegistration();
        if (!registration) {
          registration = await navigator.serviceWorker.register("/sw.js");
        }
        await navigator.serviceWorker.ready;

        const permission = await Notification.requestPermission();
        if (permission !== "granted") return;

        const publicVapidKey = process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY;
        if (!publicVapidKey) {
          console.error("[Push] VAPID Public Key tidak ditemukan!");
          return;
        }

        let subscription = await registration.pushManager.getSubscription();

        if (!subscription) {
          subscription = await registration.pushManager.subscribe({
            userVisibleOnly: true,
            applicationServerKey: urlBase64ToUint8Array(publicVapidKey),
          });
        }

        if (subscription) {
          const res = await fetch("/api/save-subscription", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              username: currentUsername,
              subscription: subscription,
            }),
          });

          const resData = await res.json();
          console.log("[Push] Hasil simpan untuk user:", currentUsername, resData);
        }
      } catch (err) {
        console.error("[Push] Error setup push subscription:", err);
      }
    }

    if (auth?.isAuth && auth?.user) {
      setupPushSubscription();
    }
  }, [auth?.isAuth, auth?.user]);

  function urlBase64ToUint8Array(base64String: string) {
    const padding = "=".repeat((4 - (base64String.length % 4)) % 4);
    const base64 = (base64String + padding).replace(/-/g, "+").replace(/_/g, "/");
    const rawData = window.atob(base64);
    const outputArray = new Uint8Array(rawData.length);
    for (let i = 0; i < rawData.length; ++i) {
      outputArray[i] = rawData.charCodeAt(i);
    }
    return outputArray;
  }

  const addEmoji = (emoji: string) => {
    if (isBlocked || (ui.tab === "admin" && !usersInfo.selPriv)) return;
    setInput((p: any) => ({
      ...p,
      text: (p.text || "") + emoji,
    }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setShowEmoji(false);
    sendMsg(e);
  };

  return (
    <InputThemeWrapper>
      {(styles) => (
        <div className="shrink-0 bg-[var(--card-bg)] backdrop-blur-xl z-20 w-full flex flex-col shadow-[0_-4px_15px_rgba(0,0,0,0.2)] border-t border-[var(--card-border)] relative mb-16">
          
          {/* Keyframes Animasi Emoji */}
          <style>{`
            @keyframes heartbeat {
              0%, 100% { transform: scale(1); }
              15% { transform: scale(1.3); }
              30% { transform: scale(1); }
              45% { transform: scale(1.2); }
            }
            .anim-heartbeat { animation: heartbeat 1.2s infinite ease-in-out; }

            @keyframes wiggle {
              0%, 100% { transform: rotate(-10deg); }
              50% { transform: rotate(10deg); }
            }
            .anim-wiggle { animation: wiggle 0.8s infinite ease-in-out alternate; }

            @keyframes bounceSoft {
              0%, 100% { transform: translateY(0); }
              50% { transform: translateY(-5px); }
            }
            .anim-bounce-soft { animation: bounceSoft 0.9s infinite ease-in-out; }

            @keyframes pulseGlow {
              0%, 100% { transform: scale(1); opacity: 0.9; }
              50% { transform: scale(1.22); opacity: 1; filter: drop-shadow(0 0 6px rgba(255,165,0,0.6)); }
            }
            .anim-pulse-glow { animation: pulseGlow 1.1s infinite ease-in-out; }

            @keyframes shakeSoft {
              0%, 100% { transform: translateX(0); }
              20% { transform: translateX(-2px) rotate(-3deg); }
              60% { transform: translateX(2px) rotate(3deg); }
            }
            .anim-shake-soft { animation: shakeSoft 0.7s infinite linear; }

            @keyframes pulseSoft {
              0%, 100% { transform: scale(1); }
              50% { transform: scale(1.12); }
            }
            .anim-pulse-soft { animation: pulseSoft 1.3s infinite ease-in-out; }
          `}</style>

          {interact.replyTo && (
            <div 
              className={`mx-3 mt-1.5 p-2 px-3 rounded-t-xl text-xs flex justify-between items-center border-t border-x cursor-pointer ${styles.replyBg}`} 
              onClick={() => scrollMsg(interact.replyTo.id)}
            >
              <div className="truncate flex-1 pr-2">
                <span className="font-bold">Balas @{interact.replyTo.username.split("●")[0]}:</span> <span className="italic">"{interact.replyTo.pesan}"</span>
              </div>
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  setInteract((p: any) => ({ ...p, replyTo: null }));
                }}
                className="text-[var(--foreground)] opacity-60 font-bold px-1 hover:opacity-100"
              >
                ×
              </button>
            </div>
          )}

          <form onSubmit={handleSubmit} className="shrink-0 p-2 sm:p-3 bg-transparent flex flex-col gap-1.5 w-full relative transition-all duration-300">
            
            {/* ==================== BARIS 1 (ROW ATAS) ==================== */}
            <div className="flex items-center gap-1.5 sm:gap-2 w-full">
              
              {/* 1. Teks Info / Selector Emoji (Panjang) */}
              <div className={`flex-1 text-[9px] h-[32px] sm:h-[36px] flex items-center min-w-0 ${styles.labelText}`}>
                {showEmoji ? (
                  <div className="flex items-center gap-2 sm:gap-2.5 overflow-x-auto [scrollbar-width:none] [&::-webkit-scrollbar]:hidden animate-in fade-in zoom-in-95 duration-150 py-1 px-2.5 w-full bg-[var(--card-bg)]/60 border border-[var(--card-border)] rounded-xl shadow-inner backdrop-blur-md">
                    {EMOJIS.map((item, idx) => (
                      <button
                        key={idx}
                        type="button"
                        onClick={() => addEmoji(item.char)}
                        disabled={isBlocked || (ui.tab === "admin" && !usersInfo.selPriv)}
                        className="inline-block text-xs sm:text-sm hover:scale-125 active:scale-90 transition-all disabled:opacity-30 disabled:cursor-not-allowed select-none shrink-0"
                        title="Tambah emoji"
                      >
                        <span className={`inline-block ${item.anim}`}>
                          {item.char}
                        </span>
                      </button>
                    ))}
                  </div>
                ) : isBlocked ? (
                  "Anda telah diblokir."
                ) : ui.tab === "admin" && !usersInfo.selPriv ? (
                  "Pilih obrolan di atas"
                ) : (
                  "*bijaklah dalam berinteraksi"
                )}
              </div>

              {/* 2. Tombol Toggle Emoji (BULAT) */}
              <button
                type="button"
                onClick={() => setShowEmoji((prev) => !prev)}
                disabled={isBlocked || (ui.tab === "admin" && !usersInfo.selPriv)}
                className={`w-8 h-8 sm:w-9 sm:h-9 rounded-full border border-[var(--card-border)] bg-[var(--card-bg)] transition-all active:scale-90 flex items-center justify-center shrink-0 ${showEmoji ? "text-[var(--accent)] border-[var(--accent)] bg-white/10" : styles.uploadIcon} ${(ui.tab === "admin" && !usersInfo.selPriv) || isBlocked ? "opacity-30 pointer-events-none" : ""}`}
                title="Pilih Emoji"
              >
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.8} stroke="currentColor" className="w-5 h-5 sm:w-6 sm:h-6">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M15.182 15.182a4.5 4.5 0 01-6.364 0M21 12a9 9 0 11-18 0 9 9 0 0118 0zM9 10h.01M15 10h.01" />
                </svg>
              </button>

              {/* 3. Tombol Upload Foto (KOTAK) */}
              <div className="relative shrink-0 flex items-center justify-center">
                <input type="file" id="image-upload" accept="image/*" className="hidden" onChange={handleImageUpload} disabled={isBlocked || input.uploadingImage || input.image !== null} />
                <label htmlFor="image-upload" className={`w-8 h-8 sm:w-9 sm:h-9 rounded-lg border border-[var(--card-border)] bg-[var(--card-bg)] cursor-pointer transition-colors flex items-center justify-center ${(ui.tab === "admin" && !usersInfo.selPriv) || input.image !== null || isBlocked ? "opacity-30 pointer-events-none" : styles.uploadIcon}`}>
                  {input.uploadingImage ? (
                    <svg className="animate-spin w-5 h-5 sm:w-6 sm:h-6 text-[var(--accent)]" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                  ) : (
                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.8} stroke="currentColor" className="w-5 h-5 sm:w-6 sm:h-6">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 15.75l5.159-5.159a2.25 2.25 0 013.182 0l5.159 5.159m-1.5-1.5l1.409-1.409a2.25 2.25 0 013.182 0l2.909 2.909m-18 3.75h16.5a1.5 1.5 0 001.5-1.5V6a1.5 1.5 0 00-1.5-1.5H3.75A1.5 1.5 0 002.25 6v12a1.5 1.5 0 001.5 1.5zm10.5-11.25h.008v.008h-.008V8.25zm.375 0a.375.375 0 11-.75 0 .375.375 0 01.75 0z" />
                    </svg>
                  )}
                </label>
              </div>

              {/* 4. SLOT KANAN: REFRESH/BATAL ATAU PREVIEW GAMBAR LEBAR PERSIS TOMBOL KIRIM */}
              <div className="relative shrink-0 w-[80px] sm:w-[100px] h-[32px] sm:h-[36px] flex items-center justify-center">
                {input.image ? (
                  /* Preview Gambar Square Melayang Ke Atas Dengan Lebar SAMA PERSIS Tombol Kirim (80px / 100px) */
                  <div className="absolute bottom-0 right-0 z-20 flex items-center justify-center">
                    <div className="relative w-[80px] h-[80px] sm:w-[100px] sm:h-[100px] bg-[var(--card-bg)] p-1 rounded-xl border-2 border-[var(--accent)] shadow-xl flex items-center justify-center">
                      <img
                        src={input.image}
                        alt="Preview Upload"
                        className="w-full h-full object-cover rounded-lg"
                      />
                      {/* Tombol X Hapus Gambar di Kiri Atas */}
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          setInput((p: any) => ({ ...p, image: null }));
                        }}
                        className="absolute -top-2 -left-2 bg-red-600 hover:bg-red-700 text-white rounded-full w-5 h-5 text-[11px] font-bold flex items-center justify-center shadow-md active:scale-90 transition-all z-10"
                        title="Hapus gambar"
                      >
                        ×
                      </button>
                    </div>
                  </div>
                ) : (
                  /* Tombol REFRESH / BATAL Sembunyi Otomatis Jika Ada Gambar */
                  auth.isAuth && currentHash !== "#block" && (
                    <button
                      type="button"
                      id="btn-refresh-delete"
                      onClick={() => {
                        if (hasInputReady) {
                          setInput((p: any) => ({
                            ...p,
                            text: "",
                            image: null,
                            uploadingImage: false,
                          }));
                          setInteract((p: any) => ({ ...p, replyTo: null }));
                        } else {
                          window.location.reload();
                        }
                      }}
                      className={`w-full h-full rounded-lg font-black tracking-wider text-[8px] sm:text-[9px] border shadow-xs active:scale-95 transition-all flex items-center justify-center select-none uppercase ${hasInputReady ? styles.cancelBtn : styles.refreshBtn}`}
                    >
                      {hasInputReady ? "BATAL" : "REFRESH"}
                    </button>
                  )
                )}
              </div>

            </div>

            {/* ==================== BARIS 2 (ROW BAWAH) ==================== */}
            <div className="flex items-stretch gap-1.5 sm:gap-2 w-full">
              
              {/* Textarea Input Utama (Flex-1) */}
              <div className="relative flex-1 w-full min-w-0">
                <textarea
                  id="chat-input"
                  onFocus={() => {
                    setUi((p: any) => ({ ...p, inputFocus: true }));
                  }}
                  onBlur={() => setUi((p: any) => ({ ...p, inputFocus: false }))}
                  className={`w-full border p-2 sm:p-2.5 rounded-xl px-3 sm:px-4 pb-5 sm:pb-6 text-sm resize-none focus:outline-none min-h-[42px] sm:min-h-[48px] max-h-[100px] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden ${input.blink ? styles.inputBlink : styles.input} ${(ui.tab === "admin" && !usersInfo.selPriv) || isBlocked ? "opacity-30 cursor-not-allowed" : ""}`}
                  value={input.text}
                  onChange={(e) => {
                    setInput((p: any) => ({ ...p, text: e.target.value }));
                    e.target.style.height = "auto";
                    e.target.style.height = `${Math.min(e.target.scrollHeight, 100)}px`;
                  }}
                  onKeyDown={(e) => {
                    if (e.key === "Enter" && !e.shiftKey) {
                      e.preventDefault();
                      handleSubmit(e as any);
                    }
                  }}
                  placeholder={isBlocked ? "Akun Anda diblokir..." : (ui.tab === "admin" && !usersInfo.selPriv ? "Pilih user..." : "Ketik pesan...")}
                  maxLength={200}
                  rows={1}
                  disabled={input.sending || isBlocked || (ui.tab === "admin" && !usersInfo.selPriv)}
                />
                <div className={`absolute right-3 bottom-1.5 text-[9px] font-mono select-none bg-black/20 px-1 rounded ${styles.counter}`}>{200 - input.text.length}</div>
              </div>

              {/* Tombol KIRIM Utama (Tinggi 100% Presisi Sejajar SAMA DENGAN Textarea) */}
              <button 
                type="submit" 
                disabled={isBlocked || input.sending || (!input.text.trim() && !input.image) || (ui.tab === "admin" && !usersInfo.selPriv)} 
                className={`shrink-0 w-[80px] sm:w-[100px] rounded-xl font-bold text-[11px] sm:text-xs active:scale-95 disabled:opacity-50 flex items-center justify-center shadow-sm ${ui.tab === "admin" && !usersInfo.selPriv ? "bg-white/10 text-white/30 cursor-not-allowed" : styles.button}`}
              >
                {input.sending ? "..." : "Kirim"}
              </button>

            </div>
          </form>
        </div>
      )}
    </InputThemeWrapper>
  );
}