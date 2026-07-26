import { NextResponse } from "next/server";
import { supabase } from "../../lib/supabaseClient";

export async function POST(req: Request) {
  try {
    const { username, subscription } = await req.json();

    if (!username || !subscription) {
      return NextResponse.json({ error: "Username atau subscription tidak lengkap" }, { status: 400 });
    }

    // Simpan atau update data subscription berdasarkan username ke Supabase
    const { error } = await supabase
      .from("push_subscriptions")
      .upsert(
        {
          username: username,
          subscription: JSON.stringify(subscription),
          created_at: new Date().toISOString(),
        },
        { onConflict: "username" }
      );

    if (error) {
      throw error;
    }

    return NextResponse.json({ success: true, message: "Subscription berhasil disimpan" });
  } catch (err: any) {
    console.error("Error saving subscription:", err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}