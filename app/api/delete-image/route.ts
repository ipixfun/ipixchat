import { NextResponse } from "next/server";
import { v2 as cloudinary } from "cloudinary";

cloudinary.config({
  cloud_name: process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME || "bjamo8ld",
  api_key: process.env.CLOUDINARY_API_KEY,      // Harus ada di .env.local
  api_secret: process.env.CLOUDINARY_API_SECRET, // Harus ada di .env.local
});

function getPublicIdFromUrl(url: string) {
  try {
    // 1. Ambil bagian setelah '/upload/'
    const splitUrl = url.split("/upload/");
    if (splitUrl.length < 2) return null;

    let pathAfterUpload = splitUrl[1];

    // 2. Hapus nomor versi jika ada (contoh: 'v1712345678/')
    pathAfterUpload = pathAfterUpload.replace(/^v\d+\//, "");

    // 3. Hapus ekstensi file di akhir (.png, .jpg, .webp, dll)
    const lastDotIndex = pathAfterUpload.lastIndexOf(".");
    if (lastDotIndex !== -1) {
      pathAfterUpload = pathAfterUpload.substring(0, lastDotIndex);
    }

    // decodeURIComponent agar karakter khusus di URL ter-decode dengan benar
    return decodeURIComponent(pathAfterUpload);
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
    console.log("--> Ekstraksi Public ID untuk dihapus:", publicId);

    if (!publicId) {
      return NextResponse.json({ error: "Invalid Cloudinary URL" }, { status: 400 });
    }

    // Jalankan perintah hapus ke API Cloudinary
    const result = await cloudinary.uploader.destroy(publicId);
    console.log("--> Hasil Cloudinary destroy:", result);

    if (result.result !== "ok") {
      // Jika ternyata gambar bertipe 'raw' atau 'video', coba invalidate/destroy dengan resource_type
      const rawResult = await cloudinary.uploader.destroy(publicId, { invalidate: true });
      return NextResponse.json({ success: true, result: rawResult });
    }

    return NextResponse.json({ success: true, result });
  } catch (error: any) {
    console.error("Cloudinary Delete Error:", error);
    return NextResponse.json(
      { error: error.message || "Failed to delete image" },
      { status: 500 }
    );
  }
}