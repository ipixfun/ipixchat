// app/api/delete-image/route.ts
import { NextResponse } from "next/server";
import { v2 as cloudinary } from "cloudinary";

cloudinary.config({
  cloud_name: process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME || "bjamo8ld",
  api_key: process.env.CLOUDINARY_API_KEY,      // Masukkan di file .env.local
  api_secret: process.env.CLOUDINARY_API_SECRET, // Masukkan di file .env.local
});

// Fungsi untuk mengekstrak public_id dari Cloudinary URL
function getPublicIdFromUrl(url: string) {
  try {
    const splitUrl = url.split("/upload/");
    if (splitUrl.length < 2) return null;
    const pathAfterUpload = splitUrl[1];
    // Menghapus versi (v1234567/) jika ada
    const cleanPath = pathAfterUpload.replace(/^v\d+\//, "");
    // Menghapus ekstensi file (.jpg, .png, dll)
    const publicId = cleanPath.substring(0, cleanPath.lastIndexOf("."));
    return publicId;
  } catch (err) {
    return null;
  }
}

export async function POST(request: Request) {
  try {
    const { imageUrl } = await request.json();

    if (!imageUrl) {
      return NextResponse.json({ error: "Image URL required" }, { status: 400 });
    }

    const publicId = getPublicIdFromUrl(imageUrl);
    if (!publicId) {
      return NextResponse.json({ error: "Invalid Cloudinary URL" }, { status: 400 });
    }

    // Panggil Cloudinary API untuk hapus gambar
    const result = await cloudinary.uploader.destroy(publicId);

    return NextResponse.json({ success: true, result });
  } catch (error: any) {
    console.error("Cloudinary Delete Error:", error);
    return NextResponse.json(
      { error: error.message || "Failed to delete image from Cloudinary" },
      { status: 500 }
    );
  }
}