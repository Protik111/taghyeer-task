const timeFormatter = new Intl.DateTimeFormat("en-US", {
  hour: "numeric",
  minute: "2-digit",
});
const weekdayFormatter = new Intl.DateTimeFormat("en-US", { weekday: "short" });
const dateFormatter = new Intl.DateTimeFormat("en-US", { month: "short", day: "numeric" });
const fullDateFormatter = new Intl.DateTimeFormat("en-US", {
  month: "long",
  day: "numeric",
  year: "numeric",
});

function isSameDay(a: Date, b: Date) {
  return (
    a.getFullYear() === b.getFullYear() &&
    a.getMonth() === b.getMonth() &&
    a.getDate() === b.getDate()
  );
}

function daysAgo(date: Date, now: Date) {
  const start = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const target = new Date(date.getFullYear(), date.getMonth(), date.getDate());
  return Math.round((start.getTime() - target.getTime()) / 86_400_000);
}

/** `Intl.DateTimeFormat.format` throws `RangeError: Invalid time value`
 * on an invalid Date rather than returning a placeholder — and this API
 * has already sent at least one timestamp-shaped field that turned out
 * to be missing (see docs/API.md). A formatting helper shouldn't be able
 * to crash the tree over it, so every formatter below routes through
 * this guard instead of calling `Intl.DateTimeFormat` directly on
 * unchecked input. */
function safeFormat(iso: string, format: (date: Date) => string): string {
  const date = new Date(iso);
  return Number.isNaN(date.getTime()) ? "" : format(date);
}

/** Time shown on a message bubble: always just the clock time — the day
 * divider above it carries the date context. */
export function formatMessageTime(iso: string): string {
  return safeFormat(iso, (date) => timeFormatter.format(date));
}

/** Label for a day divider in the message list. */
export function formatDayDivider(iso: string): string {
  return safeFormat(iso, (date) => {
    const now = new Date();
    const diff = daysAgo(date, now);
    if (diff === 0) return "Today";
    if (diff === 1) return "Yesterday";
    if (diff < 7) return weekdayFormatter.format(date);
    return fullDateFormatter.format(date);
  });
}

/** Compact timestamp for a conversation list row. */
export function formatConversationTimestamp(iso: string): string {
  return safeFormat(iso, (date) => formatConversationDate(date));
}

function formatConversationDate(date: Date): string {
  const now = new Date();
  if (isSameDay(date, now)) return timeFormatter.format(date);
  const diff = daysAgo(date, now);
  if (diff === 1) return "Yesterday";
  if (diff < 7) return weekdayFormatter.format(date);
  return dateFormatter.format(date);
}

/** Up to two initials from a display name, for the fallback avatar. */
export function getInitials(name: string): string {
  const parts = name.trim().split(/\s+/).filter(Boolean);
  if (parts.length === 0) return "?";
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
  return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
}

/** Deterministic avatar background, one of the design system's accent
 * tokens, keyed off a stable id so the same person always gets the same
 * color across sessions. */
const AVATAR_TONES = [
  "bg-magenta",
  "bg-plum",
  "bg-blue",
  "bg-[#00B894]",
  "bg-[#E67E22]",
  "bg-pink",
] as const;

export function getAvatarTone(id: string): string {
  let hash = 0;
  for (let i = 0; i < id.length; i++) {
    hash = (hash * 31 + id.charCodeAt(i)) >>> 0;
  }
  return AVATAR_TONES[hash % AVATAR_TONES.length];
}
