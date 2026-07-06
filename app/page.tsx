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

  useEffect(() => {
    setMounted(true);
    const checkAccess = async () => {
      const deviceId = localStorage.getItem('device_id') || Math.random().toString(36).substring(7);
      localStorage.setItem('device_id', deviceId);
      const { data } = await supabase.from('blocked_users').select('device_id').eq('device_id', deviceId);
      if (data && data.length > 0) {
        alert("Maaf yang sopan, anda terblokir dari IpixChat");
        window.location.href = "https://ipix.my.id";
      }
    };
    checkAccess();
  }, []);

  const fetchData = async () => {
    const { data: mData } = await supabase.from('messages').select('*').order('created_at', { ascending: true });
    const { data: bData } = await supabase.from('blocked_users').select('device_id');
    const bIds = bData?.map(b => b.device_id) || [];
    if (mData) setMessages(mData.filter(m => !bIds.includes(m.device_id)));
  };

  useEffect(() => {
    if (!mounted) return;
    fetchData();
    const channel = supabase.channel('chat').on('postgres_changes', { event: '*', schema: 'public', table: 'messages' }, fetchData).subscribe();
    return () => { supabase.removeChannel(channel); };
  }, [mounted]);

  if (!mounted) return <div className="h-screen flex items-center justify-center bg-gray-900 text-white">Memuat...</div>;

  if (!isAuth) return (
    <div className="flex flex-col items-center justify-center h-screen bg-gradient-to-br from-emerald-500 to-blue-600 text-white p-6">
      <h1 className="text-3xl font-bold mb-6">IpixChat</h1>
      
      {/* Pilihan Login */}
      <div className="flex gap-4 mb-6">
        <button className={activeTab === 'user' ? 'underline font-bold' : ''} onClick={() => setActiveTab('user')}>User</button>
        <button className={activeTab === 'admin' ? 'underline font-bold' : ''} onClick={() => setActiveTab('admin')}>Admin</button>
      </div>

      {activeTab === 'user' ? (
        <input className="w-full max-w-sm p-3 rounded text-black mb-3" placeholder="Nama Anda" onChange={(e) => setUsername(e.target.value)} />
      ) : (
        <input type="password" className="w-full max-w-sm p-3 rounded text-black mb-3" placeholder="Password Admin" onChange={(e) => setAdminPass(e.target.value)} />
      )}

      <button onClick={() => { 
        if(activeTab === 'admin') {
          if(adminPass !== 'ipixfun') return alert('Pass Salah');
          setUsername('ipix.my.id'); // Nama otomatis jadi ipix.my.id
        }
        setIsAuth(true); 
      }} className="bg-white text-emerald-600 px-8 py-3 rounded-full font-bold">Masuk Chat</button>
    </div>
  );

  return (
    <div className="max-w-lg mx-auto h-screen flex flex-col bg-gray-100">
      <div className="p-4 bg-gradient-to-r from-emerald-500 to-blue-600 text-white font-bold text-center">IpixChat</div>
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {messages.map((m) => (
          <div key={m.id} className="bg-white p-3 rounded-lg border border-gray-200">
            <div className="text-[10px] text-gray-500 flex justify-between">
              {/* Jika user melihat "ipix.my.id", dia bisa klik link-nya */}
              {m.username === 'ipix.my.id' ? (
                <a href="https://ipix.my.id" target="_blank" className="text-emerald-600 font-bold underline">ipix.my.id</a>
              ) : (
                <b className="text-blue-700">{m.username}</b>
              )}
            </div>
            <div className="text-sm text-gray-800 font-medium py-1">{m.pesan}</div>
            {activeTab === 'admin' && (
              <button onClick={async () => { await supabase.from('messages').delete().eq('id', m.id); fetchData(); }} className="text-[9px] text-red-600 font-bold">HAPUS</button>
            )}
          </div>
        ))}
      </div>
      <form onSubmit={async (e) => { e.preventDefault(); await supabase.from('messages').insert([{ username, pesan: input, device_id: localStorage.getItem('device_id') }]); setInput(''); }} className="p-4 bg-white border-t flex gap-2">
        <input className="flex-1 border p-2 rounded-full px-4 text-black" value={input} onChange={(e) => setInput(e.target.value)} placeholder="Tulis pesan..." />
        <button className="bg-blue-600 text-white px-4 rounded-full font-bold">Kirim</button>
      </form>
    </div>
  );
}