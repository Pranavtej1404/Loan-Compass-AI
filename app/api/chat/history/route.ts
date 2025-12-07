import { NextResponse } from "next/server";
import { createServerSupabase } from "@/lib/supabase/server";

export async function GET(req: Request) {
  const url = new URL(req.url);
  const productId = url.searchParams.get("productId");
  const anonId = url.searchParams.get("anonId");

  if (!productId)
    return NextResponse.json({ error: "productId required" }, { status: 400 });

  const supabase = await createServerSupabase();
  const { data: { session } } = await supabase.auth.getSession();

  const userId = session?.user?.id || null;

  // Authenticated user → fetch only their messages.
  if (userId) {
    const { data, error } = await supabase
      .from("ai_chat_messages")
      .select("*")
      .eq("user_id", userId)
      .eq("product_id", productId)
      .order("created_at", { ascending: true });

    if (error) return NextResponse.json({ error: "DB error" }, { status: 500 });
    return NextResponse.json({ messages: data });
  }

  // Optional: Anonymous users
  if (anonId) {
    const { data, error } = await supabase
      .from("ai_chat_messages")
      .select("*")
      .eq("anon_id", anonId)
      .eq("product_id", productId)
      .order("created_at", { ascending: true });

    if (error) return NextResponse.json({ error: "DB error" }, { status: 500 });
    return NextResponse.json({ messages: data });
  }

  return NextResponse.json({ messages: [] });
}
