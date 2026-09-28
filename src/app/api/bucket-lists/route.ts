import { NextRequest, NextResponse } from "next/server";
import { checkRateLimit } from "@/lib/rate-limit";
import { createDemoList, getDemoStats } from "@/lib/demo-store";
import { getSupabaseAdmin } from "@/lib/supabase/server";
import { toGlobalStats } from "@/lib/stats";
import { createBucketListSchema } from "@/lib/validation";

export const runtime = "nodejs";

export async function POST(request: NextRequest) {
  const contentLength = Number(request.headers.get("content-length") ?? 0);
  if (contentLength > 20_000) return NextResponse.json({ error: "This request is too large." }, { status: 413 });
  const forwarded = request.headers.get("x-forwarded-for")?.split(",")[0]?.trim();
  const address = forwarded || request.headers.get("x-real-ip") || "unknown";
  const limit = checkRateLimit(address);
  if (!limit.allowed) return NextResponse.json({ error: "Please wait before adding another list." }, { status: 429, headers: { "Retry-After": String(limit.retryAfter) } });

  try {
    const parsed = createBucketListSchema.safeParse(await request.json());
    if (!parsed.success) return NextResponse.json({ error: parsed.error.issues[0]?.message ?? "Please check your dreams." }, { status: 400 });
    const items = parsed.data.items;
    const supabase = getSupabaseAdmin();
    if (!supabase) {
      const list = createDemoList(items);
      return NextResponse.json({ publicId: list.publicId, ...getDemoStats() }, { status: 201 });
    }
    // The SECURITY DEFINER RPC creates the list, items, and aggregate atomically.
    const { data, error } = await supabase.rpc("create_bucket_list", { submitted_items: items });
    if (error || !data?.[0]) throw error ?? new Error("Empty database result");
    const result = data[0] as { public_id: string; total_bucket_lists: number; total_items: number };
    return NextResponse.json({ publicId: result.public_id, ...toGlobalStats(result.total_bucket_lists, result.total_items) }, { status: 201 });
  } catch {
    return NextResponse.json({ error: "We couldn't save your bucket list. Your list has not been counted. Please try again." }, { status: 500 });
  }
}
