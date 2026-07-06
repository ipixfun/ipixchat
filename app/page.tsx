'use client';
import { useEffect, useState } from 'react';
import { supabase } from './supabaseClient'; // Pastikan path ke file client supabase Anda benar

interface Message {
  id: number;
  username: string;
  pesan: string;
  created_at: string;
}

export default function Home() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [username, setUsername] = useState('');
  const [inputMessage, setInputMessage] = useState('');
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [isAdmin, setIsAdmin] = useState(false);
  const [isAdminMode, setIsAdminMode] = useState(false);
  const [password, setPassword] = useState('');

  // 1. Ambil data pesan & Realtime
  useEffect(() => {
    if (!isLoggedIn) return;

    const fetchMessages = async () => {
      const { data } = await supabase
        .from('messages')
        .select('*')
        .order('created_at', { ascending: true });
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

  // 2. Fungsi Kirim & Hapus
  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputMessage.trim()) return;
    await supabase.from('messages').insert([{ username, pesan: inputMessage }]);
    setInputMessage('');
  };

  const handleDelete = async (id: number) => {
    await supabase.from('messages').delete().eq('id', id);
  };

  // 3. Logic Login
  const handleLogin = () => {
    if (isAdminMode) {
      if (password === 'ipixfun') { // GANTI PASSWORD DI SINI
        setIsAdmin(true);
        setIsLoggedIn(true);
      } else {
        alert('Password Admin Salah!');
      }
    } else if (username.trim()) {
      setIsLoggedIn(true);
    }
  };

  // Tampilan Halaman Login
  if (!isLoggedIn) {
    return (
      <div className="flex h-screen items-center justify-center bg-gray-100">
        <div className="bg-white p-8 rounded-lg shadow-md w-80">
          <h1 className="text-xl font-bold mb-4 text-center">IpixChat Login</h1>
          <div className="flex gap-2 mb-4">
            <button onClick={() => setIsAdminMode(false)} className={`flex-1 p-2 rounded ${!isAdminMode ? 'bg-emerald-500 text-white' : 'bg-gray-200'}`}>User</button>
            <button onClick={() => setIsAdminMode(true)} className={`flex-1 p-2 rounded ${isAdminMode ? 'bg-red-500 text-white' : 'bg-gray-200'}`}>Admin</button>
          </div>
          <input className="w-full p-2 border rounded mb-2 text-black" placeholder="Username..." onChange={(e) => setUsername(e.target.value)} />
          {isAdminMode && <input type="password" className="w-full p-2 border rounded mb-2 text-black" placeholder="Password Admin..." onChange={(e) => setPassword(e.target.value)} />}
          <button onClick={handleLogin} className="w-full bg-blue-600 text-white p-2 rounded">Mulai Chatting</button>
        </div>
      </div>
    );
  }

  // Tampilan Chat
  return (
    <div className="flex flex-col h-screen bg-gray-100 p-4">
      <div className="flex-1 overflow-y-auto pb-20">
        {messages.map((msg) => (
          <div key={msg.id} className="mb-4 bg-white p-3 rounded shadow-sm">
            <div className="flex justify-between">
              <span className="font-bold text-sm text-emerald-600">{msg.username}</span>
              {isAdmin && <button onClick={() => handleDelete(msg.id)} className="text-red-500 text-[10px]">Hapus</button>}
            </div>
            <p className="text-gray-800">{msg.pesan}</p>
            <div className="text-[10px] text-gray-400 mt-2">
              {new Date(msg.created_at).toLocaleDateString('id-ID', { weekday: 'long', day: '2-digit', month: '2-digit', year: 'numeric' })}
              {' : '}
              {new Date(msg.created_at).toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' })}
            </div>
          </div>
        ))}
      </div>
      
      <form onSubmit={handleSendMessage} className="fixed bottom-0 left-0 w-full p-4 bg-white border-t flex gap-2">
        <input value={inputMessage} onChange={(e) => setInputMessage(e.target.value)} className="flex-1 p-2 border rounded" placeholder="Ketik pesan..." />
        <button type="submit" className="bg-emerald-500 text-white px-4 rounded">Kirim</button>
      </form>
    </div>
  );
}