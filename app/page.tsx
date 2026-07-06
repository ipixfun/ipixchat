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
  const [isAdminOnline, setIsAdminOnline] = useState(false);
  const [offlineTime, setOfflineTime] = useState("");
  const [lastSent, setLastSent] = useState(0);

  const getTimeAgo = (date: Date) => {
    const seconds = Math.floor((new Date().getTime() - date.getTime()) / 1000);
    if (seconds < 60) return "baru saja";
    if (seconds < 3600) return Math.floor(seconds/60) + " menit lalu";
    return Math.floor(seconds/3600) + " jam lalu";
  };

  const fetchData = async () => {
    const deviceId = localStorage.getItem('device_id');
    if (!deviceId) return;

    // Load Profil
    let { data: pData } = await supabase.from('profiles').select('*').eq('device_id', deviceId).single();
    if (!pData) {
      const { data: newP } = await supabase.from('profiles').insert([{ device_id: deviceId, username: 'User_' + deviceId.substring(0,4), edit_count: 0, browser_info: navigator.userAgent }]).select().single();
      pData = newP;
    }
    setUsername(pData.username);
    setEditCount(pData.edit_count);

    // Load Data
    const { data: bData } = await supabase.from('blocked_users').select('*');
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
    setBlockedList(bData || []);
  };

  const handleEditUsername = async (isAdminForce = false, targetDeviceId?: string) => {
    const newName = prompt("Masukkan nama baru:");
    if (!newName) return;
    const targetId = isAdminForce ? targetDeviceId : localStorage.getItem('device_id');
    if (!isAdminForce && editCount >= 2) return alert("Jatah edit nama habis!");
    await supabase.from('profiles').upsert({ device_id: targetId, username: newName, edit_count: isAdminForce ? editCount : editCount + 1 });
    await supabase.from('messages').update({ username: newName }).eq('device_id', targetId);
    fetchData();
  };

  const handleEditMessage = async (id: string, text: string) => {
    const newText = prompt("Edit pesan:", text);
    if (newText) { await supabase.from('messages').update({ pesan: newText }).eq('id', id); fetchData(); }
  };

  const sendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || Date.now() - lastSent < 3000) return;
    await supabase.from('messages').insert([{ username, pesan: input, device_id: localStorage.getItem('device_id') }]);
    setLastSent(Date.now()); setInput('');
  };

  useEffect(() => {
    if (!localStorage.getItem('device_id')) localStorage.setItem('device_id', Math.random().toString(36).substring(2, 15));
    setMounted(true);
  }, []);

  useEffect(() => {
    if (!mounted) return;
    fetchData();
    const channel = supabase.channel('chat').on('postgres_changes', { event: '*', schema: 'public', table: 'messages' }, fetchData).subscribe();
    return () => { supabase.removeChannel(channel); };
  }, [mounted]);

  if (!isAuth) return (
    <div className="flex flex-col items-center justify-center h-screen bg-gradient-to-br from-blue-500 to-indigo-600 text-white p-6">
      <h1 className="text-3xl font-bold mb-6">iPixChat Login</h1>
      <div className="flex gap-4 mb-4 bg-white/20 p-2 rounded-full">
        <button onClick={() => setActiveTab('user')} className={`px-6 py-2 rounded-full ${activeTab === 'user' ? 'bg-white text-blue-600' : ''}`}>User</button>
        <button onClick={() => setActiveTab('admin')} className={`px-6 py-2 rounded-full ${activeTab === 'admin' ? 'bg-white text-blue-600' : ''}`}>Admin</button>
      </div>
      {activeTab === 'admin' && (
        <div className="w-full max-w-sm"><input className="w-full p-3 rounded mb-3 text-black" placeholder="Email" onChange={(e) => setAdminEmail(e.target.value)} /><input type="password" className="w-full p-3 rounded mb-3 text-black" placeholder="Pass" onChange={(e) => setAdminPass(e.target.value)} /></div>
      )}
      <button onClick={async() => { if(activeTab === 'admin') await supabase.auth.signInWithPassword({email:adminEmail, password:adminPass}); setIsAuth(true); }} className="bg-white text-blue-600 px-8 py-3 rounded-full font-bold">Masuk Chat</button>
    </div>
  );

  return (
    <div className="w-full max-w-2xl mx-auto h-dvh flex flex-col bg-gray-100">
      <div className="p-3 bg-white border-b flex justify-between items-center text-[10px]">
        <div className="flex flex-col">
          <div className="font-bold">{username}</div>
          {editCount < 2 && <button onClick={() => handleEditUsername()} className="text-blue-500 underline text-left">Ganti Nama</button>}
        </div>
        <div className="text-center font-bold">iPixChat<br/><span className="font-normal">ipix.my.id</span></div>
        <button onClick={() => window.location.reload()} className="bg-red-500 text-white px-3 py-1 rounded">Keluar</button>
      </div>

      <div className="flex-1 overflow-y-auto p-3 space-y-2">
        {messages.map(m => (
          <div key={m.id} className="bg-white p-3 rounded-lg border">
            <div className="flex justify-between text-[10px] text-gray-500 mb-1">
              {m.username === 'Admin●ipix.my.id' ? <span className="text-red-600 font-bold">Admin● {isAdminOnline ? 'ONLINE' : `OFFLINE (${offlineTime})`}</span> : <b>{m.username}</b>}
            </div>
            <div className="text-sm">{m.pesan}</div>
            {activeTab === 'admin' && m.username !== 'Admin●ipix.my.id' && (
              <div className="flex gap-2 mt-2">
                <button onClick={() => handleEditMessage(m.id, m.pesan)} className="text-blue-500 underline">Edit Teks</button>
                <button onClick={async() => { await supabase.from('messages').delete().eq('id', m.id); fetchData(); }} className="text-red-500 underline">Hapus</button>
                <button onClick={async() => { await supabase.from('blocked_users').insert([{device_id: m.device_id}]); fetchData(); }} className="text-orange-500 underline">Blokir</button>
                <button onClick={() => handleEditUsername(true, m.device_id)} className="text-green-500 underline">Edit Nama</button>
              </div>
            )}
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