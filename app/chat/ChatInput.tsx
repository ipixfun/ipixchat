"use client";
import React, { useEffect, useState } from "react";
import { supabase } from "../lib/supabaseClient";

const EMOJIS = [
  { char: "😊", anim: "anim-pulse-soft" },
  { char: "😂", anim: "anim-wiggle" },
  { char: "🤬", anim: "anim-heartbeat" },
  { char: "👍", anim: "anim-bounce-soft" },
  { char: "🔥", anim: "anim-pulse-glow" },
  { char: "🙏", anim: "anim-shake-soft" },
  { char: "😍", anim: "anim-heartbeat" },
  { char: "💦", anim: "anim-wiggle" },
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
  handleLogout,
  isCredentialsChanged: externalIsCredentialsChanged,
  isAccountChangedByAdmin,
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
  handleLogout?: () => void;
  isCredentialsChanged?: boolean;
  isAccountChangedByAdmin?: boolean;
}) {
  const [showEmoji, setShowEmoji] = useState(false);
  const [isCredentialsChanged, setIsCredentialsChanged] = useState(false);

  useEffect(() => {
    if (externalIsCredentialsChanged || isAccountChangedByAdmin) {
      setIsCredentialsChanged(true);
    }
  }, [externalIsCredentialsChanged, isAccountChangedByAdmin]);

  useEffect(() => {
    if (!auth?.user || auth.user === "Admin●ipix.my.id") return;

    const channel = supabase
      .channel(`profile_input_lock_${auth.user}`)
      .on(
        "postgres_changes",
        { event: "UPDATE", schema: "public", table: "profiles" },
        (payload: any) => {
          const oldUser = payload.old?.username;
          const newUser = payload.new?.username;
          const oldPin = payload.old?.pin;
          const newPin = payload.new?.pin;

          const currentActiveUser = localStorage.getItem("username") || localStorage.getItem("active_username") || auth.user;

          if (
            (oldUser && oldUser.toLowerCase() === currentActiveUser.toLowerCase()) ||
            (newUser && newUser.toLowerCase() === currentActiveUser.toLowerCase())
          ) {
            if (oldUser !== newUser || oldPin !== newPin) {
              setIsCredentialsChanged(true);
            }
          }
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [auth?.user]);

  useEffect(() => {
    if (typeof window === "undefined" || !window.visualViewport) return;

    const initialHeight = window.innerHeight;

    const handleResize = () => {
      if (!window.visualViewport) return;
      const currentHeight = window.visualViewport.height;

      if (currentHeight >= initialHeight - 120) {
        setUi((p: any) => ({ ...p, inputFocus: false }));
        const inputEl = document.getElementById("chat-input");
        if (inputEl && document.activeElement === inputEl) {
          inputEl.blur();
        }
      } else {
        setUi((p: any) => ({ ...p, inputFocus: true }));
      }
    };

    window.visualViewport.addEventListener("resize", handleResize);
    return () => {
      window.visualViewport?.removeEventListener("resize", handleResize);
    };
  }, [setUi]);

  const selectedUser = usersInfo?.selPriv || usersInfo?.selectedUser;

  // RULE LOGIKA: SEMBUNYIKAN CHAT INPUT KETIKA DI TAB ADMIN DAN BELUM MEMILIH USER
  if (ui?.tab === "admin" && !selectedUser) {
    return null;
  }

  const isInputDisabled = isBlocked || isCredentialsChanged;

  const addEmoji = (emoji: string) => {
    if (isInputDisabled) return;

    setInput((p: any) => ({
      ...p,
      text: (p.text || "") + emoji,
    }));

    setTimeout(() => {
      const inputEl = document.getElementById("chat-input") as HTMLTextAreaElement;
      if (inputEl) {
        inputEl.focus();
      }
    }, 0);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (isCredentialsChanged) return;
    setShowEmoji(false);
    sendMsg(e);
  };

  return (
    <InputThemeWrapper>
      {(styles) => (
        <div className={`shrink-0 bg-[var(--card-bg)] backdrop-blur-xl z-[100] w-full flex flex-col shadow-[0_-4px_15px_rgba(0,0,0,0.2)] border-t border-[var(--card-border)] relative transition-all duration-150 ${ui?.inputFocus ? "mb-0" : "mb-16"}`}>
          <style>{`
            @keyframes heartbeat { 0%, 100% { transform: scale(1); } 15% { transform: scale(1.3); } 30% { transform: scale(1); } 45% { transform: scale(1.2); } }
            .anim-heartbeat { animation: heartbeat 1.2s infinite ease-in-out; }

            @keyframes wiggle { 0%, 100% { transform: rotate(-10deg); } 50% { transform: rotate(10deg); } }
            .anim-wiggle { animation: wiggle 0.8s infinite ease-in-out alternate; }

            @keyframes bounceSoft { 0%, 100% { transform: translateY(0); } 50% { transform: translateY(-5px); } }
            .anim-bounce-soft { animation: bounceSoft 0.9s infinite ease-in-out; }

            @keyframes pulseGlow { 0%, 100% { transform: scale(1); opacity: 0.9; } 50% { transform: scale(1.22); opacity: 1; filter: drop-shadow(0 0 6px rgba(255,165,0,0.6)); } }
            .anim-pulse-glow { animation: pulseGlow 1.1s infinite ease-in-out; }

            @keyframes shakeSoft { 0%, 100% { transform: translateX(0); } 20% { transform: translateX(-2px) rotate(-3deg); } 60% { transform: translateX(2px) rotate(3deg); } }
            .anim-shake-soft { animation: shakeSoft 0.7s infinite linear; }

            @keyframes pulseSoft { 0%, 100% { transform: scale(1); } 50% { transform: scale(1.12); } }
            .anim-pulse-soft { animation: pulseSoft 1.3s infinite ease-in-out; }
          `}</style>

          {ui?.inputFocus && (
            <style>{`
              nav, footer, [class*="bottomnav"], [class*="bottom-nav"], [class*="BottomNav"], .z-\\[999\\] {
                display: none !important;
                visibility: hidden !important;
                height: 0 !important;
                opacity: 0 !important;
                pointer-events: none !important;
              }
            `}</style>
          )}

          {interact?.replyTo && (
            <div 
              className={`mx-3 mt-1.5 p-2 px-3 rounded-t-xl text-xs flex justify-between items-center border-t border-x cursor-pointer ${styles.replyBg}`} 
              onClick={() => scrollMsg(interact.replyTo.id)}
            >
              <div className="truncate flex-1 pr-2">
                <span className="font-bold">Balas @{interact.replyTo.username?.split("●")[0]}:</span> <span className="italic">"{interact.replyTo.pesan}"</span>
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

          {interact?.editingMsg && (
            <div className="mx-3 mt-1.5 p-2 px-3 rounded-t-xl text-xs flex justify-between items-center border-t border-x bg-blue-500/20 border-blue-500/40 text-blue-300">
              <div className="truncate flex-1 pr-2 font-medium">
                <span className="font-bold">✏️ Mengedit Pesan:</span> <span className="italic">"{interact.editingMsg.pesan}"</span>
              </div>
              <button
                type="button"
                onClick={() => {
                  setInteract((p: any) => ({ ...p, editingMsg: null }));
                  setInput((p: any) => ({ ...p, text: "" }));
                }}
                className="text-blue-200 font-bold px-1 hover:text-white"
              >
                ×
              </button>
            </div>
          )}

          <form onSubmit={handleSubmit} className="shrink-0 p-2 sm:p-3 bg-transparent flex flex-col gap-1.5 w-full relative transition-all duration-300">
            <div className="flex items-center gap-1.5 sm:gap-2 w-full">
              <div className={`flex-1 text-[9px] h-[36px] sm:h-[40px] flex items-center min-w-0 ${styles.labelText}`}>
                {showEmoji ? (
                  <div className="flex items-center gap-3 sm:gap-4 overflow-x-auto [scrollbar-width:none] [&::-webkit-scrollbar]:hidden animate-in fade-in zoom-in-95 duration-150 py-1 px-3 w-full bg-[var(--card-bg)]/80 border border-[var(--card-border)] rounded-xl shadow-inner backdrop-blur-md">
                    {EMOJIS.map((item, idx) => (
                      <button
                        key={idx}
                        type="button"
                        onMouseDown={(e) => e.preventDefault()}
                        onClick={() => addEmoji(item.char)}
                        disabled={isInputDisabled}
                        className="inline-block text-xl sm:text-2xl hover:scale-125 active:scale-90 transition-all disabled:opacity-30 disabled:cursor-not-allowed select-none shrink-0 p-0.5"
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
                ) : isCredentialsChanged ? (
                  <div className="flex items-center gap-2">
                    <span className="text-red-400 font-bold">⚠️ Nama/PIN Anda telah diubah oleh Admin.</span>
                    {handleLogout && (
                      <button
                        type="button"
                        onClick={handleLogout}
                        className="px-2 py-0.5 bg-red-600 hover:bg-red-700 text-white rounded text-[9px] font-bold tracking-wider shrink-0"
                      >
                        Login Ulang
                      </button>
                    )}
                  </div>
                ) : (
                  "*bijaklah dalam berinteraksi"
                )}
              </div>

              <button
                type="button"
                onMouseDown={(e) => e.preventDefault()}
                onClick={() => {
                  setShowEmoji((prev) => !prev);
                  const inputEl = document.getElementById("chat-input");
                  if (inputEl) inputEl.focus();
                }}
                disabled={isInputDisabled}
                className={`w-8 h-8 sm:w-9 sm:h-9 rounded-full border border-[var(--card-border)] bg-[var(--card-bg)] transition-all active:scale-90 flex items-center justify-center shrink-0 ${showEmoji ? "text-[var(--accent)] border-[var(--accent)] bg-white/10" : styles.uploadIcon} ${isInputDisabled ? "opacity-30 pointer-events-none" : ""}`}
                title="Pilih Emoji"
              >
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.8} stroke="currentColor" className="w-5 h-5 sm:w-6 sm:h-6">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M15.182 15.182a4.5 4.5 0 01-6.364 0M21 12a9 9 0 11-18 0 9 9 0 0118 0zM9 10h.01M15 10h.01" />
                </svg>
              </button>

              <div className="relative shrink-0 flex items-center justify-center">
                <input type="file" id="image-upload" accept="image/*" className="hidden" onChange={handleImageUpload} disabled={isInputDisabled || input.uploadingImage || input.image !== null} />
                <label htmlFor="image-upload" className={`w-8 h-8 sm:w-9 sm:h-9 rounded-lg border border-[var(--card-border)] bg-[var(--card-bg)] cursor-pointer transition-colors flex items-center justify-center ${isInputDisabled || input.image !== null ? "opacity-30 pointer-events-none" : styles.uploadIcon}`}>
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

              <div className="relative shrink-0 w-[80px] sm:w-[100px] h-[32px] sm:h-[36px] flex items-center justify-center">
                {input.image ? (
                  <div className="absolute bottom-0 right-0 z-20 flex items-center justify-center">
                    <div className="relative w-[80px] h-[80px] sm:w-[100px] sm:h-[100px] bg-[var(--card-bg)] p-1 rounded-xl border-2 border-[var(--accent)] shadow-xl flex items-center justify-center">
                      <img
                        src={input.image}
                        alt="Preview Upload"
                        className="w-full h-full object-cover rounded-lg"
                      />
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
                  auth.isAuth && currentHash !== "#block" && (
                    <button
                      type="button"
                      id="btn-refresh-delete"
                      onClick={() => {
                        if (hasInputReady || interact?.editingMsg) {
                          setInput((p: any) => ({
                            ...p,
                            text: "",
                            image: null,
                            uploadingImage: false,
                          }));
                          setInteract((p: any) => ({ ...p, replyTo: null, editingMsg: null }));
                        } else {
                          window.location.reload();
                        }
                      }}
                      className={`w-full h-full rounded-lg font-black tracking-wider text-[8px] sm:text-[9px] border shadow-xs active:scale-95 transition-all flex items-center justify-center select-none uppercase ${hasInputReady || interact?.editingMsg ? styles.cancelBtn : styles.refreshBtn}`}
                    >
                      {hasInputReady || interact?.editingMsg ? "BATAL" : "REFRESH"}
                    </button>
                  )
                )}
              </div>
            </div>

            <div className="flex items-stretch gap-1.5 sm:gap-2 w-full">
              <div className="relative flex-1 w-full min-w-0">
                <textarea
                  id="chat-input"
                  onFocus={() => {
                    setUi((p: any) => ({ ...p, inputFocus: true }));
                    setTimeout(() => {
                      const el = document.getElementById("chat-input");
                      if (el) el.scrollIntoView({ behavior: "smooth", block: "center" });
                    }, 200);
                  }}
                  onBlur={() => {
                    setTimeout(() => {
                      setUi((p: any) => ({ ...p, inputFocus: false }));
                    }, 150);
                  }}
                  className={`w-full border p-2 sm:p-2.5 rounded-xl px-3 sm:px-4 pb-5 sm:pb-6 text-sm resize-none focus:outline-none min-h-[42px] sm:min-h-[48px] max-h-[100px] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden ${input.blink ? styles.inputBlink : styles.input} ${isInputDisabled ? "opacity-30 cursor-not-allowed select-none" : ""}`}
                  value={isCredentialsChanged ? "" : input.text}
                  onChange={(e) => {
                    if (isCredentialsChanged) return;
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
                  placeholder={
                    isBlocked 
                      ? "Akun Anda diblokir..." 
                      : isCredentialsChanged 
                      ? "Nama/PIN Anda telah diubah oleh Admin." 
                      : "Ketik pesan..."
                  }
                  maxLength={200}
                  rows={1}
                  readOnly={isCredentialsChanged}
                  disabled={input.sending || isInputDisabled}
                />
                <div className={`absolute right-3 bottom-1.5 text-[9px] font-mono select-none bg-black/20 px-1 rounded ${styles.counter}`}>{200 - (input.text?.length || 0)}</div>
              </div>

              <button 
                type="submit" 
                disabled={isInputDisabled || input.sending || (!input.text.trim() && !input.image)} 
                className={`shrink-0 w-[80px] sm:w-[100px] rounded-xl font-bold text-[11px] sm:text-xs active:scale-95 disabled:opacity-50 flex items-center justify-center shadow-sm ${isInputDisabled ? "bg-white/10 text-white/30 cursor-not-allowed" : styles.button}`}
              >
                {input.sending ? "..." : (interact?.editingMsg ? "Simpan" : "Kirim")}
              </button>
            </div>
          </form>
        </div>
      )}
    </InputThemeWrapper>
  );
}