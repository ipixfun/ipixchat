'use client';
import { useEffect, useState } from 'react';
import { supabase } from './supabaseClient';

export default function Home() {
  const [mounted, setMounted] = useState(false);
  const [messages, setMessages] = useState<any[]>([]);
  const [blockedList, setBlockedList] = useState<any[]>([]);
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
        <input type="password" className="w-full max-w-sm p-3 rounded text-black mb-3" placeholder="Password Admin" onChange={(e) => setAdminPass(e.target.value)} />
      )}
      <button onClick={() => { 
        if(activeTab === 'admin' && adminPass !== 'ipixfun') return alert('Pass Salah'); 
        if(activeTab === 'admin') setUsername('Admin●ipix.my.id'); 
        setIsAuth(true); 
      }} className="bg-white text-emerald-600 px-8 py-3 rounded-full font-bold">Masuk Chat</button>
    </div>
  );

  return (
    <div className="max-w-lg mx-auto h-screen flex flex-col bg-gray-100">
      <div className="p-4 bg-gradient-to-r from-emerald-500 to-blue-600 text-white font-bold text-center">
        <div>Tanggal: {new Date().toLocaleDateString('id-ID')}</div>
        <a href="https://ipix.my.id" target="_blank" className="underline text-sm">iPix Chat (ipix.my.id)</a>
      </div>
      
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {messages.map((m) => (
          <div key={m.id} className="bg-white p-3 rounded-lg border shadow-sm">
            <div className="flex justify-between items-center mb-1">
              {m.username === 'Admin●ipix.my.id' ? (
                <span>
                  <span className="text-red-600 font-bold text-[10px]">Admin●</span>
                  <a href="https://ipix.my.id" target="_blank" className="text-emerald-600 font-bold underline text-[10px]">ipix.my.id</a>
                </span>
              ) : <b className="text-blue-700 text-[10px]">{m.username}</b>}
              <span className="text-[9px] text-gray-400">
                {new Date(m.created_at).toLocaleDateString('id-ID', { weekday: 'short', day: 'numeric', month: 'short' })} | 
                {new Date(m.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
              </span>
            </div>
            <div className="text-sm text-gray-800 font-medium">{m.pesan}</div>
            {activeTab === 'admin' && m.username !== 'Admin●ipix.my.id' && (
              <div className="flex gap-2 mt-2">
                <button onClick={async () => { await supabase.from('messages').delete().eq('id', m.id); fetchData(); }} className="text-[9px] text-red-600 font-bold underline">Hapus</button>
                <button onClick={async () => { await supabase.from('blocked_users').insert([{ device_id: m.device_id }]); fetchData(); }} className="text-[9px] text-orange-600 font-bold underline">Blokir</button>
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

      <form onSubmit={async (e) => { e.preventDefault(); await supabase.from('messages').insert([{ username, pesan: input, device_id: localStorage.getItem('device_id') }]); setInput(''); }} className="p-4 bg-white border-t flex gap-2">
        <input className="flex-1 border p-2 rounded-full px-4 text-black" value={input} onChange={(e) => setInput(e.target.value)} placeholder="Tulis pesan..." />
        <button className="bg-blue-600 text-white px-4 rounded-full font-bold">Kirim</button>
      </form>
    </div>
  );
}