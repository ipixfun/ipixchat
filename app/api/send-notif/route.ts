import { NextResponse } from 'next/server';

export async function POST(req: Request) {
  try {
    const { penerimaId, namaPengirim, isiPesan } = await req.json();

    const response = await fetch("https://onesignal.com/api/v1/notifications", {
      method: "POST",
      headers: {
        "Content-Type": "application/json; charset=utf-8",
        // REST API Key ditaruh di sini (aman karena ini di server)
        "Authorization": `Basic ${process.env.ONESIGNAL_REST_API_KEY}`, 
      },
      body: JSON.stringify({
        app_id: process.env.NEXT_PUBLIC_ONESIGNAL_APP_ID,
        // Targetkan notif ke External ID penerima
        include_external_user_ids: [penerimaId], 
        headings: { en: `Pesan baru dari ${namaPengirim}` },
        contents: { en: isiPesan },
      }),
    });

    const data = await response.json();
    return NextResponse.json({ success: true, data });
  } catch (error) {
    return NextResponse.json({ success: false, error: "Gagal kirim notif" }, { status: 500 });
  }
}