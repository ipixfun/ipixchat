import { NextResponse } from "next/server";
// Pastikan path import ini sesuai dengan letak file route.ts terhadap supabaseClient
import { supabase } from "../../lib/supabaseClient"; 

export async function POST(req: Request) {
  try {
    const { username, subscription } = await req.json();

    if (!username || !subscription) {
      return NextResponse.json(
        { error: "Username atau subscription tidak lengkap" }, 
        { status: 400 }
      );
    }

    // Simpan atau update data subscription berdasarkan username ke Supabase
    const { data, error } = await supabase
      .from("push_subscriptions")
      .upsert(
        {
          username: username,
          // Jika kolom subscription di Supabase bertipe text, gunakan JSON.stringify
          // Jika bertipe jsonb, Anda bisa langsung set: subscription: subscription
          subscription: typeof subscription === "string" ? subscription : JSON.stringify(subscription),
          created_at: new Date().toISOString(),
        },
        { onConflict: "username" } // SYARAT: Kolom 'username' HARUS diset UNIQUE atau PRIMARY KEY di Supabase
      );

    if (error) {
      console.error("Supabase Upsert Error:", error);
      throw error;
    }

    return NextResponse.json({ 
      success: true, 
      message: "Subscription berhasil disimpan",
      data
    });
  } catch (err: any) {
    console.error("Error saving subscription:", err);
    return NextResponse.json({ error: err.message || "Internal Server Error" }, { status: 500 });
  }
}