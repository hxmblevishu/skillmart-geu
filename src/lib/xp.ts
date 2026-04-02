import type { UserLevel } from "@/types/models";

export const XP_PER_COMPLETED_ORDER = 15;

export function levelFromXp(xp: number): UserLevel {
  if (xp < 0) return "Beginner";
  if (xp <= 50) return "Beginner";
  if (xp <= 150) return "Skilled";
  if (xp <= 300) return "Expert";
  return "Master";
}

/** Progress within current tier toward next level (0–100). */
export function xpProgressInLevel(xp: number): {
  level: UserLevel;
  currentMin: number;
  nextMin: number;
  percent: number;
} {
  const level = levelFromXp(xp);
  const ranges: [UserLevel, number, number][] = [
    ["Beginner", 0, 51],
    ["Skilled", 51, 151],
    ["Expert", 151, 301],
    ["Master", 301, 301],
  ];
  const idx = ranges.findIndex((r) => r[0] === level);
  const [, lo, hi] = ranges[idx]!;
  if (level === "Master") {
    return { level, currentMin: 301, nextMin: 301, percent: 100 };
  }
  const span = hi - lo;
  const pct =
    span <= 0 ? 100 : Math.min(100, Math.round(((xp - lo) / span) * 100));
  return { level, currentMin: lo, nextMin: hi, percent: pct };
}
