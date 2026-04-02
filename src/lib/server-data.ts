import "server-only";
import { featuredSellers } from "./firestore";
import { isFirebaseConfigured } from "./firebase";
import type { UserProfile } from "@/types/models";

export async function getFeaturedSellers(n: number): Promise<UserProfile[]> {
  if (!isFirebaseConfigured()) return [];

  try {
    const data = await featuredSellers(n);
    return data ?? [];
  } catch (e) {
    console.error("Error fetching featured sellers:", e);
    return [];
  }
}