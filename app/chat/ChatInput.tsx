"use client";
import React from "react";
import { useTheme } from "@/app/context/ThemeContext";

// Wrapper untuk tema input
const InputThemeWrapper = ({ children, defaultStyles }: { children: (styles: any) => React.ReactNode, defaultStyles: any }) => {
  const { theme } = useTheme();
  
  const getInputTheme = () => {
    switch (theme) {
      case "emerald":
        return {
          container: "bg-emerald-400/10 border-emerald-400/20",
          input: "bg-emerald-400/10 border-emerald-400/20 focus:border-emerald-400 focus:bg-emerald-400/20",
          inputBlink: "bg-emerald-600/40 border-emerald-400 ring-2 ring-emerald-400/50",
          button: "bg-emerald-600/80 text-white",
          replyBg: "bg-emerald-900/40 border-emerald-500/30 text-emerald-100",
          placeholder: "text-white/40",
          counter: "text-white/30",
          refreshBtn: "bg-yellow-400/80 text-black border-yellow-500",
          cancelBtn: "bg-red-500/80 text-white border-red-600",
          uploadIcon: "text-white/60 hover:text-blue-400",
          labelText: "text-white/40",
        };
      case "blue":
        return {
          container: "bg-blue-400/10 border-blue-400/20",
          input: "bg-blue-400/10 border-blue-400/20 focus:border-blue-500 focus:bg-blue-400/20",
          inputBlink: "bg-blue-600/40 border-blue-400 ring-2 ring-blue-400/50",
          button: "bg-blue-600/80 text-white",
          replyBg: "bg-blue-900/40 border-blue-500/30 text-blue-100",
          placeholder: "text-white/40",
          counter: "text-white/30",
          refreshBtn: "bg-yellow-400/80 text-black border-yellow-500",
          cancelBtn: "bg-red-500/80 text-white border-red-600",
          uploadIcon: "text-white/60 hover:text-blue-400",
          labelText: "text-white/40",
        };
      case "dark":
        return {
          container: "bg-gray-700/20 border-gray-600/20",
          input: "bg-gray-700/30 border-gray-600/30 focus:border-gray-500 focus:bg-gray-700/40 text-gray-200",
          inputBlink: "bg-gray-600/40 border-gray-400 ring-2 ring-gray-400/50",
          button: "bg-gray-600/80 text-white hover:bg-gray-500/80",
          replyBg: "bg-gray-800/40 border-gray-600/30 text-gray-200",
          placeholder: "text-gray-400",
          counter: "text-gray-400",
          refreshBtn: "bg-yellow-500/90 text-black border-yellow-600 font-bold hover:bg-yellow-400/90",
          cancelBtn: "bg-red-600/80 text-white border-red-700",
          uploadIcon: "text-gray-400 hover:text-blue-400",
          labelText: "text-gray-400",
        };
      default:
        return defaultStyles;
    }
  };

  const styles = getInputTheme();
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
  const defaultStyles = {
    container: "bg-emerald-400/10 border-emerald-400/20",
    input: "bg-emerald-400/10 border-emerald-400/20 focus:border-emerald-400 focus:bg-emerald-400/20",
    inputBlink: "bg-emerald-600/40 border-emerald-400 ring-2 ring-emerald-400/50",
    button: "bg-emerald-600/80 text-white",
    replyBg: "bg-emerald-900/40 border-emerald-500/30 text-emerald-100",
    placeholder: "text-white/40",
    counter: "text-white/30",
    refreshBtn: "bg-yellow-400/80 text-black border-yellow-500",
    cancelBtn: "bg-red-500/80 text-white border-red-600",
    uploadIcon: "text-white/60 hover:text-blue-400",
    labelText: "text-white/40",
  };

  return (
    <InputThemeWrapper defaultStyles={defaultStyles}>
      {(styles) => (
        <div className={`shrink-0 bg-white/5 backdrop-blur-xl z-20 w-full flex flex-col shadow-[0_-4px_15px_rgba(0,0,0,0.2)] border-t border-white/10 relative mb-16`}>
          {interact.replyTo && (
            <div className={`mx-3 mt-1.5 p-2 px-3 rounded-t-xl text-xs flex justify-between items-center border-t border-x cursor-pointer ${styles.replyBg}`} onClick={() => scrollMsg(interact.replyTo.id)}>
              <div className="truncate flex-1 pr-2">
                <span className="font-bold">Balas @{interact.replyTo.username.split("●")[0]}:</span> <span className="italic">"{interact.replyTo.pesan}"</span>
              </div>
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  setInteract((p: any) => ({ ...p, replyTo: null }));
                }}
                className="text-white/40 font-bold px-1"
              >
                ×
              </button>
            </div>
          )}

          <form onSubmit={sendMsg} className="shrink-0 p-2 sm:p-3 bg-transparent flex gap-2 items-end w-full relative transition-all duration-300">
            <div className="relative shrink-0 flex items-center justify-center w-8 mb-2">
              <input type="file" id="image-upload" accept="image/*" className="hidden" onChange={handleImageUpload} disabled={isBlocked || input.uploadingImage || input.image !== null} />
              <label htmlFor="image-upload" className={`cursor-pointer transition-colors p-1 rounded-full ${(ui.tab === "admin" && !usersInfo.selPriv) || input.image !== null || isBlocked ? "text-white/20 pointer-events-none" : styles.uploadIcon}`}>
                {input.uploadingImage ? (
                  <svg className="animate-spin h-6 w-6 text-blue-400" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                ) : (
                  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-6 h-6">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 15.75l5.159-5.159a2.25 2.25 0 013.182 0l5.159 5.159m-1.5-1.5l1.409-1.409a2.25 2.25 0 013.182 0l2.909 2.909m-18 3.75h16.5a1.5 1.5 0 001.5-1.5V6a1.5 1.5 0 00-1.5-1.5H3.75A1.5 1.5 0 002.25 6v12a1.5 1.5 0 001.5 1.5zm10.5-11.25h.008v.008h-.008V8.25zm.375 0a.375.375 0 11-.75 0 .375.375 0 01.75 0z" />
                  </svg>
                )}
              </label>
            </div>

            <div className="relative flex-1 flex flex-col justify-end transition-all duration-300">
              <div className={`text-[9px] mb-1 px-1 ${styles.labelText}`}>
                {isBlocked ? "Anda telah diblokir." : ui.tab === "admin" && !usersInfo.selPriv ? "Pilih obrolan di atas" : "Chat private admin"}
              </div>

              <div className="flex items-end gap-2 w-full">
                {input.image && (
                  <div className="relative shrink-0 mb-1">
                    <img src={input.image} alt="preview" className="h-10 w-10 sm:h-12 sm:w-12 object-cover rounded-lg border border-white/20 shadow-sm" />
                    <button type="button" onClick={() => setInput((p: any) => ({ ...p, image: null }))} className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full w-4 h-4 text-[9px] font-bold flex items-center justify-center">
                      ×
                    </button>
                  </div>
                )}

                <div className="relative flex-1 w-full">
                  <textarea
                    id="chat-input"
                    onFocus={() => setUi((p: any) => ({ ...p, inputFocus: true }))}
                    onBlur={() => setUi((p: any) => ({ ...p, inputFocus: false }))}
                    className={`w-full border p-1.5 sm:p-2 rounded-xl px-3 sm:px-4 pb-5 sm:pb-6 text-sm text-white resize-none focus:outline-none min-h-[32px] sm:min-h-[38px] max-h-[100px] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden ${input.blink ? styles.inputBlink : styles.input} ${(ui.tab === "admin" && !usersInfo.selPriv) || isBlocked ? "opacity-30 cursor-not-allowed bg-gray-800" : ""}`}
                    value={input.text}
                    onChange={(e) => {
                      setInput((p: any) => ({ ...p, text: e.target.value }));
                      e.target.style.height = "auto";
                      e.target.style.height = `${Math.min(e.target.scrollHeight, 100)}px`;
                    }}
                    onKeyDown={(e) => {
                      if (e.key === "Enter" && !e.shiftKey) {
                        e.preventDefault();
                        sendMsg(e as any);
                      }
                    }}
                    placeholder={isBlocked ? "Akun Anda diblokir..." : (ui.tab === "admin" && !usersInfo.selPriv ? "Pilih user..." : "Ketik pesan...")}
                    maxLength={200}
                    rows={1}
                    disabled={input.sending || isBlocked || (ui.tab === "admin" && !usersInfo.selPriv)}
                  />
                  <div className={`absolute right-3 bottom-1.5 text-[9px] font-mono select-none opacity-80 bg-black/20 px-1 rounded ${styles.counter}`}>{200 - input.text.length}</div>
                </div>
              </div>
            </div>

            <div className="relative shrink-0 flex flex-col justify-end w-[85px] md:w-[110px] h-[32px] sm:h-[38px]">
              {auth.isAuth && currentHash !== "#block" && (
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
                  className={`absolute bottom-full mb-1.5 left-0 right-0 px-2 py-0.5 rounded-full font-black tracking-widest text-[8px] border shadow-sm active:scale-95 transition-all text-center select-none ${hasInputReady ? styles.cancelBtn : styles.refreshBtn}`}
                >
                  {hasInputReady ? "BATAL" : "REFRESH"}
                </button>
              )}
              <button type="submit" disabled={isBlocked || input.sending || (!input.text.trim() && !input.image) || (ui.tab === "admin" && !usersInfo.selPriv)} className={`w-full h-[32px] sm:h-[38px] rounded-xl font-bold text-[10px] sm:text-xs active:scale-95 disabled:opacity-50 flex items-center justify-center shadow-sm ${ui.tab === "admin" && !usersInfo.selPriv ? "bg-white/10 text-white/30 cursor-not-allowed" : styles.button}`}>
                {input.sending ? "..." : "Kirim"}
              </button>
            </div>
          </form>
        </div>
      )}
    </InputThemeWrapper>
  );
}