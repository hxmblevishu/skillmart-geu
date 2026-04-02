"use client";

import {
  createUserWithEmailAndPassword,
  onAuthStateChanged,
  signInWithEmailAndPassword,
  signOut,
  type User,
} from "firebase/auth";
import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import { getFirebaseAuth, isFirebaseConfigured } from "@/lib/firebase";
import { createUserProfile, getUserProfile, studentIdTaken } from "@/lib/firestore";
import type { UserProfile } from "@/types/models";

type AuthState = {
  firebaseUser: User | null;
  profile: UserProfile | null;
  loading: boolean;
  ready: boolean;
};

type AuthContextValue = AuthState & {
  signIn: (email: string, password: string) => Promise<void>;
  signUp: (input: {
    email: string;
    password: string;
    fullName: string;
    studentId: string;
    institute: string;
    course: string;
    skillsOffered?: string[];
  }) => Promise<void>;
  logOut: () => Promise<void>;
  refreshProfile: () => Promise<void>;
};

const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [firebaseUser, setFirebaseUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);

  const loadProfile = useCallback(async (u: User) => {
    const p = await getUserProfile(u.uid);
    if (p?.suspended) {
      await signOut(getFirebaseAuth());
      setProfile(null);
      setFirebaseUser(null);
      throw new Error("This account has been suspended. Contact support.");
    }
    setProfile(p);
  }, []);

  useEffect(() => {
    if (!isFirebaseConfigured()) {
      setLoading(false);
      return;
    }
    const auth = getFirebaseAuth();
    const unsub = onAuthStateChanged(auth, async (u) => {
      setFirebaseUser(u);
      if (u) {
        try {
          await loadProfile(u);
        } catch {
          setProfile(null);
        }
      } else {
        setProfile(null);
      }
      setLoading(false);
    });
    return () => unsub();
  }, [loadProfile]);

  const refreshProfile = useCallback(async () => {
    const auth = getFirebaseAuth();
    const u = auth.currentUser;
    if (!u) return;
    await loadProfile(u);
  }, [loadProfile]);

  const signIn = useCallback(async (email: string, password: string) => {
    const auth = getFirebaseAuth();
    await signInWithEmailAndPassword(auth, email.trim(), password);
  }, []);

  const signUp = useCallback(
    async (input: {
      email: string;
      password: string;
      fullName: string;
      studentId: string;
      institute: string;
      course: string;
      skillsOffered?: string[];
    }) => {
      if (await studentIdTaken(input.studentId)) {
        throw new Error("This Student ID is already registered.");
      }
      const auth = getFirebaseAuth();
      const cred = await createUserWithEmailAndPassword(
        auth,
        input.email.trim(),
        input.password
      );
      await createUserProfile(cred.user.uid, {
        fullName: input.fullName.trim(),
        studentId: input.studentId.trim(),
        institute: input.institute,
        course: input.course.trim(),
        email: input.email.trim(),
        skillsOffered: input.skillsOffered ?? [],
      });
    },
    []
  );

  const logOut = useCallback(async () => {
    await signOut(getFirebaseAuth());
    setProfile(null);
  }, []);

  const value = useMemo<AuthContextValue>(
    () => ({
      firebaseUser,
      profile,
      loading,
      ready: isFirebaseConfigured(),
      signIn,
      signUp,
      logOut,
      refreshProfile,
    }),
    [firebaseUser, profile, loading, signIn, signUp, logOut, refreshProfile]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
}
