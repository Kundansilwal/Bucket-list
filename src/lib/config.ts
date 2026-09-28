const positiveInteger = (value: string | undefined, fallback: number) => {
  const parsed = Number.parseInt(value ?? "", 10);
  return Number.isSafeInteger(parsed) && parsed > 0 ? parsed : fallback;
};

export const config = {
  waterTarget: positiveInteger(process.env.GLOBAL_WATER_TARGET, 1000),
  maxItems: positiveInteger(process.env.MAX_ITEMS_PER_BUCKET_LIST, 50),
  maxItemLength: positiveInteger(process.env.MAX_ITEM_LENGTH, 500),
  rateLimitWindowSeconds: positiveInteger(process.env.RATE_LIMIT_WINDOW_SECONDS, 3600),
  rateLimitMax: positiveInteger(process.env.RATE_LIMIT_MAX_SUBMISSIONS, 8),
};
