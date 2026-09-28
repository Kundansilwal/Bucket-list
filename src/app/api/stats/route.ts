import { NextResponse } from "next/server";
import { getDemoStats } from "@/lib/demo-store";
import { toGlobalStats } from "@/lib/stats";
import { getSupabaseAdmin } from "@/lib/supabase/server";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const supabase = getSupabaseAdmin();
    if (!supabase) return NextResponse.json(getDemoStats());
    const { data, error } = await supabase.from("global_stats").select("total_bucket_lists,total_items").eq("id", 1).single();
    if (error) throw error;
    return NextResponse.json(toGlobalStats(data.total_bucket_lists, data.total_items));
  } catch {
    return NextResponse.json({ error: "We couldn't load the global collection. Please try again." }, { status: 503 });
  }
}
