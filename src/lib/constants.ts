export const SKILL_CATEGORIES = [
  "Design",
  "Coding",
  "Editing",
  "Tutoring",
  "Notes",
  "Others",
] as const;

export type SkillCategory = (typeof SKILL_CATEGORIES)[number];

export const INSTITUTES = [
  "GEU",
  "GEHU",
  "GEIMS",
  "Other",
] as const;

export const SITE_NAME = "SkillMart GEU";
export const TAGLINE = "Sell Your Skills, Not Your Time";

export const PAYMENT_NOTICE =
  "Contact seller to complete payment via UPI/Cash/Personal Payment";

function parseAdminStudentIds(): Set<string> {
  const raw = process.env.NEXT_PUBLIC_ADMIN_STUDENT_IDS ?? "";
  return new Set(
    raw
      .split(",")
      .map((s) => s.trim().toUpperCase())
      .filter(Boolean)
  );
}

export function isConfiguredAdminStudentId(studentId: string): boolean {
  return parseAdminStudentIds().has(studentId.trim().toUpperCase());
}
