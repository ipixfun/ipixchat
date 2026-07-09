'use client';
import { useEffect, useState, useCallback } from 'react';
import { usePathname } from 'next/navigation';
import { supabase } from './supabaseClient';

export default function Home() {
  const pathname = usePathname();
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

  // --- SENSOR STATE ---
  const [blockedWords, setBlockedWords] = useState<string[]>([]);
  const [newBadWord, setNewBadWord] = useState('');

  // --- TAMBAH ADMIN STATE ---
  const [newAdminEmail, setNewAdminEmail] = useState('');
  const [newAdminUser, setNewAdminUser] = useState('');
  const [newAdminPass, setNewAdminPass] = useState('');

  // --- SHOW/HIDE PASSWORD STATE ---
  const [showAdminPass, setShowAdminPass] = useState(false);
  const [showNewAdminPass, setShowNewAdminPass] = useState(false);
  
  const currentDeviceId = typeof window !== 'undefined' ? localStorage.getItem('device_id') : null;

  // --- FUNGSI SENSOR & RENDER ---
  const applyCensor = (text: string) => {
    let result = text;
    blockedWords.forEach(word => {
        if(word.trim() !== "") {
            const regex = new RegExp(`\\b${word}\\b`, 'gi');
            result = result.replace(regex, '***');
        }
    });
    return result;
  };

  const scrollToMessage = (quotedText: string) => {
    const targetMsg = messages.find(m => m.pesan.includes(quotedText));
    if (targetMsg) {
      const el = document.getElementById(`msg-${targetMsg.id}`);
      if (el) {
        el.scrollIntoView({ behavior: 'smooth', block: 'center' });
        el.classList.add('bg-yellow-100');
        setTimeout(() => el.classList.remove('bg-yellow-100'), 2000);
      }
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
            className="text-[10px] text-gray-500 italic bg-gray-100 p-2 rounded cursor-pointer hover:bg-gray-200 border-l-2 border-blue-500 mb-1"
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

  const handleTag = (targetUsername: string) => {
    const cleanName = targetUsername.split('●')[0];
    setInput(prev => `${prev}@${cleanName} `);
  };

  const addBlockedWord = async () => {
    if (!newBadWord.trim()) return;
    await supabase.from('blocked_words').insert([{ word: newBadWord.trim() }]);
    setNewBadWord('');
    fetchData();
  };

  const removeBlockedWord = async (word: string) => {
    await supabase.from('blocked_words').delete().eq('word', word);
    fetchData();
  };

  const handleReply = (targetUsername: string, targetMessage: string) => {
    const cleanName = targetUsername.split('●')[0];
    const quotedMessage = targetMessage.length > 30 ? targetMessage.substring(0, 30) + "..." : targetMessage;
    setInput(prev => `${prev}@${cleanName} ("${quotedMessage}") `);
  };

  const formatNotif = (num: number) => {
    if (num >= 1000) return (num / 1000).toFixed(1).replace('.0', '') + 'k';
    return num.toString();
  };

  const getBrowserInfo = () => {
    const ua = navigator.userAgent;
    let browser = "Unknown";
    if (ua.includes("Chrome") && !ua.includes("Edg")) browser = "Chrome";
    else if (ua.includes("Firefox")) browser = "Firefox";
    else if (ua.includes("Safari") && !ua.includes("Chrome")) browser = "Safari";
    else if (ua.includes("Edg")) browser = "Edge";
    else if (ua.includes("Opera") || ua.includes("OPR")) browser = "Opera";
    return `${browser} • ${ua.substring(0, 80)}...`;
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

  const handleLogout = async () => {
    sessionStorage.clear();
    setIsAuth(false);
    window.location.replace("/");
  };

  const fetchData = useCallback(async () => {
    try {
      const { data: bData } = await supabase.from('blocked_users').select('*');
      const { data: bWordsData } = await supabase.from('blocked_words').select('word');
      if (bWordsData) setBlockedWords(bWordsData.map(w => w.word));

      let query = supabase.from('messages').select('*').order('created_at', { ascending: true });

      if (chatMode === 'private') {
        if (activeTab === 'user' && currentDeviceId) {
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
      if (isAuth && currentDeviceId) {
        let countQuery = supabase.from('messages').select('*', { count: 'exact', head: true }).eq('is_private', true);
        if (activeTab === 'user') countQuery = countQuery.or(`device_id.eq.${currentDeviceId},private_with.eq.${currentDeviceId}`);
        const { count } = await countQuery;
        setPrivateNotifCount(count || 0);
      }

      if (bData) {
        setBlockedList(bData);
        if (currentDeviceId && bData.some(b => b.device_id === currentDeviceId)) {
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
        const lastAdminMsg = mData.filter(m => m.username.toLowerCase().includes('admin')).pop();
        if (lastAdminMsg) {
          const lastDate = new Date(lastAdminMsg.created_at);
          const isOnline = Date.now() - lastDate.getTime() < 300000;
          setIsAdminOnline(isOnline);
          if (!isOnline) setAdminOfflineTime(getTimeAgo(lastDate));
        }
        
        const statusMap: Record<string, { online: boolean; offlineTime?: string }> = {};
        const userGroups = mData.reduce((acc: any, msg: any) => {
          if (!msg.username.toLowerCase().includes('admin')) {
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
          allPrivate.forEach(msg => { if (!msg.username.toLowerCase().includes('admin') && msg.device_id !== currentDeviceId) counts[msg.device_id] = (counts[msg.device_id] || 0) + 1; });
          allPrivate.forEach(msg => {
            if (!msg.username.toLowerCase().includes('admin') && msg.device_id !== currentDeviceId && !userMap.has(msg.device_id)) {
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

  useEffect(() => {
    if (!localStorage.getItem('device_id')) {
      localStorage.setItem('device_id', Math.random().toString(36).substring(2, 15));
    }
    
    const checkAuthAndProfile = async () => {
      const cid = localStorage.getItem('device_id');
      const savedAuth = sessionStorage.getItem('is_auth');
      const savedTab = sessionStorage.getItem('active_tab');

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
        setActiveTab((savedTab as 'user' | 'admin') || 'user');
      }

      if (savedAuth === 'true') {
        setIsAuth(true);
        const currentSavedUser = sessionStorage.getItem('saved_username') || '';
        setUsername(currentSavedUser);
        
        if (currentSavedUser.toLowerCase().includes('admin')) {
          setActiveTab('admin');
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

  // --- LOGIN KEMBALI KE TABEL MANUAl (CASE-INSENSITIVE) ---
  const handleAdminLogin = async () => {
    if (!adminEmail.trim() || !adminPass.trim()) return alert("Masukkan Email & Password!");

    const { data, error } = await supabase
      .from('admin_accounts')
      .select('*')
      .eq('email', adminEmail.trim().toLowerCase())
      .eq('password', adminPass.trim())
      .maybeSingle();

    if (error || !data) {
      alert("Login Admin Gagal! Email atau Password salah.");
    } else {
      const dbUsername = data.username || 'Admin●ipix.my.id';
      setIsAuth(true); 
      setActiveTab('admin'); 
      setUsername(dbUsername);
      sessionStorage.setItem('is_auth', 'true'); 
      sessionStorage.setItem('saved_username', dbUsername); 
      sessionStorage.setItem('active_tab', 'admin');
    }
  };

  const handleUserLogin = async () => {
    const cleanName = username.trim();
    if (!cleanName) return alert("Masukkan nama Anda!");
    
    if (cleanName.length > 20) {
      return alert("Nama terlalu panjang! Maksimal 20 karakter.");
    }

    if (cleanName.toLowerCase().includes('admin')) {
      return alert("Nama tidak boleh mengandung kata 'Admin'!");
    }

    const cid = localStorage.getItem('device_id') || 'guest';
    
    const { data: bData } = await supabase.from('blocked_users').select('*').eq('device_id', cid);
    if (bData && bData.length > 0) { window.location.replace("https://ipix.my.id/chat"); return; }
    
    const { data: duplicateUser } = await supabase
      .from('profiles')
      .select('device_id')
      .eq('username', cleanName)
      .not('device_id', 'eq', cid)
      .maybeSingle();

    if (duplicateUser) {
      return alert("Nama ini sudah digunakan oleh orang lain! Silakan pilih nama lain.");
    }

    if (!isExistingUser) {
      try {
        await supabase
          .from('profiles')
          .upsert(
            { device_id: cid, username: cleanName }, 
            { onConflict: 'device_id' }
          );
      } catch (err) {
        console.log("Gagal menyimpan ke database, melanjutkan sesi lokal:", err);
      }
    }

    setIsAuth(true);
    sessionStorage.setItem('is_auth', 'true');
    sessionStorage.setItem('saved_username', cleanName);
    sessionStorage.setItem('active_tab', 'user');
  };

  // --- TAMBAH ADMIN KEMBALI KE TABEL MANUAL ---
  const handleCreateAdmin = async () => {
    if (!newAdminEmail.trim() || !newAdminUser.trim() || !newAdminPass.trim()) {
      return alert("Semua kolom Tambah Admin wajib diisi!");
    }

    const { error } = await supabase
      .from('admin_accounts')
      .insert([{
        email: newAdminEmail.trim().toLowerCase(),
        username: newAdminUser.trim(),
        password: newAdminPass.trim()
      }]);

    if (error) {
      alert("Gagal menambah admin! Kemungkinan email sudah digunakan.");
    } else {
      alert(`Berhasil menambahkan Admin baru: ${newAdminUser}`);
      setNewAdminEmail('');
      setNewAdminUser('');
      setNewAdminPass('');
    }
  };

  const sendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || sending) return;
    
    setSending(true);

    if (!username.toLowerCase().includes('admin')) {
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

    const { error } = await supabase.from('messages').insert([{ 
        username, pesan: input.trim(), device_id: localStorage.getItem('device_id') || 'guest', 
        user_browser: getBrowserInfo(), is_private: chatMode === 'private', 
        private_with: chatMode === 'private' ? (activeTab === 'user' ? 'admin' : selectedPrivateUser) : null 
    }]);
    
    if (!error) { setInput(''); fetchData(); }
    setSending(false);
  };

  const editMsg = async (id: number) => {
    const newText = prompt("Edit pesan:", messages.find(m => m.id === id)?.pesan || "");
    if (newText !== null && newText.trim()) { await supabase.from('messages').update({ pesan: newText }).eq('id', id); fetchData(); }
  };

  const editNama = async (id: number) => {
    const msg = messages.find(m => m.id === id);
    if (!msg) return;
    const newName = prompt("Edit nama untuk akun/device ini:", msg.username);
    if (newName && newName.trim()) { 
      if (msg.username.toLowerCase().includes('admin')) {
        await supabase.from('admin_accounts').update({ username: newName.trim() }).eq('username', msg.username);
        setUsername(newName.trim());
        sessionStorage.setItem('saved_username', newName.trim());
      } else {
        await supabase.from('profiles').update({ username: newName.trim() }).eq('device_id', msg.device_id);
      }
      await supabase.from('messages').update({ username: newName.trim() }).eq('device_id', msg.device_id); 
      fetchData(); 
    }
  };

  const deleteMsg = async (id: number) => { if(confirm("Hapus?")) { await supabase.from('messages').delete().eq('id', id); fetchData(); } };
  const blockUser = async (id: string, name: string) => { if(confirm("Blokir?")) { await supabase.from('blocked_users').insert([{ device_id: id, username: name }]); fetchData(); } };
  const unblock = async (id: string) => { await supabase.from('blocked_users').delete().eq('device_id', id); fetchData(); }
  const inviteToPrivate = (id: string, name: string) => { setChatMode('private'); setSelectedPrivateUser(id); }

  if (!mounted) return <div className="h-screen flex items-center justify-center bg-gray-900 text-white">Memuat...</div>;

  return (
    <div className="w-full max-w-2xl mx-auto h-dvh flex flex-col bg-gray-100 shadow-xl overflow-hidden">
        {!isAuth ? (
             <div className="flex flex-col items-center justify-center h-screen bg-gradient-to-br from-emerald-500 to-blue-600 text-white p-6">
                <h1 className="text-3xl font-bold mb-6">{activeTab === 'admin' ? 'IpixChat Admin' : 'IpixChat Login'}</h1>
                
                {activeTab === 'user' ? (
                    <div className="w-full max-w-sm flex flex-col items-center">
                        <input 
                          className="w-full p-3 rounded text-black mb-1 disabled:bg-gray-200 disabled:text-gray-500 shadow-lg" 
                          placeholder="Masukkan Nama Anda..." 
                          value={username || ""} 
                          maxLength={20} 
                          onChange={(e) => setUsername(e.target.value)} 
                          disabled={isExistingUser} 
                        />
                        <span className="text-[10px] text-blue-100 mb-4 text-center px-2 block">
                          {isExistingUser ? "Nama Anda telah tertanam di sistem." : "Maksimal nama 20 huruf & harus unik."}
                        </span>
                        <button onClick={handleUserLogin} className="w-full bg-white text-blue-600 px-8 py-3 rounded-full font-bold shadow-md hover:bg-gray-100 transition-all">Masuk Chat</button>
                    </div>
                ) : (
                    <div className="w-full max-w-sm flex flex-col items-center">
                        <input 
                          className="w-full p-3 rounded text-black mb-3 shadow-lg" 
                          placeholder="Email Admin" 
                          value={adminEmail || ""}
                          onChange={(e) => setAdminEmail(e.target.value)} 
                        />
                        <div className="w-full relative mb-4">
                            <input 
                              type={showAdminPass ? "text" : "password"} 
                              className="w-full p-3 pr-24 rounded text-black shadow-lg bg-white" 
                              placeholder="Password Admin" 
                              value={adminPass || ""}
                              onChange={(e) => setAdminPass(e.target.value)} 
                            />
                            <button 
                              type="button" 
                              onClick={() => setShowAdminPass(!showAdminPass)} 
                              className="absolute right-3 top-1/2 -translate-y-1/2 text-xs font-bold text-gray-500 hover:text-gray-800 bg-gray-200 px-2 py-1 rounded"
                            >
                              {showAdminPass ? "Sembunyikan" : "Lihat"}
                            </button>
                        </div>
                        <button onClick={handleAdminLogin} className="w-full bg-white text-emerald-600 px-8 py-3 rounded-full font-bold shadow-md hover:bg-gray-100 transition-all">Verifikasi Admin</button>
                    </div>
                )}
             </div>
        ) : (
            <>
                <div className="sticky top-0 z-10 p-3 bg-white/30 backdrop-blur-md border-b border-white/20">
                    <button onClick={handleLogout} className="absolute top-4 right-4 text-[10px] bg-red-500 text-white px-3 py-1 rounded-full shadow">Keluar</button>
                    <div className="flex justify-between items-center">
                        <div className="flex flex-col">
                            <span className="text-[10px] text-gray-800 uppercase tracking-wider">{getGreeting().replace(',', '')}</span>
                            <span className="text-[9px] font-medium text-blue-800 leading-tight">{username || ""}</span>
                        </div>
                        <div className="text-center flex-1 flex flex-col items-center">
                            <a href="https://ipix.my.id" target="_blank" className="text-emerald-600 hover:text-emerald-700 font-bold text-sm underline flex items-center gap-1">ipix.my.id</a>
                            {activeTab === 'user' && (
                                <div className="text-[10px] text-gray-500 mt-0.5">
                                    <span className={`inline-block w-2 h-2 rounded-full ${isAdminOnline ? 'bg-green-500' : 'bg-gray-400'}`}></span>   
                                    {isAdminOnline ? ' Admin Online' : ` Admin Offline • ${adminOfflineTime}`}
                                </div>
                            )}
                        </div>
                    </div>
                    <div className="flex mt-3 bg-gray-100 rounded-full p-1 shadow">
                        <button onClick={() => { setChatMode('public'); setSelectedPrivateUser(null); }} className={`flex-1 py-2.5 text-sm font-medium rounded-full transition-all ${chatMode === 'public' ? 'bg-blue-600 text-white shadow' : 'text-gray-700 hover:bg-gray-200'}`}>Public Chat</button>
                        <button onClick={() => { setChatMode('private'); setSelectedPrivateUser(null); }} className={`relative flex-1 py-2.5 text-sm font-medium rounded-full transition-all ${chatMode === 'private' ? 'bg-emerald-600 text-white shadow' : 'text-gray-700 hover:bg-gray-200'}`}>
                            💬 Chat Private {privateNotifCount > 0 && <span className="absolute -top-1 -right-1 bg-red-500 text-white text-[10px] font-bold min-w-5 h-5 px-1 flex items-center justify-center rounded-full animate-bounce">{formatNotif(privateNotifCount)}</span>}
                        </button>
                    </div>
                </div>

                <div className="flex-1 overflow-y-auto p-3 space-y-3">
                    {activeTab === 'admin' && chatMode === 'private' && !selectedPrivateUser ? (
                        <div className="space-y-3">
                            {privateUsers.map(user => (
                                <div key={user.device_id} onClick={() => setSelectedPrivateUser(user.device_id)} className="bg-white p-4 rounded-2xl border border-gray-200 shadow-sm hover:shadow-md hover:border-emerald-300 cursor-pointer transition-all flex justify-between items-center group">
                                    <div>
                                        <div className="font-semibold text-blue-700">{user.username || 'User Tanpa Nama'}</div>
                                        <div className="text-xs text-gray-500">ID: {user.device_id.substring(0,8)}...</div>
                                    </div>
                                    <div className="text-right">
                                        {user.count > 0 && <div className="bg-red-500 text-white text-[10px] font-bold px-2 py-0.5 rounded-full mb-1">{user.count} Pesan</div>}
                                        <div className="text-xs text-emerald-600 font-medium">Terakhir: {formatMessageTime(user.last_active)}</div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    ) : (
                        messages.map((m) => (
                            <div key={m.id} id={`msg-${m.id}`} className="bg-white p-3 rounded-xl border border-gray-100 shadow-sm w-full select-none">
                                <div className="flex justify-between items-center mb-1">
                                    <div className="flex items-center gap-2">
                                        <b 
                                            onClick={() => handleTag(m.username)} 
                                            className={`${m.username.toLowerCase().includes('admin') ? 'text-red-600' : 'text-blue-700'} text-[10px] cursor-pointer hover:underline`}
                                        >
                                            {m.username}
                                        </b>
                                        {m.username.toLowerCase().includes('admin') ? (
                                            <span className={`text-[9px] px-1 rounded ${isAdminOnline ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-500'}`}>{isAdminOnline ? 'Online' : adminOfflineTime}</span>
                                        ) : userStatus[m.username] && (
                                            <span className={`text-[9px] px-1 rounded ${userStatus[m.username].online ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-500'}`}>{userStatus[m.username].online ? 'Online' : userStatus[m.username].offlineTime}</span>
                                        )}
                                        {m.is_private && <span className="text-xs text-emerald-600">🔒 Private</span>}
                                    </div>
                                    <span className="text-[10px] text-gray-500 font-medium">{formatMessageTime(m.created_at)}</span>
                                </div>
                                
                                {renderMessageContent(m.pesan)}
                                
                                <div className="flex gap-4 mt-2 text-[10px] flex-wrap">
                                    {chatMode === 'public' && <button onClick={() => handleReply(m.username, m.pesan)} className="text-emerald-600 font-bold underline">Balas</button>}
                                    {activeTab === 'admin' && (
                                        <>
                                            <button onClick={() => editMsg(m.id)} className="text-blue-600 font-bold underline">Edit</button>
                                            <button onClick={() => editNama(m.id)} className="text-purple-600 font-bold underline">Nama</button>
                                            <button onClick={() => deleteMsg(m.id)} className="text-red-600 font-bold underline">Hapus</button>
                                            {!m.username.toLowerCase().includes('admin') && (
                                                <>
                                                    <button onClick={() => blockUser(m.device_id, m.username)} className="text-gray-400 font-bold underline">Blokir</button>
                                                    <button onClick={() => inviteToPrivate(m.device_id, m.username)} className="text-emerald-600 font-bold underline hover:text-emerald-700">💬 Ajak Private</button>
                                                </>
                                            )}
                                        </>
                                    )}
                                </div>
                            </div>
                        ))
                    )}
                </div>

                {activeTab === 'admin' && (
                    <div className="p-3 bg-gray-200 border-t grid grid-cols-2 gap-4 max-h-56 overflow-y-auto">
                        <div className="space-y-2">
                            <strong className="text-black text-[10px] block">User Terblokir: {blockedList.length}</strong>
                            <div className="flex flex-wrap gap-2">
                                {blockedList.map(b => (
                                    <span key={b.device_id} className="cursor-pointer text-blue-800 underline hover:text-blue-600 text-[10px]" onClick={() => unblock(b.device_id)}>
                                        {b.username || b.device_id.substring(0,5)} (x)
                                    </span>
                                ))}
                            </div>
                            
                            <hr className="border-gray-300 my-1" />
                            
                            {/* --- INPUT TAMBAH ADMIN MANUAL --- */}
                            <div className="bg-white p-2 rounded-lg border border-gray-300 space-y-1">
                                <h3 className="font-bold text-[10px] text-gray-700">➕ Tambah Admin Baru</h3>
                                <input className="w-full p-1 rounded border text-[10px]" placeholder="Email Baru" value={newAdminEmail} onChange={(e) => setNewAdminEmail(e.target.value)} />
                                <input className="w-full p-1 rounded border text-[10px]" placeholder="Username (misal: Admin2)" value={newAdminUser} onChange={(e) => setNewAdminUser(e.target.value)} />
                                <div className="relative w-full">
                                    <input 
                                      type={showNewAdminPass ? "text" : "password"} 
                                      className="w-full p-1 pr-14 rounded border text-[10px] bg-white" 
                                      placeholder="Password" 
                                      value={newAdminPass} 
                                      onChange={(e) => setNewAdminPass(e.target.value)} 
                                    />
                                    <button 
                                      type="button" 
                                      onClick={() => setShowNewAdminPass(!showNewAdminPass)} 
                                      className="absolute right-1 top-1/2 -translate-y-1/2 text-[8px] font-bold bg-gray-200 px-1 rounded text-gray-600"
                                    >
                                      {showNewAdminPass ? "Sembunyikan" : "Lihat"}
                                    </button>
                                </div>
                                <button onClick={handleCreateAdmin} className="w-full bg-emerald-600 text-white py-1 rounded text-[10px] font-bold shadow hover:bg-emerald-700">Simpan Admin</button>
                            </div>
                        </div>
                        
                        <div>
                            <h3 className="font-bold text-[10px] text-gray-700 mb-2">Daftar Kata Terblokir:</h3>
                            <div className="flex gap-2 mb-3">
                                <input className="flex-1 p-2 rounded-lg text-xs border border-gray-300" placeholder="Tambah kata..." value={newBadWord} onChange={(e) => setNewBadWord(e.target.value)} />
                                <button onClick={addBlockedWord} className="bg-red-600 text-white px-3 py-1 rounded-lg text-xs font-bold">Tambah</button>
                            </div>
                            <div className="flex flex-wrap gap-1">
                                {blockedWords.map((word, idx) => (
                                    <span key={idx} className="bg-white px-2 py-1 rounded-full text-[10px] border border-red-200 text-red-600 flex items-center gap-1 shadow-sm">
                                        {word} <button onClick={() => removeBlockedWord(word)} className="font-bold hover:text-red-800">x</button>
                                    </span>
                                ))}
                            </div>
                        </div>
                    </div>
                )}

                <form onSubmit={sendMessage} className="p-3 bg-white border-t flex gap-2 items-center">
                    <input className="flex-1 border p-2 rounded-full px-4 text-sm bg-gray-800 text-white border-gray-700 placeholder-gray-400" value={input} onChange={(e) => setInput(e.target.value)} placeholder="Ketik pesan..." maxLength={100} disabled={sending} />
                    <button type="submit" disabled={sending || !input.trim()} className="bg-blue-600 text-white px-5 py-2 rounded-full font-bold text-sm shrink-0 disabled:opacity-50">
                        {sending ? 'Mengirim...' : 'Kirim'}
                    </button>
                </form>
            </>
        )}
    </div>
  );
}