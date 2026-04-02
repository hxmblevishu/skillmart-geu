import {
  addDoc,
  collection,
  deleteDoc,
  doc,
  getDoc,
  getDocs,
  limit,
  orderBy,
  query,
  serverTimestamp,
  setDoc,
  updateDoc,
  where,
  writeBatch,
  type DocumentData,
  type Timestamp,
} from "firebase/firestore";
import { getDb } from "./firebase";
import { XP_PER_COMPLETED_ORDER } from "./xp";
import { isConfiguredAdminStudentId } from "./constants";
import type {
  Conversation,
  Message,
  Order,
  Review,
  SkillListing,
  UserProfile,
} from "@/types/models";

const USERS = "users";
const SKILLS = "skills";
const ORDERS = "orders";
const CONVERSATIONS = "conversations";
const STUDENT_INDEX = "studentIndex";

function db() {
  return getDb();
}

export async function getUserProfile(uid: string): Promise<UserProfile | null> {
  const snap = await getDoc(doc(db(), USERS, uid));
  if (!snap.exists()) return null;
  return snap.data() as UserProfile;
}

export async function studentIdTaken(studentId: string): Promise<boolean> {
  const sid = studentId.trim().toUpperCase();
  const snap = await getDoc(doc(db(), STUDENT_INDEX, sid));
  return snap.exists();
}

export async function createUserProfile(
  uid: string,
  data: Omit<
    UserProfile,
    | "uid"
    | "xp"
    | "completedOrders"
    | "ratingSum"
    | "ratingCount"
    | "verified"
    | "createdAt"
    | "isAdmin"
    | "suspended"
  > & { email: string }
): Promise<void> {
  const sid = data.studentId.trim().toUpperCase();
  const batch = writeBatch(db());
  const userRef = doc(db(), USERS, uid);
  const indexRef = doc(db(), STUDENT_INDEX, sid);
  batch.set(indexRef, { uid });
  batch.set(userRef, {
    uid,
    fullName: data.fullName,
    studentId: sid,
    institute: data.institute,
    course: data.course,
    email: data.email.toLowerCase(),
    skillsOffered: data.skillsOffered ?? [],
    xp: 0,
    completedOrders: 0,
    ratingSum: 0,
    ratingCount: 0,
    verified: false,
    suspended: false,
    isAdmin: isConfiguredAdminStudentId(sid),
    createdAt: serverTimestamp(),
  });
  await batch.commit();
}

export async function updateUserSkillsOffered(
  uid: string,
  skills: string[]
): Promise<void> {
  await updateDoc(doc(db(), USERS, uid), { skillsOffered: skills });
}

export async function listSkills(filters?: {
  category?: string;
  search?: string;
}): Promise<SkillListing[]> {
  const q = query(collection(db(), SKILLS), where("active", "==", true));
  const snaps = await getDocs(q);
  let items: SkillListing[] = snaps.docs.map((d) => ({
    id: d.id,
    ...(d.data() as DocumentData),
  })) as SkillListing[];

  if (filters?.category && filters.category !== "All") {
    items = items.filter((s) => s.category === filters.category);
  }
  if (filters?.search?.trim()) {
    const t = filters.search.trim().toLowerCase();
    items = items.filter(
      (s) =>
        s.title.toLowerCase().includes(t) ||
        s.description.toLowerCase().includes(t) ||
        s.sellerName.toLowerCase().includes(t)
    );
  }
  items.sort((a, b) => {
    const ta = (a.createdAt as Timestamp)?.seconds ?? 0;
    const tb = (b.createdAt as Timestamp)?.seconds ?? 0;
    return tb - ta;
  });
  return items;
}

export async function getSkill(id: string): Promise<SkillListing | null> {
  const snap = await getDoc(doc(db(), SKILLS, id));
  if (!snap.exists()) return null;
  return { id: snap.id, ...(snap.data() as DocumentData) } as SkillListing;
}

export async function createSkill(
  seller: UserProfile,
  input: {
    title: string;
    description: string;
    category: string;
    priceLabel: string;
  }
): Promise<string> {
  const ref = await addDoc(collection(db(), SKILLS), {
    sellerId: seller.uid,
    sellerName: seller.fullName,
    sellerStudentId: seller.studentId,
    sellerVerified: seller.verified,
    title: input.title,
    description: input.description,
    category: input.category,
    priceLabel: input.priceLabel,
    active: true,
    createdAt: serverTimestamp(),
  });
  return ref.id;
}

