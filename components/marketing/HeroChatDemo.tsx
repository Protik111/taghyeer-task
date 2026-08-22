"use client";

import { useEffect, useState } from "react";
import { cn } from "@/lib/cn";

interface ScriptedMessage {
  from: "them" | "me";
  text: string;
}

const SCRIPT: ScriptedMessage[] = [
  { from: "them", text: "Did the new message just show up without a refresh?" },
  { from: "me", text: "Yep — Socket.IO pushes it straight in 👀" },
  { from: "them", text: "Nice. Group chats too?" },
  { from: "me", text: "1-to-1 and groups, both live." },
];

const TYPING_MS = 1000;
const READ_MS = 1400;
const LOOP_PAUSE_MS = 2200;

/**
 * A small, self-looping mock conversation: "typing…" then a message
 * lands, repeated through a short scripted exchange, then resets. Pure
 * CSS/timers, no assets — meant to *show* the real-time feature the
 * hero is describing rather than illustrate it with a static screenshot.
 */
export default function HeroChatDemo() {
  const [visibleCount, setVisibleCount] = useState(0);
  const [typingFrom, setTypingFrom] = useState<ScriptedMessage["from"] | null>(null);

  useEffect(() => {
    let cancelled = false;
    const timers: ReturnType<typeof setTimeout>[] = [];
    const wait = (ms: number) =>
      new Promise<void>((resolve) => {
        const id = setTimeout(resolve, ms);
        timers.push(id);
      });

    async function run() {
      while (!cancelled) {
        for (let i = 0; i < SCRIPT.length; i++) {
          if (cancelled) return;
          setTypingFrom(SCRIPT[i].from);
          await wait(TYPING_MS);
          if (cancelled) return;
          setTypingFrom(null);
          setVisibleCount(i + 1);
          await wait(READ_MS);
        }
        if (cancelled) return;
        await wait(LOOP_PAUSE_MS);
        if (cancelled) return;
        setVisibleCount(0);
      }
    }

    void run();
    return () => {
      cancelled = true;
      timers.forEach(clearTimeout);
    };
  }, []);

  return (
    <div
      aria-hidden="true"
      className="flex w-full max-w-sm flex-col gap-3 rounded-card border border-border bg-card p-5 shadow-2xl"
    >
      <div className="flex items-center gap-2 border-b border-border/60 pb-3">
        <span className="h-2.5 w-2.5 rounded-full bg-cyan" />
        <span className="text-meta font-semibold uppercase tracking-[0.08em] text-sky/70">
          Live
        </span>
      </div>

      <div className="flex min-h-56 flex-col justify-end gap-2.5">
        {SCRIPT.slice(0, visibleCount).map((m, i) => (
          <div
            key={i}
            className={cn(
              "max-w-[80%] animate-[fadeIn_0.25s_ease-out] rounded-2xl px-3.5 py-2 text-meta",
              m.from === "me"
                ? "self-end rounded-br-sm bg-plum text-white"
                : "self-start rounded-bl-sm border border-border bg-card-alt text-text",
            )}
          >
            {m.text}
          </div>
        ))}

        {typingFrom && (
          <div
            className={cn(
              "flex max-w-[50%] items-center gap-1 rounded-2xl px-3.5 py-2.5",
              typingFrom === "me"
                ? "self-end rounded-br-sm bg-plum/70"
                : "self-start rounded-bl-sm border border-border bg-card-alt",
            )}
          >
            {[0, 1, 2].map((i) => (
              <span
                key={i}
                className="h-1.5 w-1.5 animate-bounce rounded-full bg-white/80"
                style={{ animationDelay: `${i * 120}ms` }}
              />
            ))}
          </div>
        )}
      </div>

      <style>{`
        @keyframes fadeIn {
          from { opacity: 0; transform: translateY(4px); }
          to { opacity: 1; transform: translateY(0); }
        }
      `}</style>
    </div>
  );
}
