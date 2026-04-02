import Link from "next/link";
import { getFeaturedSellers } from "@/lib/server-data";
import { VerifiedBadge } from "@/components/ui/VerifiedBadge";
import { levelFromXp } from "@/lib/xp";

export async function FeaturedSellersSection() {
  const sellers = await getFeaturedSellers(4);

  return (
    <section className="mx-auto max-w-6xl px-4 py-16 sm:px-6">
      <h2 className="text-2xl font-semibold tracking-tight text-black">
        Featured sellers
      </h2>
      <p className="mt-2 text-black/55">
        High-XP peers across institutes—verified profiles stand out.
      </p>
      <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {sellers.length === 0 ? (
          <p className="col-span-full text-sm text-black/50">
            Connect Firebase to load community sellers. Until then, explore{" "}
            <Link href="/browse" className="text-sky-600 underline">
              browse
            </Link>
            .
          </p>
        ) : (
          sellers.map((u) => (
            <Link
              key={u.uid}
              href={`/profile/${u.uid}`}
              className="rounded-2xl border border-black/10 bg-white p-5 shadow-sm transition hover:border-sky-200 hover:shadow-md"
            >
              <div className="flex items-center gap-2">
                <span className="font-medium text-black">{u.fullName}</span>
                {u.verified ? <VerifiedBadge /> : null}
              </div>
              <p className="mt-1 text-xs text-black/50">
                {u.institute} · {u.studentId}
              </p>
              <p className="mt-3 text-sm text-black/60 line-clamp-2">
                {(u.skillsOffered ?? []).slice(0, 3).join(", ") ||
                  "Open to projects"}
              </p>
              <div className="mt-4 flex items-center justify-between text-xs">
                <span className="rounded-full bg-black/[0.06] px-2 py-0.5 font-medium text-black">
                  {levelFromXp(u.xp ?? 0)}
                </span>
                <span className="text-sky-700">{u.xp ?? 0} XP</span>
              </div>
            </Link>
          ))
        )}
      </div>
    </section>
  );
}
