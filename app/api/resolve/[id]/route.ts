import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(process.env.SUPABASE_URL!, process.env.SUPABASE_KEY!);

export async function GET(req: Request, { params }: { params: { id: string } }) {
  const { id } = params;

  // Ambil URL berdasarkan ID
  const { data, error } = await supabase
    .from('images')
    .select('cloudinary_url')
    .eq('id', id)
    .single();

  if (error || !data) {
    return new NextResponse('Gambar tidak ditemukan', { status: 404 });
  }

  // Redirect permanen ke gambar asli di Cloudinary
  return NextResponse.redirect(data.cloudinary_url);
}