import { createClient, SupabaseClient } from '@supabase/supabase-js';
import { cookies, headers } from "next/headers";

import { z } from 'zod';
import {
  ProductSchema,
  AiChatMessageSchema,
  Product,
  AiChatMessage,
} from './schemas';
import { he } from 'zod/v4/locales';

export const supabase: SupabaseClient=createClient(
  process.env.NEXT_PUBLIC_SUPERBASE_URL!,
  process.env.NEXT_PUBLIC_SUPERBASE_ANON_KEY!
);
export async function getProducts(filters?: {
  bank?: string;
  loan_type?: string;
  min_apr?: number;
  max_apr?: number;
  min_income?: number;
  min_credit_score?: number;
}): Promise<Product[]> {
  let query = supabase.from('products').select('*');

  if (filters) {
    const { bank, loan_type, min_apr, max_apr, min_income, min_credit_score } = filters;

    if (bank) query = query.ilike('bank', `%${bank}%`);
    if (loan_type) query = query.eq('loan_type', loan_type);
    if (min_apr) query = query.gte('rate_apr', min_apr);
    if (max_apr) query = query.lte('rate_apr', max_apr);
    if (min_income) query = query.gte('min_income', min_income);
    if (min_credit_score) query = query.gte('min_credit_score', min_credit_score);
  }

  const { data, error } = await query;

  if (error) throw error;
  if (!data) return [];

  // Validate each row with Zod
  return data.map((row) => ProductSchema.parse(row));
}

/**
 * Fetch a single product by ID
 */
export async function getProductById(id: string): Promise<Product | null> {
  const { data, error } = await supabase
    .from('products')
    .select('*')
    .eq('id', id)
    .single();

  if (error) throw error;
  if (!data) return null;

  return ProductSchema.parse(data);
}

/**
 * Insert a chat message for AI assistant
 */
export async function insertChatMessage(msg: {
  user_id?: string | null;
  product_id?: string | null;
  role: 'user' | 'assistant';
  content: string;
}): Promise<AiChatMessage> {
  const { data, error } = await supabase
    .from('ai_chat_messages')
    .insert({
      user_id: msg.user_id || null,
      product_id: msg.product_id || null,
      role: msg.role,
      content: msg.content,
    })
    .select('*')
    .single();

  if (error) throw error;
  if (!data) throw new Error('Failed to insert chat message');

  return AiChatMessageSchema.parse(data);
}

/**
 * Optional: fetch chat messages by product/user
 */
export async function getChatMessages(params: {
  product_id?: string;
  user_id?: string;
}): Promise<AiChatMessage[]> {
  let query = supabase.from('ai_chat_messages').select('*');

  if (params.product_id) query = query.eq('product_id', params.product_id);
  if (params.user_id) query = query.eq('user_id', params.user_id);

  const { data, error } = await query.order('created_at', { ascending: true });

  if (error) throw error;
  if (!data) return [];

  return data.map((row) => AiChatMessageSchema.parse(row));
}


