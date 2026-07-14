import { NextResponse } from 'next/server';
import { v2 as cloudinary } from 'cloudinary';
import { createClient } from '@supabase/supabase-js';

// Setup Supabase
const supabase = createClient(process.env.SUPABASE_URL!, process.env.SUPABASE_KEY!);

// Konfigurasi Cloudinary
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

export async function POST(req: Request) {
  try {
    const formData = await req.formData();
    const file = formData.get('file') as File;

    if (!file) return NextResponse.json({ error: 'Tidak ada file' }, { status: 400 });

    // 1. Upload ke Cloudinary
    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);

    const cloudinaryResult = await new Promise((resolve, reject) => {
      cloudinary.uploader.upload_stream({ folder: 'ipix' }, (error, result) => {
        if (error) reject(error);
        resolve(result);
      }).end(buffer);
    }) as any;

    // 2. Simpan URL ke Supabase
    const { data, error } = await supabase
      .from('images')
      .insert([{ cloudinary_url: cloudinaryResult.secure_url }])
      .select();

    if (error) throw error;

    return NextResponse.json({ 
      message: 'Berhasil', 
      id: data[0].id, 
      url: `ipix.fun/${data[0].id}.png` 
    });

  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: 'Gagal memproses' }, { status: 500 });
  }
}