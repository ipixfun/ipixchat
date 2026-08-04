import { NextResponse } from "next/server";
import { v2 as cloudinary } from "cloudinary";

cloudinary.config({
  cloud_name: process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME || "bjamo8ld",
  api_key: process.env.CLOUDINARY_API_KEY,      
  api_secret: process.env.CLOUDINARY_API_SECRET, 
});

function getPublicIdFromUrl(url: string) {
  try {
    const splitUrl = url.split("/upload/");
    if (splitUrl.length < 2) return null;

    let pathAfterUpload = splitUrl[1];

    // Hapus versi jika ada (contoh: 'v1712345678/')
    pathAfterUpload = pathAfterUpload.replace(/^v\d+\//, "");

    // Hapus ekstensi file (.png, .jpg, dll)
    const lastDotIndex = pathAfterUpload.lastIndexOf(".");
    if (lastDotIndex !== -1) {
      pathAfterUpload = pathAfterUpload.substring(0, lastDotIndex);
    }

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
    console.log("--> Public ID yang akan dihapus:", publicId);

    if (!publicId) {
      return NextResponse.json({ error: "Invalid Cloudinary URL" }, { status: 400 });
    }

    // PAKSA PURGE CACHE DENGAN invalidate: true
    const result = await cloudinary.uploader.destroy(publicId, {
      invalidate: true,
    });

    console.log("--> Hasil Cloudinary destroy:", result);

    return NextResponse.json({ success: true, result });
  } catch (error: any) {
    console.error("Cloudinary Delete Error:", error);
    return NextResponse.json(
      { error: error.message || "Failed to delete image" },
      { status: 500 }
    );
  }
}