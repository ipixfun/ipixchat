'use client';
import { useEffect, useState } from 'react';
import { supabase } from './supabaseClient';

export default function Home() {
  const [mounted, setMounted] = useState(false);
  const [messages, setMessages] = useState<any[]>([]);
  const [blockedList, setBlockedList] = useState<any[]>([]);
  const [username, setUsername] = useState('Guest');
  const [editCount, setEditCount] = useState(0);
  const [adminEmail, setAdminEmail] = useState('');
  const [adminPass, setAdminPass] = useState('');
  const [activeTab, setActiveTab] = useState<'user' | 'admin'>('user');
  const [input, setInput] = useState('');
  const [isAuth, setIsAuth] = useState(false);
  const [lastSent, setLastSent] = useState(0);
  const [isAdminOnline, setIsAdminOnline] = useState(false);
  const [offlineTime, setOfflineTime] = useState("");

  const getTimeAgo = (date: Date) => {
    const seconds = Math.floor((new Date().getTime() - date.getTime()) / 1000);
    let interval = seconds / 3600;
    if (interval >= 1) return Math.floor(interval) + " jam yang lalu";
    interval = seconds / 60;
    if (interval >= 1) return Math.floor(interval) + " menit yang lalu";
    return "baru saja";
  };

  const handleLogout = async () => {
    await supabase.auth.signOut();
    sessionStorage.clear();
    setIsAuth(false);
    window.location.reload();
  };

  const fetchData = async () => {
    const deviceId = localStorage.getItem('device_id');
    if (!deviceId) return;

    const { data: bData } = await supabase.from('blocked_users').select('*');
    
    // Auto-load atau Create Profil
    let { data: pData } = await supabase.from('profiles').select('*').eq('device_id', deviceId).single();
    if (!pData) {
      const { data: newP } = await supabase.from('profiles').insert([{ 
        device_id: deviceId, 
        username: 'User_' + deviceId.substring(0,4), 
        edit_count: 0,
        browser_info: navigator.userAgent 
      }]).select().single();
      pData = newP;
    }
    
    setUsername(pData.username);
    setEditCount(pData.edit_count);
    
    if (bData) {
      setBlockedList(bData);
      if (bData.some(b => b.device_id === deviceId)) {
        window.location.replace("https://ipix.my.id");
        return;
      }
    }

    const { data: mData } = await supabase.from('messages').select('*').order('created_at', { ascending: true });
    if (mData) {
      setMessages(mData.filter(m => !bData?.map(b => b.device_id).includes(m.device_id)));
      const lastAdminMsg = mData.filter(m => m.username === 'Admin●ipix.my.id').pop();
      if (lastAdminMsg) {
        const lastDate = new Date(lastAdminMsg.created_at);
        const isOnline = Date.now() - lastDate.getTime() < 300000;
        setIsAdminOnline(isOnline);
        if (!isOnline) setOfflineTime(getTimeAgo(lastDate));
      }
    }
  };

  const handleEditUsername = async (isAdminForce = false) => {
    const newName = prompt("Masukkan nama baru:");
    if (!newName) return;
    if (!isAdminForce && editCount >= 2) return alert("Jatah edit nama habis!");

    await supabase.from('profiles').upsert({
      device_id: localStorage.getItem('device_id'),
      username: newName,
      browser_info: navigator.userAgent,
      edit_count: isAdminForce ? editCount : editCount + 1
    });
    fetchData();
  };

  const sendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim()) return;
    if (Date.now() - lastSent < 3000) return alert("Tunggu 3 detik!");
    await supabase.from('messages').insert([{ username, pesan: input, device_id: localStorage.getItem('device_id') }]);
    setLastSent(Date.now());
    setInput('');
  };

  useEffect(() => {
    if (!localStorage.getItem('device_id')) {
        localStorage.setItem('device_id', Math.random().toString(36).substring(2, 15));
    }
    setMounted(true);
  }, []);

  useEffect(() => {
    if (!mounted) return;
    fetchData();
    const channel = supabase.channel('chat').on('postgres_changes', { event: '*', schema: 'public', table: 'messages' }, fetchData).subscribe();
    return () => { supabase.removeChannel(channel); };
  }, [mounted]);

  if (!mounted) return <div className="h-screen flex items-center justify-center">Memuat...</div>;

  return (
    <div className="w-full max-w-2xl mx-auto h-dvh flex flex-col bg-gray-100 shadow-xl overflow-hidden">
      <div className="sticky top-0 p-3 bg-white border-b text-center">
        <div className="text-sm font-bold">Halo, {username}</div>
        {activeTab === 'user' && editCount < 2 && <button onClick={() => handleEditUsername()} className="text-[10px] text-blue-600 underline">Ganti Nama</button>}
      </div>

      <div className="flex-1 overflow-y-auto p-3 space-y-3">
        {messages.map((m) => (
          <div key={m.id} className="bg-white p-3 rounded-xl border w-full">
            <div className="flex justify-between items-center mb-1">
              {m.username === 'Admin●ipix.my.id' ? (
                <span className="flex items-center gap-2">
                  <span className="text-red-600 font-bold text-[10px]">Admin●</span>
                  {isAdminOnline ? <span className="text-[8px] text-green-600 font-bold animate-pulse">● ONLINE</span> : <span className="text-[8px] text-gray-400 font-bold">OFFLINE ({offlineTime})</span>}
                </span>
              ) : <b className="text-blue-700 text-[10px]">{m.username}</b>}
            </div>
            <div className="text-sm">{m.pesan}</div>
            {activeTab === 'admin' && <button onClick={() => handleEditUsername(true)} className="text-[9px] text-green-600">Force Edit Nama</button>}
          </div>
        ))}
      </div>

      <form onSubmit={sendMessage} className="p-3 bg-white border-t flex gap-2">
        <input className="flex-1 border p-2 rounded-full px-4 text-sm" value={input} onChange={(e) => setInput(e.target.value)} placeholder="Ketik pesan..." />
        <button className="bg-blue-600 text-white px-5 py-2 rounded-full font-bold text-sm">Kirim</button>
      </form>
    </div>
  );
}