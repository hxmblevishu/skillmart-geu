import Link from "next/link";
import { FeaturedSellersSection } from "@/components/landing/FeaturedSellersSection";
import {
  SITE_NAME,
  SKILL_CATEGORIES,
  TAGLINE,
} from "@/lib/constants";

export default function HomePage() {
  return (
    <div className="bg-white">
      <section className="relative overflow-hidden border-b border-black/10">
        <div className="pointer-events-none absolute -right-24 -top-24 h-64 w-64 rounded-full bg-sky-100 blur-3xl" />
        <div className="pointer-events-none absolute -bottom-20 -left-20 h-56 w-56 rounded-full bg-sky-50 blur-3xl" />
        <div className="mx-auto max-w-6xl px-4 py-20 sm:px-6 sm:py-28">
          <p className="text-sm font-medium uppercase tracking-wider text-sky-600">
            {SITE_NAME}
          </p>
          <h1 className="mt-4 max-w-3xl text-4xl font-semibold tracking-tight text-black sm:text-5xl sm:leading-tight">
            {TAGLINE}
          </h1>
          <p className="mt-6 max-w-xl text-lg text-black/60">
            List services like graphic design, development, video editing, notes,
            and tutoring. Meet buyers from GEU, GEHU, GEIMS—and grow reputation
            with XP and reviews.
          </p>
          <div className="mt-10 flex flex-wrap gap-3">
            <Link
              href="/browse"
              className="rounded-full bg-black px-6 py-3 text-sm font-semibold text-white shadow-sm transition hover:bg-black/90"
            >
              Browse skills
            </Link>
            <Link
              href="/signup"
              className="rounded-full border border-black/15 bg-white px-6 py-3 text-sm font-semibold text-black transition hover:border-sky-300 hover:bg-sky-50"
            >
              Join with Student ID
            </Link>
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-6xl px-4 py-16 sm:px-6">
        <h2 className="text-2xl font-semibold tracking-tight text-black">
          Categories
        </h2>
        <p className="mt-2 text-black/55">
          Filter listings to find exactly what you need on campus.
        </p>
        <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {SKILL_CATEGORIES.map((c) => (
            <Link
              key={c}
              href={`/browse?category=${encodeURIComponent(c)}`}
              className="rounded-2xl border border-black/10 bg-white p-6 shadow-sm transition hover:border-sky-200 hover:shadow-md"
            >
              <span className="text-lg font-medium text-black">{c}</span>
              <p className="mt-2 text-sm text-black/55">Explore {c.toLowerCase()} services</p>
            </Link>
          ))}
        </div>
      </section>

      <FeaturedSellersSection />

      <section className="border-y border-black/10 bg-black/[0.02]">
        <div className="mx-auto max-w-6xl px-4 py-16 sm:px-6">
          <h2 className="text-2xl font-semibold tracking-tight text-black">
            How it works
          </h2>
          <div className="mt-10 grid gap-8 md:grid-cols-3">
            {[
              {
                step: "01",
                title: "Create your profile",
                body: "Sign up with your institute email and Student ID. Add skills you can deliver.",
              },
              {
                step: "02",
                title: "List or discover",
                body: "Publish a service with clear scope and price hint. Buyers search and filter by category.",
              },
              {
                step: "03",
                title: "Chat & complete",
                body: "Use in-app contact—no payment gateway. Arrange UPI or cash offline, then mark orders done for XP.",
              },
            ].map((item) => (
              <div
                key={item.step}
                className="rounded-2xl border border-black/10 bg-white p-6 shadow-sm"
              >
                <span className="text-xs font-bold text-sky-600">{item.step}</span>
                <h3 className="mt-3 text-lg font-semibold text-black">{item.title}</h3>
                <p className="mt-2 text-sm text-black/60">{item.body}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-6xl px-4 py-16 sm:px-6">
        <h2 className="text-2xl font-semibold tracking-tight text-black">
          What students say
        </h2>
        <div className="mt-8 grid gap-6 md:grid-cols-3">
          {[
            {
              quote:
                "Got a clean Figma deck in 24 hours from a senior. Easier than random dms.",
              name: "Aarav · GEU B.Tech",
            },
            {
              quote:
                "I offer Python debugging sessions—XP and reviews help new clients trust me.",
              name: "Ishita · GEHU",
            },
            {
              quote:
                "No fake payment forms; we settled on UPI after chat. Felt transparent.",
              name: "Kabir · GEIMS",
            },
          ].map((t) => (
            <blockquote
              key={t.name}
              className="rounded-2xl border border-black/10 bg-white p-6 shadow-sm"
            >
              <p className="text-sm text-black/80">&ldquo;{t.quote}&rdquo;</p>
              <footer className="mt-4 text-xs font-medium text-black/50">
                {t.name}
              </footer>
            </blockquote>
          ))}
        </div>
      </section>
    </div>
  );
}
