// @ts-ignore
import { NextResponse } from 'next/server';
import { v2 as cloudinary } from 'cloudinary';

// Konfigurasi Cloudinary menggunakan variabel dari .env.local
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

export async function POST(req: Request) {
  try {
    const formData = await req.formData();
    const file = formData.get('file') as File;

    if (!file) {
      return NextResponse.json({ error: 'Tidak ada file ditemukan' }, { status: 400 });
    }

    // Mengubah file menjadi buffer untuk diproses Cloudinary
    // (Lanjutkan kode proses Cloudinary kamu di bawah sini)
    
    
    // Jangan lupa berikan response sukses di akhir try
    return NextResponse.json({ message: 'File sedang diproses' }, { status: 200 });
    
  } catch (error) {
    // Menangkap error jika terjadi kegagalan
    console.error(error);
    return NextResponse.json({ error: 'Terjadi kesalahan pada server' }, { status: 500 });
  }
}