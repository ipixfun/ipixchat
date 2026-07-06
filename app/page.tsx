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

  const handleLogout = async () => {
    await supabase.auth.signOut();
    sessionStorage.clear();
    setIsAuth(false);
    window.location.reload();
  };

  useEffect(() => {
    const checkAuth = async () => {
      // Cek sesi Supabase
      const { data: { session } } = await supabase.auth.getSession();
      
      // Ambil data dari sessionStorage
      const savedAuth = sessionStorage.getItem('is_auth');
      const savedUser = sessionStorage.getItem('saved_username');
      const savedTab = sessionStorage.getItem('active_tab');

      if (session || savedAuth === 'true') {
        setIsAuth(true);
        setUsername(savedUser || '');
        setActiveTab((savedTab as 'user' | 'admin') || 'user');
      }
      setMounted(true);
    };
    checkAuth();
  }, []);

  const fetchData = async () => {
    const { data: bData } = await supabase.from('blocked_users').select('*');
    const { data: mData } = await supabase.from('messages').select('*').order('created_at', { ascending: true });
    if (bData) setBlockedList(bData);
    if (mData) {
      const bIds = bData?.map(b => b.device_id) || [];
      setMessages(mData.filter(m => !bIds.includes(m.device_id)));
    }
  };

  useEffect(() => {
    if (!mounted) return;
    fetchData();
    const channel = supabase.channel('chat').on('postgres_changes', { event: '*', schema: 'public', table: 'messages' }, fetchData).subscribe();
    return () => { supabase.removeChannel(channel); };
  }, [mounted]);

  const handleAdminLogin = async () => {
    const { error } = await supabase.auth.signInWithPassword({
      email: adminEmail,
      password: adminPass,
    });
    if (error) {
      alert("Login Admin Gagal: " + error.message);
    } else {
      setIsAuth(true);
      setActiveTab('admin');
      setUsername('Admin●ipix.my.id');
      sessionStorage.setItem('is_auth', 'true');
      sessionStorage.setItem('saved_username', 'Admin●ipix.my.id');
      sessionStorage.setItem('active_tab', 'admin');
    }
  };

  const handleUserLogin = () => {
    setIsAuth(true);
    sessionStorage.setItem('is_auth', 'true');
    sessionStorage.setItem('saved_username', username);
    sessionStorage.setItem('active_tab', 'user');
  };

  const sendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim()) return;
    const now = Date.now();
    if (now - lastSent < 3000) {
        alert("Jangan spam! Tunggu 3 detik ya.");
        return;
    }
    await supabase.from('messages').insert([{ username, pesan: input, device_id: sessionStorage.getItem('device_id') || 'guest' }]);
    setLastSent(now);
    setInput('');
  };

  const editMsg = async (id: number) => {
    const currentMsg = messages.find(m => m.id === id);
    const newText = prompt("Edit pesan:", currentMsg?.pesan || "");
    if (newText !== null) {
        await supabase.from('messages').update({ pesan: newText }).eq('id', id);
        fetchData();
    }
  };

  const unblock = async (id: string) => { await supabase.from('blocked_users').delete().eq('device_id', id); fetchData(); };

  if (!mounted) return <div className="h-screen flex items-center justify-center bg-gray-900 text-white">Memuat...</div>;

  if (!isAuth) return (
    <div className="flex flex-col items-center justify-center h-screen bg-gradient-to-br from-emerald-500 to-blue-600 text-white p-6">
      <h1 className="text-3xl font-bold mb-6">IpixChat Login</h1>
      <div className="flex gap-4 mb-6">
        <button className={`px-6 py-2 rounded-full font-bold ${activeTab === 'user' ? 'bg-blue-600 ring-2 ring-white' : 'bg-gray-400'}`} onClick={() => setActiveTab('user')}>User</button>
        <button className={`px-6 py-2 rounded-full font-bold ${activeTab === 'admin' ? 'bg-emerald-600 ring-2 ring-white' : 'bg-gray-400'}`} onClick={() => setActiveTab('admin')}>Admin</button>
      </div>
      {activeTab === 'user' ? (
        <input className="w-full max-w-sm p-3 rounded text-black mb-3" placeholder="Nama Anda" onChange={(e) => setUsername(e.target.value)} />
      ) : (
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
      <div className="sticky top-0 z-10 p-3 bg-white/30 backdrop-blur-md border-b border-white/20 text-center">
        <button onClick={handleLogout} className="absolute top-4 right-4 text-[10px] bg-red-500 text-white px-3 py-1 rounded-full">Keluar</button>
        <div className="text-lg font-black text-gray-800">iPixChat</div>
        <a href="https://ipix.my.id" target="_blank" className="text-emerald-700 font-bold text-[10px] underline">ipix.my.id</a>
      </div>
      
      <div className="flex-1 overflow-y-auto p-3 space-y-3">
        {messages.map((m) => (
          <div key={m.id} className="bg-white p-3 rounded-xl border border-gray-100 shadow-sm w-full">
            <div className="flex justify-between items-center mb-1">
              {m.username === 'Admin●ipix.my.id' ? (
                <span className="flex items-center gap-1">
                  <span className="text-red-600 font-bold text-[10px]">Admin●</span>
                  <a href="https://ipix.my.id" target="_blank" className="text-emerald-600 font-bold underline text-[10px]">ipix.my.id</a>
                </span>
              ) : <b className="text-blue-700 text-[10px]">{m.username}</b>}
              <span className="text-[9px] text-gray-400 whitespace-nowrap ml-2">
                {new Date(m.created_at).toLocaleDateString('id-ID', { weekday: 'short', day: 'numeric', month: 'short' })} | 
                {new Date(m.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
              </span>
            </div>
            <div className="text-sm text-gray-800 break-words">{m.pesan}</div>
            {activeTab === 'admin' && (
              <div className="flex gap-4 mt-2">
                <button onClick={() => editMsg(m.id)} className="text-[10px] text-blue-600 font-bold underline">Edit</button>
                <button onClick={async () => { await supabase.from('messages').delete().eq('id', m.id); fetchData(); }} className="text-[10px] text-red-600 font-bold underline">Hapus</button>
                {m.username !== 'Admin●ipix.my.id' && (
                  <button onClick={async () => { await supabase.from('blocked_users').insert([{ device_id: m.device_id }]); fetchData(); }} className="text-[10px] text-orange-600 font-bold underline">Blokir</button>
                )}
              </div>
            )}
          </div>
        ))}
      </div>

      {activeTab === 'admin' && (
        <div className="p-3 bg-gray-300 text-[10px] border-t">
          <strong>User Terblokir:</strong> {blockedList.map(b => <span key={b.device_id} className="mr-2 cursor-pointer text-blue-800 underline" onClick={() => unblock(b.device_id)}>{b.device_id.substring(0,5)} (Unblock)</span>)}
        </div>
      )}

      <form onSubmit={sendMessage} className="p-3 bg-white border-t flex gap-2 items-center">
        <input className="flex-1 border p-2 rounded-full px-4 text-sm text-black" value={input} onChange={(e) => setInput(e.target.value)} placeholder="Ketik pesan..." />
        <button className="bg-blue-600 text-white px-5 py-2 rounded-full font-bold text-sm shrink-0">Kirim</button>
      </form>
    </div>
  );
}