// src/lib/matching.ts
import { Product } from "./schemas"; // optional if Product type exists

// ---- Weighted Scoring Algorithm ---- //
export function calculateScore(product: Product, user: any): number {
  let score = 0;

  // 1. APR Score → lower APR = higher score
  // Example: APR 12 → (15 - 12)*2 = 6 points
  score += (15 - product.rate_apr) * 2;

  // 2. Income Match
  if (user.income >= product.min_income) {
    score += 10;
  }

  // 3. Credit Score Match
  if (user.credit_score >= product.min_credit_score) {
    score += 10;
  }

  // 4. Loan Type Match
  if (user.loan_type === product.loan_type) {
    score += 5;
  }

  // 5. Optional: urgency → prefers fast/instant disbursal
  if (user.urgency === "high") {
    if (["fast", "instant"].includes(product.disbursal_speed)) {
      score += 5;
    }
  }

  return score;
}

// ---- Return Top N Products ---- //
export function getTopMatches(
  products: Product[],
  user: any,
  top: number = 5
) {
  const scored = products.map((p) => ({
    ...p,
    score: calculateScore(p, user),
  }));

  return scored.sort((a, b) => b.score - a.score).slice(0, top);
}
