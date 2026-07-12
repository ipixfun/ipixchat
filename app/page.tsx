'use client';
import { useEffect, useState, useCallback, useRef } from 'react';
import { usePathname } from 'next/navigation';
import { supabase } from './supabaseClient'; // Pastikan path ini benar di proyekmu
import Login from '../components/Login';
import Admin from '../components/Admin';
import Block from '../components/Block';

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
  const [isTransitioning, setIsTransitioning] = useState(false);
  const [input, setInput] = useState('');
  const [isAuth, setIsAuth] = useState(false);
  const [sending, setSending] = useState(false);
  
  const [totalPublic, setTotalPublic] = useState(0);
  const [totalPrivate, setTotalPrivate] = useState(0);
  const prevPubRef = useRef(0);
  const prevPrivRef = useRef(0);

  const [isAdminOnline, setIsAdminOnline] = useState(false);
  const [adminOfflineTime, setAdminOfflineTime] = useState("");
  const [userStatus, setUserStatus] = useState<Record<string, { online: boolean; offlineTime?: string }>>({});
  const [selectedPrivateUser, setSelectedPrivateUser] = useState<string | null>(null);
  const [privateUsers, setPrivateUsers] = useState<any[]>([]);
  const [blockedWords, setBlockedWords] = useState<string[]>([]);
  const [newBadWord, setNewBadWord] = useState('');
  const [currentHash, setCurrentHash] = useState('');
  const [inputBlink, setInputBlink] = useState(false);
  const [swipingId, setSwipingId] = useState<number | null>(null);
  const [swipeDelta, setSwipeDelta] = useState<number>(0);
  const [touchStartX, setTouchStartX] = useState<number>(0);
  const [touchInitialY, setTouchInitialY] = useState<number>(0);
  const [isHorizontalSwipe, setIsHorizontalSwipe] = useState<boolean>(false);
  const [replyingTo, setReplyingTo] = useState<any | null>(null);
  const [activeMenuId, setActiveMenuId] = useState<number | null>(null);
  
  const [longPressId, setLongPressId] = useState<number | null>(null);
  const longPressTimer = useRef<NodeJS.Timeout | null>(null);

  const [capsuleIndex, setCapsuleIndex] = useState<0 | 1>(0);
  const [isCapsulePaused, setIsCapsulePaused] = useState(false);
  
  const [isPillVisible, setIsPillVisible] = useState(true);
  const [showPillClose, setShowPillClose] = useState(false);
  const holdTimerRef = useRef<NodeJS.Timeout | null>(null);

  const containerRef = useRef<HTMLDivElement>(null);
  const currentDeviceId = typeof window !== 'undefined' ? localStorage.getItem('device_id') : null;

  useEffect(() => {
    if (isCapsulePaused) return;
    const interval = setInterval(() => setCapsuleIndex((prev) => (prev === 0 ? 1 : 0)), 5000);
    return () => clearInterval(interval);
  }, [isCapsulePaused]);

  useEffect(() => {
    const handleHash = () => setCurrentHash(window.location.hash);
    window.addEventListener('hashchange', handleHash);
    handleHash();
    return () => window.removeEventListener('hashchange', handleHash);
  }, []);

  const handlePillStart = () => { setIsCapsulePaused(true); if (holdTimerRef.current) clearTimeout(holdTimerRef.current); holdTimerRef.current = setTimeout(() => setShowPillClose(true), 500); };
  const handlePillEnd = () => { setIsCapsulePaused(false); if (holdTimerRef.current) clearTimeout(holdTimerRef.current); };

  const containsBlockedWord = (text: string) => blockedWords.some(word => word.trim() !== "" && text.toLowerCase().includes(word.toLowerCase()));
  const applyCensor = (text: string) => {
    let result = text;
    blockedWords.forEach(word => { if (word.trim() !== "") result = result.replace(new RegExp(`\\b${word}\\b`, 'gi'), '***'); });
    return result;
  };
  const copyToClipboard = (text: string, label: string) => { navigator.clipboard.writeText(text); alert(`${label} berhasil disalin!`); };
  
  const scrollToMessageId = (msgId: number) => {
    const el = document.getElementById(`msg-${msgId}`);
    if (el) {
      el.scrollIntoView({ behavior: 'smooth', block: 'end' });
      const blinkClasses = chatMode === 'private' ? ['ring-2', 'ring-emerald-400', 'bg-emerald-50/50'] : ['ring-2', 'ring-blue-400', 'bg-blue-50/50'];
      el.classList.add(...blinkClasses);
      setTimeout(() => el.classList.remove(...blinkClasses), 1500);
    }
  };
  
  const scrollToMessage = (quotedText: string) => {
    const targetMsg = messages.find(m => m.pesan.includes(quotedText));
    if (targetMsg) scrollToMessageId(targetMsg.id);
  };

  const renderMessageContent = (text: string) => {
    const match = text.match(/^@(\w+)\s\("(.*?)"\)\s?(.*)$/);
    if (match) {
      const [_, user, quotedText, replyText] = match;
      return (
        <>
          <div className={`text-[10px] text-gray-500 italic bg-gray-100 p-2 rounded cursor-pointer hover:bg-gray-200 border-l-2 mb-1 ${chatMode === 'private' ? 'border-emerald-500' : 'border-blue-500'}`} onClick={() => scrollToMessage(quotedText)}>
            <span className="font-bold">@{user}</span>: "{applyCensor(quotedText)}"
          </div>
          <div className="text-sm text-gray-800 break-words">{applyCensor(replyText)}</div>
        </>
      );
    }
    return <div className="text-sm text-gray-800 break-words">{applyCensor(text)}</div>;
  };

  const formatNotif = (num: number) => num >= 1000 ? (num / 1000).toFixed(1).replace('.0', '') + 'k' : num.toString();
  const getTimeAgo = (date: Date) => {
    const seconds = Math.floor((new Date().getTime() - date.getTime()) / 1000);
    let interval = seconds / 3600;
    if (interval >= 1) return Math.floor(interval) + " jam lalu";
    interval = seconds / 60;
    if (interval >= 1) return Math.floor(interval) + " menit lalu";
    return "baru saja";
  };
  const formatMessageTime = (dateStr: string) => new Date(dateStr).toLocaleDateString('id-ID', { weekday: 'short', day: '2-digit', month: 'short', hour: '2-digit', minute: '2-digit' }).replace(',', '');
  const getGreeting = () => {
    const hour = new Date().getHours();
    return `Selamat ${hour >= 5 && hour < 12 ? "pagi" : hour >= 12 && hour < 15 ? "siang" : hour >= 15 && hour < 18 ? "sore" : "malam"}, `;
  };
  
  useEffect(() => {
    if (messages.length > 0) document.getElementById('messages-end')?.scrollIntoView({ behavior: 'auto' });
  }, [messages, chatMode, isPillVisible]);

  const handleTouchStart = (e: React.TouchEvent) => { setTouchStartX(e.touches[0].clientX); setTouchInitialY(e.touches[0].clientY); };
  const handleTouchMove = (e: React.TouchEvent) => { if (!containerRef.current) return; };
  const handleTag = (targetUsername: string) => setInput(prev => `${prev} @${targetUsername.split('●')[0]} `);
  
  const addBlockedWord = async () => { if (!newBadWord.trim()) return; await supabase.from('blocked_words').insert([{ word: newBadWord.trim().charAt(0).toUpperCase() + newBadWord.trim().slice(1).toLowerCase() }]); setNewBadWord(''); fetchData(); };
  const removeBlockedWord = async (word: string) => { await supabase.from('blocked_words').delete().eq('word', word); fetchData(); };
  const handleReply = (msgMessage: any) => { setReplyingTo(msgMessage); setInputBlink(true); setTimeout(() => setInputBlink(false), 800); setTimeout(() => document.getElementById(`msg-${msgMessage.id}`)?.scrollIntoView({ behavior: 'smooth', block: 'end' }), 100); };
  const handleLogout = async () => { await supabase.auth.signOut(); sessionStorage.clear(); setIsAuth(false); window.location.replace("/"); };
  
  const handleTabSwitch = (mode: 'public' | 'private') => {
    if (mode === chatMode) return;
    setIsTransitioning(true);
    setTimeout(() => {
      setChatMode(mode);
      setSelectedPrivateUser(null);
      setReplyingTo(null);
      setIsTransitioning(false);
    }, 200);
  };

  const fetchData = useCallback(async () => {
    if (!currentDeviceId) return;
    try {
      const { data: bData } = await supabase.from('blocked_users').select('*');
      const { data: bWordsData } = await supabase.from('blocked_words').select('word');
      if (bWordsData) setBlockedWords(bWordsData.map(w => w.word));
      
      let query = supabase.from('messages').select('*').order('created_at', { ascending: true });
      if (chatMode === 'private') {
        if (activeTab === 'user') query = query.eq('is_private', true).or(`device_id.eq.${currentDeviceId},private_with.eq.${currentDeviceId}`);
        else if (selectedPrivateUser) query = query.eq('is_private', true).or(`device_id.eq.${selectedPrivateUser},private_with.eq.${selectedPrivateUser}`);
        else query = query.eq('is_private', true).eq('device_id', 'none');
      } else query = query.eq('is_private', false);
      const { data: mData } = await query;
      
      if (isAuth) {
        const { count: pubCount } = await supabase.from('messages').select('*', { count: 'exact', head: true }).eq('is_private', false);
        const currentTotalPub = pubCount || 0;
        let privQuery = supabase.from('messages').select('*', { count: 'exact', head: true }).eq('is_private', true);
        if (activeTab === 'user') privQuery = privQuery.or(`device_id.eq.${currentDeviceId},private_with.eq.${currentDeviceId}`);
        const { count: privCount } = await privQuery;
        const currentTotalPriv = privCount || 0;

        setTotalPublic(currentTotalPub); 
        setTotalPrivate(currentTotalPriv);
        prevPubRef.current = currentTotalPub; 
        prevPrivRef.current = currentTotalPriv;
      }

      if (bData) {
        setBlockedList(bData);
        if (bData.some(b => b.device_id === currentDeviceId)) return window.location.replace("https://ipix.my.id/chat");
      }
      
      if (mData) {
        setMessages(mData.filter(m => !(bData?.map(b => b.device_id) || []).includes(m.device_id)));
        const lastAdminMsg = mData.filter(m => m.username === 'Admin●ipix.my.id').pop();
        if (lastAdminMsg) {
          const isOnline = Date.now() - new Date(lastAdminMsg.created_at).getTime() < 300000;
          setIsAdminOnline(isOnline); if (!isOnline) setAdminOfflineTime(getTimeAgo(new Date(lastAdminMsg.created_at)));
        }
        const statusMap: Record<string, { online: boolean; offlineTime?: string }> = {};
        const userGroups = mData.reduce((acc: any, msg: any) => { if (msg.username !== 'Admin●ipix.my.id') { if (!acc[msg.username]) acc[msg.username] = []; acc[msg.username].push(msg); } return acc; }, {});
        Object.keys(userGroups).forEach(user => {
          const lastMsg = userGroups[user].pop();
          if (lastMsg) {
            const isOnline = Date.now() - new Date(lastMsg.created_at).getTime() < 300000;
            statusMap[user] = { online: isOnline, offlineTime: !isOnline ? getTimeAgo(new Date(lastMsg.created_at)) : undefined };
          }
        });
        setUserStatus(statusMap);
      } else setMessages([]);
      
      if (activeTab === 'admin' && chatMode === 'private' && !selectedPrivateUser) {
        const { data: allPrivate } = await supabase.from('messages').select('device_id, username, created_at').eq('is_private', true).order('created_at', { ascending: false });
        if (allPrivate) {
          const userMap = new Map(); const counts: Record<string, number> = {};
          allPrivate.forEach(msg => { if (msg.username !== 'Admin●ipix.my.id' && msg.device_id !== currentDeviceId) counts[msg.device_id] = (counts[msg.device_id] || 0) + 1; });
          allPrivate.forEach(msg => { if (msg.username !== 'Admin●ipix.my.id' && msg.device_id !== currentDeviceId && !userMap.has(msg.device_id)) userMap.set(msg.device_id, { device_id: msg.device_id, username: msg.username, last_active: msg.created_at, count: counts[msg.device_id] || 0 }); });
          setPrivateUsers(Array.from(userMap.values()));
        } else setPrivateUsers([]);
      } else setPrivateUsers([]);
    } catch (err) { setMessages([]); }
  }, [chatMode, activeTab, selectedPrivateUser, currentDeviceId, isAuth]);

  useEffect(() => {
    if (!localStorage.getItem('device_id')) localStorage.setItem('device_id', Math.random().toString(36).substring(2, 15));
    const checkAuthAndProfile = async () => {
      const cid = localStorage.getItem('device_id');
      const { data: { session } } = await supabase.auth.getSession();
      const isUrlAdmin = pathname.endsWith('/admin') || (typeof window !== 'undefined' && window.location.hash === '#admin');
      if (cid) {
        const { data: profileData } = await supabase.from('profiles').select('username').eq('device_id', cid).single();
        if (profileData && profileData.username) { setUsername(profileData.username); setIsExistingUser(true); sessionStorage.setItem('saved_username', profileData.username); }
      }
      if (isUrlAdmin) setActiveTab('admin'); else setActiveTab((sessionStorage.getItem('active_tab') as 'user' | 'admin') || 'user');
      if (session || sessionStorage.getItem('is_auth') === 'true') { setIsAuth(true); if (session) { setUsername('Admin●ipix.my.id'); setActiveTab('admin'); } else if (!isExistingUser) setUsername(sessionStorage.getItem('saved_username') || ''); }
      setMounted(true);
    };
    checkAuthAndProfile();
  }, [isExistingUser, pathname]);

  useEffect(() => {
    if (!mounted) return; fetchData();
    const channel = supabase.channel('chat').on('postgres_changes', { event: '*', schema: 'public', table: 'messages' }, fetchData).subscribe();
    return () => { void supabase.removeChannel(channel); };
  }, [mounted, fetchData]);

  const handleAdminLogin = async () => {
    const { error } = await supabase.auth.signInWithPassword({ email: adminEmail, password: adminPass });
    if (error) alert("Login Admin Gagal"); else { setIsAuth(true); setActiveTab('admin'); setUsername('Admin●ipix.my.id'); sessionStorage.setItem('is_auth', 'true'); sessionStorage.setItem('saved_username', 'Admin●ipix.my.id'); sessionStorage.setItem('active_tab', 'admin'); }
  };
  
  const handleUserLogin = async () => {
    if (!username.trim()) return alert("Masukkan nama Anda!");
    if (containsBlockedWord(username)) return alert("Nama mengandung kata terlarang.");
    const cid = localStorage.getItem('device_id') || 'guest';
    const { data: bData } = await supabase.from('blocked_users').select('*').eq('device_id', cid);
    if (bData && bData.length > 0) return window.location.replace("https://ipix.my.id/chat");
    
    if (!isExistingUser) {
      const { data: existingProfiles } = await supabase.from('profiles').select('device_id, username').ilike('username', username.trim());
      if (existingProfiles && existingProfiles.length > 0) {
        const isTaken = existingProfiles.some(p => p.device_id !== cid && p.username.toLowerCase() === username.trim().toLowerCase());
        if (isTaken) {
          return alert("Username sudah digunakan oleh pengguna lain. Silakan buat nama lain yang unik.");
        }
      }
    }

    try { await supabase.from('profiles').upsert({ device_id: cid, username: username.trim(), user_browser: typeof window !== 'undefined' ? navigator.userAgent : 'Unknown' }, { onConflict: 'device_id' }); } catch (err) {}
    setIsAuth(true); sessionStorage.setItem('is_auth', 'true'); sessionStorage.setItem('saved_username', username.trim()); sessionStorage.setItem('active_tab', 'user');
  };

  const sendMessage = async (e: React.FormEvent) => {
    e.preventDefault(); if (!input.trim() || sending) return;
    setSending(true); let finalPesan = input.trim();
    if (replyingTo) finalPesan = `@${replyingTo.username.split('●')[0]} ("${replyingTo.pesan.length > 30 ? replyingTo.pesan.substring(0, 30) + "..." : replyingTo.pesan}") ${input.trim()}`;
    if (username !== 'Admin●ipix.my.id') {
      const { count } = await supabase.from('messages').select('*', { count: 'exact', head: true }).eq('device_id', localStorage.getItem('device_id') || 'guest').gte('created_at', new Date(Date.now() - 5 * 60 * 1000).toISOString());
      if (count && count >= 5) { alert("Batas 5 pesan per 5 menit."); setSending(false); return; }
    }
    const { error } = await supabase.from('messages').insert([{ username, pesan: finalPesan, device_id: localStorage.getItem('device_id') || 'guest', is_private: chatMode === 'private', private_with: chatMode === 'private' ? (activeTab === 'user' ? 'admin' : selectedPrivateUser) : null, user_browser: typeof window !== 'undefined' ? navigator.userAgent : 'Unknown' }]);
    if (error) alert("Gagal kirim: " + error.message); else { 
      setInput(''); setReplyingTo(null); const txtArea = document.getElementById('chat-input'); if (txtArea) txtArea.style.height = 'auto'; 
      fetchData(); 
    }
    setSending(false);
  };
  
  const handleEditLimit = async (msg: any) => {
    const key = `edit_count_${msg.id}`;
    const currentEdits = parseInt(localStorage.getItem(key) || '0');
    if (currentEdits >= 2) return alert("Batas edit maksimal 2x untuk pesan ini.");
    
    const newText = prompt("Edit pesan:", msg.pesan);
    if (newText !== null && newText.trim() && newText.trim() !== msg.pesan) {
      await supabase.from('messages').update({ pesan: newText.trim() }).eq('id', msg.id);
      localStorage.setItem(key, (currentEdits + 1).toString());
      fetchData();
    }
  };

  const editMsg = async (id: number) => { const newText = prompt("Edit pesan:", messages.find(m => m.id === id)?.pesan || ""); if (newText !== null && newText.trim()) { await supabase.from('messages').update({ pesan: newText }).eq('id', id); fetchData(); } };
  const editNama = async (id: number) => { const msg = messages.find(m => m.id === id); if (!msg) return; const newName = prompt("Edit nama:", msg.username); if (newName && containsBlockedWord(newName)) return alert("Nama mengandung kata terlarang!"); if (newName && newName.trim()) { await supabase.from('profiles').update({ username: newName.trim() }).eq('device_id', msg.device_id); await supabase.from('messages').update({ username: newName.trim() }).eq('device_id', msg.device_id); fetchData(); } };
  const deleteMsg = async (id: number) => { await supabase.from('messages').delete().eq('id', id); fetchData(); };
  const blockUser = async (id: string, name: string) => { if (confirm("Blokir?")) { await supabase.from('blocked_users').insert([{ device_id: id, username: name }]); fetchData(); } };
  const unblock = async (id: string) => { await supabase.from('blocked_users').delete().eq('device_id', id); fetchData(); };
  const inviteToPrivate = (id: string, name: string) => { handleTabSwitch('private'); setSelectedPrivateUser(id); };

  if (!mounted) return <div className="h-screen flex items-center justify-center bg-gray-900 text-white">Memuat...</div>;
  return (
    <div className="w-full max-w-2xl mx-auto h-dvh flex flex-col bg-gray-100 shadow-xl overflow-hidden font-sans" onClick={() => { setActiveMenuId(null); setLongPressId(null); }}>
      <style dangerouslySetInnerHTML={{ __html: `
        @keyframes slideLeftSmooth { 0%, 100% { transform: translateX(0); opacity: 0.6; } 50% { transform: translateX(-4px); opacity: 1; } } 
        @keyframes slideRightSmooth { 0%, 100% { transform: translateX(0); opacity: 0.6; } 50% { transform: translateX(4px); opacity: 1; } } 
        .anim-slide-left { animation: slideLeftSmooth 1.4s ease-in-out infinite; } 
        .anim-slide-right { animation: slideRightSmooth 1.4s ease-in-out infinite; }
        
        @keyframes glassBlurBlue { 0% { opacity: 0; filter: blur(12px); background: rgba(59, 130, 246, 0.2); } 100% { opacity: 1; filter: blur(0px); background: transparent; } }
        @keyframes glassBlurGreen { 0% { opacity: 0; filter: blur(12px); background: rgba(16, 185, 129, 0.2); } 100% { opacity: 1; filter: blur(0px); background: transparent; } }
        .anim-glass-public { animation: glassBlurBlue 0.6s cubic-bezier(0.4, 0, 0.2, 1) forwards; }
        .anim-glass-private { animation: glassBlurGreen 0.6s cubic-bezier(0.4, 0, 0.2, 1) forwards; }
      `}} />

      {!isAuth ? (
        
        // KOMPONEN LOGIN DIPANGGIL DI SINI
        <Login 
          activeTab={activeTab} 
          username={username} 
          setUsername={setUsername} 
          isExistingUser={isExistingUser} 
          adminEmail={adminEmail} 
          setAdminEmail={setAdminEmail} 
          adminPass={adminPass} 
          setAdminPass={setAdminPass} 
          handleUserLogin={handleUserLogin} 
          handleAdminLogin={handleAdminLogin} 
        />

      ) : (
        <>
          {currentHash !== '#block' && (
            <div className="sticky top-0 z-10 p-3 bg-white/30 backdrop-blur-md border-b border-white/20">
              <button onClick={handleLogout} className="absolute top-4 right-4 text-[10px] bg-red-500 text-white px-3 py-1 rounded-full shadow">Keluar</button>
              <div className="flex justify-between items-center">
                <div className="flex flex-col max-w-[65%]">
                  <span className="text-[10px] text-gray-800 uppercase tracking-wider">{getGreeting().replace(',', '')}</span>
                  <div className="flex flex-wrap items-center gap-1.5 leading-tight">
                    <span className="text-[11px] font-bold text-blue-800">{username}</span>
                    {activeTab === 'admin' && <span className="text-[9px] bg-gray-200 text-gray-600 px-1.5 py-0.5 rounded font-mono truncate" title={currentDeviceId || ''}>ID: {currentDeviceId}</span>}
                  </div>
                </div>
                <div className="text-center flex-1 flex flex-col items-end mr-16">
                  <a href="https://ipix.my.id" target="_blank" className="text-emerald-600 hover:text-emerald-700 font-bold text-sm underline flex items-center gap-1">ipix.my.id</a>
                  {activeTab === 'user' && <div className="text-[10px] text-gray-500 mt-0.5"><span className={`inline-block w-2 h-2 rounded-full ${isAdminOnline ? 'bg-green-500' : 'bg-gray-400'}`}></span>{isAdminOnline ? ' Admin Online' : ` Admin Offline • ${adminOfflineTime}`}</div>}
                </div>
              </div>
              <div className="flex mt-3 bg-white border border-gray-200 rounded-full p-1 shadow-sm w-full">
                <button onClick={() => handleTabSwitch('public')} className={`relative flex-1 py-2 sm:py-2.5 text-xs sm:text-sm font-semibold rounded-full transition-all duration-200 z-10 flex items-center justify-center gap-2 ${chatMode === 'public' ? 'bg-blue-600 text-white shadow' : 'bg-transparent text-gray-700 hover:bg-gray-100'}`}>
                  <div className="absolute left-1.5 top-1/2 -translate-y-1/2 w-6 h-6 flex items-center justify-center">
                    <span className={`${chatMode === 'public' ? 'bg-white text-blue-600' : 'bg-blue-600 text-white'} text-[10px] font-bold w-full h-full flex items-center justify-center rounded-full shadow-sm transition-colors duration-200`}>
                      {formatNotif(totalPublic)}
                    </span>
                  </div>
                  <span className="ml-5">Public Chat</span>
                </button>

                <button onClick={() => handleTabSwitch('private')} className={`relative flex-1 py-2 sm:py-2.5 text-xs sm:text-sm font-semibold rounded-full transition-all duration-200 z-10 flex items-center justify-center gap-2 ${chatMode === 'private' ? 'bg-emerald-600 text-white shadow' : 'bg-transparent text-gray-700 hover:bg-gray-100'}`}>
                  <span className="mr-5">💬 Chat Private</span>
                  <div className="absolute right-1.5 top-1/2 -translate-y-1/2 w-6 h-6 flex items-center justify-center">
                    <span className={`${chatMode === 'private' ? 'bg-white text-emerald-600' : 'bg-emerald-600 text-white'} text-[10px] font-bold w-full h-full flex items-center justify-center rounded-full shadow-sm transition-colors duration-200`}>
                      {formatNotif(totalPrivate)}
                    </span>
                  </div>
                </button>
              </div>
            </div>
          )}
          
          <div key={chatMode} ref={containerRef} onTouchStart={handleTouchStart} onTouchMove={handleTouchMove} 
            className={`flex-1 overflow-y-auto overflow-x-hidden transition-all duration-200 ${isTransitioning ? 'opacity-0 bg-gray-50' : 'opacity-100'} ${chatMode === 'public' ? 'anim-glass-public' : 'anim-glass-private'}`}>
            
            {activeTab === 'admin' && currentHash === '#block' ? (
              
              // KOMPONEN BLOCK DIPANGGIL DI SINI
              <Block 
                blockedList={blockedList} 
                unblock={unblock} 
                blockedWords={blockedWords} 
                newBadWord={newBadWord} 
                setNewBadWord={setNewBadWord} 
                addBlockedWord={addBlockedWord} 
                removeBlockedWord={removeBlockedWord} 
                formatMessageTime={formatMessageTime} 
              />

            ) : (
              <div className="flex-1 overflow-y-auto">
                {activeTab === 'admin' && chatMode === 'private' && !selectedPrivateUser ? (
                  
                  // KOMPONEN ADMIN DIPANGGIL DI SINI
                  <Admin 
                    privateUsers={privateUsers} 
                    setSelectedPrivateUser={setSelectedPrivateUser} 
                    formatMessageTime={formatMessageTime} 
                  />

                ) : (
                  <div className="flex flex-col h-full relative">
                    <div className="p-3 space-y-3 overflow-x-hidden flex-1">
                      {messages.length > 0 ? messages.map((m) => {
                        const shortBrowser = m.user_browser ? m.user_browser.split('(')[0].trim() + (m.user_browser.includes('(') ? ` (${m.user_browser.split('(')[1].split(')')[0]})` : '') : 'Unknown Browser';
                        return (
                          <div key={m.id} id={`msg-${m.id}`} className="bg-white p-3 rounded-xl border border-gray-100 shadow-sm w-full select-none relative"
                            onMouseDown={(e) => {
                              longPressTimer.current = setTimeout(() => { setLongPressId(m.id); if (navigator.vibrate) navigator.vibrate(50); }, 500);
                            }}
                            onMouseMove={() => { if (longPressTimer.current) { clearTimeout(longPressTimer.current); longPressTimer.current = null; } }}
                            onMouseUp={() => { if (longPressTimer.current) { clearTimeout(longPressTimer.current); longPressTimer.current = null; } }}
                            onTouchStart={(e) => { 
                              setTouchStartX(e.touches[0].clientX); setTouchInitialY(e.touches[0].clientY); 
                              setSwipingId(m.id); setSwipeDelta(0); setIsHorizontalSwipe(false); 
                              longPressTimer.current = setTimeout(() => { setLongPressId(m.id); if (navigator.vibrate) navigator.vibrate(50); }, 500);
                            }}
                            onTouchMove={(e) => {
                              if (longPressTimer.current) { clearTimeout(longPressTimer.current); longPressTimer.current = null; }
                              if (swipingId !== m.id) return;
                              const deltaX = e.touches[0].clientX - touchStartX, deltaY = e.touches[0].clientY - touchInitialY;
                              if (!isHorizontalSwipe && Math.abs(deltaX) > Math.abs(deltaY) && Math.abs(deltaX) > 10) setIsHorizontalSwipe(true);
                              if (isHorizontalSwipe) setSwipeDelta(Math.max(-75, Math.min(75, deltaX)));
                            }}
                            onTouchEnd={() => { 
                              if (longPressTimer.current) { clearTimeout(longPressTimer.current); longPressTimer.current = null; }
                              if (swipingId === m.id && isHorizontalSwipe) {
                                if (swipeDelta > 50) {
                                  handleReply(m);
                                } else if (swipeDelta < -50) {
                                  const isMyMsg = m.device_id === currentDeviceId;
                                  const isUnder24h = Date.now() - new Date(m.created_at).getTime() < 24 * 60 * 60 * 1000;
                                  
                                  if (activeTab === 'admin') {
                                    if (window.confirm("Apakah benar mau menghapus pesan ini?")) deleteMsg(m.id);
                                  } else if (isMyMsg) {
                                    if (isUnder24h) {
                                      if (window.confirm("Apakah benar mau menghapus pesan ini?")) deleteMsg(m.id);
                                    } else {
                                      alert("Pesan lebih dari 24 jam hanya dapat dihapus oleh admin.");
                                    }
                                  }
                                }
                              }
                              setSwipingId(null); setSwipeDelta(0); setIsHorizontalSwipe(false); 
                            }}
                            style={{ transform: swipingId === m.id ? `translateX(${swipeDelta}px)` : 'translateX(0px)', transition: swipingId === m.id ? 'none' : 'transform 0.3s cubic-bezier(0.175, 0.885, 0.32, 1.275)' }}>
                            
                            {swipingId === m.id && Math.abs(swipeDelta) > 15 && (
                              <div className={`absolute top-1/2 -translate-y-1/2 font-bold text-xs pointer-events-none transition-opacity flex items-center justify-center ${swipeDelta > 0 ? '-left-6 text-blue-500' : '-right-8 text-red-500'}`}>
                                {swipeDelta > 0 ? '↩' : (
                                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 stroke-current opacity-80" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                                  </svg>
                                )}
                              </div>
                            )}
                            
                            {longPressId === m.id && (
                              <div className="absolute inset-0 bg-white/90 backdrop-blur-sm z-20 rounded-xl flex items-center justify-center gap-3 shadow-sm border border-gray-200 animate-fade-in" onClick={(e) => { e.stopPropagation(); setLongPressId(null); }}>
                                <button className="bg-gray-800 hover:bg-gray-700 text-white px-5 py-2 rounded-full text-xs font-bold shadow-md active:scale-95 transition-all" onClick={(e) => { e.stopPropagation(); copyToClipboard(m.pesan, 'Pesan'); setLongPressId(null); }}>Salin Teks</button>
                                {(activeTab !== 'admin' && m.device_id === currentDeviceId) && (
                                   <button className="bg-blue-600 hover:bg-blue-700 text-white px-5 py-2 rounded-full text-xs font-bold shadow-md active:scale-95 transition-all" onClick={(e) => { e.stopPropagation(); handleEditLimit(m); setLongPressId(null); }}>Edit Teks</button>
                                )}
                              </div>
                            )}

                            <div className="flex justify-between items-start mb-1">
                              <div className="flex items-center gap-2">
                                <b onClick={() => handleTag(m.username)} className={`${m.username === 'Admin●ipix.my.id' ? 'text-red-600' : 'text-blue-700'} text-[10px] cursor-pointer hover:underline`}>{m.username}</b>
                                {m.username === 'Admin●ipix.my.id' ? <span className={`text-[9px] px-1 rounded ${isAdminOnline ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-500'}`}>{isAdminOnline ? 'Online' : adminOfflineTime}</span> : userStatus[m.username] && <span className={`text-[9px] px-1 rounded ${userStatus[m.username].online ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-500'}`}>{userStatus[m.username].online ? 'Online' : userStatus[m.username].offlineTime}</span>}
                                {m.is_private && <span className="text-xs text-emerald-600">🔒 Private</span>}
                              </div>
                              <span className="text-[10px] text-gray-500 font-medium">{formatMessageTime(m.created_at)}</span>
                            </div>
                            
                            {renderMessageContent(m.pesan)}
                            
                            <div className={`mt-2 pt-2 border-t border-gray-100 flex justify-between gap-3 ${activeTab === 'admin' ? 'items-end' : 'items-center'}`}>
                              <div className="flex-1 overflow-hidden">
                                {activeTab === 'admin' && (
                                  <div className="flex flex-col gap-1 text-[9px] text-gray-400 font-sans w-full">
                                    <span className="text-blue-600 font-mono cursor-pointer hover:underline break-all leading-tight" onClick={() => copyToClipboard(m.device_id, 'Device ID')}>
                                      ID: {m.device_id}
                                    </span>
                                    <span className="text-orange-600 truncate font-medium max-w-[200px]" title={m.user_browser || ''}>
                                      🌐 {shortBrowser}
                                    </span>
                                  </div>
                                )}
                              </div>
                              
                              <div className="flex items-center gap-2 text-[10px] shrink-0 pb-0.5">
                                <button onClick={() => handleReply(m)} className={`font-bold underline mr-1 transition-colors ${chatMode === 'private' ? 'text-emerald-600 hover:text-emerald-700' : 'text-blue-600 hover:text-blue-700'}`}>Balas</button>
                                {activeTab === 'admin' && (
                                  <div className="relative flex items-center">
                                    {activeMenuId === m.id && (
                                      <div className="absolute right-6 bottom-0 bg-white border border-gray-200 shadow-lg rounded-full px-3 py-1.5 flex items-center gap-2.5 z-30 animate-fade-in whitespace-nowrap bg-opacity-95 backdrop-blur-sm" onClick={(e) => e.stopPropagation()}>
                                        <button onClick={() => { editMsg(m.id); setActiveMenuId(null); }} className="text-blue-600 font-bold hover:underline">Edit</button>
                                        <button onClick={() => { editNama(m.id); setActiveMenuId(null); }} className="text-purple-600 font-bold hover:underline">Nama</button>
                                        <button onClick={() => { deleteMsg(m.id); setActiveMenuId(null); }} className="text-red-600 font-bold hover:underline">Hapus</button>
                                        {!m.username.includes('Admin') && (
                                          <><button onClick={() => { blockUser(m.device_id, m.username); setActiveMenuId(null); }} className="text-gray-500 font-bold hover:underline">Blokir</button><button onClick={() => { inviteToPrivate(m.device_id, m.username); setActiveMenuId(null); }} className="text-emerald-600 font-bold hover:underline">Private</button></>
                                        )}
                                      </div>
                                    )}
                                    <button onClick={(e) => { e.stopPropagation(); setActiveMenuId(activeMenuId === m.id ? null : m.id); }} className="text-gray-500 hover:text-gray-800 text-base font-bold px-1 rounded hover:bg-gray-100 transition-colors">⋮</button>
                                  </div>
                                )}
                              </div>
                            </div>
                          </div>
                        );
                      }) : <div className="text-center text-gray-400 italic mt-10">Belum ada pesan di ruang ini.</div>}
                      
                      {isPillVisible && (
                        <div className="w-full flex justify-center pt-2 pb-2 transition-all duration-500 ease-in-out opacity-100 scale-100 select-none">
                          <div className={`px-4 py-1.5 rounded-full text-[10px] font-bold text-gray-700 border shadow-xs text-center tracking-wide transition-colors duration-300 relative overflow-hidden flex items-center justify-center min-w-[310px] h-[34px] cursor-pointer ${chatMode === 'private' ? 'bg-emerald-50/90 border-emerald-300/80' : 'bg-blue-50/90 border-blue-300/80'}`} onMouseDown={handlePillStart} onMouseUp={handlePillEnd} onMouseLeave={handlePillEnd} onTouchStart={handlePillStart} onTouchEnd={handlePillEnd}>
                            <div className={`absolute flex items-center gap-1 transition-all duration-500 w-full justify-center ${capsuleIndex === 0 ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4 pointer-events-none'}`}>
                              <span>Bijaklah dalam berinteraksi salam toleransi |</span><a href="https://ipix.my.id" target="_blank" rel="noopener noreferrer" className="text-red-600 hover:text-red-700 underline font-black" onClick={(e) => e.stopPropagation()}>ipix.my.id</a>
                            </div>
                            <div className={`absolute flex items-center gap-2 transition-all duration-500 w-full justify-center ${capsuleIndex === 1 ? 'opacity-100 translate-y-0' : 'opacity-0 -translate-y-4 pointer-events-none'}`}>
                              <span className={`inline-block anim-slide-left font-black text-sm leading-none ${chatMode === 'private' ? 'text-emerald-500' : 'text-blue-500'}`}>&lt;</span><span>geser ke kiri untuk membalas chat geser ke kanan</span><span className={`inline-block anim-slide-right font-black text-sm leading-none ${chatMode === 'private' ? 'text-emerald-500' : 'text-blue-500'}`}>&gt;</span>
                            </div>
                            {showPillClose && (
                              <div className="absolute inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center z-10 animate-fade-in" onMouseDown={(e) => { e.stopPropagation(); setIsPillVisible(false); }} onTouchStart={(e) => { e.stopPropagation(); setIsPillVisible(false); }}>
                                <div className="bg-red-500 text-white rounded-full w-6 h-6 flex items-center justify-center shadow-lg active:scale-75 transition-transform text-sm leading-none">✕</div>
                              </div>
                            )}
                          </div>
                        </div>
                      )}
                      <div id="messages-end" className="h-0" />
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
          
          {currentHash !== '#block' && (
            <div className="bg-white sticky bottom-0 z-10 w-full flex flex-col">
              {replyingTo && (
                <div className={`mx-3 mt-1.5 p-2 px-3 rounded-t-xl text-xs flex justify-between items-center border-t border-x transition-all duration-300 cursor-pointer ${chatMode === 'private' ? 'bg-emerald-50 border-emerald-300 text-emerald-900 hover:bg-emerald-100/70' : 'bg-blue-50 border-blue-300 text-blue-900 hover:bg-blue-100/70'}`} onClick={() => scrollToMessageId(replyingTo.id)} title="Klik untuk melompat kembali ke pesan asli">
                  <div className="truncate flex-1 pr-2"><span className="font-bold">Membalas @{replyingTo.username.split('●')[0]}:</span> <span className="italic opacity-80">"{replyingTo.pesan}"</span></div>
                  <button type="button" onClick={(e) => { e.stopPropagation(); setReplyingTo(null); }} className="text-gray-400 hover:text-gray-700 text-base font-bold leading-none px-1">×</button>
                </div>
              )}
              <form onSubmit={sendMessage} className="p-3 bg-white border-t flex gap-2 items-end w-full relative">
                <div className="relative flex-1">
                  <textarea id="chat-input" className={`w-full border p-2.5 rounded-2xl px-4 pb-7 text-sm resize-none focus:outline-none transition-all duration-300 min-h-[42px] max-h-[120px] font-sans leading-relaxed [scrollbar-width:none] [-ms-overflow-style:none] [&::-webkit-scrollbar]:hidden ${chatMode === 'private' ? inputBlink ? 'bg-emerald-600/30 border-emerald-500 ring-2 ring-emerald-400 text-emerald-950 placeholder-emerald-600/50' : 'bg-emerald-600/10 border-emerald-500/20 text-emerald-950 placeholder-emerald-600/50 focus:border-emerald-500 focus:bg-emerald-600/15' : inputBlink ? 'bg-blue-600/30 border-blue-500 ring-2 ring-blue-400 text-blue-950 placeholder-blue-600/50' : 'bg-blue-600/10 border-blue-500/20 text-blue-950 placeholder-blue-600/50 focus:border-blue-500 focus:bg-blue-600/15'}`} value={input} onChange={(e) => { setInput(e.target.value); e.target.style.height = 'auto'; e.target.style.height = `${Math.min(e.target.scrollHeight, 120)}px`; }} onKeyDown={(e) => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); sendMessage(e); } }} placeholder="Ketik pesan..." maxLength={200} rows={1} disabled={sending} />
                  <div className="absolute right-4 bottom-2.5 text-[10px] text-gray-400 font-mono pointer-events-none select-none opacity-80 bg-white/40 px-1 rounded">
                    {200 - input.length}
                  </div>
                </div>
                <button type="submit" disabled={sending || !input.trim()} className={`px-4 sm:px-6 h-[42px] rounded-2xl font-bold text-xs sm:text-sm shrink-0 transition-all duration-200 active:scale-95 disabled:opacity-50 flex items-center justify-center shadow-sm ${chatMode === 'private' ? 'bg-emerald-600 hover:bg-emerald-700 text-white' : 'bg-blue-600 hover:bg-blue-700 text-white'}`}>
                  {sending ? '...' : (chatMode === 'private' ? <><span className="hidden sm:inline">Kirim ke Private Chat</span><span className="inline sm:hidden">Kirim admin</span></> : <><span className="hidden sm:inline">Kirim ke Public Chat</span><span className="inline sm:hidden">Kirim publik</span></>)}
                </button>
              </form>
            </div>
          )}
        </>
      )}
    </div>
  );
}