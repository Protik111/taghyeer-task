"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useReducer,
  useRef,
  useState,
} from "react";
import { useAuth } from "./AuthContext";
import * as api from "@/lib/api/endpoints";
import { normalizeGroupMutationResult, normalizeMessage } from "@/lib/api/normalize";
import type { Conversation, Message, User } from "@/lib/api/types";
import { connectSocket, disconnectSocket } from "@/lib/socket";

const PAGE_SIZE = 30;

interface ThreadState {
  messages: Message[]; // oldest -> newest
  hasMore: boolean;
  oldestCursor?: string;
  loading: boolean;
  loadingMore: boolean;
  error: string | null;
  loaded: boolean;
  /** True once an initial load has been kicked off, success or failure —
   * distinct from `loaded` (success-only) so the "load on select" effect
   * fires exactly once per conversation instead of retrying a failed
   * fetch on every state change. Manual retries go through the same
   * `loadInitialMessages` call, just triggered directly instead of by
   * that effect. */
  attempted: boolean;
}

interface ChatState {
  conversations: Record<string, Conversation>;
  conversationsLoading: boolean;
  conversationsError: string | null;
  threads: Record<string, ThreadState>;
}

const EMPTY_THREAD: ThreadState = {
  messages: [],
  hasMore: false,
  loading: false,
  loadingMore: false,
  error: null,
  loaded: false,
  attempted: false,
};

type Action =
  | { type: "CONVERSATIONS_LOADING" }
  | { type: "CONVERSATIONS_LOADED"; conversations: Conversation[] }
  | { type: "CONVERSATIONS_ERROR"; error: string }
  | { type: "UPSERT_CONVERSATION"; conversation: Conversation }
  | { type: "THREAD_LOADING"; conversationId: string }
  | { type: "THREAD_LOADING_MORE"; conversationId: string }
  | { type: "THREAD_ERROR"; conversationId: string; error: string }
  | {
      type: "THREAD_INITIAL_LOADED";
      conversationId: string;
      messagesNewestFirst: Message[];
      hasMore: boolean;
    }
  | {
      type: "THREAD_OLDER_LOADED";
      conversationId: string;
      messagesNewestFirst: Message[];
      hasMore: boolean;
    }
  | { type: "MESSAGE_APPENDED"; conversationId: string; message: Message }
  | { type: "RECONCILE_INCOMING"; conversationId: string; message: Message }
  | {
      type: "MESSAGE_CONFIRMED";
      conversationId: string;
      tempId: string;
      message: Message;
    }
  | { type: "MESSAGE_RETRYING"; conversationId: string; tempId: string }
  | { type: "MESSAGE_FAILED"; conversationId: string; tempId: string };

function getThread(state: ChatState, id: string): ThreadState {
  return state.threads[id] ?? EMPTY_THREAD;
}

/** Merges an older page (server-order: newest-first) into an existing
 * oldest-first list, de-duping by id. The API's `before` cursor is
 * inclusive and can repeat the boundary message — see docs/API.md. */
function mergeOlderPage(existingOldestFirst: Message[], olderNewestFirst: Message[]) {
  const existingIds = new Set(existingOldestFirst.map((m) => m.id));
  const uniqueOldestFirst = [...olderNewestFirst]
    .reverse()
    .filter((m) => !existingIds.has(m.id));
  return {
    merged: [...uniqueOldestFirst, ...existingOldestFirst],
    addedCount: uniqueOldestFirst.length,
    newOldestCursor: uniqueOldestFirst[0]?.id,
  };
}

/** A group-mutation response (rename/add/remove/promote) and the
 * `conversation:updated` socket payload both omit `lastMessage` — keep
 * whatever the sidebar already knew instead of blanking the preview. */
function upsertConversation(
  conversations: Record<string, Conversation>,
  incoming: Conversation,
): Record<string, Conversation> {
  const existing = conversations[incoming.id];
  const merged: Conversation = {
    ...incoming,
    lastMessage: incoming.lastMessage ?? existing?.lastMessage,
  };
  return { ...conversations, [incoming.id]: merged };
}

