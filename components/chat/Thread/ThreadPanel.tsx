"use client";

import { useState } from "react";
import Avatar from "@/components/shared/Avatar";
import { useAuth } from "@/contexts/AuthContext";
import { useChat } from "@/contexts/ChatContext";
import MessageList from "./MessageList";
import Composer from "./Composer";
import GroupInfoPanel from "./GroupInfoPanel";

interface ThreadPanelProps {
  conversationId: string;
  onBack?: () => void;
}

export default function ThreadPanel({
  conversationId,
  onBack,
}: ThreadPanelProps) {
  const { user } = useAuth();
  const { conversations, selectConversation } = useChat();
  const [infoOpen, setInfoOpen] = useState(false);

  const conversation = conversations.find((c) => c.id === conversationId);
  if (!user || !conversation) return null;

  const name =
    conversation.type === "group"
      ? conversation.name
      : conversation.participant.name;
  const avatarId =
    conversation.type === "group"
      ? conversation.id
      : conversation.participant.id;
  const subtitle =
    conversation.type === "group"
      ? `${conversation.participants.length} members`
      : conversation.participant.phone;

  return (
    <div className="flex h-full flex-col">
      <div className="flex items-center gap-3 border-b border-border/60 px-4 py-3">
        {onBack && (
          <button
            type="button"
            onClick={onBack}
            aria-label="Back to conversations"
            className="flex h-9 w-9 shrink-0 cursor-pointer items-center justify-center rounded-full text-white lg:hidden"
          >
            <svg
              width="18"
              height="18"
              viewBox="0 0 20 20"
              fill="none"
              aria-hidden="true"
            >
              <path
                d="M12.5 15 7.5 10l5-5"
                stroke="currentColor"
                strokeWidth="1.6"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          </button>
        )}
        <button
          type="button"
          onClick={() => conversation.type === "group" && setInfoOpen(true)}
          disabled={conversation.type !== "group"}
          className="flex cursor-pointer flex-1 items-center gap-3 text-left disabled:cursor-default"
        >
          <Avatar id={avatarId} name={name} />
          <span>
            <span className="cursor-pointer block text-default font-semibold text-white">
              {name}
            </span>
            <span className="block text-meta text-sky/70">{subtitle}</span>
          </span>
        </button>
      </div>

      <MessageList
        key={conversationId}
        conversationId={conversationId}
        conversation={conversation}
        currentUserId={user.id}
      />
      <Composer conversationId={conversationId} />

      {infoOpen && conversation.type === "group" && (
        <GroupInfoPanel
          conversation={conversation}
          currentUserId={user.id}
          onClose={() => setInfoOpen(false)}
          onLeft={() => {
            setInfoOpen(false);
            selectConversation(null);
          }}
        />
      )}
    </div>
  );
}
