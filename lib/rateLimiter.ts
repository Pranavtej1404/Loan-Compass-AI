// In-memory rate limiter (single Node instance only)
const buckets = new Map<string, { tokens: number; last: number }>();

const MAX_TOKENS = 60;        // allowed requests per minute
const REFILL_PER_MIN = 60;    // refill tokens per minute

export default {
  async allow(key: string) {
    const now = Date.now();
    let bucket = buckets.get(key);

    if (!bucket) {
      bucket = { tokens: MAX_TOKENS, last: now };
      buckets.set(key, bucket);
    }

    // refill bucket tokens proportionally
    const deltaMin = (now - bucket.last) / 60000;
    const refill = deltaMin * REFILL_PER_MIN;
    bucket.tokens = Math.min(MAX_TOKENS, bucket.tokens + refill);
    bucket.last = now;

    // check if a token is available
    if (bucket.tokens >= 1) {
      bucket.tokens -= 1;
      buckets.set(key, bucket);
      return true;
    }

    buckets.set(key, bucket);
    return false;
  }
};