function touchConversationWithMessage(
  conversation: Conversation,
  message: Message,
): Conversation {
  return {
    ...conversation,
    updatedAt: message.createdAt,
    lastMessage: { text: message.text, senderId: message.senderId, createdAt: message.createdAt },
  };
}

function reducer(state: ChatState, action: Action): ChatState {
  switch (action.type) {
    case "CONVERSATIONS_LOADING":
      return { ...state, conversationsLoading: true, conversationsError: null };
    case "CONVERSATIONS_LOADED": {
      const conversations: Record<string, Conversation> = {};
      for (const c of action.conversations) conversations[c.id] = c;
      return { ...state, conversations, conversationsLoading: false, conversationsError: null };
    }
    case "CONVERSATIONS_ERROR":
      return { ...state, conversationsLoading: false, conversationsError: action.error };
    case "UPSERT_CONVERSATION":
      return { ...state, conversations: upsertConversation(state.conversations, action.conversation) };

    case "THREAD_LOADING":
      return {
        ...state,
        threads: {
          ...state.threads,
          [action.conversationId]: {
            ...getThread(state, action.conversationId),
            loading: true,
            error: null,
            attempted: true,
          },
        },
      };
    case "THREAD_LOADING_MORE":
      return {
        ...state,
        threads: {
          ...state.threads,
          [action.conversationId]: { ...getThread(state, action.conversationId), loadingMore: true },
        },
      };
    case "THREAD_ERROR":
      return {
        ...state,
        threads: {
          ...state.threads,
          [action.conversationId]: {
            ...getThread(state, action.conversationId),
            loading: false,
            loadingMore: false,
            error: action.error,
          },
        },
      };
    case "THREAD_INITIAL_LOADED": {
      const messages = [...action.messagesNewestFirst].reverse();
      return {
        ...state,
        threads: {
          ...state.threads,
          [action.conversationId]: {
            messages,
            hasMore: action.hasMore,
            oldestCursor: messages[0]?.id,
            loading: false,
            loadingMore: false,
            error: null,
            loaded: true,
            attempted: true,
          },
        },
      };
    }
    case "THREAD_OLDER_LOADED": {
      const thread = getThread(state, action.conversationId);
      const { merged, addedCount, newOldestCursor } = mergeOlderPage(
        thread.messages,
        action.messagesNewestFirst,
      );
      return {
        ...state,
        threads: {
          ...state.threads,
          [action.conversationId]: {
            ...thread,
            messages: merged,
            // A page that added nothing new means we've reached the start,
            // regardless of what the server's `hasMore` flag claims.
            hasMore: addedCount === 0 ? false : action.hasMore,
            oldestCursor: newOldestCursor ?? thread.oldestCursor,
            loadingMore: false,
          },
        },
      };
    }
    case "MESSAGE_APPENDED": {
      const thread = state.threads[action.conversationId];
      if (!thread) return state; // conversation never opened — nothing to append to
      if (thread.messages.some((m) => m.id === action.message.id)) return state;
      return {
        ...state,
        threads: {
          ...state.threads,
          [action.conversationId]: { ...thread, messages: [...thread.messages, action.message] },
        },
      };
    }
    case "RECONCILE_INCOMING": {
      const thread = state.threads[action.conversationId];
      if (!thread) return state; // conversation never opened — nothing to reconcile into
      // The socket can echo a message we just sent back to us before our
      // own REST response comes back with the same id (that response is
      // what normally resolves the optimistic bubble via
      // MESSAGE_CONFIRMED). Racing that means this "new" message is
      // actually the confirmation for a still-"sending" bubble already in
      // the list — swap it in place instead of appending a second row
      // that later both end up sharing the same id once the REST
      // response arrives too.
      const pendingIndex = thread.messages.findIndex(
        (m) => m.status === "sending" && m.senderId === action.message.senderId && m.text === action.message.text,
      );
      if (pendingIndex !== -1) {
        const messages = [...thread.messages];
        messages[pendingIndex] = action.message;
        return { ...state, threads: { ...state.threads, [action.conversationId]: { ...thread, messages } } };
      }
      if (thread.messages.some((m) => m.id === action.message.id)) return state;
      return {
        ...state,
        threads: {
          ...state.threads,
          [action.conversationId]: { ...thread, messages: [...thread.messages, action.message] },
        },
      };
    }
    case "MESSAGE_CONFIRMED": {
      const thread = getThread(state, action.conversationId);
      return {
        ...state,
        threads: {
          ...state.threads,
          [action.conversationId]: {
            ...thread,
            messages: thread.messages.map((m) =>
              m.id === action.tempId ? action.message : m,
            ),
          },
        },
      };
    }
    case "MESSAGE_RETRYING": {
      const thread = getThread(state, action.conversationId);
      return {
        ...state,
        threads: {
          ...state.threads,
          [action.conversationId]: {
            ...thread,
            messages: thread.messages.map((m) =>
              m.id === action.tempId ? { ...m, status: "sending" } : m,
            ),
          },
        },
      };
    }
    case "MESSAGE_FAILED": {
      const thread = getThread(state, action.conversationId);
      return {
        ...state,
        threads: {
          ...state.threads,
          [action.conversationId]: {
            ...thread,
            messages: thread.messages.map((m) =>
              m.id === action.tempId ? { ...m, status: "failed" } : m,
            ),
          },
        },
      };
    }
    default:
      return state;
  }
}

