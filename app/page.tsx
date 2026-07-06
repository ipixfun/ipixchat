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
      if (data && data.length > 0) window.location.href = "about:blank";
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

  // Fungsi Admin
  const deleteMsg = async (id: number) => { 
    await supabase.from('messages').delete().eq('id', id); 
    fetchData(); 
  };
  
  const blockUser = async (deviceId: string) => { 
    await supabase.from('blocked_users').insert([{ device_id: deviceId }]); 
    fetchData(); 
  };
  
  const unblock = async (id: string) => { 
    await supabase.from('blocked_users').delete().eq('device_id', id); 
    fetchData(); 
  };

  if (!mounted) return <div className="h-screen flex items-center justify-center bg-gray-900 text-white">Memuat...</div>;

  if (!isAuth) return (
    <div className="flex flex-col items-center justify-center h-screen bg-gradient-to-br from-emerald-500 to-blue-600 text-white p-6">
      <h1 className="text-3xl font-bold mb-6">IpixChat</h1>
      <input className="w-full max-w-sm p-3 rounded text-black mb-3" placeholder="Nama Anda" onChange={(e) => setUsername(e.target.value)} />
      {activeTab === 'admin' && <input type="password" className="w-full max-w-sm p-3 rounded text-black mb-3" placeholder="Pass Admin" onChange={(e) => setAdminPass(e.target.value)} />}
      <div className="flex gap-4 mb-4">
        <button className={activeTab === 'user' ? 'font-bold underline' : ''} onClick={() => setActiveTab('user')}>User</button>
        <button className={activeTab === 'admin' ? 'font-bold underline' : ''} onClick={() => setActiveTab('admin')}>Admin</button>
      </div>
      <button onClick={() => { if(activeTab === 'admin' && adminPass !== 'ipixfun') return alert('Pass Salah'); setIsAuth(true); }} className="bg-white text-blue-600 px-8 py-3 rounded-full font-bold">Masuk Chat</button>
    </div>
  );

  return (
    <div className="max-w-lg mx-auto h-screen flex flex-col bg-white shadow-2xl">
      <div className="p-4 bg-gradient-to-r from-emerald-500 to-blue-600 text-white font-bold text-center">
        {new Date().toLocaleDateString('id-ID', { weekday: 'long', day: 'numeric', month: 'long' })}
      </div>
      
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {messages.map((m) => (
          <div key={m.id} className="border-b pb-2 group">
            <div className="text-[10px] text-gray-400 flex justify-between">
              <b>{m.username}</b>
              <span>{new Date(m.created_at).toLocaleTimeString()}</span>
            </div>
            <div className="text-sm">{m.pesan}</div>
            {activeTab === 'admin' && (
              <div className="flex gap-3 mt-1">
                <button onClick={() => deleteMsg(m.id)} className="text-[9px] text-red-500 font-bold">HAPUS</button>
                <button onClick={() => blockUser(m.device_id)} className="text-[9px] text-orange-500 font-bold">BLOKIR</button>
              </div>
            )}
          </div>
        ))}
      </div>

      {activeTab === 'admin' && (
        <div className="p-2 bg-gray-100 text-[10px]">
          <strong>User Terblokir:</strong> {blockedList.map(b => <span key={b.device_id} className="mr-2 cursor-pointer text-blue-600" onClick={() => unblock(b.device_id)}>{b.device_id.substring(0,5)} (x)</span>)}
        </div>
      )}

      <form onSubmit={async (e) => { e.preventDefault(); await supabase.from('messages').insert([{ username, pesan: input, device_id: localStorage.getItem('device_id') }]); setInput(''); }} className="p-4 border-t flex gap-2">
        <input className="flex-1 border p-2 rounded-full px-4" value={input} onChange={(e) => setInput(e.target.value)} placeholder="Tulis pesan..." />
        <button className="bg-blue-600 text-white px-4 rounded-full">Kirim</button>
      </form>
    </div>
  );
}