"use client";

import { useChat } from "@/contexts/ChatContext";
import SidebarHeader from "./Sidebar/SidebarHeader";
import ConversationList from "./Sidebar/ConversationList";
import ThreadPanel from "./Thread/ThreadPanel";
import EmptyState from "@/components/shared/EmptyState";
import { cn } from "@/lib/cn";

/**
 * Two-pane chat layout. The selected conversation lives in ChatContext
 * (component state, not the URL) — kept simple on purpose: a screen this
 * contained doesn't need `useSearchParams`'s Suspense-boundary ceremony
 * for a deep-linkable id that nothing outside this screen consumes.
 */
export default function ChatShell() {
  const { activeConversationId, selectConversation } = useChat();

  return (
    <div className="mx-auto flex h-[calc(100dvh-0px)] max-w-[1440px] overflow-hidden">
      <aside
        className={cn(
          "flex w-full shrink-0 flex-col border-r border-border/60 lg:w-96",
          activeConversationId ? "hidden lg:flex" : "flex",
        )}
      >
        <SidebarHeader />
        <ConversationList onSelect={selectConversation} />
      </aside>

      <section className={cn("flex-1 flex-col", activeConversationId ? "flex" : "hidden lg:flex")}>
        {activeConversationId ? (
          <ThreadPanel conversationId={activeConversationId} onBack={() => selectConversation(null)} />
        ) : (
          <EmptyState
            title="Pick a conversation"
            description="Choose a chat from the list, or start a new one."
          />
        )}
      </section>
    </div>
  );
}
