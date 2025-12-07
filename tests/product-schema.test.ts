// src/tests/product-schema.test.ts
import { ProductSchema } from "../lib/schemas";

describe("ProductSchema", () => {
  test("should validate a correct product", () => {
    const product = {
      name: "Personal Loan Plus",
      bank: "Axis Bank",
      loan_type: "personal",
      rate_apr: 12.5,
      min_income: 20000,
      min_credit_score: 650,
      tenure_min_months: 6,
      tenure_max_months: 60,
      processing_fee_pct: 1.5,
      prepayment_allowed: true,
      disbursal_speed: "fast",
      docs_level: "standard",
      limited_offer: false,
      summary: "Quick personal loan with flexible terms",
      faq: [],
      terms: {}
    };

    const result = ProductSchema.safeParse(product);
    expect(result.success).toBe(true);
  });

  test("should fail if rate_apr is negative", () => {
    const result = ProductSchema.safeParse({
      name: "Bad Loan",
      bank: "HDFC",
      loan_type: "personal",
      rate_apr: -5, // invalid
      min_income: 0,
      min_credit_score: 0,
      tenure_min_months: 6,
      tenure_max_months: 60,
      processing_fee_pct: 0,
      prepayment_allowed: true,
      disbursal_speed: "fast",
      docs_level: "standard",
      limited_offer: false,
      summary: "",
      faq: [],
      terms: {}
    });

    expect(result.success).toBe(false);
  });
});
