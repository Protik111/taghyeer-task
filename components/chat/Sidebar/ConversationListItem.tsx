import Avatar from "@/components/shared/Avatar";
import { cn } from "@/lib/cn";
import { formatConversationTimestamp } from "@/lib/format";
import type { Conversation } from "@/lib/api/types";

interface ConversationListItemProps {
  conversation: Conversation;
  currentUserId: string;
  active: boolean;
  onSelect: () => void;
}

export default function ConversationListItem({
  conversation,
  currentUserId,
  active,
  onSelect,
}: ConversationListItemProps) {
  const name = conversation.type === "group" ? conversation.name : conversation.participant.name;
  const avatarId = conversation.type === "group" ? conversation.id : conversation.participant.id;

  const preview = conversation.lastMessage
    ? `${conversation.lastMessage.senderId === currentUserId ? "You: " : ""}${
        conversation.lastMessage.text || "(no message text)"
      }`
    : conversation.type === "group"
      ? `${conversation.participants.length} members`
      : "Say hi 👋";

  return (
    <li>
      <button
        type="button"
        onClick={onSelect}
        aria-current={active ? "true" : undefined}
        className={cn(
          "flex w-full cursor-pointer items-center gap-3 rounded-chip px-3 py-3 text-left transition-colors",
          active ? "bg-navy/70" : "hover:bg-navy/40",
        )}
      >
        <Avatar id={avatarId} name={name} />
        <span className="min-w-0 flex-1">
          <span className="flex items-center justify-between gap-2">
            <span className="truncate text-default font-semibold text-white">{name}</span>
            <span className="shrink-0 text-meta text-sky/70">
              {formatConversationTimestamp(conversation.updatedAt)}
            </span>
          </span>
          <span className="block truncate text-meta text-sky/70">{preview}</span>
        </span>
      </button>
    </li>
  );
}
