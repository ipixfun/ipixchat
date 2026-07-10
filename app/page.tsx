'use client';

// --- IMPORTS ---
import { useEffect, useState, useCallback } from 'react';
import { usePathname } from 'next/navigation';
import { supabase } from './supabaseClient';

export default function Home() {
  const pathname = usePathname();

  // --- STATE MANAGEMENT ---
  const [mounted, setMounted] = useState(false);
  const [messages, setMessages] = useState<any[]>([]);
  const [blockedList, setBlockedList] = useState<any[]>([]);
  const [username, setUsername] = useState('');
  const [isExistingUser, setIsExistingUser] = useState(false);
  const [adminEmail, setAdminEmail] = useState('');
  const [adminPass, setAdminPass] = useState('');
  const [activeTab, setActiveTab] = useState<'user' | 'admin'>('user');
  const [chatMode, setChatMode] = useState<'public' | 'private'>('public');
  const [input, setInput] = useState('');
  const [isAuth, setIsAuth] = useState(false);
  const [sending, setSending] = useState(false);
  const [privateNotifCount, setPrivateNotifCount] = useState(0);
  const [isAdminOnline, setIsAdminOnline] = useState(false);
  const [adminOfflineTime, setAdminOfflineTime] = useState("");
  const [userStatus, setUserStatus] = useState<Record<string, { online: boolean; offlineTime?: string }>>({});
  const [selectedPrivateUser, setSelectedPrivateUser] = useState<string | null>(null);
  const [privateUsers, setPrivateUsers] = useState<any[]>([]);
  const [blockedWords, setBlockedWords] = useState<string[]>([]);
  const [newBadWord, setNewBadWord] = useState('');
  const [currentHash, setCurrentHash] = useState('');
  
  // Efek Kedip Input & Deteksi Sentuhan Layar
  const [inputBlink, setInputBlink] = useState(false);
  const [touchStartY, setTouchStartY] = useState(0);
  const [isScrolledToBottom, setIsScrolledToBottom] = useState(false);

  // State melacak data pesan asli yang sedang dibalas untuk tab preview di bawah
  const [replyingTo, setReplyingTo] = useState<any | null>(null);

  // State untuk melacak menu pop-up tindakan admin pesan mana yang sedang terbuka
  const [activeMenuId, setActiveMenuId] = useState<number | null>(null);

  const currentDeviceId = typeof window !== 'undefined' ? localStorage.getItem('device_id') : null;

  // --- HASH LISTENER ---
  useEffect(() => {
    const handleHash = () => setCurrentHash(window.location.hash);
    window.addEventListener('hashchange', handleHash);
    handleHash();
    return () => window.removeEventListener('hashchange', handleHash);
  }, []);

  // --- SENSOR & VALIDATION ---
  const containsBlockedWord = (text: string) => {
    return blockedWords.some(word =>
      word.trim() !== "" && text.toLowerCase().includes(word.toLowerCase())
    );
  };

  const applyCensor = (text: string) => {
    let result = text;
    blockedWords.forEach(word => {
      if (word.trim() !== "") {
        const regex = new RegExp(`\\b${word}\\b`, 'gi');
        result = result.replace(regex, '***');
      }
    });
    return result;
  };

  const copyToClipboard = (text: string, label: string) => {
    navigator.clipboard.writeText(text);
    alert(`${label} berhasil disalin!`);
  };

  // --- UI HELPERS ---
  // Fungsi Scroll ke Kotak Asli dengan efek Blink Biru/Ijo Tipis (1.5 detik)
  const scrollToMessageId = (msgId: number) => {
    const el = document.getElementById(`msg-${msgId}`);
    if (el) {
      el.scrollIntoView({ behavior: 'smooth', block: 'center' });
      
      // Deteksi kelas warna ring tipis berdasarkan tipe chat aktif
      const blinkClasses = chatMode === 'private'
        ? ['ring-2', 'ring-emerald-400', 'bg-emerald-50/50']
        : ['ring-2', 'ring-blue-400', 'bg-blue-50/50'];
      
      el.classList.add(...blinkClasses);
      
      // Hapus kelas efek secara halus setelah durasi transisi selesai
      setTimeout(() => {
        el.classList.remove(...blinkClasses);
      }, 1500);
    }
  };

  // Fungsi scroll cadangan untuk format pesan teks kutipan konvensional
  const scrollToMessage = (quotedText: string) => {
    const targetMsg = messages.find(m => m.pesan.includes(quotedText));
    if (targetMsg) {
      scrollToMessageId(targetMsg.id);
    }
  };

  const renderMessageContent = (text: string) => {
    const regex = /^@(\w+)\s\("(.*?)"\)\s?(.*)$/;
    const match = text.match(regex);

    if (match) {
      const [_, user, quotedText, replyText] = match;
      const censoredQuote = applyCensor(quotedText);
      const censoredReply = applyCensor(replyText);
      return (
        <>
          <div 
            className={`text-[10px] text-gray-500 italic bg-gray-100 p-2 rounded cursor-pointer hover:bg-gray-200 border-l-2 mb-1 ${
              chatMode === 'private' ? 'border-emerald-500' : 'border-blue-500'
            }`} 
            onClick={() => scrollToMessage(quotedText)}
          >
            <span className="font-bold">@{user}</span>: "{censoredQuote}"
          </div>
          <div className="text-sm text-gray-800 break-words">{censoredReply}</div>
        </>
      );
    }
    return <div className="text-sm text-gray-800 break-words">{applyCensor(text)}</div>;
  };

  const formatNotif = (num: number) => {
    if (num >= 1000) return (num / 1000).toFixed(1).replace('.0', '') + 'k';
    return num.toString();
  };

  const getTimeAgo = (date: Date) => {
    const seconds = Math.floor((new Date().getTime() - date.getTime()) / 1000);
    let interval = seconds / 3600;
    if (interval >= 1) return Math.floor(interval) + " jam lalu";
    interval = seconds / 60;
    if (interval >= 1) return Math.floor(interval) + " menit lalu";
    return "baru saja";
  };

  const formatMessageTime = (dateStr: string) => {
    const date = new Date(dateStr);
    const options: Intl.DateTimeFormatOptions = { weekday: 'short', day: '2-digit', month: 'short', hour: '2-digit', minute: '2-digit' };
    return date.toLocaleDateString('id-ID', options).replace(',', '');
  };

  const getGreeting = () => {
    const now = new Date();
    const hour = now.getHours();
    let timeOfDay = hour >= 5 && hour < 12 ? "pagi" : hour >= 12 && hour < 15 ? "siang" : hour >= 15 && hour < 18 ? "sore" : "malam";
    return `Selamat ${timeOfDay}, `;
  };

  // --- HANDLERS TOUCH GESTURE (PULL UP TO REFRESH) ---
  const handleTouchStart = (e: React.TouchEvent) => {
    const container = e.currentTarget;
    const atBottom = Math.abs(container.scrollHeight - container.scrollTop - container.clientHeight) < 8;
    setIsScrolledToBottom(atBottom);
    setTouchStartY(e.touches[0].clientY);
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    if (!isScrolledToBottom) return;
    const currentY = e.touches[0].clientY;
    const pullDistance = touchStartY - currentY;

    if (pullDistance > 160) {
      window.location.reload();
    }
  };

  // --- ADMIN & TAG ACTIONS ---
  const handleTag = (targetUsername: string) => {
    const cleanName = targetUsername.split('●')[0];
    setInput(prev => `${prev} @${cleanName} `);
  };

  const addBlockedWord = async () => {
    if (!newBadWord.trim()) return;
    const capitalized = newBadWord.trim().charAt(0).toUpperCase() + newBadWord.trim().slice(1).toLowerCase();
    await supabase.from('blocked_words').insert([{ word: capitalized }]);
    setNewBadWord('');
    fetchData();
  };

  const removeBlockedWord = async (word: string) => {
    await supabase.from('blocked_words').delete().eq('word', word);
    fetchData();
  };

  // Handler Tombol Balas diklik -> Mengaktifkan Tab Banner Balasan di atas input teks
  const handleReply = (msgMessage: any) => {
    setReplyingTo(msgMessage);
    
    setInputBlink(true);
    setTimeout(() => setInputBlink(false), 800);

    const txtArea = document.getElementById('chat-input');
    if (txtArea) txtArea.focus();

    setTimeout(() => {
      const messageEl = document.getElementById(`msg-${msgMessage.id}`);
      if (messageEl) {
        messageEl.scrollIntoView({ behavior: 'smooth', block: 'center' });
      }
    }, 150);
  };

  // --- AUTH & DATA FETCHING ---
  const handleLogout = async () => {
    await supabase.auth.signOut();
    sessionStorage.clear();
    setIsAuth(false);
    window.location.replace("/");
  };

  const fetchData = useCallback(async () => {
    if (!currentDeviceId) return;
    try {
      const { data: bData } = await supabase.from('blocked_users').select('*');
      const { data: bWordsData } = await supabase.from('blocked_words').select('word');
      if (bWordsData) setBlockedWords(bWordsData.map(w => w.word));

      let query = supabase.from('messages').select('*').order('created_at', { ascending: true });

      if (chatMode === 'private') {
        if (activeTab === 'user') {
          query = query.eq('is_private', true).or(`device_id.eq.${currentDeviceId},private_with.eq.${currentDeviceId}`);
        } else if (selectedPrivateUser) {
          query = query.eq('is_private', true).or(`device_id.eq.${selectedPrivateUser},private_with.eq.${selectedPrivateUser}`);
        } else {
          query = query.eq('is_private', true).eq('device_id', 'none');
        }
      } else {
        query = query.eq('is_private', false);
      }

      const { data: mData } = await query;
      
      if (isAuth) {
        let countQuery = supabase.from('messages').select('*', { count: 'exact', head: true }).eq('is_private', true);
        if (activeTab === 'user') {
           countQuery = countQuery.or(`device_id.eq.${currentDeviceId},private_with.eq.${currentDeviceId}`);
        }
        const { count } = await countQuery;
        setPrivateNotifCount(count || 0);
      }

      if (bData) {
        setBlockedList(bData);
        if (bData.some(b => b.device_id === currentDeviceId)) {
          window.location.replace("https://ipix.my.id/chat");
          return;
        }
      }

      if (mData) {
        const blockedDeviceIds = bData?.map(b => b.device_id) || [];
        const filtered = mData.filter(m => !blockedDeviceIds.includes(m.device_id));
        setMessages(filtered);
      } else {
        setMessages([]);
      }

      if (mData) {
        const lastAdminMsg = mData.filter(m => m.username === 'Admin●ipix.my.id').pop();
        if (lastAdminMsg) {
          const lastDate = new Date(lastAdminMsg.created_at);
          const isOnline = Date.now() - lastDate.getTime() < 300000;
          setIsAdminOnline(isOnline);
          if (!isOnline) setAdminOfflineTime(getTimeAgo(lastDate));
        }

        const statusMap: Record<string, { online: boolean; offlineTime?: string }> = {};
        const userGroups = mData.reduce((acc: any, msg: any) => {
          if (msg.username !== 'Admin●ipix.my.id') {
            if (!acc[msg.username]) acc[msg.username] = [];
            acc[msg.username].push(msg);
          }
          return acc;
        }, {});

        Object.keys(userGroups).forEach(user => {
          const lastMsg = userGroups[user].pop();
          if (lastMsg) {
            const lastDate = new Date(lastMsg.created_at);
            const isOnline = Date.now() - lastDate.getTime() < 300000;
            statusMap[user] = { online: isOnline, offlineTime: !isOnline ? getTimeAgo(lastDate) : undefined };
          }
        });
        setUserStatus(statusMap);
      }

      if (activeTab === 'admin' && chatMode === 'private' && !selectedPrivateUser) {
        const { data: allPrivate } = await supabase.from('messages').select('device_id, username, created_at').eq('is_private', true).order('created_at', { ascending: false });
        if (allPrivate) {
          const userMap = new Map();
          const counts: Record<string, number> = {};
          allPrivate.forEach(msg => { if (msg.username !== 'Admin●ipix.my.id' && msg.device_id !== currentDeviceId) counts[msg.device_id] = (counts[msg.device_id] || 0) + 1; });
          allPrivate.forEach(msg => {
            if (msg.username !== 'Admin●ipix.my.id' && msg.device_id !== currentDeviceId && !userMap.has(msg.device_id)) {
              userMap.set(msg.device_id, { device_id: msg.device_id, username: msg.username, last_active: msg.created_at, count: counts[msg.device_id] || 0 });
            }
          });
          setPrivateUsers(Array.from(userMap.values()));
        } else {
          setPrivateUsers([]);
        }
      } else {
        setPrivateUsers([]);
      }
    } catch (err) { console.error("Fetch data error:", err); setMessages([]); }
  }, [chatMode, activeTab, selectedPrivateUser, currentDeviceId, isAuth]);

  // --- LIFECYCLE HOOKS ---
  useEffect(() => {
    if (!localStorage.getItem('device_id')) {
      localStorage.setItem('device_id', Math.random().toString(36).substring(2, 15));
    }

    const checkAuthAndProfile = async () => {
      const cid = localStorage.getItem('device_id');
      const { data: { session } } = await supabase.auth.getSession();
      const savedAuth = sessionStorage.getItem('is_auth');

      const isUrlAdmin = pathname.endsWith('/admin') || (typeof window !== 'undefined' && window.location.hash === '#admin');

      if (cid) {
        const { data: profileData } = await supabase
          .from('profiles')
          .select('username')
          .eq('device_id', cid)
          .single();

        if (profileData && profileData.username) {
          setUsername(profileData.username);
          setIsExistingUser(true);
          sessionStorage.setItem('saved_username', profileData.username);
        }
      }

      if (isUrlAdmin) {
        setActiveTab('admin');
      } else {
        const savedTab = sessionStorage.getItem('active_tab');
        setActiveTab((savedTab as 'user' | 'admin') || 'user');
      }

      if (session || savedAuth === 'true') {
        setIsAuth(true);
        if (session) {
          setUsername('Admin●ipix.my.id');
          setActiveTab('admin');
        } else if (!isExistingUser) {
          setUsername(sessionStorage.getItem('saved_username') || '');
        }
      }
      setMounted(true);
    };

    checkAuthAndProfile();
  }, [isExistingUser, pathname]);

  useEffect(() => {
    if (!mounted) return;
    fetchData();
    const channel = supabase.channel('chat').on('postgres_changes', { event: '*', schema: 'public', table: 'messages' }, fetchData).subscribe();
    return () => { void supabase.removeChannel(channel); };
  }, [mounted, fetchData]);

  // --- HANDLERS ---
  const handleAdminLogin = async () => {
    const { error } = await supabase.auth.signInWithPassword({ email: adminEmail, password: adminPass });
    if (error) alert("Login Admin Gagal");
    else {
      setIsAuth(true); setActiveTab('admin'); setUsername('Admin●ipix.my.id');
      sessionStorage.setItem('is_auth', 'true'); sessionStorage.setItem('saved_username', 'Admin●ipix.my.id'); sessionStorage.setItem('active_tab', 'admin');
    }
  };

  const handleUserLogin = async () => {
    if (!username.trim()) return alert("Masukkan nama Anda!");

    if (containsBlockedWord(username)) {
      return alert("Nama Anda mengandung kata yang dilarang. Silakan gunakan nama lain.");
    }

    const cid = localStorage.getItem('device_id') || 'guest';

    const { data: bData } = await supabase.from('blocked_users').select('*').eq('device_id', cid);
    if (bData && bData.length > 0) { window.location.replace("https://ipix.my.id/chat"); return; }

    try {
      await supabase
        .from('profiles')
        .upsert(
          { 
            device_id: cid, 
            username: username.trim(),
            user_browser: typeof window !== 'undefined' ? navigator.userAgent : 'Unknown'
          },
          { onConflict: 'device_id' }
        );
    } catch (err) {
      console.log("Gagal menyimpan ke database, melanjutkan sesi lokal:", err);
    }

    setIsAuth(true);
    sessionStorage.setItem('is_auth', 'true');
    sessionStorage.setItem('saved_username', username.trim());
    sessionStorage.setItem('active_tab', 'user');
  };

  const sendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || sending) return;

    setSending(true);

    // Format string pesan untuk database menggunakan penanda kutipan chat
    let finalPesan = input.trim();
    if (replyingTo) {
      const cleanName = replyingTo.username.split('●')[0];
      const quotedMessage = replyingTo.pesan.length > 30 ? replyingTo.pesan.substring(0, 30) + "..." : replyingTo.pesan;
      finalPesan = `@${cleanName} ("${quotedMessage}") ${input.trim()}`;
    }

    const payload = {
        username, 
        pesan: finalPesan, 
        device_id: localStorage.getItem('device_id') || 'guest',
        is_private: chatMode === 'private',
        private_with: chatMode === 'private' ? (activeTab === 'user' ? 'admin' : selectedPrivateUser) : null,
        user_browser: typeof window !== 'undefined' ? navigator.userAgent : 'Unknown'
    };

    if (username !== 'Admin●ipix.my.id') {
      const fiveMinutesAgo = new Date(Date.now() - 5 * 60 * 1000).toISOString();
      const { count } = await supabase
        .from('messages')
        .select('*', { count: 'exact', head: true })
        .eq('device_id', localStorage.getItem('device_id') || 'guest')
        .gte('created_at', fiveMinutesAgo);

      if (count && count >= 5) {
        alert("Anda mencapai batas 5 pesan per 5 menit. Harap tunggu sebentar.");
        setSending(false);
        return;
      }
    }

    const { error } = await supabase.from('messages').insert([payload]);

    if (error) {
        alert("Gagal kirim: " + error.message);
    } else { 
        setInput(''); 
        setReplyingTo(null); // Bersihkan banner preview kutipan setelah pesan berhasil dikirim
        const txtArea = document.getElementById('chat-input');
        if (txtArea) txtArea.style.height = 'auto';
        fetchData(); 
    }
    setSending(false);
  };

  const editMsg = async (id: number) => {
    const newText = prompt("Edit pesan:", messages.find(m => m.id === id)?.pesan || "");
    if (newText !== null && newText.trim()) { await supabase.from('messages').update({ pesan: newText }).eq('id', id); fetchData(); }
  };

  const editNama = async (id: number) => {
    const msg = messages.find(m => m.id === id);
    if (!msg) return;
    const newName = prompt("Edit nama untuk device ini:", msg.username);
    
    if (newName && containsBlockedWord(newName)) {
      return alert("Nama mengandung kata terlarang!");
    }

    if (newName && newName.trim()) {
      await supabase.from('profiles').update({ username: newName.trim() }).eq('device_id', msg.device_id);
      await supabase.from('messages').update({ username: newName.trim() }).eq('device_id', msg.device_id);
      fetchData();
    }
  };

  const deleteMsg = async (id: number) => { if (confirm("Hapus?")) { await supabase.from('messages').delete().eq('id', id); fetchData(); } };
  const blockUser = async (id: string, name: string) => { if (confirm("Blokir?")) { await supabase.from('blocked_users').insert([{ device_id: id, username: name }]); fetchData(); } };
  const unblock = async (id: string) => { await supabase.from('blocked_users').delete().eq('device_id', id); fetchData(); }
  const inviteToPrivate = (id: string, name: string) => { setChatMode('private'); setSelectedPrivateUser(id); }

  // --- RENDER ---
  if (!mounted) return <div className="h-screen flex items-center justify-center bg-gray-900 text-white">Memuat...</div>;

  return (
    <div className="w-full max-w-2xl mx-auto h-dvh flex flex-col bg-gray-100 shadow-xl overflow-hidden font-sans" onClick={() => setActiveMenuId(null)}>
      {!isAuth ? (
        <div className="flex flex-col items-center justify-center h-screen bg-gradient-to-br from-emerald-500 to-blue-600 text-white p-6">
          <h1 className="text-3xl font-bold mb-6">{activeTab === 'admin' ? 'IpixChat Admin' : 'IpixChat Login'}</h1>
          {activeTab === 'user' ? (
            <div className="w-full max-w-sm flex flex-col items-center">
              <input className="w-full p-3 rounded text-black mb-1 disabled:bg-gray-200 disabled:text-gray-500 shadow-lg" placeholder="Masukkan Nama Anda..." value={username || ""} onChange={(e) => setUsername(e.target.value)} disabled={isExistingUser} />
              {isExistingUser && <span className="text-xs text-blue-100 mb-4 italic text-center px-2">Nama Anda telah tertanam di sistem.</span>}
              <button onClick={handleUserLogin} className="w-full bg-white text-blue-600 px-8 py-3 rounded-full font-bold shadow-md hover:bg-gray-100 transition-all mt-2">Masuk Chat</button>
            </div>
          ) : (
            <div className="w-full max-w-sm flex flex-col items-center">
              <input className="w-full p-3 rounded text-black mb-3 shadow-lg" placeholder="Email Admin" value={adminEmail || ""} onChange={(e) => setAdminEmail(e.target.value)} />
              <input type="password" className="w-full p-3 rounded text-black mb-4 shadow-lg" placeholder="Password Admin" value={adminPass || ""} onChange={(e) => setAdminPass(e.target.value)} />
              <button onClick={handleAdminLogin} className="w-full bg-white text-emerald-600 px-8 py-3 rounded-full font-bold shadow-md hover:bg-gray-100 transition-all">Verifikasi Admin</button>
            </div>
          )}
        </div>
      ) : (
        <>
          {/* HEADER */}
          {currentHash !== '#block' && (
            <div className="sticky top-0 z-10 p-3 bg-white/30 backdrop-blur-md border-b border-white/20">
              <button onClick={handleLogout} className="absolute top-4 right-4 text-[10px] bg-red-500 text-white px-3 py-1 rounded-full shadow">Keluar</button>
              <div className="flex justify-between items-center">
                <div className="flex flex-col max-w-[65%]">
                  <span className="text-[10px] text-gray-800 uppercase tracking-wider">{getGreeting().replace(',', '')}</span>
                  <div className="flex flex-wrap items-center gap-1.5 leading-tight">
                    <span className="text-[11px] font-bold text-blue-800">{username}</span>
                    {activeTab === 'admin' && (
                      <span className="text-[9px] bg-gray-200 text-gray-600 px-1.5 py-0.5 rounded font-mono truncate" title={currentDeviceId || ''}>
                        ID: {currentDeviceId}
                      </span>
                    )}
                  </div>
                </div>
                <div className="text-center flex-1 flex flex-col items-end mr-16">
                  <a href="https://ipix.my.id" target="_blank" className="text-emerald-600 hover:text-emerald-700 font-bold text-sm underline flex items-center gap-1">ipix.my.id</a>
                  {activeTab === 'user' && (
                    <div className="text-[10px] text-gray-500 mt-0.5">
                      <span className={`inline-block w-2 h-2 rounded-full ${isAdminOnline ? 'bg-green-500' : 'bg-gray-400'}`}></span>
                      {isAdminOnline ? ' Admin Online' : ` Admin Offline • ${adminOfflineTime}`}
                    </div>
                  )}
                </div>
              </div>
              <div className="flex mt-3 bg-gray-200/70 rounded-full p-1 shadow-sm w-full">
                <button onClick={() => { setChatMode('public'); setSelectedPrivateUser(null); setReplyingTo(null); }} className={`flex-1 py-2 sm:py-2.5 text-xs sm:text-sm font-semibold rounded-full transition-all duration-200 ${chatMode === 'public' ? 'bg-blue-600 text-white shadow' : 'text-gray-700 hover:bg-gray-300/50'}`}>Public Chat</button>
                <button onClick={() => { setChatMode('private'); setSelectedPrivateUser(null); setReplyingTo(null); }} className={`relative flex-1 py-2 sm:py-2.5 text-xs sm:text-sm font-semibold rounded-full transition-all duration-200 ${chatMode === 'private' ? 'bg-emerald-600 text-white shadow' : 'text-gray-700 hover:bg-gray-300/50'}`}>
                  💬 Chat Private {privateNotifCount > 0 && <span className="absolute -top-1 right-2 bg-red-500 text-white text-[9px] font-bold min-w-4 h-4 px-1 flex items-center justify-center rounded-full animate-bounce">{formatNotif(privateNotifCount)}</span>}
                </button>
              </div>
            </div>
          )}

          {/* MAIN CONTENT AREA */}
          <div 
            className="flex-1 overflow-y-auto"
            onTouchStart={handleTouchStart}
            onTouchMove={handleTouchMove}
          >
            {activeTab === 'admin' && currentHash === '#block' ? (
              <div className="min-h-full bg-gradient-to-br from-emerald-950 via-blue-950 to-emerald-950 text-white">
                <div className="sticky top-0 bg-gradient-to-br from-emerald-950 to-blue-950 border-b border-white/10 z-20 p-6">
                  <div className="max-w-5xl mx-auto flex justify-between items-center">
                    <div>
                      <h2 className="text-3xl font-bold flex items-center gap-3">⚙️ Manajemen Blokir</h2>
                      <p className="text-white/70 text-sm mt-1">Kelola user dan kata terlarang</p>
                    </div>
                    <button onClick={() => window.history.back()} className="px-6 py-2.5 bg-white/10 hover:bg-white/20 border border-white/30 rounded-full text-sm font-medium transition-all">← Kembali</button>
                  </div>
                </div>

                <div className="p-6 max-w-5xl mx-auto space-y-8 pb-20">
                  <section className="bg-white/10 backdrop-blur-xl rounded-3xl border border-white/20 p-6">
                    <h3 className="text-xl font-semibold mb-5 flex items-center gap-3">
                      👤 User Terblokir <span className="text-sm font-normal text-white/50">({blockedList.length})</span>
                    </h3>
                    {blockedList.length === 0 ? (
                      <p className="text-white/50 italic py-12 text-center">Belum ada user yang diblokir.</p>
                    ) : (
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {blockedList.map(b => (
                          <div key={b.device_id} onClick={() => unblock(b.device_id)} className="group bg-white/5 hover:bg-white/10 border border-white/10 hover:border-red-500/50 p-5 rounded-2xl cursor-pointer transition-all flex justify-between items-start">
                            <div>
                              <div className="font-semibold text-lg">{b.username || 'Tanpa Nama'}</div>
                              <div className="text-xs text-white/60 mt-1 font-mono">ID: {b.device_id}</div>
                            </div>
                            <div className="text-right text-xs text-white/50">
                              {formatMessageTime(b.created_at || new Date().toISOString())}
                              <span className="block text-red-400 text-3xl group-hover:text-red-300 mt-2">×</span>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </section>

                  <section className="bg-white/10 backdrop-blur-xl rounded-3xl border border-white/20 p-6">
                    <h3 className="text-xl font-semibold mb-5">🚫 Filter Kata Kasar</h3>
                    <div className="flex gap-3 mb-6">
                      <input 
                        className="flex-1 border border-white/30 focus:border-red-400 bg-white/5 text-white rounded-2xl px-5 py-4 text-sm outline-none transition-all placeholder:text-white/50"
                        placeholder="Tambahkan kata yang dilarang..."
                        value={newBadWord}
                        onChange={(e) => setNewBadWord(e.target.value)}
                        onKeyPress={(e) => e.key === 'Enter' && addBlockedWord()}
                      />
                      <button onClick={addBlockedWord} className="bg-red-600 hover:bg-red-700 text-white px-10 rounded-2xl font-semibold transition-all active:scale-95">
                        Tambah
                      </button>
                    </div>
                    <div className="flex flex-wrap gap-3">
                      {blockedWords.length === 0 ? (
                        <p className="text-white/50 italic py-8">Belum ada kata yang diblokir.</p>
                      ) : (
                        blockedWords.sort((a, b) => a.localeCompare(b)).map((word, idx) => (
                          <div key={idx} className="group flex items-center gap-2 bg-white/10 hover:bg-white/20 border border-white/30 px-5 py-2.5 rounded-2xl text-sm transition-all">
                            <span className="font-medium text-white">{word}</span>
                            <button onClick={() => removeBlockedWord(word)} className="text-white/50 hover:text-red-400 text-xl leading-none">×</button>
                          </div>
                        ))
                      )}
                    </div>
                  </section>
                </div>
              </div>
            ) : (
              <div className="flex-1 overflow-y-auto">
                {activeTab === 'admin' && chatMode === 'private' && !selectedPrivateUser ? (
                  <div className="space-y-3 p-3">
                    {privateUsers.map(user => (
                      <div key={user.device_id} onClick={() => setSelectedPrivateUser(user.device_id)} className="bg-white p-4 rounded-2xl border border-gray-200 shadow-sm hover:shadow-md hover:border-emerald-300 cursor-pointer transition-all flex justify-between items-center group">
                        <div>
                          <div className="font-semibold text-blue-700">{user.username || 'User Tanpa Nama'}</div>
                          <div className="text-xs text-gray-500">ID: {user.device_id.substring(0, 8)}...</div>
                        </div>
                        <div className="text-right">
                          {user.count > 0 && <div className="bg-red-500 text-white text-[10px] font-bold px-2 py-0.5 rounded-full mb-1">{user.count} Pesan</div>}
                          <div className="text-xs text-emerald-600 font-medium">Terakhir: {formatMessageTime(user.last_active)}</div>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="flex flex-col h-full">
                    <div className="p-3 space-y-3">
                      {messages.length > 0 ? (
                        messages.map((m) => {
                          const shortBrowser = m.user_browser ? 
                            m.user_browser.split('(')[0].trim() + 
                            (m.user_browser.includes('(') ? ` (${m.user_browser.split('(')[1].split(')')[0]})` : '') 
                            : 'Unknown Browser';

                          return (
                            <div key={m.id} id={`msg-${m.id}`} className={`bg-white p-3 rounded-xl border border-gray-100 shadow-sm w-full select-none relative transition-all duration-300 ${activeTab === 'admin' ? 'pb-9' : ''}`}>
                              <div className="flex justify-between items-start mb-1">
                                <div className="flex items-center gap-2">
                                  <b onClick={() => handleTag(m.username)} className={`${m.username === 'Admin●ipix.my.id' ? 'text-red-600' : 'text-blue-700'} text-[10px] cursor-pointer hover:underline`}>
                                    {m.username}
                                  </b>
                                  {m.username === 'Admin●ipix.my.id' ? (
                                    <span className={`text-[9px] px-1 rounded ${isAdminOnline ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-500'}`}>{isAdminOnline ? 'Online' : adminOfflineTime}</span>
                                  ) : userStatus[m.username] && (
                                    <span className={`text-[9px] px-1 rounded ${userStatus[m.username].online ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-500'}`}>{userStatus[m.username].online ? 'Online' : userStatus[m.username].offlineTime}</span>
                                  )}
                                  {m.is_private && <span className="text-xs text-emerald-600">🔒 Private</span>}
                                </div>

                                <span className="text-[10px] text-gray-500 font-medium">{formatMessageTime(m.created_at)}</span>
                              </div>

                              {renderMessageContent(m.pesan)}

                              {activeTab === 'admin' && (
                                <div className="absolute bottom-2 left-3 flex flex-col gap-0.5 text-[9px] text-gray-400 font-sans max-w-[60%]">
                                  <span className="text-orange-600 truncate font-medium" title={m.user_browser || ''}>
                                    🌐 {shortBrowser}
                                  </span>
                                  <span 
                                    className="text-blue-600 font-mono cursor-pointer hover:underline truncate" 
                                    onClick={() => copyToClipboard(m.device_id, 'Device ID')}
                                  >
                                    ID: {m.device_id}
                                  </span>
                                </div>
                              )}

                              <div className="absolute bottom-2 right-3 flex items-center gap-2 text-[10px]">
                                <button 
                                  onClick={() => handleReply(m)} 
                                  className={`font-bold underline mr-1 transition-colors ${
                                    chatMode === 'private' ? 'text-emerald-600 hover:text-emerald-700' : 'text-blue-600 hover:text-blue-700'
                                  }`}
                                >
                                  Balas
                                </button>
                                
                                {activeTab === 'admin' && (
                                  <div className="relative flex items-center">
                                    {activeMenuId === m.id && (
                                      <div 
                                        className="absolute right-6 bg-white border border-gray-200 shadow-lg rounded-full px-3 py-1 flex items-center gap-2.5 z-30 animate-fade-in whitespace-nowrap bg-opacity-95 backdrop-blur-sm"
                                        onClick={(e) => e.stopPropagation()}
                                      >
                                        <button onClick={() => { editMsg(m.id); setActiveMenuId(null); }} className="text-blue-600 font-bold hover:underline">Edit</button>
                                        <button onClick={() => { editNama(m.id); setActiveMenuId(null); }} className="text-purple-600 font-bold hover:underline">Nama</button>
                                        <button onClick={() => { deleteMsg(m.id); setActiveMenuId(null); }} className="text-red-600 font-bold hover:underline">Hapus</button>
                                        {!m.username.includes('Admin') && (
                                          <>
                                            <button onClick={() => { blockUser(m.device_id, m.username); setActiveMenuId(null); }} className="text-gray-500 font-bold hover:underline">Blokir</button>
                                            <button onClick={() => { inviteToPrivate(m.device_id, m.username); setActiveMenuId(null); }} className="text-emerald-600 font-bold hover:underline">Private</button>
                                          </>
                                        )}
                                      </div>
                                    )}

                                    <button 
                                      onClick={(e) => {
                                        e.stopPropagation();
                                        setActiveMenuId(activeMenuId === m.id ? null : m.id);
                                      }}
                                      className="text-gray-500 hover:text-gray-800 text-base font-bold px-1 rounded hover:bg-gray-100 transition-colors"
                                    >
                                      ⋮
                                    </button>
                                  </div>
                                )}
                              </div>
                            </div>
                          );
                        })
                      ) : (
                        <div className="text-center text-gray-400 italic mt-10">Belum ada pesan di ruang ini.</div>
                      )}
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>

          {/* AREA FORM INPUT UTAMA */}
          {currentHash !== '#block' && (
            <div className="bg-white sticky bottom-0 z-10 w-full flex flex-col">
              
              {/* TAB / PREVIEW BANNER BALASAN YANG AKAN MUNCUL SAAT KLIK TOMBOL BALAS */}
              {replyingTo && (
                <div 
                  className={`mx-3 mt-1.5 p-2 px-3 rounded-t-xl text-xs flex justify-between items-center border-t border-x transition-all duration-300 cursor-pointer ${
                    chatMode === 'private' 
                      ? 'bg-emerald-50 border-emerald-300 text-emerald-900 hover:bg-emerald-100/70' 
                      : 'bg-blue-50 border-blue-300 text-blue-900 hover:bg-blue-100/70'
                  }`}
                  onClick={() => scrollToMessageId(replyingTo.id)}
                  title="Klik untuk melompat kembali ke pesan asli"
                >
                  <div className="truncate flex-1 pr-2">
                    <span className="font-bold">Membalas @{replyingTo.username.split('●')[0]}:</span>{' '}
                    <span className="italic opacity-80">"{replyingTo.pesan}"</span>
                  </div>
                  <button 
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation(); // Stop propagation agar tidak memicu scroll saat ditutup
                      setReplyingTo(null);
                    }}
                    className="text-gray-400 hover:text-gray-700 text-base font-bold leading-none px-1"
                  >
                    ×
                  </button>
                </div>
              )}

              {/* DOCK UTAMA KAPSUL TEXTAREA CHAT INPUT */}
              <form onSubmit={sendMessage} className="p-3 bg-white border-t flex gap-2 items-end w-full">
                <textarea 
                  id="chat-input"
                  className={`flex-1 border p-2.5 rounded-2xl px-4 text-sm resize-none focus:outline-none transition-all duration-300 min-h-[42px] max-h-[120px] font-sans leading-relaxed [scrollbar-width:none] [-ms-overflow-style:none] [&::-webkit-scrollbar]:hidden ${
                    chatMode === 'private' 
                      ? inputBlink
                        ? 'bg-emerald-600/30 border-emerald-500 ring-2 ring-emerald-400 text-emerald-950 placeholder-emerald-600/50'
                        : 'bg-emerald-600/10 border-emerald-500/20 text-emerald-950 placeholder-emerald-600/50 focus:border-emerald-500 focus:bg-emerald-600/15' 
                      : inputBlink
                        ? 'bg-blue-600/30 border-blue-500 ring-2 ring-blue-400 text-blue-950 placeholder-blue-600/50'
                        : 'bg-blue-600/10 border-blue-500/20 text-blue-950 placeholder-blue-600/50 focus:border-blue-500 focus:bg-blue-600/15'
                  }`}
                  value={input} 
                  onChange={(e) => {
                    setInput(e.target.value);
                    e.target.style.height = 'auto';
                    e.target.style.height = `${Math.min(e.target.scrollHeight, 120)}px`;
                  }}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' && !e.shiftKey) {
                      e.preventDefault();
                      sendMessage(e);
                    }
                  }}
                  placeholder="Ketik pesan..." 
                  maxLength={500} 
                  rows={1}
                  disabled={sending} 
                />
                <button 
                  type="submit" 
                  disabled={sending || !input.trim()} 
                  className={`px-4 sm:px-6 h-[42px] rounded-2xl font-bold text-xs sm:text-sm shrink-0 transition-all duration-200 active:scale-95 disabled:opacity-50 flex items-center justify-center shadow-sm ${
                    chatMode === 'private' 
                      ? 'bg-emerald-600 hover:bg-emerald-700 text-white' 
                      : 'bg-blue-600 hover:bg-blue-700 text-white'
                  }`}
                >
                  {sending ? '...' : (
                    chatMode === 'private' ? (
                      <>
                        <span className="hidden sm:inline">Kirim ke Private Chat</span>
                        <span className="inline sm:hidden">Kirim admin</span>
                      </>
                    ) : (
                      <>
                        <span className="hidden sm:inline">Kirim ke Public Chat</span>
                        <span className="inline sm:hidden">Kirim publik</span>
                      </>
                    )
                  )}
                </button>
              </form>
            </div>
          )}
        </>
      )}
    </div>
  );
}