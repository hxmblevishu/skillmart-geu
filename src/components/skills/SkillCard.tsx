import Link from "next/link";
import type { SkillListing } from "@/types/models";
import { VerifiedBadge } from "@/components/ui/VerifiedBadge";

export function SkillCard({ skill }: { skill: SkillListing }) {
  return (
    <Link
      href={`/skills/${skill.id}`}
      className="group flex flex-col rounded-2xl border border-black/10 bg-white p-5 shadow-sm transition hover:border-sky-200 hover:shadow-md"
    >
      <div className="mb-3 flex items-start justify-between gap-2">
        <span className="rounded-full bg-sky-50 px-2.5 py-0.5 text-xs font-medium text-sky-800">
          {skill.category}
        </span>
        <span className="text-sm font-semibold text-black">{skill.priceLabel}</span>
      </div>
      <h3 className="text-lg font-semibold tracking-tight text-black group-hover:text-sky-700">
        {skill.title}
      </h3>
      <p className="mt-2 line-clamp-2 text-sm text-black/60">{skill.description}</p>
      <div className="mt-4 flex items-center gap-2 border-t border-black/5 pt-4">
        <span className="text-sm font-medium text-black/80">{skill.sellerName}</span>
        {skill.sellerVerified ? <VerifiedBadge /> : null}
      </div>
    </Link>
  );
}
