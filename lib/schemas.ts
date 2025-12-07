// src/lib/schemas.ts
import { z } from 'zod';

/**
 * Shared enums (must match your DB enum values)
 */
export const LoanTypeEnum = z.enum([
  'personal',
  'education',
  'home',
  'vehicle',
  'credit_line',
  'debt_consolidation',
]);

export const DisbursalSpeedEnum = z.enum(['standard', 'fast', 'instant', 'slow']);

export const DocsLevelEnum = z.enum(['standard', 'low', 'minimal']);

/**
 * FAQ item stored as JSONB in products.faq
 */
export const FaqItemSchema = z.object({
  q: z.string().min(1),
  a: z.string().min(0),
});

/**
 * Terms is a free-form JSON object stored as JSONB.
 * Use record of unknown so Zod still validates it's an object.
 */
export const TermsSchema = z.record(z.string(),z.unknown());

/**
 * Product schema — corresponds to your `products` table
 */
export const ProductSchema = z.object({
  id: z.string().uuid(), // gen_random_uuid() in DB
  name: z.string().min(1),
  bank: z.string().min(1),

  loan_type: LoanTypeEnum,

  // numeric fields (Postgres NUMERIC)
  rate_apr: z.number().gt(0), // APR > 0
  min_income: z.number().gte(0),
  min_credit_score: z.number().int().gte(0),

  tenure_min_months: z.number().int().gte(0).optional().default(6),
  tenure_max_months: z.number().int().gte(0).optional().default(60),

  processing_fee_pct: z.number().gte(0).optional().default(0),

  prepayment_allowed: z.boolean().optional().default(true),

  disbursal_speed: DisbursalSpeedEnum.optional().default('standard'),
  docs_level: DocsLevelEnum.optional().default('standard'),

  limited_offer: z.boolean().optional().default(false),

  summary: z.string().nullable().optional(),

  faq: z.array(FaqItemSchema).optional().default([]),
  terms: TermsSchema.optional().default({}),

  created_at: z.string().optional(), // ISO timestamp from DB (timestamptz)
});

/**
 * ProductCreateSchema — payload when client creates a product.
 * Omit DB-generated fields: id, created_at.
 */
export const ProductCreateSchema = ProductSchema.pick({
  name: true,
  bank: true,
  loan_type: true,
  rate_apr: true,
  min_income: true,
  min_credit_score: true,
  tenure_min_months: true,
  tenure_max_months: true,
  processing_fee_pct: true,
  prepayment_allowed: true,
  disbursal_speed: true,
  docs_level: true,
  limited_offer: true,
  summary: true,
  faq: true,
  terms: true,
});

/**
 * ProductUpdateSchema — partial for PATCH updates
 */
export const ProductUpdateSchema = ProductCreateSchema.partial();

/**
 * User schema
 */
export const UserSchema = z.object({
  id: z.string().uuid(),
  email: z.string().email(),
  display_name: z.string().nullable().optional(),
  created_at: z.string().optional(),
});

/**
 * AI Chat Message schema — corresponds to ai_chat_messages table
 */
export const AiChatMessageSchema = z.object({
  id: z.string().uuid(),
  user_id: z.string().uuid().nullable(), // may be null for guest
  product_id: z.string().uuid().nullable(),
  role: z.enum(['user', 'assistant']),
  content: z.string().min(1),
  created_at: z.string().optional(),
});

/* =========================
   API Request / Response Schemas
   ========================= */

/**
 * GetProductsQuery - possible query params for /api/products
 * (filters)
 */
export const GetProductsQuerySchema = z.object({
  bank: z.string().min(1).optional(),
  loan_type: LoanTypeEnum.optional(),
  apr_min: z.coerce.number().optional(), // coerce from query string if needed
  apr_max: z.coerce.number().optional(),
  min_income: z.coerce.number().optional(),
  min_credit_score: z.coerce.number().optional(),
  limit: z.coerce.number().int().positive().optional().default(25),
  offset: z.coerce.number().int().min(0).optional().default(0),
});

/**
 * GetProductsResponse - returns array of products + total count (optional)
 */
export const GetProductsResponseSchema = z.object({
  products: z.array(ProductSchema),
  total: z.number().int().gte(0).optional(),
});

/**
 * AiAskRequest - payload for POST /api/ai/ask
 * includes productId, user message and optional history
 */
export const AiAskRequestSchema = z.object({
  productId: z.string().uuid(),
  message: z.string().min(1),
  history: z.array(z.object({ role: z.enum(['user','assistant']), content: z.string() })).optional().default([]),
  userId: z.string().uuid().optional().nullable(),
});


/**
 * AiAskResponse - assistant reply (grounded)
 */
export const AiAskResponseSchema = z.object({
  answer: z.string(),
  citations: z.array(z.object({ field: z.string(), value: z.any() })).optional(),
  fallback: z.boolean().optional().default(false),
});

/**
 * CreateChatMessage request/response used to persist messages
 */
export const CreateChatMessageRequestSchema = z.object({
  userId: z.string().uuid().optional().nullable(),
  productId: z.string().uuid().optional().nullable(),
  role: z.enum(['user', 'assistant']),
  content: z.string().min(1),
});

export const CreateChatMessageResponseSchema = z.object({
  message: AiChatMessageSchema,
});

/* =========================
   Type exports (inferred)
   ========================= */
   
export type ChatMessage = {
  id: string;            // UUID or temp id
  role: Role;
  content: string;
  created_at: string;    // ISO string
  pending?: boolean;     // true for optimistic messages / loading
  error?: string | null;
};

export type LoanType = z.infer<typeof LoanTypeEnum>;
export type DisbursalSpeed = z.infer<typeof DisbursalSpeedEnum>;
export type DocsLevel = z.infer<typeof DocsLevelEnum>;

export type Product = z.infer<typeof ProductSchema>;
export type ProductCreate = z.infer<typeof ProductCreateSchema>;
export type ProductUpdate = z.infer<typeof ProductUpdateSchema>;

export type User = z.infer<typeof UserSchema>;

export type AiChatMessage = z.infer<typeof AiChatMessageSchema>;

export type GetProductsQuery = z.infer<typeof GetProductsQuerySchema>;
export type GetProductsResponse = z.infer<typeof GetProductsResponseSchema>;

export type AiAskRequest = z.infer<typeof AiAskRequestSchema>;
export type AiAskResponse = z.infer<typeof AiAskResponseSchema>;

export type CreateChatMessageRequest = z.infer<typeof CreateChatMessageRequestSchema>;
export type CreateChatMessageResponse = z.infer<typeof CreateChatMessageResponseSchema>;
export type Role = "user" | "assistant";


/* =========================
   Convenience exports
   ========================= */

export const schemas = {
  LoanTypeEnum,
  DisbursalSpeedEnum,
  DocsLevelEnum,
  FaqItemSchema,
  TermsSchema,
  ProductSchema,
  ProductCreateSchema,
  ProductUpdateSchema,
  UserSchema,
  AiChatMessageSchema,
  GetProductsQuerySchema,
  GetProductsResponseSchema,
  AiAskRequestSchema,
  AiAskResponseSchema,
  CreateChatMessageRequestSchema,
  CreateChatMessageResponseSchema,
};
