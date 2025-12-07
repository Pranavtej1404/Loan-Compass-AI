// src/app/api/ai/ask/route.ts
import { NextResponse } from "next/server";
import { AiAskRequestSchema, AiAskResponseSchema, ProductSchema } from "@/lib/schemas";
import { buildPrompt, extractCitations, FAIL_SAFE_TOKEN } from "@/lib/ai";

import rateLimiter from "@/lib/rateLimiter";
import { createServerSupabase } from "@/lib/supabase/server";

import { GoogleGenAI } from "@google/genai";
import { json } from "stream/consumers";

function convertToGeminiFormat(prompt: any[]) {
  const systemMessages = prompt
    .filter(m => m.role === "system")
    .map(m => m.content)
    .join("\n");

  const messages = prompt
    .filter(m => m.role !== "system")
    .map(m => ({
      role: m.role === "assistant" ? "model" : "user",
      parts: [{ text: m.content }]
    }));

  return { systemMessages, messages };
}

export async function POST(req: Request) {
  // ---------------------------
  // 1. AUTH + RATE LIMIT
  // ---------------------------
  const supabase = await createServerSupabase();
  const { data: { session } } = await supabase.auth.getSession();

  const ip =
    req.headers.get("x-forwarded-for") ||
    req.headers.get("x-real-ip") ||
    "unknown";

  const userId = session?.user?.id ?? null;

  const key = userId ?? ip;
  if (!(await rateLimiter.allow(key))) {
    return NextResponse.json({ error: "Rate limit exceeded" }, { status: 429 });
  }

  // ---------------------------
  // 2. VALIDATE REQUEST BODY
  // ---------------------------
  const body = await req.json();
  const parsed = AiAskRequestSchema.safeParse(body);

  if (!parsed.success) {
    return NextResponse.json({ error: "Invalid request" }, { status: 400 });
  }

  const { productId, message, history } = parsed.data;

  // ---------------------------
  // 3. FETCH PRODUCT FROM DB
  // ---------------------------
  const { data: productRow, error: pErr } = await supabase
    .from("products")
    .select("*")
    .eq("id", productId)
    .single();

  if (pErr || !productRow) {
    return NextResponse.json({ error: "Product not found" }, { status: 404 });
  }

  // Validate product with Zod
  const productCheck = ProductSchema.safeParse(productRow);
  if (!productCheck.success) {
    return NextResponse.json(
      { error: "Invalid product structure in DB" },
      { status: 500 }
    );
  }

  const product = productCheck.data;

  // ---------------------------
  // 4. BUILD PROMPT
  // ---------------------------
  const prompt = buildPrompt(product, message, history ?? []);
 

  // ---------------------------
  // 5. GEMINI CALL
  // ---------------------------
  let aiAnswer = FAIL_SAFE_TOKEN;

  try {
  
    const genAI = new GoogleGenAI({apiKey: process.env.GOOGLE_API_KEY});

    console.log("Gemini Prompt:", { prompt});
    const result = await genAI.models.generateContent({
      model: "gemini-2.5-flash",
      contents: prompt
    });

    aiAnswer = result.text || FAIL_SAFE_TOKEN;
    console.log("Gemini Response:", aiAnswer, result.text);
  } catch (err) {
    console.error("Gemini Error:", err);
  }

  // ---------------------------
  // 6. PERSIST USER + AI MESSAGES
  // ---------------------------
  try {
    const anonId = body.anonId ?? null;

    const rows = [
      {
        user_id: userId,
        anon_id: anonId,
        product_id: productId,
        role: "user",
        content: message,
        ip_address: ip,
      },
      {
        user_id: userId,
        anon_id: anonId,
        product_id: productId,
        role: "assistant",
        content: aiAnswer,
        ip_address: ip,
      },
    ];

    await supabase.from("ai_chat_messages").insert(rows);
  } catch (err) {
    console.error("Failed to save chat history:", err);
  }

  // ---------------------------
  // 7. CITATIONS + RESPONSE
  // ---------------------------
  const citations = extractCitations(aiAnswer, product);

  return NextResponse.json({
    answer: aiAnswer,
    citations,
    fallback: aiAnswer === FAIL_SAFE_TOKEN,
  });
}
