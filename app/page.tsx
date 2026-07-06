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
  const [deviceId, setDeviceId] = useState('');

  // 1. Setup Device ID & Cek Blokir
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
        alert("Perangkat Anda telah diblokir!");
        window.location.href = "about:blank";
      }
    };
    checkBlocked();
  }, []);

  // 2. Ambil data & Listener Realtime
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

  // 3. Fungsi Aksi Admin
  const handleBan = async (targetDeviceId: string) => {
    if (confirm("Blokir perangkat ini selamanya?")) {
      await supabase.from('blocked_users').insert([{ device_id: targetDeviceId }]);
      alert("Perangkat diblokir!");
    }
  };

  const handleDelete = async (id: number) => {
    await supabase.from('messages').delete().eq('id', id);
  };

  // 4. Kirim Pesan (Menyertakan device_id)
  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputMessage.trim()) return;
    await supabase.from('messages').insert([{ 
      username, 
      pesan: inputMessage, 
      device_id: deviceId 
    }]);
    setInputMessage('');
  };

  if (!isLoggedIn) {
    return (
      <div className="flex h-screen items-center justify-center bg-gray-100">
        <div className="bg-white p-8 rounded-lg shadow-md w-80 text-center">
          <input className="w-full p-2 border rounded mb-2 text-black" placeholder="Nama Anda..." onChange={(e) => setUsername(e.target.value)} />
          <button onClick={() => { if(username === 'ipixfun') setIsAdmin(true); setIsLoggedIn(true); }} className="w-full bg-blue-600 text-white p-2 rounded">Mulai</button>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-screen bg-gray-100 p-4">
      <div className="flex-1 overflow-y-auto pb-20">
        {messages.map((msg) => (
          <div key={msg.id} className="mb-4 bg-white p-3 rounded shadow-sm">
            <div className="flex justify-between items-center">
              <span className="font-bold text-sm text-emerald-600">{msg.username}</span>
              {isAdmin && (
                <div className="flex gap-2">
                  <button onClick={() => handleBan(msg.device_id)} className="text-orange-500 text-[10px]">Ban</button>
                  <button onClick={() => handleDelete(msg.id)} className="text-red-500 text-[10px]">Hapus</button>
                </div>
              )}
            </div>
            <p className="text-gray-800">{msg.pesan}</p>
            <div className="text-[10px] text-gray-400 mt-2">
              {new Date(msg.created_at).toLocaleDateString('id-ID', { weekday: 'long', day: '2-digit', month: '2-digit', year: 'numeric' })} : 
              {new Date(msg.created_at).toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' })}
            </div>
          </div>
        ))}
      </div>
      
      <form onSubmit={handleSendMessage} className="fixed bottom-0 left-0 w-full p-4 bg-white border-t flex gap-2">
        <input value={inputMessage} onChange={(e) => setInputMessage(e.target.value)} className="flex-1 p-2 border rounded" placeholder="Pesan..." />
        <button type="submit" className="bg-emerald-500 text-white px-4 rounded">Kirim</button>
      </form>
    </div>
  );
}
