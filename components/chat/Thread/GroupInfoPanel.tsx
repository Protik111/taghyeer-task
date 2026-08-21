"use client";

import { useState } from "react";
import Modal from "@/components/shared/Modal";
import Avatar from "@/components/shared/Avatar";
import { useChat } from "@/contexts/ChatContext";
import { useUserSearch } from "@/hooks/useUserSearch";
import type { GroupConversation } from "@/lib/api/types";
import { ApiError } from "@/lib/api/types";

interface GroupInfoPanelProps {
  conversation: GroupConversation;
  currentUserId: string;
  onClose: () => void;
  onLeft: () => void;
}

export default function GroupInfoPanel({
  conversation,
  currentUserId,
  onClose,
  onLeft,
}: GroupInfoPanelProps) {
  const { renameGroup, addParticipants, removeParticipant, promoteAdmin } = useChat();
  const isAdmin = conversation.admins.includes(currentUserId);

  const [name, setName] = useState(conversation.name);
  const [editingName, setEditingName] = useState(false);
  const [addingPeople, setAddingPeople] = useState(false);
  const [busyId, setBusyId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const search = useUserSearch(conversation.participants.map((p) => p.id));

  async function handleRename() {
    const trimmed = name.trim();
    if (!trimmed || trimmed === conversation.name) {
      setEditingName(false);
      return;
    }
    try {
      await renameGroup(conversation.id, trimmed);
      setEditingName(false);
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "Couldn't rename the group.");
    }
  }

  async function handleRemove(userId: string) {
    setBusyId(userId);
    setError(null);
    try {
      await removeParticipant(conversation.id, userId);
      if (userId === currentUserId) onLeft();
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "That didn't work.");
    } finally {
      setBusyId(null);
    }
  }

  async function handlePromote(userId: string) {
    setBusyId(userId);
    setError(null);
    try {
      await promoteAdmin(conversation.id, userId);
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "Couldn't promote them.");
    } finally {
      setBusyId(null);
    }
  }

  async function handleAdd(userId: string) {
    setBusyId(userId);
    setError(null);
    try {
      await addParticipants(conversation.id, [userId]);
      search.setQuery("");
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "Couldn't add them.");
    } finally {
      setBusyId(null);
    }
  }

  return (
    <Modal title="Group info" onClose={onClose} className="max-w-sm">
      <div className="flex items-center gap-3">
        <Avatar id={conversation.id} name={conversation.name} size="lg" />
        {editingName ? (
          <div className="flex flex-1 items-center gap-2">
            <input
              value={name}
              onChange={(e) => setName(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && handleRename()}
              autoFocus
              className="flex-1 rounded-chip border border-border bg-navy/40 px-3 py-2 text-default text-white focus:border-plum focus:outline-none"
            />
            <button
              type="button"
              onClick={handleRename}
              className="cursor-pointer text-meta font-semibold text-plum"
            >
              Save
            </button>
          </div>
        ) : (
          <div className="flex flex-1 items-center justify-between gap-2">
            <span className="text-card-title font-semibold text-white">{conversation.name}</span>
            {isAdmin && (
              <button
                type="button"
                onClick={() => setEditingName(true)}
                className="cursor-pointer text-meta font-semibold text-sky/80 hover:text-white"
              >
                Rename
              </button>
            )}
          </div>
        )}
      </div>

      {error && <p className="text-meta text-pink">{error}</p>}

      <div>
        <div className="mb-2 flex items-center justify-between">
          <p className="text-meta font-semibold uppercase tracking-[0.08em] text-sky/70">
            {conversation.participants.length} members
          </p>
          {isAdmin && (
            <button
              type="button"
              onClick={() => setAddingPeople((v) => !v)}
              className="cursor-pointer text-meta font-semibold text-plum"
            >
              {addingPeople ? "Done" : "Add people"}
            </button>
          )}
        </div>

        {addingPeople && (
          <div className="mb-3 flex flex-col gap-2">
            <input
              value={search.query}
              onChange={(e) => search.setQuery(e.target.value)}
              placeholder="Search by name or phone number"
              className="w-full rounded-chip border border-border bg-navy/40 px-3 py-2 text-default text-white placeholder:text-sky/60 focus:border-plum focus:outline-none"
            />
            <ul className="max-h-40 overflow-y-auto">
              {search.results.map((u) => (
                <li key={u.id}>
                  <button
                    type="button"
                    disabled={busyId === u.id}
                    onClick={() => handleAdd(u.id)}
                    className="flex w-full cursor-pointer items-center gap-2 rounded-chip px-2 py-1.5 text-left hover:bg-navy/50 disabled:opacity-50"
                  >
                    <Avatar id={u.id} name={u.name} size="sm" />
                    <span className="text-default text-white">{u.name}</span>
                  </button>
                </li>
              ))}
            </ul>
          </div>
        )}

        <ul className="flex max-h-64 flex-col gap-1 overflow-y-auto">
          {conversation.participants.map((p) => {
            const isSelf = p.id === currentUserId;
            const isParticipantAdmin = conversation.admins.includes(p.id);
            return (
              <li key={p.id} className="flex items-center gap-3 rounded-chip px-2 py-2">
                <Avatar id={p.id} name={p.name} size="sm" />
                <span className="flex-1 text-default text-white">
                  {p.name} {isSelf && <span className="text-sky/60">(you)</span>}
                </span>
                {isParticipantAdmin && (
                  <span className="rounded-badge bg-navy/60 px-2 py-0.5 text-meta text-pale-blue">Admin</span>
                )}
                {isAdmin && !isParticipantAdmin && !isSelf && (
                  <button
                    type="button"
                    disabled={busyId === p.id}
                    onClick={() => handlePromote(p.id)}
                    className="cursor-pointer text-meta text-sky/80 hover:text-white disabled:opacity-50"
                  >
                    Make admin
                  </button>
                )}
                {(isAdmin || isSelf) && (
                  <button
                    type="button"
                    disabled={busyId === p.id}
                    onClick={() => handleRemove(p.id)}
                    className="cursor-pointer text-meta text-pink hover:underline disabled:opacity-50"
                  >
                    {isSelf ? "Leave" : "Remove"}
                  </button>
                )}
              </li>
            );
          })}
        </ul>
      </div>
    </Modal>
  );
}
