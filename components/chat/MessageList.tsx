
"use client";

import { useQuery } from "convex/react";
import { useUser } from "@clerk/nextjs";
import { api } from "@/convex/_generated/api";
import { Id } from "@/convex/_generated/dataModel";
import MessageBubble from "./MessageBubble";
import TypingIndicator from "./TypingIndicator";
import { MessageSquare, Loader2 } from "lucide-react";
import EmptyState from "@/components/ui/EmptyState";

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
    <div className="flex flex-col h-full overflow-hidden">

      {/* Messages - scrollable */}
      <div className="flex-1 overflow-y-auto p-4">
        {messages.map((message) => {
          const isCurrentUser =
            message.sender?.clerkId === user?.id;
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
      </div>

      {/* Typing indicator - always at bottom */}
      <TypingIndicator conversationId={conversationId} />

    </div>
  );
}