"use client";
export const dynamic = "force-dynamic";
import { Suspense, useCallback, useEffect, useMemo, useState } from "react";
import { useSearchParams } from "next/navigation";
import { SkillCard } from "@/components/skills/SkillCard";
import { SKILL_CATEGORIES } from "@/lib/constants";
import { isFirebaseConfigured } from "@/lib/firebase";
import { listSkills } from "@/lib/firestore";
import type { SkillListing } from "@/types/models";

function BrowseInner() {
  const searchParams = useSearchParams();
  const category = searchParams.get("category") ?? "All";
  const initialQ = searchParams.get("q") ?? "";

  const [skills, setSkills] = useState<SkillListing[]>([]);
  const [loading, setLoading] = useState(true);
  const [q, setQ] = useState(initialQ);

  const load = useCallback(async () => {
    if (!isFirebaseConfigured()) {
      setSkills([]);
      setLoading(false);
      return;
    }
    setLoading(true);
    try {
      const data = await listSkills({
        category: category === "All" ? undefined : category,
        search: q,
      });
      setSkills(data);
    } catch {
      setSkills([]);
    } finally {
      setLoading(false);
    }
  }, [category, q]);

  useEffect(() => {
    void load();
  }, [load]);

  const cats = useMemo(() => ["All", ...SKILL_CATEGORIES], []);

  return (
    <div className="mx-auto max-w-6xl px-4 py-10 sm:px-6">
      <h1 className="text-3xl font-semibold tracking-tight text-black">
        Browse skills
      </h1>
      <p className="mt-2 max-w-2xl text-black/60">
        Search listings from verified students. Payment happens off-platform
        after you contact the seller.
      </p>

      <div className="mt-8 flex flex-col gap-4 sm:flex-row sm:items-center">
        <input
          type="search"
          placeholder="Search titles, descriptions, sellers…"
          value={q}
          onChange={(e) => setQ(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && void load()}
          className="w-full flex-1 rounded-full border border-black/15 bg-white px-5 py-3 text-sm outline-none ring-sky-500/30 transition focus:border-sky-400 focus:ring-4"
        />
        <button
          type="button"
          onClick={() => void load()}
          className="rounded-full bg-black px-6 py-3 text-sm font-semibold text-white hover:bg-black/90"
        >
          Search
        </button>
      </div>

      <div className="mt-6 flex flex-wrap gap-2">
        {cats.map((c) => (
          <a
            key={c}
            href={c === "All" ? "/browse" : `/browse?category=${encodeURIComponent(c)}`}
            className={`rounded-full px-4 py-1.5 text-xs font-semibold transition ${
              category === c || (c === "All" && (!category || category === "All"))
                ? "bg-black text-white"
                : "bg-black/[0.05] text-black/70 hover:bg-sky-50"
            }`}
          >
            {c}
          </a>
        ))}
      </div>

      {loading ? (
        <p className="mt-12 text-sm text-black/50">Loading listings…</p>
      ) : !isFirebaseConfigured() ? (
        <p className="mt-12 text-sm text-black/55">
          Connect Firebase to load listings.
        </p>
      ) : skills.length === 0 ? (
        <p className="mt-12 text-sm text-black/55">No listings match your filters.</p>
      ) : (
        <div className="mt-10 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {skills.map((s) => (
            <SkillCard key={s.id} skill={s} />
          ))}
        </div>
      )}
    </div>
  );
}

export default function BrowsePage() {
  return (
    <Suspense
      fallback={
        <div className="mx-auto max-w-6xl px-4 py-16 text-sm text-black/50 sm:px-6">
          Loading browse…
        </div>
      }
    >
      <BrowseInner />
    </Suspense>
  );
}
