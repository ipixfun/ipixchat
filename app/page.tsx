'use client';
import { useEffect, useState } from 'react';
import { supabase } from './supabaseClient';

export default function Home() {
  const [mounted, setMounted] = useState(false);
  const [messages, setMessages] = useState<any[]>([]);
  const [username, setUsername] = useState('');
  const [adminPass, setAdminPass] = useState('');
  const [activeTab, setActiveTab] = useState<'user' | 'admin'>('user');
  const [input, setInput] = useState('');
  const [isAuth, setIsAuth] = useState(false);

  // 1. Inisialisasi & Anti-Hydration
  useEffect(() => {
    setMounted(true);
    // Cek apakah device ini diblokir saat pertama kali buka
    const checkBlock = async () => {
      const deviceId = localStorage.getItem('device_id') || Math.random().toString(36).substring(7);
      localStorage.setItem('device_id', deviceId);
      const { data } = await supabase.from('blocked_users').select('device_id').eq('device_id', deviceId);
      if (data && data.length > 0) {
        alert("Anda diblokir!");
        window.location.href = "about:blank";
      }
    };
    checkBlock();
  }, []);

  // 2. Fetch Pesan & Realtime
  useEffect(() => {
    if (!mounted) return;
    const fetch = async () => {
      const { data } = await supabase.from('messages').select('*').order('created_at', { ascending: true });
      if (data) setMessages(data);
    };
    fetch();
    const channel = supabase.channel('chat').on('postgres_changes', { event: '*', schema: 'public', table: 'messages' }, fetch).subscribe();
    return () => { supabase.removeChannel(channel); };
  }, [mounted]);

  // 3. Render Media
  const renderContent = (text: string) => {
    return text.split(/(https?:\/\/[^\s]+\.(?:jpg|png|gif))/gi).map((part, i) => {
      if (part.match(/\.(jpg|png|gif)$/i)) return <img key={i} src={part} className="max-w-[200px] rounded-lg mt-2 shadow" />;
      return <span key={i}>{part}</span>;
    });
  };

  if (!mounted) return <div className="p-10 text-center">Memuat Sistem...</div>;

  if (!isAuth) {
    return (
      <div className="flex flex-col items-center justify-center h-screen bg-slate-900 text-white p-6">
        <h1 className="text-2xl font-bold mb-6">IpixChat Login</h1>
        <div className="flex w-full max-w-sm bg-white rounded-lg p-1 mb-4">
          <button className={`flex-1 py-2 rounded ${activeTab === 'user' ? 'bg-blue-500' : 'text-black'}`} onClick={() => setActiveTab('user')}>User</button>
          <button className={`flex-1 py-2 rounded ${activeTab === 'admin' ? 'bg-red-500' : 'text-black'}`} onClick={() => setActiveTab('admin')}>Admin</button>
        </div>
        <input className="w-full max-w-sm p-3 rounded mb-3 text-black" placeholder="Nama" onChange={(e) => setUsername(e.target.value)} />
        {activeTab === 'admin' && <input type="password" className="w-full max-w-sm p-3 rounded mb-3 text-black" placeholder="Password Admin" onChange={(e) => setAdminPass(e.target.value)} />}
        <button onClick={() => { if(activeTab === 'admin' && adminPass !== 'ipixfun') return alert('Pass Salah'); setIsAuth(true); }} className="w-full max-w-sm bg-emerald-500 p-3 rounded font-bold">Masuk Chat</button>
      </div>
    );
  }

  return (
    <div className="max-w-lg mx-auto h-screen flex flex-col bg-white border-x">
      <div className="p-4 bg-gray-900 text-white flex justify-between">
        <span className="font-bold">IpixChat {activeTab === 'admin' ? '(ADMIN)' : ''}</span>
        <span className="text-xs">{new Date().toLocaleTimeString()}</span>
      </div>
      
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {messages.map((m) => (
          <div key={m.id} className="border-b pb-2">
            <div className="flex justify-between text-[10px] text-gray-500">
              <b>{m.username}</b>
              <span>{new Date(m.created_at).toLocaleTimeString()}</span>
            </div>
            <div className="text-sm py-1">{renderContent(m.pesan)}</div>
            {activeTab === 'admin' && (
              <button onClick={async () => { 
                await supabase.from('blocked_users').insert([{ device_id: m.device_id }]); 
                alert("User Terblokir!"); 
              }} className="bg-red-500 text-white text-[9px] px-2 py-1 mt-1 rounded">BLOCK DEVICE</button>
            )}
          </div>
        ))}
      </div>

      <form onSubmit={async (e) => { e.preventDefault(); await supabase.from('messages').insert([{ username, pesan: input, device_id: localStorage.getItem('device_id') }]); setInput(''); }} className="p-4 border-t flex gap-2">
        <input className="flex-1 border p-2 rounded" value={input} onChange={(e) => setInput(e.target.value)} placeholder="Ketik pesan..." />
        <button className="bg-blue-600 text-white px-4 rounded">Kirim</button>
      </form>
    </div>
  );
}