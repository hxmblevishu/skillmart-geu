"use client";

import Link from "next/link";
import { useAuth } from "@/context/AuthContext";
import { isFirebaseConfigured } from "@/lib/firebase";
import {
  adminDeleteSkill,
  adminSetUserSuspended,
  adminSetUserVerified,
  listAllSkillsForAdmin,
  listAllUsersForAdmin,
} from "@/lib/firestore";
import { useCallback, useEffect, useState } from "react";
import type { SkillListing, UserProfile } from "@/types/models";

export default function AdminPage() {
  const { profile, loading } = useAuth();
  const [users, setUsers] = useState<UserProfile[]>([]);
  const [skills, setSkills] = useState<SkillListing[]>([]);
  const [tab, setTab] = useState<"users" | "listings">("users");
  const [busy, setBusy] = useState<string | null>(null);

  const refresh = useCallback(async () => {
    if (!profile?.isAdmin || !isFirebaseConfigured()) return;
    const [u, s] = await Promise.all([
      listAllUsersForAdmin(),
      listAllSkillsForAdmin(),
    ]);
    setUsers(u);
    setSkills(s);
  }, [profile?.isAdmin]);

  useEffect(() => {
    void refresh();
  }, [refresh]);

  async function suspend(uid: string, suspended: boolean) {
    setBusy(uid + "sus");
    await adminSetUserSuspended(uid, suspended);
    await refresh();
    setBusy(null);
  }

  async function verify(uid: string, verified: boolean) {
    setBusy(uid + "ver");
    await adminSetUserVerified(uid, verified);
    await refresh();
    setBusy(null);
  }

  async function removeSkill(id: string) {
    setBusy(id + "skill");
    await adminDeleteSkill(id);
    await refresh();
    setBusy(null);
  }

  if (loading) {
    return (
      <div className="mx-auto max-w-5xl px-4 py-16 text-sm text-black/50 sm:px-6">
        Loading…
      </div>
    );
  }

  if (!profile) {
    return (
      <div className="mx-auto max-w-5xl px-4 py-16 sm:px-6">
        <p className="text-black/70">Log in to continue.</p>
        <Link href="/login" className="mt-4 text-sky-600">
          Log in
        </Link>
      </div>
    );
  }

  if (!profile.isAdmin) {
    return (
      <div className="mx-auto max-w-5xl px-4 py-16 sm:px-6">
        <h1 className="text-xl font-semibold text-black">Admin</h1>
        <p className="mt-2 text-sm text-black/60">
          You don&apos;t have admin access. Admins are granted via{" "}
          <code className="rounded bg-black/[0.06] px-1">NEXT_PUBLIC_ADMIN_STUDENT_IDS</code>{" "}
          at signup, or by updating Firestore manually.
        </p>
        <Link href="/" className="mt-6 inline-block text-sky-600">
          Home
        </Link>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-5xl px-4 py-10 sm:px-6">
      <h1 className="text-3xl font-semibold tracking-tight text-black">Admin</h1>
      <p className="mt-2 text-sm text-black/60">
        Suspend spam accounts, verify legitimate students, remove fake listings.
      </p>

      <div className="mt-8 flex gap-2">
        <button
          type="button"
          onClick={() => setTab("users")}
          className={`rounded-full px-4 py-2 text-xs font-semibold ${
            tab === "users" ? "bg-black text-white" : "bg-black/[0.06]"
          }`}
        >
          Users
        </button>
        <button
          type="button"
          onClick={() => setTab("listings")}
          className={`rounded-full px-4 py-2 text-xs font-semibold ${
            tab === "listings" ? "bg-black text-white" : "bg-black/[0.06]"
          }`}
        >
          Listings
        </button>
      </div>

      {tab === "users" ? (
        <ul className="mt-6 space-y-3">
          {users.map((u) => (
            <li
              key={u.uid}
              className="flex flex-col gap-3 rounded-2xl border border-black/10 bg-white p-4 shadow-sm sm:flex-row sm:items-center sm:justify-between"
            >
              <div>
                <p className="font-semibold text-black">
                  {u.fullName}{" "}
                  <span className="text-xs font-normal text-black/50">
                    ({u.studentId})
                  </span>
                </p>
                <p className="text-xs text-black/55">
                  {u.institute} · {u.email} · XP {u.xp ?? 0}
                </p>
                <p className="text-xs text-black/45">
                  {u.suspended ? "Suspended" : "Active"} ·{" "}
                  {u.verified ? "Verified" : "Not verified"}
                </p>
              </div>
              <div className="flex flex-wrap gap-2">
                <button
                  type="button"
                  disabled={busy !== null}
                  onClick={() => void suspend(u.uid, !u.suspended)}
                  className="rounded-full border border-black/20 px-3 py-1.5 text-xs font-semibold"
                >
                  {u.suspended ? "Unsuspend" : "Suspend"}
                </button>
                <button
                  type="button"
                  disabled={busy !== null}
                  onClick={() => void verify(u.uid, !u.verified)}
                  className="rounded-full bg-sky-500 px-3 py-1.5 text-xs font-semibold text-white"
                >
                  {u.verified ? "Unverify" : "Verify"}
                </button>
              </div>
            </li>
          ))}
        </ul>
      ) : (
        <ul className="mt-6 space-y-3">
          {skills.map((s) => (
            <li
              key={s.id}
              className="flex flex-col gap-2 rounded-2xl border border-black/10 bg-white p-4 shadow-sm sm:flex-row sm:items-center sm:justify-between"
            >
              <div>
                <p className="font-semibold text-black">{s.title}</p>
                <p className="text-xs text-black/55">
                  {s.category} · {s.sellerName} · {s.active ? "active" : "inactive"}
                </p>
              </div>
              <button
                type="button"
                disabled={busy !== null}
                onClick={() => void removeSkill(s.id)}
                className="rounded-full bg-red-600 px-3 py-1.5 text-xs font-semibold text-white"
              >
                Delete listing
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
