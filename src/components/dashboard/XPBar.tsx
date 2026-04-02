"use client";

import { levelFromXp, xpProgressInLevel } from "@/lib/xp";
import type { UserLevel } from "@/types/models";

export function XPBar({ xp }: { xp: number }) {
  const level = levelFromXp(xp);
  const { percent, nextMin } = xpProgressInLevel(xp);

  return (
    <div className="rounded-2xl border border-black/10 bg-white p-6 shadow-sm">
      <div className="flex items-end justify-between gap-4">
        <div>
          <p className="text-xs font-medium uppercase tracking-wide text-black/50">
            Your level
          </p>
          <p className="mt-1 text-2xl font-semibold text-black">{level}</p>
          <p className="mt-1 text-sm text-black/55">
            {xp} XP
            {level !== "Master" ? ` · ${percent}% to next tier` : " · max tier"}
          </p>
        </div>
        <LevelBadge level={level} />
      </div>
      <div className="mt-4 h-2.5 overflow-hidden rounded-full bg-black/[0.06]">
        <div
          className="h-full rounded-full bg-sky-500 transition-all duration-500"
          style={{ width: `${level === "Master" ? 100 : percent}%` }}
        />
      </div>
      {level !== "Master" ? (
        <p className="mt-2 text-xs text-black/45">
          Next band starts at {nextMin} XP
        </p>
      ) : null}
    </div>
  );
}

function LevelBadge({ level }: { level: UserLevel }) {
  const colors: Record<UserLevel, string> = {
    Beginner: "bg-zinc-100 text-zinc-800",
    Skilled: "bg-sky-100 text-sky-900",
    Expert: "bg-sky-200 text-sky-950",
    Master: "bg-black text-white",
  };
  return (
    <span
      className={`rounded-full px-3 py-1 text-xs font-semibold ${colors[level]}`}
    >
      {level}
    </span>
  );
}
