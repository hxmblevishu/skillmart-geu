"use client";
export const dynamic = "force-dynamic";

import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { VerifiedBadge } from "@/components/ui/VerifiedBadge";
import { useAuth } from "@/context/AuthContext";
import { PAYMENT_NOTICE } from "@/lib/constants";
import { isFirebaseConfigured } from "@/lib/firebase";
import { createOrder, getSkill, getUserProfile } from "@/lib/firestore";
import type { SkillListing, UserProfile } from "@/types/models";

export default function SkillDetailPage() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();
  const { profile } = useAuth();
  const [skill, setSkill] = useState<SkillListing | null>(null);
  const [skillLoading, setSkillLoading] = useState(true);
  const [seller, setSeller] = useState<UserProfile | null>(null);
  const [msg, setMsg] = useState<string | null>(null);
  const [ordering, setOrdering] = useState(false);

  useEffect(() => {
    if (!id || !isFirebaseConfigured()) {
      setSkill(null);
      setSkillLoading(false);
      return;
    }
    let cancelled = false;
    setSkillLoading(true);
    (async () => {
      try {
        const s = await getSkill(id);
        if (cancelled) return;
        setSkill(s);
        if (s?.sellerId) {
          const u = await getUserProfile(s.sellerId);
          if (!cancelled) setSeller(u);
        } else if (!cancelled) setSeller(null);
      } finally {
        if (!cancelled) setSkillLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [id]);

  async function placeOrder() {
    if (!profile || !skill) return;
    setOrdering(true);
    setMsg(null);
    try {
      await createOrder({ buyer: profile, skill });
      setMsg("Order created. Check Orders to update status.");
    } catch (e) {
      setMsg(e instanceof Error ? e.message : "Could not create order");
    } finally {
      setOrdering(false);
    }
  }

  if (skillLoading) {
    return (
      <div className="mx-auto max-w-3xl px-4 py-16 text-sm text-black/50 sm:px-6">
        Loading…
      </div>
    );
  }

  if (!skill || !skill.active) {
    return (
      <div className="mx-auto max-w-3xl px-4 py-16 sm:px-6">
        <p className="text-black/70">This listing is unavailable.</p>
        <Link href="/browse" className="mt-4 inline-block text-sky-600">
          Back to browse
        </Link>
      </div>
    );
  }

  const rating =
    seller && seller.ratingCount
      ? (seller.ratingSum / seller.ratingCount).toFixed(1)
      : "—";

  return (
    <div className="mx-auto max-w-3xl px-4 py-10 sm:px-6">
      <button
        type="button"
        onClick={() => router.push("/browse")}
        className="text-sm font-medium text-sky-600 hover:text-sky-700"
      >
        ← Back
      </button>

      <div className="mt-6 rounded-2xl border border-black/10 bg-white p-8 shadow-sm">
        <div className="flex flex-wrap items-center gap-2">
          <span className="rounded-full bg-sky-50 px-3 py-0.5 text-xs font-semibold text-sky-900">
            {skill.category}
          </span>
          <span className="text-lg font-semibold text-black">{skill.priceLabel}</span>
        </div>
        <h1 className="mt-4 text-3xl font-semibold tracking-tight text-black">
          {skill.title}
        </h1>
        <p className="mt-4 whitespace-pre-wrap text-black/65">{skill.description}</p>

        <div className="mt-8 rounded-xl bg-sky-50/80 p-4 text-sm text-sky-950">
          <p className="font-medium">Payments</p>
          <p className="mt-1 text-black/75">{PAYMENT_NOTICE}</p>
        </div>

        {msg ? (
          <p className="mt-4 text-sm text-sky-800" role="status">
            {msg}
          </p>
        ) : null}

        <div className="mt-8 flex flex-wrap gap-3">
          {profile ? (
            <>
              <button
                type="button"
                disabled={ordering || profile.uid === skill.sellerId}
                onClick={() => void placeOrder()}
                className="rounded-full bg-black px-6 py-3 text-sm font-semibold text-white disabled:cursor-not-allowed disabled:bg-black/40"
              >
                {profile.uid === skill.sellerId ? "Your listing" : "Request order"}
              </button>
              <Link
                href={`/contact/${skill.sellerId}?skill=${encodeURIComponent(skill.title)}`}
                className="rounded-full border border-black/15 bg-white px-6 py-3 text-center text-sm font-semibold text-black hover:border-sky-300 hover:bg-sky-50"
              >
                Contact seller
              </Link>
            </>
          ) : (
            <Link
              href="/login"
              className="rounded-full bg-black px-6 py-3 text-sm font-semibold text-white"
            >
              Log in to order or contact
            </Link>
          )}
        </div>
      </div>

      <div className="mt-8 rounded-2xl border border-black/10 bg-white p-6 shadow-sm">
        <h2 className="text-sm font-semibold uppercase tracking-wide text-black/45">
          Seller
        </h2>
        <div className="mt-3 flex flex-wrap items-center gap-2">
          <Link
            href={`/profile/${skill.sellerId}`}
            className="text-lg font-semibold text-black hover:text-sky-700"
          >
            {skill.sellerName}
          </Link>
          {(seller?.verified || skill.sellerVerified) && <VerifiedBadge />}
        </div>
        <p className="mt-1 text-sm text-black/55">
          Student ID · {skill.sellerStudentId}
        </p>
        <p className="mt-3 text-sm text-black/60">
          Rating {rating}{" "}
          {seller?.ratingCount ? `(${seller.ratingCount} reviews)` : ""}
        </p>
      </div>
    </div>
  );
}
