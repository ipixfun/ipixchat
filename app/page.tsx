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

  // 1. Inisialisasi Device & Cek Blokir
  useEffect(() => {
    let id = localStorage.getItem('device_id');
    if (!id) {
      id = Math.random().toString(36).substring(2) + Date.now().toString(36);
      localStorage.setItem('device_id', id);
    }
    setDeviceId(id);

    const checkBlocked = async () => {
      const { data } = await supabase.from('blocked_users').select('device_id').eq('device_id', id);
      if (data && data.length > 0) {
        alert("🚫 Akses Ditolak: Perangkat Anda diblokir.");
        window.location.href = "about:blank";
      }
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

    const channel = supabase.channel('room_chat')
      .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'messages' }, (payload) => setMessages((prev) => [...prev, payload.new as Message]))
      .on('postgres_changes', { event: 'DELETE', schema: 'public', table: 'messages' }, (payload) => setMessages((prev) => prev.filter((msg) => msg.id !== payload.old.id)))
      .subscribe();

    return () => { supabase.removeChannel(channel); };
  }, [isLoggedIn]);

  const handleLogin = () => {
    if (password === 'ipixfun') setIsAdmin(true);
    if (username.trim()) setIsLoggedIn(true);
    else alert("Nama wajib diisi!");
  };

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputMessage.trim()) return;
    // Tambahkan regex sederhana untuk mendeteksi link gambar
    await supabase.from('messages').insert([{ username, pesan: inputMessage, device_id: deviceId }]);
    setInputMessage('');
  };

  const handleBan = async (targetDeviceId: string) => {
    if (confirm("⚠️ Yakin ingin memblokir perangkat ini?")) {
      await supabase.from('blocked_users').insert([{ device_id: targetDeviceId }]);
      alert("✅ Berhasil diblokir!");
    }
  };

  const handleDelete = async (id: number) => {
    await supabase.from('messages').delete().eq('id', id);
  };

  // Render Link Gambar (Fungsi Deteksi URL Gambar)
  const renderMessage = (text: string) => {
    const urlRegex = /(https?:\/\/[^\s]+)/g;
    return text.split(urlRegex).map((part, i) => {
      if (part.match(/\.(jpeg|jpg|gif|png)$/) != null) {
        return <img key={i} src={part} alt="chat-img" className="max-w-xs rounded-lg mt-2 shadow-md" />;
      }
      return part;
    });
  };

  if (!isLoggedIn) {
    return (
      <div className="flex h-screen items-center justify-center bg-gray-100 p-4">
        <div className="w-full max-w-md bg-white p-8 rounded-2xl shadow-xl border border-gray-100">
          <h1 className="text-2xl font-black text-center text-emerald-600 mb-6">✨ IpixChat Login ✨</h1>
          <div className="flex gap-4">
            <div className="flex-1">
              <label className="text-[10px] font-bold text-gray-500 uppercase">Nama</label>
              <input className="w-full p-3 mt-1 border border-gray-200 rounded-xl bg-gray-50 text-black text-sm" placeholder="Nama anda" onChange={(e) => setUsername(e.target.value)} />
            </div>
            <div className="flex-1">
              <label className="text-[10px] font-bold text-gray-500 uppercase">Admin Key</label>
              <input type="password" className="w-full p-3 mt-1 border border-gray-200 rounded-xl bg-gray-50 text-black text-sm" placeholder="Password" onChange={(e) => setPassword(e.target.value)} />
            </div>
          </div>
          <button onClick={handleLogin} className="w-full mt-6 bg-gradient-to-r from-emerald-500 to-blue-600 text-white p-3 rounded-xl font-bold hover:shadow-lg transition-all">Mulai Chatting 🚀</button>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-screen bg-gray-100">
      <div className="bg-gradient-to-r from-emerald-500 to-blue-600 p-4 text-white font-bold text-center shadow-md">💬 IpixChat Room</div>
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {messages.map((msg) => (
          <div key={msg.id} className="bg-white p-4 rounded-lg shadow-sm border border-gray-100">
            <div className="flex justify-between items-start mb-2">
              <span className="font-bold text-emerald-600 text-sm">{msg.username}</span>
              {isAdmin && (
                <div className="flex gap-2">
                  <button onClick={() => handleBan(msg.device_id)} className="text-[10px] bg-orange-100 text-orange-600 px-2 py-1 rounded font-bold">BLOCK</button>
                  <button onClick={() => handleDelete(msg.id)} className="text-[10px] bg-red-100 text-red-600 px-2 py-1 rounded font-bold">HAPUS</button>
                </div>
              )}
            </div>
            <p className="text-gray-800 break-words">{renderMessage(msg.pesan)}</p>
            <div className="text-[10px] text-gray-400 mt-2 font-mono italic">
              📅 {new Date(msg.created_at).toLocaleDateString('id-ID', { weekday: 'long', day: '2-digit', month: '2-digit', year: 'numeric' })} | ⏰ {new Date(msg.created_at).toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' })}
            </div>
          </div>
        ))}
      </div>
      <form onSubmit={handleSendMessage} className="p-4 bg-white border-t flex gap-2">
        <input value={inputMessage} onChange={(e) => setInputMessage(e.target.value)} className="flex-1 p-3 border rounded text-black" placeholder="Ketik pesan atau URL gambar..." />
        <button type="submit" className="bg-emerald-500 text-white px-6 rounded font-bold">Kirim</button>
      </form>
    </div>
  );
}
