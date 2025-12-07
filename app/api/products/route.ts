import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { supabase } from "@/lib/superbase_client";
import { ProductSchema, GetProductsResponse } from "@/lib/schemas";

// Query schema
const QuerySchema = z.object({
  bank: z.string().optional(),
  aprMin: z.string().optional(),
  aprMax: z.string().optional(),
  minIncome: z.string().optional(),
  minCreditScore: z.string().optional(),
  type: z.string().optional(),
  limit: z.string().optional(),
  offset: z.string().optional(),
});
export async function GET(request: NextRequest) {
  try {
    const url = new URL(request.url);
    const queryParams = Object.fromEntries(url.searchParams.entries());
    const parsed = QuerySchema.safeParse(queryParams);

    if (!parsed.success) {
      return NextResponse.json(
        { error: "Invalid query parameters" },
        { status: 400 }
      );
    }

    const q = parsed.data;

    let query = supabase
      .from("products")
      .select("*", { count: "exact" });

    // filters
    if (q.bank) query = query.ilike("bank", `%${q.bank}%`);
    if (q.type) query = query.eq("type", q.type);
    if (q.aprMin) query = query.gte("rate_apr", parseFloat(q.aprMin));
    if (q.aprMax) query = query.lte("rate_apr", parseFloat(q.aprMax));
    if (q.minIncome) query = query.gte("min_income", parseFloat(q.minIncome));
    if (q.minCreditScore)
      query = query.gte("min_credit_score", parseInt(q.minCreditScore));

    // Pagination
    const limit = q.limit ? parseInt(q.limit) : 25;
    const offset = q.offset ? parseInt(q.offset) : 0;

    query = query.range(offset, offset + limit - 1);

    // Execute
    const { data, error, count } = await query;

    if (error) throw error;

    const products = data.map((p) => ProductSchema.parse(p));

    const response: GetProductsResponse = {
      products,
      total: count ?? 0,
    };

    return NextResponse.json(response);
  } catch (err) {
    return NextResponse.json(
      {
        error: "Internal Server Error",
        details: err instanceof Error ? err.message : String(err),
      },
      { status: 500 }
    );
  }
}
