// app/api/delete-audio/route.ts
// @ts-ignore
import { NextResponse } from 'next/server';
import { v2 as cloudinary } from 'cloudinary';

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME || 'bjamo8ld',
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

export async function POST(req: Request) {
  try {
    const { audioUrl, username } = await req.json();

    if (!audioUrl || !username) {
      return NextResponse.json({ error: 'Data tidak lengkap' }, { status: 400 });
    }

    // Validasi Akses Khusus Admin
    if (username !== 'Admin●ipix.my.id') {
      return NextResponse.json(
        { error: 'Akses Ditolak. Hanya Admin yang dapat menghapus Voice Note!' },
        { status: 403 }
      );
    }

    // Ekstrak public_id dari URL Cloudinary (audio tersimpan di namespace 'video')
    // Contoh URL: https://res.cloudinary.com/bjamo8ld/video/upload/v12345/voice_notes/xyz.webm
    const regex = /\/v\d+\/(voice_notes\/[^\.]+)/;
    const match = audioUrl.match(regex);
    const publicId = match ? match[1] : null;

    if (publicId) {
      // Hapus dari Cloudinary (resource_type untuk audio adalah 'video')
      await cloudinary.uploader.destroy(publicId, { resource_type: 'video' });
    }

    return NextResponse.json(
      { message: 'Voice note berhasil dihapus dari Cloudinary' },
      { status: 200 }
    );
  } catch (error: any) {
    console.error('Error delete audio:', error);
    return NextResponse.json(
      { error: error.message || 'Gagal menghapus file dari Cloudinary' },
      { status: 500 }
    );
  }
}