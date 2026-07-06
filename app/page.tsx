'use client';
import { useState, useEffect } from 'react';
import { supabase } from './supabaseClient';

export default function Home() {
  const [messages, setMessages] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [username, setUsername] = useState('');
  const [isAdmin, setIsAdmin] = useState(false);
  const [isLoggedIn, setIsLoggedIn] = useState(false);

  useEffect(() => {
    // Cek sesi agar tidak crash di server
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
    if (!username.trim()) return alert("Masukkan nama!");
    
    const pass = (document.getElementById('pass') as HTMLInputElement).value;
    const isNowAdmin = pass === 'ipixfun';
    
    sessionStorage.setItem('isLoggedIn', 'true');
    sessionStorage.setItem('isAdmin', isNowAdmin ? 'true' : 'false');
    
    setIsAdmin(isNowAdmin);
    setIsLoggedIn(true);
  };

  if (loading) return <div className="p-10 text-center">Loading...</div>;

  if (!isLoggedIn) {
    return (
      <div className="flex h-screen items-center justify-center bg-gray-100 p-4">
        <form onSubmit={handleLogin} className="bg-white p-6 rounded-2xl shadow-xl w-full max-w-xs space-y-4">
          <h2 className="text-center font-bold text-lg">IpixChat Login</h2>
          <input className="w-full border p-3 rounded-lg" placeholder="Nama Anda" onChange={(e) => setUsername(e.target.value)} />
          <input id="pass" type="password" className="w-full border p-3 rounded-lg" placeholder="Password (Admin)" />
          <button className="w-full bg-blue-600 text-white p-3 rounded-lg font-bold">Masuk Chat</button>
        </form>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-screen w-full max-w-lg mx-auto bg-gray-50 shadow-2xl border-x border-gray-200">
      {/* Header */}
      <div className="p-4 bg-gray-900 text-white font-bold flex justify-between items-center shadow-md">
        <span>IpixChat {isAdmin && " (Admin)"}</span>
      </div>

      {/* List Pesan */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {messages.map((m) => (
          <div key={m.id} className="bg-white p-3 rounded-xl shadow-sm border w-full">
            <div className="flex justify-between items-start mb-1">
              <span className="text-[10px] font-bold text-blue-600 uppercase">{m.username}</span>
              {isAdmin && (
                <button 
                  onClick={async () => {
                    await supabase.from('blocked_users').insert([{ device_id: m.device_id, username: m.username }]);
                    alert("User " + m.username + " diblokir!");
                  }}
                  className="bg-red-500 hover:bg-red-600 text-white text-[9px] px-2 py-1 rounded font-bold shrink-0 ml-2"
                >
                  BLOCK
                </button>
              )}
            </div>
            <p className="text-sm text-gray-800 break-words">{m.pesan}</p>
          </div>
        ))}
      </div>
    </div>
  );
}