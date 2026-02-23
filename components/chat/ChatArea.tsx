
"use client";

import { Id } from "@/convex/_generated/dataModel";
import { MessageSquare } from "lucide-react";
import MessageList from "./MessageList";
import MessageInput from "./MessageInput";
import { useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";

type ChatAreaProps = {
  // conversationId is null when no conversation is selected
  conversationId: Id<"conversations"> | null;
  otherUserId?: Id<"users"> | null;
};

export default function ChatArea({
  conversationId,
  otherUserId,
}: ChatAreaProps) {
  // Get other user's info to show in header
  const otherUser = useQuery(
    api.users.getUserById,
    otherUserId ? { userId: otherUserId } : "skip"
  );

  // No conversation selected yet
  if (!conversationId) {
    return (
      <div className="flex-1 h-full flex items-center justify-center bg-muted/10">
        <div className="text-center">
          <MessageSquare className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
          <h2 className="text-xl font-semibold mb-2">Your Messages</h2>
          <p className="text-muted-foreground text-sm">
            Select a conversation or start a new one
          </p>
        </div>
      </div>
    );
  }

  return (
    // Full height flex column layout
    <div className="flex-1 flex flex-col h-full">

      {/*  HEADER: Shows who you're chatting with  */}
      <div className="p-4 border-b flex items-center gap-3">
        <div>
          <p className="font-semibold">
            {otherUser?.name || "Loading..."}
          </p>
          <p className="text-xs text-muted-foreground">
            {otherUser?.email}
          </p>
        </div>
      </div>

      {/*  MESSAGES LIST  */}
      {/* flex-1 makes this take remaining space */}
      <div className="flex-1 overflow-hidden flex flex-col">
        <MessageList conversationId={conversationId} />
      </div>

      {/*  MESSAGE INPUT  */}
      <MessageInput conversationId={conversationId} />

    </div>
  );
}