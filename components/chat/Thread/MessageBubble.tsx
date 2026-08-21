import { cn } from "@/lib/cn";
import { formatMessageTime } from "@/lib/format";
import type { Message } from "@/lib/api/types";

interface MessageBubbleProps {
  message: Message;
  isOwn: boolean;
  senderName?: string;
  onRetry?: () => void;
}

export default function MessageBubble({ message, isOwn, senderName, onRetry }: MessageBubbleProps) {
  return (
    <div className={cn("flex flex-col", isOwn ? "items-end" : "items-start")}>
      {senderName && !isOwn && (
        <span className="mb-1 px-1 text-meta font-semibold text-sky/80">{senderName}</span>
      )}
      <div
        className={cn(
          "max-w-[75%] rounded-2xl px-4 py-2.5 text-default sm:max-w-[60%]",
          isOwn
            ? "rounded-br-sm bg-plum text-white"
            : "rounded-bl-sm border border-border bg-card-alt text-text",
          message.status === "failed" && "border border-pink/60",
        )}
      >
        <p className="whitespace-pre-wrap break-words">{message.text}</p>
      </div>
      <span className="mt-1 flex items-center gap-1.5 px-1 text-meta text-sky/60">
        {message.status === "sending" && "Sending…"}
        {message.status === "failed" && (
          <>
            <span className="text-pink">Failed to send</span>
            {onRetry && (
              <button
                type="button"
                onClick={onRetry}
                className="cursor-pointer font-semibold text-pink underline underline-offset-2"
              >
                Retry
              </button>
            )}
          </>
        )}
        {(!message.status || message.status === "sent") && formatMessageTime(message.createdAt)}
      </span>
    </div>
  );
}
