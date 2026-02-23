
"use client";

import { Id } from "@/convex/_generated/dataModel";
import { MessageSquare, ArrowLeft } from "lucide-react";
import MessageList from "./MessageList";
import MessageInput from "./MessageInput";
import { useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import EmptyState from "@/components/ui/EmptyState";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

type ChatAreaProps = {
  conversationId: Id<"conversations"> | null;
  otherUserId?: Id<"users"> | null;
  // onBack is called when back button is clicked on mobile
  onBack: () => void;
};

export default function ChatArea({
  conversationId,
  otherUserId,
  onBack,
}: ChatAreaProps) {
  const otherUser = useQuery(
    api.users.getUserById,
    otherUserId ? { userId: otherUserId } : "skip"
  );

  // No conversation selected - only visible on desktop
  // because on mobile we show sidebar instead
  if (!conversationId) {
    return (
      <div className="flex-1 h-full items-center justify-center bg-muted/10 hidden md:flex">
        <EmptyState
          icon={MessageSquare}
          title="Your Messages"
          description="Select a user from the sidebar to start chatting"
        />
      </div>
    );
  }

  const fallback = otherUser?.name?.charAt(0).toUpperCase() || "U";

  return (
    <div className="flex-1 flex flex-col h-full">

      {/* HEADER */}
      <div className="p-3 border-b flex items-center gap-3">

        {/* Back button - only on mobile */}
        <button
          onClick={onBack}
          className="md:hidden text-muted-foreground hover:text-foreground transition-colors p-1"
        >
          <ArrowLeft className="h-5 w-5" />
        </button>

        {/* Other user's avatar */}
        <Avatar className="h-8 w-8">
          <AvatarImage
            src={otherUser?.imageUrl}
            alt={otherUser?.name || "User"}
          />
          <AvatarFallback className="text-xs">{fallback}</AvatarFallback>
        </Avatar>

        {/* Other user's name and email */}
        <div className="flex-1 min-w-0">
          <p className="font-semibold text-sm truncate">
            {otherUser?.name || "Loading..."}
          </p>
          <p className="text-xs text-muted-foreground truncate">
            {otherUser?.email}
          </p>
        </div>

      </div>

      {/* MESSAGES */}
      <div className="flex-1 overflow-hidden flex flex-col">
        <MessageList conversationId={conversationId} />
      </div>

      {/* INPUT */}
      <MessageInput conversationId={conversationId} />

    </div>
  );
}
