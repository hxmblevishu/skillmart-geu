"use client";

import Link from "next/link";
import { useAuth } from "@/context/AuthContext";
import { SITE_NAME } from "@/lib/constants";

const nav = [
  { href: "/browse", label: "Browse" },
  { href: "/sell", label: "Sell a Skill" },
  { href: "/dashboard", label: "Dashboard" },
  { href: "/orders", label: "Orders" },
];

export function SiteHeader() {
  const { profile, loading, logOut, ready } = useAuth();

  return (
    <header className="sticky top-0 z-50 border-b border-black/10 bg-white/90 backdrop-blur-md">
      <div className="mx-auto flex h-16 max-w-6xl items-center justify-between px-4 sm:px-6">
        <Link href="/" className="text-lg font-semibold tracking-tight text-black">
          {SITE_NAME}
        </Link>
        <nav className="hidden items-center gap-6 md:flex">
          {nav.map((n) => (
            <Link
              key={n.href}
              href={n.href}
              className="text-sm font-medium text-black/70 transition hover:text-black"
            >
              {n.label}
            </Link>
          ))}
          {profile?.isAdmin && (
            <Link
              href="/admin"
              className="text-sm font-medium text-sky-600 hover:text-sky-700"
            >
              Admin
            </Link>
          )}
        </nav>
        <div className="flex items-center gap-3">
          {!ready ? (
            <span className="text-xs text-amber-700">Configure Firebase</span>
          ) : loading ? (
            <span className="text-xs text-black/50">…</span>
          ) : profile ? (
            <>
              <Link
                href={`/profile/${profile.uid}`}
                className="hidden text-sm text-black/80 hover:text-black sm:inline"
              >
                Profile
              </Link>
              <button
                type="button"
                onClick={() => void logOut()}
                className="rounded-full border border-black/10 bg-white px-4 py-2 text-sm font-medium text-black shadow-sm transition hover:border-sky-300 hover:bg-sky-50"
              >
                Log out
              </button>
            </>
          ) : (
            <>
              <Link
                href="/login"
                className="text-sm font-medium text-black/70 hover:text-black"
              >
                Log in
              </Link>
              <Link
                href="/signup"
                className="rounded-full bg-black px-4 py-2 text-sm font-medium text-white shadow-sm transition hover:bg-black/90"
              >
                Sign up
              </Link>
            </>
          )}
        </div>
      </div>
      <div className="flex border-t border-black/5 px-4 py-2 md:hidden">
        <div className="flex w-full flex-wrap gap-2">
          {nav.map((n) => (
            <Link
              key={n.href}
              href={n.href}
              className="rounded-full bg-black/[0.04] px-3 py-1 text-xs font-medium text-black"
            >
              {n.label}
            </Link>
          ))}
        </div>
      </div>
    </header>
  );
}
