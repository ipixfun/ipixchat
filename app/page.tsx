'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import BottomNav from '@/components/bottomnav';
import { motion, AnimatePresence } from 'framer-motion';
import { supabase } from '@/app/lib/supabaseClient';

// --- DATA DEFAULT ---
const DEFAULT_APP_INFO = {
  appName: "ipixchat",
  version: "v1.0",
  apkSize: "4.45 MB",
  videoUrl: "https://res.cloudinary.com/bjamo8ld/video/upload/v1785508218/ipixchat_dryqj3.mp4",
  gifUrl: "https://res.cloudinary.com/bjamo8ld/image/upload/v1785537508/Bear_fcdw39.gif",
  apkDownloadUrl: "https://ipix.my.id/ipixchat.apk",
  year: new Date().getFullYear(),
  featuresTitle: "Fitur aplikasi",
  videoSectionTitle: "Panduan Video",
  footerText: "IPIXCHAT",
  footerSubText: "ALL RIGHTS RESERVED",
  footerUrl: "https://ipix.my.id",
};

const DEFAULT_BANNER_INFO = {
  apkThankYouTitle: "Terima Kasih!",
  apkThankYouDesc: "Terima kasih supportnya sudah menggunakan apk ipixchat. Nikmati pengalaman berinteraksi yang lebih cepat dan lancar.",
  webBadge: "Aplikasi Android",
  webTitle: "Unduh aplikasi ipixchat",
  webDesc: "Dapatkan pengalaman interaksi yang lebih optimal, ringan, dan cepat langsung melalui perangkat Android Anda."
};

const DEFAULT_PLATFORM_INFO = {
  badge: "Platform Perpesanan",
  title: "Ruang Interaksi Personal bersama pix",
  description: "Aplikasi ini didesain secara khusus untuk memudahkan Anda terhubung dan berinteraksi secara cepat dan terstruktur. Cukup buat Username dan PIN 6 digit angka tanpa proses pendaftaran yang rumit."
};

const DEFAULT_FEATURES = [
  {
    id: 1,
    title: "Akses Instan & Praktis",
    text: "Cukup daftarkan Username dan PIN 6 digit angka untuk langsung berinteraksi dengan saya/pix. Akses auto-login membuat sesi percakapan Anda berjalan mulus tanpa hambatan.",
    action: { label: "Mulai Chat", href: "/chat" },
    isHighlight: false
  },
  {
    id: 2,
    title: "Pengiriman Media Interaktif",
    text: "Fitur berbagi gambar dan media yang responsif langsung dari kolom percakapan.",
    action: null,
    isHighlight: false
  },
  {
    id: 3,
    title: "Kustomisasi Tema Personal",
    text: "Sesuaikan antarmuka visual aplikasi sesuai selera Anda setelah berhasil masuk.",
    action: { label: "Ubah Tema", href: "/tema" },
    isHighlight: false
  },
  {
    id: 4,
    title: "Navigasi & Ekosistem Terpadu",
    text: "Jelajahi informasi media sosial dan tautan ekosistem ipix hanya dengan menggeser atau melepas kontrol pill.",
    action: null,
    isHighlight: false
  },
  {
    id: 5,
    title: "Pengembangan Berkelanjutan",
    text: "Pembaruan fitur baru dan peningkatan performa akan terus dikembangkan secara rutin.",
    action: null,
    isHighlight: true
  }
];

const DEFAULT_ECOSYSTEM_LINKS = [
  { name: "ipix.my.id", url: "https://ipix.my.id" },
  { name: "sukachub", url: "https://sukachub.my.id" },
  { name: "ipix.fun", url: "https://ipix.fun" },
];

