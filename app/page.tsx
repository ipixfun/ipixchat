'use client';
import { useEffect, useState } from 'react';
import { supabase } from './supabaseClient';

export default function Home() {
  const [mounted, setMounted] = useState(false);
  const [messages, setMessages] = useState<any[]>([]);
  const [blockedCount, setBlockedCount] = useState(0); // Penambahan state jumlah blokir
  const [username, setUsername] = useState('');
  const [adminEmail, setAdminEmail] = useState('');
  const [adminPass, setAdminPass] = useState('');
  const [activeTab, setActiveTab] = useState<'user' | 'admin'>('user');
  const [input, setInput] = useState('');
  const [isAuth, setIsAuth] = useState(false);
  const [lastSent, setLastSent] = useState(0);

  const formatDateTime = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('id-ID', { weekday: 'short', day: '2-digit', month: '2-digit' }) + ' ' + 
           date.toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' });
  };

  const getTimeAgo = (date: Date) => {
    const seconds = Math.floor((Date.now() - date.getTime()) / 1000);
    if (seconds < 300) return "Online";
    return seconds < 3600 ? Math.floor(seconds/60) + "m lalu" : Math.floor(seconds/3600) + "j lalu";
  };

  const fetchData = async () => {
    const { data: bData } = await supabase.from('blocked_users').select('device_id');
    const { data: mData } = await supabase.from('messages').select('*').order('created_at', { ascending: true });
    
    if (bData) {
        setBlockedCount(bData.length); // Update jumlah blokir
        if (bData.some(b => b.device_id === localStorage.getItem('device_id'))) {
            window.location.replace("https://ipix.my.id/chat"); return;
        }
    }
    if (mData) setMessages(mData);
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

  useEffect(() => {
    if (mounted) {
      fetchData();
      const channel = supabase.channel('chat').on('postgres_changes', { event: '*', schema: 'public', table: 'messages' }, fetchData).subscribe();
      return () => { supabase.removeChannel(channel); };
    }
  }, [mounted]);

  const handleLogout = async () => {
    await supabase.auth.signOut();
    sessionStorage.clear();
    setIsAuth(false);
    window.location.reload();
  };

  const handleAuth = async () => {
    if (activeTab === 'admin') {
      const { error } = await supabase.auth.signInWithPassword({ email: adminEmail, password: adminPass });
      if (error) return alert("Gagal: " + error.message);
      setUsername('Admin●ipix.my.id');
    } else {
      if (!username.trim()) return alert("Masukkan nama!");
      sessionStorage.setItem('saved_username', username);
    }
    setIsAuth(true);
    sessionStorage.setItem('is_auth', 'true');
    sessionStorage.setItem('active_tab', activeTab);
  };

  const sendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || Date.now() - lastSent < 3000) return;
    await supabase.from('messages').insert([{ username, pesan: input.substring(0, 100), device_id: localStorage.getItem('device_id') || 'guest' }]);
    setLastSent(Date.now()); setInput('');
  };

  if (!mounted) return <div className="h-screen flex items-center justify-center bg-gray-900 text-white">Memuat...</div>;

  return (
    <div className="w-full max-w-2xl mx-auto h-dvh flex flex-col bg-gray-100 shadow-xl overflow-hidden">
      {!isAuth ? (
        <div className="flex flex-col items-center justify-center h-screen bg-gradient-to-br from-emerald-500 to-blue-600 text-white p-6">
          <h1 className="text-3xl font-bold mb-6">IpixChat</h1>
          <div className="flex gap-2 mb-6">
            <button className={`px-6 py-2 rounded-full font-bold ${activeTab === 'user' ? 'bg-blue-600 ring-2 ring-white' : 'bg-gray-400'}`} onClick={() => setActiveTab('user')}>User</button>
            <button className={`px-6 py-2 rounded-full font-bold ${activeTab === 'admin' ? 'bg-emerald-600 ring-2 ring-white' : 'bg-gray-400'}`} onClick={() => setActiveTab('admin')}>Admin</button>
          </div>
          {activeTab === 'user' ? <input maxLength={10} className="w-full max-w-sm p-3 rounded text-black mb-3" placeholder="Nama (Max 10)" onChange={(e) => setUsername(e.target.value)} /> : (
            <div className="w-full max-w-sm"><input className="w-full p-3 rounded text-black mb-3" placeholder="Email" type="email" onChange={(e) => setAdminEmail(e.target.value)} /><input type="password" className="w-full p-3 rounded text-black mb-3" placeholder="Password" onChange={(e) => setAdminPass(e.target.value)} /></div>
          )}
          <button onClick={handleAuth} className="bg-white text-emerald-600 px-8 py-3 rounded-full font-bold">Masuk</button>
        </div>
      ) : (
        <>
          <div className="sticky top-0 p-3 bg-white/30 backdrop-blur-md border-b text-center">
            <div className="absolute top-2 left-2 text-[10px] font-bold text-gray-700">Halo, {username}</div>
            <button onClick={handleLogout} className="absolute top-2 right-2 text-[9px] bg-red-500 text-white px-2 py-0.5 rounded">Keluar</button>
            <div className="text-lg font-black text-gray-800 mt-4">iPixChat</div>
            {/* Status jumlah blokir khusus admin */}
            {activeTab === 'admin' && <div className="text-[9px] text-red-500 font-bold mt-1">Total Diblokir: {blockedCount}</div>}
          </div>
          <div className="flex-1 overflow-y-auto p-3 space-y-3">
            {messages.map((m) => {
              const timeStatus = getTimeAgo(new Date(m.created_at));
              const isOnline = timeStatus === "Online";
              return (
                <div key={m.id} className="bg-white p-3 rounded-xl border shadow-sm">
                  <div className="flex justify-between items-center mb-1">
                    <div className="flex items-center gap-1.5">
                      <b className={m.username === 'Admin●ipix.my.id' ? "text-red-600 text-[10px]" : "text-blue-700 text-[10px]"}>{m.username}</b>
                      <span className={`w-1.5 h-1.5 rounded-full ${isOnline ? 'bg-green-500' : 'bg-gray-400'}`}></span>
                      <span className="text-[8px] text-gray-400">{timeStatus}</span>
                    </div>
                    <span className="text-[9px] text-gray-400">{formatDateTime(m.created_at)}</span>
                  </div>
                  <div className="text-sm text-gray-800 break-words">{m.pesan}</div>
                  {activeTab === 'admin' && (
                    <div className="flex gap-4 mt-2">
                      <button onClick={async () => { const n = prompt("Edit:", m.pesan); if(n) { await supabase.from('messages').update({ pesan: n }).eq('id', m.id); fetchData(); }}} className="text-[10px] text-blue-600 font-bold underline">Edit</button>
                      <button onClick={async () => { await supabase.from('messages').delete().eq('id', m.id); fetchData(); }} className="text-[10px] text-red-600 font-bold underline">Hapus</button>
                      {m.username !== 'Admin●ipix.my.id' && (
                        <button onClick={async () => { await supabase.from('blocked_users').insert([{ device_id: m.device_id }]); fetchData(); }} className="text-[10px] text-gray-600 font-bold underline">Blokir</button>
                      )}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
          <form onSubmit={sendMessage} className="p-3 bg-white border-t flex gap-2">
            <input maxLength={100} className="flex-1 border p-2 rounded-full px-4 text-sm text-black" value={input} onChange={(e) => setInput(e.target.value)} placeholder="Ketik pesan..." />
            <button className="bg-blue-600 text-white px-5 py-2 rounded-full font-bold text-sm">Kirim</button>
          </form>
        </>
      )}
    </div>
  );
}