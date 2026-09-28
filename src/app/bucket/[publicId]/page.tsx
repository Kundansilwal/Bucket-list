import type { Metadata } from "next";
import Link from "next/link";
import { WaterTank } from "@/components/water-tank";
import { getDemoList, getDemoStats } from "@/lib/demo-store";
import { getSupabaseAdmin } from "@/lib/supabase/server";
import { toGlobalStats } from "@/lib/stats";
import { publicIdSchema } from "@/lib/validation";

export const dynamic = "force-dynamic";
export const metadata: Metadata = { robots: { index: false, follow: false }, title: "Your Bucket List | Bucket List Drop" };

async function getPageData(publicId: string) {
  const supabase = getSupabaseAdmin();
  if (!supabase) return { list: getDemoList(publicId), stats: getDemoStats() };
  const [listResult, statsResult] = await Promise.all([
    supabase.rpc("get_bucket_list_by_public_id", { requested_public_id: publicId }),
    supabase.from("global_stats").select("total_bucket_lists,total_items").eq("id", 1).single(),
  ]);
  const raw = listResult.data?.[0] as { public_id: string; created_at: string; items: Array<{ text: string; position: number }> } | undefined;
  return { list: raw ? { publicId: raw.public_id, createdAt: raw.created_at, items: raw.items } : null, stats: statsResult.data ? toGlobalStats(statsResult.data.total_bucket_lists, statsResult.data.total_items) : toGlobalStats(0) };
}

export default async function BucketPage({ params }: { params: Promise<{ publicId: string }> }) {
  const parsed = publicIdSchema.safeParse((await params).publicId);
  if (!parsed.success) return <Missing valid={false} />;
  const { list, stats } = await getPageData(parsed.data);
  if (!list) return <Missing valid />;
  const date = new Intl.DateTimeFormat("en", { dateStyle: "long", timeStyle: "short" }).format(new Date(list.createdAt));
  return <main className="shell py-8 sm:py-12"><Link href="/" className="text-sm font-semibold text-[#ff4785] hover:text-[#d1225d]">← Back to the ocean</Link><section className="mt-10 grid items-start gap-8 lg:grid-cols-[1.1fr_.9fr]"><article className="panel p-6 sm:p-9"><p className="eyebrow">Your contribution</p><h1 className="mt-3 text-3xl font-semibold">Your dreams are in the water.</h1><p className="mt-5 font-mono text-lg text-[#ff4785] font-bold">{list.publicId}</p><p className="mt-1 text-sm text-[var(--muted)]">Created {date}</p><ol className="mt-8 space-y-3">{list.items.map((item) => <li key={item.position} className="flex gap-4 rounded-xl border-2 border-[#bde0fe] bg-white p-4 font-semibold text-[1.05rem] shadow-sm"><span className="font-mono text-sm text-[#ff4785] bg-[#ffe3eb] px-2 py-1 rounded-md">{String(item.position).padStart(2, "0")}</span><span className="leading-6">{item.text}</span></li>)}</ol><p className="mt-7 text-sm leading-6 text-[var(--muted)]">This private page is accessible to anyone with this ID. It is excluded from search engines.</p></article><aside className="panel p-6 text-center"><WaterTank level={stats.waterLevel} stage={stats.stage} total={stats.totalSubmissions} /><p className="mt-5 text-xl font-semibold">One list. One drop.</p><p className="mt-2 text-sm leading-6 text-[var(--muted)]">You are part of {stats.totalSubmissions.toLocaleString()} people adding their hopes to this shared ocean.</p><p className="mt-4 text-sm font-semibold text-[#ffafcc]">Stage {stats.stage} is {stats.waterLevel.toFixed(2)}% full.</p></aside></section></main>;
}

function Missing({ valid }: { valid: boolean }) { return <main className="shell grid min-h-screen place-items-center py-8"><section className="panel max-w-lg p-8 text-center"><p className="eyebrow">Not found</p><h1 className="mt-3 text-3xl font-semibold">{valid ? "We couldn't find that bucket list." : "That Bucket List ID isn't valid."}</h1><p className="mt-4 text-[var(--muted)]">Please check the ID and try again.</p><Link href="/" className="button button-primary mt-7 inline-block">Return to the ocean</Link></section></main>; }
