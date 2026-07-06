use client';
import { useEffect, useState } from 'react';
import { supabase } from './supabaseClient';

interface Message {
  id: number;
  username: string;
  pesan: string;
  created_at: string;
  device_id: string;
}

export default function Home() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [username, setUsername] = useState('');
  const [adminName, setAdminName] = useState('');
  const [adminPass, setAdminPass] = useState('');
  const [inputMessage, setInputMessage] = useState('');
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [isAdmin, setIsAdmin] = useState(false);
  const [deviceId, setDeviceId] = useState('');

  // 1. Setup ID & Cek Blokir
  useEffect(() => {
    let id = localStorage.getItem('device_id') || Math.random().toString(36).substring(2) + Date.now().toString(36);
    localStorage.setItem('device_id', id);
    setDeviceId(id);

    const checkBlocked = async () => {
      const { data } = await supabase.from('blocked_users').select('device_id').eq('device_id', id);
      if (data && data.length > 0) window.location.href = "about:blank";
    };
    checkBlocked();
  }, []);

  // 2. Realtime Listener
  useEffect(() => {
    if (!isLoggedIn) return;
    const fetchMessages = async () => {
      const { data } = await supabase.from('messages').select('*').order('created_at', { ascending: true });
      if (data) setMessages(data as Message[]);
    };
    fetchMessages();
    const channel = supabase.channel('room_chat').on('postgres_changes', { event: '*', schema: 'public', table: 'messages' }, fetchMessages).subscribe();
    return () => { supabase.removeChannel(channel); };
  }, [isLoggedIn]);

  const renderMessage = (text: string) => {
    const urlRegex = /(https?:\/\/[^\s]+)/g;
    return text.split(urlRegex).map((part, i) => {
      if (part.match(/\.(jpeg|jpg|gif|png)$/) != null) return <img key={i} src={part} className="max-w-xs rounded-lg mt-2 shadow-md" />;
      return part;
    });
  };

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputMessage.trim()) return;
    await supabase.from('messages').insert([{ username, pesan: inputMessage, device_id: deviceId }]);
    setInputMessage('');
  };

  if (!isLoggedIn) {
    return (
      <div className="flex h-screen items-center justify-center bg-gray-100 p-4">
        <div className="w-full max-w-sm bg-white p-6 rounded-2xl shadow-xl space-y-5">
          <h1 className="text-xl font-black text-center text-emerald-600">IpixChat 💬</h1>
          
          <div className="p-3 border rounded-xl border-emerald-100 bg-emerald-50">
            <label className="text-[9px] font-bold text-emerald-600 uppercase">User Biasa</label>
            <input className="w-full p-2 mt-1 border rounded-lg text-sm text-black" placeholder="Nama..." onChange={(e) => setUsername(e.target.value)} />
            <button onClick={() => { if(username.trim()) setIsLoggedIn(true); }} className="w-full mt-2 bg-emerald-500 text-white p-2 rounded-lg font-bold text-sm">Masuk</button>
          </div>

          <div className="p-3 border rounded-xl border-blue-100 bg-blue-50">
            <label className="text-[9px] font-bold text-blue-600 uppercase">Admin Akses</label>
            <input className="w-full p-2 mt-1 border rounded-lg text-sm text-black" placeholder="Username" onChange={(e) => setAdminName(e.target.value)} />
            <input type="password" placeholder="Password" className="w-full p-2 mt-1 border rounded-lg text-sm text-black" onChange={(e) => setAdminPass(e.target.value)} />
            <button onClick={() => { if(adminPass === 'ipixfun') { setIsAdmin(true); setUsername(adminName); setIsLoggedIn(true); } else alert("Password Salah!"); }} className="w-full mt-2 bg-blue-600 text-white p-2 rounded-lg font-bold text-sm">Login Admin</button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-screen w-full max-w-lg mx-auto bg-gray-100 overflow-hidden">
      <div className="bg-emerald-500 p-3 text-white font-bold text-center shadow-md shrink-0 text-sm">💬 IpixChat Room</div>
      
      <div className="flex-1 overflow-y-auto p-3 space-y-3 w-full">
        {messages.map((msg) => (
          <div key={msg.id} className="bg-white p-3 rounded-lg shadow-sm border border-gray-100 w-full">
            <div className="flex justify-between items-start mb-1">
              <span className="font-bold text-emerald-600 text-xs">{msg.username}</span>
              {isAdmin && (
                <div className="flex gap-1">
                  <button onClick={async () => { await supabase.from('blocked_users').insert([{ device_id: msg.device_id }]); alert("Terblokir!"); }} className="text-[9px] bg-orange-100 text-orange-600 px-1.5 py-0.5 rounded font-bold">BLOCK</button>
                  <button onClick={async () => await supabase.from('messages').delete().eq('id', msg.id)} className="text-[9px] bg-red-100 text-red-600 px-1.5 py-0.5 rounded font-bold">HAPUS</button>
                </div>
              )}
            </div>
            <p className="text-gray-800 break-words text-sm">{renderMessage(msg.pesan)}</p>
            <div className="text-[8px] text-gray-400 mt-1 font-mono">
              {new Date(msg.created_at).toLocaleDateString('id-ID', { weekday: 'long', day: '2-digit', month: '2-digit', year: 'numeric' })} : {new Date(msg.created_at).toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' })}
            </div>
          </div>
        ))}
      </div>
      
      <div className="bg-white border-t p-2 shrink-0">
        <div className="flex gap-1 mb-2 overflow-x-auto pb-1 text-lg">
          {['😊', '😂', '😍', '😎', '👍', '🔥', '❤️', '🎉', '🤔', '🙌', '🚀', '✨'].map((emoji) => (
            <button key={emoji} type="button" onClick={() => setInputMessage((prev) => prev + emoji)} className="hover:bg-gray-100 rounded px-1">{emoji}</button>
          ))}
        </div>
        <form onSubmit={handleSendMessage} className="flex gap-2">
          <input value={inputMessage} onChange={(e) => setInputMessage(e.target.value)} className="flex-1 p-2 border rounded text-sm text-black" placeholder="Pesan atau URL..." />
          <button type="submit" className="bg-emerald-500 text-white px-4 py-1 rounded text-sm font-bold">Kirim</button>
        </form>
      </div>
    </div>
  );
}