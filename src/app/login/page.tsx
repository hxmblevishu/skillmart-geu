"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { useAuth } from "@/context/AuthContext";

export default function LoginPage() {
  const { signIn, profile, loading } = useAuth();
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [err, setErr] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setErr(null);
    setBusy(true);
    try {
      await signIn(email, password);
      router.push("/dashboard");
    } catch {
      setErr("Could not sign in. Check email and password.");
    } finally {
      setBusy(false);
    }
  }

  useEffect(() => {
    if (!loading && profile) router.replace("/dashboard");
  }, [loading, profile, router]);

  return (
    <div className="mx-auto flex min-h-[60vh] max-w-md flex-col justify-center px-4 py-12 sm:px-6">
      <h1 className="text-3xl font-semibold tracking-tight text-black">Log in</h1>
      <p className="mt-2 text-sm text-black/60">
        Use the email you registered with your Student ID.
      </p>
      <form onSubmit={(e) => void onSubmit(e)} className="mt-8 space-y-4">
        <div>
          <label className="text-xs font-semibold uppercase tracking-wide text-black/50">
            Email
          </label>
          <input
            type="email"
            autoComplete="email"
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="mt-1 w-full rounded-xl border border-black/15 px-4 py-3 text-sm outline-none focus:ring-4 focus:ring-sky-500/20"
          />
        </div>
        <div>
          <label className="text-xs font-semibold uppercase tracking-wide text-black/50">
            Password
          </label>
          <input
            type="password"
            autoComplete="current-password"
            required
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="mt-1 w-full rounded-xl border border-black/15 px-4 py-3 text-sm outline-none focus:ring-4 focus:ring-sky-500/20"
          />
        </div>
        {err ? <p className="text-sm text-red-600">{err}</p> : null}
        <button
          type="submit"
          disabled={busy}
          className="w-full rounded-full bg-black py-3 text-sm font-semibold text-white hover:bg-black/90 disabled:opacity-50"
        >
          {busy ? "Signing in…" : "Continue"}
        </button>
      </form>
      <p className="mt-6 text-center text-sm text-black/55">
        New here?{" "}
        <Link href="/signup" className="font-medium text-sky-600 hover:text-sky-700">
          Sign up
        </Link>
      </p>
    </div>
  );
}
