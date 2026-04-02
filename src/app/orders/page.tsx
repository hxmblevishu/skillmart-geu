"use client";

import Link from "next/link";
import { useAuth } from "@/context/AuthContext";
import { PAYMENT_NOTICE } from "@/lib/constants";
import { isFirebaseConfigured } from "@/lib/firebase";
import {
  listOrdersForUser,
  submitReview,
  updateOrderStatus,
} from "@/lib/firestore";
import { useEffect, useState } from "react";
import type { Order, OrderStatus } from "@/types/models";

export default function OrdersPage() {
  const { profile, loading } = useAuth();
  const [orders, setOrders] = useState<Order[]>([]);
  const [busy, setBusy] = useState<string | null>(null);
  const [reviewed, setReviewed] = useState<Record<string, boolean>>({});
  const [reviewRating, setReviewRating] = useState<Record<string, number>>({});
  const [reviewText, setReviewText] = useState<Record<string, string>>({});

  async function refresh() {
    if (!profile || !isFirebaseConfigured()) return;
    const o = await listOrdersForUser(profile.uid);
    setOrders(o);
  }

  useEffect(() => {
    void refresh();
    // eslint-disable-next-line react-hooks/exhaustive-deps -- load when user id stable
  }, [profile?.uid]);

  async function sendReview(o: Order) {
    if (!profile) return;
    const rating = reviewRating[o.id] ?? 5;
    const comment = reviewText[o.id]?.trim() ?? "";
    if (!comment) return;
    setBusy(o.id + "rev");
    try {
      await submitReview({
        orderId: o.id,
        reviewerId: profile.uid,
        revieweeId: o.sellerId,
        rating,
        comment,
      });
      setReviewed((r) => ({ ...r, [o.id]: true }));
    } catch (e) {
      alert(e instanceof Error ? e.message : "Could not submit review");
    } finally {
      setBusy(null);
    }
  }

  async function setStatus(id: string, status: OrderStatus) {
    if (!profile) return;
    setBusy(id + status);
    try {
      await updateOrderStatus(id, status, profile.uid);
      await refresh();
    } finally {
      setBusy(null);
    }
  }

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
        <h1 className="text-2xl font-semibold text-black">Orders</h1>
        <p className="mt-2 text-black/60">Log in to manage your trades.</p>
        <Link href="/login" className="mt-6 inline-block text-sky-600">
          Log in →
        </Link>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-4xl px-4 py-10 sm:px-6">
      <h1 className="text-3xl font-semibold tracking-tight text-black">Orders</h1>
      <p className="mt-2 text-sm text-black/60">{PAYMENT_NOTICE}</p>

      <div className="mt-10 space-y-4">
        {orders.length === 0 ? (
          <p className="text-sm text-black/55">No orders yet. Browse skills to start.</p>
        ) : (
          orders.map((o) => {
            const isBuyer = o.buyerId === profile.uid;
            const otherId = isBuyer ? o.sellerId : o.buyerId;
            const otherName = isBuyer ? o.sellerName : o.buyerName;
            return (
              <div
                key={o.id}
                className="rounded-2xl border border-black/10 bg-white p-5 shadow-sm"
              >
                <div className="flex flex-wrap items-start justify-between gap-3">
                  <div>
                    <p className="font-semibold text-black">{o.skillTitle}</p>
                    <p className="mt-1 text-sm text-black/55">
                      {isBuyer ? "You bought" : "You sold"} · {otherName}
                    </p>
                  </div>
                  <span className="rounded-full bg-black/[0.06] px-2.5 py-0.5 text-xs font-semibold uppercase text-black/70">
                    {o.status.replace("_", " ")}
                  </span>
                </div>
                <div className="mt-4 flex flex-wrap gap-2">
                  <Link
                    href={`/contact/${otherId}`}
                    className="rounded-full border border-black/15 px-4 py-2 text-xs font-semibold text-black hover:bg-sky-50"
                  >
                    Open chat
                  </Link>
                  {o.status === "pending" && (
                    <>
                      <button
                        type="button"
                        disabled={busy === o.id + "in_progress"}
                        onClick={() => void setStatus(o.id, "in_progress")}
                        className="rounded-full bg-sky-500 px-4 py-2 text-xs font-semibold text-white hover:bg-sky-600 disabled:opacity-50"
                      >
                        Mark in progress
                      </button>
                      <button
                        type="button"
                        disabled={busy === o.id + "cancelled"}
                        onClick={() => void setStatus(o.id, "cancelled")}
                        className="rounded-full border border-black/20 px-4 py-2 text-xs font-semibold text-black/70 hover:bg-black/[0.04] disabled:opacity-50"
                      >
                        Cancel
                      </button>
                    </>
                  )}
                  {o.status === "in_progress" && (
                    <button
                      type="button"
                      disabled={busy === o.id + "completed"}
                      onClick={() => void setStatus(o.id, "completed")}
                      className="rounded-full bg-black px-4 py-2 text-xs font-semibold text-white hover:bg-black/90 disabled:opacity-50"
                    >
                      Mark completed (XP to seller)
                    </button>
                  )}
                  {o.status === "completed" && isBuyer && !reviewed[o.id] && (
                    <div className="mt-3 w-full rounded-xl border border-black/10 bg-black/[0.02] p-3">
                      <p className="text-xs font-semibold text-black/70">
                        Rate the seller
                      </p>
                      <div className="mt-2 flex gap-1">
                        {[1, 2, 3, 4, 5].map((n) => (
                          <button
                            key={n}
                            type="button"
                            onClick={() =>
                              setReviewRating((r) => ({ ...r, [o.id]: n }))
                            }
                            className={`h-8 w-8 rounded-full text-xs font-bold ${
                              (reviewRating[o.id] ?? 5) >= n
                                ? "bg-sky-500 text-white"
                                : "bg-black/10 text-black/50"
                            }`}
                          >
                            {n}
                          </button>
                        ))}
                      </div>
                      <textarea
                        placeholder="Short review…"
                        value={reviewText[o.id] ?? ""}
                        onChange={(e) =>
                          setReviewText((t) => ({ ...t, [o.id]: e.target.value }))
                        }
                        className="mt-2 w-full rounded-lg border border-black/15 px-3 py-2 text-xs outline-none focus:ring-2 focus:ring-sky-400"
                        rows={2}
                      />
                      <button
                        type="button"
                        disabled={busy === o.id + "rev"}
                        onClick={() => void sendReview(o)}
                        className="mt-2 rounded-full bg-black px-4 py-1.5 text-xs font-semibold text-white disabled:opacity-50"
                      >
                        Submit review
                      </button>
                    </div>
                  )}
                  {o.status === "completed" && isBuyer && reviewed[o.id] && (
                    <p className="mt-2 text-xs text-sky-700">Thanks for your review.</p>
                  )}
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}
