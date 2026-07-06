'use client';
import { useState, useEffect } from 'react';
import { supabase } from './supabaseClient';

export default function Home() {
  const [messages, setMessages] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [username, setUsername] = useState('');
  const [isAdmin, setIsAdmin] = useState(false);
  const [isLoggedIn, setIsLoggedIn] = useState(false);

  // Gunakan useEffect untuk mengakses storage agar tidak crash di server
  useEffect(() => {
    const logged = sessionStorage.getItem('isLoggedIn');
    const admin = sessionStorage.getItem('isAdmin');
    if (logged === 'true') {
      setIsLoggedIn(true);
      setIsAdmin(admin === 'true');
    }
    setLoading(false);
  }, []);

  useEffect(() => {
    if (!isLoggedIn) return;
    
    const fetchMessages = async () => {
      const { data } = await supabase.from('messages').select('*').order('created_at', { ascending: true });
      if (data) setMessages(data);
    };
    
    fetchMessages();
  }, [isLoggedIn]);

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    if (!username.trim()) return;
    
    // Login admin jika pass benar
    const isNowAdmin = (document.getElementById('pass') as HTMLInputElement).value === 'ipixfun';
    
    sessionStorage.setItem('isLoggedIn', 'true');
    sessionStorage.setItem('isAdmin', isNowAdmin ? 'true' : 'false');
    
    setIsAdmin(isNowAdmin);
    setIsLoggedIn(true);
  };

  if (loading) return <div className="p-10 text-center">Memuat aplikasi...</div>;

  if (!isLoggedIn) {
    return (
      <div className="flex h-screen items-center justify-center bg-gray-100">
        <form onSubmit={handleLogin} className="bg-white p-6 rounded shadow-md w-80 space-y-4">
          <input className="w-full border p-2 rounded" placeholder="Nama Anda" onChange={(e) => setUsername(e.target.value)} />
          <input id="pass" type="password" className="w-full border p-2 rounded" placeholder="Password (Admin)" />
          <button className="w-full bg-blue-500 text-white p-2 rounded">Masuk</button>
        </form>
      </div>
    );
  }

  return (
    <div className="max-w-md mx-auto h-screen flex flex-col bg-white">
      <div className="p-4 bg-gray-800 text-white font-bold">IpixChat {isAdmin && "(Admin)"}</div>
      <div className="flex-1 overflow-y-auto p-4 space-y-2">
        {messages.map((m) => (
          <div key={m.id} className="border-b p-1 flex justify-between items-center">
            <p className="text-sm"><b>{m.username}</b>: {m.pesan}</p>
            {isAdmin && (
              <button 
                onClick={async () => {
                  await supabase.from('blocked_users').insert([{ device_id: m.device_id, username: m.username }]);
                  alert("User diblokir!");
                }}
                className="bg-red-500 text-white text-[10px] px-2 py-1 rounded"
              >
                BLOCK
              </button>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}