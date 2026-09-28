"use client";

import { useEffect, useState } from "react";
import { BucketListForm } from "@/components/bucket-list-form";
import { BackgroundBucket } from "@/components/background-bucket";
import { RetrieveList } from "@/components/retrieve-list";
import { getSupabaseBrowser } from "@/lib/supabase/browser";
import type { GlobalStats } from "@/lib/types";

export function HomeExperience({ initialStats }: { initialStats: GlobalStats }) {
  const [stats, setStats] = useState(initialStats); const [dropping, setDropping] = useState(false);
  useEffect(() => {
    const refresh = async () => { try { const r = await fetch("/api/stats", { cache: "no-store" }); if (r.ok) setStats(await r.json()); } catch {} };
    const supabase = getSupabaseBrowser();
    // Only the aggregate row is observed; bucket-list content never reaches this channel.
    const channel = supabase?.channel("global-water-level").on("postgres_changes", { event: "UPDATE", schema: "public", table: "global_stats", filter: "id=eq.1" }, refresh).subscribe();
    const id = setInterval(refresh, 30_000); // resilient fallback if a network blocks WebSockets
    return () => { clearInterval(id); if (channel) void supabase?.removeChannel(channel); };
  }, []);
  function saved(_publicId: string) { setDropping(true); setTimeout(() => setDropping(false), 1000); fetch("/api/stats", { cache: "no-store" }).then((r) => r.ok && r.json()).then((data) => data && setStats(data)).catch(() => undefined); }
  return <main className="shell py-6 pb-16 sm:py-10">
    <section className="hero-stage"><div className="hero-vignette" aria-hidden="true" /><BackgroundBucket level={stats.waterLevel} stage={stats.stage} dropping={dropping} total={stats.totalSubmissions} /><div className="hero-copy"><p className="eyebrow">One dream. One drop. One bucket.</p><h1 className="mt-5 max-w-2xl text-5xl font-semibold leading-[.98] tracking-[-.055em] sm:text-7xl">The world’s hopes, <em className="font-serif font-normal text-[#ff4785]">gathering.</em></h1><p className="mt-7 max-w-lg text-lg leading-8 font-semibold text-[var(--muted)]">Write down what calls to you. Each list joins a living collection of dreams made by people everywhere.</p><div className="hero-stat" aria-live="polite"><div><span className="eyebrow !text-[.62rem]">Dreams collected</span><strong>{stats.totalSubmissions.toLocaleString()}</strong></div><span className="hero-stat-line" /><div><span className="eyebrow !text-[.62rem]">The water today</span><strong>{stats.waterLevel.toFixed(2)}<small>%</small></strong></div></div><p className="mt-5 text-sm font-bold text-[var(--muted)]">Each list counts as one drop</p></div></section>
    <section id="add" className="relative z-10 grid gap-5 lg:grid-cols-[1.15fr_.85fr]"><BucketListForm onSaved={saved} /><RetrieveList /></section>
    <footer className="mt-12 border-t-4 border-[#bde0fe] pt-6 font-semibold text-sm leading-6 text-[var(--muted)]">Your Bucket List ID is your private key to this list. Please don’t share it publicly if your dreams are personal.</footer>
  </main>;
}
