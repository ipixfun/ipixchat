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
};

const DEFAULT_BANNER_INFO = {
  apkThankYouTitle: "Terima Kasih!",
  apkThankYouDesc: "Terima kasih supportnya sudah menggunakan apk ipixchat. Nikmati pengalaman berinteraksi yang lebih cepat dan lancar.",
  webBadge: "Aplikasi Android",
  webTitle: "Unduh ipixchat",
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

const ECOSYSTEM_LINKS = [
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
  const [adminPasswordInput, setAdminPasswordInput] = useState('');
  const [saveSuccessMsg, setSaveSuccessMsg] = useState('');

  // DATA KONTEN DENGAN STATE
  const [appInfo, setAppInfo] = useState(DEFAULT_APP_INFO);
  const [bannerInfo, setBannerInfo] = useState(DEFAULT_BANNER_INFO);
  const [platformInfo, setPlatformInfo] = useState(DEFAULT_PLATFORM_INFO);
  const [features, setFeatures] = useState(DEFAULT_FEATURES);

  // State Toggle Pull-Down
  const [showVideo, setShowVideo] = useState(true);
  const [showPlatform, setShowPlatform] = useState(false);
  const [showFeatures, setShowFeatures] = useState(false);

  // Load Data dari Supabase
  useEffect(() => {
    if (typeof window === 'undefined') return;

    const adminSaved = localStorage.getItem('ipix_is_admin') === 'true';
    setIsAdmin(adminSaved);

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
        }
      } catch (err) {
        console.error("Menggunakan fallback data default:", err);
      }
    };

    fetchContent();
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

  // Handler Admin & Simpan ke Supabase
  const handleAdminLogin = (e: React.FormEvent) => {
    e.preventDefault();
    if (adminPasswordInput === 'admin123') {
      setIsAdmin(true);
      localStorage.setItem('ipix_is_admin', 'true');
      setShowAdminLoginModal(false);
      setAdminPasswordInput('');
    } else {
      alert('Password Admin Salah!');
    }
  };

  const handleAdminLogout = () => {
    setIsAdmin(false);
    setIsEditMode(false);
    localStorage.removeItem('ipix_is_admin');
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

  const renderHighlightedText = (text: string) => {
    if (!text) return null;
    const parts = text.split(/(pix)/i);
    return parts.map((part, index) => {
      if (part.toLowerCase() === 'pix') {
        return (
          <span 
            key={index} 
            className="italic font-black drop-shadow-md brightness-[1.3] px-0.5" 
            style={{ 
              color: 'var(--accent)', 
              filter: 'drop-shadow(0 0 10px color-mix(in srgb, var(--accent) 70%, transparent))' 
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
    <div className="w-full max-w-2xl mx-auto h-dvh flex flex-col pb-[70px] relative overflow-hidden bg-[var(--background)]">
      <style>{`
        .hide-scroll::-webkit-scrollbar { display: none; }
        .hide-scroll { -ms-overflow-style: none; scrollbar-width: none; }
        .glow-text { text-shadow: 0 0 20px color-mix(in srgb, var(--accent) 50%, transparent); }
        .glass-card { backdrop-filter: blur(16px); -webkit-backdrop-filter: blur(16px); }
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
          padding: 10px 14px;
          border-radius: 12px;
          font-size: 13px;
          outline: none;
          transition: all 0.2s;
        }
        .admin-input:focus {
          border-color: var(--accent);
          box-shadow: 0 0 10px color-mix(in srgb, var(--accent) 40%, transparent);
        }
        .admin-label {
          display: block;
          font-size: 11px;
          font-weight: 800;
          color: var(--accent);
          margin-bottom: 6px;
          text-transform: uppercase;
          letter-spacing: 0.5px;
        }
      `}</style>

      {/* FLOATING ACTION BUTTON ADMIN */}
      {isAdmin && !isEditMode && (
        <motion.button 
          initial={{ scale: 0 }} animate={{ scale: 1 }}
          onClick={toggleEditMode} 
          className="fixed bottom-24 right-4 sm:right-6 z-[60] bg-amber-500 text-black px-4 py-3 rounded-full font-black shadow-[0_5px_20px_rgba(245,158,11,0.5)] flex items-center gap-2 hover:scale-105 active:scale-95 transition-transform"
        >
          <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24"><path d="M3 17.25V21h3.75L17.81 9.94l-3.75-3.75L3 17.25zM20.71 7.04c.39-.39.39-1.02 0-1.41l-2.34-2.34a.995.995 0 00-1.41 0l-1.83 1.83 3.75 3.75 1.83-1.83z"/></svg>
          Edit Halaman
        </motion.button>
      )}

      {/* FLOATING CONTROL BAR ADMIN */}
      {isAdmin && isEditMode && (
        <motion.div 
          initial={{ y: 50, opacity: 0 }} animate={{ y: 0, opacity: 1 }}
          className="fixed bottom-20 left-4 right-4 sm:left-auto sm:w-[400px] z-[60] p-3 rounded-2xl shadow-2xl flex items-center justify-between gap-3 border border-amber-500/50 backdrop-blur-xl bg-black/80"
        >
          <div className="flex flex-col">
            <span className="text-amber-500 font-black text-xs leading-none">MODE EDIT AKTIF</span>
            <span className="text-[9px] text-white/60">Edit konten & simpan ke Supabase</span>
          </div>
          <div className="flex gap-2">
            <button onClick={() => setIsEditMode(false)} className="px-3 py-2 bg-red-600/20 text-red-400 text-xs font-bold rounded-xl active:scale-95 border border-red-600/30">Batal</button>
            <button onClick={handleSaveAllChanges} className="px-3 py-2 bg-emerald-600 text-white text-xs font-bold rounded-xl active:scale-95 shadow-lg shadow-emerald-900/50">Simpan Perubahan</button>
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
              className="w-full max-w-sm p-6 rounded-3xl shadow-2xl"
              style={{ backgroundColor: "var(--card-bg)", border: "1px solid color-mix(in srgb, var(--accent) 30%, transparent)" }}
            >
              <h3 className="text-lg font-black mb-1" style={{ color: "var(--foreground-heading)" }}>Akses Mode Admin</h3>
              <p className="text-xs mb-4 opacity-75" style={{ color: "var(--foreground)" }}>
                Pass default: <strong>admin123</strong>
              </p>

              <form onSubmit={handleAdminLogin} className="space-y-4">
                <input
                  type="password"
                  placeholder="Masukkan Password"
                  value={adminPasswordInput}
                  onChange={(e) => setAdminPasswordInput(e.target.value)}
                  className="w-full px-4 py-3 rounded-xl text-sm border outline-none"
                  style={{ backgroundColor: "var(--background)", color: "var(--foreground)", borderColor: "var(--card-border)" }}
                />
                
                <div className="flex gap-2.5">
                  <button type="button" onClick={() => setShowAdminLoginModal(false)} className="flex-1 py-2.5 rounded-xl text-xs font-bold border" style={{ borderColor: "var(--card-border)", color: "var(--foreground)" }}>Batal</button>
                  <button type="submit" className="flex-1 py-2.5 rounded-xl text-xs font-bold text-white" style={{ backgroundColor: "var(--accent)" }}>Login</button>
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
            <motion.div initial={{ scale: 0.9, y: 20 }} animate={{ scale: 1, y: 0 }} exit={{ scale: 0.9, y: 20 }} className="w-full max-w-sm p-5 rounded-3xl text-center shadow-2xl" style={{ backgroundColor: "var(--card-bg)", border: "1px solid var(--card-border)" }}>
              <h3 className="text-lg sm:text-xl font-black mb-2" style={{ color: "var(--foreground-heading)" }}>Konfirmasi Unduhan</h3>
              <p className="text-sm mb-6 opacity-80" style={{ color: "var(--foreground)" }}>Setuju mengunduh <strong>ipixchat.apk</strong> ({appInfo.apkSize})?</p>
              <div className="flex gap-2">
                <button onClick={() => setShowDownloadConfirm(false)} className="flex-1 py-3 rounded-xl font-bold text-sm border">Batal</button>
                <a href={appInfo.apkDownloadUrl} download="ipixchat.apk" onClick={() => setShowDownloadConfirm(false)} className="flex-1 py-3 rounded-xl font-bold text-sm text-white color-shift-bg flex items-center justify-center" style={{ backgroundImage: 'linear-gradient(270deg, var(--accent), #ff6b6b, #4ecdc4, var(--accent))' }}>Setuju</a>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* NOTIFIKASI SUKSES SIMPAN */}
      {saveSuccessMsg && (
        <div className="fixed top-20 left-1/2 -translate-x-1/2 z-[60] bg-emerald-500 text-white text-xs font-bold px-5 py-2.5 rounded-full shadow-2xl animate-bounce border border-emerald-400">
          {saveSuccessMsg}
        </div>
      )}

      {/* Header */}
      <header className="sticky top-0 z-20 px-4 sm:px-5 py-3 glass-card border-b" style={{ backgroundColor: "color-mix(in srgb, var(--background) 75%, transparent)", borderColor: "var(--card-border)" }}>
        <div className="flex items-center justify-between gap-2">
          <div className="flex items-center gap-2">
            <div className="w-9 h-9 rounded-2xl flex items-center justify-center shadow-md overflow-hidden bg-black/10 border" style={{ borderColor: "color-mix(in srgb, var(--accent) 30%, transparent)" }}>
              <img src="/icon.png" alt="ipixchat" className="w-full h-full object-cover" />
            </div>
            <h1 className="text-xl font-black tracking-tight glow-text" style={{ color: "var(--foreground-heading)" }}>
              {appInfo.appName}
            </h1>
          </div>
          <div className="flex items-center gap-1.5 justify-end">
            {ECOSYSTEM_LINKS.map((item, idx) => (
              <a key={idx} href={item.url} target="_blank" rel="noopener noreferrer" className="px-2.5 py-1 rounded-full text-[9px] font-extrabold tracking-wide transition-transform hover:scale-105 active:scale-95" style={{ color: "var(--accent)", border: "1px solid color-mix(in srgb, var(--accent) 60%, transparent)", backgroundColor: "color-mix(in srgb, var(--accent) 5%, transparent)" }}>
                {item.name}
              </a>
            ))}
            
            {isAdmin && (
              <button onClick={handleAdminLogout} className="px-2.5 py-1 rounded-full text-[9px] font-extrabold tracking-wide bg-red-600/20 text-red-500 border border-red-600/30 active:scale-95">
                Keluar Admin
              </button>
            )}
          </div>
        </div>
      </header>

      {/* Konten Utama */}
      <div className="flex-1 overflow-y-auto hide-scroll space-y-4 sm:space-y-5 pt-3 pb-6 px-3.5 sm:px-6">

        {/* [MODE EDIT] PENGATURAN APP UMUM */}
        {isEditMode && (
          <div className="p-4 bg-amber-500/10 border border-amber-500/30 rounded-2xl space-y-3">
            <h3 className="text-amber-500 font-black text-sm border-b border-amber-500/30 pb-2">Pengaturan Aplikasi Umum</h3>
            <div className="grid grid-cols-2 gap-3">
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
            <div>
              <label className="admin-label">Link Video Panduan (MP4)</label>
              <input type="text" className="admin-input" value={appInfo.videoUrl || ''} onChange={e => setAppInfo({...appInfo, videoUrl: e.target.value})} />
            </div>
          </div>
        )}

        {/* 1. Animasi Mascot GIF */}
        {!isEditMode && (
          <motion.div
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, ease: "easeOut" }}
            className="w-full flex justify-center items-center py-1 sm:py-2 pointer-events-none"
          >
            <img
              src={appInfo.gifUrl}
              alt="Mascot GIF"
              className="w-full h-auto max-h-[220px] sm:max-h-[280px] object-contain"
              style={{ filter: "drop-shadow(0 15px 25px color-mix(in srgb, var(--accent) 35%, transparent))" }}
            />
          </motion.div>
        )}
        
        {/* 2. Banner APK / Web */}
        {isEditMode ? (
          <div className="p-4 bg-amber-500/10 border border-amber-500/30 rounded-2xl space-y-3">
            <h3 className="text-amber-500 font-black text-sm border-b border-amber-500/30 pb-2">Edit Teks Banner</h3>
            <div className="space-y-2">
              <label className="admin-label mt-2">Banner Web (Unduh)</label>
              <input type="text" className="admin-input" placeholder="Badge" value={bannerInfo.webBadge} onChange={e => setBannerInfo({...bannerInfo, webBadge: e.target.value})} />
              <input type="text" className="admin-input" placeholder="Judul" value={bannerInfo.webTitle} onChange={e => setBannerInfo({...bannerInfo, webTitle: e.target.value})} />
              <textarea rows={2} className="admin-input" placeholder="Deskripsi" value={bannerInfo.webDesc} onChange={e => setBannerInfo({...bannerInfo, webDesc: e.target.value})} />
            </div>
            <div className="space-y-2 mt-4 border-t border-amber-500/30 pt-3">
              <label className="admin-label">Banner APK (Terima Kasih)</label>
              <input type="text" className="admin-input" placeholder="Judul" value={bannerInfo.apkThankYouTitle} onChange={e => setBannerInfo({...bannerInfo, apkThankYouTitle: e.target.value})} />
              <textarea rows={2} className="admin-input" placeholder="Deskripsi" value={bannerInfo.apkThankYouDesc} onChange={e => setBannerInfo({...bannerInfo, apkThankYouDesc: e.target.value})} />
            </div>
          </div>
        ) : (
          isApk ? (
            <motion.div className="py-8 px-4 rounded-2xl relative overflow-hidden border text-center flex flex-col items-center justify-center gap-2" style={{ background: `linear-gradient(135deg, color-mix(in srgb, var(--accent) 12%, var(--background)) 0%, var(--card-bg) 100%)`, borderColor: "var(--card-border)" }}>
              <div className="absolute inset-0 overflow-hidden pointer-events-none opacity-25">
                <svg className="absolute -bottom-2 left-0 w-[200%] h-24 animate-wave" viewBox="0 0 1200 120" preserveAspectRatio="none">
                  <path d="M0,0 C150,90 350,-40 500,40 C650,120 900,10 1200,40 L1200,120 L0,120 Z" fill="var(--accent)" />
                </svg>
              </div>
              <div className="relative z-10 w-full">
                <h2 className="text-lg sm:text-xl font-black tracking-tight mb-1.5" style={{ color: "var(--accent)" }}>{bannerInfo.apkThankYouTitle}</h2>
                <p className="text-xs font-medium leading-relaxed max-w-[280px] mx-auto break-words" style={{ color: "var(--foreground)" }}>{bannerInfo.apkThankYouDesc}</p>
              </div>
            </motion.div>
          ) : (
            <motion.div className="p-4 sm:p-6 rounded-2xl relative overflow-hidden border" style={{ background: `linear-gradient(135deg, color-mix(in srgb, var(--accent) 25%, var(--background)) 0%, var(--card-bg) 100%)`, borderColor: "var(--card-border)" }}>
              <div className="relative z-10 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3.5">
                <div className="space-y-1 flex-1">
                  <div className="inline-flex items-center px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase mb-1" style={{ backgroundColor: 'color-mix(in srgb, var(--accent) 20%, transparent)', color: 'var(--accent)' }}>
                    {bannerInfo.webBadge}
                  </div>
                  <h2 className="text-lg sm:text-xl font-black tracking-tight" style={{ color: "var(--foreground-heading)" }}>
                    {renderHighlightedText(bannerInfo.webTitle)} <span className="text-xs font-bold opacity-80">({appInfo.apkSize})</span>
                  </h2>
                  <p className="text-xs opacity-85 leading-relaxed" style={{ color: "var(--foreground)" }}>{bannerInfo.webDesc}</p>
                </div>
                <button onClick={() => setShowDownloadConfirm(true)} className="w-full sm:w-auto px-5 py-3 rounded-xl text-white font-extrabold text-xs shadow-xl color-shift-bg flex justify-center items-center gap-2" style={{ backgroundImage: 'linear-gradient(270deg, var(--accent), #ff6b6b, #4ecdc4, var(--accent))' }}>
                  <svg className="w-4 h-4 fill-current" viewBox="0 0 24 24"><path d="M5 20h14v-2H5v2zM19 9h-4V3H9v6H5l7 7 7-7z"/></svg> Unduh APK
                </button>
              </div>
            </motion.div>
          )
        )}

        {/* 3. Kolom Platform Perpesanan */}
        {isEditMode ? (
          <div className="p-4 bg-amber-500/10 border border-amber-500/30 rounded-2xl space-y-3">
            <h3 className="text-amber-500 font-black text-sm border-b border-amber-500/30 pb-2">Edit Teks Platform</h3>
            <label className="admin-label">Badge</label>
            <input type="text" className="admin-input" value={platformInfo.badge} onChange={e => setPlatformInfo({...platformInfo, badge: e.target.value})} />
            
            <label className="admin-label">Judul</label>
            <input type="text" className="admin-input" value={platformInfo.title} onChange={e => setPlatformInfo({...platformInfo, title: e.target.value})} />
            
            <label className="admin-label">Deskripsi</label>
            <textarea rows={4} className="admin-input" value={platformInfo.description} onChange={e => setPlatformInfo({...platformInfo, description: e.target.value})} />
          </div>
        ) : (
          <motion.div className="p-4 rounded-2xl text-left border" style={{ backgroundColor: "var(--card-bg)", borderColor: "var(--card-border)" }}>
            <div onClick={() => setShowPlatform(!showPlatform)} className="flex items-center justify-between gap-2 cursor-pointer group">
              <div>
                <span className="inline-block px-2.5 py-0.5 rounded-full text-[9px] font-extrabold uppercase mb-2" style={{ backgroundColor: 'color-mix(in srgb, var(--accent) 15%, transparent)', color: 'var(--accent)' }}>
                  {platformInfo.badge}
                </span>
                <h2 className="text-lg sm:text-xl font-black tracking-tight leading-snug" style={{ color: "var(--foreground-heading)" }}>
                  {renderHighlightedText(platformInfo.title)}
                </h2>
              </div>
              <button className="p-2 rounded-xl flex items-center gap-1.5" style={{ backgroundColor: 'color-mix(in srgb, var(--accent) 10%, transparent)' }}>
                <motion.svg animate={{ rotate: showPlatform ? 180 : 0 }} className="w-4 h-4 fill-current" style={{ color: 'var(--accent)' }} viewBox="0 0 24 24"><path d="M7.41 8.59L12 13.17l4.59-4.58L18 10l-6 6-6-6 1.41-1.41z"/></motion.svg>
              </button>
            </div>
            <AnimatePresence initial={false}>
              {showPlatform && (
                <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: "auto", opacity: 1 }} exit={{ height: 0, opacity: 0 }} className="overflow-hidden">
                  <p className="text-xs opacity-85 leading-relaxed mt-3 pt-2 border-t" style={{ color: "var(--foreground)", borderColor: "var(--card-border)" }}>
                    {renderHighlightedText(platformInfo.description)}
                  </p>
                </motion.div>
              )}
            </AnimatePresence>
          </motion.div>
        )}

        {/* 4. Fitur Utama */}
        {isEditMode ? (
          <div className="p-4 bg-amber-500/10 border border-amber-500/30 rounded-2xl space-y-4">
            <h3 className="text-amber-500 font-black text-sm border-b border-amber-500/30 pb-2">Edit Fitur Aplikasi</h3>
            {features.map((feature, idx) => (
              <div key={feature.id} className="p-3 bg-black/40 rounded-xl border border-amber-500/20 space-y-2">
                <div className="flex justify-between items-center mb-1">
                  <span className="text-[10px] font-black text-amber-500">FITUR #{idx + 1}</span>
                  <button onClick={() => handleRemoveFeature(feature.id)} className="text-[10px] bg-red-900/50 text-red-300 px-2 py-1 rounded">Hapus</button>
                </div>
                <input type="text" className="admin-input" placeholder="Judul Fitur" value={feature.title} onChange={e => handleFeatureChange(feature.id, 'title', e.target.value)} />
                <textarea rows={2} className="admin-input" placeholder="Deskripsi Fitur" value={feature.text} onChange={e => handleFeatureChange(feature.id, 'text', e.target.value)} />
              </div>
            ))}
            <button onClick={handleAddFeature} className="w-full py-2.5 bg-amber-500 text-black rounded-xl text-xs font-black">+ Tambah Fitur</button>
          </div>
        ) : (
          <motion.div className="p-4 rounded-2xl border" style={{ backgroundColor: "var(--card-bg)", borderColor: "var(--card-border)" }}>
            <div onClick={() => setShowFeatures(!showFeatures)} className="flex items-center justify-between gap-2 border-b pb-3 cursor-pointer group" style={{ borderColor: "var(--card-border)" }}>
              <div className="flex items-center gap-2.5">
                <div className="w-7 h-7 rounded-full flex items-center justify-center border shrink-0" style={{ backgroundColor: "color-mix(in srgb, var(--accent) 10%, transparent)", borderColor: "var(--accent)" }}>
                  <div className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: "var(--accent)" }} />
                </div>
                <h3 className="text-lg sm:text-xl font-black tracking-tight" style={{ color: "var(--foreground-heading)" }}>Fitur Utama</h3>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-[10px] font-extrabold px-2.5 py-0.5 rounded-full border" style={{ borderColor: "var(--accent)", color: "var(--accent)" }}>{appInfo.version}</span>
                <button className="p-1.5 rounded-xl" style={{ backgroundColor: 'color-mix(in srgb, var(--accent) 10%, transparent)' }}>
                  <motion.svg animate={{ rotate: showFeatures ? 180 : 0 }} className="w-4 h-4 fill-current" style={{ color: 'var(--accent)' }} viewBox="0 0 24 24"><path d="M7.41 8.59L12 13.17l4.59-4.58L18 10l-6 6-6-6 1.41-1.41z"/></motion.svg>
                </button>
              </div>
            </div>

            <AnimatePresence initial={false}>
              {showFeatures && (
                <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: "auto", opacity: 1 }} exit={{ height: 0, opacity: 0 }} className="overflow-hidden pt-3.5">
                  <ul className="space-y-4">
                    {features.map((feature, idx) => (
                      <li key={feature.id} className="flex gap-2.5">
                        <span className="font-black text-xs mt-0.5 shrink-0" style={{ color: "var(--accent)" }}>{idx + 1}.</span>
                        <div>
                          <h4 className="text-xs font-bold mb-0.5" style={{ color: "var(--foreground-heading)" }}>{feature.title}</h4>
                          <p className={`text-[11px] opacity-85 leading-relaxed ${feature.isHighlight ? 'font-bold italic' : ''}`} style={{ color: feature.isHighlight ? "var(--accent)" : "var(--foreground)" }}>
                            {renderHighlightedText(feature.text)}
                          </p>
                          {feature.action && (
                            <div className="mt-2">
                              <Link href={feature.action.href} className="inline-flex items-center px-3.5 py-1.5 rounded-full text-white font-bold text-[11px] shadow-md" style={{ background: "linear-gradient(135deg, color-mix(in srgb, var(--accent) 60%, white), var(--accent))" }}>{feature.action.label}</Link>
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
        <motion.div className="relative w-full rounded-2xl p-2 sm:p-3 mt-4" style={{ backgroundColor: "var(--card-bg)", border: "1px solid var(--card-border)", boxShadow: "0 10px 30px -10px rgba(0,0,0,0.2)" }}>
          {isEditMode && (
            <div className="p-3 mb-3 bg-amber-500/10 border border-amber-500/30 rounded-xl space-y-1">
              <label className="admin-label">Edit Link / URL Video Panduan (MP4)</label>
              <input 
                type="text" 
                className="admin-input" 
                placeholder="https://res.cloudinary.com/.../video.mp4" 
                value={appInfo.videoUrl || ''} 
                onChange={e => setAppInfo({...appInfo, videoUrl: e.target.value})} 
              />
            </div>
          )}

          <button onClick={() => !isEditMode && setShowVideo(!showVideo)} className={`w-full flex items-center justify-between px-2.5 py-1.5 mb-1.5 rounded-xl outline-none ${isEditMode ? 'cursor-default' : 'active:scale-[0.99] hover:bg-white/5'}`} style={{ backgroundColor: 'color-mix(in srgb, var(--accent) 8%, transparent)' }}>
            <div className="flex items-center gap-2">
              <span className="w-2 h-2 rounded-full animate-pulse" style={{ backgroundColor: 'var(--accent)' }} />
              <span className="font-extrabold text-xs tracking-wide" style={{ color: 'var(--foreground-heading)' }}>Panduan Video</span>
            </div>
            {!isEditMode && (
              <div className="flex items-center gap-1.5">
                <span className="text-[10px] font-bold opacity-75" style={{ color: 'var(--accent)' }}>{showVideo ? 'Tutup' : 'Buka'}</span>
                <motion.svg animate={{ rotate: showVideo ? 180 : 0 }} className="w-4 h-4 fill-current" style={{ color: 'var(--accent)' }} viewBox="0 0 24 24"><path d="M7.41 8.59L12 13.17l4.59-4.58L18 10l-6 6-6-6 1.41-1.41z"/></motion.svg>
              </div>
            )}
          </button>

          <AnimatePresence initial={false}>
            {showVideo && (
              <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: "auto", opacity: 1 }} exit={{ height: 0, opacity: 0 }} className="overflow-hidden">
                <div className="relative w-full rounded-xl overflow-hidden bg-black flex justify-center mt-1">
                  {/* key={appInfo.videoUrl} memaksa player re-render penuh tiap URL diubah */}
                  <video key={appInfo.videoUrl} src={appInfo.videoUrl} controls loop playsInline className="w-full h-auto max-h-[50vh] object-contain rounded-xl" />
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </motion.div>
        
        {/* Footer */}
        <div className="flex flex-col items-center justify-center mt-6 mb-2 space-y-1">
          <div className="w-8 h-1 rounded-full mb-1" style={{ backgroundColor: "color-mix(in srgb, var(--accent) 40%, transparent)" }} />
          <p onClick={() => !isAdmin && setShowAdminLoginModal(true)} className="text-[10px] font-black uppercase tracking-[0.2em] cursor-pointer hover:opacity-80" style={{ color: "var(--accent)" }} title="Klik untuk Login Admin">
            {appInfo.appName} © {appInfo.year}
          </p>
          <p className="text-[8px] font-bold opacity-60 uppercase tracking-widest" style={{ color: "var(--foreground)" }}>All Rights Reserved</p>
        </div>
      </div>
      <BottomNav />
    </div>
  );
}