import "server-only";
import { featuredSellers } from "./firestore";
import { isFirebaseConfigured } from "./firebase";
import type { UserProfile } from "@/types/models";

export async function getFeaturedSellers(n: number): Promise<UserProfile[]> {
  if (!isFirebaseConfigured()) return [];
  try {
    return await featuredSellers(n);
  } catch {
    return [];
  }
}
