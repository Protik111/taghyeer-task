import { io, type Socket } from "socket.io-client";
import type { RawGroupMutationResult, RawMessage } from "./api/normalize";

const SOCKET_URL =
  process.env.NEXT_PUBLIC_SOCKET_URL ?? "https://frontend-task-chatapp.onrender.com";

/** Server → client events (see docs/API.md). Kept narrow and typed so
 * handlers don't need to guess the payload shape. */
export interface ServerToClientEvents {
  "message:new": (message: RawMessage) => void;
  "conversation:updated": (conversation: RawGroupMutationResult) => void;
}

export interface ClientToServerEvents {
  "message:send": (payload: { conversationId: string; text: string }) => void;
}

export type ChatSocket = Socket<ServerToClientEvents, ClientToServerEvents>;

let socket: ChatSocket | null = null;

/**
 * Socket.IO connects at the server's root origin, not the REST API's
 * `/api` base (verified against the live server — see docs/API.md).
 * A single connection is reused for the lifetime of an authenticated
 * session; ChatContext owns calling connect/disconnect around it.
 */
export function connectSocket(token: string): ChatSocket {
  if (socket?.connected) return socket;

  // Deliberately not forcing `transports: ["websocket", ...]` — the
  // library's default (long-polling first, upgrade to WebSocket once
  // that handshake succeeds) is the more compatible order behind
  // proxies/load balancers like Render's, and forcing WebSocket first
  // was producing spurious "closed before the connection is established"
  // console warnings on fast page loads with no functional difference.
  socket = io(SOCKET_URL, { auth: { token } });

  return socket;
}

export function disconnectSocket() {
  socket?.disconnect();
  socket = null;
}
