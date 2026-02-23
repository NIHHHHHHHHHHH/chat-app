
"use client";

import { useQuery } from "convex/react";
import { useUser } from "@clerk/nextjs";
import { api } from "@/convex/_generated/api";
import { Id } from "@/convex/_generated/dataModel";
import MessageBubble from "./MessageBubble";
import { MessageSquare } from "lucide-react";

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

  if (messages === undefined) {
    return (
      <div className="flex items-center justify-center h-full">
        <p className="text-sm text-muted-foreground">Loading messages...</p>
      </div>
    );
  }

  // Empty state - no messages yet
  if (messages.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center h-full">
        <MessageSquare className="h-8 w-8 text-muted-foreground mb-2" />
        <p className="text-sm text-muted-foreground">
          No messages yet. Say hello! 👋
        </p>
      </div>
    );
  }

  return (
    // overflow-y-auto for scrolling
    <div className="flex-1 overflow-y-auto p-4">
      {messages.map((message) => {
        // Check if this message was sent by current user
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
  );
}