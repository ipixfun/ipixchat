'use client';
import { useEffect, useState, useCallback } from 'react';
import { supabase } from './supabaseClient';

export default function Home() {
  const [mounted, setMounted] = useState(false);
  const [messages, setMessages] = useState<any[]>([]);
  const [blockedList, setBlockedList] = useState<any[]>([]);
  const [username, setUsername] = useState('');
  const [adminEmail, setAdminEmail] = useState('');
  const [adminPass, setAdminPass] = useState('');
  const [activeTab, setActiveTab] = useState<'user' | 'admin'>('user');
  const [chatMode, setChatMode] = useState<'public' | 'private'>('public');
  const [input, setInput] = useState('');
  const [isAuth, setIsAuth] = useState(false);
  const [lastSent, setLastSent] = useState(0);
  const [sending, setSending] = useState(false);
  
  const [privateNotifCount, setPrivateNotifCount] = useState(0);
  const [isAdminOnline, setIsAdminOnline] = useState(false);
  const [adminOfflineTime, setAdminOfflineTime] = useState("");
  const [userStatus, setUserStatus] = useState<Record<string, { online: boolean; offlineTime?: string }>>({});
  
  const [selectedPrivateUser, setSelectedPrivateUser] = useState<string | null>(null);
  const [privateUsers, setPrivateUsers] = useState<any[]>([]);

  const currentDeviceId = typeof window !== 'undefined' ? localStorage.getItem('device_id') : null;

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
    const options: Intl.DateTimeFormatOptions = {
      weekday: 'short',
      day: '2-digit',
      month: 'short',
      hour: '2-digit',
      minute: '2-digit',
    };
    return date.toLocaleDateString('id-ID', options).replace(',', '');
  };

  const getGreeting = () => {
    const now = new Date();
    const utc = now.getTime() + (now.getTimezoneOffset() * 60000);
    const wibTime = new Date(utc + (7 * 3600000));
    const hour = wibTime.getHours();
    let timeOfDay = "";
    if (hour >= 5 && hour < 12) timeOfDay = "pagi";
    else if (hour >= 12 && hour < 15) timeOfDay = "siang";
    else if (hour >= 15 && hour < 18) timeOfDay = "sore";
    else timeOfDay = "malam";
    return `Selamat ${timeOfDay}, `;
  };

  const handleLogout = async () => {
    await supabase.auth.signOut();
    sessionStorage.clear();
    setIsAuth(false);
    window.location.reload();
  };

  const fetchData = useCallback(async () => {
    try {
      const { data: bData } = await supabase.from('blocked_users').select('*');
      let query = supabase.from('messages').select('*').order('created_at', { ascending: true });

      if (chatMode === 'private') {
        if (activeTab === 'user' && currentDeviceId) {
          query = query.eq('is_private', true).or(`device_id.eq.${currentDeviceId},private_with.eq.${currentDeviceId}`);
        } else if (selectedPrivateUser && selectedPrivateUser !== currentDeviceId) {
          query = query.eq('is_private', true).or(`device_id.eq.${selectedPrivateUser},private_with.eq.${selectedPrivateUser}`);
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
        setMessages(mData.filter(m => !blockedDeviceIds.includes(m.device_id)));
        
        const lastAdminMsg = mData.filter(m => m.username === 'Admin●ipix.my.id').pop();
        if (lastAdminMsg) {
          const lastDate = new Date(lastAdminMsg.created_at);
          const isOnline = Date.now() - lastDate.getTime() < 300000;
          setIsAdminOnline(isOnline);
          if (!isOnline) setAdminOfflineTime(getTimeAgo(lastDate));
        }

        const statusMap: Record<string, { online: boolean; offlineTime?: string }> = {};
        mData.forEach((msg: any) => {
            if (msg.username !== 'Admin●ipix.my.id') {
                const lastDate = new Date(msg.created_at);
                const isOnline = Date.now() - lastDate.getTime() < 300000;
                statusMap[msg.username] = { online: isOnline, offlineTime: !isOnline ? getTimeAgo(lastDate) : undefined };
            }
        });
        setUserStatus(statusMap);
      }

      if (activeTab === 'admin' && chatMode === 'private' && !selectedPrivateUser) {
        const { data: allPrivate } = await supabase.from('messages').select('device_id, username, created_at').eq('is_private', true).order('created_at', { ascending: false });
        if (allPrivate) {
          const userMap = new Map();
          const counts: Record<string, number> = {};
          allPrivate.forEach(msg => {
             if (msg.username !== 'Admin●ipix.my.id' && msg.device_id !== currentDeviceId) counts[msg.device_id] = (counts[msg.device_id] || 0) + 1;
          });
          allPrivate.forEach(msg => {
            if (msg.username !== 'Admin●ipix.my.id' && msg.device_id !== currentDeviceId && !userMap.has(msg.device_id)) {
              userMap.set(msg.device_id, { device_id: msg.device_id, username: msg.username, last_active: msg.created_at, count: counts[msg.device_id] || 0 });
            }
          });
          setPrivateUsers(Array.from(userMap.values()));
        }
      }
    } catch (err) { console.error("Fetch data error:", err); setMessages([]); }
  }, [chatMode, activeTab, selectedPrivateUser, currentDeviceId, isAuth]);

  useEffect(() => {
    if (!localStorage.getItem('device_id')) localStorage.setItem('device_id', Math.random().toString(36).substring(2, 15));
    const savedName = localStorage.getItem('saved_username');
    if (savedName) setUsername(savedName);
    const checkAuth = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (session || sessionStorage.getItem('is_auth') === 'true') {
        setIsAuth(true);
        setActiveTab((sessionStorage.getItem('active_tab') as 'user' | 'admin') || 'user');
      }
      setMounted(true);
    };
    checkAuth();
  }, []);

  useEffect(() => {
    if (!mounted) return;
    fetchData();
    const channel = supabase.channel('chat').on('postgres_changes', { event: '*', schema: 'public', table: 'messages' }, fetchData).subscribe();
    return () => { void supabase.removeChannel(channel); };
  }, [mounted, fetchData]);

  const handleAdminLogin = async () => {
    const { error } = await supabase.auth.signInWithPassword({ email: adminEmail, password: adminPass });
    if (error) alert("Login Admin Gagal: " + error.message);
    else {
      setIsAuth(true); setActiveTab('admin'); setUsername('Admin●ipix.my.id');
      sessionStorage.setItem('is_auth', 'true'); sessionStorage.setItem('active_tab', 'admin');
    }
  };

  const handleUserLogin = async () => {
    if (!username.trim()) return alert("Masukkan nama Anda!");
    localStorage.setItem('saved_username', username);
    const cid = localStorage.getItem('device_id');
    const { data: bData } = await supabase.from('blocked_users').select('*').eq('device_id', cid);
    if (bData && bData.length > 0) { window.location.replace("https://ipix.my.id/chat"); return; }
    setIsAuth(true); sessionStorage.setItem('is_auth', 'true'); sessionStorage.setItem('active_tab', 'user');
  };

  const sendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || sending) return;

    if (username !== 'Admin●ipix.my.id') {
        const now = Date.now();
        const raw = localStorage.getItem('msg_timestamps');
        const timestamps = raw ? JSON.parse(raw) : [];
        const valid = timestamps.filter((t: number) => now - t < 1800000);
        if (valid.length >= 5) { alert("⚠️ Limit: Maksimal 5 chat per 30 menit."); return; }
        localStorage.setItem('msg_timestamps', JSON.stringify([...valid, now]));
    }

    if (activeTab === 'admin' && chatMode === 'private' && selectedPrivateUser === currentDeviceId) {
      alert("Tidak bisa chat dengan diri sendiri!"); return;
    }

    const now = Date.now();
    if (now - lastSent < 3000) { alert("Jangan spam! Tunggu 3 detik."); return; }
    setSending(true);
    const isPrivate = chatMode === 'private';
    const payload = {
      username, pesan: input.trim(), device_id: localStorage.getItem('device_id') || 'guest',
      user_browser: getBrowserInfo(), is_private: isPrivate,
      private_with: isPrivate ? (activeTab === 'user' ? 'admin' : selectedPrivateUser) : null,
    };

    const { error } = await supabase.from('messages').insert([payload]);
    if (error) alert("Gagal: " + error.message);
    else { setInput(''); setLastSent(now); await fetchData(); }
    setSending(false);
  };

  const editMsg = async (id: number) => {
    const newText = prompt("Edit pesan:", messages.find(m => m.id === id)?.pesan || "");
    if (newText !== null && newText.trim()) { await supabase.from('messages').update({ pesan: newText }).eq('id', id); fetchData(); }
  };

  const editNama = async (id: number) => {
    const m = messages.find(m => m.id === id);
    if (!m) return;
    const newName = prompt("Ubah nama user:", m.username);
    if (newName && newName.trim()) { await supabase.from('messages').update({ username: newName }).eq('device_id', m.device_id); fetchData(); }
  };

  const deleteMsg = async (id: number) => {
    if (confirm("Hapus pesan ini?")) { await supabase.from('messages').delete().eq('id', id); fetchData(); }
  };

  const blockUser = async (device_id: string, username: string) => {
    if (confirm(`Blokir ${username}?`)) { await supabase.from('blocked_users').insert([{ device_id, username }]); fetchData(); }
  };

  const unblock = async (id: string) => { await supabase.from('blocked_users').delete().eq('device_id', id); fetchData(); };

  const inviteToPrivate = (device_id: string, username: string) => {
    if (confirm(`Ajak ${username} ke private chat?`)) { setChatMode('private'); setSelectedPrivateUser(device_id); }
  };

  if (!mounted) return <div className="h-screen flex items-center justify-center bg-gray-900 text-white">Memuat...</div>;

  if (!isAuth) {
    return (
      <div className="flex flex-col items-center justify-center h-screen bg-gradient-to-br from-emerald-500 to-blue-600 text-white p-6">
        <h1 className="text-3xl font-bold mb-6">IpixChat Login</h1>
        <div className="flex gap-4 mb-6">
          <button className={`px-6 py-2 rounded-full font-bold ${activeTab === 'user' ? 'bg-blue-600 ring-2 ring-white' : 'bg-gray-400'}`} onClick={() => setActiveTab('user')}>User</button>
          <button className={`px-6 py-2 rounded-full font-bold ${activeTab === 'admin' ? 'bg-emerald-600 ring-2 ring-white' : 'bg-gray-400'}`} onClick={() => setActiveTab('admin')}>Admin</button>
        </div>
        {activeTab === 'user' ? (
          <input className="w-full max-w-sm p-3 rounded text-black mb-3" placeholder="Nama Anda (Max 20)" value={username} onChange={(e) => setUsername(e.target.value.substring(0, 20))} maxLength={20} />
        ) : (
          <div className="w-full max-w-sm">
            <input className="w-full p-3 rounded text-black mb-3" placeholder="Email Admin" type="email" onChange={(e) => setAdminEmail(e.target.value)} />
            <input type="password" className="w-full p-3 rounded text-black mb-3" placeholder="Password Admin" onChange={(e) => setAdminPass(e.target.value)} />
          </div>
        )}
        <button onClick={() => activeTab === 'admin' ? handleAdminLogin() : handleUserLogin()} className="bg-white text-emerald-600 px-8 py-3 rounded-full font-bold">Masuk Chat</button>
      </div>
    );
  }

  return (
    <div className="w-full max-w-2xl mx-auto h-dvh flex flex-col bg-gray-100 shadow-xl overflow-hidden">
      <div className="sticky top-0 z-10 p-3 bg-white/30 backdrop-blur-md border-b border-white/20">
        <button onClick={handleLogout} className="absolute top-4 right-4 text-[10px] bg-red-500 text-white px-3 py-1 rounded-full">Keluar</button>
        <div className="flex justify-between items-center">
          <div className="text-sm font-medium text-gray-700">
            {getGreeting()}<span className="text-blue-600 font-semibold">{username}</span>
            <div className="text-[10px] mt-0.5">Admin: {isAdminOnline ? <span className="text-green-600 font-bold">Online</span> : <span className="text-gray-500">Offline ({adminOfflineTime || "..."})</span>}</div>
          </div>
          <div className="text-center flex-1">
            <div className="text-lg font-black text-gray-800">iPixChat</div>
            <a href="https://ipix.my.id" target="_blank" className="text-emerald-700 font-bold text-[10px] underline">ipix.my.id</a>
          </div>
        </div>
        <div className="flex mt-3 bg-gray-100 rounded-full p-1 shadow">
          <button onClick={() => { setChatMode('public'); setSelectedPrivateUser(null); }} className={`flex-1 py-2.5 text-sm font-medium rounded-full transition-all ${chatMode === 'public' ? 'bg-blue-600 text-white shadow' : 'text-gray-700 hover:bg-gray-200'}`}>Public Chat</button>
          <button onClick={() => { setChatMode('private'); setSelectedPrivateUser(null); }} className={`relative flex-1 py-2.5 text-sm font-medium rounded-full transition-all ${chatMode === 'private' ? 'bg-emerald-600 text-white shadow' : 'text-gray-700 hover:bg-gray-200'}`}>💬 Private {privateNotifCount > 0 && <span className="absolute -top-1 -right-1 bg-red-500 text-white text-[10px] font-bold min-w-5 h-5 px-1 flex items-center justify-center rounded-full animate-bounce">{formatNotif(privateNotifCount)}</span>}</button>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto p-3 space-y-3">
        {activeTab === 'admin' && chatMode === 'private' && !selectedPrivateUser ? (
            <div className="space-y-3">
                {privateUsers.map(user => (
                  <div key={user.device_id} onClick={() => setSelectedPrivateUser(user.device_id)} className="bg-white p-4 rounded-2xl border flex justify-between items-center cursor-pointer">
                    <div><div className="font-semibold text-blue-700">{user.username}</div><div className="text-xs text-gray-500">ID: {user.device_id.substring(0,8)}...</div></div>
                    <div className="text-right">{user.count > 0 && <div className="bg-red-500 text-white text-[10px] font-bold px-2 rounded-full">{user.count} Pesan</div>}</div>
                  </div>
                ))}
            </div>
        ) : (
            messages.map((m) => (
              <div key={m.id} className="bg-white p-3 rounded-xl border border-gray-100 shadow-sm w-full">
                <div className="flex justify-between items-center mb-1">
                  <div className="flex items-center gap-2">
                    <b className={`${m.username === 'Admin●ipix.my.id' ? 'text-red-600' : 'text-blue-700'} text-[10px]`}>{m.username}</b>
                    {m.username === 'Admin●ipix.my.id' ? (
                      <span className={`text-[9px] px-1 rounded ${isAdminOnline ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-500'}`}>{isAdminOnline ? 'Online' : adminOfflineTime}</span>
                    ) : userStatus[m.username] && (
                      <span className={`text-[9px] px-1 rounded ${userStatus[m.username].online ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-500'}`}>{userStatus[m.username].online ? 'Online' : userStatus[m.username].offlineTime}</span>
                    )}
                  </div>
                  <span className="text-[10px] text-gray-500 font-medium">{formatMessageTime(m.created_at)}</span>
                </div>
                <div className="text-sm text-gray-800 break-words">{m.pesan}</div>
                
                {/* Tombol Aksi Admin */}
                {activeTab === 'admin' && (
                  <div className="flex gap-4 mt-2 text-[10px] flex-wrap">
                    <button onClick={() => editMsg(m.id)} className="text-blue-600 font-bold underline">Edit</button>
                    <button onClick={() => editNama(m.id)} className="text-purple-600 font-bold underline">Nama</button>
                    <button onClick={() => deleteMsg(m.id)} className="text-red-600 font-bold underline">Hapus</button>
                    {!m.username.includes('Admin') && (
                      <>
                        <button onClick={() => blockUser(m.device_id, m.username)} className="text-gray-400 font-bold underline">Blokir</button>
                        <button onClick={() => inviteToPrivate(m.device_id, m.username)} className="text-emerald-600 font-bold underline">💬 Ajak Private</button>
                      </>
                    )}
                  </div>
                )}
              </div>
            ))
        )}
      </div>

      {activeTab === 'admin' && (
        <div className="p-3 bg-gray-300 text-[10px] border-t">
          <strong className="text-black">User Terblokir: {blockedList.length}</strong>
          <div className="mt-2 flex flex-wrap gap-2">
            {blockedList.map(b => (
              <span key={b.device_id} className="cursor-pointer text-blue-800 underline" onClick={() => unblock(b.device_id)}>{b.username || '...'} (Unblock)</span>
            ))}
          </div>
        </div>
      )}

      <form onSubmit={sendMessage} className="p-3 bg-white border-t flex gap-2 items-center">
        <input className="flex-1 border p-2 rounded-full px-4 text-sm text-black" value={input} onChange={(e) => setInput(e.target.value)} placeholder="Ketik pesan..." maxLength={100} disabled={sending} />
        <button type="submit" disabled={sending || !input.trim()} className="bg-blue-600 text-white px-5 py-2 rounded-full font-bold text-sm shrink-0 disabled:opacity-50">Kirim</button>
      </form>
    </div>
  );
}