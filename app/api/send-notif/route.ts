import { NextResponse } from 'next/server';

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { penerimaId, namaPengirim, isiPesan } = body;

    const response = await fetch("https://onesignal.com/api/v1/notifications", {
      method: "POST",
      headers: {
        "Content-Type": "application/json; charset=utf-8",
        "Authorization": `Basic ${process.env.ONESIGNAL_REST_API_KEY}`, 
      },
      body: JSON.stringify({
        app_id: process.env.NEXT_PUBLIC_ONESIGNAL_APP_ID,
        include_external_user_ids: [penerimaId], 
        headings: { en: `Pesan baru dari ${namaPengirim}` },
        contents: { en: isiPesan },
      }),
    });

    const data = await response.json();
    console.log("Respon OneSignal:", data);
    
    return NextResponse.json({ success: true, data });
  } catch (error) {
    console.error("Error API OneSignal:", error);
    return NextResponse.json({ success: false }, { status: 500 });
  }
}