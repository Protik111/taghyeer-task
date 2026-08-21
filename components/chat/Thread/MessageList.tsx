"use client";

import { useEffect, useLayoutEffect, useRef, useState } from "react";
import { useChat } from "@/contexts/ChatContext";
import type { Conversation, Message } from "@/lib/api/types";
import MessageBubble from "./MessageBubble";
import { MessageListSkeleton } from "@/components/shared/Skeletons";
import EmptyState from "@/components/shared/EmptyState";
import ErrorState from "@/components/shared/ErrorState";
import { formatDayDivider } from "@/lib/format";

const NEAR_BOTTOM_THRESHOLD = 96;

interface MessageListProps {
  conversationId: string;
  conversation: Conversation;
  currentUserId: string;
}

function senderNameFor(conversation: Conversation, senderId: string): string | undefined {
  if (conversation.type !== "group") return undefined;
  return conversation.participants.find((p) => p.id === senderId)?.name;
}

function dayKey(iso: string) {
  const d = new Date(iso);
  return `${d.getFullYear()}-${d.getMonth()}-${d.getDate()}`;
}

interface MessageRow {
  message: Message;
  showDivider: boolean;
  isOwn: boolean;
  showSender: boolean;
}

/** Plain helper (not a hook, no render-time mutation) that figures out
 * where day dividers go and which consecutive same-sender messages can
 * skip repeating the sender's name — computed once per messages array
 * rather than mutated while mapping over it in JSX. */
function buildRows(messages: Message[], currentUserId: string): MessageRow[] {
  let lastDay = "";
  let lastSender = "";
  const rows: MessageRow[] = [];
  for (const message of messages) {
    const key = dayKey(message.createdAt);
    const showDivider = key !== lastDay;
    lastDay = key;

    const isOwn = message.senderId === currentUserId;
    const showSender = !isOwn && message.senderId !== lastSender;
    lastSender = message.senderId;

    rows.push({ message, showDivider, isOwn, showSender });
  }
  return rows;
}

