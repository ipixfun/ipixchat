'use client';
import { useEffect, useState, useCallback } from 'react';
import { usePathname } from 'next/navigation';
import { supabase } from './supabaseClient';
import Login from '../components/Login';
import Block from '../components/Block';
import ChatLayout from '../components/ChatLayout';
import MessageList from '../components/MessageItem'; // Jalur Impor Diperbaiki ke folder components

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
  
  const [input, setInput] = useState({ text: '', sending: false, blink: false, image: null as string|null, uploadingImage: false });
  const [interact, setInteract] = useState({ replyTo: null as any }); 
  const [pill, setPill] = useState({ idx: 0 as 0|1, pause: false, visible: true, startX: 0, delta: 0 });
  
  const [currentHash, setCurrentHash] = useState('');
  const currentDeviceId = typeof window !== 'undefined' ? localStorage.getItem('device_id') : null;
  const [refresh, setRefresh] = useState({ pos: { x: 20, y: 100 }, drag: false, hover: false });
  const [dragMsg, setDragMsg] = useState({ active: false, msg: null as any, x: 0, y: 0 });

  const CLOUDINARY_CLOUD_NAME = 'bjamo8ld';
  const CLOUDINARY_UPLOAD_PRESET = 'ipixchat'; 

  useEffect(() => {
    if (typeof window !== 'undefined') {
      setCurrentHash(window.location.hash);
      const handleHashChange = () => setCurrentHash(window.location.hash);
      window.addEventListener('hashchange', handleHashChange);
      return () => window.removeEventListener('hashchange', handleHashChange);
    }
  }, []);

  useEffect(() => { if (typeof window !== 'undefined') setRefresh(p => ({ ...p, pos: { x: window.innerWidth - 80, y: window.innerHeight - 180 } })); }, []);

  const handleInteraction = useCallback((m: 'public' | 'private') => { setUi(p => ({ ...p, mode: m })); }, []);

  useEffect(() => { if (pill.pause) return; const i = setInterval(() => setPill(p => ({ ...p, idx: p.idx === 0 ? 1 : 0 })), 5000); return () => clearInterval(i); }, [pill.pause]);

  const hScroll = () => setInteract(p => ({ ...p, replyTo: null }));
  const isCensored = (t: string) => censor.words.some(w => w.trim() && t.toLowerCase().includes(w.toLowerCase()));
  
  const getFmt = { 
    notif: (n: number) => n >= 1000 ? (n/1000).toFixed(1).replace('.0','')+'k' : n.toString(), 
    time: (d: string) => new Date(d).toLocaleDateString('id-ID', { weekday: 'short', day: '2-digit', month: 'short', hour: '2-digit', minute: '2-digit' }).replace(',', ''), 
    ago: (d: Date) => { const s = Math.floor((new Date().getTime() - d.getTime())/1000); return s/3600 >= 1 ? Math.floor(s/3600)+" jam lalu" : s/60 >= 1 ? Math.floor(s/60)+" menit lalu" : "baru saja"; }, 
    greet: () => { const h = new Date().getHours(); return `Selamat ${h>=5&&h<12?"pagi":h>=12&&h<15?"siang":h>=15&&h<18?"sore":"malam"} `; } 
  };

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
      const isAdmin = pathname?.endsWith('/admin') || window.location.hash === '#admin';
      setUi(p => ({ ...p, tab: isAdmin ? 'admin' : (sessionStorage.getItem('active_tab') as 'user'|'admin' || 'user') }));
      if (session || sessionStorage.getItem('is_auth') === 'true') {
        setAuth(p => ({ ...p, isAuth: true, user: session ? 'Admin●ipix.my.id' : (p.isExist ? p.user : sessionStorage.getItem('saved_username') || '') }));
        if (session) setUi(p => ({ ...p, tab: 'admin' }));
      }
      setMounted(true);
    }; 
    chk(); 
  }, [pathname]);

  useEffect(() => {
    if (mounted) {
      fetchData();
      const messageSubscription = supabase.channel('public:messages').on('postgres_changes', { event: '*', schema: 'public', table: 'messages' }, () => { fetchData(); }).subscribe();
      return () => { supabase.removeChannel(messageSubscription); };
    }
  }, [mounted, fetchData]);

  useEffect(() => {
    const handleGlobalMove = (e: TouchEvent | MouseEvent) => {
      if (!dragMsg.active) return;
      e.preventDefault(); 
      const clientX = 'touches' in e ? e.touches[0].clientX : (e as MouseEvent).clientX;
      const clientY = 'touches' in e ? e.touches[0].clientY : (e as MouseEvent).clientY;
      setDragMsg(p => ({ ...p, x: clientX, y: clientY }));
    };

    const handleGlobalUp = async (e: TouchEvent | MouseEvent) => {
      if (!dragMsg.active) return;
      const clientX = 'changedTouches' in e ? e.changedTouches[0].clientX : (e as MouseEvent).clientX;
      const clientY = 'changedTouches' in e ? e.changedTouches[0].clientY : (e as MouseEvent).clientY;
      const el = document.elementFromPoint(clientX, clientY);
      
      if (el && (el.id === 'btn-refresh-delete' || el.closest('#btn-refresh-delete'))) {
        const targetMsg = dragMsg.msg;
        if (ui.tab === 'admin' || ((targetMsg.device_id === currentDeviceId || targetMsg.username === auth.user) && (Date.now() - new Date(targetMsg.created_at).getTime() < 24 * 60 * 60 * 1000))) {
          if (confirm("Hapus pesan ini lewat drag drop?")) {
            if (ui.tab === 'admin') await supabase.from('messages').delete().eq('id', targetMsg.id);
            else await supabase.from('messages').update({ pesan: '___DELETED___', image_url: null }).eq('id', targetMsg.id);
            fetchData();
          }
        } else { alert("Akses ditolak / pesan sudah lebih dari 24 jam."); }
      } else if (el && (el.id === 'chat-input' || el.closest('form'))) {
        setInteract({ replyTo: dragMsg.msg });
        setInput(p => ({ ...p, blink: true }));
        setTimeout(() => setInput(p => ({ ...p, blink: false })), 800);
      }
      setDragMsg({ active: false, msg: null, x: 0, y: 0 });
    };

    if (dragMsg.active) {
      window.addEventListener('touchmove', handleGlobalMove, { passive: false });
      window.addEventListener('touchend', handleGlobalUp);
      window.addEventListener('mousemove', handleGlobalMove);
      window.addEventListener('mouseup', handleGlobalUp);
    }
    return () => {
      window.removeEventListener('touchmove', handleGlobalMove);
      window.removeEventListener('touchend', handleGlobalUp);
      window.removeEventListener('mousemove', handleGlobalMove);
      window.removeEventListener('mouseup', handleGlobalUp);
    };
  }, [dragMsg.active, dragMsg.msg, currentDeviceId, auth.user, ui.tab, fetchData]);

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (file.size > 5 * 1024 * 1024) return alert("Ukuran gambar maksimal 5MB!");
    if (auth.user !== 'Admin●ipix.my.id') {
       const lastUploadStr = localStorage.getItem('last_img_upload_time');
       if (lastUploadStr && Date.now() - parseInt(lastUploadStr) < 300000) return alert("Batas unggah 1 gambar tiap 5 menit.");
    }

    setInput(p => ({ ...p, uploadingImage: true }));
    const formData = new FormData();
    formData.append('file', file);
    formData.append('upload_preset', CLOUDINARY_UPLOAD_PRESET);
    
    try {
      const res = await fetch(`https://api.cloudinary.com/v1_1/${CLOUDINARY_CLOUD_NAME}/image/upload`, { method: 'POST', body: formData });
      const data = await res.json();
      if (data.secure_url) {
        setInput(p => ({ ...p, image: data.secure_url, uploadingImage: false }));
        localStorage.setItem('last_img_upload_time', Date.now().toString());
      } else { throw new Error(); }
    } catch {
      alert("Gagal mengunggah gambar.");
      setInput(p => ({ ...p, uploadingImage: false }));
    }
  };

  const sendMsg = async (e: React.FormEvent) => {
    e.preventDefault(); 
    if (!input.text.trim() || input.sending) return; 
    if (isCensored(input.text)) return alert("Mengandungi kata terlarang!");
    
    setInput(p => ({ ...p, sending: true }));
    let txt = interact.replyTo ? `@${interact.replyTo.username.split('●')[0]} ("${interact.replyTo.pesan.substring(0,30)}...") ${input.text.trim()}` : input.text.trim();
    
    if (auth.user !== 'Admin●ipix.my.id') {
      const { count } = await supabase.from('messages').select('*', { count: 'exact', head: true }).eq('device_id', currentDeviceId || 'guest').gte('created_at', new Date(Date.now() - 300000).toISOString());
      if (count && count >= 5) { alert("Batas 5 pesan per 5 menit."); setInput(p => ({ ...p, sending: false })); return; }
    }
    
    await supabase.from('messages').insert([{ 
      username: auth.user, pesan: txt, image_url: input.image, device_id: currentDeviceId || 'guest', 
      is_private: ui.mode === 'private', private_with: ui.mode === 'private' ? (ui.tab === 'user' ? 'admin' : usersInfo.selPriv) : null, user_browser: navigator.userAgent 
    }]);
    
    setInput({ text: '', sending: false, blink: false, image: null, uploadingImage: false }); 
    setInteract({ replyTo: null }); 
    setUi(p => ({ ...p, inputFocus: false })); 
    const t = document.getElementById('chat-input'); if(t) t.style.height = 'auto'; 
    fetchData();
  };

  const hasInputReady = input.text.trim().length > 0 || input.image !== null;

  const renderMsgs = (arr: any[], colType: 'public' | 'private') => (
    <MessageList 
      arr={arr}
      allMessages={msgs.all}
      colType={colType}
      uiTab={ui.tab}
      currentDeviceId={currentDeviceId}
      authUser={auth.user}
      adminOnline={adminStat.online}
      adminOfflineTime={adminStat.offlineTime}
      userStatus={usersInfo.status}
      censorWords={censor.words}
      fetchData={fetchData}
      setReplyTo={(m: any) => setInteract({ replyTo: m })}
      setInputBlink={(b: boolean) => setInput(p => ({ ...p, blink: b }))}
      handleInteraction={handleInteraction}
      setSelPriv={(id: string) => setUsersInfo(p => ({ ...p, selPriv: id }))}
      startDrag={(msg: any, x: number, y: number) => setDragMsg({ active: true, msg, x, y })}
      fmtTime={getFmt.time}
    />
  );

  if (!mounted) return <div className="h-screen flex items-center justify-center bg-gray-900 text-white">Memuat...</div>;
  
  return (
    <div className="w-full max-w-2xl mx-auto h-dvh flex flex-col bg-gray-100 shadow-xl overflow-hidden font-sans overscroll-none">
      <style dangerouslySetInnerHTML={{ __html: ` body{overscroll-behavior-y:none;} @keyframes sL{0%,100%{transform:translateX(0);opacity:0.6;}50%{transform:translateX(-4px);opacity:1;}} @keyframes sR{0%,100%{transform:translateX(0);opacity:0.6;}50%{transform:translateX(4px);opacity:1;}} .anim-slide-left{animation:sL 1.4s ease-in-out infinite;} .anim-slide-right{animation:sR 1.4s ease-in-out infinite;} @keyframes bC{0%,100%{background-color:inherit;}50%{background-color:#fef9c3 !important;}} .anim-bg-blink-cream{animation:bC 1.5s ease-in-out;} @keyframes tW{0%,100%{color:#fff;text-shadow:0 0 5px rgba(255,255,255,0.8);}50%{color:rgba(255,255,255,0.6);text-shadow:none;}} .anim-text-blink-white{animation:tW 1.5s ease-in-out infinite;} `}} />
      
      {dragMsg.active && dragMsg.msg && (
        <div className="fixed z-[9999] pointer-events-none opacity-90 scale-105 shadow-2xl transition-none" style={{ left: dragMsg.x - 100, top: dragMsg.y - 50, width: '220px' }}>
            <div className="bg-white p-3 rounded-xl border-[2.5px] border-blue-500 shadow-lg">
                <div className="text-[10px] font-bold text-blue-600 mb-1">{dragMsg.msg.username}</div>
                <div className="text-xs truncate text-gray-800">{dragMsg.msg.pesan === '___DELETED___' ? 'Pesan dihapus' : dragMsg.msg.pesan}</div>
                <div className="text-[9px] font-bold text-red-500 mt-2 bg-gray-50 p-1 rounded">↓ Lepas di tombol REFRESH untuk hapus</div>
            </div>
        </div>
      )}

      {auth.isAuth && ui.tab === 'admin' && currentHash !== '#block' && (
        <div onClick={() => window.open(`${window.location.pathname}#block`, '_blank')} className="fixed z-[100] bottom-28 right-4 px-3 py-1.5 rounded-full font-black text-white tracking-widest text-[9px] cursor-pointer bg-red-600 border border-red-700 shadow-md active:translate-y-[3px]">BLOCK MGR</div>
      )}

      {currentHash !== '#block' && (
        <div className={`sticky top-0 z-20 p-3 border-b border-white/40 ${ui.mode === 'public' ? 'bg-gradient-to-b from-blue-100 to-white' : 'bg-gradient-to-b from-emerald-100 to-white'}`}>
          <button onClick={handleLogout} className="absolute top-4 right-4 text-[10px] bg-red-500 text-white px-3 py-1 rounded-full shadow">Keluar</button>
          <div className="flex justify-between items-center">
            <div className="flex flex-col max-w-[65%]">
              <span className="text-[10px] text-gray-800 uppercase tracking-wider">{getFmt.greet()}</span>
              <div className="flex items-center gap-1.5 flex-wrap">
                <span className="text-[11px] font-bold text-blue-800">{auth.user || 'Guest'}</span>
                {ui.tab === 'admin' && <span className="text-[9px] bg-gray-200 text-gray-600 px-1.5 py-0.5 rounded font-mono break-all">ID: {currentDeviceId}</span>}
              </div>
            </div>
            <div className="text-center flex-1 flex flex-col items-end mr-16">
              <a href="https://ipix.my.id" target="_blank" className="text-emerald-600 font-bold text-sm underline">ipix.my.id</a>
              {ui.tab === 'user' && (
                <div className="text-[10px] text-gray-500 mt-0.5 flex items-center gap-1">
                  <span className={`inline-block w-1.5 h-1.5 rounded-full ${adminStat.online ? 'bg-green-500' : 'bg-gray-400'}`}></span>
                  {adminStat.online ? <span className="text-green-600 font-bold text-[9px]">Online</span> : <span className="text-[9px]">Offline • {adminStat.offlineTime}</span>}
                </div>
              )}
            </div>
          </div>
          <div className="flex mt-3 bg-white border border-gray-200 rounded-full p-1 shadow-sm w-full relative">
            <button onClick={() => { handleInteraction('public'); setUsersInfo(p=>({...p,selPriv:null})); setInteract({replyTo:null}); }} className={`relative flex-1 py-2 text-xs font-semibold rounded-full flex items-center justify-center gap-2 ${ui.mode === 'public' ? 'bg-blue-600 text-white shadow' : 'bg-transparent text-gray-700'}`}><div className="absolute left-1.5 top-1/2 -translate-y-1/2 w-5 h-5 flex items-center justify-center"><span className={`${ui.mode === 'public' ? 'bg-white text-blue-600' : 'bg-blue-600 text-white'} text-[9px] font-bold w-full h-full flex items-center justify-center rounded-full shadow-sm`}>{getFmt.notif(counts.pub)}</span></div><span className="ml-2">🌐 Public Chat</span></button>
            <button onClick={() => { handleInteraction('private'); setUsersInfo(p=>({...p,selPriv:null})); setInteract({replyTo:null}); }} className={`relative flex-1 py-2 text-xs font-semibold rounded-full flex items-center justify-center gap-2 ${ui.mode === 'private' ? 'bg-emerald-600 text-white shadow' : 'bg-transparent text-gray-700'}`}><span className="mr-2">🔒 Chat private</span><div className="absolute right-1.5 top-1/2 -translate-y-1/2 w-5 h-5 flex items-center justify-center"><span className={`${ui.mode === 'private' ? 'bg-white text-emerald-600' : 'bg-emerald-600 text-white'} text-[9px] font-bold w-full h-full flex items-center justify-center rounded-full shadow-sm`}>{getFmt.notif(counts.priv)}</span></div></button>
          </div>
        </div>
      )}
      
      <div className="flex-1 w-full relative bg-gray-50 flex overflow-hidden">
        {ui.tab === 'admin' && currentHash === '#block' ? <Block blockedList={usersInfo.blockedList} unblock={async (id: string)=>{await supabase.from('blocked_users').delete().eq('device_id', id); fetchData();}} blockedWords={censor.words} newBadWord={censor.newWord} setNewBadWord={(w:string)=>setCensor(p=>({...p,newWord:w}))} addBlockedWord={async ()=>{if(censor.newWord.trim()){await supabase.from('blocked_words').insert([{word:censor.newWord.trim().toLowerCase()}]); setCensor(p=>({...p,newWord:''})); fetchData();}}} removeBlockedWord={async (w:string)=>{await supabase.from('blocked_words').delete().eq('word', w); fetchData();}} formatMessageTime={getFmt.time} /> : (
          <ChatLayout cMode={ui.mode} hInteract={handleInteraction} hScroll={hScroll} aTab={ui.tab} selPrivUser={usersInfo.selPriv} pUsers={usersInfo.privUsers} pubMsgs={msgs.pub} privMsgs={msgs.priv} isPill={pill.visible} pDelta={pill.delta} pTouchX={pill.startX} capIdx={pill.idx} setPTouchX={(x:number)=>setPill(p=>({...p,startX:x}))} setPDelta={(d:number)=>setPill(p=>({...p,delta:d}))} setCapPause={(v:boolean)=>setPill(p=>({...p,pause:v}))} setIsPill={(v:boolean)=>setPill(p=>({...p,visible:v}))} renderMsgs={renderMsgs} fmtTime={getFmt.time} setSelPriv={(u:string)=>setUsersInfo(p=>({...p,selPriv:u}))} />
        )}
      </div>
      
      {currentHash !== '#block' && (
        <div className="bg-white sticky bottom-0 z-20 w-full flex flex-col shadow-sm">
          {interact.replyTo && <div className={`mx-3 mt-1.5 p-2 px-3 rounded-t-xl text-xs flex justify-between items-center border-t border-x ${ui.mode === 'private' ? 'bg-emerald-50 text-emerald-900' : 'bg-blue-50 text-blue-900'}`}><div className="truncate flex-1 pr-2"><span className="font-bold">Balas @{interact.replyTo.username.split('●')[0]}:</span> <span className="italic">"{interact.replyTo.pesan}"</span></div><button type="button" onClick={(e)=>{e.stopPropagation();setInteract({replyTo:null});}} className="text-gray-400 font-bold px-1">×</button></div>}
          
          <form onSubmit={sendMsg} className="p-2 sm:p-3 bg-white border-t border-gray-100 flex gap-2 items-end w-full relative">
            <div className="relative shrink-0 flex items-center justify-center w-8 mb-2">
              <input type="file" id="image-upload" accept="image/*" className="hidden" onChange={handleImageUpload} disabled={input.uploadingImage} />
              <label htmlFor="image-upload" className={`cursor-pointer p-1 rounded-full ${(ui.tab === 'admin' && ui.mode === 'private' && !usersInfo.selPriv) ? 'text-gray-300 pointer-events-none' : 'text-gray-500'}`}>
                {input.uploadingImage ? (
                   <svg className="animate-spin h-6 w-6 text-blue-600" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path></svg>
                ) : (
                  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-6 h-6"><path strokeLinecap="round" strokeLinejoin="round" d="M2.25 15.75l5.159-5.159a2.25 2.25 0 013.182 0l5.159 5.159m-1.5-1.5l1.409-1.409a2.25 2.25 0 013.182 0l2.909 2.909m-18 3.75h16.5a1.5 1.5 0 001.5-1.5V6a1.5 1.5 0 00-1.5-1.5H3.75A1.5 1.5 0 002.25 6v12a1.5 1.5 0 00.5 1.5zm10.5-11.25h.008v.008h-.008V8.25zm.375 0a.375.375 0 11-.75 0 .375.375 0 01.75 0z" /></svg>
                )}
              </label>
            </div>

            <div className="relative flex-1 flex flex-col justify-end">
              <div className="text-[9px] text-gray-400 mb-1 px-1">
                {ui.mode === 'public' ? 'Chat publik mohon bijak' : (ui.tab === 'admin' && !usersInfo.selPriv ? 'Pilih obrolan di atas terlebih dahulu' : 'Chat private admin')}
              </div>
              {input.image && (
                <div className="relative mb-2 inline-block">
                  <img src={input.image} alt="preview" className="h-16 w-16 object-cover rounded-lg border shadow-sm" />
                  <button type="button" onClick={() => setInput(p => ({...p, image: null}))} className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full w-5 h-5 text-[10px] flex items-center justify-center">×</button>
                </div>
              )}
              <textarea 
                id="chat-input" 
                onFocus={()=>setUi(p=>({...p,inputFocus:true}))} onBlur={()=>setUi(p=>({...p,inputFocus:false}))} 
                className={`w-full border p-1.5 rounded-xl px-3 pb-5 text-sm text-black resize-none min-h-[32px] max-h-[100px] [scrollbar-width:none] ${ui.mode === 'private' ? input.blink ? 'bg-emerald-600/30 border-emerald-500 ring-2' : 'bg-emerald-600/10 border-emerald-500/20' : input.blink ? 'bg-blue-600/30 border-blue-500 ring-2' : 'bg-blue-600/10 border-blue-500/20'} ${(ui.tab === 'admin' && ui.mode === 'private' && !usersInfo.selPriv) ? 'opacity-50 cursor-not-allowed bg-gray-200' : ''}`} 
                value={input.text} 
                onChange={e=>{setInput(p=>({...p,text:e.target.value})); e.target.style.height='auto'; e.target.style.height=`${Math.min(e.target.scrollHeight,100)}px`;}} 
                onKeyDown={e=>{if(e.key==='Enter'&&!e.shiftKey){e.preventDefault();sendMsg(e as any);}}} 
                placeholder="Ketik pesan..." maxLength={200} rows={1} 
                disabled={input.sending || (ui.tab === 'admin' && ui.mode === 'private' && !usersInfo.selPriv)} 
              />
              <div className="absolute right-3 bottom-1.5 text-[9px] text-gray-400 font-mono bg-white/40 px-1 rounded">{200 - input.text.length}</div>
            </div>
            
            <div className="relative shrink-0 flex flex-col justify-end w-[85px] md:w-[110px] h-[32px]">
              {auth.isAuth && currentHash !== '#block' && (
                <button 
                  type="button" id="btn-refresh-delete"
                  onClick={() => { if (hasInputReady) { setInput(p => ({ ...p, text: '', image: null })); setInteract({ replyTo: null }); } else { window.location.reload(); } }}
                  className={`absolute bottom-full mb-1.5 left-0 right-0 px-2 py-0.5 rounded-full font-black text-[8px] border text-center ${hasInputReady ? 'bg-red-500 text-white border-red-600' : 'bg-yellow-400 text-black border-yellow-500'}`}
                >
                  {hasInputReady ? 'HAPUS PESAN' : 'REFRESH'}
                </button>
              )}
              <button type="submit" disabled={input.sending || !input.text.trim() || (ui.tab === 'admin' && ui.mode === 'private' && !usersInfo.selPriv)} className={`w-full h-[32px] rounded-xl font-bold text-[10px] sm:text-xs shadow-sm ${ui.mode === 'private' ? 'bg-emerald-600 text-white' : 'bg-blue-600 text-white'}`}>
                {input.sending ? '...' : 'Kirim'}
              </button>
            </div>
          </form>
        </div>
      )}

      {!auth.isAuth && (
        <Login 
          activeTab={ui.tab} username={auth.user} setUsername={(u:string)=>setAuth(p=>({...p,user:u}))} isExistingUser={auth.isExist} adminEmail={auth.adminEmail} setAdminEmail={(e:string)=>setAuth(p=>({...p,adminEmail:e}))} adminPass={auth.adminPass} setAdminPass={(ps:string)=>setAuth(p=>({...p,adminPass:ps}))} 
          handleUserLogin={async () => { 
            if(!auth.user.trim() || isCensored(auth.user)) return alert("Nama tidak valid"); 
            try { 
              const { data: existUser } = await supabase.from('profiles').select('device_id').ilike('username', auth.user.trim()).maybeSingle();
              if (existUser && existUser.device_id !== (currentDeviceId || 'guest')) return alert("Username sudah digunakan.");
              await supabase.from('profiles').upsert({ device_id: currentDeviceId||'guest', username: auth.user.trim(), user_browser: navigator.userAgent }, { onConflict: 'device_id' }); 
            } catch {} 
            setAuth(p=>({...p,isAuth:true})); sessionStorage.setItem('is_auth','true'); sessionStorage.setItem('saved_username',auth.user.trim()); sessionStorage.setItem('active_tab','user'); 
          }} 
          handleAdminLogin={async () => { 
            const { error } = await supabase.auth.signInWithPassword({ email: auth.adminEmail, password: auth.adminPass }); 
            if (error) alert("Gagal"); 
            else { setAuth(p=>({...p,isAuth:true,user:'Admin●ipix.my.id'})); setUi(p=>({...p,tab:'admin'})); sessionStorage.setItem('is_auth','true'); sessionStorage.setItem('saved_username','Admin●ipix.my.id'); sessionStorage.setItem('active_tab','admin'); } 
          }} 
        />
      )}
    </div>
  );
}