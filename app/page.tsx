'use client';
import { useEffect, useState } from 'react';
import { supabase } from './supabaseClient';

export default function Home() {
  const [mounted, setMounted] = useState(false);
  const [messages, setMessages] = useState<any[]>([]);
  const [blockedList, setBlockedList] = useState<any[]>([]);
  const [username, setUsername] = useState('');
  const [adminEmail, setAdminEmail] = useState('');
  const [adminPass, setAdminPass] = useState('');
  const [activeTab, setActiveTab] = useState<'user' | 'admin'>('user');
  const [input, setInput] = useState('');
  const [isAuth, setIsAuth] = useState(false);
  const [lastSent, setLastSent] = useState(0);
  const [isAdminOnline, setIsAdminOnline] = useState(false);
  const [offlineTime, setOfflineTime] = useState("");

  const renderMessage = (text: string) => {
    const isImg = /\.(jpeg|jpg|gif|png|webp)(\?.*)?$/i.test(text) || text.includes('giphy.com/media') || text.includes('giphy.com/gifs/');
    let url = text;
    if (text.includes('giphy.com/gifs/')) {
        const id = text.split('-').pop();
        url = `https://media.giphy.com/media/${id}/giphy.gif`;
    }
    return isImg ? (
      <img src={url} alt="media" className="max-w-full max-h-60 rounded-lg object-contain mt-1 border" onError={(e) => { e.currentTarget.style.display = 'none'; }} />
    ) : <div className="text-sm text-gray-800 break-words">{text}</div>;
  };

  const getTimeAgo = (date: Date) => {
    const seconds = Math.floor((new Date().getTime() - date.getTime()) / 1000);
    return seconds < 3600 ? Math.floor(seconds/60) + " menit lalu" : Math.floor(seconds/3600) + " jam lalu";
  };

  const handleLogout = async () => {
    await supabase.auth.signOut();
    sessionStorage.clear();
    setIsAuth(false);
    window.location.reload();
  };

  useEffect(() => {
    if (!localStorage.getItem('device_id')) localStorage.setItem('device_id', Math.random().toString(36).substring(2, 15));
    const checkAuth = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (session || sessionStorage.getItem('is_auth') === 'true') {
        setIsAuth(true);
        setUsername(sessionStorage.getItem('saved_username') || '');
        setActiveTab((sessionStorage.getItem('active_tab') as 'user' | 'admin') || 'user');
      }
      setMounted(true);
    };
    checkAuth();
  }, []);

  const fetchData = async () => {
    const { data: bData } = await supabase.from('blocked_users').select('*');
    const { data: mData } = await supabase.from('messages').select('*').order('created_at', { ascending: true });
    
    if (bData) {
      setBlockedList(bData);
      if (bData.some(b => b.device_id === localStorage.getItem('device_id'))) {
        window.location.replace("https://ipix.my.id/chat"); return;
      }
    }
    if (mData) {
      setMessages(mData.filter(m => !bData?.map(b => b.device_id).includes(m.device_id)));
      const lastAdminMsg = mData.filter(m => m.username === 'Admin●ipix.my.id').pop();
      if (lastAdminMsg) {
        const isOnline = Date.now() - new Date(lastAdminMsg.created_at).getTime() < 300000;
        setIsAdminOnline(isOnline);
        if (!isOnline) setOfflineTime(getTimeAgo(new Date(lastAdminMsg.created_at)));
      }
    }
  };

  useEffect(() => {
    if (mounted) {
      fetchData();
      const channel = supabase.channel('chat').on('postgres_changes', { event: '*', schema: 'public', table: 'messages' }, fetchData).subscribe();
      return () => { supabase.removeChannel(channel); };
    }
  }, [mounted]);

  const handleAdminLogin = async () => {
    const { error } = await supabase.auth.signInWithPassword({ email: adminEmail, password: adminPass });
    if (error) alert("Login Admin Gagal: " + error.message);
    else {
      setIsAuth(true); setActiveTab('admin'); setUsername('Admin●ipix.my.id');
      sessionStorage.setItem('is_auth', 'true'); sessionStorage.setItem('saved_username', 'Admin●ipix.my.id'); sessionStorage.setItem('active_tab', 'admin');
    }
  };

  const handleUserLogin = async () => {
    if (!username.trim()) return alert("Masukkan nama Anda!");
    const { data: bData } = await supabase.from('blocked_users').select('*');
    if (bData?.some(b => b.device_id === localStorage.getItem('device_id'))) {
      window.location.replace("https://ipix.my.id/chat"); return;
    }
    setIsAuth(true); sessionStorage.setItem('is_auth', 'true'); sessionStorage.setItem('saved_username', username); sessionStorage.setItem('active_tab', 'user');
  };

  const sendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim()) return;
    const now = Date.now();
    if (now - lastSent < 3000) { alert("Jangan spam!"); return; }
    await supabase.from('messages').insert([{ username, pesan: input, device_id: localStorage.getItem('device_id') || 'guest' }]);
    setLastSent(now); setInput('');
  };

  const editMsg = async (id: number) => {
    const newText = prompt("Edit pesan:", messages.find(m => m.id === id)?.pesan || "");
    if (newText !== null) { await supabase.from('messages').update({ pesan: newText }).eq('id', id); fetchData(); }
  };

  if (!mounted) return <div className="h-screen flex items-center justify-center bg-gray-900 text-white">Memuat...</div>;

  if (!isAuth) return (
    <div className="flex flex-col items-center justify-center h-screen bg-gradient-to-br from-emerald-500 to-blue-600 text-white p-6">
      <h1 className="text-3xl font-bold mb-6">IpixChat Login</h1>
      <div className="flex gap-4 mb-6">
        <button className={`px-6 py-2 rounded-full font-bold ${activeTab === 'user' ? 'bg-blue-600 ring-2 ring-white' : 'bg-gray-400'}`} onClick={() => setActiveTab('user')}>User</button>
        <button className={`px-6 py-2 rounded-full font-bold ${activeTab === 'admin' ? 'bg-emerald-600 ring-2 ring-white' : 'bg-gray-400'}`} onClick={() => setActiveTab('admin')}>Admin</button>
      </div>
      {activeTab === 'user' ? <input maxLength={10} className="w-full max-w-sm p-3 rounded text-black mb-3" placeholder="Nama (Max 10)" onChange={(e) => setUsername(e.target.value)} /> : (
        <div className="w-full max-w-sm">
          <input className="w-full p-3 rounded text-black mb-3" placeholder="Email Admin" type="email" onChange={(e) => setAdminEmail(e.target.value)} />
          <input type="password" className="w-full p-3 rounded text-black mb-3" placeholder="Password Admin" onChange={(e) => setAdminPass(e.target.value)} />
        </div>
      )}
      <button onClick={() => activeTab === 'admin' ? handleAdminLogin() : handleUserLogin()} className="bg-white text-emerald-600 px-8 py-3 rounded-full font-bold">Masuk Chat</button>
    </div>
  );

  return (
    <div className="w-full max-w-2xl mx-auto h-dvh flex flex-col bg-gray-100 shadow-xl overflow-hidden">
      <div className="sticky top-0 z-10 p-3 bg-white/30 backdrop-blur-md border-b text-center">
        <div className="absolute top-2 left-2 text-[10px] font-bold text-gray-600">Halo, {username}</div>
        <div className="absolute top-2 right-2 flex flex-col gap-1">
          <button onClick={handleLogout} className="text-[9px] bg-red-500 text-white px-2 py-0.5 rounded">Keluar</button>
          <button onClick={fetchData} className="text-[9px] bg-blue-500 text-white px-2 py-0.5 rounded">Refresh</button>
        </div>
        <div className="text-lg font-black text-gray-800 mt-4">iPixChat</div>
      </div>
      <div className="flex-1 overflow-y-auto p-3 space-y-3">
        {messages.map((m) => (
          <div key={m.id} className="bg-white p-3 rounded-xl border border-gray-100 shadow-sm w-full">
            <div className="flex justify-between items-center mb-1">
              {m.username === 'Admin●ipix.my.id' ? (
                <span className="text-red-600 font-bold text-[10px] flex items-center gap-1">
                  <span className={`w-2 h-2 rounded-full ${isAdminOnline ? 'bg-green-500 animate-pulse' : 'bg-gray-400'}`}></span>
                  Admin● <span className={isAdminOnline ? "animate-pulse" : ""}>{isAdminOnline ? 'ONLINE' : `OFFLINE (${offlineTime})`}</span>
                </span>
              ) : <b className="text-blue-700 text-[10px]">{m.username}</b>}
              <span className="text-[9px] text-gray-400">
                {new Date(m.created_at).toLocaleDateString('id-ID', {day:'2-digit', month:'2-digit'})} {new Date(m.created_at).toLocaleTimeString('id-ID', {hour:'2-digit', minute:'2-digit'})}
              </span>
            </div>
            {renderMessage(m.pesan)}
            {activeTab === 'admin' && (
              <div className="flex gap-4 mt-2">
                <button onClick={() => editMsg(m.id)} className="text-[10px] text-blue-600 font-bold underline">Edit</button>
                <button onClick={async () => { await supabase.from('messages').delete().eq('id', m.id); fetchData(); }} className="text-[10px] text-red-600 font-bold underline">Hapus</button>
                <button onClick={async () => { await supabase.from('blocked_users').insert([{ device_id: m.device_id }]); fetchData(); }} className="text-[10px] text-gray-600 font-bold underline">Blokir</button>
              </div>
            )}
          </div>
        ))}
      </div>
      {activeTab === 'admin' && <div className="p-3 bg-gray-300 text-[10px] border-t"><strong>User Terblokir:</strong> {blockedList.map(b => <span key={b.device_id} className="mr-2 cursor-pointer text-blue-800 underline" onClick={async() => {await supabase.from('blocked_users').delete().eq('device_id', b.device_id); fetchData();}}>{b.device_id.substring(0,5)} (Unblock)</span>)}</div>}
      <form onSubmit={sendMessage} className="p-3 bg-white border-t flex gap-2 items-center">
        <input maxLength={100} className="flex-1 border p-2 rounded-full px-4 text-sm text-black" value={input} onChange={(e) => setInput(e.target.value)} placeholder="Ketik pesan (max 100)..." />
        <button className="bg-blue-600 text-white px-5 py-2 rounded-full font-bold text-sm">Kirim</button>
      </form>
    </div>
  );
}