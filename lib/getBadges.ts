// src/lib/getBadges.ts

import { Product } from "./schemas"; // ⬅️ optional: if you exported a Product type from Zod

export function getBadges(product: any /* or Product */): string[] {
  const badges: string[] = [];

  // 1. Low APR badge
  if (product.rate_apr < 10) {
    badges.push("Low APR");
  }

  // 2. High Credit Score Requirement
  if (product.min_credit_score >= 700) {
    badges.push("High Credit Score Requirement");
  }

  // 3. Fast Disbursal
  if (["fast", "instant"].includes(product.disbursal_speed)) {
    badges.push("Fast Disbursal");
  }

  // 4. Flexible Tenure
  const tenureRange =
    (product.tenure_max_months ?? 0) - (product.tenure_min_months ?? 0);

  if (tenureRange > 24) {
    badges.push("Flexible Tenure");
  }

  // Return only the first 3 badges
  return badges.slice(0, 3);
}
