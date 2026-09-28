import { NextResponse } from "next/server";
import { getDemoList } from "@/lib/demo-store";
import { getSupabaseAdmin } from "@/lib/supabase/server";
import { publicIdSchema } from "@/lib/validation";

export const dynamic = "force-dynamic";

export async function GET(_: Request, { params }: { params: Promise<{ publicId: string }> }) {
  const publicId = publicIdSchema.safeParse((await params).publicId);
  if (!publicId.success) return NextResponse.json({ error: "That Bucket List ID isn't valid." }, { status: 400 });
  try {
    const supabase = getSupabaseAdmin();
    if (!supabase) {
      const list = getDemoList(publicId.data);
      return list ? NextResponse.json(list) : NextResponse.json({ error: "We couldn't find that bucket list." }, { status: 404 });
    }
    const { data, error } = await supabase.rpc("get_bucket_list_by_public_id", { requested_public_id: publicId.data });
    if (error) throw error;
    if (!data?.[0]) return NextResponse.json({ error: "We couldn't find that bucket list." }, { status: 404 });
    const result = data[0] as { public_id: string; created_at: string; items: Array<{ text: string; position: number }> };
    return NextResponse.json({ publicId: result.public_id, createdAt: result.created_at, items: result.items });
  } catch {
    return NextResponse.json({ error: "We couldn't find that bucket list." }, { status: 404 });
  }
}
