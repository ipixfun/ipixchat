'use client';
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
  const [inputMessage, setInputMessage] = useState('');
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [isAdmin, setIsAdmin] = useState(false);
  const [password, setPassword] = useState('');
  const [deviceId, setDeviceId] = useState('');

  useEffect(() => {
    // Generate/Get Device ID
    let id = localStorage.getItem('device_id');
    if (!id) {
      id = Math.random().toString(36).substring(2) + Date.now().toString(36);
      localStorage.setItem('device_id', id);
    }
    setDeviceId(id);

    // Cek apakah perangkat diblokir
    const checkBlocked = async () => {
      const { data } = await supabase.from('blocked_users').select('device_id').eq('device_id', id);
      if (data && data.length > 0) {
        alert("Akses ditolak: Perangkat ini diblokir.");
        window.location.href = "about:blank";
      }
    };
    checkBlocked();
  }, []);

  useEffect(() => {
    if (!isLoggedIn) return;
    
    const fetchMessages = async () => {
      const { data } = await supabase.from('messages').select('*').order('created_at', { ascending: true });
      if (data) setMessages(data as Message[]);
    };
    fetchMessages();

    const channel = supabase.channel('room_chat')
      .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'messages' }, (payload) => {
        setMessages((prev) => [...prev, payload.new as Message]);
      })
      .on('postgres_changes', { event: 'DELETE', schema: 'public', table: 'messages' }, (payload) => {
        setMessages((prev) => prev.filter((msg) => msg.id !== payload.old.id));
      })
      .subscribe();

    return () => { supabase.removeChannel(channel); };
  }, [isLoggedIn]);

  const handleLogin = () => {
    if (password === 'ipixfun') setIsAdmin(true);
    if (username.trim()) setIsLoggedIn(true);
  };

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputMessage.trim()) return;
    await supabase.from('messages').insert([{ username, pesan: inputMessage, device_id: deviceId }]);
    setInputMessage('');
  };

  const handleBan = async (targetDeviceId: string) => {
    await supabase.from('blocked_users').insert([{ device_id: targetDeviceId }]);
    alert("Perangkat diblokir!");
  };

  const handleDelete = async (id: number) => {
    await supabase.from('messages').delete().eq('id', id);
  };

  if (!isLoggedIn) {
    return (
      <div className="flex h-screen items-center justify-center bg-gray-100">
        <div className="w-80 p-6 bg-white rounded-xl shadow-lg border-t-4 border-emerald-500">
          <h1 className="text-xl font-bold mb-4 text-center text-emerald-600">IpixChat</h1>
          <input className="w-full p-3 mb-2 border rounded text-black" placeholder="Nama..." onChange={(e) => setUsername(e.target.value)} />
          <input type="password" className="w-full p-3 mb-4 border rounded text-black" placeholder="Password Admin (opsional)..." onChange={(e) => setPassword(e.target.value)} />
          <button onClick={handleLogin} className="w-full bg-gradient-to-r from-emerald-500 to-blue-600 text-white p-3 rounded font-bold">Mulai Chat</button>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-screen bg-gray-100">
      <div className="bg-gradient-to-r from-emerald-500 to-blue-600 p-4 text-white font-bold text-center shadow-md">IpixChat Room</div>
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {messages.map((msg) => (
          <div key={msg.id} className="bg-white p-4 rounded-lg shadow-sm">
            <div className="flex justify-between items-center mb-1">
              <span className="font-bold text-emerald-600 text-sm">{msg.username}</span>
              {isAdmin && (
                <div className="flex gap-2">
                  <button onClick={() => handleBan(msg.device_id)} className="text-orange-500 text-xs font-bold underline">Block</button>
                  <button onClick={() => handleDelete(msg.id)} className="text-red-500 text-xs font-bold underline">Hapus</button>
                </div>
              )}
            </div>
            <p className="text-gray-800 break-words">{msg.pesan}</p>
            <div className="text-[10px] text-gray-400 mt-2 font-mono">
              {new Date(msg.created_at).toLocaleDateString('id-ID', { weekday: 'long', day: '2-digit', month: '2-digit', year: 'numeric' })} : {new Date(msg.created_at).toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' })}
            </div>
          </div>
        ))}
      </div>
      <form onSubmit={handleSendMessage} className="p-4 bg-white border-t flex gap-2">
        <input value={inputMessage} onChange={(e) => setInputMessage(e.target.value)} className="flex-1 p-3 border rounded text-black" placeholder="Ketik pesan..." />
        <button type="submit" className="bg-emerald-500 text-white px-6 rounded font-bold">Kirim</button>
      </form>
    </div>
  );
}