export async function deactivateSkill(skillId: string): Promise<void> {
  await updateDoc(doc(db(), SKILLS, skillId), { active: false });
}

export async function adminDeleteSkill(skillId: string): Promise<void> {
  await deleteDoc(doc(db(), SKILLS, skillId));
}

export async function createOrder(input: {
  buyer: UserProfile;
  skill: SkillListing;
}): Promise<string> {
  if (input.buyer.uid === input.skill.sellerId) {
    throw new Error("You cannot order your own listing.");
  }
  const ref = await addDoc(collection(db(), ORDERS), {
    buyerId: input.buyer.uid,
    buyerName: input.buyer.fullName,
    sellerId: input.skill.sellerId,
    sellerName: input.skill.sellerName,
    skillId: input.skill.id,
    skillTitle: input.skill.title,
    status: "pending",
    createdAt: serverTimestamp(),
  });
  return ref.id;
}

export async function listOrdersForUser(uid: string): Promise<Order[]> {
  const asBuyer = query(collection(db(), ORDERS), where("buyerId", "==", uid));
  const asSeller = query(
    collection(db(), ORDERS),
    where("sellerId", "==", uid)
  );
  const [b, s] = await Promise.all([getDocs(asBuyer), getDocs(asSeller)]);
  const map = new Map<string, Order>();
  for (const d of [...b.docs, ...s.docs]) {
    map.set(d.id, { id: d.id, ...(d.data() as DocumentData) } as Order);
  }
  return [...map.values()].sort((x, y) => {
    const ta = (x.createdAt as Timestamp)?.seconds ?? 0;
    const tb = (y.createdAt as Timestamp)?.seconds ?? 0;
    return tb - ta;
  });
}

export async function updateOrderStatus(
  orderId: string,
  status: Order["status"],
  actingUid: string
): Promise<void> {
  const ref = doc(db(), ORDERS, orderId);
  const snap = await getDoc(ref);
  if (!snap.exists()) throw new Error("Order not found");
  const order = snap.data() as Order;
  if (actingUid !== order.buyerId && actingUid !== order.sellerId) {
    throw new Error("Not allowed");
  }
  const prev = order.status;
  const updates: Record<string, unknown> = { status };
  if (status === "completed") {
    updates.completedAt = serverTimestamp();
  }
  await updateDoc(ref, updates);
  if (status === "completed" && prev !== "completed") {
    await incrementSellerXp(order.sellerId);
  }
}

async function incrementSellerXp(sellerId: string): Promise<void> {
  const userRef = doc(db(), USERS, sellerId);
  const snap = await getDoc(userRef);
  if (!snap.exists()) return;
  const u = snap.data() as UserProfile;
  await updateDoc(userRef, {
    xp: (u.xp ?? 0) + XP_PER_COMPLETED_ORDER,
    completedOrders: (u.completedOrders ?? 0) + 1,
  });
}

export async function submitReview(input: {
  orderId: string;
  reviewerId: string;
  revieweeId: string;
  rating: number;
  comment: string;
}): Promise<void> {
  const orderSnap = await getDoc(doc(db(), ORDERS, input.orderId));
  if (!orderSnap.exists()) throw new Error("Order not found");
  const order = orderSnap.data() as Order;
  if (order.status !== "completed") throw new Error("Order not completed");
  if (order.buyerId !== input.reviewerId) throw new Error("Only buyer can review");
  const dup = query(
    collection(db(), "reviews"),
    where("orderId", "==", input.orderId),
    where("reviewerId", "==", input.reviewerId)
  );
  const existing = await getDocs(dup);
  if (!existing.empty) throw new Error("You already reviewed this order.");
  await addDoc(collection(db(), "reviews"), {
    orderId: input.orderId,
    reviewerId: input.reviewerId,
    revieweeId: input.revieweeId,
    rating: input.rating,
    comment: input.comment,
    createdAt: serverTimestamp(),
  });
  const userRef = doc(db(), USERS, input.revieweeId);
  const uSnap = await getDoc(userRef);
  if (!uSnap.exists()) return;
  const u = uSnap.data() as UserProfile;
  const sum = (u.ratingSum ?? 0) + input.rating;
  const count = (u.ratingCount ?? 0) + 1;
  await updateDoc(userRef, { ratingSum: sum, ratingCount: count });
}

