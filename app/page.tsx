'use client';
import { useEffect, useState } from 'react';
import { supabase } from './supabaseClient';

interface Message {
  id: number;
  username: string;
  pesan: string;
  created_at: string;
  device_id: string;
  user_browser: string;
}

export default function Home() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [username, setUsername] = useState('');
  const [adminPass, setAdminPass] = useState('');
  const [inputMessage, setInputMessage] = useState('');
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [isAdmin, setIsAdmin] = useState(false);
  const [deviceId, setDeviceId] = useState('');

  useEffect(() => {
    let id = localStorage.getItem('device_id') || Math.random().toString(36).substring(2) + Date.now().toString(36);
    localStorage.setItem('device_id', id);
    setDeviceId(id);
  }, []);

  useEffect(() => {
    if (!isLoggedIn) return;
    const fetchMessages = async () => {
      const { data } = await supabase.from('messages').select('*').order('created_at', { ascending: true });
      if (data) setMessages(data as Message[]);
    };
    fetchMessages();
    const channel = supabase.channel('room_chat')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'messages' }, fetchMessages)
      .subscribe();
    return () => { supabase.removeChannel(channel); };
  }, [isLoggedIn]);

  const renderMessage = (text: string) => {
    const urlRegex = /(https?:\/\/[^\s]+)/g;
    return text.split(urlRegex).map((part, i) => {
      if (part.match(/\.(jpeg|jpg|gif|png)$/) != null) return <img key={i} src={part} className="max-w-xs rounded-lg mt-2" alt="img" />;
      return part;
    });
  };

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputMessage.trim()) return;
    await supabase.from('messages').insert([{ 
      username, 
      pesan: inputMessage, 
      device_id: deviceId,
      user_browser: navigator.userAgent 
    }]);
    setInputMessage('');
  };

  if (!isLoggedIn) {
    return (
      <div className="flex h-screen items-center justify-center bg-gray-100 p-4">
        <div className="w-full max-w-sm bg-white p-6 rounded-2xl shadow-xl space-y-4">
          <h1 className="text-xl font-black text-center text-emerald-600">IpixChat Final 💬</h1>
          <input className="w-full p-3 border rounded-xl text-black" placeholder="Nama Anda..." onChange={(e) => setUsername(e.target.value)} />
          <input type="password" placeholder="Password Admin" className="w-full p-3 border rounded-xl text-black" onChange={(e) => setAdminPass(e.target.value)} />
          <button onClick={() => { if(adminPass === 'ipixfun') setIsAdmin(true); if(username.trim()) setIsLoggedIn(true); }} className="w-full bg-emerald-500 text-white p-3 rounded-xl font-bold">Masuk Chat</button>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-screen w-full max-w-lg mx-auto bg-gray-100 overflow-hidden">
      <div className="bg-emerald-500 p-3 text-white font-bold text-center text-sm shadow-md">IpixChat Room</div>
      <div className="flex-1 overflow-y-auto p-3 space-y-3">
        {messages.map((msg) => (
          <div key={msg.id} className="bg-white p-3 rounded-lg shadow-sm border w-full">
            <div className="flex justify-between items-center mb-1">
              <span className="font-bold text-emerald-600 text-xs">{msg.username}</span>
              {isAdmin && (
                <button onClick={async () => { 
                  await supabase.from('blocked_users').insert([{ device_id: msg.device_id, username: msg.username, user_browser: msg.user_browser }]); 
                  alert("User Terblokir!"); 
                }} className="text-[9px] bg-red-100 text-red-600 px-1.5 py-0.5 rounded">BLOCK</button>
              )}
            </div>
            <p className="text-gray-800 break-words text-sm">{renderMessage(msg.pesan)}</p>
            {isAdmin && <p className="text-[8px] text-gray-400 mt-2 italic">{msg.user_browser.substring(0, 40)}...</p>}
          </div>
        ))}
      </div>
      <div className="bg-white border-t p-2">
        <form onSubmit={handleSendMessage} className="flex gap-2">
          <input value={inputMessage} onChange={(e) => setInputMessage(e.target.value)} className="flex-1 p-2 border rounded text-sm text-black" placeholder="Pesan..." />
          <button type="submit" className="bg-emerald-500 text-white px-4 rounded text-sm font-bold">Kirim</button>
        </form>
      </div>
    </div>
  );
}