'use client';
import { useEffect, useState, useCallback, useRef } from 'react';
import { usePathname } from 'next/navigation';
import { supabase } from './supabaseClient';
import { motion } from 'framer-motion';

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
  
  const [totalPrivate, setTotalPrivate] = useState(0);
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
  
  // Game States (Gartic Style)
  const [gameWords, setGameWords] = useState<any[]>([]);
  const [newGameWord, setNewGameWord] = useState('');
  const [newGameHint, setNewGameHint] = useState('');
  const [gameState, setGameState] = useState<any>({ is_active: false, word: '', hint: '', drawer_id: '', drawer_name: '' });
  const [isDrawing, setIsDrawing] = useState(false);
  const [brushColor, setBrushColor] = useState('#000000');
  const [brushSize, setBrushSize] = useState(3);
  
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const contextRef = useRef<CanvasRenderingContext2D | any>(null);
  const broadcastChannel = useRef<any>(null);

  const [replyingTo, setReplyingTo] = useState<any | null>(null);
  const [activeMenuId, setActiveMenuId] = useState<number | null>(null);
  const [longPressId, setLongPressId] = useState<number | null>(null);
  const longPressTimer = useRef<NodeJS.Timeout | null>(null);

  const containerRef = useRef<HTMLDivElement>(null);
  const currentDeviceId = typeof window !== 'undefined' ? localStorage.getItem('device_id') : null;

  useEffect(() => {
    const handleHash = () => setCurrentHash(window.location.hash);
    window.addEventListener('hashchange', handleHash);
    handleHash();
    return () => window.removeEventListener('hashchange', handleHash);
  }, []);

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
      el.classList.add('ring-2', 'ring-emerald-400', 'bg-emerald-50/50');
      setTimeout(() => el.classList.remove('ring-2', 'ring-emerald-400', 'bg-emerald-50/50'), 1500);
    }
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
  }, [messages, chatMode]);

  const addBlockedWord = async () => { if (!newBadWord.trim()) return; await supabase.from('blocked_words').insert([{ word: newBadWord.trim().charAt(0).toUpperCase() + newBadWord.trim().slice(1).toLowerCase() }]); setNewBadWord(''); fetchData(); };
  const removeBlockedWord = async (word: string) => { await supabase.from('blocked_words').delete().eq('word', word); fetchData(); };
  
  // Admin Game Functions
  const addGameWord = async () => { if (!newGameWord.trim() || !newGameHint.trim()) return; await supabase.from('game_words').insert([{ word: newGameWord.trim().toLowerCase(), hint: newGameHint.trim() }]); setNewGameWord(''); setNewGameHint(''); fetchGameData(); };
  const removeGameWord = async (id: number) => { await supabase.from('game_words').delete().eq('id', id); fetchGameData(); };
  const startGame = async (wordData: any, drawerId: string, drawerName: string) => {
    await supabase.from('game_state').upsert({ id: 1, word: wordData.word, hint: wordData.hint, drawer_id: drawerId, drawer_name: drawerName, is_active: true });
    await supabase.from('messages').insert([{ username: 'System', pesan: `🎮 Game Dimulai! ${drawerName} sedang menggambar. Clue: ${wordData.hint}`, device_id: 'system', is_private: false }]);
    broadcastClear();
  };
  const stopGame = async () => { await supabase.from('game_state').upsert({ id: 1, is_active: false }); broadcastClear(); };

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

  const fetchGameData = useCallback(async () => {
    const { data: wData } = await supabase.from('game_words').select('*');
    if (wData) setGameWords(wData);
    const { data: sData } = await supabase.from('game_state').select('*').eq('id', 1).single();
    if (sData) setGameState(sData);
  }, []);

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
        let privQuery = supabase.from('messages').select('*', { count: 'exact', head: true }).eq('is_private', true);
        if (activeTab === 'user') privQuery = privQuery.or(`device_id.eq.${currentDeviceId},private_with.eq.${currentDeviceId}`);
        const { count: privCount } = await privQuery;
        setTotalPrivate(privCount || 0);
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
        const userGroups = mData.reduce((acc: any, msg: any) => { if (msg.username !== 'Admin●ipix.my.id' && msg.username !== 'System') { if (!acc[msg.username]) acc[msg.username] = []; acc[msg.username].push(msg); } return acc; }, {});
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

      fetchGameData();
    } catch (err) { setMessages([]); }
  }, [chatMode, activeTab, selectedPrivateUser, currentDeviceId, isAuth, fetchGameData]);

  // CANVAS DRAWING LOGIC (Gartic)
  useEffect(() => {
    if (chatMode === 'public' && canvasRef.current) {
      const canvas = canvasRef.current;
      // Fixed internal resolution for consistent coordinate syncing
      canvas.width = 800;
      canvas.height = 600;
      const context = canvas.getContext("2d");
      if (context) {
        context.lineCap = "round";
        context.lineJoin = "round";
        contextRef.current = context;
      }

      // Initialize Supabase Realtime Broadcast for Drawing
      if (!broadcastChannel.current) {
        broadcastChannel.current = supabase.channel('drawing_room', {
          config: { broadcast: { self: false } },
        });

        broadcastChannel.current
          .on('broadcast', { event: 'draw' }, ({ payload }: any) => {
             if(contextRef.current) {
                const ctx = contextRef.current;
                ctx.beginPath();
                ctx.moveTo(payload.x0, payload.y0);
                ctx.lineTo(payload.x1, payload.y1);
                ctx.strokeStyle = payload.color;
                ctx.lineWidth = payload.size;
                ctx.stroke();
                ctx.closePath();
             }
          })
          .on('broadcast', { event: 'clear' }, () => {
             if(contextRef.current && canvasRef.current) {
                contextRef.current.clearRect(0, 0, canvasRef.current.width, canvasRef.current.height);
             }
          })
          .subscribe();
      }
    }

    return () => {
      if (broadcastChannel.current && chatMode !== 'public') {
        supabase.removeChannel(broadcastChannel.current);
        broadcastChannel.current = null;
      }
    }
  }, [chatMode]);

  const [lastPos, setLastPos] = useState({ x: 0, y: 0 });

  const getCoordinates = (e: any) => {
    if (!canvasRef.current) return { x: 0, y: 0 };
    const canvas = canvasRef.current;
    const rect = canvas.getBoundingClientRect();
    const scaleX = canvas.width / rect.width;
    const scaleY = canvas.height / rect.height;
    
    let clientX = e.clientX;
    let clientY = e.clientY;
    
    if (e.touches && e.touches.length > 0) {
      clientX = e.touches[0].clientX;
      clientY = e.touches[0].clientY;
    }
    
    return {
      x: (clientX - rect.left) * scaleX,
      y: (clientY - rect.top) * scaleY
    };
  };

  const startDrawing = (e: any) => {
    if (gameState.drawer_id !== currentDeviceId) return;
    const { x, y } = getCoordinates(e);
    setLastPos({ x, y });
    setIsDrawing(true);
  };

  const draw = (e: any) => {
    if (!isDrawing || gameState.drawer_id !== currentDeviceId || !contextRef.current) return;
    const { x, y } = getCoordinates(e);
    
    const ctx = contextRef.current;
    ctx.beginPath();
    ctx.moveTo(lastPos.x, lastPos.y);
    ctx.lineTo(x, y);
    ctx.strokeStyle = brushColor;
    ctx.lineWidth = brushSize;
    ctx.stroke();
    ctx.closePath();
    
    if (broadcastChannel.current) {
      broadcastChannel.current.send({
        type: 'broadcast',
        event: 'draw',
        payload: { x0: lastPos.x, y0: lastPos.y, x1: x, y1: y, color: brushColor, size: brushSize }
      });
    }
    
    setLastPos({ x, y });
  };

  const stopDrawing = () => { setIsDrawing(false); };
  
  const broadcastClear = () => {
    if (contextRef.current && canvasRef.current) {
      contextRef.current.clearRect(0, 0, canvasRef.current.width, canvasRef.current.height);
    }
    if (broadcastChannel.current) {
      broadcastChannel.current.send({ type: 'broadcast', event: 'clear' });
    }
  };

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
    const channel = supabase.channel('chat_and_game')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'messages' }, fetchData)
      .on('postgres_changes', { event: '*', schema: 'public', table: 'game_state' }, fetchGameData)
      .subscribe();
    return () => { void supabase.removeChannel(channel); };
  }, [mounted, fetchData, fetchGameData]);

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
        if (isTaken) return alert("Username sudah digunakan oleh pengguna lain. Silakan buat nama lain yang unik.");
      }
    }

    try { await supabase.from('profiles').upsert({ device_id: cid, username: username.trim(), user_browser: typeof window !== 'undefined' ? navigator.userAgent : 'Unknown' }, { onConflict: 'device_id' }); } catch (err) {}
    setIsAuth(true); sessionStorage.setItem('is_auth', 'true'); sessionStorage.setItem('saved_username', username.trim()); sessionStorage.setItem('active_tab', 'user');
  };

  const sendMessage = async (e: React.FormEvent) => {
    e.preventDefault(); if (!input.trim() || sending) return;
    setSending(true); 
    
    // GAME LOGIC: Check Guess
    if (chatMode === 'public' && gameState.is_active && currentDeviceId !== gameState.drawer_id) {
       if (input.trim().toLowerCase() === gameState.word.toLowerCase()) {
         // Correct guess!
         await supabase.from('messages').insert([{ username: 'System', pesan: `🎉 ${username} berhasil menebak kata: ${gameState.word.toUpperCase()}!`, device_id: 'system', is_private: false }]);
         await supabase.from('game_state').upsert({ id: 1, is_active: false });
         setInput(''); setSending(false);
         return;
       }
    }

    let finalPesan = input.trim();
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

  const deleteMsg = async (id: number) => { await supabase.from('messages').delete().eq('id', id); fetchData(); };
  const blockUser = async (id: string, name: string) => { if (confirm("Blokir?")) { await supabase.from('blocked_users').insert([{ device_id: id, username: name }]); fetchData(); } };
  const unblock = async (id: string) => { await supabase.from('blocked_users').delete().eq('device_id', id); fetchData(); };
  const inviteToPrivate = (id: string) => { handleTabSwitch('private'); setSelectedPrivateUser(id); };

  if (!mounted) return <div className="h-screen flex items-center justify-center bg-gray-900 text-white">Memuat...</div>;
  return (
    <div className="w-full max-w-2xl mx-auto h-dvh flex flex-col bg-gray-100 shadow-xl overflow-hidden font-sans" onClick={() => { setActiveMenuId(null); setLongPressId(null); }}>
      <style dangerouslySetInnerHTML={{ __html: `
        @keyframes glassBlurBlue { 0% { opacity: 0; filter: blur(12px); background: rgba(59, 130, 246, 0.2); } 100% { opacity: 1; filter: blur(0px); background: transparent; } }
        @keyframes glassBlurGreen { 0% { opacity: 0; filter: blur(12px); background: rgba(16, 185, 129, 0.2); } 100% { opacity: 1; filter: blur(0px); background: transparent; } }
        .anim-glass-public { animation: glassBlurBlue 0.6s cubic-bezier(0.4, 0, 0.2, 1) forwards; }
        .anim-glass-private { animation: glassBlurGreen 0.6s cubic-bezier(0.4, 0, 0.2, 1) forwards; }
      `}} />

      {!isAuth ? (
        <div className="flex flex-col items-center justify-center h-screen bg-gradient-to-br from-emerald-500 to-blue-600 p-6 relative overflow-hidden w-full">
          <div className="w-full max-w-sm flex flex-col items-center bg-white/10 backdrop-blur-md p-8 rounded-[2rem] border border-white/20 shadow-2xl z-10">
            <h1 className="w-full text-center text-4xl sm:text-5xl font-black mb-8 text-white/95 tracking-tighter drop-shadow-[0_2px_15px_rgba(255,255,255,0.4)] pb-1" style={{ fontFamily: "'Nunito', 'Segoe UI', sans-serif" }}>
              iPixChaT
            </h1>
            {activeTab === 'user' ? (
              <div className="w-full flex flex-col items-center">
                <input 
                  className="w-full p-4 rounded-2xl bg-white/20 text-white placeholder-white/70 border border-white/20 focus:border-white focus:bg-white/30 transition-all outline-none font-medium shadow-inner text-center" 
                  placeholder="Masukkan Nama Anda..." 
                  value={username || ""} 
                  onChange={(e) => setUsername(e.target.value)} 
                  disabled={isExistingUser} 
                />
                {!isExistingUser ? (
                  <div className="bg-white/20 px-5 py-2 rounded-full mt-4 mb-6 text-[10px] text-white/90 shadow-sm border border-white/10 backdrop-blur-sm font-medium tracking-wide">
                    buat username yang baik dan benar
                  </div>
                ) : (
                  <div className="text-[10px] text-white/90 mt-4 mb-6 text-center leading-relaxed bg-black/10 px-4 py-2.5 rounded-xl backdrop-blur-sm border border-white/10 w-full shadow-inner">
                    Nama Anda telah tertanam di sistem chat.<br/>Hubungi admin untuk merubahnya.
                  </div>
                )}
                <button 
                  onClick={handleUserLogin} 
                  className="w-full bg-gradient-to-r from-emerald-400 to-blue-500 text-white px-8 py-3.5 rounded-2xl font-bold shadow-[0_4px_15px_rgba(0,0,0,0.1)] hover:shadow-[0_6px_20px_rgba(0,0,0,0.15)] hover:scale-[1.02] active:scale-95 transition-all mt-2 text-sm tracking-wide">
                  {isExistingUser ? 'Masuk Chat' : 'Login'}
                </button>
              </div>
            ) : (
              <div className="w-full flex flex-col items-center">
                <input className="w-full p-4 rounded-2xl bg-white/20 text-white placeholder-white/70 border border-white/20 focus:border-white focus:bg-white/30 transition-all outline-none font-medium shadow-inner text-center mb-4" placeholder="Email Admin" value={adminEmail || ""} onChange={(e) => setAdminEmail(e.target.value)} />
                <input type="password" className="w-full p-4 rounded-2xl bg-white/20 text-white placeholder-white/70 border border-white/20 focus:border-white focus:bg-white/30 transition-all outline-none font-medium shadow-inner text-center mb-6" placeholder="Password Admin" value={adminPass || ""} onChange={(e) => setAdminPass(e.target.value)} />
                <button onClick={handleAdminLogin} className="w-full bg-gradient-to-r from-emerald-400 to-blue-500 text-white px-8 py-3.5 rounded-2xl font-bold shadow-[0_4px_15px_rgba(0,0,0,0.1)] hover:shadow-[0_6px_20px_rgba(0,0,0,0.15)] hover:scale-[1.02] active:scale-95 transition-all text-sm tracking-wide">
                  Verifikasi Admin
                </button>
              </div>
            )}
          </div>

          <div className="absolute bottom-6 text-[11px] text-white/80 flex items-center gap-1.5 z-10 font-medium">
            created by 
            <motion.a 
              href="https://ipix.my.id" 
              target="_blank" 
              className="text-emerald-300 font-black hover:text-emerald-100 px-0.5" 
              animate={{ y: [0, -4, 0] }} 
              transition={{ repeat: Infinity, duration: 2, ease: "easeInOut" }}>
              ipix.my.id
            </motion.a>
            with 
            <motion.span 
              animate={{ scale: [1, 1.3, 1] }} 
              transition={{ repeat: Infinity, duration: 0.8, ease: "easeInOut" }} 
              className="text-red-500 text-sm drop-shadow-md">
              ❤️
            </motion.span>
          </div>
        </div>
      ) : (
        <>
          {/* HEADER CHAT */}
          {currentHash !== '#block' && currentHash !== '#gameadmin' && (
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
                  {activeTab === 'admin' && (
                    <div className="flex gap-1 mb-1">
                      <a href="#block" className="text-[10px] font-bold bg-gray-800 text-white px-2 py-0.5 rounded">Blokir</a>
                      <a href="#gameadmin" className="text-[10px] font-bold bg-blue-600 text-white px-2 py-0.5 rounded">Set Game</a>
                    </div>
                  )}
                  {activeTab === 'user' && <div className="text-[10px] text-gray-500 mt-0.5"><span className={`inline-block w-2 h-2 rounded-full ${isAdminOnline ? 'bg-green-500' : 'bg-gray-400'}`}></span>{isAdminOnline ? ' Admin Online' : ` Admin Offline`}</div>}
                </div>
              </div>
              <div className="flex mt-3 bg-white border border-gray-200 rounded-full p-1 shadow-sm w-full">
                <button onClick={() => handleTabSwitch('public')} className={`relative flex-1 py-2 sm:py-2.5 text-xs sm:text-sm font-semibold rounded-full transition-all duration-200 z-10 flex items-center justify-center gap-2 ${chatMode === 'public' ? 'bg-blue-600 text-white shadow' : 'bg-transparent text-gray-700 hover:bg-gray-100'}`}>
                  <span className="mr-2">🎨 Tebak Gambar</span>
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
          
          <div key={chatMode} ref={containerRef} className={`flex-1 overflow-y-auto overflow-x-hidden transition-all duration-200 ${isTransitioning ? 'opacity-0 bg-gray-50' : 'opacity-100'} ${chatMode === 'public' ? 'anim-glass-public flex flex-col' : 'anim-glass-private'}`}>
            
            {/* ADMIN PANEL BLOKIR */}
            {activeTab === 'admin' && currentHash === '#block' ? (
              <div className="min-h-full bg-gradient-to-br from-emerald-950 via-blue-950 to-emerald-950 text-white">
                <div className="sticky top-0 bg-gradient-to-br from-emerald-950 to-blue-950 border-b border-white/10 z-20 p-6">
                  <div className="max-w-5xl mx-auto flex justify-between items-center">
                    <div><h2 className="text-3xl font-bold flex items-center gap-3">⚙️ Manajemen Blokir</h2></div>
                    <button onClick={() => window.history.back()} className="px-6 py-2.5 bg-white/10 hover:bg-white/20 border border-white/30 rounded-full text-sm font-medium transition-all">← Kembali</button>
                  </div>
                </div>
                <div className="p-6 max-w-5xl mx-auto space-y-8 pb-20">
                  <section className="bg-white/10 backdrop-blur-xl rounded-3xl border border-white/20 p-6">
                    <h3 className="text-xl font-semibold mb-5 flex items-center gap-3">👤 User Terblokir <span className="text-sm font-normal text-white/50">({blockedList.length})</span></h3>
                    {blockedList.length === 0 ? <p className="text-white/50 italic py-12 text-center">Belum ada user yang diblokir.</p> : (
                      <div className="grid grid-cols-1 gap-4">
                        {blockedList.map(b => (
                          <div key={b.device_id} onClick={() => unblock(b.device_id)} className="group bg-white/5 hover:bg-white/10 border border-white/10 p-5 rounded-2xl cursor-pointer flex justify-between items-start">
                            <div><div className="font-semibold">{b.username || 'Tanpa Nama'}</div><div className="text-xs text-white/60 font-mono">ID: {b.device_id}</div></div>
                            <div className="text-right text-xs text-white/50"><span className="block text-red-400 text-3xl mt-2">×</span></div>
                          </div>
                        ))}
                      </div>
                    )}
                  </section>
                  <section className="bg-white/10 backdrop-blur-xl rounded-3xl border border-white/20 p-6">
                    <h3 className="text-xl font-semibold mb-5">🚫 Filter Kata Kasar</h3>
                    <div className="flex gap-3 mb-6">
                      <input className="flex-1 border border-white/30 bg-white/5 text-white rounded-2xl px-5 py-4 text-sm outline-none placeholder:text-white/50" placeholder="Tambah kata dilarang..." value={newBadWord} onChange={(e) => setNewBadWord(e.target.value)} />
                      <button onClick={addBlockedWord} className="bg-red-600 text-white px-8 rounded-2xl font-semibold">Tambah</button>
                    </div>
                    <div className="flex flex-wrap gap-3">
                      {blockedWords.map((word, idx) => (
                        <div key={idx} className="flex items-center gap-2 bg-white/10 border border-white/30 px-5 py-2.5 rounded-2xl text-sm"><span className="font-medium">{word}</span><button onClick={() => removeBlockedWord(word)} className="text-white/50 hover:text-red-400 text-xl">×</button></div>
                      ))}
                    </div>
                  </section>
                </div>
              </div>
            ) : 
            /* ADMIN PANEL GAME */
            activeTab === 'admin' && currentHash === '#gameadmin' ? (
              <div className="min-h-full bg-gradient-to-br from-indigo-950 via-purple-950 to-indigo-950 text-white">
                <div className="sticky top-0 bg-gradient-to-br from-indigo-950 to-purple-950 border-b border-white/10 z-20 p-6">
                  <div className="max-w-5xl mx-auto flex justify-between items-center">
                    <div><h2 className="text-2xl font-bold flex items-center gap-3">🎮 Setting Game</h2></div>
                    <button onClick={() => window.history.back()} className="px-6 py-2.5 bg-white/10 hover:bg-white/20 border border-white/30 rounded-full text-sm font-medium transition-all">← Kembali</button>
                  </div>
                </div>
                <div className="p-6 max-w-5xl mx-auto space-y-6 pb-20">
                  <section className="bg-white/10 backdrop-blur-xl rounded-3xl border border-white/20 p-6">
                    <h3 className="text-xl font-semibold mb-4">Status Game Saat Ini</h3>
                    <div className="bg-black/20 p-4 rounded-xl mb-4">
                      <p>Status: <span className={gameState.is_active ? 'text-green-400 font-bold' : 'text-red-400 font-bold'}>{gameState.is_active ? 'AKTIF' : 'NONAKTIF'}</span></p>
                      <p>Kata: <span className="font-bold text-blue-300">{gameState.word || '-'}</span></p>
                      <p>Petunjuk: <span className="italic">{gameState.hint || '-'}</span></p>
                      <p>Drawer: <span className="font-bold text-yellow-300">{gameState.drawer_name || '-'}</span></p>
                    </div>
                    {gameState.is_active && <button onClick={stopGame} className="w-full bg-red-600 py-3 rounded-xl font-bold">Hentikan Game</button>}
                  </section>
                  
                  <section className="bg-white/10 backdrop-blur-xl rounded-3xl border border-white/20 p-6">
                    <h3 className="text-xl font-semibold mb-4">Mulai Round Baru</h3>
                    <div className="space-y-4">
                      <div>
                        <p className="text-sm text-white/70 mb-2">Pilih Kata & Mulai (Drawer: Admin)</p>
                        <div className="grid grid-cols-1 gap-2 max-h-60 overflow-y-auto p-2 bg-black/20 rounded-xl">
                          {gameWords.map(w => (
                             <div key={w.id} className="flex justify-between items-center bg-white/10 p-3 rounded-xl">
                               <div><div className="font-bold text-blue-300">{w.word}</div><div className="text-xs text-white/60">{w.hint}</div></div>
                               <button onClick={() => startGame(w, currentDeviceId!, 'Admin')} className="bg-green-500 px-4 py-2 rounded-lg text-xs font-bold shadow-md hover:bg-green-600">Start (Admin Draw)</button>
                             </div>
                          ))}
                          {gameWords.length === 0 && <p className="text-center text-white/50 text-sm py-4">Belum ada daftar kata.</p>}
                        </div>
                      </div>
                    </div>
                  </section>
                  
                  <section className="bg-white/10 backdrop-blur-xl rounded-3xl border border-white/20 p-6">
                    <h3 className="text-xl font-semibold mb-4">Database Kata</h3>
                    <div className="flex flex-col gap-3 mb-6">
                      <input className="border border-white/30 bg-white/5 text-white rounded-xl px-4 py-3 text-sm outline-none" placeholder="Jawaban (contoh: Kucing)" value={newGameWord} onChange={(e) => setNewGameWord(e.target.value)} />
                      <input className="border border-white/30 bg-white/5 text-white rounded-xl px-4 py-3 text-sm outline-none" placeholder="Petunjuk (contoh: Hewan peliharaan)" value={newGameHint} onChange={(e) => setNewGameHint(e.target.value)} />
                      <button onClick={addGameWord} className="bg-blue-600 text-white py-3 rounded-xl font-bold">Tambah Kata</button>
                    </div>
                    <div className="grid grid-cols-2 gap-3">
                      {gameWords.map((w) => (
                        <div key={w.id} className="flex flex-col justify-between bg-white/10 border border-white/30 p-3 rounded-xl text-sm relative group">
                           <span className="font-bold text-blue-200">{w.word}</span>
                           <span className="text-xs text-white/70">{w.hint}</span>
                           <button onClick={() => removeGameWord(w.id)} className="absolute top-2 right-2 text-white/50 hover:text-red-400 bg-black/30 rounded-full w-6 h-6 flex items-center justify-center">×</button>
                        </div>
                      ))}
                    </div>
                  </section>
                </div>
              </div>
            ) :
            
            /* PUBLIC CHAT (GAME AREA) */
            chatMode === 'public' ? (
              <div className="flex flex-col h-full bg-white relative">
                {/* Game Dashboard Header */}
                <div className="bg-gradient-to-r from-blue-900 to-indigo-900 text-white p-3 shadow-md z-10 flex flex-col items-center justify-center">
                   {gameState.is_active ? (
                     <>
                       <div className="text-[10px] uppercase font-bold text-blue-200 tracking-widest mb-1">
                         {gameState.drawer_id === currentDeviceId ? 'ANDA SEDANG MENGGAMBAR' : `${gameState.drawer_name} SEDANG MENGGAMBAR`}
                       </div>
                       <div className="text-lg font-black tracking-widest">
                         {gameState.drawer_id === currentDeviceId 
                           ? gameState.word.toUpperCase() 
                           : gameState.word.split('').map((c: string) => c === ' ' ? ' ' : '_').join(' ')}
                       </div>
                       <div className="text-xs text-indigo-200 mt-1 italic">Clue: {gameState.hint}</div>
                     </>
                   ) : (
                     <div className="text-sm font-bold text-indigo-100 py-2">Permainan sedang menunggu Admin...</div>
                   )}
                </div>
                
                {/* CANVAS AREA */}
                <div className="w-full bg-gray-50 border-b border-gray-200 relative aspect-[4/3] max-h-[40vh] shadow-inner">
                  <canvas 
                    ref={canvasRef}
                    className={`w-full h-full block ${gameState.drawer_id === currentDeviceId ? 'cursor-crosshair' : 'cursor-default'}`}
                    onMouseDown={startDrawing}
                    onMouseMove={draw}
                    onMouseUp={stopDrawing}
                    onMouseLeave={stopDrawing}
                    onTouchStart={startDrawing}
                    onTouchMove={draw}
                    onTouchEnd={stopDrawing}
                  />
                  {!gameState.is_active && (
                    <div className="absolute inset-0 bg-white/60 backdrop-blur-sm flex items-center justify-center z-10">
                       <span className="bg-blue-600/90 text-white px-4 py-2 rounded-full font-bold text-xs shadow-lg">Mode Tebak Gambar</span>
                    </div>
                  )}
                  {/* Drawing Tools (Only for active drawer) */}
                  {gameState.is_active && gameState.drawer_id === currentDeviceId && (
                     <div className="absolute bottom-2 left-1/2 -translate-x-1/2 bg-white/90 p-2 rounded-2xl shadow-lg border border-gray-200 flex gap-3 z-10">
                        <div className="flex gap-1.5 items-center">
                          {['#000000', '#EF4444', '#3B82F6', '#10B981', '#F59E0B'].map(color => (
                            <button key={color} onClick={() => setBrushColor(color)} className={`w-6 h-6 rounded-full shadow-sm border-2 ${brushColor === color ? 'border-gray-800 scale-110' : 'border-transparent'}`} style={{ backgroundColor: color }} />
                          ))}
                        </div>
                        <div className="w-px bg-gray-300"></div>
                        <div className="flex items-center gap-2">
                           <button onClick={() => setBrushSize(3)} className={`w-5 h-5 rounded-full bg-gray-800 ${brushSize === 3 ? 'ring-2 ring-blue-400' : ''}`}></button>
                           <button onClick={() => setBrushSize(8)} className={`w-7 h-7 rounded-full bg-gray-800 ${brushSize === 8 ? 'ring-2 ring-blue-400' : ''}`}></button>
                        </div>
                        <div className="w-px bg-gray-300"></div>
                        <button onClick={broadcastClear} className="text-[10px] font-bold text-red-600 px-2 py-1 bg-red-50 rounded">Clear</button>
                     </div>
                  )}
                </div>

                {/* CHAT MESSAGES AREA (Guessing) */}
                <div className="flex-1 overflow-y-auto p-3 space-y-3 bg-gray-100">
                  {messages.length > 0 ? messages.map((m) => {
                    const isSystem = m.device_id === 'system';
                    if (isSystem) {
                      return (
                         <div key={m.id} id={`msg-${m.id}`} className="bg-gradient-to-r from-blue-100 to-green-100 p-3 rounded-xl border border-blue-200 shadow-sm w-full text-center my-2">
                            <span className="font-bold text-blue-900 text-sm">{m.pesan}</span>
                         </div>
                      )
                    }
                    return (
                      <div key={m.id} id={`msg-${m.id}`} className="bg-white p-3 rounded-xl border border-gray-100 shadow-sm w-full select-none relative"
                        onMouseDown={() => { longPressTimer.current = setTimeout(() => { setLongPressId(m.id); }, 500); }}
                        onMouseUp={() => { if (longPressTimer.current) clearTimeout(longPressTimer.current); }}
                        onTouchStart={() => { longPressTimer.current = setTimeout(() => { setLongPressId(m.id); }, 500); }}
                        onTouchEnd={() => { if (longPressTimer.current) clearTimeout(longPressTimer.current); }}>
                        
                        {longPressId === m.id && (
                          <div className="absolute inset-0 bg-white/90 backdrop-blur-sm z-20 rounded-xl flex items-center justify-center gap-3 shadow-sm border border-gray-200" onClick={(e) => { e.stopPropagation(); setLongPressId(null); }}>
                            <button className="bg-gray-800 text-white px-5 py-2 rounded-full text-xs font-bold" onClick={(e) => { e.stopPropagation(); copyToClipboard(m.pesan, 'Pesan'); setLongPressId(null); }}>Salin</button>
                            {(activeTab !== 'admin' && m.device_id === currentDeviceId) && (
                               <button className="bg-blue-600 text-white px-5 py-2 rounded-full text-xs font-bold" onClick={(e) => { e.stopPropagation(); handleEditLimit(m); setLongPressId(null); }}>Edit</button>
                            )}
                          </div>
                        )}

                        <div className="flex justify-between items-start mb-1">
                          <div className="flex items-center gap-2">
                            <b className={`${m.username === 'Admin●ipix.my.id' ? 'text-red-600' : 'text-blue-700'} text-[10px]`}>{m.username}</b>
                          </div>
                          <span className="text-[10px] text-gray-500 font-medium">{formatMessageTime(m.created_at)}</span>
                        </div>
                        <div className="text-sm text-gray-800 break-words">{applyCensor(m.pesan)}</div>
                      </div>
                    );
                  }) : <div className="text-center text-gray-400 italic mt-10">Ketik jawabanmu di bawah...</div>}
                  <div id="messages-end" className="h-0" />
                </div>
              </div>
            ) : 

            /* PRIVATE CHAT */
            (
              <div className="flex-1 overflow-y-auto">
                {activeTab === 'admin' && chatMode === 'private' && !selectedPrivateUser ? (
                  <div className="space-y-3 p-3">
                    {privateUsers.map(user => (
                      <div key={user.device_id} onClick={() => setSelectedPrivateUser(user.device_id)} className="bg-white p-4 rounded-2xl border border-gray-200 shadow-sm hover:shadow-md cursor-pointer flex justify-between items-center">
                        <div>
                          <div className="font-semibold text-blue-700">{user.username || 'User Tanpa Nama'}</div>
                          <div className="text-xs text-gray-500 font-mono mt-0.5">ID: {user.device_id.substring(0, 8)}...</div>
                        </div>
                        <div className="text-right flex flex-col items-end gap-1.5">
                          {user.count > 0 ? <div className="bg-red-500 text-white text-[10px] font-bold px-2.5 py-1 rounded-full">{user.count} Baru</div> : <div className="bg-gray-400 text-white text-[10px] font-bold px-2.5 py-1 rounded-full opacity-90">Terbaca</div>}
                          <div className="text-[10px] text-emerald-600 font-medium">{formatMessageTime(user.last_active)}</div>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="flex flex-col h-full relative">
                    <div className="p-3 space-y-3 overflow-x-hidden flex-1">
                      {messages.length > 0 ? messages.map((m) => {
                        return (
                          <div key={m.id} id={`msg-${m.id}`} className="bg-white p-3 rounded-xl border border-gray-100 shadow-sm w-full select-none relative"
                            onMouseDown={() => { longPressTimer.current = setTimeout(() => { setLongPressId(m.id); }, 500); }}
                            onMouseUp={() => { if (longPressTimer.current) clearTimeout(longPressTimer.current); }}
                            onTouchStart={() => { longPressTimer.current = setTimeout(() => { setLongPressId(m.id); }, 500); }}
                            onTouchEnd={() => { if (longPressTimer.current) clearTimeout(longPressTimer.current); }}>
                            
                            {longPressId === m.id && (
                              <div className="absolute inset-0 bg-white/90 backdrop-blur-sm z-20 rounded-xl flex items-center justify-center gap-3 shadow-sm border border-gray-200" onClick={(e) => { e.stopPropagation(); setLongPressId(null); }}>
                                <button className="bg-gray-800 text-white px-5 py-2 rounded-full text-xs font-bold" onClick={(e) => { e.stopPropagation(); copyToClipboard(m.pesan, 'Pesan'); setLongPressId(null); }}>Salin</button>
                                {(activeTab !== 'admin' && m.device_id === currentDeviceId) && (
                                   <button className="bg-blue-600 text-white px-5 py-2 rounded-full text-xs font-bold" onClick={(e) => { e.stopPropagation(); handleEditLimit(m); setLongPressId(null); }}>Edit</button>
                                )}
                              </div>
                            )}

                            <div className="flex justify-between items-start mb-1">
                              <div className="flex items-center gap-2">
                                <b className={`${m.username === 'Admin●ipix.my.id' ? 'text-red-600' : 'text-blue-700'} text-[10px]`}>{m.username}</b>
                                <span className="text-xs text-emerald-600">🔒 Private</span>
                              </div>
                              <span className="text-[10px] text-gray-500 font-medium">{formatMessageTime(m.created_at)}</span>
                            </div>
                            <div className="text-sm text-gray-800 break-words">{applyCensor(m.pesan)}</div>
                          </div>
                        );
                      }) : <div className="text-center text-gray-400 italic mt-10">Belum ada pesan private.</div>}
                      <div id="messages-end" className="h-0" />
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
          
          {/* CHAT INPUT FORM */}
          {currentHash !== '#block' && currentHash !== '#gameadmin' && (
            <div className="bg-white sticky bottom-0 z-10 w-full flex flex-col">
              <form onSubmit={sendMessage} className="p-3 bg-white border-t flex gap-2 items-end w-full relative shadow-[0_-4px_10px_rgba(0,0,0,0.02)]">
                <div className="relative flex-1">
                  <textarea id="chat-input" className={`w-full border p-2.5 rounded-2xl px-4 pb-7 text-sm resize-none focus:outline-none transition-all min-h-[42px] max-h-[120px] font-sans [scrollbar-width:none] ${chatMode === 'private' ? 'bg-emerald-600/10 border-emerald-500/20 text-emerald-950 focus:border-emerald-500' : 'bg-blue-600/10 border-blue-500/20 text-blue-950 focus:border-blue-500'}`} value={input} onChange={(e) => { setInput(e.target.value); e.target.style.height = 'auto'; e.target.style.height = `${Math.min(e.target.scrollHeight, 120)}px`; }} onKeyDown={(e) => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); sendMessage(e); } }} placeholder={chatMode === 'public' ? "Tebak gambarnya..." : "Ketik pesan private..."} maxLength={200} rows={1} disabled={sending} />
                  <div className="absolute right-4 bottom-2.5 text-[10px] text-gray-400 font-mono pointer-events-none bg-white/40 px-1 rounded">{200 - input.length}</div>
                </div>
                <button type="submit" disabled={sending || !input.trim()} className={`px-4 sm:px-6 h-[42px] rounded-2xl font-bold text-xs shrink-0 transition-all active:scale-95 disabled:opacity-50 flex items-center justify-center ${chatMode === 'private' ? 'bg-emerald-600 text-white' : 'bg-blue-600 text-white'}`}>
                  {sending ? '...' : (chatMode === 'private' ? 'Kirim Private' : 'Tebak!')}
                </button>
              </form>
            </div>
          )}
        </>
      )}
    </div>
  );
}