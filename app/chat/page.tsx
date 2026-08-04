"use client";
import React, { useEffect, useState, useCallback, useMemo } from "react";
import { usePathname } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { supabase } from "../lib/supabaseClient";
import Login from "../../components/Login";
import Block from "../../components/Block";
import ChatLayout from "./ChatLayout";
import ChatInput from "./ChatInput";
import Head from "./Head";
import { MessageItem, PinnedMessage, ImagePopupModal } from "./MessageItem";
import Loading from "../loading";
import BottomNav from "../../components/bottomnav";
import { Capacitor } from "@capacitor/core";
import { PushNotifications } from "@capacitor/push-notifications";

function urlBase64ToUint8Array(base64String: string) {
  const padding = "=".repeat((4 - (base64String.length % 4)) % 4);
  const base64 = (base64String + padding).replace(/-/g, "+").replace(/_/g, "/");
  const rawData = window.atob(base64);
  const outputArray = new Uint8Array(rawData.length);
  for (let i = 0; i < rawData.length; ++i) { outputArray[i] = rawData.charCodeAt(i); }
  return outputArray;
}

export default function Home() {
  const pathname = usePathname();
  const [mounted, setMounted] = useState(false);
  const [msgs, setMsgs] = useState({ all: [] as any[], pub: [] as any[], priv: [] as any[] });
  const [auth, setAuth] = useState({ isAuth: false, isExist: false, user: "", adminEmail: "", adminPass: "", pin: "", umur: "", berat: "" });
  const [ui, setUi] = useState({ tab: "user" as "user" | "admin", mode: "private" as "private", inputFocus: false });
  const [counts, setCounts] = useState({ pub: 0, priv: 0 });
  const [adminStat, setAdminStat] = useState({ online: false, offlineTime: "", lastActive: 0 });
  const [usersInfo, setUsersInfo] = useState({ status: {} as Record<string, any>, blockedList: [] as any[], privUsers: [] as any[], selPriv: null as string | null });
  const [censor, setCensor] = useState({ words: [] as string[], newWord: "" });
  const [input, setInput] = useState({ text: "", sending: false, blink: false, image: null as string | null, uploadingImage: false });

  const [confirmModal, setConfirmModal] = useState({
    isOpen: false, title: "", message: "", confirmText: "Ya, Lanjutkan", cancelText: "Batal", type: "danger", onConfirm: () => {},
  });

  const [promptModal, setPromptModal] = useState({
    isOpen: false, title: "", defaultValue: "", onConfirm: (val: string) => {},
  });

  const [interact, setInteract] = useState({ 
    replyTo: null as any, activeMenu: null as number | null, popup: null as any, swipeId: null as number | null, editingMsg: null as any 
  });

  const [galleryModal, setGalleryModal] = useState<{ username: string; msgs: any[] } | null>(null);
  const [currentHash, setCurrentHash] = useState("");
  const CLOUDINARY_CLOUD_NAME = "bjamo8ld";
  const CLOUDINARY_UPLOAD_PRESET = "ipixchat";

  useEffect(() => {
    setCurrentHash(window.location.hash);
    const handleHashChange = () => setCurrentHash(window.location.hash);
    window.addEventListener("hashchange", handleHashChange);
    return () => window.removeEventListener("hashchange", handleHashChange);
  }, []);

  const getFmt = useMemo(() => ({
    notif: (n: number) => (n >= 1000 ? (n / 1000).toFixed(1).replace(".0", "") + "k" : n.toString()),
    time: (d: string) => new Date(d).toLocaleDateString("id-ID", { weekday: "short", day: "2-digit", month: "short", hour: "2-digit", minute: "2-digit" }).replace(",", ""),
    ago: (d: Date) => {
      const s = Math.floor((new Date().getTime() - d.getTime()) / 1000);
      return s / 3600 >= 1 ? Math.floor(s / 3600) + " jam lalu" : s / 60 >= 1 ? Math.floor(s / 60) + " menit lalu" : "baru saja";
    },
    greet: () => {
      const h = new Date().getHours();
      return `Selamat ${h >= 5 && h < 12 ? "pagi" : h >= 12 && h < 15 ? "siang" : h >= 15 && h < 18 ? "sore" : "malam"} `;
    },
  }), []);

  useEffect(() => {
    const timer = setTimeout(() => { const el = document.getElementById(`bottom-anchor-private`); if (el) el.scrollIntoView({ behavior: "smooth", block: "end" }); }, 200);
    return () => clearTimeout(timer);
  }, [msgs.priv.length]);

  useEffect(() => {
    const interval = setInterval(() => {
      const now = Date.now();
      setUsersInfo((prev) => {
        const newStatus = { ...prev.status }; let changed = false;
        for (const [user, data] of Object.entries(newStatus)) {
          const isOnline = now - data.lastActive < 300000;
          if (data.online !== isOnline) { newStatus[user] = { ...data, online: isOnline, offlineTime: getFmt.ago(new Date(data.lastActive)) }; changed = true; }
        }
        return changed ? { ...prev, status: newStatus } : prev;
      });
      setAdminStat((prev) => {
        if (!prev.lastActive) return prev;
        const isOnline = now - prev.lastActive < 300000;
        if (prev.online !== isOnline) return { ...prev, online: isOnline, offlineTime: getFmt.ago(new Date(prev.lastActive)) };
        return prev;
      });
    }, 15000);
    return () => clearInterval(interval);
  }, [getFmt]);

  const hScroll = () => setInteract((p) => ({ ...p, activeMenu: null }));
  const isCensored = (t: string) => censor.words.some((w) => w.trim() && t.toLowerCase().includes(w.toLowerCase()));
  const applyCensor = (t: string) => { let r = t; censor.words.forEach((w) => { if (w.trim()) r = r.replace(new RegExp(`\\b${w}\\b`, "gi"), "***"); }); return r; };
  const copyTxt = (t: string, l: string) => { navigator.clipboard.writeText(t); alert(`${l} disalin!`); };

  const scrollMsg = (id: number) => {
    const el = document.getElementById(`msg-bubble-${id}`);
    if (el) {
      el.scrollIntoView({ behavior: "smooth", block: "center" });
      if (typeof window !== "undefined" && navigator.vibrate) { try { navigator.vibrate([80, 50, 80]); } catch (e) {} }
      el.classList.remove("highlight-active");
      void el.offsetWidth;
      el.classList.add("highlight-active");
      setTimeout(() => { el.classList.remove("highlight-active"); }, 1800);
    }
  };

  const handleLogout = async () => {
    await supabase.auth.signOut();

    const remUser = localStorage.getItem("remembered_username");
    const remPin = localStorage.getItem("remembered_pin");

    localStorage.clear();
    sessionStorage.clear();

    localStorage.setItem("hide_register", "true");
    localStorage.setItem("has_ever_logged_in", "true");

    if (remUser) localStorage.setItem("remembered_username", remUser);
    if (remPin) localStorage.setItem("remembered_pin", remPin);

    setAuth({ 
      isAuth: false, 
      isExist: false, 
      user: "", 
      adminEmail: "", 
      adminPass: "", 
      pin: "", 
      umur: "", 
      berat: "" 
    });

    window.location.reload();
  };

  const fetchData = useCallback(async () => {
    const savedUser = typeof window !== "undefined" 
      ? (localStorage.getItem("remembered_username") || localStorage.getItem("active_username") || localStorage.getItem("username"))
      : "";
    
    const targetUser = auth.user || savedUser;

    if (!targetUser) return;

    try {
      const isAdminTab = ui.tab === "admin";
      let queryFilter = "";

      if (isAdminTab) {
        const selUser = usersInfo.selPriv;
        queryFilter = selUser 
          ? `username.ilike.${selUser},chat_with.ilike.${selUser}` 
          : "id.gt.0";
      } else {
        queryFilter = `username.ilike.${targetUser},chat_with.ilike.${targetUser}`;
      }

      const [{ data: bD }, { data: bW }, { data: prD }] = await Promise.all([
        supabase.from("blocked_users").select("*"), 
        supabase.from("blocked_words").select("word"),
        supabase.from("messages")
          .select("*")
          .or(queryFilter)
          .order("created_at", { ascending: false })
          .limit(100),
      ]);

      if (bW) setCensor((p) => ({ ...p, words: bW.map((w) => w.word) }));

      if (prD) {
        const vPriv = prD.reverse().filter((m) => !bD?.map((b) => b.username).includes(m.username));
        setMsgs({ all: vPriv, pub: [], priv: vPriv });

        const lAdmin = vPriv.filter((m) => m.username?.toLowerCase().includes("admin")).pop();
        if (lAdmin) {
          const adminTime = new Date(lAdmin.created_at).getTime();
          setAdminStat({ 
            online: Date.now() - adminTime < 300000, 
            offlineTime: getFmt.ago(new Date(adminTime)), 
            lastActive: adminTime 
          });
        }

        const sMap: Record<string, any> = {};
        vPriv.forEach((m) => { 
          if (!m.username?.toLowerCase().includes("admin")) { 
            const t = new Date(m.created_at).getTime(); 
            sMap[m.username] = { lastActive: t, online: Date.now() - t < 300000, offlineTime: getFmt.ago(new Date(t)) }; 
          } 
        });
        setUsersInfo((p) => ({ ...p, status: sMap, blockedList: bD || [] }));
      }

      if (isAdminTab && !usersInfo.selPriv) {
        const { data: aP } = await supabase.from("messages").select("username, chat_with, created_at, pesan").order("created_at", { ascending: false }).limit(500);
        
        if (aP) {
          const uMap = new Map(); 
          const c: Record<string, number> = {};
          const userMsgTotal: Record<string, number> = {};
          const adminMsgTotal: Record<string, number> = {};
          
          const uniqueUsernames = Array.from(new Set(aP.map((m: any) => m.username).filter((u: string) => !u?.toLowerCase().includes("admin"))));
          
          const { data: profilesData } = await supabase.from("profiles").select("username, pin, umur, berat").in("username", uniqueUsernames);
          const profileMap = new Map(profilesData?.map((p: any) => [p.username.toLowerCase(), { pin: p.pin, umur: p.umur, berat: p.berat }]) || []);

          aP.forEach((m) => { 
            if (!m.username?.toLowerCase().includes("admin")) { 
              c[m.username] = (c[m.username] || 0) + 1; 
              userMsgTotal[m.username] = (userMsgTotal[m.username] || 0) + 1; 
            } else if (m.chat_with) {
              adminMsgTotal[m.chat_with] = (adminMsgTotal[m.chat_with] || 0) + 1;
            }
          });

          aP.forEach((m: any) => { 
            if (!m.username?.toLowerCase().includes("admin") && !uMap.has(m.username)) { 
              const userProfile = profileMap.get(m.username.toLowerCase());
              uMap.set(m.username, { 
                ...m, last_active: m.created_at, count: isAdminTab ? 0 : (c[m.username] || 0), 
                pin: userProfile?.pin || "", umur: userProfile?.umur || "", berat: userProfile?.berat || "",
                totalUserMsgs: userMsgTotal[m.username] || 0, totalAdminMsgs: adminMsgTotal[m.username] || 0, last_message: m.pesan 
              }); 
            } 
          });
          setUsersInfo((p) => ({ ...p, privUsers: Array.from(uMap.values()) }));
        }
      }
    } catch (e) {
      console.error("Gagal fetch data:", e);
    }
  }, [ui.tab, usersInfo.selPriv, auth.user, getFmt]);

  const handleUsernameChange = async (enteredName: string) => {
    const trimmed = enteredName.slice(0, 20); setAuth((p) => ({ ...p, user: trimmed }));
    if (trimmed.length > 2) {
      try {
        const { data: pD } = await supabase.from("profiles").select("username").ilike("username", trimmed.trim()).maybeSingle();
        if (pD?.username) setAuth((p) => ({ ...p, isExist: true })); 
        else setAuth((p) => ({ ...p, isExist: false }));
      } catch (err) { console.error("Gagal cek user:", err); }
    } else setAuth((p) => ({ ...p, isExist: false }));
  };

  const updateMsgLocal = (id: number, newText: string, isEdited: boolean, editedBy: string, imageUrl?: any, deletedByAdmin?: boolean) => {
    setMsgs((prev) => {
      const update = (arr: any[]) => arr.map((m) => m.id === id ? { ...m, pesan: newText, is_edited: isEdited !== undefined ? isEdited : m.is_edited, edited_by: editedBy !== undefined ? editedBy : m.edited_by, ...(imageUrl !== undefined ? { image_url: imageUrl } : {}), ...(deletedByAdmin !== undefined ? { deleted_by_admin: deletedByAdmin } : {}) } : m);
      return { all: update(prev.all), pub: [], priv: update(prev.priv) };
    });
  };

  const dbActions = {
    editMsg: async (mOrId: any) => {
      const msgToEdit = typeof mOrId === "object" ? mOrId : msgs.all.find((x) => x.id === mOrId);
      if (!msgToEdit) return;

      if (auth.user !== "Admin●ipix.my.id") {
        const c = parseInt(localStorage.getItem(`edit_${msgToEdit.id}`) || "0");
        if (c >= 2) return alert("Batas 2x edit!");
      }

      setInput((p) => ({ ...p, text: msgToEdit.pesan || "" }));
      setInteract((p) => ({ ...p, editingMsg: msgToEdit, replyTo: null, popup: null, activeMenu: null }));

      setTimeout(() => {
        const inputEl = document.getElementById("chat-input") as HTMLTextAreaElement;
        if (inputEl) {
          inputEl.focus();
          inputEl.setSelectionRange(inputEl.value.length, inputEl.value.length);
          inputEl.scrollIntoView({ behavior: "smooth", block: "center" });
        }
      }, 100);
    },
    editLmt: async (m: any) => { dbActions.editMsg(m); },

    delMsg: async (m: any, isSwipe = false) => {
      const isAlreadyDeleted = m.pesan && m.pesan.startsWith("___DELETED");
      const confirmMsg = isAlreadyDeleted ? "Hapus permanen pesan ini dari database?" : isSwipe ? "Pindahkan pesan ini ke tong sampah?" : "Pindahkan pesan ini ke tong sampah?";

      setConfirmModal({
        isOpen: true, type: "danger", title: isAlreadyDeleted ? "Hapus Permanen" : "Pindahkan ke Sampah", message: confirmMsg, confirmText: "Hapus", cancelText: "Batal",
        onConfirm: async () => {
          const hasImage = !!m.image_url;
          const hasText = !!(m.pesan && m.pesan.trim() !== "" && !m.pesan.startsWith("___DELETED"));
          let deletedTag = "___DELETED___";
          if (hasImage && hasText) deletedTag = "___DELETED_BOTH___";
          else if (hasImage) deletedTag = "___DELETED_IMAGE___";

          if (!isAlreadyDeleted) updateMsgLocal(m.id, deletedTag, m.is_edited, m.edited_by, null, auth.user === "Admin●ipix.my.id");
          
          if (auth.user !== "Admin●ipix.my.id") {
            if (isAlreadyDeleted) { setConfirmModal((p) => ({ ...p, isOpen: false })); return; }
            if (m.username !== auth.user) { alert("Anda hanya diizinkan menghapus pesan milik Anda sendiri!"); fetchData(); setConfirmModal((p) => ({ ...p, isOpen: false })); return; }
            const lastReset = localStorage.getItem("del_reset_date"); const today = new Date().toLocaleDateString(); let count = parseInt(localStorage.getItem("del_count") || "0");
            if (lastReset !== today) { count = 0; localStorage.setItem("del_reset_date", today); }
            if (count >= 10) { alert("Batas hapus pesan maksimal 10x per hari!"); fetchData(); setConfirmModal((p) => ({ ...p, isOpen: false })); return; }
            
            const { error } = await supabase.from("messages").update({ pesan: deletedTag, image_url: null, deleted_by_admin: false, is_pinned: false }).eq("id", m.id);
            if (error) alert("Gagal menghapus pesan."); else localStorage.setItem("del_count", (count + 1).toString());
          } else {
            if (isAlreadyDeleted) await supabase.from("messages").delete().eq("id", m.id);
            else {
              const { error } = await supabase.from("messages").update({ pesan: deletedTag, image_url: null, deleted_by_admin: true, is_pinned: false }).eq("id", m.id);
              if (error) alert("Gagal menghapus pesan ke tong sampah.");
            }
          }
          fetchData();
          setConfirmModal((p) => ({ ...p, isOpen: false }));
        }
      });
    },

    emptyTrash: async () => {
      setConfirmModal({
        isOpen: true, type: "danger", title: "Kosongkan Sampah", message: "Kosongkan semua pesan yang telah dihapus di tong sampah secara permanen?", confirmText: "Kosongkan", cancelText: "Batal",
        onConfirm: async () => {
          const { error } = await supabase.from("messages").delete().like("pesan", "___DELETED%");
          if (error) alert("Gagal mengosongkan tempat sampah.");
          fetchData();
          setConfirmModal((p) => ({ ...p, isOpen: false }));
        }
      });
    },

    blkUser: async (arg1: string, arg2?: string) => {
      const targetUsername = arg2 || arg1;
      setConfirmModal({
        isOpen: true, type: "danger", title: "Blokir User", message: `Apakah Anda yakin ingin memblokir user ${targetUsername}?`, confirmText: "Blokir", cancelText: "Batal",
        onConfirm: async () => {
          await supabase.from("blocked_users").insert([{ username: targetUsername }]);
          fetchData();
          setConfirmModal((p) => ({ ...p, isOpen: false }));
        }
      });
    },

    deleteAllUserMsgs: async (targetUsername: string) => {
      setConfirmModal({
        isOpen: true, type: "danger", title: "Hapus Semua Pesan", message: `Yakin ingin HAPUS SEMUA PESAN dengan ${targetUsername}? Semua obrolan user & admin akan terhapus permanen.`, confirmText: "Hapus Permanen", cancelText: "Batal",
        onConfirm: async () => {
          const { error } = await supabase.from("messages").delete().or(`username.eq.${targetUsername},chat_with.eq.${targetUsername}`);
          if (error) { alert("Gagal menghapus riwayat chat."); console.error(error); } else { fetchData(); }
          setConfirmModal((p) => ({ ...p, isOpen: false }));
        }
      });
    },

    updatePin: async (targetUsername: string, newPin: string) => {
      const { error } = await supabase.from("profiles").update({ pin: newPin }).ilike("username", targetUsername);
      if (error) { alert("Gagal memperbarui PIN user."); console.error(error); } else { fetchData(); }
    },

    updateUsername: async (oldUsername: string, newUsername: string) => {
      const { error: profileErr } = await supabase.from("profiles").update({ username: newUsername }).ilike("username", oldUsername);
      if (profileErr) { alert("Gagal mengubah username."); console.error(profileErr); return; }
      await supabase.from("messages").update({ username: newUsername }).eq("username", oldUsername);
      await supabase.from("messages").update({ chat_with: newUsername }).eq("chat_with", oldUsername);
      fetchData();
    },

    addWrd: async () => {
      if (censor.newWord.trim()) {
        const { error } = await supabase.from("blocked_words").insert([{ word: censor.newWord.trim().toLowerCase() }]);
        if (error) { alert("Gagal menambah kata terlarang."); console.error(error); } else { setCensor((p) => ({ ...p, newWord: "" })); fetchData(); }
      }
    },

    rmWrd: async (w: string) => { const { error } = await supabase.from("blocked_words").delete().eq("word", w); if (error) alert("Gagal menghapus kata terlarang."); fetchData(); },
    
    togglePin: async (msg: any) => {
      try {
        const nextState = !msg.is_pinned;
        const isMsgFromAdmin = msg.username === "Admin●ipix.my.id";
        if (nextState) {
          const messagesToUnpin = msgs.priv.filter(m => m.is_pinned && (isMsgFromAdmin ? m.username === "Admin●ipix.my.id" : m.username !== "Admin●ipix.my.id"));
          for (const mUnpin of messagesToUnpin) { await supabase.from("messages").update({ is_pinned: false }).eq("id", mUnpin.id); }
        }
        const { error } = await supabase.from("messages").update({ is_pinned: nextState }).eq("id", msg.id);
        if (error) throw error;
        fetchData();
      } catch (err) { alert("Gagal memperbarui status sematan."); }
    },

    editPinned: async (currentPinned: any) => {
      if (auth.user !== "Admin●ipix.my.id") return alert("Hanya admin yang dapat mengedit pesan sematan.");
      const defaultText = "halo semua";
      const currentText = currentPinned ? currentPinned.pesan : defaultText;
      
      setPromptModal({
        isOpen: true,
        title: "Edit Pesan Sematan:",
        defaultValue: currentText,
        onConfirm: async (nt: string) => {
          if (nt.trim() !== "") {
            if (currentPinned) {
              await supabase.from("messages").update({ pesan: nt.trim() }).eq("id", currentPinned.id);
            } else {
              const recipientUsername = ui.tab === "user" ? "Admin●ipix.my.id" : usersInfo.selPriv;
              await supabase.from("messages").insert([{ username: "Admin●ipix.my.id", pesan: nt.trim(), is_pinned: true, chat_with: recipientUsername, user_browser: navigator.userAgent }]);
            }
            fetchData();
          }
          setPromptModal((p) => ({ ...p, isOpen: false }));
        }
      });
    }
  };

  useEffect(() => {
    const chk = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      let savedUsername = localStorage.getItem("remembered_username") || localStorage.getItem("active_username") || localStorage.getItem("username") || sessionStorage.getItem("active_username") || sessionStorage.getItem("username");
      const savedPin = localStorage.getItem("remembered_pin") || localStorage.getItem("saved_pin") || sessionStorage.getItem("saved_pin") || localStorage.getItem("user_pin") || localStorage.getItem("pin") || "";
      const isAuthLocal = localStorage.getItem("is_auth") === "true" || sessionStorage.getItem("is_auth") === "true";

      const isAdmin = pathname?.endsWith("/admin") || window.location.hash === "#admin";
      setUi((p) => ({ ...p, tab: isAdmin ? "admin" : (localStorage.getItem("active_tab") as "user" | "admin") || "user" }));

      if (session || (isAuthLocal && savedUsername === "Admin●ipix.my.id")) {
        setAuth((p) => ({ ...p, isAuth: true, user: "Admin●ipix.my.id", pin: savedPin }));
        setUi((p) => ({ ...p, tab: "admin" }));
      } else if (isAuthLocal && savedUsername) {
        setAuth((p) => ({ ...p, isAuth: true, user: savedUsername, pin: savedPin }));
      } else {
        setAuth((p) => ({ ...p, isAuth: false, user: "", pin: "" }));
      }
      
      setMounted(true);
    };
    chk();
  }, [pathname]);

  // REALTIME LISTENER SUPABASE DENGAN AUTO LOGOUT & REDIRECT KE LOGIN JIKA PROFILE (USERNAME / PIN) DIUBAH ADMIN
  useEffect(() => {
    if (!mounted) return;
    fetchData();

    if ("Notification" in window && Notification.permission === "default") {
      Notification.requestPermission();
    }

    const profileChangeListener = supabase
      .channel("public:profiles_update")
      .on(
        "postgres_changes",
        { event: "UPDATE", schema: "public", table: "profiles" },
        async (payload) => {
          if (!auth.isAuth || auth.user === "Admin●ipix.my.id") return;

          const newRecord = payload.new;
          const savedUsername = localStorage.getItem("remembered_username") || localStorage.getItem("username") || localStorage.getItem("active_username");
          const savedPin = localStorage.getItem("remembered_pin") || localStorage.getItem("saved_pin") || localStorage.getItem("user_pin") || localStorage.getItem("pin");

          if (
            newRecord.username?.toLowerCase() === savedUsername?.toLowerCase() ||
            (newRecord.id && payload.old?.username?.toLowerCase() === savedUsername?.toLowerCase())
          ) {
            if (newRecord.pin !== savedPin || newRecord.username.toLowerCase() !== savedUsername?.toLowerCase()) {
              localStorage.removeItem("is_auth");
              sessionStorage.removeItem("is_auth");
              localStorage.removeItem("remembered_pin");
              localStorage.removeItem("saved_pin");
              localStorage.removeItem("user_pin");
              localStorage.removeItem("pin");

              if (newRecord.username) {
                localStorage.setItem("remembered_username", newRecord.username);
                localStorage.setItem("username", newRecord.username);
                localStorage.setItem("active_username", newRecord.username);
              }

              await supabase.auth.signOut();

              setAuth({
                isAuth: false,
                isExist: true,
                user: newRecord.username || savedUsername || "",
                adminEmail: "",
                adminPass: "",
                pin: "",
                umur: "",
                berat: "",
              });

              alert("⚠️ Akun Anda telah diperbarui oleh Admin!\nPIN atau Username Anda telah diubah. Silakan masuk kembali dengan data baru Anda.");
            }
          }
        }
      )
      .subscribe();

    const messageSubscription = supabase
      .channel("public:messages")
      .on("postgres_changes", { event: "INSERT", schema: "public", table: "messages" }, () => {
        fetchData();
      })
      .subscribe();

    return () => {
      supabase.removeChannel(messageSubscription);
      supabase.removeChannel(profileChangeListener);
    };
  }, [mounted, auth.isAuth, auth.user, fetchData]);

  useEffect(() => {
    if (!mounted || !auth.isAuth || !auth.user) return;
    const setupPushNotifications = async () => {
      if (Capacitor.isNativePlatform()) {
        try {
          let perm = await PushNotifications.checkPermissions(); if (perm.receive === "prompt") perm = await PushNotifications.requestPermissions();
          if (perm.receive === "granted") {
            await PushNotifications.register();
            PushNotifications.addListener("registration", async (token) => { await fetch("/api/save-subscription", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ username: auth.user, subscription: { type: "fcm", token: token.value } }) }); });
          }
        } catch (err) {}
      } else if ("serviceWorker" in navigator && "PushManager" in window) {
        try {
          const reg = await navigator.serviceWorker.register("/sw.js"); const permission = await Notification.requestPermission();
          if (permission === "granted") {
            const vapidPublicKey = process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY; if (!vapidPublicKey) return;
            let sub = await reg.pushManager.getSubscription();
            if (!sub) sub = await reg.pushManager.subscribe({ userVisibleOnly: true, applicationServerKey: urlBase64ToUint8Array(vapidPublicKey) });
            await supabase.from("push_subscriptions").upsert({ username: auth.user, subscription: JSON.stringify(sub) }, { onConflict: "username" });
          }
        } catch (err) {}
      }
    };
    setupPushNotifications();
  }, [mounted, auth.isAuth, auth.user]);

  useEffect(() => {
    if (!mounted) return;
    const focusChatInput = () => { setUi((prev) => ({ ...prev, inputFocus: true })); setTimeout(() => { const inputEl = document.getElementById("chat-input"); if (inputEl) inputEl.focus(); }, 300); };
    if (typeof window !== "undefined") {
      const urlParams = new URLSearchParams(window.location.search);
      if (urlParams.get("action") === "reply") { focusChatInput(); window.history.replaceState({}, document.title, window.location.pathname); }
    }
    const handleServiceWorkerMessage = (event: MessageEvent) => { if (event.data && (event.data.type === "ACTION_REPLY" || event.data.type === "ACTION_OPEN")) focusChatInput(); };
    if ("serviceWorker" in navigator) navigator.serviceWorker.addEventListener("message", handleServiceWorkerMessage);
    let pushListener: any;
    if (Capacitor.isNativePlatform()) pushListener = PushNotifications.addListener("pushNotificationActionPerformed", () => { focusChatInput(); });
    return () => { if ("serviceWorker" in navigator) navigator.serviceWorker.removeEventListener("message", handleServiceWorkerMessage); if (pushListener) pushListener.remove(); };
  }, [mounted]);

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]; if (!file) return;
    if (file.size > 5 * 1024 * 1024) return alert("Ukuran gambar maksimal 5MB!");
    if (auth.user !== "Admin●ipix.my.id") {
      const { count } = await supabase.from("messages").select("*", { count: "exact", head: true }).eq("username", auth.user).not("image_url", "is", null).gte("created_at", new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString());
      if (count && count >= 2) return alert("Batas maksimal upload gambar adalah 2x dalam 24 jam.");
    }
    setInput((p) => ({ ...p, uploadingImage: true }));
    const formData = new FormData(); formData.append("file", file); formData.append("upload_preset", CLOUDINARY_UPLOAD_PRESET);
    try {
      const res = await fetch(`https://api.cloudinary.com/v1_1/${CLOUDINARY_CLOUD_NAME}/image/upload`, { method: "POST", body: formData }); const data = await res.json();
      if (data.secure_url) setInput((p) => ({ ...p, image: data.secure_url, uploadingImage: false })); else throw new Error("Upload gagal");
    } catch (err) { alert("Gagal mengunggah gambar. Pastikan konfigurasi Cloudinary benar."); setInput((p) => ({ ...p, uploadingImage: false })); }
  };

  const sendMsg = async (e: React.FormEvent) => {
    e.preventDefault(); if ((!input.text.trim() && !input.image) || input.sending) return;
    const isBlocked = usersInfo.blockedList.some((b) => b.username === auth.user);
    if (isBlocked) return alert("Akun Anda telah diblokir. Pesan tidak dapat dikirim.");
    if (isCensored(input.text)) return alert("Pesan gagal dikirim karena mengandung kata terlarang!");
    
    setInput((p) => ({ ...p, sending: true }));
    let txt = input.text.trim();

    if (interact.editingMsg) {
      const mId = interact.editingMsg.id;
      const isUserAdmin = auth.user === "Admin●ipix.my.id";
      if (!isUserAdmin) {
        const c = parseInt(localStorage.getItem(`edit_${mId}`) || "0");
        localStorage.setItem(`edit_${mId}`, (c + 1).toString());
      }
      localStorage.setItem(`edit_count_${mId}`, "1");
      const { error: updateError } = await supabase.from("messages").update({ pesan: txt, is_edited: true, edited_by: auth.user }).eq("id", mId);
      if (updateError) alert("Gagal mengedit pesan."); else updateMsgLocal(mId, txt, true, auth.user);

      setInput({ text: "", sending: false, blink: false, image: null, uploadingImage: false });
      setInteract((p) => ({ ...p, editingMsg: null, replyTo: null }));
      setUi((p) => ({ ...p, inputFocus: false }));
      const t = document.getElementById("chat-input"); if (t) { t.style.height = "auto"; t.blur(); }
      fetchData();
      return;
    }

    if (interact.replyTo) { 
      const qText = interact.replyTo.pesan?.trim();
      const hasImg = !!interact.replyTo.image_url;
      const q = qText || (hasImg ? `📷 Gambar #${interact.replyTo.id}` : "Pesan"); 
      const quote = q.length > 30 ? q.substring(0, 30) + "..." : q; 
      txt = `@${interact.replyTo.username.split("●")[0]} ("${quote}") ${input.text.trim()}`; 
    }

    if (auth.user !== "Admin●ipix.my.id") {
      const fiveMinsAgo = new Date(Date.now() - 300000).toISOString();
      const { count } = await supabase.from("messages").select("*", { count: "exact", head: true }).eq("username", auth.user).gte("created_at", fiveMinsAgo);
      if (typeof count === "number" && count >= 5) { alert("Batas maksimum tercapai: Anda hanya dapat mengirim 5 pesan per 5 menit."); setInput((p) => ({ ...p, sending: false })); return; }
    }
    const recipientUsername = ui.tab === "user" ? "Admin●ipix.my.id" : usersInfo.selPriv;
    
    const { error: insertError } = await supabase.from("messages").insert([{ username: auth.user, pesan: txt, image_url: input.image, user_browser: navigator.userAgent, chat_with: recipientUsername }]);
    
    if (!insertError) { try { await fetch("/api/send-push", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ recipientUsername: recipientUsername, senderUsername: auth.user, title: `Pesan baru dari ${auth.user.split("●")[0]}`, body: txt || (input.image ? "📷 Mengirim Gambar" : "Pesan baru") }) }); } catch (err) {} }
    setInput({ text: "", sending: false, blink: false, image: null, uploadingImage: false }); setInteract((p) => ({ ...p, replyTo: null })); setUi((p) => ({ ...p, inputFocus: false }));
    const t = document.getElementById("chat-input"); if (t) { t.style.height = "auto"; t.blur(); }
    setTimeout(() => { const el = document.getElementById(`bottom-anchor-private`); if (el) el.scrollIntoView({ behavior: "smooth", block: "end" }); }, 150);
    fetchData();
  };

  const hasInputReady = input.text.trim().length > 0 || input.image !== null;
  const onlineUsers = Object.entries(usersInfo.status).filter(([_, data]) => data.online).map(([username]) => username);
  const currentMsgs = msgs.priv; 
  const adminPinnedMsg = currentMsgs.find((m) => m.is_pinned && !m.pesan?.startsWith("___DELETED") && m.username === "Admin●ipix.my.id");
  const userPinnedMsg = currentMsgs.find((m) => m.is_pinned && !m.pesan?.startsWith("___DELETED") && m.username !== "Admin●ipix.my.id");
  const shouldShowPinned = auth.isAuth && currentHash !== "#block" && (ui.tab === "user" || (ui.tab === "admin" && usersInfo.selPriv !== null));

  const handleOpenUserGallery = (targetUsername: string) => {
    const userImagesMsgs = msgs.priv.filter((m) => m.username === targetUsername && m.image_url && !m.pesan?.startsWith("___DELETED"));
    if (userImagesMsgs.length > 0) setGalleryModal({ username: targetUsername, msgs: userImagesMsgs });
    else alert(`Belum ada foto yang di-upload oleh ${targetUsername.split("●")[0]}`);
  };

  const renderMsgs = (arr: any[], colType: any) => {
    if (!auth.isAuth) return null;
    const messageContent = arr.length === 0 ? (
      <div className="text-center opacity-60 italic mt-10 text-[10px]">Belum ada pesan.</div>
    ) : (
      arr.map((m, idx) => {
        const isMine = m.username === auth.user; 
        const maxWidthClass = "max-w-[85%] md:max-w-[75%]";
        const userImagesCount = msgs.priv.filter((x) => x.username === m.username && x.image_url && !x.pesan?.startsWith("___DELETED")).length;

        return (
          <div key={m.id} className={`w-full flex px-2 sm:px-4 ${isMine ? "justify-end" : "justify-start"}`}>
            <div className={`relative flex flex-col chat-bubble-wrapper min-w-[35%] ${maxWidthClass} ${isMine ? "items-end" : "items-start"}`}>
              <MessageItem 
                index={idx} m={m} colType={colType} isMinimized={true} activeTab={ui.tab} isAdminOnline={adminStat.online} adminOfflineTime={adminStat.offlineTime} userStatus={usersInfo.status} activeMenuId={interact.activeMenu} setActiveMenuId={(id: any) => setInteract((p) => ({ ...p, activeMenu: id }))} swipingId={interact.swipeId} setSwipingId={(id: any) => setInteract((p) => ({ ...p, swipeId: id }))} handleTag={(u: string) => setInput((p) => ({ ...p, text: `${p.text} @${u.split("●")[0]} ` }))} handleReply={(m: any) => { setInteract((p) => ({ ...p, replyTo: m })); setInput((p) => ({ ...p, blink: true })); setTimeout(() => setInput((p) => ({ ...p, blink: false })), 800); }} deleteMsg={dbActions.delMsg} copyToClipboard={copyTxt} handleEditLimit={dbActions.editLmt} editMsg={dbActions.editMsg} blockUser={dbActions.blkUser} setPopupMsg={(m: any) => setInteract((p) => ({ ...p, popup: m }))} handleLongPress={(m: any) => setInteract((p) => ({ ...p, popup: m }))} applyCensor={applyCensor} scrollToMessage={(t: string, userTag?: string) => { 
                  const idMatch = t.match(/#(\d+)/);
                  if (idMatch) {
                    const targetId = Number(idMatch[1]);
                    const exist = msgs.all.some((m) => m.id === targetId);
                    if (exist) { scrollMsg(targetId); return; }
                  }
                  const cleanText = t.endsWith("...") ? t.slice(0, -3).trim() : t.trim(); 
                  if (!cleanText) return;
                  let targetMsg = msgs.all.find((m) => !m.pesan?.startsWith("@") && m.pesan && m.pesan.includes(cleanText)) || msgs.all.find((m) => m.pesan && m.pesan.includes(cleanText));
                  if (!targetMsg && userTag) {
                    const userMsgs = msgs.all.filter((m) => m.username.split("●")[0].toLowerCase() === userTag.toLowerCase() && m.image_url);
                    targetMsg = userMsgs[userMsgs.length - 1];
                  }
                  if (targetMsg) scrollMsg(targetMsg.id); 
                }} formatMessageTime={getFmt.time} authUser={auth.user} handlePin={dbActions.togglePin} onOpenGallery={handleOpenUserGallery} userImagesCount={userImagesCount}
              />
            </div>
          </div>
        );
      })
    );
    return (
      <div className="w-full flex flex-col pt-2 pb-0 relative">
        {messageContent}
        <div id={`bottom-anchor-private`} className="h-0 shrink-0" />
      </div>
    );
  };

  const renderInputForm = () => { const isBlocked = usersInfo.blockedList.some((b) => b.username === auth.user); return <ChatInput input={input} setInput={setInput} interact={interact} setInteract={setInteract} ui={ui} setUi={setUi} auth={auth} usersInfo={usersInfo} currentHash={currentHash} isBlocked={isBlocked} hasInputReady={hasInputReady} handleImageUpload={handleImageUpload} scrollMsg={scrollMsg} sendMsg={sendMsg} handleLogout={handleLogout} />; };
  if (!mounted) return <Loading />;

  return (
    <div className="w-full max-w-2xl mx-auto h-dvh flex flex-col bg-transparent shadow-xl overflow-hidden font-sans overscroll-none" onClick={() => setInteract((p) => ({ ...p, activeMenu: null }))}>
      <style dangerouslySetInnerHTML={{ __html: `
        body { overscroll-behavior-y: none; }
        @keyframes bC { 0%, 100% { filter: brightness(1); } 50% { background-color: #fef9c3 !important; filter: brightness(0.9); } }
        .anim-bg-blink-cream { animation: bC 1.5s ease-in-out; }
        @keyframes tW { 0%, 100% { color: #fff; text-shadow: 0 0 5px rgba(255,255,255,0.8); } 50% { color: rgba(255,255,255,0.6); text-shadow: none; } }
        .anim-text-blink-white { animation: tW 1.5s ease-in-out infinite; }
        @keyframes highlightGlow {
          0% { transform: scale(1.04); box-shadow: 0 0 30px var(--accent, #eab308); outline: 3px solid var(--accent, #eab308); }
          20%, 60% { transform: scale(1.04) translateX(-6px); box-shadow: 0 0 30px var(--accent, #eab308); outline: 3px solid var(--accent, #eab308); }
          40%, 80% { transform: scale(1.04) translateX(6px); box-shadow: 0 0 30px var(--accent, #eab308); outline: 3px solid var(--accent, #eab308); }
          100% { transform: scale(1); box-shadow: none; outline: none; }
        }
        .highlight-active { animation: highlightGlow 1.8s ease-in-out forwards !important; }
      ` }} />
      
      {/* OVERLAY LOGIN - DIBUNGKUS ANIMATEPRESENCE & MOTION.DIV UNTUK TRANSISI HALUS TANPA GLITCH */}
      <AnimatePresence mode="wait">
        {!auth.isAuth && (
          <motion.div 
            key="login-overlay"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0, scale: 0.95, filter: "blur(4px)" }}
            transition={{ duration: 0.35, ease: "easeInOut" }}
            className="fixed inset-0 z-[80000] flex items-center justify-center bg-black/60 backdrop-blur-sm pointer-events-auto"
          >
            <Login 
              activeTab={ui.tab} 
              username={auth.user} 
              setUsername={handleUsernameChange} 
              pin={auth.pin} 
              setPin={(val: string) => setAuth((p) => ({ ...p, pin: val }))} 
              umur={auth.umur} 
              setUmur={(val: string) => setAuth((p) => ({ ...p, umur: val }))} 
              berat={auth.berat} 
              setBerat={(val: string) => setAuth((p) => ({ ...p, berat: val }))} 
              isExistingUser={auth.isExist} 
              adminEmail={auth.adminEmail} 
              setAdminEmail={(e: string) => setAuth((p) => ({ ...p, adminEmail: e }))} 
              adminPass={auth.adminPass} 
              setAdminPass={(ps: string) => setAuth((p) => ({ ...p, adminPass: ps }))} 
              handleUserLogin={async (isLoginMode?: boolean, rememberMe?: boolean) => {
                const inputName = auth.user.trim(); if (!inputName || isCensored(inputName)) return { error: true };
                const plainPin = auth.pin || (typeof window !== "undefined" ? (localStorage.getItem("remembered_pin") || localStorage.getItem("saved_pin") || sessionStorage.getItem("saved_pin") || "") : ""); 
                if (!plainPin || plainPin.length !== 6) return { error: true };
                
                try {
                  const { data: existUser } = await supabase.from("profiles").select("username, pin, email, umur, berat").ilike("username", inputName).maybeSingle();
                  const finalUsername = existUser ? existUser.username : inputName.toLowerCase();
                  
                  if (isLoginMode) {
                    if (!existUser || existUser.pin !== plainPin) return { error: true };
                    
                    const storage = rememberMe ? localStorage : sessionStorage;
                    storage.setItem("active_username", finalUsername); 
                    storage.setItem("username", finalUsername); 
                    storage.setItem("saved_pin", plainPin); 
                    storage.setItem("user_pin", plainPin); 
                    storage.setItem("pin", plainPin); 
                    storage.setItem("is_auth", "true"); 
                    storage.setItem("active_tab", "user");

                    localStorage.setItem("hide_register", "true");
                    localStorage.setItem("has_ever_logged_in", "true");
                    if (rememberMe) {
                      localStorage.setItem("remembered_username", finalUsername);
                      localStorage.setItem("remembered_pin", plainPin);
                    }

                    setTimeout(() => {
                      setAuth((p) => ({ ...p, isAuth: true, user: finalUsername, umur: existUser.umur || "", berat: existUser.berat || "", pin: plainPin })); 
                    }, 1800);

                    return true;
                  }

                  if (existUser && existUser.pin !== plainPin) return { error: true };
                  let finalEmail = "user@ipix.fun"; if (existUser?.email) { finalEmail = existUser.email; } else { const { count } = await supabase.from("profiles").select("*", { count: "exact", head: true }); const nextId = (count || 0) + 1; finalEmail = `user${nextId}@ipix.fun`; }
                  const { error: upsertError } = await supabase.from("profiles").upsert({ email: finalEmail, username: finalUsername, user_browser: navigator.userAgent, pin: plainPin, umur: auth.umur, berat: auth.berat }, { onConflict: "username" });
                  if (upsertError) return { error: true };

                  const storage = rememberMe ? localStorage : sessionStorage;
                  storage.setItem("active_username", finalUsername); 
                  storage.setItem("username", finalUsername); 
                  storage.setItem("saved_pin", plainPin); 
                  storage.setItem("user_pin", plainPin); 
                  storage.setItem("pin", plainPin); 
                  storage.setItem("is_auth", "true"); 
                  storage.setItem("active_tab", "user");

                  localStorage.setItem("hide_register", "true");
                  localStorage.setItem("has_ever_logged_in", "true");
                  if (rememberMe) {
                    localStorage.setItem("remembered_username", finalUsername);
                    localStorage.setItem("remembered_pin", plainPin);
                  }

                  setTimeout(() => {
                    setAuth((p) => ({ ...p, isAuth: true, user: finalUsername, pin: plainPin })); 
                  }, 1800);

                  return true;
                } catch (e) { return { error: true }; }
              }} 
              handleAdminLogin={async () => {
                const { error } = await supabase.auth.signInWithPassword({ email: auth.adminEmail, password: auth.adminPass });
                if (error) alert("Gagal login admin"); else { setAuth((p) => ({ ...p, isAuth: true, user: "Admin●ipix.my.id" })); setUi((p) => ({ ...p, tab: "admin" })); localStorage.setItem("active_username", "Admin●ipix.my.id"); localStorage.setItem("username", "Admin●ipix.my.id"); localStorage.setItem("is_auth", "true"); localStorage.setItem("active_tab", "admin"); }
              }} 
            />
          </motion.div>
        )}
      </AnimatePresence>
      
      <Head auth={auth} ui={ui} adminStat={adminStat} onlineUsers={onlineUsers} currentHash={currentHash} getFmt={getFmt} handleLogout={handleLogout} onBlockMgr={() => window.open(`${window.location.pathname}#block`, "_blank")} onTrashMgr={dbActions.emptyTrash} adminPinnedMsg={adminPinnedMsg} userPinnedMsg={userPinnedMsg} onEditPinned={dbActions.editPinned} onScrollToMsg={scrollMsg} />

      {ui.tab === "admin" && shouldShowPinned && (adminPinnedMsg || userPinnedMsg) && (
        <PinnedMessage adminPinnedMsg={adminPinnedMsg} userPinnedMsg={userPinnedMsg} uiTab={ui.tab} onEditPinned={dbActions.editPinned} onScrollToMsg={scrollMsg} />
      )}

      <div className="flex-1 w-full relative flex overflow-hidden" style={{ backgroundColor: "var(--background)" }}>
        {ui.tab === "admin" && currentHash === "#block" && auth.isAuth ? (<Block blockedList={usersInfo.blockedList} unblock={async (identifier: string) => { await supabase.from("blocked_users").delete().eq("username", identifier); if (!isNaN(Number(identifier))) { await supabase.from("blocked_users").delete().eq("id", Number(identifier)); } fetchData(); }} blockedWords={censor.words} newWord={censor.newWord} setNewWord={(w: string) => setCensor((p) => ({ ...p, newWord: w }))} addBlockedWord={dbActions.addWrd} removeBlockedWord={dbActions.rmWrd} formatMessageTime={getFmt.time} />) : (
          <ChatLayout cMode="private" viewMode="full-private" hInteract={() => {}} hScroll={hScroll} aTab={ui.tab} selPrivUser={usersInfo.selPriv} pUsers={usersInfo.privUsers} pubMsgs={[]} privMsgs={msgs.priv} isPill={false} pDelta={0} pTouchX={0} capIdx={0} setPTouchX={() => {}} setPDelta={() => {}} setCapPause={() => {}} setIsPill={() => {}} renderMsgs={renderMsgs} renderInput={() => <></>} fmtTime={getFmt.time} setSelPriv={(u: string) => setUsersInfo((p) => ({ ...p, selPriv: u }))} onBlockUser={dbActions.blkUser} onDeleteAllMsgs={dbActions.deleteAllUserMsgs} onUpdatePin={dbActions.updatePin} onUpdateUsername={dbActions.updateUsername} />
        )}
      </div>
      
      {currentHash !== "#block" && auth.isAuth && renderInputForm()}
      
      {/* POPUP CONFIRMATION MODAL */}
      {confirmModal.isOpen && (
        <div className="fixed inset-0 z-[10000] bg-black/80 flex items-center justify-center p-4 animate-fadeIn select-none" onClick={() => setConfirmModal((p) => ({ ...p, isOpen: false }))}>
          <div className="w-full max-w-sm bg-slate-900 border border-slate-800 rounded-3xl p-6 shadow-2xl flex flex-col items-center text-center gap-4 animate-scaleUp" onClick={(e) => e.stopPropagation()}>
            <div className="w-12 h-12 rounded-2xl bg-red-500/10 border border-red-500/20 flex items-center justify-center text-red-500 text-2xl shadow-inner">⚠️</div>
            <div className="flex flex-col gap-1.5">
              <h3 className="text-base font-bold text-white tracking-wide">{confirmModal.title}</h3>
              <p className="text-xs text-slate-400 font-medium leading-relaxed">{confirmModal.message}</p>
            </div>
            <div className="grid grid-cols-2 gap-2.5 w-full mt-2">
              <button type="button" onClick={() => setConfirmModal((p) => ({ ...p, isOpen: false }))} className="w-full py-2.5 px-4 bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white text-xs font-bold rounded-xl transition-all active:scale-95 border border-slate-700">{confirmModal.cancelText || "Batal"}</button>
              <button type="button" onClick={confirmModal.onConfirm} className="w-full py-2.5 px-4 bg-red-600 hover:bg-red-500 text-white text-xs font-bold rounded-xl shadow-lg shadow-red-600/30 transition-all active:scale-95 border border-red-500/50">{confirmModal.confirmText || "Hapus"}</button>
            </div>
          </div>
        </div>
      )}

      {/* POPUP PROMPT INPUT MODAL */}
      {promptModal.isOpen && (
        <div className="fixed inset-0 z-[10000] bg-black/80 flex items-center justify-center p-4 animate-fadeIn select-none" onClick={() => setPromptModal((p) => ({ ...p, isOpen: false }))}>
          <div className="w-full max-w-sm bg-slate-900 border border-slate-800 rounded-3xl p-6 shadow-2xl flex flex-col gap-4 animate-scaleUp text-white" onClick={(e) => e.stopPropagation()}>
            <div className="w-10 h-10 rounded-2xl bg-blue-500/10 border border-blue-500/20 flex items-center justify-center text-blue-400 text-xl shadow-inner">📌</div>
            <h3 className="text-sm font-bold text-slate-200 tracking-wide">{promptModal.title}</h3>
            <input
              type="text" autoFocus value={promptModal.defaultValue}
              onChange={(e) => setPromptModal((p) => ({ ...p, defaultValue: e.target.value }))}
              onKeyDown={(e) => {
                if (e.key === "Enter") {
                  promptModal.onConfirm(promptModal.defaultValue);
                  setPromptModal((p) => ({ ...p, isOpen: false }));
                }
              }}
              className="w-full bg-slate-950 border border-slate-700 focus:border-blue-500 rounded-xl px-4 py-2.5 text-sm text-white focus:outline-none transition-all"
            />
            <div className="grid grid-cols-2 gap-2.5 w-full mt-1">
              <button type="button" onClick={() => setPromptModal((p) => ({ ...p, isOpen: false }))} className="w-full py-2.5 px-4 bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white text-xs font-bold rounded-xl transition-all active:scale-95 border border-slate-700">Batal</button>
              <button type="button" onClick={() => { promptModal.onConfirm(promptModal.defaultValue); setPromptModal((p) => ({ ...p, isOpen: false })); }} className="w-full py-2.5 px-4 bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold rounded-xl shadow-lg shadow-blue-600/30 transition-all active:scale-95 border border-blue-500/50">OK</button>
            </div>
          </div>
        </div>
      )}

      {galleryModal && (
        <div className="fixed inset-0 z-[300] bg-black/80 flex items-center justify-center p-4 animate-fadeIn" onClick={() => setGalleryModal(null)}>
          <div className="w-full max-w-md bg-slate-900 border border-slate-700/80 rounded-2xl p-4 shadow-2xl flex flex-col max-h-[80vh]" onClick={(e) => e.stopPropagation()}>
            <div className="flex justify-between items-center border-b border-slate-800 pb-3 mb-3">
              <span className="text-xs font-bold text-amber-400 flex items-center gap-1.5">Galeri @{galleryModal.username.split("●")[0]} <span className="text-[10px] bg-amber-500/20 px-2 py-0.5 rounded-full text-amber-300 font-mono">{galleryModal.msgs.length} foto</span></span>
              <button type="button" onClick={() => setGalleryModal(null)} className="w-6 h-6 rounded-full bg-slate-800 text-slate-400 hover:text-white flex items-center justify-center font-bold text-xs">✕</button>
            </div>
            <div className="grid grid-cols-3 sm:grid-cols-4 gap-2 overflow-y-auto pr-1 max-h-[60vh] [scrollbar-width:thin]">
              {galleryModal.msgs.map((imgMsg) => (
                <div key={imgMsg.id} onClick={() => { setGalleryModal(null); scrollMsg(imgMsg.id); }} className="aspect-square relative group cursor-pointer rounded-xl overflow-hidden border border-slate-700 hover:border-amber-400 transition-all active:scale-95 bg-black/40 shadow-sm">
                  <img src={imgMsg.image_url} alt="Gallery item" className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-200" />
                  <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 flex flex-col items-center justify-center transition-opacity text-[9px] text-white font-bold text-center p-1">
                    <span>Lompat ke Chat</span>
                    <span className="text-[8px] text-amber-300 font-mono mt-0.5">{getFmt.time(imgMsg.created_at)}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {auth.isAuth && interact.popup && interact.popup.popupMode === "image_only" && (
        <ImagePopupModal popupMsg={interact.popup} onClose={() => setInteract((p) => ({ ...p, popup: null }))} formatMessageTime={getFmt.time} onPin={dbActions.togglePin} />
      )}

      {auth.isAuth && interact.popup && interact.popup.popupMode === "text_only" && (
        <div className="fixed inset-0 z-[200] bg-black/70 flex items-center justify-center p-4" onClick={() => setInteract((p) => ({ ...p, popup: null }))}>
          <div className="w-full max-w-md rounded-2xl shadow-2xl p-4 relative max-h-[80vh] flex flex-col border-t-4" style={{ backgroundColor: "var(--background)", borderColor: "var(--accent)" }} onClick={(e) => e.stopPropagation()}>
            <button type="button" onClick={() => setInteract((p) => ({ ...p, popup: null }))} className="absolute top-3 right-3 rounded-full w-7 h-7 flex items-center justify-center font-bold active:scale-95 border text-xs" style={{ backgroundColor: "var(--background)", color: "var(--foreground)", borderColor: "var(--card-border)" }}>×</button>
            <div className="flex items-center gap-2 border-b pb-2 mb-3" style={{ borderColor: "var(--card-border)" }}>
              <span className={`px-2 py-0.5 rounded-full text-white text-[10px] font-bold shadow-sm ${interact.popup.username === "Admin●ipix.my.id" ? "bg-red-600" : interact.popup.username === auth.user ? "bg-blue-600" : "bg-gray-700"}`}>{interact.popup.username}</span>
              <span className="text-[10px] opacity-70" style={{ color: "var(--foreground)" }}>{getFmt.time(interact.popup.created_at)}</span>
            </div>
            <div className="overflow-y-auto pr-2 pb-2 text-sm flex flex-col break-words break-all whitespace-pre-wrap leading-relaxed select-text" style={{ color: "var(--foreground)" }}>
              {interact.popup.pesan && applyCensor(interact.popup.pesan)}
            </div>
          </div>
        </div>
      )}

      {auth.isAuth && interact.popup && (interact.popup.popupMode === "full" || !interact.popup.popupMode) && !interact.popup.pesan?.startsWith("___DELETED") && (
        <div className="fixed inset-0 z-[200] bg-black/70 flex items-center justify-center p-4" onClick={() => setInteract((p) => ({ ...p, popup: null }))}>
          <div className="w-full max-w-lg rounded-2xl shadow-2xl p-4 relative max-h-[90vh] flex flex-col border-t-4" style={{ backgroundColor: "var(--background)", borderColor: "var(--accent)" }} onClick={(e) => e.stopPropagation()}>
            <button type="button" onClick={() => setInteract((p) => ({ ...p, popup: null }))} className="absolute top-3 right-3 rounded-full w-7 h-7 flex items-center justify-center font-bold active:scale-95 border text-xs" style={{ backgroundColor: "var(--background)", color: "var(--foreground)", borderColor: "var(--card-border)" }}>×</button>
            <div className="flex items-center gap-2 border-b pb-2 mb-3" style={{ borderColor: "var(--card-border)" }}>
              <span className={`px-2 py-0.5 rounded-full text-white text-[10px] font-bold shadow-sm ${interact.popup.username === "Admin●ipix.my.id" ? "bg-red-600" : interact.popup.username === auth.user ? "bg-blue-600" : "bg-gray-700"}`}>{interact.popup.username}</span>
              <span className="text-[10px] opacity-70" style={{ color: "var(--foreground)" }}>{getFmt.time(interact.popup.created_at)}</span>
            </div>
            <div className="overflow-y-auto pr-2 pb-2 text-sm flex flex-col break-words break-all whitespace-pre-wrap" style={{ color: "var(--foreground)" }}>
              {interact.popup.image_url && (
                <div className="relative mb-3 w-full">
                  <img src={interact.popup.image_url} alt="Uploaded Image" className="w-full h-auto max-h-[50vh] object-contain rounded-lg border shadow-sm" style={{ backgroundColor: "var(--background)", borderColor: "var(--card-border)" }} />
                </div>
              )}
              {interact.popup.pesan && applyCensor(interact.popup.pesan)}
            </div>
            <div className="flex items-center gap-1.5 overflow-x-auto w-full pt-3 mt-3 border-t [scrollbar-width:none] [-ms-overflow-style:none] [&::-webkit-scrollbar]:hidden shrink-0 justify-start sm:justify-end" style={{ borderColor: "var(--card-border)" }}>
              <button type="button" onClick={(e) => { e.stopPropagation(); const pMsg = interact.popup; setInteract((p) => ({ ...p, popup: null })); dbActions.togglePin(pMsg); }} className="px-2.5 py-1 bg-amber-500/15 hover:bg-amber-500/25 text-amber-400 border border-amber-500/30 text-[10px] font-bold rounded-full shadow-sm active:scale-95 transition-all flex items-center gap-1 shrink-0">Pin</button>
              <button type="button" onClick={(e) => { e.stopPropagation(); setInteract((p) => ({ ...p, replyTo: interact.popup, popup: null })); setInput((p) => ({ ...p, blink: true })); setTimeout(() => setInput((p) => ({ ...p, blink: false })), 800); }} className="px-2.5 py-1 bg-indigo-500/15 hover:bg-indigo-500/25 text-indigo-400 border border-indigo-500/30 text-[10px] font-bold rounded-full shadow-sm active:scale-95 transition-all flex items-center gap-1 shrink-0">Balas</button>
              <button type="button" onClick={(e) => { e.stopPropagation(); copyTxt(interact.popup.pesan, "Pesan"); }} className="px-2.5 py-1 bg-blue-500/15 hover:bg-blue-500/25 text-blue-400 border border-blue-500/30 text-[10px] font-bold rounded-full shadow-sm active:scale-95 transition-all flex items-center gap-1 shrink-0">Salin</button>
              {(ui.tab === "admin" || (interact.popup.username === auth.user && interact.popup.username !== "Admin●ipix.my.id")) && (
                <button type="button" onClick={(e) => { e.stopPropagation(); const popupMsg = interact.popup; setInteract((p) => ({ ...p, popup: null })); if (ui.tab === "admin") dbActions.editMsg(popupMsg); else dbActions.editLmt(popupMsg); }} className="px-2.5 py-1 bg-emerald-500/15 hover:bg-emerald-500/25 text-emerald-400 border border-emerald-500/30 text-[10px] font-bold rounded-full shadow-sm active:scale-95 transition-all flex items-center gap-1 shrink-0">Edit</button>
              )}
              {interact.popup.image_url && (
                <button type="button" onClick={async (e) => { e.stopPropagation(); try { const response = await fetch(interact.popup.image_url); const blob = await response.blob(); const url = window.URL.createObjectURL(blob); const a = document.createElement("a"); a.href = url; a.download = `ipix_image_${interact.popup.id}.jpg`; document.body.appendChild(a); a.click(); a.remove(); window.URL.revokeObjectURL(url); } catch (err) { window.open(interact.popup.image_url, "_blank"); } }} className="px-2.5 py-1 bg-teal-500/15 hover:bg-teal-500/25 text-teal-400 border border-teal-500/30 text-[10px] font-bold rounded-full shadow-sm active:scale-95 transition-all flex items-center gap-1 shrink-0">Unduh</button>
              )}
              {((interact.popup.username === auth.user && interact.popup.username !== "Admin●ipix.my.id") || ui.tab === "admin") && (
                <button type="button" onClick={(e) => { e.stopPropagation(); const popupMsg = interact.popup; setInteract((p) => ({ ...p, popup: null })); dbActions.delMsg(popupMsg, false); }} className="px-2.5 py-1 bg-red-500/15 hover:bg-red-500/25 text-red-400 border border-red-500/30 text-[10px] font-bold rounded-full shadow-sm active:scale-95 transition-all flex items-center gap-1 shrink-0">Hapus</button>
              )}
            </div>
          </div>
        </div>
      )}

      {/* BOTTOM NAV CONTAINER */}
      <div className="relative z-[100000] w-full shrink-0 bg-transparent pointer-events-auto">
        <BottomNav isAuth={auth.isAuth} handleLogout={handleLogout} />
      </div>
    </div>
  );
}