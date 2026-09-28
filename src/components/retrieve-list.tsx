"use client";

import { FormEvent, useState } from "react";
import { useRouter } from "next/navigation";

export function RetrieveList() {
  const router = useRouter(); const [id, setId] = useState(""); const [error, setError] = useState("");
  function submit(event: FormEvent) { event.preventDefault(); const clean = id.trim().toUpperCase(); if (!/^BL-[A-HJ-NP-Z2-9]{8}$/.test(clean)) { setError("That Bucket List ID isn't valid."); return; } router.push(`/bucket/${clean}`); }
  return <form className="panel form-panel form-panel-return p-5 sm:p-7" onSubmit={submit} noValidate><p className="eyebrow">02 · Come back anytime</p><div className="return-mark" aria-hidden="true">↗</div><label htmlFor="retrieve-id" className="mt-4 block text-2xl font-semibold tracking-tight">Find your dreams</label><p className="mt-2 max-w-sm text-sm leading-6 text-[var(--muted)]">Your private ID brings you back to this exact little corner of the ocean.</p><div className="mt-6 flex flex-col gap-3"><input id="retrieve-id" className="input font-mono uppercase" value={id} onChange={(event) => { setId(event.target.value); setError(""); }} placeholder="BL-7K4M9X2Q" autoCapitalize="characters" /><button className="button button-secondary w-full">View my list →</button></div>{error && <p className="mt-2 text-sm font-semibold text-[#ff4785]" role="alert">{error}</p>}<p className="mt-5 text-sm font-semibold leading-5 text-[var(--muted)]">Keep the ID somewhere private. Anyone with it can view the list.</p></form>;
}
