"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { useAuth } from "@/context/AuthContext";
import { INSTITUTES, SKILL_CATEGORIES } from "@/lib/constants";

export default function SignupPage() {
  const { signUp, profile, loading } = useAuth();
  const router = useRouter();
  const [fullName, setFullName] = useState("");
  const [studentId, setStudentId] = useState("");
  const [institute, setInstitute] = useState<string>(INSTITUTES[0]);
  const [course, setCourse] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [skills, setSkills] = useState<string[]>([]);
  const [err, setErr] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  function toggleSkill(s: string) {
    setSkills((prev) =>
      prev.includes(s) ? prev.filter((x) => x !== s) : [...prev, s]
    );
  }

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setErr(null);
    setBusy(true);
    try {
      await signUp({
        fullName,
        studentId,
        institute,
        course,
        email,
        password,
        skillsOffered: skills,
      });
      router.push("/dashboard");
    } catch (ex) {
      setErr(ex instanceof Error ? ex.message : "Signup failed");
    } finally {
      setBusy(false);
    }
  }

  useEffect(() => {
    if (!loading && profile) router.replace("/dashboard");
  }, [loading, profile, router]);

  return (
    <div className="mx-auto max-w-lg px-4 py-12 sm:px-6">
      <h1 className="text-3xl font-semibold tracking-tight text-black">
        Create account
      </h1>
      <p className="mt-2 text-sm text-black/60">
        Profiles are tied to your Student ID. One account per ID.
      </p>

      <form onSubmit={(e) => void onSubmit(e)} className="mt-8 space-y-4">
        <div>
          <label className="text-xs font-semibold uppercase tracking-wide text-black/50">
            Full name
          </label>
          <input
            required
            value={fullName}
            onChange={(e) => setFullName(e.target.value)}
            className="mt-1 w-full rounded-xl border border-black/15 px-4 py-3 text-sm outline-none focus:ring-4 focus:ring-sky-500/20"
          />
        </div>
        <div>
          <label className="text-xs font-semibold uppercase tracking-wide text-black/50">
            Student ID
          </label>
          <input
            required
            value={studentId}
            onChange={(e) => setStudentId(e.target.value)}
            className="mt-1 w-full rounded-xl border border-black/15 px-4 py-3 text-sm outline-none focus:ring-4 focus:ring-sky-500/20"
            placeholder="Campus roll / ID"
          />
        </div>
        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <label className="text-xs font-semibold uppercase tracking-wide text-black/50">
              Institute
            </label>
            <select
              value={institute}
              onChange={(e) => setInstitute(e.target.value)}
              className="mt-1 w-full rounded-xl border border-black/15 bg-white px-4 py-3 text-sm outline-none focus:ring-4 focus:ring-sky-500/20"
            >
              {INSTITUTES.map((i) => (
                <option key={i} value={i}>
                  {i}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className="text-xs font-semibold uppercase tracking-wide text-black/50">
              Course / Branch
            </label>
            <input
              required
              value={course}
              onChange={(e) => setCourse(e.target.value)}
              className="mt-1 w-full rounded-xl border border-black/15 px-4 py-3 text-sm outline-none focus:ring-4 focus:ring-sky-500/20"
              placeholder="e.g. CSE, BBA"
            />
          </div>
        </div>
        <div>
          <label className="text-xs font-semibold uppercase tracking-wide text-black/50">
            Email
          </label>
          <input
            type="email"
            required
            autoComplete="email"
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
            required
            minLength={6}
            autoComplete="new-password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="mt-1 w-full rounded-xl border border-black/15 px-4 py-3 text-sm outline-none focus:ring-4 focus:ring-sky-500/20"
          />
        </div>
        <div>
          <p className="text-xs font-semibold uppercase tracking-wide text-black/50">
            Skills you can offer (optional)
          </p>
          <div className="mt-2 flex flex-wrap gap-2">
            {SKILL_CATEGORIES.map((c) => (
              <button
                key={c}
                type="button"
                onClick={() => toggleSkill(c)}
                className={`rounded-full px-3 py-1 text-xs font-semibold transition ${
                  skills.includes(c)
                    ? "bg-black text-white"
                    : "bg-black/[0.06] text-black/70 hover:bg-sky-50"
                }`}
              >
                {c}
              </button>
            ))}
          </div>
        </div>
        {err ? <p className="text-sm text-red-600">{err}</p> : null}
        <button
          type="submit"
          disabled={busy}
          className="w-full rounded-full bg-black py-3 text-sm font-semibold text-white hover:bg-black/90 disabled:opacity-50"
        >
          {busy ? "Creating…" : "Sign up"}
        </button>
      </form>
      <p className="mt-6 text-center text-sm text-black/55">
        Already have an account?{" "}
        <Link href="/login" className="font-medium text-sky-600">
          Log in
        </Link>
      </p>
    </div>
  );
}
