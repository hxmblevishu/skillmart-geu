"use client";

import { isFirebaseConfigured } from "@/lib/firebase";

export function ConfigBanner() {
  if (isFirebaseConfigured()) return null;
  return (
    <div className="border-b border-amber-200 bg-amber-50 px-4 py-2 text-center text-sm text-amber-950">
      Add Firebase keys in{" "}
      <code className="rounded bg-amber-100 px-1.5 py-0.5 text-xs">.env.local</code>{" "}
      (see <code className="rounded bg-amber-100 px-1.5 py-0.5 text-xs">.env.example</code>
      ). Auth and data require a project.
    </div>
  );
}
