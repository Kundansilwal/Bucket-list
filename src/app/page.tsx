import { HomeExperience } from "@/components/home-experience";
import { getDemoStats } from "@/lib/demo-store";
import { getSupabaseAdmin } from "@/lib/supabase/server";
import { toGlobalStats } from "@/lib/stats";

export const dynamic = "force-dynamic";
async function loadStats() { const supabase = getSupabaseAdmin(); if (!supabase) return getDemoStats(); const { data } = await supabase.from("global_stats").select("total_bucket_lists,total_items").eq("id", 1).single(); return data ? toGlobalStats(data.total_bucket_lists, data.total_items) : toGlobalStats(0); }
export default async function Home() { return <HomeExperience initialStats={await loadStats()} />; }
