"use client";
export const dynamic = "force-dynamic";
import Link from "next/link";
import { useAuth } from "@/context/AuthContext";
import { XPBar } from "@/components/dashboard/XPBar";
import { VerifiedBadge } from "@/components/ui/VerifiedBadge";
import { isFirebaseConfigured } from "@/lib/firebase";
import { listOrdersForUser } from "@/lib/firestore";
import { levelFromXp } from "@/lib/xp";
import { useEffect, useState } from "react";
import type { Order } from "@/types/models";

export default function DashboardPage() {
  const { profile, loading } = useAuth();
  const [orders, setOrders] = useState<Order[]>([]);

  useEffect(() => {
    if (!profile || !isFirebaseConfigured()) return;
    let c = false;
    (async () => {
      const o = await listOrdersForUser(profile.uid);
      if (!c) setOrders(o.slice(0, 5));
    })();
    return () => {
      c = true;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [profile?.uid]);

  if (loading) {
    return (
      <div className="mx-auto max-w-4xl px-4 py-16 text-sm text-black/50 sm:px-6">
        Loading…
      </div>
    );
  }

  if (!profile) {
    return (
      <div className="mx-auto max-w-4xl px-4 py-16 sm:px-6">
        <h1 className="text-2xl font-semibold text-black">Dashboard</h1>
        <p className="mt-2 text-black/60">Log in to see XP and recent orders.</p>
        <Link
          href="/login"
          className="mt-6 inline-block rounded-full bg-black px-6 py-3 text-sm font-semibold text-white"
        >
          Log in
        </Link>
      </div>
    );
  }

  const avg =
    profile.ratingCount > 0
      ? (profile.ratingSum / profile.ratingCount).toFixed(1)
      : "—";

  return (
    <div className="mx-auto max-w-4xl px-4 py-10 sm:px-6">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <h1 className="text-3xl font-semibold tracking-tight text-black">
            Welcome back, {profile.fullName.split(" ")[0]}
          </h1>
          <p className="mt-1 text-sm text-black/55">
            {profile.institute} · {profile.course} · {profile.studentId}
          </p>
          <div className="mt-3 flex flex-wrap items-center gap-2">
            <span className="rounded-full bg-black/[0.06] px-2.5 py-0.5 text-xs font-medium">
              {levelFromXp(profile.xp ?? 0)}
            </span>
            {profile.verified ? <VerifiedBadge /> : null}
          </div>
        </div>
        <Link
          href={`/profile/${profile.uid}`}
          className="rounded-full border border-black/15 px-5 py-2 text-sm font-semibold text-black hover:border-sky-300"
        >
          View public profile
        </Link>
      </div>

      <div className="mt-10 grid gap-6 lg:grid-cols-2">
        <XPBar xp={profile.xp ?? 0} />
        <div className="rounded-2xl border border-black/10 bg-white p-6 shadow-sm">
          <h2 className="text-sm font-semibold uppercase tracking-wide text-black/45">
            Reputation
          </h2>
          <p className="mt-3 text-3xl font-semibold text-black">{avg}</p>
          <p className="text-sm text-black/55">
            {profile.ratingCount} reviews · {profile.completedOrders ?? 0} completed
            orders
          </p>
          <div className="mt-6 flex gap-3">
            <Link
              href="/sell"
              className="rounded-full bg-black px-5 py-2 text-sm font-semibold text-white"
            >
              New listing
            </Link>
            <Link
              href="/orders"
              className="rounded-full border border-black/15 px-5 py-2 text-sm font-semibold text-black"
            >
              All orders
            </Link>
          </div>
        </div>
      </div>

      <div className="mt-10">
        <h2 className="text-lg font-semibold text-black">Recent orders</h2>
        {orders.length === 0 ? (
          <p className="mt-3 text-sm text-black/55">No orders yet.</p>
        ) : (
          <ul className="mt-4 space-y-3">
            {orders.map((o) => (
              <li
                key={o.id}
                className="flex items-center justify-between rounded-xl border border-black/10 bg-white px-4 py-3 text-sm"
              >
                <span className="font-medium text-black">{o.skillTitle}</span>
                <span className="rounded-full bg-black/[0.05] px-2 py-0.5 text-xs uppercase text-black/70">
                  {o.status.replace("_", " ")}
                </span>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}
