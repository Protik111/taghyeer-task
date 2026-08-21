/**
 * The API returns three genuinely different shapes for "a conversation"
 * depending on which endpoint you hit (see docs/API.md, "Notes &
 * deviations"). Every raw response gets funneled through these functions
 * so the rest of the app only ever deals with the typed shapes in
 * `types.ts`, never the wire format directly.
 */
import type {
  Conversation,
  DirectConversation,
  GroupConversation,
  Message,
  User,
} from "./types";

// --- raw wire shapes (only used inside this file) ---------------------

export interface RawUser {
  _id: string;
  name: string;
  phone: string;
  createdAt?: string;
}

interface RawLastMessage {
  text: string;
  sender: string;
  createdAt: string;
}

/** `GET /conversations` list item — group and direct variants both
 * arrive with `type`, but with otherwise different fields. */
export interface RawConversationListItem {
  _id: string;
  type: "direct" | "group";
  updatedAt: string;
  lastMessage?: RawLastMessage | Record<string, never>;
  // group-only
  name?: string;
  createdBy?: string;
  admins?: string[];
  participants?: RawUser[];
  // direct-only
  participant?: RawUser;
}

/** Shape returned by every group-mutating REST endpoint (create, rename,
 * add participant, remove participant, promote admin), and pushed again
 * over the `conversation:updated` socket event for the same actions.
 * `createdAt`/`updatedAt` are optional because the *create* socket push
 * specifically omits both — confirmed live: the REST create response has
 * them, but the matching `conversation:updated` broadcast to other
 * members doesn't. Rename/membership socket pushes do include them. */
export interface RawGroupMutationResult {
  _id: string;
  type: "group";
  name: string;
  createdBy: string;
  admins: string[];
  participants: RawUser[];
  createdAt?: string;
  updatedAt?: string;
}

/** Shape returned by `POST /conversations` (start direct) — deliberately
 * NOT trusted for participant details, see `buildDirectConversation`. */
export interface RawDirectCreateResult {
  _id: string;
  participants: [string, string];
  createdAt: string;
}

/**
 * The REST response (`POST /messages`, `GET .../messages`) and the
 * Socket.IO `message:new` push use genuinely different field names for
 * the same data — confirmed live: REST sends `_id` and an ISO
 * `createdAt` string; the socket push sends `id` and a numeric
 * (epoch-ms) `createdAt`. Both are accepted here rather than assuming
 * one shape.
 */
export interface RawMessage {
  _id?: string;
  id?: string;
  conversation: string;
  sender: string;
  text: string;
  createdAt: string | number;
}

// --- normalizers --------------------------------------------------------

export function normalizeUser(raw: RawUser): User {
  return { id: raw._id, name: raw.name, phone: raw.phone, createdAt: raw.createdAt };
}

function normalizeLastMessage(raw?: RawLastMessage | Record<string, never>) {
  if (!raw || !("text" in raw)) return undefined;
  return { text: raw.text, senderId: raw.sender, createdAt: raw.createdAt };
}

/** Normalizes one item from `GET /conversations`. Requires the current
 * user's id only to satisfy the type checker on the direct branch
 * (the API already excludes "me" from `participant`). */
export function normalizeConversationListItem(
  raw: RawConversationListItem,
): Conversation {
  if (raw.type === "group") {
    return {
      id: raw._id,
      type: "group",
      name: raw.name ?? "Untitled group",
      createdBy: raw.createdBy ?? "",
      admins: raw.admins ?? [],
      participants: (raw.participants ?? []).map(normalizeUser),
      updatedAt: raw.updatedAt,
      lastMessage: normalizeLastMessage(raw.lastMessage),
    } satisfies GroupConversation;
  }

  return {
    id: raw._id,
    type: "direct",
    participant: raw.participant
      ? normalizeUser(raw.participant)
      : { id: "unknown", name: "Unknown user", phone: "" },
    updatedAt: raw.updatedAt,
    lastMessage: normalizeLastMessage(raw.lastMessage),
  } satisfies DirectConversation;
}

export function normalizeGroupMutationResult(
  raw: RawGroupMutationResult,
): GroupConversation {
  // `updatedAt` drives the sidebar's sort order and its "time ago" label,
  // so it can't be left `undefined` — "now" is the closest honest guess
  // when the server didn't send one (see the interface doc above).
  const updatedAt = raw.updatedAt ?? new Date().toISOString();
  return {
    id: raw._id,
    type: "group",
    name: raw.name,
    createdBy: raw.createdBy,
    admins: raw.admins,
    participants: raw.participants.map(normalizeUser),
    createdAt: raw.createdAt ?? updatedAt,
    updatedAt,
  };
}

/**
 * `POST /conversations` only echoes back raw participant ids, not the
 * populated user we already have on hand (the caller found `otherUser`
 * via `/users/search` right before calling this). Building the typed
 * conversation from that known user avoids an extra round trip to
 * `GET /conversations` just to re-fetch what we already know.
 */
export function buildDirectConversation(
  raw: RawDirectCreateResult,
  otherUser: User,
): DirectConversation {
  return {
    id: raw._id,
    type: "direct",
    participant: otherUser,
    createdAt: raw.createdAt,
    updatedAt: raw.createdAt,
  };
}

export function normalizeMessage(raw: RawMessage): Message {
  const id = raw._id ?? raw.id;
  if (!id) throw new Error("normalizeMessage: message has neither _id nor id");
  return {
    id,
    conversationId: raw.conversation,
    senderId: raw.sender,
    text: raw.text,
    createdAt: typeof raw.createdAt === "number" ? new Date(raw.createdAt).toISOString() : raw.createdAt,
    status: "sent",
  };
}
