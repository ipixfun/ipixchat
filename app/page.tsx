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
  const [adminPass, setAdminPass] = useState('');
  const [deviceId, setDeviceId] = useState('');

  useEffect(() => {
    let id = localStorage.getItem('device_id') || Math.random().toString(36).substring(2) + Date.now().toString(36);
    localStorage.setItem('device_id', id);
    setDeviceId(id);
  }, []);

  useEffect(() => {
    if (!isLoggedIn) return;
    
    const channel = supabase.channel('room_chat')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'messages' }, () => {
        fetchMessages();
      })
      .subscribe();

    fetchMessages();
    return () => { supabase.removeChannel(channel); };
  }, [isLoggedIn]);

  const fetchMessages = async () => {
    const { data } = await supabase.from('messages').select('*').order('created_at', { ascending: true });
    if (data) setMessages(data as Message[]);
  };

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputMessage.trim()) return;
    await supabase.from('messages').insert([{ username, pesan: inputMessage, device_id: deviceId }]);
    setInputMessage('');
  };

  const renderMessage = (text: string) => {
    const urlRegex = /(https?:\/\/[^\s]+)/g;
    return text.split(urlRegex).map((part, i) => {
      if (part.match(/\.(jpeg|jpg|gif|png)$/) != null) return <img key={i} src={part} className="max-w-xs rounded-lg mt-2" alt="img" />;
      return part;
    });
  };

  if (!isLoggedIn) {
    return (
      <div className="flex h-screen items-center justify-center bg-gray-100 p-4">
        <div className="w-full max-w-sm bg-white p-6 rounded-2xl shadow-xl">
          <h1 className="text-xl font-black text-center text-emerald-600 mb-4">IpixChat V5</h1>
          <input className="w-full p-3 mb-2 border rounded-xl text-black" placeholder="Nama Anda..." onChange={(e) => setUsername(e.target.value)} />
          <input type="password" className="w-full p-3 mb-4 border rounded-xl text-black" placeholder="Admin Key (Opsional)..." onChange={(e) => setAdminPass(e.target.value)} />
          <button onClick={() => { 
            if(adminPass === 'ipixfun') setIsAdmin(true);
            if(username.trim()) setIsLoggedIn(true); 
          }} className="w-full bg-emerald-500 text-white p-3 rounded-xl font-bold">Masuk Chat</button>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-screen w-full max-w-lg mx-auto bg-gray-100">
      <div className="bg-emerald-500 p-4 text-white font-bold text-center">IpixChat Room</div>
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {messages.map((msg) => (
          <div key={msg.id} className="bg-white p-3 rounded-lg shadow-sm border">
            <div className="flex justify-between text-xs font-bold text-emerald-600">
              {msg.username}
              {isAdmin && (
                <button onClick={async () => await supabase.from('messages').delete().eq('id', msg.id)} className="text-red-500 underline">Hapus</button>
              )}
            </div>
            <p className="text-gray-800 break-words mt-1">{renderMessage(msg.pesan)}</p>
          </div>
        ))}
      </div>
      <div className="bg-white p-2 border-t">
        <div className="flex gap-2 overflow-x-auto mb-2 text-xl">
          {['😊', '😂', '🔥', '❤️', '🚀', '✨'].map(e => (
            <button key={e} onClick={() => setInputMessage(p => p + e)}>{e}</button>
          ))}
        </div>
        <form onSubmit={handleSendMessage} className="flex gap-2">
          <input value={inputMessage} onChange={(e) => setInputMessage(e.target.value)} className="flex-1 p-2 border rounded text-black" />
          <button type="submit" className="bg-emerald-500 text-white px-4 rounded">Kirim</button>
        </form>
      </div>
    </div>
  );
}

