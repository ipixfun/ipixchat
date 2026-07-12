'use client';
import { useEffect, useState, useCallback, useRef } from 'react';
import { usePathname } from P;
import { supabase } from './supabaseClient';
import Login from '../components/Login';
import Block from '../components/Block';
import MessageItem from '../components/MessageItem';
import ChatLayout from '../components/ChatLayout';

export default function Home() {
  const pathname = usePathname();
  const [mounted, setMounted] = useState(false);
  const [msgs, setMsgs] = useState({ all: [] as any[], pub: [] as any[], priv: [] as any[] });
  const [auth, setAuth] = useState({ isAuth: false, isExist: false, user: '', adminEmail: '', adminPass: '' });
  const [ui, setUi] = useState({ tab: 'user' as 'user'|'admin', mode: 'public' as 'public'|'private', inputFocus: false });
  const [counts, setCounts] = useState({ pub: 0, priv: 0 });
  const [adminStat, setAdminStat] = useState({ online: false, offlineTime: '' });
  const [usersInfo, setUsersInfo] = useState({ status: {} as Record<string, any>, blockedList: [] as any[], privUsers: [] as any[], selPriv: null as string|null });
  const [censor, setCensor] = useState({ words: [] as string[], newWord: '' });
  const [input, setInput] = useState({ text: '', sending: false, blink: false });
  const [interact, setInteract] = useState({ replyTo: null as any, activeMenu: null as number|null, popup: null as any, swipeId: null as number|null, longPress: null as number|null });
  const [pill, setPill] = useState({ idx: 0 as 0|1, pause: false, visible: true, startX: 0, delta: 0 });
  
  const [currentHash, setCurrentHash] = useState('');
  const currentDeviceId = typeof window !== 'undefined' ? localStorage.getItem('device_id') : null;
  const [refresh, setRefresh] = useState({ pos: { x: 20, y: 100 }, drag: false, hover: false });
  const dragRef = useRef({ x: 0, y: 0, initX: 0, initY: 0, dragged: false });
  const refs = { refTimer: useRef<NodeJS.Timeout | null>(null) };

  useEffect(() => {
    if (typeof window !== 'undefined') {
      setCurrentHash(window.location.hash);
      const handleHashChange = () => setCurrentHash(window.location.hash);
      window.addEventListener('hashchange', handleHashChange);
      return () => window.removeEventListener('hashchange', handleHashChange);
    }
  }, []);

  useEffect(() => { if (typeof window !== 'undefined') setRefresh(p => ({ ...p, pos: { x: window.innerWidth - 80, y: window.innerHeight - 180 } })); }, []);

  const handleInteraction = useCallback((m: 'public' | 'private') => {
    setUi(p => ({ ...p, mode: m }));
  }, []);

  useEffect(() => { if (pill.pause) return; const i = setInterval(() => setPill(p => ({ ...p, idx: p.idx === 0 ? 1 : 0 })), 5000); return () => clearInterval(i); }, [pill.pause]);

  const hScroll = () => setInteract(p => ({ ...p, longPress: null, activeMenu: null }));
  const isCensored = (t: string) => censor.words.some(w => w.trim() && t.toLowerCase().includes(w.toLowerCase()));
  const applyCensor = (t: string) => { let r = t; censor.words.forEach(w => { if (w.trim()) r = r.replace(new RegExp(`\\b${w}\\b`, 'gi'), '***'); }); return r; };
  const copyTxt = (t: string, l: string) => { navigator.clipboard.writeText(t); alert(`${l} disalin!`); };
  const scrollMsg = (id: number) => { const el = document.getElementById(`msg-${id}`); if (el) { el.scrollIntoView({ behavior: 'smooth', block: 'center' }); const bc = ui.mode === 'private' ? 'anim-bg-blink-green' : 'anim-bg-blink-blue'; el.classList.add(bc); setTimeout(() => el.classList.remove(bc), 1500); } };
  const getFmt = { notif: (n: number) => n >= 1000 ? (n/1000).toFixed(1).replace('.0','')+'k' : n.toString(), time: (d: string) => new Date(d).toLocaleDateString('id-ID', { weekday: 'short', day: '2-digit', month: 'short', hour: '2-digit', minute: '2-digit' }).replace(',', ''), ago: (d: Date) => { const s = Math.floor((new Date().getTime() - d.getTime())/1000); return s/3600 >= 1 ? Math.floor(s/3600)+" jam lalu" : s/60 >= 1 ? Math.floor(s/60)+" menit lalu" : "baru saja"; }, greet: () => { const h = new Date().getHours(); return `Selamat ${h>=5&&h<12?"pagi":h>=12&&h<15?"siang":h>=15&&h<18?"sore":"malam"} `; } };

  const handleLogout = async () => { await supabase.auth.signOut(); sessionStorage.clear(); setAuth(p => ({ ...p, isAuth: false })); window.location.replace("/"); };
  
  const fetchData = useCallback(async () => {
    if (!currentDeviceId) return;
    try {
      const [{ data: bD }, { data: bW }, { data: pD }, { data: prD }] = await Promise.all([
        supabase.from('blocked_users').select('*'), 
        supabase.from('blocked_words').select('word'), 
        supabase.from('messages').select('*').eq('is_private', false).order('created_at', { ascending: true }),
        supabase.from('messages').select('*').eq('is_private', true).or(ui.tab === 'user' ? `device_id.eq.${currentDeviceId},private_with.eq.${currentDeviceId}` : usersInfo.selPriv ? `device_id.eq.${usersInfo.selPriv},private_with.eq.${usersInfo.selPriv}` : 'device_id.eq.none').order('created_at', { ascending: true })
      ]);
      
      if (bW) setCensor(p => ({ ...p, words: bW.map(w => w.word) }));
      
      if (auth.isAuth) {
        const [{ count: pubC }, { count: privC }] = await Promise.all([supabase.from('messages').select('*', { count: 'exact', head: true }).eq('is_private', false), supabase.from('messages').select('*', { count: 'exact', head: true }).eq('is_private', true).or(ui.tab === 'user' ? `device_id.eq.${currentDeviceId},private_with.eq.${currentDeviceId}` : `id.gt.0`)]);
        setCounts({ pub: pubC || 0, priv: privC || 0 });
      }
      
      if (bD?.some(b => b.device_id === currentDeviceId)) return window.location.replace("https://ipix.my.id/chat");
      
      const vPub = pD?.filter(m => !bD?.map(b => b.device_id).includes(m.device_id)) || [];
      const vPriv = prD?.filter(m => !bD?.map(b => b.device_id).includes(m.device_id)) || [];
      setMsgs({ all: [...vPub, ...vPriv], pub: vPub, priv: vPriv });
      
      const lAdmin = [...vPub, ...vPriv].filter(m => m.username === 'Admin●ipix.my.id').pop();
      if (lAdmin) setAdminStat({ online: Date.now() - new Date(lAdmin.created_at).getTime() < 300000, offlineTime: getFmt.ago(new Date(lAdmin.created_at)) });
      
      const sMap: Record<string, any> = {};
      [...vPub, ...vPriv].forEach(m => { if(m.username !== 'Admin●ipix.my.id') sMap[m.username] = { online: Date.now() - new Date(m.created_at).getTime() < 300000, offlineTime: getFmt.ago(new Date(m.created_at)) }; });
      
      setUsersInfo(p => ({ ...p, status: sMap, blockedList: bD || [] }));
      
      if (ui.tab === 'admin' && !usersInfo.selPriv) {
        const { data: aP } = await supabase.from('messages').select('device_id, username, created_at').eq('is_private', true).order('created_at', { ascending: false });
        if (aP) {
          const uMap = new Map(); const c: Record<string, number> = {};
          aP.forEach(m => { if (m.username !== 'Admin●ipix.my.id' && m.device_id !== currentDeviceId) c[m.device_id] = (c[m.device_id] || 0) + 1; });
          aP.forEach(m => { if (m.username !== 'Admin●ipix.my.id' && m.device_id !== currentDeviceId && !uMap.has(m.device_id)) uMap.set(m.device_id, { ...m, last_active: m.created_at, count: c[m.device_id] || 0 }); });
          setUsersInfo(p => ({ ...p, privUsers: Array.from(uMap.values()) }));
        }
      }
    } catch (e) {}
  }, [ui.tab, usersInfo.selPriv, currentDeviceId, auth.isAuth]);

  useEffect(() => {
    if (!localStorage.getItem('device_id')) localStorage.setItem('device_id', Math.random().toString(36).substring(2, 15));
    const chk = async () => {
      const cid = localStorage.getItem('device_id')!;
      const { data: { session } } = await supabase.auth.getSession();
      const { data: pD } = await supabase.from('profiles').select('username').eq('device_id', cid).single();
      if (pD?.username) { setAuth(p => ({ ...p, isExist: true, user: pD.username })); sessionStorage.setItem('saved_username', pD.username); }
      const isAdmin = pathname.endsWith('/admin') || window.location.hash === '#admin';
      setUi(p => ({ ...p, tab: isAdmin ? 'admin' : (sessionStorage.getItem('active_tab') as 'user'|'admin' || 'user') }));
      if (session || sessionStorage.getItem('is_auth') === 'true') {
        setAuth(p => ({ ...p, isAuth: true, user: session ? 'Admin●ipix.my.id' : (p.isExist ? p.user : sessionStorage.getItem('saved_username') || '') }));
        if (session) setUi(p => ({ ...p, tab: 'admin' }));
      }
      setMounted(true);
    }; chk();
  }, [pathname]);

  // Realtime Update Data
  useEffect(() => {
    if (mounted) {
      fetchData();
      const messageSubscription = supabase.channel('public:messages').on('postgres_changes', { event: '*', schema: 'public', table: 'messages' }, (payload) => { fetchData(); }).subscribe();
      return () => { supabase.removeChannel(messageSubscription); };
    }
  }, [mounted, fetchData]);

  const sendMsg = async (e: React.FormEvent) => {
    e.preventDefault(); 
    if (!input.text.trim() || input.sending) return; 
    
    if (isCensored(input.text)) {
      alert("Pesan gagal dikirim karena mengandung kata terlarang!");
      return;
    }
    
    setInput(p => ({ ...p, sending: true }));
    let txt = interact.replyTo ? `@${interact.replyTo.username.split('●')[0]} ("${interact.replyTo.pesan.substring(0,30)}...") ${input.text.trim()}` : input.text.trim();
    
    if (auth.user !== 'Admin●ipix.my.id') {
      const { count } = await supabase.from('messages').select('*', { count: 'exact', head: true }).eq('device_id', currentDeviceId || 'guest').gte('created_at', new Date(Date.now() - 300000).toISOString());
      if (count && count >= 5) { alert("Batas 5 pesan per 5 menit."); setInput(p => ({ ...p, sending: false })); return; }
    }
    await supabase.from('messages').insert([{ username: auth.user, pesan: txt, device_id: currentDeviceId || 'guest', is_private: ui.mode === 'private', private_with: ui.mode === 'private' ? (ui.tab === 'user' ? 'admin' : usersInfo.selPriv) : null, user_browser: navigator.userAgent }]);
    setInput({ text: '', sending: false, blink: false }); setInteract(p => ({ ...p, replyTo: null })); setUi(p => ({ ...p, inputFocus: false })); const t = document.getElementById('chat-input'); if(t) t.style.height = 'auto'; fetchData();
  };

  const dbActions = {
    editLmt: async (m: any) => { const c = parseInt(localStorage.getItem(`edit_${m.id}`) || '0'); if(c>=2) return alert("Batas 2x"); const nt = prompt("Edit:", m.pesan); if(nt && nt.trim() !== m.pesan) { await supabase.from('messages').update({ pesan: nt.trim() }).eq('id', m.id); localStorage.setItem(`edit_${m.id}`, (c+1).toString()); fetchData(); } },
    editMsg: async (id: number) => { const nt = prompt("Edit:", msgs.all.find(m => m.id === id)?.pesan || ""); if(nt) { await supabase.from('messages').update({ pesan: nt }).eq('id', id); fetchData(); } },
    editNm: async (id: number) => { const m = msgs.all.find(m => m.id === id); if(!m) return; const nn = prompt("Nama:", m.username); if(nn && isCensored(nn)) return alert("Terlarang!"); if(nn) { await Promise.all([supabase.from('profiles').update({ username: nn }).eq('device_id', m.device_id), supabase.from('messages').update({ username: nn }).eq('device_id', m.device_id)]); fetchData(); } },
    delMsg: async (id: number) => { await supabase.from('messages').delete().eq('id', id); fetchData(); },
    blkUser: async (id: string, nm: string) => { if(confirm("Blokir?")) { await supabase.from('blocked_users').insert([{ device_id: id, username: nm }]); fetchData(); } },
    addWrd: async () => { if(censor.newWord.trim()) { await supabase.from('blocked_words').insert([{ word: censor.newWord.trim().toLowerCase() }]); setCensor(p => ({ ...p, newWord: '' })); fetchData(); } },
    rmWrd: async (w: string) => { await supabase.from('blocked_words').delete().eq('word', w); fetchData(); }
  };

  const hRefreshMove = useCallback((cx: number, cy: number) => {
    if (!refresh.drag) return; const dx = cx - dragRef.current.x; const dy = cy - dragRef.current.y;
    if (Math.abs(dx) > 5 || Math.abs(dy) > 5) dragRef.current.dragged = true;
    setRefresh(p => ({ ...p, pos: { x: Math.max(0, Math.min(dragRef.current.initX + dx, window.innerWidth - 60)), y: Math.max(0, Math.min(dragRef.current.initY + dy, window.innerHeight - 60)) } }));
  }, [refresh.drag]);
  const hRefreshEnd = useCallback(() => { if (refresh.drag) { setRefresh(p => ({ ...p, drag: false })); if(refs.refTimer.current) clearTimeout(refs.refTimer.current); refs.refTimer.current = setTimeout(() => setRefresh(p => ({ ...p, hover: false })), 2000); if (!dragRef.current.dragged) fetchData(); } }, [refresh.drag, fetchData]);
  useEffect(() => { const tm=(e: TouchEvent)=>hRefreshMove(e.touches[0].clientX, e.touches[0].clientY); const mm=(e: MouseEvent)=>hRefreshMove(e.clientX, e.clientY); if(refresh.drag){ window.addEventListener('touchmove', tm, {passive:false}); window.addEventListener('mousemove', mm); window.addEventListener('touchend', hRefreshEnd); window.addEventListener('mouseup', hRefreshEnd); } return () => { window.removeEventListener('touchmove', tm); window.removeEventListener('mousemove', mm); window.removeEventListener('touchend', hRefreshEnd); window.removeEventListener('mouseup', hRefreshEnd); }; }, [refresh.drag, hRefreshMove, hRefreshEnd]);

  const renderMsgs = (arr: any[], colType: any) => arr.length === 0 ? <div className="text-center text-white/70 italic mt-10 text-[10px]">Belum ada pesan.</div> : arr.map((m, idx) => {
    const isTruncated = m.pesan.length > 150;
    const modifiedMsg = isTruncated ? { ...m, pesan: m.pesan.substring(0, 150) + '... \n\n[Klik untuk selengkapnya]' } : m;

    return (
      <div 
        key={m.id} 
        className={`relative w-full group cursor-pointer`} 
        onClick={() => { setInteract(p => ({...p, popup: m})) }}
      >
        <MessageItem index={idx} m={modifiedMsg} colType={colType} isMinimized={true} currentDeviceId={currentDeviceId} activeTab={ui.tab} isAdminOnline={adminStat.online} adminOfflineTime={adminStat.offlineTime} userStatus={usersInfo.status} activeMenuId={interact.activeMenu} setActiveMenuId={(id:any)=>setInteract(p=>({...p,activeMenu:id}))} longPressId={interact.longPress} setLongPressId={(id:any)=>setInteract(p=>({...p,longPress:id}))} swipingId={interact.swipeId} setSwipingId={(id:any)=>setInteract(p=>({...p,swipeId:id}))} handleTag={(u:string)=>setInput(p=>({...p,text:`${p.text} @${u.split('●')[0]} `}))} handleReply={(m:any)=>{setInteract(p=>({...p,replyTo:m})); setInput(p=>({...p,blink:true})); setTimeout(()=>setInput(p=>({...p,blink:false})),800);}} deleteMsg={dbActions.delMsg} copyToClipboard={copyTxt} handleEditLimit={dbActions.editLmt} editMsg={dbActions.editMsg} editNama={dbActions.editNm} blockUser={dbActions.blkUser} inviteToPrivate={(id:string)=>{handleInteraction('private'); setUsersInfo(p=>({...p,selPriv:id}));}} setPopupMsg={(m:any)=>setInteract(p=>({...p,popup:m}))} applyCensor={applyCensor} scrollToMessage={(t:string)=>{const x=msgs.all.find(x=>x.pesan.includes(t)); if(x) scrollMsg(x.id);}} formatMessageTime={getFmt.time} />
      </div>
    );
  });

  if (!mounted) return <div className="h-screen flex items-center justify-center bg-gray-900 text-white">Memuat...</div>;
  return (
    <div className="w-full max-w-2xl mx-auto h-dvh flex flex-col bg-gray-100 shadow-xl overflow-hidden font-sans overscroll-none" onClick={() => setInteract(p => ({ ...p, activeMenu: null, longPress: null }))}>
      <style dangerouslySetInnerHTML={{ __html: ` body{overscroll-behavior-y:none;} @keyframes sL{0%,100%{transform:translateX(0);opacity:0.6;}50%{transform:translateX(-4px);opacity:1;}} @keyframes sR{0%,100%{transform:translateX(0);opacity:0.6;}50%{transform:translateX(4px);opacity:1;}} .anim-slide-left{animation:sL 1.4s ease-in-out infinite;} .anim-slide-right{animation:sR 1.4s ease-in-out infinite;} @keyframes bB{0%,100%{background:#fff;}50%{background:#e0f2fe;}} @keyframes bG{0%,100%{background:#fff;}50%{background:#d1fae5;}} .anim-bg-blink-blue{animation:bB 1.5s ease-in-out;} .anim-bg-blink-green{animation:bG 1.5s ease-in-out;} @keyframes tW{0%,100%{color:#fff;text-shadow:0 0 5px rgba(255,255,255,0.8);}50%{color:rgba(255,255,255,0.6);text-shadow:none;}} .anim-text-blink-white{animation:tW 1.5s ease-in-out infinite;} @keyframes dL{0%{top:-50%;opacity:0;}15%,85%{opacity:1;}100%{top:100%;opacity:0;}} .animate-drop-line{animation:dL 2.5s cubic-bezier(0.4,0,0.2,1) infinite;} `}} />
      
      {auth.isAuth && currentHash !== '#block' && <div onMouseDown={e => { setRefresh(p => ({ ...p, drag: true, hover: true })); dragRef.current = { x: e.clientX, y: e.clientY, initX: refresh.pos.x, initY: refresh.pos.y, dragged: false }; }} onTouchStart={e => { setRefresh(p => ({ ...p, drag: true, hover: true })); dragRef.current = { x: e.touches[0].clientX, y: e.touches[0].clientY, initX: refresh.pos.x, initY: refresh.pos.y, dragged: false }; }} className={`fixed z-[100] px-2.5 py-1 rounded-full font-black text-black tracking-widest text-[9px] cursor-pointer select-none transition-opacity duration-500 bg-yellow-400 border border-yellow-500 ${refresh.hover || refresh.drag ? 'opacity-100 shadow-[0_3px_0_#a16207,0_6px_10px_rgba(0,0,0,0.4)]' : 'opacity-40 shadow-[0_2px_0_#a16207]'} backdrop-blur-sm`} style={{ left: refresh.pos.x, top: refresh.pos.y, touchAction: 'none' }}>REFRESH</div>}

      {/* FIX: Shortcut Pill Khusus Admin untuk Buka Tab Manajemen Block */}
      {auth.isAuth && ui.tab === 'admin' && currentHash !== '#block' && (
        <div 
          onClick={() => window.open(`${window.location.pathname}#block`, '_blank')} 
          className="fixed z-[100] bottom-28 right-4 px-3 py-1.5 rounded-full font-black text-white tracking-widest text-[9px] cursor-pointer select-none bg-red-600 border border-red-700 shadow-[0_3px_0_#991b1b,0_6px_10px_rgba(0,0,0,0.3)] active:translate-y-[3px] active:shadow-none transition-all duration-150"
        >
          BLOCK MGR
        </div>
      )}

      {!auth.isAuth ? <Login activeTab={ui.tab} username={auth.user} setUsername={(u:string)=>setAuth(p=>({...p,user:u}))} isExistingUser={auth.isExist} adminEmail={auth.adminEmail} setAdminEmail={(e:string)=>setAuth(p=>({...p,adminEmail:e}))} adminPass={auth.adminPass} setAdminPass={(ps:string)=>setAuth(p=>({...p,adminPass:ps}))} 
        handleUserLogin={async () => { 
          if(!auth.user.trim() || isCensored(auth.user)) return alert("Nama tidak valid"); 
          try { 
            const { data: existUser } = await supabase.from('profiles').select('device_id').ilike('username', auth.user.trim()).maybeSingle();
            if (existUser && existUser.device_id !== (currentDeviceId || 'guest')) {
               return alert("Username sudah digunakan orang lain.");
            }
            await supabase.from('profiles').upsert({ device_id: currentDeviceId||'guest', username: auth.user.trim(), user_browser: navigator.userAgent }, { onConflict: 'device_id' }); 
          } catch(e) {} 
          setAuth(p=>({...p,isAuth:true})); sessionStorage.setItem('is_auth','true'); sessionStorage.setItem('saved_username',auth.user.trim()); sessionStorage.setItem('active_tab','user'); 
        }} 
        handleAdminLogin={async () => { const { error } = await supabase.auth.signInWithPassword({ email: auth.adminEmail, password: auth.adminPass }); if (error) alert("Gagal"); else { setAuth(p=>({...p,isAuth:true,user:'Admin●ipix.my.id'})); setUi(p=>({...p,tab:'admin'})); sessionStorage.setItem('is_auth','true'); sessionStorage.setItem('saved_username','Admin●ipix.my.id'); sessionStorage.setItem('active_tab','admin'); } }} /> : (
        <>
          {currentHash !== '#block' && (
            <div className={`sticky top-0 z-20 p-3 border-b border-white/40 ${ui.mode === 'public' ? 'bg-gradient-to-b from-blue-100 to-white' : 'bg-gradient-to-b from-emerald-100 to-white'}`}>
              <button onClick={handleLogout} className="absolute top-4 right-4 text-[10px] bg-red-500 text-white px-3 py-1 rounded-full shadow">Keluar</button>
              <div className="flex justify-between items-center">
                <div className="flex flex-col max-w-[65%]"><span className="text-[10px] text-gray-800 uppercase tracking-wider">{getFmt.greet()}</span>
                  <div className="flex items-center gap-1.5 flex-wrap"><span className="text-[11px] font-bold text-blue-800">{auth.user}</span>{ui.tab === 'admin' && <span className="text-[9px] bg-gray-200 text-gray-600 px-1.5 py-0.5 rounded font-mono break-all leading-tight">ID: {currentDeviceId}</span>}</div>
                </div>
                <div className="text-center flex-1 flex flex-col items-end mr-16"><a href="https://ipix.my.id" target="_blank" className="text-emerald-600 font-bold text-sm underline">ipix.my.id</a>{ui.tab === 'user' && <div className="text-[10px] text-gray-500 mt-0.5"><span className={`inline-block w-2 h-2 rounded-full ${adminStat.online ? 'bg-green-500' : 'bg-gray-400'}`}></span>{adminStat.online ? ' Admin Online' : ` Offline • ${adminStat.offlineTime}`}</div>}</div>
              </div>
              <div className="flex mt-3 bg-white border border-gray-200 rounded-full p-1 shadow-sm w-full relative">
                <button onClick={() => { handleInteraction('public'); setUsersInfo(p=>({...p,selPriv:null})); setInteract(p=>({...p,replyTo:null})); }} className={`relative flex-1 py-2 sm:py-2.5 text-xs sm:text-sm font-semibold rounded-full flex items-center justify-center gap-2 ${ui.mode === 'public' ? 'bg-blue-600 text-white shadow' : 'bg-transparent text-gray-700 hover:bg-gray-100'}`}><div className="absolute left-1.5 top-1/2 -translate-y-1/2 w-5 sm:w-6 h-5 sm:h-6 flex items-center justify-center"><span className={`${ui.mode === 'public' ? 'bg-white text-blue-600' : 'bg-blue-600 text-white'} text-[9px] sm:text-[10px] font-bold w-full h-full flex items-center justify-center rounded-full shadow-sm`}>{getFmt.notif(counts.pub)}</span></div><span className="ml-2 sm:ml-4">🌐 Public Chat</span></button>
                <button onClick={() => { handleInteraction('private'); setUsersInfo(p=>({...p,selPriv:null})); setInteract(p=>({...p,replyTo:null})); }} className={`relative flex-1 py-2 sm:py-2.5 text-xs sm:text-sm font-semibold rounded-full flex items-center justify-center gap-2 ${ui.mode === 'private' ? 'bg-emerald-600 text-white shadow' : 'bg-transparent text-gray-700 hover:bg-gray-100'}`}><span className="mr-2 sm:mr-4">🔒 Chat private</span><div className="absolute right-1.5 top-1/2 -translate-y-1/2 w-5 sm:w-6 h-5 sm:h-6 flex items-center justify-center"><span className={`${ui.mode === 'private' ? 'bg-white text-emerald-600' : 'bg-emerald-600 text-white'} text-[9px] sm:text-[10px] font-bold w-full h-full flex items-center justify-center rounded-full shadow-sm`}>{getFmt.notif(counts.priv)}</span></div></button>
              </div>
            </div>
          )}
          
          <div className="flex-1 w-full relative bg-gray-50 flex overflow-hidden">
            {ui.tab === 'admin' && currentHash === '#block' ? <Block blockedList={usersInfo.blockedList} unblock={async (id: string)=>{await supabase.from('blocked_users').delete().eq('device_id', id); fetchData();}} blockedWords={censor.words} newBadWord={censor.newWord} setNewBadWord={(w:string)=>setCensor(p=>({...p,newWord:w}))} addBlockedWord={dbActions.addWrd} removeBlockedWord={dbActions.rmWrd} formatMessageTime={getFmt.time} /> : (
              <ChatLayout cMode={ui.mode} hInteract={handleInteraction} hScroll={hScroll} aTab={ui.tab} selPrivUser={usersInfo.selPriv} pUsers={usersInfo.privUsers} pubMsgs={msgs.pub} privMsgs={msgs.priv} isPill={pill.visible} pDelta={pill.delta} pTouchX={pill.startX} capIdx={pill.idx} setPTouchX={(x:number)=>setPill(p=>({...p,startX:x}))} setPDelta={(d:number)=>setPill(p=>({...p,delta:d}))} setCapPause={(v:boolean)=>setPill(p=>({...p,pause:v}))} setIsPill={(v:boolean)=>setPill(p=>({...p,visible:v}))} renderMsgs={renderMsgs} fmtTime={getFmt.time} setSelPriv={(u:string)=>setUsersInfo(p=>({...p,selPriv:u}))} />
            )}
          </div>
          
          {currentHash !== '#block' && (
            <div className="bg-white sticky bottom-0 z-20 w-full flex flex-col shadow-[0_-4px_6px_-1px_rgba(0,0,0,0.05)]">
              {interact.replyTo && <div className={`mx-3 mt-1.5 p-2 px-3 rounded-t-xl text-xs flex justify-between items-center border-t border-x cursor-pointer ${ui.mode === 'private' ? 'bg-emerald-50 border-emerald-300 text-emerald-900' : 'bg-blue-50 border-blue-300 text-blue-900'}`} onClick={() => scrollMsg(interact.replyTo.id)}><div className="truncate flex-1 pr-2"><span className="font-bold">Balas @{interact.replyTo.username.split('●')[0]}:</span> <span className="italic">"{interact.replyTo.pesan}"</span></div><button onClick={(e)=>{e.stopPropagation();setInteract(p=>({...p,replyTo:null}));}} className="text-gray-400 font-bold px-1">×</button></div>}
              
              <form onSubmit={sendMsg} className="p-2 sm:p-3 bg-white border-t border-gray-100 flex gap-2 items-end w-full relative transition-all duration-300">
                <div className="relative flex-1 flex flex-col justify-end transition-all duration-300">
                  <div className="text-[9px] text-gray-400 mb-1 px-1">
                    {ui.mode === 'public' ? 'Chat publik mohon bijak' : (ui.tab === 'admin' && !usersInfo.selPriv ? 'Pilih obrolan di atas terlebih dahulu' : 'Chat private admin')}
                  </div>
                  
                  <textarea 
                    id="chat-input" 
                    onFocus={()=>setUi(p=>({...p,inputFocus:true}))} 
                    onBlur={()=>setUi(p=>({...p,inputFocus:false}))} 
                    className={`w-full border p-1.5 sm:p-2 rounded-xl px-3 sm:px-4 pb-5 sm:pb-6 text-sm text-black resize-none focus:outline-none min-h-[32px] sm:min-h-[38px] max-h-[100px] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden ${ui.mode === 'private' ? input.blink ? 'bg-emerald-600/30 border-emerald-500 ring-2 ring-emerald-400' : 'bg-emerald-600/10 border-emerald-500/20 focus:border-emerald-500 focus:bg-emerald-600/15' : input.blink ? 'bg-blue-600/30 border-blue-500 ring-2 ring-blue-400' : 'bg-blue-600/10 border-blue-500/20 focus:border-blue-500 focus:bg-blue-600/15'} ${(ui.tab === 'admin' && ui.mode === 'private' && !usersInfo.selPriv) ? 'opacity-50 cursor-not-allowed bg-gray-200' : ''}`} 
                    value={input.text} 
                    onChange={e=>{setInput(p=>({...p,text:e.target.value})); e.target.style.height='auto'; e.target.style.height=`${Math.min(e.target.scrollHeight,100)}px`;}} 
                    onKeyDown={e=>{if(e.key==='Enter'&&!e.shiftKey){e.preventDefault();sendMsg(e as any);}}} 
                    placeholder={(ui.tab === 'admin' && ui.mode === 'private' && !usersInfo.selPriv) ? "Pilih user terlebih dahulu..." : "Ketik pesan..."} 
                    maxLength={200} 
                    rows={1} 
                    disabled={input.sending || (ui.tab === 'admin' && ui.mode === 'private' && !usersInfo.selPriv)} 
                  />
                  
                  <div className="absolute right-3 bottom-1.5 text-[9px] text-gray-400 font-mono select-none opacity-80 bg-white/40 px-1 rounded">{200 - input.text.length}</div>
                </div>
                
                <div className="relative shrink-0 flex flex-col justify-end w-[95px] md:w-[130px] h-[32px] sm:h-[38px]">
                  <button 
                    type="submit" 
                    disabled={input.sending || !input.text.trim() || (ui.tab === 'admin' && ui.mode === 'private' && !usersInfo.selPriv)} 
                    className={`w-full h-[32px] sm:h-[38px] rounded-xl font-bold text-[10px] sm:text-xs active:scale-95 disabled:opacity-50 flex items-center justify-center shadow-sm ${(ui.tab === 'admin' && ui.mode === 'private' && !usersInfo.selPriv) ? 'bg-gray-400 text-white cursor-not-allowed' : (ui.mode === 'private' ? 'bg-emerald-600 text-white' : 'bg-blue-600 text-white')}`}
                  >
                    {input.sending ? '...' : (ui.mode === 'private' ? 'Kirim Private' : 'Kirim Publik')}
                  </button>
                </div>
              </form>
            </div>
          )}
          {interact.popup && (
            <div className="fixed inset-0 z-[200] bg-black/60 flex items-center justify-center p-4 backdrop-blur-sm" onClick={()=>setInteract(p=>({...p,popup:null}))}>
              <div className={`w-full max-w-lg bg-white rounded-2xl shadow-2xl p-5 relative max-h-[85vh] flex flex-col ${interact.popup.is_private ? 'border-t-4 border-emerald-500' : 'border-t-4 border-blue-500'}`} onClick={e=>e.stopPropagation()}>
                <button onClick={()=>setInteract(p=>({...p,popup:null}))} className="absolute top-3 right-3 text-gray-400 bg-gray-100 rounded-full w-8 h-8 flex items-center justify-center font-bold active:scale-95">×</button>
                <div className="flex items-center gap-2 border-b pb-3 mb-3">
                  <span className={`px-2 py-1 rounded-full text-white text-xs font-bold shadow-sm ${interact.popup.username === 'Admin●ipix.my.id' ? 'bg-red-500' : interact.popup.is_private ? 'bg-emerald-500' : 'bg-blue-500'}`}>{interact.popup.username}</span>
                  <span className="text-[10px] text-gray-400">{getFmt.time(interact.popup.created_at)}</span>
                </div>
                <div className="overflow-y-auto pr-2 pb-2 text-sm text-black flex flex-col break-words break-all whitespace-pre-wrap">
                  {applyCensor(interact.popup.pesan)}
                </div>
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
}