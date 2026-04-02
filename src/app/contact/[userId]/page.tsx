"use client";

import Link from "next/link";
import { useParams, useSearchParams } from "next/navigation";
import { Suspense, useEffect, useRef, useState } from "react";
import { useAuth } from "@/context/AuthContext";
import { PAYMENT_NOTICE } from "@/lib/constants";
import { isFirebaseConfigured } from "@/lib/firebase";
import {
  ensureConversation,
  getUserProfile,
  listMessages,
  sendMessage,
} from "@/lib/firestore";
import type { Message, UserProfile } from "@/types/models";

function ContactInner() {
  const { userId } = useParams<{ userId: string }>();
  const searchParams = useSearchParams();
  const skillHint = searchParams.get("skill");
  const { profile: me } = useAuth();
  const [other, setOther] = useState<UserProfile | null>(null);
  const [conversationId, setConversationId] = useState<string | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [text, setText] = useState(skillHint ? `Hi! I'm interested in: ${skillHint}` : "");
  const [sending, setSending] = useState(false);
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!userId || !me || !isFirebaseConfigured()) return;
    let c = false;
    (async () => {
      const u = await getUserProfile(userId);
      if (c || !u) return;
      setOther(u);
      const cid = await ensureConversation(me, u);
      if (c) return;
      setConversationId(cid);
      const msgs = await listMessages(cid);
      if (!c) setMessages(msgs);
    })();
    return () => {
      c = true;
    };
  }, [userId, me]);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  async function handleSend(e: React.FormEvent) {
    e.preventDefault();
    if (!me || !conversationId || !text.trim()) return;
    setSending(true);
    try {
      await sendMessage(conversationId, me.uid, text);
      setText("");
      const msgs = await listMessages(conversationId);
      setMessages(msgs);
    } finally {
      setSending(false);
    }
  }

  if (!me) {
    return (
      <div className="mx-auto max-w-lg px-4 py-16 sm:px-6">
        <h1 className="text-xl font-semibold text-black">Contact</h1>
        <p className="mt-2 text-sm text-black/60">Log in to message sellers.</p>
        <Link href="/login" className="mt-6 inline-block text-sky-600">
          Log in →
        </Link>
      </div>
    );
  }

  if (me.uid === userId) {
    return (
      <div className="mx-auto max-w-lg px-4 py-16 sm:px-6">
        <p className="text-black/70">You can&apos;t message yourself.</p>
      </div>
    );
  }

  if (!other) {
    return (
      <div className="mx-auto max-w-lg px-4 py-16 text-sm text-black/50 sm:px-6">
        Loading chat…
      </div>
    );
  }

  return (
    <div className="mx-auto flex max-w-lg flex-col px-4 py-10 sm:px-6">
      <Link href={`/profile/${other.uid}`} className="text-sm text-sky-600">
        ← {other.fullName}
      </Link>
      <h1 className="mt-4 text-2xl font-semibold text-black">Messages</h1>
      <p className="mt-2 rounded-xl bg-sky-50/90 p-3 text-xs text-sky-950">{PAYMENT_NOTICE}</p>

      <div className="mt-6 flex max-h-[420px] flex-col gap-3 overflow-y-auto rounded-2xl border border-black/10 bg-white p-4">
        {messages.length === 0 ? (
          <p className="text-sm text-black/50">Say hi and agree on scope & payment.</p>
        ) : (
          messages.map((m) => {
            const mine = m.senderId === me.uid;
            return (
              <div
                key={m.id}
                className={`max-w-[85%] rounded-2xl px-4 py-2 text-sm ${
                  mine
                    ? "ml-auto bg-black text-white"
                    : "mr-auto bg-black/[0.06] text-black"
                }`}
              >
                {m.text}
              </div>
            );
          })
        )}
        <div ref={bottomRef} />
      </div>

      <form onSubmit={(e) => void handleSend(e)} className="mt-4 flex gap-2">
        <input
          value={text}
          onChange={(e) => setText(e.target.value)}
          placeholder="Type a message…"
          className="min-w-0 flex-1 rounded-full border border-black/15 px-4 py-3 text-sm outline-none focus:ring-4 focus:ring-sky-500/25"
        />
        <button
          type="submit"
          disabled={sending || !text.trim()}
          className="rounded-full bg-sky-500 px-5 py-3 text-sm font-semibold text-white hover:bg-sky-600 disabled:opacity-40"
        >
          Send
        </button>
      </form>
    </div>
  );
}

export default function ContactPage() {
  return (
    <Suspense
      fallback={
        <div className="mx-auto max-w-lg px-4 py-16 text-sm text-black/50 sm:px-6">
          Loading…
        </div>
      }
    >
      <ContactInner />
    </Suspense>
  );
}
