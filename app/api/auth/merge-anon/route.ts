import { NextResponse } from "next/server";

import { createServerSupabase } from "@/lib/supabase/server";

export async function POST(req: Request) {
  const supabase = await createServerSupabase();
  const { data: { session } } = await supabase.auth.getSession();

  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { anonId } = await req.json();
  if (!anonId) {
    return NextResponse.json({ error: "anonId required" }, { status: 400 });
  }

  const userId = session.user.id;

  // SQL UPSERT
  const { error } = await supabase.rpc("merge_anon_chats", {
    anonid: anonId,
    userid: userId,
  });

  if (error) {
    console.error("Merge error:", error);
    return NextResponse.json({ error: "merge failed" }, { status: 500 });
  }

  return NextResponse.json({ ok: true });
}
