"use client";

import { useState } from "react";
import { useChat } from "@/contexts/ChatContext";

interface ComposerProps {
  conversationId: string;
}

/** Sends on Enter, newline on Shift+Enter. Blocks empty/whitespace-only
 * text client-side — the API itself accepts an empty `text` (verified
 * live), so this rule only exists here. */
export default function Composer({ conversationId }: ComposerProps) {
  const { sendMessage } = useChat();
  const [text, setText] = useState("");

  function handleSend() {
    if (!text.trim()) return;
    sendMessage(conversationId, text);
    setText("");
  }

  return (
    <div className="flex items-end gap-3 border-t border-border/60 p-3">
      <textarea
        value={text}
        onChange={(e) => setText(e.target.value)}
        onKeyDown={(e) => {
          if (e.key === "Enter" && !e.shiftKey) {
            e.preventDefault();
            handleSend();
          }
        }}
        placeholder="Write a message…"
        rows={1}
        className="max-h-32 flex-1 resize-none rounded-chip border border-border bg-navy/40 px-4 py-2.5 text-default text-white placeholder:text-sky/60 focus:border-plum focus:outline-none"
      />
      <button
        type="button"
        onClick={handleSend}
        disabled={!text.trim()}
        className="flex h-11 w-11 shrink-0 cursor-pointer items-center justify-center rounded-full bg-plum text-white transition-colors hover:bg-magenta disabled:cursor-not-allowed disabled:opacity-40"
        aria-label="Send message"
      >
        <svg width="18" height="18" viewBox="0 0 20 20" fill="none" aria-hidden="true">
          <path
            d="M2.5 10 17.5 2.5 12.5 17.5 9.5 11 2.5 10Z"
            stroke="currentColor"
            strokeWidth="1.6"
            strokeLinejoin="round"
          />
        </svg>
      </button>
    </div>
  );
}