export async function listReviewsForUser(userId: string): Promise<Review[]> {
  const q = query(
    collection(db(), "reviews"),
    where("revieweeId", "==", userId)
  );
  const snaps = await getDocs(q);
  return snaps.docs.map(
    (d) => ({ id: d.id, ...(d.data() as DocumentData) } as Review)
  );
}

function conversationIdFor(a: string, b: string): string {
  return [a, b].sort().join("__");
}

export async function ensureConversation(
  me: UserProfile,
  other: UserProfile
): Promise<string> {
  const id = conversationIdFor(me.uid, other.uid);
  const ref = doc(db(), CONVERSATIONS, id);
  const snap = await getDoc(ref);
  if (!snap.exists()) {
    await setDoc(ref, {
      id,
      participantIds: [me.uid, other.uid],
      participantNames: {
        [me.uid]: me.fullName,
        [other.uid]: other.fullName,
      },
      lastMessage: "",
      updatedAt: serverTimestamp(),
    });
  }
  return id;
}

export async function sendMessage(
  conversationId: string,
  senderId: string,
  text: string
): Promise<void> {
  await addDoc(
    collection(db(), CONVERSATIONS, conversationId, "messages"),
    {
      senderId,
      text: text.trim(),
      createdAt: serverTimestamp(),
    }
  );
  await updateDoc(doc(db(), CONVERSATIONS, conversationId), {
    lastMessage: text.trim().slice(0, 200),
    updatedAt: serverTimestamp(),
  });
}

export async function listMyConversations(uid: string): Promise<Conversation[]> {
  const q = query(
    collection(db(), CONVERSATIONS),
    where("participantIds", "array-contains", uid)
  );
  const snaps = await getDocs(q);
  const list = snaps.docs.map(
    (d) => ({ id: d.id, ...(d.data() as DocumentData) } as Conversation)
  );
  list.sort((a, b) => {
    const ta = (a.updatedAt as Timestamp)?.seconds ?? 0;
    const tb = (b.updatedAt as Timestamp)?.seconds ?? 0;
    return tb - ta;
  });
  return list;
}

export async function listMessages(conversationId: string): Promise<Message[]> {
  const q = query(
    collection(db(), CONVERSATIONS, conversationId, "messages"),
    orderBy("createdAt", "asc")
  );
  const snaps = await getDocs(q);
  return snaps.docs.map(
    (d) => ({ id: d.id, ...(d.data() as DocumentData) } as Message)
  );
}

export async function featuredSellers(limitN: number): Promise<UserProfile[]> {
  const snaps = await getDocs(query(collection(db(), USERS), limit(80)));
  return snaps.docs
    .map((d) => d.data() as UserProfile)
    .filter((u) => !u.suspended)
    .sort((a, b) => (b.xp ?? 0) - (a.xp ?? 0))
    .slice(0, limitN);
}

export async function listAllUsersForAdmin(): Promise<UserProfile[]> {
  const snaps = await getDocs(collection(db(), USERS));
  return snaps.docs.map((d) => d.data() as UserProfile);
}

export async function listAllSkillsForAdmin(): Promise<SkillListing[]> {
  const snaps = await getDocs(collection(db(), SKILLS));
  return snaps.docs.map(
    (d) => ({ id: d.id, ...(d.data() as DocumentData) } as SkillListing)
  );
}

export async function adminSetUserSuspended(
  uid: string,
  suspended: boolean
): Promise<void> {
  await updateDoc(doc(db(), USERS, uid), { suspended });
}

export async function adminSetUserVerified(
  uid: string,
  verified: boolean
): Promise<void> {
  await updateDoc(doc(db(), USERS, uid), { verified });
}

export async function adminSetUserAdmin(uid: string, isAdmin: boolean): Promise<void> {
  await updateDoc(doc(db(), USERS, uid), { isAdmin });
}
