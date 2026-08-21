/**
 * Types for the chat API. These describe the shapes we produce for the
 * rest of the app to consume — see `normalize.ts` for how the API's raw,
 * inconsistent responses get reconciled into these.
 */

export interface User {
  id: string;
  name: string;
  phone: string;
  createdAt?: string;
}

export interface Message {
  id: string;
  conversationId: string;
  senderId: string;
  text: string;
  createdAt: string;
  /** Client-only: set while an optimistically-sent message hasn't been
   * confirmed by the server yet. */
  status?: "sending" | "sent" | "failed";
  /** Client-only: the temporary id an optimistic message was created
   * with, kept around so a later server echo can be matched and merged. */
  tempId?: string;
}

interface ConversationBase {
  id: string;
  updatedAt: string;
  /** Omitted by `GET /conversations` (only present on the mutation
   * endpoints' responses) — see normalize.ts. */
  createdAt?: string;
  lastMessage?: {
    text: string;
    senderId: string;
    createdAt: string;
  };
}

export interface DirectConversation extends ConversationBase {
  type: "direct";
  /** The other participant — the API returns this pre-resolved on
   * `GET /conversations` but not on conversation-create. */
  participant: User;
}

export interface GroupConversation extends ConversationBase {
  type: "group";
  name: string;
  createdBy: string;
  admins: string[];
  participants: User[];
}

export type Conversation = DirectConversation | GroupConversation;

export interface MessagePage {
  messages: Message[];
  hasMore: boolean;
}

export interface ApiErrorDetail {
  path: string;
  message: string;
}

export interface ApiErrorBody {
  message: string;
  code: string;
  details?: ApiErrorDetail[];
}

export class ApiError extends Error {
  code: string;
  status: number;
  details?: ApiErrorDetail[];

  constructor(status: number, body: ApiErrorBody) {
    super(body.message || "Request failed");
    this.name = "ApiError";
    this.status = status;
    this.code = body.code || "UNKNOWN";
    this.details = body.details;
  }
}
