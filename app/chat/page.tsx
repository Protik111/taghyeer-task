"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/contexts/AuthContext";
import { ChatProvider } from "@/contexts/ChatContext";
import ChatShell from "@/components/chat/ChatShell";

/**
 * There's no server session to check here (the JWT lives in
 * localStorage), so the guard is client-side: redirect once
 * AuthProvider has finished restoring (or failing to restore) a
 * session, and show a neutral loading state until then instead of a
 * flash of the chat UI or an instant bounce.
 */
export default function ChatPage() {
  const { status } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (status === "unauthenticated") router.replace("/login");
  }, [status, router]);

  if (status !== "authenticated") {
    return (
      <div className="flex h-dvh items-center justify-center text-default text-sky/70">
        Loading…
      </div>
    );
  }

  return (
    <ChatProvider>
      <ChatShell />
    </ChatProvider>
  );
}
