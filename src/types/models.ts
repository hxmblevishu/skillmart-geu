import type { Timestamp } from "firebase/firestore";

export type UserLevel = "Beginner" | "Skilled" | "Expert" | "Master";

export interface UserProfile {
  uid: string;
  fullName: string;
  studentId: string;
  institute: string;
  course: string;
  email: string;
  skillsOffered: string[];
  xp: number;
  completedOrders: number;
  ratingSum: number;
  ratingCount: number;
  verified: boolean;
  suspended?: boolean;
  isAdmin?: boolean;
  createdAt: Timestamp;
  photoURL?: string;
}

export interface SkillListing {
  id: string;
  sellerId: string;
  sellerName: string;
  sellerStudentId: string;
  sellerVerified: boolean;
  title: string;
  description: string;
  category: string;
  priceLabel: string;
  active: boolean;
  createdAt: Timestamp;
  imageURL?: string;
}

export type OrderStatus =
  | "pending"
  | "in_progress"
  | "completed"
  | "cancelled";

export interface Order {
  id: string;
  buyerId: string;
  buyerName: string;
  sellerId: string;
  sellerName: string;
  skillId: string;
  skillTitle: string;
  status: OrderStatus;
  createdAt: Timestamp;
  completedAt?: Timestamp;
}

export interface Message {
  id: string;
  senderId: string;
  text: string;
  createdAt: Timestamp;
}

export interface Conversation {
  id: string;
  participantIds: string[];
  participantNames: Record<string, string>;
  lastMessage: string;
  updatedAt: Timestamp;
}

export interface Review {
  id: string;
  orderId: string;
  reviewerId: string;
  revieweeId: string;
  rating: number;
  comment: string;
  createdAt: Timestamp;
}
