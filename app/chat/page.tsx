"use client";
import React, { useEffect, useState, useCallback, useMemo } from "react";
import { usePathname } from "next/navigation";
import { supabase } from "../lib/supabaseClient";
import Login from "../../components/Login";
import Block from "../../components/Block";
import ChatLayout from "../../components/ChatLayout";
import { MessageItem } from "../../components/MessageItem";
import Loading from "../loading";
import BottomNav from "../../components/bottomnav";
import { useTheme } from "../context/ThemeContext";

// Wrapper untuk tema input
const InputThemeWrapper = ({ children, defaultStyles }: { children: (styles: any) => React.ReactNode, defaultStyles: any }) => {
  const { theme } = useTheme();
  
  const getInputTheme = () => {
    switch (theme) {
      case "emerald":
        // Tema emerald -> wave emerald green + dark gray, kolom input emerald green
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
        // Tema ocean blue -> wave ocean blue + dark gray, kolom input ocean blue
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
        // Tema dark -> wave dark gray & soft gray, kolom input dark gray
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

export default function Home() {
  const pathname = usePathname();
  const [mounted, setMounted] = useState(false);
  const [msgs, setMsgs] = useState({
    all: [] as any[],
    pub: [] as any[],
    priv: [] as any[],
  });
  const [auth, setAuth] = useState({
    isAuth: false,
    isExist: false,
    user: "",
    adminEmail: "",
    adminPass: "",
    pin: "",
    umur: "", 
    berat: "", 
  });
  const [ui, setUi] = useState({
    tab: "user" as "user" | "admin",
    mode: "private" as "private",
    inputFocus: false,
  });

  const [counts, setCounts] = useState({ pub: 0, priv: 0 });
  const [adminStat, setAdminStat] = useState({
    online: false,
    offlineTime: "",
    lastActive: 0,
  });
  const [usersInfo, setUsersInfo] = useState({
    status: {} as Record<string, any>,
    blockedList: [] as any[],
    privUsers: [] as any[],
    selPriv: null as string | null,
  });
  const [censor, setCensor] = useState({
    words: [] as string[],
    newWord: "",
  });
  const [input, setInput] = useState({
    text: "",
    sending: false,
    blink: false,
    image: null as string | null,
    uploadingImage: false,
  });
  const [interact, setInteract] = useState({
    replyTo: null as any,
    activeMenu: null as number | null,
    popup: null as any,
    swipeId: null as number | null,
  });

  const currentHash = typeof window !== "undefined" ? window.location.hash : "";

  const CLOUDINARY_CLOUD_NAME = "bjamo8ld";
  const CLOUDINARY_UPLOAD_PRESET = "ipixchat";

  const getFmt = useMemo(
    () => ({
      notif: (n: number) => (n >= 1000 ? (n / 1000).toFixed(1).replace(".0", "") + "k" : n.toString()),
      time: (d: string) =>
        new Date(d)
          .toLocaleDateString("id-ID", {
            weekday: "short",
            day: "2-digit",
            month: "short",
            hour: "2-digit",
            minute: "2-digit",
          })
          .replace(",", ""),
      ago: (d: Date) => {
        const s = Math.floor((new Date().getTime() - d.getTime()) / 1000);
        return s / 3600 >= 1 ? Math.floor(s / 3600) + " jam lalu" : s / 60 >= 1 ? Math.floor(s / 60) + " menit lalu" : "baru saja";
      },
      greet: () => {
        const h = new Date().getHours();
        return `Selamat ${h >= 5 && h < 12 ? "pagi" : h >= 12 && h < 15 ? "siang" : h >= 15 && h < 18 ? "sore" : "malam"} `;
      },
    }),
    [],
  );

  useEffect(() => {
    const timer = setTimeout(() => {
      const el = document.getElementById(`bottom-anchor-private`);
      if (el) {
        el.scrollIntoView({ behavior: "smooth", block: "end" });
      }
    }, 200);
    return () => clearTimeout(timer);
  }, [msgs.priv.length]);

  useEffect(() => {
    const interval = setInterval(() => {
      const now = Date.now();
      setUsersInfo((prev) => {
        const newStatus = { ...prev.status };
        let changed = false;
        for (const [user, data] of Object.entries(newStatus)) {
          const isOnline = now - data.lastActive < 300000;
          if (data.online !== isOnline) {
            newStatus[user] = {
              ...data,
              online: isOnline,
              offlineTime: getFmt.ago(new Date(data.lastActive)),
            };
            changed = true;
          }
        }
        return changed ? { ...prev, status: newStatus } : prev;
      });

      setAdminStat((prev) => {
        if (!prev.lastActive) return prev;
        const isOnline = now - prev.lastActive < 300000;
        if (prev.online !== isOnline) {
          return {
            ...prev,
            online: isOnline,
            offlineTime: getFmt.ago(new Date(prev.lastActive)),
          };
        }
        return prev;
      });
    }, 15000);
    return () => clearInterval(interval);
  }, [getFmt]);

  const hScroll = () => setInteract((p) => ({ ...p, activeMenu: null }));
  const isCensored = (t: string) => censor.words.some((w) => w.trim() && t.toLowerCase().includes(w.toLowerCase()));
  const applyCensor = (t: string) => {
    let r = t;
    censor.words.forEach((w) => {
      if (w.trim()) r = r.replace(new RegExp(`\\b${w}\\b`, "gi"), "***");
    });
    return r;
  };
  const copyTxt = (t: string, l: string) => {
    navigator.clipboard.writeText(t);
    alert(`${l} disalin!`);
  };

  const scrollMsg = (id: number) => {
    const el = document.getElementById(`msg-bubble-${id}`);
    if (el) {
      el.scrollIntoView({ behavior: "smooth", block: "center" });
      const bc = "anim-bg-blink-cream";
      el.classList.remove(bc);
      void el.offsetWidth;
      el.classList.add(bc);
      setTimeout(() => el.classList.remove(bc), 1500);
    }
  };

  const handleLogout = async () => {
    await supabase.auth.signOut();
    localStorage.removeItem("is_auth");
    localStorage.removeItem("active_tab");
    sessionStorage.clear();
    setAuth((p) => ({ ...p, isAuth: false }));
    window.location.replace("/");
  };

  const fetchData = useCallback(async () => {
    try {
      const [{ data: bD }, { data: bW }, { data: prD }] = await Promise.all([
        supabase.from("blocked_users").select("*"),
        supabase.from("blocked_words").select("word"),
        supabase
          .from("messages")
          .select("*")
          .eq("is_private", true)
          .or(ui.tab === "user" && auth.user ? `username.eq.${auth.user},private_with.eq.${auth.user}` : usersInfo.selPriv ? `username.eq.${usersInfo.selPriv},private_with.eq.${usersInfo.selPriv}` : "id.eq.0")
          .order("created_at", { ascending: true }),
      ]);
      
      if (bW) setCensor((p) => ({ ...p, words: bW.map((w) => w.word) }));
      
      if (auth.user && bD?.some((b) => b.username === auth.user)) {
         return window.location.replace("https://ipix.my.id/chat");
      }

      if (auth.isAuth) {
        const { count: privC } = await supabase
          .from("messages")
          .select("*", { count: "exact", head: true })
          .eq("is_private", true)
          .or(ui.tab === "user" && auth.user ? `username.eq.${auth.user},private_with.eq.${auth.user}` : `id.gt.0`);
        setCounts({ ...counts, priv: privC || 0 });
      }

      const vPriv = prD?.filter((m) => !bD?.map((b) => b.username).includes(m.username)) || [];
      setMsgs({ all: vPriv, pub: [], priv: vPriv });

      const lAdmin = vPriv.filter((m) => m.username === "Admin●ipix.my.id").pop();
      if (lAdmin) {
        const adminTime = new Date(lAdmin.created_at).getTime();
        setAdminStat({
          online: Date.now() - adminTime < 300000,
          offlineTime: getFmt.ago(new Date(adminTime)),
          lastActive: adminTime,
        });
      }

      const sMap: Record<string, any> = {};
      vPriv.forEach((m) => {
        if (m.username !== "Admin●ipix.my.id") {
          const t = new Date(m.created_at).getTime();
          sMap[m.username] = {
            lastActive: t,
            online: Date.now() - t < 300000,
            offlineTime: getFmt.ago(new Date(t)),
          };
        }
      });
      setUsersInfo((p) => ({ ...p, status: sMap, blockedList: bD || [] }));

      if (ui.tab === "admin" && !usersInfo.selPriv) {
        const { data: aP } = await supabase.from("messages").select("username, created_at").eq("is_private", true).order("created_at", { ascending: false });
        if (aP) {
          const uMap = new Map();
          const c: Record<string, number> = {};
          aP.forEach((m) => {
            if (m.username !== "Admin●ipix.my.id") c[m.username] = (c[m.username] || 0) + 1;
          });
          aP.forEach((m) => {
            if (m.username !== "Admin●ipix.my.id" && !uMap.has(m.username))
              uMap.set(m.username, {
                ...m,
                last_active: m.created_at,
                count: c[m.username] || 0,
              });
          });
          setUsersInfo((p) => ({ ...p, privUsers: Array.from(uMap.values()) }));
        }
      }
    } catch (e) {}
  }, [ui.tab, usersInfo.selPriv, auth.isAuth, auth.user, getFmt]); 

  const updateMsgLocal = (id: number, newText: string, isEdited: boolean, editedBy: string, imageUrl?: any, deletedByAdmin?: boolean) => {
    setMsgs((prev) => {
      const update = (arr: any[]) =>
        arr.map((m) =>
          m.id === id
            ? {
                ...m,
                pesan: newText,
                is_edited: isEdited !== undefined ? isEdited : m.is_edited,
                edited_by: editedBy !== undefined ? editedBy : m.edited_by,
                ...(imageUrl !== undefined ? { image_url: imageUrl } : {}),
                ...(deletedByAdmin !== undefined ? { deleted_by_admin: deletedByAdmin } : {}),
              }
            : m,
        );
      return {
        all: update(prev.all),
        pub: [],
        priv: update(prev.priv),
      };
    });
  };

  const dbActions = {
    editLmt: async (m: any) => {
      const c = parseInt(localStorage.getItem(`edit_${m.id}`) || "0");
      if (c >= 2) return alert("Batas 2x edit!");
      const nt = prompt("Edit Pesan:", m.pesan);
      if (nt && nt.trim() !== m.pesan) {
        await supabase.from("messages").update({ pesan: nt.trim(), is_edited: true, edited_by: auth.user }).eq("id", m.id);
        localStorage.setItem(`edit_${m.id}`, (c + 1).toString());
        localStorage.setItem(`edit_count_${m.id}`, "1");
        updateMsgLocal(m.id, nt.trim(), true, auth.user);
      }
    },
    editMsg: async (id: number) => {
      const m = msgs.all.find((x) => x.id === id);
      if (!m) return;
      const nt = prompt("Edit Pesan:", m.pesan);
      if (nt && nt !== m.pesan) {
        await supabase.from("messages").update({ pesan: nt, is_edited: true, edited_by: auth.user }).eq("id", id);
        localStorage.setItem(`edit_count_${id}`, "1");
        updateMsgLocal(id, nt, true, auth.user);
      }
    },
    editNm: async (id: number) => {
      const m = msgs.all.find((m) => m.id === id);
      if (!m) return;
      const nn = prompt("Nama:", m.username);
      if (nn && isCensored(nn)) return alert("Terlarang!");
      if (nn) {
        await Promise.all([
            supabase.from("profiles").update({ username: nn }).eq("username", m.username), 
            supabase.from("messages").update({ username: nn }).eq("username", m.username)
        ]);
        fetchData();
      }
    },
    delMsg: async (m: any, isSwipe = false) => {
      const isAlreadyDeleted = m.pesan === "___DELETED___";
      const confirmMsg = isAlreadyDeleted ? "Hapus permanen pesan ini dari database?" : isSwipe ? "Swipe terdeteksi. Pindahkan pesan ini ke tong sampah?" : "Pindahkan pesan ini ke tong sampah?";
      if (!confirm(confirmMsg)) return;

      if (!isAlreadyDeleted) {
        updateMsgLocal(m.id, "___DELETED___", m.is_edited, m.edited_by, null, auth.user === "Admin●ipix.my.id");
      }

      if (auth.user !== "Admin●ipix.my.id") {
        if (isAlreadyDeleted) return;
        
        if (m.username !== auth.user) {
          alert("Anda hanya diizinkan menghapus pesan milik Anda sendiri!");
          fetchData();
          return;
        }

        const lastReset = localStorage.getItem("del_reset_date");
        const today = new Date().toLocaleDateString();
        let count = parseInt(localStorage.getItem("del_count") || "0");

        if (lastReset !== today) {
          count = 0;
          localStorage.setItem("del_reset_date", today);
        }

        if (count >= 10) {
          alert("Batas hapus pesan maksimal 10x per hari!");
          fetchData();
          return;
        }

        const { error } = await supabase
          .from("messages")
          .update({
            pesan: "___DELETED___",
            image_url: null,
            deleted_by_admin: false,
            is_pinned: false,
          })
          .eq("id", m.id);

        if (error) {
          alert("Gagal menghapus pesan, silakan coba lagi.");
          fetchData();
          return;
        }

        localStorage.setItem("del_count", (count + 1).toString());
      } else {
        if (isAlreadyDeleted) {
          await supabase.from("messages").delete().eq("id", m.id);
        } else {
          const { error } = await supabase
            .from("messages")
            .update({
              pesan: "___DELETED___",
              image_url: null,
              deleted_by_admin: true,
              is_pinned: false,
            })
            .eq("id", m.id);

          if (error) {
            alert("Gagal menghapus pesan ke tong sampah.");
            fetchData();
            return;
          }
        }
      }
      fetchData();
    },
    emptyTrash: async () => {
      if (confirm("Kosongkan semua pesan yang telah dihapus di tong sampah secara permanen?")) {
        const { error } = await supabase.from("messages").delete().eq("pesan", "___DELETED___");
        if (error) alert("Gagal mengosongkan tempat sampah.");
        else alert("Tempat sampah berhasil dikosongkan!");
        fetchData();
      }
    },
    blkUser: async (arg1: string, arg2?: string) => {
      const targetUsername = arg2 || arg1; 
      if (confirm(`Blokir user ${targetUsername}?`)) {
        await supabase.from("blocked_users").insert([{ username: targetUsername }]);
        fetchData();
      }
    },
    addWrd: async () => {
      if (censor.newWord.trim()) {
        await supabase.from("blocked_words").insert([{ word: censor.newWord.trim().toLowerCase() }]);
        setCensor((p) => ({ ...p, newWord: "" }));
        fetchData();
      }
    },
    rmWrd: async (w: string) => {
      await supabase.from("blocked_words").delete().eq("word", w);
      fetchData();
    },
    approveImg: async (id: number) => {
      await supabase.from("messages").update({ is_approved: true }).eq("id", id);
      fetchData();
    },
    pinMsg: async (m: any) => {
      if (auth.user !== "Admin●ipix.my.id") return alert("Hanya admin yang dapat menyematkan (pin) pesan.");
      const newStatus = !m.is_pinned;
      const { error } = await supabase.from("messages").update({ is_pinned: newStatus }).eq("id", m.id);
      if (error) {
        alert("Gagal menyematkan pesan. Pastikan kolom is_pinned (boolean) ada di database.");
      }
      fetchData();
    }
  };

  useEffect(() => {
    const chk = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      
      const savedUsername = localStorage.getItem("active_username");
      const isAuthLocal = localStorage.getItem("is_auth") === "true"; 
      
      if (savedUsername && savedUsername !== "Admin●ipix.my.id") {
          const { data: pD } = await supabase
            .from("profiles")
            .select("username, pin, umur, berat")
            .ilike("username", savedUsername)
            .maybeSingle();
          
          if (pD?.username) {
            setAuth((p) => ({ 
              ...p, 
              isExist: true, 
              user: pD.username,
              pin: pD.pin || "",
              umur: pD.umur || "",
              berat: pD.berat || ""
            }));
          } else {
             setAuth((p) => ({ ...p, user: savedUsername }));
          }
      }

      const isAdmin = pathname?.endsWith("/admin") || window.location.hash === "#admin";
      setUi((p) => ({
        ...p,
        tab: isAdmin ? "admin" : (localStorage.getItem("active_tab") as "user" | "admin") || "user",
      }));
      
      if (session || isAuthLocal) {
        setAuth((p) => ({
          ...p,
          isAuth: true,
          user: session ? "Admin●ipix.my.id" : savedUsername || p.user,
        }));
        if (session) setUi((p) => ({ ...p, tab: "admin" }));
      }
      
      setMounted(true);
    };
    chk();
  }, [pathname]);

  useEffect(() => {
    if (mounted) {
      fetchData();
      const messageSubscription = supabase
        .channel("public:messages")
        .on("postgres_changes", { event: "*", schema: "public", table: "messages" }, (payload) => {
          fetchData();
        })
        .subscribe();
      return () => {
        supabase.removeChannel(messageSubscription);
      };
    }
  }, [mounted, fetchData]);

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (file.size > 5 * 1024 * 1024) {
      alert("Ukuran gambar maksimal 5MB!");
      return;
    }
    if (auth.user !== "Admin●ipix.my.id") {
      const { count } = await supabase
        .from("messages")
        .select("*", { count: "exact", head: true })
        .eq("username", auth.user)
        .not("image_url", "is", null)
        .gte("created_at", new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString());
      if (count && count >= 2) {
        alert("Batas maksimal upload gambar adalah 2x dalam 24 jam.");
        return;
      }
    }
    setInput((p) => ({ ...p, uploadingImage: true }));
    const formData = new FormData();
    formData.append("file", file);
    formData.append("upload_preset", CLOUDINARY_UPLOAD_PRESET);
    try {
      const res = await fetch(`https://api.cloudinary.com/v1_1/${CLOUDINARY_CLOUD_NAME}/image/upload`, {
        method: "POST",
        body: formData,
      });
      const data = await res.json();
      if (data.secure_url)
        setInput((p) => ({
          ...p,
          image: data.secure_url,
          uploadingImage: false,
        }));
      else throw new Error("Upload gagal");
    } catch (err) {
      alert("Gagal mengunggah gambar. Pastikan konfigurasi Cloudinary benar.");
      setInput((p) => ({ ...p, uploadingImage: false }));
    }
  };

  const sendMsg = async (e: React.FormEvent) => {
    e.preventDefault();
    if ((!input.text.trim() && !input.image) || input.sending) return;

    const isBlocked = usersInfo.blockedList.some((b) => b.username === auth.user);
    if (isBlocked) {
      alert("Akun Anda telah diblokir. Pesan tidak dapat dikirim.");
      return;
    }

    if (isCensored(input.text)) {
      alert("Pesan gagal dikirim karena mengandung kata terlarang!");
      return;
    }
    setInput((p) => ({ ...p, sending: true }));

    let txt = input.text.trim();
    if (interact.replyTo) {
      const q = interact.replyTo.pesan;
      const quote = q.length > 30 ? q.substring(0, 30) + "..." : q;
      txt = `@${interact.replyTo.username.split("●")[0]} ("${quote}") ${input.text.trim()}`;
    }

    if (auth.user !== "Admin●ipix.my.id") {
      const fiveMinsAgo = new Date(Date.now() - 300000).toISOString();
      const { count } = await supabase
        .from("messages")
        .select("*", { count: "exact", head: true })
        .eq("username", auth.user)
        .gte("created_at", fiveMinsAgo);

      if (typeof count === "number" && count >= 5) {
        alert("Batas maksimum tercapai: Anda hanya dapat mengirim 5 pesan per 5 menit.");
        setInput((p) => ({ ...p, sending: false }));
        return;
      }
    }

    await supabase.from("messages").insert([
      {
        username: auth.user,
        pesan: txt,
        image_url: input.image,
        is_approved: auth.user === "Admin●ipix.my.id",
        is_private: true,
        private_with: ui.tab === "user" ? "admin" : usersInfo.selPriv,
        user_browser: navigator.userAgent,
      },
    ]);
    setInput({
      text: "",
      sending: false,
      blink: false,
      image: null,
      uploadingImage: false,
    });
    setInteract((p) => ({ ...p, replyTo: null }));
    setUi((p) => ({ ...p, inputFocus: false }));

    const t = document.getElementById("chat-input");
    if (t) {
      t.style.height = "auto";
      t.blur();
    }

    setTimeout(() => {
      const el = document.getElementById(`bottom-anchor-private`);
      if (el) el.scrollIntoView({ behavior: "smooth", block: "end" });
    }, 150);

    fetchData();
  };

  const hasInputReady = input.text.trim().length > 0 || input.image !== null;

  const onlineUsers = Object.entries(usersInfo.status)
    .filter(([_, data]) => data.online)
    .map(([username]) => username);

  const currentMsgs = msgs.priv;
  const pinnedMsg = currentMsgs.find((m) => m.is_pinned && m.pesan !== "___DELETED___");

  const renderMsgs = (arr: any[], colType: any) => {
    const messageContent = arr.length === 0 ? (
      <div className="text-center text-white/70 italic mt-10 text-[10px]">Belum ada pesan.</div>
    ) : (
      arr.map((m, idx) => {
        const isMine = m.username === auth.user;
        const maxWidthClass = "max-w-[85%] md:max-w-[75%]";

        return (
          <div key={m.id} className={`w-full flex mb-3 px-2 sm:px-4 ${isMine ? "justify-end" : "justify-start"}`}>
            <div className={`relative flex flex-col chat-bubble-wrapper min-w-[35%] ${maxWidthClass} ${isMine ? "items-end" : "items-start"}`}>
              <MessageItem
                index={idx}
                m={m}
                colType={colType}
                isMinimized={true}
                activeTab={ui.tab}
                isAdminOnline={adminStat.online}
                adminOfflineTime={adminStat.offlineTime}
                userStatus={usersInfo.status}
                activeMenuId={interact.activeMenu}
                setActiveMenuId={(id: any) => setInteract((p) => ({ ...p, activeMenu: id }))}
                swipingId={interact.swipeId}
                setSwipingId={(id: any) => setInteract((p) => ({ ...p, swipeId: id }))}
                handleTag={(u: string) =>
                  setInput((p) => ({
                    ...p,
                    text: `${p.text} @${u.split("●")[0]} `,
                  }))
                }
                handleReply={(m: any) => {
                  setInteract((p) => ({ ...p, replyTo: m }));
                  setInput((p) => ({ ...p, blink: true }));
                  setTimeout(() => setInput((p) => ({ ...p, blink: false })), 800);
                }}
                deleteMsg={dbActions.delMsg}
                copyToClipboard={copyTxt}
                handleEditLimit={dbActions.editLmt}
                editMsg={dbActions.editMsg}
                editNama={dbActions.editNm}
                blockUser={dbActions.blkUser}
                inviteToPrivate={() => {}}
                setPopupMsg={(m: any) => setInteract((p) => ({ ...p, popup: m }))}
                handleLongPress={(m: any) => setInteract((p) => ({ ...p, popup: m }))}
                approveImage={dbActions.approveImg}
                applyCensor={applyCensor}
                scrollToMessage={(t: string) => {
                  const cleanText = t.endsWith("...") ? t.slice(0, -3) : t;
                  const x = msgs.all.find((m) => m.pesan.includes(cleanText));
                  if (x) scrollMsg(x.id);
                }}
                formatMessageTime={getFmt.time}
                authUser={auth.user}
              />
            </div>
          </div>
        );
      })
    );

    return (
      <div className="w-full flex flex-col py-2 overflow-x-hidden">
        {pinnedMsg && (
          <div
            onClick={() => scrollMsg(pinnedMsg.id)}
            className="mx-3 mb-4 p-2.5 rounded-lg cursor-pointer shadow-md transition-all active:scale-95 flex items-center gap-3 border-l-4 z-10 bg-emerald-800/60 border-emerald-400 hover:bg-emerald-800/80"
          >
            <div className="text-xl drop-shadow-md">📌</div>
            <div className="flex flex-col flex-1 overflow-hidden">
              <span className="text-[10px] font-bold tracking-wide flex items-center gap-1.5 text-emerald-300">
                PESAN SEMATAN
                <span className="opacity-50 text-[9px] font-normal">oleh Admin</span>
              </span>
              <span className="text-white text-xs truncate mt-0.5 opacity-90">{pinnedMsg.pesan}</span>
            </div>
          </div>
        )}
        
        {messageContent}
        <div id={`bottom-anchor-private`} className="h-1 shrink-0 mt-2" />
      </div>
    );
  };

  const renderInputForm = () => {
    const isBlocked = usersInfo.blockedList.some((b) => b.username === auth.user);

    // Default styles untuk fallback
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
                    setInteract((p) => ({ ...p, replyTo: null }));
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
                      <button type="button" onClick={() => setInput((p) => ({ ...p, image: null }))} className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full w-4 h-4 text-[9px] font-bold flex items-center justify-center">
                        ×
                      </button>
                    </div>
                  )}

                  <div className="relative flex-1 w-full">
                    <textarea
                      id="chat-input"
                      onFocus={() => setUi((p) => ({ ...p, inputFocus: true }))}
                      onBlur={() => setUi((p) => ({ ...p, inputFocus: false }))}
                      className={`w-full border p-1.5 sm:p-2 rounded-xl px-3 sm:px-4 pb-5 sm:pb-6 text-sm text-white resize-none focus:outline-none min-h-[32px] sm:min-h-[38px] max-h-[100px] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden ${input.blink ? styles.inputBlink : styles.input} ${(ui.tab === "admin" && !usersInfo.selPriv) || isBlocked ? "opacity-30 cursor-not-allowed bg-gray-800" : ""}`}
                      value={input.text}
                      onChange={(e) => {
                        setInput((p) => ({ ...p, text: e.target.value }));
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
                        setInput((p) => ({
                          ...p,
                          text: "",
                          image: null,
                          uploadingImage: false,
                        }));
                        setInteract((p) => ({ ...p, replyTo: null }));
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
  };

  if (!mounted) {
    return <Loading />;
  }

  return (
    <div className="w-full max-w-2xl mx-auto h-dvh flex flex-col bg-transparent shadow-xl overflow-hidden font-sans overscroll-none" onClick={() => setInteract((p) => ({ ...p, activeMenu: null }))}>
      <style
        dangerouslySetInnerHTML={{
          __html: ` 
          body{overscroll-behavior-y:none;} 
          
          /* ANIMASI BACKGROUND BLINK */
          @keyframes bC{0%,100%{filter:brightness(1);}50%{background-color:#fef9c3 !important;filter:brightness(0.9);}} 
          .anim-bg-blink-cream{animation:bC 1.5s ease-in-out;} 
          @keyframes tW{0%,100%{color:#fff;text-shadow:0 0 5px rgba(255,255,255,0.8);}50%{color:rgba(255,255,255,0.6);text-shadow:none;}} 
          .anim-text-blink-white{animation:tW 1.5s ease-in-out infinite;} 
          `,
        }}
      />

      {auth.isAuth && ui.tab === "admin" && currentHash !== "#block" && (
        <div className="fixed z-[100] bottom-36 right-4 flex flex-col gap-2">
          <div onClick={() => window.open(`${window.location.pathname}#block`, "_blank")} className="px-3 py-1.5 rounded-full font-black text-white tracking-widest text-[9px] cursor-pointer select-none bg-red-600 border border-red-700 shadow-[0_3px_0_#991b1b,0_6px_10px_rgba(0,0,0,0.3)] active:translate-y-[3px] active:shadow-none transition-all duration-150 text-center">
            BLOCK MGR
          </div>
          <div onClick={dbActions.emptyTrash} className="px-3 py-1.5 rounded-full font-black text-white tracking-widest text-[9px] cursor-pointer select-none bg-orange-600 border border-orange-700 shadow-[0_3px_0_#c2410c,0_6px_10px_rgba(0,0,0,0.3)] active:translate-y-[3px] active:shadow-none transition-all duration-150 text-center">
            TRASH MGR
          </div>
        </div>
      )}

      {currentHash !== "#block" && (
        <div className="sticky top-0 z-20 flex flex-col bg-emerald-900/30 backdrop-blur-md">
          <div className="p-3 relative">
            <button onClick={handleLogout} className="absolute top-4 right-4 text-[10px] bg-red-500/80 text-white px-3 py-1 rounded-full shadow backdrop-blur-sm z-30">
              Keluar
            </button>
            <div className="flex justify-between items-center text-white relative z-20">
              <div className="flex flex-col max-w-[65%]">
                <span className="text-[10px] text-white/70 uppercase tracking-wider">{getFmt.greet()}</span>
                <div className="flex items-center gap-1.5 flex-wrap">
                  <span className="text-[11px] font-bold text-white">{auth.user || "Guest"}</span>
                </div>
              </div>
              <div className="text-center flex-1 flex flex-col items-end mr-16">
                <a href="https://ipix.my.id" target="_blank" className="text-emerald-400 font-bold text-sm underline">
                  ipix.my.id
                </a>
              </div>
            </div>
          </div>
          
          {auth.isAuth && ui.tab === "admin" && (
            <div className="flex items-center overflow-x-auto gap-2 px-3 py-1.5 border-t border-b text-xs whitespace-nowrap [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none] border-emerald-400/20 bg-emerald-950/40">
              <span className="font-bold text-white flex items-center mr-1">
                <span className="w-2 h-2 rounded-full bg-green-500 mr-1.5 shadow-[0_0_5px_#22c55e] animate-pulse" />
                Online ({onlineUsers.length + (adminStat.online ? 1 : 0)})
              </span>
              {adminStat.online && (
                <span className="bg-red-600/90 text-white px-2.5 py-0.5 rounded-full text-[10px] font-bold shadow-sm">Admin</span>
              )}
              {onlineUsers.map(u => (
                <span key={u} className="bg-white/20 text-white/90 px-2.5 py-0.5 rounded-full text-[10px] border border-white/10 shadow-sm">{u.split("●")[0]}</span>
              ))}
              {onlineUsers.length === 0 && !adminStat.online && (
                <span className="text-white/40 italic text-[10px]">Sepi...</span>
              )}
            </div>
          )}
        </div>
      )}

      <div className="flex-1 w-full relative flex overflow-hidden bg-emerald-900/10">
        {ui.tab === "admin" && currentHash === "#block" ? (
          <Block
            blockedList={usersInfo.blockedList}
            unblock={async (identifier: string) => {
              await supabase.from("blocked_users").delete().eq("username", identifier);
              
              if (!isNaN(Number(identifier))) {
                await supabase.from("blocked_users").delete().eq("id", Number(identifier));
              }
              fetchData();
            }}
            blockedWords={censor.words}
            newWord={censor.newWord}
            setNewWord={(w: string) => setCensor((p) => ({ ...p, newWord: w }))}
            addBlockedWord={dbActions.addWrd}
            removeBlockedWord={dbActions.rmWrd}
            formatMessageTime={getFmt.time}
          />
        ) : (
          <ChatLayout
            cMode="private"
            viewMode="full-private"
            hInteract={() => {}}
            hScroll={hScroll}
            aTab={ui.tab}
            selPrivUser={usersInfo.selPriv}
            pUsers={usersInfo.privUsers}
            pubMsgs={[]}
            privMsgs={msgs.priv}
            isPill={false}
            pDelta={0}
            pTouchX={0}
            capIdx={0}
            setPTouchX={() => {}}
            setPDelta={() => {}}
            setCapPause={() => {}}
            setIsPill={() => {}}
            renderMsgs={renderMsgs}
            renderInput={() => <></>}
            fmtTime={getFmt.time}
            setSelPriv={(u: string) => setUsersInfo((p) => ({ ...p, selPriv: u }))}
          />
        )}
      </div>

      {auth.isAuth && currentHash !== "#block" && renderInputForm()}

      {interact.popup && interact.popup.pesan !== "___DELETED___" && (
        <div className="fixed inset-0 z-[200] bg-black/70 flex items-center justify-center p-4 backdrop-blur-sm" onClick={() => setInteract((p) => ({ ...p, popup: null }))}>
          <div className="w-full max-w-lg bg-white rounded-2xl shadow-2xl p-5 relative max-h-[90vh] flex flex-col border-t-4 border-emerald-500" onClick={(e) => e.stopPropagation()}>
            <button type="button" onClick={() => setInteract((p) => ({ ...p, popup: null }))} className="absolute top-3 right-3 text-gray-400 bg-gray-100 rounded-full w-8 h-8 flex items-center justify-center font-bold active:scale-95">
              ×
            </button>
            <div className="flex items-center gap-2 border-b pb-3 mb-3">
              <span className={`px-2 py-1 rounded-full text-white text-xs font-bold shadow-sm ${interact.popup.username === "Admin●ipix.my.id" ? "bg-red-600" : interact.popup.username === auth.user ? "bg-blue-600" : "bg-gray-700"}`}>{interact.popup.username}</span>
              <span className="text-[10px] text-gray-400">{getFmt.time(interact.popup.created_at)}</span>
            </div>
            <div className="overflow-y-auto pr-2 pb-2 text-sm text-black flex flex-col break-words break-all whitespace-pre-wrap">
              {interact.popup.image_url && (
                <div className="relative mb-3 w-full">
                  <img src={interact.popup.image_url} alt="Uploaded Image" className={`w-full h-auto max-h-[50vh] object-contain rounded-lg border shadow-sm bg-gray-50 ${interact.popup.is_approved === false && ui.tab !== "admin" && interact.popup.username !== "Admin●ipix.my.id" ? "blur-xl" : ""}`} />
                  {interact.popup.is_approved === false && ui.tab !== "admin" && interact.popup.username !== "Admin●ipix.my.id" && (
                    <div className="absolute inset-0 flex items-center justify-center">
                      <span className="text-white text-xs sm:text-sm font-bold px-3 py-1.5 bg-black/60 rounded-full text-center">Menunggu Persetujuan Admin</span>
                    </div>
                  )}
                </div>
              )}
              {interact.popup.pesan && applyCensor(interact.popup.pesan)}
            </div>
            <div className="flex flex-wrap items-center justify-end gap-2 mt-4 pt-3 border-t border-gray-100">
              
              {ui.tab === "admin" && (
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    const popupMsg = interact.popup;
                    setInteract((p) => ({ ...p, popup: null }));
                    dbActions.pinMsg(popupMsg);
                  }}
                  className={`px-3 py-1.5 text-white text-[10px] sm:text-xs font-black rounded-full shadow-md active:scale-95 transition-all flex items-center gap-1 ${interact.popup.is_pinned ? "bg-gray-500 hover:bg-gray-600" : "bg-purple-600 hover:bg-purple-700"}`}
                >
                  📌 {interact.popup.is_pinned ? "Unpin" : "Pin"}
                </button>
              )}

              {((interact.popup.username === auth.user && interact.popup.username !== "Admin●ipix.my.id") || ui.tab === "admin") && (
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    const popupMsg = interact.popup;
                    setInteract((p) => ({ ...p, popup: null }));
                    dbActions.delMsg(popupMsg, false);
                  }}
                  className="px-3 py-1.5 bg-red-600 hover:bg-red-700 text-white text-[10px] sm:text-xs font-black rounded-full shadow-md active:scale-95 transition-all flex items-center gap-1"
                >
                  🗑️ Hapus
                </button>
              )}
              {interact.popup.image_url && !(interact.popup.is_approved === false && ui.tab !== "admin" && interact.popup.username !== "Admin●ipix.my.id") && (
                <button
                  type="button"
                  onClick={async (e) => {
                    e.stopPropagation();
                    try {
                      const response = await fetch(interact.popup.image_url);
                      const blob = await response.blob();
                      const url = window.URL.createObjectURL(blob);
                      const a = document.createElement("a");
                      a.href = url;
                      a.download = `ipix_image_${interact.popup.id}.jpg`;
                      document.body.appendChild(a);
                      a.click();
                      a.remove();
                      window.URL.revokeObjectURL(url);
                    } catch (err) {
                      window.open(interact.popup.image_url, "_blank");
                    }
                  }}
                  className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white text-[10px] sm:text-xs font-black rounded-full shadow-md active:scale-95 transition-all flex items-center gap-1"
                >
                  📥 Unduh
                </button>
              )}
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  copyTxt(interact.popup.pesan, "Pesan");
                }}
                className="px-3 py-1.5 bg-blue-600 hover:bg-blue-700 text-white text-[10px] sm:text-xs font-black rounded-full shadow-md active:scale-95 transition-all"
              >
                📋 Salin
              </button>

              {(ui.tab === "admin" || (interact.popup.username === auth.user && interact.popup.username !== "Admin●ipix.my.id")) && (
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    const popupMsg = interact.popup;
                    setInteract((p) => ({ ...p, popup: null }));
                    if (ui.tab === "admin") {
                      dbActions.editMsg(popupMsg.id);
                    } else {
                      dbActions.editLmt(popupMsg);
                    }
                  }}
                  className="px-3 py-1.5 bg-amber-500 hover:bg-amber-600 text-white text-[10px] sm:text-xs font-black rounded-full shadow-md active:scale-95 transition-all"
                >
                  ✏️ Edit
                </button>
              )}
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  setInteract((p) => ({
                    ...p,
                    replyTo: interact.popup,
                    popup: null,
                  }));
                  setInput((p) => ({ ...p, blink: true }));
                  setTimeout(() => setInput((p) => ({ ...p, blink: false })), 800);
                }}
                className="px-3 py-1.5 bg-indigo-600 hover:bg-indigo-700 text-white text-[10px] sm:text-xs font-black rounded-full shadow-md active:scale-95 transition-all"
              >
                💬 Balas
              </button>
            </div>
          </div>
        </div>
      )}

      {!auth.isAuth && (
        <Login
          activeTab={ui.tab}
          username={auth.user}
          setUsername={(u: string) => setAuth((p) => ({ ...p, user: u }))}
          
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
          
          handleUserLogin={async (isLoginMode?: boolean) => {
            const inputName = auth.user.trim();
            if (!inputName || isCensored(inputName)) return alert("Nama tidak valid");
            
            try {
              const { data: existUser } = await supabase
                .from("profiles")
                .select("username, pin, email, umur, berat")
                .ilike("username", inputName)
                .maybeSingle();

              if (existUser && existUser.pin !== auth.pin) {
                return alert("Username sudah terdaftar dengan PIN yang berbeda!");
              }
              
              const finalUsername = existUser ? existUser.username : inputName.toLowerCase();
              
              if (isLoginMode) {
                if (!existUser) {
                  return alert("User tidak ditemukan, silakan register terlebih dahulu.");
                }
                
                setAuth((p) => ({ 
                  ...p, 
                  isAuth: true, 
                  user: finalUsername,
                  umur: existUser.umur || "",
                  berat: existUser.berat || ""
                }));
                localStorage.setItem("active_username", finalUsername);
                localStorage.setItem("is_auth", "true");
                localStorage.setItem("active_tab", "user");
                
                return; 
              }

              let finalEmail = "user@ipix.fun";
              if (existUser?.email) {
                finalEmail = existUser.email;
              } else {
                const { count } = await supabase.from("profiles").select("*", { count: "exact", head: true });
                const nextId = (count || 0) + 1;
                finalEmail = `user${nextId}@ipix.fun`;
              }
              
              const { error: upsertError } = await supabase.from("profiles").upsert(
                {
                  email: finalEmail,
                  username: finalUsername,
                  user_browser: navigator.userAgent,
                  pin: auth.pin,     
                  umur: auth.umur,   
                  berat: auth.berat, 
                },
                { onConflict: "username" }
              );

              if (upsertError) {
                alert("Gagal simpan data ke database: " + upsertError.message);
                console.error("Supabase Error:", upsertError);
                return; 
              }

              setAuth((p) => ({ ...p, isAuth: true, user: finalUsername }));
              localStorage.setItem("active_username", finalUsername);
              localStorage.setItem("is_auth", "true");
              localStorage.setItem("active_tab", "user");

            } catch (e) {
              console.error("Error saving profile:", e);
              return;
            }
          }}
          handleAdminLogin={async () => {
            const { error } = await supabase.auth.signInWithPassword({
              email: auth.adminEmail,
              password: auth.adminPass,
            });
            if (error) alert("Gagal");
            else {
              setAuth((p) => ({
                ...p,
                isAuth: true,
                user: "Admin●ipix.my.id",
              }));
              setUi((p) => ({ ...p, tab: "admin" }));
              localStorage.setItem("active_username", "Admin●ipix.my.id");
              localStorage.setItem("is_auth", "true");
              localStorage.setItem("active_tab", "admin");
            }
          }}
        />
      )}

      <BottomNav />
      
    </div>
  );
}