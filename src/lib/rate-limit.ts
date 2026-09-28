import { config } from "@/lib/config";

type Entry = { count: number; resetAt: number };
const store = new Map<string, Entry>();

/** Development-safe fallback. Use an external atomic store such as Upstash in multi-instance production. */
export function checkRateLimit(key: string) {
  const now = Date.now();
  const existing = store.get(key);
  const entry = !existing || existing.resetAt <= now
    ? { count: 0, resetAt: now + config.rateLimitWindowSeconds * 1000 }
    : existing;
  entry.count += 1;
  store.set(key, entry);
  return { allowed: entry.count <= config.rateLimitMax, retryAfter: Math.ceil((entry.resetAt - now) / 1000) };
}
