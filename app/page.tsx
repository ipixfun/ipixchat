'use client';
import { useEffect, useState } from 'react';
import { supabase } from './supabaseClient';

export default function Home() {
  const [mounted, setMounted] = useState(false);
  const [messages, setMessages] = useState<any[]>([]);
  const [blockedList, setBlockedList] = useState<any[]>([]);
  const [username, setUsername] = useState('');
  const [editCount, setEditCount] = useState(0);
  const [adminEmail, setAdminEmail] = useState('');
  const [adminPass, setAdminPass] = useState('');
  const [activeTab, setActiveTab] = useState<'user' | 'admin'>('user');
  const [input, setInput] = useState('');
  const [isAuth, setIsAuth] = useState(false);
  const [lastSent, setLastSent] = useState(0);
  const [isAdminOnline, setIsAdminOnline] = useState(false);
  const [offlineTime, setOfflineTime] = useState("");

  const getTimeAgo = (date: Date) => {
    const seconds = Math.floor((new Date().getTime() - date.getTime()) / 1000);
    let interval = seconds / 3600;
    if (interval >= 1) return Math.floor(interval) + " jam yang lalu";
    interval = seconds / 60;
    if (interval >= 1) return Math.floor(interval) + " menit yang lalu";
    return "baru saja";
  };

  const handleLogout = async () => {
    await supabase.auth.signOut();
    sessionStorage.clear();
    setIsAuth(false);
    window.location.reload();
  };

  const fetchData = async () => {
    const deviceId = localStorage.getItem('device_id');
    const { data: bData } = await supabase.from('blocked_users').select('*');
    
    // Auto-load profile & edit count
    let { data: pData } = await supabase.from('profiles').select('*').eq('device_id', deviceId).single();
    if (!pData && deviceId) {
       const { data: newP } = await supabase.from('profiles').insert([{ device_id: deviceId, username: 'Guest', edit_count: 0, browser_info: navigator.userAgent }]).select().single();
       pData = newP;
    }
    if(pData) { setUsername(pData.username); setEditCount(pData.edit_count); }

    const { data: mData } = await supabase.from('messages').select('*').order('created_at', { ascending: true });
    
    if (bData) {
      setBlockedList(bData);
      if (bData.some(b => b.device_id === deviceId)) { window.location.replace("https://ipix.my.id"); return; }
    }
    
    if (mData) {
      setMessages(mData.filter(m => !bData?.map(b => b.device_id).includes(m.device_id)));
      const lastAdminMsg = mData.filter(m => m.username === 'Admin●ipix.my.id').pop();
      if (lastAdminMsg) {
        const lastDate = new Date(lastAdminMsg.created_at);
        const isOnline = Date.now() - lastDate.getTime() < 300000;
        setIsAdminOnline(isOnline);
        if (!isOnline) setOfflineTime(getTimeAgo(lastDate));
      }
    }
  };

  const handleEditUsername = async (isAdminForce = false) => {
    const newName = prompt("Masukkan nama baru:");
    if (!newName) return;
    if (!isAdminForce && editCount >= 2) return alert("Jatah edit nama habis!");

    await supabase.from('profiles').upsert({ device_id: localStorage.getItem('device_id'), username: newName, browser_info: navigator.userAgent, edit_count: isAdminForce ? editCount : editCount + 1 });
    fetchData();
  };

  const handleAdminLogin = async () => {
    const { error } = await supabase.auth.signInWithPassword({ email: adminEmail, password: adminPass });
    if (error) alert("Login Admin Gagal: " + error.message);
    else { setIsAuth(true); setActiveTab('admin'); sessionStorage.setItem('is_auth', 'true'); sessionStorage.setItem('active_tab', 'admin'); }
  };

  const sendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim()) return;
    if (Date.now() - lastSent < 3000) return alert("Jangan spam!");
    await supabase.from('messages').insert([{ username, pesan: input, device_id: localStorage.getItem('device_id') }]);
    setLastSent(Date.now()); setInput('');
  };

  useEffect(() => {
    if (!localStorage.getItem('device_id')) localStorage.setItem('device_id', Math.random().toString(36).substring(2, 15));
    const checkAuth = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (session || sessionStorage.getItem('is_auth') === 'true') { setIsAuth(true); setActiveTab((sessionStorage.getItem('active_tab') as 'user' | 'admin') || 'user'); }
      setMounted(true);
    };
    checkAuth();
  }, []);

  useEffect(() => {
    if (!mounted) return;
    fetchData();
    const channel = supabase.channel('chat').on('postgres_changes', { event: '*', schema: 'public', table: 'messages' }, fetchData).subscribe();
    return () => { supabase.removeChannel(channel); };
  }, [mounted]);

  if (!mounted) return <div className="h-screen flex items-center justify-center bg-gray-900 text-white">Memuat...</div>;

  if (!isAuth) return (
    <div className="flex flex-col items-center justify-center h-screen bg-gradient-to-br from-emerald-500 to-blue-600 text-white p-6">
      <h1 className="text-3xl font-bold mb-6">iPixChat Login</h1>
      <div className="flex gap-4 mb-6">
        <button className={`px-6 py-2 rounded-full font-bold ${activeTab === 'user' ? 'bg-blue-600 ring-2 ring-white' : 'bg-gray-400'}`} onClick={() => setActiveTab('user')}>User</button>
        <button className={`px-6 py-2 rounded-full font-bold ${activeTab === 'admin' ? 'bg-emerald-600 ring-2 ring-white' : 'bg-gray-400'}`} onClick={() => setActiveTab('admin')}>Admin</button>
      </div>
      {activeTab === 'admin' && (
        <div className="w-full max-w-sm"><input className="w-full p-3 rounded text-black mb-3" placeholder="Email" onChange={(e) => setAdminEmail(e.target.value)} /> <input type="password" className="w-full p-3 rounded text-black mb-3" placeholder="Password" onChange={(e) => setAdminPass(e.target.value)} /></div>
      )}
      <button onClick={activeTab === 'admin' ? handleAdminLogin : () => {setIsAuth(true); setActiveTab('user');}} className="bg-white text-emerald-600 px-8 py-3 rounded-full font-bold">Masuk Chat</button>
    </div>
  );

  return (
    <div className="w-full max-w-2xl mx-auto h-dvh flex flex-col bg-gray-100 shadow-xl overflow-hidden">
      <div className="sticky top-0 z-10 p-3 bg-white border-b flex justify-between items-center">
        <div className="flex flex-col">
           <div className="font-bold text-sm text-gray-800">Halo, {username}</div>
           {activeTab === 'user' && editCount < 2 && <button onClick={() => handleEditUsername()} className="text-[10px] text-blue-600 underline text-left">Ganti Nama</button>}
        </div>
        <button onClick={handleLogout} className="bg-red-500 text-white px-3 py-1 rounded-full text-[10px]">Keluar</button>
      </div>
      
      <div className="flex-1 overflow-y-auto p-3 space-y-3">
        {messages.map((m) => (
          <div key={m.id} className="bg-white p-3 rounded-xl border w-full">
            <div className="flex justify-between items-center mb-1">
              {m.username === 'Admin●ipix.my.id' ? (
                <span className="flex items-center gap-2">
                  <span className="text-red-600 font-bold text-[10px]">Admin●</span>
                  {isAdminOnline ? <span className="flex items-center text-[8px] text-green-600 font-bold animate-pulse">● ONLINE</span> : <span className="text-[8px] text-gray-400 font-bold">OFFLINE ({offlineTime})</span>}
                </span>
              ) : <b className="text-blue-700 text-[10px]">{m.username}</b>}
              <span className="text-[9px] text-gray-400">{new Date(m.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
            </div>
            <div className="text-sm text-gray-800">{m.pesan}</div>
            {activeTab === 'admin' && (
              <div className="flex gap-4 mt-2">
                <button onClick={async () => { await supabase.from('messages').delete().eq('id', m.id); fetchData(); }} className="text-[10px] text-red-600 font-bold underline">Hapus</button>
                {m.username !== 'Admin●ipix.my.id' && <button onClick={async () => { await supabase.from('blocked_users').insert([{ device_id: m.device_id }]); fetchData(); }} className="text-[10px] text-orange-600 font-bold underline">Blokir</button>}
                <button onClick={() => handleEditUsername(true)} className="text-[10px] text-green-600 font-bold underline">Force Edit</button>
              </div>
            )}
          </div>
        ))}
      </div>
      {activeTab === 'admin' && <div className="p-3 bg-gray-300 text-[10px]"><strong>Blocked:</strong> {blockedList.map(b => <span key={b.device_id} className="mr-2 cursor-pointer text-blue-800 underline" onClick={async () => { await supabase.from('blocked_users').delete().eq('device_id', b.device_id); fetchData(); }}>{b.device_id.substring(0,5)} (Unblock)</span>)}</div>}
      <form onSubmit={sendMessage} className="p-3 bg-white border-t flex gap-2">
        <input className="flex-1 border p-2 rounded-full px-4 text-sm" value={input} onChange={(e) => setInput(e.target.value)} placeholder="Ketik pesan..." />
        <button className="bg-blue-600 text-white px-5 py-2 rounded-full font-bold text-sm">Kirim</button>
      </form>
    </div>
  );
}