export default function MessageList({ conversationId, conversation, currentUserId }: MessageListProps) {
  const { getThread, loadOlderMessages, retryLoadMessages, retryMessage } = useChat();
  const thread = getThread(conversationId);

  const containerRef = useRef<HTMLDivElement>(null);
  const topSentinelRef = useRef<HTMLDivElement>(null);

  const [isNearBottom, setIsNearBottom] = useState(true);
  const [unseenCount, setUnseenCount] = useState(0);

  const prevMessagesRef = useRef<Message[]>([]);
  const scrollAnchorRef = useRef<{ scrollHeight: number; scrollTop: number } | null>(null);
  const didInitialScrollRef = useRef(false);

  // Per-conversation bookkeeping (scroll position, unseen count, refs)
  // resets for free: ThreadPanel mounts a fresh MessageList (`key={conversationId}`)
  // per conversation rather than this component resetting itself in an effect.

  // Infinite-scroll-up pagination via a sentinel above the oldest message.
  useEffect(() => {
    const sentinel = topSentinelRef.current;
    const container = containerRef.current;
    if (!sentinel || !container || !thread.hasMore) return;

    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0]?.isIntersecting && !thread.loadingMore) {
          scrollAnchorRef.current = {
            scrollHeight: container.scrollHeight,
            scrollTop: container.scrollTop,
          };
          loadOlderMessages(conversationId);
        }
      },
      { root: container, threshold: 0 },
    );
    observer.observe(sentinel);
    return () => observer.disconnect();
  }, [conversationId, thread.hasMore, thread.loadingMore, loadOlderMessages]);

  // Track proximity to the bottom; snap the "new messages" pill closed
  // once the user scrolls back down to it themselves.
  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;
    function onScroll() {
      if (!container) return;
      const distance = container.scrollHeight - container.scrollTop - container.clientHeight;
      const near = distance < NEAR_BOTTOM_THRESHOLD;
      setIsNearBottom(near);
      if (near) setUnseenCount(0);
    }
    container.addEventListener("scroll", onScroll, { passive: true });
    return () => container.removeEventListener("scroll", onScroll);
  }, [conversationId]);

  // The auto-scroll contract: restore scroll position exactly when an
  // older page is prepended, jump straight to the bottom on first open,
  // and otherwise only follow new messages down if the reader was
  // already at the bottom — never yank them away from something they
  // scrolled up to read.
  useLayoutEffect(() => {
    const container = containerRef.current;
    const prev = prevMessagesRef.current;
    const messages = thread.messages;
    if (!container || messages === prev) return;

    if (scrollAnchorRef.current) {
      const anchor = scrollAnchorRef.current;
      scrollAnchorRef.current = null;
      container.scrollTop = anchor.scrollTop + (container.scrollHeight - anchor.scrollHeight);
      prevMessagesRef.current = messages;
      return;
    }

    if (!didInitialScrollRef.current && messages.length > 0) {
      didInitialScrollRef.current = true;
      container.scrollTop = container.scrollHeight;
      prevMessagesRef.current = messages;
      return;
    }

    const prevLastId = prev[prev.length - 1]?.id;
    const newLastId = messages[messages.length - 1]?.id;
    const grewAtTail = messages.length > prev.length && newLastId !== prevLastId;

    if (grewAtTail) {
      if (isNearBottom) {
        container.scrollTo({ top: container.scrollHeight, behavior: "smooth" });
      } else {
        setUnseenCount((count) => count + Math.max(messages.length - prev.length, 1));
      }
    }

    prevMessagesRef.current = messages;
  }, [thread.messages, isNearBottom]);

  function jumpToBottom() {
    const container = containerRef.current;
    if (!container) return;
    container.scrollTo({ top: container.scrollHeight, behavior: "smooth" });
    setUnseenCount(0);
  }

  if (thread.loading && thread.messages.length === 0) {
    return <MessageListSkeleton />;
  }

  if (thread.error && thread.messages.length === 0) {
    return <ErrorState message={thread.error} onRetry={() => retryLoadMessages(conversationId)} />;
  }

  if (thread.messages.length === 0) {
    return <EmptyState title="No messages yet" description="Say hi 👋 — messages appear here in real time." />;
  }

  const rows = buildRows(thread.messages, currentUserId);

  return (
    <div className="relative flex-1 overflow-hidden">
      <div ref={containerRef} className="no-scrollbar h-full overflow-y-auto px-4 py-4">
        <div ref={topSentinelRef} />
        {thread.loadingMore && (
          <p className="py-2 text-center text-meta text-sky/60">Loading earlier messages…</p>
        )}

        <div className="flex flex-col gap-3">
          {rows.map(({ message, showDivider, isOwn, showSender }) => (
            <div key={message.id}>
              {showDivider && (
                <div className="my-3 flex items-center justify-center">
                  <span className="rounded-pill bg-card-alt px-3 py-1 text-meta text-sky/70">
                    {formatDayDivider(message.createdAt)}
                  </span>
                </div>
              )}
              <MessageBubble
                message={message}
                isOwn={isOwn}
                senderName={showSender ? senderNameFor(conversation, message.senderId) : undefined}
                onRetry={
                  message.status === "failed" && message.tempId
                    ? () => retryMessage(conversationId, message.tempId!)
                    : undefined
                }
              />
            </div>
          ))}
        </div>
      </div>

      {unseenCount > 0 && (
        <button
          type="button"
          onClick={jumpToBottom}
          className="absolute bottom-3 left-1/2 flex -translate-x-1/2 cursor-pointer items-center gap-1.5 rounded-pill bg-plum px-4 py-2 text-meta font-semibold text-white shadow-lg transition-transform hover:scale-105"
        >
          ↓ {unseenCount} new {unseenCount === 1 ? "message" : "messages"}
        </button>
      )}
    </div>
  );
}
