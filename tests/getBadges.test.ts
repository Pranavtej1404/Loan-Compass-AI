import { getBadges } from "../lib/getBadges";
import { Product } from "../lib/schemas";
const baseProduct = {
  name: "Test Loan",
  bank: "Test Bank",
  loan_type: "personal",
  rate_apr: 12,
  min_income: 20000,
  min_credit_score: 650,
  tenure_min_months: 6,
  tenure_max_months: 24,
  processing_fee_pct: 1,
  prepayment_allowed: true,
  disbursal_speed: "standard",
  docs_level: "standard",
  limited_offer: false,
  summary: "Test summary",
  faq: [],
  terms: {}
};

describe("getBadges", () => {
  test("returns Low APR for APR < 10", () => {
    const product = { ...baseProduct, rate_apr: 8.5 };
    expect(getBadges(product)).toContain("Low APR");
  });

  test("returns Credit Score ≥ 700 when min_credit_score >= 700", () => {
    const product = { ...baseProduct, min_credit_score: 720 };
    expect(getBadges(product)).toContain("Credit Score ≥ 700");
  });

  test("returns Fast Disbursal for fast speed", () => {
    const product = { ...baseProduct, disbursal_speed: "fast" };
    expect(getBadges(product)).toContain("Fast Disbursal");
  });

  test("returns Fast Disbursal for instant speed", () => {
    const product = { ...baseProduct, disbursal_speed: "instant" };
    expect(getBadges(product)).toContain("Fast Disbursal");
  });

  test("returns Flexible Tenure when range > 24 months", () => {
    const product = {
      ...baseProduct,
      tenure_min_months: 6,
      tenure_max_months: 40
    };
    expect(getBadges(product)).toContain("Flexible Tenure");
  });

  test("returns multiple badges when multiple rules apply", () => {
    const product = {
      ...baseProduct,
      rate_apr: 9,
      min_credit_score: 710,
      disbursal_speed: "fast",
      tenure_min_months: 6,
      tenure_max_months: 40
    };

    const badges = getBadges(product);

    expect(badges).toEqual([
      "Low APR",
      "Credit Score ≥ 700",
      "Fast Disbursal",
      "Flexible Tenure"
    ]);
  });

  test("returns empty array when no rules match", () => {
    const product = { ...baseProduct };
    expect(getBadges(product)).toEqual([]);
  });
});
