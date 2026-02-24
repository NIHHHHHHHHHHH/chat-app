
"use client";

import { useQuery } from "convex/react";
import { useUser } from "@clerk/nextjs";
import { api } from "@/convex/_generated/api";
import { Id } from "@/convex/_generated/dataModel";
import MessageBubble from "./MessageBubble";
import TypingIndicator from "./TypingIndicator";
import { MessageSquare, Loader2, ArrowDown } from "lucide-react";
import EmptyState from "@/components/ui/EmptyState";
import { useAutoScroll } from "@/hooks/useAutoScroll";

type MessageListProps = {
  conversationId: Id<"conversations">;
};

export default function MessageList({ conversationId }: MessageListProps) {
  const { user } = useUser();

  // useQuery subscribes to messages in real time
  // When new message arrives, this automatically updates!
  const messages = useQuery(api.messages.getMessages, {
    conversationId,
  });

   // Pass messages.length as dependency
  // So scroll logic runs when new message arrives
  const {
    bottomRef,
    scrollRef,
    showScrollButton,
    handleScroll,
    scrollToBottom,
  } = useAutoScroll(messages?.length);

    // Loading state - spinner instead of blank
  if (messages === undefined) {
    return (
      <div className="flex items-center justify-center h-full">
        <Loader2 className="h-5 w-5 animate-spin text-muted-foreground" />
      </div>
    );
  }

  // Empty state - no messages yet
    if (messages.length === 0) {
    return (
      <div className="flex flex-col h-full">
        <div className="flex-1 flex items-center justify-center">
          <EmptyState
            icon={MessageSquare}
            title="No messages yet"
            description="Say hello and start the conversation! 👋"
          />
        </div>
        {/* Show typing indicator even when no messages */}
        <TypingIndicator conversationId={conversationId} />
      </div>
    );
  }

     return (
    // relative needed for absolute positioning of scroll button
    <div className="flex flex-col h-full overflow-hidden relative">

      {/* Scrollable messages container */}
      <div
        ref={scrollRef}
        onScroll={handleScroll}
        className="flex-1 overflow-y-auto p-4"
      >
        {messages.map((message) => {
          const isCurrentUser = message.sender?.clerkId === user?.id;
          return (
            <MessageBubble
              key={message._id}
              content={message.content}
              senderName={message.sender?.name || "Unknown"}
              senderImage={message.sender?.imageUrl}
              isCurrentUser={isCurrentUser}
              createdAt={message._creationTime}
            />
          );
        })}

        {/* Invisible div at bottom for scrolling to */}
        <div ref={bottomRef} />
      </div>

      {/* Typing indicator */}
      <TypingIndicator conversationId={conversationId} />

      {/* ↓ New messages button */}
      {/* Only shows when user has scrolled up */}
      {showScrollButton && (
        <button
          onClick={scrollToBottom}
          className="
            absolute bottom-14 left-1/2 -translate-x-1/2
            flex items-center gap-2
            bg-primary text-primary-foreground
            px-4 py-2 rounded-full text-sm
            shadow-lg hover:opacity-90
            transition-opacity
          "
        >
          <ArrowDown className="h-4 w-4" />
          New messages
        </button>
      )}

    </div>
  );
}