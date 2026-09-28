"use client";

import { FormEvent, useState } from "react";
import { useRouter } from "next/navigation";

type Props = { onSaved: (publicId: string) => void };

export function BucketListForm({ onSaved }: Props) {
  const router = useRouter();
  const [items, setItems] = useState(["", "", ""]);
  const [error, setError] = useState("");
  const [saving, setSaving] = useState(false);
  const [result, setResult] = useState("");

  function update(index: number, value: string) { setItems((old) => old.map((item, i) => i === index ? value : item)); }
  async function submit(event: FormEvent) {
    event.preventDefault(); setError(""); setResult("");
    const dreams = items.map((item) => item.trim()).filter(Boolean);
    if (!dreams.length) { setError("Add at least one dream before saving."); return; }
    setSaving(true);
    try {
      const response = await fetch("/api/bucket-lists", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ items: dreams }) });
      const payload = await response.json();
      if (!response.ok) throw new Error(payload.error);
      setResult(payload.publicId); onSaved(payload.publicId);
    } catch (cause) { setError(cause instanceof Error ? cause.message : "We couldn't save your dreams. Please try again."); }
    finally { setSaving(false); }
  }
  if (result) return <Success publicId={result} onView={() => router.push(`/bucket/${result}`)} />;
  return <form onSubmit={submit} className="panel form-panel form-panel-primary p-5 sm:p-7" noValidate>
    <div className="mb-6"><p className="eyebrow">01 · Add your drop</p><h2 className="mt-3 text-3xl font-semibold tracking-tight">What calls to you?</h2><p className="mt-2 text-sm leading-6 text-[var(--muted)]">The small, wild, life-changing things. Start with one.</p></div>
    <div className="space-y-3">
      {items.map((item, index) => <div className="dream-row flex gap-2" key={index}><span aria-hidden="true">{String(index + 1).padStart(2, "0")}</span><label className="sr-only" htmlFor={`dream-${index}`}>Dream {index + 1}</label><input id={`dream-${index}`} className="input" maxLength={500} value={item} onChange={(event) => update(index, event.target.value)} placeholder={index === 0 ? "See the Northern Lights" : "Another dream"} /><button type="button" className="remove-dream" aria-label={`Remove dream ${index + 1}`} onClick={() => setItems((old) => old.length > 1 ? old.filter((_, i) => i !== index) : old)}>×</button></div>)}
    </div>
    {error && <p className="mt-3 text-sm text-rose-200" role="alert">{error}</p>}
    <div className="mt-6 flex flex-wrap items-center gap-3"><button type="button" className="add-dream" onClick={() => setItems((old) => old.length < 50 ? [...old, ""] : old)}>+ Add another dream</button><button className="button button-primary" disabled={saving}>{saving ? "Saving your dreams…" : "Let these dreams ripple out →"}</button></div>
  </form>;
}

function Success({ publicId, onView }: { publicId: string; onView: () => void }) {
  const [copied, setCopied] = useState(false);
  async function copy() { await navigator.clipboard.writeText(publicId); setCopied(true); setTimeout(() => setCopied(false), 1800); }
  return <section className="panel p-6 sm:p-8" aria-live="polite"><p className="eyebrow">Your drop is in the ocean</p><h2 className="mt-2 text-2xl font-semibold">Your Bucket List ID</h2><p className="mt-5 break-all font-mono text-3xl font-bold tracking-wider text-[#ff4785]">{publicId}</p><p className="mt-4 max-w-md text-sm leading-6 text-[var(--muted)]">Save this somewhere safe. It is your private key to this list; anyone with it can view your dreams.</p><div className="mt-6 flex flex-wrap gap-3"><button className="button button-primary" onClick={copy}>{copied ? "Copied" : "Copy ID"}</button><button className="button button-secondary" onClick={onView}>View my bucket list</button></div></section>;
}