export default function HomePage() {
  const router = useRouter();
  const [showDownloadConfirm, setShowDownloadConfirm] = useState(false);
  const [isApk, setIsApk] = useState(false);

  // ADMIN & EDIT STATE
  const [isAdmin, setIsAdmin] = useState(false);
  const [isEditMode, setIsEditMode] = useState(false);
  const [showAdminLoginModal, setShowAdminLoginModal] = useState(false);
  const [adminEmailInput, setAdminEmailInput] = useState('');
  const [adminPasswordInput, setAdminPasswordInput] = useState('');
  const [loginError, setLoginError] = useState('');
  const [saveSuccessMsg, setSaveSuccessMsg] = useState('');
  const [clickCount, setClickCount] = useState(0);

  // DATA KONTEN DENGAN STATE
  const [appInfo, setAppInfo] = useState(DEFAULT_APP_INFO);
  const [bannerInfo, setBannerInfo] = useState(DEFAULT_BANNER_INFO);
  const [platformInfo, setPlatformInfo] = useState(DEFAULT_PLATFORM_INFO);
  const [features, setFeatures] = useState(DEFAULT_FEATURES);
  const [ecosystemLinks, setEcosystemLinks] = useState(DEFAULT_ECOSYSTEM_LINKS);

  // State Toggle Pull-Down
  const [showVideo, setShowVideo] = useState(true);
  const [showPlatform, setShowPlatform] = useState(false);
  const [showFeatures, setShowFeatures] = useState(false);

  // Load Data dari Supabase & Sesi Auth
  useEffect(() => {
    if (typeof window === 'undefined') return;

    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session) setIsAdmin(true);
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setIsAdmin(!!session);
    });

    const fetchContent = async () => {
      try {
        const { data, error } = await supabase
          .from('homepage_config')
          .select('*')
          .eq('id', 1)
          .single();

        if (error) throw error;
        
        if (data) {
          if (data.app_info) setAppInfo({ ...DEFAULT_APP_INFO, ...data.app_info });
          if (data.banner_info) setBannerInfo({ ...DEFAULT_BANNER_INFO, ...data.banner_info });
          if (data.platform_info) setPlatformInfo({ ...DEFAULT_PLATFORM_INFO, ...data.platform_info });
          if (data.features) setFeatures(data.features);
          if (data.ecosystem_links) setEcosystemLinks(data.ecosystem_links);
        }
      } catch (err) {
        console.error("Menggunakan fallback data default:", err);
      }
    };

    fetchContent();

    return () => subscription.unsubscribe();
  }, []);

  // Deteksi APK
  useEffect(() => {
    const checkIsApkNative = () => {
      if (typeof window === 'undefined') return false;
      const userAgent = navigator.userAgent.toLowerCase();
      return userAgent.includes('wv') || userAgent.includes('ipixchat');
    };

    const isApkMode = checkIsApkNative();
    setIsApk(isApkMode);

    if (isApkMode) {
      setShowVideo(false);
      const hasInitialRedirected = localStorage.getItem('ipix_apk_first_open');
      if (!hasInitialRedirected) {
        localStorage.setItem('ipix_apk_first_open', 'true');
        router.push('/chat');
      }
    }
  }, [router]);

  // --- SECRET SHORTCUT KEYBOARD (Ctrl + Shift + A) ---
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.shiftKey && e.key.toLowerCase() === 'a') {
        e.preventDefault();
        setShowAdminLoginModal((prev) => !prev);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  // --- SECRET TAP LOGO (5x Tap Cepat) ---
  const handleSecretLogoClick = () => {
    setClickCount((prev) => {
      const newCount = prev + 1;
      if (newCount >= 5) {
        setShowAdminLoginModal(true);
        return 0;
      }
      return newCount;
    });
    setTimeout(() => setClickCount(0), 1500);
  };

  const handleAdminLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email: adminEmailInput,
        password: adminPasswordInput,
      });

      if (error) throw error;

      if (data.session) {
        setIsAdmin(true);
        setShowAdminLoginModal(false);
        setAdminEmailInput('');
        setAdminPasswordInput('');
        setLoginError('');
      }
    } catch (err: any) {
      setLoginError('Email atau Password salah!');
    }
  };

  const toggleEditMode = () => {
    const newMode = !isEditMode;
    setIsEditMode(newMode);
    if (newMode) {
      setShowVideo(true);
      setShowPlatform(true);
      setShowFeatures(true);
    }
  };

  const handleSaveAllChanges = async () => {
    try {
      setSaveSuccessMsg('Menyimpan ke Supabase...');

      const { error } = await supabase
        .from('homepage_config')
        .upsert({
          id: 1,
          app_info: appInfo,
          banner_info: bannerInfo,
          platform_info: platformInfo,
          features: features,
          ecosystem_links: ecosystemLinks,
          updated_at: new Date().toISOString()
        });

      if (error) throw error;

      setSaveSuccessMsg('Perubahan berhasil disimpan publik!');
      setTimeout(() => setSaveSuccessMsg(''), 3000);
      setIsEditMode(false);
    } catch (err) {
      console.error("Gagal menyimpan ke Supabase:", err);
      alert("Terjadi kesalahan saat menyimpan data ke database.");
      setSaveSuccessMsg('');
    }
  };

  const handleFeatureChange = (id: number, field: string, value: any) => {
    setFeatures(prev => prev.map(f => f.id === id ? { ...f, [field]: value } : f));
  };

  const handleFeatureActionChange = (id: number, field: string, value: string) => {
    setFeatures(prev => prev.map(f => {
      if (f.id === id) {
        const currentAction = f.action || { label: '', href: '' };
        return {
          ...f,
          action: { ...currentAction, [field]: value }
        };
      }
      return f;
    }));
  };

  const toggleFeatureAction = (id: number) => {
    setFeatures(prev => prev.map(f => {
      if (f.id === id) {
        return {
          ...f,
          action: f.action ? null : { label: 'Buka Link', href: '/chat' }
        };
      }
      return f;
    }));
  };

  const handleAddFeature = () => {
    const newId = features.length > 0 ? Math.max(...features.map(f => f.id)) + 1 : 1;
    setFeatures([...features, {
      id: newId,
      title: "Judul Fitur Baru",
      text: "Deskripsi fitur.",
      action: null,
      isHighlight: false
    }]);
  };

  const handleRemoveFeature = (id: number) => {
    setFeatures(features.filter(f => f.id !== id));
  };

  const handleEcosystemChange = (index: number, field: 'name' | 'url', value: string) => {
    const updated = [...ecosystemLinks];
    updated[index][field] = value;
    setEcosystemLinks(updated);
  };

  const renderHighlightedText = (text: string) => {
    if (!text) return null;
    const parts = text.split(/(pix)/i);
    return parts.map((part, index) => {
      if (part.toLowerCase() === 'pix') {
        return (
          <span 
            key={index} 
            className="font-black uppercase tracking-wider drop-shadow-md brightness-[1.4] px-0.5" 
            style={{ 
              color: 'var(--accent)', 
              filter: 'drop-shadow(0 0 12px color-mix(in srgb, var(--accent) 90%, white))' 
            }}
          >
            PIX
          </span>
        );
      }
      return part;
    });
  };

  return (
    <div className="w-full max-w-2xl mx-auto h-dvh flex flex-col pb-[70px] relative overflow-hidden bg-[var(--background)] font-sans text-xs">
      <style>{`
        .hide-scroll::-webkit-scrollbar { display: none; }
        .hide-scroll { -ms-overflow-style: none; scrollbar-width: none; }
        .glow-text { text-shadow: 0 0 15px color-mix(in srgb, var(--accent) 50%, transparent); }
        .glass-card { backdrop-filter: blur(14px); -webkit-backdrop-filter: blur(14px); }
        .color-shift-bg { background-size: 300% 300%; animation: color-shift 5s ease infinite; }
        
        @keyframes color-shift {
          0% { background-position: 0% 50%; }
          50% { background-position: 100% 50%; }
          100% { background-position: 0% 50%; }
        }

        @keyframes wave-motion {
          0% { transform: translateX(0) translateZ(0) scaleY(1); }
          50% { transform: translateX(-25%) translateZ(0) scaleY(0.85); }
          100% { transform: translateX(0) translateZ(0) scaleY(1); }
        }
        .animate-wave { animation: wave-motion 9s ease-in-out infinite; }

        .admin-input {
          width: 100%;
          background: color-mix(in srgb, var(--background) 50%, #000000);
          border: 1px solid color-mix(in srgb, var(--accent) 50%, transparent);
          color: white;
          padding: 8px 12px;
          border-radius: 10px;
          font-size: 12px;
          outline: none;
          transition: all 0.2s;
        }
        .admin-input:focus {
          border-color: var(--accent);
          box-shadow: 0 0 8px color-mix(in srgb, var(--accent) 40%, transparent);
        }
        .admin-label {
          display: block;
          font-size: 10px;
          font-weight: 800;
          color: var(--accent);
          margin-bottom: 4px;
          text-transform: uppercase;
          letter-spacing: 0.5px;
        }
      `}</style>

      {/* FLOATING CONTROL BAR ADMIN */}
      {isAdmin && isEditMode && (
        <motion.div 
          initial={{ y: 50, opacity: 0 }} animate={{ y: 0, opacity: 1 }}
          className="fixed bottom-20 left-3 right-3 sm:left-auto sm:w-[380px] z-[60] p-3 rounded-2xl shadow-2xl flex items-center justify-between gap-3 border border-amber-500/50 backdrop-blur-xl bg-black/85"
        >
          <div className="flex flex-col">
            <span className="text-amber-500 font-black text-[11px] leading-tight">MODE EDIT AKTIF</span>
            <span className="text-[9px] text-white/60">Simpan perubahan ke database</span>
          </div>
          <div className="flex gap-2">
            <button onClick={() => setIsEditMode(false)} className="px-3 py-1.5 bg-red-600/20 text-red-400 text-[11px] font-bold rounded-xl active:scale-95 border border-red-600/30">Tutup</button>
            <button onClick={handleSaveAllChanges} className="px-3 py-1.5 bg-emerald-600 text-white text-[11px] font-bold rounded-xl active:scale-95 shadow-lg shadow-emerald-900/50">Simpan</button>
          </div>
        </motion.div>
      )}

      {/* MODAL LOGIN ADMIN */}
      <AnimatePresence>
        {showAdminLoginModal && (
          <motion.div 
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="fixed inset-0 z-[70] flex items-center justify-center p-4 bg-black/80 glass-card"
          >
            <motion.div 
              initial={{ scale: 0.9, y: 20 }} animate={{ scale: 1, y: 0 }} exit={{ scale: 0.9, y: 20 }}
              className="w-full max-w-sm p-5 rounded-3xl shadow-2xl"
              style={{ backgroundColor: "var(--card-bg)", border: "1px solid color-mix(in srgb, var(--accent) 30%, transparent)" }}
            >
              <h3 className="text-base font-black mb-1" style={{ color: "var(--foreground-heading)" }}>Login Admin Supabase</h3>
              <p className="text-[11px] mb-3 opacity-75" style={{ color: "var(--foreground)" }}>
                Masukkan akun admin yang terdaftar di Supabase Auth.
              </p>

              <form onSubmit={handleAdminLogin} className="space-y-2.5">
                <input
                  type="email"
                  placeholder="Email Admin"
                  value={adminEmailInput}
                  onChange={(e) => setAdminEmailInput(e.target.value)}
                  className="w-full px-3 py-2.5 rounded-xl text-xs border outline-none text-white"
                  style={{ backgroundColor: "var(--background)", borderColor: "var(--card-border)" }}
                  required
                />
                <input
                  type="password"
                  placeholder="Password"
                  value={adminPasswordInput}
                  onChange={(e) => setAdminPasswordInput(e.target.value)}
                  className="w-full px-3 py-2.5 rounded-xl text-xs border outline-none text-white"
                  style={{ backgroundColor: "var(--background)", borderColor: "var(--card-border)" }}
                  required
                />

                {loginError && <p className="text-[11px] text-red-500 font-bold">{loginError}</p>}
                
                <div className="flex gap-2 pt-1">
                  <button type="button" onClick={() => setShowAdminLoginModal(false)} className="flex-1 py-2 rounded-xl text-xs font-bold border text-white" style={{ borderColor: "var(--card-border)" }}>Batal</button>
                  <button type="submit" className="flex-1 py-2 rounded-xl text-xs font-bold text-black bg-amber-500">Login</button>
                </div>
              </form>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* POPUP CONFIRM DOWNLOAD */}
      <AnimatePresence>
        {showDownloadConfirm && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 glass-card">
            <motion.div initial={{ scale: 0.9, y: 20 }} animate={{ scale: 1, y: 0 }} exit={{ scale: 0.9, y: 20 }} className="w-full max-w-sm p-4 rounded-3xl text-center shadow-2xl" style={{ backgroundColor: "var(--card-bg)", border: "1px solid var(--card-border)" }}>
              <h3 className="text-base font-black mb-1.5" style={{ color: "var(--foreground-heading)" }}>Konfirmasi Unduhan</h3>
              <p className="text-xs mb-4 opacity-80" style={{ color: "var(--foreground)" }}>Setuju mengunduh <strong>ipixchat.apk</strong> ({appInfo.apkSize})?</p>
              <div className="flex gap-2">
                <button onClick={() => setShowDownloadConfirm(false)} className="flex-1 py-2.5 rounded-xl font-bold text-xs border">Batal</button>
                <a href={appInfo.apkDownloadUrl} download="ipixchat.apk" onClick={() => setShowDownloadConfirm(false)} className="flex-1 py-2.5 rounded-xl font-bold text-xs text-white color-shift-bg flex items-center justify-center" style={{ backgroundImage: 'linear-gradient(270deg, var(--accent), #ff6b6b, #4ecdc4, var(--accent))' }}>Setuju</a>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* NOTIFIKASI SUKSES SIMPAN */}
      {saveSuccessMsg && (
        <div className="fixed top-16 left-1/2 -translate-x-1/2 z-[60] bg-emerald-500 text-white text-[11px] font-bold px-4 py-2 rounded-full shadow-2xl animate-bounce border border-emerald-400">
          {saveSuccessMsg}
        </div>
      )}

      {/* Header */}
      <header className="sticky top-0 z-20 px-3.5 py-2.5 glass-card border-b" style={{ backgroundColor: "color-mix(in srgb, var(--background) 75%, transparent)", borderColor: "var(--card-border)" }}>
        <div className="flex items-center justify-between gap-1.5">
          <div onClick={handleSecretLogoClick} className="flex items-center gap-1.5 cursor-pointer select-none active:scale-95 transition-transform">
            <div className="w-8 h-8 rounded-xl flex items-center justify-center shadow-md overflow-hidden bg-black/10 border" style={{ borderColor: "color-mix(in srgb, var(--accent) 30%, transparent)" }}>
              <img src="/icon.png" alt="ipixchat" className="w-full h-full object-cover" />
            </div>
            <h1 className="text-base font-black tracking-tight glow-text" style={{ color: "var(--foreground-heading)" }}>
              {appInfo.appName}
            </h1>
          </div>
          <div className="flex items-center gap-1 justify-end">
            {ecosystemLinks.map((item, idx) => (
              <a key={idx} href={item.url} target="_blank" rel="noopener noreferrer" className="px-2 py-0.5 rounded-full text-[9px] font-extrabold tracking-wide transition-transform hover:scale-105 active:scale-95" style={{ color: "var(--accent)", border: "1px solid color-mix(in srgb, var(--accent) 60%, transparent)", backgroundColor: "color-mix(in srgb, var(--accent) 5%, transparent)" }}>
                {item.name}
              </a>
            ))}
            
            {isAdmin && (
              <button onClick={toggleEditMode} className="px-2.5 py-0.5 rounded-full text-[9px] font-extrabold tracking-wide bg-amber-500 text-black shadow-md active:scale-95">
                {isEditMode ? 'Tutup' : 'Edit'}
              </button>
            )}
          </div>
        </div>
      </header>

      {/* Konten Utama */}
      <div className="flex-1 overflow-y-auto hide-scroll space-y-3 pt-2.5 pb-5 px-3">

        {/* [MODE EDIT] PENGATURAN APLIKASI & LINK HEADER/PILL/FOOTER */}
        {isEditMode && (
          <div className="p-3.5 bg-amber-500/10 border border-amber-500/30 rounded-2xl space-y-3.5 text-xs">
            <h3 className="text-amber-500 font-black text-xs border-b border-amber-500/30 pb-1.5">Pengaturan Umum & Footer</h3>
            
            <div className="grid grid-cols-2 gap-2.5">
              <div>
                <label className="admin-label">Nama Aplikasi</label>
                <input type="text" className="admin-input" value={appInfo.appName} onChange={e => setAppInfo({...appInfo, appName: e.target.value})} />
              </div>
              <div>
                <label className="admin-label">Versi</label>
                <input type="text" className="admin-input" value={appInfo.version} onChange={e => setAppInfo({...appInfo, version: e.target.value})} />
              </div>
              <div>
                <label className="admin-label">Ukuran APK</label>
                <input type="text" className="admin-input" value={appInfo.apkSize} onChange={e => setAppInfo({...appInfo, apkSize: e.target.value})} />
              </div>
              <div>
                <label className="admin-label">Tahun Footer</label>
                <input type="number" className="admin-input" value={appInfo.year} onChange={e => setAppInfo({...appInfo, year: parseInt(e.target.value)})} />
              </div>
            </div>

            <div>
              <label className="admin-label">Link Download APK</label>
              <input type="text" className="admin-input" value={appInfo.apkDownloadUrl} onChange={e => setAppInfo({...appInfo, apkDownloadUrl: e.target.value})} />
            </div>

            <div>
              <label className="admin-label">Link GIF Animasi (Mascot)</label>
              <input type="text" className="admin-input" value={appInfo.gifUrl || ''} onChange={e => setAppInfo({...appInfo, gifUrl: e.target.value})} />
            </div>

            {/* EDIT FOOTER TEXT & URL */}
            <div className="grid grid-cols-2 gap-2.5 pt-1">
              <div>
                <label className="admin-label">Teks Footer Utama</label>
                <input type="text" className="admin-input" value={appInfo.footerText} onChange={e => setAppInfo({...appInfo, footerText: e.target.value})} />
              </div>
              <div>
                <label className="admin-label">URL Link Footer</label>
                <input type="text" className="admin-input" value={appInfo.footerUrl} onChange={e => setAppInfo({...appInfo, footerUrl: e.target.value})} />
              </div>
            </div>
            <div>
              <label className="admin-label">Teks Sub-Footer</label>
              <input type="text" className="admin-input" value={appInfo.footerSubText} onChange={e => setAppInfo({...appInfo, footerSubText: e.target.value})} />
            </div>

            {/* EDIT LINK PILL / HEADER ATAS */}
            <div className="pt-2 border-t border-amber-500/20">
              <label className="admin-label mb-1.5">Edit Link Header / Pill Atas</label>
              <div className="space-y-2">
                {ecosystemLinks.map((link, idx) => (
                  <div key={idx} className="grid grid-cols-2 gap-2 p-2 bg-black/30 rounded-xl border border-amber-500/20">
                    <div>
                      <span className="text-[9px] text-amber-400 font-bold block mb-0.5">NAMA LINK #{idx + 1}</span>
                      <input 
                        type="text" 
                        className="admin-input" 
                        value={link.name} 
                        onChange={e => handleEcosystemChange(idx, 'name', e.target.value)} 
                      />
                    </div>
                    <div>
                      <span className="text-[9px] text-amber-400 font-bold block mb-1">URL LINK #{idx + 1}</span>
                      <input 
                        type="text" 
                        className="admin-input" 
                        value={link.url} 
                        onChange={e => handleEcosystemChange(idx, 'url', e.target.value)} 
                      />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* 1. Animasi Mascot GIF (ROUNDED MAKSIMAL 3XL, PILL PENUTUP WATERMARK QWEN) */}
        {!isEditMode && (
          <motion.div
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, ease: "easeOut" }}
            className="w-full flex justify-center items-center py-0.5 pointer-events-none relative"
          >
            <div className="w-full overflow-hidden rounded-3xl flex justify-center items-center relative border border-white/5 shadow-md" style={{ borderColor: "var(--card-border)" }}>
              <img
                src={appInfo.gifUrl}
                alt="Mascot GIF"
                className="w-full h-auto object-cover block"
                style={{ 
                  clipPath: 'inset(2% 0% 2% 0%)', 
                  transform: 'scale(1.02)',
                  filter: "drop-shadow(0 10px 20px color-mix(in srgb, var(--accent) 25%, transparent))" 
                }}
              />
              {/* PILL PENUTUP WATERMARK QWEN */}
              <div 
                className="absolute bottom-1.5 right-2 px-2.5 py-1 rounded-full text-[10px] flex items-center gap-0.5 shadow-lg border"
                style={{ backgroundColor: "var(--card-bg)", borderColor: "color-mix(in srgb, var(--accent) 45%, transparent)" }}
              >
                <span className="font-normal opacity-90 tracking-tight" style={{ color: "var(--foreground)" }}>ipix</span>
                <span 
                  className="font-black italic uppercase tracking-wider brightness-[1.4]" 
                  style={{ 
                    color: 'var(--accent)', 
                    filter: 'drop-shadow(0 0 10px color-mix(in srgb, var(--accent) 90%, white))' 
                  }}
                >
                  PIX
                </span>
                <span className="font-normal opacity-90 tracking-tight" style={{ color: "var(--foreground)" }}>chat</span>
              </div>
            </div>
          </motion.div>
        )}
        
        {/* 2. Banner APK / Web */}
        {isEditMode ? (
          <div className="p-3.5 bg-amber-500/10 border border-amber-500/30 rounded-2xl space-y-3 text-xs">
            <h3 className="text-amber-500 font-black text-xs border-b border-amber-500/30 pb-1.5">Edit Teks Banner</h3>
            <div className="space-y-2">
              <label className="admin-label">Banner Web (Unduh)</label>
              <input type="text" className="admin-input" placeholder="Badge" value={bannerInfo.webBadge} onChange={e => setBannerInfo({...bannerInfo, webBadge: e.target.value})} />
              <input type="text" className="admin-input" placeholder="Judul" value={bannerInfo.webTitle} onChange={e => setBannerInfo({...bannerInfo, webTitle: e.target.value})} />
              <textarea rows={2} className="admin-input" placeholder="Deskripsi" value={bannerInfo.webDesc} onChange={e => setBannerInfo({...bannerInfo, webDesc: e.target.value})} />
            </div>
            <div className="space-y-2 pt-2 border-t border-amber-500/30">
              <label className="admin-label">Banner APK (Terima Kasih)</label>
              <input type="text" className="admin-input" placeholder="Judul" value={bannerInfo.apkThankYouTitle} onChange={e => setBannerInfo({...bannerInfo, apkThankYouTitle: e.target.value})} />
              <textarea rows={2} className="admin-input" placeholder="Deskripsi" value={bannerInfo.apkThankYouDesc} onChange={e => setBannerInfo({...bannerInfo, apkThankYouDesc: e.target.value})} />
            </div>
          </div>
        ) : (
          isApk ? (
            <motion.div className="py-3 px-3.5 rounded-3xl relative overflow-hidden border text-center flex flex-col items-center justify-center gap-1" style={{ background: `linear-gradient(135deg, color-mix(in srgb, var(--accent) 12%, var(--background)) 0%, var(--card-bg) 100%)`, borderColor: "var(--card-border)" }}>
              <div className="absolute inset-0 overflow-hidden pointer-events-none opacity-20">
                <svg className="absolute -bottom-1 left-0 w-[200%] h-10 animate-wave" viewBox="0 0 1200 120" preserveAspectRatio="none">
                  <path d="M0,0 C150,90 350,-40 500,40 C650,120 900,10 1200,40 L1200,120 L0,120 Z" fill="var(--accent)" />
                </svg>
              </div>
              <div className="relative z-10 w-full">
                <h2 className="text-xs sm:text-sm font-black tracking-tight mb-0.5" style={{ color: "var(--accent)" }}>{bannerInfo.apkThankYouTitle}</h2>
                <p className="text-[11px] font-medium leading-snug max-w-[280px] mx-auto opacity-90 break-words" style={{ color: "var(--foreground)" }}>{bannerInfo.apkThankYouDesc}</p>
              </div>
            </motion.div>
          ) : (
            <motion.div className="p-3.5 sm:p-4 rounded-3xl relative overflow-hidden border" style={{ background: `linear-gradient(135deg, color-mix(in srgb, var(--accent) 22%, var(--background)) 0%, var(--card-bg) 100%)`, borderColor: "var(--card-border)" }}>
              <div className="relative z-10 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
                <div className="space-y-1 flex-1">
                  <div className="inline-flex items-center px-2 py-0.5 rounded-full text-[9px] font-bold uppercase mb-0.5" style={{ backgroundColor: 'color-mix(in srgb, var(--accent) 20%, transparent)', color: 'var(--accent)' }}>
                    {bannerInfo.webBadge}
                  </div>
                  <h2 className="text-sm sm:text-base font-black tracking-tight" style={{ color: "var(--foreground-heading)" }}>
                    {renderHighlightedText(bannerInfo.webTitle)} <span className="text-[11px] font-bold opacity-80">({appInfo.apkSize})</span>
                  </h2>
                  <p className="text-[11px] opacity-85 leading-relaxed" style={{ color: "var(--foreground)" }}>{bannerInfo.webDesc}</p>
                </div>
                <button onClick={() => setShowDownloadConfirm(true)} className="w-full sm:w-auto px-4 py-2.5 rounded-xl text-white font-extrabold text-[11px] shadow-lg color-shift-bg flex justify-center items-center gap-1.5" style={{ backgroundImage: 'linear-gradient(270deg, var(--accent), #ff6b6b, #4ecdc4, var(--accent))' }}>
                  <svg className="w-3.5 h-3.5 fill-current" viewBox="0 0 24 24"><path d="M5 20h14v-2H5v2zM19 9h-4V3H9v6H5l7 7 7-7z"/></svg> Unduh APK
                </button>
              </div>
            </motion.div>
          )
        )}

        {/* 3. Kolom Platform Perpesanan */}
        {isEditMode ? (
          <div className="p-3.5 bg-amber-500/10 border border-amber-500/30 rounded-2xl space-y-3 text-xs">
            <h3 className="text-amber-500 font-black text-xs border-b border-amber-500/30 pb-1.5">Edit Teks Platform</h3>
            <label className="admin-label">Badge</label>
            <input type="text" className="admin-input" value={platformInfo.badge} onChange={e => setPlatformInfo({...platformInfo, badge: e.target.value})} />
            
            <label className="admin-label">Judul</label>
            <input type="text" className="admin-input" value={platformInfo.title} onChange={e => setPlatformInfo({...platformInfo, title: e.target.value})} />
            
            <label className="admin-label">Deskripsi</label>
            <textarea rows={3} className="admin-input" value={platformInfo.description} onChange={e => setPlatformInfo({...platformInfo, description: e.target.value})} />
          </div>
        ) : (
          <motion.div className="p-3.5 rounded-3xl text-left border" style={{ backgroundColor: "var(--card-bg)", borderColor: "var(--card-border)" }}>
            <div onClick={() => setShowPlatform(!showPlatform)} className="flex items-center justify-between gap-2 cursor-pointer group">
              <div>
                <span className="inline-block px-2 py-0.5 rounded-full text-[9px] font-extrabold uppercase mb-1.5" style={{ backgroundColor: 'color-mix(in srgb, var(--accent) 15%, transparent)', color: 'var(--accent)' }}>
                  {platformInfo.badge}
                </span>
                <h2 className="text-sm sm:text-base font-black tracking-tight leading-snug" style={{ color: "var(--foreground-heading)" }}>
                  {renderHighlightedText(platformInfo.title)}
                </h2>
              </div>
              <button className="p-1.5 rounded-xl flex items-center gap-1" style={{ backgroundColor: 'color-mix(in srgb, var(--accent) 10%, transparent)' }}>
                <motion.svg animate={{ rotate: showPlatform ? 180 : 0 }} className="w-3.5 h-3.5 fill-current" style={{ color: 'var(--accent)' }} viewBox="0 0 24 24"><path d="M7.41 8.59L12 13.17l4.59-4.58L18 10l-6 6-6-6 1.41-1.41z"/></motion.svg>
              </button>
            </div>
            <AnimatePresence initial={false}>
              {showPlatform && (
                <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: "auto", opacity: 1 }} exit={{ height: 0, opacity: 0 }} className="overflow-hidden">
                  <p className="text-[11px] opacity-85 leading-relaxed mt-2.5 pt-2 border-t" style={{ color: "var(--foreground)", borderColor: "var(--card-border)" }}>
                    {renderHighlightedText(platformInfo.description)}
                  </p>
                </motion.div>
              )}
            </AnimatePresence>
          </motion.div>
        )}

        {/* 4. Fitur Utama */}
        {isEditMode ? (
          <div className="p-3.5 bg-amber-500/10 border border-amber-500/30 rounded-2xl space-y-3.5 text-xs">
            <h3 className="text-amber-500 font-black text-xs border-b border-amber-500/30 pb-1.5">Edit Judul & Daftar Fitur Utama</h3>
            
            <div>
              <label className="admin-label">Judul Kolom Fitur Utama</label>
              <input 
                type="text" 
                className="admin-input" 
                value={appInfo.featuresTitle} 
                onChange={e => setAppInfo({...appInfo, featuresTitle: e.target.value})} 
              />
            </div>

            <div className="space-y-2.5 pt-1 border-t border-amber-500/20">
              {features.map((feature, idx) => (
                <div key={feature.id} className="p-2.5 bg-black/40 rounded-xl border border-amber-500/20 space-y-2">
                  <div className="flex justify-between items-center mb-0.5">
                    <span className="text-[9px] font-black text-amber-500">FITUR #{idx + 1}</span>
                    <button onClick={() => handleRemoveFeature(feature.id)} className="text-[9px] bg-red-900/50 text-red-300 px-2 py-0.5 rounded">Hapus</button>
                  </div>
                  
                  <div>
                    <label className="admin-label">Judul Fitur</label>
                    <input type="text" className="admin-input" value={feature.title} onChange={e => handleFeatureChange(feature.id, 'title', e.target.value)} />
                  </div>
                  
                  <div>
                    <label className="admin-label">Deskripsi Teks</label>
                    <textarea rows={2} className="admin-input" value={feature.text} onChange={e => handleFeatureChange(feature.id, 'text', e.target.value)} />
                  </div>

                  <div className="flex items-center justify-between pt-0.5">
                    <label className="text-[10px] text-white/80 font-bold flex items-center gap-1.5 cursor-pointer">
                      <input 
                        type="checkbox" 
                        checked={feature.isHighlight || false} 
                        onChange={e => handleFeatureChange(feature.id, 'isHighlight', e.target.checked)}
                        className="rounded border-amber-500 text-amber-500" 
                      />
                      Cetak Tebal / Highlight
                    </label>

                    <button 
                      type="button" 
                      onClick={() => toggleFeatureAction(feature.id)}
                      className="text-[9px] bg-amber-500/20 text-amber-400 px-2 py-0.5 rounded border border-amber-500/30 font-bold"
                    >
                      {feature.action ? 'Tombol: YA' : 'Tombol: TIDAK'}
                    </button>
                  </div>

                  {feature.action && (
                    <div className="grid grid-cols-2 gap-2 pt-1.5 border-t border-white/10">
                      <div>
                        <label className="admin-label">Teks Tombol</label>
                        <input 
                          type="text" 
                          className="admin-input" 
                          value={feature.action.label} 
                          onChange={e => handleFeatureActionChange(feature.id, 'label', e.target.value)} 
                        />
                      </div>
                      <div>
                        <label className="admin-label">Link Tujuan (Href)</label>
                        <input 
                          type="text" 
                          className="admin-input" 
                          value={feature.action.href} 
                          onChange={e => handleFeatureActionChange(feature.id, 'href', e.target.value)} 
                        />
                      </div>
                    </div>
                  )}
                </div>
              ))}
              <button onClick={handleAddFeature} className="w-full py-2 bg-amber-500 text-black rounded-xl text-xs font-black">+ Tambah Fitur Baru</button>
            </div>
          </div>
        ) : (
          <motion.div className="p-3.5 rounded-3xl border" style={{ backgroundColor: "var(--card-bg)", borderColor: "var(--card-border)" }}>
            <div onClick={() => setShowFeatures(!showFeatures)} className="flex items-center justify-between gap-2 border-b pb-2.5 cursor-pointer group" style={{ borderColor: "var(--card-border)" }}>
              <div className="flex items-center gap-2">
                <div className="w-6 h-6 rounded-full flex items-center justify-center border shrink-0" style={{ backgroundColor: "color-mix(in srgb, var(--accent) 10%, transparent)", borderColor: "var(--accent)" }}>
                  <div className="w-2 h-2 rounded-full" style={{ backgroundColor: "var(--accent)" }} />
                </div>
                <h3 className="text-sm sm:text-base font-black tracking-tight" style={{ color: "var(--foreground-heading)" }}>{appInfo.featuresTitle}</h3>
              </div>
              <div className="flex items-center gap-1.5">
                <span className="text-[9px] font-extrabold px-2 py-0.5 rounded-full border" style={{ borderColor: "var(--accent)", color: "var(--accent)" }}>{appInfo.version}</span>
                <button className="p-1 rounded-xl" style={{ backgroundColor: 'color-mix(in srgb, var(--accent) 10%, transparent)' }}>
                  <motion.svg animate={{ rotate: showFeatures ? 180 : 0 }} className="w-3.5 h-3.5 fill-current" style={{ color: 'var(--accent)' }} viewBox="0 0 24 24"><path d="M7.41 8.59L12 13.17l4.59-4.58L18 10l-6 6-6-6 1.41-1.41z"/></motion.svg>
                </button>
              </div>
            </div>

            <AnimatePresence initial={false}>
              {showFeatures && (
                <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: "auto", opacity: 1 }} exit={{ height: 0, opacity: 0 }} className="overflow-hidden pt-3">
                  <ul className="space-y-3">
                    {features.map((feature, idx) => (
                      <li key={feature.id} className="flex gap-2">
                        <span className="font-black text-xs mt-0.5 shrink-0" style={{ color: "var(--accent)" }}>{idx + 1}.</span>
                        <div>
                          <h4 className="text-xs font-bold mb-0.5" style={{ color: "var(--foreground-heading)" }}>{feature.title}</h4>
                          <p className={`text-[11px] opacity-85 leading-relaxed ${feature.isHighlight ? 'font-bold italic' : ''}`} style={{ color: feature.isHighlight ? "var(--accent)" : "var(--foreground)" }}>
                            {renderHighlightedText(feature.text)}
                          </p>
                          {feature.action && (
                            <div className="mt-1.5">
                              <Link href={feature.action.href} className="inline-flex items-center px-3 py-1 rounded-full text-white font-bold text-[10px] shadow-md" style={{ background: "linear-gradient(135deg, color-mix(in srgb, var(--accent) 60%, white), var(--accent))" }}>{feature.action.label}</Link>
                            </div>
                          )}
                        </div>
                      </li>
                    ))}
                  </ul>
                </motion.div>
              )}
            </AnimatePresence>
          </motion.div>
        )}

        {/* 5. Panduan Video Section */}
        <motion.div className="relative w-full rounded-3xl p-3.5 mt-3 border" style={{ backgroundColor: "var(--card-bg)", borderColor: "var(--card-border)", boxShadow: "0 8px 24px -8px rgba(0,0,0,0.2)" }}>
          {isEditMode && (
            <div className="p-2.5 mb-2.5 bg-amber-500/10 border border-amber-500/30 rounded-xl space-y-2 text-xs">
              <div>
                <label className="admin-label">Judul Kolom Video</label>
                <input 
                  type="text" 
                  className="admin-input" 
                  value={appInfo.videoSectionTitle} 
                  onChange={e => setAppInfo({...appInfo, videoSectionTitle: e.target.value})} 
                />
              </div>
              <div>
                <label className="admin-label">Edit Link / URL Video Panduan (MP4)</label>
                <input 
                  type="text" 
                  className="admin-input" 
                  placeholder="https://res.cloudinary.com/.../video.mp4" 
                  value={appInfo.videoUrl || ''} 
                  onChange={e => setAppInfo({...appInfo, videoUrl: e.target.value})} 
                />
              </div>
            </div>
          )}

          <div onClick={() => !isEditMode && setShowVideo(!showVideo)} className={`flex items-center justify-between gap-2 pb-2.5 cursor-pointer group ${showVideo ? 'border-b' : ''}`} style={{ borderColor: "var(--card-border)" }}>
            <div className="flex items-center gap-2">
              <div className="w-6 h-6 rounded-full flex items-center justify-center border shrink-0" style={{ backgroundColor: "color-mix(in srgb, var(--accent) 10%, transparent)", borderColor: "var(--accent)" }}>
                <svg className="w-2.5 h-2.5 fill-current ml-0.5" style={{ color: "var(--accent)" }} viewBox="0 0 24 24"><path d="M8 5v14l11-7z"/></svg>
              </div>
              <h3 className="text-sm sm:text-base font-black tracking-tight" style={{ color: "var(--foreground-heading)" }}>{appInfo.videoSectionTitle}</h3>
            </div>
            {!isEditMode && (
              <div className="flex items-center gap-1.5">
                <span className="text-[9px] font-extrabold px-2 py-0.5 rounded-full border" style={{ borderColor: "var(--accent)", color: "var(--accent)" }}>{showVideo ? 'Tutup' : 'Buka'}</span>
                <button className="p-1 rounded-xl" style={{ backgroundColor: 'color-mix(in srgb, var(--accent) 10%, transparent)' }}>
                  <motion.svg animate={{ rotate: showVideo ? 180 : 0 }} className="w-3.5 h-3.5 fill-current" style={{ color: 'var(--accent)' }} viewBox="0 0 24 24"><path d="M7.41 8.59L12 13.17l4.59-4.58L18 10l-6 6-6-6 1.41-1.41z"/></motion.svg>
                </button>
              </div>
            )}
          </div>

          <AnimatePresence initial={false}>
            {showVideo && (
              <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: "auto", opacity: 1 }} exit={{ height: 0, opacity: 0 }} className="overflow-hidden pt-3">
                <div className="relative w-full rounded-2xl overflow-hidden bg-black flex justify-center">
                  <video key={appInfo.videoUrl} src={appInfo.videoUrl} controls loop playsInline className="w-full h-auto max-h-[45vh] object-contain rounded-2xl" />
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </motion.div>
        
        {/* Footer (Dapat Diedit Sepenuhnya & Mengarah ke Link Tujuan) */}
        <div className="flex flex-col items-center justify-center mt-5 mb-1 space-y-0.5">
          <div className="w-6 h-0.5 rounded-full mb-1" style={{ backgroundColor: "color-mix(in srgb, var(--accent) 40%, transparent)" }} />
          <a href={appInfo.footerUrl} target="_blank" rel="noopener noreferrer" className="text-[10px] font-black uppercase tracking-[0.2em] hover:opacity-80 transition-opacity" style={{ color: "var(--accent)" }}>
            {appInfo.footerText} © {appInfo.year}
          </a>
          <p className="text-[8px] font-bold opacity-60 uppercase tracking-widest" style={{ color: "var(--foreground)" }}>
            {appInfo.footerSubText}
          </p>
        </div>
      </div>
      <BottomNav />
    </div>
  );
}