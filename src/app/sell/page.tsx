"use client";
export const dynamic = "force-dynamic";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { useAuth } from "@/context/AuthContext";
import { SKILL_CATEGORIES } from "@/lib/constants";
import { isFirebaseConfigured } from "@/lib/firebase";
import { createSkill } from "@/lib/firestore";

export default function SellPage() {
  const { profile, loading } = useAuth();
  const router = useRouter();
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [category, setCategory] = useState<string>(SKILL_CATEGORIES[0]);
  const [priceLabel, setPriceLabel] = useState("e.g. ₹499 / assignment");
  const [err, setErr] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    if (!profile) return;
    setErr(null);
    setSaving(true);
    try {
      if (!isFirebaseConfigured()) throw new Error("Firebase not configured");
      const id = await createSkill(profile, {
        title: title.trim(),
        description: description.trim(),
        category,
        priceLabel: priceLabel.trim(),
      });
      router.push(`/skills/${id}`);
    } catch (ex) {
      setErr(ex instanceof Error ? ex.message : "Could not publish");
    } finally {
      setSaving(false);
    }
  }

  if (loading) {
    return (
      <div className="mx-auto max-w-xl px-4 py-16 text-sm text-black/50 sm:px-6">
        Loading…
      </div>
    );
  }

  if (!profile) {
    return (
      <div className="mx-auto max-w-xl px-4 py-16 sm:px-6">
        <h1 className="text-2xl font-semibold text-black">Sell a skill</h1>
        <p className="mt-2 text-black/60">
          Sign in with your student profile to publish a listing.
        </p>
        <a
          href="/signup"
          className="mt-6 inline-block rounded-full bg-black px-6 py-3 text-sm font-semibold text-white"
        >
          Create account
        </a>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-xl px-4 py-10 sm:px-6">
      <h1 className="text-3xl font-semibold tracking-tight text-black">
        Sell a skill
      </h1>
      <p className="mt-2 text-sm text-black/60">
        Describe what you deliver, set a price hint, and buyers will contact you
        to pay offline.
      </p>

      <form onSubmit={(e) => void submit(e)} className="mt-8 space-y-5">
        <div>
          <label className="block text-xs font-semibold uppercase tracking-wide text-black/50">
            Title
          </label>
          <input
            required
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            className="mt-1 w-full rounded-xl border border-black/15 px-4 py-3 text-sm outline-none ring-sky-500/20 focus:ring-4"
            placeholder="e.g. Motion graphics for society promos"
          />
        </div>
        <div>
          <label className="block text-xs font-semibold uppercase tracking-wide text-black/50">
            Category
          </label>
          <select
            value={category}
            onChange={(e) => setCategory(e.target.value)}
            className="mt-1 w-full rounded-xl border border-black/15 bg-white px-4 py-3 text-sm outline-none ring-sky-500/20 focus:ring-4"
          >
            {SKILL_CATEGORIES.map((c) => (
              <option key={c} value={c}>
                {c}
              </option>
            ))}
          </select>
        </div>
        <div>
          <label className="block text-xs font-semibold uppercase tracking-wide text-black/50">
            Description
          </label>
          <textarea
            required
            rows={5}
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            className="mt-1 w-full rounded-xl border border-black/15 px-4 py-3 text-sm outline-none ring-sky-500/20 focus:ring-4"
            placeholder="Deliverables, timelines, tools you use…"
          />
        </div>
        <div>
          <label className="block text-xs font-semibold uppercase tracking-wide text-black/50">
            Price hint
          </label>
          <input
            required
            value={priceLabel}
            onChange={(e) => setPriceLabel(e.target.value)}
            className="mt-1 w-full rounded-xl border border-black/15 px-4 py-3 text-sm outline-none ring-sky-500/20 focus:ring-4"
          />
        </div>
        {err ? <p className="text-sm text-red-600">{err}</p> : null}
        <button
          type="submit"
          disabled={saving}
          className="w-full rounded-full bg-black py-3 text-sm font-semibold text-white hover:bg-black/90 disabled:opacity-50"
        >
          {saving ? "Publishing…" : "Publish listing"}
        </button>
      </form>
    </div>
  );
}
