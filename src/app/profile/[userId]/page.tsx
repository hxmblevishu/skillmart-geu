"use client";

import Link from "next/link";
import { useParams } from "next/navigation";
import { useEffect, useState } from "react";
import { VerifiedBadge } from "@/components/ui/VerifiedBadge";
import { useAuth } from "@/context/AuthContext";
import { isFirebaseConfigured } from "@/lib/firebase";
import { getUserProfile, listReviewsForUser } from "@/lib/firestore";
import { levelFromXp } from "@/lib/xp";

export default function ProfilePage() {
  const { userId } = useParams<{ userId: string }>();
  const { profile: me } = useAuth();
  const [user, setUser] = useState<Awaited<
    ReturnType<typeof getUserProfile>
  > | null>(null);
  const [userLoading, setUserLoading] = useState(true);
  const [reviews, setReviews] = useState<
    { id: string; rating: number; comment: string }[]
  >([]);

  useEffect(() => {
    if (!userId || !isFirebaseConfigured()) {
      setUser(null);
      setUserLoading(false);
      return;
    }
    let c = false;
    setUserLoading(true);
    (async () => {
      try {
        const u = await getUserProfile(userId);
        if (c) return;
        setUser(u);
        const rv = await listReviewsForUser(userId);
        if (!c)
          setReviews(
            rv.map((r) => ({
              id: r.id,
              rating: r.rating,
              comment: r.comment,
            }))
          );
      } finally {
        if (!c) setUserLoading(false);
      }
    })();
    return () => {
      c = true;
    };
  }, [userId]);

  if (userLoading) {
    return (
      <div className="mx-auto max-w-3xl px-4 py-16 text-sm text-black/50 sm:px-6">
        Loading…
      </div>
    );
  }

  if (!user) {
    return (
      <div className="mx-auto max-w-3xl px-4 py-16 sm:px-6">
        <p className="text-black/70">Profile not found.</p>
        <Link href="/browse" className="mt-4 text-sky-600">
          Browse skills
        </Link>
      </div>
    );
  }

  const avg =
    user.ratingCount > 0
      ? (user.ratingSum / user.ratingCount).toFixed(1)
      : "—";

  const isSelf = me?.uid === user.uid;

  return (
    <div className="mx-auto max-w-3xl px-4 py-10 sm:px-6">
      <div className="rounded-2xl border border-black/10 bg-white p-8 shadow-sm">
        <div className="flex flex-wrap items-center gap-3">
          <h1 className="text-3xl font-semibold tracking-tight text-black">
            {user.fullName}
          </h1>
          {user.verified ? <VerifiedBadge /> : null}
        </div>
        <p className="mt-2 text-sm text-black/55">
          {user.institute} · {user.course}
        </p>
        <p className="mt-1 text-sm text-black/50">Student ID · {user.studentId}</p>

        <div className="mt-6 flex flex-wrap gap-3 text-sm">
          <span className="rounded-full bg-black/[0.06] px-3 py-1 font-medium">
            {levelFromXp(user.xp ?? 0)}
          </span>
          <span className="rounded-full bg-sky-50 px-3 py-1 font-medium text-sky-900">
            {user.xp ?? 0} XP
          </span>
          <span className="rounded-full bg-black/[0.06] px-3 py-1">
            {user.completedOrders ?? 0} completed orders
          </span>
        </div>

        <div className="mt-6 border-t border-black/10 pt-6">
          <h2 className="text-xs font-semibold uppercase tracking-wide text-black/45">
            Skills offered
          </h2>
          <p className="mt-2 text-black/80">
            {(user.skillsOffered ?? []).length
              ? (user.skillsOffered ?? []).join(", ")
              : "Not listed yet"}
          </p>
        </div>

        <div className="mt-6 border-t border-black/10 pt-6">
          <h2 className="text-xs font-semibold uppercase tracking-wide text-black/45">
            Rating
          </h2>
          <p className="mt-2 text-2xl font-semibold text-black">{avg}</p>
          <p className="text-sm text-black/55">{user.ratingCount ?? 0} reviews</p>
        </div>

        {!isSelf && me ? (
          <Link
            href={`/contact/${user.uid}`}
            className="mt-8 inline-flex rounded-full bg-black px-6 py-3 text-sm font-semibold text-white hover:bg-black/90"
          >
            Contact
          </Link>
        ) : null}
      </div>

      <div className="mt-10">
        <h2 className="text-lg font-semibold text-black">Reviews</h2>
        {reviews.length === 0 ? (
          <p className="mt-3 text-sm text-black/55">No reviews yet.</p>
        ) : (
          <ul className="mt-4 space-y-3">
            {reviews.map((r) => (
              <li
                key={r.id}
                className="rounded-xl border border-black/10 bg-white p-4 text-sm"
              >
                <p className="font-semibold text-black">{r.rating}/5</p>
                <p className="mt-1 text-black/70">{r.comment}</p>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}
