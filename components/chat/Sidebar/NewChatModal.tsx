"use client";

import { useState } from "react";
import Modal from "@/components/shared/Modal";
import Avatar from "@/components/shared/Avatar";
import Button from "@/components/ui/Button";
import { useUserSearch } from "@/hooks/useUserSearch";
import { useChat } from "@/contexts/ChatContext";
import type { User } from "@/lib/api/types";
import { ApiError } from "@/lib/api/types";

const MIN_GROUP_PARTICIPANTS = 3; // verified live: `POST /conversations/group` 400s under this

interface NewChatModalProps {
  onClose: () => void;
  onCreated: (conversationId: string) => void;
}

type Mode = "direct" | "group";

/**
 * Single modal for both "start a direct chat" and "create a group" —
 * they share the same user-search picker, just single- vs multi-select,
 * so splitting them into two components mostly duplicated markup.
 */
export default function NewChatModal({ onClose, onCreated }: NewChatModalProps) {
  const [mode, setMode] = useState<Mode>("direct");
  const [selected, setSelected] = useState<User[]>([]);
  const [groupName, setGroupName] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { startDirectConversation, createGroup } = useChat();

  const search = useUserSearch(selected.map((u) => u.id));

  function toggleSelected(user: User) {
    setError(null);
    setSelected((prev) =>
      prev.some((u) => u.id === user.id) ? prev.filter((u) => u.id !== user.id) : [...prev, user],
    );
  }

  async function handleStartDirect(user: User) {
    setSubmitting(true);
    setError(null);
    try {
      const conversation = await startDirectConversation(user);
      onCreated(conversation.id);
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "Couldn't start that chat.");
      setSubmitting(false);
    }
  }

  async function handleCreateGroup(event: React.FormEvent) {
    event.preventDefault();
    if (!groupName.trim() || selected.length < MIN_GROUP_PARTICIPANTS) return;
    setSubmitting(true);
    setError(null);
    try {
      const conversation = await createGroup(
        groupName.trim(),
        selected.map((u) => u.id),
      );
      onCreated(conversation.id);
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "Couldn't create the group.");
      setSubmitting(false);
    }
  }

  return (
    <Modal title={mode === "direct" ? "Start a chat" : "New group"} onClose={onClose}>
      <div className="flex gap-2 rounded-pill border border-border bg-navy/40 p-1">
        {(["direct", "group"] as const).map((m) => (
          <button
            key={m}
            type="button"
            onClick={() => {
              setMode(m);
              setError(null);
            }}
            className={`flex-1 cursor-pointer rounded-pill py-2 text-default font-medium transition-colors ${
              mode === m ? "bg-plum text-white" : "text-pale-blue hover:text-white"
            }`}
          >
            {m === "direct" ? "Direct message" : "Group"}
          </button>
        ))}
      </div>

      {mode === "group" && (
        <input
          value={groupName}
          onChange={(e) => setGroupName(e.target.value)}
          placeholder="Group name"
          className="w-full rounded-chip border border-border bg-navy/40 px-4 py-2.5 text-default text-white placeholder:text-sky/60 focus:border-plum focus:outline-none"
        />
      )}

      {mode === "group" && selected.length > 0 && (
        <ul className="flex flex-wrap gap-2">
          {selected.map((u) => (
            <li key={u.id}>
              <button
                type="button"
                onClick={() => toggleSelected(u)}
                className="flex cursor-pointer items-center gap-1.5 rounded-pill bg-navy/60 py-1 pl-1 pr-3 text-meta text-white"
              >
                <Avatar id={u.id} name={u.name} size="sm" className="h-5 w-5 text-[10px]" />
                {u.name}
                <span aria-hidden="true">×</span>
              </button>
            </li>
          ))}
        </ul>
      )}

      <input
        value={search.query}
        onChange={(e) => search.setQuery(e.target.value)}
        placeholder="Search by name or phone number"
        className="w-full rounded-chip border border-border bg-navy/40 px-4 py-2.5 text-default text-white placeholder:text-sky/60 focus:border-plum focus:outline-none"
        autoFocus
      />

      <div className="min-h-40 flex-1 overflow-y-auto">
        {search.query.trim().length < 2 && (
          <p className="px-1 py-3 text-meta text-sky/70">Type at least 2 characters to search.</p>
        )}
        {search.loading && <p className="px-1 py-3 text-meta text-sky/70">Searching…</p>}
        {search.error && <p className="px-1 py-3 text-meta text-pink">{search.error}</p>}
        {!search.loading && search.query.trim().length >= 2 && search.results.length === 0 && (
          <p className="px-1 py-3 text-meta text-sky/70">No one matches “{search.query}”.</p>
        )}
        <ul className="flex flex-col gap-1">
          {search.results.map((user) => (
            <li key={user.id}>
              <button
                type="button"
                disabled={submitting}
                onClick={() => (mode === "direct" ? handleStartDirect(user) : toggleSelected(user))}
                className="flex w-full cursor-pointer items-center gap-3 rounded-chip px-2 py-2 text-left transition-colors hover:bg-navy/50 disabled:cursor-not-allowed disabled:opacity-50"
              >
                <Avatar id={user.id} name={user.name} size="sm" />
                <span className="flex-1">
                  <span className="block text-default font-medium text-white">{user.name}</span>
                  <span className="block text-meta text-sky/70">{user.phone}</span>
                </span>
                {mode === "group" && (
                  <span
                    aria-hidden="true"
                    className={`flex h-5 w-5 items-center justify-center rounded-full border ${
                      selected.some((u) => u.id === user.id)
                        ? "border-plum bg-plum text-white"
                        : "border-border"
                    }`}
                  >
                    {selected.some((u) => u.id === user.id) && "✓"}
                  </span>
                )}
              </button>
            </li>
          ))}
        </ul>
      </div>

      {error && <p className="text-meta text-pink">{error}</p>}

      {mode === "group" && (
        <form onSubmit={handleCreateGroup} className="flex flex-col gap-2">
          <p className="text-meta text-sky/70">
            {selected.length < MIN_GROUP_PARTICIPANTS
              ? `Pick at least ${MIN_GROUP_PARTICIPANTS - selected.length} more ${
                  MIN_GROUP_PARTICIPANTS - selected.length === 1 ? "person" : "people"
                } — groups need ${MIN_GROUP_PARTICIPANTS}+ members.`
              : `${selected.length} people selected.`}
          </p>
          <Button
            type="submit"
            variant="solid"
            className="justify-center"
            arrow="none"
            disabled={submitting || !groupName.trim() || selected.length < MIN_GROUP_PARTICIPANTS}
          >
            {submitting ? "Creating…" : "Create group"}
          </Button>
        </form>
      )}
    </Modal>
  );
}
