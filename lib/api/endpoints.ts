import { apiRequest } from "./client";
import {
  buildDirectConversation,
  normalizeConversationListItem,
  normalizeGroupMutationResult,
  normalizeMessage,
  normalizeUser,
  type RawConversationListItem,
  type RawDirectCreateResult,
  type RawGroupMutationResult,
  type RawMessage,
  type RawUser,
} from "./normalize";
import type { Conversation, GroupConversation, Message, MessagePage, User } from "./types";

// --- Auth ---------------------------------------------------------------

export async function login(phone: string, name: string) {
  const res = await apiRequest<{ token: string; user: RawUser }>("/auth/login", {
    method: "POST",
    body: { phone, name },
  });
  return { token: res.token, user: normalizeUser(res.user) };
}

export async function fetchMe(): Promise<User> {
  const raw = await apiRequest<RawUser>("/auth/me");
  return normalizeUser(raw);
}

// --- Users ----------------------------------------------------------------

export async function searchUsers(query: string): Promise<User[]> {
  const raw = await apiRequest<RawUser[]>("/users/search", { query: { q: query } });
  return raw.map(normalizeUser);
}

// --- Conversations --------------------------------------------------------

export async function listConversations(): Promise<Conversation[]> {
  const res = await apiRequest<{ data: RawConversationListItem[] }>("/conversations");
  return res.data.map(normalizeConversationListItem);
}

export async function startDirectConversation(otherUser: User) {
  const raw = await apiRequest<RawDirectCreateResult>("/conversations", {
    method: "POST",
    body: { userId: otherUser.id },
  });
  return buildDirectConversation(raw, otherUser);
}

export async function createGroup(
  name: string,
  participantIds: string[],
): Promise<GroupConversation> {
  const raw = await apiRequest<RawGroupMutationResult>("/conversations/group", {
    method: "POST",
    body: { name, participantIds },
  });
  return normalizeGroupMutationResult(raw);
}

export async function renameGroup(
  conversationId: string,
  name: string,
): Promise<GroupConversation> {
  const raw = await apiRequest<RawGroupMutationResult>(`/conversations/${conversationId}`, {
    method: "PATCH",
    body: { name },
  });
  return normalizeGroupMutationResult(raw);
}

export async function addParticipants(
  conversationId: string,
  userIds: string[],
): Promise<GroupConversation> {
  const raw = await apiRequest<RawGroupMutationResult>(
    `/conversations/${conversationId}/participants`,
    { method: "POST", body: { userIds } },
  );
  return normalizeGroupMutationResult(raw);
}

export async function removeParticipant(
  conversationId: string,
  userId: string,
): Promise<GroupConversation> {
  const raw = await apiRequest<RawGroupMutationResult>(
    `/conversations/${conversationId}/participants/${userId}`,
    { method: "DELETE" },
  );
  return normalizeGroupMutationResult(raw);
}

export async function promoteAdmin(
  conversationId: string,
  userId: string,
): Promise<GroupConversation> {
  const raw = await apiRequest<RawGroupMutationResult>(
    `/conversations/${conversationId}/admins`,
    { method: "POST", body: { userId } },
  );
  return normalizeGroupMutationResult(raw);
}

// --- Messages ---------------------------------------------------------------

export async function listMessages(
  conversationId: string,
  opts: { limit?: number; before?: string } = {},
): Promise<MessagePage> {
  const res = await apiRequest<{ messages: RawMessage[]; hasMore: boolean }>(
    `/conversations/${conversationId}/messages`,
    { query: { limit: opts.limit, before: opts.before } },
  );
  return { messages: res.messages.map(normalizeMessage), hasMore: res.hasMore };
}

export async function sendMessage(
  conversationId: string,
  text: string,
): Promise<Message> {
  const raw = await apiRequest<RawMessage>("/messages", {
    method: "POST",
    body: { conversationId, text },
  });
  return normalizeMessage(raw);
}
