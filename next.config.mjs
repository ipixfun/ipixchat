/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true, // Membantu mendeteksi masalah di React selama development
  
  /* 
    Catatan Tambahan (Opsional): 
    Karena aplikasi Anda adalah aplikasi chat yang mendukung gambar (m.image_url), 
    jika ke depannya Anda ingin beralih menggunakan komponen bawaan Next.js `<Image />` 
    dari `next/image` untuk optimasi gambar dari Supabase, Anda bisa membuka komentar (uncomment) blok di bawah ini:
  */
  /*
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: '*.supabase.co', // Mengizinkan URL gambar dari Supabase Storage
      },
    ],
  },
  */
};

export default nextConfig;