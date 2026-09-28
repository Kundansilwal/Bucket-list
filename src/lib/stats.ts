import { config } from "@/lib/config";
import type { GlobalStats } from "@/lib/types";

export function toGlobalStats(totalSubmissions: number, totalItems = 0): GlobalStats {
  const safeTotal = Math.max(0, totalSubmissions);
  const waterLevel = Math.min(100, (safeTotal / config.waterTarget) * 100);
  return { totalSubmissions: safeTotal, totalItems: Math.max(0, totalItems), waterLevel, stage: 1, stageStart: 0, stageEnd: config.waterTarget };
}
