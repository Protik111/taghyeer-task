"use client";

import { useState } from "react";
import { useChat } from "@/contexts/ChatContext";
import { useAuth } from "@/contexts/AuthContext";
import ConversationListItem from "./ConversationListItem";
import NewChatModal from "./NewChatModal";
import EmptyState from "@/components/shared/EmptyState";
import ErrorState from "@/components/shared/ErrorState";
import { ConversationListSkeleton } from "@/components/shared/Skeletons";
import Button from "@/components/ui/Button";

interface ConversationListProps {
  onSelect: (id: string) => void;
}

export default function ConversationList({ onSelect }: ConversationListProps) {
  const { conversations, conversationsLoading, conversationsError, refreshConversations, activeConversationId } =
    useChat();
  const { user } = useAuth();
  const [modalOpen, setModalOpen] = useState(false);

  if (!user) return null;

  return (
    <div className="flex h-full flex-col">
      <div className="flex items-center justify-between gap-3 px-4 pb-2 pt-4">
        <h2 className="text-card-title font-semibold text-white">Chats</h2>
        <Button variant="solid" arrow="none" className="px-4 py-2 text-meta" onClick={() => setModalOpen(true)}>
          New chat
        </Button>
      </div>

      <div className="flex-1 overflow-y-auto">
        {conversationsLoading && conversations.length === 0 && <ConversationListSkeleton />}

        {conversationsError && conversations.length === 0 && (
          <ErrorState message={conversationsError} onRetry={refreshConversations} />
        )}

        {!conversationsLoading && !conversationsError && conversations.length === 0 && (
          <EmptyState
            title="No conversations yet"
            description="Search for someone by name or phone number to start chatting."
            action={
              <Button variant="outline" onClick={() => setModalOpen(true)}>
                Start a chat
              </Button>
            }
          />
        )}

        {conversations.length > 0 && (
          <ul className="flex flex-col gap-0.5 px-2 pb-4">
            {conversations.map((conversation) => (
              <ConversationListItem
                key={conversation.id}
                conversation={conversation}
                currentUserId={user.id}
                active={conversation.id === activeConversationId}
                onSelect={() => onSelect(conversation.id)}
              />
            ))}
          </ul>
        )}
      </div>

      {modalOpen && (
        <NewChatModal
          onClose={() => setModalOpen(false)}
          onCreated={(id) => {
            setModalOpen(false);
            onSelect(id);
          }}
        />
      )}
    </div>
  );
}
