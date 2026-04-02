import Link from "next/link";
import { SITE_NAME } from "@/lib/constants";

export function SiteFooter() {
  return (
    <footer className="mt-auto border-t border-black/10 bg-white">
      <div className="mx-auto max-w-6xl px-4 py-12 sm:px-6">
        <div className="flex flex-col gap-8 sm:flex-row sm:justify-between">
          <div>
            <p className="font-semibold text-black">{SITE_NAME}</p>
            <p className="mt-2 max-w-sm text-sm text-black/60">
              Peer-to-peer skill marketplace for Graphic Era students. No
              on-platform payments—connect safely and arrange UPI or cash
              directly.
            </p>
          </div>
          <div className="flex gap-10 text-sm">
            <div className="flex flex-col gap-2">
              <span className="font-medium text-black">Explore</span>
              <Link href="/browse" className="text-black/60 hover:text-sky-600">
                Browse skills
              </Link>
              <Link href="/sell" className="text-black/60 hover:text-sky-600">
                Sell a skill
              </Link>
              <Link href="/signup" className="text-black/60 hover:text-sky-600">
                Join
              </Link>
            </div>
            <div className="flex flex-col gap-2">
              <span className="font-medium text-black">Account</span>
              <Link href="/dashboard" className="text-black/60 hover:text-sky-600">
                Dashboard
              </Link>
              <Link href="/orders" className="text-black/60 hover:text-sky-600">
                Orders
              </Link>
            </div>
          </div>
        </div>
        <p className="mt-10 text-center text-xs text-black/45">
          © {new Date().getFullYear()} {SITE_NAME}. Built for the GEU community.
        </p>
      </div>
    </footer>
  );
}
