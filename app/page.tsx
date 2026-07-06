'use client';

import { useEffect, useState } from 'react';
import { supabase } from './supabaseClient';

interface Message {
  id: number;
  username: string;
  pesan: string;
  created_at: string;
}

interface CustomEmoji {
  id: number;
  emoji: string;
}

export default function Home() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [emojis, setEmojis] = useState<CustomEmoji[]>([]);
  const [username, setUsername] = useState('');
  const [inputMessage, setInputMessage] = useState('');
  const [isLoggedIn, setIsLoggedIn] = useState(false);

  // Daftar emoji teks cepat bawaan aplikasi
  const popularEmojis = ['😀', '😂', '🔥', '👍', '🙏', '❤️', '👀', '💬'];

  // 1. Mengambil data saat user berhasil login
  useEffect(() => {
    if (!isLoggedIn) return;

    // Mengambil pilihan emoji GIF hasil kendali Anda dari database
    const fetchEmojis = async () => {
      const { data, error } = await supabase.from('custom_emojis').select('*');
      if (data) setEmojis(data);
      if (error) console.error('Gagal mengambil daftar emoji:', error);
    };

    // Mengambil histori pesan chat
    const fetchMessages = async () => {
      const { data, error } = await supabase
        .from('messages')
        .select('*')
        .order('created_at', { ascending: true });
      if (data) setMessages(data);
      if (error) console.error('Gagal mengambil histori chat:', error);
    };

    fetchEmojis();
    fetchMessages();

    // Mengaktifkan fitur Realtime Chat
    const channel = supabase
      .channel('room_chat')
      .on(
        'postgres_changes',
        { event: 'INSERT', schema: 'public', table: 'messages' },
        (payload) => {
          setMessages((prev) => [...prev, payload.new as Message]);
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [isLoggedIn]);

  // 2. Fungsi mengirim pesan teks biasa dari form input
  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputMessage.trim()) return;

    const { error } = await supabase
      .from('messages')
      .insert([{ username: username, pesan: inputMessage }]);

    if (error) {
      console.error('Gagal mengirim pesan teks:', error);
    } else {
      setInputMessage('');
    }
  };

  // 3. Fungsi saat tombol pilihan emoji teks diklik (ditambahkan ke dalam input teks)
  const handleAddTextEmoji = (emoji: string) => {
    setInputMessage((prev) => prev + emoji);
  };

  // 4. Fungsi saat tombol pilihan GIF Anda diklik (langsung terkirim)
  const handleSendGif = async (gifUrl: string) => {
    const { error } = await supabase
      .from('messages')
      .insert([{ username: username, pesan: gifUrl }]);

    if (error) {
      console.error('Gagal mengirim GIF:', error);
    }
  };

  // Fungsi pembantu untuk mengecek apakah teks adalah link gambar/GIF
  const isImageUrl = (text: string) => {
    if (!text.startsWith('http')) return false;
    
    const lowerText = text.toLowerCase();
    return (
      lowerText.endsWith('.gif') ||
      lowerText.endsWith('.png') ||
      lowerText.endsWith('.jpg') ||
      lowerText.endsWith('.jpeg')
    );
  };

  // Tampilan Halaman Login Sederhana (Input Nama)
  if (!isLoggedIn) {
    return (
      <div className="flex h-screen items-center justify-center bg-gray-100">
        <div className="w-full max-w-md p-6 bg-white rounded-lg shadow-md border border-gray-100">
          <h1 className="text-2xl font-bold mb-4 text-center text-gray-800">Masuk Chat Room</h1>
          <form onSubmit={(e) => { e.preventDefault(); if(username.trim()) setIsLoggedIn(true); }}>
            <input
              type="text"
              placeholder="Masukkan nama samaran Anda..."
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              className="w-full p-3 border rounded mb-4 focus:outline-none focus:ring-2 focus:ring-emerald-500 text-black bg-white"
              required
            />
            <button type="submit" className="w-full bg-gradient-to-r from-emerald-500 via-teal-500 to-blue-600 text-white p-3 rounded font-semibold hover:opacity-90 transition shadow-md">
              Mulai Chatting
            </button>
          </form>
        </div>
      </div>
    );
  }

  // Tampilan Utama Ruang Obrolan
  return (
    <div className="flex flex-col h-screen bg-gray-100 text-black">
      {/* Bagian Header - Hijau Gradasi Biru */}
      <div className="bg-gradient-to-r from-emerald-500 via-teal-500 to-blue-600 p-4 text-white font-bold text-center shadow-md">
        IpixChat Room 💬 (User: {username})
      </div>

      {/* Bagian Area Isi Pesan Chat - DIKEMBALIKAN KE ABU-ABU (`bg-gray-100`) */}
      <div className="flex-1 overflow-y-auto p-4 space-y-3 bg-gray-100">
        {messages.map((msg) => (
          <div key={msg.id} className={`flex flex-col ${msg.username === username ? 'items-end' : 'items-start'}`}>
            <span className="text-xs text-gray-500 mb-1 px-1">{msg.username}</span>
            <div className={`p-3 rounded-lg max-w-xs shadow-sm ${msg.username === username ? 'bg-gradient-to-r from-emerald-500 to-teal-500 text-white' : 'bg-white text-gray-800'}`}>
              
              {/* Cek apakah isi pesan merupakan URL gambar/GIF */}
              {isImageUrl(msg.pesan) ? (
                <img 
                  src={msg.pesan} 
                  alt="kiriman-gif" 
                  className="w-40 h-auto rounded block bg-white/50" 
                />
              ) : (
                /* Jika teks biasa */
                <span className="break-words font-medium">{msg.pesan}</span>
              )}

            </div>
          </div>
        ))}
      </div>

      {/* Bagian Input Box & Menu Pilihan Emoji + GIF */}
      <div className="bg-white border-t border-gray-200 p-4 flex flex-col gap-2 shadow-[0_-4px_6px_-1px_rgba(0,0,0,0.05)]">
        
        {/* BARIS 1: Daftar Pilihan Emoji Teks Cepat */}
        <div className="flex gap-2 overflow-x-auto pb-1 items-center">
          <span className="text-xs text-gray-400 font-bold whitespace-nowrap">Emoji:</span>
          {popularEmojis.map((emoji, index) => (
            <button
              key={index}
              type="button"
              onClick={() => handleAddTextEmoji(emoji)}
              className="text-xl p-1 hover:bg-gray-100 rounded transition active:scale-95 flex-shrink-0"
            >
              {emoji}
            </button>
          ))}
        </div>

        {/* BARIS 2: Daftar Pilihan GIF Kendalian Anda dari Database */}
        <div className="flex gap-3 overflow-x-auto pb-1 items-center border-t border-gray-100 pt-1">
          <span className="text-xs text-gray-400 font-bold whitespace-nowrap">GIF Anda:</span>
          {emojis.length === 0 ? (
            <span className="text-xs text-gray-400 italic">Belum ada koleksi GIF...</span>
          ) : (
            emojis.map((item) => (
              <button
                key={item.id}
                type="button"
                onClick={() => handleSendGif(item.emoji)}
                className="hover:scale-110 transition active:scale-95 border border-gray-200 rounded p-1 bg-gray-50 flex-shrink-0 shadow-sm"
                title="Klik untuk mengirim GIF ini"
              >
                <img src={item.emoji} alt="pilihan-gif" className="w-10 h-10 object-cover rounded" />
              </button>
            ))
          )}
        </div>

        {/* Form Kirim Pesan Teks Manual */}
        <form onSubmit={handleSendMessage} className="flex gap-2 mt-1">
          <input
            type="text"
            placeholder="Tulis pesan atau tempel link gambar di sini..."
            value={inputMessage}
            onChange={(e) => setInputMessage(e.target.value)}
            className="flex-1 p-3 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500 text-black bg-gray-50/50"
          />
          <button type="submit" className="bg-gradient-to-r from-emerald-500 to-teal-600 text-white px-6 rounded-lg font-semibold hover:opacity-95 transition shadow-sm">
            Kirim
          </button>
        </form>
      </div>
    </div>
  );
}
