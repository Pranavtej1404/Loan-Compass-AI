// src/lib/ai.ts
import type { Product } from "./schemas";

/**
 * Build a strict system + user prompt that instructs the model to ONLY
 * use the product data provided below. If the answer is not present, the model
 * must reply with the exact fail-safe token: [NO_PRODUCT_INFO]
 */

export const FAIL_SAFE_TOKEN = "[NO_PRODUCT_INFO]";

// NEW: Gemini-compatible message builder
export function buildPrompt(
  product: Product,
  userMessage: string,
  history: { role: string; content: string }[] = []
) {
  const productBlock = {
    id: product.id,
    name: product.name,
    bank: product.bank,
    loan_type: product.loan_type,
    rate_apr: product.rate_apr,
    min_income: product.min_income,
    min_credit_score: product.min_credit_score,
    tenure_min_months: product.tenure_min_months,
    tenure_max_months: product.tenure_max_months,
    processing_fee_pct: product.processing_fee_pct,
    prepayment_allowed: product.prepayment_allowed,
    disbursal_speed: product.disbursal_speed,
    docs_level: product.docs_level,
    limited_offer: product.limited_offer,
    summary: product.summary,
    faq: product.faq ?? [],
    terms: product.terms ?? {}
  };

  const SYSTEM_PROMPT = `
You are a financial product assistant.

GENERAL RULES:
- You MUST answer ONLY using the PRODUCT DATA block below.
- PRODUCT DATA is the single source of truth.
- DO NOT use external banking knowledge or assumptions.
- If chat history contradicts the product data, ignore the history.
- Be concise, factual, and friendly.

FALLBACK RULE:
If the answer is not available in PRODUCT DATA, reply:
"I'm sorry, but this information is not available for this product.  
You can ask about APR, eligibility, income requirements, credit score,  
documentation needs, fees, or tenure details."

STRICT PROHIBITIONS:
DO NOT:
- invent numbers or facts
- add missing benefits or features
- speculate on approval chances or risk scoring
- use generic financial assumptions
- mention anything outside this product

When answering, reference the specific fields used when helpful.
`;

  const finalPrompt = `
${SYSTEM_PROMPT}

### PRODUCT DATA
${JSON.stringify(productBlock)}

### CHAT HISTORY
${history.map(h => `${h.role.toUpperCase()}: ${h.content}`).join("\n")}

### USER MESSAGE
${userMessage}
`;

  return finalPrompt;
}

/**
 * Extract basic citations from the assistant text by matching bracketed field names
 * e.g. "APR is 9% [rate_apr]" => [{ field: 'rate_apr', value: product.rate_apr }]
 */
export function extractCitations(answerText: string, product: Product) {
  const citationPattern = /\[([a-zA-Z0-9_]+)\]/g;
  const citations: Array<{ field: string; value: unknown }> = [];
  let match;
  const seen = new Set<string>();
  while ((match = citationPattern.exec(answerText)) !== null) {
    const field = match[1];
    if (!seen.has(field) && (field in product)) {
      // @ts-ignore
      citations.push({ field, value: product[field] });
      seen.add(field);
    }
  }
  return citations;
}
