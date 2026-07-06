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
  const [adminName, setAdminName] = useState('');
  const [adminPass, setAdminPass] = useState('');
  const [inputMessage, setInputMessage] = useState('');
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [isAdmin, setIsAdmin] = useState(false);
  const [deviceId, setDeviceId] = useState('');
  const [isBlocked, setIsBlocked] = useState(false); // State pelindung utama di frontend

  // 1. Inisialisasi Device ID & Cek Status Blokir dari Database
  useEffect(() => {
    let id = localStorage.getItem('device_id');
    if (!id) {
      id = Math.random().toString(36).substring(2) + Date.now().toString(36);
      localStorage.setItem('device_id', id);
    }
    setDeviceId(id);

    const checkBlocked = async () => {
      const { data } = await supabase
        .from('blocked_users')
        .select('device_id')
        .eq('device_id', id);
      
      if (data && data.length > 0) {
        setIsBlocked(true); // Langsung kunci aplikasi jika terdaftar di DB
      }
    };
    checkBlocked();
  }, []);

  // 2. Load Pesan Awal & Langganan Realtime Teroptimasi
  useEffect(() => {
    if (!isLoggedIn || isBlocked) return;

    const fetchMessages = async () => {
      const { data } = await supabase
        .from('messages')
        .select('*')
        .order('created_at', { ascending: true });
      if (data) setMessages(data as Message[]);
    };
    fetchMessages();

    // OPTIMASI: Menggunakan payload langsung untuk INSERT/DELETE, bukan fetch ulang seluruh DB
    const channel = supabase.channel('room_chat')
      .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'messages' }, (payload) => {
        setMessages((prev) => [...prev, payload.new as Message]);
      })
      .on('postgres_changes', { event: 'DELETE', schema: 'public', table: 'messages' }, (payload) => {
        setMessages((prev) => prev.filter((msg) => msg.id !== payload.old.id));
      })
      .subscribe();

    return () => { 
      supabase.removeChannel(channel); 
    };
  }, [isLoggedIn, isBlocked]);

  // 3. Fungsi Render Gambar dengan Dukungan Query Parameter URL
  const renderMessage = (text: string) => {
    const urlRegex = /(https?:\/\/[^\s]+)/g;
    return text.split(urlRegex).map((part, i) => {
      if (part.match(/\.(jpeg|jpg|gif|png)(\?.*)?$/i) != null) {
        return (
          <img 
            key={i} 
            src={part} 
            className="max-w-xs rounded-lg mt-2 shadow-md" 
            alt="Kiriman gambar" 
          />
        );
      }
      return part;
    });
  };

  // 4. Handler Kirim Pesan dengan Proteksi Ganda (Client + Server Catch)
  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputMessage.trim() || isBlocked) return;

    const { error } = await supabase.from('messages').insert([
      { username, pesan: inputMessage, device_id: deviceId }
    ]);

    // Jika ditolak oleh RLS Supabase karena device terblokir
    if (error) {
      alert("Gagal mengirim pesan! Perangkat Anda terdeteksi diblokir.");
      setIsBlocked(true);
    } else {
      setInputMessage('');
    }
  };

  // --- TAMPILAN 1: BILA DEVICE TERBLOKIR (TOTAL LOCKDOWN) ---
  if (isBlocked) {
    return (
      <div className="flex h-screen items-center justify-center bg-red-50 p-4">
        <div className="w-full max-w-md bg-white p-8 rounded-2xl shadow-xl text-center space-y-4 border border-red-200">
          <div className="text-4xl">🚫</div>
          <h1 className="text-xl font-black text-red-600">Akses Dilarang</h1>
          <p className="text-gray-600 text-sm">
            Perangkat browser Anda telah diblokir secara permanen dari room chat ini karena melanggar aturan.
          </p>
        </div>
      </div>
    );
  }

  // --- TAMPILAN 2: HALAMAN LOGIN ---
  if (!isLoggedIn) {
    return (
      <div className="flex h-screen items-center justify-center bg-gray-100 p-4">
        <div className="w-full max-w-md bg-white p-8 rounded-2xl shadow-xl space-y-6">
          <h1 className="text-2xl font-black text-center text-emerald-600">IpixChat 💬</h1>
          
          <div className="p-4 border rounded-xl border-emerald-100 bg-emerald-50">
            <label className="text-[10px] font-bold text-emerald-600 uppercase">User Biasa</label>
            <input className="w-full p-3 mt-1 border rounded-lg text-black" placeholder="Nama..." onChange={(e) => setUsername(e.target.value)} />
            <button onClick={() => { if(username.trim()) setIsLoggedIn(true); }} className="w-full mt-3 bg-emerald-500 text-white p-2 rounded-lg font-bold">Masuk</button>
          </div>

          <div className="p-4 border rounded-xl border-blue-100 bg-blue-50">
            <label className="text-[10px] font-bold text-blue-600 uppercase">Admin Akses</label>
            <input className="w-full p-3 mt-1 border rounded-lg text-black" placeholder="Username Admin" onChange={(e) => setAdminName(e.target.value)} />
            <input type="password" placeholder="Password" className="w-full p-3 mt-2 border rounded-lg text-black" onChange={(e) => setAdminPass(e.target.value)} />
            <button onClick={() => { if(adminPass === 'ipixfun') { setIsAdmin(true); setUsername(adminName); setIsLoggedIn(true); } else alert("Password Salah!"); }} className="w-full mt-3 bg-blue-600 text-white p-2 rounded-lg font-bold">Login Admin</button>
          </div>
        </div>
      </div>
    );
  }

  // --- TAMPILAN 3: CHAT ROOM UTAMA ---
  return (
    <div className="flex flex-col h-screen bg-gray-100">
      <div className="bg-emerald-500 p-4 text-white font-bold text-center flex justify-between items-center">
        <span>💬 IpixChat Room</span>
        {isAdmin && <span className="text-[10px] bg-blue-700 px-2.5 py-1 rounded-full uppercase tracking-wider">Admin Mode</span>}
      </div>
      
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {messages.map((msg) => (
          <div key={msg.id} className="bg-white p-4 rounded-lg shadow-sm border border-gray-100">
            <div className="flex justify-between items-start mb-2">
              <span className="font-bold text-emerald-600 text-sm">{msg.username}</span>
              {isAdmin && (
                <div className="flex gap-2">
                  <button 
                    onClick={async () => { 
                      await supabase.from('blocked_users').insert([{ device_id: msg.device_id }]); 
                      alert(`Device ID milik "${msg.username}" berhasil diblokir di database!`); 
                    }} 
                    className="text-[10px] bg-orange-100 text-orange-600 px-2 py-1 rounded font-bold hover:bg-orange-200 transition"
                  >
                    BLOCK
                  </button>
                  <button 
                    onClick={async () => await supabase.from('messages').delete().eq('id', msg.id)} 
                    className="text-[10px] bg-red-100 text-red-600 px-2 py-1 rounded font-bold hover:bg-red-200 transition"
                  >
                    HAPUS
                  </button>
                </div>
              )}
            </div>
            <p className="text-gray-800 break-words">{renderMessage(msg.pesan)}</p>
          </div>
        ))}
      </div>
      
      <div className="bg-white border-t p-2">
        <div className="flex gap-2 mb-2 overflow-x-auto pb-1">
          {['😊', '😂', '😍', '😎', '👍', '🔥', '❤️', '🎉', '🤔', '🙌', '🚀', '✨'].map((emoji) => (
            <button key={emoji} type="button" onClick={() => setInputMessage((prev) => prev + emoji)} className="text-xl hover:bg-gray-100 p-1 rounded">{emoji}</button>
          ))}
        </div>
        <form onSubmit={handleSendMessage} className="flex gap-2">
          <input value={inputMessage} onChange={(e) => setInputMessage(e.target.value)} className="flex-1 p-3 border rounded text-black animate-none" placeholder="Pesan atau URL Gambar..." />
          <button type="submit" className="bg-emerald-500 text-white px-6 rounded font-bold active:scale-95 transition">Kirim</button>
        </form>
      </div>
    </div>
  );
}