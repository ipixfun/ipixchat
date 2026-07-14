/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  
  // Menambahkan rewrite untuk sistem link otomatis
  async rewrites() {
    return [
      {
        source: '/:id.png', // User akses ini
        destination: '/api/resolve/:id', // Diarahkan ke API ini
      },
    ];
  },
};

export default nextConfig;