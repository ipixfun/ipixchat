'use client';
import { useEffect, useState } from 'react';
import { supabase } from './supabaseClient';

export default function Home() {
  const [messages, setMessages] = useState<any[]>([]);
  const [username, setUsername] = useState('');
  const [adminPass, setAdminPass] = useState('');
  const [activeTab, setActiveTab] = useState<'user' | 'admin'>('user');
  const [input, setInput] = useState('');
  const [isAuth, setIsAuth] = useState(false);

  // 1. Fetch & Realtime
  useEffect(() => {
    const fetch = async () => {
      const { data } = await supabase.from('messages').select('*').order('created_at', { ascending: true });
      if (data) setMessages(data);
    };
    fetch();
    const channel = supabase.channel('realtime').on('postgres_changes', { event: '*', schema: 'public', table: 'messages' }, fetch).subscribe();
    return () => { supabase.removeChannel(channel); };
  }, []);

  // 2. Fitur Hapus & Blokir
  const deleteMsg = async (id: number) => { await supabase.from('messages').delete().eq('id', id); };
  const blockUser = async (deviceId: string) => { await supabase.from('blocked_users').insert([{ device_id: deviceId }]); alert("User Terblokir!"); };

  // 3. Render Pesan + Emoji + URL Image
  const renderContent = (text: string) => {
    return text.split(/(https?:\/\/[^\s]+\.(?:jpg|png|gif))/gi).map((part, i) => {
      if (part.match(/\.(jpg|png|gif)$/i)) return <img key={i} src={part} className="max-w-xs rounded mt-2" />;
      return <span key={i}>{part} </span>;
    });
  };

  if (!isAuth) {
    return (
      <div className="flex flex-col items-center justify-center h-screen bg-slate-900 text-white p-6">
        <h1 className="text-3xl font-bold mb-8">IpixChat System</h1>
        <div className="flex w-full max-w-sm bg-white rounded-xl p-1 mb-4">
          <button className={`flex-1 py-2 rounded-lg ${activeTab === 'user' ? 'bg-blue-500 text-white' : 'text-black'}`} onClick={() => setActiveTab('user')}>User</button>
          <button className={`flex-1 py-2 rounded-lg ${activeTab === 'admin' ? 'bg-red-500 text-white' : 'text-black'}`} onClick={() => setActiveTab('admin')}>Admin</button>
        </div>
        <input className="w-full max-w-sm p-3 rounded-lg text-black mb-3" placeholder="Nama" onChange={(e) => setUsername(e.target.value)} />
        {activeTab === 'admin' && <input type="password" className="w-full max-w-sm p-3 rounded-lg text-black mb-3" placeholder="Pass Admin" onChange={(e) => setAdminPass(e.target.value)} />}
        <button onClick={() => { if(activeTab === 'admin' && adminPass !== 'ipixfun') return alert('Password Salah'); setIsAuth(true); }} className="w-full max-w-sm bg-emerald-500 p-3 rounded-lg font-bold">Masuk</button>
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto h-screen flex flex-col bg-white shadow-2xl">
      <div className="p-4 bg-gray-900 text-white flex justify-between items-center">
        <span className="font-bold">IpixChat {activeTab === 'admin' ? '(MOD)' : ''}</span>
        <span className="text-xs">{new Date().toLocaleString('id-ID')}</span>
      </div>
      
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {messages.map((m) => (
          <div key={m.id} className="border-b pb-2">
            <div className="flex justify-between text-[10px] text-gray-500">
              <b>{m.username}</b>
              <span>{new Date(m.created_at).toLocaleTimeString()}</span>
            </div>
            <div className="text-sm">{renderContent(m.pesan)}</div>
            {activeTab === 'admin' && (
              <div className="flex gap-2 mt-2">
                <button onClick={() => deleteMsg(m.id)} className="bg-red-500 text-white text-[9px] px-2 py-1">Hapus</button>
                <button onClick={() => blockUser(m.device_id)} className="bg-black text-white text-[9px] px-2 py-1">Blokir Device</button>
              </div>
            )}
          </div>
        ))}
      </div>

      <form onSubmit={async (e) => { e.preventDefault(); await supabase.from('messages').insert([{ username, pesan: input }]); setInput(''); }} className="p-4 border-t flex gap-2">
        <input className="flex-1 border p-2 rounded" value={input} onChange={(e) => setInput(e.target.value)} placeholder="Ketik pesan..." />
        <button className="bg-blue-600 text-white px-4 rounded">Kirim</button>
      </form>
    </div>
  );
}