interface ChatContextValue {
  conversations: Conversation[];
  conversationsLoading: boolean;
  conversationsError: string | null;
  refreshConversations: () => Promise<void>;

  activeConversationId: string | null;
  selectConversation: (id: string | null) => void;
  getThread: (conversationId: string) => ThreadState;
  /** (Re)runs the first page fetch for a conversation — used both
   * internally on first select and as the manual "try again" action
   * after a failed load. */
  retryLoadMessages: (conversationId: string) => void;
  loadOlderMessages: (conversationId: string) => void;
  sendMessage: (conversationId: string, text: string) => void;
  retryMessage: (conversationId: string, tempId: string) => void;

  startDirectConversation: (otherUser: User) => Promise<Conversation>;
  createGroup: (name: string, participantIds: string[]) => Promise<Conversation>;
  renameGroup: (conversationId: string, name: string) => Promise<void>;
  addParticipants: (conversationId: string, userIds: string[]) => Promise<void>;
  removeParticipant: (conversationId: string, userId: string) => Promise<void>;
  promoteAdmin: (conversationId: string, userId: string) => Promise<void>;
}

const ChatContext = createContext<ChatContextValue | null>(null);

export function ChatProvider({ children }: { children: React.ReactNode }) {
  const { token, user } = useAuth();
  const [state, dispatch] = useReducer(reducer, {
    conversations: {},
    conversationsLoading: false,
    conversationsError: null,
    threads: {},
  });
  const [activeConversationId, setActiveConversationId] = useState<string | null>(null);
  const seenMessageIds = useRef<Set<string>>(new Set());

  const refreshConversations = useCallback(async () => {
    dispatch({ type: "CONVERSATIONS_LOADING" });
    try {
      const conversations = await api.listConversations();
      dispatch({ type: "CONVERSATIONS_LOADED", conversations });
    } catch (err) {
      dispatch({
        type: "CONVERSATIONS_ERROR",
        error: err instanceof Error ? err.message : "Couldn't load your conversations.",
      });
    }
  }, []);

  useEffect(() => {
    if (user) void refreshConversations();
  }, [user, refreshConversations]);

  // Kept in sync after every commit so callbacks with an empty dep
  // array, like the socket handlers below, always see the latest
  // conversations without having to re-subscribe the socket whenever a
  // conversation changes.
  const conversationsRef = useRef(state.conversations);
  useEffect(() => {
    conversationsRef.current = state.conversations;
  }, [state.conversations]);

  // Bumps a conversation's preview + sort order — the bit every "a
  // message landed" path needs regardless of how the message itself got
  // into the thread.
  const touchConversation = useCallback((conversationId: string, message: Message) => {
    const conversation = conversationsRef.current[conversationId];
    if (conversation) {
      dispatch({
        type: "UPSERT_CONVERSATION",
        conversation: touchConversationWithMessage(conversation, message),
      });
    }
  }, []);

  // Adds a freshly-composed optimistic message to its thread. Used only
  // by the send path below — the message is brand new to the client, so
  // there's nothing to reconcile against yet.
  const deliver = useCallback(
    (conversationId: string, message: Message) => {
      dispatch({ type: "MESSAGE_APPENDED", conversationId, message });
      touchConversation(conversationId, message);
    },
    [touchConversation],
  );

  // Folds a message that arrived over the socket into its thread — see
  // the RECONCILE_INCOMING reducer case for why this isn't a plain
  // append.
  const reconcileIncoming = useCallback(
    (conversationId: string, message: Message) => {
      dispatch({ type: "RECONCILE_INCOMING", conversationId, message });
      touchConversation(conversationId, message);
    },
    [touchConversation],
  );

  // --- Socket.IO wiring ---------------------------------------------------
  useEffect(() => {
    if (!token) return;
    const socket = connectSocket(token);

    socket.on("message:new", (raw) => {
      const message = normalizeMessage(raw);
      // Once an id has been dealt with (either an earlier socket event,
      // or the REST response that confirmed our own optimistic send)
      // don't process it again.
      if (seenMessageIds.current.has(message.id)) return;
      seenMessageIds.current.add(message.id);

      if (conversationsRef.current[message.conversationId]) {
        reconcileIncoming(message.conversationId, message);
      } else {
        // First message of a brand-new conversation someone else just
        // started with us — there's no per-conversation fetch endpoint,
        // and there's no `conversation:updated`-style event for a new
        // *direct* conversation coming into existence, only for group
        // changes. Refetching the list is what picks it up; the server's
        // `GET /conversations` already includes this message as
        // `lastMessage`, so nothing else needs to happen here.
        void refreshConversations();
      }
    });

    socket.on("conversation:updated", (raw) => {
      dispatch({ type: "UPSERT_CONVERSATION", conversation: normalizeGroupMutationResult(raw) });
    });

    return () => {
      socket.off("message:new");
      socket.off("conversation:updated");
      disconnectSocket();
    };
  }, [token, reconcileIncoming, refreshConversations]);

  const loadInitialMessages = useCallback(async (conversationId: string) => {
    dispatch({ type: "THREAD_LOADING", conversationId });
    try {
      const page = await api.listMessages(conversationId, { limit: PAGE_SIZE });
      for (const m of page.messages) seenMessageIds.current.add(m.id);
      dispatch({
        type: "THREAD_INITIAL_LOADED",
        conversationId,
        messagesNewestFirst: page.messages,
        hasMore: page.hasMore,
      });
    } catch (err) {
      dispatch({
        type: "THREAD_ERROR",
        conversationId,
        error: err instanceof Error ? err.message : "Couldn't load this conversation.",
      });
    }
  }, []);

  useEffect(() => {
    if (!activeConversationId) return;
    const thread = state.threads[activeConversationId];
    // `attempted` (not `loaded`) gates this: a failed load should wait
    // for an explicit retry, not refire every time state changes.
    if (thread?.attempted) return;
    void loadInitialMessages(activeConversationId);
  }, [activeConversationId, state.threads, loadInitialMessages]);

  const selectConversation = useCallback((id: string | null) => {
    setActiveConversationId(id);
  }, []);

  const loadOlderMessages = useCallback(
    (conversationId: string) => {
      const thread = state.threads[conversationId];
      if (!thread || thread.loadingMore || !thread.hasMore) return;
      dispatch({ type: "THREAD_LOADING_MORE", conversationId });
      void api
        .listMessages(conversationId, { limit: PAGE_SIZE, before: thread.oldestCursor })
        .then((page) => {
          for (const m of page.messages) seenMessageIds.current.add(m.id);
          dispatch({
            type: "THREAD_OLDER_LOADED",
            conversationId,
            messagesNewestFirst: page.messages,
            hasMore: page.hasMore,
          });
        })
        .catch((err) => {
          dispatch({
            type: "THREAD_ERROR",
            conversationId,
            error: err instanceof Error ? err.message : "Couldn't load older messages.",
          });
        });
    },
    [state.threads],
  );

  const sendMessage = useCallback(
    (conversationId: string, text: string) => {
      const trimmed = text.trim();
      if (!trimmed || !user) return;

      const tempId = `temp-${crypto.randomUUID()}`;
      const optimistic: Message = {
        id: tempId,
        tempId,
        conversationId,
        senderId: user.id,
        text: trimmed,
        createdAt: new Date().toISOString(),
        status: "sending",
      };
      deliver(conversationId, optimistic);

      void api
        .sendMessage(conversationId, trimmed)
        .then((confirmed) => {
          seenMessageIds.current.add(confirmed.id);
          dispatch({ type: "MESSAGE_CONFIRMED", conversationId, tempId, message: confirmed });
          const conversation = conversationsRef.current[conversationId];
          if (conversation) {
            dispatch({
              type: "UPSERT_CONVERSATION",
              conversation: touchConversationWithMessage(conversation, confirmed),
            });
          }
        })
        .catch(() => {
          dispatch({ type: "MESSAGE_FAILED", conversationId, tempId });
        });
    },
    [user, deliver],
  );

  const retryMessage = useCallback(
    (conversationId: string, tempId: string) => {
      const thread = state.threads[conversationId];
      const failed = thread?.messages.find((m) => m.id === tempId);
      if (!failed) return;
      dispatch({ type: "MESSAGE_RETRYING", conversationId, tempId });
      void api
        .sendMessage(conversationId, failed.text)
        .then((confirmed) => {
          seenMessageIds.current.add(confirmed.id);
          dispatch({ type: "MESSAGE_CONFIRMED", conversationId, tempId, message: confirmed });
        })
        .catch(() => {
          dispatch({ type: "MESSAGE_FAILED", conversationId, tempId });
        });
    },
    [state.threads],
  );

  const startDirectConversation = useCallback(async (otherUser: User) => {
    const conversation = await api.startDirectConversation(otherUser);
    dispatch({ type: "UPSERT_CONVERSATION", conversation });
    return conversation;
  }, []);

  const createGroup = useCallback(async (name: string, participantIds: string[]) => {
    const conversation = await api.createGroup(name, participantIds);
    dispatch({ type: "UPSERT_CONVERSATION", conversation });
    return conversation;
  }, []);

  const renameGroup = useCallback(async (conversationId: string, name: string) => {
    const conversation = await api.renameGroup(conversationId, name);
    dispatch({ type: "UPSERT_CONVERSATION", conversation });
  }, []);

  const addParticipants = useCallback(async (conversationId: string, userIds: string[]) => {
    const conversation = await api.addParticipants(conversationId, userIds);
    dispatch({ type: "UPSERT_CONVERSATION", conversation });
  }, []);

  const removeParticipant = useCallback(async (conversationId: string, userId: string) => {
    const conversation = await api.removeParticipant(conversationId, userId);
    dispatch({ type: "UPSERT_CONVERSATION", conversation });
  }, []);

  const promoteAdmin = useCallback(async (conversationId: string, userId: string) => {
    const conversation = await api.promoteAdmin(conversationId, userId);
    dispatch({ type: "UPSERT_CONVERSATION", conversation });
  }, []);

  const conversations = useMemo(
    () =>
      Object.values(state.conversations).sort(
        (a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime(),
      ),
    [state.conversations],
  );

  const getThreadFor = useCallback((id: string) => getThread(state, id), [state]);

  const value: ChatContextValue = {
    conversations,
    conversationsLoading: state.conversationsLoading,
    conversationsError: state.conversationsError,
    refreshConversations,
    activeConversationId,
    selectConversation,
    getThread: getThreadFor,
    retryLoadMessages: loadInitialMessages,
    loadOlderMessages,
    sendMessage,
    retryMessage,
    startDirectConversation,
    createGroup,
    renameGroup,
    addParticipants,
    removeParticipant,
    promoteAdmin,
  };

  return <ChatContext.Provider value={value}>{children}</ChatContext.Provider>;
}

export function useChat() {
  const ctx = useContext(ChatContext);
  if (!ctx) throw new Error("useChat must be used within ChatProvider");
  return ctx;
}
